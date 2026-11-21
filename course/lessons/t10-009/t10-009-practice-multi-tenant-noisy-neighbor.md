# architecture interviews tradeoffs requirements and constraints — Problem: Protect a multi-tenant service from a noisy tenant

Sources: [Azure Noisy Neighbor antipattern](https://learn.microsoft.com/en-us/azure/architecture/antipatterns/noisy-neighbor/noisy-neighbor), [Azure Throttling pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/throttling), [Azure multitenant compute approaches](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/compute)

## Goals

Practice tenant identity enforcement, fairness and quotas, workload isolation, per-tenant observability under interview constraints.

## Worked example

One tenant creates a sudden workload spike that raises latency for every customer. Explain diagnosis, containment, fairness, and longer-term partitioning decisions.

First contain the spike with per-tenant request, concurrency, and expensive-operation quotas while preserving a fair share for others. Trace and measure the source; inspect tenant-level latency and resource use with bounded-cardinality telemetry. Then evaluate workload isolation, partitioning, and tenant placement against measured skew and service objectives. Avoid putting every tenant ID into high-cardinality metric labels; use bounded top-N metrics, sampled traces, or controlled logs for per-tenant diagnosis.

## Exercises

1. Define the isolation and fairness objective for tenants with different service tiers.
2. Which request dimensions should count toward quotas: request rate, concurrency, CPU, bytes, query cost, or queue occupancy?
3. Explain how to contain a spike without allowing one tenant to consume every shared worker.
4. When would you move a tenant to dedicated capacity, and what new tradeoffs appear?

## Progressive hints

1. Use server-side identity and enforce authorization at each tenant data boundary.
2. Request counts alone may miss expensive operations; resource cost and concurrency can matter.
3. Apply admission control, per-tenant budgets, queue isolation or priority, and a global saturation limit.
4. Base placement changes on measured skew and SLO impact; account for cost and operational complexity.

## Complete solutions

1. State per-tier service objectives and minimum fair share, while protecting global capacity. Enforce tenant identity from authenticated context rather than trusting a caller-supplied tenant ID.
2. Meter the dimensions that correlate with scarce resources; bound expensive query parameters and execution time. Keep a global guard in addition to per-tenant limits.
3. Reject or defer excess work with a documented response, isolate worker pools/queues where needed, and prevent retry storms. Monitor both tenant outcomes and shared saturation.
4. Use dedicated placement when measured skew or isolation requirements cannot be met efficiently in the shared pool. Dedicated resources improve isolation but add cost, fragmented capacity, provisioning, and support burden.

## Tests and edge cases

Simulate one tenant's burst, expensive query, retry storm, and queue backlog while measuring unaffected tenants. Test tenant-ID spoofing, cache-key isolation, quota fairness, priority starvation, noisy-neighbor recovery, and noisy tenant migration.

## Reflection questions

Which metrics expose cross-tenant impact without creating an unbounded high-cardinality metrics problem?


Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
