# database comparisons SQL Server PostgreSQL MySQL document stores and tradeoffs — Exercises and worked solutions

# Goals

Map requirements to data and transaction boundaries, expose product/service assumptions, and design a fair comparison.

# Worked example

A reservation service needs one active reservation per room/time slot, a history view, and a tenant-specific dashboard. First state the uniqueness and overlap invariant and the required simultaneous update behavior. Compare a relational schema with declarative constraints/transactions against a document aggregate with a validator, single-document atomic operations, and any required multi-document transaction. Identify whether the invariant can live in one document and how a sharded key would route competing reservations. Then test realistic hot-room contention, duplicate races, p99, successful throughput, durability, backup restore, and failover. Do not infer a winner from model labels.

# Exercises

1. A customer profile contains a growing list of orders. Decide what evidence would favor embedding versus referencing or relational tables.
2. Two services concurrently create the same tenant-scoped order number. What control prevents duplicates across service instances?
3. An application reads from a replica after writing to the primary but must immediately see its own change. Which guarantee/configuration needs investigation?
4. A team selects Amazon DocumentDB because it “is MongoDB.” What must be checked before migration?
5. A benchmark reports 2x throughput but uses warm cache, no writes, and no durability. What conclusions are valid?
6. A managed service supports the engine’s version but not a required extension. What are the decision options?
7. The business requires 5-minute RPO and 20-minute RTO. What separate tests validate those targets?
8. Current release labels show PostgreSQL 19 RC2 and MongoDB 9.0.8. Which should be called prerelease and which stable?

# Progressive hints

1. Check bounded document size, access/update patterns, independent child queries, change frequency, and duplication cost.
2. Use a database uniqueness invariant at the correct tenant/key scope.
3. Check replica read routing and read-your-writes/session consistency behavior.
4. Check supported commands, operators, transactions, drivers, indexes, aggregation stages, and service gaps.
5. Only a narrow warm-cache read-only result for that configuration.
6. Change service/engine, redesign extension use, or accept migration/operational cost after a proof of concept.
7. RPO tests recovery-point/data loss; RTO tests detection through validated service restoration.
8. PostgreSQL 19 RC2 is prerelease; MongoDB 9.0.8 is a stable major-line patch as of the check.

# Complete solutions

1. Embedding is plausible only if the collection remains bounded and profile/order access/update patterns align. An unbounded growing array risks document growth and write contention; referencing or relational tables may fit separately queried/updated orders. Benchmark dashboard and order workflows and document ownership of copied customer fields.
2. Enforce a unique key on the tenant identifier plus order number in the database. Application prechecks race because both services can observe “not present” before either write commits.
3. Investigate whether the application can read from the same primary/session or use a documented read-your-writes/session guarantee. Replica lag and read concern are distinct from successful primary write acknowledgment.
4. Verify API/command/aggregation/index support, transaction behavior, driver compatibility, version limits, consistency guarantees, and managed-service backup/restore/operations. Run application compatibility tests; compatibility is not identity.
5. Only that setup’s warm-cache read-only throughput result. It says nothing about write-heavy performance, durability, cold start, p99, recovery, or a universal engine ranking.
6. Compare other supported service/engine options, remove/rewrite the extension dependency, or accept self-management/porting cost. Validate the managed feature gap and operational consequences before deciding.
7. For RPO, induce a failure and measure the latest recoverable committed data point from independent backups/replicas under stated settings. For RTO, time failure detection through restore/failover, validation, client reconnection, and useful operations. Rehearse both independently and together.
8. PostgreSQL 19 RC2 remains a release candidate on 2026-11-16; PostgreSQL 18.7 is stable. MongoDB 9.0.8 is a stable patch in the MongoDB 9.0 line. MySQL 9.7.4 is LTS and 26.10 Innovation; those names identify separate channels. [PostgreSQL release state](https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/) [MongoDB 9.0](https://www.mongodb.com/docs/manual/release-notes/9.0/) [MySQL release tracks](https://dev.mysql.com/doc/refman/9.7/en/mysql-releases.html)

# Tests and edge cases

- Include key skew, largest tenant, largest document, null/optional fields, and duplicate races.
- Test transaction abort/retry and the exact replica read/write acknowledgement policy.
- Measure index write/storage cost as well as query benefit.
- Test managed-service limitations, driver compatibility, extension support, and maintenance windows.
- Run backup restore and failover rehearsals against numeric RPO/RTO targets.
- Separate cold start, warm cache, read-only, write-heavy, and failure workloads.
- Record engine versions and patch/channel status at benchmark time.

# Reflection questions

Which invariant must the database enforce? What is the atomic unit? Who owns migrations? What happens if the read replica lags? Which feature is unavailable in the hosted service? What evidence would change your choice?

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
