# indexes types covering indexes index maintenance and statistics — Reference: Filtered, columnstore, and specialized indexes

# Scope and version

Targets SQL Server 2025 (17.x) Database Engine rowstore/index/statistics semantics. Cloud platforms, editions, and specialized index availability can differ. Vector indexes are preview in SQL Server 2025; JSON indexes and ordered nonclustered columnstore indexes are current GA capabilities. See the cited version sources.

# How this group fits the mental model

This is one bounded slice of the full index lifecycle: the exact supplied names are explained below, then connected back to query workload, optimizer estimates, and write cost.

# Supplied names explained

| Exact inventory item | Meaning, behavior, and important edge |
| --- | --- |
| `Filtered index` | A nonclustered index containing only rows matching a filter predicate. It can be smaller and cheaper to maintain for sparse states, but the query predicate must imply the filter for optimizer use and required SET options must be correct. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/filtered-indexes?view=sql-server-ver17)) |
| `Filtered index predicate` | A restricted WHERE condition defining indexed rows, commonly a simple comparison or IS NULL test. SQL Server restricts expressions and columns; predicates cannot use arbitrary logic, and computed columns are not allowed as the filter column. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/filtered-indexes?view=sql-server-ver17)) |
| `Filtered unique index` | Enforces uniqueness only among rows satisfying its filter, such as present optional emails. This often permits many NULL or inactive rows while preventing duplicates in the active subset; it is an index-level conditional rule. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/filtered-indexes?view=sql-server-ver17)) |
| `Columnstore index` | Stores column segments and compresses rowgroups for analytic scans, aggregation, and batch processing. It is suited to scan-heavy workloads; selective point lookups and write patterns may favor rowstore or a complementary nonclustered index. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17)) |
| `Clustered columnstore index` | The table’s primary storage is compressed columnstore segments, with deltastore/delete metadata used for rows not yet compressed or logically deleted. It supports large analytic tables and can coexist with supported nonclustered rowstore indexes. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17)) |
| `Nonclustered columnstore index` | A columnar projection alongside a rowstore table, enabling analytics while retaining rowstore OLTP access. Choose included columns and maintenance impact carefully; SQL Server 2025 adds ordered nonclustered columnstore support. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17)) |
| `Ordered columnstore index` | An ordered columnstore sorts data during index build around specified columns, improving segment elimination for suitable predicates. SQL Server 2025 supports ordered nonclustered columnstore; sorting/build cost and data distribution still determine benefit. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-design-guidance?view=sql-server-ver17)) |
| `Columnstore rowgroup` | A batch of rows compressed together into one segment per column; the ideal full rowgroup is 1,048,576 rows. Small rowgroups can reduce compression and scan quality; inserts may enter delta rowgroups before compression. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17)) |
| `Delta rowgroup` | A rowstore structure that accepts rows before they become compressed columnstore rowgroups, particularly for smaller/batched writes. The tuple-mover later compresses eligible closed rowgroups; excessive small delta groups indicate ingestion-shape issues. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17)) |
| `Columnstore segment` | Compressed values for one column within one rowgroup. Segment min/max metadata can eliminate segments when predicates exclude their value range; ordering and data distribution influence this benefit. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17)) |
| `Columnstore dictionary` | A compression structure mapping repeated values to compact codes, created at rowgroup/column scope when beneficial. High-cardinality or poorly ordered data can reduce dictionary effectiveness. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17)) |
| `Columnstore archival compression` | COLUMNSTORE_ARCHIVE further compresses eligible columnstore partitions for cold data, trading additional CPU and slower access for storage savings. Do not use it on latency-sensitive hot partitions without measurement. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17)) |
| `Memory-optimized hash index` | An in-memory hash table for memory-optimized tables, best for equality lookups on the full key. Choose BUCKET_COUNT from expected distinct keys; too few buckets create long chains and too many waste memory. It does not support range scans or ordering. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/in-memory-oltp/indexes-for-memory-optimized-tables?view=sql-server-ver17)) |
| `Memory-optimized nonclustered index` | A memory-optimized ordered index supports range and ordered access on memory-optimized tables. These indexes use a different structure and memory model from disk-based B+ trees; traditional fill factor and fragmentation assumptions do not apply. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/in-memory-oltp/indexes-for-memory-optimized-tables?view=sql-server-ver17)) |
| `JSON index in SQL Server 2025` | A native JSON index on a SQL Server 2025 json column can serve documented JSON predicates across document paths. It is GA in SQL Server 2025, requires a clustered primary key, is offline-only in this release, and has path, key-size, per-column, hint, and other limitations; textual JSON can instead use computed-column indexes. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/json/index-json-data?view=sql-server-ver17)) |
| `Vector index preview in SQL Server 2025` | CREATE VECTOR INDEX provides approximate nearest-neighbor search over vector columns and is still preview on SQL Server 2025, gated by PREVIEW_FEATURES. Preview behavior and availability can change; exact search and application-level vector modeling are separate concerns. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `XML index` | A primary XML index persists a shredded representation and is required before secondary PATH, VALUE, or PROPERTY indexes. It can accelerate XML methods but consumes storage and adds write work; SQL Server 2022 added XML compression support. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/xml/xml-indexes-sql-server?view=sql-server-ver17)) |
| `Spatial index` | An extended index for geometry/geography spatial columns that reduces candidate objects for supported spatial methods. Grid/tessellation and method support differ; it is not a general B+ tree and requires spatial workload testing. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/spatial/spatial-indexes-overview?view=sql-server-ver17)) |
| `Full-text index` | A token-based index maintained by the Full-Text Engine for linguistic word, phrase, inflectional, and proximity searches. It is distinct from LIKE or a B+ tree prefix search, with catalog/population/language behavior and SQL Server 2025 breaking changes to check. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/search/full-text-search?view=sql-server-ver17)) |
| `Indexed view index` | The first index on a schemabound view must be a unique clustered index; subsequent nonclustered indexes are allowed. The stored result can accelerate matching queries, but base-table writes maintain it and definition/set-option restrictions are strict. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17)) |
| `Partition-aligned index` | An index is aligned when its partition scheme and partitioning column match the base table’s scheme and column, enabling partition-level operations such as switching under compatible definitions. Alignment is a deployment/schema property, not a query-speed guarantee. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/clustered-and-nonclustered-indexes-described?view=sql-server-ver17)) |
| `CREATE JSON INDEX` | Creates a native JSON path index for a json column in SQL Server 2025 and supported Azure/Fabric platforms. It is distinct from computed-column B+ tree indexes over textual JSON. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `JSON index FOR path list` | The optional FOR clause limits indexing to SQL/JSON paths. Paths can include up to 128 levels and must not overlap; changing paths requires recreating the index. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `OPTIMIZE_FOR_ARRAY_SEARCH` | CREATE JSON INDEX option that enables optimizations for array searches. It defaults OFF; enable only for matching JSON array workloads and validate supported predicates. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `JSON index clustering-key requirement` | A table must have a clustered primary key before a JSON index can be created; the key is limited to 31 columns and under 128 bytes. This is a creation prerequisite, not a requirement that the JSON property be part of that key. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `JSON index nonoverlapping path requirement` | A JSON index path list cannot contain overlapping paths such as `$.a` and `$.a.b`, because the broader path recursively covers the child. The statement rejects overlapping definitions. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `JSON index online and hint limitations` | SQL Server 2025 JSON index create/alter is offline, can take Sch-M and block table users, and JSON indexes are not supported in index hints. Plan the maintenance window and query normally so the optimizer can select it. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `JSON index count limits` | SQL Server supports up to 249 JSON indexes per table but at most one JSON index per json column. A JSON index cannot target computed json columns or json columns in views/table variables/memory-optimized tables. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `CREATE VECTOR INDEX` | Creates an approximate vector-neighbor index on a base-table vector column. In SQL Server 2025 the feature is preview; exact syntax/options and limitations can change. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `VECTOR_SEARCH index integration` | VECTOR_SEARCH can use an approximate vector index or an exact k-nearest-neighbor strategy selected by the optimizer, with filtering interactions and hints documented per release. Indexing does not guarantee recall/ranking quality for a particular data distribution. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index METRIC` | SQL Server 2025 vector indexes document cosine, euclidean, and negative dot-product metrics. The index metric and query metric must match intended distance semantics; vector normalization affects interpretation. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index TYPE DiskANN` | DiskANN is the currently documented approximate-nearest-neighbor index algorithm and the default TYPE. Do not infer other supported algorithms from general ANN literature. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `PREVIEW_FEATURES vector-index gate` | On SQL Server 2025 and SQL Server 2025 update-policy Managed Instance, vector index and VECTOR_SEARCH require the PREVIEW_FEATURES database-scoped configuration. Current Always-up-to-date cloud offerings can be GA, so verify target service status. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `FILLFACTOR JSON index option` | Sets desired leaf-page fullness for JSON index create/rebuild; the setting is not continuously maintained. Values 0 and 100 both fill pages to capacity; lower values cost storage and reads. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `DROP_EXISTING JSON index option` | Rebuilds the same named existing JSON index with a changed definition/options. It does not change index type and defaults OFF. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `ONLINE OFF JSON index option` | The documented SQL Server 2025 JSON index operation is offline; ONLINE = ON raises an error and Sch-M blocks all user access to the table during create/rebuild/drop. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `ALLOW_ROW_LOCKS JSON index option` | Controls whether row locks are permitted for JSON index access; ON is the default and lets the engine choose. OFF prohibits row locks. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `ALLOW_PAGE_LOCKS JSON index option` | Controls whether page locks are permitted for JSON index access; ON is the default. Turning it OFF changes lock choices and can affect operations. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `MAXDOP JSON index option` | The CREATE JSON INDEX syntax accepts MAXDOP, but current SQL Server documentation states the operation always uses one processor even when another value is specified. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `DATA_COMPRESSION JSON index limitation` | The CREATE JSON INDEX syntax lists DATA_COMPRESSION, but its limitations section currently says data compression is unsupported. Treat this as a documentation conflict and do not rely on compression until the target build documentation resolves it. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `JSON index supported predicate forms` | JSON_PATH_EXISTS supports equality; JSON_VALUE supports equality, while JSON_VALUE with RETURNING typed values also documents IN and BETWEEN range examples. JSON_CONTAINS can use the index. JSON_VALUE LIKE and IS [NOT] NULL forms are currently unsupported. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `JSON_VALUE RETURNING range predicates` | On a native json column, `JSON_VALUE(... RETURNING int)` or another supported type lets documented JSON-index queries use range forms such as IN and BETWEEN. Keep the SQL/JSON path and return type compatible with the indexed query expression; verify the actual plan on the target build. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `JSON index clustered primary-key size limits` | The table must have a clustered primary key. Its key is limited to 31 columns and under 128 bytes for JSON-index eligibility; this is stricter than ordinary rowstore key limits. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17)) |
| `Vector index latest version DML behavior` | The latest vector-index format (version 3 in current docs) supports INSERT, UPDATE, DELETE, and MERGE with automatic maintenance; earlier formats make the table read-only unless ALLOW_STALE_VECTOR_INDEX is enabled. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index iterative filtering` | Version 3 applies supported WHERE predicates during vector search rather than only after candidate retrieval. The optimizer can use vector and traditional B-tree indexes together; filter selectivity affects recall and plan choice. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index version migration` | Earlier vector index formats cannot be upgraded in place. Inspect sys.vector_indexes build_parameters version, then schedule DROP and recreate; search is unavailable between those steps and V3 changes TOP_N/query syntax. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `sys.dm_db_vector_indexes` | A dynamic management view for vector index health and background maintenance status. Use it with sys.vector_indexes/build metadata to verify the actual index exists and is current after deployment. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index minimum 100 non-NULL rows` | Current SQL Server vector indexes require at least 100 rows containing non-NULL vectors at create time. VECTOR_SEARCH can still run without an index using brute force, which may be too slow at larger scale. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `VECTOR_SEARCH TOP_N compatibility boundary` | Latest version 3 vector indexes do not support explicit TOP_N in VECTOR_SEARCH; use SELECT TOP (N) WITH APPROXIMATE. Older index versions documented TOP_N tuning for post-filtering, so version and syntax must be considered together. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `FORCE_ANN_ONLY vector hint` | A table hint that forces approximate-nearest-neighbor index use instead of allowing the optimizer to choose ANN versus exact kNN. It can constrain plan choice and should be justified by measured latency/recall requirements. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `ALLOW_STALE_VECTOR_INDEX` | A database-scoped compatibility setting that can permit DML against older read-only vector-index formats while allowing stale search results. Latest V3 indexes support normal DML without this compromise. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index TRUNCATE TABLE limitation` | Current SQL Server vector indexes prevent TRUNCATE TABLE. Drop the vector index first, truncate and reload at least 100 non-NULL vectors, then recreate and verify the index. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index partitioning limitation` | The current SQL Server vector-index preview cannot be partitioned. Do not assume rowstore partition-alignment strategies apply. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index replication limitation` | Vector indexes are not replicated to subscribers in the current documented SQL Server preview. Plan replica search behavior and index creation independently. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index DACPAC deployment limitation` | Current SQL Server vector indexes cannot be deployed with a DACPAC. A schema-only publish can succeed while silently skipping index creation when fewer than 100 non-NULL vectors exist; explicitly verify sys.vector_indexes and create after loading data. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index DacFx BACPAC support boundary` | BACPAC deployment supports vector indexes starting with DacFx 170.5.96, creating them after table data is loaded. Older DacFx workflows need explicit drop/export/import/recreate handling. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index DML visibility after commit` | With the latest vector index format, INSERT, UPDATE, DELETE, and MERGE maintain the index automatically; committed changes are visible to later vector searches without a rebuild. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index full-replacement rebuild guidance` | For near-total replacement of embeddings, such as a new embedding model, search remains valid but recall/ranking quality can degrade because the ANN structure reflects the old distribution. Rebuild after bulk replacement. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index duplicate embedding quality risk` | A high proportion of duplicate vectors can crowd nearest-neighbor results with repeats, reducing useful diversity while consuming index resources. Deduplicate or assess the data before indexing. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index MAXDOP option` | CREATE VECTOR INDEX accepts MAXDOP to cap parallel build work; 0 follows configured limits and system workload, while edition support constrains parallel operations. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `Vector index filegroup placement` | CREATE VECTOR INDEX can place its index on a filegroup or the default filegroup. Plan capacity, backup, and I/O placement with the base table and workload. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)) |
| `sys.vector_indexes` | One catalog row per vector index, inheriting `sys.indexes` columns and exposing index type, distance metric, and build parameters. Its build_parameters column is documented for internal use; catalog metadata visibility follows permissions. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-vector-indexes-transact-sql?view=sql-server-ver17)) |
| `sys.json_indexes` | One catalog row per JSON index, inheriting `sys.indexes` metadata and exposing whether array-search optimization is enabled. Use it after deployment to verify the index and its array option exist. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-json-indexes-transact-sql?view=sql-server-ver17)) |
| `sys.json_index_paths` | Catalog view with the SQL/JSON paths configured for each JSON index; when CREATE JSON INDEX omits FOR paths, it reports the root path. Verify deployed path coverage using object_id/index_id and path. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-json-index-paths-transact-sql?view=sql-server-ver17)) |

