# database comparisons SQL Server PostgreSQL MySQL document stores and tradeoffs — Reference: Data models, query languages, schema, and indexing boundaries

# Scope and version

Engine facts and release channels are pinned to the source snapshot checked 2026-11-20. Managed-service version/feature availability varies by provider and offering; verify the exact target. The list below contains only the supplied names.

# How this group fits the mental model

Model and query surface determine how facts are represented and how an application asks for them. The choice affects integrity, query expressiveness, indexes, and portability.

# Supplied names explained

- `Relational database` — Stores data in relations (tables) with declared row/column structure, keys, constraints, and a query language. Engine details still differ in types, SQL extensions, concurrency, indexing, and operational tooling.

- `SQL Server 2025 (17.x)` — Microsoft’s current SQL Server major engine line in this snapshot. T-SQL, edition, platform, and compatibility-level boundaries matter; preview features such as vector indexes are not the same status as stable features. [SQL Server 2025](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)

- `PostgreSQL 19` — PostgreSQL 19.0 became generally available on 2026-11-19 and is the current major line; PostgreSQL 18.7 is the current 18.x minor. PostgreSQL 19 adds features including concurrent REPACK, logical replication of sequence values, and standby read-your-writes with WAIT FOR LSN. [Version policy](https://www.postgresql.org/support/versioning/) [PostgreSQL 19 release notes](https://www.postgresql.org/docs/19/release-19.html)

- `MySQL 9.7 LTS` — MySQL’s current Long-Term Support release series in this snapshot (9.7.4). LTS denotes a longer-lived release track, not feature identity with SQL Server or PostgreSQL. [Oracle release](https://blogs.oracle.com/mysql/mysql-october-2026-ga-releases-now-available)

- `MySQL 26.10 Innovation release` — Current MySQL Innovation release in this snapshot. Innovation is its own supported release track with newer functionality and a regular upgrade cadence; version number magnitude does not mean it is an LTS line. [Oracle release model](https://dev.mysql.com/doc/refman/9.7/en/mysql-releases.html)

- `Document database` — A broad family that stores document-shaped records, often nested JSON-like values. It still needs explicit identifiers, validation, indexes, migration policy, and transaction/consistency design.

- `MongoDB 9.0` — Current stable MongoDB major line in this snapshot, with 9.0.8 the listed latest patch. MongoDB Atlas rollout and self-managed package availability may lag the stable documentation listing. [Release notes](https://www.mongodb.com/docs/manual/release-notes/9.0/) [Lifecycle](https://www.mongodb.com/legal/support-policy/lifecycles)

- `Table` — A named relation whose rows share defined columns and constraints. Tables can normalize facts, enforce keys, and participate in transactions.

- `Row` — One tuple/record in a table, identified by a key when the model requires stable identity.

- `Column` — A named attribute with a data type, nullability, and potentially a default or constraints.

- `Primary key` — A declared candidate key selected as the table’s primary row identifier; it is unique and non-null in relational engines.

- `Foreign key` — A constraint relating values to a referenced key, enforcing referential integrity according to engine-specific actions and deferral behavior.

- `Unique constraint` — Declaratively prohibits duplicate key combinations. NULL treatment and implementation details differ among engines; do not assume identical multiple-NULL behavior.

- `Check constraint` — Declaratively restricts rows to values satisfying a Boolean condition; provider differences include enforcement and deferral details.

- `Normalized relational schema` — Separates facts into related tables to reduce update anomalies and preserve one authoritative value; reads may require joins.

- `Denormalized relational projection` — Stores precombined or duplicated values to reduce read work, at the cost of write synchronization and extra storage.

- `JSON document` — Textual JSON data format used for object/array serialization. Database storage, validation, operators, and indexes differ by engine and native type.

- `BSON document` — MongoDB’s binary-encoded document representation, which supports BSON-specific types and is not simply a JSON text string.

- `Nested document` — An object embedded inside another document; supports aggregate-shaped access but creates document growth and update/duplication tradeoffs.

- `Embedded document` — MongoDB modeling choice that keeps related data within one document, enabling atomic single-document updates but requiring bounded size and access patterns.

- `Referenced document` — Modeling choice that stores a reference/key to another document, reducing duplication but requiring additional reads or transactions for multi-document invariants.

- `Schema-on-write` — Validation and structure are enforced when data is written, through database constraints, validators, or application rules; it is common in relational modeling and also available in document databases.

- `Flexible document schema` — Documents in one collection may have different fields/shapes, but flexibility does not remove versioning, validation, indexing, or migration responsibilities.

- `Document validation rule` — MongoDB collection validator that can constrain document fields/types at write time; validation level/action settings affect existing and future writes.

- `SQL query` — Declarative relational query language family standardized with vendor extensions. Equivalent-looking queries can differ in syntax, type behavior, planner choices, and concurrency semantics.

- `Transact-SQL (T-SQL)` — SQL Server’s dialect with procedural language, system catalog, transaction, and engine-specific syntax beyond portable SQL.

- `PostgreSQL SQL extensions` — PostgreSQL adds types, operators, functions, procedural languages, and SQL syntax beyond the SQL standard. Portability must account for the exact extension and version.

- `MySQL SQL dialect` — MySQL implements SQL with engine-specific syntax, functions, modes, storage engines, and defaults. Validate strict modes, coercions, and DDL semantics rather than assuming another vendor’s behavior.

- `MongoDB Query API` — MongoDB operations for filtering, projection, sorting, updates, and aggregation over BSON documents; it is not SQL and has server/driver syntax and behavior boundaries.

- `MongoDB aggregation pipeline` — Ordered stages transform/filter/group/join-like documents and can use indexes only where stage/query planning permits; memory, spilling, and stage semantics need workload testing.

- `Secondary index` — An index separate from the primary storage/key path that accelerates selected predicates or orderings but consumes space and adds write/maintenance cost.

- `Compound index` — Index over multiple ordered keys; key order determines which prefixes and sort/filter patterns are efficiently supported.

- `Partial index` — Index containing only rows/documents satisfying a predicate. PostgreSQL and MongoDB support partial-index concepts with differing syntax and planner implication rules; SQL Server offers the related filtered-index feature. Do not assume identical predicate implication, uniqueness, or planner eligibility.

- `Expression index` — Index on a computed expression or function result. Expression determinism, collation, type, and query-expression matching are engine-specific.

- `Full-text index` — Specialized linguistic/text-search index rather than a general B-tree replacement; tokenization, stemming, ranking, and feature availability differ.

- `JSON path index` — Indexing a JSON path is engine-specific, not one portable index type. SQL Server 2025 has a generally available native JSON type and JSON index for JSON columns; older SQL Server patterns include indexed computed columns. PostgreSQL jsonb supports GIN operator classes and targeted expression indexes. MySQL JSON values are indexed through generated/functional columns or InnoDB multi-valued indexes for arrays, not by indexing the JSON column as an ordinary scalar key. MongoDB can index nested fields and arrays with ordinary or multikey indexes; wildcard indexes help with unknown field names but are not a substitute for workload-specific indexes. Check supported predicates, type/collation rules, and query-plan matching. [SQL Server JSON indexes](https://learn.microsoft.com/en-us/sql/relational-databases/json/index-json-data?view=sql-server-ver17) [PostgreSQL jsonb indexing](https://www.postgresql.org/docs/19/datatype-json.html) [MySQL JSON](https://dev.mysql.com/doc/refman/9.7/en/json.html) [MongoDB multikey indexes](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-multikey/)

- `Index selectivity` — How strongly an index key distinguishes rows for a predicate; it affects planner usefulness but must be interpreted with distribution, correlations, and workload.

- `Query planner` — Optimizer that chooses a physical execution strategy using query shape, statistics, constraints, indexes, and cost estimates; plans are estimates and can differ by engine/version.

- `Execution plan` — Representation of operators/stages selected or run for a query. Estimated and actual plans answer different questions and have vendor-specific formats.

- `Prepared statement` — Parsed/parameterized statement reused across executions in supported client/engine APIs. Preparation does not guarantee one plan is optimal for every parameter or engine.

- `Parameterized query` — Separates values from query syntax for safe binding and often reuse; dynamic identifiers still require allow-listing, and parameter-sensitive planning remains possible.

# Cross-item comparison

Relational tables expose declared columns and relationships; BSON documents can nest an aggregate. SQL Server, PostgreSQL, and MySQL share relational foundations but differ in dialect and features. MongoDB’s query API and aggregation pipeline operate on documents. Index types and JSON support must be compared per engine/service, not by label alone.

# Examples

```text
Requirement: order header, bounded line items, a unique order number per tenant, and reports by date.
Relational candidate: normalized tables, tenant-scoped unique key, foreign keys, query planner and indexes.
Document candidate: embedded bounded order aggregate; validate document shape and index report paths.
Test both query shapes and concurrent duplicate creation before choosing.
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

1. What tradeoff does embedding make? **Local aggregate access versus duplication, growth, and independent update needs.**
2. Are JSON path indexes portable? **No; compare each implementation and query match rules.**
3. Does a prepared statement guarantee an optimal plan? **No, parameter distribution and plan policy matter.**

# Sources

- [Official documentation](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)
- [Official documentation](https://learn.microsoft.com/en-us/sql/relational-databases/json/index-json-data?view=sql-server-ver17)
- [Official documentation](https://learn.microsoft.com/en-us/sql/sql-server/editions-and-components-of-sql-server-2025?view=sql-server-ver17)
- [Official documentation](https://www.postgresql.org/docs/19/)
- [Official documentation](https://www.postgresql.org/docs/19/release-19.html)
- [Official documentation](https://www.postgresql.org/docs/19/datatype-json.html)
- [Official documentation](https://www.postgresql.org/about/news/postgresql-19-released-3449/)
- [Official documentation](https://www.postgresql.org/support/versioning/)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/json.html)
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
- [Official documentation](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-multikey/)
- [Official documentation](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-wildcard/)
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
