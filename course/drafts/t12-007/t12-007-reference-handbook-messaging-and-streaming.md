# system design technology landscape and selection — Reference: Messaging and streaming

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [Kafka design](https://kafka.apache.org/design/), [RabbitMQ reliability](https://www.rabbitmq.com/docs/reliability), [NATS Core](https://docs.nats.io/using-nats/developer), [NATS JetStream](https://docs.nats.io/nats-concepts/jetstream), [Amazon SQS FAQ](https://aws.amazon.com/sqs/faqs/), [SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html), [Kinesis retention](https://docs.aws.amazon.com/streams/latest/dev/kinesis-extended-retention.html), [Pulsar messaging](https://pulsar.apache.org/docs/4.0.x/concepts-messaging/).

## Scope and version

The named systems cover brokered work queues, transient publish/subscribe, and retained partitioned logs. Their delivery, ordering, storage, and operational guarantees differ by mode, configuration, and service plan. Consult current product documentation for limits and supported features.

## How this group fits the mental model

Messaging decouples a producer from a consumer in time and often in deployment. First decide whether the work is a command that should be handled, an event other consumers may replay, or a transient notification. Then specify the contract: who owns the message, how long it remains available, what ordering is required, what an acknowledgement means, how retries and poison messages work, and how duplicates are made safe.

A queue generally distributes work among consumers and removes or marks a message after successful handling. A retained event log stores ordered records by partition so consumers can keep independent positions and replay while retention allows. Pub/sub can be transient or durable depending on the product mode. “Exactly once” is never a safe generic promise for the whole business effect: processing, broker delivery, and an external database/API write have separate failure boundaries.

## Supplied names explained

- **Kafka** — A distributed partitioned event log and streaming platform. Ordering is within a partition, so key selection determines which related events share an order. Consumer groups distribute partitions among consumers, and offsets allow progress tracking and replay within retention. Kafka also has newer share-group consumption modes, so do not reduce every consumption pattern to exclusive partition ownership. Idempotent/transactional features have defined scopes; external side effects still need their own coordination.
- **RabbitMQ** — A broker with exchanges, queues, bindings, routing, acknowledgements, and publisher confirms. Manual consumer acknowledgement helps avoid losing work before handling completes; publisher confirms help a producer learn about broker acceptance. Redelivery can duplicate work, so handlers should be idempotent. Routing flexibility and queue semantics are useful when work distribution matters more than long-term independent log replay.
- **NATS** — A messaging system with distinct modes. Core NATS provides lightweight subject-based pub/sub and queue groups, but is best treated as transient, at-most-once delivery. JetStream adds persistence, streams, durable consumers, acknowledgements, retention, and replay; its delivery semantics and limits depend on configuration. Do not attribute JetStream guarantees to Core NATS.
- **SQS** — A managed AWS queue. Standard queues prioritize scale and offer at-least-once delivery with best-effort ordering; duplicates and reordering are possible. FIFO queues provide stronger ordering within message groups and deduplication behavior subject to the service contract and deduplication window. Visibility timeout temporarily hides a received message, but does not prove that a handler completed exactly once.
- **Kinesis** — A managed AWS streaming service organized around shards and ordered records within a shard. Consumers track positions and process retained data; throughput, shard layout, retention, consumer mode, and costs are important design inputs. AWS currently documents configurable retention beyond the default, with a product maximum; verify current limits before capacity planning.
- **Pulsar** — A distributed messaging and streaming platform with persistent topics, subscriptions, and subscription types that govern how consumers share or independently receive messages. Persistent subscriptions retain messages according to backlog/retention and acknowledgement behavior; unacknowledged messages can be redelivered. Its architecture separates brokers from durable storage through BookKeeper, which changes the operational and scaling model compared with a broker that owns both roles.

## Cross-item comparison

| Need | Plausible fit | Design questions |
|---|---|---|
| Route tasks to workers with acknowledgements and flexible routing | RabbitMQ or SQS | What is the retry/DLQ policy? Is ordering needed? Who operates the broker? |
| Retain an event history for independent consumers and replay | Kafka, Pulsar, Kinesis, or NATS JetStream | How long is retention? What partitions/shards define order and scale? How are offsets/checkpoints managed? |
| Lightweight transient service notifications | Core NATS | Can consumers tolerate missed messages during disconnects? If not, what durable mode is needed? |
| Managed queue with minimal broker operations | SQS | Is provider lock-in acceptable? Standard or FIFO? What are quota, visibility, and cost constraints? |
| Stream processing with AWS-native integration | Kinesis | What shard/consumer capacity and retention are needed? How is resharding handled? |

The table identifies candidates, not a universal ranking. A queue and a log can both move messages but express different ownership and replay models.

## Reliability contract to design

For every consumer boundary, define: acknowledgement timing; retry limit and backoff; poison-message handling; deduplication key and retention horizon; idempotent effect strategy; message schema evolution; ordering scope; maximum payload and backlog; consumer lag alert; replay procedure; and what happens when downstream storage is unavailable. Use an outbox or equivalent atomic handoff when a database commit and event publication must not diverge. A broker acknowledgement does not atomically commit an unrelated business database transaction.

## Examples

An order service commits an order and must trigger fulfillment and analytics. It writes the order and an outbox row in one database transaction. A publisher forwards outbox events to a retained log partitioned by order ID. Fulfillment consumes with a durable position and stores the event ID alongside its effect so replay does not create a second shipment. Analytics has its own consumer position and can rebuild derived views from retained history. If the need were only a pool of short-lived email tasks, an acknowledged queue could be simpler; replaying an entire event history would not be necessary.

## Common mistakes

- Calling queue delivery “exactly once” while ignoring crashes between the side effect and acknowledgement.
- Assuming a partitioned log gives global ordering; order is scoped to a partition/key.
- Treating Core NATS and JetStream as the same durability model.
- Assuming SQS visibility timeout prevents every duplicate or that standard queues preserve order.
- Choosing partitions/shards without considering hot keys, skew, consumer parallelism, and ordering requirements.
- Ignoring retention, replay cost, poison messages, schema compatibility, and consumer lag.

## Knowledge checks with answers

1. **Why can a message be processed twice after an acknowledgement-based flow?** The consumer may perform its effect and fail before acknowledgement is durably recorded; redelivery is then correct broker behavior.
2. **Where does Kafka ordering apply?** Within a partition. A key can route related records together, at the cost of possible hot partitions.
3. **When should Core NATS be replaced with JetStream or another durable mode?** When consumers must recover missed messages, acknowledge durable processing, or replay stored history.
4. **Does a broker’s exactly-once feature guarantee exactly-once payment or database effects?** No. The external effect must participate in a supported transaction or be made idempotent and reconciled.