# Cross-item comparison

A filtered rowstore index narrows a row subset; columnstore changes storage to column segments; memory-optimized indexes target in-memory table access. XML, spatial, and full-text indexes have separate query languages/operators. JSON is GA in SQL Server 2025; vector index remains preview.

# Examples

```sql
-- Native JSON index (SQL Server 2025); table needs a clustered primary key.
CREATE TABLE dbo.CustomerDocument
(
    CustomerDocumentId int NOT NULL CONSTRAINT PK_CustomerDocument PRIMARY KEY CLUSTERED,
    Payload json NOT NULL
);
CREATE JSON INDEX IX_CustomerDocument_Payload
    ON dbo.CustomerDocument (Payload)
    FOR ('$.contact', '$.preferences')
    WITH (OPTIMIZE_FOR_ARRAY_SEARCH = ON);

-- SQL Server 2025 vector index is preview and needs >=100 non-NULL vectors.
CREATE VECTOR INDEX IX_Embedding_Vector
    ON dbo.Embedding (VectorValue)
    WITH (METRIC = 'cosine', TYPE = 'DiskANN');
```

JSON index creation is offline in SQL Server 2025; validate its path coverage and supported query forms. Vector index availability is platform-specific; after deployment inspect `sys.vector_indexes` and `sys.dm_db_vector_indexes`, and test iterative filters and recall against exact kNN for representative data.

