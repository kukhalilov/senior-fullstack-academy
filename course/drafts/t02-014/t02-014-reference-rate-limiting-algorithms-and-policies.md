# ASP.NET Core CORS antiforgery rate limiting HTTPS and security headers — Reference: Fixed/sliding windows, token buckets, concurrency limits, partitions, queues, and rejection

## Scope and version

This reference covers ASP.NET Core rate-limiting middleware and the built-in `System.Threading.RateLimiting` algorithms. Choose limits from workload and cost measurements; a policy that is numerically precise but based on untrusted partition keys or a single process can give a false sense of protection. [Rate-limiting middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit) [RateLimiterOptions API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.ratelimiting.ratelimiteroptions)

## How this group fits the mental model

A limiter decides whether a request can acquire a permit before it consumes the protected resource. Time-based limiters constrain permit acquisition over periods; concurrency limits constrain how many operations are in flight. Named endpoint policies, a global limiter, partitions, queues, and rejection callbacks determine scope and client behavior. Built-in state is generally local to a process, so deployment replicas each enforce their own state unless a distributed design is added.

## Supplied names explained

### Register and select limiters

| Supplied name | Meaning and use |
|---|---|
| `AddRateLimiter` | Registers rate-limiting services and configures global/named limiter policies in dependency injection. |
| `UseRateLimiter` | Adds middleware that acquires permits and rejects requests when limits are exceeded. |
| `RateLimiterOptions` | Configuration for global limiting, named policies, rejection status/callback, and limiter instances. |
| `RateLimiterOptions.GlobalLimiter` | Limiter applied globally before endpoint-specific policy handling. It cannot assume endpoint metadata or authenticated user state exists unless the pipeline/order makes it available. |
| `RateLimiterOptions.RejectionStatusCode` | HTTP status used when a request is rejected, commonly 429. Use a response contract clients can interpret safely. |
| `RateLimiterOptions.OnRejected` | Callback invoked when a limiter rejects a request. It can add a retry hint/response body; avoid returning internal quota keys or sensitive diagnostics. |
| `RateLimiterOptions.AddPolicy` | Registers a named limiter policy for endpoint metadata to select. |
| `RateLimiterOptions.AddFixedWindowLimiter` | Registers a fixed-window policy with a permit limit and window duration. It is simple but allows bursts on opposite sides of a boundary. |
| `RateLimiterOptions.AddSlidingWindowLimiter` | Registers a segmented sliding-window policy that smooths boundary behavior by recycling expired segment permits. |
| `RateLimiterOptions.AddTokenBucketLimiter` | Registers a token-bucket policy with capacity and replenishment behavior, allowing controlled bursts up to available tokens. |
| `RateLimiterOptions.AddConcurrencyLimiter` | Registers a limiter that caps simultaneous in-flight requests. It does not cap request count per minute/day. |
| `RateLimiterOptions.AddNoLimiter` | Registers a named policy that does not restrict permits. Use for explicit exceptions, not as a fallback for unknown policy names. |
| `RateLimiterOptions.AddPolicy<TPartitionKey>` | Registers a partitioned named policy that selects a limiter based on a key computed from the request. Keep keys trusted and cardinality bounded. |
| `FixedWindowRateLimiterOptions` | Options for permit limit, window, queue, and replenishment behavior of a fixed-window limiter. |
| `SlidingWindowRateLimiterOptions` | Adds segment-count configuration to a time-window limiter and controls queue/replenishment behavior. |
| `TokenBucketRateLimiterOptions` | Controls bucket capacity, replenishment tokens/period, replenishment period, auto-replenishment, and queue. |
| `ConcurrencyLimiterOptions` | Controls active permit count and queued waiters for concurrency limiting. |
| `RateLimitPartition.GetFixedWindowLimiter` | Gets/caches a fixed-window limiter for a partition key using the supplied options factory. |
| `RateLimitPartition.GetSlidingWindowLimiter` | Gets/caches a sliding-window limiter for a partition key. |
| `RateLimitPartition.GetTokenBucketLimiter` | Gets/caches a token-bucket limiter for a partition key. |
| `RateLimitPartition.GetConcurrencyLimiter` | Gets/caches a concurrency limiter for a partition key. |
| `RateLimitPartition.GetNoLimiter` | Gets a no-op limiter partition. Use only for an intentional policy exception after authentication/authorization still protect the endpoint. |

