# transactions savepoints retry execution strategies and concurrency — Core concepts and how they fit together

Source basis: Microsoft [transactions](https://learn.microsoft.com/en-us/ef/core/saving/transactions), [connection resiliency](https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency), and [concurrency conflict](https://learn.microsoft.com/en-us/ef/core/saving/concurrency) guidance.

## Learning objectives

Distinguish transaction, savepoint, transient retry, unknown commit, and optimistic concurrency; wrap manually controlled transactions in the execution strategy; preserve idempotency across replay; and choose conflict handling from application semantics.

## Prerequisites

Know relational transactions, isolation, EF `SaveChanges`, retries, change tracking, concurrency tokens, and asynchronous resource disposal. Provider support and database behavior matter throughout.

## Core concepts

### Default and explicit transactions

When supported by the provider, a single `SaveChanges` call is normally atomic: all its commands commit or roll back together. An explicit transaction groups multiple SaveChanges and other database operations. Keep it short and dispose it reliably. Calling `AutoTransactionBehavior.Never` can leave earlier commands committed if a multi-command SaveChanges fails.

### Savepoints

If SaveChanges runs inside an existing transaction, EF normally creates a savepoint and rolls back to it on failure, allowing the outer transaction to continue/resolve. SQL Server MARS disables this automatic savepoint behavior even when MARS is not actively being used; after failure the transaction may be in an unknown state. Savepoints do not commit anything. Providers may vary in savepoint support.

### Retry execution strategies

Providers supply execution strategies that recognize specific transient errors and apply retry count/delay/timeouts. When retry is enabled, each EF query and SaveChanges may be retried as its own unit. A manually opened transaction is a larger logical unit and cannot be retried by implicit per-command strategy. Call `CreateExecutionStrategy()` and put the entire transaction delegate inside `Execute`/`ExecuteAsync`; recreate the context/transaction for each replay where practical. Retries can add latency and buffer query results, and retry layers can multiply attempts.

### Unknown commit outcome

If the connection drops before commit is sent/acknowledged, the transaction may have rolled back. If it drops during commit, the server may have committed even though the client did not receive confirmation. A retry can duplicate an insert or external side effect. Use client-generated operation IDs/unique keys, query verification (`verifySucceeded`), a durable transaction marker, or surface an uncertain outcome for reconciliation. For an EF transaction replay, avoid store-generated keys when duplicate rows would be possible, or verify idempotently.

`ExecuteInTransaction`/`ExecuteInTransactionAsync` support a `verifySucceeded` callback for uncertain commits. `SaveChanges(acceptAllChangesOnSuccess: false)` can preserve tracker state until commit outcome is verified; after confirmed success call `AcceptAllChanges`, otherwise reset/discard context state carefully.

### Optimistic concurrency is a separate retry class

A concurrency token makes update/delete conditional on the original token. A mismatch becomes `DbUpdateConcurrencyException`; resolve with database values and domain-specific store/client/merge policy. A same stale write replayed without refreshing/merging is not fixed. A serialization/deadlock/transaction-abort exception may be provider-specific and can or cannot be transient; it is not automatically a token conflict.

### External side effects

Execution-strategy delegates can execute more than once. Do not send email, charge a payment, or publish a message directly inside a retried database transaction unless the external operation is independently idempotent. Persist an outbox record in the transaction and dispatch it after commit with a deduplication key; broader outbox/saga design is covered elsewhere.

## Mechanisms and relationships

`TransactionScope` provides ambient transaction coordination where provider/platform support exists; async code must enable async flow. Cross-context transactions require a shared relational `DbConnection` and `DbTransaction`. EF savepoint API names are CreateSavepoint/RollbackToSavepoint/ReleaseSavepoint. `IExecutionStrategy.ExecuteInTransactionAsync` is a provider/EF extension with operation and verification callbacks.

## Worked examples

```csharp
var strategy = db.Database.CreateExecutionStrategy();

await strategy.ExecuteAsync(async () =>
{
    // Use a fresh context for each retry attempt.
    await using var attempt = await factory.CreateDbContextAsync(cancellationToken);
    await using var tx = await attempt.Database.BeginTransactionAsync(cancellationToken);

    attempt.Orders.Add(new Order { Id = operationId, CustomerId = customerId });
    attempt.OutboxMessages.Add(new OutboxMessage { Id = operationId, Type = "OrderCreated" });
    await attempt.SaveChangesAsync(cancellationToken);
    await tx.CommitAsync(cancellationToken);
});
```

The client-generated operation ID/unique constraint helps make replay detectable. If commit outcome is uncertain, verify that ID exists before telling the client to retry. A transactional outbox prevents direct message publication from duplicating inside this delegate.

## Misconceptions and edge cases

- A retry strategy does not make a transaction idempotent.
- Retrying a manually controlled transaction must replay all its operations, not only the last failed command.
- A connection loss during commit has unknown outcome; do not infer rollback.
- Savepoint rollback does not rollback the outer transaction.
- SQL Server MARS disables EF savepoints and can leave transaction state unknown after SaveChanges failure.
- `DbUpdateConcurrencyException`, unique constraint violations, deadlocks, and timeouts are different failure categories.
- A transaction cannot atomically include arbitrary email/payment/message brokers without a broader protocol.
- `DbContext` and a transaction should not be used concurrently across tasks.

## Knowledge checks with answers

1. **What is atomic by default?** One SaveChanges call when provider supports transactions.
2. **What should be wrapped in `CreateExecutionStrategy().ExecuteAsync`?** The complete explicit transaction/replay unit.
3. **What does a savepoint do?** Provides a rollback point inside an open transaction without committing it.
4. **What does unknown commit mean?** The database may have committed even though the client did not receive confirmation.
5. **What handles stale updates?** Concurrency token conflict resolution, not blind transient retry.


## System-design boundary: EF Core transaction and external delivery

An EF Core transaction can make related database changes atomic on the same transactional resource. It cannot atomically commit a message to an unrelated broker or an email provider. Write an outbox record with the domain change in one database transaction; publish it asynchronously and expect possible duplicate delivery. Give each event a stable identifier and make the consumer's effect idempotent. Keep broker calls outside the database transaction so network delay does not extend locks. Recovery includes retrying pending outbox rows and reconciling downstream state. This pattern composes local transactions with at-least-once delivery; it is not end-to-end exactly-once execution. [EF Core transactions](https://learn.microsoft.com/en-us/ef/core/saving/transactions).
