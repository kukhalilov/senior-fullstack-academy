# system design requirements estimation capacity and tradeoffs — Interview questions and reasoning

Sources: [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [Azure reliability metrics](https://learn.microsoft.com/en-us/azure/well-architected/reliability/metrics), and [Google SRE: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/).

## Core questions

Start with actors, use cases, quality targets, and workload before proposing topology. State assumptions and distinguish measured evidence from estimates.

## Concise interview answers

An SLI is a measure, an SLO a target, and an SLA an external commitment. Capacity planning models average/peak/burst demand, per-request cost, growth, redundancy, and headroom, then validates under realistic load. RTO is restore time; RPO is acceptable data loss.

## Deep follow-up answers

### How do you turn a vague quality requirement into a target?

Define the user journey, good event, metric, boundary, percentile/threshold, workload, and time window. Clarify exclusions, client/network inclusion, and measurement source so the target is testable.

### How do you estimate capacity with little data?

State ranges for arrivals, payloads, concurrency, and growth. Benchmark representative per-request resource use, calculate bottlenecks and redundancy, run load tests, and identify which assumptions are most sensitive. Track production forecasts versus reality.

### What is an error budget?

The tolerated unreliability implied by an SLO over a window. It creates a shared basis for balancing release velocity with reliability investment; it depends on a meaningful SLI.

### How do you design for overload?

Prioritize critical work, bound queues, shed optional requests, propagate deadlines, use retry budgets carefully, and define graceful degradation. Test saturation and recovery; do not assume autoscaling is instantaneous.

### What belongs in an ADR?

Context and constraints, the decision, alternatives, consequences, assumptions, and a trigger for review. Update it when post-deployment evidence invalidates the assumptions.

## Scenario questions

### Latency average is good but customers complain

Inspect percentiles and user journey boundaries, segment by route/region/client, and correlate with errors. Average values can hide tail latency, partial failure, or client/network delay.

### One node fails during peak

Evaluate remaining capacity, dependency concentration, failover behavior, and error-budget impact. A design claiming N+1 must meet target load after the defined failure, not just have a replica.

### Business can tolerate slow reports but not missed orders

Separate priorities and degrade/report workloads first. Preserve order integrity and communicate report freshness. Use capacity isolation where shared resources could let reporting exhaust critical paths.

## Tradeoffs and alternatives

More redundancy improves resilience but increases cost and complexity. Higher consistency can increase latency/coordination. Headroom lowers saturation risk but may be underutilized. Prefer reversible decisions when uncertainty is high, with evidence-based triggers.

## Common weak answers

- “It needs to be highly available.”
- “Use autoscaling and it will handle any peak.”
- “The average is within target.”
- “N+1 means we have one replica.”
- “Retry the request until it works.”

## Self-check rubric

Did you define measurable success, workload, assumptions, capacity/failure case, user degradation behavior, costs, and validation plan? Can the interviewer challenge an estimate and see how it changes the design?

## Senior-level signals

Quantifies uncertainty, selects user-centered SLIs, considers tail/peak/failure behavior, accounts for retry amplification and correlated outages, and records design revision triggers.
