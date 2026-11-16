# HTTP gRPC GraphQL and messaging comparisons — Reference: Synchronous API interaction compared with asynchronous messaging

Sources: [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/) and [GraphQL Learn](https://graphql.org/learn/).

## Scope and version

This lesson compares interaction shapes. Broker-specific queues, ordering, retries, and delivery semantics belong to the dedicated messaging topic.

## How this group fits the mental model

Synchronous APIs couple the caller to an immediate response and responder availability. Asynchronous messages decouple time but require explicit correlation, delivery semantics, and recovery.

## Supplied names explained

### Synchronous request-response

Caller waits for a response to one request. It is simple for immediate reads/decisions but consumes a connection/time budget and couples caller success to downstream availability.

### Asynchronous message exchange

Producer sends a message without waiting for the consumer’s full work to complete. It supports buffering and time decoupling but introduces eventual outcomes, retries, duplicates, monitoring, and dead-letter/recovery concerns.

### One-way message

A message sent without an immediate application-level response. The sender still needs acceptance/failure semantics from its broker/API and may need later correlation for completion.

### Command message

Requests an action from a consumer, such as `GenerateReport`. Define ownership, rejection, idempotency, and response/correlation expectations.

### Event message

States that something happened, such as `ReportGenerated`. Consumers react independently; producer should not encode a hidden imperative instruction in an event name.

### Work queue

Distributes each accepted task to one worker/consumer instance at a time under the broker’s semantics. Retries, competing consumers, ordering, and visibility/ack behavior depend on the product.

### Publish-subscribe

One publication is delivered to multiple subscriptions/consumers according to broker configuration. Each subscriber needs independent progress and failure handling.

### Event stream

An ordered/retained sequence of records that consumers can read from positions, depending on platform semantics. It differs from a transient queue; retention, partition ordering, and replay are product-specific.

### Producer-consumer time decoupling

Producer and consumer need not be online simultaneously if the messaging system durably accepts the work. The system still needs a defined backlog/retention limit and a way to detect stale messages.

### Request-response correlation

An identifier links a request to an eventual response message or trace. Define timeout, duplicate, and late-response handling. Correlation alone does not guarantee the response will arrive.

### API contract versus message contract

An API defines an immediate interaction/response contract; a message contract defines durable or asynchronous data/event semantics and compatibility across independent consumers. Both need versioning and security.

### Protocol selection by client environment

Consider browser/mobile/server capabilities, network intermediaries, connectivity, and SDK support. A protocol ideal for internal services may be difficult for browsers or constrained clients.

### Protocol selection by interaction shape

Choose resource CRUD, named command/query RPC, flexible client-selected graph query, or asynchronous task/event according to the user/system interaction—not fashion.

### Protocol selection by streaming requirement

Determine whether data is a sequence in a live call, a subscription/event feed, or an independently retained stream. These have different lifecycle and replay semantics.

### Protocol selection by cacheability

Standard HTTP GET/resource representations can align with caches and validators. RPC and GraphQL can also be cached, but require explicit keys, operation identity, authorization variation, and policy.

### Protocol selection by tooling and interoperability

Consider generated clients, schema tooling, proxy support, language diversity, observability integration, and standards support. A theoretically clean contract may be costly if the ecosystem cannot operate it.

### Protocol selection by operational cost

Include gateways, schema governance, broker operations, streaming lifecycle, retries, dashboards, on-call skills, and recovery—not just wire efficiency or implementation speed.

## Cross-item comparison

Work queue sends each task to a worker; pub-sub fans out; event stream retains ordered records for consumers under broker-specific rules. Synchronous APIs return now; asynchronous workflows need eventual result/correlation or no response.

## Examples

Use an HTTP GET for a cacheable profile view, gRPC unary for a typed internal lookup, GraphQL for a composed client shape with query limits, and a queue command for a report that takes minutes. Publish an event when other systems need to react to a committed fact.

## Common mistakes

- Using async messaging but still requiring a synchronous answer from every consumer.
- Treating commands and events as the same contract.
- Assuming pub-sub delivery, ordering, or retention without checking broker semantics.
- Choosing GraphQL only to reduce HTTP endpoint count.
- Ignoring client/intermediary compatibility.

## Knowledge checks with answers

1. **What does async messaging add?** Time decoupling, buffering, and delivery/consistency responsibilities.
2. **What distinguishes event from command?** Fact that occurred versus request to perform an action.
3. **What must protocol choice include beyond code?** Client support, operations, security, limits, and recovery cost.

### Exact terms covered

- `Synchronous request-response`
- `Asynchronous message exchange`
- `One-way message`
- `Command message`
- `Event message`
- `Work queue`
- `Publish-subscribe`
- `Event stream`
- `Producer-consumer time decoupling`
- `Request-response correlation`
- `API contract versus message contract`
- `Protocol selection by client environment`
- `Protocol selection by interaction shape`
- `Protocol selection by streaming requirement`
- `Protocol selection by cacheability`
- `Protocol selection by tooling and interoperability`
- `Protocol selection by operational cost`
