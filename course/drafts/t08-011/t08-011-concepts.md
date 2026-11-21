# caching Redis invalidation eviction and stampede — Core concepts and how they fit together

Sources: [Redis cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/), [Redis key eviction](https://redis.io/docs/latest/reference/eviction/), [Redis keyspace notifications](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/), and [Redis 8.8 commands](https://redis.io/docs/latest/commands/redis-8-8-commands/).

## Learning objectives

- Explain how a cache hit/miss flow relates to the source of truth.
- Choose cache-aside, read-through, write-through, or write-behind based on ownership and consistency.
- Separate expiration, invalidation, eviction, and stale-while-revalidate.
- Select Redis data structures by operations and model size/encoding costs.
- Prevent or bound stampedes and reason about lock correctness.
- Explain Redis transaction, pipeline, script, and function guarantees without overclaiming rollback or durability.

## Prerequisites

Understand key-value storage, network round trips, serialization, database source-of-truth ownership, and basic concurrency. Redis command behavior and available data types vary by server version and product; this curriculum follows Redis Open Source 8.10 GA documentation checked 2026-11-20; Redis 8.12-RC1 is a prerelease and is identified separately.

## Core concepts

### Cache identity and locality

A key maps a logical query/entity/representation to a cached value. Include tenant, locale, authorization scope, query parameters, schema version, or other dimensions that affect results; omit none that could leak data. Namespaces make ownership and invalidation manageable. A working set is the subset actually reused; locality determines whether entries remain useful.

### Cache-aside and alternatives

Cache-aside explicitly loads on miss and populates from a source. It is easy to add and caches only requested data, but requests can observe stale values and concurrent misses multiply source work. Read-through moves miss handling into a cache abstraction. Write-through synchronously updates cache as writes happen, increasing write coupling. Write-behind acknowledges before source persistence, improving apparent latency but requiring durable queueing/replay and accepting a data-loss window if not carefully built.

### Freshness is a contract

TTL limits how long a value remains eligible to serve; it is not proof that the value is fresh before expiry and may not be deleted exactly at the deadline. Explicit invalidation shortens staleness after writes, but failure ordering matters. An invalidate-before-commit can be followed by a concurrent stale fill; commit-before-invalidate can leave stale data if invalidation fails. Versioned keys/generation tokens prevent old fills from replacing newer values. State maximum acceptable staleness and read-your-writes behavior.

### Negative caching and failure behavior

Negative caching stores “not found” or another absence result for a short period to suppress repeated expensive misses; it must not mask newly created data too long. Cache bypass supports diagnostics or correctness-critical reads. On Redis failure, fallback to origin only if origin capacity is protected; otherwise use bounded fallback, degraded response, or controlled rejection to avoid a thundering herd.

### Redis structures encode operations

Strings suit opaque serialized values, counters, and bit operations; hashes suit field reads/updates; sets suit membership; sorted sets suit score/rank ranges; lists suit ordered ends; streams suit append/read-log workflows; JSON supports path operations; time series supports timestamped samples; vector sets support vector similarity. Probabilistic sketches/filters trade exactness for memory. Data shape affects memory overhead, atomic operations, and retrieval cost. Redis 8.8 also adds an array-of-strings structure with indexed/range/search/aggregate/ring operations.

### Expiration, eviction, and memory pressure differ

Expiration makes an entry logically unavailable after its TTL and Redis removes it lazily/on access plus through background work. Eviction removes keys to make room under `maxmemory`. `allkeys-*` can evict any key; `volatile-*` only considers expiring keys and behaves like noeviction when none qualify. `noeviction` preserves existing keys but rejects writes that need more memory. TTL metadata consumes memory. A cache can tolerate eviction; durable business records should be isolated and configured intentionally.

### Stampede control

Single-flight collapses same-process concurrent loads for a key; it does not coordinate other processes. A short Redis lock may coordinate distributed refresh, but acquire it atomically with expiry, use a random owner token, and release only if the token still matches. A lock timeout may expire while work continues. Stale-while-revalidate serves bounded stale data during one refresh. TTL jitter spreads expirations; probabilistic early refresh smooths load but can refresh more often. Each technique trades extra staleness/coordination for reduced origin amplification.

### Atomicity and latency boundaries

Redis executes each command atomically on the server, but separate commands can interleave. Pipelining reduces round trips but does not create an atomic transaction. `MULTI`/`EXEC` serializes queued commands but does not roll back runtime command errors. `WATCH` provides optimistic abort on watched-key changes. Lua scripts/Redis Functions execute atomically and block other server activity while running, so they must be bounded; eval script cache can be lost and reloaded. Use key declarations appropriate for cluster mode.

## Mechanisms and relationships

For each cache use case, record: authoritative source; key construction; data type and encoding; TTL/staleness limit; write/invalidation order; concurrent refresh rule; memory/eviction policy; fallback on cache/source failure; and observability. Then test expiration, eviction, invalidation failure, concurrent misses, slow origin, Redis outage, reconnect, and rolling key/schema changes. A cache is correct when cache loss produces a miss and recomputation consistent with the contract.

## Worked examples

### Stale fill race

Request A misses and reads source version 4. A write commits version 5 and deletes the cache key. A then completes late and stores version 4. A generation token/version comparison can reject that fill; alternatively write a versioned key and update the current pointer conditionally. Simply deleting before the fill completes does not prevent stale repopulation.

### Hot counter with expiry

Separate `INCR` and `EXPIRE` commands have a crash/interleaving gap. Use an atomic operation/script or Redis 8.8 `INCREX` when its exact numeric/expiry semantics fit. A cache counter remains disposable; do not treat it as a durable ledger without persistence and recovery design.

## Misconceptions and edge cases

- TTL is an upper bound policy, not a guarantee of freshness or exact physical deletion time.
- Invalidation is a distributed message/write with its own loss and ordering windows.
- A cache miss after eviction is expected behavior, not necessarily data loss.
- Redis `MULTI` is not a rollback transaction; runtime command errors do not undo earlier commands.
- A Redis lock without owner-token-safe release can delete another worker's lock after expiration/reacquisition.
- Keyspace expiration notifications can be delayed and Pub/Sub notifications are fire-and-forget; they are not a durable invalidation log.
- Serialization/compression may reduce network bytes while increasing CPU and value decode latency.
- Key length/cardinality, TTL metadata, replication, allocator fragmentation, and client buffers all consume memory beyond payload bytes.

## Knowledge checks with answers

1. **Does TTL guarantee the cached data was fresh when written?** No; it only bounds eligible lifetime after the cache write.
2. **Difference between eviction and expiration?** Expiration follows a key deadline; eviction reclaims memory under policy pressure.
3. **Does pipelining make a command batch atomic?** No; it only reduces round trips.
4. **Why use an owner token for a refresh lock?** To ensure an expired/reacquired lock is not released by the previous owner's cleanup.
5. **Can a Redis cache outage be handled by sending every request to the database?** Only if the source can absorb that fallback load; otherwise it can amplify the outage.
