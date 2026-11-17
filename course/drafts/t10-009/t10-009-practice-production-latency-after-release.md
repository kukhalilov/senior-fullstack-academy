# architecture interviews tradeoffs requirements and constraints — Problem: Investigate a latency regression after release

Sources: [source](https://hld.handbook.academy/), [source](https://sre.google/sre-book/table-of-contents/), [source](https://learn.microsoft.com/en-us/azure/architecture/guide/), [source](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework)

## Goals

Practice user-centered SLI and percentiles, traces and dependency breakdown, rollback and feature flags, data-plane versus client evidence under interview constraints.

## Worked example

p50 latency is unchanged, but users report delays after a deployment. Describe evidence collection, blast-radius reduction, rollback decision, and follow-up.

Check p95/p99 and user journey metrics by route, region, device, and release cohort. Compare traces and resource saturation to the prior version; distinguish server, database, dependency, and browser main-thread time. Stop expansion or roll back when impact exceeds policy; preserve evidence, then reproduce and add a regression guard.

## Exercises

1. State one functional goal, one invariant, and two measurable quality targets.
2. Draw the normal write/read path and identify the authoritative state.
3. Introduce a timeout or partial failure. Explain what is known, unknown, and safe to retry.
4. Name the security and privacy boundaries and the telemetry needed to operate the design.
5. State one alternative and the evidence that would make you choose it.

## Progressive hints

Start from the user-visible invariant. Separate acceptance from completion. Follow data through every durable boundary. Treat timeouts as ambiguous and include a recovery path.

## Complete solutions

1. Unchanged p50 does not rule out tail regression. Segment by cohort and inspect trace span duration, errors, queue age, saturation, and real-user/browser timing. Reduce blast radius and rollback based on the service objective.
2. State the owner and transaction boundary; distinguish derived data from authoritative data.
3. Retry only with stable idempotency or outcome verification. Define bounded deadlines, deduplication, and reconciliation.
4. Enforce authorization on the server at each resource/action. Observe user outcomes, saturation, latency, and recovery age without logging credentials or uncontrolled personal data.
5. Compare alternatives against consistency, workload, operational maturity, failure behavior, and cost.

## Tests and edge cases

Test duplicate submission, lost acknowledgement after success, dependency outage, replay after restart, peak load, partial rollback, access by another tenant, and recovery after data corruption or regional loss.

## Reflection questions

Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
