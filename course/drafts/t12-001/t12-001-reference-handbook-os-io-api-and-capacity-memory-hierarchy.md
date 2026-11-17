# system design foundations and infrastructure building blocks — Reference: Memory hierarchy

Sources: [Linux kernel memory-management concepts](https://docs.kernel.org/admin-guide/mm/concepts.html), [Linux page tables, TLBs, and page faults](https://docs.kernel.org/mm/page_tables.html), [Intel optimization reference: cache usage](https://cdrdv2-public.intel.com/821612/248966-Optimization-Reference-Manual-V1-050.pdf), [Linux NUMA memory performance](https://docs.kernel.org/admin-guide/mm/numaperf.html).

## Scope and version

This lesson explains the general memory hierarchy and uses Linux and Intel documentation for concrete examples. Exact cache levels, sizes, latencies, page sizes, NUMA topology, and replacement policies depend on processor and system configuration. Treat numeric performance claims as machine-specific and measure on the target system.

## How this group fits the mental model

Processors can execute instructions faster than large memory systems can deliver arbitrary data. Hardware uses small, fast storage close to the CPU and larger, slower storage farther away. Software that reuses nearby data can often run faster because values are already in a cache; software that jumps unpredictably through a large working set may wait on memory even when it performs few calculations. Storage performance is therefore a property of the access pattern and the hierarchy, not simply “how much RAM the machine has.”

## Supplied names explained

- `Memory hierarchy` — A system’s layers of storage and translation caches, from processor registers and CPU caches through RAM and persistent storage, each with different capacity, latency, bandwidth, and sharing characteristics.

## The main layers

### Registers and CPU caches

Registers hold values used immediately by instructions. CPU caches retain copies of recently or predictably accessed memory in cache lines. Common designs have multiple cache levels: nearer levels are smaller/faster, and farther levels are larger/slower. Cache coherence protocols keep shared memory views coordinated across cores, but writes to the same cache line by many cores can cause ownership traffic and contention.

Two forms of locality explain why caches help:

- **Temporal locality:** data used recently is likely to be used again soon.
- **Spatial locality:** data near a recently accessed address is likely to be used soon.

Sequential array scans often exploit spatial locality and hardware prefetching. Pointer-heavy structures with scattered nodes can produce cache misses and dependent loads that limit parallelism. A cache hit is not guaranteed just because the program accessed the same object earlier; other data, threads, or capacity pressure may have displaced it.

### Main memory and virtual memory

RAM holds active process pages and the operating system’s file cache. Programs normally use virtual addresses. The memory management unit translates them to physical addresses using page tables; translation lookaside buffers (TLBs) cache recent translations. A TLB miss may require a page-table walk even when the data itself is resident in RAM.

A page fault means the requested virtual mapping needs operating-system handling. It can be a minor fault resolved without disk I/O, or a major fault requiring data to be fetched from storage, among other possibilities. A fault is not automatically a bug or a disk access. Measure fault rates and latency, and distinguish cold-start/file-backed faults from memory pressure and swapping.

### NUMA and locality across memory nodes

On a NUMA machine, CPUs and memory are organized into nodes with different access costs. A CPU may access local memory faster than memory attached to another node. Linux exposes node and locality information; placement depends on policy, affinity, allocation history, and available capacity. Thread placement and memory placement should be considered together for large, memory-intensive services. Pinning threads without considering where their pages reside can make locality worse.

### Persistent storage and the page cache

Persistent devices provide much larger capacity but higher access latency than RAM. Filesystem-backed data may be cached in RAM, so a “disk read” in an application can be served from the page cache after warm-up. Buffered writes can dirty cached pages that the kernel flushes later. The filesystem lesson explains durability; the key memory-hierarchy point is that warm and cold measurements can describe very different paths.

## Working set, capacity, and contention

The **working set** is the data a workload actively needs over a relevant time interval. If it fits in a useful cache level, repeated operations may be cheap. If it exceeds that capacity, misses and memory traffic rise; if active memory exceeds available RAM, reclaim and swapping can create severe latency. The exact transition is not a single cliff: reuse patterns, competing processes, cache associativity, prefetching, and NUMA placement all matter.

Memory bandwidth and memory latency are different constraints. A streaming workload may transfer many bytes efficiently but saturate bandwidth. A pointer chase may move little data but be limited by serial memory latency. More threads may improve throughput until they contend for cache capacity, bandwidth, memory channels, or locks; past that point, adding threads can make tail latency worse.

## Optimize by changing the access pattern

- Prefer contiguous layouts and sequential access when the algorithm permits them.
- Reuse loaded data before moving to unrelated regions; tiling/blocking can keep a working subset in cache for matrix and image workloads.
- Reduce unnecessary object indirection and memory allocation in hot paths, while keeping code maintainable.
- Avoid false sharing when independent threads update different variables on the same cache line; confirm with profiling before padding structures.
- On NUMA systems, measure locality and placement before pinning workers or allocating per-node pools.
- Do not add manual prefetching or low-level cache controls without benchmark evidence; hardware prefetch and compiler transformations may already help, and hints can hurt.

First profile: CPU cycles, cache misses, TLB misses, memory bandwidth, page faults, NUMA locality, and allocation/GC or allocator costs. Use representative data and production-like concurrency. Microbenchmarks must control warm-up, working-set size, compiler optimization, and CPU frequency behavior; a tiny array benchmark usually measures cache-resident behavior, not a large service workload.

## Cross-item comparison

| Symptom | Likely limiting layer | Useful evidence | Possible response |
|---|---|---|---|
| Many cycles stalled on dependent loads | Cache/memory latency | Cache-miss and memory-latency profiles | Improve locality, reduce pointer chasing, batch independent work |
| High throughput plateaus as threads increase | Memory bandwidth or shared resource | Bandwidth counters, scaling curve, per-node metrics | Reduce bytes moved, improve reuse, rebalance concurrency |
| Slow first access to mapped/file-backed data | Page faults or cold page cache | Major/minor fault counts and cold/warm comparison | Preload only when justified, improve startup strategy, budget cold-start latency |
| High TLB misses on large working set | Address translation pressure | TLB counters, page-size and mapping profile | Improve locality; evaluate supported large-page options carefully |
| One socket/core group is slower | NUMA placement or contention | Per-node bandwidth/latency and thread/page placement | Align worker and memory placement, measure policies |
| Latency worsens under memory pressure | Reclaim, page cache churn, swap | Memory pressure, reclaim, swap, major faults | Bound memory, reduce working set, add capacity or shed load |

These symptoms can overlap; counters are clues, not proof. Verify that an optimization improves end-to-end throughput and tail latency without unacceptable memory cost or operational complexity.

## Examples

Suppose a service scans ten million user objects to find a few matching records. A linked-object representation may touch many unrelated cache lines and incur dependent pointer loads. A compact array or indexed structure may reduce bytes and improve locality, but can increase update complexity. Benchmark both with realistic update rates and data sizes, and measure p95/p99 latency rather than relying on a small in-cache test.

Suppose a machine has two NUMA nodes and a worker pool. If all worker threads run on one node while their pages are allocated on the other, memory accesses can cross the interconnect. Compare local and remote access counters, then test a placement policy that keeps worker and data locality aligned. Validate the effect under concurrent production-like load; pinning is not automatically beneficial.

## Common mistakes

- Quoting one processor’s cache latency as universal hardware behavior.
- Equating RAM capacity with memory bandwidth or access speed.
- Assuming every page fault means storage I/O.
- Assuming a warmed file benchmark represents a cold start.
- Optimizing instruction count while ignoring cache misses and bytes moved.
- Adding threads to a bandwidth-saturated workload and expecting linear speedup.
- Pinning CPU threads without considering NUMA memory placement.
- Applying prefetch, padding, or huge-page changes without profiling and regression tests.
- Treating cache coherence as free when many cores modify the same cache line.

## Knowledge checks with answers

1. **Why can a contiguous array outperform a pointer-linked structure with the same number of values?** It tends to use fewer cache lines and better spatial locality, and lets the processor prefetch regular access patterns.
2. **Does a major-looking page-fault count tell the whole story?** No. Faults differ in cause and cost; distinguish minor faults, storage-backed faults, reclaim, and swapping using system measurements.
3. **What is the difference between latency-bound and bandwidth-bound work?** Latency-bound work waits for individual data dependencies; bandwidth-bound work moves data at a rate near the system’s transfer capacity.
4. **Why might adding threads make a workload slower?** Threads can compete for cache, memory bandwidth, NUMA links, synchronization, and scheduler resources.
5. **When is a manual cache optimization justified?** When representative profiling identifies the hierarchy as a material bottleneck and a measured change improves end-to-end results without unacceptable cost.

## Practice

A service has low CPU utilization but high p99 latency while scanning a large in-memory index. Give a diagnostic plan that distinguishes pointer-chasing latency, memory-bandwidth saturation, NUMA access, and page-cache or swapping effects. Propose one change for each diagnosis and explain how you would validate it.

**Suggested answer:** Profile representative requests with CPU stall/cache/TLB counters, memory bandwidth by node, page-fault/reclaim/swap metrics, and thread-to-memory placement. A pointer-chasing profile suggests compacting data or batching independent lookups; bandwidth saturation suggests reducing bytes read and increasing reuse rather than adding threads; remote NUMA access suggests testing aligned placement; major faults/reclaim suggest bounding the working set or increasing available memory. Compare baseline and candidate under the same data size and concurrency, report p50/p95/p99 and throughput, and retain the change only if the end-to-end result improves.
