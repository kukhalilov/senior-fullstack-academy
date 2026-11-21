# system design technology landscape and selection — Reference: Search engines

Sources: [HLD Handbook technology overview](https://hld.handbook.academy/technologies/), [Elasticsearch index fundamentals](https://www.elastic.co/docs/manage-data/data-store/index-basics), [Elasticsearch near-real-time search](https://www.elastic.co/docs/manage-data/data-store/near-real-time-search), [Elasticsearch refresh API and behavior](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-indices-refresh), [Elasticsearch release notes](https://www.elastic.co/docs/release-notes/elasticsearch), [OpenSearch index maintenance](https://docs.opensearch.org/latest/im-plugin/index-maintenance/), [OpenSearch version history](https://docs.opensearch.org/latest/version-history/), [OpenSearch FAQ and lineage](https://opensearch.org/faq/), [OpenSearch client compatibility](https://docs.opensearch.org/latest/clients/).

## Scope and version

This is a system-design selection lesson for the two supplied search products. Version facts were checked on 2026-11-21: Elasticsearch 9.5.6 was the newest release listed in Elastic’s release notes, and OpenSearch 3.10.0 was the newest entry in its version history. Both projects continue to release independently; check the selected deployment’s release, support, license, and managed-service terms before choosing. This lesson teaches architecture rather than a full query-language or cluster-operations reference.

## How this group fits the mental model

A search engine is usually a derived, query-optimized view of application data. The source of truth remains in the system that owns the records; an ingestion path copies creates, updates, and deletes into search documents. That path can use an outbox and event stream, CDC, or a scheduled rebuild. It must handle retries, duplicate events, ordering/version conflicts, deletes, backfills, and poison records. Search results can therefore lag the authoritative write. State the freshness objective and what the user sees while indexing catches up.

The index pipeline transforms a record into searchable fields. Mapping/schema controls types and whether values are searchable, sortable, aggregatable, or stored. Text analyzers normalize text and split it into terms. A typical inverted index maps a term to documents and positions, enabling candidate retrieval and phrase/proximity behavior. Ranking combines textual relevance (often BM25-family scoring), field boosts, filters, business rules, freshness, or learned ranking. Relevance must be evaluated with representative queries and judged results; adding more signals does not automatically improve ranking.

An index is divided into shards so work and data can be distributed. Replicas can add read capacity and provide recovery copies, subject to cluster configuration and failure domains. More shards create more per-shard overhead and scatter/gather work; too few can limit parallelism or make a shard too large to operate. Plan routing, shard sizing, replica placement, snapshots, retention, and restore tests against projected data and query load. A replica is not a backup.

Search is near-real-time rather than necessarily visible immediately after a successful write. Both products publish indexed changes through refresh operations that open new searchable segments. Elasticsearch documents a one-second default refresh interval for active indices in Elastic Stack, with idle-shard behavior; Elastic Cloud Serverless defaults to five seconds. OpenSearch documents a one-second default. A refresh is different from a durable commit/flush. For write-then-search workflows, prefer the documented wait-for-refresh option where appropriate; forcing a refresh after every write increases resource pressure and harms throughput.

Lucene-based systems accumulate immutable segments and merge them in the background. Indexing, refresh frequency, deletes, segment merges, query fan-out, cache pressure, and disk usage compete for CPU, memory, and I/O. Bulk-load or rebuild paths often benefit from controlled refresh and replica settings followed by restoring steady-state settings, but only when recovery and visibility requirements allow it. Monitor indexing lag, refresh/merge pressure, rejected work, query latency percentiles, shard health, disk watermarks, and relevance quality.

Do not use a search cluster as the only durable business record store by default. Search mappings and analyzers can change; a safe migration commonly creates a versioned index, backfills or replays data, validates counts and relevance, then atomically moves an alias or routing pointer and retains a rollback path. Reindexing is a data migration with capacity, consistency, and rollback concerns.

## Supplied names explained

- **Elasticsearch:** distributed search and analytics engine built on Lucene. It supports full-text, structured, vector, and analytical workloads, with exact features depending on version and deployment. On the check date, 9.5.6 was the latest release listed by Elastic. Elastic’s documented refresh defaults differ between Elastic Stack and Serverless, so do not repeat “one second” as a universal guarantee.
- **OpenSearch:** open search and analytics suite with OpenSearch Dashboards and optional plugins. Its project FAQ identifies Elasticsearch 7.10.2 as the fork point; it is now developed independently. On the check date, the version history listed 3.10.0 as current. API, client, plugin, and index compatibility must be checked against the specific OpenSearch version; Elasticsearch compatibility is not a blanket guarantee. Use the OpenSearch client for OpenSearch deployments unless a tested compatibility matrix says otherwise.
- **Inverted index:** term-to-document postings structure used for efficient text retrieval; analyzers determine which terms and positions are indexed.
- **Analyzer:** ordered character filters, tokenizer, and token filters that transform text at index/search time. Query-time and index-time analysis must be compatible or results can be surprising.
- **Refresh / segment / merge:** refresh makes recent indexed operations searchable by opening new segments; background merges combine segments to control overhead. Refresh is not the same as a durable flush or backup.
- **Shard / replica:** a shard is a partition of an index; replicas are additional shard copies used for availability and/or read scaling. Replication does not replace an independent snapshot and restore process.
- **Alias and reindex:** an alias can provide a stable application-facing name while a new index is built and checked. A cutover still needs a write-consistency plan so writes during backfill are not lost.

## Cross-item comparison

| Decision | Elasticsearch | OpenSearch |
| --- | --- | --- |
| Project path | Elastic-developed product with Elastic’s current releases and deployment options | Independently developed open project forked from Elasticsearch 7.10.2 |
| Compatibility | Use Elastic’s supported client/server and migration matrix for the selected release | Shared history does not make modern clients, plugins, APIs, or index formats interchangeable; use OpenSearch compatibility guidance |
| Search model | Distributed Lucene-backed indexing and near-real-time search | Distributed Lucene-based search with its own release, plugin, and operational roadmap |
| Selection test | Confirm the exact feature, license, hosting, support, security, and cost model needed | Confirm plugin maturity, client compatibility, upgrade path, hosting, support, and operational ownership |

Neither product is automatically the right choice because a team already uses its API syntax. Compare actual query semantics, aggregations, vector needs, security controls, retention, upgrade policy, support, and total operating cost. For modest relational full-text needs, a database-native search feature may be simpler; for broad relevance search, large-scale aggregations, or independent search scaling, a dedicated engine may fit better.

## Examples

For a marketplace, PostgreSQL owns listings and orders. A transactional outbox emits listing changes; a consumer transforms them into search documents keyed by listing ID. The index contains searchable title/description fields, exact keyword fields for category and seller, and numeric/date fields for filters and sorting. The API applies authorization and availability filters, requests ranked candidates, then displays an “updated moments ago” state if the indexing-lag SLO is exceeded. A periodic reconciliation compares source IDs and versions with the index and repairs missed events.

To change an analyzer, create a new index with the new mapping, backfill from the source or a replayable event log, dual-write or capture changes during the backfill, run query-quality and completeness checks, then switch the alias. Keep the prior index until rollback is no longer needed. A single forced refresh after a controlled test may be acceptable; refreshing on every production write is a costly substitute for understanding normal visibility behavior.

## Common mistakes

- Treating the search index as the authoritative transactional store and assuming writes are immediately searchable.
- Promising a fixed freshness bound without accounting for refresh behavior, indexing queues, backpressure, and failures.
- Using `refresh=true` on every write or issuing explicit cluster-wide refreshes as normal application flow.
- Assuming a successful index response means the document is already visible to search.
- Mapping every field as analyzed text; choose text, keyword, numeric, date, vector, and disabled fields based on queries and storage needs.
- Changing analyzers or mappings in place when the field requires a new index and controlled reindex.
- Adding shards or replicas without capacity testing; shard count affects memory, coordination, recovery time, and query fan-out.
- Treating replicas as backups, or keeping no tested snapshot/restore path.
- Updating the source of truth but failing to propagate deletes, order updates, or retry-safe versions to the index.
- Assuming Elasticsearch and OpenSearch remain fully client/API/index compatible because OpenSearch began as a fork.
- Choosing on benchmark throughput alone while ignoring relevance, freshness, tail latency, recovery, license/hosting, and operational cost.

## Knowledge checks with answers

1. **Why is search often a derived view?** The transactional owner remains authoritative; the index is optimized for retrieval and can lag or be rebuilt.
2. **What does refresh guarantee?** It makes recent operations visible to search; it is not a promise of immediate visibility before refresh and is distinct from a durable backup.
3. **Why can too many shards hurt?** Each shard adds overhead and coordinating work, while a query may fan out across many shards.
4. **How should an analyzer change be deployed?** Build a new compatible index, backfill and capture concurrent changes, validate it, switch a stable alias, and retain rollback.
5. **Are Elasticsearch and OpenSearch interchangeable?** No. They share lineage, but modern versions and clients evolve independently; check version-specific compatibility and test migrations.
6. **When should an application force refresh?** Only when a specific read-after-write flow requires it and its throughput cost is acceptable; otherwise rely on normal refresh or a documented wait-for-refresh mechanism.
