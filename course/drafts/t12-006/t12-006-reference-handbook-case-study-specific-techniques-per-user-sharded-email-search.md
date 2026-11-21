# end-to-end system design case studies — Reference: Per-user sharded email search

Sources: [HLD Handbook](https://hld.handbook.academy/), [Elasticsearch shard routing](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/search-shard-routing), [Elasticsearch routing field](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-routing-field), [Elasticsearch search API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-search), [RFC 5322: Internet Message Format](https://www.rfc-editor.org/rfc/rfc5322.html), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

This case study designs search over a user's own mailbox while isolating mailbox data and limiting query fan-out. Elasticsearch is used to illustrate custom shard routing; its routing API and hash behavior are implementation-specific and current docs were checked on 2026-11-21. The same design questions apply to OpenSearch or a custom inverted index, but do not assume identical routing rules. This lesson treats indexed search as a derived view of authoritative mail and metadata.

## How this group fits the mental model

An email search system ingests messages, extracts searchable fields, builds an inverted index, and answers mailbox-scoped queries. A query for one account should avoid scanning unrelated users, enforce mailbox permissions before returning results, rank relevant matches, and handle freshness as new mail arrives or old mail is deleted.

Sharding by user can route a user's documents to a known shard, allowing searches to target only that shard instead of fanning out across every shard. That improves tenant-local query efficiency, but it creates uneven shards when user mailbox sizes vary. A single very large account can become a hot shard. A hybrid design may route ordinary users by user ID and split oversized accounts into multiple buckets or partitions, then merge their results.

## Supplied names explained

- **Mailbox source of truth:** durable message store and mailbox metadata that determine whether a message exists and who can access it. Search index is derived and may lag.
- **Inverted index:** term-to-document postings with positions/fields used for text search. Analyzers tokenize and normalize text; query behavior depends on field mappings and analyzer version.
- **Tenant/user routing key:** stable opaque account or mailbox identifier used to route indexing and search requests to the same shard. Derive it server-side from authenticated identity; never trust a query parameter as authorization.
- **Custom shard routing:** in Elasticsearch, an optional routing value maps a document to a shard; searches can pass the same routing value to target that shard. Routing must be consistent for writes, updates, deletes, and searches.
- **Hot tenant / skew:** one user with far more messages or query traffic than peers can dominate one shard's storage, CPU, and cache.
- **Search fan-out:** one request sent to many shards. It increases coordination, CPU/memory use, tail latency, and merge work; limiting fan-out can reduce overload but must not omit the target user's documents.
- **Per-user index versus shared routed index:** separate indices offer stronger operational isolation but create index/metadata overhead; one shared index with routing is more efficient for many users but requires disciplined isolation, reindexing, and hot-user strategy.
- **Refresh/freshness:** when indexed documents become searchable. A message may be durably stored before its search document is visible; state and UX should expose or tolerate this delay.
- **Cursor/pagination:** stable continuation for result pages. Deep offset pagination can be expensive and concurrent index changes can reorder results; use an appropriate point-in-time/search-after design where supported, bound page sizes, and expire cursors.
- **Deletion/tombstone:** source deletion or permission revocation must propagate to every index, cache, replica, and backup path subject to policy. A stale search hit must not reveal deleted or newly unauthorized content.

## Architecture and query flow

1. **Authenticate and scope.** Resolve the caller's mailbox from a trusted session/token, check mailbox/delegation permissions, and derive a routing key. Do not allow clients to search another user's route by submitting an arbitrary ID.
2. **Accept and persist mail.** Store the message and mailbox membership durably first. Assign stable message and account IDs, preserve received/sent timestamps with timezone semantics, and emit an indexing event through an outbox or durable change stream.
3. **Build the search document.** Parse headers and MIME safely; index chosen fields such as sender, recipients, subject, body text, labels, timestamp, thread ID, and attachment metadata. Apply field-level mapping/analyzer choices and version the extraction pipeline. Avoid indexing secrets or unsupported content types by accident.
4. **Route the index write.** Use a consistent opaque routing value for every document belonging to the user, including later updates and deletes. Maintain mapping and shard-count choices; changing routing or primary shard configuration may require reindexing rather than a simple setting flip.
5. **Execute mailbox search.** Validate and bound query syntax, apply mandatory mailbox/label/time filters, send the user's routing value to constrain shard selection, and request only fields needed for ranking/snippets. Authorization remains enforced independently of routing.
6. **Rank and paginate.** Combine lexical relevance with product signals such as recency or importance only under a documented ranking policy. Use a deterministic tie-breaker and stable pagination approach; limit query complexity, result size, and expensive wildcard/regex operators.
7. **Hydrate and re-check.** Fetch authoritative message metadata/body only for authorized hits. If the index is stale or permission changed, suppress the result and schedule repair; never treat a search hit as permission proof.
8. **Maintain the index.** Handle retries idempotently, update labels/threading, remove deleted messages, reconcile index counts/checksums, and rebuild from source when mappings or parsers change. Monitor indexing lag, shard skew, search fan-out, hot users, query latency, and stale-result suppression.

## Cross-item comparison

| Layout | Advantages | Trade-offs |
| --- | --- | --- |
| One shared index, no custom routing | Simple document distribution and balanced shards | A mailbox query may fan out across many shards |
| Shared index routed by user | Targeted shard search, low metadata overhead for many accounts | User-size skew, hot mailbox concentration, and strict routing consistency requirements |
| Index per user | Stronger lifecycle and operational isolation; easy tenant-local targeting | Large index/shard count overhead, cluster-state pressure, migrations and management complexity |
| Hybrid shared + oversized-user buckets | Balances common accounts and large mailboxes | Requires bucket routing and merging results from several shards for large users |
| Search index as primary store | Fewer systems and some immediate search consistency | Search engine semantics may complicate transactional mailbox updates, authorization, backup, and long-term source-of-truth guarantees |

## Examples

### Ordinary mailbox

User `U` has 40,000 messages. Index each document with server-derived routing key `U`; search with the same route plus a mandatory `mailbox_id=U` filter. The routing reduces shard fan-out, while the filter and backend authorization provide separate data isolation. If an update is accidentally indexed without the same route, it may land on another shard and be missed by routed search; enforce routing in one indexing library and audit for mismatches.

### Very large mailbox

An enterprise archive has tens of millions of documents and dominates its assigned shard. Use a deterministic sub-bucket such as hash(message ID) modulo `B` for that mailbox, index/query all of its buckets, and merge top results by the same global sort. This improves write distribution but changes the query to `B` shards and complicates pagination. Choose thresholds based on measurements, and preserve a route-version mapping during migration.

### Search index lags deletion

A user deletes a message and the source store commits the deletion, but an indexing event is delayed. The search result may still contain a stale ID. Before returning sensitive content, verify current mailbox membership or use a permission/deletion version check; suppress stale hits and repair the index. Define how long the system may expose stale snippets and ensure cache invalidation follows deletion policy.

## Common mistakes

- Using routing as the only authorization check.
- Accepting tenant/user routing keys from the client without deriving them from trusted identity.
- Forgetting to use the exact same route for index, update, delete, and search operations.
- Assuming custom routing always balances load; all documents for a route land on one shard unless the route is subdivided.
- Creating one index per mailbox without accounting for shard and cluster metadata overhead.
- Changing shard counts or routing functions without planning reindexing and dual-read/write migration.
- Returning snippets from stale index records after deletion, block, or permission revocation.
- Allowing unbounded query operators or deep offset pagination to exhaust search resources.
- Treating indexing as transactional with mailbox storage when it is asynchronous; define refresh expectations and repair.
- Failing to monitor top-tenant skew, shard-level latency, fan-out, and queue saturation.

## Knowledge checks with answers

1. **What does a routing key accomplish?** It directs related documents and searches to a shard, reducing fan-out; it does not authorize access.
2. **Why can routing by user become a hot-spot?** One user's documents and traffic are concentrated on the shard selected by that key.
3. **Why should message storage remain authoritative?** The search index can lag or be rebuilt; mail existence, permissions, and deletion must have a durable owner.
4. **How can an oversized mailbox be sharded?** Deterministically split that mailbox into buckets and merge across its bucket shards, accepting extra query and pagination complexity.
5. **How should a stale hit be handled after deletion?** Re-check authorization/source state before exposing data, suppress the result, and repair the derived index.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder material with a per-user email-search design. Elasticsearch documentation confirms that a shared routing value can target the shard used for indexing and that queries hitting many shards increase resource usage; RFC 5322 bounds message-format context. The lesson separates routing from authorization and covers hot tenants, indexing lag, pagination, reindexing, deletion, and hybrid sharding. No material omissions remain in the supplied topic scope.
