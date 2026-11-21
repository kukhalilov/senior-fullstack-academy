# queues pub sub RabbitMQ Kafka ordering and delivery semantics — Big-picture orientation and mental model

Sources: RabbitMQ 4.4 [Exchanges](https://www.rabbitmq.com/docs/4.4/exchanges), [Queues](https://www.rabbitmq.com/docs/4.4/queues), [Quorum Queues](https://www.rabbitmq.com/docs/4.4/quorum-queues), [Streams](https://www.rabbitmq.com/docs/4.4/streams), [Consumers](https://www.rabbitmq.com/docs/4.4/consumers), [Confirms](https://www.rabbitmq.com/docs/4.4/confirms), [Dead Lettering](https://www.rabbitmq.com/docs/4.4/dlx), [current release information](https://www.rabbitmq.com/release-information), [RabbitMQ 4.4.1 release notes](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.4.1), and Apache Kafka 4.4 [Documentation](https://kafka.apache.org/44/documentation/), [Producer configuration](https://kafka.apache.org/44/configuration/producer-configs/), and [Consumer configuration](https://kafka.apache.org/44/configuration/consumer-configs/).

## Problem and purpose

Messaging brokers decouple message producers from consumers, but RabbitMQ and Kafka organize routing, storage, acknowledgement, replay, and ordering differently. Product names like “queue,” “topic,” and “exactly once” are not substitutes for reading the actual guarantees.

## Plain-language mental model

RabbitMQ receives a publication at an exchange, routes it through bindings to queues/streams, and delivers it to consumers who acknowledge work. Kafka appends records to topic partitions; consumer groups independently track offsets and can replay retained records. Both require the application to define idempotency, retries, and side-effect boundaries.

## How the parts fit together

```text
RabbitMQ publisher → exchange + routing/binding → queue/stream → consumer ack
Kafka producer → topic partition log → consumer group/offset → processing/commit
publisher accepted ≠ consumer processed ≠ external side effect committed
```

RabbitMQ queues are work-delivery collections; quorum queues and streams provide replicated data structures with different behaviors. Kafka is a retained partitioned log. Ordering is scoped: RabbitMQ can reorder observed delivery under priorities, requeue, redelivery, and multiple consumers; Kafka orders records within a partition.

## Concept map

Delivery is a chain: publisher acceptance/confirmation, broker persistence/replication, consumer delivery, business processing, and acknowledgement/offset commit. At-least-once permits duplicates; at-most-once can lose work. Kafka transactions can scope exactly-once processing across Kafka records/offsets, not arbitrary external effects. RabbitMQ publisher confirms do not confirm consumer completion; consumer ack does not atomically commit a database side effect.

## End-to-end walkthrough

A producer publishes an order-created message. In RabbitMQ it selects an exchange/routing key; a durable quorum queue may replicate it, and a consumer manually acknowledges only after its database transaction. A crash after DB commit but before ack can redeliver, so the consumer deduplicates by message ID. In Kafka, the producer writes a keyed record to a partition; the consumer group processes it and commits an offset. Commit-before-processing risks loss; commit-after-processing risks duplicate processing. Idempotency or a transactional boundary handles the window.

## When to use it and tradeoffs

RabbitMQ fits routed task queues and flexible exchange/binding patterns; Kafka fits retained partitioned logs, independent consumer groups, and replay. RabbitMQ streams also provide retained/repeatable reads; Kafka is not the only log-like option. Replication increases safety but costs latency, disk, and operational complexity. Choose from routing, replay, fan-out, ordering, and recovery requirements.

## What later lessons cover

References detail routing, queue types/lifecycle, Kafka log/partitions, delivery/ack windows, ordering/throughput, and replication/product selection. Generic retry and outbox patterns are separate topics.

## Version notes

RabbitMQ 4.4.1 is the latest patch checked on November 20, 2026; it is a maintenance release dated November 16, and the 4.4 series requires Erlang/OTP 27.0 or later. RabbitMQ 4.4.0 introduced quorum-queue delayed messages and other queue/stream improvements; 4.4.1 includes fixes and tighter limits/validation, including capped quorum-queue message expiration and bounded management polling-consumer results. Classic mirroring was removed in RabbitMQ 4.0; transient non-exclusive classic queues were deprecated/disabled by default beginning in 4.3. Kafka 4.4.0 is the latest release in the checked official downloads/docs; notable additions include dead-letter queue support for Kafka share groups (when the share feature is upgraded) and opt-in transactional Kafka Streams state stores. Client defaults remain version-specific. [RabbitMQ 4.4.1 release notes](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.4.1) [Kafka 4.4 release announcement](https://kafka.apache.org/blog/2026/10/22/apache-kafka-4.4.0-release-announcement/)
