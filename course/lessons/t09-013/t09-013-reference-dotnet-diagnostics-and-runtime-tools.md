# performance profiling capacity and .NET diagnostics — Reference: Runtime counters, traces, dumps, EventPipe, and diagnostic ports

# Scope and version

This reference covers the listed .NET diagnostics, tools, runtime measurements, and attachment boundaries. Microsoft documentation checked 2026-11-20. The .NET 9+ `System.Runtime` meter and the .NET 8-and-earlier EventCounters path differ. Ordinary EventPipe collection and the Linux native `collect-linux` path have different permissions and evidence. Diagnostic artifacts can contain sensitive memory data. [Diagnostics overview](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/) [dotnet-counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters) [dotnet-trace](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace)

# How this group fits the mental model

Counters reveal changing trends; traces reveal timed event/stack evidence; dumps reveal process state; stack collection reveals current execution; diagnostic ports transport commands between a tool and runtime. Choose the lowest-cost artifact that can distinguish your hypotheses, verify target identity/version, and protect its contents.

# Supplied names explained

## Diagnostics channel and EventPipe

- `.NET diagnostics` — The runtime and tooling capabilities for observing and analyzing .NET processes, including metrics, traces, dumps, and stacks. Availability and access vary by runtime version, OS, permissions, and deployment.
- `Diagnostic port` — The runtime’s local IPC endpoint for diagnostic commands and responses. Tools use it to request traces, counters, dumps, or process information.
- `EventPipe` — A cross-platform .NET runtime event collection mechanism that can gather runtime and application `EventSource` events and emit `.nettrace` data. It is not equivalent to an OS-wide kernel profiler.
- `EventPipe trace` — A recorded EventPipe session containing selected runtime/provider events and potentially sampled stacks. Provider selection, duration, buffers, and sample rate affect overhead and file size.
- `Diagnostic IPC` — The interprocess protocol used by diagnostics clients over a runtime diagnostic port. Most users rely on tools instead of implementing this protocol directly.
- `Named pipe diagnostic transport` — The diagnostic-port transport used on Windows for CoreCLR, represented by a pipe address. Access follows OS identity and pipe permissions.
- `Unix domain socket diagnostic transport` — The diagnostic-port transport used on Linux/macOS for CoreCLR, represented by a socket path. Container namespaces and filesystem permissions can prevent attachment.

## Command-line and service tools

