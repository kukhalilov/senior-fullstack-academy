# relational modeling constraints data types null and normalization — Core concepts and how they fit together

# Learning objectives

- Translate a domain description into entities, relationships, candidate keys, and enforceable invariants.
- Explain functional dependencies, normal forms, and the anomalies normalization addresses.
- Predict SQL Server behavior for nullable predicates, constraints, keys, conversions, types, and collations.
- Choose identifiers, relationship placement, delete behavior, and migration stages with explicit tradeoffs.

# Prerequisites

Know that tables contain rows and columns, and recognize that SQL queries can insert, update, and delete rows. This lesson focuses on the design guarantees around those operations.

# Core concepts

1. A relational model represents facts as relations with declared keys and constraints. Table design begins by identifying entities, candidate identifiers, attributes, and relationships; constraints make invalid states harder to store.
2. Normalization separates facts according to functional dependencies to reduce update, insertion, and deletion anomalies. Denormalization is a deliberate read or performance choice that introduces consistency work and should preserve an authoritative source.
3. Data types encode domain meaning, range, precision, collation, and storage behavior. Choosing a type that merely accepts a value can silently change comparisons, rounding, sorting, or null semantics.
4. NULL represents missing or unknown information and changes predicate logic: comparisons can evaluate to UNKNOWN. It should not be used as a substitute for zero, empty text, or a missing relationship without a clear domain meaning.
5. Constraints such as PRIMARY KEY, UNIQUE, FOREIGN KEY, CHECK, and NOT NULL define enforceable invariants. Application validation improves feedback but does not replace constraints at the database boundary.

# Mechanisms and relationships

## Identity and relationships

For each table, list candidate identifiers: every minimal column set that uniquely identifies a row. Pick one primary key for stable database reference, and enforce alternate business keys separately. A foreign key connects child values to a candidate key on the parent. A many-to-many relationship becomes a junction table, where relationship facts (such as quantity, role, or effective date) can be stored once per association. When tenant is part of identity, include it in the relevant uniqueness and relationship rules; otherwise a valid customer id from tenant A might be paired with a row in tenant B.

## Dependencies and normalization

Suppose `OrderLine(OrderId, LineNo, ProductId, ProductName, Quantity, UnitPrice)`. If `(OrderId, LineNo)` determines every line fact, but `ProductId` determines `ProductName`, the product name is duplicated for every order line. Changing only some copies creates an update anomaly; a product without any order cannot be inserted, an insertion anomaly; deleting the last line could erase the only copy of a product name, a deletion anomaly. Put product facts in `Product` and reference it. Keep line-specific `UnitPrice` on the line if it represents the historical sale price, because that fact is determined by the order-line event, not today’s product catalog price.

1NF asks for atomic domain values and no repeating groups. 2NF rules out non-key facts depending on part of a composite candidate key. 3NF removes the usual transitive non-key dependencies (with a precise formal condition). BCNF strengthens this to require every nontrivial determinant to be a superkey. Normalize according to actual functional dependencies, not merely by counting columns; some schemas cannot preserve every dependency after decomposition.

## NULL, constraints, and domain meaning

SQL predicates use TRUE, FALSE, and UNKNOWN. For example, `NULL = 5` and `NULL = NULL` are UNKNOWN. WHERE retains only TRUE. CHECK rejects FALSE, so a nullable column can pass `CHECK (Age >= 18)` with NULL; add NOT NULL if absence is invalid. Use `IS NULL` to test the marker. COALESCE may collapse unknown into a default, so only do so when the default preserves meaning. SQL Server UNIQUE treats NULL as a key value and allows only one NULL in a single-column unique key. A filtered unique index can express “unique only when present.” [NULL logic](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/null-and-unknown-transact-sql?view=sql-server-ver17) [CHECK and UNIQUE](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17) [unique index behavior](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-unique-indexes?view=sql-server-ver17)

Foreign keys protect referential integrity. SQL Server does not offer deferred constraint checking to postpone the decision until commit; multi-step migration/order logic must satisfy constraints as statements execute. WITH NOCHECK can leave a constraint untrusted: future relevant writes can be checked while old rows were never validated. Revalidate existing data and restore trust before assuming optimizer or integrity guarantees. [Constraint creation](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17)

