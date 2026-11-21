# architecture interviews tradeoffs requirements and constraints — Problem: Prevent lost events between a database and a broker

Sources: [Azure transactional outbox pattern](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos), [Azure Idempotent Consumer pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/idempotent-consumer), [Azure Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry)

## Goals

Practice transactional outbox, duplicate delivery, idempotent consumer, reconciliation under interview constraints.

## Worked example

An API writes an order to SQL Server and publishes an event to a broker. A process crash between these operations can lose or duplicate the event. Design the path.

Write the order and an outbox row in one local database transaction. A publisher reads pending rows, publishes at least once, and marks progress; a crash may repeat publication. Consumers deduplicate with the stable event ID and commit their side effect with their consumed marker where possible. Monitor outbox age and reconcile missing projections.

## Exercises

1. Identify the exact failure window in a database-then-publish dual write.
2. Specify which records share the database transaction and what the publisher does after broker acknowledgement.
3. A publisher crashes after publishing but before marking the outbox row complete. What happens on restart?
4. State the consumer's deduplication transaction boundary and the ordering guarantee actually required.

## Progressive hints

1. Consider a crash after either independent write.
2. Keep business state and intent-to-publish atomic locally; broker publication remains a separate action.
3. Assume the event may be delivered twice.
4. Scope ordering by aggregate/partition only if the product requires it; global ordering is expensive and often unnecessary.

## Complete solutions

1. If database commit happens and publish fails, downstream systems miss the event; if publish succeeds and database commit fails, consumers see an event for state that never committed.
2. Commit business state and an outbox record in one local transaction. A relay publishes pending records, then records progress. The transaction does not include the broker unless a supported distributed transaction is deliberately used.
3. It republishes the event. At-least-once relay behavior means duplicates are expected; use a stable event ID and an idempotent consumer.
4. Commit the consumer's business side effect and processed-event marker atomically where both live in one transaction boundary. If ordering matters, define the key and scope (for example, per aggregate), preserve sequence, and handle poison events.

## Tests and edge cases

Inject crashes before database commit, after commit but before publish, after publish but before marking complete, and after consumer side effect but before acknowledgement. Also test duplicate event IDs, out-of-order aggregate events, poison-message handling, relay backlog growth, and replay after restoration.

## Reflection questions

Which local transaction makes the intent durable? What operational signal reveals a stuck outbox?


Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
