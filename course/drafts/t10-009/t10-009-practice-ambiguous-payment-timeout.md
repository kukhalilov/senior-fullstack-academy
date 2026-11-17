# architecture interviews tradeoffs requirements and constraints — Problem: Resolve a payment request whose response timed out

Sources: [source](https://hld.handbook.academy/), [source](https://sre.google/sre-book/table-of-contents/), [source](https://learn.microsoft.com/en-us/azure/architecture/guide/), [source](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework)

## Goals

Practice payment idempotency key, ambiguous commit, ledger state, provider reconciliation under interview constraints.

## Worked example

An API receives a payment request. The provider may have charged the card, but the response timed out. Design safe retry, user-visible status, and reconciliation behavior.

Do not infer failure from the missing response. Give every logical payment attempt a stable idempotency key, persist the operation state, and query or reconcile the provider before creating another charge. Model authorized, captured, failed, and unknown outcomes explicitly; return a status resource while reconciliation continues. Never retry a new charge blindly.

## Exercises

1. State one functional goal, one invariant, and two measurable quality targets.
2. Draw the normal write/read path and identify the authoritative state.
3. Introduce a timeout or partial failure. Explain what is known, unknown, and safe to retry.
4. Name the security and privacy boundaries and the telemetry needed to operate the design.
5. State one alternative and the evidence that would make you choose it.

## Progressive hints

Start from the user-visible invariant. Separate acceptance from completion. Follow data through every durable boundary. Treat timeouts as ambiguous and include a recovery path.

## Complete solutions

1. The provider may have succeeded. Preserve the same operation key, inspect authoritative provider status, and reconcile against the internal ledger. If status remains unknown, hold the operation for bounded retry/review and tell the user it is pending.
2. State the owner and transaction boundary; distinguish derived data from authoritative data.
3. Retry only with stable idempotency or outcome verification. Define bounded deadlines, deduplication, and reconciliation.
4. Enforce authorization on the server at each resource/action. Observe user outcomes, saturation, latency, and recovery age without logging credentials or uncontrolled personal data.
5. Compare alternatives against consistency, workload, operational maturity, failure behavior, and cost.

## Tests and edge cases

Test duplicate submission, lost acknowledgement after success, dependency outage, replay after restart, peak load, partial rollback, access by another tenant, and recovery after data corruption or regional loss.

## Reflection questions

Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
