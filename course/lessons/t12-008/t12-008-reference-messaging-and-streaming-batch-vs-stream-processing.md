# system design tradeoffs and decision methods — Reference: Batch vs stream processing

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Apache Flink streaming analytics](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/streaming_analytics/), [Flink time concepts and watermarks](https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/), [Flink batch/stream execution mode](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/execution_mode/).

## Scope and version

Batch and stream processing describe how computations consume data; they are not mutually exclusive storage choices. Modern stream engines may process bounded input, and batch jobs can produce results incrementally in stages.

## How this group fits the mental model

**Batch:** process a bounded dataset or accumulated interval, often with complete input available for a job. It is natural for historical recomputation, large joins, and reports; results arrive after the batch schedule and job runtime.

**Stream:** process an ongoing sequence of events with state and continuous outputs. Define event time (when the event happened) versus processing time (when the system handled it), windows, out-of-order arrival, late events, state retention, checkpoints, replay, and delivery semantics. A watermark is a progress estimate used to decide when event-time work can proceed; it is not proof that no earlier event can ever arrive.

## Supplied names explained

Exactly-once claims must name the boundary: processing state, source offsets, and sink writes need coordinated recovery or idempotence. A stream may replay after failure; downstream effects can still duplicate if the sink is not transactional/idempotent. Batch pipelines also need late corrections, backfills, and reproducibility.

## Cross-item comparison

Use batch for periodic complete recomputation or when minutes/hours of latency are acceptable. Use streaming for low-latency updates, continuous alerting, and event-time calculations, accepting always-on state/operations and late-data policy. A common design streams fresh events and periodically reconciles/backfills with batch.

## Examples

A fraud dashboard counts transactions per account over a rolling 10-minute event-time window. A card event created at 10:02 arrives at 10:09. A processing-time window may put it in the wrong interval; event time can place it correctly if the watermark/lateness policy permits. Define whether late events update prior results, how long state is kept, what a checkpoint restores, and whether an external alert can be emitted twice after recovery.

## Common mistakes

- Treating a watermark as a guarantee that late events are impossible.
- Confusing event time with wall-clock processing time.
- Saying exactly-once without specifying source, state, sink, and failure boundary.
- Ignoring state growth, replay, backfills, late data, and output correction.

## Knowledge checks with answers

1. **What is a watermark used for?** Estimating event-time progress so the engine can close windows or fire event-time timers.
2. **Does it forbid earlier events from arriving later?** No; late-event handling is still required.
3. **When is batch a strong fit?** Bounded recomputation, historical backfill, or reporting where scheduled latency is acceptable.
