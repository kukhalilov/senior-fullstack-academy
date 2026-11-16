# transactions savepoints retry execution strategies and concurrency — Big-picture orientation and mental model

This lesson follows Microsoft's [EF transactions](https://learn.microsoft.com/en-us/ef/core/saving/transactions), [connection resiliency](https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency), [concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency), and [.NET 11 EF Core release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Problem and purpose

Database operations can fail halfway through a business workflow, a connection can disappear while the database commits, and another user can change the same row. Transactions provide atomic grouping, savepoints provide an in-transaction recovery point, execution strategies retry transient failures, and concurrency tokens detect stale writes. These mechanisms solve different failure classes.

## Plain-language mental model

An ordinary `SaveChanges` is an atomic work unit when the provider supports transactions. An explicit transaction combines multiple commands into a larger all-or-nothing unit. A savepoint is an internal checkpoint, not a commit. A retry strategy replays a unit after a transient failure. A concurrency token checks whether a row has changed since it was read. If a connection breaks during commit, the outcome may be unknown: the write might have committed, so blind replay can duplicate effects.

## How the parts fit together

EF may automatically create a transaction for one SaveChanges and may create a savepoint when SaveChanges runs inside a user transaction. MARS disables SQL Server savepoints, potentially leaving a failed transaction in an unknown state. Manually started transactions must be wrapped by the configured execution strategy so the full transaction can replay as one unit. Unknown commit outcomes need an idempotency key, verification query, or durable transaction marker. Concurrency conflict resolution compares original/current/database values and chooses policy; it is not the same as retrying a network timeout.

## Concept map

```text
atomicity: transaction → commit / rollback
recovery point: savepoint → rollback-to-savepoint
transient infrastructure failure: execution strategy → replay unit
commit acknowledgement lost: unknown outcome → verify/idempotency
stale row edit: concurrency token → application merge/reject
```

## End-to-end walkthrough

Create a reservation and an audit/outbox record in one database transaction. If a transient failure occurs before commit, the execution strategy reruns the transaction delegate. The delegate must recreate/use a clean context and make its writes idempotent. If the connection drops during commit, verify whether the reservation exists using a client-generated operation ID before retrying. If a separate user changed the reservation row, detect that with an optimistic token and resolve the business conflict rather than treating it as a transient connection problem. Send email only after durable commit or through an outbox; the retry delegate may run more than once.

## When to use it and tradeoffs

Rely on the default SaveChanges transaction for one atomic persistence unit. Use explicit transactions for multiple saves/commands that must commit together, but keep them short. Use retries for provider-classified transient errors; do not retry validation, unique-key, or concurrency failures indiscriminately. Add verification/idempotency for uncertain commits. Use tokens for stale-write protection. Isolation levels/pessimistic locking are database-specific and should be selected from a concrete consistency requirement.

## What later lessons cover

Reference lessons explain transaction/savepoint APIs, execution strategies/unknown outcomes, and concurrency resolution. Practice and interview lessons separate infrastructure retry, commit verification, and stale-write policy.
