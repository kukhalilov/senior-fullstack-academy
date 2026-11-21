# system design technology landscape and selection — Reference: Storage engines

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [RocksDB README](https://github.com/facebook/rocksdb/blob/main/README.md), [RocksDB terminology](https://github.com/facebook/rocksdb/wiki/Terminology), [RocksDB live SST files](https://github.com/facebook/rocksdb/wiki/How-we-keep-track-of-live-SST-files).

## Scope and version

This reference explains the named storage engine, RocksDB. It is a storage-engine concept lesson rather than a claim that every database uses this implementation. RocksDB is an embeddable library; its exact APIs and options depend on the version and host application.

## How this group fits the mental model

A storage engine is the component that turns reads and writes into durable bytes and indexes. It is commonly inside a database process. A database service additionally supplies a network protocol, concurrency and transaction model, replication or distribution, security boundaries, operations, and often query planning. RocksDB alone is not a distributed database: the application embeds and operates the library, and must build any needed service-level behavior around it.

RocksDB uses a log-structured merge-tree (LSM) design. A write is recorded in a write-ahead log (WAL) for recovery and applied to an in-memory memtable. When the memtable fills, it is flushed into immutable sorted string table (SST) files. Reads consult memory and relevant files; compaction merges files over time. This favors write throughput and sequential storage work, while compaction and multiple candidate files can create read, space, and write amplification.

## Supplied names explained

- **RocksDB** — An embeddable persistent key-value storage engine derived from LevelDB and designed for flash and fast storage. It provides ordered key/value access, point lookups, iteration, batches, snapshots, column families, and configurable durability and compaction behavior. It does not by itself provide SQL, a networked cluster, cross-node replication, or application-level conflict resolution.

### Important mechanics and tradeoffs

- **WAL and durability:** the WAL supports recovery of writes not yet represented in SST files. Durability depends on write options, synchronization, filesystem/device behavior, and failure mode; an acknowledged write is only as durable as the configured contract.
- **Memtables and flush:** writes first accumulate in memory and later become sorted immutable files. Memory pressure and flush throughput affect stalls and latency.
- **SST files and reads:** immutable sorted files are organized into levels. Bloom filters and indexes can reduce unnecessary I/O, but do not make every query constant time. Range scans and key locality matter.
- **Compaction:** background merging reclaims overwritten/deleted entries and maintains the LSM layout. It consumes I/O, CPU, and temporary disk space; overloaded compaction can cause write stalls or tail-latency spikes.
- **Amplification:** write amplification is repeated physical rewriting; read amplification is consulting multiple structures/files; space amplification is retaining obsolete versions until compaction. Tuning one can worsen another.
- **Embedded ownership:** the host process owns lifecycle, concurrency boundaries, backup/restore strategy, schema/key encoding, upgrades, metrics, and recovery tests. If a service requires replication or multi-node availability, those must come from an enclosing system.

## Cross-item comparison

| Choice | What it is | Use it when | Main design cost |
|---|---|---|---|
| RocksDB | Embedded ordered key/value engine | A process needs local durable state, indexing, or a building block for a larger service | The host must supply service, replication, backup, and operational contracts |
| Relational database | A database service with relational model and SQL | Multiple clients need transactions, constraints, queries, and managed concurrency | Schema/query design and service operations; internals vary by vendor |
| Distributed key-value database | A networked clustered data service | State must be accessed across processes/nodes with a distributed availability model | Partitioning, replication, consistency choices, and operational complexity |

These are different layers and not drop-in substitutes. A product may use RocksDB internally while exposing a much broader database contract.

## Examples

A service needs a local index from account ID to compact state. The team embeds RocksDB and encodes keys so related records sort together. Before adopting it, the team answers: which writes require a synchronous durability barrier; what happens when disk space is exhausted; how snapshots interact with compaction; how backups are made consistently; how the database is rebuilt after corruption; what happens during library upgrades; and whether multiple processes can open the same database safely under the selected configuration. If another host must read the state, the design adds an explicit replication or service layer rather than assuming RocksDB provides one.

## Common mistakes

- Calling RocksDB a distributed database or assuming an embedded engine provides SQL.
- Treating WAL presence as a blanket durability guarantee without examining write options and storage behavior.
- Assuming LSM compaction is invisible background work; it can compete with foreground operations.
- Optimizing only average read/write latency while ignoring amplification, disk headroom, and tail latency.
- Embedding a library without designing backup, restore, upgrade, and corruption-recovery procedures.

## Knowledge checks with answers

1. **Does RocksDB replicate data across machines by itself?** No. It is an embedded engine; a surrounding system must provide distributed replication if required.
2. **Why can an LSM engine be write-friendly yet have read costs?** Writes are accumulated and flushed sequentially, while a read may need to inspect memory and multiple levels/files before compaction consolidates them.
3. **What does compaction trade?** Background resource use and write amplification for improved layout, cleanup, and bounded read/space amplification.
4. **What must be checked before claiming acknowledged writes survive a crash?** The configured WAL/write synchronization behavior and the guarantees of the filesystem and storage device.