- `dotnet-counters` — A CLI tool for monitoring and collecting metrics published by .NET `Meter` and `EventCounter` sources. Target runtime version determines which built-in runtime surface is available.
- `dotnet-counters monitor` — Continuously displays selected counter/metric values for a process or launched app. It is useful for confirming a trend before taking a heavier trace or dump.
- `dotnet-counters collect` — Collects counter samples over a period for later analysis or export. Sampling interval and duration determine both file volume and ability to see short events.
- `System.Runtime meter` — The modern runtime meter publishing .NET runtime metrics through `System.Diagnostics.Metrics`. .NET 9 and later expose this surface; .NET 8 and earlier use older EventCounters for the corresponding built-in runtime observations.
- `System.Runtime EventCounters` — The older built-in runtime diagnostic counters published through EventSource/EventCounter. `dotnet-counters` uses this path when the target runtime does not expose the newer meter.
- `dotnet-trace` — A CLI for collecting .NET EventPipe traces and, in current versions, certain OS-supported trace modes. Trace artifacts can include method names, event payloads, and sampled stacks.
- `dotnet-trace collect` — The cross-platform EventPipe collection command for a target process or launched child process. Select a bounded duration/provider/profile and output location; collection can affect runtime and disk.
- `dotnet-trace report` — A command that produces supported summaries from a collected trace. It is a quick overview; detailed stack/event analysis may need a compatible viewer.
- `dotnet-dump` — A CLI to collect and analyze process dumps. A dump can expose in-memory request data, credentials, and personal information, so restrict access, secure transfer, and delete per policy.
- `dotnet-dump collect` — Captures a process dump through the runtime diagnostic mechanism. Dump type, target OS, process state, and runtime support affect size and contents.
- `dotnet-dump analyze` — Opens a dump for SOS-based managed inspection such as threads, stacks, objects, and GC roots. It requires compatible analysis tools and often symbols for source-level detail.
- `dotnet-gcdump` — A tool that collects managed GC heap information from a live process by triggering a Gen 2 (full) collection, enabling special events, and rebuilding the object-root graph from the event stream. It focuses on managed objects rather than providing a full native process dump. On a large heap, the forced full collection can suspend the runtime for a long time; avoid casual collection on latency-sensitive production processes. The current documented viewer support for `.gcdump` analysis is Windows-based (PerfView or Visual Studio).
- `dotnet-stack` — A CLI for capturing managed stack traces from a running .NET process. It provides a point-in-time view useful for blocked threads or deadlock investigation, not a history of execution.
- `dotnet-monitor` — A diagnostic service that can monitor .NET processes and expose metrics or collect traces, dumps, and logs through configured endpoints. Secure its endpoints, authentication, authorization, and artifact storage.
- `dotnet-symbol` — Downloads matching symbols, modules, host files, and debugging components such as DAC/DBI for dump analysis, especially when a dump was captured on another machine. Symbols must match the exact runtime/build; private symbols and dumps require access controls.
- `dotnet-debugger-extensions` — Installs .NET debugger extensions for native debuggers such as WinDbg or LLDB. It is a debugger integration helper, not a collector or analyzer by itself.
- `dotnet-debugger-extensions install` — Installs the debugger extensions locally and configures LLDB startup on macOS/Linux; architecture and debugger version affect setup.
- `PerfCollect` — A Linux Bash collection script that combines `perf` CPU samples and LTTng/EventSource runtime events. It needs OS tracing prerequisites and appropriate capabilities; its GC-heavy profiles can materially increase runtime cost.
- `dotnet-dsrouter` — A development/testing tool that proxies diagnostic ports to .NET apps on Android, iOS, and tvOS. Its TCP connections are unauthenticated and unencrypted; bind the TCP server only to loopback and do not expose it to untrusted networks.
- `Microsoft.Diagnostics.NETCore.Client` — The .NET client library for communicating with runtime diagnostic ports and requesting diagnostic sessions. It is the foundation for custom diagnostics tooling and should follow supported runtime protocol behavior.

## System.Runtime Meter: exact built-in metrics

### Exact supplied metric terms

- `dotnet.process.cpu.time metric`
- `dotnet.process.memory.working_set metric`
- `dotnet.gc.collections metric`
- `dotnet.gc.heap.total_allocated metric`
- `dotnet.gc.last_collection.memory.committed_size metric`
- `dotnet.gc.last_collection.heap.size metric`
- `dotnet.gc.last_collection.heap.fragmentation.size metric`
- `dotnet.gc.pause.time metric`
- `dotnet.jit.compiled_il.size metric`
- `dotnet.jit.compiled_methods metric`
- `dotnet.jit.compilation.time metric`
- `dotnet.thread_pool.thread.count metric`
- `dotnet.thread_pool.work_item.count metric`
- `dotnet.thread_pool.queue.length metric`
- `dotnet.monitor.lock_contentions metric`
- `dotnet.timer.count metric`
- `dotnet.assembly.count metric`
- `dotnet.exceptions metric`
- `cpu.mode metric attribute`
- `gc.heap.generation metric attribute`
- `error.type metric attribute`

The .NET 9+ `System.Runtime` Meter publishes the following built-in metric names. Use the instrument type and unit rather than inferring semantics from a suffix. The reference also lists the attributes `cpu.mode`, `gc.heap.generation`, and `error.type`. .NET 8 and earlier expose legacy EventCounters instead, so names and display values differ. [Built-in .NET runtime metrics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-runtime)

