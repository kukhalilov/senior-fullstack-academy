# data systems storage engines analytics streams and search — Reference: Delta Lake

Sources: [Delta Lake documentation](https://docs.delta.io/), [release and engine compatibility matrix](https://docs.delta.io/releases/), [table format protocol compatibility](https://docs.delta.io/versioning/), [concurrency control](https://docs.delta.io/concurrency-control/), [batch and streaming](https://docs.delta.io/delta-streaming/), [Change Data Feed](https://docs.delta.io/delta-change-data-feed/), [liquid clustering](https://docs.delta.io/delta-clustering/), [deletion vectors](https://docs.delta.io/delta-deletion-vectors/), [catalog-managed tables](https://docs.delta.io/delta-catalog-managed-tables/), and [Delta Lake 4.3 release overview](https://delta.io/blog/2026-06-22-delta-4-3-release/).

## Scope and version

As of November 20, 2026, the Delta Lake release matrix lists 4.3.x as the latest release line, compatible with Apache Spark 4.0.x and 4.1.x. Verify the exact patch version, Spark build, and connector before upgrading. Delta Lake is a transaction-log table format/framework for data lakes, not a database server or object store. Its protocol records table state and commits over data files; the engine executes reads and writes.

## How this group fits the mental model

A Delta table normally contains Parquet data files plus a `_delta_log` transaction log. A log version describes an atomic set of actions such as adding/removing files and changing metadata or protocol. A reader reconstructs a snapshot by applying the committed log actions, then scans only files visible in that snapshot. This is why readers can get a consistent table view while writers append new data.

The transaction boundary is the Delta table commit under the protocol and storage/catalog conditions in use. It does not automatically include a separate SQL database, message broker, payment provider, or arbitrary side effect. ACID and isolation claims need to be read in context: the official overview describes serializable isolation for the Spark integration, while other engine/catalog modes have their own compatibility and guarantees.

## Supplied names explained

- `Delta Lake` is an open transaction-log table format/framework that provides table snapshots, concurrent writes, and batch/stream integration on data lakes; exact guarantees depend on the protocol, engine, and catalog mode.

## Optimistic concurrency and conflicts

Delta writers optimistically read a snapshot, prepare work, and attempt to commit. If a concurrent commit invalidates the assumptions of a write, Delta rejects it with a conflict rather than silently merging every operation. Conflict types include concurrent append/delete/read, metadata changes, concurrent transactions, and protocol changes. Partitioning and disjoint predicates can reduce conflicts when they accurately represent the workload, but overly partitioned tables create small-file and metadata costs.

Handle a conflict by re-reading current state and retrying only if the operation is valid against that state. Do not blindly retry business operations whose intent has changed. A retry that repeats an external effect must use a separate idempotency/reconciliation design.

## Batch and streaming share one table

Delta supports batch reads/writes and Structured Streaming sources/sinks over the same table. A streaming writer tracks progress through checkpoints; the table log provides committed table versions. Checkpoints are part of the pipeline's state and must be protected and managed with the job. CDF can expose row-level changes for downstream processing when enabled, but it is not a permanent event archive: change records are subject to table retention and vacuum, and the feature has engine/table compatibility limits.

If a consumer needs replay beyond the retention window, independent audit history, or guaranteed delivery to an external system, preserve that contract separately. A stream reading the current table snapshot and a CDC consumer processing change files do not imply that every downstream side effect occurs exactly once.

## Protocol and feature compatibility

Delta uses reader/writer protocol versions and table features to prevent clients that cannot understand a table from reading or writing it incorrectly. Features such as Change Data Feed, column mapping, deletion vectors, row tracking, type widening, Variant, liquid clustering, and catalog-managed tables have different minimum versions and requirements. Enabling a feature may upgrade the protocol and exclude older clients. Dropping a feature is only possible for supported features and may require rewriting data or additional cleanup; protocol downgrade is not a universal escape hatch.

Before a rollout, inventory every writer and reader: Spark/Delta versions, SQL engines, sharing clients, batch jobs, streaming jobs, and catalog integration. Test both reads and writes after each table feature change. The version matrix is more useful than saying only “we run Delta 4.”

## Updates, deletes, deletion vectors, and clustering

Row-level operations can otherwise rewrite Parquet files to reflect a small logical change. Deletion vectors let supported operations record rows as logically removed and defer physical rewrite; readers must understand and apply the vectors. The feature upgrades protocol compatibility and does not eliminate future compaction or rewrite work.

Liquid clustering is available in Delta 3.1 and later and lets data layout be adjusted around chosen clustering columns without a fixed partition directory contract. Changing clustering keys does not automatically recluster all old data; Delta documents explicit full reclustering. It is an alternative to some static partitioning/Z-order patterns, not a universal index. Use query measurements and validate which execution engines honor the layout metadata.

## Catalog-managed tables and interoperability

Catalog-managed tables route table operations through catalog APIs so the catalog can validate and coordinate commits. In the 4.3 release line, Delta documents deeper integration with Unity Catalog Delta APIs, Change Data Feed and streaming improvements for catalog-managed tables, and incremental/atomic UniForm integration. These capabilities belong to specific catalog-managed modes and release versions; they do not mean that every ordinary Delta table can be concurrently mutated by every engine.

UniForm can expose Delta data through compatible Iceberg metadata integrations, but conversion/interoperability feature sets and write ownership remain bounded by documented implementations. Delta-to-Hudi migration is a separate interoperability path, not a UniForm feature. Avoid simultaneous independent writers unless the catalog/protocol explicitly supports the chosen pattern.

## Maintenance and retention

Operations such as `OPTIMIZE`, log cleanup, `VACUUM`, and snapshot retention affect query planning, storage cost, and time travel. `VACUUM` removes unreferenced files only after retention rules; setting retention too aggressively can break long-running readers, streaming jobs, or time travel and can undermine recovery. Validate log/data retention against the longest job duration, CDF consumers, audit window, and restore plan.

## Examples

### Mutable product catalog in a lakehouse

Ingest source changes into a bronze table, validate and normalize them into a current-state silver table, and build aggregates for analytics. Define a stable product key and deterministic merge rule for duplicate/out-of-order updates. Use a bounded writer and observe commit conflicts, small files, stream lag, and table growth. If dashboards require a reproducible result, pin the table version used by the report. If downstream consumers need each change, use CDF or a durable event stream with a retention/replay contract. The Delta commit does not atomically publish to an unrelated queue; use an outbox or reconciliation step when that cross-system guarantee matters.

## Cross-item comparison

- **Apache Iceberg:** also provides snapshot-based tables over files; it emphasizes format/catalog interoperability and schema/partition evolution. Compare feature protocol and engine support, not slogans.
- **Apache Hudi:** its timeline, indexing, and Copy-on-Write/Merge-on-Read choices are designed for mutable ingestion and incremental data consumption.
- **Warehouse-native tables:** may offer more integrated administration, access control, and performance tooling, with less portability or more provider coupling.
- **Plain Parquet files:** simplest for immutable batch exports, but do not on their own provide table-level snapshots, concurrent commit coordination, or time travel.

Choose using required readers/writers, mutation rate, streaming semantics, catalog ownership, concurrency, feature compatibility, retention, and maintenance burden.

## Common mistakes

- Treating a transaction log as a cross-system transaction coordinator.
- Assuming “exactly once” table writes guarantee exactly-once email, payment, or queue side effects.
- Enabling table features before checking all reader and writer versions.
- Treating deletion vectors as physically erased rows or a replacement for compaction.
- Assuming CDF is retained forever or is an authoritative event archive.
- Assuming a successful protocol upgrade can always be downgraded later.
- Adding partitions without considering file counts and concurrent-write conflicts.

## Knowledge checks with answers

1. **What makes a Delta read a consistent snapshot?** The reader reconstructs visible files from a committed transaction-log version.
2. **Does a conflict mean the system lost an update?** It means the optimistic write was rejected because its assumptions conflicted; the application must re-evaluate and safely retry or surface the conflict.
3. **What should you check before enabling a table feature?** Protocol requirements and actual support in all readers, writers, connectors, streaming consumers, and sharing paths.
4. **Why is CDF retention important?** Change data is subject to the table's cleanup/retention policy, so a consumer that falls behind may lose its replay range.
