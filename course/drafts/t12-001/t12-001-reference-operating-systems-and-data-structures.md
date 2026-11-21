# system design foundations and infrastructure building blocks — Reference: Operating-system resources and foundational data structures

Sources: [HLD Handbook](https://hld.handbook.academy/), [Linux process creation](https://man7.org/linux/man-pages/man2/fork.2.html), [POSIX threads on Linux](https://man7.org/linux/man-pages/man7/pthreads.7.html), [Linux resource limits and file descriptors](https://man7.org/linux/man-pages/man2/getrlimit.2.html), [Linux memory concepts and page cache](https://docs.kernel.org/admin-guide/mm/concepts.html), [Linux page tables](https://docs.kernel.org/mm/page_tables.html), [Linux `epoll`](https://man7.org/linux/man-pages/man7/epoll.7.html), [Linux `io_uring`](https://man7.org/linux/man-pages/man7/io_uring.7.html), [FreeBSD `kqueue`](https://man.freebsd.org/cgi/man.cgi?query=kqueue), [Apache Bloom filter introduction](https://commons.apache.org/proper/commons-collections/bloomFilters/intro.html), [RocksDB tuning and LSM amplification](https://github.com/meta/rocksdb/wiki/RocksDB-Tuning-Guide), [HLD Handbook prerequisites](https://hld.handbook.academy/curriculum/prerequisites/), [HLD Handbook building blocks](https://hld.handbook.academy/curriculum/building-blocks/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

Start with one server receiving requests. The operating system decides where code runs, what memory it can address, and how it waits for disks and sockets. Data structures decide how the application finds, orders, or summarizes records once the data is in memory or storage. A web service's latency and capacity depend on both layers: an algorithm with good asymptotic complexity can still stall on disk I/O, page faults, memory pressure, lock contention, or too many open descriptors.

Use four questions to connect the concepts:

1. **Where does work execute?** A process is an isolation and resource boundary; threads are execution paths that share its memory. More threads can increase concurrency, but they also consume stack/scheduler resources and create shared-state races.
2. **Where does data live right now?** Virtual memory gives a process an address-space abstraction; physical RAM is finite. File-backed data may be in the operating system page cache, which can accelerate rereads but competes with application memory. A page fault can be cheap if the page is already cached or very slow if storage must be read.
3. **How does the program wait for I/O?** Blocking calls suspend the calling thread until the operation completes. Readiness APIs such as `epoll` or `kqueue` report that a descriptor may make progress; the event loop must still perform nonblocking reads/writes and handle partial progress. Completion APIs report finished operations instead. These models affect thread usage and program structure, not the durability of the data.
4. **How is data found or persisted?** Hash tables favor point lookup, skip lists and B-trees maintain order, Bloom filters cheaply reject likely-absent keys, and LSM trees batch writes into sorted runs that are merged later. Each trades memory, write work, read amplification, range-query behavior, and false positives differently.

No structure is globally best. First state the workload (lookup, range scan, writes, concurrency, data size), then choose the structure and measure the behavior that matters.

## Supplied names explained

- `Process` — An operating-system resource boundary with its own virtual address space, handles, and lifecycle. Separate processes reduce accidental memory sharing and contain crashes, but communicating across them requires explicit mechanisms such as sockets, pipes, or shared memory.
- `Thread` — A schedulable execution path inside a process. Threads share heap and open resources, so synchronization is needed for shared mutable state; blocking one thread does not necessarily block the entire process.
- `Virtual memory` — The mapping from process-visible virtual addresses to physical pages or storage-backed mappings. Page tables and translation caches support this abstraction; allocation does not mean every page is resident, and overcommit/swap policy varies by OS.
- `Page cache` — The OS cache of file-backed pages. A second file read may be served from RAM, while a cold read can block on storage. The kernel reclaims cache pages under pressure, so applications should not treat page-cache contents as pinned or durable state.
- `Blocking I/O` — A call that waits for its result before returning. A thread-per-connection server is straightforward but can waste threads on slow clients or remote services; bounded worker pools prevent an unbounded number of blocked threads from exhausting resources.
- `Readiness-based I/O` — An API reports that an operation on a descriptor is likely to make progress. It does not return the data itself; use nonblocking descriptors, handle partial reads/writes and `EAGAIN`, and register interest again. Level-triggered and edge-triggered APIs have different event-loop obligations.
- `File descriptor` — A process-local integer handle to an open file, socket, pipe, or other resource. It has ownership/lifetime rules, can be inherited across `fork` or duplicated, and is subject to per-process and system limits; leaks can eventually prevent new connections or files from opening.
- `Hash table` — A key-to-bucket structure with expected efficient point lookup when hashes distribute keys and the table resizes appropriately. Collisions can degrade performance; hostile keys, memory overhead, iteration order, and resize pauses matter in production.
- `Skip list` — A probabilistically layered linked structure that supports ordered search, insertion, deletion, and range traversal in expected logarithmic time. It trades pointer-heavy memory and cache locality for simpler balancing than a deterministic search tree.
- `Bloom filter` — A bit-array with multiple hashes that answers “definitely absent” or “possibly present.” False positives cause extra lookups; false negatives should not occur for inserted elements when implemented and used correctly. It cannot return the stored value or delete an item in its basic form; counting variants add deletion at a space/correctness cost.
- `B-tree` — A balanced multiway tree designed to keep many keys per page, reducing I/O depth. It maintains sorted keys and is well suited to range queries and updates, though page splits and random writes have costs.
- `LSM tree` — A write-optimized structure that buffers writes, flushes sorted runs, and later compacts them. It can provide high write throughput, but reads may consult multiple levels and compaction consumes I/O; tombstones and compaction lag affect space and read amplification.

### Match the structure to the operation

| Need | Candidate | Why it fits | What to measure or guard |
| --- | --- | --- | --- |
| Exact key lookup in a mostly in-memory map | Hash table | Expected constant-time lookup under a healthy load factor | Collision distribution, resizing, memory use, iteration needs |
| Ordered lookup and range scans | B-tree or skip list | Maintains sorted order rather than hashing keys away | Disk/page locality, update cost, range length, pointer/cache overhead |
| Avoid expensive lookup when a key is usually absent | Bloom filter before disk or network lookup | Compact negative membership test | False-positive rate, filter rebuild/versioning, stale filter after inserts/deletes |
| Heavy write ingestion with sorted access patterns | LSM tree | Buffers and batches writes into sequential sorted files | Write/read/space amplification, compaction debt, tombstone cleanup, tail latency |
| Many connections with low active I/O duty cycle | Readiness event loop | Avoids one blocked thread per idle socket | Event-loop fairness, partial I/O, backpressure, descriptor limits, CPU-bound handler isolation |
| Simpler bounded-concurrency service | Blocking I/O with a bounded thread pool | Straightforward control flow and backpressure | Pool saturation, per-request blocking time, queue wait, thread memory |

## Cross-item comparison

Compare purpose, guarantee, and cost at the layer where the operation occurs. A Bloom filter cannot replace a hash table because it does not retrieve values; a page cache cannot replace a database index because it only caches file pages; readiness notification is not I/O completion; and a process boundary is not a transaction boundary. Choose the simplest mechanism that satisfies the required behavior, then test resource limits and tail latency under realistic concurrency.

## Examples

A service accepts a request, places bounded work on a queue, and uses worker processes to handle it. The queue is not automatically durable: verify its persistence and acknowledgement semantics. Monitor queue age as well as depth so work that is no longer useful can be rejected or expired.
## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Which item is the source of truth?** That is an explicit application data-ownership decision, not implied by a cache or replica.
2. **What if an acknowledgement is lost?** Treat the outcome as unknown; use idempotency or verification before repeating an effect.
3. **How do you choose among alternatives?** Compare them against the named workload, guarantee, cost, operational skill, and failure scenario.
