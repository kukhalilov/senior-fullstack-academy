# data systems storage engines analytics streams and search — Reference: Spark Structured Streaming

Sources: [HLD Handbook](https://hld.handbook.academy/), [Spark 4.3 Structured Streaming guide](https://spark.apache.org/docs/4.3.0/streaming/index.html), [Structured Streaming APIs](https://spark.apache.org/docs/4.3.0/streaming/apis-on-dataframes-and-datasets.html), [Real-time Mode](https://spark.apache.org/docs/4.3.0/streaming/real-time-mode.html), [stateful processing](https://spark.apache.org/docs/4.3.0/streaming/structured-streaming-transform-with-state.html), [Kafka integration](https://spark.apache.org/docs/4.3.0/structured-streaming-kafka-integration.html), [Spark 4.3 release notes](https://spark.apache.org/releases/spark-release-4-3-0.html), [legacy Spark Streaming guide](https://spark.apache.org/docs/4.3.0/streaming-programming-guide.html).

## Scope and version

This reference explains Apache Spark Structured Streaming as of Spark 4.3.0 (checked 2026-11-20). The Structured Streaming programming model uses Spark SQL's DataFrame/Dataset APIs; it is distinct from the older DStream-based Spark Streaming API, which the current Spark guide labels legacy. Connector behavior and deployment support still depend on the specific source, sink, Spark distribution, and runtime.

## How this group fits the mental model

A stream is an unbounded sequence of records. Structured Streaming lets a developer describe a query over that logical sequence using familiar batch DataFrame operations. Spark repeatedly advances source offsets, processes newly available input, updates operator state, and writes results. A checkpoint records progress and state needed to recover the query. It is a computation engine, not a message broker, permanent system of record, or universal sink transaction manager.

The default execution is **micro-batch**: Spark creates small bounded work units, plans/schedules them, and commits progress. This maps naturally to source offsets, checkpointed state and batch sinks, but scheduling and batch boundaries add latency. Spark 4.1 introduced **Real-time Mode**, with long-running tasks and pipelined records; Spark 4.3 expands it to selected stateful operators. The older **Continuous Processing** mode is experimental, restricted to map-like operations, and at-least-once. It should not be described as the current general low-latency path.

“Exactly once” needs a boundary. Spark can recover its query state and source progress consistently under the documented source/sink and checkpoint conditions. A user-defined side effect, a non-transactional sink, an external API call, or two independent systems do not automatically become exactly-once. Use idempotent writes, transactional sinks, deduplication keys, or an outbox where the external effect requires them.

## Supplied names explained

- **DataFrame/Dataset streaming query** — A declarative incremental computation. Use `readStream` to define a streaming source, transformations such as `select`, `filter`, `groupBy` or joins to define the result, and `writeStream` to start a long-running query. Supported transformations are constrained by streaming semantics; a batch-valid operation may not be legal on unbounded input.
- **Source and offset** — A source exposes input and progress, usually through a monotonically advancing position such as Kafka topic/partition offsets. Replaying from a durable source is central to recovery. Rate limits like Kafka's `maxOffsetsPerTrigger` bound work per trigger; they do not promise a latency SLA.
- **Trigger** — Controls when Spark runs work. `Trigger.ProcessingTime` requests recurring micro-batches, `Trigger.Once` processes available input in a single batch (deprecated in favor of `AvailableNow`), and `Trigger.AvailableNow` drains input available at start and then terminates. Real-time trigger selects Spark 4.1+ Real-time Mode. Trigger interval is not a guaranteed processing-time deadline.
- **Output modes** — `Append` emits rows considered final since the last trigger; for event-time aggregations, a watermark often determines when results are final. `Update` emits rows changed since the last trigger. `Complete` emits the entire result table each trigger and is supported only for compatible queries/sinks. Mode availability depends on the query plan and sink.
- **Event time and watermark** — Event time is a timestamp carried by data, unlike processing time when Spark sees it. A watermark is a policy boundary derived from observed event-time progress and a configured delay. It can let stateful operators evict old state and determine late-data treatment, but it is not a promise that every record within the delay will arrive or a hard universal cutoff. With multiple inputs, global-watermark policy can make one slow input retain state or allow faster state cleanup at the risk of dropping late records from that input.
- **Stateful operators and state store** — Aggregations, deduplication, stream-stream joins and `transformWithState` retain information across records/batches. State size is an operational resource and correctness concern: define keys, event-time bounds, timeout behavior, checkpoint durability, and recovery expectations. Spark 4.3 Real-time Mode supports `dropDuplicates`, streaming aggregations and JVM `transformWithState`; it does not yet support every stateful query, including stream-stream joins.
- **Checkpoint** — Durable query metadata and state location used to resume a specific query. Treat it as part of that query's identity: do not casually share it between unrelated queries or delete it to “unstick” production. Changing stateful operators, source identity, state-store provider or certain query settings can make an old checkpoint incompatible. Plan upgrades and state migrations explicitly.
- **Sink and `foreachBatch`** — Built-in sinks have different support and guarantees. `foreachBatch` gives a batch DataFrame to custom code and is useful for transactional/idempotent upserts, but its callback can be invoked again on retry. Make writes safe to repeat, often by using `batchId` with a transaction or idempotency key. The built-in Kafka sink is at-least-once; duplicate output is possible after retry.
- **Real-time Mode** — Spark 4.1+ low-latency execution path using continuously running tasks. Spark 4.3 adds a first set of stateful capabilities: streaming aggregation, `dropDuplicates`, and JVM `transformWithState`. It has supported source, sink and plan restrictions; it always uses Update output mode. Its checkpoint interval is a recovery/progress boundary rather than a wait-before-emitting batch interval. Check the supported-query table before designing around it.
- **Continuous Processing** — Experimental older mode with very limited stateless support and at-least-once processing semantics. It is not interchangeable with micro-batch and does not make arbitrary stateful queries sub-millisecond.
- **DStream Spark Streaming** — The RDD/DStream API with `StreamingContext`, receivers/direct input and older operations such as `updateStateByKey`. It is a legacy API; new work should start with Structured Streaming unless maintaining an existing DStream application.

## Cross-item comparison

Choose micro-batch when the query needs broad SQL/DataFrame support, mature stateful operations, and seconds/subseconds-to-seconds freshness. Choose Real-time Mode only when lower latency justifies checking its narrower supported plan, connector and configuration set; benchmark end-to-end, including source, shuffle, state and sink. Continuous Processing has a narrower role and weaker delivery semantics. Kafka Streams is an embedded stream-processing library with Kafka-native state/repartitioning assumptions; Flink is a dedicated stream processor with event-time/stateful capabilities and a different runtime model. Spark Structured Streaming is attractive when the same team uses Spark SQL, batch and lakehouse pipelines. None is universally “exactly once” across arbitrary side effects.

## Examples

Suppose an order topic feeds a five-minute revenue dashboard. Read Kafka as a stream, parse and validate records, group by event-time window and currency, and write updates to a sink that supports idempotent upserts. Set a checkpoint on durable storage, choose an event-time watermark based on the business late-arrival policy, and monitor input lag, batch duration, watermark progress, state size, failures and sink latency. If an order can be corrected later, decide whether the system emits compensating updates or preserves immutable events; a watermark that evicts a window can limit later correction.

If writing to a relational table through `foreachBatch`, use a stable order/window key and transactionally upsert the batch, or record the batch identifier in the same transaction. A process crash after an external write but before Spark commits progress can cause callback replay. Without idempotency, duplicate effects are expected. A checkpoint alone cannot repair a non-idempotent external side effect.

## Common mistakes

- Calling any stream “exactly once” without naming the source replay, checkpoint, query plan and sink assumptions.
- Treating a watermark as a guarantee that all earlier events have arrived, or forgetting it governs state and late data.
- Restarting a changed stateful query against an incompatible checkpoint or deleting that checkpoint without a data-replay plan.
- Choosing Complete mode for a sink/query that cannot support the full result table.
- Assuming a trigger interval is a latency guarantee; scheduling, backpressure, source availability and sink work also matter.
- Assuming Real-time Mode supports every Structured Streaming operator, or confusing it with legacy Continuous Processing.
- Using non-idempotent `foreachBatch` effects without handling callback retry.
- Mixing the legacy DStream API guidance with new DataFrame/Dataset query design.

## Knowledge checks with answers

1. **Why is a checkpoint not enough to guarantee exactly-once effects in an arbitrary API?** Spark can restore its own progress, but an external effect may succeed before the checkpoint records completion. A retry can repeat that effect unless the destination is transactional or idempotent.
2. **What does a watermark do?** It gives event-time stateful operators a progress/cleanup policy and affects whether late data can update results. It is not a real-time arrival guarantee.
3. **When is Real-time Mode suitable in Spark 4.3?** When lower latency is necessary and the query's operators, source, sink, output mode and state-store configuration are supported. Confirm the current support list and test failure recovery.
4. **What is the difference between Append and Update for a windowed aggregate?** Update can emit revised counts while the window is active; Append waits until the query considers the result final, commonly using a watermark.
5. **Is DStream the same API as Structured Streaming?** No. DStream is the older RDD-oriented API; Structured Streaming is the DataFrame/Dataset API integrated with Spark SQL.
