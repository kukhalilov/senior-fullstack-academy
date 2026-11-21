# caching Redis invalidation eviction and stampede — Exercises and worked solutions

Sources: [Redis cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/), [Redis eviction](https://redis.io/docs/latest/reference/eviction/), [Redis transactions](https://redis.io/docs/latest/develop/using-commands/transactions/), [Redis pipelining](https://redis.io/docs/latest/develop/using-commands/pipelining/), and [Redis client-side caching](https://redis.io/docs/latest/develop/reference/client-side-caching/).

## Goals

By completing these exercises, you should be able to design a cache-aside path with a stated freshness bound, diagnose invalidation races, protect the source from a hot-key stampede, choose an eviction policy compatible with data durability, and distinguish pipelining from atomic execution.

## Worked example

Assume a product page is read 400 times per second, the authoritative database read takes 35 ms, and the Redis lookup takes 2 ms. A cache entry is allowed to be stale for at most 30 seconds. The page changes infrequently.

1. Build a key from product ID plus representation version, such as `product:v3:42`.
2. On a hit, return the cached representation and record its age.
3. On a miss, load the database once per process/key when possible, populate Redis with an expiry no greater than the stated 30-second freshness bound, and return the source result.
4. On an update, commit the database write first, then invalidate the Redis key. If invalidation fails, record/retry it through a durable mechanism or rely on a deliberately accepted TTL bound; do not claim immediate coherence.
5. Add request coalescing for the hot key so concurrent misses share one source load. If cross-process coordination is necessary, use an expiring lock with a random owner token and compare-and-delete release.
6. Monitor stale age, source-load amplification, miss ratio, eviction count, and latency percentiles. A high hit ratio is useful only if it does not hide stale data or an overloaded miss path.

At 400 requests/second, one cold miss that fans out to every caller could produce about 400 simultaneous database reads. The goal of coalescing is to keep source work near one refresh per key per refresh interval, not to promise exactly one request under every failure and timeout.

## Exercises

### Exercise 1 — Choose a cache model

A dashboard can tolerate data up to 20 seconds old. Reads are frequent; writes are uncommon. Name a suitable starting cache model, freshness mechanism, and one failure fallback. Explain why a TTL alone does not imply read-your-writes behavior.

### Exercise 2 — Diagnose out-of-order fill

Request A misses and starts loading version 12 from the database. A writer commits version 13 and invalidates the cache. Then A finishes and writes version 12 into the cache with a 60-second TTL. Explain the race and give two ways to prevent or bound it.

### Exercise 3 — Pick an eviction policy

One Redis instance stores both disposable page cache keys and a durable job state key. Memory reaches `maxmemory`. What is unsafe about choosing a volatile-only policy and assuming the job key is protected? Propose a safer keyspace/deployment policy.

### Exercise 4 — Reduce stampede amplification

One hot key expires simultaneously for many web workers. Compare per-process single-flight, a distributed refresh lock, stale-while-revalidate, and TTL jitter. For each, say what failure or stale-data tradeoff it introduces.

### Exercise 5 — Select a Redis execution mechanism

You need 30 unrelated `GET`s; then separately, you need to check a version and conditionally update two keys. Which approach fits each case among individual commands, a pipeline, `WATCH`/`MULTI`/`EXEC`, and a Lua script or Function? State the cluster key constraint to consider.

### Exercise 6 — Plan local client cache recovery

An application uses server-assisted client-side caching. Its tracking connection drops for 10 seconds, while local entries have no TTL. What should happen on disconnect/reconnect? How does a maximum local TTL change the guarantee?

## Progressive hints

1. Think of the staleness allowance as a contract. The cache model must include both reads and writes.
2. The old response is not made safe merely because invalidation happened later in wall-clock time. Compare generation/version values at fill time.
3. Ask whether every key can safely disappear. A volatile policy only considers keys with expirations, not “important” business meaning.
4. Local single-flight only coalesces within one process. A distributed lock introduces lease expiry and owner-release concerns.
5. Pipelines batch transport; watched transactions detect intervening writes; a script can execute a short check-and-update atomically.
6. Missed invalidations mean local values are untrusted. Flush potentially stale entries; a TTL gives a maximum stale window if a notice is lost.

## Complete solutions

### Solution 1

Cache-aside is a reasonable starting model: the application loads on misses, and the source remains authoritative. Set a TTL at or below 20 seconds, and invalidate after a successful source write if practical. On cache failure, bypass it and read the source only if the source can handle the resulting load; otherwise use a controlled stale fallback or fail safely. TTL bounds age but a client that has just written may still read a cached pre-write value until invalidation or expiry, so read-your-writes needs a version check, write-through update, bypass, or explicit consistency mechanism.

### Solution 2

The miss read began before the write, but its late fill overwrote the newer state after invalidation. One prevention is generation-based keys: the writer advances a version, and readers fill only the key for the version they observed; old fills land under an old version and are no longer addressed. Another is to compare a generation token atomically in a script before writing. Shorter TTL only bounds the damage; it does not prevent the stale fill. A lock that serializes refresh and writes can help but is more coordination and must have safe ownership/lease behavior.

### Solution 3

A volatile-only policy evicts only keys with an expiry. A job key without TTL may remain unevictable while cache entries with TTLs are candidates; when there are no eligible keys, writes can be rejected instead of evicting the durable state. The safest design separates authoritative job state from disposable cache storage (often separate Redis instances/roles). If co-located, make the durability and eviction policy explicit and ensure no-eviction errors are handled; a TTL is not a semantic protection mechanism.

### Solution 4

- Per-process single-flight shares refresh among callers in one worker, but several workers can still refresh concurrently.
- A distributed lock can reduce cross-process duplication, but lease expiry, process pauses, and lock release races can permit duplicate refreshes. Use a random token, finite TTL, compare-and-delete release, and treat the source operation as idempotent.
- Stale-while-revalidate serves an older value during one background refresh, trading freshness for load stability; cap stale age and define behavior after refresh failure.
- TTL jitter spreads expirations over time, reducing synchronized misses; it does not coalesce a single hot key after it does expire.

Combine methods only when their additional complexity is justified by measured source-load risk.

### Solution 5

For 30 unrelated reads, pipeline the `GET`s to reduce round trips. For the conditional two-key update, use a transaction with `WATCH` if optimistic retry is acceptable, or a short script/Function if the decision and mutation must be one server-side atomic operation. Individual commands are simplest but cannot preserve a multi-command invariant. In Redis Cluster, keys touched by a multi-key operation generally need to map to the same hash slot unless the specific feature/context documents otherwise; declare all script/function keys explicitly and design hash tags where appropriate.

### Solution 6

Flush local entries that might have missed invalidations as soon as the tracking channel is known lost. Re-establish tracking before repopulating trusted entries. With a maximum local TTL, a missed invalidation can leave stale data only until that bound, assuming the application enforces it; the TTL does not restore immediate consistency. Reconnect and flush events should be observable.

## Tests and edge cases

- Source write succeeds, cache invalidation fails.
- Cache value expires while multiple callers miss concurrently.
- Old source load completes after a newer write and invalidation.
- Lock holder pauses beyond its lease, then resumes.
- Cache is unavailable and all requests fall through to the source.
- Memory reaches `maxmemory` under `noeviction` or when volatile candidates are absent.
- `WATCH` transaction aborts repeatedly under contention.
- Tracking connection disconnects while invalidations are being sent.
- A large pipeline or script increases tail latency despite reducing round trips.

## Reflection questions

1. What is the actual maximum tolerated stale age for each cached value?
2. Which component owns invalidation retries after a database commit?
3. Can the authoritative store tolerate a full cache cold start?
4. Which metrics reveal duplicate work, not just cache hit ratio?
5. What would make a cached value unsuitable for Redis eviction?
