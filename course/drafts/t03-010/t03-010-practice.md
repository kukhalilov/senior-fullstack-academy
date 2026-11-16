# transactions isolation levels blocking locks deadlocks and row versioning — Exercises and worked solutions

# Goals

Choose an isolation contract, explain wait cycles, clean up transaction errors, and design a safe retry boundary.

# Worked example

Two transfers update accounts in opposite order and deadlock. Normalize account order, keep the transaction short, capture xml_deadlock_report, and retry the entire operation after 1205 with bounded backoff. Ensure external effects are idempotent. Raising deadlock priority does not remove the cycle.

# Exercises

1. Compare two READ COMMITTED reads when RCSI is OFF and ON.
2. A transaction checks an absent email then inserts. Explain the race and two correct designs.
3. Why can a nested procedure COMMIT while the caller still has an open transaction?
4. What is allowed when XACT_STATE()=-1?
5. Why can NOLOCK still block during schema deployment?
6. Explain a shared-to-exclusive conversion deadlock and U locks.
7. Why retry the entire transaction after 1205 or 3960?
8. tempdb/PVS grows after row versioning. What should you inspect?
9. Two SNAPSHOT transactions update different rows under a shared invariant. Explain write skew.
10. SQL Server 2025 seems not to use optimized locking. Check prerequisites/state.
11. LAQ causes a concurrent predicate update to skip a row. Why can that happen?
12. There are long blocking chains but no deadlock reports. What do you capture?
13. After LOCK_TIMEOUT, is the connection safe to return to a pool?
14. Explain sp_getapplock naming, owner, return codes, and ordering.

# Progressive hints

1. Distinguish statement from transaction snapshots.
2. Use a unique constraint or protect the predicate range.
3. Inner COMMIT decrements a counter.
4. A doomed transaction requires full rollback.
5. NOLOCK does not skip schema locks.
6. Examine each session's held and requested resources/modes.

# Complete solutions

1. Locking READ COMMITTED may see a newly committed value on the second statement; RCSI starts a new committed snapshot per statement. Neither is transaction-wide SNAPSHOT.
2. A concurrent insert can race after the check. Use a unique constraint and handle duplicate-key, or SERIALIZABLE with indexed key-range protection. Check-then-act alone is not atomic.
3. Nested BEGIN/COMMIT changes @@TRANCOUNT; only outer COMMIT commits. Define transaction ownership/savepoint behavior.
4. Only full rollback; no commit or rollback-to-savepoint. Use XACT_STATE in CATCH and rethrow after cleanup.
5. NOLOCK skips data S locks but still takes Sch-S, which conflicts with DDL Sch-M.
6. Both transactions may hold S and wait to convert to X. U locks serialize one prospective updater; consistent order/atomic updates and short scopes help more broadly.
7. Earlier reads/decisions may be stale. Restart all checks/writes under a fresh transaction, with idempotent outside effects.
8. Find long-lived snapshots and cleanup blockers. ADR places PVS in the user DB; otherwise traditional versions use tempdb. Avoid scanning a huge version-store DMV casually.
9. Snapshot may not detect writes to different rows; use SERIALIZABLE, atomic invariant design, or explicit coordination.
10. Check platform, sys.databases ADR/RCSI/is_optimized_locking_on, isolation and hints. SQL Server 2025 opt-in; LAQ also needs RCSI+READ COMMITTED.
11. LAQ qualifies against latest committed row versions and can avoid waiting; this can change observed ordering. Use stricter isolation/locking when ordering is a correctness requirement.
12. Capture wait/resource, blocker, SQL, transaction age, and application state. Blocking has no cycle requirement; deadlock reports only represent cycles.
13. No. Inspect @@TRANCOUNT/XACT_STATE and roll back as needed before returning a clean connection. Timeout itself is not transaction cleanup.
14. Resource names are case-sensitive and must be unique. Transaction owner requires an active transaction; session owner needs explicit release. Check return code and acquire resources consistently.

# Tests and edge cases

- Test two-session interleavings with commit and rollback.
- Verify timeout, cancellation, exception, and deadlock paths clean up.
- Test absent-key races and cross-row invariants.
- Hold a long SNAPSHOT transaction and observe delayed version cleanup.
- Compare optimized-locking/RCSI combinations where supported.
- Test bounded full-transaction retries and idempotency.

# Reflection questions

Which anomaly must be prevented? What is the transaction scope/retry boundary? What evidence distinguishes blocking from deadlock? Where do versions reside? Which flags are actually enabled?

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
