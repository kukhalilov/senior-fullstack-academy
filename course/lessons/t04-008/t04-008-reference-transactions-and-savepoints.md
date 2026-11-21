# transactions savepoints retry execution strategies and concurrency — Reference: EF Core transaction APIs, ambient transactions, and savepoints

## Scope and version

Based on Microsoft's [transactions guide](https://learn.microsoft.com/en-us/ef/core/saving/transactions) and [concurrency documentation](https://learn.microsoft.com/en-us/ef/core/saving/concurrency). EF Core 11.0.0 shipped 2026-11-10; relational provider behavior remains provider/database-specific.

## How this group fits the mental model

A transaction makes a group of supported database operations atomic. A savepoint is a recoverable position inside that transaction. Contexts that share a transaction also share a connection/transaction boundary, not their change trackers.

## Supplied names explained

- **Database.BeginTransaction** — Starts an explicit relational transaction through the context's database facade.
- **Database.BeginTransactionAsync** — Async transaction start with optional isolation level/cancellation; dispose and commit/rollback intentionally.
- **IDbContextTransaction** — EF abstraction over a database transaction, exposing commit, rollback, savepoints, and relational underlying transaction access where supported.
- **IDbContextTransaction.Commit** — Synchronously commits the active transaction.
- **IDbContextTransaction.CommitAsync** — Async commit; a transport failure during commit may leave outcome unknown.
- **IDbContextTransaction.Rollback** — Explicitly rolls back active transaction.
- **IDbContextTransaction.RollbackAsync** — Asynchronous rollback.
- **IDbContextTransaction.CreateSavepoint** — Creates named savepoint in an active transaction when provider supports it.
- **IDbContextTransaction.CreateSavepointAsync** — Async savepoint creation.
- **IDbContextTransaction.RollbackToSavepoint** — Rewinds transaction work after a named savepoint; does not rollback/close the whole transaction.
- **IDbContextTransaction.RollbackToSavepointAsync** — Async rollback to savepoint.
- **IDbContextTransaction.ReleaseSavepoint** — Releases a named savepoint where provider supports the operation; some databases release implicitly at transaction end.
- **IDbContextTransaction.ReleaseSavepointAsync** — Async release.
- **IDbContextTransaction.DisposeAsync** — Async disposal of transaction resource; an uncommitted transaction is generally rolled back when disposed, subject to provider behavior.
- **IDbContextTransaction.GetDbTransaction** — Relational extension exposing the underlying `DbTransaction` for interoperation; available only for relational providers.
- **AutoTransactionBehavior.WhenNeeded** — Default behavior: EF creates an explicit transaction when needed for multiple commands/atomicity.
- **AutoTransactionBehavior.Always** — Always creates automatic transaction for SaveChanges with no user transaction; can add overhead/round trips.
- **AutoTransactionBehavior.Never** — Disables automatic transaction; dangerous when a SaveChanges call issues multiple commands because partial persistence may occur after failure.
- **UseTransaction** — Enlists a context in an existing relational `DbTransaction`; context and transaction must use the same connection.
- **UseTransactionAsync** — Async enlistment in external transaction.
- **TransactionScope** — `System.Transactions` ambient scope that can enlist supported providers/connections; provider/platform support and escalation behavior must be verified.
- **System.Transactions ambient transaction** — Ambient transaction flows across enlisted operations; async code should enable `TransactionScopeAsyncFlowOption.Enabled`, complete the scope, and dispose it. Multiple resources may escalate to a distributed transaction that is not supported uniformly.
- **SaveChanges transaction behavior** — One SaveChanges call is normally transactional when provider supports transactions; avoid manually adding larger scopes unless multiple operations truly need atomicity.
- **Automatic savepoint before SaveChanges** — When SaveChanges runs inside an existing transaction, EF normally creates a savepoint and rolls back to it on failure so the outer transaction can continue.
- **Savepoint** — Named point inside a transaction to which the transaction can roll back; it does not persist/commit prior work.
- **Multiple Active Result Sets (MARS) savepoint incompatibility** — SQL Server MARS disables EF's automatic savepoints, even if MARS is idle; after SaveChanges failure the transaction may be left in unknown state.
- **Cross-context shared transaction** — Multiple `DbContext` instances can share one relational `DbConnection` and `DbTransaction` by calling `UseTransaction`; each still has independent change tracking.
- **RelationalTransaction (provider implementation detail; not application API)** — EF relational layer implementation that wraps transaction behavior; application code should use public `IDbContextTransaction`/`Database` APIs rather than depend on internal implementation types.
- **Transaction isolation level** — Database policy controlling visibility/locking of concurrent transactions (for example read committed or snapshot); semantics and version-store/lock costs are database-specific.
- **Transaction lifetime** — Start immediately before required database work and commit/dispose promptly; long scopes hold locks/resources and increase contention/failure exposure.
- **Nested transaction boundary** — Starting a second transaction on a context/connection does not generally create independently committing nested transactions; use savepoints or an explicit provider-supported nested mechanism, and understand ambient scopes.

## Cross-item comparison

SaveChanges' implicit transaction handles one call; an explicit transaction spans several calls/commands. A savepoint can undo work after a checkpoint while retaining earlier outer-transaction work. `Rollback()` aborts the full transaction. `UseTransaction` shares an underlying relational transaction but not EF tracker state. Ambient scope can cross APIs/providers but can escalate and is more environment-sensitive.

## Examples

```csharp
await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
try
{
    db.Orders.Add(order);
    await db.SaveChangesAsync(cancellationToken);

    await transaction.CreateSavepointAsync("BeforeAudit", cancellationToken);
    db.AuditEntries.Add(audit);
    await db.SaveChangesAsync(cancellationToken);

    await transaction.CommitAsync(cancellationToken);
}
catch
{
    await transaction.RollbackAsync(cancellationToken);
    throw;
}
```

The explicit rollback aborts all transaction work, not just the savepoint. To recover at the checkpoint and continue, call `RollbackToSavepointAsync` and decide how to repair the state. Be especially cautious with MARS and provider transaction failures.

## Common mistakes

- Keeping transactions open during network/user interactions.
- Assuming a savepoint is a nested commit.
- Calling `AutoTransactionBehavior.Never` without checking SaveChanges command count/partial-write risk.
- Using `UseTransaction` with a different connection than the context.
- Assuming ambient transaction support or distributed escalation is portable.
- Continuing a transaction after a failure without knowing whether it was rolled back to savepoint.
- Enabling SQL Server MARS and assuming EF still makes savepoints.

## Knowledge checks with answers

1. **What does EF normally do for a single SaveChanges?** Wraps changes in a transaction if supported/needed.
2. **What happens when SaveChanges fails inside a transaction with a savepoint?** EF normally rolls back to the savepoint, leaving earlier transaction work intact.
3. **Does `RollbackToSavepoint` commit prior work?** No.
4. **What context requirement applies to cross-context transactions?** Shared relational connection and the same underlying DbTransaction.
