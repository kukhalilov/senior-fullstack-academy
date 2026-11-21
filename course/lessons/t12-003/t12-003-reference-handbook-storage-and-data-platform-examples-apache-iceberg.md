# data systems storage engines analytics streams and search — Reference: Apache Iceberg

Sources: [Iceberg documentation, Java 1.12.0](https://iceberg.apache.org/docs/latest/), [table-format specification](https://iceberg.apache.org/spec/), [schema and partition evolution](https://iceberg.apache.org/docs/latest/evolution/), [branching and tagging](https://iceberg.apache.org/docs/latest/branching/), [reliability and concurrent writes](https://iceberg.apache.org/docs/latest/reliability/), [table maintenance](https://iceberg.apache.org/docs/latest/maintenance/), and [release notes](https://iceberg.apache.org/releases/).

## Scope and version

As of November 20, 2026, the Java documentation identifies Apache Iceberg 1.12.0 as latest. Iceberg is a table format and specification, not a query engine or object store. The exact features a workload can use depend on both the table's format version and the catalog, writer, and reader implementations. The specification lists format versions 1, 2, and 3 as complete; version 4 remains under development. Iceberg 1.12.0 highlights include improved Variant support and geospatial types, but engine support must be checked per feature and version.

## How this group fits the mental model

An object store holds immutable data files. Without table metadata, a reader would have to guess which files are current and how columns map to bytes. Iceberg adds a transactional metadata layer: a catalog locates the current table metadata; metadata points to a snapshot; a snapshot points to manifests; manifests describe data and delete files. Readers plan from a consistent snapshot instead of listing a directory and treating every file as current.

The physical files are commonly Parquet, Avro, or ORC. Iceberg does not require one of those formats or one execution engine. Spark, Flink, Trino, and other engines can use the table through compatible catalog and format implementations. “Open format” does not mean every engine implements every feature identically.

## Supplied names explained

- `Apache Iceberg` is an open table format/specification that manages snapshots and metadata over analytic data files; it is not the object store or execution engine.

## What a write does

1. A writer creates data/delete files for the intended change.
2. It creates metadata that describes the new table state and attempts to commit it through the catalog's concurrency mechanism.
3. A successful commit makes one new snapshot current. Readers that already planned against the previous snapshot can continue to read that consistent state; later readers see the new one.
4. If another writer changes the table first, the optimistic commit can conflict. The writer must re-plan/rebase or fail according to its operation and engine. Retry is safe only when the operation can be reconstructed against the latest state.

This provides atomic table-state changes, not a distributed transaction spanning the table and an unrelated database, queue, or external side effect. File creation before commit can leave unreferenced files, which maintenance later identifies and removes according to retention rules.

## Snapshots, time travel, branches, and tags

- A **snapshot** is a committed table state. Time travel selects an older snapshot for reproducible queries or audits while the required metadata and files remain retained.
- **Branches** let a writer or workflow evolve a named line of table history; a branch can support isolated writes and validation before promotion. They are metadata references, not a second copy of every data file.
- **Tags** are named references to a specific historical snapshot, useful for stable checkpoints or releases.
- Expiring snapshots can remove history from reachability. Retention is a correctness and recovery policy: a reader or long-running job that still needs an expired snapshot can fail, and deleting files still referenced by a live branch/tag is unsafe.

## Schema evolution and column identity

Iceberg tracks fields with stable IDs rather than relying only on field names or ordinal positions. This is why compatible add, drop, rename, reorder, and supported type widening can be metadata changes without rewriting every existing data file. A newly added column does not accidentally read old bytes belonging to a different column. Readers use the field ID and schema metadata to interpret old and new files together.

The supported changes are constrained by type semantics; for example, widening a numeric type is different from an arbitrary conversion. Check the specification and engine behavior before changing nested/map key schemas. Schema evolution also does not automatically make every application consumer compatible: external code may still expect a field name or required value that changed.

## Hidden partitioning and partition evolution

Writers apply transforms such as identity, year/month/day/hour, bucket, or truncate to source columns. Readers can filter on the original column and Iceberg derives partition predicates, so query authors need not know the physical partition path. This avoids coupling SQL to a particular directory layout.

Partition specifications can evolve. Old files keep their original spec while new files use the new spec; query planning accounts for each spec. This avoids an immediate full rewrite but means planning and maintenance must handle multiple layouts. Partition evolution does not fix poor file sizes, skew, or unselective queries by itself.

## Deletes and row-level changes

Format version 2 added position and equality deletes; format version 3 adds newer capabilities, including deletion-vector-related support as implemented by engines. A delete file lets a row be logically removed without immediately rewriting its data file. Readers must apply relevant deletes when reconstructing snapshot rows. This can reduce write amplification, but too many small delete files or expensive merge-on-read work can slow queries. Periodic rewrite/compaction is a workload decision, not an automatic guarantee.

`MERGE`, `UPDATE`, and `DELETE` support and exact semantics vary by engine, table version, and catalog. The table format defines the representation; an engine exposes commands and plans them. Validate concurrent writers and row-level operations with the engine matrix used in production.

## Catalogs, interoperability, and security

The catalog is responsible for locating tables and coordinating metadata commits. Implementations include REST-compatible catalogs, Hive Metastore, Hadoop-style catalogs, and cloud-specific catalogs. Catalog APIs, locking, credential vending, namespace behavior, and atomic commit support differ. Two engines pointing at the same files but using incompatible catalogs or feature versions do not automatically form a safe multi-writer system.

Before enabling a feature, compare the feature's minimum reader/writer requirements to every engine that may read or write the table. Protocol/format upgrades can make newer tables unreadable to older clients. Use a compatibility matrix, stage upgrades, and avoid enabling table features just because one writer supports them.

## Maintenance is part of the design

An operational table needs policies for snapshot expiration, orphan-file deletion, small-file compaction, manifest rewriting, delete-file cleanup, and optional statistics. These jobs affect storage cost, planning latency, and historical recovery. Do not run orphan deletion with an unsafe age threshold while writers or long-running jobs can still have pending files. Retention must be coordinated with branches, tags, streaming checkpoints, legal holds, and disaster recovery.

## Examples

An hourly event pipeline writes partitioned events and a dashboard queries the last seven days. Use a timestamp transform rather than baking a path into SQL. Commit each bounded batch as a snapshot. A dashboard query records the snapshot it planned against, so it does not mix half of a new batch with the prior state. If a correction arrives, use an engine-supported row-level operation or write a corrected snapshot; then publish change data to downstream consumers only through a separately designed change mechanism. Compact files and expire snapshots on a schedule that preserves the dashboard's recovery and reproducibility window.

## Cross-item comparison

- **Hive-style external tables:** simpler file discovery but often bind readers to directory conventions and provide weaker atomic table evolution.
- **Delta Lake:** also provides a transaction log over data files; feature protocols and engine compatibility determine interoperability.
- **Apache Hudi:** emphasizes mutable/upsert-heavy ingestion and incremental consumption with its timeline/index/table-service model.
- **Warehouse-native tables:** often provide tighter integrated operations and service guarantees but may be less portable or use different cost and lock-in trade-offs.

Choose by the engines required, update/delete pattern, concurrency model, catalog ownership, time-travel/retention needs, interoperability tests, and operational ability to compact and clean files—not by the label “open.”

## Common mistakes

- Treating Iceberg as a storage engine, query engine, or catalog by itself.
- Assuming atomic table commits make writes to a queue or another database atomic too.
- Assuming every engine supports every format-version feature.
- Enabling a protocol feature without checking older readers and writers.
- Treating snapshot expiration as harmless cleanup when audits or jobs need that history.
- Assuming partition evolution, delete files, or metadata indexes remove the need for file-size and query-plan tuning.

## Knowledge checks with answers

1. **Why does a reader not scan every object in the bucket?** It starts from committed table metadata and manifests that describe files in a selected snapshot.
2. **Can a rename corrupt older rows?** Iceberg's field IDs preserve column identity across supported schema changes; consumer code and engine support still need compatibility checks.
3. **Does an open table format guarantee engine interoperability?** No. Catalog, format-version, and feature support must overlap across each reader and writer.
4. **What does expiring a snapshot risk?** It can remove time-travel history and eventually make files eligible for deletion; coordinate retention with readers, branches/tags, and recovery objectives.
