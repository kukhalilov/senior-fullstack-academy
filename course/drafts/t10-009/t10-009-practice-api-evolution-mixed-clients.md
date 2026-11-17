# architecture interviews tradeoffs requirements and constraints — Problem: Evolve an API used by old and new clients

Sources: [source](https://hld.handbook.academy/), [source](https://sre.google/sre-book/table-of-contents/), [source](https://learn.microsoft.com/en-us/azure/architecture/guide/), [source](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework)

## Goals

Practice contract compatibility, additive then removal sequence, capability detection, telemetry and deprecation under interview constraints.

## Worked example

A mobile client may remain installed for months while the backend must change a response and a required field. Propose a migration that avoids breaking deployed clients.

Prefer additive compatible changes: add optional response fields, tolerate unknown fields, and avoid changing existing meanings. If a required behavior is needed, introduce a new version or capability negotiation and migrate clients over a measured period. Observe old-client use before removing a contract.

## Exercises

1. State one functional goal, one invariant, and two measurable quality targets.
2. Draw the normal write/read path and identify the authoritative state.
3. Introduce a timeout or partial failure. Explain what is known, unknown, and safe to retry.
4. Name the security and privacy boundaries and the telemetry needed to operate the design.
5. State one alternative and the evidence that would make you choose it.

## Progressive hints

Start from the user-visible invariant. Separate acceptance from completion. Follow data through every durable boundary. Treat timeouts as ambiguous and include a recovery path.

## Complete solutions

1. Keep old clients valid through the migration window. Add a new optional field/endpoint first; update clients; track adoption; then deprecate and remove only after usage and policy permit. Mobile updates are not instantaneous.
2. State the owner and transaction boundary; distinguish derived data from authoritative data.
3. Retry only with stable idempotency or outcome verification. Define bounded deadlines, deduplication, and reconciliation.
4. Enforce authorization on the server at each resource/action. Observe user outcomes, saturation, latency, and recovery age without logging credentials or uncontrolled personal data.
5. Compare alternatives against consistency, workload, operational maturity, failure behavior, and cost.

## Tests and edge cases

Test duplicate submission, lost acknowledgement after success, dependency outage, replay after restart, peak load, partial rollback, access by another tenant, and recovery after data corruption or regional loss.

## Reflection questions

Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
