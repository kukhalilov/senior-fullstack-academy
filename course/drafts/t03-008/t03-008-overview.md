# indexes types covering indexes index maintenance and statistics — Big-picture orientation and mental model

# Problem and purpose

An index gives the optimizer another way to locate, order, or cover rows. The hard part is choosing one that matches real queries without making every write, backup, maintenance operation, and deployment more expensive.

# Plain-language mental model

Think of a rowstore index as a sorted directory. A clustered index is the main directory whose leaves are the table rows. A nonclustered index is a second directory containing selected key values, a locator back to the row, and optional included values. A seek follows a narrow key range; a scan reads a wider portion. The optimizer compares those paths with the cost of reading many rows directly.

An index is an option, not a promise. A scan can be best when a query needs much of the table. Statistics describe value distribution and help estimate rows; the optimizer can choose a poor plan if those estimates are stale or fail to model skew/correlation. Specialized indexes change the storage/search model for analytic columns, text, spatial/XML/JSON, or memory-optimized tables.

# How the parts fit together

1. Start with query predicates, joins, ordering, grouping, returned columns, and actual row counts.
2. Choose rowstore key columns and their order for seek/range/order needs; put projection-only values in INCLUDE when measured coverage is worthwhile.
3. Consider filtered indexes for a stable, selective subset and specialized structures for matching data/workloads.
4. Maintain statistics and compare estimates with actual rows before changing an index.
5. Measure both read benefit and write/storage/locking costs; test operations in the target edition and engine version.

# Concept map

| Need | Structure or evidence | Important boundary |
| --- | --- | --- |
| Seek or ordered range on a few columns | Rowstore B+ tree | Composite key order matters; extra indexes raise write cost |
| Read rows from table storage | Clustered index or heap | One clustered index maximum; heap has RID locators |
| Avoid row lookups | Covering nonclustered index | INCLUDE covers output but does not add key order |
| Analytics over many rows/columns | Columnstore | Rowgroups, segments, and delta storage shape performance |
| Better estimates | Statistics | First-key histogram is limited; statistics do not force a plan |
| JSON/vector/text/spatial/XML search | Specialized index | Each has a different contract and version/preview boundary |
| Find index or maintenance opportunities | Plans, DMVs, Query Store, workload tests | DMV recommendations/counters are incomplete evidence |

# End-to-end walkthrough

Suppose an orders screen filters `Status = 'Open'`, sorts by `CreatedAt DESC`, returns `OrderId`, `CustomerId`, and `Total`, and the open rows are a small fraction of the table. Compare a full nonclustered index on `(Status, CreatedAt DESC)` with a filtered index for open rows. Add `CustomerId` and `Total` as included columns only if lookup avoidance is measured to matter. Check that the query predicate implies the filter and that filtered-index SET options are correct. Compare the actual plan, logical reads, write rate, index size, and statistics before and after; do not infer success from the index existing.

# Version and platform boundaries

SQL Server 2025 supports ordered nonclustered columnstore indexes and generally available native JSON indexes. Vector index and VECTOR_SEARCH remain preview in SQL Server 2025 and require PREVIEW_FEATURES; cloud services have distinct availability. SQL Server 2025 also replaces legacy full-text components: version 1 indexes can fail queries/populations after in-place upgrade, so inventory and migrate to version 2 while testing tokenization changes. Resumable and online support depends on index operation, type, version, and edition. [SQL Server 2025 changes](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17) · [JSON index](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17) · [vector index](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17) · [full-text migration](https://learn.microsoft.com/en-us/sql/relational-databases/search/full-text-index-version-upgrade?view=sql-server-ver17) · [online operations](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/guidelines-for-online-index-operations?view=sql-server-ver17).

# When to use it and tradeoffs

Use a few purpose-built rowstore indexes for selective operational queries, columnstore for scan-heavy analytics, and a specialized structure only when its operators and data representation fit. Avoid indexes that duplicate an existing left prefix without a measured reason. Query plans, statistics quality, write volume, page density, and full-cycle usage data guide decisions; no fixed fragmentation percentage or missing-index message can replace workload evidence.

# What later lessons cover

Query-plan operators and tuning, transaction locking, Query Store, JSON querying, and vector search are taught in their own topics. This lesson focuses on the index and statistics contract and their direct design choices.

# Sources

Primary material: [index design guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide?view=sql-server-ver17), [CREATE INDEX](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-index-transact-sql?view=sql-server-ver17), [statistics](https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics?view=sql-server-ver17), and [index maintenance](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/reorganize-and-rebuild-indexes?view=sql-server-ver17).

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
