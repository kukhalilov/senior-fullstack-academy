# architecture interviews tradeoffs requirements and constraints — Problem: Design and test regional recovery

Sources: [source](https://hld.handbook.academy/), [source](https://sre.google/sre-book/table-of-contents/), [source](https://learn.microsoft.com/en-us/azure/architecture/guide/), [source](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework)

## Goals

Practice RTO and RPO, data replication and ownership, routing and promotion, failback validation under interview constraints.

## Worked example

A regional outage affects a customer-facing service. Define the failover decision, data-loss boundary, customer communication, and safe return to the primary region.

Define the failure declaration authority and thresholds, then compare observed replication lag with RPO before promotion. Route traffic only after the standby is ready and data ownership is fenced. Communicate impact, verify critical flows, and track reconciliation. Failback is a separate migration: synchronize data, test the target, and switch deliberately.

## Exercises

1. State one functional goal, one invariant, and two measurable quality targets.
2. Draw the normal write/read path and identify the authoritative state.
3. Introduce a timeout or partial failure. Explain what is known, unknown, and safe to retry.
4. Name the security and privacy boundaries and the telemetry needed to operate the design.
5. State one alternative and the evidence that would make you choose it.

## Progressive hints

Start from the user-visible invariant. Separate acceptance from completion. Follow data through every durable boundary. Treat timeouts as ambiguous and include a recovery path.

## Complete solutions

1. A recovery plan states measured RTO/RPO, promotion and fencing rules, data-loss acceptance, customer status communication, and validation. A DNS change alone is not a failover plan. Exercise restore and failback regularly.
2. State the owner and transaction boundary; distinguish derived data from authoritative data.
3. Retry only with stable idempotency or outcome verification. Define bounded deadlines, deduplication, and reconciliation.
4. Enforce authorization on the server at each resource/action. Observe user outcomes, saturation, latency, and recovery age without logging credentials or uncontrolled personal data.
5. Compare alternatives against consistency, workload, operational maturity, failure behavior, and cost.

## Tests and edge cases

Test duplicate submission, lost acknowledgement after success, dependency outage, replay after restart, peak load, partial rollback, access by another tenant, and recovery after data corruption or regional loss.

## Reflection questions

Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
