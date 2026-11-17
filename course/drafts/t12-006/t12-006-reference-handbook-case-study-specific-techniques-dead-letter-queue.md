# end-to-end system design case studies — Reference: Dead-letter queue

Sources: [Amazon SQS dead-letter queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html), [SQS redrive troubleshooting](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/troubleshooting-dlq-redrive.html), [Azure Service Bus dead-letter queues](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-dead-letter-queues), [Google Cloud Pub/Sub dead-letter topics](https://docs.cloud.google.com/pubsub/docs/dead-letter-topics), [Google Cloud retry strategy](https://docs.cloud.google.com/storage/docs/retry-strategy).

## Scope and version

This lesson teaches the supplied concept at the system-design level. Product behavior and feature availability vary by version and deployment; verify the cited official documentation for the versions and platforms you operate.


## How this group fits the mental model

A dead-letter queue (DLQ) or topic isolates messages that a broker or consumer cannot successfully deliver or process under a configured policy. It preserves evidence for diagnosis and can allow later recovery. A DLQ is a containment and recovery mechanism; it does not fix the poison message, guarantee exactly-once business effects, or prove that the message is safe to replay.

The exact transition is broker-specific. For example, Amazon SQS uses a redrive policy with `maxReceiveCount`; Azure Service Bus can dead-letter messages with a reason and description; Google Pub/Sub has dead-letter topics and delivery-attempt policy behavior. Do not transfer one product's attempt counts, ordering, retention, or redrive semantics to another broker.

## Supplied names explained

- `Dead-letter queue` — A broker-managed or application-managed holding path for messages that exceed a delivery or processing policy. The queue/topic name does not specify a universal retry count, retention clock, ordering rule, or replay guarantee.

## Design the full message lifecycle

1. **Classify failures.** Distinguish transient dependency failures from permanent invalid data, schema incompatibility, authorization/configuration errors, and consumer bugs. Retry transient failures with bounded backoff and jitter. Repeatedly retrying a permanent failure burns capacity and delays healthy work.
2. **Set a retry/attempt budget.** Choose it using the message's time-to-live, dependency recovery expectations, and acceptable queue delay. A low threshold can dead-letter a healthy message during a brief outage; an unbounded threshold can block progress indefinitely.
3. **Move and retain safely.** Configure DLQ permissions, retention, encryption, and capacity. In SQS standard queues, a message's original enqueue timestamp remains relevant after it moves to a DLQ, so DLQ retention should be longer than source-queue retention to preserve the intended investigation window. FIFO queue timestamp behavior differs.
4. **Observe and own it.** Alert on DLQ depth and age, assign an operational owner, capture a bounded failure reason and correlation identifiers, and protect sensitive payload data. Avoid logging credentials, tokens, or unnecessary personal data.
5. **Repair before redrive.** Diagnose the root cause, deploy or configure the fix, validate a small sample, then redrive at a bounded rate. A mass replay can recreate the outage or overwhelm downstream services.

## Cross-item comparison

Queue delivery can be repeated; consumers should be safe when a message is delivered again. Use a stable message/event identifier and an idempotency or deduplication record around business effects. Keep the deduplication retention long enough for the broker's retry and replay horizon. A DLQ redrive is another delivery attempt, not a transaction that undoes the first attempt.

If a consumer performs a side effect and crashes before acknowledging, the broker may redeliver. If it acknowledges before committing the side effect, a crash can lose the work. Coordinate the durable business update and message acknowledgment with an outbox/inbox or another carefully scoped transaction pattern where available; do not claim broker acknowledgement and a database commit are atomic unless the chosen system explicitly provides that boundary.

## Common mistakes

- A scheduled retry queue may be better when delayed retry is expected behavior and the failure is transient.
- A quarantine store may be more appropriate when payloads need security review or long-term evidence retention.
- A compensating workflow may be needed when the operation partially changed business state.
- Immediate rejection and a client-visible error may be preferable for synchronous requests where the client can correct invalid input.

## Examples

An order-event consumer cannot deserialize a new schema. After a bounded retry policy, route the event to a DLQ with the event ID, schema version, and non-sensitive failure category. Alert on DLQ growth. Fix the consumer's schema compatibility, test a sample event, and replay gradually while checking duplicate-order protections and downstream capacity. Keep the original event available until its retention policy expires; do not hand-edit and replay it without preserving an audit trail.

## Knowledge checks with answers

1. **Does a DLQ mean the message failed permanently?** No. It means a configured delivery/processing policy moved or exposed it for separate handling; the root cause may be transient, permanent, or a bug.
2. **Why can replay create duplicate effects?** A prior attempt may have committed a side effect before failing to acknowledge. Consumers need idempotency or deduplication and replay must be rate-controlled.
3. **Why must broker-specific docs be checked?** Attempt counting, retention clocks, ordering, delivery guarantees, and redrive APIs differ across services and sometimes across queue types within one service.
