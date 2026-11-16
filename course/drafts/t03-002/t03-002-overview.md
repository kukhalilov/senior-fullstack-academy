# relational modeling constraints data types null and normalization — Big-picture orientation and mental model

# Problem and purpose

Relational modeling decides which facts exist, how they identify one another, and which invalid states the database refuses to store. A good schema makes ordinary operations natural while making corruption difficult. Types, keys, nullability, and constraints are part of the meaning of the data, not storage decoration.

# Plain-language mental model

Treat a database as a set of related fact ledgers. Each table should have a clear subject; each row should describe one instance; each column should have one stable meaning. Keys name rows and connect facts. Constraints are guardrails that apply to every writer. Normalization is the method for giving each fact one authoritative home; denormalization deliberately repeats or precomputes information and therefore creates a synchronization obligation.

# How the parts fit together

1. Identify entities, relationships, and business rules before choosing columns.
2. Find candidate keys, choose a stable primary key, and preserve alternate business-key rules.
3. Decide optionality and types from domain meaning; make NULL semantics explicit.
4. Express row and relationship invariants with NOT NULL, PRIMARY KEY, UNIQUE, FOREIGN KEY, and CHECK constraints.
5. Normalize according to dependencies, then add deliberate read optimizations only after identifying their authority and update path.
6. Evolve production schemas through compatible stages that allow old and new application instances to coexist.

# Concept map

| Design question | Main tool | Typical failure when skipped |
| --- | --- | --- |
| What fact is this row about? | Relation and entity boundary | One row mixes independent facts |
| How is it identified? | Candidate, primary, alternate keys | Duplicates or unstable references |
| How are facts related? | Foreign key and junction table | Dangling or cross-tenant references |
| What values are valid? | Type, nullability, CHECK | Invalid ranges or ambiguous absence |
| Where should a fact live? | Functional dependencies and normalization | Update, insert, and delete anomalies |
| What does a value compare as? | Collation and data-type rules | Unexpected uniqueness, rounding, or sorting |
| How can schema change safely? | Expand, backfill, cut over, contract | Old code fails during rolling deployment |

The broad method is more important than memorizing every type. First define identity and invariants, then select a representation that preserves them. SQL Server supplies enforcement mechanisms, but their precise behavior matters: a CHECK accepts UNKNOWN, a UNIQUE key permits at most one NULL in a single nullable key, and `datetimeoffset` stores an offset rather than a named time zone. [Constraints](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17) [Unique indexes](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-unique-indexes?view=sql-server-ver17) [datetimeoffset](https://learn.microsoft.com/en-us/sql/t-sql/data-types/datetimeoffset-transact-sql?view=sql-server-ver17)

# End-to-end walkthrough

Model a multi-tenant order system. A customer belongs to one tenant, an order belongs to one customer, and an order has lines. Define `TenantId` and stable surrogate keys, then require a UNIQUE `(TenantId, CustomerCode)` rule if codes are tenant-local. Put the customer FK on the many-side order table and include tenant identity in the relational key where needed to prevent cross-tenant links. Put each product/quantity/price fact on the line; make the line key unique within its order. Store price as a suitably sized `decimal(p,s)`, not an approximate float. Make required values NOT NULL, define nullable fields only when their absence has a meaning, and add CHECK constraints for row-local ranges. A schema migration that adds a new required status should add it compatibly, backfill real values, validate constraints, deploy readers/writers, and only then remove old columns.

# When to use it and tradeoffs

Normalize independent facts and declare keys/constraints when integrity and independent updates matter. A surrogate key is useful when business identifiers can change, but retain UNIQUE constraints for true business identity. Use a composite key when the relationship itself is the identity and the tuple is stable. Denormalize only when a workload justifies the repeated data and you have a transactional refresh or authoritative recomputation strategy. Choose types for exactness/range and collation for domain comparison, not convenience alone.

# What later lessons cover

The four references explain relational dependencies; constraints and NULL; SQL Server types and collations; and schema decisions/evolution. Practice designs a small tenant/order schema and migration. Query syntax, indexes, temporal-table operation, and engine comparison are covered in adjacent topics.

# Sources

- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/null-and-unknown-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-unique-indexes?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/decimal-and-numeric-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/money-and-smallmoney-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/char-and-varchar-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/nchar-and-nvarchar-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/date-and-time-types?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/datetime2-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/datetimeoffset-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-type-precedence-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/functions/cast-and-convert-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/functions/try-cast-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/collations?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/json-data-type?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/json/json-data-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/vector-data-type?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/functions/vector-functions-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/hierarchical-data-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/string-and-binary-types?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/use-table-valued-parameters-database-engine?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-types/create-user-defined-data-types-database-engine?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/spatial/spatial-data-types-overview?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/patterns/expand-contract)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal-tables?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-computed-columns-in-a-table?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description)
