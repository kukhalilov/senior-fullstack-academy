# data systems storage engines analytics streams and search — Reference: Kafka Streams

Sources: [Apache Kafka 4.4.0 release](https://kafka.apache.org/blog/2026/10/22/apache-kafka-4.4.0-release-announcement/), [Kafka Streams 4.4 docs](https://kafka.apache.org/44/documentation/streams/), [core concepts and processing guarantees](https://kafka.apache.org/44/streams/core-concepts/), [Streams DSL](https://kafka.apache.org/44/streams/developer-guide/dsl-api/), [Processor API](https://kafka.apache.org/44/streams/developer-guide/processor-api/), [state stores](https://kafka.apache.org/44/streams/developer-guide/processor-api/#state-stores), [interactive queries](https://kafka.apache.org/44/streams/developer-guide/interactive-queries/), [configuration](https://kafka.apache.org/44/streams/developer-guide/config-streams/), [testing](https://kafka.apache.org/44/streams/developer-guide/testing/), and [upgrade guide](https://kafka.apache.org/44/streams/upgrade-guide/).

## Scope and version

As of November 20, 2026, Apache Kafka 4.4.0 is the latest release (released October 22, 2026). Kafka Streams is a Java library for building stream-processing applications that read from and write to Kafka. It runs inside your application process; it is not a separate cluster scheduler or a managed streaming service. Kafka provides the durable input/output log and group coordination; your application deployment supplies compute, scaling, monitoring, and rollout.

Kafka 4.4 adds, among other changes, Streams topology descriptions for broker-visible Streams groups and custom broker-side assignor support for Streams groups. Kafka 4.3 introduced a Streams exception handler for global stores/KTables; 4.3.1 fixed a critical native-memory leak in the RocksDB state-store path. Treat upgrade notes as operational requirements, not optional release trivia.

## Supplied names explained

- `Kafka Streams` is a Java stream-processing library embedded in an application that builds Kafka-backed stateless and stateful processing topologies.

## How this group fits the mental model

You describe a directed processing topology. Kafka partitions divide input records; a **task** processes one or more topic partitions. Tasks are assigned across application instances and stream threads. Records with the same key normally route to the same partition, which is what makes per-key state and ordering practical. Adding more instances only adds parallelism up to available partitions/tasks; hot keys and repartition steps can still bottleneck.

Stateful operations materialize **state stores**. These are local stores associated with tasks (commonly backed by RocksDB or in-memory stores); changelog topics make eligible stores fault-tolerant and restorable. A restarted or reassigned task may need to restore state before it can serve/continue at normal speed. Recovery traffic, local disk, state size, changelog retention, standby replicas, and rebalance duration all matter operationally.

## The main data abstractions

- **`KStream<K,V>`**: a sequence of independent records. Repeated keys are separate events; filtering and mapping preserve event-stream intuition.
- **`KTable<K,V>`**: a changelog-backed table view keyed by record key. A later value for a key updates the table's current value; deletes are represented by tombstones. It is not simply an immutable event list.
- **`GlobalKTable<K,V>`**: a fully replicated table view available to every application instance, useful for lookups that do not require co-partitioning; replication and memory/state cost grow with the table.
- **`Topology`**: the connected processors, source/sink topics, repartition topics, and stores the application will run.
- **`StreamsBuilder` and the DSL**: define sources and high-level operations; `build()` creates a topology, then `KafkaStreams` starts and manages it.

Common DSL operations include source creation (`stream`, `table`, `globalTable`); stateless mapping/filtering (`filter`, `filterNot`, `map`, `mapValues`, `flatMap`, `flatMapValues`, `selectKey`, `peek`); split/multicast (`split`, `branch`, or applying multiple downstream operations); grouping and repartitioning (`groupByKey`, `groupBy`, `repartition`); aggregations (`count`, `reduce`, `aggregate`); joins (`join`, `leftJoin`, `outerJoin` where supported for that pair); windowing (`windowedBy` with tumbling, hopping, sliding, or session windows); output control (`suppress`, `to`, `through`, `foreach`, `print`); and table/stream conversions (`toTable`, `toStream`). Legacy `transform`, `flatTransform`, `transformValues`, `flatTransformValues`, and older `process` methods are deprecated/removed in 4.4; custom work should use the unified Processor API. Exact overloads and semantics are in the versioned API. Key-changing operations often repartition; that adds network, topic, serialization, and latency cost.

Use the **Processor API** (`Processor`, `ProcessorSupplier`, `ProcessorContext`, `Record`, `ConnectedStoreProvider`, and state-store builders) when a custom state machine, punctuation, headers, or exact control over forwarding/state access is clearer than a DSL chain. The DSL is usually shorter and easier to inspect; custom processors require careful lifecycle, serialization, store registration, and testing.

## Time, windows, joins, and late events

Kafka Streams distinguishes record timestamp/event time from processing time. A timestamp extractor chooses the record timestamp; it can come from the producer, a field, or a custom rule. Windowed aggregates and joins define a time interval and, where applicable, a grace period for out-of-order records. A window's result is not final merely because wall-clock time passed if the configured lateness policy still accepts data. `suppress` can buffer intermediate results until a window closes, which changes memory use and output timing.

- **Tumbling windows** do not overlap; **hopping windows** overlap at a configured advance interval; **sliding windows** are defined by the timestamp difference between records and can support aggregations and joins; **session windows** group activity separated by inactivity gaps.
- **Stream-stream joins** match records within a time bound and retain both sides in window stores; partitioning keys must align and the join window/grace affects retention and late-data behavior.
- **Stream-table joins** enrich each event using table state. With versioned stores, timestamp-based behavior can select the latest table record whose timestamp is no later than the stream record; unversioned tables use latest-by-offset semantics. This difference matters for out-of-order updates.
- **Table-table joins** react to table updates and can emit revised results. Null/tombstone behavior, join type, and materialization affect what downstream sees.

Choose retention from the window and recovery needs. Large windows, high cardinality, overlapping joins, and late-arrival allowance increase state storage and restore time.

## Delivery and processing guarantees

The default `processing.guarantee` is `at_least_once`. Kafka Streams also supports `exactly_once_v2`, which transactionally coordinates Kafka input offsets, state-store changelogs, and Kafka output records. This guarantee covers the Kafka processing boundary. If a processor calls a payment API, sends email, writes to an unrelated database, or triggers another non-transactional effect, Kafka cannot roll that external effect back with its transaction. Use an outbox, idempotency key, deduplication, or reconciliation for the external side effect.

“Exactly once” also does not mean each business event is generated only once, that a sink outside Kafka has no duplicates, or that all clients observe an output at the same instant. Select `exactly_once_v2` only with the needed broker support and production replication/configuration; transactional throughput and availability costs are part of the decision.

## Interactive queries

Interactive queries expose materialized state stores to application code and can support low-latency reads of derived state. A store on one instance is only the portion assigned to that instance. The application must route a key to its active task owner or otherwise discover/aggregate the right partitions; local `store()` access alone is not a distributed query API. Querying is read-only so external code cannot mutate state behind the processor/changelog. Kafka 4.4 documentation also includes IQv2 query APIs; check store-type and query support, because not every state-store type supports every interactive-query surface.

## Operations and configuration that change behavior

Important settings include `application.id` (group/state namespace), `bootstrap.servers`, default and per-topic serdes, `num.stream.threads`, `processing.guarantee`, `commit.interval.ms`, `state.dir`, `replication.factor`, cache/buffer settings, standby replicas, processing exception handlers, timestamp extractor, and topology optimization. Defaults are version-sensitive; consult the 4.4 configuration reference. Changing `application.id` generally creates a distinct processing identity and can reprocess source history; reusing it with incompatible state/topology requires an upgrade plan.

Monitor consumer lag and end-to-end event age, task/stream-thread health, rebalance frequency/duration, commit latency/failures, restore duration, state-store size, RocksDB native memory/disk, changelog health, skipped/failed records, output rate, and downstream saturation. A healthy Kafka consumer lag alone cannot prove the application's derived result is fresh or correct.

## Testing strategy

Use `TopologyTestDriver` to test topology logic with controlled input/output records, timestamps, state stores, and wall-clock advancement. Test late/out-of-order records, tombstones, serialization failures, boundary timestamps, duplicate/replay inputs, and window close behavior. Integration tests with a broker are still needed for transactions, broker features, group assignment, rebalances, changelog restoration, ACLs, and upgrade compatibility. Do not infer production recovery behavior from a topology unit test.

## Examples

### Rolling one-minute request counts

Read keyed request events, validate timestamp and tenant key, group/repartition by tenant, apply a one-minute window with explicit grace, count events, and write keyed aggregates to an output topic. Decide whether late events revise a prior window or are rejected; define retention and whether downstream consumes updates or only final results. For a dashboard lookup, materialize the aggregate store and implement routing to the instance owning the key. Use `exactly_once_v2` if Kafka-to-Kafka duplicate suppression is required, while keeping any external notification idempotent. Load-test skewed tenants, not just uniform keys, and test task restore after killing an instance.

## Cross-item comparison

- **Kafka Streams vs Flink:** Streams is a library embedded with the service and uses Kafka as its core runtime/log; Flink is a separate distributed processing runtime with broader connectors and a distinct checkpoint/state model.
- **Kafka Streams vs Spark Structured Streaming:** Spark fits batch/SQL analytics and micro-batch/continuous pipeline integration; Streams fits long-running Kafka-centric application topologies and local stateful services. Compare latency, state, connector, and operations requirements.
- **Kafka Streams vs Kafka Connect:** Connect moves data through configured source/sink connectors; Streams performs application logic and stateful transformations. They can be combined.
- **Kafka Streams vs a custom consumer loop:** a custom loop can be simpler for stateless forwarding but requires you to implement partitioned state, rebalances, restoration, joins/windows, and their failure behavior yourself.

## Common mistakes

- Assuming more application instances create more parallelism than input partitions allow.
- Forgetting a key change can create a repartition topic and shuffle.
- Treating `KTable` as a history of every event instead of current keyed state.
- Using processing time when requirements are based on event time, or omitting late-event/grace policy.
- Calling an external side effect and claiming Kafka EOS makes it exactly once.
- Serving a local state store as though each instance holds the full table.
- Ignoring restore time, RocksDB native memory, or state/changelog growth.
- Changing `application.id` and being surprised by a new consumer identity and replay.

## Knowledge checks with answers

1. **When would a stream-table join be wrong for late events?** If the table is unversioned, the join uses latest-by-offset table state rather than timestamp history; use versioned state and verify its retention/engine behavior when event-time correctness requires it.
2. **Does `exactly_once_v2` prevent duplicate calls to an external payment API?** No. Its transaction covers Kafka offsets, Kafka state, and Kafka output records; the external API needs idempotency/reconciliation.
3. **Why can adding workers stop improving throughput?** The topology's task parallelism is bounded by partitions, and skewed keys or downstream bottlenecks can leave work imbalanced.
4. **What restores a local state store after task movement?** Its changelog topic can rebuild the assigned task state; restore time and changelog availability affect recovery.
