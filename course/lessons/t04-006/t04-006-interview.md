# loading navigation properties eager explicit lazy and N+1 — Interview questions and reasoning

Source basis: Microsoft [eager loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager), [explicit loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/explicit), [lazy loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/lazy), [single/split query guidance](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries), and [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Core questions

1. Compare eager, explicit, and lazy loading.
2. When is projection better than `Include`?
3. What does `ThenInclude` do?
4. What restrictions and surprises come with filtered include?
5. How does tracking fix-up affect a filtered include?
6. What is N+1 and how do you detect it?
7. How does lazy loading work with proxies versus `ILazyLoader`?
8. What happens when lazy loading occurs during serialization?
9. Explain cartesian explosion with sibling collection includes.
10. Compare single-query and split-query modes.
11. Is split query an N+1 problem?
12. What does `NavigationEntry.IsLoaded` mean?
13. What does `IgnoreAutoIncludes` disable?
14. What did EF Core 11 change for reference joins in include queries?

## Concise interview answers

1. Eager requests data in the root query; explicit issues a visible later load/query; lazy fetches transparently on navigation access.
2. When a read model needs only selected values, projection transfers fewer columns and avoids unnecessary entity graph materialization.
3. It continues an include path through the previously included navigation.
4. It filters/orders/pages a collection using supported operators; each path has one unique filter set; tracking fix-up may include previously tracked rows beyond the filter.
5. Fix-up can put previously tracked related entities into the navigation even if they fail the filter; EF also marks it loaded.
6. One root query plus one query per parent/navigation access. Detect via command logs/telemetry/query-count tests; fix with projection, eager/split load, or batched explicit query.
7. Proxies intercept overridable virtual navigations on proxy-created entities; `ILazyLoader` calls a service from the getter and does not require virtual members but couples the entity to loading.
8. Serialization can trigger hidden database queries, N+1, cycles, and unintended data exposure; return DTOs instead.
9. Two sibling collections cross-multiply rows (e.g. 10×10 yields 100 combinations for one root), repeating parent/child data.
10. Single query joins one result but can duplicate/cross-multiply; split query avoids some multiplication but adds round trips, buffering, and consistency windows.
11. No. Split query count is bounded by query/include paths, not one per root row.
12. EF believes the navigation is loaded; filtered include can set it true for a partial set.
13. It suppresses user-configured auto-includes, not owned navigations auto-included by convention.
14. EF11 prunes some redundant to-one joins in split query statements and redundant reference keys in ordering; actual provider/query shape still matters.

## Deep follow-up answers

Choose from the response shape and timing. A projection is often appropriate for API/read pages. `Include` is useful when code needs a tracked graph, but joined collections can inflate rows. Explicit loading works when data is conditional; `.Query()` can compute aggregates without materializing children. Lazy loading can simplify traversal but creates hidden I/O and should be observable/controlled.

Filtered include is not an isolated collection filter when a context already tracks related rows. Fix-up can add those tracked rows, and EF marks the nav loaded, meaning later `LoadAsync` will not fill gaps. A fresh or no-tracking query is safer for a strict filtered API result.

Single/split is a measured tradeoff. Single query pays in rows/bytes/joins; split query pays in additional network latency, buffering (provider dependent), and consistency across multiple statements. If a stable graph is required, a transaction isolation level may help, but it changes locks/version store, throughput, and failure behavior. Count commands, transferred rows/bytes, and inspect plans.

N+1 is a query-count pattern caused by per-root lazy or explicit loads. Split query is different: it executes a bounded number of statements for include paths. Both can be slow, but their fixes and costs differ.

## Scenario questions

### Scenario: 100-row endpoint logs 101 queries

**Strong approach:** Correlate commands to navigation access and identify the repeated query. Replace with projection or batch related data; only eager load if graph is genuinely needed. Add command-count coverage and observe row/byte volume.

### Scenario: split query is slower over a cloud connection

**Strong approach:** Extra latency from each round trip may outweigh reduced row multiplication. Measure joined payload versus split command latency; use projection or one query when duplication remains manageable; do not assume one strategy universally wins.

### Scenario: API response unexpectedly contains records outside filter

**Strong approach:** Check context tracking history and filtered include fix-up; use fresh/no-tracking context or query directly into a DTO. Treat the navigation as partial even if loaded-state is true.

### Scenario: Include graph becomes larger over time

**Strong approach:** Inspect `AutoInclude`, owned navigations, repeated `ThenInclude` paths, and lazy properties touched by serializers/mappers. Make query shape explicit and return DTOs.

## Tradeoffs and alternatives

- Eager include: visible upfront graph, but can overfetch and multiply rows.
- Projection: precise and typically efficient for reads, but not a tracked aggregate for mutation.
- Explicit load: conditional and visible, but repeated calls can still be N+1.
- Lazy load: convenient traversal, hidden I/O and lifecycle/serialization risk.
- Single query: one round trip, potentially large duplicated result.
- Split query: bounded extra round trips, lower cartesian multiplication, multi-statement consistency and buffering concerns.

## Common weak answers

- “Always use `Include` to avoid N+1.”
- “Always use split query for multiple collections.”
- “Split query means N+1.”
- “Filtered include always returns only matching rows.”
- “Lazy loading is just an in-memory navigation.”
- “`IsLoaded` means every child in the database is present.”
- “EF11 fixed split queries.”

## Self-check rubric

State what data is needed, when it is fetched, SQL statement count, row multiplication/payload, tracking/fix-up effects, context/resource lifetime, and consistency requirements. Cite a measured query shape/provider rather than relying on a universal loading rule.
