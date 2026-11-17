# end-to-end system design case studies — Reference: EVCache

Sources: [HLD Handbook](https://hld.handbook.academy/), [Netflix EVCache documentation](https://netflix.github.io/EVCache/), [EVCache introduction](https://netflix.github.io/EVCache/introduction/), [EVCache features and consistency](https://netflix.github.io/EVCache/features/), [Netflix TechBlog: cache evolution](https://netflixtechblog.com/evolution-of-application-data-caching-from-ram-to-ssd-a33d6fa7a690), [Netflix EVCache releases](https://github.com/Netflix/EVCache/releases).

## Scope and version

EVCache is Netflix's open-source client and distributed cache system built around Memcached and related storage components. This lesson explains the architectural pattern and the documented EVCache behavior checked on 2026-11-17. EVCache's implementation, configuration, dependencies, deployment model, and feature set change over time; the linked project documentation and release history are the authority for a particular version. This is a case study, not a recommendation to copy Netflix's production topology.

## How this group fits the mental model

A service may need very fast access to data used repeatedly across many application instances. A cache keeps a derived or transient copy close to the application so most reads avoid a slower durable store or expensive computation. At one machine this can be a process-local map; at fleet scale it needs key distribution, failure handling, capacity planning, observability, and a clear answer to “what happens on a miss or lost write?”

EVCache builds a distributed cache service from Memcached nodes and a client library. The client discovers a set of servers, selects a shard for a key, sends operations, and can use multiple server groups or zones for resilience. This is a cache abstraction and replication strategy, not a consensus database. The documented design explicitly treats cross-zone copies as best-effort and does not promise they always converge. Applications must decide whether that consistency is acceptable for each data class.

## Supplied names explained

- `EVCache` — Netflix's distributed, in-memory cache service and client. Its documented architecture uses Memcached semantics, shards keys within server groups, and can mirror data across zones. It is intended for volatile or transient data; its presence does not imply durable persistence or strong consistency.

### Read and write path

1. **Choose a cache key.** Namespace keys by application and data type, normalize them consistently, and avoid embedding secrets or unbounded user input. Key format and maximum size are implementation constraints; check the deployed client and Memcached configuration rather than assuming all versions share identical limits.
2. **Resolve the cluster.** The client obtains server-group membership from discovery or configured bootstrap data and maintains connection pools. Discovery changes are part of the data path: removing or adding nodes may change key-to-shard assignment.
3. **Map key to shard.** Consistent hashing maps a key to a node in a group. It reduces key movement compared with naive modulo hashing when membership changes, but does not eliminate movement. During a rebalance, cold misses and increased backing-store load can occur.
4. **Read locally when possible.** EVCache documentation describes local-zone reads as the preferred path, with fallback behavior when local nodes fail. Local-first routing limits latency and cross-zone traffic, but data may differ between replicas after partial write failures or write-after-write races.
5. **Write to configured copies.** A write may be sent to multiple zones. Partial success is possible: one replica accepts the value while another times out or rejects it. The caller must understand the operation's success policy; “the client returned” should not be mistaken for durable, globally consistent commit.
6. **Handle miss and expiration.** On a miss, load or recompute from the authoritative source, then populate the cache with an expiration policy suited to the data. Use request coalescing or a bounded refresh strategy for popular expired keys so many simultaneous misses do not stampede the backing store.
7. **Observe and repair.** Track hit/miss rate, timeout/retry rates, per-zone errors, queue depth, latency percentiles, evictions, memory pressure, replication inconsistency, and downstream load. Reconciliation or retry mechanisms may reduce divergence, but the application must define what value is authoritative and how conflicting versions are resolved.

## Cross-item comparison

This group contains one named item, so no within-group comparison applies. For a design choice, distinguish EVCache-like replicated cache from a durable database, a single-node Memcached deployment, and an application-local cache. A durable database offers persistence and stronger transactional tools at higher latency/cost; plain Memcached provides a simpler in-memory key/value building block without EVCache's client-managed multi-zone behavior; a local cache avoids network hops but is private to one process and can diverge across instances. These are different layers and can be combined.

Use a cache when the system can tolerate expiration, eviction, recomputation, or source reload, or when it has an explicit persistence/repair strategy for data whose loss is unacceptable. If the cache becomes the only copy of important state, the design has made it a database regardless of its name. Revisit durability, backup, recovery, consistency, and operational guarantees accordingly.

## Examples

### Catalog metadata

A product-catalog service reads relatively stable item details from a durable database and caches them by item ID. A short or bounded TTL limits how long an old value can remain after a catalog update. Cache misses load from the source of truth. If the cache is unavailable, the service protects the database with rate limits and request coalescing rather than allowing unlimited fallback traffic. A deletion needs a tombstone or invalidation policy so a stale cached item does not reappear after a miss race.

### Cross-zone partial write

An update is sent to two zone replicas. Zone A accepts it; zone B is unavailable. A reader in zone A sees the new value while a reader in B may see the old value or a miss. The system must not tell users that this is globally committed if the operation only achieved one replica. Depending on the product, it may return a degraded success, retry asynchronously, emit a repair event, or fail the update. For account balances or inventory reservations, use a transactional authority and treat the cache as a projection; do not use best-effort cache replication as the invariant-enforcing write path.

### Node replacement and cache warming

When a node is added, removed, or replaced, key ownership shifts. Plan capacity and rollout to avoid making a cold cluster send a surge of reads to the database. Use staged membership changes, warm only predictable high-value keys, cap refresh concurrency, and measure the backing store during the transition. If cache clients retain stale topology, ensure discovery and connection refresh behavior is understood and observable.

## Common mistakes

- Treating replicas as a consensus protocol or assuming every successful local write is globally visible.
- Using an ephemeral cache as the only authoritative copy without a tested durability and recovery design.
- Retrying writes without considering duplicate effects, stale values, or a concurrent newer write.
- Assuming consistent hashing causes no misses when cluster membership changes.
- Letting cache failure send unbounded traffic to the backing database.
- Setting long TTLs without invalidation/versioning when stale values can cause harmful decisions.
- Ignoring hot keys, large values, serialization cost, memory fragmentation, and client-side queues.
- Using cache hit rate alone as the success metric; a high hit rate can coexist with stale data, tail-latency failures, or severe miss storms.
- Copying historical Netflix throughput, latency, or cluster-size numbers as current guarantees for a different deployment.

## Knowledge checks with answers

1. **Is EVCache a strongly consistent database?** No. Its documentation describes best-effort replicated cache behavior and explicitly makes no general consistency guarantee.
2. **What is the source of truth for cached catalog data?** The durable catalog store; the cache is a derived copy that can expire, be evicted, or be unavailable.
3. **What can happen after a partial multi-zone write?** Different zones can temporarily return different values or a miss. The application needs a success policy, versioning or conflict rules, and repair behavior.
4. **Does consistent hashing remove cache misses on scale changes?** No. It reduces key remapping compared with simple modulo schemes, but changed membership still moves some keys and can create a cold-cache load spike.
5. **How do you prevent a cache outage from taking down the database?** Bound concurrency and retries, coalesce identical misses, use load shedding or stale responses where safe, and test fallback behavior under realistic failure.

## Practice

Design a regional cache for user profile display data. State which fields may be stale, the durable source of truth, key and TTL policy, read/write behavior across zones, invalidation approach, and cache-outage fallback. Then explain why the same design would be unsafe for a payment balance and identify the consistency or transaction mechanism that should own that invariant.
