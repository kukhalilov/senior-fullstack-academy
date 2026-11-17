# architecture interviews tradeoffs requirements and constraints — Problem: Protect a multi-tenant service from a noisy tenant

Sources: [source](https://hld.handbook.academy/), [source](https://sre.google/sre-book/table-of-contents/), [source](https://learn.microsoft.com/en-us/azure/architecture/guide/), [source](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework)

## Goals

Practice tenant identity enforcement, fairness and quotas, workload isolation, per-tenant observability under interview constraints.

## Worked example

One tenant creates a sudden workload spike that raises latency for every customer. Explain diagnosis, containment, fairness, and longer-term partitioning decisions.

First contain the spike with per-tenant request, concurrency, and expensive-operation quotas while preserving a fair share for others. Trace and measure the source; inspect tenant-level latency and resource use with bounded-cardinality telemetry. Then evaluate workload isolation, partitioning, and tenant placement against measured skew and service objectives.

## Exercises

1. State one functional goal, one invariant, and two measurable quality targets.
2. Draw the normal write/read path and identify the authoritative state.
3. Introduce a timeout or partial failure. Explain what is known, unknown, and safe to retry.
4. Name the security and privacy boundaries and the telemetry needed to operate the design.
5. State one alternative and the evidence that would make you choose it.

## Progressive hints

Start from the user-visible invariant. Separate acceptance from completion. Follow data through every durable boundary. Treat timeouts as ambiguous and include a recovery path.

## Complete solutions

1. Protect shared capacity immediately with bounded per-tenant quotas and admission control. Check whether the workload is legitimate or abusive, and whether a particular key or query causes amplification. Partition only if evidence shows the shared pool cannot meet fairness and SLO needs.
2. State the owner and transaction boundary; distinguish derived data from authoritative data.
3. Retry only with stable idempotency or outcome verification. Define bounded deadlines, deduplication, and reconciliation.
4. Enforce authorization on the server at each resource/action. Observe user outcomes, saturation, latency, and recovery age without logging credentials or uncontrolled personal data.
5. Compare alternatives against consistency, workload, operational maturity, failure behavior, and cost.

## Tests and edge cases

Test duplicate submission, lost acknowledgement after success, dependency outage, replay after restart, peak load, partial rollback, access by another tenant, and recovery after data corruption or regional loss.

## Reflection questions

Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
