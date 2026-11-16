# database comparisons SQL Server PostgreSQL MySQL document stores and tradeoffs — Reference: Deployment, scaling, recovery, and operational ownership

# Scope and version

Engine facts and release channels are pinned to the source snapshot checked 2026-11-16. Managed-service version/feature availability varies by provider and offering; verify the exact target. The list below contains only the supplied names.

# How this group fits the mental model

Deployment product and topology determine who operates which component and what happens during failure, scale-out, upgrade, and restore.

# Supplied names explained

- `Self-managed database server` — Organization operates host/OS, installation, patching, backup, monitoring, HA, and recovery within its chosen support model.

- `Managed database service` — Provider operates some infrastructure/maintenance tasks, but customer still owns data model, access, configuration, application compatibility, recovery requirements, and cost controls.

- `SQL Server on premises` — SQL Server engine deployed on customer-managed infrastructure; hardware, patch timing, HA topology, and backup responsibilities are customer-configurable and customer-operated.

- `Azure SQL Database` — Azure-managed database service based on SQL Server technology with database-level service models and a subset/different operational surface; do not assume instance-level feature parity.

- `Azure SQL Managed Instance` — Azure-managed SQL Server-compatible instance service with broader instance features than Azure SQL Database, but still with service-specific networking, maintenance, and feature boundaries.

- `Amazon RDS for SQL Server` — Managed hosting for SQL Server with AWS-defined supported versions, editions, features, and operational controls; it is not identical to self-managed SQL Server.

- `Amazon RDS for PostgreSQL` — Managed PostgreSQL service with AWS-specific extensions, parameter groups, versions, backup, and maintenance limits. Check its current support matrix.

- `Amazon RDS for MySQL` — Managed MySQL service with AWS-specific version availability, engine parameters, maintenance, and feature limits. It is not a claim of complete feature parity.

- `Amazon DocumentDB compatibility service` — AWS document database service implementing a subset/compatibility surface for MongoDB APIs; compatibility must be checked per command, driver, and version, not assumed from product naming.

- `MongoDB Atlas` — MongoDB’s managed database platform with deployment options and service-controlled upgrade/feature availability; it is not operationally identical to self-managed MongoDB.

- `Vertical scaling` — Adds resources to one database node/instance. It can simplify consistency and operations but has cost, hardware/service ceilings, and a single-node scaling limit.

- `Read replica` — Replica used for read scale or recovery; it can lag and may not accept writes. Read routing and freshness guarantees must be explicit.

- `High availability replica` — Replica/topology intended to continue service after a failure, with failover and data-loss behavior determined by commit mode, quorum, and configuration.

- `Automatic failover` — Automated promotion/routing after qualifying health events. Eligibility, detection, connection recovery, and data loss vary by topology and service.

- `Sharding` — Distributes records across partitions/nodes using a shard key. It adds routing, balancing, cross-shard transaction/query, and operational complexity.

- `Partitioning` — Splits one logical table/collection into managed partitions, often within an engine or cluster. It is not automatically the same as sharding or horizontal capacity scaling.

- `Range partitioning` — Assigns data by key intervals, supporting pruning/locality but risking hot ranges and uneven growth.

- `Hash partitioning` — Distributes by hash of key to spread values, often balancing load but complicating range locality and rebalancing.

- `Backup and point-in-time recovery` — Creates retained recoverable copies and, when logs/journals and service capabilities support it, selects a point in time. Retention, keys, and tested restore paths matter.

- `Logical backup` — Exports logical schema/data statements or records, generally portable across some environments but slower/larger and subject to version/extension compatibility.

- `Physical backup` — Copies engine storage/data files or storage-level representation for efficient restore to compatible engine/platform conditions; less portable than logical export.

- `Restore validation` — Performs real restores to a representative target, checks integrity/application behavior, and measures duration/data loss. A green backup job is insufficient evidence.

- `Major-version upgrade` — Moves to a new major engine line with potentially changed syntax, behavior, storage formats, and upgrade path; test application compatibility and rollback options.

- `Minor-version update` — Patch/update within a supported release line, usually focused on fixes but still requiring compatibility and maintenance planning.

- `Extension compatibility` — Checks engine extensions/plugins and their versions against the target server/service version and deployment model.

- `Database portability` — Ability to move schema, data, queries, and operations across engines/services with acceptable conversion and behavioral differences; SQL compatibility alone is not portability.

