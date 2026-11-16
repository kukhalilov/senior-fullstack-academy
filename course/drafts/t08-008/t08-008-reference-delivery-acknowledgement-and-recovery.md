# queues pub sub RabbitMQ Kafka ordering and delivery semantics — Reference: Publisher acceptance, delivery acknowledgement, retry, and duplicate boundaries

Sources: RabbitMQ 4.4 [Confirms](https://www.rabbitmq.com/docs/4.4/confirms), [Consumers](https://www.rabbitmq.com/docs/4.4/consumers), and [Dead Lettering](https://www.rabbitmq.com/docs/4.4/dlx), and Apache Kafka 4.4 [Processing semantics](https://kafka.apache.org/44/documentation/#semantics), [Producer configuration](https://kafka.apache.org/44/configuration/producer-configs/), and [Consumer configuration](https://kafka.apache.org/44/configuration/consumer-configs/).

## Scope and version

Delivery semantics are end-to-end boundaries. Broker/client guarantees do not automatically include arbitrary database/API effects.

## How this group fits the mental model

Publisher acceptance, broker storage, delivery, application processing, and acknowledgement/offset commit are separate events. Place each durable boundary deliberately and make retries safe.

## Supplied names explained

### RabbitMQ publisher confirm

Broker signal about the handling of a published message under the queue/exchange and replication setup. It does not prove routing succeeded unless return/unroutable handling is also observed, nor that a consumer processed it.

### RabbitMQ consumer delivery acknowledgement

Consumer signal that a delivery has been handled and may be removed from queue work. If sent before durable processing, failure can lose work; after processing, a crash before ack can cause redelivery.

### RabbitMQ `basic.ack`

Acknowledges one or multiple delivery tags when configured. Multiple acknowledgements can cover prior outstanding deliveries on that channel; use only when all included deliveries completed successfully.

### RabbitMQ `basic.nack`

Negative acknowledgement that can reject one/multiple deliveries and optionally requeue. Requeue policy can cause loops and alter ordering.

### RabbitMQ `basic.reject`

Rejects one delivery, optionally requeueing it. For batch rejection behavior use the appropriate nack semantics.

### RabbitMQ automatic acknowledgement

Broker considers a delivery handled when sent to the consumer, without waiting for application processing. This is at-most-once-like and can lose work on consumer failure.

### RabbitMQ manual acknowledgement

Consumer explicitly acknowledges/rejects after processing. It supports redelivery on failure, normally at-least-once, so duplicates are expected.

### RabbitMQ multi-message acknowledgement

An ack/nack can cover all delivery tags up to a specified tag on the channel. Only use when every covered delivery has a consistent completion result.

### Publisher confirm versus consumer acknowledgement

Publisher confirm is producer-to-broker; consumer ack is consumer-to-broker after delivery. Neither signal crosses the entire chain to prove the other party’s work.

### Kafka producer acknowledgement

Broker response to a produce request according to the configured `acks` and ISR state. It says nothing about downstream consumer processing.

### Kafka consumer offset commit

Persisted progress for a consumer group/partition. Commit represents a position, and its timing relative to application effects determines loss/duplicate windows.

### Automatic Kafka offset commit

Client periodically commits offsets based on fetched/processed position according to client configuration. If processing is asynchronous or slower than fetching, it can commit too early and lose work on crash.

### Manual Kafka offset commit

Application controls when progress is committed. Commit after durable handling for at-least-once behavior, then tolerate duplicate processing if crash occurs before commit.

### Commit-before-processing failure window

If progress commits before the effect is durable, a crash can skip the unprocessed record on restart, causing loss.

### Commit-after-processing duplicate window

If the effect commits but progress does not, a crash can replay the record and repeat the effect. Idempotency/deduplication makes this safe.

### At-most-once delivery

Process/advance before durable confirmation or use auto-ack such that a failure may lose work, while duplicates are minimized. Choose only when loss is acceptable.

### At-least-once delivery

Retry/re-deliver until acknowledged/committed, allowing duplicates. This is common for durable work; consumer effects need idempotency or deduplication.

### Exactly-once processing scope

An exactly-once claim is valid only within a defined transactional boundary. Kafka transactions can coordinate Kafka input offsets and output records, but external SQL/API effects need separate coordination. End-to-end arbitrary exactly-once is not implied.

### Idempotent message handler

Repeating the same message has no additional unintended effect. Use a stable message/event ID and store deduplication state atomically with the business effect where possible.

### Message deduplication key

A stable unique identity used to detect already-applied messages. Scope, retention, collision risk, and transaction with side effects must be defined.

### Duplicate delivery

The same logical message is delivered more than once due to redelivery, retry, uncertain confirmation, or reprocessing. It is normal under at-least-once designs.

### Redelivery

Broker sends a delivery again after missing acknowledgement, requeue, or consumer failure. It cannot know whether the previous application partially completed an external effect.

### Poison message

A message repeatedly fails because of malformed content or deterministic handler error. Bound retries and route/record it for investigation rather than blocking a partition/queue indefinitely.

### Dead-letter queue

A queue used to isolate messages rejected/expired/overflowed under configured routing. Its durability, access, alerting, redrive, and loop prevention need explicit policies.

### Retry queue

A delayed/bounded queue or mechanism for retrying failed work. Define backoff, attempt count, ordering impact, and dead-letter destination; immediate requeue can hot-loop.

### Consumer failure recovery

Reconnection/rebalance/requeue and replay behavior after crash. Ensure checkpoints and application effects tolerate repeats, and monitor recovery time/lag.

### Publisher retry after uncertain confirmation

If connection fails before confirm, publisher may not know whether broker accepted the message. Retrying may duplicate it; use stable IDs/idempotent consumers and publisher confirms/returns.

### End-to-end side-effect atomicity limit

Broker ack/offset and an unrelated database/API transaction are not automatically atomic together. Use outbox/inbox, idempotency, or a supported distributed transaction boundary for required guarantees.

## Cross-item comparison

RabbitMQ confirm and Kafka producer ack cover publish-to-broker. RabbitMQ consumer ack and Kafka offset commit cover delivery progress. At-most-once accepts loss; at-least-once accepts duplicates. Exactly-once must name the bounded transaction.

## Examples

Consumer begins a SQL transaction, inserts `ProcessedMessage(id)` if absent, applies order update, commits, then acknowledges/commits offset. A duplicate ID becomes a no-op. If the message triggers an external payment API, the database transaction alone cannot atomically include that API.

## Common mistakes

- Acknowledging before processing because the message was received.
- Assuming publish confirm means it reached a queue/consumer.
- Treating a timeout as proof publish did not happen.
- Claiming exactly-once while calling an external side effect outside the broker transaction.
- Letting poison messages retry forever.

## Knowledge checks with answers

1. **Where is a common duplicate window?** Effect committed, ack/offset not yet committed.
2. **What should at-least-once consumers assume?** Duplicate delivery can happen.
3. **What does exactly-once need?** A clearly defined atomic boundary and supported transactional semantics.

### Exact terms covered

- `RabbitMQ publisher confirm`
- `RabbitMQ consumer delivery acknowledgement`
- `RabbitMQ basic.ack`
- `RabbitMQ basic.nack`
- `RabbitMQ basic.reject`
- `RabbitMQ automatic acknowledgement`
- `RabbitMQ manual acknowledgement`
- `RabbitMQ multi-message acknowledgement`
- `Publisher confirm versus consumer acknowledgement`
- `Kafka producer acknowledgement`
- `Kafka consumer offset commit`
- `Automatic Kafka offset commit`
- `Manual Kafka offset commit`
- `Commit-before-processing failure window`
- `Commit-after-processing duplicate window`
- `At-most-once delivery`
- `At-least-once delivery`
- `Exactly-once processing scope`
- `Idempotent message handler`
- `Message deduplication key`
- `Duplicate delivery`
- `Redelivery`
- `Poison message`
- `Dead-letter queue`
- `Retry queue`
- `Consumer failure recovery`
- `Publisher retry after uncertain confirmation`
- `End-to-end side-effect atomicity limit`
