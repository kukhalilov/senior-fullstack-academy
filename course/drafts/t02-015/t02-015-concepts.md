# ASP.NET Core memory distributed hybrid response and output caching — Core concepts and how they fit together

## Learning objectives

By the end, you should be able to choose a cache layer from its consistency and scope requirements, define a safe key, explain freshness and invalidation separately, reason about concurrent misses, and distinguish application-data caching from HTTP response reuse. You should also be able to describe what serialization, provider failure, and user or tenant partitioning change.

## Prerequisites

An application has an authoritative source such as a database or service. A cache is a faster, usually disposable copy. A key is the lookup identity; a value is the stored result. Expiration is a time limit. Invalidation makes an otherwise unexpired result unusable. Serialization converts a value to a representation such as bytes and deserialization reconstructs it. A replica is one running application instance; a process-local store belongs to only one instance.

## Core concepts

### Cache-aside and ownership

In cache-aside, application code checks the cache, loads from the source on a miss, then stores the result. The source remains authoritative. A cache-through abstraction would own more of the source interaction; the general-purpose cache APIs here do not automatically turn a database into a cache-through system. A miss is normal, not an error. A miss storm can still overwhelm the source, so the fallback path needs capacity limits and often coalescing.

### Identity, key design, and isolation

A key must encode all inputs that affect the result: entity identifier, tenant, locale, permissions or user segment when applicable, representation version, and query parameters that change content. Namespace prefixes help avoid collisions and make format migrations explicit. A key that is too broad can return one tenant's data to another; a key that is too specific lowers hit rate and can create unbounded cardinality. Never put secrets or raw personal data in a key when a stable opaque identifier will do.

The security test is not merely “does the endpoint require authentication?” Ask: *Could two callers who receive different authorized data produce the same cache key?* If yes, the cache boundary is unsafe. Output and response caching need the same scrutiny as application-data keys, including headers, query, route, host, and authorization context.

### Freshness, expiration, and invalidation

Absolute expiration bounds the maximum age from a fixed point. Sliding expiration extends lifetime after accesses, which is useful for hot entries but can preserve a value indefinitely without an additional absolute bound. Combining both places an idle timeout and a maximum lifetime. Expiration is not a synchronization mechanism: an update can race with a read or a refill.

Explicit removal, tag invalidation, and versioned keys address change events differently. Removing a known key is simple when the key is known. Tags associate entries with a logical group; a provider may implement tags by making them unusable while stored bytes remain. Versioned keys move new readers to a new namespace, at the cost of old entries living until expiry. In all cases, document how stale a reader may be and what happens if invalidation delivery is delayed or lost.

### Scope and storage

`IMemoryCache` stores object references within one process. It offers neither cross-process sharing nor serialization. Mutating a cached object can change what other code observing the same reference sees; prefer immutable values or defensive copies. Its size units are application-defined, and once a size limit is configured every entry on that cache must state its size. The ASP.NET Core shared cache should not be given a limit casually because unrelated components may also add entries. It is not automatically trimmed according to machine memory pressure. [Memory cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory)

`IDistributedCache` exposes byte-oriented operations. The implementation determines storage topology, expiry precision, durability, consistency, network behavior, and operational limits. `AddDistributedMemoryCache` is useful for local development and single-process scenarios, but it is still process-local. A Redis or SQL provider has different operational behavior; the abstraction alone does not promise a durable or strongly consistent cache. Serialize explicitly and consider schema/version compatibility across rolling deployments. [Distributed cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed)

### Hybrid reads and stampede control

`HybridCache` uses a local primary and may use a configured distributed cache as its secondary. Local and secondary expiration can differ, so instances can observe different freshness windows. Its `GetOrCreateAsync` can coalesce concurrent factory executions for the same key within a shared cache instance. That reduces duplicate origin work in that coordination scope; it is not a cross-replica distributed lock. The factory should be safe if invoked again after a miss, expiry, process restart, or another replica's concurrent fill. [Hybrid cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid)

Hybrid serialization is part of the distributed boundary. Built-in handling covers strings and byte arrays; other types use the configured/default serializer path. Custom serializers must agree across application versions that can read the same secondary entries. Payload and key limits protect resource use. Tags make related entries logically invalid; they do not imply immediate deletion of every stored value. Flags can bypass selected local/distributed reads or writes, disable distributed caching, or disable origin factory execution on a miss. Understand the exact flag combination before using it as a fallback policy.

### HTTP response caching versus output caching

Response caching follows HTTP cache semantics. Request and response `Cache-Control`, `Vary`, validators such as ETag/Last-Modified, and conditional requests affect whether a stored response can be reused. It typically only stores eligible GET/HEAD responses and has restrictions around status, authorization, cookies, and directives. A `304 Not Modified` response confirms that a representation remains valid without retransmitting its body. `Vary` partitions by request headers; the response-cache feature's query-key setting is middleware-specific and is not the HTTP `Vary` header. [Response caching middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/middleware)