# Common mistakes

- Assuming every JSON predicate can use a JSON index; supported forms are limited.
- Assuming JSON indexes support ONLINE or data compression in SQL Server 2025.
- Forgetting the clustered primary key and key-size prerequisites for JSON indexes.
- Creating a vector index before at least 100 non-NULL vector rows exist.
- Using vector-index V2-era `TOP_N` syntax with a latest version 3 index.
- Treating SQL Server 2025 vector preview as equivalent to GA Azure service availability.
- Assuming DacPac deployment always creates a vector index after loading too few rows.

# Knowledge checks with answers

1. **What prerequisite does CREATE JSON INDEX have?** A clustered primary key within the JSON-specific 31-column/128-byte limits.
2. **Can SQL Server 2025 build a JSON index ONLINE?** No; create/rebuild/drop are offline and take a schema-modification lock.
3. **What changes with vector index version 3?** DML and iterative filtering are supported; use SELECT TOP (N) WITH APPROXIMATE rather than VECTOR_SEARCH TOP_N.
4. **Why can a vector index be missing after a successful schema-only deployment?** DacPac may skip creation when fewer than 100 non-NULL vectors are present; verify `sys.vector_indexes` after loading data.
5. **When should a vector index be rebuilt after embedding changes?** After substantial replacement/model changes when recall/ranking degrades, rather than merely because background maintenance is nonzero.

# Sources

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
- https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-vector-indexes-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-json-indexes-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-json-index-paths-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-db-vector-indexes-transact-sql?view=sql-server-ver17
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
