# caching Redis invalidation eviction and stampede — Big-picture orientation and mental model

Sources: [Redis cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/), [Redis data types](https://redis.io/docs/latest/develop/data-types/), and [Redis key eviction](https://redis.io/docs/latest/reference/eviction/).

## Problem and purpose

Applications repeatedly compute or fetch the same information. A cache stores a faster copy so common reads avoid expensive work. This creates a second copy whose freshness, memory use, and failure behavior must be designed. Redis can store strings, collections, streams, indexes, and other structures, but being fast does not automatically make it authoritative, durable, or immune to memory pressure.

## Plain-language mental model

Picture a frequently used answer on a nearby shelf. A hit serves quickly; a miss fetches the authoritative source and restocks the shelf. A TTL puts a discard date on the answer, while invalidation removes it after a source change. When the same shelf slot expires during a rush, many people may fetch the source at once; that is a stampede. When the shelf is full, eviction chooses what to discard, unless policy rejects new items.

## How the parts fit together

- Define a key and the data shape from the access pattern.
- On a cache-aside read, check Redis, load the source on a miss, then populate with a freshness bound.
- After writes, invalidate/update with deliberate ordering and failure handling.
- Bound memory and select an eviction policy compatible with whether every key is disposable cache data.
- Coordinate hot-key refreshes when one miss can overwhelm the origin.
- Measure hit rate, stale age, load amplification, memory, evictions, and latency; fall back to the authoritative source only when that source can absorb the load.

## Concept map

```text
request → cache lookup ── hit → return cached value
               │ miss
               ▼
        authoritative store → populate cache → return
               ▲                    │
               └── write + invalidate/update

TTL/eviction bound stored copy; stale-while-revalidate/single-flight govern refresh;
maxmemory policy decides removal or rejection; Redis data type follows access pattern.
```

## End-to-end walkthrough

A product page is cached under `product:v3:42` for a bounded TTL. Requests first read Redis. On miss, one request fetches the database, serializes the result, and populates Redis; concurrent requests may be coalesced so they do not all hit the database. An update commits to the source of truth and invalidates the key. If invalidation fails, the TTL bounds—but does not eliminate—the stale window. A later request may use a stale value while refreshing if the product contract permits it. Memory pressure can evict the key early, so a miss must remain correct. Monitoring shows hit/miss ratio, oldest stale age, refresh failures, and source load.

## When to use it and tradeoffs

Caching works best for repeatable reads with meaningful reuse and a clear freshness contract. It can reduce latency and origin work, but introduces stale data, invalidation races, serialization/versioning, eviction, and failure load. Cache-aside is usually simplest. Write-through/write-behind have different consistency and data-loss tradeoffs. A cache should not be the only copy of valuable data unless it is explicitly configured and operated as an authoritative durable store.

## What later lessons cover

The concepts lesson establishes key/freshness/failure models. Reference lessons cover cache patterns, current Redis key/string/expiration commands, native data types including Redis 8.8 arrays, Redis 8.6 LRM eviction, stampede coordination, and atomicity/performance boundaries. Practice and interview units apply those concepts to production scenarios.
