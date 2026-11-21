# backups recovery migrations availability and practical operations — Exercises and worked solutions

# Goals

Choose and validate recovery paths, reason about failover data loss, and design compatible deployments.

# Worked example

An application requires a 10-minute RPO and 45-minute RTO. Log backups currently run every 30 minutes and a full restore takes two hours. Do not declare compliance based on a replica screenshot. First test a full/differential/log restore and measure its exact duration, including keys, validation, and cutover. Adjust log frequency and retention to meet the data-loss objective; separately test a HA/DR path for the time objective. Restore backups to isolated infrastructure periodically, and run a failover test that measures synchronization lag and client reconnection. Keep both mechanisms because they cover different failures.

# Exercises

Try each before reading the solution.

1. A database uses FULL recovery. A transaction is accidentally committed at 10:04; logs are backed up every 5 minutes, and the latest full backup is from yesterday. What must be checked and restored to recover to 10:03?
2. A new copy-only full backup completed. Which full backup should a differential backup normally use as its base?
3. A synchronous secondary is not synchronized and the primary is lost. Can the team claim zero-data-loss automatic failover?
4. The primary is stable, but a deletion replicated to all secondaries. Which mechanism is most directly useful for recovering the database to just before the deletion?
5. Design an expand-and-contract migration to rename a column while old and new application versions overlap.
6. A temporal table query using `BETWEEN` returns a row version that starts exactly at the upper time. Why can that differ from `FROM ... TO`?
7. A restore test passes VERIFYONLY but actual restore fails because the certificate is missing. What process was missing?
8. A production deployment performs one long backfill transaction. Name failure risks and a better pattern.

# Progressive hints

1. Verify backup chain, log sequence and target coverage, log contents, and any intervening differential; apply data and logs in order.
2. Copy-only does not reset the regular differential base.
3. Automatic failover has eligibility requirements; forced promotion is a different operation.
4. Replicas may preserve the same bad change; recover independent backups to an isolated target.
5. Add first, support both shapes, backfill resumably, switch reads/writes, retire old binaries, then contract.
6. BETWEEN includes the upper endpoint in its temporal overlap predicate; FROM TO excludes the upper boundary.
7. Key/certificate export, separate custody, access test, and actual restore rehearsal.
8. Log growth, lock duration, blocking, rollback time, and restart difficulty; use idempotent batches/checkpoints.

# Complete solutions

1. Identify the most recent usable full and applicable differential, then every required log backup through the target time. Verify database identity, recovery fork/LSNs, the chain, target coverage, backup media and encryption key. Restore to an isolated target, applying data/logs with NORECOVERY and the consistent STOPAT target, then RECOVERY; validate before cutover. Yesterday’s full can be used if every required backup is available.
2. The last conventional full backup, because the copy-only full does not become the differential base.
3. No. Automatic no-data-loss failover requires a configured synchronous, synchronized eligible target and cluster conditions. An unsynchronized target may require forced failover, which can lose transactions.
4. Restore independent backups to a point before the deletion, then validate and reconcile later legitimate writes. A temporal history table may help recover specific row values if enabled and retained, but it is not a complete database recovery path.
5. Add the new column while retaining the old one; deploy code that reads/writes compatibly; backfill in idempotent batches with checkpoints; switch new code to the new column; verify all old app instances/workers are gone; then enforce constraints and drop the old column in a later deployment. Keep forward recovery and data-reconciliation plans.
6. SQL Server temporal period predicates treat BETWEEN’s upper endpoint inclusively, while FROM ... TO excludes its upper endpoint. Use the clause whose interval boundary semantics match the requirement and test exact boundary times. [Temporal query rules](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/query-data?view=sql-server-ver17)
7. Key lifecycle and actual recovery validation: store and protect the required certificate/private key separately, ensure restore operators can access it, and restore to isolated infrastructure. VERIFYONLY does not prove a database can be recovered.
8. A long transaction can grow the log, hold locks, block other work, take a long time to roll back, and lose all progress on restart. Use bounded idempotent batches, checkpoint progress, pace against workload headroom, and verify row counts/invariants per batch.

# Tests and edge cases

- Restore the newest and an older retained recovery point, including encrypted media.
- Test a log backup with minimally logged operations under BULK_LOGGED before claiming PITR behavior.
- Remove access to the primary environment during a DR drill to prove backup separation.
- Test failover with loss of quorum, lagging async replica, listener DNS/network, connection retry, and app write validation.
- Run old and new application versions concurrently during schema migration tests.
- Test temporal predicates at exact period boundaries and confirm retention behavior.
- Run CHECKDB and application-level consistency checks on restored copies.

# Reflection questions

What is the data-loss limit? What exact components contribute to restoration time? Which failure can affect both primary and replicas? Which key is needed to read the backup? Can old and new code coexist for every deployment step? What evidence proves the recovery path?

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
