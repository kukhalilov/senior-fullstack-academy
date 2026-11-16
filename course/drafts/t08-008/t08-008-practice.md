# queues pub sub RabbitMQ Kafka ordering and delivery semantics — Exercises and worked solutions

Sources: RabbitMQ 4.4 [Queues](https://www.rabbitmq.com/docs/4.4/queues), [Quorum Queues](https://www.rabbitmq.com/docs/4.4/quorum-queues), [Confirms](https://www.rabbitmq.com/docs/4.4/confirms), and Apache Kafka 4.4 [Documentation](https://kafka.apache.org/44/documentation/), [Processing semantics](https://kafka.apache.org/44/documentation/#semantics).

## Goals

Choose queue/log semantics, trace the acknowledgement chain, preserve ordering where needed, and design for duplicate/failure windows.

## Worked example

A payment event must feed billing and analytics independently. Use a retained topic with separate consumer groups if replay and independent progress are requirements; key by account when per-account order matters. Each group must track offsets and handle duplicates. If the task is transient work routed to one worker among many, a RabbitMQ quorum queue may fit better. Neither guarantees an external database/payment effect atomically.

## Exercises

### Exercise 1: RabbitMQ fan-out or work sharing?

Three consumers need every invoice-created event independently. What topology gives that, and why is one shared queue insufficient?

#### Worked solution

Route to three separate queues (for example through a fanout/topic exchange), one per independent consumer, so each queue receives its own copy. Three consumers on one queue are competing workers and divide deliveries; they do not each receive every message.

### Exercise 2: Choose RabbitMQ queue type

A task must be replicated for high availability, acknowledged after processing, and not replayed by multiple independent readers. Which RabbitMQ structure is a likely fit?

#### Worked solution

A quorum queue is designed as a replicated reliable work queue. Use manual ack after durable work, publisher confirms, and bounded retry/dead-letter policy. If repeatable reads/replay are the primary need, compare RabbitMQ streams instead.

### Exercise 3: Kafka ordering

Events for a given account must preserve order while unrelated accounts process concurrently. How would you partition and what limitation remains?

#### Worked solution

Key records by account ID so records for one account map to one partition. The partition preserves append order; different partitions process in parallel. There is no total order across all accounts, and changing partition count/partitioning may remap future records.

### Exercise 4: Duplicate database effect

A consumer commits a database update, then crashes before RabbitMQ ack/Kafka offset commit. What happens and how should the effect be protected?

#### Worked solution

The broker can redeliver/replay the message, so the update may execute again. Use a stable deduplication key and atomically record it with the database effect, or design an idempotent upsert. The broker’s progress signal cannot atomically include an unrelated database transaction.

### Exercise 5: Is “exactly once” valid?

A Kafka consumer transactionally writes output Kafka records and offsets, then calls an external payment API. Does Kafka exactly-once include the payment?

#### Worked solution

No. The Kafka transaction covers Kafka records/offsets in its defined scope. The API call is outside it and can be repeated or uncertain. Use a business idempotency key and a reliable workflow/outbox or payment provider idempotency support.

### Exercise 6: RabbitMQ FIFO claim

A queue contains A then B. Two consumers receive them; B finishes first. Did RabbitMQ violate FIFO?

#### Worked solution

Not necessarily. Enqueue/delivery order can be FIFO while concurrent processing completion is out of order. Requeue, redelivery, and priorities can also change observed delivery. Define whether the requirement concerns enqueue, receive, or completed side-effect order.

### Exercise 7: Kafka retention and consumer lag

A consumer is offline longer than topic retention. Can it resume at its previous committed offset?

#### Worked solution

The record may have been removed; offset reset policy then determines behavior, which could start at earliest retained or latest and miss data. Size retention for recovery, monitor lag age, and ensure offsets remain within the replay horizon.

## Progressive hints

Distinguish routing fan-out from competing work. Mark each append, delivery, side effect, ack/commit, and crash window. State the ordering scope and retention horizon.

## Complete solutions

Each exercise gives one design. Verify exact behavior with the selected RabbitMQ/Kafka version, queue/topic settings, and client library.

## Tests and edge cases

Test broker restart, replica loss, unroutable publish, lost confirm, consumer crash before/after side effect, duplicate delivery, requeue, poison message, partition rebalance, retention expiry, hot key, unclean leader election configuration, and failover at peak load.

## Reflection questions

Which guarantee is broker-level and which is application-level? Does the system need a work queue, a retained log, or independent fan-out? Which failure case most threatens business correctness?
