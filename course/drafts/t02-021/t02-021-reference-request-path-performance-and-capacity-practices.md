# deployment settings environments troubleshooting and performance — Reference: async request handling memory payloads data access and measurement-led optimization

## Scope and version

This reference applies ASP.NET Core performance guidance to the request path. It focuses on recurring hot paths, bounded resource use, async I/O, payload/data access, and measurement. There is no universal throughput or latency target: results depend on hardware, runtime, network, downstream services, payloads, concurrency, and configuration. Use the current supported ASP.NET Core release and benchmark a representative workload. [Performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices)

## How this group fits the mental model

Each request consumes a share of finite CPU, threads, memory, sockets, database connections, and downstream capacity. Blocking waits retain request threads; large buffers retain memory; redundant queries extend connection use; and queueing increases tail latency. Optimization starts with a measurable symptom and follows the request across its dependencies. Async I/O improves thread utilization during waits, while bounding concurrency and payloads controls resource demand.

## Supplied names explained

| Supplied name | Explanation |
|---|---|
| `ASP.NET Core hot code path` | Frequently executed code where meaningful execution time accumulates; prioritize it over rarely used paths. |
| `Measure before optimizing` | Capture baseline latency, throughput, allocations, CPU, and dependency pressure before changing code. |
| `Synchronous blocking and ThreadPool starvation` | Blocking many ThreadPool workers prevents unrelated requests from running, causing queue growth and long latency. |
| `Task.Wait and Task<TResult>.Result sync-over-async hazard` | Blocks a request thread waiting for asynchronous completion and can contribute to starvation/deadlocks. |
| `Do not wrap synchronous blocking work in Task.Run and immediately await it` | Adds ThreadPool scheduling but the synchronous operation still occupies a worker; it is not scalable async I/O. |
| `Async I/O across the full call chain` | Await asynchronous database, HTTP, file, and other I/O APIs so waiting does not pin request threads. |
| `Async controller and Minimal API handlers` | Use task-returning endpoint actions when their work is asynchronous, allowing the host to await and observe completion. |
| `CancellationToken propagation from HttpContext.RequestAborted` | Passes a request-disconnect/cancel signal downstream so unnecessary work can stop cooperatively. |
| `Request deadline and downstream operation cancellation` | Apply bounded time budgets to downstream calls and link them with request cancellation; a timeout is not an automatic rollback. |
| `CPU-bound versus I/O-bound request work` | CPU-bound work consumes processor time; I/O-bound work waits. Async helps the latter's thread usage, not the former's computation speed. |
| `Long-running work outside the request-response path` | Persist/queue work when it cannot safely finish within client and proxy deadlines; return a job/status contract. |
| `BackgroundService versus durable message broker for deferred work` | A local hosted service can run process-local work; a durable broker persists and coordinates jobs across crashes/replicas. Choose based on the delivery promise. |
| `Avoid unnecessary locks on hot request paths` | Contended locks serialize requests and can hold threads; use concurrency-safe design or narrow coordination only where required. |
| `Avoid async void in request handling` | The host cannot await completion or reliably observe exceptions from `async void`; return `Task`/`Task<T>`. |
| `Avoid concurrent access to HttpContext` | `HttpContext` is not thread-safe; do not access it simultaneously from parallel branches. Copy needed immutable values first. |
| `Do not store IHttpContextAccessor.HttpContext in a field` | The context is request-scoped and may be unavailable or wrong later; capture only the specific request data needed during the call. |
| `Pagination for large result collections` | Bounds response and memory size and reduces work per request; choose stable sorting/cursors to avoid skips/duplicates as data changes. |
| `IEnumerable<T> serialization and synchronous enumeration risk` | Serializers may enumerate a synchronous sequence while writing; lazy database queries can cause synchronous I/O or hold resources unexpectedly. Materialize bounded projections or use supported async streaming. |
| `IAsyncEnumerable<T> asynchronous response enumeration` | Allows asynchronous item production/serialization where the formatter and endpoint support it; it changes response commitment and error behavior. |
| `IAsyncEnumerable<T> cancellation and response streaming boundary` | Propagate cancellation into enumeration; after headers/items are sent, a later failure cannot be replaced with a normal error response. |
| `Avoid loading large request bodies entirely into memory` | Buffering a large upload raises per-request memory and large-object pressure; stream to bounded processing/storage where appropriate. |
| `Avoid buffering large response bodies unnecessarily` | Response buffering increases memory and delays delivery; stream when the contract and middleware permit. |
| `HttpRequest.ReadFormAsync versus synchronous Request.Form access` | Prefer asynchronous form parsing to avoid synchronous body reads on request threads. |
| `Response compression middleware and compressed payload tradeoffs` | Compression can reduce network bytes at CPU cost; avoid compressing already-compressed or tiny content without workload evidence. |
| `Static file caching and content fingerprinting` | Long cache lifetimes work best for versioned/fingerprinted assets so changed content gets a new URL. |
| `Cache frequently read data when bounded staleness is acceptable` | Caching can reduce repeated I/O, but define expiration/invalidation and tolerate only an understood stale window. |
| `Output caching middleware` | Server-controlled response caching with endpoint policies, variation, tags and invalidation; it differs from HTTP response caching, which follows client/proxy cache directives. |
| `OutputCacheAttribute and CacheOutput` | Apply an output-cache policy to MVC or Minimal API endpoints; place output-cache middleware after routing and before endpoint execution according to current hosting guidance. |
| `OutputCachePolicyBuilder` | Builds policies for status, methods, vary-by keys, tags, expiration and locking. Cache keys must include every response-varying dimension. |
| `OutputCache resource locking` | Enabled by default to reduce cache stampedes for a cache key; disabling it allows concurrent regeneration and should be driven by workload evidence. |
| `OutputCache default eligibility` | By default, only successful GET/HEAD responses without cookies and without authenticated requests are cached; custom policy changes can expand exposure and must preserve user isolation. |
| `OutputCache size and body limits` | Default storage size limit is 100 MB and maximum cached response body is 64 MB in the documented current implementation; these are configurable runtime values, not capacity guarantees. |
| `Output caching versus response caching` | Output caching is server-policy controlled and supports explicit invalidation/locking; response caching follows HTTP cache directives and may be bypassed by client request headers. |
| `Cache personalized response data only with safe variation boundaries` | User-specific responses must vary/isolate correctly; shared-cache mistakes can leak one user's data to another. |
| `Database query projection and retrieving only required columns` | Select only fields needed by the response, reducing database, network, materialization, and serialization work. |
| `Reduce remote data-store round trips` | Combine/selectively batch operations where semantics allow; avoid over-fetching or large unbounded batches. |
| `Asynchronous database access and connection pool pressure` | Async database calls release request threads during waits but do not release the database connection until the operation completes; slow queries still exhaust pools. |
| `EF Core no-tracking query for read-only workloads` | Disables change tracking when entities are only read, reducing tracking overhead; it does not fix an inefficient SQL query. |
| `Large object allocations on hot code paths` | Large allocations raise GC pressure and can induce pauses; measure allocation sources and avoid repeated oversized buffers. |
| `Allocation rate and garbage collection pause impact` | High allocation rate increases collection work; pauses and heap growth can affect latency, especially tail latency. |
| `Avoid unnecessary object serialization and copies` | Extra transforms/copies consume CPU and memory bandwidth; preserve needed isolation and correctness while removing redundant work. |
| `Minimize response payload size and unnecessary JSON fields` | Smaller payloads reduce serialization, network, and client parsing cost; preserve the API contract and needed fields. |
| `Streaming versus buffering tradeoffs` | Streaming lowers full-body memory use and can start delivery earlier; buffering simplifies retries/validation but consumes memory and commits later. |
| `Exception-driven control flow in performance-sensitive code` | Expected branching through exceptions adds cost and obscures failures; reserve exceptions for exceptional conditions, not routine lookup results. |
| `Load testing versus microbenchmarking` | Load tests reveal system interaction/queueing at concurrency; microbenchmarks isolate local code and do not predict full-service capacity by themselves. |
| `Throughput, latency percentiles, concurrency, and saturation` | Interpret requests per time together with response distribution, active load, and exhausted resources. Throughput alone can hide overload. |
| `p50 p95 and p99 request latency` | Percentiles show median and slower-tail user experiences; p99 is sensitive to queueing and slow dependencies that averages hide. |
| `Queueing and tail latency under load` | As demand approaches capacity, queues grow and high percentiles rise rapidly; adding concurrency without capacity can worsen wait time. |
| `ThreadPool starvation indicators` | Rising request latency/queueing, delayed continuations, and worker-thread growth can indicate blocked workers; confirm with traces/counters. |
| `Database connection pool exhaustion indicators` | Connection-open waits, pool timeout exceptions, and low throughput can indicate leaked/long-held connections or excessive query concurrency. |
| `OpenTelemetry metrics and traces for request bottlenecks` | Metrics show aggregate behavior and saturation; traces correlate request spans with dependencies to locate latency. Protect sensitive attributes. |
| `dotnet-counters and dotnet-trace for production-safe initial diagnostics` | Runtime tools can inspect counters or collect traces for a bounded diagnostic window; consider overhead, permissions, data sensitivity, and production access policy. |
| `Performance optimization regression testing and representative workload` | Re-run correctness and performance checks using realistic payloads, concurrency, dependency latencies, and cache state after each significant change. |

