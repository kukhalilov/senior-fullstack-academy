# system design foundations and infrastructure building blocks — Reference: Google Cloud Pub/Sub

Sources: [Pub/Sub overview](https://docs.cloud.google.com/pubsub/docs/subscription-overview), [message ordering](https://docs.cloud.google.com/pubsub/docs/ordering), [exactly-once delivery](https://docs.cloud.google.com/pubsub/docs/exactly-once-delivery), [subscription properties](https://docs.cloud.google.com/pubsub/docs/subscription-properties), [retry policy](https://docs.cloud.google.com/pubsub/docs/subscription-retry-policy).

## Scope and version

This lesson explains the core Google Cloud Pub/Sub model and selected delivery semantics documented on 2026-11-17. Pub/Sub product features and quotas change; verify current regional quotas, API behavior, pricing, and supported client-library capabilities before deployment.

## How this group fits the mental model

Publishers and subscribers should not need to be online at the same time. A publisher sends a message to a topic; subscriptions define independent delivery streams for consumers. The service stores and routes messages, while subscribers own processing, acknowledgment timing, idempotency, and downstream state. Acknowledgment tells the service that a delivery was handled; it does not automatically make a database update and ack one atomic transaction.

## Supplied names explained

- `Google Cloud Pub/Sub` — Managed publish/subscribe messaging with topics and durable subscriptions, pull/push/export delivery modes, acknowledgment and retry, optional ordering, and optional exactly-once delivery under documented constraints.

## Topic, message, subscription, and acknowledgment

A **topic** is a named stream to which publishers send messages. A **subscription** is an independently configured consumer view of that topic; multiple subscriptions can deliver the same published message to different services. A message includes data and optional attributes and receives a service message ID. Subscription retention and acknowledgment state are associated with the subscription, so one consumer’s acknowledgment does not acknowledge the message for every other subscription.

In a pull subscription, a client requests or streams messages and acknowledges them after processing. In a push subscription, Pub/Sub sends HTTP requests and interprets a successful response as acknowledgment. Export subscriptions can write messages to supported Google Cloud destinations. Select the mode based on scaling, network access, control over concurrency, and downstream integration.

By default, Pub/Sub provides at-least-once delivery without ordering guarantees. If the service does not receive a valid acknowledgment before the acknowledgment deadline, or the subscriber negatively acknowledges, the message can be delivered again. Subscribers should therefore be idempotent and should acknowledge only after durable processing or durable handoff.

## Processing, acknowledgment, and the crash window

Consider a subscriber that charges a card, then acknowledges. If the charge succeeds but the process crashes before the ack is accepted, the message is redelivered and can charge again. If it acknowledges before the charge is durable, a crash can lose the operation. Use an idempotency key derived from a stable business/message identity, a transactional inbox table, or a downstream provider’s deduplication support. Commit local state and deduplication record atomically, then ack.

The acknowledgment deadline is a lease-like timeout for a delivery. Clients can extend it while work proceeds, subject to service/client behavior and limits. If processing routinely exceeds the deadline, fix lease management or break work into bounded steps; too-short deadlines cause duplicate work, while extremely long deadlines delay recovery after a crashed consumer.

## Retries, dead letters, and poison messages

Unacknowledged or negatively acknowledged messages are retried. Pub/Sub supports immediate retry or an exponential-backoff retry policy. Backoff applies per message and is best-effort; it is not a global pause or a precise scheduler. A message that always fails can consume resources and create repeated load. Configure dead-letter handling for poison messages, set an attempt policy, preserve diagnostic context, and provide a safe replay/redrive process after fixing the cause.

Dead-letter delivery is not a replacement for monitoring or data retention policy. Validate IAM permissions and cross-project configuration so forwarding can actually occur. Track oldest unacked age, delivery attempts, deadline expirations, ack latency, dead-letter counts, and subscriber errors.

## Ordering keys and throughput trade-offs

Ordering can be enabled for subscriptions, and publishers set an ordering key. Messages with the same key and in the same region can be delivered in publish order under the documented feature semantics; different keys do not have a global order. A hot key serializes or constrains progress and can limit throughput. Choose keys that correspond to the smallest entity requiring order, such as one account or aggregate, and keep independent entities on different keys.

Ordering does not eliminate redelivery. On ordered redelivery, subsequent messages for the same key may also be redelivered to preserve order. Consumers must make repeated processing safe and understand how acknowledgments and retries affect the key’s progress. If ordering is unnecessary, leaving it disabled usually allows more independent work.

## Exactly-once delivery: scope and limits

Pub/Sub offers an exactly-once delivery option for pull subscriptions. Google documents it in terms of preventing duplicate deliveries after successful acknowledgment and allowing the subscriber to determine acknowledgment success. The guarantee applies when subscribers connect to Pub/Sub in the same region; multi-region subscriber connections can still lead to duplicates. It does not prevent publishers from publishing the same logical event multiple times under different publish attempts/IDs, and it does not make the subscriber’s external side effect and acknowledgment one transaction.

Exactly-once can increase latency and has feature/throughput constraints, especially with ordered delivery. Use it only when its documented semantics address a real requirement; continue to make business processing idempotent. “Exactly-once transport delivery” should never be simplified to “the business effect occurs exactly once globally.”

## Retention, replay, and subscription lifecycle

Subscriptions have message-retention and expiration settings. A message can be discarded after retention expires even if it remains unacknowledged, according to documented service behavior. Subscription inactivity can also lead to expiration unless configured otherwise. Choose retention from recovery, replay, and compliance requirements, then account for storage cost and expiration policy. Retention is not a substitute for archival storage or a permanent event log.

Seeking a subscription to a timestamp or snapshot replays messages and can produce redelivery even with exactly-once enabled. Replay is expected behavior; processors need deduplication and downstream side-effect controls. A replay operation should be an explicit operational event with monitoring and an estimate of downstream load.

## Flow control and subscriber scaling

Control outstanding messages and bytes in the client library based on processing capacity and memory. Pulling too many messages can cause ack deadlines to expire and increase redelivery; pulling too few can leave capacity idle. Scale consumers based on backlog age/size and processing rate, not only CPU. Make handlers concurrency-safe, bound downstream requests, and avoid a retry storm when a dependency is unhealthy.

## Cross-item comparison

| Requirement | Pub/Sub feature | Important caveat |
|---|---|---|
| Independent consumers | Separate subscriptions on a topic | Each subscription has its own backlog/ack state and retention cost |
| Retry failed processing | Ack deadline and retry policy | Redelivery is expected; handlers need idempotency |
| Per-entity order | Ordering key and ordered subscription | No global order; hot keys constrain throughput; redelivery can affect later messages |
| Reduce duplicate delivery after ack | Exactly-once pull subscription | Regional constraints; does not deduplicate publisher-level logical duplicates or external side effects |
| Isolate poison messages | Dead-letter topic | Requires configuration/IAM and an explicit inspection/redrive workflow |
| Long-term event archive | Export/storage or separate archive | Pub/Sub subscription retention is bounded and not an archival guarantee |

## Examples

An order-created event is published with key `order-123`. An inventory consumer records the message ID and applies its local reservation in one database transaction; duplicate delivery sees the inbox record and does not reserve twice, then acknowledges. A billing consumer has a separate subscription and performs its own deduplication. If one message is malformed, it is retried according to policy, then sent to a dead-letter topic for inspection rather than blocking unrelated keys.

A per-customer state projection uses customer ID as ordering key so updates for one customer are sequenced while other customers process concurrently. A single unusually active customer can become a hot key, so monitor per-key skew and reconsider whether all events truly need strict order.

## Common mistakes

- Assuming publish/subscribe means each event is processed only once by business logic.
- Acknowledging before durable processing or performing side effects before a crash-safe deduplication record.
- Treating the service message ID as a universal business idempotency key when publishers can publish the same event more than once.
- Assuming ordering across keys, regions, subscriptions, or separate topics.
- Enabling ordering for a hot key without understanding throughput and retry effects.
- Treating exactly-once delivery as global exactly-once side effects.
- Letting ack deadlines expire during normal processing, creating duplicate load.
- Using retry policy as a precise scheduler or global backpressure mechanism.
- Forgetting retention expiry, subscription expiration, dead-letter IAM, and replay load.

## Knowledge checks with answers

1. **What is the default delivery model?** At-least-once with no ordering guarantee; messages can be redelivered when acknowledgment is missing or late.
2. **Does a subscription ack affect every subscriber?** No. Acknowledgment state is for that subscription; other subscriptions process independently.
3. **What does exactly-once delivery cover?** Documented pull-subscription delivery/ack behavior within a region; it does not make arbitrary subscriber side effects atomic or deduplicate all duplicate publishes.
4. **How should an ordered subscription choose keys?** Use a key per entity whose messages truly require order; different keys are not globally ordered and a hot key can limit progress.
5. **When should a consumer acknowledge?** After durable processing or durable handoff, using idempotency/inbox coordination to handle a crash before acknowledgment.

## Practice

Design a Pub/Sub pipeline for inventory updates where each product’s changes must be ordered, duplicate side effects are unacceptable, and one malformed product update must not stop all products. Define topic/subscription layout, ordering key, inbox, ack timing, retry/dead-letter policy, retention, and monitoring.

**Suggested answer:** Publish events with product ID as ordering key and consume through a subscription with ordering enabled. In one local transaction, insert a unique inbox/business-event ID and apply the inventory transition; duplicate processing is a no-op, then acknowledge. Keep work bounded and extend ack deadlines safely. Retry transient errors with controlled backoff; send poison messages to a configured dead-letter topic with IAM verified, then inspect/fix/replay by product. Because order is per key, one product’s blocked sequence need not stop unrelated keys, though later messages for that same key may be affected. Set retention for recovery needs and monitor backlog age, per-key skew, expired ack deadlines, duplicates, retry attempts, and dead-letter volume.
