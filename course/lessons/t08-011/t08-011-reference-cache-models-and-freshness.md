# caching Redis invalidation eviction and stampede — Reference: Cache layers, data flow, hit behavior, and freshness policy

Sources: [Redis cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/) and [Minimize coordination](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/minimize-coordination).

## Scope and version

These are general caching patterns. Freshness guarantees depend on the source, write ordering, cache implementation, and failure policy; a TTL alone does not provide strong consistency.

## How this group fits the mental model

The cache is a copy optimized for repeated access. Key construction decides which requests share the copy; hit/miss behavior decides when to consult the source; expiration/invalidation decide when to stop serving the copy; failure policy decides whether absence or unavailability is safe.

## Supplied names explained

### Cache

A storage layer holding reusable results/data, typically faster or closer than the authoritative source. Treat it as disposable unless durability and ownership explicitly say otherwise.

### Cache key

Identifier for one cached representation. Include every result-affecting dimension and avoid collisions; use controlled normalization and privacy-safe values.

### Cache value

Stored serialized/object representation plus optional metadata such as version, creation time, or source revision. Schema changes require compatibility/versioning.

### Cache hit

Requested key is present and eligible under the freshness policy. A hit can still be stale if the invalidation contract permits a window.

### Cache miss

No eligible entry exists; load from a source or return a defined absence/failure. Concurrent misses may amplify source traffic.

### Cache hit ratio

Hits divided by lookups over a defined interval, often split by key family. It is not sufficient alone: a high ratio can serve stale/wrong data, and a low ratio may be expected for one-time reads.

### Cache working set

Data reused often enough to remain valuable within available memory/TTL. Measure actual frequency and size distribution before capacity choices.

### Cache locality

Likelihood that a request reuses recently accessed data, within a node/region/process. Poor locality lowers hit rate or creates uneven hot shards.

### Cache-aside (lazy loading)

Application checks cache, loads source on a miss, writes cache, and returns the result. It is simple but needs invalidation, miss coalescing, and stale-fill handling.

### Read-through cache

Cache layer owns source loading on miss behind a read API. It centralizes cache behavior but may hide source failures and cache lifecycle unless exposed clearly.

### Write-through cache

Write path updates cache and source synchronously according to a defined ordering/consistency contract. It can keep copies aligned but couples write availability/latency to both systems.

### Write-behind (write-back) cache

Accepts writes to cache and persists them to the source asynchronously. It lowers synchronous write cost but needs durable change tracking, ordering, retry, conflict, and loss recovery.

### Cache population

Creation/update of an entry from a source or write path. Ensure a late load cannot overwrite newer data after invalidation; use version/generation checks where needed.

### Cache invalidation

Removing or marking stale an entry when its source changes. Invalidation is itself a message/action that can fail or race with concurrent fills.

### Explicit invalidation on write

After a successful source update, delete/update relevant keys. Commit-before-delete risks stale data if deletion fails; delete-before-commit risks a concurrent stale repopulation. Choose ordering and bound the gap.

### Time-to-Live (TTL)

Configured lifetime after which a key is considered expired. It bounds serving policy but physical removal may happen later and the value may be outdated before expiry.

### Absolute expiration

Expiration at a fixed timestamp, useful when entries share a business deadline. Clock skew and synchronized expiration bursts need attention.

### Sliding expiration

Expiry is extended as the key is accessed. It keeps hot values alive but may retain rarely changed data indefinitely and increase read/write metadata work.

### TTL-bounded staleness

Design that relies on max entry lifetime to bound stale serving, assuming source updates are eventually reflected by reloading. TTL starts when a value is cached, not necessarily at the source commit.

### Staleness budget

Maximum age/divergence the application can tolerate, including refresh delay, invalidation propagation, clock/cache behavior, and replicas. Tie it to user-visible behavior and alerting.

### Negative caching

Caches absence/errors (such as not-found) to avoid repeated misses. Use short TTL and invalidate on creation; never cache transient infrastructure failures as permanent absence by default.

### Cache bypass

Read directly from the source or skip population, for diagnostics, forced freshness, or targeted operations. Guard source capacity and make bypass explicit rather than accidental.

### Cache failure fallback

Behavior when cache is unavailable: source fallback, stale local copy, degraded response, or rejection. Protect the origin with bulkheads, rate controls, and fallback limits to avoid cascading overload.

### Source-of-truth data store

Authoritative store that owns durable business state. A cached copy should be reconstructible from it unless the system explicitly assigns durable authority to the cache.

### Cache consistency window

Time/read paths during which cache and source may disagree after an update. Document maximum expected duration and detection/recovery behavior.

### Cache key namespace

Prefix/structure organizing keys by application, entity, tenant, or version. It supports cleanup, isolation, and migration, but should not encourage wide key scans on hot production paths.

## Cross-item comparison

Cache-aside delegates miss logic to application code; read-through encapsulates it in a cache layer. Write-through couples writes to both stores, while write-behind defers source persistence and increases recovery obligations. TTL expiration is time-driven; explicit invalidation is change-driven and can race.

## Examples

Cache a public product view under `catalog:v5:product:42` with a 5-minute TTL. After updating source data, invalidate the versioned key after commit. A late pre-update loader should not be allowed to repopulate stale content; compare source revision or write under a revisioned key. Cache not-found for a few seconds only if product creation invalidates it.

## Common mistakes

- Treating every cache hit as fresh.
- Building keys that omit locale, tenant, permissions, or query filters.
- Caching source timeouts as a long-lived negative result.
- Applying sliding expiration when stale content can then survive without limit.
- Falling back to the database with unbounded concurrency when Redis fails.

## Knowledge checks with answers

1. **What does TTL guarantee?** An expiry policy for a cache entry, not freshness at every read.
2. **Why version keys?** They prevent a late fill for an old source revision from replacing the current representation.
3. **Why measure hit ratio by key family?** Aggregate ratio can hide a hot workload with poor locality or incorrect cache behavior.

### Exact terms covered

- `Cache`
- `Cache key`
- `Cache value`
- `Cache hit`
- `Cache miss`
- `Cache hit ratio`
- `Cache working set`
- `Cache locality`
- `Cache-aside (lazy loading)`
- `Read-through cache`
- `Write-through cache`
- `Write-behind (write-back) cache`
- `Cache population`
- `Cache invalidation`
- `Explicit invalidation on write`
- `Time-to-Live (TTL)`
- `Absolute expiration`
- `Sliding expiration`
- `TTL-bounded staleness`
- `Staleness budget`
- `Negative caching`
- `Cache bypass`
- `Cache failure fallback`
- `Source-of-truth data store`
- `Cache consistency window`
- `Cache key namespace`
