# database comparisons SQL Server PostgreSQL MySQL document stores and tradeoffs — Big-picture orientation and mental model

# Problem and purpose

Choosing a database is a workload and operations decision, not a popularity contest. First identify the data relationships, invariants, query shapes, consistency needs, team skills, recovery targets, and hosting constraints. Then compare the actual engine and service combination against those needs.

# Plain-language mental model

A relational model stores facts in related tables and uses keys and constraints to protect relationships. A document model stores related fields in a document-shaped aggregate and can make that aggregate convenient to read or update together. Both still need schema rules, indexes, transaction boundaries, access controls, backups, and a plan for growth. “Flexible schema” does not mean “no schema design.”

# How the parts fit together

1. Describe entities, relationships, invariants, and which records must change atomically.
2. List representative reads/writes, filters, joins/aggregation, data size, skew, and concurrent traffic.
3. Choose candidate model and index/query shape that serve those access patterns while preserving integrity.
4. Compare transaction, replication, backup, upgrade, and managed-service guarantees explicitly.
5. Run a fair benchmark and restore/failover rehearsal using realistic data, durability settings, and failure cases.

# Concept map

| Decision | Relational model | Document model |
| --- | --- | --- |
| Data shape | Related tables and declared keys | Nested or referenced BSON documents |
| Integrity | Constraints and transactions | Validators, atomic document updates, transactions where needed |
| Query | SQL dialect and relational plan | MongoDB Query API and aggregation pipeline |
| Scaling | Vertical, replicas, partitions, service tiers | Vertical, replicas, shards, service tiers |
| Operations | Self-managed or provider service | Self-managed or managed/compatibility service |

These are design tendencies, not guarantees. SQL Server, PostgreSQL, and MySQL are all relational but expose different types, dialects, optimizer behavior, and deployment controls. MongoDB offers both single-document atomic updates and multi-document transactions; using a document model does not make every multi-record invariant atomic automatically. [SQL Server 2025](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17) [PostgreSQL 18 docs](https://www.postgresql.org/docs/18/) [MySQL manual](https://dev.mysql.com/doc/refman/9.7/en/) [MongoDB data modeling](https://www.mongodb.com/docs/manual/data-modeling/)

# End-to-end walkthrough

Suppose an ordering system has customers, orders, line items, and a reporting page. If the invariant requires a customer reference, unique order number, and a coordinated change across rows, a relational schema with primary/foreign keys and a relational transaction may fit naturally. If an order is usually read/written as a bounded aggregate, an embedded document may reduce read fan-out and give a single-document atomic update, but duplicated customer facts and growth bounds need a policy. In either design, test the reporting query, hot customer/order keys, concurrent writes, indexes, and recovery procedure. The model follows the workload and invariant, not the reverse.

# When to use it and tradeoffs

Choose a relational design when relationships, cross-row constraints, and flexible joins are central. Choose embedded document aggregates when boundaries are clear, bounded, and commonly read/updated together. Referenced documents or normalized tables can avoid duplication and unbounded records but add fetch/join and consistency work. Managed services reduce some infrastructure work but add provider limits and service-specific upgrade/restore controls.

# What later lessons cover

The first reference lesson maps data/query surfaces and indexes. The second compares transaction and consistency semantics. The third covers hosting, recovery, and ownership. The fourth teaches workload selection and benchmark method. SQL Server syntax is handled in t03-002 onward; provider-specific administration and pricing are out of scope.

# Recent version changes

As checked on 2026-11-16, SQL Server 2025 is the current SQL Server line; PostgreSQL 18.7 is the current stable update while PostgreSQL 19 RC2 remains prerelease; MySQL 9.7.4 is LTS and 26.10 is Innovation; MongoDB 9.0.8 is the latest patch in its current stable major line. Treat the release channel and hosted availability as separate facts. [PostgreSQL release](https://www.postgresql.org/about/news/postgresql-187-1712-1616-1520-1425-and-19-rc-2-released-3442/) [MySQL October release](https://blogs.oracle.com/mysql/mysql-october-2026-ga-releases-now-available) [MongoDB release notes](https://www.mongodb.com/docs/manual/release-notes/9.0/)

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
