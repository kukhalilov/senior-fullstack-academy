# system design requirements estimation capacity and tradeoffs — Core concepts and how they fit together

Sources: [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [Well-Architected pillars](https://learn.microsoft.com/en-us/azure/well-architected/pillars), [Azure reliability metrics](https://learn.microsoft.com/en-us/azure/well-architected/reliability/metrics), [Google SRE: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/), and [Google SRE: Service Best Practices](https://sre.google/sre-book/service-best-practices/).

## Learning objectives

Elicit testable requirements; distinguish SLI, SLO, and SLA; estimate average, peak, and burst demand; plan capacity and redundancy; specify overload/recovery behavior; and record uncertainty and decision triggers.

## Prerequisites

Know basic web request flows, availability, latency, and resource units. Provider-specific sizing and topology are taught in cloud/operations topics.

## Core concepts

Begin with a business outcome and actors. Functional requirements describe behavior/use cases; nonfunctional requirements describe qualities/constraints such as latency, reliability, security, cost, and operability. Translate adjectives into an acceptance criterion with a measurement point, threshold, population, and time window. A target without a boundary or workload is ambiguous.

An **SLI** is a quantitative indicator such as successful requests or latency. An **SLO** is an internal target over a window. An **SLA** is a commitment to customers and may carry remedies/penalties. An error budget is the tolerated unreliability implied by the SLO. Availability and latency should reflect user-visible failures, not only whether a process is alive. Percentile latency (p50/p95/p99) reveals tail experience that averages hide.

Model request arrival rate, average/peak/burst, concurrency, read-write mix, payload sizes, data growth, and retention. Estimate CPU, memory, database, network, and storage from measured or benchmarked per-request use. Forecast capacity at day one and steady state; include headroom and redundancy. N+1 means serving the target load with one additional failure unit beyond required capacity; N+2 protects against two, at greater cost. Validate estimates with representative load tests and production telemetry.

Plan for normal and degraded conditions. Identify failure mode and blast radius; isolate faults; shed optional work or queue only within safe limits. Timeouts should reflect dependency budgets; retries can amplify overload. RTO is the target time to restore service; RPO is the target maximum data loss measured in time. A planned outage and an unplanned outage have different communication and recovery expectations.

Architecture tradeoffs are explicit choices among quality attributes and cost. Record assumptions, confidence, and sensitivity: which input would change the design? Prefer reversible choices where evidence is weak. ADRs capture context, decision, alternatives, and consequences. After deployment, compare targets with observed data and define a trigger for redesign.

## Mechanisms and relationships

```text
SLI (measure) → SLO (target) → SLA (external commitment, if any)
workload × resource/request → capacity forecast + headroom + failure reserve
RTO (restore time) ≠ RPO (acceptable data loss)
assumption → sensitivity → decision trigger → post-deployment evidence
```

## Worked examples

For a p95 latency target, define the endpoint, start/end measurement points, successful-request population, and rolling window. Estimate peak requests and test at that rate while one instance is unavailable. If the p95 misses only because recommendations consume database capacity, shed or isolate recommendations before weakening booking correctness.

## Misconceptions and edge cases

- Average latency hides tail behavior.
- Process health is not necessarily user-visible availability.
- Capacity estimates are models, not guarantees.
- Retries during saturation can worsen failure.
- RPO is about recoverable data loss; RTO is about restoration duration.
- Redundancy without independent failure domains may not protect against correlated outages.
- A contractual SLA should not be confused with an engineering SLO.

## Knowledge checks with answers

1. **SLI vs SLO vs SLA?** Measure, target, and external commitment.
2. **Why load test peaks?** Average demand does not expose capacity bottlenecks or burst behavior.
3. **RTO vs RPO?** Time to restore versus acceptable data-loss window.
4. **Why keep an assumption register?** It makes uncertain inputs and redesign triggers explicit.
