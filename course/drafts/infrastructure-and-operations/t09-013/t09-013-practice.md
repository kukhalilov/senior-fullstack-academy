# performance profiling capacity and .NET diagnostics — Exercises and worked solutions

# Goals

- Turn an ambiguous latency symptom into measurable hypotheses and a representative workload.
- Select the least intrusive .NET diagnostic evidence that can discriminate among causes.
- Separate CPU, allocation, retention, queueing, and dependency bottlenecks.
- Compare before/after measurements and state a defensible capacity conclusion.

# Worked example

An ASP.NET Core endpoint’s p99 latency rises from 400 ms to 2.5 seconds at peak traffic. Mean latency is 350 ms; process CPU is 45%; working set rises slowly. The team confirms load-generator offered rate, p99 sample count, error ratio, and container CPU throttling. Traces show most slow time in connection-pool wait and database calls, not application CPU. Runtime counters show ThreadPool queue length is low and GC time stable. A database pool is saturated while query latency increases.

The first hypothesis is not “the C# method needs optimization.” The team measures database query/lock times, connection usage, request concurrency, and pool waits with the same production-like payload mix. It compares limiting concurrency/backpressure with a query/index change. It tests one change, reruns the same peak workload, and compares p50/p95/p99, throughput, errors, connection utilization, and cost. Any performance artifacts are secured.

# Exercises

## Exercise 1: make “faster” measurable

Rewrite “the API should be faster” as a performance requirement for a search endpoint. Include latency percentile, workload, duration, errors, and at least one resource/capacity criterion.

## Exercise 2: choose the right load model

A ticketing site opens sales at a known time. Traffic arrives in a sharp burst, and the team wants to know whether users would wait in a queue or receive errors. Should the primary test be open-loop or closed-loop? What should be measured in addition to request latency?

## Exercise 3: distinguish memory growth

Working set rises by 500 MB during a 20-minute run, but the managed GC heap returns to roughly its starting size after full collections. List plausible explanations and next diagnostic evidence. Explain why this alone does not prove a managed memory leak.

## Exercise 4: select .NET tools

For each question, choose a first tool and explain why: (a) Is allocation rate rising? (b) Which stacks consume CPU during a slow period? (c) Which objects remain retained? (d) What are threads doing during a suspected deadlock? (e) Why can diagnostics not attach to a containerized process?

## Exercise 5: interpret a flame graph

A CPU flame graph shows a wide serialization stack, but user p99 latency is unchanged after serialization is optimized by 50%. Use Amdahl’s law and end-to-end reasoning to explain possible outcomes and next steps.

## Exercise 6: estimate in-flight work

A stable service completes 800 jobs per second with an average time in the measured system boundary of 0.25 seconds. Use Little’s Law to estimate average work in progress. What changes if arrival rate persistently exceeds completion rate?

## Exercise 7: capacity after zone loss

A service sustains 900 requests/second across three equally sized zones. If a single-zone failure is in scope, what additional measurements and assumptions are needed before claiming the surviving two zones can carry the full peak?

# Progressive hints

1. Pin down p99, offered request mix, target hardware/runtime, error rate, and test duration.
2. Open-loop preserves scheduled arrivals while the service slows; track offered versus completed rate, queue age/depth, errors, and recovery.
3. Process memory includes native allocations, stacks, mappings, and runtime overhead; inspect process breakdown and native evidence.
4. Counters show trends; traces show events/stacks; GC dumps show managed heap; process dumps/stacks reveal thread state; container identity/namespace/permissions affect IPC.
5. Halving one component’s CPU does not halve total latency unless that component dominates the critical path.
6. `L = λW`; apply units consistently to a stable boundary.
7. Account for workload correlation, per-instance performance, dependencies, database connection budget, failover routing, headroom, and zone-specific traffic.

# Complete solutions

## Exercise 1 solution

One example: “With 2,000 concurrent users and a representative 70% text-search / 30% filtered-search mix over a 30-minute steady phase after 5 minutes warmup, p95 server-observed latency must remain below 350 ms and p99 below 900 ms; error ratio must stay below 0.2%; completed throughput must be at least 600 requests/second; memory must remain below the container limit with 20% reserve and CPU throttling below the team’s defined threshold.” The exact numbers should be chosen from product/service requirements, not copied as universal values. Record data size, cache state, runtime, and dependencies.

