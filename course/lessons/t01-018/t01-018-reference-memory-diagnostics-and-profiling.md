
# memory spans allocation garbage collection pooling and diagnostics — Reference: Allocation and heap diagnostics, EventPipe tooling, metrics, dumps, and benchmark design

# Scope and version

This lesson covers all items in `memory-diagnostics-and-profiling` for .NET 11. Tool options evolve; check the installed SDK/runtime help for flags. Official starting points: [.NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/), [`dotnet-counters`](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters), [`dotnet-trace`](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace), [`dotnet-gcdump`](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-gcdump), and [`dotnet-dump`](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-dump).

# How this group fits the mental model

Diagnostics answer different questions. Counters show time-series signals; traces associate events with intervals and stacks; heap dumps/root paths explain retention; allocation stacks locate churn; benchmarks compare implementations under controlled conditions. A memory investigation should distinguish managed heap, allocation rate, committed memory, private bytes, and process working set. One snapshot or forced GC rarely proves a leak or a fix.

# Supplied names explained

Every item is reproduced exactly. Tool captures can pause, consume memory, or perturb the target; use production-safe options and understand data sensitivity.

| Supplied name | What it tells you and caveat |
|---|---|
| `dotnet-counters monitor System.Runtime` | Streams runtime counters such as GC activity, allocation, heap, and thread-pool signals for a running process; good for triage, not object-level attribution. |
| `dotnet-counters collect` | Captures counter values over time to a file for later analysis; choose a useful interval and avoid mistaking correlation for cause. |
| `dotnet-trace collect` | Collects EventPipe events, including runtime GC/allocation events when configured; traces can be large and may affect workload. |
| `dotnet-gcdump collect` | Captures GC heap graph data through EventPipe and analyzes object types/references; collection may trigger GC and uses target/process resources. |
| `dotnet-dump collect` | Captures a process dump for deeper debugging; dumps may contain secrets and require secure handling/storage. |
| `dotnet-dump analyze` | Opens a dump for managed/runtime inspection, including heap and root analysis where supported by SOS. |
| `dotnet-stack report` | Reports managed stack traces for threads, useful for locating blocking/waiting states rather than measuring heap retention. |
| `PerfView allocation stacks` | Windows performance tool view that attributes allocation events to call stacks; sampling/event configuration affects interpretation. |
| `Visual Studio Memory Usage profiler` | IDE tooling for snapshots and memory comparison, including object counts and retention exploration. |
| `Visual Studio .NET Object Allocation tool` | Profiles allocation activity and call sites over an interval to diagnose allocation churn. |
| `EventPipe runtime provider` | Cross-platform runtime event source used by .NET diagnostics tools; selected providers/keywords determine captured data. |
| `Microsoft-Windows-DotNETRuntime GC events` | Runtime ETW/EventPipe GC event family used to inspect collection phases, pauses, and allocation/heap activity. |
| `GC heap size metric` | Indicates managed GC heap size under the metric's documented definition; it is not equal to total process memory. |
| `GC committed bytes metric` | Bytes committed by GC heaps to the OS; committed capacity can exceed currently live object size. |
| `GC fragmentation metric` | Estimates free/fragmented space in GC heaps; fragmentation is not identical to live bytes or immediately reclaimable process memory. |
| `GC pause time metric` | Tracks time spent in GC pauses over a reporting interval; interpret alongside latency and collection counts. |
| `GC collection count by generation` | Number of collections per generation; counts alone do not describe pause duration or work. |
| `Allocation rate metric` | Managed bytes allocated over time; useful for churn trends, not retained heap size. |
| `Working set versus managed heap size` | Working set is resident process memory; managed heap is one component and can be committed but nonresident or coexist with native memory. |
| `Private bytes versus committed bytes` | Private bytes represent private process memory committed/reserved according to OS counters; GC committed bytes describe GC heap commitment. They answer different questions. |
| `Heap snapshot object count comparison` | Comparing snapshots shows type/count/size changes, but captures and forced collection may alter timing and object liveness. |
| `Root path retention analysis` | Traces reference paths from roots to retained objects to find why objects remain live; inspect the retaining owner, not only the leaf object. |
| `Allocation call-stack investigation` | Associates created objects/bytes with code paths to find churn; sampling may not record every allocation. |
| `GC dump induced full collection impact` | A GC dump workflow may induce collection to obtain a coherent heap view; this can pause/perturb the process and change what remains. |
| `dotnet-gcdump EventPipe data loss limitation` | Event loss can make a heap dump incomplete or invalid; inspect tool output and prefer a process dump when completeness is essential. |
| `dotnet-gcdump blocking buffering on .NET 11` | .NET 11 adds blocking-buffering support to reduce event loss for large captures, with a greater chance of blocking the target; assess the production impact. |
| `Process dump for incomplete GC dump` | A process dump is an alternative when GC dump event loss prevents adequate analysis; it is larger and may contain sensitive process memory. |
| `BenchmarkDotNet MemoryDiagnoser` | Adds allocation/GC measurements to BenchmarkDotNet cases; use Release builds, warmup, and representative input. |
| `BenchmarkDotNet allocation benchmark` | Compares allocation behavior in isolated methods; microbenchmarks do not replace end-to-end workload measurements. |
| `Warmup and tiered compilation effects on memory benchmarks` | JIT tiering, caches, and warmup can change allocation/throughput results; measure steady state and state setup assumptions. |
| `Representative workload and steady-state measurement` | Use realistic sizes, data distributions, concurrency, and duration so cache/pool/GC behavior resembles production. |
| `Allocation regression test strategy` | Establish a repeatable allocation budget for a focused path with tolerances; avoid brittle tests tied to runtime internals. |
| `Heap snapshot before and after workload` | A controlled before/after comparison can expose retained growth; wait for lifecycle completion and understand any collection induced by capture. |
| `High allocation versus memory leak diagnosis` | Stable retained heap with high allocation suggests churn; increasing retained objects/root paths suggest retention. Both can coexist. |
| `Retained memory versus process working set` | Retained managed objects explain only part of process footprint; include native allocations, stacks, JIT/code, mapped files, and residency effects. |

