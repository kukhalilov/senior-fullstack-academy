# transactions isolation levels blocking locks deadlocks and row versioning — Reference: Transaction lifecycle, isolation, and row-versioning

# Scope and version

Targets SQL Server 2025 (17.x) unless a platform boundary is named. Azure SQL, Fabric, and Synapse can differ. This table explains every exact inventory item assigned to the group.

# How this group fits the mental model

Transactions define atomicity; isolation defines visibility; locks and versions implement concurrent behavior. Diagnose current session/database state before applying hints.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `BEGIN TRANSACTION` | Starts an explicit transaction; locks and modifications remain until the outermost COMMIT or full ROLLBACK. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `COMMIT TRANSACTION` | Decrements @@TRANCOUNT; only the outermost COMMIT commits. An inner COMMIT is not independently durable. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `ROLLBACK TRANSACTION` | Without a savepoint name, rolls back the whole transaction and resets @@TRANCOUNT. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `SAVE TRANSACTION` | Creates a partial rollback marker inside a local committable transaction; it is not a nested transaction. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `@@TRANCOUNT` | Nesting counter, not a committability indicator. Pair with XACT_STATE. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/trancount-transact-sql?view=sql-server-ver17)) |
| `XACT_STATE` | Returns 1 committable, -1 uncommittable, 0 no transaction. State -1 requires full rollback. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/xact-state-transact-sql?view=sql-server-ver17)) |
| `SET XACT_ABORT` | ON makes many run-time errors terminate and roll back the transaction; THROW honors it, RAISERROR does not. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-xact-abort-transact-sql?view=sql-server-ver17)) |
| `Implicit transaction` | A qualifying statement starts a transaction that remains open until explicit COMMIT or ROLLBACK; inspect @@TRANCOUNT before returning pooled connections. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Autocommit transaction` | Each successful statement commits as its own transaction when neither explicit nor implicit transaction mode is active. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Read uncommitted` | Permits dirty/inconsistent reads that may later roll back. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Read committed` | Default isolation. Locking reads use S locks when RCSI is off; with RCSI on, reads normally use statement-start versions. Writers still conflict. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Read committed snapshot isolation (RCSI)` | Database option gives each READ COMMITTED statement its own committed snapshot, not one snapshot for a transaction. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Repeatable read` | Retains locks on rows already read, preventing their changes but allowing new qualifying rows (phantoms). ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Snapshot isolation` | Transaction-level row-versioned view; requires ALLOW_SNAPSHOT_ISOLATION ON and may abort a same-row conflict. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Serializable isolation` | Prevents phantoms by ensuring repeated statements in a transaction see the same qualifying set. SQL Server can use indexed key-range locks when the plan uses a suitable index; without that access path it must use coarser protection, which can be more blocking. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Isolation-level anomaly` | Distinguish dirty, nonrepeatable, phantom, lost-update, and write-skew anomalies; select protection based on the invariant and access pattern. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Dirty read` | Read of uncommitted data that may change or roll back. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Nonrepeatable read` | Same row has a different value on a second read after another transaction commits an update. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Phantom read` | A repeated predicate returns a changed set because another transaction inserts/deletes qualifying rows. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Lost update` | Concurrent read-modify-write overwrites another change; use atomic updates or conflict protection. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Write skew` | Snapshot transactions modify different rows based on a shared invariant, jointly violating it; SNAPSHOT is not SERIALIZABLE. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Row version store` | RCSI/SNAPSHOT versions remain while active readers need them; distinguish traditional tempdb storage from ADR persistent version store. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-tran-version-store-transact-sql?view=sql-server-ver17)) |
| `tempdb version store` | Without ADR, row versions commonly consume tempdb; investigate generation/cleanup rates and long-running snapshots. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-tran-version-store-transact-sql?view=sql-server-ver17)) |
| `Accelerated Database Recovery persistent version store` | With ADR, row versions use database PVS rather than tempdb’s traditional version store. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-tran-version-store-transact-sql?view=sql-server-ver17)) |
| `Transaction scope` | Transactions normally belong to the connection; an open transaction can retain locks and versions after application work appears finished. Under MARS, explicit or implicit transactions are batch-scoped instead. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `MARS batch-scoped explicit or implicit transaction` | With Multiple Active Result Sets enabled, an explicit or implicit transaction belongs to its batch. If that batch ends without COMMIT or ROLLBACK, SQL Server automatically rolls it back. Do not assume ordinary connection-scoped lifetime. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Long-running transaction` | An open transaction can retain locks and delay version cleanup or log truncation; find its session and snapshot age before intervening. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Nested BEGIN TRANSACTION counter behavior` | Nested BEGIN increments @@TRANCOUNT but creates no independently durable nested transaction; only full rollback ends all levels. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Snapshot update conflict` | Usually error 3960: snapshot transaction updates a row changed since its snapshot; restart the whole transaction. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Transaction retry boundary` | Retry the whole logical unit in a fresh transaction with bounded backoff and idempotent side effects. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `SET TRANSACTION ISOLATION LEVEL syntax` | Sets the session isolation level for subsequent statements; it does not retroactively change a running statement. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `RCSI statement-level snapshot` | Each READ COMMITTED statement sees committed versions from its own start time; multiple statements in one transaction can observe different commits. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Snapshot transaction-level snapshot` | Statements share a transaction-level committed view established at first data access, plus the transaction’s own modifications. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Snapshot update conflict error 3960` | SQL Server aborts the SNAPSHOT transaction when its target row changed after the transaction snapshot began; roll back and retry the entire unit in a fresh transaction. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Snapshot isolation across multiple databases` | ALLOW_SNAPSHOT_ISOLATION must be ON in every database the transaction accesses; it does not create a distributed snapshot. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `SET IMPLICIT_TRANSACTIONS` | Automatically starts transactions for qualifying statements; explicitly commit/rollback before reusing a pooled connection. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `XACT_ABORT and uncommittable transaction` | XACT_ABORT changes many run-time error outcomes; CATCH must inspect XACT_STATE because an active transaction can be doomed. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-xact-abort-transact-sql?view=sql-server-ver17)) |
| `TRY/CATCH rollback with XACT_STATE` | In CATCH, fully roll back when XACT_STATE is nonzero; -1 cannot commit or roll back to a savepoint. Rethrow after cleanup. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/xact-state-transact-sql?view=sql-server-ver17)) |
| `Savepoint rollback does not end transaction` | Rollback to savepoint leaves transaction active and @@TRANCOUNT unchanged; it cannot restore a doomed transaction. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `NOLOCK still takes schema stability locks` | NOLOCK skips data S locks, not Sch-S. DDL Sch-M still conflicts. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Lock timeout is not deadlock detection` | Timeout means a wait exceeded LOCK_TIMEOUT; no cycle is required and an enclosing transaction may remain active. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `RCSI does not eliminate writer conflicts` | Versioned reads reduce reader/writer waits; writers still serialize or fail on conflicts, and metadata locks remain. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Key-range locks require SERIALIZABLE and a suitable index; SERIALIZABLE still protects semantics when coarser locks are needed` | A key-range lock specifically requires SERIALIZABLE and an access plan using an index key that covers the range predicate. The isolation guarantee itself does not disappear without that index; SQL Server may need broader locking. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Version store retention from oldest active snapshot` | An old active snapshot can hold needed versions and delay cleanup. Find oldest snapshot transactions/XSN before blaming a leak. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `ADR persistent version store placement` | ADR stores row versions in the database PVS rather than tempdb traditional version store; monitor user-database capacity and cleanup. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-tran-version-store-transact-sql?view=sql-server-ver17)) |

# Cross-item comparison

RCSI is statement-level; SNAPSHOT is transaction-level. A wait is not necessarily a deadlock. @@TRANCOUNT counts nesting, while XACT_STATE determines committability. TID locking reduces lock duration/count but does not remove schema locks or writer conflicts.

# Examples

Compare a two-statement READ COMMITTED transaction under locking versus RCSI, then SNAPSHOT. For a deadlock, map each process’s owned/requested resources into a cycle before changing access order.

# Common mistakes

- Confusing a lock timeout with deadlock.
- Assuming NOLOCK bypasses Sch-M.
- Assuming RCSI gives a transaction snapshot.
- Treating optimized locking as universal/default on SQL Server 2025.

# Knowledge checks with answers

1. What does XACT_STATE=-1 mean? Active but uncommittable; full rollback is required.
2. Does SNAPSHOT prevent write skew across different rows? Not necessarily.
3. What breaks a deadlock cycle? Victim rollback with error 1205.

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
