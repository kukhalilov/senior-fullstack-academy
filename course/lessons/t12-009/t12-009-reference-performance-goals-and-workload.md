# End-to-end performance engineering for web applications — Reference: Define experience, workload, and measurable objectives

## Scope and version

Targets are product-specific. This lesson supplies decision vocabulary, not universal latency numbers.

## How this group fits the mental model

Without a clear journey and workload, a performance result cannot be interpreted. Define what users do, under which conditions, and what “good enough” means before choosing optimizations.

## Supplied names explained

- `User journey performance budget` — A time/resource allowance for a complete user task and its major stages. Allocate budget by boundary and reserve room for variability; component budgets should add up to a user-visible goal.
- `Latency versus throughput` — Latency is time per operation; throughput is completed operations per time. Increasing concurrency may improve throughput until saturation but can worsen latency.
- `p50 p95 p99 latency` — Percentiles show the response time at or below which 50%, 95%, or 99% of observations fall. State the population/window and avoid treating them as a guarantee for every request.
- `Tail latency` — The slower end of a latency distribution, often important for user experience and fan-out systems. Averages can hide tail regressions.
- `Error rate and availability` — Failed or unusable operations relative to a defined request population, and the proportion of time or requests meeting a service definition. Define what counts as a valid success.
- `Workload model` — A description of arrival rate, concurrency, operation mix, data size, user/device mix, cache state, and dependency conditions. A load test is meaningful only relative to such a model.
- `Arrival rate and concurrency` — Arrival rate describes offered work per unit time; concurrency describes work active at once. They interact through service time and queues, but are not interchangeable.
- `Read/write mix` — Relative proportions and patterns of reads and writes. It affects cacheability, database locking, storage cost, and capacity.
- `Payload size distribution` — Typical and tail request/response sizes. The mean alone may miss large uploads or responses that dominate bandwidth and serialization.
- `Cold versus warm workload` — Cold state has less cached or initialized work; warm state benefits from reuse. Report which state is measured and whether it matches user traffic.
- `Service level indicator (SLI)` — A defined measurement of service behavior, such as successful request latency within a threshold.
- `Service level objective (SLO)` — A target for an SLI over a stated window. It guides prioritization but must be chosen for the product and users.
- `Performance acceptance threshold` — A pass/fail boundary for a release or test, including workload and measurement method. Avoid thresholds that are detached from user impact.
- `Coordinated omission` — A measurement bias where a load generator pauses while waiting for slow responses and therefore fails to record requests that would have arrived during the pause. Arrival models and tool correction affect reported latency.

## Cross-item comparison

Latency and throughput describe different dimensions; percentiles describe latency distribution; SLI/SLO define the user-relevant target; workload details establish whether a test represents production. Cold/warm state and payload tails can materially change results.

## Examples

For a search page, define p95 time until useful results under a stated device, network, query mix, and cache state. Measure API response separately from LCP and INP. An average API time alone cannot establish that the search experience meets its SLO.

## Common mistakes

- Comparing percentiles from different time windows or populations.
- Reporting a benchmark without concurrency, data shape, and cache state.
- Treating throughput as a substitute for response time.
- Selecting arbitrary SLOs from another product.

## Knowledge checks with answers

1. What does p99 mean? 99% of observations are at or below that measured value for the stated sample/window.
2. Why is arrival rate different from concurrency? Arrival rate is offered operations per time; concurrency is active work at once.
3. What workload details should accompany a test? Operation mix, rate/concurrency, data and payload shape, cache state, environment, and dependency conditions.

### Sources

- [Google SRE: Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [Google SRE: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
- [ASP.NET Core performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices?view=aspnetcore-11.0)
