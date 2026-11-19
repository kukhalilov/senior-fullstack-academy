# transactions isolation levels blocking locks deadlocks and row versioning — Big-picture orientation and mental model

# Problem and purpose

Transactions preserve application invariants while sessions work concurrently. Isolation defines what concurrent changes a transaction may observe; locks and row versions implement those semantics. Poor transaction scope causes blocking, deadlocks, version retention, and unsafe retries.

# Plain-language mental model

A transaction is a short lease over the facts it needs to keep consistent. Locks make conflicting work wait; row versions let selected readers use prior committed images. A deadlock is a cycle that SQL Server breaks by rolling back one victim. Optimized locking changes lock duration/volume, not the business invariant.

# How the parts fit together

1. Define the invariant and smallest atomic unit.
2. Choose isolation that prevents the relevant anomaly.
3. Keep transactions short and clean up every error path.
4. Use lock/wait DMVs, version diagnostics, and deadlock graphs as evidence.
5. Retry the whole transaction only after cleanup and idempotency safeguards.

# Concept map

| Need | Mechanism | Boundary |
| --- | --- | --- |
| Atomic multi-statement work | BEGIN/COMMIT/ROLLBACK | Nested BEGIN is a counter |
| Committed statement view | READ COMMITTED + RCSI | New snapshot per statement |
| Stable transaction view | SNAPSHOT | Update conflicts/write skew remain possible |
| Prevent predicate phantoms | SERIALIZABLE | Key-range locks need a suitable index; otherwise broader protection can block more |
| Reduce write lock pressure | Optimized locking | SQL Server 2025 opt-in + ADR; LAQ needs RCSI |

# End-to-end walkthrough

An inventory reservation must not exceed available quantity. A read followed by a later update can lose updates. Prefer one conditional atomic update and check affected rows, or choose a transaction contract that protects the invariant. SNAPSHOT may abort same-row conflicts with 3960; RCSI reduces reader/writer blocking but does not serialize writers. Keep network calls outside the transaction and make retries idempotent.

# When to use it and tradeoffs

Use row versioning to reduce reader/writer contention when its consistency and storage cost fit. Use stronger isolation or targeted locks when correctness requires range exclusion. Optimized locking can reduce DML lock pressure where available. Test simultaneous sessions; each mechanism changes blocking, storage, or retry behavior.

# What later lessons cover

This lesson covers SQL Server transaction/concurrency semantics. Distributed transactions, outbox, and application retry architectures live in track-08; broad waits are in t03-013.

# Sources

- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-objects/sys-dm-tran-locks-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-waiting-tasks-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-tran-version-store-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-tran-active-snapshot-database-transactions-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-getapplock-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-releaseapplock-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/functions/xact-state-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/functions/trancount-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-xact-abort-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)
