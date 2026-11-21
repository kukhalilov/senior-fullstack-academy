# backups recovery migrations availability and practical operations — Reference: Backup types, recovery model, restore chain, and point-in-time recovery

# Scope and version

SQL Server 2025 (17.x) current scope. This catalog explains only the exact supplied inventory. SQL Server edition, recovery model, database state, topology, and feature support can restrict commands; verify the linked statement and target version before production operations.

# How this group fits the mental model

This inventory is the recovery recipe layer: data backups establish a starting state, log continuity advances that state, recovery options determine when it becomes usable, and validation proves the selected path.

# Supplied names explained

- `Full database backup` — Contains the database data needed as a restore starting point, plus enough log to make the backup transactionally consistent. A full backup alone is not a point-in-time restore chain under FULL recovery.

- `Differential database backup` — Contains changed extents since its differential base, normally the latest conventional full backup. Restore the base full, then the latest usable differential, then later log backups if applicable. [Differential base rules](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/differential-backups-sql-server?view=sql-server-ver17)

- `Transaction log backup` — Captures log records since the previous log backup in a continuous log chain. Under FULL/BULK_LOGGED, schedule and retain these to bound data loss and permit point-in-time restore.

- `Copy-only backup` — Ad hoc backup that does not alter the normal differential base; copy-only full backups do not become the differential base. It also does not replace the scheduled backup plan. [Copy-only semantics](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/copy-only-backups-sql-server?view=sql-server-ver17)

- `File backup` — Backs up one or more database files, enabling file-level recovery where supported. A complete recovery sequence can require corresponding log backups and online file coordination.

- `Filegroup backup` — Backs up selected filegroups and can support piecemeal/filegroup recovery scenarios subject to recovery model and edition restrictions. It is not automatically a complete database backup.

- `Tail-log backup` — Captures log records not yet backed up, often immediately before restore after failure, to preserve the latest recoverable work. Feasibility depends on log availability and database state.

- `Recovery model SIMPLE` — Reclaims log space automatically after checkpoints and does not support log backups or point-in-time restore. Recovery is to the end of a data backup.

- `Recovery model FULL` — Requires log backups to truncate reusable log records and supports point-in-time recovery while an unbroken log chain is available. A full backup does not remove the need for log backups.

- `Recovery model BULK_LOGGED` — Minimally logs certain bulk operations to reduce log volume. Point-in-time recovery to a time inside a log backup containing bulk-logged changes is unavailable; restore through that backup to its end.

- `Backup chain` — The compatible sequence of data and log backups needed to restore a database to a target. The correct sequence depends on recovery model, LSNs, forks, differential base, and backup type.

- `Differential base` — The full backup whose changed extents a differential references. A conventional full establishes a new base; a copy-only full does not reset the existing one.

- `Log sequence number (LSN)` — Monotonically ordered transaction-log position used to relate backup endpoints and restore continuity. Check headers/history rather than guessing from filenames or timestamps.

- `Point-in-time restore` — Restores a full data backup, optional differential, and every required log backup in order, stopping at a supported target in the log. The target must be covered by the chain.

- `STOPAT restore option` — Stops log recovery at the latest committed transaction at or before the specified time. Specify the same target through the log restore sequence; BULK_LOGGED changes can disallow a point inside that log backup.

