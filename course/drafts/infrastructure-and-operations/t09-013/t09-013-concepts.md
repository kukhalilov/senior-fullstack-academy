# performance profiling capacity and .NET diagnostics — Core concepts and how they fit together

# Learning objectives

- Define a measurable performance question and representative workload before profiling.
- Distinguish latency, service time, queueing delay, throughput, concurrency, utilization, and saturation.
- Recognize benchmark bias, coordinated omission, noise, warmup, and statistical uncertainty.
- Match .NET diagnostic tools to CPU, allocation, heap, thread, and runtime hypotheses.
- Interpret profiles as evidence while accounting for sampling, overhead, symbols, and process boundaries.
- Estimate capacity with headroom, failure scenarios, and sustainable throughput rather than a single maximum.

# Prerequisites

You should know what a request, process, thread, queue, container, deployment, and dependency are. Familiarity with C# asynchronous code and garbage collection helps. A percentile is a rank in an observed distribution; p99 is the value at or below which 99% of observations fall according to the measurement method.

# Core concepts

## Start with a requirement and workload model

“Make it faster” is not testable. Define user-visible latency percentile, throughput, error rate, resource ceiling, or cost per request. State the workload: request mix, payload and database sizes, concurrency, arrival rate, session behavior, cache state, geography, dependency delays, and deployment limits. Include normal, peak, burst, and degraded conditions when relevant.

A representative workload is not necessarily an exact copy of production. It should preserve the characteristics that drive cost and contention. A benchmark with tiny data and warm cache may systematically hide index, allocation, I/O, and cold-start costs. Record test software, hardware, runtime, environment, input set, and configuration so results can be reproduced.

## Separate latency into service and waiting

Latency or response time is the end-to-end duration observed by a caller. Service time is time actively spent doing the operation, while queueing delay is waiting for a worker, connection, lock, network, or downstream service. Throughput is completed work per unit time; concurrency is work in progress; utilization is fraction of a resource in use; saturation indicates demand exceeding comfortable service capacity, often visible in queues or waits.

Little’s Law, `L = λW`, applies to a stable system over a consistent boundary: average work in system equals arrival/completion rate times average time in system. It helps sanity-check queue and latency measurements but does not predict capacity if the system is unstable or workload changes. When arrival rate persistently exceeds completion rate, a queue grows. Adding threads can worsen contention or overload dependencies rather than solve the bottleneck.

## Measure distributions and avoid benchmark bias

Mean latency summarizes total time divided by observations and can hide a long tail. Percentiles describe ranks, but at low volume they are noisy. Maximum is highly sensitive to sample count and rare disturbances. Report latency distribution alongside request count, time window, workload, and error rate.

Warm-up accounts for JIT compilation, caches, connection pools, and runtime initialization. Cold-start latency measures a different condition. Steady-state performance should be measured after representative warmup, but cold starts still matter for autoscaled or serverless workloads. A baseline benchmark must include environment variability, confidence intervals, variance, and outliers rather than treating every run as exact.

Open-loop load sends arrivals on a schedule independent of response completion; it exposes overload but can build a backlog. Closed-loop load starts a new operation after an earlier one completes; when the server slows, the generator’s offered rate drops and may conceal queued demand. Coordinated omission happens when a tool records latency only when it issues work, omitting the time a request would have waited during a stall. Choose a generator and histogram method that represent the client’s experience.

Microbenchmarks isolate a small operation; macrobenchmarks represent a broader app path. Load tests check expected traffic, stress tests find breaking behavior, spike tests examine abrupt demand, soak/endurance tests reveal leaks or drift over long periods, capacity tests estimate sustainable demand, and scalability tests examine how behavior changes as resources or traffic scale. These are complementary test questions, not interchangeable labels.

## Use profiles to test a bottleneck hypothesis