## Exercise 2 solution

Use an open-loop primary test because sales demand arrives independently of response completion; a closed-loop test can slow its own offered rate when responses slow. Measure offered/completed request rate, queue depth and age, latency distribution, errors/rejections, resource saturation, autoscale delay, and time to drain backlog after the burst. A closed-loop test can complement the model if real users are known to stop/retry based on response, but it should not be the only burst test.

## Exercise 3 solution

Possible causes include native allocations, memory-mapped files/page cache, thread stacks, runtime/JIT/loader structures, unmanaged libraries, increasing working-set residency, or a short-lived allocation burst that was later collected. Check process/OS memory breakdown, native allocation tooling or OS profiles, thread count/stack usage, and heap snapshots at comparable points. A managed leak usually appears as retained managed objects or unbounded managed heap after collections, though native leaks are possible. Working-set growth alone is not enough to identify ownership.

## Exercise 4 solution

(a) Start with `dotnet-counters monitor` for allocation rate and GC/runtime trends. (b) Collect a bounded `dotnet-trace` sample with an appropriate CPU profile under the slow workload. (c) Use `dotnet-gcdump` to inspect managed heap types and retention; use a full process dump if native memory or deeper state is needed. (d) Capture `dotnet-stack` for quick thread stacks or `dotnet-dump collect` plus `dotnet-dump analyze` for a fuller wait/lock graph. (e) Verify process identity, container PID/namespace, diagnostic socket/pipe visibility, and permissions; `DOTNET_DiagnosticPorts` or a supported proxy may be needed. Protect all captured artifacts.

## Exercise 5 solution

If serialization accounts for fraction `p` of end-to-end cost and is improved by factor `s`, Amdahl’s law bounds total speedup to `1 / ((1-p) + p/s)`. If serialization occupied only a small portion of request latency, a 50% CPU improvement there may reduce process cost without changing p99, especially if the critical path is database wait or queueing. Recheck the same workload and trace segment timings; report CPU/cost and latency separately, and optimize the new measured constraint if it is worthwhile.

## Exercise 6 solution

`L = λW = 800 jobs/second × 0.25 seconds = 200 jobs` on average in the defined boundary. If arrival rate persistently exceeds completion rate, the queue grows and the stable-system assumptions no longer hold; latency, memory, expiry, and rejection risk increase. Apply capacity, backpressure, or admission control and remeasure.

## Exercise 7 solution

The two surviving zones must handle the actual peak, not merely 900 requests/second divided evenly under normal routing. Verify per-zone load distribution, burst correlation, sustainable per-instance throughput at the latency/error target, CPU/memory headroom, autoscaling/traffic-shift time, database and dependency connection/throughput budgets, cache warmup, storage/network capacity, and whether zone loss also removes dependencies. Then run a controlled zone-loss/load test with abort criteria. A simple `3/2` arithmetic ratio is insufficient without those assumptions.

# Tests and edge cases

- Benchmark results vary by order: alternate or randomize A/B test order and repeat runs.
- A warm cache makes results look better than first-user or restart behavior; test both when relevant.
- A closed-loop test reduces offered demand as latency increases; record offered rate.
- Container CPU quota throttles the target although host-wide CPU is low.
- The `dotnet-counters` runtime source differs: .NET 9+ uses `System.Runtime` meter; .NET 8 and earlier fall back to EventCounters.
- A high allocation rate with stable post-GC heap is not by itself a leak.
- A dump or trace contains customer data or secrets; use restricted storage and retention.
- One slow dependency can dominate the critical path even when app CPU and mean latency look acceptable.
- A scale-out plan exceeds the database connection budget or has a cold-start delay longer than the burst.

# Reflection questions

- Which load-generator behavior matches your user population and why?
- What artifact would you capture first for a .NET process, and what is the risk of that capture?
- How would you know that a profile is representative of the slow requests rather than background work?
- What conditions make your throughput sustainable and safe?
- How would your service behave during a zone loss and during the autoscale delay?

# Sources

[.NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/) · [dotnet-counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters) · [dotnet-trace](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace) · [dotnet-gcdump](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-gcdump) · [SRE implementing SLOs](https://sre.google/workbook/implementing-slos/)
