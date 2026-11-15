# ASP.NET Core memory distributed hybrid response and output caching — Reference: IMemoryCache APIs, entry options, size bounds, eviction, and cache-aside behavior

## Scope and version

The group covers process-local object storage. Every entry is disposable, and every consumer of a size-limited cache must provide size units. It is not serialized or synchronized to other replicas. .NET 11 adds built-in cache metrics when statistics tracking is enabled; these are instruments to collect, not dashboards or automatic exports. [Memory cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory)

## How this group fits the mental model

This layer is best for cheap-to-refill values whose per-process copies are acceptable. A cached object is a reference; immutable data avoids accidental changes visible to other callers. Choose keys and expiration before optimizing hit rate. A miss must still have a bounded, safe source-load path. The .NET 11 statistics snapshot and observable instruments aid aggregate monitoring, but estimated size uses the cache's application-defined units rather than bytes.

## Supplied names explained

- `IMemoryCache` — DI abstraction for process-local object entries; it does not serialize or synchronize values across replicas.
- `MemoryCache` — In-process implementation storing object references; it is disposable and not distributed.
- `MemoryCacheOptions` — Global configuration for the local cache implementation, including capacity behavior and diagnostic options.
- `MemoryCacheOptions.SizeLimit` — Application-defined size units; once configured, every entry written to that cache must provide a size.
- `MemoryCacheOptions.ExpirationScanFrequency` — Cadence for scanning expired entries; it is not an exact per-entry timer.
- `MemoryCacheOptions.CompactionPercentage` — Proportion targeted by capacity compaction, which also considers expiry and entry priority.
- `MemoryCacheOptions.TrackStatistics` — Enables aggregate cache statistics for diagnostics, not per-key inspection.
- `AddMemoryCache` — Registers memory-cache services in dependency injection.
- `AddMemoryCache(Action<MemoryCacheOptions>)` — Registers memory caching and configures options; avoid imposing global size policy on shared cache consumers casually.
- `IMemoryCache.Get` — Convenience lookup returning a value or null; use presence-aware lookup if null/default can be a cached value.
- `IMemoryCache.TryGetValue` — Separates presence from the retrieved value, so a miss is not confused with a cached default.
- `IMemoryCache.Set` — Adds or replaces an entry; specify options when expiry, size, or priority matters.
- `IMemoryCache.Remove` — Removes a key from this process-local instance only.
- `IMemoryCache.CreateEntry` — Opens a configurable entry whose value and metadata are committed when the entry is disposed.
- `MemoryCache.TryGetValue(Object, Object)` — Concrete object-key lookup that reports presence and returns the stored object through an out value.
- `MemoryCache.TryGetValue(ReadOnlySpan<Char>, Object)` — Concrete allocation-conscious lookup accepting a character span as the key; useful for string-like keys without requiring a temporary string.
- `MemoryCache.TryGetValue<TItem>(ReadOnlySpan<Char>, TItem)` — Typed span-key lookup that returns presence separately from the typed out value.
- `MemoryCache.Clear` — Removes every entry in this cache; broad invalidation can trigger a refill surge.
- `MemoryCache.Compact` — Requests percentage-based removal using expiration and priority; not a targeted invalidation operation.
- `MemoryCache.GetCurrentStatistics` — Same aggregate-statistics accessor listed above; the duplicate inventory name adds no separate capability.
- `MemoryCache.Dispose` — Releases resources owned by this instance; let its DI owner dispose shared instances.
- `MemoryCache.MemoryCache(IOptions<MemoryCacheOptions>)` — Constructs an instance from configured options.
- `MemoryCache.MemoryCache(IOptions<MemoryCacheOptions>, ILoggerFactory)` — Constructs an instance with options and logging integration.
- `MemoryCache.MemoryCache(IOptions<MemoryCacheOptions>, ILoggerFactory, IMeterFactory)` — Constructs an instance with a meter factory so diagnostic instruments can be associated with a meter instance.
- `MemoryCache.Count` — Diagnostic count of currently cached entries; it is a snapshot, not a coordination or quota primitive.
- `MemoryCache.Keys` — Enumerable view of keys for diagnostics; avoid using enumeration as a stable transactional snapshot.
- `MemoryCacheStatistics` — Snapshot of aggregate entry/hit/miss/eviction and estimated-size counters.
- `MemoryCacheStatistics.CurrentEntryCount` — Snapshot count of current entries.
- `MemoryCacheStatistics.CurrentEstimatedSize` — Estimated sum of entry Size values, in application-defined units rather than bytes.
- `MemoryCacheStatistics.TotalEvictions` — Aggregate eviction count in the statistics snapshot.
- `MemoryCacheStatistics.TotalHits` — Aggregate successful lookup count in the statistics snapshot.
- `MemoryCacheStatistics.TotalMisses` — Aggregate absent lookup count in the statistics snapshot.
- `MemoryCache OpenTelemetry meter` — Built-in .NET metrics meter emitted by MemoryCache when statistics tracking is enabled; collection/export still requires a listener or telemetry pipeline.
- `dotnet.cache.requests` — Observable request counter instrument with a result tag distinguishing hit and miss.
- `dotnet.cache.request.result` — Current hit/miss tag key attached to cache request measurements.
- `dotnet.cache.evictions` — Observable count of cache-entry evictions.
- `dotnet.cache.entries` — Observable current entry-count instrument.
- `dotnet.cache.estimated_size` — Observable estimated cache-size instrument in application-defined units, not bytes.
- `dotnet.cache.request.type (earlier .NET 11 preview tag)` — Historical preview tag name; current .NET 11 uses dotnet.cache.request.result.
- `ICacheEntry` — Mutable handle for a value and its expiry, size, priority, and eviction callbacks.
- `ICacheEntry.Key` — The identity under which the cache stores this entry; it must be stable and unique for the represented data.
- `ICacheEntry.Value` — The object reference held by the entry; callers can observe mutations unless values are immutable or copied.
- `ICacheEntry.AbsoluteExpiration` — Fixed UTC deadline after which an entry is expired.
- `ICacheEntry.AbsoluteExpirationRelativeToNow` — Maximum lifetime measured from entry creation.
- `ICacheEntry.SlidingExpiration` — Idle timeout renewed by access; combine with an absolute bound if hot entries must eventually expire.
- `ICacheEntry.Size` — Application-chosen size units used by a size-limited cache, not inherently bytes.
- `ICacheEntry.Priority` — Relative retention preference during compaction, not a guarantee that the item remains.
- `ICacheEntry.PostEvictionCallbacks` — Callbacks after removal/eviction; they are not durable transaction hooks.
- `CacheItemPriority` — Retention preference values used during compaction.
- `PostEvictionDelegate` — Callback contract for observing an entry after eviction.
- `EvictionReason` — Reason an entry left the cache, such as expiry, capacity, explicit removal, or replacement.
- `MemoryCacheEntryOptions` — Fluent configuration for entry lifetime, size, priority, and post-eviction observation.
- `MemoryCacheEntryOptions.SetAbsoluteExpiration` — Sets a deadline or relative maximum lifetime.
- `MemoryCacheEntryOptions.SetSlidingExpiration` — Sets an idle timeout renewed by access.
- `MemoryCacheEntryOptions.SetSize` — Supplies the application's size units required by a limited cache.
- `MemoryCacheEntryOptions.SetPriority` — Sets relative retention priority during compaction.
- `MemoryCacheEntryOptions.RegisterPostEvictionCallback` — Registers an after-eviction observer; keep it concurrency-safe and quick.
- `MemoryCacheEntryExtensions.AddExpirationToken` — Links cancellation to entry expiry when a source can signal invalidation.
- `CacheExtensions.Get<TItem>` — Typed convenience lookup; default return can be ambiguous when default is a valid cached value.
- `CacheExtensions.Get(IMemoryCache, Object)` — Untyped extension lookup using an object key; it returns null when no value is present.
- `CacheExtensions.Set<TItem>` — Typed convenience write with optional entry options.
- `CacheExtensions.Set<TItem>(IMemoryCache, Object, TItem)` — Writes a typed value with default entry options.
- `CacheExtensions.Set<TItem>(IMemoryCache, Object, TItem, DateTimeOffset)` — Writes a typed value with an absolute expiration timestamp.
- `CacheExtensions.Set<TItem>(IMemoryCache, Object, TItem, IChangeToken)` — Writes a value that expires when the supplied change token fires.
- `CacheExtensions.Set<TItem>(IMemoryCache, Object, TItem, MemoryCacheEntryOptions)` — Writes a typed value using the supplied lifetime, size, priority, and callback options.
- `CacheExtensions.Set<TItem>(IMemoryCache, Object, TItem, TimeSpan)` — Writes a typed value with a relative expiration duration.
- `CacheExtensions.TryGetValue<TItem>` — Typed lookup that returns presence separately from the out value.
- `CacheExtensions.GetOrCreate<TItem>` — Synchronous cache-aside helper; do not assume concurrent misses run one factory.
- `CacheExtensions.GetOrCreate<TItem>(IMemoryCache, Object, Func<ICacheEntry, TItem>)` — Synchronous factory overload whose callback can configure the entry before returning its value.
- `CacheExtensions.GetOrCreate<TItem>(IMemoryCache, Object, Func<ICacheEntry, TItem>, MemoryCacheEntryOptions)` — Synchronous factory overload with explicit default entry options; callback/configuration determine the created entry behavior.
- `Cache key uniqueness` — Keys must not collide for two values that differ in meaning, tenant, permissions, or representation.
- `Cache key tenant isolation` — Include tenant identity whenever cached data is tenant-specific; a collision is a data disclosure, not merely a stale result.
- `Cache stampede on concurrent misses` — Many callers can load the same absent key simultaneously and overload the origin unless fills are coalesced or otherwise bounded.
- `Cache-aside pattern` — Application checks cache, loads the authoritative source on a miss, then stores the value with an explicit freshness policy.
- `Cache-through pattern distinction` — A cache-through layer owns source reads/writes; the memory-cache APIs here do not automatically wrap a database.
- `Absolute expiration` — Fixed maximum lifetime from a deadline; use it to bound age even if a value remains popular.
- `Sliding expiration` — Idle lifetime refreshed by access; alone it may keep a hot value alive indefinitely.
- `Combined absolute and sliding expiration` — Idle expiry removes cold entries while absolute expiry caps the maximum age of hot entries.
- `Eviction under memory pressure` — MemoryCache does not promise to monitor machine memory pressure and automatically trim according to it; size/compaction policy is explicit.
- `SizeLimit requires all entries to set size` — Every writer using a limited cache instance must assign an application-defined size, including framework/library consumers.
- `Cache entry post-eviction callback` — Observes removal after it occurs, with an eviction reason; it is not an exactly-once business event.
- `Cache mutable object reference hazard` — MemoryCache retains the same object reference; mutations after retrieval can affect other code holding that reference.
- `Cache serialization not provided by IMemoryCache` — Values stay as in-process objects; cross-process transfer requires a separate serialization/storage layer.
- `Per-process cache scope` — Each application process owns an independent copy that is lost on process restart.
- `IMemoryCache is not a distributed cache` — It has no built-in replication or cluster invalidation.
- `CacheExtensions.GetOrCreateAsync<TItem>` — Asynchronous cache-aside helper; it does not itself promise cross-caller factory coalescing.
- `CacheExtensions.GetOrCreateAsync<TItem>(IMemoryCache, Object, Func<ICacheEntry, Task<TItem>>)` — Async factory overload whose callback can configure the created entry; it does not guarantee one factory across simultaneous misses.
- `CacheExtensions.GetOrCreateAsync<TItem>(IMemoryCache, Object, Func<ICacheEntry, Task<TItem>>, MemoryCacheEntryOptions)` — Async factory overload with explicit entry options; concurrent misses can still perform duplicate work.