### Leases, rejection, and endpoint metadata

| Supplied name | Meaning and use |
|---|---|
| `RateLimitLease` | Permit lease returned by a limiter acquisition. Dispose it when the protected operation ends so concurrency permits are returned. |
| `RateLimitLease.IsAcquired` | Indicates whether the request obtained the permit. A rejected lease must not proceed to the protected work. |
| `RateLimitLease.TryGetMetadata` | Reads optional metadata attached to a lease, such as suggested retry timing. |
| `MetadataName.RetryAfter` | Metadata name for a suggested delay before retrying, when the limiter provides it. The app may translate it into an HTTP `Retry-After` header. |
| `OnRejectedContext` | Context passed to the rejection callback with the HTTP request/response and rejected lease. |
| `OnRejectedContext.HttpContext` | Current HTTP context in the rejection callback, used to set status, headers, and response body. |
| `OnRejectedContext.Lease` | Rejected rate-limit lease, which may include retry metadata. |
| `OnRejectedContext.Lease.TryGetMetadata` | Reads metadata from the rejected lease to produce a client retry hint when available. |
| `RateLimiterOptionsExtensions` | Extension methods that simplify registering built-in policies with `RateLimiterOptions`. |
| `RequireRateLimiting` | Endpoint convention to apply a named rate-limit policy. |
| `DisableRateLimiting` | Endpoint convention to bypass a limiter where an intentional exception is required. Do not let it bypass authentication or authorization. |
| `EnableRateLimitingAttribute` | MVC endpoint metadata to select a named rate-limit policy. |
| `DisableRateLimitingAttribute` | MVC metadata to disable rate limiting for a selected action/controller where supported. Keep exceptions narrow. |
| `RateLimiterMiddleware` | Middleware that applies configured limiters to requests and invokes endpoint work only when permits are acquired. |
| `Global rate limiter` | Broad limiter applied to requests across the app, useful for baseline load shedding. Per-user limits often require a named endpoint policy after authentication has populated the principal. |
| `Named endpoint rate-limit policy` | Reusable policy selected through endpoint metadata. It can be designed around endpoint cost or user/tenant partitions. |

### Algorithms and their settings

| Supplied name | Meaning and use |
|---|---|
| `Fixed window limiter` | Counts permits in a fixed time interval and resets at its boundary. A burst just before and after reset can exceed the intuitive rolling-window rate. |
| `Sliding window limiter` | Divides a time window into segments and carries counts forward as segments expire, reducing fixed-boundary bursts at additional bookkeeping cost. |
| `Token bucket limiter` | Starts with a bounded token capacity and replenishes tokens at a configured rate. It permits short bursts up to capacity while enforcing longer-term average throughput. |
| `Concurrency limiter` | Allows a fixed number of operations at once and optionally queues others. It protects scarce in-flight resources but does not impose a time-based request quota. |
| `QueueProcessingOrder` | Enum controlling which queued waiters are selected first when capacity is available. Queueing increases latency and memory use. |
| `QueueProcessingOrder.OldestFirst` | Processes oldest queued requests first, favoring earlier arrivals. |
| `QueueProcessingOrder.NewestFirst` | Favors newer queued requests; when the queue is full, older requests can be displaced according to limiter behavior. |
| `PermitLimit` | Number of permits available within a time window or concurrently, depending on limiter type. Calibrate against measured service capacity. |
| `Window` | Duration of a fixed/sliding limiter period. It defines the count interval, not a universal SLA. |
| `SegmentsPerWindow` | Number of subwindows used by a sliding-window limiter. More segments make recycling smoother but increase bookkeeping. |
| `TokensPerPeriod` | Number of tokens replenished per token-bucket replenishment period. Together with capacity, it controls burst and sustained rates. |
| `AutoReplenishment` | Controls whether a limiter manages its own replenishment timer. Framework helpers may coordinate replenishment; verify the selected registration surface before changing it. |
| `QueueLimit` | Maximum queued waiter count. Large queues can convert rejection into long delays and memory pressure. |
| `QueueLimit zero rejects instead of queueing` | A zero queue limit means excess requests are rejected immediately rather than waiting for a permit. |

### Operations, deployment, and failure boundaries

