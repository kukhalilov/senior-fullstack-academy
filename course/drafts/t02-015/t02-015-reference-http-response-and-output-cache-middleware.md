# ASP.NET Core memory distributed hybrid response and output caching — Reference: HTTP cache directives, response caching, output cache policies, variation, and invalidation

## Scope and version

Response caching follows HTTP directives; output caching follows server endpoint policies. The current Redis output-cache provider is distinct from the Redis `IDistributedCache` provider. [Response middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/middleware) [Output-cache Redis registration](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.stackexchangeredisoutputcacheservicecollectionextensions.addstackexchangeredisoutputcache)

## How this group fits the mental model

Response caching considers method/status eligibility, authorization, validators, Cache-Control, and Vary. Output caching forms a server-side key from policy variation and stores the response under configured rules. Middleware order and identity partitioning are security requirements, not performance details. Redis profiling is an operational diagnostic option, not a cache correctness feature.

## Supplied names explained

- `AddResponseCaching` — Registers response-caching services.
- `UseResponseCaching` — Adds response-caching middleware to the pipeline.
- `ResponseCachingOptions` — Middleware cache limits and path matching configuration.
- `ResponseCachingOptions.MaximumBodySize` — Largest response body eligible for storage.
- `ResponseCachingOptions.SizeLimit` — Capacity of the middleware's in-process cache, not a distributed-provider setting.
- `ResponseCachingOptions.UseCaseSensitivePaths` — Controls whether paths differing in case have separate cache identities.
- `ResponseCachingMiddleware` — Applies HTTP caching eligibility and directives in the server pipeline.
- `ResponseCacheAttribute` — MVC metadata configuring response cache headers; it does not force storage.
- `ResponseCacheAttribute.Duration` — Duration used in generated response-cache policy.
- `ResponseCacheAttribute.Location` — Selects shared-cache/client/no-store location behavior.
- `ResponseCacheAttribute.NoStore` — Emits a policy prohibiting storage.
- `ResponseCacheAttribute.VaryByHeader` — Partitions representations by named request headers.
- `ResponseCacheAttribute.VaryByQueryKeys` — Middleware-specific query variation; not the HTTP Vary header.
- `IResponseCachingFeature.VaryByQueryKeys` — Per-request query-key variation feature for response-caching middleware.
- `ResponseCacheLocation` — Location choices for response-cache policy.
- `ResponseCacheLocation.Any` — Permits shared caches under the configured policy.
- `ResponseCacheLocation.Client` — Intended for client cache storage only.
- `ResponseCacheLocation.None` — Disables storage through a no-store policy.
- `Cache-Control response header` — Response directives determine whether caches may store/reuse and for how long.
- `Cache-Control request directives` — Request directives such as no-cache can require validation before reuse.
- `ETag response header` — Representation validator usable for conditional requests.
- `Last-Modified response header` — Time validator; update precision and discipline affect correctness.
- `If-None-Match conditional request` — Asks whether a selected entity tag remains unchanged.
- `If-Modified-Since conditional request` — Asks whether a representation changed after a supplied time.
- `304 Not Modified response` — Allows the client to reuse its stored body without retransmission.
- `Vary response header` — Declares request headers that distinguish cacheable representations.
- `Response caching HTTP semantics` — Reuse depends on HTTP directives, validators, method/status, authorization, and headers.
- `AddOutputCache` — Registers output-cache services and default in-process store.
- `UseOutputCache` — Adds output-cache middleware; endpoint policy/metadata still determines eligibility.
- `OutputCacheOptions` — Global output store limits and policy registration.
- `OutputCacheOptions.AddPolicy` — Registers a named policy selected by endpoint metadata.
- `OutputCacheOptions.AddBasePolicy` — Registers a policy broadly applied unless endpoint-specific rules alter it.
- `OutputCacheOptions.SizeLimit` — Capacity bound for output-cache storage.
- `OutputCacheOptions.MaximumBodySize` — Largest response body eligible for storage.
- `OutputCacheOptions.DefaultExpirationTimeSpan` — Fallback expiration when a policy does not specify one.
- `OutputCacheOptions.UseCaseSensitivePaths` — Controls case sensitivity in output-cache paths/keys.
- `OutputCacheOptions.AddPolicy(String, Action<OutputCachePolicyBuilder>)` — Registers a named policy configured with a builder callback.
- `OutputCacheOptions.AddPolicy(String, Action<OutputCachePolicyBuilder>, Boolean)` — Registers a named builder-configured policy; the Boolean controls whether it is also the default policy.
- `OutputCacheOptions.AddPolicy(String, IOutputCachePolicy)` — Registers a named custom policy implementation.
- `OutputCacheOptions.AddBasePolicy(Action<OutputCachePolicyBuilder>)` — Registers a builder-configured base policy applied broadly.
- `OutputCacheOptions.AddBasePolicy(Action<OutputCachePolicyBuilder>, Boolean)` — Registers a base policy and controls whether it is treated as the default policy.
- `OutputCacheOptions.AddBasePolicy(IOutputCachePolicy)` — Registers a custom policy implementation as a base policy.
- `OutputCachePolicyBuilder` — Fluent configuration for output eligibility, expiry, variation, locking, and tags.
- `OutputCachePolicyBuilder.Expire` — Sets the policy lifetime.
- `OutputCachePolicyBuilder.NoCache` — Makes the policy decline caching.
- `OutputCachePolicyBuilder.Cache` — Allows caching when other eligibility checks pass.
- `OutputCachePolicyBuilder.SetVaryByQuery` — Adds selected query values to the output key.
- `OutputCachePolicyBuilder.SetVaryByHeader` — Adds selected request headers to the output key.
- `OutputCachePolicyBuilder.SetVaryByRouteValue` — Adds route values to the output key.
- `OutputCachePolicyBuilder.SetVaryByHost` — Partitions output by host.
- `OutputCachePolicyBuilder.SetLocking` — Controls request locking to reduce simultaneous duplicate generation in the pipeline.
- `OutputCachePolicyBuilder.Tag` — Associates an entry with a tag for group invalidation.
- `OutputCachePolicyBuilder.VaryByValue` — Adds custom variation; include every input that changes the representation.
- `IOutputCachePolicy` — Custom output-cache policy hook contract.
- `IOutputCachePolicy.CacheRequestAsync` — Determines request eligibility for output caching.
- `IOutputCachePolicy.ServeFromCacheAsync` — Policy hook when serving a cached response.
- `IOutputCachePolicy.ServeResponseAsync` — Policy hook around response handling/storage.
- `OutputCacheContext` — Per-request policy and cache state.
- `OutputCacheContext.Tags` — Tags attached to the current output entry.
- `IOutputCacheStore` — Storage interface for output bytes and tag invalidation.
- `IOutputCacheStore.GetAsync` — Retrieves bytes by key; absence represents a miss.
- `IOutputCacheStore.SetAsync` — Stores bytes with tags and expiration; custom stores must preserve invalidation semantics.
- `IOutputCacheStore.EvictByTagAsync` — Invalidates entries with a tag; backing storage must support correct tag behavior.
- `IOutputCacheBufferStore` — Buffer-oriented output-cache store contract.
- `OutputCacheStore eviction` — Entries can disappear by expiry, size pressure, or explicit invalidation at any time.
- `Microsoft.AspNetCore.OutputCaching.StackExchangeRedis package` — Dedicated Redis output-cache integration, separate from Redis IDistributedCache.
- `AddStackExchangeRedisOutputCache` — Registers the Redis output-cache provider and tag-capable storage behavior.
- `RedisOutputCacheOptions.Configuration` — Connection string for Redis output storage.
- `RedisOutputCacheOptions.ConfigurationOptions` — Richer StackExchange.Redis connection configuration.
- `RedisOutputCacheOptions.ConnectionMultiplexerFactory` — Factory for an application-managed multiplexer.
- `RedisOutputCacheOptions.InstanceName` — Prefix isolating output-cache keys.
- `RedisOutputCacheOptions.ProfilingSession` — Optional Redis profiling session used to collect command profiling data; keep this diagnostic facility deliberate.
- `OutputCacheAttribute` — Controller/endpoint metadata selecting output-cache policy.
- `CacheOutput` — Minimal API convention/metadata opting endpoints into output caching.
- `CacheOutput convention` — Applies output-cache endpoint metadata during route configuration.
- `EvictByTagAsync` — Store operation invalidating entries associated with one tag.
- `Default output-cache policy` — Conservative default eligibility; endpoints generally require an applied policy.
- `Only GET and HEAD cached by default` — Default policy excludes other methods.
- `Only 200 cached by default` — Default policy excludes other response statuses.
- `Responses that set cookies excluded by default` — Avoids sharing responses that may contain caller-specific cookie state.
- `Authenticated responses excluded by default` — Conservative default avoids sharing authenticated personalized responses.
- `Output-cache request locking` — Reduces duplicate generation for the same key within its locking scope; not a cluster lock guarantee.
- `Output-cache tag invalidation` — Groups response entries for eviction.
- `Output cache memory storage default` — The built-in store is process-local, not automatically shared across replicas.
- `Output-cache custom storage provider` — Must implement store semantics, including tags and invalidation.
- `Output cache after UseCors` — Run after CORS middleware so cached responses follow intended CORS handling.
- `Output cache after authentication and authorization` — Access checks should precede serving reusable output; variation still requires security review.
- `Output cache after UseRouting` — Routing makes selected endpoint metadata available to policy evaluation.
- `CORS before response caching` — CORS decisions and representation headers must be respected by response reuse.
- `Output cache policy key variation` — Key must include every request dimension changing the representation.
- `Cache personalized responses safely` — Partition on every authorization-relevant dimension or do not share the personalized output.
- `Cache stampede and thundering herd` — Concurrent misses can overload origin; local request locking is not necessarily cross-replica.
- `OutputCachePolicyBuilder.SetCacheKeyPrefix` — Adds a stable namespace prefix, useful for separating apps or representation versions.
- `OutputCachePolicyBuilder.With` — Composes a custom policy component where supported; do not infer overload semantics from its name.

