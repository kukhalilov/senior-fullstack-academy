# database comparisons SQL Server PostgreSQL MySQL document stores and tradeoffs — Reference: Decision criteria, workload fit, and fair comparison methodology

# Scope and version

Engine facts and release channels are pinned to the source snapshot checked 2026-11-20. Managed-service version/feature availability varies by provider, region, edition, and offering; verify the exact target. The list below contains only the supplied names.

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

- `Latency percentile` — Distribution statistic such as p50/p95/p99. p95 is the latency at or below which about 95% of measured operations completed; p99 exposes a more extreme tail than the mean or median. Report the sample count, measurement window, and whether failed/timed-out operations are included; a percentile from too few or unrepresentative samples is misleading.

- `Throughput measurement` — Successful useful operations completed per unit time under a defined workload, not merely requests submitted. Report errors, retries, and latency alongside throughput so a system cannot appear faster by rejecting or timing out more work.

- `Durability configuration` — Settings and acknowledgement policy governing what failures a committed write survives; inspect fsync/journal/log and replica policies.

- `Cache-warm benchmark` — Measures performance after representative data/index pages are cached; it does not predict cold-start or failover behavior.

- `Cold-start benchmark` — Measures performance before the relevant data and index pages reach a representative warm cache. Measure process/service startup and cold-cache query behavior separately where both matter; do not compare either run with a warm-cache result as if they were equivalent.

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

- `Workload-specific benchmark conclusion` — Conclusion bounded to declared hardware/service, data, query mix, concurrency, durability, cache, software versions, and metrics; it does not rank engines universally. Standardized TPC results include disclosure material for reproducing the stated configuration; a vendor’s custom benchmark is not directly comparable unless its workload, setup, and rules match.

# Cross-item comparison

A decision method begins from workload and invariants. Latency, throughput, recovery, durability, TCO, expertise, and portability should be measured for the same representative conditions. A benchmark conclusion is a bounded report, not a database ranking.

# Examples

```text
1. Define the production transaction mix, correctness checks, durability target, data distribution, growth, and peak concurrency.
2. Use equivalent data, workload scripts, service tiers/hardware, indexes, cache state, and measurement windows for each candidate.
3. Warm up consistently; repeat steady-state runs. Record p50/p95/p99, useful throughput, errors/retries, CPU, memory, I/O, storage, and cost.
4. Run cold-cache/startup, write-heavy, failover, backup/restore, and maintenance-window tests separately.
5. Report versions, configuration, sample counts, variability, and unsupported or excluded features. State exactly which deployment decision the evidence supports.
```

Do not treat a built-in benchmark as automatically representative. For example, PostgreSQL’s default pgbench workload is described as TPC-B-inspired but not TPC-B; pgbench supports custom scripts for other transaction mixes. Standardized TPC results have disclosure requirements intended to let readers inspect and reproduce the reported configuration.

These are decision sketches, not benchmark results or guarantees. Check the target engine/service documentation and test under the workload that matters.

# Common mistakes

- Choosing from a product popularity list before writing down invariants and query shapes.
- Using average latency alone and hiding a high p95/p99 tail or failures.
- Comparing one warm-cache run with another candidate’s cold-start run.
- Running with tiny or uniform data that omits production skew, hot keys, tenant sizes, and history.
- Measuring requests submitted instead of successful correct transactions.
- Comparing engines with different durability, indexes, versions, hardware, service tiers, or concurrency and attributing the result only to the database.
- Treating a synthetic benchmark or vendor benchmark as a universal engine ranking.
- Ignoring index writes, backups, replicas, egress, licenses, engineering effort, and restore/failover costs in TCO.
- Accepting a successful migration rehearsal without validating data, application behavior, cutover, and rollback/recovery.

# Knowledge checks with answers

1. Why measure p99? **To expose tail behavior hidden by means.**
2. What makes a benchmark representative? **Realistic queries, data distribution, concurrency, durability, and cache conditions.**
3. What limits the conclusion? **The tested versions, service setup, and workload.**
4. Why should warm-cache and cold-cache results be separate? **They measure different storage/cache states and answer different user-impact questions.**
5. What should accompany p99? **Sample count, measurement window, workload, success/error handling, and the tested environment.**
6. What should happen to timeouts and failed transactions in throughput? **Report them explicitly; only successful correct operations count as useful throughput.**
7. Why inspect a TPC full-disclosure report? **It exposes configuration and implementation details needed to interpret and reproduce the reported result.**

# Sources

- [Official documentation](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)
- [Official documentation](https://learn.microsoft.com/en-us/sql/sql-server/editions-and-components-of-sql-server-2025?view=sql-server-ver17)
- [Official documentation](https://www.postgresql.org/docs/19/)
- [Official documentation](https://www.postgresql.org/docs/19/pgbench.html)
- [Official documentation](https://www.postgresql.org/support/versioning/)
- [Official documentation](https://www.postgresql.org/docs/19/release-19.html)
- [Official documentation](https://www.postgresql.org/about/news/postgresql-19-released-3449/)
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
- [Official documentation](https://www.postgresql.org/docs/19/ddl-constraints.html)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-model.html)
- [Official documentation](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)
- [Official documentation](https://www.postgresql.org/docs/19/transaction-iso.html)
- [TPC Benchmark Full Disclosure Requirements](https://www.tpc.org/TPC_Documents_Current_Versions/pdf/TPC-DS_v4.0.0.pdf) (standardized results must include reproducibility disclosure)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-isolation-levels.html)
