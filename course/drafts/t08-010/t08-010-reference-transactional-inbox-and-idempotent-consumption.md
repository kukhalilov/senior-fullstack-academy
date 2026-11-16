# transactions distributed consistency saga outbox and inbox — Reference: Atomic consumer effects, deduplication, and inbound message tracking

Sources: [Idempotent Consumer pattern](https://microservices.io/patterns/communication-style/idempotent-consumer.html), [Transactional Outbox for Cosmos DB](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos), and [Minimize coordination](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/minimize-coordination).

## Scope and version

This is a pattern lesson rather than a broker API guide. Consumer acknowledgement/redelivery semantics vary by broker and transport. The durable database transaction described here covers only the consumer-owned store unless a separately supported distributed transaction is explicitly configured.

## How this group fits the mental model

Delivery can repeat after a consumer commits but before the broker learns it succeeded. An inbox records message identity in the same local transaction as the business effect, so the repeated delivery sees a durable prior claim instead of repeating the effect.

## Supplied names explained

### Transactional Inbox pattern

Persist incoming message identity and local processing effects atomically. Repeated delivery becomes detectable after the first local commit; external side effects still need their own idempotency boundary.

### Inbox record

A durable record of a message accepted/processed by a subscriber, often including message ID, subscriber, timestamp, and outcome/version. Store only what is needed for dedupe, audit, or replay.

### Processed-message table

A relational inbox implementation. Give it a unique key per consumer identity and message ID, and insert it within the transaction that applies the effect.

### Message identity deduplication

Compares a stable event/message ID to past processing records. Identity must be preserved across broker retries and producer relay attempts; semantically similar payloads with different IDs may be distinct events.

### Subscriber identity plus message identity key

Composite dedupe key that allows the same event to be independently applied by separate subscribers while preventing repeat application by one subscriber. Scope can also include tenant/version where required by ownership.

### Inbox uniqueness constraint

Database-enforced uniqueness prevents concurrent duplicate deliveries from both claiming the same message. Handle uniqueness conflict as a duplicate only after confirming the existing transaction committed successfully.

### Inbox record and business update atomic commit

Insert/claim the inbox entry and apply local domain changes in one transaction. If the transaction aborts, neither should remain; if it commits, a redelivery sees the claim.

### Duplicate message detection

Recognition that a message ID has already been committed by this subscriber. The handler should acknowledge or return success according to broker semantics without repeating effects; preserve observability for duplicate rates.

### Consumer acknowledgement after local commit

Acknowledge only after the inbox and local effect commit. A crash before acknowledgement causes redelivery, which the inbox can absorb. Acknowledging earlier risks losing an uncommitted effect.

### Consumer acknowledgement before local commit failure window

If acknowledgement succeeds and the local transaction later fails, the broker may not redeliver, leaving the business effect lost. Avoid this ordering unless another durable recovery mechanism owns the work.

### Inbox retention window

How long dedupe records remain. It must cover plausible broker retention/replay, delayed retry, disaster recovery, and business replay horizons; indefinite retention may require partitioning/archive.

### Inbox cleanup

Deletion/archive of old dedupe records. Cleanup too early re-enables duplicate effects; coordinate it with message retention, restore procedures, replay policy, and uniqueness scope.

### Idempotent Consumer pattern

Designing a consumer so processing the same message more than once has the same intended business result as processing once. An inbox is one implementation; inherently idempotent state-setting operations are another.

### Idempotency key scope

Defines which logical action a key deduplicates, for which tenant/consumer and duration. Reuse across unrelated operations can suppress valid work; changing it across retries can duplicate a side effect.

### Consumer-side transactional boundary

The atomic scope around dedupe claim and consumer-owned state change. It typically excludes broker acknowledgement and external calls, so crash points around those edges must be designed separately.

### Inbox does not make external side effects atomic

Committing an inbox row cannot atomically send an email, charge an external provider, or mutate another service. Use that provider's idempotency capability, a downstream outbox, or persist a workflow that reconciles ambiguous outcomes.

## Cross-item comparison

The inbox uniqueness key defines dedupe scope; retention defines how long that guarantee lasts. A broker acknowledgement communicates delivery handling to the broker, while the inbox commit records local business effect. Both boundaries must be ordered and recoverable.

## Examples

Consumer receives `OrderPaid(event-9)`, inserts `(billing-projection,event-9)` and updates its local projection in one transaction, then acknowledges. If it crashes before acknowledgement, redelivery hits the unique key and does not add the amount again. If it calls a shipping API, that separate call needs its own stable key or durable follow-up message.

## Common mistakes

- Inserting a dedupe record in one transaction and applying the effect in another.
- Acknowledging before local commit.
- Using a random idempotency key on each retry.
- Deleting inbox rows sooner than the maximum replay/recovery horizon.
- Treating duplicate detection as a reason to hide malformed or conflicting message identities.
- Assuming an inbox covers email, payment, or another remote side effect.

## Knowledge checks with answers

1. **Why does the inbox share the business transaction?** To ensure dedupe state and local effect either both commit or both roll back.
2. **What happens if commit succeeds but acknowledgement is lost?** The message may redeliver; the inbox turns it into a safe duplicate.
3. **How do you protect a remote API call?** Use its idempotency contract or record and reconcile a separate durable workflow.

### Exact terms covered

- `Transactional Inbox pattern`
- `Inbox record`
- `Processed-message table`
- `Message identity deduplication`
- `Subscriber identity plus message identity key`
- `Inbox uniqueness constraint`
- `Inbox record and business update atomic commit`
- `Duplicate message detection`
- `Consumer acknowledgement after local commit`
- `Consumer acknowledgement before local commit failure window`
- `Inbox retention window`
- `Inbox cleanup`
- `Idempotent Consumer pattern`
- `Idempotency key scope`
- `Consumer-side transactional boundary`
- `Inbox does not make external side effects atomic`

### Exact terms covered

- `Transactional Inbox pattern`
- `Inbox record`
- `Processed-message table`
- `Message identity deduplication`
- `Subscriber identity plus message identity key`
- `Inbox uniqueness constraint`
- `Inbox record and business update atomic commit`
- `Duplicate message detection`
- `Consumer acknowledgement after local commit`
- `Consumer acknowledgement before local commit failure window`
- `Inbox retention window`
- `Inbox cleanup`
- `Idempotent Consumer pattern`
- `Idempotency key scope`
- `Consumer-side transactional boundary`
- `Inbox does not make external side effects atomic`
