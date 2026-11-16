# database comparisons SQL Server PostgreSQL MySQL document stores and tradeoffs — Reference: Decision criteria, workload fit, and fair comparison methodology

# Scope and version

Engine facts and release channels are pinned to the source snapshot checked 2026-11-16. Managed-service version/feature availability varies by provider and offering; verify the exact target. The list below contains only the supplied names.

# How this group fits the mental model

Evaluation is the evidence layer that tests whether a candidate serves actual workload and business requirements.

# Supplied names explained

- `Transactional workload` — Workload dominated by short state-changing transactions with correctness, concurrency, and latency requirements.

- `Analytical workload` — Workload dominated by scans, joins, aggregates, and longer reads; it can compete with transactional users and may fit separate storage/compute or replicas.

- `Mixed OLTP and reporting workload` — Combines short writes and analytical reads, requiring workload isolation, indexes/projections, replicas, or scheduling decisions.

- `Write-heavy workload` — High mutation volume where log/redo capacity, index maintenance, contention, and replication throughput can dominate.

- `Read-heavy workload` — High query volume where cache behavior, indexes, query fan-out, and replica freshness matter.

- `Hot-key workload` — Many concurrent requests target the same key/range, causing contention or uneven shard/partition load despite low total data volume.

- `Relational integrity requirement` — Need to enforce references, uniqueness, and cross-row invariants at the database boundary; compare actual constraint support and transaction scope.

- `Flexible aggregate boundary` — Need to evolve/read/write a bounded aggregate as a unit; document embedding can fit, while unbounded or independently queried relationships may favor references/relations.

- `Cross-row transaction requirement` — Invariant spans multiple rows/documents and must commit atomically; test exact engine/service transaction support and throughput cost.

- `Multi-tenant isolation requirement` — Separates tenant reads/writes and access; use explicit tenant keys, authorization, unique constraints, partition/shard strategies, and isolation tests.

- `Data-volume estimate` — Expected current and growth volume, including indexes, replicas, history, and backups, used to size and cost the system.

- `Query-shape inventory` — Representative filters, joins, aggregates, sorts, updates, and data access paths collected before choosing a model or benchmark.

- `Concurrency profile` — Concurrent readers/writers, transaction duration, bursts, hot keys, and peak connection behavior used to test contention and throughput.

- `Latency percentile` — Distribution statistic such as p50/p95/p99. Percentiles expose tail behavior that means can hide, but require enough representative samples.

- `Throughput measurement` — Successful useful operations completed per unit time under a defined workload, not merely requests submitted.

- `Durability configuration` — Settings and acknowledgement policy governing what failures a committed write survives; inspect fsync/journal/log and replica policies.

- `Cache-warm benchmark` — Measures performance after representative data/index pages are cached; it does not predict cold-start or failover behavior.

- `Cold-start benchmark` — Measures startup or cold-cache performance including load/compilation and storage reads; do not compare it with warm-cache results as equivalent runs.

- `Representative data distribution` — Skew, cardinality, document size, null/optional frequency, and tenant/key distribution matching production; averages can mask hot keys.

- `Index-maintenance cost` — Storage, insert/update/delete amplification, page/fragmentation behavior, rebuild time, and replica/log traffic added by indexes.

- `Backup and restore time` — Measured duration and resource impact of backup and restore under actual volume, key access, bandwidth, and target capacity.

- `Failover test` — Rehearsal that measures detection, promotion, possible data loss, client retries, validation, and restoration of redundancy.

- `Operational expertise` — Team’s ability to diagnose, patch, secure, scale, and recover the chosen engine and managed service within required response times.

- `Application portability` — Cost to move query code, types, transactions, drivers, operational logic, and data between supported targets.

- `Managed-service feature gap` — Difference between engine capability and features exposed/allowed by a managed provider’s version, edition, parameter, extension, or network surface.

- `Total cost of ownership` — Full lifecycle cost including compute, storage, backups, replicas, license, network, engineering labor, downtime risk, and migration.

- `Capacity headroom` — Measured unused resource under expected peak and failure conditions, including growth and maintenance jobs.

- `Migration rehearsal` — Repeatable test of schema/data conversion, application compatibility, downtime/replication, validation, cutover, and recovery/rollback.

- `Workload-specific benchmark conclusion` — Conclusion bounded to declared hardware/service, data, query mix, concurrency, durability, cache, software versions, and metrics; it does not rank engines universally.

# Cross-item comparison

A decision method begins from workload and invariants. Latency, throughput, recovery, durability, TCO, expertise, and portability should be measured for the same representative conditions. A benchmark conclusion is a bounded report, not a database ranking.

# Examples

```text
Benchmark setup: same representative data and query mix, same durability target, stated concurrency, measured p50/p95/p99 and successful throughput.
Run warm-cache, cold-start, write-heavy, and failover/recovery cases separately.
Report tested versions, service tiers, index costs, and uncertainty; do not generalize beyond them.
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

1. Why measure p99? **To expose tail behavior hidden by means.**
2. What makes a benchmark representative? **Realistic queries, data distribution, concurrency, durability, and cache conditions.**
3. What limits the conclusion? **The tested versions, service setup, and workload.**

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
