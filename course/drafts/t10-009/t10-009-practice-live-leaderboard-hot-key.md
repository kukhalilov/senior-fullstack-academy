# architecture interviews tradeoffs requirements and constraints — Problem: Design a live leaderboard without one hot key

Sources: [source](https://hld.handbook.academy/), [source](https://sre.google/sre-book/table-of-contents/), [source](https://learn.microsoft.com/en-us/azure/architecture/guide/), [source](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework)

## Goals

Practice partitioned aggregation, approximate versus exact ranking, update frequency, read model freshness under interview constraints.

## Worked example

A global game leaderboard receives frequent score updates and millions of reads. Explain ingestion, ranking, hot-key control, consistency, and cost.

Separate score ingestion from ranking reads. Partition events by player or match, aggregate incrementally, and avoid a single globally updated counter. Decide whether ranking is exact or approximate and at what freshness. Precompute top ranges, shard score buckets or use a specialized ranking approach; test ties, corrections, and late events.

## Exercises

1. State one functional goal, one invariant, and two measurable quality targets.
2. Draw the normal write/read path and identify the authoritative state.
3. Introduce a timeout or partial failure. Explain what is known, unknown, and safe to retry.
4. Name the security and privacy boundaries and the telemetry needed to operate the design.
5. State one alternative and the evidence that would make you choose it.

## Progressive hints

Start from the user-visible invariant. Separate acceptance from completion. Follow data through every durable boundary. Treat timeouts as ambiguous and include a recovery path.

## Complete solutions

1. The global ranking key is the bottleneck. Partition updates by entity and periodically or incrementally merge sorted ranges; define exactness and freshness. A simple cache helps reads but does not remove the hot write path.
2. State the owner and transaction boundary; distinguish derived data from authoritative data.
3. Retry only with stable idempotency or outcome verification. Define bounded deadlines, deduplication, and reconciliation.
4. Enforce authorization on the server at each resource/action. Observe user outcomes, saturation, latency, and recovery age without logging credentials or uncontrolled personal data.
5. Compare alternatives against consistency, workload, operational maturity, failure behavior, and cost.

## Tests and edge cases

Test duplicate submission, lost acknowledgement after success, dependency outage, replay after restart, peak load, partial rollback, access by another tenant, and recovery after data corruption or regional loss.

## Reflection questions

Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
