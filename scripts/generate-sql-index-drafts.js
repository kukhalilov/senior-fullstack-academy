import fs from 'node:fs/promises';

const manifestPath = 'curriculum/manifests/sql-server/t03-008.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const urls = {
  architecture: 'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide?view=sql-server-ver17',
  clustered: 'https://learn.microsoft.com/en-us/sql/relational-databases/indexes/clustered-and-nonclustered-indexes-described?view=sql-server-ver17',
  createIndex: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/create-index-transact-sql?view=sql-server-ver17',
  included: 'https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-indexes-with-included-columns?view=sql-server-ver17',
  online: 'https://learn.microsoft.com/en-us/sql/relational-databases/indexes/guidelines-for-online-index-operations?view=sql-server-ver17',
  filtered: 'https://learn.microsoft.com/en-us/sql/relational-databases/indexes/filtered-indexes?view=sql-server-ver17',
  columnstore: 'https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17',
  columnstoreDesign: 'https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-design-guidance?view=sql-server-ver17',
  memory: 'https://learn.microsoft.com/en-us/sql/relational-databases/in-memory-oltp/indexes-for-memory-optimized-tables?view=sql-server-ver17',
  jsonIndex: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17',
  json: 'https://learn.microsoft.com/en-us/sql/relational-databases/json/index-json-data?view=sql-server-ver17',
  vector: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17',
  xml: 'https://learn.microsoft.com/en-us/sql/relational-databases/xml/xml-indexes-sql-server?view=sql-server-ver17',
  spatial: 'https://learn.microsoft.com/en-us/sql/relational-databases/spatial/spatial-indexes-overview?view=sql-server-ver17',
  fullText: 'https://learn.microsoft.com/en-us/sql/relational-databases/search/full-text-search?view=sql-server-ver17',
  indexedView: 'https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17',
  statistics: 'https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics?view=sql-server-ver17',
  createStatistics: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/create-statistics-transact-sql?view=sql-server-ver17',
  updateStatistics: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/update-statistics-transact-sql?view=sql-server-ver17',
  statsProperties: 'https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-objects/sys-dm-db-stats-properties-transact-sql?view=sql-server-ver17',
  usageStats: 'https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-objects/sys-dm-db-index-usage-stats-transact-sql?view=sql-server-ver17',
  operationalStats: 'https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-objects/sys-dm-db-index-operational-stats-transact-sql?view=sql-server-ver17',
  alterIndex: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-index-transact-sql?view=sql-server-ver17',
  maintenance: 'https://learn.microsoft.com/en-us/sql/relational-databases/indexes/reorganize-and-rebuild-indexes?view=sql-server-ver17',
  createJson: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/create-json-index-transact-sql?view=sql-server-ver17',
  createVector: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17',
  showStats: 'https://learn.microsoft.com/en-us/sql/t-sql/database-console-commands/dbcc-show-statistics-transact-sql?view=sql-server-ver17',
  sysStats: 'https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-stats-transact-sql?view=sql-server-ver17',
  sysStatsColumns: 'https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-stats-columns-transact-sql?view=sql-server-ver17',
  newSql: 'https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17',
  breakingChanges: 'https://learn.microsoft.com/en-us/sql/database-engine/breaking-changes-to-database-engine-features-in-sql-server-2025?view=sql-server-ver17',
  fullTextUpgrade: 'https://learn.microsoft.com/en-us/sql/relational-databases/search/full-text-index-version-upgrade?view=sql-server-ver17',
};
manifest.sourceSnapshot = {
  ...manifest.sourceSnapshot,
  authority: 'Microsoft SQL Server 2025 Database Engine index, JSON/vector, and statistics documentation',
  edition: 'SQL Server 2025 (17.x) index semantics, sources checked 2026-11-16',
  checkedAt: '2026-11-16',
  urls: [...new Set([...manifest.sourceSnapshot.urls, ...Object.values(urls)])],
};
manifest.comparisonSources = [...new Set([...(manifest.comparisonSources ?? []), ...Object.values(urls)])];
manifest.versionNotes = [{
  edition: 'SQL Server 2025 (17.x)',
  items: [
    'Ordered nonclustered columnstore indexes are supported. Native JSON data and CREATE JSON INDEX are generally available. Approximate vector indexes and VECTOR_SEARCH remain preview on SQL Server 2025 and require PREVIEW_FEATURES; cloud service availability differs.',
    'New vector indexes use the latest version 3 structure; older structures should be recreated to obtain DML and iterative-filtering support. Version 3 changes query syntax: use SELECT TOP (N) WITH APPROXIMATE rather than the older VECTOR_SEARCH TOP_N argument.',
  ],
  sourceUrls: [urls.newSql, urls.columnstore, urls.jsonIndex, urls.vector, urls.breakingChanges, urls.fullTextUpgrade],
}];
manifest.accuracyFacts = [
  'An index is a candidate access path, not a command that forces the optimizer to use it. Scans can be the best plan for broad result sets.',
  'A rowstore clustered index defines leaf-level row organization; there can be only one. A heap has no clustered B+ tree. Nonclustered row locators are a RID for a heap and the clustered key for a clustered table.',
  'Included columns are stored at nonclustered leaf level, are not key columns, and do not establish ordering. Nonclustered indexes implicitly carry clustered key columns as row locators.',
  'Statistics histograms describe only the first key column of a statistics object; multi-column statistics also have density information, not a full joint histogram.',
  'REORGANIZE is an online, incremental leaf-level operation and does not update statistics. REBUILD recreates the index and updates its index statistics; neither is justified by one universal fragmentation percentage.',
  'Usage DMVs are cumulative only since the last engine start and may reset; low observed reads do not prove an index is unused across a complete business cycle. Usage statistics omit spatial and memory-optimized index use.',
  'SQL Server 2025 JSON indexes are generally available on native json columns; they require a clustered primary key and have documented key-size, path, online-operation, hint, and per-table limits.',
  'SQL Server 2025 vector index and VECTOR_SEARCH are preview features on SQL Server, gated by PREVIEW_FEATURES. Latest version 3 indexes support DML and iterative filtering; earlier versions have different read-only/post-filter limits.',
  'SQL Server 2025 removes full-text version 1 components from its installation. Existing version 1 full-text queries and populations can fail after in-place upgrade; migrate indexes and validate new tokenization.',
  'Online and resumable index support varies by operation, index kind, product version, and edition. RESUMABLE requires ONLINE; inspect operation-specific limits before deployment.',
  'Indexes add storage and DML maintenance, logging, and cache pressure. A missing-index DMV suggestion is a hypothesis to test against workload and existing indexes, not a deployment plan.',
];
const addItems = (groupId, items) => {
  const group = manifest.inventory.find(entry => entry.id === groupId);
  if (!group) throw new Error(`Missing inventory group ${groupId}`);
  group.items = [...new Set([...group.items, ...items])];
};
addItems('rowstore-index-structures', [
  'CREATE INDEX', 'CREATE UNIQUE INDEX', 'CREATE CLUSTERED INDEX', 'CREATE NONCLUSTERED INDEX',
  'INCLUDE clause', 'Filtered index WHERE clause', 'DROP_EXISTING', 'SORT_IN_TEMPDB', 'IGNORE_DUP_KEY',
  'STATISTICS_NORECOMPUTE index option', 'STATISTICS_INCREMENTAL index option', 'ALLOW_ROW_LOCKS',
  'ALLOW_PAGE_LOCKS', 'OPTIMIZE_FOR_SEQUENTIAL_KEY', 'MAXDOP index option', 'DATA_COMPRESSION index option',
  'XML_COMPRESSION index option', 'ON PARTITIONS compression option', 'FILESTREAM_ON index option',
  'WAIT_AT_LOW_PRIORITY', 'ALTER INDEX PAUSE', 'ALTER INDEX RESUME', 'ALTER INDEX ABORT',
  'Maximum 32 rowstore key columns', 'Clustered and nonclustered key byte limits',
  'Maximum 999 nonclustered indexes per table', 'Index key type restrictions',
]);
addItems('specialized-and-filtered-indexes', [
  'CREATE JSON INDEX', 'JSON index FOR path list', 'OPTIMIZE_FOR_ARRAY_SEARCH', 'JSON index clustering-key requirement',
  'JSON index nonoverlapping path requirement', 'JSON index online and hint limitations',
  'JSON index count limits', 'CREATE VECTOR INDEX', 'VECTOR_SEARCH index integration',
  'Vector index METRIC', 'Vector index TYPE DiskANN', 'PREVIEW_FEATURES vector-index gate',
  'FILLFACTOR JSON index option', 'DROP_EXISTING JSON index option', 'ONLINE OFF JSON index option',
  'ALLOW_ROW_LOCKS JSON index option', 'ALLOW_PAGE_LOCKS JSON index option', 'MAXDOP JSON index option',
  'DATA_COMPRESSION JSON index limitation', 'JSON index supported predicate forms',
  'JSON index clustered primary-key size limits', 'Vector index latest version DML behavior',
  'Vector index iterative filtering', 'Vector index version migration', 'sys.dm_db_vector_indexes',
  'Vector index minimum 100 non-NULL rows', 'VECTOR_SEARCH TOP_N compatibility boundary',
  'FORCE_ANN_ONLY vector hint', 'ALLOW_STALE_VECTOR_INDEX', 'Vector index TRUNCATE TABLE limitation',
  'Vector index partitioning limitation', 'Vector index replication limitation',
  'Vector index DACPAC deployment limitation', 'Vector index DacFx BACPAC support boundary',
  'Vector index DML visibility after commit', 'Vector index full-replacement rebuild guidance',
  'Vector index duplicate embedding quality risk', 'Vector index MAXDOP option', 'Vector index filegroup placement',
]);
addItems('statistics-maintenance-and-design', [
  'AUTO_CREATE_STATISTICS', 'AUTO_DROP statistics option', 'FULLSCAN statistics option', 'SAMPLE statistics option',
  'RESAMPLE statistics option', 'NORECOMPUTE statistics option', 'PERSIST_SAMPLE_PERCENT',
  'INCREMENTAL statistics option', 'DBCC SHOW_STATISTICS', 'sys.stats', 'sys.stats_columns',
  'sys.dm_db_stats_properties', 'sys.dm_db_incremental_stats_properties', 'STATS_DATE',
  'UPDATE STATISTICS index and table scopes', 'Statistics persisted for readable secondaries',
  'MAXDOP statistics option', 'Filtered statistics WHERE predicate', 'UPDATE STATISTICS ON PARTITIONS',
  'UPDATE STATISTICS ALL COLUMNS INDEX scope', 'CREATE STATISTICS 64-column limit',
  'SQL Server 2025 full-text component version 2 migration', 'FULLTEXT_INDEX_VERSION configuration',
  'sys.fulltext_indexes.index_version',
]);
const recentIndexNote = 'SQL Server 2025 persists statistics for readable secondaries. Resumable rowstore index operations and OPTIMIZE_FOR_SEQUENTIAL_KEY are SQL Server 2019-era capabilities; check exact operation support and edition.';
if (!manifest.versionNotes[0].items.includes(recentIndexNote)) manifest.versionNotes[0].items.push(recentIndexNote);
const recentFullTextNote = 'SQL Server 2025 removes legacy full-text version 1 word breaker, stemmer, and filter binaries; existing version 1 indexes can fail queries/populations after upgrade and should be migrated/rebuilt to version 2. New components can tokenize differently.';
if (!manifest.versionNotes[0].items.includes(recentFullTextNote)) manifest.versionNotes[0].items.push(recentFullTextNote);
manifest.versionNotes[0].sourceUrls = [...new Set([...manifest.versionNotes[0].sourceUrls, urls.statistics, urls.createIndex, urls.breakingChanges, urls.fullTextUpgrade])];
manifest.sourceSnapshot.urls = [...new Set([...manifest.sourceSnapshot.urls, urls.createJson, urls.createVector, urls.showStats, urls.sysStats, urls.sysStatsColumns, urls.breakingChanges, urls.fullTextUpgrade])];
manifest.comparisonSources = [...new Set([...manifest.comparisonSources, urls.createJson, urls.createVector, urls.showStats, urls.sysStats, urls.sysStatsColumns, urls.breakingChanges, urls.fullTextUpgrade])];
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const d = {
  'Clustered index': 'Its leaf level is the table data, ordered by the clustered key; a table can have at most one. Select a narrow, stable, unique, preferably increasing key when it fits access and write patterns, because every nonclustered index uses the clustered key as its row locator.',
  'Nonclustered index': 'A separate B+ tree stores key values and row locators. It can support seeks, ordered access, and covering plans, but every extra index consumes pages and adds work to INSERT, UPDATE, DELETE, logging, and backups.',
  'Heap': 'A table without a clustered index stores rows in an unordered heap. Nonclustered row locators are RIDs; forwarding records can arise when an updated row no longer fits its page. A heap is not automatically wrong, but understand lookup and maintenance consequences.',
  'Index key': 'Key columns establish B+ tree ordering and search boundaries. Their order matters: equality predicates on leading keys followed by range/order predicates are common useful shapes; key width affects every level and locator usage.',
  'Included column': 'A nonkey column stored only at a nonclustered index leaf can cover projection without increasing key width or ordering. It cannot support seek/order semantics as a key can, and wide includes still cost storage and DML.',
  'Leaf level': 'The lowest B+ tree level contains the index entries; clustered leaf pages contain table rows, while nonclustered leaves contain key, locator, and optional included values. Covering data lives here.',
  'B-tree': 'The documentation term for SQL Server rowstore indexes; the engine implements a B+ tree with root/intermediate navigation and linked leaf pages. Do not apply this structure to columnstore or memory-optimized indexes.',
  'Root page': 'The top navigation page of a rowstore B+ tree. A seek starts here and descends through intermediate pages to the matching leaf range.',
  'Intermediate page': 'A nonleaf B+ tree page that maps key ranges to lower pages. More levels mean more navigation I/O, often affected by row count, key width, and page density.',
  'Leaf page': 'A lowest-level page containing rowstore index records. Clustered-index leaf records are the table rows; nonclustered leaf records carry row locators and may contain included columns.',
  'Clustered key as row locator': 'A nonclustered index on a clustered table locates rows by the clustered key. A wide clustered key is replicated into nonclustered row locators (with engine-specific uniquifier details for nonunique clustered keys), so its width multiplies storage and write costs.',
  'RID lookup': 'A lookup from a nonclustered index entry to a heap row by its row identifier. Many repeated RID lookups can be expensive; a scan or a covering index may cost less.',
  'Key lookup': 'A lookup from a nonclustered index to the clustered row by clustered key, commonly shown as Key Lookup in plans. Its repeated cost depends on qualifying row count; do not add includes without measuring lookup versus write/storage cost.',
  'Composite index key order': 'The key is lexicographically ordered by declared column sequence. Equality on the leading key(s) can narrow the range, while a predicate only on a later key often cannot seek efficiently unless other plan features apply.',
  'Ascending index key': 'ASC orders a key from low to high. A backward scan can often satisfy a fully reversed ordering, but mixed direction requirements and predicates must match the key ordering and plan needs.',
  'Descending index key': 'DESC stores that key in reverse value order. It can support query ordering such as newest-first and mixed ASC/DESC composites; it does not make a query faster by itself.',
  'Unique index': 'Enforces distinct key tuples during every write, independently of application prechecks. It can be clustered or nonclustered and may be filtered; duplicates in multirow DML cause statement failure unless IGNORE_DUP_KEY behavior applies to inserts.',
  'Unique clustered index': 'A clustered index whose key is unique and whose leaf is the table data. SQL Server can add a hidden uniquifier for duplicate keys in a nonunique clustered index; declaring a suitable unique key avoids that ambiguity and can make locators smaller.',
  'Primary-key backing index': 'A PRIMARY KEY constraint creates a unique index, clustered by default only when no clustered index already exists. Specify clustered/nonclustered deliberately because the logical key and physical row organization are separate choices.',
  'Fill factor': 'A percentage of leaf-page fullness requested at index create/rebuild, leaving room for future inserts at the cost of more pages and I/O. It is not continually maintained; Microsoft recommends 0/100 in most cases unless measured page splits justify a lower value.',
  'PAD_INDEX': 'When ON, applies the fill-factor free-space percentage to intermediate index pages as well as leaf pages. It has effect only with a nonzero FILLFACTOR and may increase tree size; tune only from evidence.',
  'Index page split': 'A full page may split to accommodate an insert or key update. Splits add logging and can lower page density; random insert keys can cause widespread splits, while monotonically increasing keys can create last-page contention.',
  'Index fragmentation': 'For rowstore, logical page order differs from physical page order. It can increase I/O for scans, but page density, access pattern, cache, and workload matter; a fragmentation percentage alone is not a maintenance decision.',
  'Index compression ROW': 'ROW compression reduces storage using variable-length representations and metadata savings. It can reduce I/O but adds CPU; evaluate real data and workload, and distinguish rowstore compression from columnstore compression.',
  'Index compression PAGE': 'PAGE compression adds prefix and dictionary compression after row compression for additional savings, often at greater CPU cost. It is supported for eligible rowstore indexes/partitions; columnstore uses its own compression modes.',
  'Online index operation': 'ONLINE reduces blocking for supported index operations but still takes brief locks at phases and consumes resources. Availability depends on operation, index type, edition, and product; it does not mean zero blocking.',
  'Resumable index operation': 'RESUMABLE allows supported online create/rebuild operations to pause and resume after interruption or a chosen duration. It requires ONLINE, retains an in-progress operation and its resource footprint, and has operation/version restrictions.',
  'Filtered index': 'A nonclustered index containing only rows matching a filter predicate. It can be smaller and cheaper to maintain for sparse states, but the query predicate must imply the filter for optimizer use and required SET options must be correct.',
  'Filtered index predicate': 'A restricted WHERE condition defining indexed rows, commonly a simple comparison or IS NULL test. SQL Server restricts expressions and columns; predicates cannot use arbitrary logic, and computed columns are not allowed as the filter column.',
  'Filtered unique index': 'Enforces uniqueness only among rows satisfying its filter, such as present optional emails. This often permits many NULL or inactive rows while preventing duplicates in the active subset; it is an index-level conditional rule.',
  'Columnstore index': 'Stores column segments and compresses rowgroups for analytic scans, aggregation, and batch processing. It is suited to scan-heavy workloads; selective point lookups and write patterns may favor rowstore or a complementary nonclustered index.',
  'Clustered columnstore index': 'The table’s primary storage is compressed columnstore segments, with deltastore/delete metadata used for rows not yet compressed or logically deleted. It supports large analytic tables and can coexist with supported nonclustered rowstore indexes.',
  'Nonclustered columnstore index': 'A columnar projection alongside a rowstore table, enabling analytics while retaining rowstore OLTP access. Choose included columns and maintenance impact carefully; SQL Server 2025 adds ordered nonclustered columnstore support.',
  'Ordered columnstore index': 'An ordered columnstore sorts data during index build around specified columns, improving segment elimination for suitable predicates. SQL Server 2025 supports ordered nonclustered columnstore; sorting/build cost and data distribution still determine benefit.',
  'Columnstore rowgroup': 'A batch of rows compressed together into one segment per column; the ideal full rowgroup is 1,048,576 rows. Small rowgroups can reduce compression and scan quality; inserts may enter delta rowgroups before compression.',
  'Delta rowgroup': 'A rowstore structure that accepts rows before they become compressed columnstore rowgroups, particularly for smaller/batched writes. The tuple-mover later compresses eligible closed rowgroups; excessive small delta groups indicate ingestion-shape issues.',
  'Columnstore segment': 'Compressed values for one column within one rowgroup. Segment min/max metadata can eliminate segments when predicates exclude their value range; ordering and data distribution influence this benefit.',
  'Columnstore dictionary': 'A compression structure mapping repeated values to compact codes, created at rowgroup/column scope when beneficial. High-cardinality or poorly ordered data can reduce dictionary effectiveness.',
  'Columnstore archival compression': 'COLUMNSTORE_ARCHIVE further compresses eligible columnstore partitions for cold data, trading additional CPU and slower access for storage savings. Do not use it on latency-sensitive hot partitions without measurement.',
  'Memory-optimized hash index': 'An in-memory hash table for memory-optimized tables, best for equality lookups on the full key. Choose BUCKET_COUNT from expected distinct keys; too few buckets create long chains and too many waste memory. It does not support range scans or ordering.',
  'Memory-optimized nonclustered index': 'A memory-optimized ordered index supports range and ordered access on memory-optimized tables. These indexes use a different structure and memory model from disk-based B+ trees; traditional fill factor and fragmentation assumptions do not apply.',
  'JSON index in SQL Server 2025': 'A native JSON index on a SQL Server 2025 json column can serve documented JSON predicates across document paths. It is GA in SQL Server 2025, requires a clustered primary key, is offline-only in this release, and has path, key-size, per-column, hint, and other limitations; textual JSON can instead use computed-column indexes.',
  'Vector index preview in SQL Server 2025': 'CREATE VECTOR INDEX provides approximate nearest-neighbor search over vector columns and is still preview on SQL Server 2025, gated by PREVIEW_FEATURES. Preview behavior and availability can change; exact search and application-level vector modeling are separate concerns.',
  'XML index': 'A primary XML index persists a shredded representation and is required before secondary PATH, VALUE, or PROPERTY indexes. It can accelerate XML methods but consumes storage and adds write work; SQL Server 2022 added XML compression support.',
  'Spatial index': 'An extended index for geometry/geography spatial columns that reduces candidate objects for supported spatial methods. Grid/tessellation and method support differ; it is not a general B+ tree and requires spatial workload testing.',
  'Full-text index': 'A token-based index maintained by the Full-Text Engine for linguistic word, phrase, inflectional, and proximity searches. It is distinct from LIKE or a B+ tree prefix search, with catalog/population/language behavior and SQL Server 2025 breaking changes to check.',
  'Indexed view index': 'The first index on a schemabound view must be a unique clustered index; subsequent nonclustered indexes are allowed. The stored result can accelerate matching queries, but base-table writes maintain it and definition/set-option restrictions are strict.',
  'Partition-aligned index': 'An index is aligned when its partition scheme and partitioning column match the base table’s scheme and column, enabling partition-level operations such as switching under compatible definitions. Alignment is a deployment/schema property, not a query-speed guarantee.',
  'Index statistics': 'Statistics summarize key distribution for the optimizer and are created for indexes. They influence cardinality estimates, not data correctness; stale or unrepresentative stats can cause poor plans even when the index structure is healthy.',
  'Histogram': 'A statistics histogram describes distribution for only the first statistics key column, with at most 200 steps. It is sampled or full-scan data and cannot represent arbitrary correlations among several columns.',
  'Density vector': 'Statistics density values summarize distinctness for key prefixes and help estimate equality combinations. They complement the first-column histogram but are not a multi-dimensional histogram or guarantee of accurate correlation estimates.',
  'Auto-created statistics': 'With AUTO_CREATE_STATISTICS ON, the optimizer can create single-column statistics for predicate columns when useful. These statistics do not automatically solve cross-column correlation and are visible through sys.stats (often with _WA names).',
  'Filtered statistics': 'Statistics created with a WHERE predicate describe a relevant subset and can improve estimates when query predicates match that subset. They are separate from an index and may be useful even without a filtered index.',
  'Statistics update threshold': 'SQL Server marks statistics stale based on modifications and table cardinality; the threshold varies by engine version and compatibility level. Do not hardcode a single “20 percent” rule for current large tables.',
  'AUTO_UPDATE_STATISTICS': 'When ON, the optimizer can refresh stale statistics before compilation/execution. Turning it off leaves stale estimates until manual maintenance and often harms plans; statistics updates can trigger recompilation.',
  'AUTO_UPDATE_STATISTICS_ASYNC': 'When ON with auto-update enabled, a query can compile using existing statistics while an asynchronous update runs, avoiding waiting for that update but allowing the first plan to use old estimates. It is a workload tradeoff, not universally faster.',
  'CREATE STATISTICS': 'Creates manual column or filtered statistics independently of an index. Choose leading columns based on predicates and use documented sampling/fullscan options; each statistics object supports up to 64 columns but only the leading column has a histogram.',
  'UPDATE STATISTICS': 'Refreshes a statistics object or table/index statistics with sampling or FULLSCAN choices. It can improve estimates but causes plan recompilation and consumes I/O/CPU; do not update everything repeatedly without evidence.',
  'sp_updatestats': 'A database-scoped stored procedure that updates statistics on user-defined and internal tables according to its modification logic. It is a broad maintenance tool, not equivalent to a targeted full scan of every object.',
  'Reorganize index': 'ALTER INDEX ... REORGANIZE incrementally defragments eligible rowstore leaf pages and is online, but does not rebuild the full tree or refresh index statistics. It may be paused/resumed only within its own execution semantics and is not a universal response to low density.',
  'Rebuild index': 'ALTER INDEX ... REBUILD recreates the index, can change fill/compression options, and refreshes that index’s statistics as a side effect. It can require substantial CPU, I/O, log, workspace, and locks; ONLINE/resumable support is conditional.',
  'ALTER INDEX REORGANIZE': 'The T-SQL maintenance operation that compacts/reorders rowstore leaf pages incrementally. It is less resource-intensive than rebuild in many cases but does not correct every issue or update statistics; columnstore reorganize has separate rowgroup merge behavior.',
  'ALTER INDEX REBUILD': 'The T-SQL operation to recreate one or all indexes. It can run ONLINE when supported, and RESUMABLE only for supported online operations; syntax/options and impact differ by index kind and edition.',
  'Index usage statistics': 'Usage counters record seeks, scans, lookups, updates, and last-use times. They reset on engine restart and omit some index types; combine them with a representative business cycle and write costs before dropping an index.',
  'sys.dm_db_index_usage_stats': 'Returns per-index user/system seeks, scans, lookups, updates, and last operation times. Counters reset on restart and are not evidence of full workload history; permissions and cloud tenant filtering apply, and memory-optimized/spatial usage is not reported here.',
  'Index operational statistics': 'Lower-level access, lock, and latch counters by partition, available through operational DMVs. They help diagnose contention or maintenance patterns but are snapshots/counters, not direct proof that a proposed index fixes a workload.',
  'sys.dm_db_index_operational_stats': 'A function returning partition-level row/page access, locking, latching, and allocation activity for indexes. Counters can reset as metadata ages/reloads; permission and version details matter, so correlate with sampling window and workload.',
  'Missing-index DMV recommendation boundary': 'Optimizer missing-index requests are transient, incomplete suggestions generated during optimization. They do not account for all existing/overlapping indexes, write costs, included-column limits, or workload priorities; consolidate and test before deployment.',
  'Index write amplification': 'Each extra index may need maintenance for a row change, adding log volume, CPU, I/O, locks/latches, and storage. An index that speeds reads can lower write throughput and increase backup/cache footprint.',
  'Over-indexing': 'Redundant, unused, or overly wide indexes duplicate storage and write work, slow schema changes, and compete for cache. Before dropping one, examine overlap, constraints, filtered predicates, rare critical queries, resets, and a complete usage period.',
  'SARGable predicate': 'A predicate is search-argument-friendly when the optimizer can use an index key to seek a bounded range. Wrapping the indexed column in a function or forcing incompatible conversions can prevent a seek; preserve semantics and verify the actual plan.',
  'Left-prefix key use': 'A composite B+ tree can efficiently seek from leading key prefixes; gaps or predicates only on later keys usually require scanning more of the index. A different index or optimizer strategy may help, but there is no rule to index every predicate column first.',
  'Covering index': 'An index covers a query when it contains all required search, join, grouping/order, and output data, so no base-row lookup is needed. Covering can reduce reads but wide indexes increase storage and DML cost.',
  'Lookup avoidance tradeoff': 'Adding INCLUDE columns can eliminate repeated key/RID lookups, but a scan may already be cheaper for many matches and wider indexes cost more on every write. Compare actual row counts, reads, CPU, and write impact.',
  'Parameter-sensitive selectivity': 'A single cached plan may be poor when parameter values select radically different row counts. Index design interacts with this, but diagnose parameter-sensitive plan behavior and Query Store/PSP features separately instead of proliferating indexes blindly.',
  'Index maintenance window': 'Plan maintenance around workload concurrency, log capacity, tempdb/workspace, replica/availability lag, edition support, and lock waits. Use measured page density and query impact, not a calendar or universal fragmentation threshold alone.',
  'CREATE INDEX': 'Creates a relational rowstore index with declared key columns, optional INCLUDE columns, an optional filter, build options, and placement. It creates an access structure; it does not force optimizer use.',
  'CREATE UNIQUE INDEX': 'Creates an index that also rejects duplicate key tuples. With IGNORE_DUP_KEY ON, duplicate rows in INSERT may be skipped with a warning; do not mistake this for upsert or general duplicate handling.',
  'CREATE CLUSTERED INDEX': 'Creates the table’s one clustered rowstore organization. Building/rebuilding it sorts and moves the table data and needs workspace; changing the clustered key can rebuild nonclustered locators.',
  'CREATE NONCLUSTERED INDEX': 'Creates a separate rowstore tree. Add ordered key columns for search/order and limited INCLUDE columns for coverage; check key byte/count limits and workload write cost.',
  'INCLUDE clause': 'Adds nonkey columns at a nonclustered leaf level. Included values do not count against index key width/column limits but increase leaf storage; some types are excluded and computed columns have eligibility rules.',
  'Filtered index WHERE clause': 'Restricts a nonclustered index to rows satisfying a supported predicate. Query implication and required SET options control optimizer eligibility; a parameterized predicate may not prove a fixed filter.',
  'DROP_EXISTING': 'Rebuilds a named existing index as part of CREATE INDEX, allowing changes to key/options without a separate drop gap. Clustered-key changes can affect row locators and alignment; do not assume every definition change is online or preserves physical placement.',
  'SORT_IN_TEMPDB': 'Uses tempdb for intermediate sort results during supported index builds. It can reduce pressure on the user database filegroup but needs tempdb space and I/O; it is not supported for resumable index operations.',
  'IGNORE_DUP_KEY': 'For a unique index, ON ignores duplicate rows in an INSERT while accepting nonduplicates and reporting a warning; duplicate rows can fail the statement when OFF. UPDATE semantics and multirow outcomes require careful application handling.',
  'STATISTICS_NORECOMPUTE index option': 'Disables automatic statistics updates for the statistics associated with an index. It can leave stale estimates; use only with a deliberate external statistics process.',
  'STATISTICS_INCREMENTAL index option': 'Creates per-partition statistics for eligible partitioned index statistics. It can allow targeted partition stats maintenance, but the statistics type and partition design must support incremental updates.',
  'ALLOW_ROW_LOCKS': 'Controls whether the engine may use row locks for the index; ON permits but does not force row locking. Turning it OFF can increase blocking or broader lock use.',
  'ALLOW_PAGE_LOCKS': 'Controls whether the engine may use page locks for the index; ON permits the optimizer/engine to choose them. Turning it OFF can affect locking and make reorganize unavailable for some cases.',
  'OPTIMIZE_FOR_SEQUENTIAL_KEY': 'SQL Server 2019+ option that helps reduce last-page insert contention for sequential-key workloads. It does not remove all contention and may not help random or read-heavy patterns.',
  'MAXDOP index option': 'Caps or delegates parallelism for an index operation, subject to configuration, workload, and edition. A lower value can reduce contention but lengthen the build; 0 uses configured limits, not literally unlimited parallelism.',
  'DATA_COMPRESSION index option': 'Can select NONE, ROW, PAGE, COLUMNSTORE, or COLUMNSTORE_ARCHIVE where supported by the index type and version. ROW/PAGE apply to rowstore; columnstore modes apply to columnstore and archive trades access CPU for storage.',
  'XML_COMPRESSION index option': 'SQL Server 2022+ option for eligible indexes containing XML data, compressing XML binary large object storage. It has CPU/storage tradeoffs and can be set at partition scope.',
  'ON PARTITIONS compression option': 'Scopes DATA_COMPRESSION or XML_COMPRESSION choices to selected partitions of a partitioned index. It is invalid for a nonpartitioned index and can leave partitions with different compression states.',
  'FILESTREAM_ON index option': 'Places FILESTREAM data for an applicable clustered index operation on a filegroup or partition scheme. It is not a general location option for every index or platform.',
  'WAIT_AT_LOW_PRIORITY': 'Controls how an online index operation waits for a schema-modification lock, including duration and blocker-handling choices. Low priority reduces blocking risk but can still time out, self-abort, or terminate blockers depending on settings.',
  'ALTER INDEX PAUSE': 'Pauses a supported resumable index operation. The in-progress structure and resources remain, and writes/DDL can have restrictions while it is paused.',
  'ALTER INDEX RESUME': 'Continues a paused supported resumable index operation. Resume options and original definition constraints apply; inspect current operation metadata first.',
  'ALTER INDEX ABORT': 'Cancels a supported resumable index operation and discards its in-progress work; an aborted operation cannot be resumed.',
  'Maximum 32 rowstore key columns': 'A relational index key can contain at most 32 columns. Key column count differs from INCLUDE column count; avoid solving a wide projection by moving every output into the key.',
  'Clustered and nonclustered key byte limits': 'Current SQL Server allows up to 900 bytes for clustered keys and 1,700 for nonclustered keys, subject to data types and actual value widths. Earlier versions had different limits; oversized existing varchar values can make later writes fail.',
  'Maximum 999 nonclustered indexes per table': 'SQL Server supports up to 999 nonclustered indexes per table (including PK/UNIQUE backing indexes, excluding XML indexes). This is a platform ceiling, not a sensible design target.',
  'Index key type restrictions': 'Some large-object types cannot be index key columns, though certain types can be included. Data-type, computed-column, and version rules vary by index type; check the operation-specific CREATE INDEX documentation.',
  'CREATE JSON INDEX': 'Creates a native JSON path index for a json column in SQL Server 2025 and supported Azure/Fabric platforms. It is distinct from computed-column B+ tree indexes over textual JSON.',
  'JSON index FOR path list': 'The optional FOR clause limits indexing to SQL/JSON paths. Paths can include up to 128 levels and must not overlap; changing paths requires recreating the index.',
  'OPTIMIZE_FOR_ARRAY_SEARCH': 'CREATE JSON INDEX option that enables optimizations for array searches. It defaults OFF; enable only for matching JSON array workloads and validate supported predicates.',
  'JSON index clustering-key requirement': 'A table needs a clustering key before a JSON index can be created; documented limits apply to clustered-key column count and size. This is a creation prerequisite, not a requirement that the JSON property be part of that key.',
  'JSON index nonoverlapping path requirement': 'A JSON index path list cannot contain overlapping paths such as `$.a` and `$.a.b`, because the broader path recursively covers the child. The statement rejects overlapping definitions.',
  'JSON index online and hint limitations': 'SQL Server 2025 JSON index create/alter is offline, can take Sch-M and block table users, and JSON indexes are not supported in index hints. Plan the maintenance window and query normally so the optimizer can select it.',
  'JSON index count limits': 'SQL Server supports up to 249 JSON indexes per table but at most one JSON index per json column. A JSON index cannot target computed json columns or json columns in views/table variables/memory-optimized tables.',
  'FILLFACTOR JSON index option': 'Sets desired leaf-page fullness for JSON index create/rebuild; the setting is not continuously maintained. Values 0 and 100 both fill pages to capacity; lower values cost storage and reads.',
  'DROP_EXISTING JSON index option': 'Rebuilds the same named existing JSON index with a changed definition/options. It does not change index type and defaults OFF.',
  'ONLINE OFF JSON index option': 'The documented SQL Server 2025 JSON index operation is offline; ONLINE = ON raises an error and Sch-M blocks all user access to the table during create/rebuild/drop.',
  'ALLOW_ROW_LOCKS JSON index option': 'Controls whether row locks are permitted for JSON index access; ON is the default and lets the engine choose. OFF prohibits row locks.',
  'ALLOW_PAGE_LOCKS JSON index option': 'Controls whether page locks are permitted for JSON index access; ON is the default. Turning it OFF changes lock choices and can affect operations.',
  'MAXDOP JSON index option': 'The CREATE JSON INDEX syntax accepts MAXDOP, but current SQL Server documentation states the operation always uses one processor even when another value is specified.',
  'DATA_COMPRESSION JSON index limitation': 'The CREATE JSON INDEX syntax lists DATA_COMPRESSION, but its limitations section currently says data compression is unsupported. Treat this as a documentation conflict and do not rely on compression until the target build documentation resolves it.',
  'JSON index supported predicate forms': 'The documented optimizer support includes JSON_PATH_EXISTS equality and JSON_VALUE equality; JSON_CONTAINS can use the index. Current docs mark JSON_VALUE LIKE and IS [NOT] NULL forms unsupported, so keep predicates within the listed forms.',
  'JSON index clustered primary-key size limits': 'The table must have a clustered primary key. Its key is limited to 31 columns and under 128 bytes for JSON-index eligibility; this is stricter than ordinary rowstore key limits.',
  'Vector index latest version DML behavior': 'The latest vector-index format (version 3 in current docs) supports INSERT, UPDATE, DELETE, and MERGE with automatic maintenance; earlier formats make the table read-only unless ALLOW_STALE_VECTOR_INDEX is enabled.',
  'Vector index iterative filtering': 'Version 3 applies supported WHERE predicates during vector search rather than only after candidate retrieval. The optimizer can use vector and traditional B-tree indexes together; filter selectivity affects recall and plan choice.',
  'Vector index version migration': 'Earlier vector index formats cannot be upgraded in place. Inspect sys.vector_indexes build_parameters version, then schedule DROP and recreate; search is unavailable between those steps and V3 changes TOP_N/query syntax.',
  'sys.dm_db_vector_indexes': 'A dynamic management view for vector index health and background maintenance status. Use it with sys.vector_indexes/build metadata to verify the actual index exists and is current after deployment.',
  'Vector index minimum 100 non-NULL rows': 'Current SQL Server vector indexes require at least 100 rows containing non-NULL vectors at create time. VECTOR_SEARCH can still run without an index using brute force, which may be too slow at larger scale.',
  'VECTOR_SEARCH TOP_N compatibility boundary': 'Latest version 3 vector indexes do not support explicit TOP_N in VECTOR_SEARCH; use SELECT TOP (N) WITH APPROXIMATE. Older index versions documented TOP_N tuning for post-filtering, so version and syntax must be considered together.',
  'FORCE_ANN_ONLY vector hint': 'A table hint that forces approximate-nearest-neighbor index use instead of allowing the optimizer to choose ANN versus exact kNN. It can constrain plan choice and should be justified by measured latency/recall requirements.',
  'ALLOW_STALE_VECTOR_INDEX': 'A database-scoped compatibility setting that can permit DML against older read-only vector-index formats while allowing stale search results. Latest V3 indexes support normal DML without this compromise.',
  'Vector index TRUNCATE TABLE limitation': 'Current SQL Server vector indexes prevent TRUNCATE TABLE. Drop the vector index first, truncate and reload at least 100 non-NULL vectors, then recreate and verify the index.',
  'Vector index partitioning limitation': 'The current SQL Server vector-index preview cannot be partitioned. Do not assume rowstore partition-alignment strategies apply.',
  'Vector index replication limitation': 'Vector indexes are not replicated to subscribers in the current documented SQL Server preview. Plan replica search behavior and index creation independently.',
  'Vector index DACPAC deployment limitation': 'Current SQL Server vector indexes cannot be deployed with a DACPAC. A schema-only publish can succeed while silently skipping index creation when fewer than 100 non-NULL vectors exist; explicitly verify sys.vector_indexes and create after loading data.',
  'Vector index DacFx BACPAC support boundary': 'BACPAC deployment supports vector indexes starting with DacFx 170.5.96, creating them after table data is loaded. Older DacFx workflows need explicit drop/export/import/recreate handling.',
  'Vector index DML visibility after commit': 'With the latest vector index format, INSERT, UPDATE, DELETE, and MERGE maintain the index automatically; committed changes are visible to later vector searches without a rebuild.',
  'Vector index full-replacement rebuild guidance': 'For near-total replacement of embeddings, such as a new embedding model, search remains valid but recall/ranking quality can degrade because the ANN structure reflects the old distribution. Rebuild after bulk replacement.',
  'Vector index duplicate embedding quality risk': 'A high proportion of duplicate vectors can crowd nearest-neighbor results with repeats, reducing useful diversity while consuming index resources. Deduplicate or assess the data before indexing.',
  'Vector index MAXDOP option': 'CREATE VECTOR INDEX accepts MAXDOP to cap parallel build work; 0 follows configured limits and system workload, while edition support constrains parallel operations.',
  'Vector index filegroup placement': 'CREATE VECTOR INDEX can place its index on a filegroup or the default filegroup. Plan capacity, backup, and I/O placement with the base table and workload.',
  'CREATE VECTOR INDEX': 'Creates an approximate vector-neighbor index on a base-table vector column. In SQL Server 2025 the feature is preview; exact syntax/options and limitations can change.',
  'VECTOR_SEARCH index integration': 'VECTOR_SEARCH can use an approximate vector index or an exact k-nearest-neighbor strategy selected by the optimizer, with filtering interactions and hints documented per release. Indexing does not guarantee recall/ranking quality for a particular data distribution.',
  'Vector index METRIC': 'SQL Server 2025 vector indexes document cosine, euclidean, and negative dot-product metrics. The index metric and query metric must match intended distance semantics; vector normalization affects interpretation.',
  'Vector index TYPE DiskANN': 'DiskANN is the currently documented approximate-nearest-neighbor index algorithm and the default TYPE. Do not infer other supported algorithms from general ANN literature.',
  'PREVIEW_FEATURES vector-index gate': 'On SQL Server 2025 and SQL Server 2025 update-policy Managed Instance, vector index and VECTOR_SEARCH require the PREVIEW_FEATURES database-scoped configuration. Current Always-up-to-date cloud offerings can be GA, so verify target service status.',
  'AUTO_CREATE_STATISTICS': 'Database option that lets the optimizer create single-column predicate statistics as needed. It does not create filtered statistics or multi-column correlation histograms.',
  'AUTO_DROP statistics option': 'Statistics option that permits SQL Server to drop manually created statistics when they block schema changes. SQL Server 2022 enables auto-drop by default for new/migrated databases; inspect exact object settings before relying on it.',
  'FULLSCAN statistics option': 'Reads all rows for statistics rather than a sample, potentially improving distribution fidelity at greater I/O/CPU cost. It still produces the same histogram shape limits.',
  'SAMPLE statistics option': 'Builds statistics from a sampled percentage/row count. It is cheaper than full scan but may miss skew or rare values; use repeatable evidence to choose sampling.',
  'RESAMPLE statistics option': 'Reuses the last sampling rate when refreshing statistics. It may preserve a low-quality sample; verify prior sampling before assuming it means full scan.',
  'NORECOMPUTE statistics option': 'Prevents automatic update for a statistics object. Stale statistics can harm plans; only disable with explicit monitoring and scheduled refresh.',
  'PERSIST_SAMPLE_PERCENT': 'Persists a selected statistics sample percentage for later updates that omit a sampling clause, supported from SQL Server 2016 SP1 CU4 and later applicable products. It can be changed or reset with statistics DDL.',
  'INCREMENTAL statistics option': 'Stores per-partition stats for supported partitioned objects, enabling targeted incremental updates. Some statistics operations/features are incompatible; check ALTER/UPDATE STATISTICS syntax.',
  'DBCC SHOW_STATISTICS': 'Displays header, density vector, and histogram information for a statistics object. The SHOW_STATISTICS permission requirement and output reflect a sampled/dated snapshot, not the optimizer’s entire estimation model.',
  'sys.stats': 'Catalog view with one row per statistics object, including index and column statistics. Join with sys.stats_columns and object metadata to map keys; permissions limit visible metadata.',
  'sys.stats_columns': 'Maps statistics objects to their ordered columns, allowing you to see which is the histogram-leading column and the statistic key sequence.',
  'sys.dm_db_stats_properties': 'Returns last update, row count, sample size, modification counter, and related properties for one statistics object in the current database. It is point-in-time evidence, not an automatic rule for update.',
  'sys.dm_db_incremental_stats_properties': 'Returns per-partition properties for incremental statistics. Use it to target affected partitions while respecting incremental-statistics eligibility and partition lifecycle.',
  'STATS_DATE': 'Returns the date the specified statistics object was last updated, or NULL where metadata is absent/not visible. Pair it with modification counts and distribution evidence; age alone is not proof of staleness.',
  'UPDATE STATISTICS index and table scopes': 'UPDATE STATISTICS can refresh a named statistics object, all stats on an index, or table statistics using documented syntax. Scope and sampling clauses affect cost and plan recompilation.',
  'Statistics persisted for readable secondaries': 'SQL Server 2025 can persist statistics created/updated on readable secondary replicas so read workloads can retain their stats. This is a release-specific behavior; follow the feature documentation for replica role and permissions.',
  'MAXDOP statistics option': 'Limits parallelism for supported CREATE/UPDATE STATISTICS operations, subject to workload-group and engine limits. It may reduce contention while increasing completion time.',
  'Filtered statistics WHERE predicate': 'Creates statistics for rows satisfying a restricted simple predicate. It can describe a subset without creating an index, but the query needs compatible predicates for useful estimates.',
  'UPDATE STATISTICS ON PARTITIONS': 'For incremental statistics, RESAMPLE can target partition numbers/ranges with ON PARTITIONS. This is not valid for every statistics object; require eligible partitioned statistics.',
  'UPDATE STATISTICS ALL COLUMNS INDEX scope': 'The ALL, COLUMNS, and INDEX scopes select classes of statistics on the table. Use the named-statistics form for targeted work and avoid assuming ALL means every sampling strategy is optimal.',
  'CREATE STATISTICS 64-column limit': 'A statistics object can list up to 64 columns. The column order is meaningful: only the first column receives a histogram, while all key prefixes contribute density information.',
  'SQL Server 2025 full-text component version 2 migration': 'SQL Server 2025 removes version 1 word-breaker, stemmer, and filter binaries from the installation. Migrate/rebuild indexes to version 2; new tokenization can change search matches, so test application search behavior as well as successful population.',
  'FULLTEXT_INDEX_VERSION configuration': 'Database-scoped configuration controlling the full-text component version used for index creation/rebuild. SQL Server 2025 defaults new indexes to version 2; retaining version 1 requires legacy binaries and is a compatibility workaround, not the forward path.',
  'sys.fulltext_indexes.index_version': 'The catalog column identifies whether a full-text index uses version 1 or 2 components. After an in-place SQL Server 2025 upgrade, inventory version 1 indexes and plan migration because searches/populations can fail when legacy binaries are absent.',
};