## Types carry meaning and comparison rules

Use decimal when decimal exactness matters, float/real for approximations, and date/time types whose range and offset behavior match the domain. `datetime2` has no offset; `datetimeoffset` preserves a numeric offset and compares instants in UTC, but does not preserve a named zone’s rules. `rowversion` is a database change counter, not a timestamp. `varchar(n)` limits bytes; UTF-8 collations permit Unicode but multibyte characters consume multiple bytes. Collation affects equality and sorting, so it can change whether a UNIQUE key accepts a pair of strings. Data-type precedence can cause implicit conversions and affect correctness or index use. [Data types](https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql?view=sql-server-ver17) [precedence](https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-type-precedence-transact-sql?view=sql-server-ver17) [collations](https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support?view=sql-server-ver17)

SQL Server 2025’s native JSON type is generally available alongside the older JSON functions and string storage approach. A JSON type is useful for semistructured values but does not remove the need to model stable relationships as relational facts or validate invariants. [JSON data type](https://learn.microsoft.com/en-us/sql/t-sql/data-types/json-data-type?view=sql-server-ver17)

## Evolving a live schema

For a breaking change, use an expand-and-contract sequence: add a backward-compatible field/table; deploy code that can read/write old and new shape; backfill in resumable, throttled batches; verify; switch the authoritative read/write path; then remove obsolete schema after all old clients are gone. A default can help old writers but must not invent historical truth. Validate constraints after cleanup, and measure lock duration and deployment overlap.

# Worked examples

## Put relationship attributes in the right place

An `Enrollment` between `Student` and `Course` has its own `EnrolledAt` and `Grade`. Store one row per student-course association in a junction table, with both foreign keys and a unique pair if re-enrollment is not modeled as separate attempts. If attempts are distinct events, introduce an attempt number or event identity instead of incorrectly forbidding them.

## Enforce a row-local rule and requiredness

```sql
CREATE TABLE dbo.Product
(
    ProductId int NOT NULL,
    Price decimal(12, 2) NOT NULL,
    CONSTRAINT PK_Product PRIMARY KEY (ProductId),
    CONSTRAINT CK_Product_Price CHECK (Price >= 0)
);
```

The key makes identity unique and non-null. NOT NULL expresses that price is required; CHECK supplies the nonnegative domain rule. The example is valid SQL Server DDL; it is not a claim that a server was run.

## Optional unique value

If a customer may have no external code, a normal SQL Server single-column UNIQUE constraint allows only one NULL. If many customers may have no code and present codes must be unique, a filtered unique index on `ExternalCode IS NOT NULL` expresses that rule. The intended meaning determines the design.

# Misconceptions and edge cases

- A primary key is not necessarily a single integer or a business identifier.
- A foreign key does not automatically create a useful child-side index.
- A UNIQUE constraint and primary key both enforce uniqueness, but nullability and table identity roles differ.
- CHECK does not imply NOT NULL because UNKNOWN passes.
- A default is used when a value is omitted; it is not a substitute for a required constraint.
- Normalization is not “always split every attribute”; preserve event facts, dependencies, and transaction boundaries.
- A database timestamp, rowversion, and offset-bearing datetime represent different concepts.
- The text limit in varchar(n) is byte-based; user-visible character counts can differ.
- Soft delete must be reconciled with unique constraints and every query’s active-row predicate.
- Temporal system history is not automatically legal audit evidence or business-valid time.

# Knowledge checks with answers

1. Why can `CHECK (Quantity > 0)` accept NULL? **Because the predicate evaluates UNKNOWN, and CHECK rejects FALSE only. Use NOT NULL too if required.**
2. What does `(TenantId, Email)` uniqueness mean? **No two rows may share the same pair; the email may repeat in another tenant.**
3. Does `datetimeoffset` remember the named time zone? **No; it retains a numeric offset and compares in UTC, but not the zone’s rules.**
4. When is a denormalized product name defensible? **When read needs justify it and a clear source-of-truth plus synchronization/rebuild process prevents drift.**
5. What makes a constraint trusted? **SQL Server has validated existing data, not merely enforced new writes after a NOCHECK addition.**

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