| Metric | Type / unit | Meaning and key caveat |
| --- | --- | --- |
| `dotnet.process.cpu.time` | Counter, seconds | Process CPU time, split by `cpu.mode` (`user`/`system`). |
| `dotnet.process.memory.working_set` | UpDownCounter, bytes | Physical memory mapped to the process; includes more than managed heap. |
| `dotnet.gc.collections` | Counter, collections | Collections since process start, tagged by maximum `gc.heap.generation` collected. |
| `dotnet.gc.heap.total_allocated` | Counter, bytes | Approximate managed GC-heap bytes allocated since start; excludes native allocations. |
| `dotnet.gc.last_collection.memory.committed_size` | UpDownCounter, bytes | GC committed virtual memory at the latest collection; can exceed live heap size. |
| `dotnet.gc.last_collection.heap.size` | UpDownCounter, bytes | Managed heap size including fragmentation at latest collection; tagged by generation including `loh` and `poh`. |
| `dotnet.gc.last_collection.heap.fragmentation.size` | UpDownCounter, bytes | GC heap fragmentation after latest collection, tagged by generation. |
| `dotnet.gc.pause.time` | Counter, seconds | Cumulative time paused in GC since process start; derive an interval rate/fraction carefully. |
| `dotnet.jit.compiled_il.size` | Counter, bytes | IL bytes compiled by JIT since process start. |
| `dotnet.jit.compiled_methods` | Counter, methods | JIT compilation/recompilation count since process start. |
| `dotnet.jit.compilation.time` | Counter, seconds | Cumulative JIT compilation time. |
| `dotnet.thread_pool.thread.count` | UpDownCounter, threads | Current ThreadPool worker-thread count. |
| `dotnet.thread_pool.work_item.count` | Counter, work items | Completed ThreadPool work items since process start. |
| `dotnet.thread_pool.queue.length` | UpDownCounter, work items | Current queued ThreadPool work items. |
| `dotnet.monitor.lock_contentions` | Counter, contentions | Monitor lock contention count since process start. |
| `dotnet.timer.count` | UpDownCounter, timers | Current active timer count. |
| `dotnet.assembly.count` | UpDownCounter, assemblies | Currently loaded .NET assemblies. |
| `dotnet.exceptions` | Counter, exceptions | Managed exceptions thrown, tagged by `error.type`; counts throws, not only uncaught/user-visible failures. |

These metric names are not synonyms for older EventCounters such as `alloc-rate` or `time-in-gc`. Confirm target runtime, instrument version, and collection pipeline before comparing dashboards across upgrades.

## Instrumentation and event APIs

- `DiagnosticSource` — An in-process API for writing diagnostic events that listeners can observe. Event names and payloads are library-defined; avoid unstable payload assumptions.
- `EventSource` — An API for defining named structured event providers consumed by EventPipe and other diagnostics tools. Provider levels/keywords control event selection and volume.
- `EventCounter` — A legacy lightweight metric-emission type associated with EventSource. It remains useful for existing sources, but new instrumentation commonly uses `System.Diagnostics.Metrics`.
- `System.Diagnostics.Metrics` — The modern .NET metric instrumentation API with instruments such as counters, gauges, and histograms. It integrates with multiple metric listeners/export paths.
- `System.Diagnostics.Activity` — A representation of a timed operation/span with trace context and tags/events. It supports distributed tracing and can be created/observed through Activity APIs.
- `ActivitySource` — The factory/provider API used to create `Activity` spans for distributed tracing. Consumers use listeners or exporters; activity creation alone does not guarantee export.
- `ActivityListener` — A listener that controls sampling and observes activities from `ActivitySource` instances. Sampling choices affect overhead and which activities are recorded.
- `MeterListener` — An in-process listener for measurements emitted by `System.Diagnostics.Metrics` instruments. It is a low-level observation API; export pipelines commonly use metric readers/exporters instead.
- `Diagnostic listener` — An in-process subscriber to `DiagnosticSource` events. A listener can observe selected instrumentation, and enabling verbose events may add volume or expose payloads.

