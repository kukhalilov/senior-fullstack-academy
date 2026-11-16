# caching Redis invalidation eviction and stampede — Interview questions and reasoning

Sources: [Redis cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/), [Redis eviction](https://redis.io/docs/latest/reference/eviction/), [Redis transactions](https://redis.io/docs/latest/develop/using-commands/transactions/), [Redis Functions](https://redis.io/docs/latest/develop/programmability/functions-intro/), and [client-side caching](https://redis.io/docs/latest/develop/reference/client-side-caching/).

## Core questions

1. What is cache-aside, and who populates the cache?
2. Why does a TTL not by itself guarantee fresh reads?
3. What is a cache stampede, and how does it differ from an ordinary miss?
4. Compare LRU, LFU, LRM, random, TTL-based, and no-eviction behavior at a high level.
5. What is the difference between pipelining and a Redis transaction?
6. When would you use `WATCH` or a Lua script/Function?
7. What happens to a Redis Eval script after restart or failover?
8. How does server-assisted client-side caching detect changed keys?
9. What should an application do if the client-side invalidation connection disconnects?
10. How do you measure whether caching is helping?

## Concise interview answers

1. **Cache-aside:** The application checks the cache first. On a miss it reads the authoritative source, populates the cache, and returns the value. The source remains responsible for durable truth.
2. **TTL:** Expiration limits how long an entry remains, but until expiry it can be stale. Writes, races, or failed invalidation can also leave stale data. State a freshness budget and invalidation policy.
3. **Stampede:** Many requests regenerate the same missing/expired hot key at once. This amplifies source load beyond the single miss that should have occurred.
4. **Eviction:** LRU favors recently accessed keys, LFU frequently accessed keys, LRM recently modified keys, random chooses candidates randomly, TTL-based policy favors keys with nearer expiry, and no-eviction rejects writes when over limit. All-key and volatile policies differ in the candidate set.
5. **Pipeline vs transaction:** A pipeline reduces network waiting by batching commands; it does not make them isolated. `MULTI`/`EXEC` runs queued commands without another client's commands interleaving, but Redis does not roll back successful commands if a later command errors.
6. **WATCH/script:** `WATCH` supports optimistic concurrency and may abort if a watched key changes. A short Lua script or Function can perform a conditional multi-step operation atomically on the server, but blocks other commands while running.
7. **Eval script:** Its cache is volatile. Application code must retain the source and reload if the digest is missing. Redis Functions provide managed libraries for server-side code.
8. **Client cache:** Redis tracks keys read by a client and sends invalidations when those keys change, via RESP3 push messages or a RESP2 redirected channel.
9. **Disconnect:** Flush local entries that might have missed notices; re-establish tracking before trusting fresh entries. A maximum local TTL bounds stale time but is not immediate coherence.
10. **Measurement:** Track hits/misses and hit ratio along with latency percentiles, source load, stale age, refresh failures, memory, evictions, and cold-start behavior.

## Deep follow-up answers

### How do you select a freshness design?

Start from the data contract: maximum stale age, whether a caller must see its own successful write, and whether stale data is safe during an outage. Cache-aside plus TTL is a practical baseline when bounded staleness is acceptable. Add invalidation, versioned keys, or a write-through update when the requirement is stronger. Document ordering: source commit then invalidate is common, but invalidation can fail; invalidating first can be followed by a stale in-flight fill. A durable retry/outbox or generation/version check can close important failure windows. Do not promise strict consistency from a best-effort delete.

### What if Redis goes down?

The answer depends on the source's capacity and product behavior. A cache miss path can fall back to the authoritative source only if it can absorb the traffic. Otherwise apply bounded concurrency, load shedding, stale fallback where allowed, or a controlled error. Avoid a retry storm against a failed Redis endpoint or database. After recovery, expect a cold-cache load and monitor origin amplification.

### How do you prevent a stampede?

First determine whether duplicate regeneration is actually expensive. A local single-flight mechanism coalesces within a process. A distributed lock can coalesce across processes but must use an owner token, finite lease, compare-and-delete release, bounded wait, and safe behavior after lease expiry. Stale-while-revalidate serves an older value within an explicit stale budget. TTL jitter spreads expiration times across keys but does not by itself coalesce requests for one hot key. Probabilistic early refresh can spread refresh work before expiry, but it needs a workload-appropriate policy and measurement.

### How would you choose an eviction policy?

Ask whether every key is disposable and whether keys have expirations. All-key policies consider the whole keyspace; volatile policies consider only keys with TTLs. A volatile policy can fail to find candidates if none have expirations. If authoritative and disposable data share an instance, eviction can destroy business state or no-eviction can block cache writes. Prefer separation and an explicit maxmemory policy; inspect actual memory overhead and key distribution.

### What makes a script safe?

Pass keys through the declared key list and ordinary values through regular arguments; do not generate source from untrusted values. Keep loops and result sizes bounded because scripts execute atomically and block the server. Use `EVAL_RO`/`FCALL_RO` only for read-only behavior. Handle missing Eval cache entries and deploy Function libraries where callers can execute them. Test failure outcomes and make retry behavior safe.

### When is client-side caching worthwhile?

It is useful when a small, popular subset is read repeatedly and data changes relatively infrequently. The latency benefit comes from process memory, but each process maintains its own copy. Use bounded size/TTL, process invalidations continuously, flush after disconnect, and account for late-read-response races. Choose regular tracking versus broadcast tracking based on key/client cardinality and invalidation traffic; test with realistic connection pools.

## Scenario questions

### Scenario A: Product prices are cached for 5 minutes, but customers must see their own price update immediately.

What would you change? How do you handle invalidation failure and an old in-flight fill?

### Scenario B: A popular homepage key expires at the same second across many workers, and the database saturates.

Which coalescing or stale-serving options would you compare? What metrics and failure paths would you test?

### Scenario C: Redis memory is full. Cache keys have TTLs, and a non-TTL job state key shares the instance.

What could `volatile-lru` do? How would you protect job state and keep cache behavior predictable?

### Scenario D: The team batches 100 commands in a pipeline and claims the batch is atomic.

Explain why that is wrong and select a mechanism if the commands enforce a shared invariant.

### Scenario E: A service uses a local Redis client cache; the invalidation receiver disconnects and reconnects successfully.

Can it keep existing entries? What is the recovery policy and what role does the max TTL play?

## Tradeoffs and alternatives

| Need | Reasonable option | Limitation to state |
|---|---|---|
| Simple repeated reads | Cache-aside with TTL | Bounded stale window, miss amplification |
| Update invalidation | Delete/update after source commit | Failure and in-flight-fill race |
| Lower round-trip wait | Pipeline | No isolation |
| Optimistic conditional update | `WATCH` with `MULTI`/`EXEC` | Abort and retry under contention |
| Short multi-step invariant | Lua script or Function | Server blocks during execution |
| Repeated reads within process | Server-assisted client cache | Invalidation/reconnect complexity |
| Memory control | Explicit maxmemory and eviction policy | May remove entries or reject writes |

## Common weak answers

- “Set a TTL and the cache is always consistent.” TTL only bounds retention; it does not guarantee immediate freshness.
- “Redis is fast, so we can cache everything.” Data shape, memory overhead, access pattern, eviction, source load, and stale risk still matter.
- “A pipeline is atomic.” Batching and isolation are different properties.
- “Redis transactions roll back on error.” Redis does not undo successful sibling commands after an execution-time error.
- “A lock guarantees exactly one refresh.” Leases expire, clients pause, and failures create duplicate work; design for bounded, safe duplication.
- “The local cache can survive a tracking disconnect.” It may have missed invalidations; flush untrusted entries.
- “Hit ratio proves success.” It says little about stale age, tail latency, or origin capacity during misses.

## Self-check rubric

Score each from 0 to 2: 0 = missing/incorrect, 1 = partly correct, 2 = clear and reasoned.

- States the source of truth and allowed stale duration.
- Explains both TTL and invalidation failure windows.
- Distinguishes cache miss from stampede and proposes a suitable mitigation.
- Understands all-key versus volatile eviction candidate sets.
- Distinguishes pipeline, transaction, and server-side atomic logic.
- Explains safe lock ownership and bounded execution.
- Provides a client-side cache disconnect/reconnect policy.
- Names useful operational metrics and cold-cache testing.

An interview-ready answer scores at least 12/16 and does not make any of the absolute claims listed under Common weak answers.
