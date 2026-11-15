# ASP.NET Core memory distributed hybrid response and output caching — Exercises and worked solutions

## Goals

Practice cache selection, key design, freshness, origin protection, and safe response reuse. For each scenario, state the authoritative source, who may see a value, how the key is formed, how stale values stop being used, and what happens when the cache or source fails. The examples are design exercises; code fragments assume the containing service has injected dependencies and project-specific result types.

## Worked example

**Scenario:** A catalog summary is public, expensive to assemble, and used by five application replicas. Updates may take up to two minutes to appear. Which layer and key policy fit?

**Reasoning:** Since replicas should share values, a genuinely shared provider is needed. `IDistributedCache` can provide the byte boundary, or `HybridCache` can use it as a secondary while keeping local copies. `AddDistributedMemoryCache` is not shared across processes. A key should include representation version and every query input that changes the summary. A two-minute lifetime bounds age in normal operation, while an update can remove a known key or advance a namespace version. Concurrent misses still need protection at the origin; per-instance coalescing can still allow one fill per replica. [Distributed caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed) [Hybrid caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid)

## Exercises

### Exercise 1 — Choose the layer

A single-instance administrative tool caches a small lookup table that is cheap to reload after restart. There is no tenant variation. Name the simplest suitable layer and two conditions that would change your decision.

### Exercise 2 — Repair the key and freshness policy

The code below caches a localized price list used by multiple tenants. List every correctness/security problem and rewrite the key. Choose a freshness and invalidation policy.

```csharp
var key = "prices";
var prices = await cache.GetOrCreateAsync<List<Price>>(
    key,
    token => repository.LoadPricesAsync(tenantId, locale, token));
```

### Exercise 3 — Understand flags and coalescing

A request must perform a cache-only lookup and must never call the origin during a maintenance window. The team proposes `DisableDistributedCache` and expects it to prevent origin calls. Explain the flaw, identify the relevant flag, and describe what concurrent callers and separate replicas can still do.

### Exercise 4 — Make output caching safe

An endpoint returns catalog cards varying by category and locale. A teammate applies a 60-second output policy varying only by category, then adds user-specific favorites to the same response. Identify all missing dimensions/risks and describe a safer design. State where output caching belongs relative to routing, CORS, authentication, and authorization.

### Exercise 5 — Distinguish HTTP response caching

A public representation includes an ETag and `Cache-Control`. A client sends `If-None-Match` with the same tag. Explain the expected conditional behavior and why this differs from output-cache policy variation. Also explain why setting `IResponseCachingFeature.VaryByQueryKeys` does not emit the HTTP `Vary` header.

### Exercise 6 — Provider outage and rolling format change

An application moves from one distributed provider to another while two versions of the application run concurrently. Describe a safe serialization/key migration and a cache-outage policy that does not cause an unbounded database retry storm.

### Exercise 7 — Measure and adapt a fill

On .NET 11, an application needs aggregate memory-cache hit/miss and eviction telemetry. A HybridCache factory also learns the result's size only after loading it. Explain how to enable and collect the measurements and how the factory can set the local entry size. State what the size measurement does and does not mean.

## Progressive hints

1. Ask whether another process needs to see the lookup table and whether losing it is acceptable.
2. The key must represent tenant, locale, and format version. Expiration and invalidation solve different timing problems.
3. One flag suppresses distributed-cache participation; another suppresses factory/origin work on a miss.
4. Category and locale change the representation; favorites are identity-specific. Middleware must have endpoint and access context before serving a reusable response.
5. Validators answer whether the representation changed; output-cache keys answer which server-side response variant to reuse.
6. A cache miss is normal; a provider exception is a separate case. Bound retries and use compatible or versioned formats.
7. Enable `MemoryCacheOptions.TrackStatistics`; .NET metrics still need a listener/export pipeline. Use an options-aware HybridCache factory and its mutable context after fetching the value.

## Complete solutions

### Solution 1

`IMemoryCache` is sufficient because one process owns the data, reload after restart is acceptable, and the lookup values are small. Reconsider if multiple replicas must share a consistent value, if the data is too costly to refill, if the process-local copy can grow without bounds, or if the data becomes tenant-specific. If `SizeLimit` is configured, every writer on that cache instance must set a size.

### Solution 2

The fixed key merges different tenants and locales. It also lacks a representation version, so a serialization or shape change can reuse an incompatible entry. The expiry is unspecified, and the write path does not describe invalidation. A safe identity is:

```csharp
var key = $"prices:v2:tenant:{tenantId}:locale:{locale}";
var prices = await cache.GetOrCreateAsync<List<Price>>(
    key,
    token => repository.LoadPricesAsync(tenantId, locale, token),
    new HybridCacheEntryOptions { Expiration = TimeSpan.FromMinutes(2) },
    cancellationToken: requestToken);
```

