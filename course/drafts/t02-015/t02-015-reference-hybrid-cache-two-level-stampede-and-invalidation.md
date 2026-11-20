# ASP.NET Core memory distributed hybrid response and output caching — Reference: HybridCache registration, typed serialization, factory coalescing, tags, and layered expiry

## Scope and version

HybridCache combines a per-process primary with an optional distributed secondary. Its APIs are supplied by `Microsoft.Extensions.Caching.Hybrid`; custom serializer formats must remain compatible across nodes sharing entries. .NET 11 adds options-aware factory overloads using a mutable context. [Hybrid cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid) [.NET 11 library changes](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries)

## How this group fits the mental model

A local hit avoids remote I/O. A secondary hit can hydrate the local tier; a miss invokes the factory. Overlapping fills can be coalesced within the cache instance coordination scope, not as a cluster-wide lock. In .NET 11, an options-aware factory can adjust effective expiry, flags, or local size after seeing the fetched value. Use independent local and distributed lifetimes only when their staleness windows are understood.

## Supplied names explained

- `Microsoft.Extensions.Caching.Hybrid package` — Package containing HybridCache and its dependency-injection extensions.
- `HybridCache` — Typed cache combining an in-process primary with optional distributed secondary and fill coordination.
- `AddHybridCache` — Registers HybridCache and supporting services.
- `AddHybridCache(Action<HybridCacheOptions>)` — Registers HybridCache while configuring limits and defaults.
- `HybridCacheOptions` — Global limits and default behaviors.
- `HybridCacheOptions.MaximumPayloadBytes` — Maximum serialized payload size accepted for caching.
- `HybridCacheOptions.MaximumKeyLength` — Maximum accepted key length; prefer concise stable keys.
- `HybridCacheOptions.DefaultEntryOptions` — Fallback expiration and operation settings.
- `HybridCacheEntryOptions` — Immutable per-operation settings whose non-null per-call values override/inherit over broader defaults; includes expiry, flags, and local-size behavior.
- `HybridCacheEntryOptions.Expiration` — Distributed-tier lifetime when a secondary exists.
- `HybridCacheEntryOptions.LocalCacheExpiration` — Lifetime for the local copy; shorter duration can reduce per-process staleness.
- `HybridCacheEntryOptions.LocalSize` — Size assigned to the local entry when the local cache uses size accounting; units depend on that cache.
- `HybridCacheEntryOptions.Flags` — Composable controls for cache-layer access, origin execution, and compression.
- `HybridCache.GetOrCreateAsync<T>` — Typed read-through operation; overlapping fills for one key can be coalesced within its coordination scope.
- `HybridCache.GetOrCreateAsync<T>(String, Func<CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — String-key factory overload with explicit state-free factory, options, tags, and caller cancellation.
- `HybridCache.GetOrCreateAsync<T>(ReadOnlySpan<Char>, Func<CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — Span-key state-free overload with explicit options, tags, and cancellation; avoids requiring a materialized string key at the call boundary.
- `HybridCache.GetOrCreateAsync<T>(DefaultInterpolatedStringHandler, Func<CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — Interpolated-string-handler overload with explicit options/tags; lets supported compiler call shapes construct keys efficiently.
- `HybridCache.GetOrCreateAsync<T>(String, Func<HybridCacheEntryContext, CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — Options-aware string-key overload; its factory receives mutable effective entry options and may adjust them after loading.
- `HybridCache.GetOrCreateAsync<TState,T>(String, TState, Func<TState, HybridCacheEntryContext, CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — State-passing options-aware string-key overload; supplies caller state and mutable entry context to the fill factory.
- `HybridCache.GetOrCreateAsync<T>(ReadOnlySpan<Char>, Func<HybridCacheEntryContext, CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — Span-key options-aware overload; factory can adjust effective entry metadata after it loads the result.
- `HybridCache.GetOrCreateAsync<T>(DefaultInterpolatedStringHandler, Func<HybridCacheEntryContext, CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — Interpolated-key options-aware overload; compiler-provided handler avoids requiring an intermediate key string in supported call shapes.
- `HybridCache.GetOrCreateAsync<TState,T>(String, TState, Func<TState, CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — State-passing string-key overload without mutable factory context; use it when the result does not determine entry options.
- `HybridCache.GetOrCreateAsync<TState,T>(ReadOnlySpan<Char>, TState, Func<TState, CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — State-passing span-key overload without mutable context.
- `HybridCache.GetOrCreateAsync<TState,T>(DefaultInterpolatedStringHandler, TState, Func<TState, CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — State-passing interpolated-key overload without mutable factory context.
- `HybridCache.GetOrCreateAsync<TState,T>(ReadOnlySpan<Char>, TState, Func<TState, HybridCacheEntryContext, CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — State-passing span-key options-aware overload; factory can update effective per-entry settings.
- `HybridCache.GetOrCreateAsync<TState,T>(DefaultInterpolatedStringHandler, TState, Func<TState, HybridCacheEntryContext, CancellationToken, ValueTask<T>>, HybridCacheEntryOptions, IEnumerable<String>, CancellationToken)` — State-passing interpolated-key options-aware overload; factory can update effective per-entry settings.
- `HybridCache.SetAsync<T>` — Serializes and stores a typed value; authoritative data remains outside the cache.
- `HybridCache.RemoveAsync` — Invalidates a specific key across HybridCache layers according to provider behavior.
- `HybridCache.RemoveAsync(IEnumerable<String>, CancellationToken)` — Removes multiple keys asynchronously; batch removal still has provider and cancellation failure behavior.
- `HybridCache.RemoveByTagAsync` — Logically invalidates entries with a tag; physical bytes may remain until expiry.
- `HybridCache.RemoveByTagAsync(IEnumerable<String>, CancellationToken)` — Logically invalidates entries associated with several tags in one operation.
- `IHybridCacheSerializer<T>` — Typed serialization contract used to encode/decode values.
- `IHybridCacheSerializerFactory` — Resolves serializers for requested types.
- `IHybridCacheBuilder` — Registration builder for HybridCache customization.
- `HybridCacheBuilderExtensions.AddSerializer<T,TImplementation>` — Registers a serializer implementation for one value type.
- `HybridCacheBuilderExtensions.AddSerializer<T>` — Registers a serializer instance for one value type.
- `HybridCacheBuilderExtensions.AddSerializerFactory<TImplementation>` — Registers a factory implementation resolving serializers by type.
- `HybridCacheBuilderExtensions.AddSerializerFactory` — Registers a serializer factory instance.
- `HybridCacheEntryFlags` — Flags controlling local/distributed reads and writes, origin execution, and compression.
- `HybridCacheEntryFlags.DisableLocalCacheRead` — Skips local lookup but does not by itself disable local writes.
- `HybridCacheEntryFlags.DisableLocalCacheWrite` — Prevents populating the local primary for the operation.
- `HybridCacheEntryFlags.DisableDistributedCacheRead` — Skips the distributed secondary read.
- `HybridCacheEntryFlags.DisableDistributedCacheWrite` — Prevents writing the distributed secondary.
- `HybridCacheEntryFlags.DisableDistributedCache` — Composite shortcut disabling distributed-tier participation.
- `HybridCacheEntryFlags.DisableUnderlyingData` — Prevents factory/origin execution on a miss; cache-only lookup can return no value.
- `HybridCacheEntryFlags.DisableCompression` — Disables payload compression, trading CPU for storage/network size.
- `HybridCacheEntryContext` — Mutable effective entry-option context supplied to an options-aware fill factory so the fetched result can determine caching settings.
- `HybridCacheEntryContext.HybridCacheEntryContext(HybridCacheEntryOptions)` — Initializes the mutable factory context with the effective options supplied to the operation.
- `HybridCacheEntryContext.Expiration` — Mutable overall/distributed-tier lifetime that the factory can adjust based on the loaded value.
- `HybridCacheEntryContext.Flags` — Mutable operation flags visible to and adjustable by the factory.
- `HybridCacheEntryContext.LocalCacheExpiration` — Mutable local-tier expiration available to an options-aware factory.
- `HybridCacheEntryContext.LocalSize` — Mutable size assigned to the local entry; units depend on the underlying local cache.
- `HybridCacheEntryContext.Revision` — Increments when a context property changes, allowing implementations to detect factory modifications.
- `Options-aware HybridCache factory` — A .NET 11 factory overload can receive the effective mutable entry context and adjust lifetime/flags/local size after fetching data.
- `Hybrid cache primary in-process cache` — Fast local tier, with a separate copy per process.
- `Hybrid cache optional distributed secondary cache` — A second tier uses the configured distributed provider when available; without a provider, HybridCache still functions through its local tier.
- `HybridCache uses registered IDistributedCache as secondary` — The registered concrete provider determines topology and operational semantics.
- `HybridCache with AddDistributedMemoryCache does not create useful cross-process secondary storage` — Both tiers remain process-local, so replicas do not share this secondary.
- `Hybrid cache stampede protection` — Reduces duplicate fills in its coordination scope; not a cluster-wide lock.
- `Concurrent GetOrCreateAsync factory coalescing` — Concurrent callers for a key may share a factory operation within an instance; replicas may still fill independently.
- `GetOrCreateAsync cancellation token` — Cancellation participates in a potentially shared operation; factories must be safe under coalescing.
- `Hybrid cache serialization` — Values cross a serialization boundary, especially when using a secondary provider.
- `Hybrid cache serializer registration` — Custom serializers must agree across deployments or use versioned keys.
- `Hybrid cache tags` — Labels grouping entries for logical invalidation; very large tag sets have cost.
- `RemoveByTagAsync logical invalidation` — Makes tagged entries unusable without promising immediate physical deletion.
- `Tag invalidation does not immediately remove stored bytes` — Invalid payload bytes may remain in storage until normal expiry.
- `Local versus distributed expiration` — Separate tier lifetimes produce distinct freshness windows per process.
- `Hybrid cache maximum payload size` — Bounds payloads; investigate unexpectedly uncached large values.
- `Hybrid cache maximum key length` — Bounds keys; avoid serializing whole requests into them.
- `HybridCacheEntryFlags bypass behavior` — Flags compose; reason through each layer and factory effect for the combination.
- `Custom serializer format compatibility` — Nodes sharing cache bytes must decode compatible formats or isolate versions.
- `HybridCache cache miss factory exception behavior` — A failed factory yields no valid fill; later requests may retry and stress the source.
- `Hybrid cache secondary outage behavior` — Treat secondary failures separately from misses; fallback and exception behavior must be understood and observed for the deployed provider/version.
- `HybridCacheEntryFlags.None` — Uses normal configured behavior without suppressing a layer or origin.
- `HybridCacheEntryFlags.DisableLocalCache` — Composite flag for disabling local-cache participation; check its precise read/write effects.

## Cross-item comparison

Local and distributed read/write flags control distinct actions; `DisableDistributedCache` is a composite convenience. `DisableUnderlyingData` suppresses the origin factory on a miss, so a cache-only lookup can return no result. `Expiration` and `LocalCacheExpiration` govern distinct tiers. A per-type serializer registration is targeted; a factory scales across types. Key removal targets one key; tag removal groups entries logically.

### Invalidation across multiple application instances

HybridCache key/tag invalidation does not evict other servers local primary cache. Key or tag invalidation updates the current server's local primary and the configured secondary store. It does **not** invalidate the local in-memory copies held by other application instances. Those instances can continue serving their local value until its local expiration or another local invalidation. A shared secondary cache therefore does not by itself make HybridCache local tiers immediately coherent. Keep local lifetimes short enough for the tolerated stale window, use versioned keys when immediate namespace change is needed, or choose an architecture with explicit cross-node invalidation if the business requirement needs it. [Hybrid cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid)

## Examples

A typed fill should keep its key and origin query aligned, including tenant identity when data differs by tenant.
```csharp
var key = $"product:v3:tenant:{tenantId}:id:{productId}";
ProductSummary? summary = await hybridCache.GetOrCreateAsync<ProductSummary?>(
    key,
    async token => await repository.LoadSummaryAsync(productId, tenantId, token),
    new HybridCacheEntryOptions { Expiration = TimeSpan.FromMinutes(10), LocalCacheExpiration = TimeSpan.FromMinutes(2) },
    cancellationToken: requestToken);
```
This fragment assumes dependencies and identifiers are available. Different tier expirations do not promise globally synchronized freshness.

In .NET 11, an options-aware factory can tune metadata after it knows the value. This fragment assumes `ProductSummary.EstimatedSizeUnits` is a non-negative size estimate in the application's chosen local-cache units:

```csharp
ProductSummary summary = await hybridCache.GetOrCreateAsync<ProductSummary>(
    $"product:v3:{productId}",
    async (context, token) =>
    {
        var value = await repository.LoadSummaryAsync(productId, token);
        context.Expiration = value.IsFeatured ? TimeSpan.FromMinutes(10) : TimeSpan.FromMinutes(2);
        context.LocalCacheExpiration = TimeSpan.FromMinutes(1);
        context.LocalSize = value.EstimatedSizeUnits;
        return value;
    },
    options: null,
    tags: new[] { "products" },
    cancellationToken: requestToken);
```

The `HybridCacheEntryContext` is seeded from effective options and then lets the factory adjust them for the resulting entry. `LocalSize` only has the intended effect when the local tier's size policy consumes it; it is not a byte count by default. Keep the key tenant-aware if product visibility or fields vary by tenant. [.NET 11 library changes](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries)

## Common mistakes

Do not call factory coalescing a distributed lock. Do not assume tag invalidation erases bytes immediately. `DisableUnderlyingData` prevents factory execution on a miss. Do not change serializers without compatible deployment or versioned keys. A memory secondary remains process-local.

## Knowledge checks with answers

1. **Is fill coordination cluster-wide?** No.  2. **What does local expiry govern?** The process-local tier.  3. **Do tags immediately delete payloads?** Not necessarily; invalidation is logical.  4. **What does `DisableUnderlyingData` do on a miss?** It suppresses the factory.  5. **Why version serializer data?** Rolling deployments need compatible bytes.

## Sources

[Hybrid cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid)
[HybridCache API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.caching.hybrid.hybridcache?view=net-11.0)
[HybridCache entry context](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.caching.hybrid.hybridcacheentrycontext?view=net-11.0)
[.NET 11 library changes](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries)
