# ASP.NET Core memory distributed hybrid response and output caching — Interview questions and reasoning

## Core questions

1. How do `IMemoryCache`, `IDistributedCache`, and `HybridCache` differ in scope and value representation?
2. Explain cache-aside and identify which component remains authoritative.
3. What makes a cache key correct and safe for a multi-tenant service?
4. Compare absolute expiry, sliding expiry, explicit removal, tag invalidation, and versioned keys.
5. What is a cache stampede? What does HybridCache factory coalescing help with, and what does it not guarantee?
6. How does `IDistributedCache` represent values, and why does serializer compatibility matter during deployment?
7. Distinguish HTTP response caching from output caching.
8. Why are output-cache tag operations a separate store concern from ordinary `IDistributedCache` methods?
9. What did .NET 11 add for MemoryCache telemetry and HybridCache fill policies?

## Concise interview answers

1. `IMemoryCache` holds object references in one process. `IDistributedCache` exposes byte operations whose actual topology depends on its provider. HybridCache adds a local tier, optional distributed secondary, typed serialization, and fill coordination.
2. The application reads cache first, loads the source on a miss, then stores a reusable result. The database or service remains the source of truth.
3. Include every value dimension that changes content or caller authorization, such as tenant, locale, representation version, and relevant query inputs. Avoid collisions across security boundaries.
4. Absolute expiration caps age; sliding expiration caps idle time. Removal targets a known key; tags group entries for logical invalidation; versioned keys move new readers to a new namespace.
5. A burst of misses causes duplicate source work. HybridCache can coalesce overlapping same-key factories within its coordination scope, but it is not a cluster-wide distributed lock.
6. The abstraction stores byte arrays. The app or a higher layer serializes objects. All active deployments sharing bytes need compatible formats or isolated versioned keys.
7. Response caching obeys HTTP cache directives, validators, method/status eligibility, and variation headers. Output caching is server-controlled endpoint policy and storage.
8. Tag eviction requires store semantics beyond simple get/set/remove; a plain distributed-cache abstraction does not express atomic tag association and eviction adequately.
9. With statistics enabled, MemoryCache publishes built-in metrics, and an `IMeterFactory` can scope a cache instance's meter. Options-aware HybridCache factory overloads expose a mutable entry context so the loaded result can adjust effective expiry, flags, and local size.

## Deep follow-up answers

### How do you design a cache key?

Start with the semantic inputs to the result, not the parameters that happen to be convenient. Include a version for representation changes and tenant/locale or authorization dimensions when they alter data. Normalize values consistently. Bound key length and cardinality. Never rely on an omitted dimension being “usually the same.” A collision can return stale content or disclose another tenant's information.

### Is expiration enough for correctness?

Expiration bounds how long an entry may remain eligible, but it does not coordinate a writer and reader, instantly update replicas, or guarantee that a write's invalidation succeeded. Define acceptable staleness, use invalidation for prompt change propagation, and retain a bounded expiry as a backstop. Consider read/write races and the order of database commit and cache invalidation.

### What happens during a cache outage?

First distinguish a miss from a provider error. Then choose a policy for the value: bounded fallback to the source, explicitly stale content, or a degraded/failing response. Fallback can preserve user-facing availability but shift load to the origin. Use timeouts, retry budgets, concurrency limits, and metrics so recovery does not become a thundering herd. Do not assume every cache layer silently converts provider failures to misses.

### How do memory limits work?

An entry size is a unit chosen by the application. A size-limited `MemoryCache` requires every entry to specify size, including entries from other components sharing that instance. This is why a global limit on a shared dependency-injection cache can cause unrelated writes to fail. MemoryCache does not automatically trim itself according to operating-system memory pressure. Prefer a private cache instance if a strict application-specific budget is required. [Memory cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory)

### When would you choose HybridCache?

Choose it when typed cache-aside, a fast local tier, an optional shared secondary, and same-key fill coordination fit the workload. Ensure the secondary provider is genuinely shared if replicas need it. Pick local and distributed expirations deliberately, and ensure custom serializer formats work across all replicas. Tag removal is a logical invalidation mechanism, not proof that old bytes have been physically erased. [Hybrid cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid)

### How do the .NET 11 additions change operations?

