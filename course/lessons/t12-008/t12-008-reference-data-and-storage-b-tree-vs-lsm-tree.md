# system design tradeoffs and decision methods — Reference: B-tree vs LSM-tree

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [PostgreSQL 18 B-tree indexes](https://www.postgresql.org/docs/current/btree.html), [RocksDB compaction guide](https://github.com/facebook/rocksdb/wiki/Compaction), [RocksDB tuning guide](https://github.com/facebook/rocksdb/wiki/RocksDB-Tuning-Guide), [O’Neil et al., LSM-tree](https://doi.org/10.1007/s002360050048).

## Scope and version

These are storage/index structures, not mutually exclusive database brands. Engines often combine them with logs, buffers, caches, filters, and other structures. Compare the measured workload and full engine behavior, not just the tree name.

## How this group fits the mental model

Imagine maintaining a sorted paper index. A B-tree keeps the index organized in pages and updates the relevant page on a write; an LSM-tree first records changes in a sequential log and memory buffer, then writes sorted files and merges them in the background. Both support ordered keys, but they place work at different points: B-trees update the organized structure as writes arrive; LSM-trees defer and batch organization, then pay for compaction.

## Supplied names explained

**B-tree path:** a database typically records changes in a write-ahead log for recovery, updates pages in a buffer pool, and later flushes dirty pages. Tree pages keep keys ordered and support point and range scans. Page splits, random page writes, concurrency control, WAL volume, and cache behavior affect write cost. PostgreSQL documents its B-tree as a multilevel page structure whose levels support ordered traversal.

**LSM path:** a write is normally appended to a log and placed in a memtable. When full, the memtable is flushed into an immutable sorted run (SSTable). Reads may check the memtable and several runs, using indexes and filters to avoid unnecessary reads. Compaction merges runs, removes obsolete versions/tombstones when safe, and changes read, write, and space amplification. If compaction cannot keep up, storage grows and engines may slow or stall writes.

Neither family has one universal performance winner. LSM behavior depends strongly on compaction strategy, filters, cache, value size, write/read mix, range scans, and deletion patterns. B-tree engines also buffer and log writes, and modern storage can change the tradeoff. Transactional semantics, durability, isolation, replication, and query planner are separate dimensions.

## Cross-item comparison

For write-heavy workloads, LSM batching can turn many small updates into sequential writes, but compaction rewrites data and consumes background I/O. For read-heavy point lookups, a B-tree may offer a direct organized path; an LSM can need checks across levels unless filters and compaction keep that cost low. For range scans, both preserve key ordering, but actual latency depends on pages/runs touched and cache locality. Benchmark point reads, range scans, updates, deletes, recovery, and compaction under production-like size and concurrency.

## Examples

An event store receives 80% inserts and 20% recent-key reads. An LSM engine accepts bursts into its log/memtable and flushes sorted runs; measure compaction debt, read amplification, and write stalls during peaks. A B-tree engine updates indexed pages and WAL; measure random-write I/O, page splits, cache hit rate, and WAL/checkpoint behavior. Then add a deletion-heavy phase: in an LSM, tombstones must survive until old values cannot reappear; in either design, verify recovery and cleanup behavior under the actual engine.

## Common mistakes

- Treating “LSM means faster writes” as a guarantee independent of compaction, sync durability, value size, and workload.
- Ignoring compaction debt, write stalls, read amplification, or space amplification in an LSM engine.
- Assuming every relational database uses only B-trees or every key-value engine uses only LSM structures.
- Comparing the structures while ignoring WAL, cache, filters, transaction semantics, and background maintenance.

## Knowledge checks with answers

1. **Where does an LSM defer substantial organization work?** In background compaction after log/memtable flushes create sorted runs.
2. **Name three LSM amplification costs.** Read amplification, write amplification, and space amplification.
3. **What should a benchmark include?** The real read/write mix, key and value distribution, data size, range scans, deletes, concurrency, recovery, and maintenance under peak load.
