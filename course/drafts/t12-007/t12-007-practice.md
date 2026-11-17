# system design technology landscape and selection — Exercises and worked solutions

Sources: [HLD Handbook](https://hld.handbook.academy/technologies/), [reference 1](https://www.postgresql.org/docs/current/), [reference 2](https://kafka.apache.org/documentation/), [reference 3](https://grpc.io/about/), [reference 4](https://grpc.io/docs/what-is-grpc/core-concepts/), [reference 5](https://graphql.org/learn/), [reference 6](https://cloud.google.com/spanner), [reference 7](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html), [reference 8](https://vitess.io/docs/24.0/overview/whatisvitess/), [reference 9](https://docs.scylladb.com/manual/master/using-scylla/cassandra-compatibility.html).

## Goals

Apply the topic's system model to a concrete workload, explain assumptions, and identify the correctness and operational questions that need answers.

## Worked example

A workload needs transactional account updates, low-latency session reads, full-text search, event replay, and inexpensive media storage. Map each requirement to a capability before naming candidate products; identify which data is authoritative and which can be rebuilt.

**Worked solution.** Use a transactional relational or distributed SQL candidate for account invariants after validating geographic and latency constraints. A cache can accelerate sessions only with a defined expiry, invalidation, and recovery policy. Search is a derived index fed from authoritative changes and can be rebuilt; do not treat it as transactionally current without evidence. A retained event log or queue is selected according to replay, ordering, retention, and consumer needs. Object storage holds media with separate metadata and access controls. Compare concrete providers using measured workload, failure tests, operating model, total cost, and exit/migration requirements.

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