## Cross-item comparison

`TryGetValue` separates absence from a cached default; `Get` is shorter when that ambiguity cannot occur. `CreateEntry` exposes the full entry lifecycle, while `Set` is convenient for normal writes. Absolute expiry is a maximum age; sliding expiry is an idle bound. Combining both prevents a hot entry from living forever. `SizeLimit` uses application units. Post-eviction callbacks observe cleanup but are not durable event handlers.

## Examples

A typical cache-aside read includes a bounded lifetime and a versioned key. This snippet assumes the containing service injects `cache` and `repository`; it does not coalesce concurrent misses.
```csharp
public async Task<ProductSummary?> GetSummaryAsync(int id, CancellationToken token)
{
    var key = $"product-summary:v2:{id}";
    if (cache.TryGetValue(key, out ProductSummary? value)) return value;
    value = await repository.LoadAsync(id, token);
    if (value is not null)
        cache.Set(key, value, new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(5))
            .SetSize(1));
    return value;
}
```
`SetSize(1)` is appropriate only if the cache's configured size unit defines each entry as one unit.

## Common mistakes

Do not size-limit a shared DI cache unless every writer sets size; the units are not inherently bytes. Do not assume memory pressure automatically trims it. Avoid mutable shared values, infinite sliding lifetimes, cache-aside helpers assumed to coalesce, and per-process storage where cross-replica visibility is required.

## Knowledge checks with answers

1. **What is the scope?** One process.  2. **Why use `TryGetValue`?** It distinguishes a miss from a cached default.  3. **What are size units?** Application-defined, and every writer must provide one when a limit is configured.  4. **Does sliding expiry bound maximum age?** No; add absolute expiry if needed.  5. **Are callbacks durable?** No.

## Sources

[Memory cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory)
[MemoryCache API and statistics](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.caching.memory.memorycache?view=net-11.0)
[.NET 11 library changes](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries)