- `RESTORE VERIFYONLY limitation` — Checks whether the backup set is complete/readable but does not validate the database structure or guarantee a successful recovery. Only an actual restore tests the restore path. [VERIFYONLY limits](https://learn.microsoft.com/en-us/sql/t-sql/statements/restore-statements-verifyonly-transact-sql?view=sql-server-ver17)

- `RESTORE HEADERONLY` — Returns backup-header metadata for backup sets on a device, including type, dates, database identity, and LSN-related fields useful for planning a restore.

- `RESTORE FILELISTONLY` — Lists logical and physical database files represented in a backup set; use logical names to plan relocation with MOVE.

- `WITH RECOVERY` — Completes recovery, rolls back uncommitted work, and brings the database online. It ends the restore sequence; do not use until all intended backups are applied.

- `WITH NORECOVERY` — Leaves the database restoring and ready for another backup to be applied. Use on intermediate steps of a multi-backup restore sequence.

- `WITH STANDBY` — Recovers the database read-only between log restores while retaining an undo file so more logs can be applied later. It is a restore mode, not a high-availability replica.

- `Page restore` — Restores specified damaged pages where supported, then applies the required logs to bring them forward. Availability is constrained by recovery model, edition, backup chain, and page type.

- `Online restore` — Restores supported files/filegroups while other database data remains available. Operations and edition support differ; it does not mean every restore is online.

- `Encrypted backup` — Encrypts backup output using a supported algorithm and certificate/asymmetric key. Preserve and test the protecting key separately; losing it can make every encrypted backup unusable. [Backup encryption](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/backup-encryption?view=sql-server-ver17)

- `Backup checksum` — Checksum options validate backup stream/page checksums when present, helping detect corruption during backup/restore. They do not replace a restore test or guarantee semantic database integrity.

- `Backup compression` — Reduces backup bytes and often I/O at the cost of CPU and possible throughput contention. Benchmark backup and restore time under representative load.

- `ZSTD backup compression SQL Server 2025` — SQL Server 2025 (17.x) adds ZSTD as an available compression algorithm for compressed backups. Measure compression ratio, CPU, backup speed, and restore speed for the actual environment. [Official version/source](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/backup-compression-sql-server?view=sql-server-ver17)

- `Backup retention policy` — Specifies how long protected backup copies and keys remain available to satisfy recovery, legal, and operational needs. Retain every required full/differential/log dependency and prevent accidental deletion or ransomware access.

- `Restore validation` — Restores the planned backup set to an isolated target, checks database consistency and application-level expectations, and measures elapsed recovery. It proves a specific path, not every hypothetical failure.

- `Recovery point objective (RPO)` — Maximum acceptable data-loss interval measured in time. Translate it into backup/log frequency, replication mode, and tested failure assumptions.

- `Recovery time objective (RTO)` — Maximum acceptable time to resume service. Include detection, restore/redo, validation, application redirection, and operational decision time.

- `BACKUP DATABASE statement` — Creates data backups such as full, differential, file, or filegroup backups. Options affect media, copy-only/base behavior, compression, checksums, encryption, and consistency; script and monitor the exact schedule.

- `BACKUP LOG statement` — Creates a transaction-log backup in a supported recovery model and continues the log chain. Include tail-log and NO_TRUNCATE cases only when their documented preconditions apply.

- `RESTORE DATABASE statement` — Restores full/differential/file data backups and supports discovery/relocation/recovery options. A multi-step restore normally keeps intermediate steps in NORECOVERY until the final recovery point.

- `RESTORE LOG statement` — Applies a log backup to a database already restored to a compatible earlier point with NORECOVERY/STANDBY. Apply every required log backup in order without gaps.

- `COPY_ONLY option` — BACKUP option for an independent copy that leaves the routine backup sequence/differential base unaffected. It does not make an incomplete restore chain complete.

- `WITH INIT option` — Overwrites existing backup sets on the selected media rather than appending. Treat it as destructive to prior backup contents and protect automation against wrong paths.

- `WITH FORMAT option` — Creates a new media set and overwrites its media header, potentially making existing backup sets on that media inaccessible. Use only when replacement is intended and verified.

- `WITH CHECKSUM option` — Requests checksum validation during backup or restore when supported and available. A successful checksum still cannot replace a full restore and consistency test.

- `WITH MOVE option` — Maps each logical file in the backup to a new physical path/name during restore, commonly for isolated validation or relocation. Obtain logical names from FILELISTONLY.

- `WITH REPLACE option` — Overrides safety checks that normally protect an existing database or backup set from overwrite. It can destroy data; use only after verifying target identity and recovery authorization.

- `STOPATMARK restore option` — Stops recovery at a marked transaction in the log, supporting recovery to a transaction marker when the required marked-log sequence is intact.

- `STOPBEFOREMARK restore option` — Stops recovery immediately before a marked transaction, useful when a known bad transaction is marked and the chain supports that target.

- `Recovery fork` — A branch in database log history created when recovery opens a database or a point-in-time recovery diverges. Backup selection must follow the correct fork and LSN lineage.

- `Log chain break` — A discontinuity that prevents applying subsequent log backups for the desired recovery path. After switching from SIMPLE back to FULL or BULK_LOGGED, take a full or differential data backup to start the log chain; the change takes effect after that backup. [Recovery model change requirements](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/view-or-change-the-recovery-model-of-a-database-sql-server?view=sql-server-ver17)

- `Database backup encryption certificate custody` — The certificate/private key (or asymmetric key) needed to restore an encrypted backup must be exported, protected, inventoried, and tested independently from the backup files. Never store the only key copy beside the only backup copy. [Key requirements](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/backup-encryption?view=sql-server-ver17)

# Cross-item comparison

A full backup is a restore anchor; a differential shortens data-restore work relative to its base; log backups provide continuity and point-in-time choices under FULL. Copy-only affects backup-chain bookkeeping, while VERIFYONLY checks media readability without performing recovery. These are complementary choices, not substitutes.

# Examples

```sql
-- Example pattern; replace paths, names, and sequence with verified backup metadata.
RESTORE DATABASE [AppRestore] FROM DISK = N'D:\backups\App_full.bak' WITH NORECOVERY, MOVE N'App' TO N'D:\data\AppRestore.mdf', MOVE N'App_log' TO N'D:\data\AppRestore_log.ldf';
RESTORE DATABASE [AppRestore] FROM DISK = N'D:\backups\App_diff.bak' WITH NORECOVERY;
-- Apply every required log backup in LSN order, using the same STOPAT target.
RESTORE LOG [AppRestore] FROM DISK = N'D:\backups\App_log_001.trn' WITH STOPAT = '2026-11-16T09:55:00', NORECOVERY;
RESTORE LOG [AppRestore] FROM DISK = N'D:\backups\App_log_002.trn' WITH STOPAT = '2026-11-16T09:55:00', RECOVERY;
```

The restore sample assumes the backup media and file logical names were verified first, an isolated target is authorized, the log chain is complete, and encryption keys are available. Never run an overwrite/replace operation based only on a copied example. If there are more log backups, apply all in sequence and use the same STOPAT target on each. The sample is a syntax pattern, not a claim of execution. [Restore sequence guidance](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/restore-a-sql-server-database-to-a-point-in-time-full-recovery-model?view=sql-server-ver17)

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

1. What makes a differential applicable? **Its designated base full backup and matching database lineage.**
2. What is the final action after applying all restore backups? **Recover the database with `WITH RECOVERY`.**
3. Does VERIFYONLY prove structural consistency? **No; restore and validate the database.**
4. What if a bulk-logged operation is in a required log backup? **You cannot stop within that backup at a point in time; recover through its end.**

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