## Cross-item comparison

Async I/O primarily improves thread availability while operations wait; streaming/pagination bound memory and payload size; caching reduces repeated dependency work but introduces staleness and isolation risks. Load testing measures how the whole system behaves under concurrent demand; microbenchmarking measures a small local operation. Use percentiles and resource saturation together to determine whether CPU, thread pool, memory/GC, network, or a downstream pool is the bottleneck.

## Examples

### Async endpoint with cancellation and projection

```csharp
app.MapGet("/orders", async (
    int page,
    OrdersDbContext db,
    HttpContext context) =>
{
    const int pageSize = 50;
    var safePage = Math.Max(page, 1);
    var rows = await db.Orders
        .AsNoTracking()
        .OrderBy(order => order.Id)
        .Skip((safePage - 1) * pageSize)
        .Take(pageSize)
        .Select(order => new OrderSummary(order.Id, order.Status, order.Total))
        .ToListAsync(context.RequestAborted);

    return Results.Ok(rows);
});
```

This bounds the page and selected columns, uses asynchronous database access, and propagates cancellation. Offset paging can become expensive or unstable for deep/changing result sets; cursor/keyset pagination may better fit that contract. A read-only projection and `AsNoTracking` avoid unnecessary entity tracking.

### Use a stream for a genuinely large result

