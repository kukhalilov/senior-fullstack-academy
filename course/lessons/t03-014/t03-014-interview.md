# backups recovery migrations availability and practical operations — Interview questions and reasoning

# Core questions

1. Why is a full backup alone insufficient for point-in-time recovery under FULL?
2. Differential versus log backup?
3. What does VERIFYONLY prove?
4. Why are backups and replicas both needed?
5. Synchronous versus asynchronous availability-group commit?
6. What conditions are required for automatic failover?
7. CDC versus Change Tracking?
8. How would you roll out a column rename without downtime?
9. Temporal tables versus audit/ledger?
10. What does DBCC CHECKDB repair risk mean?

# Concise interview answers

1. FULL requires an unbroken log backup chain to reach times after the data backup.
2. Differential captures changed data extents since its base full; log captures transaction-log continuity since the previous log backup.
3. It checks media readability/completeness, not database structure or successful recovery.
4. Replicas reduce outage time but can copy logical corruption; independent backups support recovery to retained points.
5. Synchronous waits for secondary hardening when synchronized, increasing commit latency; asynchronous lets primary commit without waiting and can lag.
6. Configured automatic mode, synchronous-commit target, synchronized databases, cluster quorum/health, and policy conditions.
7. CDC exposes captured row change records; Change Tracking reports changed keys/version for clients to retrieve current state.
8. Expand, deploy dual-compatible code, backfill in resumable batches, switch code, wait for old versions, then contract.
9. Temporal keeps system-time row versions; audit records selected actions/identity, and ledger adds tamper-evidence. They solve different evidence requirements.
10. Repair can remove unrecoverable data; restore from a known-good backup is preferred when possible.

# Deep follow-up answers

Discuss recovery model and log-chain consequences, LSN/base/fork validation, STOPAT behavior, key custody, and restore rehearsals. State the RPO/RTO numerically and include detection, decision, redo, validation, and client cutover in RTO. For AGs, distinguish role, synchronization, commit mode, failover mode, WSFC quorum, and application routing. A listener does not guarantee every driver reconnects. Change Tracking does not preserve old row images; temporal retention can delete history. `DBCC CHECKDB` does not establish backup recoverability.

# Scenario questions

**Ransomware encrypts the primary and all attached storage.** Isolate credentials/media, restore from offline/immutable independent backups with required keys, check for clean restore points, validate integrity/application state, and rotate compromised secrets before reconnecting.

**An async DR replica is several minutes behind when the primary is lost.** Report the measured lag and potential RPO breach, choose whether service restoration justifies forced failover, document possible missing transactions, and reconcile after recovery.

**A deployment must change a large table while old instances remain active.** Use additive schema first, compatible application code, throttled idempotent backfill, observable checkpoints, then delay destructive cleanup until all old consumers are retired.

# Tradeoffs and alternatives

Frequent log backups reduce data-loss windows but increase management and storage requirements. Synchronous replicas reduce loss when synchronized but add latency and distance sensitivity. Async replicas increase distance tolerance at nonzero RPO risk. CDC offers row change history; Change Tracking offers a lighter sync signal. Temporal tables support row reconstruction but require retention and do not establish actor identity. Restore tests and failover tests exercise different recovery paths.

# Common weak answers

- “We have backups because the job is green.”
- “The replica is synchronous, so failover is always lossless.”
- “VERIFYONLY proves the restore works.”
- “CDC is our backup.”
- “Temporal tables show who changed the row.”
- “We can just roll back the migration script.”
- “CHECKDB repaired it, so we know disaster recovery works.”

# Self-check rubric

Score 0–2: (0) names a feature only; (1) states its mechanism but misses its failure boundary; (2) quantifies RPO/RTO, names prerequisites and data-loss/retention limits, and proposes a measurable rehearsal or rollback.

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
