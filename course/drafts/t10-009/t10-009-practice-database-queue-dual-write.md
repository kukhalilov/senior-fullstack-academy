# architecture interviews tradeoffs requirements and constraints — Problem: Prevent lost events between a database and a broker

Sources: [source](https://hld.handbook.academy/), [source](https://sre.google/sre-book/table-of-contents/), [source](https://learn.microsoft.com/en-us/azure/architecture/guide/), [source](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework)

## Goals

Practice transactional outbox, duplicate delivery, idempotent consumer, reconciliation under interview constraints.

## Worked example

An API writes an order to SQL Server and publishes an event to a broker. A process crash between these operations can lose or duplicate the event. Design the path.

Write the order and an outbox row in one local database transaction. A publisher reads pending rows, publishes at least once, and marks progress; a crash may repeat publication. Consumers deduplicate with the stable event ID and commit their side effect with their consumed marker where possible. Monitor outbox age and reconcile missing projections.

## Exercises

1. State one functional goal, one invariant, and two measurable quality targets.
2. Draw the normal write/read path and identify the authoritative state.
3. Introduce a timeout or partial failure. Explain what is known, unknown, and safe to retry.
4. Name the security and privacy boundaries and the telemetry needed to operate the design.
5. State one alternative and the evidence that would make you choose it.

## Progressive hints

Start from the user-visible invariant. Separate acceptance from completion. Follow data through every durable boundary. Treat timeouts as ambiguous and include a recovery path.

## Complete solutions

1. The database transaction makes business state and intent-to-publish atomic. It does not make broker delivery exactly once. Replays are expected; event IDs and idempotent consumers make the business effect safe.
2. State the owner and transaction boundary; distinguish derived data from authoritative data.
3. Retry only with stable idempotency or outcome verification. Define bounded deadlines, deduplication, and reconciliation.
4. Enforce authorization on the server at each resource/action. Observe user outcomes, saturation, latency, and recovery age without logging credentials or uncontrolled personal data.
5. Compare alternatives against consistency, workload, operational maturity, failure behavior, and cost.

## Tests and edge cases

Test duplicate submission, lost acknowledgement after success, dependency outage, replay after restart, peak load, partial rollback, access by another tenant, and recovery after data corruption or regional loss.

## Reflection questions

Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
