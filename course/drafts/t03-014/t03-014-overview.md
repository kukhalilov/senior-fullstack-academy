# backups recovery migrations availability and practical operations — Big-picture orientation and mental model

# Problem and purpose

Operational readiness asks two different questions. Can the service continue when a component fails? And can we recover the correct data after loss, corruption, or a bad deployment? High availability, disaster recovery, backups, schema migrations, and row history each answer only part of that problem.

# Plain-language mental model

Think of backups as durable checkpoints plus a sequence of log records that lets you replay the database to a chosen point. A restore is a specific recipe: choose the right checkpoint, apply compatible changes in order, then open the database at the intended recovery point. Replicas keep another copy ready but can copy mistakes too. Migrations change the shape of data while old and new application versions may still be running. Temporal tables retain row versions for queries, with a retention policy, but they are not backups.

# How the parts fit together

1. Set RPO (acceptable data loss) and RTO (acceptable time to restore service) for each workload.
2. Choose recovery model, full/differential/log schedule, secure retention, and encryption-key custody to meet the data-recovery target.
3. Choose HA/DR topology and test failover eligibility, quorum, lag, client routing, and application reconnection.
4. Deploy schema changes in compatible steps; make data backfills restartable and observable.
5. Run restore, failover, integrity, and migration rehearsals that measure actual outcomes.

# Concept map

| Mechanism | Main question it answers | Important limit |
| --- | --- | --- |
| Backup plus restore chain | Can data be recovered to a tested point? | Requires the correct media, keys, sequence, and time |
| Availability replica | Can service resume on another copy? | Logical mistakes can replicate; asynchronous replicas can lag |
| Replication/CDC/change tracking | How can changes reach another consumer? | Not equivalent to a backup or zero-loss HA |
| Temporal table | What row version was valid at a database time? | Retention and system time do not establish actor/intent |
| Expand-and-contract deployment | Can app versions coexist during a schema change? | Destructive cleanup must wait until old code is gone |

# End-to-end walkthrough

Assume an operator deletes customer rows at 10:02 and the recovery objective permits at most five minutes of data loss. A tested full backup, later differential, and frequent log backups may allow a point-in-time restore to an isolated database just before 10:02, provided the chain and keys are intact and the recovery model supports the target. Validate consistency and application data, then decide how to reconcile valid writes after the restore point before cutover. An availability-group secondary may already contain the deletion, so simply failing over does not undo it. A temporal history query might recover prior row values if retention and versioning were enabled, but it does not restore the whole database or its relationships.

# When to use it and tradeoffs

Use synchronous replicas for low-loss failover where latency and topology permit; use asynchronous replicas when distance/latency matters and explicitly accept lag risk. Use backups for independent recoverability and retention. Replication/CDC/change tracking are data movement or synchronization mechanisms with distinct payloads. Temporal tables help reconstruct row history; ledger addresses tamper-evidence. All require key, access, capacity, and retention planning.

# What later lessons cover

The first reference lesson covers backup/restore chains and recovery objectives. The second distinguishes availability and change movement. The third covers schema evolution, temporal history, integrity checks, and rehearsal. Earlier topic t03-012 covers security fundamentals and t03-010 covers transaction behavior.

# Recent version changes

SQL Server 2025 introduces ZSTD as a compressed-backup algorithm; compare CPU, backup and restore throughput, and storage before adopting it. [Microsoft backup compression documentation](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/backup-compression-sql-server?view=sql-server-ver17) Change event streaming remains marked Preview in the current SQL Server 2025 release-status material, even though the status table’s update column says RTM. Verify its support status before production use. [Release status](https://learn.microsoft.com/en-us/sql/sql-server/sql-server-2025-release-notes?view=sql-server-ver17)

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
