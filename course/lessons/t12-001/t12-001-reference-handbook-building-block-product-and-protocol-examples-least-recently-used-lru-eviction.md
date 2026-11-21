# system design foundations and infrastructure building blocks — Reference: Least Recently Used (LRU) eviction

Sources: [Megiddo and Modha, ARC: A Self-Tuning, Low Overhead Replacement Cache](https://u.cs.biu.ac.il/~wisemay/2os/lru/megiddo1.pdf), [USENIX research on LRU-K and 2Q](https://www.usenix.org/legacy/event/usenix02/full_papers/burnett/burnett_html/), [Memcached modern LRU design](https://memcached.org/blog/modern-lru/).

## Scope and version

LRU is a replacement policy: when a bounded cache needs room, evict the entry whose most recent access is oldest. This lesson covers the exact-policy data structure and workload trade-offs. Production caches often use segmented, approximate, or adaptive variants to reduce contention and resist scans; do not assume a product implements perfect LRU just because it offers an “LRU” policy.

## How this group fits the mental model

A cache has limited capacity. If it fills, the system needs a rule for deciding which stored item is least valuable to keep. LRU uses recency as a practical guess: recently used data is more likely to be used again. It works well when requests have temporal locality, such as users repeatedly opening a small working set of pages.

Exact LRU maintains an ordering from most recently used (MRU) to least recently used (LRU). A successful lookup moves its entry to the MRU end. A new entry is inserted at MRU. If capacity is exceeded, the tail at LRU is removed. With a hash map from key to node and a doubly linked list of nodes, lookup and node location are expected O(1), and unlink/relink/evict are O(1). The expected qualifier comes from hash-table lookup; pointer changes in the list are constant-time once the node is known.

LRU optimizes recency, not frequency, object size, recomputation cost, time-to-live, or value. A one-time sequential scan can touch many cold entries and evict a hot working set. Exact per-hit list mutation can also create lock contention or memory overhead in a concurrent service. Large systems therefore may use sampled or segmented recency, admission filters, frequency estimates, or adaptive algorithms.

## Supplied names explained

- `Least Recently Used (LRU) eviction` — A cache policy that removes the entry with the oldest last-access time when it must reclaim space. It assumes recent access predicts future reuse.

## Cross-item comparison

| Policy | Keeps based on | Useful when | Failure mode or cost |
| --- | --- | --- | --- |
| LRU | Recency of the last access | Workload has temporal locality and the active working set fits | A scan can evict hot entries; exact updates add per-hit bookkeeping |
| FIFO | Insertion age | Simple queue discipline or low overhead matters | A frequently reused old entry can still be evicted |
| LFU | Access frequency over a measurement window | A stable popularity distribution dominates recency | New items start cold; stale popularity can persist after demand shifts; counters/windows add policy complexity |
| LRU-K / 2Q | Multiple access history or probation/protected queues | Need to reduce one-hit scan pollution, especially in buffer pools | More state and policy parameters; behavior depends on tuning/workload |
| ARC | Adaptive balance of recency and frequency signals | Mixed workloads where a fixed balance performs poorly | More complex metadata and implementation; not every cache product exposes it |
| TTL expiration | Age since insertion or explicit expiry time | Data must expire by freshness/business rule | Expiration is not a capacity replacement policy; expired data may still occupy space until removed |

Admission and eviction are separate decisions. A cache may reject a new object instead of admitting it and evicting a useful resident. This distinction is important for scan-heavy workloads.

## Examples

### Trace a capacity-three LRU cache

Start empty. Access `A`, `B`, `C`: recency is `C, B, A` (MRU to LRU). Access `A`: move it to the front, giving `A, C, B`. Insert `D`: temporarily hold four entries, then evict tail `B`, leaving `D, A, C`. A correct implementation must update both structures together: remove an evicted key from the map and unlink its node; otherwise the map can point to a node no longer in the list or memory can leak.

### Why a scan defeats plain LRU

Assume a cache holds 1,000 popular keys. A batch job reads 10,000 distinct cold keys once. Each miss is admitted and pushes the oldest item out; by the end, the original hot set may be gone. If the workload contains scans, use admission control, a separate scan cache, segmented/probationary policy, or an adaptive replacement strategy, then compare hit ratio and tail latency under representative traces.

### Account for object size and cost

If all entries count as one unit, an LRU cache with 100 objects can still exceed memory when one object is huge. Production caches often enforce a byte budget and may reject objects above a size threshold. They may also consider recomputation cost, freshness, and tenant fairness. State those constraints separately from the recency order.

## Common mistakes

- Calling a FIFO queue LRU. LRU must update recency on every successful access.
- Claiming worst-case O(1) for the whole map-plus-list operation without qualifying the hash lookup; hash table lookup is typically expected/amortized O(1), depending on implementation.
- Forgetting to remove an evicted key from the map or updating only one of the map/list structures.
- Assuming cache hit rate improves monotonically with recency under scans or phase changes.
- Using LRU to enforce freshness. TTL/version validation and eviction solve different problems.
- Ignoring byte capacity when entries have variable sizes.
- Treating a thread-safe exact LRU as free: every hit may mutate shared order and require synchronization.
- Assuming a managed cache uses the textbook exact algorithm; inspect the service's documented policy and measure the actual workload.

## Knowledge checks with answers

1. **What is the invariant in an exact LRU list?** Nodes are ordered from most recently accessed at the MRU end to least recently accessed at the LRU end; a hit moves its node to MRU.
2. **Why combine a hash map with a doubly linked list?** The map finds the node by key, and the list can unlink/reinsert that known node in constant time without searching for its predecessor.
3. **What is the complexity caveat?** List operations are O(1) given a node; key lookup and insertion are expected/amortized O(1) with a typical hash table, not a universal worst-case guarantee.
4. **Why does a one-time scan pollute LRU?** The policy admits each scanned item as recent, so those cold entries displace previously hot data.
5. **How is admission different from eviction?** Admission decides whether a miss should enter the cache; eviction decides which resident leaves when capacity is needed. Rejecting a scan item can avoid unnecessary eviction.

## Practice

Implement a capacity-bounded LRU cache with `get`, `put`, `delete`, and resize behavior. State whether capacity counts entries or bytes, define what happens for a zero/oversized value, and preserve map/list invariants on update and eviction. Then simulate a hot set followed by a scan and compare plain LRU with a probationary admission policy. Explain the expected complexity and the synchronization strategy for concurrent callers.
