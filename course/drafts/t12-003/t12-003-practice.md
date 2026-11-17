# data systems storage engines analytics streams and search — Exercises and worked solutions

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.postgresql.org/docs/current/mvcc.html), [reference 2](https://kafka.apache.org/documentation/), [reference 3](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 5](https://hld.handbook.academy/curriculum/data-systems/).

## Goals

Apply the topic's system model to a concrete workload, explain assumptions, and identify the correctness and operational questions that need answers.

## Worked example

Design the data flow for an order API that needs immediate confirmation, search, financial reporting, and replayable downstream processing.

**Worked solution.** Commit the order and transactional outbox record atomically in the authoritative relational store. Return confirmation only after the transaction outcome is known. Publish with a stable event ID and make consumers idempotent. Build search and analytical projections asynchronously, define lag objectives, expose freshness timestamps, and retain events or snapshots long enough for recovery. Reconcile totals against the source of truth; do not claim cross-system exactly-once execution from a broker setting alone.

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

## Tests and edge cases

Test duplicate requests, slow consumers, a full queue, stale cache, one node or zone unavailable, provider timeout after success, schema change during mixed-version rollout, unauthorized tenant ID, and recovery from backup.

## Reflection questions

Which assumption could invalidate the design? Which invariant would be hardest to recover after a partial failure? What evidence would make you remove a component rather than add another?