- `Vendor lock-in` — Costs and constraints of reliance on proprietary types, APIs, extensions, managed-service controls, or operating procedures; quantify migration alternatives rather than treating it as binary.

- `Data residency requirement` — Requirement constraining where data or replicas are stored/processed. Verify service region, backups, logs, support access, and replication behavior.

- `RPO (recovery point objective)` — Maximum tolerable data-loss interval. Translate into backup cadence and replica acknowledgement/lag guarantees.

- `RTO (recovery time objective)` — Maximum tolerable time to resume service, including detection, restore/failover, validation, and application reconnection.

- `Connection-pool saturation` — Application cannot obtain a database connection promptly; this can happen before a SQL request reaches the database and must be measured at the client pool.

- `Operational responsibility matrix` — Explicit map of provider and customer responsibilities for patching, backup, restore, HA, security, monitoring, and incident response.

# Cross-item comparison

Self-managed deployment offers control with operational burden. Managed services automate selected tasks but expose a supported subset and provider-specific responsibilities. Read replicas, HA replicas, partitioning, and sharding solve different capacity/availability problems. Backup/recovery evidence remains required across models.

# Examples

```text
Candidate A: self-managed engine; team owns patching, backup media, keys, restore, and failover.
Candidate B: managed service; provider operates selected tasks, while team verifies feature/extension support, retention, restore, access, and cutover responsibilities.
Compare the actual service matrix and rehearsed outcomes.
```

These are decision sketches, not benchmark results or guarantees. Check the target engine/service documentation and test under the workload that matters.

# Common mistakes

- Inferring constraints or null behavior from one engine’s SQL syntax.
- Embedding unbounded child data or duplicating facts without a consistency owner.
- Comparing “synchronous” settings without knowing which acknowledgement is required.
- Calling a compatibility service the original engine.
- Counting a read replica as an independent backup.
- Comparing only average latency or one warmed-up query.
- Ignoring upgrade cadence, extensions, keys, restore time, and provider feature gaps.

# Knowledge checks with answers

1. Does a provider handle every restore responsibility? **No; define and verify customer/provider duties.**
2. Sharding versus partitioning? **Sharding distributes across nodes; partitioning divides logical data, often within an engine.**
3. What is RPO? **Maximum acceptable data-loss interval.**

# Sources

- [Official documentation](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)
- [Official documentation](https://learn.microsoft.com/en-us/sql/sql-server/editions-and-components-of-sql-server-2025?view=sql-server-ver17)
- [Official documentation](https://www.postgresql.org/docs/18/)
- [Official documentation](https://www.postgresql.org/support/versioning/)
- [Official documentation](https://www.postgresql.org/docs/18/release-18-7.html)
- [Official documentation](https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/)
- [Official documentation](https://dev.mysql.com/doc/relnotes/mysql/9.7/en/)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/mysql-releases.html)
- [Official documentation](https://blogs.oracle.com/mysql/mysql-october-2026-ga-releases-now-available)
- [Official documentation](https://dev.mysql.com/doc/refman/26.10/en/)
- [Official documentation](https://www.mongodb.com/docs/manual/release-notes/9.0/)
- [Official documentation](https://www.mongodb.com/docs/manual/release-notes/)
- [Official documentation](https://www.mongodb.com/legal/support-policy/lifecycles)
- [Official documentation](https://www.mongodb.com/docs/manual/data-modeling/)
- [Official documentation](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/)
- [Official documentation](https://www.mongodb.com/docs/manual/core/transactions/)
- [Official documentation](https://www.mongodb.com/docs/manual/reference/read-concern/)
- [Official documentation](https://www.mongodb.com/docs/manual/reference/write-concern/)
- [Official documentation](https://www.mongodb.com/docs/manual/indexes/)
- [Official documentation](https://www.mongodb.com/docs/manual/sharding/)
- [Official documentation](https://www.mongodb.com/docs/atlas/)
- [Official documentation](https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html)
- [Official documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_MySQL.html)
- [Official documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Official documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_SQLServer.html)
- [Official documentation](https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview?view=azuresql)
- [Official documentation](https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/sql-managed-instance-paas-overview?view=azuresql)
- [Official documentation](https://www.mongodb.com/docs/manual/data-modeling/concepts/embedding-vs-references/)
- [Official documentation](https://www.postgresql.org/docs/18/ddl-constraints.html)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-model.html)
- [Official documentation](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)
- [Official documentation](https://www.postgresql.org/docs/18/transaction-iso.html)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-isolation-levels.html)
