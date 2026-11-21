# transactions savepoints retry execution strategies and concurrency — Interview questions and reasoning

Source basis: Microsoft [transactions](https://learn.microsoft.com/en-us/ef/core/saving/transactions), [connection resiliency](https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency), and [concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency).

## Core questions

1. What transaction boundary does EF Core provide by default?
2. When should an explicit transaction be used?
3. What is a savepoint and when does EF create one automatically?
4. What does SQL Server MARS change about EF savepoints?
5. Why are manual transactions incompatible with implicit retry strategies?
6. How do you retry a multi-operation transaction?
7. What is an unknown commit outcome?
8. How do client-generated keys and idempotency protect retry safety?
9. Why should external side effects stay out of retry delegates?
10. How does `ExecuteInTransactionAsync` help with commit failures?
11. Compare a concurrency conflict to a transient database failure.
12. How can multiple contexts share a transaction?
13. What risks come from disabling EF automatic SaveChanges transactions?
14. How do retry delay/counts interact with an HTTP deadline?

## Concise interview answers

1. When provider supports it, one SaveChanges call is normally transactional/atomic.
2. When multiple commands/SaveChanges or mixed operations must commit or roll back together.
3. A named rollback point within an open transaction. EF normally creates one before SaveChanges inside a user transaction.
4. MARS disables automatic savepoints even if not actively used; failed SaveChanges may leave the transaction in unknown state.
5. The strategy must replay the entire user transaction as one unit; per-command retries cannot safely replay only part.
6. Get the strategy with `CreateExecutionStrategy` and wrap transaction creation, all operations, and commit in its `Execute`/`ExecuteAsync` delegate.
7. A connection breaks during commit; the database may have committed while the client saw an error.
8. A stable client key/unique operation ID makes repeated attempts detectable and allows lookup/verification rather than duplicate insert.
9. The delegate may execute more than once; direct email/payment/message calls could be duplicated. Use outbox/idempotency and dispatch after commit.
10. It provides a `verifySucceeded` callback to check durable state after an ambiguous commit before replaying.
11. Transient failure is provider-classified infrastructure that may succeed on replay; concurrency conflict indicates data changed and needs application merge/reject policy.
12. Share the same relational connection and transaction; enlist the second context with `UseTransaction`.
13. A multi-command SaveChanges may partially persist if a later command fails.
14. Retries/backoff increase total elapsed time; align operation, command, retry, and request budgets and propagate cancellation.

## Deep follow-up answers

The default SaveChanges transaction is often enough; explicit scopes lengthen locks and hold resources, so use only for a real atomicity requirement. Savepoints allow recovering an outer transaction after a failed SaveChanges when supported, but they are not nested commits. MARS disables EF's SQL Server automatic savepoints.

Retry strategy configuration is provider-aware. Only selected transient errors retry, and EF may buffer query results when resiliency is enabled. A manually opened transaction must be represented as one replayable operation. Recreate context/transaction state inside the delegate and keep side effects idempotent. Avoid retry multiplicative layers that exceed request latency.

Commit failure differs from operation failure: the server may have committed despite lost acknowledgement. Verification via operation ID, unique key, transaction marker, or `verifySucceeded` callback avoids assuming rollback. With `SaveChanges(false)`, defer tracker acceptance until outcome is confirmed; discard/recreate context after unresolved rollback.

Optimistic concurrency checks the original token in the update/delete predicate. It intentionally reports stale data and requires merge or rejection. It is not fixed by replaying the same values, and it is not the same as provider errors such as lock timeout, deadlock, or serialization failure. Those may be transient, but provider policy and transaction replay safety decide.

## Scenario questions

### Scenario: database commit succeeded but API timed out

**Strong approach:** Treat outcome as unknown. Query by stable client operation ID or verification marker before retry. Return existing operation result if committed; perform once if absent; reconcile if verification is unavailable. Avoid using only a generated key unknown to the client.

### Scenario: retry creates duplicate email

**Strong approach:** Explain replay. Persist an outbox record atomically and let a worker dispatch with a stable dedupe key, or use the provider's idempotency mechanism for external calls. Do not publish directly in the retry block.

### Scenario: update receives DbUpdateConcurrencyException

**Strong approach:** Re-read database values, compare original/proposed/database state, enforce domain invariants, merge or report conflict, refresh token and retry within a bound only if chosen. Don't treat it as a transient timeout.

### Scenario: SaveChanges failed inside explicit SQL Server MARS transaction

**Strong approach:** EF did not create savepoint. Do not continue assuming transaction is clean. Roll back/dispose/recreate context where possible, disable MARS if unnecessary, and test provider-specific recovery.

## Tradeoffs and alternatives

- Implicit SaveChanges transaction is simple and short; explicit multi-operation transaction adds atomicity but can increase lock/resource duration.
- Retrying transient errors improves availability; retries add latency/load and need idempotency.
- Client-generated operation keys aid verification; database-generated values are convenient but ambiguous commits can duplicate writes.
- Optimistic tokens avoid up-front locks; pessimistic isolation/locking can fit high-contention invariants but adds blocking/deadlocks.
- Savepoint recovery keeps an outer transaction open; full rollback/reset is safer when transaction state is uncertain.

## Common weak answers

- “EF wraps every query and every whole business workflow in one transaction.”
- “Savepoints commit the transaction so far.”
- “MARS doesn't matter if no reader is active.”
- “Retry strategy can retry arbitrary manual transaction automatically.”
- “A failed commit means no rows were written.”
- “Retry is always safe because EF uses transactions.”
- “Concurrency exception is a transient error.”
- “Email and database insert are atomic in one EF transaction.”

## Self-check rubric

Identify the failure class, exact transaction/replay unit, provider support, possible commit ambiguity, duplicate side effects, and resolution policy. Explain how you prove durable outcome and bound the total retry time.
