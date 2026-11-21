# queues pub sub RabbitMQ Kafka ordering and delivery semantics — Reference: Kafka append-only topic log, keys, partitioning, and retention

Sources: Apache Kafka 4.4 [Documentation](https://kafka.apache.org/44/documentation/), [Producer configuration](https://kafka.apache.org/44/configuration/producer-configs/), [Consumer configuration](https://kafka.apache.org/44/configuration/consumer-configs/), and [Processing semantics](https://kafka.apache.org/44/documentation/#semantics).

## Scope and version

This lesson covers Kafka’s log/partition model and core producer/consumer concepts. Exact client defaults and APIs vary by client version.

## How this group fits the mental model

Producers append records to partitioned logs. Consumer groups track progress independently. Partitions provide ordering/parallelism units; retention or compaction controls history.

## Supplied names explained

### Apache Kafka broker

A server storing/serving partition replicas and coordinating client requests. Broker role and metadata management depend on the cluster mode/version.

### Kafka cluster

A coordinated set of brokers serving topics/partitions. Replication and controller quorum determine availability/failover; one broker is not the entire system.

### Kafka controller

The cluster component managing metadata and partition leadership. Modern Kafka uses a quorum-based controller architecture rather than legacy ZooKeeper mode; operational procedures are version-specific.

### Kafka topic

A named logical stream of records divided into partitions. Retention policy applies to the log; topic name alone does not imply one consumer or one queue.

### Kafka topic partition

An ordered append-only log shard with its own offsets and leader/replicas. A key maps records to a partition according to the partitioner, enabling per-partition order.

### Kafka record

A message-like record with key, value, headers, timestamp, and partition offset after append. The broker stores serialized bytes; schema compatibility is application-managed unless a separate registry is used.

### Kafka record key

An optional key commonly used for partition assignment and compaction identity. Changing partition count/partitioner can change key-to-partition mapping and ordering expectations.

### Kafka record value

The record payload bytes, possibly null for a tombstone in compacted topics. Serialization/schema evolution is client/application responsibility.

### Kafka record headers

Optional key/value metadata associated with a record. They can carry tracing/schema hints but should not hold unbounded or sensitive data casually.

### Kafka record timestamp

A timestamp associated with record creation or broker append depending on timestamp type/configuration. It is not automatically a globally ordered clock.

### Kafka producer

Client that batches and writes records to topic partitions. Configure acknowledgements, idempotence, retries, compression, and delivery timeout with the desired safety/latency tradeoff.

### Kafka consumer

Client that fetches records from partitions and manages processing/offset progress. Application code controls when processing is durable relative to committing offsets.

### Kafka partition offset

Position of a record within one partition’s log. Offsets are not contiguous business sequence numbers across a topic and may have gaps from compaction/transactions.

### Kafka log append

Appending a record to a partition’s leader log and replicating according to configuration. A successful client response depends on `acks` and ISR state.

### Kafka partition leader

Replica currently handling reads/writes for a partition. Leadership can move during failure/rebalance; clients refresh metadata.

### Kafka partition replica

A copy of a partition log on a broker. Followers fetch from leader; replication factor, ISR, and election policy determine safety/availability.

### Kafka replication factor

Number of configured replicas per partition. It is not itself a durability guarantee; acknowledgement, ISR, min ISR, and election rules matter.

### Kafka in-sync replica (ISR)

Replicas considered sufficiently caught up under Kafka’s rules. Producer acknowledgements and minimum ISR can require a safe replica set before accepting writes.

### Kafka producer acknowledgement setting (`acks`)

Controls which broker acknowledgement condition lets a produce request succeed (commonly none, leader, or all in supported client config). `all` means all current ISR, not every configured replica regardless of lag.

### Kafka idempotent producer

Uses producer identity/sequence semantics to prevent duplicate log appends caused by supported retries within its scope. It does not make consumer DB side effects exactly once.

### Kafka transactional producer

Writes records transactionally and can atomically commit output records with consumed offsets in Kafka. External database/API effects are outside that transaction unless separately coordinated.

### Kafka topic retention by time

Removes log segments older than the configured retention interval, regardless of consumer offset. Consumers that fall behind beyond retention may lose access to needed records.

### Kafka topic retention by size

Removes old segments to meet a size limit. Effective replay horizon varies with record rate and cluster storage.

### Kafka log compaction

Retains the latest record per key (subject to compaction timing and tombstones) rather than every historical value forever. It is not a complete event history guarantee.

### Kafka tombstone record

A record with a key and null value indicating deletion for compacted-topic semantics. Tombstones are themselves retained only for a configured period before compaction cleanup.

### Kafka record batch

A group of records produced/fetched together for efficiency and compression. Batching trades latency against throughput and size/resource limits.

### Kafka compression type

Producer/broker codec choice for record batches, affecting network, disk, and CPU. Consumer compatibility and deployment/client support matter.

### Kafka consumer group

A set of consumers that collaboratively consume topic partitions; each partition is assigned to one active group member at a time. Different groups read independently.

### Kafka group coordinator

Broker-side role managing group membership, heartbeats, and offset coordination. Failures/rebalances can pause or reassign processing.

### Kafka partition assignment

Mapping of topic partitions to consumers within a group. Assignment strategy and membership changes affect parallelism and processing pauses.

### Kafka consumer group rebalance

Reassignment after membership/metadata changes. In-flight work may repeat or pause; commit and processing design must tolerate it.

### Kafka committed offset

The group’s persisted next-progress position (client APIs often commit the next offset to consume). Commit timing defines delivery semantics and duplicate/loss windows.

### Kafka offset reset policy

Behavior when no valid committed offset exists or the stored offset is outside retained data, commonly earliest/latest or error. Choosing latest may skip prior records; define recovery expectations.

## Cross-item comparison

Kafka topic is partitioned log; RabbitMQ work queue is task delivery. Kafka consumer groups independently replay; offsets track progress without deleting records. Compaction/retention can still remove history. Replication factor works with ISR and `acks`.

## Examples

Use `accountId` as a record key to keep one account’s updates in one partition, then let a consumer group process partitions in parallel. Adding partitions may remap future key records, so assess ordering continuity during topology change.

## Common mistakes

- Assuming topic has one total order.
- Assuming `acks=all` means every configured replica acknowledged.
- Treating idempotent producer as end-to-end exactly-once.
- Assuming compacted topics preserve every event.
- Committing offsets before durable application effects without accepting loss risk.

## Knowledge checks with answers

1. **Where is ordering guaranteed?** Within a partition.
2. **What does a consumer group do?** Assigns partitions among members and tracks progress.
3. **What is an offset?** A position in one partition log.

### Exact terms covered

- `Apache Kafka broker`
- `Kafka cluster`
- `Kafka controller`
- `Kafka topic`
- `Kafka topic partition`
- `Kafka record`
- `Kafka record key`
- `Kafka record value`
- `Kafka record headers`
- `Kafka record timestamp`
- `Kafka producer`
- `Kafka consumer`
- `Kafka partition offset`
- `Kafka log append`
- `Kafka partition leader`
- `Kafka partition replica`
- `Kafka replication factor`
- `Kafka in-sync replica (ISR)`
- `Kafka producer acknowledgement setting (acks)`
- `Kafka idempotent producer`
- `Kafka transactional producer`
- `Kafka topic retention by time`
- `Kafka topic retention by size`
- `Kafka log compaction`
- `Kafka tombstone record`
- `Kafka record batch`
- `Kafka compression type`
- `Kafka consumer group`
- `Kafka group coordinator`
- `Kafka partition assignment`
- `Kafka consumer group rebalance`
- `Kafka committed offset`
- `Kafka offset reset policy`
