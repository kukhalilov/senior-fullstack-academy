# backups recovery migrations availability and practical operations — Reference: Migration safety, temporal rows, and operational recovery

# Scope and version

SQL Server 2025 (17.x) current scope. This catalog explains only the exact supplied inventory. SQL Server edition, recovery model, database state, topology, and feature support can restrict commands; verify the linked statement and target version before production operations.

# How this group fits the mental model

This inventory manages safe evolution and historical/integrity evidence: deploy compatible schema steps, keep row-history semantics explicit, and rehearse recovery independently.

# Supplied names explained

- `Schema migration` — Versioned change to database structure/data applied by deployment tooling. Include ordering, locks, duration, validation, compatibility with running app versions, and recovery strategy.

- `Expand-and-contract migration` — First add backward-compatible schema, deploy code that can use both shapes, migrate data, then remove old schema after all old clients are gone. Each step must support rollback/forward recovery.

- `Backward-compatible schema change` — Change that old and new application versions can safely use during a rolling deployment, such as additive nullable columns before code switches. Validate constraints, defaults, lock duration, and mixed-version access.

- `Online index operation` — Allows supported index operations while concurrent access continues, with edition/version/operation restrictions and resource/locking costs. Check exact operation support before scheduling.

- `Temporal system-versioned table` — Maintains current rows and prior row versions using system-managed period columns and a history table. It answers when row values were valid in database transaction time, not who made a change or why.

- `SYSTEM_VERSIONING = ON` — Enables automatic versioning for a temporal table after period/current/history configuration satisfies requirements. Disabling or changing versioning affects history continuity and needs controlled administration.

- `FOR SYSTEM_TIME AS OF` — Returns rows considered valid at one UTC point in time, combining current and history data with the temporal period boundary rules.

- `FOR SYSTEM_TIME FROM ... TO` — Returns row versions whose validity period overlaps a half-open time interval: start inclusive and end exclusive. A row spanning the interval can appear once.

- `FOR SYSTEM_TIME BETWEEN ... AND` — Returns versions overlapping the interval and includes versions that became active exactly at the upper boundary; it differs from FROM ... TO at that boundary. Boundary semantics are defined by the period-column predicates. [Temporal query rules](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/query-data?view=sql-server-ver17)

- `FOR SYSTEM_TIME CONTAINED IN` — Returns versions whose full validity period lies within the specified interval. It is narrower than asking which versions overlap the interval.

- `FOR SYSTEM_TIME ALL` — Returns all current and historical versions without a time filter, potentially producing multiple rows per business key.

- `History table` — Stores previous row versions for a system-versioned temporal table. It grows with updates/deletes and needs indexing, retention, and access design.

- `Temporal retention policy` — Limits how long historical versions remain when configured and supported. Cleanup timing is asynchronous; direct history-table queries can bypass temporal filtering and expose retained rows outside the promised policy.

- `Ledger table boundary` — Ledger adds tamper-evidence and cryptographic verification for database changes; it is distinct from temporal history and does not replace backups or full access control.

- `Database snapshot` — Read-only, point-in-time database view using copy-on-write sparse files. It depends on the source database and storage and is not an independent backup or disaster-recovery copy.

- `DBCC CHECKDB` — Checks logical and physical integrity of database objects and allocation structures. Schedule and monitor it; it consumes resources and does not replace restore testing.

- `Database consistency check` — A repeatable integrity-validation activity, commonly DBCC CHECKDB against production or a restored copy. Record errors and use restore/repair policy rather than assuming no output equals recoverability.

- `Emergency mode repair risk` — Last-resort repair attempt for a damaged database that can deallocate unrecoverable data. Prefer restore from known-good backups; use only with explicit acceptance of possible data loss.

- `Disaster recovery rehearsal` — Timed exercise of declared outage scenarios, restore/failover decisions, identity/key access, application cutover, and validation against RPO/RTO.