A sampling profiler periodically records executing stacks. A flame graph groups stack samples by call path and width by sample count/weight; it is not a chronological timeline. Inclusive CPU time includes work in descendants; exclusive time attributes samples to the frame itself. A call tree helps navigate callers/callees, and a hot path is a stack consuming a large share of the selected measure. Verify the path is on a user-critical operation before optimizing it.

Instrumentation profilers record selected calls/events and can answer exact count or timing questions, but overhead can perturb execution. Deterministic profiling often changes timing more than sampling. Compare profiler overhead and use the least intrusive method that can answer the hypothesis. Amdahl’s law says speedup is bounded by the fraction of total work improved; optimizing a small fraction yields limited overall gain. Re-profile after each material change because the bottleneck can move.

## .NET runtime diagnostics have different evidence surfaces

Runtime counters provide a low-friction trend view for CPU, allocation, GC, thread pool, exceptions, and working set. EventPipe captures runtime and `EventSource` events into trace artifacts; `dotnet-trace` is the standard client. A dump is a process snapshot for thread, heap, and lock analysis; a GC dump focuses on managed heap information. `dotnet-stack` captures current managed stacks. `dotnet-monitor` provides a service endpoint for collecting and managing diagnostics. `dotnet-dsrouter` proxies diagnostic ports for mobile/emulator or isolated targets. The `Microsoft.Diagnostics.NETCore.Client` library lets custom tools use the diagnostics IPC protocol.

The runtime diagnostic port is a local IPC channel. Windows uses named pipes; Linux/macOS use Unix domain sockets for CoreCLR. Tools commonly discover it by process ID, but container namespaces, user identity, sandboxing, and port configuration affect access. Diagnostic collection may be disabled or restricted for security. Dumps and traces can include in-memory application data; treat them as sensitive production artifacts.

`System.Diagnostics.Metrics` is the newer .NET metrics API. `EventCounter` and `EventCounters` are older diagnostic metric mechanisms. `DiagnosticSource` and `DiagnosticListener` provide in-process diagnostic events that consumers can observe; `Activity` and `ActivitySource` are tracing primitives. A `System.Runtime` meter exposes runtime metrics on current .NET, while older runtimes expose EventCounters. `dotnet-counters` handles the appropriate path based on target runtime version; do not infer API equivalence from similar-looking values.

## Runtime and OS bottlenecks interact

CPU sampling can identify managed hot stacks; OS profilers such as Linux `perf` or Windows Performance Recorder/Analyzer can add native/kernel scheduling and system evidence. Process CPU time is not the same as thread CPU time or machine CPU utilization. A container CPU quota can throttle a process even when host-wide CPU looks low. A working set includes resident process memory, while managed heap is only one part; native memory, mapped files, stacks, and allocator overhead may also grow.

Allocation rate is bytes created per time; retained heap is objects still reachable after collection; working set is resident memory. High allocation can cause frequent GC without a leak; growing retained objects may signal retention. LOH and POH have distinct behavior; pinned objects can constrain movement. Finalizer backlog can delay cleanup. Compare counter trends with heap snapshots, object lifetimes, root paths, and native memory rather than concluding from one graph.

ThreadPool starvation occurs when work cannot get a worker promptly, often due to blocking, long work items, or inadequate asynchronous behavior. Rising queue length and worker count can be clues, not proof. Sync-over-async can block threads and cause cascading latency. Lock contention, deadlocks, scheduling delay, context switches, syscalls, and storage/network waits need different evidence. CPU-bound work benefits from parallelism only within processor and contention limits; I/O-bound concurrency can be higher but must be bounded against dependencies.

## Capacity is a model with safety margins

Measure a load curve: latency, errors, throughput, utilization, and queue behavior as demand rises. Sustainable throughput is the rate a system can maintain while meeting service objectives and recovering from fluctuations—not simply the largest observed one-minute rate. Capacity planning includes average, peak, burst, growth, failover, zone loss, maintenance, autoscale delay, per-instance limits, connection budgets, file descriptors, sockets, and storage.

