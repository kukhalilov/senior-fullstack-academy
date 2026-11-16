# system design requirements estimation capacity and tradeoffs — Big-picture orientation and mental model

Sources: [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [Well-Architected pillars](https://learn.microsoft.com/en-us/azure/well-architected/pillars), [Azure reliability metrics](https://learn.microsoft.com/en-us/azure/well-architected/reliability/metrics), [Google SRE: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/), and [Google SRE: Service Best Practices](https://sre.google/sre-book/service-best-practices/).

## Problem and purpose

System design turns a business outcome into behaviors, measurable quality goals, workload assumptions, architecture choices, and a plan for failure and growth. Without explicit requirements, “fast,” “available,” and “scalable” cannot guide a reliable design.

## Plain-language mental model

Clarify who uses the system and what success means. Measure the workload shape, set quality targets at the user-visible boundary, estimate capacity with stated assumptions, design for peak and failure conditions, then test and revise from production evidence.

## How the parts fit together

```text
outcome/use cases → quality target and measurement boundary
                 → demand model → capacity + redundancy + headroom
                 → overload/failure behavior → tradeoff decision
                 → load/chaos/acceptance tests → production evidence → revision
```

Reliability, security, cost, operations, performance efficiency, and sustainability can conflict. A design decision must state which quality it improves, what it costs, and which limits it accepts.

## Concept map

An SLI measures a service behavior. An SLO sets a target for that measure; an SLA is a commitment, often contractual. Capacity forecasts estimate resources from arrival rates, concurrency, payload/data growth, and resource use. Headroom and N+1/N+2 redundancy account for peaks or failures. RTO/RPO express recovery objectives. Assumptions and decision triggers keep uncertainty visible.

## End-to-end walkthrough

Suppose an online booking service receives 400 requests/second on average and 1,600 at the seasonal peak. Define the critical user journey and a latency SLI at the gateway, then set a percentile SLO and time window. Estimate per-request CPU, memory, database work, and payload, test peak plus one node failure, and reserve headroom. Define graceful degradation for recommendations, while preserving booking correctness. Record cost, availability, and recovery tradeoffs, then compare forecasts with production load.

## When to use it and tradeoffs

Use this process before selecting technologies and during architecture reviews, capacity planning, and incident follow-up. Detailed numbers will be uncertain; model ranges and validate rather than presenting guesses as guarantees. Overbuilding peak capacity wastes money; underbuilding can cause cascading overload.

## What later lessons cover

References teach requirement/quality objectives, service-level language, workload/capacity models, overload/recovery expectations, and decision records. Detailed scaling topologies and resilience APIs are covered elsewhere.

## Version notes

Quality frameworks evolve, but the need for measurable user outcomes and evidence-based assumptions is durable. Verify provider-specific limits and services in the relevant current cloud topics.
