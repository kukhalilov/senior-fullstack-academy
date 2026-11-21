# queues pub sub RabbitMQ Kafka ordering and delivery semantics — Core concepts and how they fit together

Sources: RabbitMQ 4.4 [Queues](https://www.rabbitmq.com/docs/4.4/queues), [Quorum Queues](https://www.rabbitmq.com/docs/4.4/quorum-queues), [Confirms](https://www.rabbitmq.com/docs/4.4/confirms), [Streams](https://www.rabbitmq.com/docs/4.4/streams), and Apache Kafka 4.4 [Documentation](https://kafka.apache.org/44/documentation/), [Producer configuration](https://kafka.apache.org/44/configuration/producer-configs/), [Consumer configuration](https://kafka.apache.org/44/configuration/consumer-configs/), and [Processing semantics](https://kafka.apache.org/44/documentation/#semantics).

## Learning objectives

Trace publication, routing, persistence, delivery, processing, and acknowledgement; compare RabbitMQ and Kafka storage/consumption; state ordering scope; reason about duplicates and commit windows; and select durability/retention from recovery needs.

## Prerequisites

Know asynchronous messaging, producer/consumer roles, transactions, and idempotency. Product-specific APIs in application languages are outside this lesson.

## Core concepts

RabbitMQ’s AMQP 0-9-1 model routes through an exchange and bindings to queues. Direct, fanout, topic, and headers exchanges select destinations differently; mandatory publishing can reveal that no queue was routed. A queue is ordered, but observed order can change with priorities, multiple consumers, requeue, and redelivery. A RabbitMQ stream supports retained, repeatable reads; it is not the same lifecycle as a work queue. Quorum queues use Raft replication and provide safety features; classic mirroring was removed in RabbitMQ 4.0.

Kafka producers append records to topic partitions. A key influences partition assignment and therefore per-key ordering when partitioning is stable. A consumer group assigns partitions among members; a partition is consumed by at most one active member in that group at a time. Separate groups read independently. Offsets identify positions; retention/time/size or compaction determines what remains. Kafka ordering is per partition, not across the whole topic.

Publisher confirms and consumer acknowledgements are separate RabbitMQ signals. A confirm reports broker handling of a publish within configured semantics; it does not mean a consumer processed the message. Manual consumer ack after processing supports at-least-once but crash windows can redeliver. Auto-ack can lose work if the consumer fails after delivery. Kafka producer `acks` controls broker acknowledgement; consumer offset commit controls progress. Commit offset before processing risks loss; after processing risks duplication.

At-most-once avoids redelivery but permits loss. At-least-once retries until accepted/acknowledged and permits duplicates. Exactly-once processing must name its boundary: Kafka transactions can atomically coordinate Kafka output and consumed offsets within Kafka’s model, but arbitrary external database/API side effects require their own idempotency/outbox/transaction strategy. Acknowledge only after durable processing, and make handler effects idempotent where possible.

Durability depends on queue/topic configuration, persistence, replication, confirm/ack policy, and failure model. Replication factor alone does not determine safety: Kafka ISR, minimum ISR, producer acks, and unclean leader election interact. Quorum queues commit through Raft quorum. Retention supports replay but increases storage and privacy obligations. Test broker/node/zone failure under expected load.

## Mechanisms and relationships

```text
RabbitMQ: publish → exchange route → queue/stream → delivery → ack/nack
Kafka: produce → partition append → group reads offset → process → commit offset
confirm ≠ consumer ack; producer ack ≠ consumer offset commit
at-least-once → duplicates; idempotency handles effect repetition
```

## Worked examples

For a Kafka consumer writing to an external SQL database, commit the offset after the database transaction; a crash between them can reprocess the record, so use a unique event ID and a database uniqueness/dedup transaction. In RabbitMQ, manual-ack after the same database commit has an analogous duplicate window. Neither broker makes the external write atomic by itself.

## Misconceptions and edge cases

- “RabbitMQ is a queue, Kafka is pub-sub” is too simple: RabbitMQ has streams; Kafka consumer groups provide fan-out.
- RabbitMQ FIFO insertion does not ensure global consumer completion order.
- Kafka only guarantees ordering inside a partition.
- Publisher confirms do not prove consumer effects.
- Broker exactly-once does not include arbitrary external systems.
- Durable metadata and persistent messages are distinct settings.

## Knowledge checks with answers

1. **What determines Kafka ordering?** Records within a partition.
2. **What window causes duplicates after DB commit?** Crash before ack/offset commit.
3. **What does a RabbitMQ publisher confirm mean?** Broker-level publish handling, not downstream processing.
4. **What makes “exactly once” meaningful?** A named transaction/effect boundary and its guarantees.
