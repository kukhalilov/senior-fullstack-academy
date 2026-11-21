# indexes types covering indexes index maintenance and statistics — Interview questions and reasoning

# Core questions

1. Clustered index versus nonclustered index versus heap?
2. Why does clustered-key width affect all nonclustered indexes?
3. Key column versus included column?
4. What is a left-prefix seek and when can an index scan still be useful?
5. What is a covering index and what does it cost?
6. What can statistics tell the optimizer, and what can a histogram not tell it?
7. Reorganize versus rebuild?
8. Filtered index versus full-table index?
9. Columnstore versus rowstore workload?
10. Why are missing-index suggestions and usage DMVs incomplete?
11. When should index maintenance run?
12. JSON index versus computed-column index in SQL Server 2025?
13. What is the status of vector index in SQL Server 2025?
14. What changed in vector index format version 3, and how do you migrate an older index?
15. How do SQL Server 2025 persisted statistics for readable secondaries work, and which metadata distinguishes temporary and persisted copies?
16. Why can a JSON index or vector index be absent or unused even when its DDL was deployed?

# Concise interview answers

1. Clustered leaf is the table data; nonclustered is a separate key/locator tree; heap is unordered row storage without a clustered B+ tree.
2. Nonclustered row locators use the clustered key, so its bytes multiply across indexes.
3. Key columns order and support access boundaries; included columns are leaf-only coverage.
4. Leading keys define contiguous ranges; a scan can be cheaper when many rows or columns are needed.
5. It contains every needed column, avoiding base-row lookups, at the cost of width, storage, and write work.
6. Stats summarize distribution; the histogram is only on the leading stats column and cannot encode arbitrary multi-column correlation.
7. Reorganize incrementally compacts leaf pages and leaves stats untouched; rebuild recreates structure and updates index stats as a side effect, with higher resource needs.
8. Filtered indexes only qualifying rows and can lower size/maintenance if query predicates imply the filter.
9. Columnstore favors analytic scans/aggregation; rowstore favors many operational point/range access patterns, though hybrid designs exist.
10. DMVs reset or omit history/types, and suggestions ignore full workload, existing overlap, write cost, and business-critical rare use.
11. When representative workload evidence shows a benefit and resource/locking impact fits a safe window; no universal fragmentation cutoff.
12. Native JSON columns can use SQL Server 2025 GA JSON indexes; text JSON can use computed-column B+ tree indexes for selected properties.
13. Preview on SQL Server 2025, requiring PREVIEW_FEATURES; cloud products can have different status.
14. Version 3 is the latest structure used by newly created indexes. It adds DML maintenance, iterative filtering, and optimizer choice between approximate search and kNN. Older formats require drop and recreate; inspect `sys.vector_indexes.build_parameters`, plan for the interval without approximate-index search, and change queries from old `VECTOR_SEARCH TOP_N` usage to `SELECT TOP (N) WITH APPROXIMATE` where applicable. Also plan the 100-row non-NULL minimum, DACPAC omission/verification, unsupported partitioning and replication, and rebuild after bulk embedding replacement.
15. Auto-created temporary statistics from readable-secondary workloads can be persisted to the primary and synchronized to replicas through the Query Store for readable secondaries infrastructure. A temporary secondary copy can remain until recompilation/restart. Inspect `sys.stats.is_temporary` and SQL Server 2025 `replica_role_id`, `replica_role_desc`, and `replica_name`; verify auto-create and secondary temporary-statistics configurations.
16. A JSON index requires a clustered primary key with JSON-specific limits, an indexed JSON path that matches a supported predicate, and offline maintenance; query hints are unsupported. A vector index requires at least 100 non-NULL vector rows, is preview on SQL Server 2025, and may be skipped by schema-only DACPAC publish; inspect `sys.json_indexes` or `sys.vector_indexes` after deployment and check query compatibility/optimizer choice.

# Deep follow-up answers

