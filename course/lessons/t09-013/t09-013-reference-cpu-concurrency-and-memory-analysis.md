# performance profiling capacity and .NET diagnostics — Reference: CPU profiles, allocation sources, garbage collection, contention, and thread pool

# Scope and version

This lesson explains the supplied CPU, memory, GC, concurrency, and profiler terms. .NET runtime tools are current as checked 2026-11-20; OS-level tools require platform-specific privileges, symbols, and configuration. CPU and memory evidence should be collected under the workload where the symptom occurs. [Microsoft diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/) [Linux perf](https://perf.wiki.kernel.org/index.php/Main_Page) [Windows Performance Toolkit](https://learn.microsoft.com/en-us/windows-hardware/test/wpt/)

# How this group fits the mental model

CPU profiles estimate where processor time is spent; allocation and heap analysis distinguish churn from retention; thread and lock evidence explains waits; OS profilers add native/kernel context. These views complement one another. High latency does not imply CPU usage is high, and high memory does not automatically imply a managed memory leak.

# Supplied names explained

## CPU measurements and sampled stacks

- `CPU sampling` — Periodically recording the executing thread or instruction stack to estimate CPU-consuming paths. Sampling is statistical and can miss rare/short work; choose an adequate interval and duration.
- `CPU flame graph` — A flame graph built from CPU samples, where wide stack paths account for more sample weight. It aggregates across a capture and is not a per-request timeline.
- `Inclusive CPU time` — CPU cost attributed to a function plus its descendants. It highlights expensive subtrees but can double-count when summing nested inclusive values.
- `Exclusive CPU time` — CPU cost attributed directly to a frame, excluding child calls. It can locate the specific routine consuming samples.
- `CPU utilization` — Fraction of available processing capacity used over an interval. Specify whether it is host, container, process, or core-normalized.
- `Process CPU time` — CPU time accumulated by all threads in one process. It can exceed wall-clock duration when multiple cores execute concurrently.
- `Thread CPU time` — CPU time accumulated by one thread. It helps distinguish a busy thread from a process-level aggregate, but not waiting time.
- `Allocation profile` — A profile of where managed or native allocations originate. It identifies creation sites, not necessarily where objects remain retained.
- `Allocation stack trace` — A call stack recorded for an allocation event or sample. It can identify allocation sites; sampling and event configuration affect completeness and overhead.
- `Allocation rate` — Amount of memory allocated per unit time. High rate causes churn/GC cost but may be healthy if objects die promptly.
- `Object lifetime` — Duration an allocated object remains live before becoming collectible or being freed. Long-lived objects increase retained memory and can be promoted to older GC generations.
- `Object retention` — Objects kept reachable, directly or indirectly, by roots such as static fields, active stacks, or handles. A retention path explains why garbage collection cannot reclaim an object.
- `Heap snapshot` — A point-in-time representation of heap objects and references. It helps inspect retention but may be large, intrusive, and sensitive.
- `GC heap dump` — A diagnostic representation of the managed heap collected for object/count/retention analysis. It is not the same as a full process dump.

## Garbage collection and memory

- `Garbage collection pause` — Time during which GC work suspends or limits application execution. Background collection can reduce some pauses but does not eliminate all pauses or contention.
- `Background garbage collection` — A GC mode that performs some collection work concurrently with application threads. It reduces some blocking but still has pauses and CPU cost.
- `Server garbage collection` — A GC mode designed for server workloads, typically using multiple heaps/threads according to available processors. It can increase throughput but also memory/CPU use.
- `Workstation garbage collection` — A GC mode oriented toward client/interactive applications, with different concurrency and resource tradeoffs than server GC.
- `Pinned object` — A managed object whose address is fixed so native code or hardware can safely reference it. Excessive pinning can fragment managed memory or constrain compaction.
- `Finalizer queue` — The queue of objects whose finalizers must run before resources can be reclaimed. Finalizers execute asynchronously and should not be the primary deterministic resource-lifetime mechanism.
- `Finalization backlog` — Accumulation of pending finalizable objects. It can delay cleanup and retain objects longer; inspect finalizer behavior and resource disposal patterns.
- `Large Object Heap fragmentation` — Unusable gaps or inefficient layout in the LOH caused by allocation/deallocation patterns. Measure before compacting or changing thresholds.
- `LOH compaction` — Reorganizing the Large Object Heap to reduce fragmentation. It has cost and should be requested only after evidence supports it.
- `GC pause time` — Duration spent in stop-the-world portions of GC, measured according to a specific runtime counter/event. Separate pause time from total GC CPU work.
- `Allocation pressure` — High object creation rate or volume that drives GC work and memory demand. Reduce unnecessary allocations only after locating high-impact sites.
- `Memory leak` — Memory that remains retained or allocated when it should no longer be needed, causing unbounded or harmful growth. Managed leaks are often reachability issues; native leaks need different evidence.
- `Retained object graph` — Objects and references that remain live in a heap snapshot. Graph topology helps find roots and shared caches retaining more data than intended.
- `Root path` — The reference chain from a GC root to a retained object. It explains why the GC considers an object reachable.
- `Weak reference retention` — A weak reference does not by itself keep an object alive, but surrounding structures, callbacks, or other strong references may. Inspect actual roots rather than blaming weak references by name.
- `Managed memory pressure` — Pressure associated with managed allocations/heap and GC. It differs from total process memory and may interact with native allocation or OS limits.
- `Native memory usage` — Memory allocated outside the managed heap, such as native libraries, buffers, or runtime structures. Managed heap tools alone may not reveal its source.
- `Working set growth` — Increase in resident process memory. It may reflect managed heap, native allocations, memory mapping, or OS residency and needs breakdown.

## Thread pool, async, and synchronization

- `ThreadPool starvation` — A condition where queued work waits because suitable ThreadPool workers are unavailable quickly enough. Blocking, long work items, and bursts can contribute; inspect queue/time signals and stacks.
- `ThreadPool queue` — Work items waiting for ThreadPool execution. A growing queue with response-time degradation can indicate starvation or overload.
- `ThreadPool worker thread` — A general-purpose worker executing queued managed work. Increasing worker count is not necessarily a fix if the work blocks or CPU is saturated.
- `ThreadPool completion port thread` — A ThreadPool thread associated with I/O completion processing on applicable runtime/platform paths. Diagnose actual queueing and runtime semantics rather than assuming one thread handles all I/O.
- `Async continuation` — The code scheduled to resume after an asynchronous operation completes. Continuation scheduling and context capture can contribute to latency but are often small compared with the underlying wait.
- `Sync-over-async blocking` — Synchronously waiting on asynchronous work, potentially tying up threads and causing deadlocks/starvation. It is especially risky in request paths with constrained execution contexts.
- `Lock contention` — Waiting to acquire a synchronization lock. The lock’s hold time and contention pattern matter more than the count alone.
- `Monitor contention` — Contention for .NET monitor locks, often via `lock`. Counter trends identify frequency; a trace/stack locates contested lock usage.
- `Deadlock` — A cycle of tasks/threads waiting indefinitely for resources held by one another. A point-in-time dump can reveal the wait graph, but interpretation requires lock ownership and code context.
- `Contention duration` — Time spent waiting for a lock or contested resource. Long duration harms latency even when total contention count is modest.
- `Task scheduling delay` — Time between a task becoming eligible and beginning execution. It can arise from queue pressure, thread-pool starvation, or scheduling constraints.
- `Parallelism limit` — A bound on simultaneous work. It prevents overload, but too low a limit underuses resources while too high a limit overwhelms CPU or dependencies.
- `CPU-bound workload` — Work primarily constrained by computation. Adding concurrency helps only up to available CPU and may worsen contention past saturation.
- `I/O-bound workload` — Work primarily waiting on disk, network, or another service. Async I/O can support high concurrency, but connection pools and downstream capacity still need limits.
- `Context switch` — CPU scheduler switch from one thread/process to another. Excessive switching can waste CPU; its interpretation needs system-level profiling.

## Native and operating-system tools

- `Syscall profile` — Evidence about operating-system system calls and their cost/frequency. It may expose I/O or kernel waits but requires compatible OS tracing and privilege.
- `perf stat` — Linux `perf` mode for counting selected hardware/software events over a command or process. Event availability and permissions depend on kernel/hardware/security configuration.
- `Linux perf record` — Linux `perf` mode that samples event data and writes a profile for later report/flame-graph analysis. Kernel configuration, symbols, sampling frequency, and privilege affect results.
- `Windows Performance Recorder` — A Windows Performance Toolkit recorder used to collect ETW-based system/application traces. Choose profiles and providers relevant to the hypothesis and manage trace size.
- `Windows Performance Analyzer` — A viewer for Windows performance recordings, enabling timeline and resource analysis. Matching symbols and understanding ETW providers are essential.
- `PerfView` — A Windows-focused diagnostic tool for ETW, EventSource, GC, and stack analysis. It can analyze .NET traces and needs compatible runtime/provider data.
- `Visual Studio Profiler` — Profiling tools integrated with Visual Studio for CPU, memory, and other performance analysis. Available capabilities depend on edition/version and target platform.

# Cross-item comparison

| Symptom | First distinction | Useful evidence |
| --- | --- | --- |
| CPU high | Which stacks consume actual CPU? | CPU sampling, inclusive/exclusive frames, OS profile |
| Memory high | New allocations or retained/native memory? | Allocation profile, GC heap dump, process dump, working set |
| Requests stuck | Lock, scheduler, I/O, or dependency wait? | Thread stacks, contention data, traces, syscall profile |
| GC pauses | Allocation churn or long-lived retention? | Allocation rate, collection/pause counters, heap graph |

Use managed diagnostic tools for .NET runtime/managed context; use OS profilers when native libraries, kernel scheduling, syscalls, or container throttling matter. Combine evidence on a common time window and preserve process/runtime/build identity. [EventPipe](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/eventpipe) [Specialized diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/specialized-diagnostics-overview)

# Examples

If p99 rises while CPU stays moderate, a high ThreadPool queue and many stacks synchronously waiting on async calls suggest starvation; a database connection-pool wait could produce a similar symptom. Compare traces and stacks before increasing worker count. If the process working set grows but GC heap is stable, investigate native allocations, mappings, or caches rather than treating it as a managed leak. If post-Gen-2 heap remains larger after comparable workloads, compare GC heap dumps and root paths.

# Common mistakes

- Reading a CPU flame graph as though it were one request timeline.
- Equating allocation rate with retained heap or a leak.
- Equating managed heap size with process working set.
- Treating high ThreadPool thread count as proof starvation is fixed.
- Assuming async code cannot block or starve the ThreadPool.
- Optimizing a hot stack that is not on the critical user path.
- Ignoring sampling rate, profiler overhead, symbols, and platform permissions.
- Running a production dump without a secure artifact-handling plan.

# Knowledge checks with answers

1. What does inclusive CPU time include? **The frame and its descendants.**
2. What evidence distinguishes allocation churn from a leak? **Allocation rate plus post-collection retained heap/root-path analysis.**
3. Why might host CPU look low while a container is slow? **The container may be throttled by its CPU quota or blocked on another resource.**
4. What does `ThreadPool queue length` alone prove? **Only queued work was observed; it does not identify root cause or prove starvation by itself.**
5. Why use an OS profiler? **To add native, kernel, scheduling, or syscall evidence outside managed runtime profiling.**

# Sources

[.NET EventPipe](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/eventpipe) · [Specialized .NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/specialized-diagnostics-overview) · [dotnet-gcdump](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-gcdump) · [Linux perf](https://perf.wiki.kernel.org/index.php/Main_Page) · [Windows Performance Toolkit](https://learn.microsoft.com/en-us/windows-hardware/test/wpt/) · [Flame graphs](https://www.brendangregg.com/flamegraphs.html)
