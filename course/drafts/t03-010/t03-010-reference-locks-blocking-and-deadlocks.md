# transactions isolation levels blocking locks deadlocks and row versioning — Reference: Lock modes, blocking chains, deadlocks, and diagnostics

# Scope and version

Targets SQL Server 2025 (17.x) unless a platform boundary is named. Azure SQL, Fabric, and Synapse can differ. This table explains every exact inventory item assigned to the group.

# How this group fits the mental model

Transactions define atomicity; isolation defines visibility; locks and versions implement concurrent behavior. Diagnose current session/database state before applying hints.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `Shared lock (S)` | Compatible with readers and conflicts with X; duration depends on isolation/RCSI. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Update lock (U)` | Compatible with S, but only one U per resource; reduces a common S-to-X conversion deadlock. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Exclusive lock (X)` | Protects modifications from conflicting access; optimized locking can release row/page X locks earlier. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Intent shared lock (IS)` | Ancestor marker that finer-grained shared locks exist or are intended. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Intent exclusive lock (IX)` | Ancestor marker for finer-grained exclusive locks. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Schema stability lock (Sch-S)` | Protects metadata during compile/execution and conflicts with Sch-M. NOLOCK still takes Sch-S. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Schema modification lock (Sch-M)` | Exclusive metadata lock; blocks Sch-S readers, including NOLOCK queries. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Key-range lock` | Serializable lock on an indexed key interval preventing qualifying phantom inserts. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Row lock` | Row/key lock resource; actual granularity and HoBT/key representation depend on access path and optimized-locking state. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Page lock` | Page lock can block access to other rows on the same page; inspect resource and mode before diagnosing contention. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Table lock` | Object-level lock; mode and intent locks determine compatibility, so the label alone does not mean every access is blocked. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Lock escalation` | Replaces many fine locks with a coarser table/HoBT lock; can increase blocking. Optimized locking makes it less likely, not impossible. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Blocking session` | Session holding a resource another needs; it may be idle with an open transaction. Find the head blocker. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Blocked request` | Request waiting on a resource; capture wait/resource, blocker, SQL, and transaction age. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Blocking chain` | Wait dependency chain; address the head blocker, not only a downstream waiter. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Deadlock cycle` | Circular wait-for dependency that the monitor detects and breaks. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Deadlock victim` | Transaction chosen and rolled back to resolve a cycle; client receives 1205. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Deadlock graph` | XML victim/process/resource lists; inspect owned/requested modes, SQL, resource order, and indexes. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Deadlock priority` | LOW/NORMAL/HIGH or -10..10 influences victim preference, not cycle prevention. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Lock timeout` | Wait bound; timeout is not a deadlock and does not guarantee the surrounding transaction is clean. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `SET LOCK_TIMEOUT` | Session timeout in milliseconds; -1 waits indefinitely, 0 returns immediately when blocked. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `sp_getapplock` | Acquires an application-named resource. Names are binary/case-sensitive; transaction ownership requires an active transaction. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-getapplock-transact-sql?view=sql-server-ver17)) |
| `sp_releaseapplock` | Explicitly releases an application lock; transaction locks also release at commit/rollback. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-getapplock-transact-sql?view=sql-server-ver17)) |
| `sys.dm_tran_locks` | Live currently granted/waiting lock requests; not historical telemetry. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-objects/sys-dm-tran-locks-transact-sql?view=sql-server-ver17)) |
| `sys.dm_os_waiting_tasks` | Live waiting task/resource/blocker evidence; parallel requests can have multiple task rows. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-waiting-tasks-transact-sql?view=sql-server-ver17)) |
| `Extended Events deadlock report` | Use xml_deadlock_report; system_health captures it by default, with bounded retention. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Lock compatibility matrix` | Compatibility depends on exact granted/requested modes on the same resource. Use the documented matrix, including intent modes. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Lock conversion deadlock` | Two sessions can each hold S and wait to convert to X; U locks reduce one common conversion cycle. Consistent resource ordering is broader prevention. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Update lock conversion purpose` | Only one U lock can be held per resource; it allows S readers but serializes a prospective updater before X conversion. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Intent locks communicate lower-level locks` | IS/IX/SIX on ancestors advertise descendant locks so the engine can test coarse-level compatibility efficiently. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Lock escalation threshold and table-level target` | Escalation can occur on documented lock-count or memory thresholds and takes a coarser object/HoBT lock; optimized locking lowers likelihood but does not guarantee none. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `ROWLOCK does not prevent escalation` | ROWLOCK only influences initial lock acquisition. It does not prohibit escalation and can increase lock overhead. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Lock escalation extended event` | The lock_escalation event captures escalation activity for correlation with statement, object, and workload. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Blocking versus deadlock distinction` | Blocking is a wait dependency without necessarily a cycle; a deadlock is a cycle the monitor breaks by rolling back a victim. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Deadlock error 1205 victim rollback` | Victim receives error 1205 and its transaction is rolled back; retry the whole idempotent unit with bounded backoff. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Deadlock victim cost and priority selection` | Generally the least rollback-cost transaction is selected unless priorities differ; lower DEADLOCK_PRIORITY loses. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Deadlock retry must restart whole transaction` | Retry the full business operation in a fresh transaction with bounded backoff and idempotent external side effects. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `xml_deadlock_report Extended Event` | Recommended structured deadlock event; avoid older SQL Profiler deadlock graph capture for current deployments. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `system_health captures deadlock reports by default` | Default system_health captures xml_deadlock_report, but its retention is bounded; persist critical events separately. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Deadlock graph victim/process/resource lists` | Victim list identifies chosen process, process list shows statements/modes, resource list exposes owned/requested resources and cycle. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Deadlocks can involve workers memory and exchanges` | Cycles can involve locks, worker threads, memory grants, parallel exchanges, MARS mutexes, and application resources. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Application lock resource case sensitivity` | Application lock names are binary/case-sensitive regardless of database collation; the application must ensure global uniqueness. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-getapplock-transact-sql?view=sql-server-ver17)) |
| `Application lock owner transaction versus session` | Transaction-owned locks require an active transaction and release at its end; session-owned locks require explicit release/session end. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-getapplock-transact-sql?view=sql-server-ver17)) |
| `sp_getapplock return codes` | Check return codes: nonnegative means acquired; negative values indicate timeout, cancellation, deadlock victim, or call error. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-getapplock-transact-sql?view=sql-server-ver17)) |
| `Application lock acquisition order` | Application locks participate in deadlocks; acquire multiple resources in one consistent order across all code paths. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-getapplock-transact-sql?view=sql-server-ver17)) |
| `sys.dm_exec_requests blocking_session_id` | Shows the session currently blocking a request; special negative values need documented interpretation and task waits can add precision. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |

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
