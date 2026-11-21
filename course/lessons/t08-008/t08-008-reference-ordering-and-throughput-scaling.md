# queues pub sub RabbitMQ Kafka ordering and delivery semantics — Reference: Ordering scope, parallelism, backpressure, and message flow

Sources: RabbitMQ 4.4 [Queues](https://www.rabbitmq.com/docs/4.4/queues), [Consumers](https://www.rabbitmq.com/docs/4.4/consumers), and [Streams](https://www.rabbitmq.com/docs/4.4/streams), and Apache Kafka 4.4 [Documentation](https://kafka.apache.org/44/documentation/) and [Producer configuration](https://kafka.apache.org/44/configuration/producer-configs/).

## Scope and version

Ordering guarantees are local to queue/stream/partition scopes. Parallelism and batching trade latency, throughput, fairness, and resource use.

## How this group fits the mental model

Increase throughput with partitions or competing consumers only when business ordering allows it. Use prefetch, batching, and backpressure to bound in-flight work rather than allowing unbounded buffers.

## Supplied names explained

### FIFO queue insertion order

Messages enter a RabbitMQ queue in an enqueue sequence. This is not identical to observed processing/completion order under multiple consumers, priorities, requeue, or redelivery.

### RabbitMQ queue delivery order

Delivery order usually follows queue order but can be affected by consumer acknowledgements, priorities, requeue, and concurrent work. Define whether the requirement concerns delivery start or completed business effect.

### Ordering impact of multiple RabbitMQ consumers

Competing consumers increase parallelism but can finish in a different order than deliveries. Single Active Consumer or application sequencing may help, with availability/throughput tradeoffs.

### Ordering impact of message requeue

Requeued messages can be placed near the head and redelivered before newer work, changing observed sequence and potentially creating retry loops.

### Ordering impact of message priority

Higher-priority messages may overtake lower-priority ones. Use priority only where overtaking is allowed and starvation is addressed.

### Kafka per-partition order

Records are ordered within one partition by offset. Consumers process that partition sequentially at the assignment level unless the application introduces parallel async work that reorders effects.

### Kafka key-based partitioning

Records with the same key are commonly mapped to the same partition, preserving per-key append order under stable partitioning. Custom partitioners or partition-count changes can alter mapping.

### Kafka order across partitions

There is no general total ordering across independent topic partitions. If one global sequence is required, one partition or explicit sequencing is needed, reducing parallelism.

### Partition count and parallelism

More partitions can increase concurrent consumer capacity and broker parallelism but add metadata, file, replication, and operational overhead. Existing key order can be disrupted for future records when partition mapping changes.

### Consumer concurrency within one partition

One active consumer in a group owns a partition at a time. Application-level parallel processing can still reorder completion; preserve sequence with serial processing or per-key lanes when required.

### Consumer group maximum active consumers

Active parallelism is bounded by the number of assigned partitions (for a given subscription) and available group members. Extra consumers may remain idle.

### RabbitMQ competing-consumer parallelism

Multiple consumers can process a queue concurrently. Throughput rises until broker/dependency saturation, while ordering and fairness become weaker.

### RabbitMQ prefetch backpressure

Prefetch limits unacknowledged deliveries and bounds work in flight. Too low may idle workers; too high can cause memory use, unfair assignment, and large redelivery batches.

### Kafka producer batching

Producer groups records into batches to reduce request overhead and improve compression. Larger batches may increase throughput and latency/memory.

### Kafka linger delay

Producer waits a bounded time to accumulate a batch before sending when traffic is sparse. It trades a small latency increase for batching efficiency.

### Kafka consumer fetch batching

Consumers fetch multiple records/bytes per request to improve efficiency. Fetch limits and wait times affect latency, throughput, and memory.

### Consumer lag

Difference between latest available position and consumer’s progress, measured per partition/group. Lag may be records or time; it does not by itself identify whether users are affected.

### Queue depth

Number/bytes of messages waiting or unacknowledged according to broker metric. A growing depth may indicate insufficient consumer capacity or downstream blockage.

### Broker backpressure

Broker slows/rejects producers or otherwise limits flow when resources are constrained. Producers must handle flow control and retry within bounded budgets.

### Partition hot spot

One partition receives disproportionate traffic and becomes a bottleneck, often from skewed keys or one high-volume tenant. More partitions do not solve a hot key if it must stay ordered.

### Key skew

Uneven key distribution across partitions, producing uneven load. Choose key semantics carefully; salting a key improves distribution but may break per-entity ordering.

### Batch size versus latency

Larger batches improve amortized throughput/compression but can increase wait time, memory, and failure blast radius. Benchmark the actual workload and payload distribution.

## Cross-item comparison

RabbitMQ scales one work queue with competing consumers/prefetch; Kafka scales partitioned logs with group assignments. More parallelism can weaken ordering. Batching and buffers must be bounded against latency and memory objectives.

## Examples

Key events by `accountId` to preserve per-account order while partitioning across many accounts. If one account is extremely hot, splitting its key sacrifices strict account order unless a sequencing layer is added.

## Common mistakes

- Claiming FIFO means completion order with multiple workers.
- Adding consumers beyond Kafka partition count expecting more active work.
- Using huge prefetch/batches without measuring memory and latency.
- Fixing key skew by salting without considering aggregate ordering.
- Watching lag without alerting on age or service-level impact.

## Knowledge checks with answers

1. **What is Kafka’s ordering scope?** One partition.
2. **How does prefetch help?** Bounds in-flight deliveries and applies backpressure.
3. **What limits consumer group parallelism?** Assigned partition count.

### Exact terms covered

- `FIFO queue insertion order`
- `RabbitMQ queue delivery order`
- `Ordering impact of multiple RabbitMQ consumers`
- `Ordering impact of message requeue`
- `Ordering impact of message priority`
- `Kafka per-partition order`
- `Kafka key-based partitioning`
- `Kafka order across partitions`
- `Partition count and parallelism`
- `Consumer concurrency within one partition`
- `Consumer group maximum active consumers`
- `RabbitMQ competing-consumer parallelism`
- `RabbitMQ prefetch backpressure`
- `Kafka producer batching`
- `Kafka linger delay`
- `Kafka consumer fetch batching`
- `Consumer lag`
- `Queue depth`
- `Broker backpressure`
- `Partition hot spot`
- `Key skew`
- `Batch size versus latency`