Headroom is deliberate reserve for variance and failure. N+1 capacity aims to tolerate losing one relevant unit while meeting a target, under stated assumptions. Autoscaling does not add capacity instantly; startup and cold-start delay can exceed the time to failure. Bottlenecks migrate: raising app CPU capacity can move saturation to a database pool. Measure the whole dependency path and cost per request, not only instance utilization.

# Mechanisms and relationships

Use a hypothesis table:

| Symptom | Possible constraint | First evidence |
| --- | --- | --- |
| High CPU, high latency | CPU-bound hot path, throttling, lock contention | CPU utilization/throttling, sampled stacks, queue and concurrency |
| Moderate CPU, high latency | Dependency, connection-pool wait, disk/network, thread starvation | End-to-end trace, pool waits, thread-pool queue, I/O timing |
| Rising memory and GC time | Allocation pressure or retained objects | Allocation rate, heap size, GC counters, GC dump/root paths |
| Throughput plateaus and queues grow | Saturated resource or arrival rate above service capacity | Load curve, queue age/depth, resource saturation, dependency limits |
| Latency improves only with warm cache | Cold-cache/working-set or cache-stampede behavior | Separate cold/warm tests and cache hit/miss timing |

Capture baseline counters first; then trace/profile or dump only when needed. Change one material variable and rerun the same workload. A profiler can distort timing, a dump can pause or consume substantial storage, and a trace can contain private data; quantify overhead and protect artifacts.

# Worked examples

An API sustains 1,000 requests/second with average response time 0.2 seconds. Under stable conditions, Little’s Law suggests about 200 requests are concurrently in the measured system boundary. If response time rises to 1 second while throughput remains 1,000/s, about 1,000 requests are in flight. That increase suggests more work is waiting or taking time; it does not identify which resource is responsible.

A service shows high allocation rate and rising GC time, but heap size falls after collection. This is allocation pressure, not necessarily a leak. A trace/profile can locate allocation stacks. If heap size instead grows after comparable full collections, inspect a GC dump and root paths for retained objects. A before/after run should use the same dataset, traffic, runtime, and warmup, then compare latency percentiles, throughput, allocation, GC, and errors.

# Misconceptions and edge cases

- A benchmark on a developer laptop does not establish production capacity.
- A high p99 alone is incomplete without sample volume, window, and histogram method.
- A closed-loop test can reduce offered load as the service slows and hide queueing.
- A flame graph is an aggregate stack profile, not a timeline of one request.
- High allocation rate and a memory leak are different conditions.
- Managed heap size is not total process memory; native allocations and OS memory count too.
- More threads can worsen CPU contention, dependency overload, and lock waits.
- A dump is sensitive data and can be large; avoid collecting it casually.
- `dotnet-counters` may expose different underlying runtime APIs across target versions.
- Host CPU can look idle while a container is CPU-throttled by its quota.
- Autoscaling is delayed and may not protect against immediate spikes or dependency caps.
- Amdahl’s law limits total speedup when the optimized portion is small.

# Knowledge checks with answers

1. What is the difference between latency and service time? **Latency is end-to-end; service time is active processing, while latency can include queueing and dependency wait.**
2. Why can closed-loop load hide overload? **It sends fewer new operations as responses slow, reducing offered rate when demand should remain visible.**
3. What is coordinated omission? **A benchmark’s failure to count requests that would have arrived during a stall, understating user-visible tail latency.**
4. Does growing allocation rate prove a leak? **No; compare post-GC retained heap and object root paths.**
5. What does a flame graph’s width generally represent? **The selected sample weight/count for a stack path, not elapsed time chronology.**
6. How does N+1 capacity help? **It aims to let a system tolerate loss of one unit under stated workload/target assumptions.**
7. Why compare the same workload before and after? **To attribute result differences to the change rather than input/environment variation.**

# Sources

[.NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/) · [EventPipe](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/eventpipe) · [Diagnostic ports](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/diagnostic-port) · [Runtime metrics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-runtime) · [Flame graphs](https://www.brendangregg.com/flamegraphs.html)
