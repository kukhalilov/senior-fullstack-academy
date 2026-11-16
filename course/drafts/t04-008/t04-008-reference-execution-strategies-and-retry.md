# transactions savepoints retry execution strategies and concurrency — Reference: Connection resiliency, retry strategies, and unknown commit outcomes

## Scope and version

Based on Microsoft's [connection resiliency guide](https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency) and [transaction documentation](https://learn.microsoft.com/en-us/ef/core/saving/transactions). Retry classifications and default delay/counts are provider-specific; inspect the provider configuration/version.

## How this group fits the mental model

An execution strategy classifies certain provider errors as transient and reruns a unit of work. Manual transactions group several operations, so the strategy must replay the entire group. A commit acknowledgement failure may leave the actual database outcome unknown, requiring verification or idempotency.

## Supplied names explained

- **EnableRetryOnFailure** — Provider options method enabling a provider execution strategy's retry behavior (commonly SQL Server); it does not retry every exception.
- **ExecutionStrategy** — Policy object that executes delegates and retries provider-classified transient failures.
- **IExecutionStrategy** — Public interface for provider execution-strategy execution methods.
- **IExecutionStrategy.Execute** — Synchronous execution wrapper; the full unit must be safe to repeat.
- **IExecutionStrategy.ExecuteAsync** — Async execution wrapper with cancellation/operation delegate; retry can invoke it again.
- **CreateExecutionStrategy** — Gets the configured strategy from `DatabaseFacade`; use it around a manually controlled transaction.
- **Execution-strategy retry** — Replays failed EF commands/transaction delegate when provider marks exception transient; it does not resolve validation or stale-data conflicts.
- **Transient database error** — Temporary provider/database/transport condition that may succeed later (for example failover/timeouts); exact exception classification is provider-defined.
- **Retry delay** — Backoff between attempts; affects latency and load. Avoid synchronized aggressive retries and account for total request deadline.
- **MaxRetryCount** — Maximum retry attempts/configured limit for strategy; total operation attempts include the first attempt as defined by provider settings.
- **MaxRetryDelay** — Cap on configured backoff delay; actual schedule may vary by provider strategy.
- **Execution timeout** — Limit for a command/operation or overall app request; retries can make total elapsed time exceed one command timeout unless bounded coherently.
- **Manual transaction with retry strategy incompatibility** — Implicit per-command retry cannot safely replay a user-defined transaction as a whole. Use `CreateExecutionStrategy().Execute/ExecuteAsync` around all operations.
- **ExecuteInTransaction** — Execution-strategy helper that executes an operation inside a transaction and can verify outcome after commit-related transient failure.
- **ExecuteInTransactionAsync** — Async overload with operation and optional verification callbacks.
- **verifySucceeded callback** — Queries durable state after uncertain commit to decide whether the operation actually succeeded before retrying.
- **Unknown commit outcome** — Connection lost during commit; database may have committed even though client saw an error.
- **Client-generated key for retry safety** — Stable client-generated identifier makes replay detectable/unique; store-generated keys can allow duplicate rows if commit succeeded but response was lost.
- **Idempotent write** — Repeated execution produces the same durable result rather than duplicate/mutated side effects; often enforced through stable operation ID and unique constraint.
- **Transaction replay** — Re-execution of the entire transaction's work from a clean state after transient failure; avoid non-idempotent external side effects inside.
- **Connection drop during commit** — Specific failure window with uncertain outcome; verify marker/entity by stable key or reconcile rather than assuming rollback.
- **ExecutionStrategyExtensions.ExecuteInTransactionAsync** — EF relational extension helper for transactional operation and `verifySucceeded`; use the public method/overload appropriate to the provider/EF package and inspect semantics.

## Cross-item comparison

An ordinary retry replays a command known to have failed transiently; unknown commit is ambiguous and needs verification. `DbUpdateConcurrencyException` means stale token/key predicate matched no row; it is not a transient transport error. `ExecuteAsync` retries a delegate; `ExecuteInTransactionAsync` also manages transaction/verification semantics. Client-generated IDs/unique keys and durable operation markers make replay safer but do not make arbitrary external effects transactional.

## Examples

```csharp
var strategy = db.Database.CreateExecutionStrategy();
await strategy.ExecuteAsync(async () =>
{
    await using var attempt = await factory.CreateDbContextAsync(cancellationToken);
    await using var transaction = await attempt.Database.BeginTransactionAsync(cancellationToken);

    attempt.Payments.Add(new Payment { Id = operationId, CustomerId = customerId });
    attempt.OutboxMessages.Add(new OutboxMessage { Id = operationId, Kind = "PaymentRequested" });
    await attempt.SaveChangesAsync(cancellationToken);
    await transaction.CommitAsync(cancellationToken);
});
```

This uses a stable operation ID and stores an outbox row atomically. It does not directly charge an external processor inside the retry delegate. If commit is uncertain, query by `operationId` before replaying.

## Common mistakes

- Retrying every exception regardless of whether it is transient.
- Wrapping only the final SaveChanges while earlier transaction commands remain outside the retry delegate.
- Reusing mutated tracker/context/transaction state across retries without resetting it.
- Sending email, publishing messages, or charging a card in a replayed delegate.
- Using generated keys without handling duplicate insert if commit outcome is unknown.
- Assuming timeout/MaxRetryCount only bounds one command instead of total request latency.
- Treating `verifySucceeded` as optional when the operation's outcome cannot otherwise be determined.

## Knowledge checks with answers

1. **What goes inside the retry delegate for a manual transaction?** All transaction creation, operations, SaveChanges calls, and commit that form the logical unit.
2. **What is the dangerous commit failure window?** The database may commit while the client loses the acknowledgement.
3. **How can stable IDs help?** They let retry/verification find or reject duplicate application of the same operation.
4. **Should a stale concurrency conflict be retried as transient?** No; refresh/merge/reject using application policy.
