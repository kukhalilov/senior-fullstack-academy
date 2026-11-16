# indexes types covering indexes index maintenance and statistics — Exercises and worked solutions

# Goals

Turn a measured workload into a candidate index design, explain its access path, and account for estimate, storage, write, maintenance, and version risks.

# Worked example

Given a frequent query filtering a selective status, ranging by date, and returning a few columns, write down predicate, join, order, and projection requirements first. Test a narrow key for equality/range/order, add only necessary included columns, and compare a filtered subset if the predicate is stable. Record logical reads, CPU, elapsed time, actual versus estimated rows, write throughput, and index size before and after.

# Exercises

1. A heap has a nonclustered index on Email and a query needs Address. Explain the locator/lookup and two alternatives.
2. A query filters TenantId, then a date range, and sorts newest first. Propose a key order and discuss DESC.
3. An index `(A,B,C)` is proposed for queries filtering only B. Explain why it may not seek efficiently and what evidence would choose another design.
4. A 1% active subset is queried frequently. Compare a filtered index with a full index and state the query/SET-option caveats.
5. An analyst reads most columns from millions of rows. Compare rowstore and columnstore suitability.
6. The index usage DMV reports no reads after a restart yesterday. Explain why dropping is premature.
7. Reorganize ran but a query still has bad estimates. What should be investigated separately?
8. A SQL Server 2025 feature proposal uses JSON and vector indexes. State availability and the next validation steps.
9. A missing-index suggestion overlaps three existing indexes. Describe a safe consolidation process.
10. Decide whether to rebuild an index with high fragmentation but high page density and a seek-heavy workload. What evidence matters?
11. A SQL Server 2022 database with full-text indexes is upgraded in-place to SQL Server 2025. Explain the likely version 1 failure and a safe migration plan.

# Progressive hints

1. Draw where each index stores the row and what its locator is.
2. Separate equality, range, ordering, and projection roles.
3. Ask what fraction of rows qualify and whether the filter is implied.
4. Separate storage/structure from statistics/estimates and from query-plan choice.
5. Check the complete workload period, engine/edition support, locks, log, and maintenance resource budget.

# Complete solutions

1. Heap nonclustered leaves point by RID; a lookup fetches Address per qualifying row. Add Address as INCLUDE if measured lookup cost justifies it, create a clustered organization that helps the workload, or scan when many rows qualify.
2. A candidate `(TenantId, OrderDate DESC)` places equality before range/order. Test the desired ordering and whether an index scan in reverse suffices; include projections selectively.
3. B is not a leading prefix, so the structure may scan broadly rather than seek to a narrow B range. Compare a B-leading index, workload overlap, write cost, and actual plan/reads.
4. A filtered index can be smaller and maintain only active rows if the query predicate implies the filter. Required SET options apply to create, modification, and optimizer use; parameterization/expression shape can prevent proof of implication.
5. Columnstore is usually a stronger scan/aggregation candidate because it stores compressed segments by column and can use batch processing. Rowstore may remain better for highly selective point access or frequent row updates; benchmark mixed workloads.
6. Usage counters reset on restart and omit some index types. Observe full application/reporting cycles, consider constraint dependencies and rare critical operations, and compare writes/overlap before removal.
7. Check stale/misleading statistics, skew, correlations, parameter-sensitive plans, predicate conversions, and actual versus estimated cardinality. Reorganize does not refresh stats; targeted UPDATE STATISTICS or rebuild may affect them but consumes resources.
8. SQL Server 2025 native JSON index is GA, while vector index/VECTOR_SEARCH remain preview on SQL Server and require PREVIEW_FEATURES. New vector indexes use format version 3, which supports DML and iterative filtering; older formats need drop/recreate to migrate and lose indexed approximate search during the gap. Verify target update policy, SKU, supported predicates/options, vector type/index settings, deployment and rollback before adopting preview capabilities.
9. Group query shapes and existing key prefixes; compare exact key order, filters, includes, uniqueness, constraints, read/write frequency, plans, and storage. Test one consolidated candidate in a representative environment, then monitor; don't blindly merge indexes whose predicates or uniqueness differ.
10. High fragmentation alone does not require rebuild. Page density, range-scan I/O, workload latency, storage, cache, logging, maintenance window, and measured before/after result decide; seek-heavy access may be insensitive to physical page order.
11. Inventory `sys.fulltext_indexes.index_version = 1`; SQL Server 2025 removes version 1 binaries so queries/populations can fail. Verify `FULLTEXT_INDEX_VERSION = 2`, rebuild catalogs or drop/recreate indexes in a controlled order, monitor population, and regression-test changed tokenization/search results ([migration guidance](https://learn.microsoft.com/en-us/sql/relational-databases/search/full-text-index-version-upgrade?view=sql-server-ver17)).

# Tests and edge cases

- Compare actual and estimated row counts for selective and broad parameter values.
- Measure writes with and without each index; record log growth and index size.
- Test query predicates that exactly imply and do not imply a filtered-index filter.
- Capture usage DMVs before/after restart to observe counter reset behavior.
- Verify online/resumable support for the precise index kind, engine version, and edition; test lock waits and pause/resume failure handling.
- For JSON/vector features, test the documented supported predicates and target platform feature status.

# Reflection questions

Which query requirement does each key position serve? Which included column eliminates an observed lookup? What is the evidence window for index use? Does the proposed structure cost more in writes than it saves in reads? Which estimate error remains after the index change?

# Sources

Check relevant official references: [CREATE INDEX](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-index-transact-sql?view=sql-server-ver17), [filtered indexes](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/filtered-indexes?view=sql-server-ver17), [online operations](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/guidelines-for-online-index-operations?view=sql-server-ver17), [statistics](https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics?view=sql-server-ver17), and [SQL Server 2025 vector index status](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17).

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
