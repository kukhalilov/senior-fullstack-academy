# queues pub sub RabbitMQ Kafka ordering and delivery semantics — Reference: Message broker model and RabbitMQ exchange-to-queue routing

Sources: RabbitMQ 4.4 [Exchanges](https://www.rabbitmq.com/docs/4.4/exchanges), [Queues](https://www.rabbitmq.com/docs/4.4/queues), [Dead Lettering](https://www.rabbitmq.com/docs/4.4/dlx), and [Publishers](https://www.rabbitmq.com/docs/4.4/publishers).

## Scope and version

This lesson explains the RabbitMQ AMQP 0-9-1 publish-routing model and core topology vocabulary. Routing does not determine consumer processing/acknowledgement guarantees.

## How this group fits the mental model

RabbitMQ publishers send to an exchange. Bindings and exchange type route messages to queues/streams, where consumers receive them. Make unroutable handling and dead-letter routing explicit.

## Supplied names explained

### Message broker

An intermediary that accepts, routes, buffers, or retains messages between producers and consumers under product-defined rules. It does not automatically make external application effects atomic.

### Publisher

An application that sends a message to the broker. It should handle connection failures and uncertain confirmations without losing or duplicating business intent unsafely.

### Consumer

An application that receives and processes messages. Acknowledgement timing determines whether failures can cause loss or redelivery; application effects should be idempotent when duplicates are possible.

### Message broker topology

The configured exchanges, queues/streams, bindings, consumers, and routing relationships. Provision and test topology consistently; a publish can be accepted but unroutable.

### RabbitMQ AMQP 0-9-1

The core messaging protocol model used in this lesson, with exchanges, queues, bindings, channels, and acknowledgements. RabbitMQ also supports other protocols with different surface models.

### RabbitMQ virtual host

A logical namespace and access-control boundary for exchanges, queues, bindings, and users. It is not a full physical or security isolation boundary equivalent to a separate cluster.

### RabbitMQ exchange

Receives publications and routes them to queues/streams using exchange type, binding metadata, and routing information. Exchanges do not normally store the message as a queue would.

### RabbitMQ binding

A routing relationship between an exchange and destination, optionally including a routing key/pattern/headers. A binding is configuration, not a consumer subscription acknowledgement.

### RabbitMQ routing key

A publisher-supplied string used by exchange routing rules. Its interpretation depends on exchange type; it is not a globally enforced schema.

### RabbitMQ default exchange

The nameless direct exchange that routes to a queue whose name matches the routing key. It is convenient for direct-to-queue publishing but still requires correct queue naming and confirm/unroutable handling.

### Direct exchange

Routes to queues whose binding key exactly matches the routing key. Useful for explicit routing categories.

### Fanout exchange

Routes a copy to every bound destination, ignoring routing key. Each queue can process its own copy independently.

### Topic exchange

Matches dot-separated routing-key words against binding patterns with wildcard semantics. Define naming and wildcard conventions carefully to avoid accidental broad fan-out.

### Headers exchange

Routes by message header values and binding arguments rather than routing-key text. It can express attribute-based routing but makes configuration/schema discipline important.

### Exchange-to-exchange binding

Routes messages from one exchange to another through a binding. This supports topology composition; understand cycles and duplicate routing possibilities.

### Alternate exchange

An exchange configured to receive messages that the primary exchange could not route. It is an unroutable-message handling path, not proof that a consumer eventually processed the message.

### Unroutable message

A publication that matches no destination. Broker acceptance and routing success are separate; detect with mandatory publishing/return handling or alternate exchange according to the design.

### Mandatory publish flag

Requests that an unroutable publication be returned to the publisher instead of silently dropped. Publisher confirmation is a separate signal and both should be handled when required.

### Queue

An ordered collection/buffer from which messages are delivered to consumers. Ordering observed by consumers can be affected by competing consumers, priorities, requeue, and redelivery.

### Work queue

A queue where competing workers generally divide tasks so one consumer handles each delivery. It is suitable for task distribution, not retained independent replay by many subscribers.

### Competing consumers

Multiple consumers receive deliveries from one queue for parallel work. Completion order may differ from enqueue order; prefetch and acknowledgements shape distribution.

### Publish-subscribe fan-out

One publication is routed to multiple bound queues, each with its own consumer lifecycle. Binding a shared work queue gives competition, not independent fan-out copies.

### Dead Letter Exchange (DLX)

An exchange to which RabbitMQ routes dead-lettered messages under configured conditions. Guarantee depends on queue type and dead-letter configuration; at-least-once dead-lettering is an explicit quorum-queue option with resource tradeoffs.

## Cross-item comparison

Direct matches exact keys; topic matches key patterns; fanout ignores key; headers checks metadata. A work queue shares tasks among consumers; pub-sub fan-out requires separate destination queues for independent copies.

## Examples

Publish `invoice.created` to a topic exchange; bindings like `invoice.*` receive one segment, while `invoice.#` can match multiple segments. Verify the intended queue exists and mandatory/alternate handling covers configuration errors.

## Common mistakes

- Publishing directly to an exchange and assuming a queue exists.
- Confusing a consumer group on one work queue with fan-out.
- Assuming a DLX always has reliable at-least-once delivery.
- Treating routing keys as authenticated authorization claims.

## Knowledge checks with answers

1. **What routes a RabbitMQ publication?** Exchange type and bindings.
2. **What does mandatory publishing detect?** No route to a destination.
3. **How get independent fan-out?** Route copies to separate queues/subscriptions.

### Exact terms covered

- `Message broker`
- `Publisher`
- `Consumer`
- `Message broker topology`
- `RabbitMQ AMQP 0-9-1`
- `RabbitMQ virtual host`
- `RabbitMQ exchange`
- `RabbitMQ binding`
- `RabbitMQ routing key`
- `RabbitMQ default exchange`
- `Direct exchange`
- `Fanout exchange`
- `Topic exchange`
- `Headers exchange`
- `Exchange-to-exchange binding`
- `Alternate exchange`
- `Unroutable message`
- `Mandatory publish flag`
- `Queue`
- `Work queue`
- `Competing consumers`
- `Publish-subscribe fan-out`
- `Dead Letter Exchange (DLX)`
