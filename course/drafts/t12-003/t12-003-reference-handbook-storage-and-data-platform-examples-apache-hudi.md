# data systems storage engines analytics streams and search — Reference: Apache Hudi

Sources: [Hudi overview, version 1.2.1](https://hudi.apache.org/docs/overview/), [table and query types](https://hudi.apache.org/docs/table_types/), [technical specification](https://hudi.apache.org/tech-specs/), [timeline](https://hudi.apache.org/docs/timeline/), [indexes](https://hudi.apache.org/docs/indexes/), [metadata indexing](https://hudi.apache.org/docs/metadata_indexing/), [compaction](https://hudi.apache.org/docs/compaction/), [clustering](https://hudi.apache.org/docs/clustering/), [cleaning](https://hudi.apache.org/docs/cleaning/), [SQL queries and incremental CDC](https://hudi.apache.org/docs/sql_queries/), [release 1.2 notes](https://hudi.apache.org/releases/release-1.2/), and [download/compatibility bundles](https://hudi.apache.org/releases/download/).

## Scope and version

As of November 20, 2026, Apache Hudi's official download page lists 1.2.1. Hudi 1.2.x uses table version 9; format compatibility is separate from the Java library version. Verify the matching Spark/Flink/Trino bundle and Java/runtime combination. Hudi is a data lake table format and ingestion/data-management framework built around open data files plus a commit timeline; it is not a distributed SQL query engine by itself.

## How this group fits the mental model

Object stores are good at holding large immutable files, but applications often need updates, deletes, deduplication, incremental consumption, and a current view of records. Hudi maintains table metadata and a timeline of completed and in-flight actions. A reader uses the completed timeline and file slices to determine which data represents the chosen table state. The data files remain in an open format supported by a configured engine.

## Supplied names explained

- `Apache Hudi` manages mutable analytic tables over files with keyed writes, table indexes/services, and timeline-based queries; exact capabilities depend on the table type, release, and engine bundle.

Writers need a record key, partitioning choice, ordering/conflict rule, and concurrency mechanism. A record key identifies a row; partitioning determines its physical location and affects lookup/update costs. Ordering or record-merger behavior resolves competing versions. If these are not modeled consistently, duplicate or out-of-order events can produce surprising state even though commits are atomic.

## Copy-on-Write and Merge-on-Read

### Copy-on-Write (CoW)

Updates create replacement base files in affected file groups. Readers scan base files without merging log changes, making reads simpler and often faster. The cost is write amplification: small updates can rewrite larger files, so frequent low-latency mutations may be expensive. CoW often fits batch ingestion, slowly changing/reference data, or read-heavy tables.

### Merge-on-Read (MoR)

Updates are first written to log files associated with base file slices; compaction later merges logs into new base files. This can reduce write latency and make changes queryable sooner, but read cost depends on outstanding logs and query mode. Compaction consumes compute and storage I/O and must keep up with writes.

Hudi distinguishes snapshot queries (latest committed state), read-optimized queries (base files without merging recent logs, for MoR), and incremental queries over changes between timeline points. Exact query-type availability and semantics depend on the engine/connector. Do not promise a freshness bound without measuring write-to-query visibility and compaction lag.

## Timeline, commits, and recovery

The timeline records table actions such as commits, compaction, clustering, and rollback. Pending/in-flight actions are not the same as completed table state. A commit makes a coherent set of file changes visible according to the timeline protocol. Failed writes can be rolled back/cleaned; the specific recovery procedure and concurrency behavior depend on writer, storage, and lock configuration.

The timeline supports time travel and incremental reads, but retention/archival policies determine how long earlier instants remain available. A consumer that stores an instant cursor must define what happens if that instant is archived or cleaned before it resumes: replay from a retained checkpoint, rebuild from a snapshot, or fail and require operator action.

## Indexes and record lookup

Hudi indexes map keys to record locations or accelerate file/partition pruning. The chosen index affects write amplification, lookup correctness, storage/metadata size, and support for global versus partition-scoped keys. A local index assumes the record's partition is known or stable; global indexing can find a key across partitions but costs more coordination and maintenance. Hudi 1.x exposes multiple index implementations and configurations, but availability varies by engine and release. Check current official index docs before selecting a named index.

The metadata table can hold auxiliary information such as file listings, column statistics, bloom filters, or record index structures, depending on enabled features. It reduces expensive object-store listing or helps prune files; it is not automatically a replacement for query-engine indexes or a guarantee every query skips data.

## Table services: compaction, clustering, cleaning

- **Compaction** merges MoR log records into base files and advances read efficiency.
- **Clustering** rewrites files into a layout better aligned to query patterns or file sizing, without changing logical rows.
- **Cleaning** deletes obsolete file versions once retention and reader-safety rules permit.
- **Archiving** bounds active timeline metadata while retaining older history according to policy.

These services consume capacity and can compete with ingestion. Schedule/coordinate asynchronous services, monitor backlog and file counts, bound retries, and retain enough history for readers and incremental consumers. A table can continue to accept writes while its maintenance backlog quietly makes reads or recovery increasingly expensive.

## Ingestion and change propagation

Hudi distinguishes two kinds of incremental query. **Latest-state incremental** returns the latest values of keys changed since a timeline point, so multiple intermediate updates can collapse to one current row per key. **CDC incremental** returns change records, including before/after images and the operation where supported, for consumers that need each mutation. Both need a durable checkpoint, event/change semantics, and a response to checkpoints older than retained history. Do not call the latest-state form a complete audit log.

Hudi is often used for CDC ingestion and upserts: consume source changes, map them to a stable record key and partition, resolve ordering/duplicates, commit a batch, and expose current or incremental data. Record-level index and Flink improvements in Hudi 1.2.0 broaden streaming ingestion capabilities; 1.2.1 is a bug-fix release that keeps table version 9 and adjusts some defaults/connector artifacts. The exact bundle is essential: 1.2.0 added Spark 4.1 and Flink 2.1 bundles, while 1.2.1 updates the Trino connector artifact location and includes broad fixes.

One version-specific caution in the 1.2.1 release notes: Spark 4.1's `spark.sql.variant.pushVariantIntoScan` path has known VARIANT read problems. Some issues can return incorrect null handling or fail for nested/multiple-path reads; the documented workaround is to turn that scan rule off. The release notes say fixes are not yet in a released 1.2.x artifact for the listed cases. Avoid VARIANT+Spark 4.1 combinations until the release notes confirm a fixed build and your test cases pass.

Incremental queries are timeline-based table change consumption, not a substitute for understanding source CDC semantics. Decide whether consumers need latest state or every intermediate mutation, how deletes are represented, what ordering field resolves late updates, and how to handle a gap beyond retained timeline history.

## Cross-item comparison

Hudi 1.2.0 introduced first-class VECTOR, VARIANT, and BLOB logical types and Lance support, but engine and file-format support is not uniform. The 1.2.1 notes include limitations and fixes for these new data shapes; verify the specific query engine/version before using them in production. A feature visible in table metadata may not be understood by every reader.

- **Apache Iceberg:** strong fit when multi-engine table-format interoperability, snapshots, and schema/partition evolution are central; mutation ingestion is still possible but the writer/query model differs.
- **Delta Lake:** transaction-log table format with batch/stream integration and a broad Spark/connector ecosystem; feature compatibility is governed by Delta protocol and client versions.
- **Hudi:** particularly useful when frequent upserts/deletes, incremental reads, record indexing, and controlled table services are primary requirements.
- **Plain append-only Parquet:** simpler and cheaper operationally if data is immutable and no transactional table semantics are required.

These are tendencies, not universal product rankings. Compare update pattern, query engines, commit concurrency, freshness, file maintenance, indexing, connector maturity, and operator familiarity on the actual workload.

## Examples

### Customer CDC

Suppose a source database emits customer changes. Define one stable customer key and choose whether customers can move between partitions. Preserve a source sequence or update timestamp and a deterministic merger so replaying the same event does not regress state. Use CoW if read latency dominates and update batches are modest; consider MoR if low write latency matters and you can operate compaction/read-optimized paths. Store a checkpoint outside transient process memory, process bounded batches, commit changes, then advance the source checkpoint only with a recovery strategy that tolerates crashes between sink commit and checkpoint. Monitor source lag, Hudi commit duration/conflicts, index cost, file count, compaction backlog, and consumer cursor retention.

## Common mistakes

- Treating CoW/MoR as generic SQL table properties; they alter write/read and maintenance behavior.
- Assuming “incremental” means every intermediate event is retained forever.
- Choosing record key, partition, and ordering fields independently even though together they define upsert semantics.
- Forgetting table services and letting small files/logs/timeline history grow without bounds.
- Assuming a Spark/Flink/Trino connector supports every Hudi format feature or table type.
- Enabling a new logical type without ensuring all readers can decode it.
- Treating a commit to Hudi as an atomic commit to the source database or downstream message broker.

## Knowledge checks with answers

1. **Why might MoR writes be faster but reads vary?** Updates can land in logs first; readers may need to merge those logs until compaction rewrites base files.
2. **What three settings shape an upsert's correctness?** Stable record key, partition placement, and deterministic ordering/conflict resolution.
3. **Do all Hudi incremental queries preserve every intermediate update?** No. Latest-state incremental returns current values for changed keys; CDC incremental is the change-record form when supported.
4. **What happens if a streaming consumer falls behind retained timeline history?** Its incremental starting point may no longer be available; it needs a rebuild/replay policy or an explicit failure path.
5. **Does Hudi 1.2.1 require a table format upgrade from 1.2.0?** The official release notes say it retains table version 9, so no table-version upgrade is needed between those releases; engine/API/bundle changes still require checking.
