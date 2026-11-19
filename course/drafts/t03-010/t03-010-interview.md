# transactions isolation levels blocking locks deadlocks and row versioning — Interview questions and reasoning

# Core questions

1. What does isolation change and what remains true for writes?
2. RCSI versus SNAPSHOT?
3. READ COMMITTED versus REPEATABLE READ versus SERIALIZABLE?
4. @@TRANCOUNT versus XACT_STATE?
5. Blocking versus deadlock?
6. How is a deadlock victim selected and handled?
7. Why is NOLOCK unsafe?
8. What does a key-range lock protect?
9. Where do versions live with ADR?
10. What are TID locking and LAQ?
11. What enables optimized locking and LAQ?
12. How should a client retry 1205 or snapshot conflict?

# Concise interview answers

1. Isolation changes visibility/locking; writers still need conflict protection and can block/fail.
2. RCSI gives statement-start snapshots under READ COMMITTED; SNAPSHOT gives one transaction view and can abort same-row conflicts.
3. READ COMMITTED prevents dirty reads; REPEATABLE READ retains row locks but allows phantoms; SERIALIZABLE prevents phantoms. Indexed key ranges make that protection more targeted, while broader locking can be more expensive.
4. @@TRANCOUNT counts nesting; XACT_STATE says absent, committable, or doomed.
5. Blocking is one-way waiting; deadlock is a cycle automatically broken by victim rollback.
6. Lower DEADLOCK_PRIORITY loses; equal priorities use rollback cost, with a random tie if costs also match. The deadlock victim transaction is rolled back and receives 1205.
7. It permits dirty/missing/duplicate/inconsistent observations and still takes Sch-S.
8. Protects qualifying key intervals from phantoms when SERIALIZABLE uses a suitable index. The isolation guarantee still applies without one, potentially through broader locks.
9. ADR stores versions in database PVS; traditional versions otherwise use tempdb.
10. TID retains a transaction lock while releasing many row/page locks earlier. LAQ qualifies DML against the latest version committed as of statement start, then locks qualifying rows.
11. ADR is required; SQL Server 2025 is opt-in. LAQ additionally needs RCSI ON and READ COMMITTED.
12. Clean up and retry the whole business unit in a new transaction with bounded backoff and idempotent effects.

# Deep follow-up answers

A savepoint permits partial rollback only while committable; XACT_STATE=-1 requires full rollback. Nested BEGIN does not create nested commit scope. RCSI reduces reader/writer blocking but does not protect cross-row invariants; SNAPSHOT can still allow write skew.

Optimized locking does not remove all locks/deadlocks. LAQ can alter observed blocking/order under RCSI because it checks latest committed rows. Verify feature flags and use stronger isolation for a stated correctness requirement.

# Scenario questions

**Frequent 1205 errors appear after deployment.** Preserve deadlock XML, inspect victim/process/resource lists, identify resource order and transaction duration, then fix order/scope or the actual invariant. Add bounded whole-transaction retry only with idempotency; monitor rate and graph shape.

# Tradeoffs and alternatives

RCSI favors reader throughput but consumes versions and gives statement snapshots. SNAPSHOT gives transaction consistency but can produce update conflicts and write skew. SERIALIZABLE protects ranges but raises contention. Application locks coordinate logical resources but require shared naming/order. Optimized locking can reduce write lock pressure when eligible.

# Common weak answers

- “NOLOCK means no locks.”
- “RCSI makes the whole transaction repeatable.”
- “A deadlock is just long blocking.”
- “Nested BEGIN creates a savepoint.”
- “Disable escalation and set deadlock priority high.”
- “SQL Server 2025 turns optimized locking on automatically.”

# Self-check rubric

Score 0–2: (0) slogan/hint only; (1) mechanism but misses anomaly/cost; (2) states correctness contract, exact visibility/lock/version behavior, platform prerequisites, evidence, and full cleanup/retry path.

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
