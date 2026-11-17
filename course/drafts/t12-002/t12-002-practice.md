# distributed systems consistency coordination and convergence — Exercises and worked solutions

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.postgresql.org/docs/current/mvcc.html), [reference 3](https://sre.google/sre-book/table-of-contents/), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Apply the topic's system model to a concrete workload, explain assumptions, and identify the correctness and operational questions that need answers.

## Worked example

A collaborative checklist must support offline edits from mobile devices. Specify which operations can merge without central coordination and which invariant requires a server decision.

**Worked solution.** Independent additions to a set can often merge; removals need an explicit observed-remove or tombstone model so concurrent additions are not erased accidentally. A unique owner, payment, or limited-inventory invariant should be serialized by an authoritative transaction or coordination protocol. Define operation identity for replay, preserve causal/version metadata as needed, and show conflicts rather than silently applying last-write-wins to user-authored text. Test reorder, duplicate delivery, reconnect, and clock skew.

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
