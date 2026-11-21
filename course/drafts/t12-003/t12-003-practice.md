# data systems storage engines analytics streams and search — Exercises and worked solutions

Sources: [HLD Handbook](https://hld.handbook.academy/), [PostgreSQL MVCC](https://www.postgresql.org/docs/current/mvcc.html), [Kafka design](https://kafka.apache.org/36/design/design/), [Azure data-store choices](https://learn.microsoft.com/azure/architecture/data-guide/technology-choices/data-storage), [Azure CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs), [Azure event-sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing), [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [HLD Handbook data systems syllabus](https://hld.handbook.academy/curriculum/data-systems/).

## Goals

Apply the topic's system model to a concrete workload, explain assumptions, and identify the correctness and operational questions that need answers.

## Worked example

Design the data flow for an order API that needs immediate confirmation, search, financial reporting, and replayable downstream processing.

**Worked solution.** Commit the order and transactional outbox record atomically in the authoritative relational store. Return confirmation only after the transaction outcome is known. Publish with a stable event ID and make consumers idempotent. Build search and analytical projections asynchronously, define lag objectives, expose freshness timestamps, and retain events or snapshots long enough for recovery. Reconcile totals against the source of truth; do not claim cross-system exactly-once execution from a broker setting alone.

This is not the only valid answer. If volume is low and no search/report freshness target requires a separate system, begin with one relational store, suitable indexes, and a scheduled aggregate. Keep the event boundary only if downstream work needs independent retry or decoupling. Add the broker and separate projections when requirements justify their extra schemas, monitoring, backfill, access control, and on-call work.

## Exercises

1. Restate the product goal as two functional requirements and three measurable quality objectives.
2. Estimate the average, peak, and burst workload. List the assumptions that most affect your estimate.
3. Identify authoritative data and one derived representation. State how the derived data is refreshed and reconciled.
4. Walk through a timeout after a write. What does the client know, and what key or query resolves ambiguity?
5. Remove one dependency from the design. Describe user-visible degradation and the telemetry that should detect it.
6. Explain which single measurement would justify the next scaling change.

## Progressive hints

Start with user behavior and invariants. Draw a baseline before adding components. Follow the write path and read path separately. Distinguish successful completion from durable acceptance and unknown outcome.

## Complete solutions

1. Functional requirements describe specific user actions and outcomes. Quality targets state boundary, workload, metric, threshold, and measurement window; they should be agreed with the product owner.
2. Use ranges and show the arithmetic. Include peak-to-average ratio, concurrency, payload, and retention; mark estimates that need measurement.
3. Name the component that owns the authoritative update. A derived store needs a delivery/rebuild policy and a freshness objective.
4. A timeout is ambiguous. Retry only with an idempotency key or verify the operation by a stable identifier before issuing a new effect.
5. Preserve critical behavior and degrade optional work. Emit dependency latency/error, request outcome, queue age where relevant, and trace context without high-cardinality sensitive fields.
6. Select evidence for the actual constraint, such as database saturation, tail latency, queue age, or cache miss cost. Scale the constrained component and retest.

## Failure analysis table

| Failure point | What is known | Safe response | Evidence to monitor |
|---|---|---|---|
| Client loses response after order commit | Outcome is unknown to client | Retry with same idempotency key or query by stable request ID | Duplicate-key conflicts, unknown-outcome rate |
| Outbox relay publishes then crashes before marking sent | Event may be delivered twice | Consumer deduplicates by stable event ID | Duplicate count, outbox age, relay retries |
| Search consumer falls behind | Order state remains authoritative; search is stale | Keep serving source-backed order confirmation; alert on lag and replay | Oldest event age, projection freshness |
| Analytics backfill overlaps live events | Results can double-count or omit data | Use a consistent snapshot/offset handoff and deterministic upsert or deduplication | Reconciliation delta, duplicate business keys |
| New schema reaches old consumer | Consumer may reject or misread event | Add fields compatibly, version contracts, deploy tolerant readers first | Deserialization failures by version |
| Restore from backup loses recent transactions | Recovery point exceeded target | Recover from logs or reconcile from an external authoritative record if designed | Restore duration and recovered-through timestamp |

The safe response depends on the business action. A duplicate search-index update is usually repairable; a duplicate payment or email may not be. Classify effects before choosing retry semantics.

## Tests and edge cases

Test duplicate requests, slow consumers, a full queue, stale cache, one node or zone unavailable, provider timeout after success, schema change during mixed-version rollout, unauthorized tenant ID, and recovery from backup.

## Reflection questions

Which assumption could invalidate the design? Which invariant would be hardest to recover after a partial failure? What evidence would make you remove a component rather than add another?
