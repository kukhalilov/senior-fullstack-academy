# performance profiling capacity and .NET diagnostics — Big-picture orientation and mental model

# Problem and purpose

Performance engineering asks whether a system meets user-visible requirements under a defined workload, and what limits it when it does not. A fast result on a developer laptop is not evidence of production capacity. Traffic shape, concurrency, data size, cache state, dependencies, deployment limits, and failure conditions all change the result.

The reliable loop is: define the symptom and workload; measure baseline; form a bottleneck hypothesis; collect the least intrusive useful evidence; change one relevant factor; repeat the same measurement; and verify that user impact and resource cost improved. A profiler points to where time or memory may be spent; it does not by itself prove which change will improve the service.

# Plain-language mental model

Imagine a highway with a toll booth. Throughput is cars served per minute; concurrency is how many cars are on the road at once; latency is how long a car takes to reach its destination. If cars arrive faster than a booth can process them, a queue forms and waiting time grows even though the booth’s service time did not change. Adding lanes can help until a downstream bridge becomes the new bottleneck. This is why response time, queueing, utilization, and dependency limits must be measured together.

For .NET, runtime counters show what is changing; EventPipe traces show timed runtime/application events and sampled stacks; dumps capture a process snapshot for memory/thread inspection; GC dumps summarize managed heap state; stack snapshots show current call stacks. Each artifact has different overhead, detail, permissions, and sensitivity. Capture only what the hypothesis needs, on representative traffic, and protect diagnostic files as production data. [Microsoft diagnostics overview](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/) [EventPipe](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/eventpipe)

# How the parts fit together

```text
user requirement + workload model
  └─ latency / throughput / errors / concurrency / cost target
       └─ load generator applies open-loop or closed-loop work
            └─ service queues, runtime, dependencies, OS and container limits
                 └─ metrics establish where/when behavior changes
                      └─ trace/profile/dump tests a bottleneck hypothesis
                           └─ one controlled change → same workload → compare
                                └─ capacity headroom, acceptance criteria, and rollback rule
```

Little’s Law relates average work in a stable system to throughput and time in system: `L = λW`. A long queue with sustained input above completion rate is unstable and grows until admission control, capacity, or demand changes. Latency includes queueing and service time; optimizing a hot method may not help if most time is spent waiting for a database or queue.

Open-loop load generation schedules arrivals independently of response time; when the service slows, the offered load remains visible. Closed-loop generation waits for responses before sending more work; as the system slows, the generator may send fewer requests and hide overload. Coordinated omission occurs when a benchmark fails to record the latency of work that should have arrived during a stall, making tails look better than users experienced. Use the model that matches the question and document generator behavior. [SRE workbook: SLOs and performance](https://sre.google/workbook/implementing-slos/)

# Concept map

| Evidence | What it answers | Limitation |
| --- | --- | --- |
| Counters and distributions | Is the service slow, saturated, allocating, or queuing? | Aggregates may not expose causal detail |
| EventPipe trace / CPU profile | Which sampled stacks/events consumed time? | Sampling bias and collection overhead; managed focus unless OS-level data is added |
| Heap snapshot / GC dump | What objects are retained or allocated? | Snapshot can be large/sensitive; capture cost and interpretation matter |
| Process/thread dump | What were threads and memory doing at one moment? | A point-in-time view; large artifacts and symbol needs |
| Load/soak/capacity test | How does a workload behave across time and scale? | Results depend on representativeness and environment |

The .NET runtime exposes diagnostics over local diagnostic ports. Windows commonly uses named pipes; Linux and macOS use Unix domain sockets. Process identity, permissions, namespaces, and container configuration affect attachment. `.NET 8 and earlier` expose the older `System.Runtime` EventCounters path to `dotnet-counters`; `.NET 9 and later` expose the newer runtime meter, so the same counter display may come from different APIs. [Diagnostic ports](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/diagnostic-port) [dotnet-counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters)

# End-to-end walkthrough

Suppose p99 API latency grows while average CPU remains moderate. First confirm the latency distribution, traffic volume, error rate, and whether the generator or dashboard is omitting delayed work. Compare application service time with queue time, connection-pool wait, database latency, and dependency traces. If the thread-pool queue length rises with increasing thread count, investigate blocked workers and sync-over-async before increasing the thread pool blindly. If a CPU profile shows one expensive stack, determine whether it is on the critical request path and repeat the capture under the same representative load.

For managed memory growth, use runtime counters to observe allocation rate, GC heap size, collection frequency, and time in GC. If heap size remains high after collections, capture a GC dump or heap snapshot and inspect retained object paths. For a deadlock hypothesis, use `dotnet-dump`/stack evidence to inspect threads and locks. Diagnostic dumps can contain credentials and customer data; restrict and delete them under policy. After a targeted change, rerun the same load and compare percentiles, throughput, resource use, and correctness. [dotnet-gcdump](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-gcdump) [dotnet-dump](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-dump)

# When to use it and tradeoffs

Use microbenchmarks for isolated code questions, macrobenchmarks for application paths, and load/capacity/soak testing for system behavior. Sampling profilers estimate where time is spent with low overhead; deterministic instrumentation can show exact call counts/timing but may perturb execution more. CPU, allocation, locks, I/O, network, storage, and downstream dependencies require different evidence.

Capacity plans need sustainable throughput, peak/burst demand, growth, headroom, failure capacity, autoscaling delay, quotas, and cost per request. A service sized to its average demand may fail at the peak or during a zone loss. A capacity result should state workload, environment, tested maximum, safety margin, acceptance criteria, and rollback trigger. A single benchmark score is not a production guarantee.

# What later lessons cover

The concepts lesson explains statistical measurement, workload design, runtime interactions, and capacity reasoning. Reference lessons cover performance models and test types; .NET diagnostic tools and diagnostic ports; CPU, memory, GC, and concurrency; dependency and I/O performance; and capacity planning. Practice follows a slow .NET service from symptoms to a measurement plan. Interview preparation focuses on profiling evidence, benchmark validity, and capacity tradeoffs.

# Recent version changes

In current .NET diagnostics documentation, `dotnet-counters` uses the `System.Runtime` meter on .NET 9 and later, while .NET 8 and earlier fall back to the older EventCounters. The current `dotnet-trace collect-linux` mode is a distinct Linux-only option requiring .NET 10+, Linux x64/Arm64, kernel 6.4+ with CONFIG_USER_EVENTS, mounted tracefs, glibc 2.27+, and root/CAP_PERFMON or CAP_SYS_ADMIN; ordinary EventPipe `collect` remains cross-platform on supported systems and does not provide the same native/kernel evidence. [dotnet-counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters) [dotnet-trace](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace)