const cite = name => {
  if (/Columnstore|rowgroup|Delta rowgroup|segment|dictionary|archival/i.test(name)) return /design|Ordered/i.test(name) ? urls.columnstoreDesign : urls.columnstore;
  if (/OPTIMIZE_FOR_ARRAY_SEARCH/.test(name)) return urls.createJson;
  if (/JSON index in SQL Server 2025/.test(name)) return urls.json;
  if (/JSON/i.test(name)) return urls.createJson;
  if (/Vector/i.test(name)) return urls.vector;
  if (/Memory-optimized/i.test(name)) return urls.memory;
  if (/XML/i.test(name)) return urls.xml;
  if (/Spatial/i.test(name)) return urls.spatial;
  if (/FULLTEXT_INDEX_VERSION|full-text component version|sys\.fulltext_indexes/.test(name)) return urls.fullTextUpgrade;
  if (/Full-text/i.test(name)) return urls.fullText;
  if (/Indexed view/i.test(name)) return urls.indexedView;
  if (/sys\.stats_columns/.test(name)) return urls.sysStatsColumns;
  if (/sys\.stats$|AUTO_DROP/.test(name)) return urls.sysStats;
  if (/DBCC SHOW_STATISTICS/.test(name)) return urls.showStats;
  if (/Statistics persisted for readable secondaries/.test(name)) return urls.newSql;
  if (/statistics|Histogram|Density|AUTO_|CREATE STATISTICS|UPDATE STATISTICS|sp_updatestats|threshold|Filtered statistics/i.test(name)) return /CREATE STATISTICS/.test(name) ? urls.createStatistics : /UPDATE STATISTICS|sp_updatestats/.test(name) ? urls.updateStatistics : urls.statistics;
  if (/sys\.dm_db_stats_properties/.test(name)) return urls.statsProperties;
  if (/sys\.dm_db_index_usage_stats/.test(name)) return urls.usageStats;
  if (/sys\.dm_db_index_operational_stats|Operational statistics/.test(name)) return urls.operationalStats;
  if (/REORGANIZE|Reorganize|REBUILD|Rebuild/i.test(name)) return /Reorganiz|REORGANIZE/.test(name) ? urls.maintenance : urls.alterIndex;
  if (/Filtered/i.test(name)) return urls.filtered;
  if (/Online|Resumable|WAIT_AT_LOW_PRIORITY|ALTER INDEX PAUSE|ALTER INDEX RESUME|ALTER INDEX ABORT/i.test(name)) return urls.online;
  if (/CREATE .*INDEX|INCLUDE|DROP_EXISTING|SORT_IN_TEMPDB|IGNORE_DUP_KEY|ALLOW_ROW_LOCKS|ALLOW_PAGE_LOCKS|OPTIMIZE_FOR_SEQUENTIAL_KEY|MAXDOP|DATA_COMPRESSION|XML_COMPRESSION|PARTITIONS|FILESTREAM_ON|key columns|key byte limits|nonclustered indexes per table|key type restrictions|Fill factor|PAD_INDEX|compression|page split|fragmentation/i.test(name)) return urls.createIndex;
  if (/RID lookup|Key lookup|row locator|leaf|Root|Intermediate|B-tree|Heap|Clustered|Nonclustered|Index key|Included|Ascending|Descending|Composite|Unique|Primary-key|Partition-aligned/i.test(name)) return /Included/.test(name) ? urls.included : urls.clustered;
  return urls.architecture;
};
const allItems = manifest.inventory.flatMap(g => g.items);
const unknown = allItems.filter(item => !d[item]);
if (unknown.length) throw new Error(`Missing scoped explanations: ${unknown.join(', ')}`);
const sourceList = [...new Set(Object.values(urls))].map(url => `- ${url}`).join('\n');
await fs.mkdir('course/drafts/t03-008', { recursive: true });
const write = async (id, text) => fs.writeFile(`course/drafts/t03-008/t03-008-${id}.md`, text.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
const title = manifest.title;

await write('overview', `# ${title} — Big-picture orientation and mental model

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

Suppose an orders screen filters \`Status = 'Open'\`, sorts by \`CreatedAt DESC\`, returns \`OrderId\`, \`CustomerId\`, and \`Total\`, and the open rows are a small fraction of the table. Compare a full nonclustered index on \`(Status, CreatedAt DESC)\` with a filtered index for open rows. Add \`CustomerId\` and \`Total\` as included columns only if lookup avoidance is measured to matter. Check that the query predicate implies the filter and that filtered-index SET options are correct. Compare the actual plan, logical reads, write rate, index size, and statistics before and after; do not infer success from the index existing.

# Version and platform boundaries

SQL Server 2025 supports ordered nonclustered columnstore indexes and generally available native JSON indexes. Vector index and VECTOR_SEARCH remain preview in SQL Server 2025 and require PREVIEW_FEATURES; cloud services have distinct availability. SQL Server 2025 also replaces legacy full-text components: version 1 indexes can fail queries/populations after in-place upgrade, so inventory and migrate to version 2 while testing tokenization changes. Resumable and online support depends on index operation, type, version, and edition. [SQL Server 2025 changes](${urls.newSql}) · [JSON index](${urls.jsonIndex}) · [vector index](${urls.vector}) · [full-text migration](${urls.fullTextUpgrade}) · [online operations](${urls.online}).

# When to use it and tradeoffs

Use a few purpose-built rowstore indexes for selective operational queries, columnstore for scan-heavy analytics, and a specialized structure only when its operators and data representation fit. Avoid indexes that duplicate an existing left prefix without a measured reason. Query plans, statistics quality, write volume, page density, and full-cycle usage data guide decisions; no fixed fragmentation percentage or missing-index message can replace workload evidence.

# What later lessons cover

Query-plan operators and tuning, transaction locking, Query Store, JSON querying, and vector search are taught in their own topics. This lesson focuses on the index and statistics contract and their direct design choices.

# Sources

Primary material: [index design guide](${urls.architecture}), [CREATE INDEX](${urls.createIndex}), [statistics](${urls.statistics}), and [index maintenance](${urls.maintenance}).

${sourceList}
`);

await write('concepts', `# ${title} — Core concepts and how they fit together

# Learning objectives

Explain clustered/nonclustered/heap row locators; design composite key order and included columns from query shape; distinguish seek, scan, and lookup tradeoffs; recognize specialized index families; interpret statistics and their limits; select maintenance from measured evidence; and identify current SQL Server 2025 GA/preview boundaries.

# Prerequisites

Know tables, keys, SELECT predicates, joins, ordering, DML, and basic execution plans. This topic does not teach every plan operator or locking mode.

# Core concepts

Rowstore B+ trees sort key entries into root, intermediate, and leaf levels. A clustered index uses its leaf level as the table; a heap has no clustered order. A nonclustered index points to a heap row by RID or to a clustered row by clustered key. That locator is why a wide clustered key enlarges every nonclustered index.

For a composite key \`(A, B, C)\`, the tree orders by A, then B within each A, then C within each pair. Predicates on left prefixes are generally easiest to seek. Equality keys usually precede a range or ordering key, but actual selectivity, parameter distribution, joins, and sort direction matter. Included columns reside at leaf level for coverage; they do not extend seek ordering. A covering index trades lookup reads for wider pages and more write work.

The optimizer can seek, scan an index, scan a table, or combine paths. If many rows qualify, lookups can cost more than scanning. SARGable predicates expose usable key ranges; functions/conversions on a column often prevent that, but rewrite only if semantics remain identical. Index hints and forced plans can hide a bad design rather than solve it.

Statistics are a separate but related input. An index has key statistics; AUTO_CREATE_STATISTICS can add single-column stats. A histogram (up to 200 steps) covers only the first key column; density vectors help with key-prefix distinctness but do not encode full correlations. Filtered statistics describe subsets. Auto-update helps keep estimates current, while asynchronous update can let one compile use older stats. Manual updates and rebuilds can cause recompilation and resource work.

# Mechanisms and relationships

Use \`sys.dm_db_index_usage_stats\` to ask which seeks/scans/lookups/updates occurred during its current counter lifetime, not to prove permanent nonuse. It resets at engine restart and omits spatial and memory-optimized usage. \`sys.dm_db_index_operational_stats\` gives lower-level access/lock/latch data. Both need a time window that represents seasonal, reporting, and rarely run critical work.

REORGANIZE incrementally works on leaf pages and does not update statistics. REBUILD recreates an index and refreshes its index stats as a side effect; it can consume workspace, I/O, CPU, log, and locks. Rowstore page density may matter more than fragmentation. Use targeted stats updates when evidence points to estimate quality, not as a ritual after every reorganize.

Specialized indexes solve different access problems: columnstore compresses column segments and supports analytics; memory-optimized hash and ordered indexes have distinct equality/range needs; XML, spatial, full-text, JSON, and vector features each expose domain-specific search behavior and limitations. Their costs and support boundaries cannot be inferred from a normal rowstore B+ tree.

# Worked examples

\`\`\`sql
CREATE INDEX IX_Order_Open_Created
ON dbo.Orders (CreatedAt DESC)
INCLUDE (OrderId, CustomerId, Total)
WHERE Status = 'Open';
\`\`\`

This filtered index deliberately omits Status from its key because all indexed rows satisfy the fixed predicate. It can help only when the query implies that filter and compatible SET options are used. The index's filtered statistics describe the included population. Validate actual plans and DML cost; a parameterized or differently expressed predicate may not prove the filter to the optimizer.

For a general query such as \`WHERE CustomerId=@id AND CreatedAt >= @start ORDER BY CreatedAt\`, a candidate key \`(CustomerId, CreatedAt)\` matches equality then range/order, while projected columns might be included. Test skewed customers as well as typical ones; one plan may not fit every selectivity.

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

See the [index architecture/design guide](${urls.architecture}), [CREATE INDEX reference](${urls.createIndex}), [statistics guide](${urls.statistics}), and [maintenance guide](${urls.maintenance}).

${sourceList}
`);

for (const group of manifest.inventory) {
  const rows = group.items.map(item => `| \`${item.replaceAll('|', '\\|')}\` | ${d[item]} ([source](${cite(item)})) |`).join('\n');
  await write(`reference-${group.id}`, `# ${title} — Reference: ${group.title}

# Scope and version

Targets SQL Server 2025 (17.x) Database Engine rowstore/index/statistics semantics. Cloud platforms, editions, and specialized index availability can differ. Vector indexes are preview in SQL Server 2025; JSON indexes and ordered nonclustered columnstore indexes are current GA capabilities. See the cited version sources.

# How this group fits the mental model

This is one bounded slice of the full index lifecycle: the exact supplied names are explained below, then connected back to query workload, optimizer estimates, and write cost.

# Supplied names explained

| Exact inventory item | Meaning, behavior, and important edge |
| --- | --- |
${rows}

# Cross-item comparison

${group.id === 'rowstore-index-structures' ? 'Clustered versus nonclustered is about where table rows live; heap versus clustered is the table storage choice. Key columns establish order, included columns provide leaf coverage, and RID/key lookups fetch base rows. A seek, scan, or lookup must be judged by qualifying row count and actual cost.' : group.id === 'specialized-and-filtered-indexes' ? 'A filtered rowstore index narrows a row subset; columnstore changes storage to column segments; memory-optimized indexes target in-memory table access. XML, spatial, and full-text indexes have separate query languages/operators. JSON is GA in SQL Server 2025; vector index remains preview.' : 'Statistics estimate data shape; usage DMVs measure a limited counter interval; operational statistics expose lower-level activity. Reorganize and rebuild alter physical structure differently, while query shape and write amplification determine whether a new index is worthwhile.'}

# Examples

Use the examples in the overview and concepts with your own representative query and data distribution. A DDL statement creating an index proves only that the structure exists; compare actual row counts, reads, writes, and plan alternatives before retaining it.

# Common mistakes

- Adding every suggested missing index independently.
- Treating key order as irrelevant or placing all columns in INCLUDE.
- Dropping an index because counters are zero shortly after restart.
- Rebuilding every index on an arbitrary schedule.
- Assuming online means no locks or resource impact.
- Applying rowstore fragmentation advice to columnstore or memory-optimized indexes.
- Treating SQL Server 2025 vector preview as a stable cross-platform feature.

# Knowledge checks with answers

1. **What is the first experiment before adding a key?** Measure representative query shape, selectivity, reads, writes, and actual estimates.
2. **How do you distinguish rowstore from columnstore?** Rowstore B+ tree entries are row-oriented; columnstore stores compressed per-column segments grouped into rowgroups.
3. **What does a filtered index save?** It can avoid storing rows outside its predicate, reducing size and maintenance if queries imply the filter.
4. **What does rebuild do to index stats?** Recreating the index refreshes its statistics as a side effect.
5. **What does the usage DMV miss?** Full lifetime history and some specialized index types, including spatial and memory-optimized usage.

# Sources

${sourceList}
`);
}

const practice = `# ${title} — Exercises and worked solutions

# Goals

Turn a measured workload into a candidate index design, explain its access path, and account for estimate, storage, write, maintenance, and version risks.

# Worked example

Given a frequent query filtering a selective status, ranging by date, and returning a few columns, write down predicate, join, order, and projection requirements first. Test a narrow key for equality/range/order, add only necessary included columns, and compare a filtered subset if the predicate is stable. Record logical reads, CPU, elapsed time, actual versus estimated rows, write throughput, and index size before and after.

# Exercises

1. A heap has a nonclustered index on Email and a query needs Address. Explain the locator/lookup and two alternatives.
2. A query filters TenantId, then a date range, and sorts newest first. Propose a key order and discuss DESC.
3. An index \`(A,B,C)\` is proposed for queries filtering only B. Explain why it may not seek efficiently and what evidence would choose another design.
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
2. A candidate \`(TenantId, OrderDate DESC)\` places equality before range/order. Test the desired ordering and whether an index scan in reverse suffices; include projections selectively.
3. B is not a leading prefix, so the structure may scan broadly rather than seek to a narrow B range. Compare a B-leading index, workload overlap, write cost, and actual plan/reads.
4. A filtered index can be smaller and maintain only active rows if the query predicate implies the filter. Required SET options apply to create, modification, and optimizer use; parameterization/expression shape can prevent proof of implication.
5. Columnstore is usually a stronger scan/aggregation candidate because it stores compressed segments by column and can use batch processing. Rowstore may remain better for highly selective point access or frequent row updates; benchmark mixed workloads.
6. Usage counters reset on restart and omit some index types. Observe full application/reporting cycles, consider constraint dependencies and rare critical operations, and compare writes/overlap before removal.
7. Check stale/misleading statistics, skew, correlations, parameter-sensitive plans, predicate conversions, and actual versus estimated cardinality. Reorganize does not refresh stats; targeted UPDATE STATISTICS or rebuild may affect them but consumes resources.
8. SQL Server 2025 native JSON index is GA, while vector index/VECTOR_SEARCH remain preview on SQL Server and require PREVIEW_FEATURES. New vector indexes use format version 3, which supports DML and iterative filtering; older formats need drop/recreate to migrate and lose indexed approximate search during the gap. Verify target update policy, SKU, supported predicates/options, vector type/index settings, deployment and rollback before adopting preview capabilities.
9. Group query shapes and existing key prefixes; compare exact key order, filters, includes, uniqueness, constraints, read/write frequency, plans, and storage. Test one consolidated candidate in a representative environment, then monitor; don't blindly merge indexes whose predicates or uniqueness differ.
10. High fragmentation alone does not require rebuild. Page density, range-scan I/O, workload latency, storage, cache, logging, maintenance window, and measured before/after result decide; seek-heavy access may be insensitive to physical page order.
11. Inventory \`sys.fulltext_indexes.index_version = 1\`; SQL Server 2025 removes version 1 binaries so queries/populations can fail. Verify \`FULLTEXT_INDEX_VERSION = 2\`, rebuild catalogs or drop/recreate indexes in a controlled order, monitor population, and regression-test changed tokenization/search results ([migration guidance](${urls.fullTextUpgrade})).

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

Check relevant official references: [CREATE INDEX](${urls.createIndex}), [filtered indexes](${urls.filtered}), [online operations](${urls.online}), [statistics](${urls.statistics}), and [SQL Server 2025 vector index status](${urls.vector}).

${sourceList}
`;
await write('practice', practice);

const interview = `# ${title} — Interview questions and reasoning

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
14. Version 3 is the latest structure used by newly created indexes. It adds DML maintenance, iterative filtering, and optimizer choice between approximate search and kNN. Older formats require drop and recreate; inspect \`sys.vector_indexes.build_parameters\`, plan for the interval without approximate-index search, and change queries from old \`VECTOR_SEARCH TOP_N\` usage to \`SELECT TOP (N) WITH APPROXIMATE\` where applicable. Also plan the 100-row non-NULL minimum, DACPAC omission/verification, unsupported partitioning and replication, and rebuild after bulk embedding replacement.

# Deep follow-up answers

For a composite \`(TenantId, CreatedAt)\` index, equality on TenantId can narrow to one tenant before a date range. Putting a projection-only column in INCLUDE can cover output but does not make it searchable or ordered. A narrow design that supports the query may still lose when the parameter selects most rows; compare plan estimates and actual row counts across skew.

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

# Self-check rubric

Score 0–2 for storage/locator mental model; composite ordering and coverage; seek/scan/lookup costs; statistics and histogram limits; specialized workload/version fit; write amplification; maintenance/locking; and evidence quality. A strong answer ties every recommendation to a representative workload and testable observation.

# Sources

Key references: [CREATE INDEX](${urls.createIndex}), [index maintenance](${urls.maintenance}), [statistics](${urls.statistics}), and [SQL Server 2025 vector index status](${urls.vector}).

${sourceList}
`;
await write('interview', interview);

console.log(`Wrote ${manifest.inventory.length} exact-inventory references covering ${allItems.length} index/statistics items plus overview, concepts, practice, and interview.`);
