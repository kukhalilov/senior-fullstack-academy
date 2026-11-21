# end-to-end system design case studies — Problem: Design an observability platform

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice multi-signal ingestion, cardinality, trace correlation, query isolation, and retention; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design ingestion and query for metrics, logs, and traces across many hosts and multiple customer organizations.

**Worked design.** Define signal contracts and ingestion priorities with backpressure. Enforce tenant isolation and cardinality budgets at ingestion; reject or transform unbounded metric dimensions deliberately. Store hot queryable data separately from archive and preserve trace/log correlation. Sampling and aggregation reduce cost but change what can be investigated, so document policy and retain aggregate SLO metrics. Isolate expensive queries from ingestion and alert evaluation. Measure dropped telemetry, ingest lag, query tails, and cost per tenant.

## Exercises

1. **Specify the contract.** From this case — Design ingestion and query for metrics, logs, and traces across many hosts and multiple customer organizations. — write three must-have behaviors, one explicit non-goal, and the invariant that must remain true under concurrency.
2. **Model demand.** Estimate average, peak, and burst requests; identify the work that scales with multi-signal ingestion, cardinality, trace correlation, query isolation, and retention. State units and unknowns, and choose one production measurement that would revise your estimate.
3. **Trace ownership and API.** Name the authoritative record, its stable identifier, the read path, and the write/acceptance path. State where authorization and idempotency are checked and which derived data may be stale.
4. **Resolve a failure.** Analyze this case-specific drill: A burst produces late, duplicated, or high-cardinality events. Bound memory and queues, define window/watermark behavior, and surface dropped or delayed data explicitly. Identify the state before/after, retry rule, user-visible result, and recovery signal.
5. **Defend a trade-off.** Compare a simple baseline with one scaling mechanism relevant to multi-signal ingestion, cardinality, trace correlation, query isolation, and retention. Give the quality metric, latency/cost metric, and failure mode that decide whether to keep the mechanism.

## Progressive hints

Start with the user promise and the invariant, not a vendor diagram. Sketch the smallest correct read/write flow. Put timestamps and operation IDs on the path. Separate authoritative state from cache, index, notification, or analytics. Use the named failure drill to test retry and recovery. Add a scale mechanism only after identifying the bottleneck.

## Complete solutions

1. The contract should make the case-specific promise observable and name one invariant. For Design an observability platform, write a distinct browse/read promise and a command/write promise; define which actor is authorized and what happens when the invariant cannot be confirmed.
2. Estimate the busiest interval and skew, not just a daily average. For the supplied patterns (multi-signal ingestion, cardinality, trace correlation, query isolation, and retention), account for the dominant fan-out, payload, active-state, or storage multiplier. Keep the estimate as a range and validate it with representative traffic or a replay.
3. Keep one authoritative owner for the critical fact. Use stable IDs and explicit request/response semantics. Authenticate first, authorize at the data/action boundary, record durable acceptance before claiming completion, and mark caches or projections with their freshness/rebuild policy.
4. For the drill, a timeout means outcome unknown. Query durable operation state or retry with the same idempotency identity; never issue a second unguarded effect. Bound retries, expose pending/unknown status, alert on age/backlog, and reconcile external or derived state after recovery.
5. Keep the baseline until measurements show it misses the stated SLO. A cache, queue, partition, fan-out, replica, or specialized index earns its cost only if the chosen measure improves without breaking the invariant, privacy, or recovery contract. Use a rollback/disable path and monitor tail latency, errors, saturation, and the case-specific quality signal.
### Case-specific design answer

Define signal contracts and ingestion priorities with backpressure. Enforce tenant isolation and cardinality budgets at ingestion; reject or transform unbounded metric dimensions deliberately. Store hot queryable data separately from archive and preserve trace/log correlation. Sampling and aggregation reduce cost but change what can be investigated, so document policy and retain aggregate SLO metrics. Isolate expensive queries from ingestion and alert evaluation. Measure dropped telemetry, ingest lag, query tails, and cost per tenant.

## Tests and edge cases

Test telemetry flood, cardinality spike, tenant query isolation, collector outage, sampling-induced missing trace, and retention policy.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?