Output caching is controlled by server policies attached to endpoints or configured as base policies. The defaults limit eligibility; applying middleware alone does not mean every endpoint is cached. Vary rules form the response identity. Policy order matters: place it after routing and after authentication/authorization so endpoint metadata and access checks are available; place it after CORS so cached output respects the intended CORS behavior. Do not allow a shared cache to bypass identity checks or mix personalized output. The default store is in-process; a Redis output-cache provider is separate from a Redis `IDistributedCache` provider because output caching needs atomic tag operations. [Output caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output)

## Mechanisms and relationships

| Decision | Questions to answer | Common safe direction |
|---|---|---|
| Cache key | Which inputs change the value or caller's rights? | Include all semantic dimensions; version the key when format changes |
| Freshness | How stale may the user see? | Set a bounded expiry and define update invalidation |
| Concurrent miss | Can a burst trigger many identical expensive loads? | Coalesce where available; still size the origin path for independent replicas |
| Scope | Must several replicas share an entry? | Choose a genuinely shared provider, not a process-local implementation |
| Serialization | Can old and new deployments read the same bytes? | Use compatible formats or versioned namespaces |
| Failure | Does the cache protect the source or only improve latency? | Choose bounded timeouts, a fallback policy, and retry limits |
| Response safety | Does identity/tenant/locale affect the response? | Vary or partition safely; otherwise do not share-cache it |

### Current .NET 11 additions

With `MemoryCacheOptions.TrackStatistics` enabled, `MemoryCache` exposes snapshot statistics and built-in .NET metrics for requests, evictions, entries, and estimated size. The estimated-size measurement retains the application's chosen size units. For separate per-cache metrics, the `MemoryCache` constructor has an `IMeterFactory` overload. This is instrumentation support; a listener/exporter still has to collect and send the measurements.

The .NET 11 options-aware `HybridCache.GetOrCreateAsync` overloads pass a mutable `HybridCacheEntryContext` to the factory. After loading the value, the factory can tune effective expiry, flags, and local size based on that value. `HybridCacheEntryOptions` describes the starting options; the context represents the per-fill effective values. This is useful when the loaded result determines its cache lifetime or local-memory cost, but it must remain deterministic enough that callers sharing a fill receive the same policy. [.NET 11 library changes](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries) [HybridCache entry context](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.caching.hybrid.hybridcacheentrycontext?view=net-11.0)

## Worked examples

For product `P-42`, a key `product:P-42` is insufficient if tenants can see different prices. Use a tenant-aware identity such as `product:v2:tenant-17:P-42`, and include locale if localized content is cached. On a write, update the authoritative database first; then invalidate or advance the namespace. If invalidation fails, a short expiry bounds the stale window but does not erase the race.

For a cache stampede, imagine 300 requests arriving after one popular entry expires. A per-process coalescing mechanism may reduce this to one origin load per application instance, so five replicas could still issue five loads. A distributed lock would have broader coordination but adds failure and lease-expiry complexity; the application should not claim it has one merely because the cache is distributed.

For public HTTP output, cache `/catalog?category=books` only if the representation is public and every response-changing query, route, host, or header dimension is included in policy variation. If the response includes user-specific favorites, separate that data into a personalized path or use a safe partition; caching a public response that accidentally contains a user's data is a confidentiality bug.

## Misconceptions and edge cases

- A distributed-cache interface does not guarantee that its implementation is shared, durable, strongly consistent, encrypted, or available.
- Expiration is not invalidation, and neither makes multiple replicas instantly consistent.
- HybridCache factory coalescing is not a global lock across machines.
- A memory cache can hold mutable object references; it does not clone or serialize them.
- `SizeLimit` is not a byte count unless the application chooses that convention.
- Cache output only when the cache key and policy preserve all security and representation boundaries.
- A cache outage can amplify source traffic. Retries without budgets can turn a brief outage into a cascading failure.
- A serialization change during rolling deployment can make entries unreadable; version keys or coordinate formats.
- A cache-aside write has ordering choices. Updating the cache before the database can expose a value that later fails to persist; updating the database first leaves a brief stale window until invalidation.
- HTTP response caching and output caching have separate eligibility rules and middleware behavior; enabling one does not configure the other.

## Knowledge checks with answers

1. **Why does `AddDistributedMemoryCache` not share entries between two server processes?** It implements the abstraction with process-local memory; an interface name does not change its storage topology.
2. **What prevents tenant A from receiving tenant B's cached value?** The lookup identity and response policy must partition by every authorization-relevant dimension, or the result must not be shared.
3. **Does HybridCache coalescing guarantee one origin call across a cluster?** No. It coalesces within the coordination scope of a cache instance; separate replicas can still load concurrently.
4. **Why combine sliding and absolute expiration?** Sliding expiration limits idle lifetime; absolute expiration provides a maximum age even while an entry stays hot.
5. **What does tag invalidation promise?** It makes associated values logically unusable according to the cache implementation; it need not immediately erase their stored bytes.
6. **When is output caching safer than caching an entire personalized response?** When the endpoint's output is genuinely shared or the policy safely partitions every dimension affecting the representation and authorization.

## Sources

[Memory caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory) · [Distributed caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed) · [Hybrid caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid) · [Response caching middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/middleware) · [Output caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output)
