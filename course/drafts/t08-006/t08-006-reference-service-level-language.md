# system design requirements estimation capacity and tradeoffs — Reference: User-centered reliability and performance targets

Sources: [Azure reliability metrics](https://learn.microsoft.com/en-us/azure/well-architected/reliability/metrics) and [Google SRE: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/).

## Scope and version

This lesson defines service-level vocabulary and measurement requirements; it does not prescribe a vendor monitoring product.

## How this group fits the mental model

SLI, SLO, and SLA form a measurement/target/commitment chain. Each depends on a clear boundary and what counts as a good event from the user’s point of view.

## Supplied names explained

### Service Level Indicator (SLI)

A quantitative measure of service behavior, such as successful valid requests or latency. Define numerator, denominator, exclusions, and measurement point.

### Service Level Objective (SLO)

A target value or range for an SLI over a time window. It guides engineering priorities and reliability tradeoffs; it is not necessarily a customer contract.

### Service Level Agreement (SLA)

An external commitment to customers, often with explicit scope, exclusions, and remedies. It may be less ambitious than internal SLOs so the team has room to respond before a contractual breach.

### Error budget

The allowed unreliability implied by an SLO over its window. Teams can use it to balance feature velocity against reliability work. It should be based on the same good-event definitions as the SLI.

### Availability target

The fraction of relevant time or requests when a user can successfully use the service. Request-based availability can better reflect user experience than process uptime; define partial failures.

### Latency target

A bound on response time at a named boundary and population. Include successful/failed requests consistently and specify whether client, gateway, or server timing is used.

### Percentile latency

A distribution statistic: p95 is the latency at or below which 95% of observed requests fall. Tail percentiles expose slow experiences hidden by averages, but require enough samples and careful aggregation.

### Measurement boundary

The exact start/end points, component, and request population measured. A server-only SLI may omit DNS, network, client rendering, or dependencies that affect users.

### Observation window

The time interval over which the SLI is aggregated, such as rolling 28 days. Window choice affects alerting, error budgets, and seasonality interpretation.

### Good event definition

The rule identifying a successful event, including status, validity, latency, and exclusions. Make it representative of user value; a 200 response containing a broken payload may not be good.

### User-visible failure

A failure that prevents or materially degrades a user goal. It includes dependency failures and partial outcomes that health checks may not detect.

## Cross-item comparison

SLI measures; SLO sets an internal target; SLA commits externally. Availability can be request-based or time-based. Percentile latency describes distribution tails, while averages do not reveal them.

## Examples

An SLI might be the percentage of valid checkout attempts that produce a confirmed order under two seconds at the public API boundary. The SLO sets a target over a rolling month. Any SLA should define exclusions and remedies separately.

## Common mistakes

- Using host uptime as the only availability indicator.
- Setting p99 from tiny samples.
- Omitting failed requests from a latency metric in a way that hides user pain.
- Treating an SLO and SLA as interchangeable.

## Knowledge checks with answers

1. **What is an SLI?** A defined quantitative service measure.
2. **Why define good events?** So the metric reflects actual user success.
3. **What does p95 mean?** 95% of observed values are no greater than that latency.

### Exact terms covered

- `Service Level Indicator (SLI)`
- `Service Level Objective (SLO)`
- `Service Level Agreement (SLA)`
- `Error budget`
- `Availability target`
- `Latency target`
- `Percentile latency`
- `Measurement boundary`
- `Observation window`
- `Good event definition`
- `User-visible failure`

### Exact terms covered

- `Service Level Indicator (SLI)`
- `Service Level Objective (SLO)`
- `Service Level Agreement (SLA)`
- `Error budget`
- `Availability target`
- `Latency target`
- `Percentile latency`
- `Measurement boundary`
- `Observation window`
- `Good event definition`
- `User-visible failure`