## Cross-item comparison

HTTP `Vary` is a response header; `VaryByQueryKeys` is middleware-specific metadata. Response caching reuses according to HTTP rules, while output caching uses server policy. Output-cache Redis registration is not `AddStackExchangeRedisCache`: output stores need tag-aware operations. Policy variation must account for every representation input, including tenant and identity where applicable.

## Examples

A public catalog can use an explicit policy varying on a representation-changing query value.
```csharp
builder.Services.AddOutputCache(options => options.AddPolicy("catalog", policy =>
    policy.Expire(TimeSpan.FromSeconds(30)).SetVaryByQuery("category").Tag("catalog")));
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseOutputCache();
app.MapGet("/catalog", (string category) => LoadCatalog(category)).CacheOutput("catalog");
```
The app supplies `LoadCatalog` and the rest of the pipeline. Add every tenant, locale, host, or authorization dimension that changes output, or avoid shared caching.

## Common mistakes

Do not conflate HTTP directives and endpoint policies. Do not omit a response-changing query, route, host, tenant, or identity dimension from the key. Run routing and access checks before reusable output. `VaryByQueryKeys` is not the HTTP Vary header. Redis `IDistributedCache` is not the output-cache Redis store.

## Knowledge checks with answers

1. **What controls response-cache reuse?** HTTP directives, validators, eligibility, and variation.  2. **What does output variation do?** Partitions representations by request inputs.  3. **Is `VaryByQueryKeys` an HTTP header?** No.  4. **Why authorize before output cache?** So access checks precede reuse.  5. **Why separate Redis integrations?** Output stores require tag-aware operations beyond plain distributed-cache semantics.

## Sources

[Response-cache middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/middleware)
[Output-cache guidance](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output)
[Redis output-cache registration](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.stackexchangeredisoutputcacheservicecollectionextensions.addstackexchangeredisoutputcache)