## Runtime counters and memory surfaces

- `Runtime counter` — A runtime measurement such as allocation rate or GC count exposed through a runtime diagnostics source. Interpret units, interval, and runtime version before comparison.
- `Allocation rate counter` — A measure of bytes allocated over time. High allocation can increase GC work, but does not by itself indicate memory leakage.
- `GC heap size counter` — A measurement of managed heap size. It excludes other process memory and should be interpreted alongside collections and working set.
- `Gen 0 collection count` — A count of generation 0 garbage collections, which usually reclaim short-lived objects. A rising rate can indicate allocation pressure but is workload-dependent.
- `Gen 1 collection count` — A count of generation 1 collections, which process surviving objects from younger generations. Compare with allocation and promotion patterns.
- `Gen 2 collection count` — A count of generation 2 collections, which handle longer-lived managed objects and may be more expensive. Frequent Gen 2 collections warrant investigation, not a blanket “increase heap” response.
- `Time in garbage collection counter` — A measurement of time spent in GC over an interval. Definitions differ by source; inspect the exact metric semantics before treating it as wall-clock fraction.
- `ThreadPool thread count` — The number of .NET ThreadPool worker threads. A growing count can accompany starvation or blocking but is not sufficient diagnosis alone.
- `ThreadPool queue length` — A count of queued ThreadPool work items. A persistently rising queue with latency suggests worker capacity or blocking issues.
- `Monitor lock contention counter` — A measurement of contention acquiring monitor locks. It indicates waiting, but traces/stacks are needed to identify the lock and critical section.
- `Exception count counter` — A metric counting thrown exceptions under a documented source definition. Expected/caught exceptions may be included; correlate with error outcomes rather than equating every throw with a user failure.
- `Process CPU usage counter` — A process CPU measurement over time. Compare with core count, container quota/throttling, and thread-level evidence.
- `Working set` — The amount of process memory resident in physical memory at a point in time. It includes managed and non-managed portions and can change with OS paging behavior.
- `Managed heap` — Memory managed by the .NET GC for managed objects. It is only part of process memory; native allocations, stacks, mapped files, and runtime structures also contribute.
- `Large Object Heap (LOH)` — A GC heap area for large managed allocations, with different collection/compaction behavior from small objects. Large transient allocations can increase memory and GC cost.
- `Pinned Object Heap (POH)` — A managed heap area designed for pinned objects so they do not move during GC. Excessive pinning can still cause memory pressure and interop concerns.
- `GC dump` — A captured representation of the managed heap for analyzing object types, counts, and retained graphs. It can be large and include data values; protect it as sensitive.
- `Core dump` — An OS-level process memory snapshot, commonly used on Unix-like platforms. It can include native/runtime state and sensitive data and may require symbols and platform-specific tooling.
- `Process dump` — A snapshot of process memory and execution state for later analysis. Its size and contents depend on dump type and collection options.
- `Managed stack trace` — A sequence of managed method frames for a thread or sampled execution. It may lack source lines when symbols are unavailable and may capture only a moment.
- `Portable PDB symbol resolution` — Mapping compiled code back to source information using portable PDB symbols. Matching symbols to the exact build is essential; mismatched symbols can produce misleading lines.

## Native AOT diagnostic boundaries

Native AOT applications do not expose every full-runtime diagnostic capability. Microsoft documents EventPipe as optional in Native AOT and enabled by the `EventSourceSupport` MSBuild property; runtime provider/event support is partial. CPU profiling and native debugging are supported with limitations and matching native symbols. Managed heap analysis is not supported by the cited Native AOT diagnostics page, which specifically discusses .NET 8 behavior; check the target runtime because documentation and capabilities can change. Build-time diagnostics generally run on the full runtime, while published Native AOT binaries need their own post-publish verification. [Native AOT diagnostics](https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/diagnostics)

