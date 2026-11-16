# backups recovery migrations availability and practical operations — Reference: High availability, replicas, failover, and data movement

# Scope and version

SQL Server 2025 (17.x) current scope. This catalog explains only the exact supplied inventory. SQL Server edition, recovery model, database state, topology, and feature support can restrict commands; verify the linked statement and target version before production operations.

# How this group fits the mental model

This inventory addresses service continuity and change movement. First identify the desired outcome (failover, read scale, subscriber, event consumer), then choose a mechanism with suitable RPO, latency, consistency, and operations.

# Supplied names explained

- `Always On availability group` — Availability feature replicating database log records among replicas for HA/read scale/DR. It does not protect against logical errors that replicate and does not replace backups.

- `Availability replica` — SQL Server instance role participating in an availability group, with configured availability/failover modes and synchronization state. Role and health can change during failover.

- `Primary replica` — Replica that hosts read-write primary databases and sends log records to secondary replicas. It can change after failover.

- `Secondary replica` — Replica receiving and hardening log records and optionally serving supported read-only workloads. Data visibility can lag, especially in asynchronous mode or while redo is behind.

- `Synchronous-commit mode` — Primary waits for a synchronous secondary to harden log before acknowledging commit, trading latency for stronger protection when synchronized. It does not by itself guarantee automatic failover eligibility.

- `Asynchronous-commit mode` — Primary does not wait for secondary hardening before commit acknowledgment. It reduces commit latency at distance but allows lag and potential data loss on forced failover.

- `Automatic failover` — Automatically changes primary role only when configured and eligibility conditions hold, including a synchronous, synchronized target and required cluster health/quorum. It does not cover every outage.

- `Manual failover` — Operator-initiated planned failover without data loss when the target is synchronized and required conditions hold. Coordinate application routing and verify client reconnection.

- `Planned failover` — Controlled transition to a synchronized target, typically without data loss, after verifying readiness and application routing. It is different from a forced disaster failover.

- `Forced failover with possible data loss` — Promotes a replica despite lack of synchronization when service restoration is prioritized. Unhardened transactions can be lost; quantify and communicate the recovery point.

- `Availability group listener` — Virtual network name/IP clients use to connect to the current primary or read-only routing target. Client driver, DNS/network, certificate, and connection retry behavior must be tested.

- `Readable secondary` — A secondary configured to accept eligible read-only connections. Reads can be stale relative to primary because redo may lag; it is not a writable replica.

- `Read-intent routing` — Routes a connection marked read-only through the listener routing configuration to an eligible readable secondary. It depends on connection intent and configured routing lists.

- `Database mirroring deprecated boundary` — Database mirroring is deprecated for new development; availability groups or other supported HA approaches are generally preferred. Existing deployments require a planned migration.

- `Failover cluster instance` — Instance-level high availability that moves one SQL Server instance between WSFC nodes, generally using shared storage. It protects the instance service differently from database replicas in an availability group.

- `Windows Server Failover Clustering (WSFC)` — Windows cluster service providing membership, quorum, and resource coordination for SQL Server failover cluster instances and many availability-group configurations.

- `Log shipping` — Scheduled backup-copy-restore of transaction logs to a secondary database, with configurable delay and monitoring. It is simpler DR/read-only standby but failover and data-loss windows are operational.

- `Transactional replication` — Log-reader/distribution pipeline that publishes committed changes to subscribers, commonly for selective distribution or integration. It is not synchronous HA and has topology/latency semantics.

- `Snapshot replication` — Generates and applies a point-in-time schema/data snapshot to initialize or refresh subscribers; unlike continuous transactional replication, it does not continuously deliver every change by itself.

- `Merge replication` — Supports changes at multiple participating nodes with synchronization and conflict detection/resolution. It suits disconnected/update-at-multiple-sites scenarios but adds complexity and is legacy compared with many modern designs.