`TrackStatistics` enables aggregate cache statistics and built-in metrics; a metrics listener/exporter still needs to collect them. The hit/miss metric uses `dotnet.cache.request.result`, while an earlier preview tag was named `dotnet.cache.request.type`. `dotnet.cache.estimated_size` reflects application-defined size units, not bytes. Options-aware HybridCache factory overloads pass a mutable `HybridCacheEntryContext`; the factory may adjust effective options after seeing the value. These additions improve visibility and per-entry tuning, but neither solves invalidation, tenant isolation, or cross-replica coordination. [.NET 11 library changes](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries)

### How do you safely cache an HTTP endpoint?

Decide whether client/shared HTTP semantics or server-controlled endpoint reuse are intended. For either, identify every representation input and any private data. Response caching relies on directives, validators, and variation headers. Output caching needs an applied policy and correctly varied key. Run routing and authorization before output-cache reuse, and run CORS before it. Keep personalized data separate or partition it safely. [Response caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/middleware) [Output caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output)

## Scenario questions

1. **A key is hot in one replica but repeatedly missing in another.** Diagnose provider topology, local expiration, key normalization, serialization, and whether both replicas use the same namespace/version. Do not assume a process-local secondary is shared.
2. **A cache outage causes database CPU to spike.** Explain how fail-open behavior shifts load; add bounded fallback and concurrency control, then decide whether stale/degraded behavior is safer.
3. **Two tenants request the same resource id and see different prices.** Include tenant identity in the key or avoid caching a shared representation. Confirm invalidation also targets each tenant's partition.
4. **A serializer change rolls out while old instances remain live.** Keep formats backward-compatible during overlap or use a versioned key namespace and controlled migration.
5. **A cache stampede happens across eight replicas.** Per-instance coalescing can still leave up to one factory per replica. Consider origin capacity, jittered expiry, and whether broader coordination is worth its failure complexity.
6. **A response contains public catalog data and user-specific favorites.** Cache the public representation separately and obtain favorites through a caller-specific path, or partition the full response safely; do not reuse one shared key.

## Tradeoffs and alternatives

| Choice | Benefits | Costs and limits |
|---|---|---|
| Process-local memory | Low latency, simple, no serialization | Per-process copies, restart loss, mutable-reference concerns |
| Shared distributed provider | Cross-replica access when configured as shared | Network latency/failure, serialization, provider operations |
| Hybrid tier | Local hits plus optional secondary and fill coordination | More freshness/serialization complexity; no global locking guarantee |
| HTTP response caching | Standard directives and validators for client/shared caches | Strict eligibility and HTTP variation semantics |
| Output caching | Server-managed endpoint policy, tags, variation, locking | Must audit middleware order and key safety; default store is local |

## Common weak answers

- “Redis makes it consistent.” A provider does not automatically solve invalidation, source races, or application key design.
- “It expires in a minute, so it is safe.” Expiry bounds age but does not partition users or prevent stale reads during the window.
- “HybridCache gives us a distributed lock.” Its fill coordination is not a cluster-wide lock guarantee.
- “The cache is just a performance detail.” A wrong cache key can expose data across tenants or users.
- “We can serialize any object and deploy.” Rolling versions can disagree on format; use compatibility or key versioning.
- “The endpoint has output-cache middleware, so it is cached.” An applicable endpoint policy is still needed, and variation must be correct.
- “The Redis distributed-cache package gives output caching.” Output caching has a distinct store integration with tag operations.

## Self-check rubric

Score each answer from 0 to 2: **0** = incorrect or unsafe; **1** = names the API but omits a key tradeoff; **2** = explains scope, correctness boundary, failure behavior, and a concrete decision.

- I can distinguish process-local, provider-backed, hybrid, HTTP response, and output caching.
- I can design a collision-resistant key that preserves tenant and user boundaries.
- I can explain maximum-age versus idle expiry and the limits of invalidation.
- I can reason about same-process coalescing versus independent replicas.
- I can describe byte serialization and safe rolling format changes.
- I can explain provider failure separately from a miss and define a bounded fallback.
- I can correctly order output caching relative to routing, CORS, and authorization.
- I can explain why the Redis output-cache store differs from Redis `IDistributedCache`.

## Sources

[Memory caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory) · [Distributed caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed) · [Hybrid caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid) · [Response caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/middleware) · [Output caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output)