- `Native AOT diagnostics` — Diagnostics for published ahead-of-time native binaries, with capabilities that differ from CoreCLR and vary by feature/runtime version.
- `Native AOT EventPipe support` — Optional EventPipe support in Native AOT, enabled by `EventSourceSupport`; availability does not imply every runtime event is implemented.
- `EventSourceSupport MSBuild property` — The Native AOT project property that includes the optional EventPipe component when set to `true`.
- `Native AOT runtime event support` — Partial support for selected runtime providers/events; verify the exact event needed rather than assuming full-runtime parity.
- `Native AOT CPU profiling` — CPU sampling of a published Native AOT app using platform tools such as PerfView or Linux perf, with native symbols needed for useful method attribution.
- `Native AOT managed heap analysis` — Managed heap analysis is unsupported in the cited Microsoft Native AOT diagnostics guidance; `dotnet-gcdump` and managed heap viewers should not be assumed to work on published Native AOT binaries.

## Attachment and artifact constraints

### Exact diagnostic-port controls

- `DOTNET_EnableDiagnostics` — Setting this to `0` disables external diagnostics ports and therefore blocks dotnet diagnostic tools and debugging; treat it as a security/operability choice, not a generic performance toggle.
- `DOTNET_DiagnosticPorts` — Configures additional runtime-initiated diagnostic connections using a semicolon-separated list of endpoint descriptions. On Windows endpoints are named-pipe names; on Linux/macOS they are Unix-domain-socket paths; mobile Mono can use TCP.
- `DOTNET_DefaultDiagnosticPortSuspend` — Setting this to `1` makes the runtime wait at startup for a tool on its default diagnostic port, useful for startup capture but dangerous if the collector never attaches.
- `Diagnostic port connect mode` — The runtime connects to a tool-created endpoint. The endpoint is not authenticated by the runtime; use only a fully trusted path and prevent untrusted processes from replacing it.
- `Diagnostic port suspend modifier` — Additional configured ports default to suspending until a diagnostic resume command unless `nosuspend` is selected. A port description has the form `address[,(listen|connect)][,(suspend|nosuspend)]`; `listen` is supported only by Mono on Android/iOS. [Diagnostic ports](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/diagnostic-port)

- `Diagnostic port access control` — OS and runtime controls that determine which process identity can connect to diagnostics IPC. Diagnostics endpoints are privileged because they can expose memory or alter collection behavior.
- `Diagnostics in containers` — Collecting diagnostics when target and tool have different namespaces, user IDs, filesystems, or runtime visibility. Ensure the correct diagnostic socket/pipe is shared and least privilege is maintained.
- `Diagnostic tool target process identity` — The user/process identity and namespace relationship between a tool and target. A process visible by PID may still be inaccessible due to permissions or container boundaries.
- `Diagnostic artifact size` — The storage volume produced by a trace, dump, or GC dump. Bound duration/providers and check free space so diagnostics do not destabilize the service or host.

# Cross-item comparison

| Tool | Best first question | Typical evidence |
| --- | --- | --- |
| `dotnet-counters` | What runtime trend changed? | Time series of counters/meters |
| `dotnet-trace` | Which events/stacks correlate with the slow interval? | EventPipe trace and sampled stacks |
| `dotnet-dump` | What threads/objects/locks existed at this instant? | Process memory snapshot |
| `dotnet-gcdump` | Which managed objects occupy the GC heap? | Managed heap graph |
| `dotnet-stack` | What are managed threads doing now? | Point-in-time managed stacks |

