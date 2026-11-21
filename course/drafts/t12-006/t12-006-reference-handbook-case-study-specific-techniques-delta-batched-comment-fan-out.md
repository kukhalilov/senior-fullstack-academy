# end-to-end system design case studies — Reference: Delta-batched comment fan-out

Sources: [Redis Pub/Sub](https://redis.io/docs/latest/develop/pubsub/), [Redis Streams](https://redis.io/docs/latest/develop/data-types/streams/), [AWS SNS message delivery](https://docs.aws.amazon.com/sns/latest/dg/message-delivery.html), [AWS SNS delivery retries](https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

This pattern delivers new comments or comment-count updates to subscribers of a post, discussion, or feed. “Delta” means sending only the new change or aggregate increment instead of retransmitting an entire conversation or full feed. Batching combines multiple changes before sending them. Delivery behavior and retry limits vary by broker/provider; the cited AWS values are product-specific and should not be generalized.

## How this group fits the mental model

The durable comment record is the source of truth. A write should first pass authorization, validation, moderation policy, and persistence. The fan-out path then tells interested users that state changed. This separation prevents a dropped notification from losing the comment and avoids making a realtime channel the canonical history.

For a post with a small audience, the service can publish each committed comment to active subscribers. For a very large audience or bursty discussion, per-comment fan-out may create a hot post key and overwhelm downstream workers or clients. A batching worker can collect comment IDs for a short window and publish a compact range, count, or “new comments available” notification. Clients fetch canonical comments using a cursor. Batching reduces message overhead but adds latency and can hide ordering unless the event includes a stable sequence/cursor.

## Supplied names explained

- **Delta event:** describes what changed, such as comment ID, post ID, sequence, and timestamp, rather than shipping the whole current thread.
- **Batch window:** maximum aggregation interval before emitting a combined notification; shorter windows reduce delay but create more messages.
- **Fan-out-on-write:** persist or enqueue recipient notifications when a comment is created; makes reads cheap but can produce huge write amplification for celebrities/hot posts.
- **Fan-out-on-read:** compute or fetch updates when a user opens the feed; lowers write amplification but increases read work and freshness complexity.
- **Cursor:** stable position used to fetch subsequent comments; use an ordering key with defined tie-breaking, not timestamps alone if collisions are possible.
- **Outbox:** transactionally records an event alongside the comment so a background publisher can deliver it later, preventing a database-write/message-publish dual-write gap.

## Cross-item comparison

| Delivery design | Strength | Cost or failure mode |
| --- | --- | --- |
| Immediate per-comment push | Lowest notification latency for modest fan-out | Many messages and hot partitions at high fan-out |
| Short-window batch of deltas | Amortizes protocol and broker overhead | Adds bounded delay; duplicate, reorder, and partial-batch handling are needed |
| “New activity” hint plus cursor fetch | Small push payload; durable read path remains authoritative | Client makes a follow-up request; feed freshness depends on cursor/API correctness |
| Durable broker/stream | Recovery, replay or acknowledgement can be available | Retention, consumer lag, duplicate processing, and dead-letter handling must be designed |
| Ephemeral Pub/Sub | Very fast for connected subscribers | Missed events are not replayed; reconnect must fetch a snapshot/delta from durable storage |

## Examples

Assume comments receive per-post sequence numbers 41, 42, and 43. A 100 ms batch window may publish one event saying “post P has updates through sequence 43,” optionally including IDs 41–43. The client requests comments after its last displayed sequence, applies them idempotently by ID/sequence, and advances its cursor only after successful processing. If the event is duplicated or arrives after sequence 44, the client still fetches from the durable API and reconciles. If a batch worker crashes after publishing but before acknowledging, a retry can publish the batch again; stable event IDs and idempotent consumers handle this safely.

To prevent the dual-write gap, the comment transaction writes both the comment and an outbox row. A publisher reads unsent outbox rows and sends them to the broker, marking delivery state according to the chosen guarantee. This generally yields at-least-once publication, not magical exactly-once end-to-end processing. The comment API should return the persisted result, while push delivery remains an optimization for freshness.

## Common mistakes

- Publishing before the comment commits, so users receive a notification for a rolled-back write.
- Committing the comment and separately publishing without an outbox or reconciliation, creating a lost-notification gap.
- Treating a broker acknowledgement as proof that every client rendered the comment.
- Batching without a maximum delay, so a quiet or stuck batch never flushes.
- Depending on timestamps alone for strict ordering or using offsets that can be reused after deletion.
- Making consumers non-idempotent when retry or at-least-once delivery is possible.
- Fanning out to every follower synchronously for a high-fan-out account.
- Using lossy Pub/Sub as the only copy of a comment or comment event.

## Knowledge checks with answers

1. **What is the source of truth?** The durable comment store; push events are notifications or deltas.
2. **What tradeoff does batching make?** It reduces per-event overhead and fan-out pressure in exchange for added delay and more complex ordering/retry behavior.
3. **How should clients handle a missed or duplicate delta?** Fetch from a stable cursor in the durable API and apply by stable event/comment IDs idempotently.
4. **How does an outbox help?** It records the event in the same database transaction as the comment, allowing a retryable publisher to bridge the database-to-broker boundary.
