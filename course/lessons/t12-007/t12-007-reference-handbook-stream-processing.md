# system design technology landscape and selection — Reference: Stream processing

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [Flink stateful stream processing](https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/stateful-stream-processing/), [Flink fault tolerance](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/), [Flink checkpointing](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/fault-tolerance/checkpointing/), [Spark Structured Streaming guide](https://spark.apache.org/docs/latest/streaming/), [Spark Real-time Mode](https://spark.apache.org/docs/latest/streaming/real-time-mode.html).

## Scope and version

This lesson compares Apache Flink and Apache Spark Structured Streaming as named stream-processing systems. Spark evolves quickly: its current documentation describes the default micro-batch engine and a newer Real-time Mode introduced in Spark 4.1, with supported stateful operations expanded in 4.3. Feature support is mode-, version-, source-, and sink-dependent; check the precise deployed version.

## How this group fits the mental model

Stream processing continuously transforms a sequence of events into derived state or outputs. The hard design problem is not merely applying a function to each record. It is deciding what time means, how out-of-order data is handled, how keyed state is stored, how progress is checkpointed, how inputs can be replayed, and whether output effects can be repeated safely after failure.

**Event time** is when the event says it happened; **processing time** is when the system handles it. A watermark estimates how far event time has progressed and helps the engine decide when a window is sufficiently complete. Late-event policy is a product decision: wait longer for correctness, emit revisions, or drop events after a bound. Stateful operators need an explicit state-retention/cleanup policy so state does not grow forever.

## Supplied names explained

- **Apache Flink** — A distributed stream-processing engine with stateful operators, event-time processing, watermarks, windows, and checkpoint-based fault tolerance. A checkpoint consistently captures operator state and source progress; after failure, the job restores state and replays input. “Exactly once” means each input affects Flink-managed state effectively once. End-to-end exactly-once requires replayable sources and a transactional or idempotent sink. Checkpoint storage, alignment, state size, backpressure, and sink behavior affect performance and guarantees.
- **Apache Spark Structured Streaming** — A streaming API built on Spark SQL’s structured data model. The default engine processes input as micro-batches and supports a broad set of streaming operations. Current Spark versions also provide Real-time Mode, which runs long-lived tasks to reduce per-batch scheduling latency; operation support is narrower and evolving. Engine-managed state guarantees do not automatically make writes to every external sink exactly once. For example, current docs distinguish exactly-once processing from sink delivery semantics and identify the built-in Kafka sink as at-least-once.

## Cross-item comparison

| Dimension | Flink | Spark Structured Streaming |
|---|---|---|
| Core model | Stateful streaming dataflow with event-time capabilities | Structured streaming integrated with Spark SQL; default micro-batch plus newer Real-time Mode |
| Latency | Designed for continuous event processing; actual latency depends on checkpointing, state, network, and sinks | Micro-batch has batch scheduling overhead; Real-time Mode lowers it for supported query shapes |
| State and recovery | Checkpoints couple operator state with replayable source positions | Checkpointed query progress/state; semantics depend on mode, source, and sink |
| Main evaluation | State size, backpressure, event-time behavior, checkpoint duration, connectors | Query/operator support in chosen mode, trigger/checkpoint cadence, state store, sink guarantees |

Neither label alone predicts suitability. Benchmark with realistic event size, skew, late arrivals, state growth, failure injection, and downstream rate.

## Examples

### Rolling fraud signal

Events arrive keyed by account with an event timestamp. The processor keeps a sliding time window of recent attempts. It assigns event time from the event timestamp, advances a watermark based on an agreed lateness bound, and defines whether late events are dropped or cause corrected outputs. State is checkpointed. The source must retain/replay input long enough for recovery. The output store accepts an idempotency key such as account plus window end and revision. A duplicate after restart then becomes harmless. Before choosing Flink or Spark, verify the needed window and sink connector semantics in the exact runtime version and test recovery with a killed worker.

## Correctness and operations checklist

- Source offsets and operator state must recover from a consistent checkpoint.
- Checkpoint frequency trades recovery work against checkpoint overhead and storage load.
- Watermarks are estimates of event-time completeness, not proof that no earlier event can arrive.
- Late events, window corrections, state TTL, and output retractions need explicit policy.
- Backpressure can increase lag and checkpoint duration; monitor source lag, busy/idle time, state size, and checkpoint failures.
- External side effects require idempotency, transactional sinks, or a reconciliation design.

## Common mistakes

- Equating “exactly once” state processing with exactly-once external delivery.
- Using processing time when the product requirement is about when events occurred.
- Setting a watermark without understanding what late records are discarded or revised.
- Assuming every Spark query is micro-batch, or assuming every query is supported in Real-time Mode.
- Treating checkpoint success as a substitute for source retention and sink recovery design.

## Knowledge checks with answers

1. **What does a watermark mean?** A progress estimate used to bound event-time waiting; it is not a guarantee that older events cannot arrive.
2. **What does Flink’s exactly-once state guarantee mean?** Restored state reflects each replayed input’s effect once, even if the event is physically reprocessed during recovery.
3. **What else is required for end-to-end exactly-once effects?** A replayable source and a transactional or idempotent sink, plus correctly coordinated recovery.
4. **When might Spark Real-time Mode be unsuitable?** When the query uses unsupported operators or sink semantics, or when its resource model and operational constraints do not meet the workload.
