# transactions savepoints retry execution strategies and concurrency — Exercises and worked solutions

Source basis: Microsoft [transactions](https://learn.microsoft.com/en-us/ef/core/saving/transactions), [connection resiliency](https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency), and [concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency).

## Goals

- Decide whether to use implicit SaveChanges transactions, explicit transactions, or savepoints.
- Wrap manual transactions correctly when provider retries are enabled.
- Make replay safe and resolve unknown commit outcomes.
- Separate transient provider failures from stale-data conflicts.

## Worked example

An order and an outbox message must commit atomically despite transient database errors. The request carries a stable operation ID with a unique constraint.

```csharp
var strategy = db.Database.CreateExecutionStrategy();
await strategy.ExecuteAsync(async () =>
{
    await using var attempt = await factory.CreateDbContextAsync(cancellationToken);
    await using var tx = await attempt.Database.BeginTransactionAsync(cancellationToken);
    attempt.Orders.Add(new Order { Id = operationId, CustomerId = customerId });
    attempt.OutboxMessages.Add(new OutboxMessage { Id = operationId, Type = "OrderPlaced" });
    await attempt.SaveChangesAsync(cancellationToken);
    await tx.CommitAsync(cancellationToken);
});
```

The database transaction covers both records. A retry may rerun the delegate; the stable ID makes duplicate attempts detectable. External message delivery happens after commit through an outbox dispatcher, not as a direct side effect inside the delegate.

## Exercises

1. Two SaveChanges calls and a read must either all commit or all roll back. Design the transaction boundary and disposal behavior.
2. A developer enables `EnableRetryOnFailure`, starts `BeginTransactionAsync`, then calls `SaveChangesAsync`. Why may it throw and how do you fix it?
3. A SQL Server connection string enables MARS. An update fails inside an existing transaction. Explain the risk and recovery approach.
4. A network error occurs while `CommitAsync` is waiting. Can the client assume the operation failed? Design verification.
5. An execution strategy retries a transaction that sends email before saving the order. What breaks and how do you redesign it?
6. A concurrency token mismatch occurs. Should the provider execution strategy retry the same SaveChanges automatically? Explain.
7. An insert retry uses a store-generated identity key. Explain why unknown commit is dangerous and how client key/idempotency helps.
8. Two contexts must write/query under one transaction. What must they share and what remains separate?
9. A concurrency error occurs during SaveChanges inside a transaction. Explain savepoint behavior and MARS caveat.
10. The application sets `AutoTransactionBehavior.Never` to improve speed. What correctness risk must be tested?
11. A deadlock/serialization abort occurs. How do you decide whether to retry?
12. A provider retry policy allows 6 retries, HTTP request timeout is 3 seconds, and a command may take 2 seconds. Explain why total latency needs coordinated bounds.

## Progressive hints

1. Begin transaction before first operation; commit only after all work; `await using` for cleanup.
2. Each EF command is not sufficient; the full manually grouped unit needs strategy replay.
3. MARS disables EF automatic savepoints; failed save can leave transaction state unknown.
4. Commit may have succeeded. Check durable operation ID or transaction marker before deciding.
5. Retry may send duplicates. Use an outbox/after-commit dispatcher with deduplication.
6. No; stale-state conflict needs a domain policy, not infrastructure retry.
7. If commit succeeded but acknowledgement was lost, retry may insert a second row with new identity. Stable client key/unique op ID provides idempotency/verification.
8. Shared relational connection and transaction; separate change trackers/entities.
9. EF normally rolls back to auto-savepoint; with MARS it creates none.
10. A multi-command SaveChanges may partially commit if later command fails.
11. Check provider's strategy/error classification and whether the transaction unit is safe to replay.
12. Retries add delays and timeouts; align command, execution, request, and upstream deadlines.

## Complete solutions

1. Use one explicit transaction around all operations/read that require the same database atomicity; commit after all succeed and roll back/dispose on exceptions. Keep it short and use the target provider's semantics. If transient retry is enabled, wrap the entire delegate in the configured execution strategy and recreate context/transaction per attempt.

2. Implicit retry strategy treats each command/SaveChanges independently and does not know how to replay a user transaction as one logical unit. Call `var strategy = db.Database.CreateExecutionStrategy()` and execute a delegate that creates the context/transaction, performs all operations, and commits. Ensure the delegate is replay-safe.

3. EF skips creating savepoints when SQL Server MARS is enabled even if no active reader uses it. If SaveChanges fails, the outer transaction may be in unknown state. Prefer disabling MARS when not needed; otherwise roll back/dispose the transaction and context rather than assuming savepoint recovery, then retry/reconcile from a clean unit.

4. No. The database may have committed and lost acknowledgement. Check for a durable client-generated operation ID/unique row/transaction marker or use `ExecuteInTransactionAsync` verification. If found, treat as success; if absent, retry idempotently; if unresolved, surface uncertain status/reconcile.

5. The execution strategy can invoke the delegate multiple times, sending duplicate email. Persist order + outbox record atomically; dispatch email/message after commit through a deduplicating worker. If calling a payment provider, pass an idempotency key and reconcile its outcome separately.

6. No. A concurrency token conflict is a stale-data condition; requery/compare original, proposed, and database values, then merge, reject, or apply explicit client/store-wins policy. Retry after refreshing original values only when the chosen result is valid.

7. Commit may have inserted the row but the app did not receive confirmation; replay with a generated identity may insert another row. Use a client-generated stable ID or idempotency key protected by a unique constraint, then verify the prior result. A duplicate-key exception can be interpreted only after checking the operation's durable state.

8. Both contexts must use the same relational `DbConnection` and enlist in the same `DbTransaction` using `UseTransaction`. Each context still has separate identity map/change tracker, so don't attach duplicate tracked instances to both and expect synchronized state.

9. EF normally makes an automatic savepoint before SaveChanges and rolls back to it on error, leaving earlier outer-transaction work intact. With SQL Server MARS no savepoint is created; transaction state after failure may be unknown. A token conflict still needs merge/reject policy before retry.

10. If SaveChanges sends multiple SQL commands and a later one fails, earlier commands may have already committed, leaving partial state. Test failure injection for multi-command writes and don't disable automatic transactions without independent atomicity guarantees.

11. Use provider documentation/strategy classification. Some deadlocks/serialization failures may be transient and retryable; check exception type/state, isolation semantics, and full unit replay safety. Do not retry permanent constraint/data errors or token conflicts as though they were transient.

12. A strategy's attempts and backoff can exceed the request's 3-second deadline even when one command is 2 seconds. Set compatible command/connection timeouts, retry count/delay, cancellation, and upstream budgets; consider whether the operation should be queued/backgrounded. Avoid nested retry policies that multiply attempts.

## Tests and edge cases

- Inject a failure between multiple SaveChanges calls and verify all-or-nothing transaction state.
- Test SaveChanges failure with savepoints enabled and with MARS configured.
- Simulate a transient error before commit and a connection break during commit separately.
- Verify unknown outcomes through an operation ID and ensure one durable result only.
- Test that retry delegate performs no duplicate external side effects.
- Use a real provider for deadlock, isolation, savepoint, and retry classification tests.
- Test concurrency token mismatch separately from transient connection errors.
- Verify context disposal/recreation and tracker acceptance when operation succeeds/fails.
- Confirm cancellation and total retry latency obey end-to-end deadlines.

## Reflection questions

- What is the exact logical unit that must replay together?
- Can replay send any external side effect twice?
- How do you know whether commit succeeded if acknowledgement is lost?
- Is the failure a transient infrastructure error or stale business data?
- What are the provider-specific transaction and savepoint assumptions?
