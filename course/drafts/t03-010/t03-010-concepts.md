# transactions isolation levels blocking locks deadlocks and row versioning — Core concepts and how they fit together

# Learning objectives

Model transaction state; distinguish isolation levels and anomalies; explain locks/deadlocks; monitor version retention; and state SQL Server 2025 optimized-locking prerequisites and limits.

# Prerequisites

Know SQL DML, constraints, indexes, sessions, and application transaction boundaries.

# Core concepts

ACID is a goal, not a blanket concurrency guarantee. Autocommit makes each statement its own transaction. Explicit BEGIN remains open until outer COMMIT/full ROLLBACK; nested BEGIN only increments @@TRANCOUNT. Savepoints allow partial rollback only while committable. In errors, @@TRANCOUNT reports scope while XACT_STATE reports whether commit is possible. A connection returned to a pool must not retain an open/doomed transaction.

READ UNCOMMITTED permits dirty reads. READ COMMITTED is default: locking reads use shared locks when RCSI is OFF; RCSI ON gives each statement a committed snapshot. REPEATABLE READ retains locks on rows already read but allows new matching rows. SERIALIZABLE protects predicate ranges when an indexed range access is available. SNAPSHOT gives a transaction-level committed view and detects conflicting same-row writes, but can permit write skew across rows.

Row versions reduce some reader/writer waits, not writer conflicts or schema locks. Versions consume storage and cleanup can be delayed by active snapshots. ADR uses a persistent version store (PVS) in the user database; traditional version storage otherwise uses tempdb.

A lock request is a resource plus a mode. S/U/X and intent modes have compatibility rules; Sch-S/Sch-M protect metadata. Blocking is a wait. Deadlock is a cycle; the monitor picks a victim, rolls back its transaction, and returns error 1205. Lock escalation trades fine-grained tracking for coarser contention.

# Mechanisms and relationships

Optimized locking uses transaction-ID locks to shorten row/page lock lifetimes. LAQ evaluates DML predicates against the latest committed row version before locking qualifying rows. SQL Server 2025 supports optimized locking but leaves it disabled by default; ADR is required. LAQ additionally requires RCSI and READ COMMITTED. Conflicting hints, statement forms, isolation, and table types can disable LAQ. Under optimized locking plus RCSI, do not assume strict execution ordering; use stronger isolation/locking when the invariant requires serialization.

# Worked examples

Two SNAPSHOT transactions read a shared invariant and update different rows. Both may commit because they changed different rows, yet jointly violate the invariant: use SERIALIZABLE or explicit invariant enforcement. A serializable range read can use key-range locks to prevent phantoms if its index key covers the predicate.

# Misconceptions and edge cases

- NOLOCK allows inconsistent data and still takes Sch-S.
- RCSI gives statement snapshots, not one transaction snapshot.
- Lock timeouts are not deadlocks and do not guarantee transaction cleanup.
- ROWLOCK does not prevent escalation.
- Optimized locking does not remove schema locks, all deadlocks, or writer conflicts.
- Snapshot isolation is not serializable.

# Knowledge checks with answers

1. What is retained by RCSI? A statement-start committed version.
2. What must precede enabling optimized locking? ADR.
3. What is needed for LAQ? Optimized locking, RCSI ON, READ COMMITTED, and an eligible statement.

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
