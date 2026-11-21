# End-to-end performance engineering for web applications — Reference: ASP.NET Core request and runtime bottlenecks

## Scope and version

This reference describes cross-layer concepts; exact runtime counters and framework behavior must be checked for the deployed .NET release and host.

## How this group fits the mental model

The API’s latency includes queue wait, application work, and dependency waits. Runtime health is shaped by CPU, memory, thread scheduling, sockets, and downstream capacity. A single “request duration” cannot explain where time went.

## Supplied names explained

- `Request critical path and span budget` — The sequential or dependency-critical portions of a request trace. Give stages a time budget within the end-to-end deadline and account for parallel spans without summing them as sequential time.
- `Async I/O versus CPU-bound work` — Async lets threads serve other work while I/O is pending; CPU-bound work still consumes processor time and may need measured parallelism or algorithm changes.
- `ThreadPool starvation` — Delayed scheduling when available worker threads are blocked or demand exceeds supply. Queue length, thread count, blocked stacks, and sync-over-async can help diagnose it.
- `Sync-over-async` — Blocking on asynchronous work, often with `.Result` or `.Wait()`. It can waste threads and contribute to starvation; preserve async flow where supported.
- `Allocation rate and garbage collection` — Allocations create managed memory work; GC reclaims unreachable objects. Measure allocation volume, pause time, retained heap, and request behavior rather than forcing collections.
- `Serialization cost` — CPU and allocations for converting objects to/from wire formats. Large object graphs and repeated conversion can be expensive; profile before changing formats.
- `Response compression CPU tradeoff` — Compression reduces bytes at a CPU cost. Apply where payload and client/network conditions justify it, and avoid wasting CPU on already-compressed content.
- `Streaming and backpressure` — Incremental output can reduce buffering and time to first bytes. Backpressure must bound producer work when consumers are slower.
- `Pagination and bounded response size` — Limit rows and response bytes so one request cannot create unbounded DB, memory, serialization, and network work. Ensure ordering and continuation semantics are correct.
- `Connection pool saturation` — Requests wait for available database or HTTP connections. More connections can overload the dependency; inspect pool wait and downstream capacity before raising limits.
- `HTTP connection reuse` — Reusing transport connections reduces setup and socket churn. Correct handler/client lifetime and server/proxy idle settings matter.
- `Request queueing and admission control` — Queues absorb brief bursts but increase wait under sustained overload. Bound queues and reject or defer work before latency and memory become unbounded.
- `Cancellation propagation` — Pass cancellation to work that can stop when a request is no longer useful. It does not reverse a completed side effect and must not create partial-data corruption.
- `Background queue versus long request` — Durable background work is appropriate when the client need not wait for completion; it needs acknowledgement, retries, idempotency, monitoring, and a status path.

## Cross-item comparison

Async I/O addresses waiting-thread use; profiling may reveal CPU, allocation, blocking, or pool constraints instead. Streaming reduces buffering but requires backpressure. A bounded queue controls overload; a background queue changes the product contract and delivery semantics.

## Examples

For an API with rising latency and a growing ThreadPool queue, inspect blocking stacks, sync-over-async, and downstream pool waits before adding workers. For a large export, stream bounded records with cancellation/backpressure or queue a durable export job if it exceeds request deadlines.

## Common mistakes

- Converting CPU work to `async` and expecting CPU latency to fall.
- Raising connection-pool limits without checking database capacity.
- Returning huge responses because serialization is fast in a local benchmark.
- Moving work to a background queue without a durable completion/error model.

## Knowledge checks with answers

1. What does async I/O improve? Thread utilization during waits, not the CPU cost of the work itself.
2. What is a thread-pool queue signal useful for? Detecting scheduling delay/starvation alongside stacks and other counters.
3. What must a long-running background job expose? Durable acceptance/status, retry and idempotency behavior, failures, and observability.

### Sources

- [ASP.NET Core performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices?view=aspnetcore-11.0)
- [.NET runtime counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/available-counters)
- [dotnet-trace](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace)
- [Runtime metrics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-runtime)
- [HTTP client factory guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory)
