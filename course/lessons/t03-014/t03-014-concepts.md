# backups recovery migrations availability and practical operations — Core concepts and how they fit together

# Learning objectives

- Design a restore path that meets stated RPO/RTO and prove it with an isolated restore.
- Explain why recovery model, log continuity, backup types, and recovery options determine a valid restore sequence.
- Distinguish replica failover, backup restore, replication, CDC, Change Tracking, and temporal history.
- Plan a reversible migration across mixed application versions.

# Prerequisites

Know database files, transaction logs, transactions, deployments, and basic availability concepts. Security topic t03-012 covers permissions and encryption fundamentals; this lesson focuses on operational key custody and recovery.

# Core concepts

## Define recovery outcomes before choosing a schedule

RPO is the maximum acceptable data-loss interval; RTO is the maximum acceptable service-restoration time. A frequent backup may support RPO but still miss RTO if restore is slow or untested. A replica may reduce failover time but can share logical errors and may lag. Include detection, decisions, restore/redo, integrity/application validation, client routing, and recovery of related services in the time budget.

## Recovery model and chain determine where recovery can stop

SIMPLE supports data-backup recovery but no log backups or point-in-time recovery. FULL supports point-in-time recovery when log backups keep an unbroken chain. BULK_LOGGED changes how some bulk work is logged; a log backup containing such operations can prevent stopping inside that backup. Switching FULL to SIMPLE breaks the log chain; after switching back, take a data backup to start a new chain. A full backup does not replace routine log backups.

A conventional full backup establishes the differential base. A copy-only full does not change that base. Differential restore uses its base full plus the selected differential; log backups are applied after the data restore in correct LSN/fork order. Preserve backup headers/catalog metadata, filenames, checksums, keys, and tested scripts; never infer order from timestamps alone. [Recovery models](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/recovery-models-sql-server?view=sql-server-ver17) [restore overview](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/restore-and-recovery-overview-sql-server?view=sql-server-ver17) [complete restore sequence](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/complete-database-restores-full-recovery-model?view=sql-server-ver17)

## Restore is a stateful sequence

For multi-step recovery, restore the full and optional differential with `NORECOVERY`, then apply each required log in sequence, and finish with `RECOVERY` only at the target. `STOPAT` must identify a time covered by the log chain; use the same target on log restore steps. In BULK_LOGGED, a log backup containing minimally logged operations cannot be stopped at a time inside that backup. `RESTORE VERIFYONLY` reads/checks the set but does not prove restored database consistency. A restore rehearsal does. [Point-in-time restore](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/restore-a-sql-server-database-to-a-point-in-time-full-recovery-model?view=sql-server-ver17) [RESTORE options](https://learn.microsoft.com/en-us/sql/t-sql/statements/restore-statements-arguments-transact-sql?view=sql-server-ver17)

## Keep recovery media and keys independent

Backups should survive loss or compromise of the primary data environment. Encryption protects backup media only if the required certificate/private key or asymmetric key remains separately available and tested. Retention must preserve all dependencies (full/differential/log) for each recovery target. Checksum, compression, and encryption each answer different concerns; they do not turn a backup into a validated recovery.

## Availability and data movement are separate mechanisms

A synchronous replica hardens log before acknowledging commit when synchronized, adding network/commit latency. Automatic and planned no-data-loss failover require a synchronized eligible target and cluster health/quorum. An asynchronous replica can lag; forced failover may lose transactions not hardened there. A listener and client retry configuration help reconnect but do not prove the new primary is healthy.

FCI moves an instance between nodes, often over shared storage; an availability group moves selected database roles across SQL instances. Log shipping periodically copies/restores log backups. Transactional, snapshot, and merge replication distribute data under different policies. CDC exposes row-level change records; Change Tracking exposes that rows changed so consumers can fetch current rows. Neither is a complete backup. [Availability modes](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/availability-modes-always-on-availability-groups?view=sql-server-ver17) [failover conditions](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/failover-and-failover-modes-always-on-availability-groups?view=sql-server-ver17) [replication/CDC/CT](https://learn.microsoft.com/en-us/sql/relational-databases/replication/replication?view=sql-server-ver17)

## Schema change and history need their own lifecycle

Expand-and-contract creates a compatibility window: add first, deploy code that handles both shapes, migrate in restartable batches, then remove old columns or constraints only after old app versions are gone. A down migration is not automatically safe after data has been transformed or discarded.

System-versioned temporal tables store row versions using system period timestamps; they help answer “what did the row look like at time T?” They do not identify which human caused the change, do not replace audit controls, and can lose old versions under retention. Temporal time is based on transaction begin time, so it is not a commit-order ledger. Ledger, temporal history, CDC, and backup each preserve different evidence. `DBCC CHECKDB` checks consistency; only a tested restore demonstrates the recovery path. [Temporal tables](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal-tables?view=sql-server-ver17) [temporal queries](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/query-data?view=sql-server-ver17)

# Mechanisms and relationships

A useful incident decision tree is: if the goal is undoing bad data, select a recovery point from tested backups or a narrower history feature; if the goal is rapid service resumption, assess eligible failover and data-loss tradeoffs; if the goal is feeding another system, select a change movement contract; if the goal is safe deployment, stage schema/data compatibility. These paths can complement one another but are not interchangeable.

# Worked examples

A team wants a 15-minute RPO and 30-minute RTO. It measures that log backups every five minutes meet its expected data-loss window, but a full database restore takes 90 minutes. It adds a tested DR replica to improve recovery time while protecting independent backups and rehearsing data-loss scenarios. It monitors send/harden/redo queues, runs a timed failover with client reconnection, and regularly restores a backup to isolated infrastructure. The replica improves availability; the isolated restore proves a different failure path.

# Misconceptions and edge cases

- “BACKUP succeeded” does not prove media, key, or restore sequence works.
- `RESTORE VERIFYONLY` is not a substitute for restoring and running consistency/application checks.
- A copy-only full backup does not become the differential base.
- `WITH RECOVERY` ends a restore sequence; using it too early blocks applying later backups.
- Synchronous mode alone does not guarantee automatic failover: synchronization, mode, policy, and quorum matter.
- A replica can replicate an accidental delete or malicious update.
- CDC and Change Tracking expose different information and neither is a whole-database backup.
- Temporal history records database row versions, not actor identity, intent, or necessarily commit chronology.
- `DBCC CHECKDB` is integrity evidence, not proof the backup can be restored.
- Online index operations have version/edition/operation restrictions.

# Knowledge checks with answers

1. What must be true for a point-in-time restore under FULL? **A usable earlier data backup and an unbroken required log sequence covering the target.**
2. Does a copy-only full reset the differential base? **No.**
3. When do you use `WITH RECOVERY`? **After all intended backups are applied at the target recovery point.**
4. Can a synchronous secondary automatically fail over while unsynchronized? **No; automatic failover requires an eligible synchronized target and required cluster conditions.**
5. CDC versus Change Tracking? **CDC provides row-level change records; Change Tracking provides changed-key/version information for fetching current state.**
6. What test proves a restore path? **An actual isolated restore followed by consistency/application validation and timing.**

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