# Cross-item comparison

| Tool or view | Best first question |
|---|---|
| Counters | Is memory/GC behavior trending abnormally over time? |
| Trace/allocation stacks | Which operation or call site creates churn, and when do GC events occur? |
| GC dump/snapshot | Which objects remain reachable, and through which roots? |
| Process dump | What full process state is needed when EventPipe heap capture is inadequate? |
| BenchmarkDotNet | Does a focused change alter allocation/latency under controlled conditions? |

# Examples

Start with a low-overhead counter window during a reproducible workload. If allocation rate rises but heap size returns to its usual range after collections, inspect allocation stacks for churn. If retained heap continues to grow, capture comparable snapshots and trace root paths. If managed heap stays stable while working set grows, investigate native buffers, stacks, mappings, or runtime/JIT memory. Then benchmark a narrowly scoped change and recheck end-to-end behavior.

For a focused allocation comparison, keep inputs prepared outside the measured operation, include warmup, use Release configuration, and report both bytes/op and time/op. For a service fix, add realistic load and include throughput and tail latency; eliminating allocations can still worsen latency or memory retention.

# Common mistakes

- Calling working-set growth a managed leak without comparing GC heap and native memory.
- Treating `dotnet-gcdump` as a no-impact snapshot; it may induce collection, consume resources, and lose events.
- Capturing a process dump and sharing it without protecting secrets contained in memory.
- Comparing snapshots taken at different lifecycle phases or with different workload/GC conditions.
- Using only collection counts when pause duration, allocation, and latency are the real objectives.
- Treating microbenchmark allocations as guaranteed runtime behavior across all versions/architectures.
- Declaring a leak from high allocation rate without checking retained roots.

# Knowledge checks with answers

1. **Which tool first shows whether allocation rate is persistently high?** `dotnet-counters monitor System.Runtime` is a useful low-friction triage start.
2. **Which evidence explains why an object remains alive?** A heap view plus root-path analysis identifies retaining references.
3. **Does working set equal managed heap size?** No; process memory includes many native/runtime and residency components.
4. **What limitation matters for GC dumps?** EventPipe data loss can make the capture incomplete; inspect tool output and consider the .NET 11 blocking-buffering option when its impact is acceptable.
5. **How do you validate an optimization?** Reproduce the workload, measure steady-state allocation and end-to-end latency/throughput, and compare against a baseline.
