# database comparisons SQL Server PostgreSQL MySQL document stores and tradeoffs — Interview questions and reasoning

# Core questions

1. How do you select relational tables versus document aggregates?
2. What does “schema flexibility” leave the team responsible for?
3. How does single-document atomicity differ from cross-document transactions?
4. Why can’t isolation-level names be compared without qualification?
5. How do read/write concerns affect MongoDB operations?
6. Partitioning versus sharding?
7. Why are managed services not identical to engine installations?
8. How do you compare a replica with a backup?
9. How should a database benchmark be designed?
10. What do current release channels mean for PostgreSQL, MySQL, and MongoDB?

# Concise interview answers

1. Start from invariants, aggregate boundaries, query/write access patterns, size/growth, and transaction scope; then test candidates.
2. Validation, field evolution, indexes, data migrations, and consistency rules.
3. A single-document write is atomic within that document; a multi-document invariant needs a transaction or different model, with coordination cost.
4. Engines implement different concurrency mechanisms, snapshot scope, and conflict handling under similarly named levels.
5. They define read visibility and write acknowledgement policies; choose them for stated consistency/failure assumptions.
6. Partitioning divides data into manageable subsets; sharding distributes data across nodes and adds routing/rebalancing costs.
7. Providers limit versions, extensions, commands, privileges, and maintenance/control surface while automating selected operations.
8. Replicas improve availability/read scale but can carry mistakes and lag; independent backups support retained-point recovery.
9. Use realistic data and query mix, concurrency, durability, cache state, versions, tail percentiles, throughput, failures, and full setup disclosure.
10. PostgreSQL 18.7 is stable and 19 RC2 prerelease; MySQL 9.7.4 LTS and 26.10 Innovation are separate tracks; MongoDB 9.0.8 is a stable-line patch.

# Deep follow-up answers

Discuss key/constraint semantics, parameter coercion and null behavior, index key order, snapshot/version retention, acknowledgement durability, replica freshness, provider-specific feature gaps, and upgrade/restore ownership. Be precise about what was tested. Avoid blanket claims that a document database needs no schema, that ACID implies serializable behavior, or that managed services remove customer responsibility.

# Scenario questions

**Two regions must accept writes during network partition.** Clarify whether conflicts are acceptable, how ownership/quorum works, and whether business invariants permit concurrent writes. State the consistency and reconciliation policy before proposing a topology.

**A document design is fast until one customer grows to millions of child records.** Revisit aggregate bounds and hot-key/data-growth pattern; measure document size/update contention and consider referencing, partitioning, or sharding strategies supported by the target.

**A managed service lacks a required extension.** Verify exact support boundaries and choose between redesign, different service, or self-managed engine with corresponding ownership cost.

# Tradeoffs and alternatives

Relational normalization reduces duplication and supports declarative constraints but can require joins and index design. Document embedding can align atomic updates with aggregate access but risks growth/duplication; referencing adds lookups/transaction coordination. Managed hosting reduces some infrastructure work while limiting control/portability. Read replicas, HA replicas, partitions, and shards have different consistency and capacity roles.

# Common weak answers

- “SQL is always consistent; NoSQL is always eventual.”
- “MongoDB is schema-free.”
- “ACID means the same isolation in every product.”
- “A read replica guarantees fresh reads.”
- “Managed service means no operations.”
- “A benchmark proves one database is faster.”
- “A larger version number means newer stable release.”

# Self-check rubric

Score 0–2: (0) preference or slogan; (1) names a product capability but misses its boundary; (2) starts from invariants/workload, distinguishes engine from service, states failure/consistency tradeoffs, and proposes a representative test.

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
