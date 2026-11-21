# queues pub sub RabbitMQ Kafka ordering and delivery semantics — Reference: Replication safety and choosing RabbitMQ queue or Kafka log semantics

Sources: RabbitMQ 4.4 [Queues](https://www.rabbitmq.com/docs/4.4/queues), [Quorum Queues](https://www.rabbitmq.com/docs/4.4/quorum-queues), [Streams](https://www.rabbitmq.com/docs/4.4/streams), [Federation](https://www.rabbitmq.com/docs/4.4/federation), and Apache Kafka 4.4 [Documentation](https://kafka.apache.org/44/documentation/), [Producer configuration](https://kafka.apache.org/44/configuration/producer-configs/), and [Processing semantics](https://kafka.apache.org/44/documentation/#semantics).

## Scope and version

This lesson compares product data structures and replication choices using RabbitMQ 4.4.1 (latest checked patch) and Kafka 4.4.0 documentation. RabbitMQ 4.4.1 is a maintenance release; its 4.4 series requires Erlang/OTP 27.0 or later. Exact defaults depend on queue/topic/client configuration. [RabbitMQ 4.4.1 release notes](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.4.1) [Kafka 4.4 release announcement](https://kafka.apache.org/blog/2026/10/22/apache-kafka-4.4.0-release-announcement/)

## How this group fits the mental model

Replication balances data safety, availability, latency, and resource cost. Select the queue/log semantics from routing, work distribution, replay, retention, and recovery requirements—not from product labels alone.

## Supplied names explained

### RabbitMQ classic queue replication status in RabbitMQ 4.4

Classic queue mirroring is removed starting RabbitMQ 4.0; classic queues are not the current replicated queue choice. Use quorum queues for replicated work-queue safety or streams for replicated repeatable-read logs as appropriate.

### RabbitMQ quorum replication with Raft

Quorum queues replicate through Raft consensus. A majority is needed for quorum decisions; losing quorum affects availability. More replicas increase resource and network cost.

### RabbitMQ quorum publisher-confirm quorum

Publisher confirms for quorum queues reflect the queue’s replicated handling semantics, generally requiring a quorum of replicas to accept the message. Exact durability still depends on persistence/configuration and failure conditions.

### RabbitMQ stream replication

RabbitMQ streams are replicated log-like structures with replica/leader behavior and repeatable reads. Configure replication and retention; they differ from destructive queue consumption.

### Kafka leader-follower replication

A partition leader serves writes while follower replicas fetch/copy data. Leadership can move; producer acknowledgement and election policy determine what acknowledged data survives.

### Kafka minimum in-sync replicas

Minimum ISR setting constrains writes with strong acknowledgements when too few replicas are caught up. It trades write availability for a durability threshold and must be coordinated with replication factor and `acks`.

### Unclean Kafka leader election tradeoff

Allowing an out-of-sync replica to become leader can restore availability but may lose records previously acknowledged by the old leader. Disabling it favors consistency/safety but can leave a partition unavailable.

### Durability versus availability

A system may reject writes when it cannot meet replication safety, preserving acknowledged data at the cost of availability. Relaxing safety can accept writes under degraded replicas with data-loss risk.

### Replication latency versus durability

Waiting for more replicas improves confidence in persistence but adds network/replication latency. Measure against SLO and failure model; “fast ack” can weaken recovery guarantees.

### RabbitMQ queue versus Kafka partitioned log

RabbitMQ queues route messages and commonly remove acknowledged work; Kafka partitions retain records by policy and consumers track offsets. RabbitMQ streams add replayable log semantics, so compare actual structure/requirements.

### RabbitMQ quorum queue versus RabbitMQ stream

Quorum queue is a replicated work queue with delivery/ack lifecycle and poison-message features. Stream is a retained replicated log for repeatable reads. Choose according to task distribution versus replay/retention needs.

### RabbitMQ work queue versus Kafka consumer group

Competing RabbitMQ consumers share deliveries from a queue. Kafka group members own partitions and track offsets while records remain retained. Kafka supports independent groups reading again; RabbitMQ queue can fan out via separate routed queues.

### Transient task delivery versus retained event replay

Task queues distribute work until handled/expired/dead-lettered; retained logs keep records for a configured period so consumers can re-read. Replay changes recovery and storage requirements.

### Independent replay by Kafka consumer group

Each consumer group tracks its own offsets and can read a retained topic independently. Retention/compaction may constrain how far it can rewind.

### RabbitMQ competing consumer versus Kafka partition ownership

RabbitMQ consumers compete for queue messages; Kafka assigns partitions to group members, preserving partition-level sequence. Scaling/ordering behavior differs, and the models should not be conflated.

### Broker recovery point objective

Maximum acceptable message/data loss during broker recovery, often described as a time window or record position. Replication, persistence, confirms, and backup/retention all affect it.

### Broker recovery time objective

Target time to restore broker service and consumer progress. Include leader election, cluster restart, consumer rebalances, catch-up, and validation.

### Message retention requirement

How long messages must remain available for processing, replay, audit, or recovery. Queue expiration and Kafka log retention have different semantics and must be configured intentionally.

### Fan-out scale requirement

Number and independence of consumers/subscribers. RabbitMQ can route to multiple queues; Kafka consumer groups read independently. Throughput, storage, and retention scale differently.

### Broker selection by replay and routing needs

Choose exchange/routing flexibility and work-queue lifecycle when that is primary; choose partitioned retained-log replay and independent groups when those are primary. RabbitMQ streams and Kafka both cover some log-like needs.

### RabbitMQ federation

Plugin-based transfer/route of messages between RabbitMQ brokers/clusters across network boundaries. It is not the same as intra-cluster quorum replication; latency, loop prevention, and delivery semantics differ.

### RabbitMQ federation versus intra-cluster replication

Federation connects independently operated broker environments over a network. Intra-cluster replication keeps replicas of one queue/stream coordinated for availability/data safety. Federation is not a substitute for quorum.

## Cross-item comparison

Replication factor/queue type interacts with acknowledgements and election policy. Queue vs log selection depends on whether handled work should disappear or remain replayable. Federation connects clusters; replication maintains copies within a cluster’s data structure.

## Examples

For reliable task dispatch, RabbitMQ quorum queue with manual ack and confirms may fit. For independent analytics, replay, and multiple consumer groups, Kafka topics may fit. If RabbitMQ clients already need retained repeatable reads, RabbitMQ streams may also fit. Compare tested recovery time and data loss rather than assuming one universal winner.

## Common mistakes

- Treating replication factor as a guarantee without producer/confirm settings.
- Choosing Kafka when a simple routed work queue is enough.
- Choosing a destructive queue when independent replay is required.
- Calling federation replication.
- Ignoring correlated failure domains and disk capacity.

## Knowledge checks with answers

1. **What is the key queue/log lifecycle difference?** Queue work is acknowledged/removed; log records remain by retention policy for replay.
2. **What does unclean election trade?** Availability for possible acknowledged-data loss.
3. **How does federation differ from quorum replication?** Cross-cluster message transfer versus in-cluster replicated data safety.

### Exact terms covered

- `RabbitMQ classic queue replication status in RabbitMQ 4.4`
- `RabbitMQ quorum replication with Raft`
- `RabbitMQ quorum publisher-confirm quorum`
- `RabbitMQ stream replication`
- `Kafka leader-follower replication`
- `Kafka minimum in-sync replicas`
- `Unclean Kafka leader election tradeoff`
- `Durability versus availability`
- `Replication latency versus durability`
- `RabbitMQ queue versus Kafka partitioned log`
- `RabbitMQ quorum queue versus RabbitMQ stream`
- `RabbitMQ work queue versus Kafka consumer group`
- `Transient task delivery versus retained event replay`
- `Independent replay by Kafka consumer group`
- `RabbitMQ competing consumer versus Kafka partition ownership`
- `Broker recovery point objective`
- `Broker recovery time objective`
- `Message retention requirement`
- `Fan-out scale requirement`
- `Broker selection by replay and routing needs`
- `RabbitMQ federation`
- `RabbitMQ federation versus intra-cluster replication`