This assumes the injected cache is `HybridCache`, the repository query returns the same tenant and locale as the key, and the result type is serializable through configured behavior. If a write knows the affected key, invalidate it after the authoritative write; if many keys are affected, use a tag or versioned namespace. Keep the bounded expiration as a recovery limit if invalidation is delayed. Include any further query dimension that changes the result.

### Solution 3

`DisableDistributedCache` skips the secondary tier, but it does not mean “do not call the origin.” A cache-only maintenance path should use `HybridCacheEntryFlags.DisableUnderlyingData`; on a miss, the factory is suppressed and the caller must handle absence. `GetOrCreateAsync` coalescing can reduce duplicate fills within one cache instance when the factory is enabled, but separate application replicas can still make independent fills. The maintenance policy must define what the endpoint returns on a miss rather than silently falling back to the origin.

### Solution 4

At minimum, the output key must include category and locale. User-specific favorites cannot be placed in a shared catalog response unless every authorization-relevant identity dimension is safely partitioned; a safer design caches public catalog cards and loads favorites separately for the authenticated caller. Apply authorization before output middleware. Routing must run before it so endpoint metadata is available, and CORS should run before output caching. Review host and any other headers or route values that affect output. Add a cache tag for catalog invalidation only if the write path can reliably evict it; do not mistake a 60-second expiry for correct variation.

### Solution 5

With a matching validator and a representation that has not changed, the server can return `304 Not Modified`, allowing the client to reuse its stored body. If the representation changed, it returns the new body and validator. This is HTTP conditional validation and is governed by HTTP cache semantics. Output-cache variation instead builds server-side identity from policy inputs such as query, route, header, host, or custom variation. `IResponseCachingFeature.VaryByQueryKeys` tells response-caching middleware about query keys; it is not the protocol `Vary` response header and should not be described as one.

### Solution 6

Use a format version in the key or deploy readers that understand both old and new formats before writers switch. Keep the old namespace until its entries expire or are deliberately invalidated. Avoid a window where old readers are forced to deserialize new bytes. On provider failure, choose a bounded policy: short timeouts, limited/no retries, and either a controlled source fallback with concurrency/load protection or a deliberate degraded response. Do not turn every failed cache call into many unrestricted retries against the database. A cache is disposable, so source truth remains recoverable, but source capacity still matters.

### Solution 7

Enable `MemoryCacheOptions.TrackStatistics` on the cache whose measurements are needed. Current built-in .NET 11 instruments include `dotnet.cache.requests` with the `dotnet.cache.request.result` hit/miss tag, plus `dotnet.cache.evictions`, `dotnet.cache.entries`, and `dotnet.cache.estimated_size`. A .NET metrics listener or telemetry pipeline must collect/export them; setting the option alone does not create a dashboard. Use the `IMeterFactory` constructor overload if per-instance meter ownership is required. Estimated size is the sum of application-defined size units, not bytes.

An options-aware `HybridCache.GetOrCreateAsync` callback receives `HybridCacheEntryContext`. After loading, it can set `LocalSize` based on the value's estimated cost and adjust `LocalCacheExpiration` or `Expiration` when the value's characteristics warrant it. The underlying local cache defines the size unit. Keep the computation bounded and deterministic for callers sharing that fill. [.NET 11 library changes](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries)

## Tests and edge cases

- Same entity id in two tenants must produce distinct keys when values differ.
- Changing locale must not reuse a response or application value rendered in another locale.
- A cache miss during maintenance must not unexpectedly invoke the origin when the operation is intended to be cache-only.
- Two simultaneous misses on one process may coalesce, while another replica still loads independently.
- A provider exception must take a deliberately different path from a missing key.
- Expired or evicted values must be safely reconstructible.
- A rolling deployment must not make current readers deserialize an incompatible format.
- Statistics require `TrackStatistics` and metric collection; estimated size is not byte accounting.
- An options-aware factory changes effective cache metadata for the fill; it does not change source-of-truth or key correctness.
- A 304 response must not be treated as a body-bearing replacement response.
- A response that includes identity-specific data must not be reused by another identity.
- A cache tag or key invalidation failure must leave a bounded and understood stale-data window.

## Reflection questions

1. What is the source of truth for each value you cache?
2. Which exact inputs belong in the cache key, and which are intentionally excluded?
3. What is the maximum acceptable staleness, including when invalidation fails?
4. Which failures should bypass the cache, serve explicitly stale data, or fail the request?
5. How does your design behave during a burst after expiration or a provider outage?
6. Can all application versions active during deployment read the same cached representation?
7. Is the cached result public, tenant-specific, or user-specific, and how is that boundary enforced?

## Sources

[Memory caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory) · [Distributed caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed) · [Hybrid caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid) · [Response caching middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/middleware) · [Output caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output)
