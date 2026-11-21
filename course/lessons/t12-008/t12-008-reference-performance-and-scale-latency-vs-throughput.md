# system design tradeoffs and decision methods — Reference: Latency vs throughput

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Google SRE: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/), [Google SRE: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/).

## Scope and version

Latency measures elapsed time for an operation; throughput measures completed work per unit time. A system can have high throughput and poor per-request latency, or low latency at low load and then collapse when queues grow.

## How this group fits the mental model

For a request, measure end-to-end latency and time in each dependency or queue. For throughput, state the unit (requests, records, bytes, transactions) and count only successful useful work. Concurrency and batching can increase throughput but may add waiting time to each item. Queueing near capacity increases tail latency; averages hide slow requests and burst behavior.

## Supplied names explained

- `Latency vs throughput` — Latency is time for an operation; throughput is completed work per unit time. Concurrency and batching can increase throughput while raising queueing and tail latency. Measure distributions under representative load.

## Cross-item comparison

Separate service time from queueing time; a faster component may not reduce end-to-end latency if another dependency dominates. Track p50/p95/p99 alongside request rate, error rate, queue depth, and saturation. Define an SLO with eligible requests and a time window; compare the same workload, payload, concurrency, cache state, and failure mix.

## Examples

An API averages 40 ms but p99 is 2 seconds during bursts. A dashboard of mean latency alone looks healthy. Break down server time, database wait, and queue delay; compare p99 with concurrency and saturation. Then test a bounded queue plus load shedding: throughput may dip during overload, while successful requests regain predictable latency and fewer time out.

## Common mistakes

- Optimizing only average latency while p95/p99 violate the user objective.
- Reporting offered requests/s as successful throughput when errors/timeouts rise.
- Increasing worker concurrency without considering downstream bottlenecks and queue growth.
- Comparing benchmarks with different data, cache, concurrency, or durability settings.

## Knowledge checks with answers

1. **What is throughput?** Successfully completed useful work per unit time, with the unit stated.
2. **Why can high concurrency worsen p99?** More requests may queue or contend on saturated resources.
3. **What should a serving-system dashboard pair with latency percentiles?** Traffic, errors, saturation, and dependency/queue breakdowns.
