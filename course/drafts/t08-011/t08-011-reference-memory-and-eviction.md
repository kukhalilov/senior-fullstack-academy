# caching Redis invalidation eviction and stampede — Reference: Redis memory limits and the current eviction policy catalogue

Sources: [Redis key eviction](https://redis.io/docs/latest/reference/eviction/), [Redis 8.6 release notes](https://redis.io/docs/latest/operate/oss_and_stack/stack-with-enterprise/release-notes/redisce/redisos-8.6-release-notes/), and [Redis keyspace](https://redis.io/docs/latest/develop/using-commands/keyspace/).

## Scope and version

This catalogue reflects Redis Open Source 8.10, the latest GA release; docs checked 2026-11-20. LRM was introduced in 8.6. Policy names describe candidate/selection behavior, not exact deterministic eviction order; implementation uses approximations and version/product details matter.

## How this group fits the mental model

TTL makes entries eligible for expiration at their deadline. `maxmemory` pressure invokes an eviction policy to reclaim space, or rejects writes under noeviction. Policies differ both in which keys are candidates and what signal selects a candidate. Choose only when the data can tolerate removal.

## Supplied names explained

| Name | Purpose and behavior |
|---|---|
| `Redis maxmemory` | Configured memory threshold at which Redis applies the selected policy. Payload is not total process memory; account for buffers, allocator fragmentation, replication/persistence overhead, clients, and deployment headroom. |
| `Redis maxmemory-policy` | Configuration selecting eviction/rejection behavior after memory pressure. The default can vary by Redis/product/configuration; inspect the actual instance. |
| `Redis noeviction` | Does not remove existing keys to make room; writes requiring additional memory fail. It preserves cache entries but can break writes under pressure. |
| `Redis allkeys-lru` | Candidates include all keys; approximates least-recently-used removal. Good where access recency predicts reuse and all keys are disposable. |
| `Redis allkeys-lfu` | Candidates include all keys; removes low-frequency candidates using Redis's approximate LFU policy. Frequency decay/configuration affects interpretation. |
| `Redis allkeys-lrm` | Redis 8.6+: candidates include all keys; uses least-recently-modified time, updated on writes rather than reads. Useful when read-heavy old data should remain but unchanged entries are stale. |
| `Redis allkeys-random` | Candidates include all keys; selection is random, appropriate only when access probability is relatively uniform or exact recency/frequency is not valuable. |
| `Redis volatile-lru` | Only keys with expiration are candidates; selects approximate least-recently-used among them. Non-expiring keys are protected. |
| `Redis volatile-lfu` | Only expiring keys are candidates; selects approximate least-frequently-used among them. |
| `Redis volatile-lrm` | Redis 8.6+: only expiring keys are candidates; selects by least-recently-modified time. |
| `Redis volatile-random` | Selects a random key among those with expiration. |
| `Redis volatile-ttl` | Selects expiring keys with shortest remaining TTL as eviction candidates. This follows deadline proximity rather than access pattern. |
| `LRU eviction` | Least-recently-used policy uses access recency as a proxy for future reuse. Redis samples candidates, so it is approximate, not a globally exact linked-list LRU. |
| `LFU eviction` | Least-frequently-used policy estimates access frequency with aging/decay so historical popularity can fade. It may suit repeated hot keys better than recency alone. |
| `LRM eviction` | Least-recently-modified policy (Redis 8.6+) treats writes, not reads, as recency. It can preserve frequently read but rarely updated reference data. |
| `Random eviction` | Selects a candidate randomly; avoids tracking access metadata but can discard a hot item and offers no workload-aware protection. |
| `TTL-based eviction` | Chooses among expiring keys by remaining time; a short TTL is not necessarily low value, so this policy may evict data still actively needed. |
| `All-key versus volatile-key eviction candidate set` | `allkeys-*` includes keys regardless of TTL; `volatile-*` includes only expiring keys. Volatile policies behave like noeviction when no keys have TTL. |
| `Eviction versus expiration` | Expiration follows an entry's configured deadline; eviction is memory-pressure policy and can happen before TTL. A cache miss may result from either. |
| `Cache miss after eviction` | Normal consequence when an entry is removed under pressure. Rebuild from source, control stampede, and ensure the source can sustain the miss load. |
| `Memory overhead of key expiration metadata` | TTL requires metadata and uses memory. `allkeys-*` avoids needing TTL metadata as a candidate constraint, though TTL may still serve freshness. |
| `Redis maxmemory-samples` | Tunes sample count for approximate LRU/LFU/LRM eviction selection: more candidates can improve selection quality at additional work. Benchmark rather than assuming exactness. |
| `Cache capacity headroom` | Memory reserved for fragmentation, buffers, spikes, replication/persistence, and non-key use. Setting the limit at physical RAM can cause OS/container OOM before policy behaves safely. |
| `Eviction metric` | Track evicted-key count/rate, memory used versus limit, rejected writes, hit rate, and source load. Rising evictions can signal bad TTL/capacity or a stampede risk. |
| `OOM write rejection under noeviction` | Memory-required writes return an out-of-memory error when noeviction reaches its limit. Handle it explicitly; it is not a transient success. |
| `Durable-key separation from evictable cache keys` | Keep authoritative durable data isolated in a separate instance/database/service or carefully selected noeviction deployment. Mixing business-critical keys with cache eviction can silently remove data. |

## Cross-item comparison

`allkeys` and `volatile` define the eligible population; LRU/LFU/LRM/random/TTL define how candidates are selected. Expiration is time-based invalidation; eviction is capacity-based removal. `noeviction` preserves keys but rejects memory-growing writes. None of these policies substitutes for correct source ownership.

## Examples

For disposable product-page values, `allkeys-lfu` may be reasonable if recurring frequency predicts reuse; measure hit rate and evictions. For a shared instance containing expiring cache keys plus persistent control keys, a volatile policy can protect persistent keys, but can become noeviction when none expire. Prefer separate instances when cache and durable state have incompatible memory/failure contracts.

## Common mistakes

- Assuming `volatile-*` always evicts something even when no key has TTL.
- Treating approximate LRU/LFU/LRM as exact policy ordering.
- Setting `maxmemory` equal to available machine RAM with no overhead/headroom.
- Believing TTL prevents early removal under memory pressure.
- Mixing authoritative data with an allkeys eviction policy.
- Ignoring OOM errors under `noeviction` or retrying writes without relieving pressure.

## Knowledge checks with answers

1. **Why can a volatile policy reject writes?** If no expiring keys are eligible, it behaves like noeviction.
2. **How does LRM differ from LRU?** LRM ages on modification/write, while LRU ages on access, including reads.
3. **Can an entry be evicted before TTL?** Yes, memory-pressure eviction may remove it early.
4. **What does noeviction promise?** No eviction; it does not promise unlimited capacity, so new writes can fail.

### Exact terms covered

- `Redis maxmemory`
- `Redis maxmemory-policy`
- `Redis noeviction`
- `Redis allkeys-lru`
- `Redis allkeys-lfu`
- `Redis allkeys-lrm`
- `Redis allkeys-random`
- `Redis volatile-lru`
- `Redis volatile-lfu`
- `Redis volatile-lrm`
- `Redis volatile-random`
- `Redis volatile-ttl`
- `LRU eviction`
- `LFU eviction`
- `LRM eviction`
- `Random eviction`
- `TTL-based eviction`
- `All-key versus volatile-key eviction candidate set`
- `Eviction versus expiration`
- `Cache miss after eviction`
- `Memory overhead of key expiration metadata`
- `Redis maxmemory-samples`
- `Cache capacity headroom`
- `Eviction metric`
- `OOM write rejection under noeviction`
- `Durable-key separation from evictable cache keys`
