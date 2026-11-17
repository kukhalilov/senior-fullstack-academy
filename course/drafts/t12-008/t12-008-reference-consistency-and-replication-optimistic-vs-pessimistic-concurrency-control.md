# system design tradeoffs and decision methods — Reference: Optimistic vs pessimistic concurrency control

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [PostgreSQL concurrency control](https://www.postgresql.org/docs/current/mvcc.html), [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html), [SQL Server transaction locking and row versioning](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide).

## Scope and version

Concurrency control determines what happens when transactions overlap. “Optimistic” and “pessimistic” describe strategies, not a guarantee that the database uses no locks or no validation.

## How this group fits the mental model

**Optimistic control** lets work proceed and checks for conflicts at commit/update time, often with a version or predicate validation. A conflict aborts/rejects one attempt, and the caller retries or reports a conflict. It fits low-conflict work where retry is affordable.

**Pessimistic control** acquires a lock or reservation before conflicting work proceeds. It can avoid wasted computation under high contention, but waiters consume resources and can deadlock, time out, or reduce concurrency. Lock scope and duration matter.

MVCC is a separate implementation technique: it allows readers to observe snapshots while writes create versions, and may coexist with row locks and optimistic validation. PostgreSQL and SQL Server offer multiple concurrency mechanisms; do not assume a product is purely optimistic or purely pessimistic.

## Supplied names explained

Neither strategy enforces every invariant automatically. A check-then-write sequence can race unless protected by a constraint, correct isolation, lock, compare-and-swap/version check, or serializable transaction. Retry logic must rerun the whole transaction safely and bound attempts.

## Cross-item comparison

For a mostly-read catalog with rare edits, optimistic version checks avoid holding locks while users edit; a stale save receives a conflict and can be merged. For a scarce-seat reservation with high contention, a conditional update or short row lock can serialize the critical decision. Benchmark conflict rate, lock wait, abort/retry rate, transaction duration, deadlocks, and user-visible retry behavior.

## Examples

Two transactions both read stock=1. Under optimistic version checking, each tries to update only if the version is unchanged; one succeeds and the other detects conflict/retries, preventing oversell if the check is atomic. Under a row lock, the second transaction waits, then sees stock=0 and fails. A plain application-side read followed by an unguarded write can oversell under either label.

## Common mistakes

- Assuming optimistic means lock-free or that conflicts never occur.
- Holding pessimistic locks across network calls or slow user interaction.
- Retrying only the final statement when correctness requires rerunning the transaction's reads and checks.
- Relying on an application check instead of an atomic constraint/update for a shared invariant.

## Knowledge checks with answers

1. **When is optimistic control attractive?** Conflict is infrequent and a rejected attempt can be retried safely.
2. **What can pessimistic locking cost?** Wait time, deadlocks, resource occupancy, and reduced concurrency.
3. **How can both approaches prevent two sales of the final item?** Atomic compare-and-update/version validation or a lock/transaction that protects the stock invariant.
