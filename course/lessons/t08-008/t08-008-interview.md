# queues pub sub RabbitMQ Kafka ordering and delivery semantics — Interview questions and reasoning

Sources: RabbitMQ 4.4 [Exchanges](https://www.rabbitmq.com/docs/4.4/exchanges), [Queues](https://www.rabbitmq.com/docs/4.4/queues), [Quorum Queues](https://www.rabbitmq.com/docs/4.4/quorum-queues), [Confirms](https://www.rabbitmq.com/docs/4.4/confirms), and Apache Kafka 4.4 [Documentation](https://kafka.apache.org/44/documentation/), [Processing semantics](https://kafka.apache.org/44/documentation/#semantics).

## Core questions

Explain each product’s topology, persistence, ordering, and progress model. Identify the exact acknowledgement boundary and external side-effect window.

## Concise interview answers

RabbitMQ routes publications through exchanges/bindings into queues or streams; consumers acknowledge work. Kafka appends records to partitioned topic logs; groups track offsets and can independently replay retained records. RabbitMQ queue ordering can be altered by competing consumers, requeue, redelivery, and priority; Kafka guarantees order per partition. At-least-once permits duplicates; exactly-once claims are bounded.

## Deep follow-up answers

### Publisher confirm versus consumer acknowledgement?

A RabbitMQ publisher confirm reports broker handling of a publication. A consumer acknowledgement reports that a delivery was processed/handled according to the consumer. They are separate directions and neither proves the entire end-to-end effect.

### How do Kafka offsets affect delivery semantics?

Commit before processing can lose work after a crash; commit after processing can cause duplicates if a crash occurs before the commit. Idempotent processing or a Kafka transaction handles only a defined boundary.

### What does Kafka exactly-once cover?

Kafka transactions can atomically write Kafka output records and consumed offsets within Kafka’s transaction model. They do not automatically include arbitrary external database or HTTP effects.

### Compare RabbitMQ queue and Kafka partitioned log.

RabbitMQ queues route and distribute work, usually removing acknowledged messages. Kafka partitions retain records under policy while groups track positions and replay. RabbitMQ streams provide a retained-log alternative for some needs.

### How do you preserve ordering?

Define the required scope. In Kafka, key related records to one partition; there is no global total order across partitions. In RabbitMQ, limit concurrency and avoid priority/requeue effects where strict serial completion matters, or use a stream with offset processing. Application-side parallelism can still reorder effects.

### Why isn’t a publisher retry always harmless?

The publisher may lose connection after broker acceptance but before observing confirmation. Retry can publish a duplicate. Stable IDs/idempotent consumers and confirm/return handling address uncertainty.

## Scenario questions

### Fan-out to billing and analytics

Use separate routed queues or independent Kafka consumer groups so progress and failures do not interfere. Define retention, replay, schema evolution, and per-consumer idempotency.

### Slow consumer causes backlog

Measure queue depth or Kafka lag/age, locate downstream bottleneck, bound in-flight/prefetch, scale only within partition/ordering constraints, and shed or pause production if necessary. Confirm retention will not expire required history.

### RabbitMQ cluster loses quorum

Quorum queues may reject/unavailable writes without a majority to protect replicated safety. Recovery expectations must prioritize the configured safety/availability tradeoff, then restore quorum and verify consumer progress.

## Tradeoffs and alternatives

RabbitMQ offers flexible routing and work queues; Kafka offers retained partition logs and independent group replay; RabbitMQ streams offer repeatable reads within RabbitMQ. Replication/safety increases latency and resource costs. A local database/outbox can be simpler when asynchronous decoupling is not needed.

## Common weak answers

- “RabbitMQ is FIFO so completion order is guaranteed.”
- “Kafka has exactly-once delivery.”
- “A publisher confirm means the consumer completed the work.”
- “Kafka topic partitions have one global order.”
- “Persistent messages are safe regardless of queue/replication settings.”

## Self-check rubric

State topology, retention, ordering scope, replication/ack policy, duplicate windows, idempotency, and recovery process. Be precise about which actor confirms which stage.

## Senior-level signals

Accounts for RabbitMQ 4.x changes, quorum vs stream semantics, Kafka ISR/acks/unclean election, commit ordering, replay horizons, hot partitions, poison handling, and explicit broker RTO/RPO tests.
