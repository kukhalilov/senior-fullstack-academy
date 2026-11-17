# system design foundations and infrastructure building blocks — Reference: TinyLFU eviction

Sources: [Einziger, Friedman, and Manes, TinyLFU: A Highly Efficient Cache Admission Policy](https://arxiv.org/abs/1512.00727), [Caffeine cache design](https://github.com/ben-manes/caffeine/wiki/Efficiency), [Caffeine simulator and policy notes](https://github.com/ben-manes/caffeine/wiki/Simulator).

## Scope and version

TinyLFU is an admission policy that estimates recent access frequency to decide whether a new candidate should displace a resident. It is commonly composed with a separate eviction policy. Window TinyLFU is a composition that adds a small recency window before the main cache. Implementations vary in sketch structure, aging cadence, window sizing, concurrency strategy, and tie-breaking; verify the library or cache product you use.

## How this group fits the mental model

LRU answers “which resident looks oldest?” but a one-time scan can make every cold item look recent and evict the hot working set. TinyLFU adds a different question at admission time: “has this candidate been requested enough recently to justify displacing the current victim?”

An exact frequency count for every key ever observed would consume unbounded memory. TinyLFU uses a compact approximate frequency sketch for a recent history window. In the original design, a Count-Min Sketch-like structure uses hashed counters; collisions can overestimate an item's count, so the estimate is approximate rather than an exact truth. The sketch is periodically aged (the original design uses counter halving after a sample of accesses) so old popularity fades and new demand can emerge. Compactness is traded for estimation error and a bounded memory footprint.

At a full cache miss, the cache compares the candidate's estimated recent frequency with an eviction candidate's estimate. If the newcomer is less popular, reject it and keep the resident; otherwise admit it and evict the victim. The exact cache policy still determines who the victim is. TinyLFU therefore complements LRU or another replacement policy; it does not itself define the full order of residents.

Window TinyLFU handles a weakness of pure frequency admission: a genuinely new item can be popular quickly but starts with a low estimate. A small recency window lets new arrivals enter temporarily. When that window fills, its outgoing candidate competes with a main-cache victim using TinyLFU's frequency estimate. This gives a bursty new item a chance while filtering one-hit scan items from the larger protected region.

## Supplied names explained

- `TinyLFU eviction` — Frequency-based admission using a compact, aging estimate of recent request counts; it is paired with another policy that chooses the eviction victim.

## Cross-item comparison

| Policy/composition | Admission | Resident eviction/order | Strength and cost |
| --- | --- | --- | --- |
| Plain LRU | Usually admits every miss | Oldest last access leaves | Simple and responsive, but scans can flush a hot set |
| TinyLFU + LRU | Compares approximate candidate frequency with an LRU victim | LRU chooses the victim | Rejects weak one-hit candidates; sketch adds memory and estimation error |
| Window TinyLFU | Small recency window first; then candidate competes by frequency | Window recency plus a main cache policy, commonly segmented LRU | Balances burst recency and long-run popularity; has a tunable window and more implementation complexity |
| LFU | Often admits misses and maintains resident frequency | Lowest frequency leaves | Exact counters can be costly and stale counts need aging; cold-start behavior matters |
| ARC | Adapts between recency and frequency history | Adaptive replacement lists | Self-tunes under changing workloads, with more state and a different policy model |

## Examples

### Reject a scan candidate

Assume the cache holds popular keys `A`, `B`, and `C`; their recent estimates are high. A batch job asks for a previously unseen key `Z`. Plain LRU admits `Z` and may evict a useful entry. TinyLFU compares `Z`'s low estimate with the selected resident victim and rejects `Z`, leaving the working set intact. If `Z` becomes repeatedly popular, its estimate rises and future admission can succeed.

### Let a bursty new key get a chance

Suppose a new breaking-news article is requested by many users in a short burst. A pure frequency gate may initially reject it because its estimate starts low. Window TinyLFU places it in the recency window; repeated hits keep it there or raise its estimate. When the item competes for the main region, its burst history can beat a less relevant victim.

### Understand aging and phase change

Yesterday's popular keys should not dominate forever after demand changes. Periodically reducing sketch counters lets old counts decay. Too-slow aging adapts poorly to a new workload phase; too-fast aging forgets useful history and may admit scans. Tune from request traces and measure hit rate, byte hit rate, backend load, and tail latency rather than copying a parameter blindly.

## Common mistakes

- Calling TinyLFU an eviction order. It is principally an admission decision; another policy selects which resident is the victim.
- Treating sketch estimates as exact counts. Hash collisions cause approximation, often overestimation.
- Omitting aging and letting historical popularity persist indefinitely.
- Combining TinyLFU with unconditional admission and expecting it to prevent scan pollution.
- Rejecting all new items until they are already frequent; a recency window helps legitimate bursts and new hot keys.
- Assuming Window TinyLFU's default window size or segment proportions are optimal for every workload.
- Evaluating only entry hit ratio when values have very different sizes or backend costs. Measure byte hit ratio and cost-weighted misses as well.
- Using benchmark results from one workload as a universal ranking. Zipf skew, scans, bursts, phase changes, object size, and cache size alter the winner.

## Knowledge checks with answers

1. **Does TinyLFU decide which resident is evicted?** Not by itself. The cache's eviction policy chooses a victim; TinyLFU decides whether the incoming candidate merits admission relative to that victim.
2. **Why is the frequency sketch approximate?** It hashes keys into a small number of counters; collisions mean distinct keys can affect the same counters.
3. **Why age the counters?** To make the estimate represent recent popularity and adapt when the workload changes, instead of preserving lifetime frequency forever.
4. **What problem does the Window component solve?** It gives new or bursty items a small recency-based opportunity before they must win a frequency comparison for the main cache.
5. **What metrics should be used to compare cache policies?** Hit rate, byte hit rate, backend requests/cost, latency distribution, memory/metadata overhead, and behavior during scans and workload phase changes.

## Practice

Simulate a cache with a stable hot set, a long one-time scan, and a burst of new popular keys. Compare LRU, TinyLFU admission with LRU victim selection, and Window TinyLFU. Track each candidate/victim estimate, admission decision, and resulting hit ratio. Then vary sketch aging and window size, explaining how each changes scan resistance, cold-start behavior, and adaptation speed.
