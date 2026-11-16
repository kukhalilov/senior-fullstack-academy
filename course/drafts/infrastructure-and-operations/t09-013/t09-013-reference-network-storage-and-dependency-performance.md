# performance profiling capacity and .NET diagnostics — Reference: I/O, remote dependencies, caching, queueing, and end-to-end timing

# Scope and version

This lesson explains the supplied network, storage, database, cache, and dependency concepts. HTTP/3 is standardized over QUIC; actual client/server support depends on OS, runtime, TLS, proxy, and deployment. .NET diagnostics sources were checked 2026-11-17. [HTTP/3 RFC 9114](https://www.rfc-editor.org/rfc/rfc9114) [.NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/) [SRE SLO workbook](https://sre.google/workbook/implementing-slos/)

# How this group fits the mental model

End-to-end response time is the result of sequential service work, queueing, network hops, and dependencies, plus possible retries and fan-out. Optimize the measured delay on the critical path. A fast application method cannot compensate for waiting on a saturated connection pool or a slow downstream dependency.

# Supplied names explained

## Network and connection setup

- `Network round-trip time` — Time for a signal/request to travel to a peer and back under a defined path. It varies with distance, congestion, routing, and queueing; it is not the total application request time.
- `DNS lookup latency` — Time to resolve a hostname to address information. Cache state, resolver health, search domains, and retries can make lookup time differ by request.
- `TLS handshake latency` — Time spent negotiating a TLS connection and authenticating peers. Reuse, protocol version, certificate validation, network RTT, and resumption affect it.
- `Connection establishment time` — Time to create a usable transport/application connection, including DNS, TCP/QUIC, TLS, and protocol setup as applicable. Measure components separately when diagnosing.
- `Connection pool wait` — Time a request waits for a reusable or newly created connection from a bounded pool. Saturation may reflect slow dependencies, leaked connections, or limits set too low.
- `HTTP request queue time` — Time an HTTP request waits in a client, server, proxy, or framework queue before processing. Instrument the relevant boundary; end-to-end latency alone does not locate it.
- `HTTP connection reuse` — Reusing an established connection for multiple requests to avoid repeated setup. It reduces handshake cost but connection lifetime, idle timeout, DNS changes, and pool policy matter.
- `HTTP/2 multiplexing` — Carrying multiple concurrent streams over one connection. It reduces connection count, but stream-level flow control and a shared connection can still create bottlenecks.
- `HTTP/3 transport` — HTTP mapped over QUIC, which uses UDP and integrates transport security/stream handling. Network, proxy, load-balancer, OS, and runtime support determine whether it is used; do not assume it is faster for every workload. [RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)

## Database and query paths

- `Database query latency` — Duration of a database operation from a defined client/server boundary. It can include pool wait, network, server queue, lock wait, execution, and response transfer.
- `Database connection pool saturation` — A pool has no immediately available connections for new operations. Increasing pool size may overload the database; inspect query duration, concurrency, and server limits first.
- `Database lock wait` — Time a database operation waits for a conflicting lock or equivalent concurrency control. It may dominate latency with low CPU and requires query/transaction evidence.
- `Database execution plan` — The optimizer’s planned or actual operations for a query. It can reveal scans, joins, estimates, and resource costs; statistics, parameters, indexes, and data distribution matter.
- `N+1 query pattern` — A query pattern where fetching a collection triggers one additional query per item. It increases round trips and connection/server work; eager batching or a different projection may help.

## Cache behavior and work topology

- `Cache hit ratio` — Share of lookups served from cache over a defined population and interval. A high ratio is not automatically good if misses are expensive or cached data is stale.
- `Cache miss penalty` — Additional latency/work when an item is absent from cache. Measure downstream cost and concurrent miss amplification.
- `Cold cache` — A cache with little or no relevant data warmed. It represents startup/eviction behavior and often produces different latency from steady state.
- `Warm cache` — A cache containing frequently accessed data for the workload. Results depend on key distribution, data size, TTL, and invalidation.
- `Cache stampede` — Many concurrent misses for the same key trigger duplicate expensive recomputation or downstream reads. Coalescing, staggered expiry, or bounded stale serving may reduce amplification.
- `Request fan-out` — One request triggers work against multiple downstream calls or partitions. Latency depends on parallelism and the slowest critical dependency; failures and retries can multiply load.
- `Dependency latency` — Time attributable to an external service or subsystem. Use client spans and pool/network timing to separate actual dependency time from local queue/wait.
- `Dependency timeout` — A configured maximum wait before a dependency call is canceled or failed. Too long ties up resources; too short can create false failures and retries.
- `Retry amplification` — Extra work caused by retries during slowdowns or failures. Synchronized or unbounded retries can overload the dependency and create a cascading failure.
- `Queue depth` — Number of pending work items. Pair it with arrival/completion rates and age; a stable depth can still represent unacceptable waiting.
- `Queueing theory` — Mathematical analysis of arrivals, service rates, queues, and waiting times. Models rely on assumptions about distributions and stationarity; use it to reason, then validate against measurements.
- `Backpressure` — A mechanism for slowing, rejecting, or signaling upstream work when downstream capacity is limited. Without it, queues can grow until memory or latency fails.
- `Admission control` — Rules that decide whether work is accepted based on capacity, priority, or quotas. Rejecting early can preserve service for critical work and avoid uncontrolled queueing.
- `Bulkhead isolation` — Partitioning resources or concurrency so a failure in one workload/dependency does not consume all shared capacity. The partitions and fallback behavior need careful sizing.
- `Bounded work queue` — A queue with a finite capacity and defined overflow behavior. It limits memory growth but may reject or drop work at saturation, so the policy must be observable.

## Payload, compute, storage, and platform effects

- `Payload size` — The amount of request/response/message data transferred or processed. Large payloads affect bandwidth, allocations, serialization, and storage; measure realistic size distributions.
- `Compression CPU tradeoff` — The balance between reduced bytes transferred/stored and extra compression/decompression CPU and latency. It depends on data compressibility and bottleneck location.
- `Serialization overhead` — Time and allocations spent encoding/decoding structured data. Generated serializers and formats differ; profile the actual payload and path.
- `Disk latency` — Time for storage read/write operations at a specific layer. Cache, queue, filesystem, network storage, flush semantics, and tail behavior matter.
- `Storage IOPS` — Input/output operations per second supported or consumed by storage. Operation size and read/write mix matter; IOPS alone does not define throughput or latency.
- `Storage throughput` — Bytes transferred per unit time by a storage system. Large sequential access and small random access can have different limits.
- `Page cache` — Operating-system memory caching file contents to reduce physical storage reads. Warm-cache benchmarks can hide cold-storage cost; page cache is distinct from application cache.
- `Container CPU throttling` — CPU time restricted by container cgroup quota/limit. Host-wide CPU may be available while the process is throttled at its container boundary.
- `Container memory limit` — A memory boundary applied to a container. Exceeding it can trigger termination or pressure behavior even if host memory is available.
- `Kubernetes CPU request impact` — CPU request influences scheduling and relative CPU allocation/weight under contention; it is not the same as a CPU hard limit. Actual behavior depends on Kubernetes/runtime configuration.
- `Kubernetes memory request impact` — Memory request informs scheduling/reservation decisions; memory limits and node pressure govern different runtime behavior. Requests do not guarantee all resident memory is physically reserved.
- `Network egress cost versus latency` — The tradeoff between sending data across network boundaries and keeping/processing it closer to a user or service. Cost and latency depend on provider path and architecture; measure both.

## End-to-end budgets

- `Distributed trace critical path` — The chain of dependent spans determining the trace’s completion time. Parallel branches overlap; do not sum all durations as if sequential.
- `End-to-end latency budget` — The total allowed response time divided among application, queueing, network, and dependencies. Components must fit the target including tail variability and client/network overhead.
- `Dependency performance budget` — The latency/error/capacity allowance allocated to a dependency call. Track actual pool wait and retries separately so the budget does not hide local waiting.

# Cross-item comparison

| Signal | Likely constraint | Next question |
| --- | --- | --- |
| Long connection pool wait | Pool capacity or slow connection use | Are calls slow, leaked, or concurrency unbounded? |
| Slow query with lock wait | Contention | Which transaction holds the conflicting lock and for how long? |
| High cache hit ratio, slow p99 | Miss tail, hot keys, queueing, or stale data | What is the miss penalty and request distribution? |
| Growing queue depth | Demand exceeds service rate | What are arrival rate, completion rate, oldest age, and overflow policy? |
| High app latency, modest CPU | Network/dependency/pool/lock wait | Which segment dominates the critical path? |

Retries, fan-out, and cache stampedes can amplify the same dependency failure. Apply bounded timeouts, concurrency, retries with jitter/policy, and backpressure together; each policy alone can move rather than eliminate the bottleneck. [SRE SLO workbook](https://sre.google/workbook/implementing-slos/)

# Examples

An endpoint fans out to four services in parallel. Three return in 40 ms, while one takes 700 ms. The request’s dependency critical path includes the slow call, even though total dependency CPU may be small. If each request retries twice on timeout, load on that slow service can multiply during an incident. Measure pool wait, request time, retries, queue age, and dependency latency; do not merely increase connection count.

A container reports low host CPU but the API’s CPU is saturated. Inspect cgroup throttling and its CPU quota alongside process CPU. Increasing replicas may help if downstream database capacity and connection budgets have headroom; otherwise it can shift saturation to the database.

# Common mistakes

- Treating network RTT as total request latency.
- Increasing database pool size without checking server concurrency capacity.
- Assuming HTTP/3 is automatically faster or universally negotiated.
- Interpreting queue depth without age and service rate.
- Retrying aggressively during an outage and amplifying demand.
- Using a cache hit ratio without correctness, staleness, and miss-latency context.
- Profiling only application CPU when the request waits on locks or dependencies.
- Equating a Kubernetes CPU request with a hard CPU limit.
- Summing parallel dependency durations instead of identifying the critical path.

# Knowledge checks with answers

1. What is included in end-to-end latency beyond service time? **Queueing, network, pool waits, and downstream dependencies within the measured path.**
2. Why can a high cache hit ratio coexist with poor p99? **Rare misses, hot-key stampedes, queueing, or slow dependencies can dominate the tail.**
3. What does a bounded queue guarantee? **It limits queue capacity/memory; it does not guarantee that overflow work is delivered.**
4. What can CPU quota explain when host CPU appears low? **Container-level throttling despite unused host capacity.**
5. Why are retries dangerous during dependency failure? **They add load to the already degraded dependency and can amplify the failure.**

# Sources

[HTTP/3 RFC 9114](https://www.rfc-editor.org/rfc/rfc9114) · [.NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/) · [SRE workbook](https://sre.google/workbook/implementing-slos/)
