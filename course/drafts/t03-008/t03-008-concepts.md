# indexes types covering indexes index maintenance and statistics — Core concepts and how they fit together

# Learning objectives

Explain clustered/nonclustered/heap row locators; design composite key order and included columns from query shape; distinguish seek, scan, and lookup tradeoffs; recognize specialized index families; interpret statistics and their limits; select maintenance from measured evidence; and identify current SQL Server 2025 GA/preview boundaries.

# Prerequisites

Know tables, keys, SELECT predicates, joins, ordering, DML, and basic execution plans. This topic does not teach every plan operator or locking mode.

# Core concepts

Rowstore B+ trees sort key entries into root, intermediate, and leaf levels. A clustered index uses its leaf level as the table; a heap has no clustered order. A nonclustered index points to a heap row by RID or to a clustered row by clustered key. That locator is why a wide clustered key enlarges every nonclustered index.

For a composite key `(A, B, C)`, the tree orders by A, then B within each A, then C within each pair. Predicates on left prefixes are generally easiest to seek. Equality keys usually precede a range or ordering key, but actual selectivity, parameter distribution, joins, and sort direction matter. Included columns reside at leaf level for coverage; they do not extend seek ordering. A covering index trades lookup reads for wider pages and more write work.

The optimizer can seek, scan an index, scan a table, or combine paths. If many rows qualify, lookups can cost more than scanning. SARGable predicates expose usable key ranges; functions/conversions on a column often prevent that, but rewrite only if semantics remain identical. Index hints and forced plans can hide a bad design rather than solve it.

Statistics are a separate but related input. An index has key statistics; AUTO_CREATE_STATISTICS can add single-column stats. A histogram (up to 200 steps) covers only the first key column; density vectors help with key-prefix distinctness but do not encode full correlations. Filtered statistics describe subsets. Auto-update helps keep estimates current, while asynchronous update can let one compile use older stats. Manual updates and rebuilds can cause recompilation and resource work.

# Mechanisms and relationships

Use `sys.dm_db_index_usage_stats` to ask which seeks/scans/lookups/updates occurred during its current counter lifetime, not to prove permanent nonuse. It resets at engine restart and omits spatial and memory-optimized usage. `sys.dm_db_index_operational_stats` gives lower-level access/lock/latch data. Both need a time window that represents seasonal, reporting, and rarely run critical work.

REORGANIZE incrementally works on leaf pages and does not update statistics. REBUILD recreates an index and refreshes its index stats as a side effect; it can consume workspace, I/O, CPU, log, and locks. Rowstore page density may matter more than fragmentation. Use targeted stats updates when evidence points to estimate quality, not as a ritual after every reorganize.

Specialized indexes solve different access problems: columnstore compresses column segments and supports analytics; memory-optimized hash and ordered indexes have distinct equality/range needs; XML, spatial, full-text, JSON, and vector features each expose domain-specific search behavior and limitations. Their costs and support boundaries cannot be inferred from a normal rowstore B+ tree.

# Worked examples

```sql
CREATE INDEX IX_Order_Open_Created
ON dbo.Orders (CreatedAt DESC)
INCLUDE (OrderId, CustomerId, Total)
WHERE Status = 'Open';
```

This filtered index deliberately omits Status from its key because all indexed rows satisfy the fixed predicate. It can help only when the query implies that filter and compatible SET options are used. The index's filtered statistics describe the included population. Validate actual plans and DML cost; a parameterized or differently expressed predicate may not prove the filter to the optimizer.

For a general query such as `WHERE CustomerId=@id AND CreatedAt >= @start ORDER BY CreatedAt`, a candidate key `(CustomerId, CreatedAt)` matches equality then range/order, while projected columns might be included. Test skewed customers as well as typical ones; one plan may not fit every selectivity.

# Misconceptions and edge cases

- An index does not force a seek or guarantee lower elapsed time.
- Included columns do not contribute to key order and can still make the index large.
- A clustered key is repeated as the locator in nonclustered indexes.
- A seek can still return many rows and trigger expensive lookups.
- Histograms do not describe every column combination.
- Reorganize does not update statistics; rebuild does, as a side effect.
- A DMV with zero reads since restart does not establish that a critical index is unused.
- A missing-index suggestion ignores write cost and can duplicate an existing index.
- Preview vector indexing is not GA in SQL Server 2025.

# Knowledge checks with answers

1. **Where do included columns live?** At nonclustered leaf level; they do not define seek ordering.
2. **What does a heap locator use?** A RID; a clustered table uses its clustered key.
3. **Which column gets a histogram?** The leading column of the statistics key list.
4. **Does reorganize refresh statistics?** No. Rebuild recreates index stats; standalone UPDATE STATISTICS is a separate operation.
5. **Can zero DMV seeks justify dropping an index?** No; the counter lifetime and workload coverage are limited, and constraints/rare queries matter.
6. **What is the SQL Server 2025 vector-index status?** Preview; requires PREVIEW_FEATURES, subject to current release documentation.

# Sources

See the [index architecture/design guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide?view=sql-server-ver17), [CREATE INDEX reference](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-index-transact-sql?view=sql-server-ver17), [statistics guide](https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics?view=sql-server-ver17), and [maintenance guide](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/reorganize-and-rebuild-indexes?view=sql-server-ver17).

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
