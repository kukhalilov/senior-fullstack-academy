# system design foundations and infrastructure building blocks — Reference: Cursor pagination

Sources: [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm), [PostgreSQL SELECT and LIMIT ordering](https://www.postgresql.org/docs/current/sql-select.html).

## Scope and version

This lesson explains cursor/keyset pagination for changing, large collections and uses Relay’s GraphQL connection shape as one example. Cursor encoding and response fields are API design choices unless a particular protocol/specification is adopted. Database syntax and query plans vary.

## How this group fits the mental model

Pagination divides a large ordered collection into manageable pieces. Offset pagination says “skip the first 10,000 rows”; cursor pagination says “continue after this specific position.” A cursor is a bookmark into an explicitly ordered result set. It can avoid scanning or counting a large skipped prefix and can behave more predictably as earlier rows are inserted or deleted, provided the sort key and query semantics are designed carefully.

## Supplied names explained

- `Cursor pagination` — Retrieves bounded slices using a continuation token that identifies a position in a deterministic ordering, rather than relying only on a row offset.

## Establish a total order first

Pagination requires a stable ordering. Sorting only by a non-unique timestamp is insufficient: multiple rows can tie, so the boundary is ambiguous. Add a unique tie-breaker, commonly `(created_at, id)`, and use exactly the same sort direction and comparison in every page query.

For descending order, if the cursor row has `(created_at = T, id = I)`, the next page condition is conceptually `created_at < T OR (created_at = T AND id < I)`, followed by the same descending order and `LIMIT page_size + 1`. The extra row tells the server whether another page exists. Use database-native row comparison only when its null and collation semantics match the intended order.

Indexes should support the filter plus ordering columns, for example `(tenant_id, created_at DESC, id DESC)` for a tenant-scoped feed. Confirm with the actual query plan and data distribution. Keyset pagination is not automatically fast if the ordering/filter lacks an appropriate index.

## Offset versus cursor

Offset pagination is simple and useful for small, mostly static datasets or interfaces needing direct page numbers. Deep offsets may require the database to walk and discard many rows; concurrent inserts/deletes before the offset can shift rows between requests, causing duplicates or skips.

Cursor pagination works naturally for “next/previous” traversal and large feeds. It does not inherently support jumping to page 500, and it does not freeze a consistent snapshot across requests. New records after the cursor may or may not appear depending on sort direction and filters; deleted or updated sort keys can change later pages. If users need a stable export snapshot, bind the traversal to a snapshot/version or materialized result set and define expiry.

## Cursor construction and integrity

A cursor can encode the ordered key(s), direction, and perhaps a filter/snapshot version. It is often Base64-encoded for transport, but encoding is not encryption or tamper protection. If changing the cursor could expose data or bypass constraints, sign it or store an opaque server-side token. Regardless, reapply authorization and filters on every page; the cursor is not an access-control credential.

Bind cursors to the relevant query context when necessary: tenant, sort order, filter, and snapshot. Reject malformed, expired, or incompatible cursors with a clear client error. Avoid placing secrets or sensitive row contents in a readable cursor. Ensure keys are stable and serializable; nullable sort keys require explicit null ordering and matching continuation predicates.

## API shape and page boundaries

Relay’s connection specification uses `edges` with a cursor and node, and `pageInfo` such as `hasNextPage`; arguments such as `first` and `after` request a forward slice. This is a common GraphQL convention, not the only valid cursor API. REST APIs often return `items` and `nextCursor`.

Set a maximum page size and a default. Clarify whether a cursor points to the last returned item and whether the next query is exclusive (`after`) or inclusive. For backward pagination, specify ordering and `before` semantics carefully; servers often query in reverse then restore presentation order. An empty page can still carry a continuation only if the API intentionally permits filtered/authorized scanning semantics.

## Concurrent changes and snapshot semantics

Keyset pagination reduces offset shifting but does not promise a point-in-time snapshot. If a record’s sort key changes, it can cross the cursor boundary and appear twice or not at all. Immutable ordering keys reduce this risk. For audit/export workflows requiring no duplicates or omissions, use a database snapshot/transaction with an appropriate lifetime, a stable high-water mark, or a precomputed export; long-lived snapshots can retain database resources.

For a live feed, slight movement may be acceptable. State the contract: new items may appear only at the beginning, updates may reorder entries, and clients may refresh from the top. Add stable IDs and client deduplication when reconnect or retry can repeat a page.

## Cross-item comparison

| Approach | Good fit | Main caveat |
|---|---|---|
| Offset/limit | Direct page numbers, small/static data | Deep skip cost and shifting rows under concurrent changes |
| Keyset cursor | Large ordered collections and sequential traversal | Needs a deterministic indexed order; no cheap arbitrary page jump |
| Snapshot-bound cursor | Exports/audits requiring stable traversal | Snapshot/materialization lifetime and storage cost |
| Opaque server-side token | Complex or sensitive continuation state | Server storage, expiration, cleanup, and availability |
| Signed self-contained cursor | Stateless continuation with tamper detection | Token remains readable unless encrypted; context/expiry still need validation |

## Examples

A tenant-scoped activity feed orders by `(created_at DESC, event_id DESC)`. The first query fetches 51 rows for a page size of 50, returns 50, and builds a cursor from the last visible row’s timestamp and ID. The next query filters to that tenant and asks for keys lexicographically below the cursor under the same order. A composite index supports the tenant filter and ordering. The API checks the caller’s current tenant access on every request.

An export needs every record as of a particular time. A normal live cursor can miss rows whose sort keys change. The export instead binds to a snapshot or high-water mark and records its version in the continuation state; it expires the session to avoid holding resources indefinitely.

## Common mistakes

- Sorting by a non-unique key without a unique tie-breaker.
- Using a cursor predicate whose comparison or direction differs from the `ORDER BY`.
- Assuming Base64 makes a cursor secret or tamper-proof.
- Treating the cursor as authorization and skipping access checks on later pages.
- Expecting a cursor to provide arbitrary page-number jumps or a stable snapshot automatically.
- Ignoring null ordering, collation, timestamp precision, or mutable sort keys.
- Omitting supporting indexes or failing to inspect the real query plan.
- Allowing unbounded page sizes or expensive filters.
- Failing to define duplicate/omission behavior across reconnects and concurrent updates.

## Knowledge checks with answers

1. **Why add a unique tie-breaker to a timestamp sort?** It creates a total order so a continuation cursor points to one unambiguous boundary.
2. **Does keyset pagination guarantee a snapshot across multiple requests?** No. Data can be inserted, deleted, or reordered; snapshot semantics require an explicit mechanism.
3. **Is a Base64 cursor secure?** No. Base64 is reversible encoding. Sign it for integrity and encrypt or store state server-side if confidentiality is needed.
4. **Why might keyset pagination be faster for a deep traversal?** It seeks from indexed key values rather than skipping and discarding a large prefix, assuming a suitable index/query plan.
5. **What must be rechecked when using a cursor?** Authorization, tenant scope, filters, sort context, token validity, and page-size limits.

## Practice

Design a cursor for a descending list of orders sorted by nullable `shipped_at` and unique `order_id`. State the null ordering, cursor fields, continuation predicate, index, authorization behavior, and how you would meet a requirement to export a consistent snapshot.

**Suggested answer:** Prefer a non-null immutable ordering key if possible. Otherwise define `NULLS FIRST` or `NULLS LAST` and include a normalized null-rank plus `shipped_at` and `order_id` in the cursor; write a continuation predicate that exactly mirrors this total ordering. Create an index matching tenant/filter columns and the ordering keys, then validate its plan. Sign or make the token opaque, bind it to tenant/filter/sort context, and reauthorize every page. For a consistent export, use a bounded-lifetime database snapshot, high-water mark with immutable keys, or materialized export rather than claiming a live cursor freezes state.