For a composite `(TenantId, CreatedAt)` index, equality on TenantId can narrow to one tenant before a date range. Putting a projection-only column in INCLUDE can cover output but does not make it searchable or ordered. A narrow design that supports the query may still lose when the parameter selects most rows; compare plan estimates and actual row counts across skew.

A rebuild refreshes that index's statistics, but a reorganize does not. Rebuilding an index is not a substitute for multi-column or filtered stats, and rebuilding all indexes can cause I/O/log/CPU pressure and recompiles. First find whether the problem is access path, estimate, parameter sensitivity, or resource contention.

Index usage counters are reset on engine start; do not drop an index based on a short observation. Check constraints and uniqueness, all workload windows, duplicate prefixes, filtered semantics, reads/writes, and a reversible rollout. Missing-index DMVs provide leads, not complete designs.

# Scenario questions

**A query is slow even though the plan shows an index seek.** Determine qualifying row count, lookup count, actual/estimated mismatch, residual predicate, key order, logical reads, parameter values, and whether a scan or covering/range path is cheaper.

**An overnight rebuild causes replica lag and log growth.** Reduce scope, evaluate targeted maintenance and statistics separately, consider supported online/resumable operations, monitor log/availability resources, and use a tested window. Online does not mean free of locks or resource impact.

**A proposal adds every missing-index DMV suggestion.** Consolidate by workload shape; compare leading keys, includes, filters, existing indexes, uniqueness, write costs, and measured plans. Deploy a tested small set and monitor.

**A product requirement asks for vector search in SQL Server 2025.** Explain preview and PREVIEW_FEATURES, verify official current release notes and target environment, assess whether preview restrictions and rollback risk are acceptable, and avoid claiming GA.

# Tradeoffs and alternatives

Use a narrow rowstore tree for selective ordered access, columnstore for analytics, filtered indexes for a well-defined subset, and specialized indexes only for supported operator/data combinations. Consider query rewrite or schema changes when the predicate is not seekable; more indexes are not always the answer. Keep estimation/statistics work separate from physical index maintenance.

# Common weak answers

- “A seek is always faster than a scan.”
- “Add every projected column to the key.”
- “Reorganize updates stats.”
- “Fragmentation over 30% means rebuild.”
- “Zero DMV reads means unused.”
- “INCLUDE columns have no cost.”
- “Online means no blocking.”
- “SQL Server 2025 vector indexes are GA.”
- “All statistics created on a readable secondary instantly replace its temporary statistics.”
- “A successfully published DACPAC guarantees a vector index exists.”

# Self-check rubric

Score 0–2 for storage/locator mental model; composite ordering and coverage; seek/scan/lookup costs; statistics and histogram limits; specialized workload/version fit; write amplification; maintenance/locking; and evidence quality. A strong answer ties every recommendation to a representative workload and testable observation.

# Sources

Key references: [CREATE INDEX](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-index-transact-sql?view=sql-server-ver17), [index maintenance](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/reorganize-and-rebuild-indexes?view=sql-server-ver17), [statistics](https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics?view=sql-server-ver17), and [SQL Server 2025 vector index status](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17).

- https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/indexes/clustered-and-nonclustered-indexes-described?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/create-index-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-indexes-with-included-columns?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/indexes/guidelines-for-online-index-operations?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/indexes/filtered-indexes?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-design-guidance?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/in-memory-oltp/indexes-for-memory-optimized-tables?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/json/index-json-data?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/xml/xml-indexes-sql-server?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/spatial/spatial-indexes-overview?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/search/full-text-search?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/create-statistics-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/update-statistics-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-objects/sys-dm-db-stats-properties-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-objects/sys-dm-db-index-usage-stats-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-objects/sys-dm-db-index-operational-stats-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-index-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/indexes/reorganize-and-rebuild-indexes?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/database-console-commands/dbcc-show-statistics-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-stats-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-stats-columns-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/database-engine/breaking-changes-to-database-engine-features-in-sql-server-2025?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/search/full-text-index-version-upgrade?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/performance/persisted-stats-secondary-replicas?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-json-indexes-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-vector-indexes-transact-sql?view=sql-server-ver17