On .NET 9+, `dotnet-counters` reads the `System.Runtime` meter; on .NET 8 and earlier it falls back to EventCounters. The API surface differs even when similar names appear. Ordinary `dotnet-trace collect` uses EventPipe across supported operating systems; `collect-linux` is separate, Linux-only, requires .NET 10+, Linux x64/Arm64, kernel 6.4+ with CONFIG_USER_EVENTS, mounted tracefs, glibc 2.27+, and root/CAP_PERFMON or CAP_SYS_ADMIN, and can add native/kernel evidence. Linux `PerfCollect` is an alternative `perf` + LTTng collection path with its own kernel/library/capability prerequisites. [dotnet-counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters) [dotnet-trace](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace)

# Examples

Start with `dotnet-counters monitor` to confirm a high allocation rate and increasing GC time. If the process is still slow after collection, use a short `dotnet-trace collect` interval with a suitable runtime profile to locate allocation or CPU stacks. If managed heap remains high after comparable collections, use `dotnet-gcdump` to inspect types and retention; if threads are blocked or deadlocked, capture a process dump and inspect threads/locks with `dotnet-dump analyze` or capture `dotnet-stack` for a quick snapshot. Keep the target and diagnostic tool identity aligned and save artifacts in restricted storage.

# Common mistakes

- Collecting a huge dump before checking counters or articulating a hypothesis.
- Forgetting that `dotnet-gcdump collect` forces a Gen 2 collection, which can cause a long pause on a large heap.
- Collecting a full/heap dump inside a tightly memory-limited container without accounting for the target's additional paging and memory pressure; the OS may terminate the container.
- Binding `dotnet-dsrouter` to a non-loopback interface even though its TCP endpoint has no authentication or encryption.
- Assuming a managed heap dump explains native memory growth.
- Treating similar metric names from EventCounters and the modern meter as identical without version verification.
- Assuming a diagnostic endpoint should be exposed broadly over a network.
- Attaching to the wrong worker process or wrong container namespace.
- Using symbols from a different build to interpret source lines.
- Capturing lengthy traces or large dumps on a nearly full production disk.
- Sharing diagnostic artifacts in an unrestricted ticket or chat.

# Knowledge checks with answers

1. What does EventPipe collect? **Runtime and EventSource events, including supported sampled stack data, through a cross-platform .NET mechanism.**
2. When does `dotnet-counters` use the modern `System.Runtime` meter? **For .NET 9 and later; .NET 8 and earlier fall back to EventCounters.**
3. What is the difference between `dotnet-gcdump` and a process dump? **A GC dump focuses on managed heap information; a process dump captures broader process memory/state.**
4. Why can a diagnostic port fail in a container? **Tool and target may differ in process identity, namespace, socket visibility, or permissions.**
5. Why protect a dump? **It may contain secrets, customer data, and other application memory.**
6. Does `dotnet-trace collect-linux` have the same requirements as ordinary `collect`? **No; it is Linux-only, requires .NET 10+, Linux x64/Arm64, kernel 6.4+ with CONFIG_USER_EVENTS, mounted tracefs, glibc 2.27+, and root/CAP_PERFMON or CAP_SYS_ADMIN, and captures additional native/kernel evidence.**
7. What production impact can `dotnet-gcdump collect` have? **It forces a full Gen 2 collection to walk the heap, which can suspend a large process for a long time.**
8. Why can full/heap `dotnet-dump` collection be risky in a container? **It can page in substantial target virtual memory and exceed the container's memory limit, leading to termination.**
9. How should `dotnet-dsrouter` be network-bound? **Loopback only; its TCP endpoint is unauthenticated and unencrypted.**

# Sources

[.NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/) · [Diagnostic port](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/diagnostic-port) · [EventPipe](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/eventpipe) · [dotnet-counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters) · [dotnet-trace](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace) · [dotnet-dump](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-dump) · [Native AOT diagnostics](https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/diagnostics) · [PerfCollect](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/trace-perfcollect-lttng) · [dotnet-symbol](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-symbol)
