# database comparisons SQL Server PostgreSQL MySQL document stores and tradeoffs — Core concepts and how they fit together

# Learning objectives

- Model the same requirement as tables or documents and name the tradeoffs.
- Compare transaction and replication guarantees without relying on shared terminology alone.
- Separate database engine choice from managed-service choice.
- Design a representative test that can support a narrow, evidence-based conclusion.

# Prerequisites

Know basic tables, keys, JSON objects, queries, transactions, indexes, replicas, and backups. This topic is a comparison framework; detailed SQL syntax and provider-specific administration are outside its scope.

# Core concepts

## Start with invariants and access patterns

Write down the business facts, uniqueness rules, references, deletion behavior, and which writes must be atomic. Then inventory query shapes and how often each runs. Relational tables make references/constraints explicit and support joins; document aggregates group data that is commonly accessed together. Embedding duplicates facts when they change independently; references can require more reads or a multi-document transaction. Either model can be poorly designed if it ignores actual access and update patterns.

A relational primary key identifies rows; foreign keys enforce reference rules. A document validator constrains writes but is not automatically equivalent to every relational constraint. Single-document atomicity in MongoDB is useful only when the invariant fits within that document. Across documents, MongoDB has multi-document transactions with topology and cost implications. [MongoDB atomicity](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/) [transactions](https://www.mongodb.com/docs/manual/core/transactions/) [PostgreSQL constraints](https://www.postgresql.org/docs/18/ddl-constraints.html)

## Similar labels do not guarantee identical semantics

SQL Server, PostgreSQL, and MySQL implement relational transactions but differ in SQL dialect, data type/coercion, constraints, isolation, locking/MVCC, optimizer, and service feature exposure. Named isolation levels are not interchangeable proof of identical phenomena. MongoDB’s read concern and write concern name policies for read consistency and write acknowledgement; they should be matched to failure and freshness requirements. Synchronous replication only means a configured acknowledgement boundary; whether it waits for durable hardening, votes, or journal depends on the product/configuration. [SQL Server locking and row versioning](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17) [PostgreSQL isolation](https://www.postgresql.org/docs/18/transaction-iso.html) [MySQL InnoDB transactions](https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-model.html) [MongoDB read concern](https://www.mongodb.com/docs/manual/reference/read-concern/) [write concern](https://www.mongodb.com/docs/manual/reference/write-concern/)

## Query and indexes are a coupled design

A query planner considers the query, statistics, index structures, and costs to select a plan. An index can reduce reads but adds storage and write maintenance. Compound-key order matters. Partial and expression index support/eligibility is vendor-specific. Full-text search and JSON-path indexing are specialized surfaces, not portable assumptions. Parameterized/prepared statements separate values from query text, yet plan reuse can be parameter-sensitive. Compare actual engine plans under realistic distributions instead of copying index syntax across vendors.

## Scaling has multiple meanings

Vertical scaling adds resources to one deployment. Read replicas can add read capacity or recovery options but have lag/freshness considerations. Partitioning organizes data into pieces and can support pruning or maintenance; sharding distributes pieces across nodes and adds routing/rebalancing and cross-shard costs. These terms are related but not synonyms.

## Managed service changes operational ownership

A hosted service can automate infrastructure, maintenance, backups, or failover, while limiting engine versions, extensions, privileges, or maintenance windows. A compatibility service such as Amazon DocumentDB is not identical to MongoDB simply because it supports some MongoDB APIs. Create a responsibility matrix for patching, key custody, recovery tests, networking, and incident response. Verify supported features for the specific service/version/region rather than inferring parity from the engine name.

## Benchmarks must preserve workload shape

Record hardware/service tier, engine/version, schema, data size/distribution, query mix, indexes, concurrency, durability configuration, cache condition, and measurement window. Report successful throughput, p50/p95/p99, errors, and resource/cost use. A warm-cache single-query speed test does not predict cold-start, failover, write-heavy, or tail behavior. Keep benchmark conclusions limited to the tested setup.

# Mechanisms and relationships

The decision sequence is: invariant -> data model -> query/index surface -> transaction/consistency contract -> deployment topology -> recovery ownership -> representative test. A mismatch discovered at any layer can change the candidate. Managed hosting can change operations without changing the conceptual data model; engine compatibility does not guarantee feature parity.

# Worked examples

A tenant dashboard reads a tenant’s profile and recent orders, while order creation must be unique per tenant. Relational design can enforce `(tenant, order number)` uniqueness and a foreign key. An embedded order/customer snapshot may make a bounded dashboard read efficient but introduces update semantics for copied profile fields. Benchmark both with realistic tenant-size skew; test concurrent duplicate order creation, failover/read freshness, backup restore, and schema evolution. Choose based on the invariant and measured workload, not on one endpoint’s latency.

# Misconceptions and edge cases

- “NoSQL means no schema.” Documents still need shape, validation, versioning, indexes, and migration rules.
- “ACID” means the same isolation behavior in every engine.
- “A replica is a backup.” Replicas can copy deletes/corruption and may lag.
- “Sharding is partitioning.” Sharding distributes across nodes; engine-local partitioning has a different failure and routing boundary.
- “Managed means the provider handles recovery.” Customers still need to define and test recovery outcomes and validate their data.
- “SQL-compatible means interchangeable.” Dialects, functions, types, constraints, and transaction behavior differ.
- “An index always speeds the system up.” It can increase writes, storage, and maintenance.
- “A benchmark ranks databases universally.” It only supports claims about its setup and workload.

# Knowledge checks with answers

1. What should drive embedding? **A bounded aggregate commonly accessed/updated together, with acceptable duplication and size.**
2. Does MongoDB single-document atomicity automatically cover multiple documents? **No; use an appropriate transaction or model the invariant differently.**
3. Is a read replica necessarily current? **No; verify the freshness/consistency policy and lag.**
4. What must accompany a benchmark claim? **Workload, data, settings, versions, environment, metric definitions, and failure/cache conditions.**
5. Does a managed engine guarantee feature parity with self-managed? **No; service limits and versions matter.**

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
