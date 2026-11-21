# End-to-end performance engineering for web applications — Problem: Investigate a cross-layer latency regression

## Goals

Diagnose an observed regression across browser and server boundaries, locate queueing or resource changes, choose a reversible mitigation, and establish evidence before a permanent fix.

## Worked example

After a deployment, API p99 doubles, browser INP worsens, SQL CPU is unchanged, and the request queue grows. The regression affects only the new release cohort. This points toward comparing code/runtime behavior, dependency waits, thread-pool scheduling, response payload, and browser script work rather than immediately tuning SQL.

## Exercises

1. What release and cohort comparisons do you make first?
2. Which .NET counters/traces help separate CPU, allocation, thread-pool delay, and dependency waits?
3. How do you test whether React/JavaScript changes affect INP?
4. What signs indicate retry amplification versus a slow dependency?
5. Choose a mitigation that preserves correctness and describe rollout/rollback.

## Progressive hints

1. Compare identical request types and user/device cohorts before and after.
2. Correlate a browser interaction trace with server trace spans and runtime counters.
3. Moderate CPU does not rule out sync blocking, connection pool wait, or downstream latency.
4. Check retry count and queue age, not only total request volume.
5. Roll back or reduce traffic while testing a focused hypothesis.

## Complete solutions

Verify whether the regression is limited to the new cohort, routes, or user/device mix. Compare p50/p95/p99, errors, queue depth and age, request rate, payload size, and dependency spans. Use runtime counters and a trace/profile to inspect ThreadPool queue length, thread count, GC/allocation, CPU stacks, lock contention, sync-over-async, and connection pool waits. Compare browser INP interaction traces and script bundles for the same cohort. Inspect dependency latency, timeout, and retry amplification. Since SQL CPU is unchanged, keep SQL plan/query evidence but do not assume it is the cause. Mitigate with a canary pause, rollback, or traffic reduction if user impact is high; avoid raising retries or app concurrency before checking dependency capacity. Reproduce one hypothesis at a time, validate under representative load, and only then deploy a fix behind a controlled rollout with rollback criteria.

## Tests and edge cases

- New cohort has larger payloads, making serialization and browser work more expensive.
- SQL CPU is flat but connection pool wait rises due to longer request-held connections.
- An automatic retry policy increases offered dependency load after timeout.
- INP worsens for a subset of low-powered devices while desktop synthetic tests stay flat.
- Rollback changes API behavior for clients already using the new contract.

## Reflection questions

1. What evidence would make thread-pool starvation more likely than CPU saturation?
2. Why can a safe rollback require backward-compatible API contracts?
3. Which user-visible threshold should trigger stopping the rollout?

### Sources

- [.NET available counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/available-counters)
- [dotnet-trace](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace)
- [ASP.NET Core performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices?view=aspnetcore-11.0)
- [EF Core performance diagnosis](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis)
- [Google SRE: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
