# ASP.NET Core memory distributed hybrid response and output caching — Reference: IDistributedCache byte APIs, expiration, serializers, and provider choices

## Scope and version

The group covers a byte contract plus provider-specific integrations. The abstraction does not guarantee topology, durability, consistency, encryption, or expiration precision. [Distributed cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed)

## How this group fits the mental model

The application owns serialization and key versioning. Providers differ operationally, so test latency, outages, persistence, eviction, and expiry. Prefer async operations for remote providers. Treat a miss and provider failure separately; fallback behavior can expose the origin to a surge.

## Supplied names explained

- `IDistributedCache` — Byte-oriented provider abstraction; topology, persistence, and failure semantics are implementation-specific.
- `IDistributedCache.Get` — Synchronous byte read; remote calls can block request threads.
- `IDistributedCache.GetAsync` — Asynchronous byte read; null indicates a miss and cancellation can bound waiting.
- `IDistributedCache.Set` — Synchronous byte write with expiration metadata; avoid blocking request paths on remote I/O.
- `IDistributedCache.SetAsync` — Asynchronous byte write; cache success does not make the value authoritative or durable.
- `IDistributedCache.Refresh` — Synchronous refresh of provider-supported sliding expiry.
- `IDistributedCache.RefreshAsync` — Asynchronous refresh of sliding expiry; it does not validate value freshness.
- `IDistributedCache.Remove` — Synchronous provider removal, potentially blocking on remote I/O.
- `IDistributedCache.RemoveAsync` — Asynchronous provider removal that can fail independently from a source-of-truth update.
- `DistributedCacheEntryOptions` — Expiration metadata for distributed-cache writes.
- `DistributedCacheEntryOptions.AbsoluteExpiration` — Absolute deadline for an entry.
- `DistributedCacheEntryOptions.AbsoluteExpirationRelativeToNow` — Maximum age from the write time.
- `DistributedCacheEntryOptions.SlidingExpiration` — Idle lifetime renewed by supported provider operations; not a maximum-age bound.
- `DistributedCacheExtensions.GetString` — String convenience that decodes stored bytes as text; it is not object serialization.
- `DistributedCacheExtensions.GetStringAsync` — Async string read; null represents a missing key.
- `DistributedCacheExtensions.SetString` — Encodes text and writes bytes with supplied entry options.
- `DistributedCacheExtensions.SetStringAsync` — Async text write; structured payload compatibility remains the application's concern.
- `AddDistributedMemoryCache` — Registers a process-local implementation; it does not share entries across server processes.
- `AddStackExchangeRedisCache` — Registers Redis for IDistributedCache; distinct from the output-cache Redis integration.
- `RedisCacheOptions` — Configuration for Redis-backed distributed-cache access.
- `RedisCacheOptions.Configuration` — Connection string used when richer connection options are not supplied.
- `RedisCacheOptions.InstanceName` — Key prefix for isolating an application's Redis cache namespace.
- `AddDistributedSqlServerCache` — Registers SQL Server as the distributed-cache provider.
- `SqlServerCacheOptions` — SQL Server cache connection and table configuration.
- `SqlServerCacheOptions.ConnectionString` — Connection details for the backing database.
- `SqlServerCacheOptions.SchemaName` — Schema containing the cache table.
- `SqlServerCacheOptions.TableName` — Backing cache table name.
- `SqlServerCacheOptions.DefaultSlidingExpiration` — Fallback idle lifetime when writes omit an explicit sliding value.
- `AddDistributedPostgresCache` — Registers the PostgreSQL distributed-cache provider when its package is referenced.
- `PostgresCacheOptions` — Provider-specific connection, table, and expiration configuration.
- `AddDistributedSqlServerCache initialization table command` — Creates or updates provider schema; run it deliberately with deployment database permissions.
- `IDistributedCache stores byte arrays` — Object encoding and decoding must be supplied by the app or a higher-level abstraction.
- `Distributed cache serialization boundary` — Byte conversion requires a stable, version-aware format across application instances.
- `Distributed cache key prefix` — Namespace that prevents collisions and can isolate tenants or format versions.
- `Distributed cache partition by tenant` — Tenant identity belongs in keys when data differs by tenant; omission can leak data.
- `Distributed cache network I/O latency` — Remote calls add latency and failure modes; async APIs avoid blocking threads.
- `Use async cache methods for remote stores` — Await I/O and use cancellation/timeouts; async does not eliminate provider failure.
- `Distributed cache cache miss behavior` — A missing key requires the application to consult its authoritative source.
- `RefreshAsync resets sliding expiration` — Refresh extends supported idle expiry but neither rewrites nor revalidates the payload.
- `Distributed cache server restart durability` — Survival across restarts depends on provider persistence configuration, not the interface.
- `Distributed cache provider implementation differences` — Providers vary in atomicity, expiry precision, eviction, durability, and errors.
- `Redis distributed cache package` — Package providing the StackExchange.Redis IDistributedCache integration.
- `SQL Server distributed cache package` — Package providing SQL Server-backed IDistributedCache integration.
- `Postgres distributed cache package` — Package providing PostgreSQL-backed IDistributedCache integration.
- `In-memory distributed cache is process-local` — The interface name does not change the implementation's process-local topology.
- `Distributed cache does not automatically ensure consistency` — Replicas can race, refill concurrently, or miss invalidation; define a consistency strategy.
- `Cache provider fallback strategy` — Choose bounded bypass, explicitly stale use, or failure based on source capacity and correctness.
- `Cache failure and fail-open/fail-closed choice` — Fail-open preserves availability but can overload origin; fail-closed protects origin while reducing availability.
- `Cache payload versioning` — Use compatible formats or versioned keys during rolling deployments.
- `Cache encryption and sensitive values` — Minimize sensitive data and configure transport/storage protection; the abstraction itself does not encrypt.

## Cross-item comparison

Async byte methods are the provider-neutral core; string helpers add text encoding, not arbitrary object serialization. Redis, SQL Server, and PostgreSQL integrations share an interface but not operational guarantees. The in-memory provider remains process-local. Refresh only affects provider-supported sliding expiry. Synchronous APIs can block when backed by remote I/O.

## Examples

String helpers are for text stored as bytes; structured values need a deliberate serializer and versioned key.
```csharp
await cache.SetStringAsync("feature:v1:welcome", "Hello",
    new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2) }, token);
string? greeting = await cache.GetStringAsync("feature:v1:welcome", token);
```
This assumes an injected `IDistributedCache`. A provider exception is not the same as a missing key.

## Common mistakes

Do not call the in-memory provider cluster-shared. Do not block request threads on synchronous network I/O. Do not equate provider failure with a miss or retry without limits. Roll out serializer changes compatibly; include tenant and version dimensions in keys. A distributed abstraction promises no durability or consistency.

## Knowledge checks with answers

1. **What crosses the interface?** Byte arrays.  2. **Does it guarantee cluster sharing?** No, the provider decides topology.  3. **Why async remotely?** Avoid blocking request threads.  4. **Does refresh validate freshness?** No, it refreshes supported idle expiry.  5. **What does fail-open risk?** Origin overload.

## Sources

[Distributed cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed)
[IDistributedCache API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.caching.distributed.idistributedcache)
