# query performance indexes projection pagination split queries and compiled queries — Interview questions and reasoning

Sources: Microsoft's [efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying), [advanced performance topics](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics), [pagination](https://learn.microsoft.com/en-us/ef/core/querying/pagination), [single and split queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries), [performance diagnosis](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis), and [EF Core 11 changes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew).

## Core questions

1. How do you diagnose a slow EF Core endpoint?
2. When would you project into a DTO instead of returning entities?
3. Compare offset and keyset pagination.
4. Why does pagination need a unique order?
5. What is cartesian explosion, and when might split queries help?
6. How do you decide whether to add an index?
7. What does `ToQueryString` tell you, and what does it not tell you?
8. Compare tracking, no-tracking, and no-tracking with identity resolution.
9. When would an explicit compiled query help?
10. Compare context pooling with connection pooling.
11. How do retries or split queries affect buffering?
12. What should you measure before and after a query change?

## Concise interview answers

1. Establish a representative baseline; record endpoint percentiles, command count/duration, rows/bytes, allocations, and DB waits. Inspect generated SQL and an actual DB plan, then optimize the dominant layer one change at a time.
2. A DTO projection transfers only required columns and avoids entity materialization/tracking when it contains no entity instances. It is appropriate for read responses; updates need an explicit write path.
3. Offset supports arbitrary jumps but may scan/discard preceding rows and can shift under concurrent changes. Keyset uses the last ordered key values in a seek predicate and is usually better for sequential traversal when indexed.
4. Without a unique order, equal keys can appear in different relative positions and pages may skip or duplicate results. Add a unique tie-breaker to order and cursor conditions.
5. Sibling collection joins multiply child rows and duplicate parent columns. Split queries reduce that multiplication but add round trips, possible buffers, and a consistency window.
6. Use a representative slow query and actual plan/data distribution to identify an access bottleneck. Check read improvement against storage and write-maintenance cost.
7. It helps inspect EF's translated SQL. It does not show actual runtime plan, real parameter values, row counts, or elapsed time.
8. Tracking supports updates and identity resolution at memory/CPU cost. No-tracking avoids context attachment. No-tracking identity resolution deduplicates repeated keys via temporary tracking but costs more than plain no-tracking.
9. Only when profiling shows EF expression processing/cache lookup is a meaningful fraction of repeated-query latency. Normal queries are already cached by shape; compiled delegates have model and parameter restrictions.
10. Context pooling reuses EF context objects; connection pooling reuses provider-managed DB connections. They address separate setup costs and can both be enabled.
11. Retry execution may buffer results to replay safely; split queries may buffer earlier results when multiple active readers are unavailable. Measure memory with the real provider.
12. The same correctness scenario, representative database size and parameter distribution, p50/p95/p99, command count/duration, actual plan/reads, rows/bytes, allocations, and error/cancellation behavior.

## Deep follow-up answers

### A user asks for page 800

Ask whether arbitrary page jumps are a product requirement. Keyset pagination naturally follows a cursor, not page numbers; offset may be needed for random access, but deep offsets can be expensive and concurrent changes shift boundaries. A hybrid may use keyset for next/previous and offset for explicit jumps. The query must have deterministic, unique ordering, and an index should align with tenant/filter/order keys. Cursor integrity is not authorization; reapply access-control predicates on every request.

### The query has an index but is still slow

Check the actual plan rather than assuming index use. The predicate may wrap the column in a function/conversion, use a non-leading composite key, be low-selectivity, or suffer from poor estimates/parameter sensitivity. Compare actual and estimated rows, reads, sorts, spills, and returned bytes. An index can be used and still be slower than a scan for a broad result. A covering index may reduce lookups but increases writes/storage.

### Would you use split query or compiled query first?

Inspect SQL and row multiplication first. If sibling collections produce huge duplicate rows, compare split loading and projection; if network round trips dominate, splitting may lose. Explicit compiled queries address EF's repeated expression processing, not DB I/O or transferred data. Choose based on measured bottleneck and consistency requirements.

### A pooled context serves multiple tenants

Pooling reuses instances. Request-varying tenant state must be overwritten on every checkout, defaults must fail closed, and manually modified connection/driver state must be restored before return. Keep `OnConfiguring` for one-time configuration, not per-request state. Test concurrent tenant requests specifically for data leakage.

### What changed in EF Core 11?

EF Core 11.0.0 shipped on November 10, 2026. The release notes describe pruning unnecessary reference joins/order keys for include SQL, improved GroupBy translation, no-op cast removal, `MaxBy`/`MinBy` translation, and provider-specific additions such as SQL Server vector search and avoiding implicit projection of vector properties. These improvements are bounded by provider and query shape; never promise a release-level speedup for an unrelated query. [EF11 release notes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew).

## Scenario questions

1. **Search API gets slower as pages grow.** Inspect offset plan and data volume; consider a fully unique keyset cursor and matching index; preserve filters and cursor precision.
2. **One endpoint loads entities for a list card.** Project needed fields, cap results, measure bytes/allocations, and confirm whether any entity in the projection is tracked.
3. **One query returns 10,000 duplicate rows for 300 parent objects.** Inspect sibling collection joins and bytes; compare projection/split approaches and consistency needs.
4. **EF CPU appears high but DB latency is low.** Inspect query-cache hit rate, dynamic expression shape, tracking/materialization/allocation, and only then benchmark compiled queries or pooling.
5. **The first request is slow while later requests are fast.** Separate model initialization/JIT/cold connection from warm query costs; evaluate compiled model only if first-use model setup is material.

## Tradeoffs and alternatives

For read APIs, compare entity tracking with DTO projection and no-tracking based on object graph needs. For page navigation, compare offset with keyset based on random access and consistency. For related graphs, compare one query with split query using duplicate bytes, round trips, buffering, and snapshot requirements. For EF setup, compare default context creation with pooling only after baseline measurement. Database index decisions must include write load and storage, not just read latency.

## Common weak answers

- “Add an index” without examining a slow query and its plan.
- “Use `AsNoTracking` and it will be fast” without discussing projection, rows, or materialization.
- “Split queries are always faster” or “one SQL command is always faster.”
- “Compiled queries compile SQL and skip the database.”
- “The query is ordered by the ID automatically.” Relational queries have no implicit order.
- “Cancellation means the save was rolled back.” A write outcome can be uncertain.
- Quoting an EF11 speedup as universal without matching query/provider evidence.

## Self-check rubric

Score yourself from 0 to 2 in each area: (0) missing/incorrect, (1) partial, (2) precise and evidence-based.

| Skill | A score of 2 means |
|---|---|
| Diagnosis | Separates application, EF, network, and database costs and names measurements. |
| SQL/index reasoning | Uses actual plans and explains index tradeoffs and query shape. |
| Pagination | States unique ordering, compound cursor conditions, and offset tradeoffs. |
| Loading strategy | Explains row multiplication, round trips, and consistency differences. |
| EF overhead | Distinguishes query caching, compiled queries, pooling, tracking, and model startup. |
| Communication | Gives a clear recommendation tied to workload evidence and correctness constraints. |