- `Restore-to-isolated-environment test` — Restores protected backups to separate infrastructure/network and validates keys, files, consistency, and application behavior without impacting production.

- `Migration rollback strategy` — Defined way to reverse or safely move forward after schema/data deployment failure. Destructive transformations may need backups or compensating migration rather than a simple down script.

- `Data migration checkpoint` — Recorded progress boundary in a resumable/batched migration, including idempotency and validation so interrupted work can continue without duplicate or missing data.

- `Database compatibility level after upgrade` — Controls selected query-processing behavior independently of engine installation version. Test representative workloads and Query Store before changing the compatibility level.

# Cross-item comparison

Schema migration controls deployment compatibility; temporal tables preserve prior row versions; database snapshots provide a dependent read-only point-in-time view; DBCC CHECKDB checks consistency. Each answers a different operational question.

# Examples

```sql
-- Query a system-versioned table for its state at a UTC point in time.
SELECT OrderId, Status FROM dbo.Orders FOR SYSTEM_TIME AS OF '2026-11-15T10:00:00Z' WHERE OrderId = 42;
```

Temporal query output can contain multiple versions per key. Include an explicit time predicate and understand whether the business asks for a point snapshot or all versions within/overlapping an interval. [Temporal query semantics](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/query-data?view=sql-server-ver17)

# Common mistakes

- Treating VERIFYONLY, a snapshot, a replica, or an audit history table as a complete restore test.
- Losing the certificate/private key needed for encrypted backup restore.
- Applying a log backup out of order, choosing the wrong differential base, or recovering too early.
- Using INIT, FORMAT, REPLACE, or RECOVERY without checking their overwrite/finality consequences.
- Assuming synchronous means every replica is synchronized or every failover is automatic.
- Assuming read-intent routing guarantees freshness or a specific secondary.
- Treating CDC and Change Tracking as equivalent or as independent backups.
- Treating system time as actor identity or commit ordering.
- Deploying a destructive schema change before old application versions are retired.

# Knowledge checks with answers

1. What does `AS OF` answer? **Which row version was valid at a particular time.**
2. Does temporal history name the human actor? **No.**
3. Is a database snapshot an independent backup? **No; it depends on source storage/database.**
4. Why is CHECKDB not a recovery test? **It checks consistency, not whether backup media and keys restore under the RTO.**

# Sources

- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/back-up-and-restore-of-sql-server-databases?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/backup-overview-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/recovery-models-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/restore-and-recovery-overview-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/complete-database-restores-full-recovery-model?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/restore-a-sql-server-database-to-a-point-in-time-full-recovery-model?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/restore-statements-arguments-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/restore-statements-verifyonly-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/backup-encryption?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/differential-backups-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/copy-only-backups-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/view-or-change-the-recovery-model-of-a-database-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/backup-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/restore-statements-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/backup-compression-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/enable-or-disable-backup-checksums-during-backup-or-restore-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/always-on-availability-groups-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/availability-modes-always-on-availability-groups?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/failover-and-failover-modes-always-on-availability-groups?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/listeners-client-connectivity-application-failover?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/active-secondaries-readable-secondary-replicas-always-on-availability-groups?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/sql-server/failover-clusters/windows/always-on-failover-cluster-instances-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/database-engine/log-shipping/about-log-shipping-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/replication/replication?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/track-changes/about-change-data-capture-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/track-changes/about-change-tracking-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/sql-server/sql-server-2025-release-notes?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/automatically-initialize-always-on-availability-group?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/sql-server/failover-clusters/windows/windows-server-failover-clustering-wsfc-with-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal-tables?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/query-data?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/manage-retention-of-historical-data-in-system-versioned-temporal-tables?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-overview?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/databases/database-snapshots-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/database-console-commands/dbcc-checkdb-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/perform-index-operations-online?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/databases/view-or-change-the-compatibility-level-of-a-database?view=sql-server-ver17)