| Supplied name | Meaning and use |
|---|---|
| `RateLimiterOptions.OnRejected callback` | Callback point for customized 429/error behavior and optional retry information. It should be fast and should not perform expensive work that defeats load shedding. |
| `429 Too Many Requests response` | Standard HTTP response indicating the client exceeded a rate policy. Include a stable error shape and optional `Retry-After` guidance when known. |
| `Retry-After response metadata` | Tells a client when it may retry. It can be expressed as delay/date according to HTTP behavior; do not promise exact availability if the limiter lacks timing data. |
| `Partition by authenticated user` | Gives each authenticated user distinct quota state. The limiter must run after authentication for endpoint policies, and the user identifier must be stable/trusted. |
| `Partition by client IP trust boundary` | Partitions using remote IP. Behind proxies, trust only configured forwarding sources; otherwise the IP can be spoofed or collapse all clients to the proxy address. |
| `Per-process limiter versus distributed limiter` | Built-in limiter state normally belongs to one process. With N replicas, aggregate capacity can be roughly N times the local allowance unless a coordinated distributed limiter or edge policy is used. |
| `Rate limiting after routing endpoint policy metadata` | Endpoint metadata must be selected by routing before middleware can apply endpoint-specific policy. |
| `UseRateLimiter after UseRouting for endpoint-specific policies` | Place the middleware after routing when policies come from endpoint metadata. If partitioning by authenticated user, also ensure authentication runs before the limiter evaluates the user key. |
| `Rate limiting is not a substitute for upstream DDoS protection` | App middleware consumes resources to inspect each request and typically has limited scope. Use edge/network protections for volumetric attacks and design resource quotas separately. |

## Cross-item comparison

| Algorithm | Controls | Useful when | Main failure mode |
|---|---|---|---|
| Fixed window | Count per fixed interval | Simple coarse quotas | Boundary bursts |
| Sliding window | Count across moving segmented interval | Smoother time-based quotas | More state/bookkeeping |
| Token bucket | Sustained rate plus bounded burst | APIs needing burst tolerance | Large bucket allows large instantaneous load |
| Concurrency | Simultaneous in-flight work | Slow/expensive operations | Does not limit total requests over time |

Queues are not free capacity. A queue that is too large makes clients wait while memory and request state accumulate; immediate rejection can be healthier under overload.

## Examples

### Use a named per-user limiter after authentication

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("PerUserReports", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

var app = builder.Build();
app.UseRouting();
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();
app.MapGet("/reports", GetReports).RequireRateLimiting("PerUserReports");
```

This is a registration/pipeline snippet. Ensure `UseRateLimiter` runs after routing and after authentication for a user-based key. In production, do not silently put anonymous and authenticated callers into one shared partition if that creates a bypass or fairness problem. [Rate-limiting middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit)

### Return a retry hint when available

In an `OnRejected` callback, inspect `MetadataName.RetryAfter` from the lease if present and write a corresponding `Retry-After` value. If metadata is absent, return a stable 429 response without inventing a precise retry time.

## Common mistakes

- Assuming a concurrency limiter caps requests per minute.
- Choosing a fixed window without considering boundary bursts.
- Letting attacker-controlled unique partition keys allocate unbounded limiter state.
- Partitioning by user before authentication has populated the principal.
- Trusting forwarded client IP headers from arbitrary sources.
- Assuming per-process quotas apply globally across replicas.
- Using a large queue to hide overload and increasing tail latency/memory pressure.
- Applying a global limiter without understanding its position relative to endpoint-specific policies.
- Adding expensive database work in `OnRejected` and defeating load shedding.
- Treating a 429 policy as an upstream DDoS defense.
- Disabling a limiter on an endpoint that performs expensive work without a measured reason.

## Knowledge checks with answers

1. **Which limiter controls concurrent work?** `ConcurrencyLimiter`; it does not provide a requests-per-minute cap.
2. **Why can a fixed window allow bursts?** Requests can consume the limit immediately before and after a reset boundary.
3. **Where should user-partitioned limiting run?** After routing selects endpoint metadata and after authentication supplies a stable user principal.
4. **Why is `QueueLimit=0` useful?** It rejects excess demand immediately instead of accumulating waiters.
5. **Does each replica share limiter counters automatically?** No. Built-in limiter state is typically per-process; global coordination needs an explicit distributed/edge strategy.

## Sources

- [Rate limiting middleware in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit)
- [RateLimiterOptions API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.ratelimiting.ratelimiteroptions)