An endpoint returning `IAsyncEnumerable<T>` can produce rows as they are fetched, but it must ensure the database enumerator and connection remain valid through response writing. Propagate request cancellation and define what happens if enumeration fails after the response starts. If clients require an all-or-nothing document, streaming is not equivalent to buffering it before response commitment.

## Common mistakes

- Optimizing a code path before measuring its contribution.
- Using `.Result`, `.Wait()`, or `Task.Run` to disguise synchronous I/O.
- Assuming async database calls remove connection-pool pressure.
- Launching fire-and-forget work inside a request and losing errors on shutdown.
- Capturing `HttpContext` or request-scoped objects for concurrent/background use.
- Returning all rows or a huge serialized object when pagination/streaming is appropriate.
- Streaming without considering cancellation, response commitment, and enumerator/database lifetimes.
- Caching personalized responses without a safe cache key/variation policy.
- Treating average latency or throughput as proof the service meets tail-latency goals.
- Running a microbenchmark and claiming production capacity.
- Interpreting `dotnet-trace` output without a representative time window or correlating it to user symptoms.

## Knowledge checks with answers

1. **Does `async` speed CPU-bound code?** No. It helps avoid blocking threads during asynchronous waits; CPU work still consumes CPU.
2. **Does an async database call free its database connection?** No. The connection remains occupied by that operation until it completes/disposes.
3. **Why can a stream fail after a success status was sent?** Headers may be committed before later async enumeration produces an error.
4. **What should accompany p95/p99 latency?** Throughput/concurrency and saturation/resource signals, plus traces for dependency attribution.

## Sources

[Performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices) · [Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration)