- `Change Data Capture (CDC)` — Asynchronously reads log changes into change tables with row-level change data and metadata, allowing consumers to process changes. Retention/cleanup and capture-job health must be managed.

- `Change Tracking` — Lightweight mechanism recording that rows changed and exposing keys/version metadata so clients can synchronize current state. It does not preserve full before/after row values like CDC.

- `SQL Server 2025 change event streaming` — Feature that streams row-level DML changes from tracked tables to Azure Event Hubs or Fabric Eventstream. The SQL Server 2025 release status lists it as Preview; verify current support and destination prerequisites before adoption. [Release status](https://learn.microsoft.com/en-us/sql/sql-server/sql-server-2025-release-notes?view=sql-server-ver17)

- `Distributed availability group` — Availability-group topology connecting availability groups across clusters, often for multi-site DR. It introduces forwarding/lag/role coordination considerations beyond a single AG.

- `Quorum` — WSFC voting majority needed for cluster decisions and resource ownership. Loss of quorum can affect cluster-managed availability; plan witness and failure-domain behavior.

- `RPO under asynchronous replication` — Potential data loss is bounded by how much committed primary log has not hardened on the secondary at failure. Measure send/harden/redo lag and do not promise zero loss.

- `Replica seeding` — Initializes secondary database copies, either automatically or manually. Choose based on database size, network, backup workflow, permissions, and operational control.

- `Secondary redo queue` — Log records hardened on a secondary but not yet redone into data pages. A growing queue increases read staleness and recovery/failover catch-up time.

- `Failover readiness test` — Rehearses failure detection, failover eligibility, client reconnection, write validation, data-loss measurement, and return/failback. It should be scheduled and recorded.

- `Read-only routing list` — Ordered routing targets associated with a replica and read-only routing URL. It determines which eligible readable secondary receives read-intent sessions.

- `ApplicationIntent=ReadOnly` — Connection-string intent flag used by supported SQL drivers to request read-only routing. It does not make a database read-only or guarantee a particular replica without correct listener configuration.

- `Availability group automatic seeding` — Uses the primary to create and initialize secondary databases automatically. Validate endpoint connectivity, permissions, network capacity, database size, and seeding mode/monitoring.

- `Availability group backup preference` — Specifies which replica is preferred as a backup source; it is a preference, not an enforcement mechanism. Backup jobs must check role/preference and avoid duplicate/missing work.

- `Failover Cluster Instance (FCI) comparison` — FCI fails over an instance between cluster nodes, typically sharing storage; an availability group replicates selected databases to separate instances. They differ in storage, failure coverage, and possible composition.

# Cross-item comparison

Availability groups and FCIs are HA topologies with different instance/database and storage failover boundaries. Log shipping transfers log backups periodically. Replication, CDC, Change Tracking, and change event streaming are data movement/change-consumption approaches; their payload, latency, support status, and recovery guarantees differ. No row in this group makes a backup unnecessary.

# Examples

```text
Incident: primary host fails.
1. Check replica role, synchronization/redo state, WSFC quorum, and failover eligibility.
2. If a synchronized automatic-failover target and policy conditions hold, allow/execute that path.
3. If only an asynchronous lagging target is available, quantify potential loss before forced failover.
4. Reconnect through the listener, validate writes and application health, then restore redundancy.
```

Failover should be exercised with clients and dependencies, not just a role-change command. Read-only routing requires driver intent and routing configuration; results on a secondary may be stale. [Failover conditions](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/failover-and-failover-modes-always-on-availability-groups?view=sql-server-ver17)

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

1. What does synchronous commit acknowledge? **The configured synchronous secondary has hardened log, when synchronization is healthy.**
2. Can forced failover lose data? **Yes, transactions not hardened on the target can be lost.**
3. Does Change Tracking store full before/after rows? **No; it reports changed keys/version information.**
4. What is the main FCI/AG distinction? **FCI is instance failover, typically shared storage; AG replicates selected databases between instances.**

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
