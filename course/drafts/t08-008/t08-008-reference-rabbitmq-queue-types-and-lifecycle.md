# queues pub sub RabbitMQ Kafka ordering and delivery semantics — Reference: RabbitMQ queue types, properties, and consumer lifecycle

Sources: RabbitMQ 4.4 [Queues](https://www.rabbitmq.com/docs/4.4/queues), [Quorum Queues](https://www.rabbitmq.com/docs/4.4/quorum-queues), [Streams](https://www.rabbitmq.com/docs/4.4/streams), [Consumers](https://www.rabbitmq.com/docs/4.4/consumers), and [Dead Lettering](https://www.rabbitmq.com/docs/4.4/dlx).

## Scope and version

RabbitMQ 4.4.1 is the latest checked 4.4 patch (2026-11-20); the 4.4 series requires Erlang/OTP 27.0 or later. Classic mirroring was removed in 4.0; transient non-exclusive classic queues are deprecated/disabled by default beginning with 4.3.0 according to current queue docs. Upgrade compatibility is version-sensitive. [RabbitMQ 4.4.1 release notes](https://github.com/rabbitmq/rabbitmq-server/releases/tag/v4.4.1)

## How this group fits the mental model

Queue type determines storage, replication, replay, and delivery behavior. Queue metadata durability, message persistence, acknowledgement, and retention are separate dimensions.

## Supplied names explained

### RabbitMQ classic queue

A traditional queue type, typically non-replicated across nodes. Current docs describe transient non-exclusive classic queues as deprecated/disabled by default beginning RabbitMQ 4.3.0; assess migration before upgrade.

### RabbitMQ quorum queue

A durable replicated queue based on Raft, recommended for replicated/high-availability work queues. It offers specific poison-message and dead-letter behavior; quorum writes need a majority and cost resources/latency.

### RabbitMQ stream

A replicated append-only log-like data structure supporting repeatable reads by offset. It suits replay/retention use cases; it is not a drop-in queue with identical destructive delivery semantics.

### RabbitMQ super stream

A partitioned stream abstraction composed of multiple streams to scale throughput/retention patterns. Partition key/ordering and client behavior must be designed explicitly.

### Durable queue metadata

Queue declaration/configuration is intended to survive broker restart. Durability alone does not make every message persistent or guarantee replica-level safety.

### Transient queue metadata

Queue metadata is not intended to survive restart. It suits ephemeral lifecycles but can disappear with broker restart.

### Persistent message delivery mode

Marks a message for persistent storage behavior, subject to queue type, confirm, replication, and broker configuration. It is distinct from durable queue declaration.

### Transient message delivery mode

Allows a message to use transient/nonpersistent handling where supported. It may be lost on restart and should not be chosen for work requiring durable recovery.

### Queue durability versus message persistence

A durable queue can restart empty if messages were transient; persistent messages sent to a transient queue do not create a durable queue lifecycle. Configure both according to the recovery objective.

### Temporary queue

A short-lived queue often created for reply or ephemeral consumer use. Name generation, exclusivity, auto-delete, and cleanup semantics need clarity.

### Exclusive queue

A queue accessible by the declaring connection and deleted when that connection ends. It supports connection-scoped temporary work but is not resilient to that connection loss.

### Auto-delete queue

A queue deleted after its last consumer is gone, subject to declaration/lifecycle conditions. It is not synonymous with “delete whenever no consumer is attached at any moment.”

### Server-generated queue name

The broker assigns a name, useful for temporary reply queues. Publish/consume coordination must discover and communicate the generated name safely.

### Queue declaration and property equivalence

Redeclaring an existing queue must match its properties or the broker can close the channel with a precondition failure. Policies and optional arguments have different precedence/immutability details; plan migrations.

### Queue optional arguments (`x-arguments`)

Declaration-time arguments configure features such as TTL, queue type, or dead-lettering. Some are immutable or take precedence over policies; avoid hard-coding values when policy management is preferred.

### RabbitMQ policy

A broker-side configuration rule applied to matching queues, often allowing operational settings to change without redeclaration. Understand policy precedence and which arguments cannot be changed dynamically.

### Queue Time-To-Live (TTL)

Queue expiration setting for how long a queue can remain unused before deletion under defined conditions. It is distinct from message TTL.

### Message TTL

Limits how long a message remains eligible in a queue. Expired messages may be removed or dead-lettered depending on configuration; TTL does not guarantee an exact execution deadline.

### Queue length limit

Caps queue size by message count or bytes according to configuration. Overflow behavior (drop/reject/dead-letter) affects loss guarantees and must be tested.

### Queue priority

Allows messages with higher configured priority to be delivered ahead of lower-priority messages in supported queue types. It can disrupt FIFO observation and create starvation.

### Single Active Consumer

Allows one registered consumer to receive deliveries at a time, with another taking over on failure/cancellation. It can preserve serial processing better but does not alone guarantee ordered completion across requeue/redelivery.

### Consumer prefetch

Limits unacknowledged deliveries in flight per consumer/channel according to configuration. It provides backpressure and affects fairness, throughput, memory, and redelivery bursts.

### Consumer acknowledgement timeout

A limit for how long a delivery can remain unacknowledged before broker action/consumer closure depending on queue and configuration. It protects stuck work but must exceed legitimate processing time or support heartbeats/progress design.

### RabbitMQ consumer cancellation

Stops a consumer subscription; outstanding deliveries and subsequent redelivery depend on ack/connection state. Consumers should release resources and stop fetching promptly.

### RabbitMQ consumer redelivery

The broker delivers a previously unacknowledged/requeued message again, often marked redelivered. It is a duplicate risk, not proof the prior handler did no work.

### RabbitMQ message requeue

Returns a rejected/nacked message to a queue, possibly near the head and subject to ordering effects. Immediate requeue loops can burn broker/consumer resources; use bounded delay/dead-letter strategies.

### RabbitMQ dead-letter reason

Metadata indicating why a message was dead-lettered, such as rejection, TTL expiration, or queue length overflow. Use it for diagnosis and policy, not as a full audit record.

### Quorum queue delivery limit

Limits delivery attempts/redeliveries for quorum-queue poison-message protection. Configure the limit and dead-letter/rejection path intentionally; default behavior may differ by version.

### Quorum queue delayed retry

RabbitMQ 4.4 quorum queues support delayed message delivery using a future delivery time; applications can use it to implement delayed retry without immediately redelivering into a hot loop. The broker feature is not a complete retry policy: define attempt limits, backoff, dead-letter destination, and version/client compatibility.

### At-least-once quorum queue dead-lettering

An opt-in quorum queue dead-lettering mode that retains messages until dead-letter publication is confirmed, improving safety at cost of memory/resource requirements and configuration constraints.

### RabbitMQ stream offset

A position in a stream used by a consumer to resume/re-read records. Offset storage/management may be client-side or broker-assisted depending on API; it differs from queue ack removal.

### RabbitMQ stream repeated reads

Consumers can read retained stream records again from an offset, enabling replay and independent consumption. Retention may remove older data, so replay horizon is bounded.

### RabbitMQ stream retention

Policies determine how long/how much stream data remains, such as by age or size. Retention affects replay, storage, and recovery point.

### RabbitMQ super-stream partitioning

A super stream splits records over multiple underlying streams, often by routing key. Ordering is partition-local and hot keys can create skew.

## Cross-item comparison

Classic/quorum queues model work delivery with differing replication/safety properties; streams retain records for repeatable reads. Queue durability and message persistence must both match restart/recovery needs. TTL, length caps, and priority alter retention/delivery behavior.

## Examples

A reliable task queue may use a quorum queue, persistent messages, publisher confirms, manual consumer ack, bounded prefetch, delivery limit, and an explicitly configured DLX strategy. A replayable event feed may use a stream with retention sized to recovery and consumer catch-up needs.

## Common mistakes

- Assuming durable queue metadata makes transient messages durable.
- Assuming a persistent delivery mode guarantees replication/consumer completion.
- Requeueing poison messages immediately forever.
- Changing declaration properties in place without migration planning.
- Treating a stream as a queue that removes each record after one consumer ack.

## Knowledge checks with answers

1. **Queue durability versus persistence?** Queue declaration lifecycle versus message storage behavior.
2. **What differs for streams?** Retained append-only records and repeatable offset reads.
3. **Why bound prefetch?** Backpressure and in-flight resource control.

### Exact terms covered

- `RabbitMQ classic queue`
- `RabbitMQ quorum queue`
- `RabbitMQ stream`
- `RabbitMQ super stream`
- `Durable queue metadata`
- `Transient queue metadata`
- `Persistent message delivery mode`
- `Transient message delivery mode`
- `Queue durability versus message persistence`
- `Temporary queue`
- `Exclusive queue`
- `Auto-delete queue`
- `Server-generated queue name`
- `Queue declaration and property equivalence`
- `Queue optional arguments (x-arguments)`
- `RabbitMQ policy`
- `Queue Time-To-Live (TTL)`
- `Message TTL`
- `Queue length limit`
- `Queue priority`
- `Single Active Consumer`
- `Consumer prefetch`
- `Consumer acknowledgement timeout`
- `RabbitMQ consumer cancellation`
- `RabbitMQ consumer redelivery`
- `RabbitMQ message requeue`
- `RabbitMQ dead-letter reason`
- `Quorum queue delivery limit`
- `Quorum queue delayed retry`
- `At-least-once quorum queue dead-lettering`
- `RabbitMQ stream offset`
- `RabbitMQ stream repeated reads`
- `RabbitMQ stream retention`
- `RabbitMQ super-stream partitioning`
