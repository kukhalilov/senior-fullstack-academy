# system design foundations and infrastructure building blocks — Reference: Amazon SNS

Sources: [Amazon SNS features and capabilities](https://docs.aws.amazon.com/sns/latest/dg/welcome-features.html), [SNS FIFO topic delivery](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-delivery.html), [FIFO ordering](https://docs.aws.amazon.com/sns/latest/dg/fifo-topic-message-ordering.html), [delivery retries](https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html), [FIFO deduplication](https://docs.aws.amazon.com/sns/latest/dg/fifo-message-dedup.html), [AWS messaging decision guide](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/sns-or-sqs-or-eventbridge.html).

## Scope and version

This lesson covers Amazon Simple Notification Service (SNS) as an AWS-managed publish/subscribe and fan-out service. Product capabilities and quotas change; check current AWS documentation and regional support before deployment. Standard and FIFO topic behavior differs, and delivery semantics depend on the subscriber endpoint type.

## How this group fits the mental model

One event often needs to reach several independent consumers: an order update may feed email notifications, an analytics pipeline, and a fulfillment service. SNS lets a publisher send once to a topic and fans messages out to subscriptions. Each subscription is a delivery path with its own filter, retry, permissions, and failure behavior. SNS is useful for notification/fan-out; it is not automatically a durable work queue or a transaction manager for subscriber side effects.

## Supplied names explained

- `Amazon SNS` — A managed pub/sub service that publishes messages to topics and delivers them to subscribed endpoints such as SQS queues, Lambda, HTTP/S, email, and SMS, with standard and FIFO topic options.

## Topic and subscription model

A **publisher** sends a message to a **topic**. The topic evaluates each **subscription** and delivers to that subscription’s endpoint. Multiple subscriptions receive independent copies; an acknowledgment or failure on one path does not mean another subscriber has processed its copy. Filter policies can select messages for a subscription using message attributes or, when configured, message-body fields. Filtering is routing logic: a filtered-out message is intentionally not delivered to that subscriber.

For reliable service-to-service work, SNS commonly fans out to SQS queues. Each consumer gets its own queue, backlog, visibility timeout, retry/DLQ policy, and independent scaling. Direct Lambda delivery or HTTP/S can reduce components but changes retry, buffering, and operational behavior. Choose by consumer isolation, backlog requirements, ordering, and endpoint availability.

## Standard and FIFO topics

**Standard topics** support broad endpoint integration and high-scale fan-out when strict ordering is not required. Design consumers for duplicate delivery and possible reordering where the endpoint contract permits it. Use stable event IDs and idempotent processing.

**FIFO topics** provide message grouping/order and deduplication features for supported delivery configurations. The ordering key is the message group ID; messages in different groups do not have a global order. A hot group can constrain progress. AWS documents that SNS FIFO topics cannot directly deliver to customer-managed endpoints such as HTTP/S, email, SMS, or mobile push because those endpoints do not guarantee strict ordered delivery. The SNS FIFO plus SQS FIFO combination is the usual pattern when consumers need ordered queued work.

Do not overstate FIFO deduplication. Deduplication windows and scope are configured, and end-to-end processing still depends on the queue/consumer and acknowledgment/deletion behavior. AWS documents that message filtering on SNS FIFO changes delivery semantics (filtered messages are intentionally omitted, yielding at-most-once behavior for that subscription). A business effect spanning a database and external API still requires application idempotency/reconciliation.

## Delivery retry, failure, and dead letters

SNS retries delivery according to endpoint-specific policies. For HTTP/S, retryable server errors such as 5xx and throttling responses can be retried according to a delivery policy; permanent errors are treated differently. Other protocols have service-defined policies. If retries are exhausted, SNS discards the undelivered message unless a subscription dead-letter queue is configured. Configure and alert on a DLQ; it is a recovery path that needs inspection, redrive, and permission checks.

Retries can cause duplicates when the endpoint performed work but its acknowledgment was lost. Consumers must be idempotent. For HTTP/S endpoints, return a successful response only after durable processing or durable handoff, and size retry/backoff policy to endpoint capacity. For SQS, the queue provides a separate consumer acknowledgment and retry boundary after SNS has delivered the message.

## Security and operations

Control who can publish, subscribe, and manage topic policies with IAM and resource policies. For cross-account or service subscriptions, verify endpoint/queue policies and confirm the subscription. Encrypt messages at rest with supported KMS configuration where required, and protect sensitive payloads from broad fan-out. Minimize message contents and use references to protected data when appropriate.

Monitor publish failures/throttling, delivery attempts and failures by endpoint, subscription DLQ depth, filter match behavior, fan-out volume, and consumer lag (for SQS-backed subscribers). Trace using stable business event IDs; SNS’s transport message ID is useful operationally but may not identify a duplicate logical event if a publisher retries by publishing a new message.

## Cross-item comparison

| Service/pattern | Main job | Choose it when |
|---|---|---|
| SNS | Push/fan-out to multiple subscription endpoints | Several consumers need a published event, often independently |
| SQS | Durable consumer queue and pull-based work buffering | A worker needs backlog, backpressure, visibility timeout, and per-message delete/retry |
| EventBridge | Event routing/filtering across event buses and integrations | Event rules, SaaS/AWS service integration, or event-bus semantics are central |
| SNS → one SQS queue per consumer | Fan-out plus isolated durable processing | Each consumer needs independent backlog, retries, and scaling |

SNS and SQS compose: SNS distributes; SQS buffers. SNS alone does not give each subscriber a durable independently controlled queue unless the endpoint itself provides those properties. Compare cost, ordering, delivery guarantee, retention, and operational complexity against the current AWS decision guide.

## Examples

An order service publishes `OrderPaid` to an SNS topic. One subscription filters for fulfillment events and delivers to a fulfillment SQS queue; another sends a customer notification to Lambda; an analytics queue receives every order. Each consumer has independent retry and failure handling. The order transaction writes an outbox row, and a publisher sends it to SNS so a process crash does not lose the event between database commit and publish. Consumers deduplicate using the stable order-event ID.

For ordered account balance events, publish to an SNS FIFO topic with account ID as the message group and subscribe an SQS FIFO queue. This preserves order within an account group, while different accounts progress independently. One unusually active account can be a throughput hotspot; use additional independent groups only if the domain permits reordering across them.

## Common mistakes

- Treating SNS as a work queue with consumer-controlled backlog and visibility timeout.
- Assuming every endpoint has identical delivery, retry, ordering, and deduplication guarantees.
- Assuming standard topics provide a global order or exactly-once processing.
- Using FIFO but choosing one global message group and creating a throughput bottleneck.
- Claiming FIFO makes a business side effect exactly once across a database and external service.
- Forgetting that filter policies intentionally omit messages from matching subscription delivery.
- Returning HTTP success before durable handling, or retrying without idempotency.
- Leaving exhausted deliveries without a DLQ and redrive procedure.
- Using SNS’s message ID as the only business deduplication identity across distinct publishes.
- Over-broad topic policies or fan-out of sensitive payloads to unnecessary consumers.

## Knowledge checks with answers

1. **Does one topic acknowledgment mean every subscriber completed?** No. Each subscription is an independent delivery path.
2. **When is SNS plus SQS useful?** When you need SNS fan-out and an independently buffered, retryable queue for each consumer.
3. **Can an SNS FIFO topic guarantee order across all subscribers and all keys?** No. Ordering is scoped to message groups and supported endpoint behavior; there is no implied global subscriber order.
4. **What should an HTTP/S subscriber do if it processed a request but the response was lost?** Accept possible retry and deduplicate using a stable event/operation ID before repeating the side effect.
5. **What happens to an exhausted delivery if no DLQ is attached?** SNS discards it after the configured delivery attempts are exhausted; a DLQ provides a recovery path.

## Practice

Design SNS fan-out for payment events delivered to fulfillment, email, and analytics. Fulfillment must buffer outages, email can be best-effort, and analytics needs replay. Specify topic types, endpoint choices, filters, deduplication, DLQs, permissions, and recovery.

**Suggested answer:** Use an SNS topic with separate subscriptions. Deliver fulfillment to its own SQS queue for backlog, retries, and DLQ; use an appropriate Lambda or endpoint for email with an explicit best-effort/retry policy and DLQ if recovery matters; deliver analytics to a durable queue/stream or archive path with retention/replay designed for its needs. Publish via an outbox with stable business event IDs; make consumers idempotent. Use FIFO only if ordering is a real requirement and the endpoint supports the needed semantics. Narrow topic/queue policies, encrypt sensitive data, monitor each subscription independently, and document DLQ inspection/redrive and analytics replay procedures.
