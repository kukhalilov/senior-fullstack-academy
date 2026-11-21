# system design tradeoffs and decision methods — Reference: Lambda vs Kappa architecture

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Flink batch/stream execution mode](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/execution_mode/), [Flink stateful stream processing](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/streaming_analytics/).

## Scope and version

Lambda and Kappa are architectural approaches to combining or organizing batch and streaming computations. They are not specific products and do not automatically provide correctness or exactly-once output.

## How this group fits the mental model

**Lambda architecture:** maintain a batch path over a complete dataset for corrected comprehensive results, plus a low-latency stream path for recent updates; merge/query the views. It can combine completeness and freshness, but duplicates business logic, output paths, testing, and reconciliation.

**Kappa architecture:** treat the durable event log as the source and use a stream-processing path; for corrections or new logic, replay historical events through a new version. It reduces dual-pipeline logic, but replay time/cost, log retention, schema evolution, state rebuild, and output cutover must be manageable.

## Supplied names explained

- `Lambda vs Kappa architecture` — Lambda separates batch and stream paths and reconciles their views; Kappa favors a replayable stream-processing path. They differ in code paths, replay capability, historical recomputation, and operational burden, not simply speed.

## Cross-item comparison

Prefer one streaming path when source events are durable and replay is affordable within the recovery/rebuild objective. Keep separate batch and stream paths when the batch result has distinct completeness/audit guarantees or replay cannot meet deadlines—but budget for keeping both implementations semantically aligned. For either, measure correction delay, replay throughput, storage retention, and cutover risk.

## Examples

An analytics team changes the fraud-scoring algorithm. In a Kappa-style path, replay retained transaction events into a versioned output table, validate totals, then switch readers; ensure replay capacity does not starve live processing. In a Lambda-style path, update both the batch model and streaming approximation, then reconcile outputs for the overlap interval and test agreement on late/duplicate events.

## Common mistakes

- Assuming Lambda's two paths automatically produce identical results.
- Assuming Kappa replay is feasible without sufficient log retention and processing capacity.
- Treating replay as exactly-once side effects without idempotent/versioned sinks.
- Ignoring state migration, late data, schema changes, and reader cutover.

## Knowledge checks with answers

1. **What complexity does Lambda accept?** Two processing paths and a reconciliation/merge problem.
2. **What prerequisite makes Kappa replay useful?** Durable retained events plus capacity and safe state/output rebuild.
3. **What do both still need?** Explicit event-time, duplicate, schema, state recovery, and sink semantics.
