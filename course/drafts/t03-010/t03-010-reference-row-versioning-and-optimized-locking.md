# transactions isolation levels blocking locks deadlocks and row versioning — Reference: RCSI, snapshot semantics, and SQL Server 2025 locking changes

# Scope and version

Targets SQL Server 2025 (17.x) unless a platform boundary is named. Azure SQL, Fabric, and Synapse can differ. This table explains every exact inventory item assigned to the group.

# How this group fits the mental model

Transactions define atomicity; isolation defines visibility; locks and versions implement concurrent behavior. Diagnose current session/database state before applying hints.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `READ_COMMITTED_SNAPSHOT database option` | Makes READ COMMITTED use statement-start row versions; coordinate the database option change and account for version-store capacity. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `ALLOW_SNAPSHOT_ISOLATION database option` | Required before SNAPSHOT transactions; state transitions may wait for existing transactions to drain. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Snapshot transaction sequence number` | XSN identifies version visibility boundary; active snapshot DMVs help locate version-retaining transactions. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Versioned read` | Reads a committed image visible at statement start (RCSI) or transaction snapshot (SNAPSHOT). ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-tran-version-store-transact-sql?view=sql-server-ver17)) |
| `Write-write conflict` | Row versioning does not silently permit conflicting writers; they block or one aborts. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Optimized locking` | SQL Server 2025 per-database TID locking and LAQ features reduce DML lock memory; requires ADR. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `Transaction ID (TID) locking` | Retains one XACT transaction lock while releasing many row/page locks sooner. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `Lock After Qualification (LAQ)` | With optimized locking+RCSI+READ COMMITTED, evaluates DML predicate on latest committed row before locking qualifying rows. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `Low Priority Lock Wait` | WAIT_AT_LOW_PRIORITY applies to supported online index operations and partition switching, not arbitrary DML lock waits. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `READPAST hint interaction with row versioning` | READPAST skips row locks, not page locks; under RCSI it has restrictions and may require READCOMMITTEDLOCK for a locking read. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `READCOMMITTEDLOCK hint` | Requests locking READ COMMITTED for a table under RCSI; can reintroduce blocking and disable LAQ there. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `NOLOCK hint dirty-read risk` | Allows dirty, missing, duplicated, or changing rows; still takes Sch-S. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `Row-version retention` | Versions remain until no active snapshot needs them; long transactions delay cleanup. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Version-store cleanup` | Background reclaim of obsolete versions; inspect old snapshots/ADR state. Full version-store scans can be expensive. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-tran-version-store-transact-sql?view=sql-server-ver17)) |
| `Optimized-locking eligibility boundary` | SQL Server 2025 opt-in + ADR; LAQ also needs RCSI/READ COMMITTED. Cloud defaults and exclusions differ. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `Optimized locking availability by SQL platform` | Azure SQL Database, Fabric SQL database, and Azure SQL Managed Instance list enabled defaults; SQL Server 2025 supports but disables by default; SQL Server 2022 and earlier do not support it. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `OPTIMIZED_LOCKING database option` | ALTER DATABASE per-database switch for optimized locking; ADR must be enabled first. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `Accelerated database recovery prerequisite` | Enable ADR before optimized locking; turn optimized locking off before disabling ADR. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)) |
| `Optimized locking disabled by default on SQL Server 2025` | SQL Server 2025 supports but does not enable it by default. Check sys.databases or DATABASEPROPERTYEX; Azure defaults differ. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `TID XACT lock lifetime` | Writer retains an XACT-resource X lock until transaction completion; other tasks can wait on that transaction ID. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `TID row/page lock release behavior` | Row/page locks can be released after row modification while the XACT TID lock remains; schema locks are unaffected. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `LAQ requires RCSI and READ COMMITTED` | LAQ requires optimized locking, READ_COMMITTED_SNAPSHOT ON, and READ COMMITTED isolation. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `LAQ evaluates latest committed version` | DML predicate is tested on latest committed row version before acquiring locks for rows that qualify. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `LAQ predicate requalification after concurrent update` | If another writer changes a qualified row, SQL Server waits and reevaluates; unsupported plan operators can trigger internal restart without LAQ. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `LAQ statement restart event lock_after_qual_stmt_abort` | Fires when LAQ statement processing is internally restarted after a conflict; repeated work can be costly. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `LAQ disabled by conflicting lock hints` | UPDLOCK, READCOMMITTEDLOCK, XLOCK, HOLDLOCK and incompatible isolation can disable LAQ for an access. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `LAQ unsupported for MERGE` | Current optimized-locking docs list MERGE outside LAQ support. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `LAQ unsupported with OUTPUT or variable assignment` | Some OUTPUT and variable-assignment forms cannot be restarted without changing semantics, so LAQ is skipped. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `LAQ unsupported on columnstore updates` | Current LAQ limitations exclude tables with columnstore indexes. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `Skip Index Locks optimization` | With optimized locking + RCSI + LAQ, some DML can skip row/page locks when no locking reader needs stability; exact operation and row exclusions apply. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `Optimized locking does not remove schema locks` | Feature alters DML row/page locking; Sch-S, Sch-M, and other object/database locks remain. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `Optimized locking tempdb and temporary table boundary` | Current docs state optimized locking does not apply to modifications in tempdb or temporary tables. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `Optimized locking XACT wait types` | XACT wait types include LCK_M_S_XACT_READ, LCK_M_S_XACT_MODIFY, and LCK_M_S_XACT; interpret with wait_resource and feature state. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `READCOMMITTEDLOCK forces locking under RCSI` | Forces shared locking for a READ COMMITTED table reference despite RCSI, potentially reintroducing blocking and disabling LAQ there. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)) |
| `UPDLOCK and HOLDLOCK reduce optimized locking benefits` | Hints remain honored but can require longer row/page locks or disable LAQ. Retain them only for a correctness requirement. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `RCSI optimized locking strict-order behavior change` | LAQ qualifies against latest committed data and can skip a row another transaction may later commit. Use stronger isolation/locking when strict order is a correctness invariant. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `sys.databases is_optimized_locking_on` | Catalog flag reports database optimized-locking state; inspect together with ADR/RCSI flags. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |
| `DATABASEPROPERTYEX IsOptimizedLockingOn` | Returns 1 enabled, 0 disabled, NULL unavailable. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking?view=sql-server-ver17)) |

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
