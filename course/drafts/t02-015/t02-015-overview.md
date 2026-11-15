# ASP.NET Core memory distributed hybrid response and output caching — Big-picture orientation and mental model

## Problem and purpose

Computing a response repeatedly can consume database connections, CPU, network bandwidth, and user time. A cache holds a reusable result under a key so later work can avoid recomputation. That shortcut is safe only when the key identifies the same logical input, the cached value is safe for the caller, and the freshness policy fits the data. A cache is therefore a consistency and security design, as well as a performance tool. [Caching overview](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/overview)

ASP.NET Core has several caching layers because they solve different problems. `IMemoryCache` retains application objects in one process. `IDistributedCache` is a byte-oriented abstraction whose configured provider may be shared by several application instances. `HybridCache` composes a local cache with an optional distributed secondary and coordinates concurrent fills for the same key. HTTP response caching follows HTTP cache rules for clients and intermediaries; output caching is server-managed response reuse under endpoint policies. No one layer is automatically correct for every kind of data.

## Plain-language mental model

Imagine a restaurant. The kitchen's whiteboard is a process-local memory cache: quick to read, but another branch has a different board. A shared order system resembles a distributed cache: branches can consult it, but network access costs time and the service can fail. A hybrid cache uses both. A printed menu handed to every customer resembles an HTTP response cache only loosely: HTTP has explicit rules about who may store a response and when it is fresh. Output caching is more like the restaurant choosing to prepare a reusable public menu response under a controlled policy.

Every cached value has five questions: **what key identifies it; who may observe it; where is it stored; how long can it be used; and how is it invalidated?** A sixth question is what the application does when the cache is unavailable. Cache misses must return to an authoritative source, and stale data must be an accepted product decision rather than an accidental side effect.

## How the parts fit together

| Layer | Cached thing | Typical scope | Main strength | Main constraint |
|---|---|---|---|---|
| Memory cache | Application object | One process | Lowest access overhead; no serialization boundary | Other replicas do not see it; shared objects can be mutated |
| Distributed cache | Bytes under a key | Depends on provider and deployment | Can share values across app instances | Network, serialization, provider-specific durability and consistency |
| Hybrid cache | Local and optional distributed value | Local per process plus provider scope | Fast local reads and coordinated cache fills | Local copies can differ in freshness; tags are logical invalidation |
| HTTP response cache | HTTP response eligible under HTTP semantics | Browser or intermediary, with server middleware participation | Uses standard cache directives and validators | Request and response headers determine eligibility |
| Output cache | Server response body and metadata | Configured server store | Endpoint-aware policy, variation, tags, and locking | Policy must partition callers safely; default store is in-process |

These layers are not synonyms. Caching a database result as an object is different from caching a complete HTTP response. A response cache must account for headers and HTTP directives; an application cache must account for data ownership, serialization, and tenant scope. A distributed cache is an abstraction, not a promise that every provider is durable or globally consistent. [Memory caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory) [Distributed caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed)

## Concept map

```text
authoritative source
  └─ cache-aside read: key → lookup → miss → load → store → return
       ├─ process object store: IMemoryCache
       ├─ byte store/provider: IDistributedCache
       └─ HybridCache: local primary + optional distributed secondary

HTTP request → routing/authentication/CORS → cache eligibility and key
  ├─ ResponseCachingMiddleware: HTTP cache directives and validators
  └─ OutputCache middleware: server policy, variation, tags, store
```

Freshness is controlled with expiration, explicit removal, tags, or versioned keys. Stampedes happen when many callers miss together and all perform the expensive load; request coalescing or locking can reduce duplicate work, but does not make the origin unlimited or guarantee a distributed lock. Invalidation and freshness need separate thought: setting a short expiration bounds possible staleness, while an invalidation signal can make an entry unusable sooner.

## End-to-end walkthrough

Suppose a product catalog endpoint reads public product summaries. Define a key such as `catalog:v3:tenant-17:category-4:locale-en`; include every dimension that changes the result, and never omit tenant or authorization scope when it matters. On a miss, read the database, produce an immutable summary, and cache it for a bounded period. On an update, either remove/version the relevant key or accept the documented stale window. If several requests miss at once, coalesce the load where the chosen API supports it and make the database path safe under the remaining load.

For several app replicas, choose a real shared secondary provider if sharing is required. A process-local memory provider does not become distributed merely because it implements `IDistributedCache`. If the cached object contains personal information, partition by the correct identity and avoid turning a shared endpoint response into cross-user disclosure. For a public GET endpoint, output caching may be appropriate if the policy varies by every representation dimension. For browser/proxy reuse, HTTP response caching is appropriate only if the response's directives and validators permit it. [Hybrid caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid) [Output caching](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output)

## When to use it and tradeoffs

Use memory caching for small, disposable, process-local data where independent replicas can refill safely. Use a shared provider behind the distributed abstraction when replicas need common values, accounting for network errors and serialization. Use the hybrid layer when its local/secondary behavior, factory coalescing, and tag model fit the workload. Use response caching when HTTP cache semantics are the desired contract. Use output caching when the server should control response reuse with endpoint policies.

Do not cache a value just because it is expensive: first establish its source of truth, acceptable staleness, privacy boundary, size, and failure behavior. Avoid caching highly personalized responses without a correct partition. Avoid unbounded keys or payloads. Do not use a cache as the only durable copy of data. A cache outage should not silently become a retry storm; choose bounded timeouts, fallback behavior, and degradation policy. [Response caching middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/middleware)

## Recent .NET 11 changes

.NET 11 adds optional built-in `MemoryCache` metrics when statistics tracking is enabled, including hit/miss, evictions, entry count, and estimated size. The estimated size uses application-defined cache units, not bytes. It also adds options-aware `HybridCache` factory overloads: a fill callback can adjust effective expiration, flags, or local size after seeing the fetched value. These changes improve observability and per-result policy control; they do not change key-safety, freshness, or provider-failure requirements. [.NET 11 library changes](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries)

## What later lessons cover

The concept lesson develops identity, freshness, invalidation, coalescing, serialization, and failure behavior before the reference lessons explain the supplied memory, distributed, hybrid, HTTP response, and output-cache APIs. Practice then asks you to choose a layer and implement safe keying and invalidation; the interview lesson focuses on explaining the tradeoffs and security implications.
