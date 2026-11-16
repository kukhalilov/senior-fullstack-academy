# caching Redis invalidation eviction and stampede — Reference: Hot-key expiration, duplicate source loads, and refresh coordination

Sources: [Redis cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/), [Redis SET](https://redis.io/docs/latest/commands/set/), [Redis DELEX](https://redis.io/docs/latest/commands/delex/), and [Redis key expiration](https://redis.io/docs/latest/develop/using-commands/keyspace/).

## Scope and version

This lesson applies general cache-stampede patterns to Redis. `DELEX` is available in Redis Open Source 8.4+ for conditional deletion; older versions need an atomic script/transactional compare-delete. A Redis lock is coordination for duplicate refresh work, not automatically a general-purpose correctness lock for arbitrary business side effects.

## How this group fits the mental model

The goal is to bound origin work when an important key disappears or refreshes. Collapse duplicate requests where coordination scope allows, spread expirations, or serve acceptable stale content. Make stale-fill prevention independent from assumptions that a worker finishes before its lease.

## Supplied names explained

| Name | Purpose and behavior |
|---|---|
| `Cache stampede` | Many requests load/regenerate the same missing or expired key at once, overwhelming the source and increasing latency. |
| `Thundering herd` | Broader burst of clients waking or retrying together, often after one expiry/outage; synchronized TTLs can trigger it. |
| `Hot key` | Key with disproportionately high request volume. Its expiry, eviction, or refresh causes more impact than an ordinary miss. |
| `Concurrent cache miss` | Several requests observe one absent key before any fill completes and all query the origin unless coalesced. |
| `Single-flight request coalescing` | One in-process load per key is shared among concurrent callers. It reduces local duplication but does not coordinate separate app instances. |
| `Per-key refresh lock` | Distributed coordination allowing one worker to refresh a key while others wait, serve stale, or use another fallback. Lock scope and failure behavior must be bounded. |
| `SET NX PX lock acquisition` | Atomic create-if-absent plus lease expiry; store a unique owner token as the value. Never acquire then set TTL in a second command. |
| `Lock expiration` | Lease ends after a timeout, permitting recovery if owner crashes. If work outlives it, a second owner may start while the first still runs. |
| `Lock owner token` | Random unique token proving which worker acquired a lock. Compare it before deleting; do not use a constant shared value. |
| `Compare-and-delete lock release` | Atomically removes a lock only when its current token matches. Redis 8.4 `DELEX key IFEQ token` can do this; use a script/conditional operation on older versions. |
| `Stale-while-revalidate` | Serve an expired-but-still-acceptable value while one refresh runs in background. Separate freshness expiry from hard-stale cutoff and mark age if the UI needs it. |
| `Probabilistic early expiration` | Requests near expiry probabilistically trigger refresh before hard expiry, distributing work over time. Tune probability/refresh cost; it may do extra origin reads. |
| `TTL jitter` | Add random variation to TTLs so many entries do not expire at the same instant. Preserve a maximum staleness bound; jitter must not exceed it. |
| `Refresh-ahead cache` | Refreshes popular entries before expiry using demand/schedule signals. It can reduce miss latency but may refresh unused data and needs failure fallback. |
| `Refresh failure fallback` | If refresh fails, keep serving prior data only within a defined stale budget or return a failure/degraded response. Do not overwrite a good value with an error placeholder. |
| `Cache stampede source-load amplification` | Ratio/count of origin loads caused by one logical hot-key miss/refresh. Track it to detect herds before the origin saturates. |
| `Dogpile effect` | Common name for concurrent regeneration of an expired cache item; same fundamental failure mode as a stampede. |
| `Cache warm-up` | Preloads likely-hot values during startup/deploy to avoid cold misses. Limit concurrency/rate and avoid stale data or synchronized work across replicas. |
| `Cache key versioning` | Put source/schema generation in the key so a new version does not share old cached representation. Old versions still need TTL/cleanup. |
| `Invalidation-before-source-commit race` | Delete cache, then source commit fails or a reader refills from old source before commit; stale entry may exist after failed write or refill. |
| `Source-commit-before-invalidation failure window` | Source commit succeeds but invalidation is lost/fails, leaving old cache data until expiry/repair. Outbox-style durable invalidation or versions may close loss risk. |
| `Out-of-order cache fill after invalidation` | A request that read old source state completes after a newer write invalidates the key and then repopulates old data. |
| `Stale-fill prevention with generation token` | Associate a cache/source generation with the load and only publish if it still matches current generation. A monotonic fencing/version check prevents late old work from replacing newer data. |

## Cross-item comparison

Single-flight covers one process; a Redis lock covers cooperating clients sharing that Redis. Stale-while-revalidate serves old content; refresh-ahead tries to avoid reaching expiry. TTL jitter spreads expiration times, whereas probabilistic early expiration makes refresh decisions probabilistically based on request timing/cost. A lock reduces duplicate work but a generation/fencing check protects against stale writes after lock expiry.

## Examples

For a popular product key, requests use local single-flight and a distributed refresh lease with `SET NX PX` plus random token. Other requests can receive the previous value for up to a bounded stale window. The refresher reads source revision 19 and writes only if generation still equals 19; a concurrent product update increments to 20 and invalidates. Conditional release uses `DELEX ... IFEQ ownerToken`. If refresh runs longer than the lease, a second refresher may start, but the generation check prevents revision 19 from replacing 20.

## Common mistakes

- Assuming a lock's expiry cancels the original worker.
- Releasing a lock with unconditional `DEL` after it may have expired/reacquired.
- Using the lock as a correctness guard for side effects when lease loss can allow concurrent work.
- Serving stale values indefinitely after repeated refresh failure.
- Applying jitter without a firm maximum freshness bound.
- Using local single-flight as if it coordinates a multi-instance deployment.
- Invalidating without handling old in-flight loads that later fill the cache.
- Refreshing every key in a large warm-up at once and moving the stampede to deployment time.

## Knowledge checks with answers

1. **Why isn't a lease enough to prevent duplicate refresh?** The first worker can pause past lease expiry and continue after another worker acquires it.
2. **What prevents stale fill after invalidation?** Version/generation validation or another conditional write tied to source revision.
3. **When is stale-while-revalidate appropriate?** When business rules permit bounded stale reads while fresh data is recomputed.
4. **What does jitter change?** It spreads expiration timing; it does not reduce total refresh work by itself.

### Exact terms covered

- `Cache stampede`
- `Thundering herd`
- `Hot key`
- `Concurrent cache miss`
- `Single-flight request coalescing`
- `Per-key refresh lock`
- `SET NX PX lock acquisition`
- `Lock expiration`
- `Lock owner token`
- `Compare-and-delete lock release`
- `Stale-while-revalidate`
- `Probabilistic early expiration`
- `TTL jitter`
- `Refresh-ahead cache`
- `Refresh failure fallback`
- `Cache stampede source-load amplification`
- `Dogpile effect`
- `Cache warm-up`
- `Cache key versioning`
- `Invalidation-before-source-commit race`
- `Source-commit-before-invalidation failure window`
- `Out-of-order cache fill after invalidation`
- `Stale-fill prevention with generation token`
