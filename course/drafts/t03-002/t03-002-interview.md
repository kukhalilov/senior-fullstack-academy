# relational modeling constraints data types null and normalization — Interview questions and reasoning

# Core questions

1. What distinguishes a candidate key, superkey, primary key, and alternate key?
2. When would you choose a natural or surrogate key?
3. Explain 1NF, 2NF, 3NF, and BCNF without claiming that normalization is a performance guarantee.
4. What does SQL Server do when NULL participates in comparisons, CHECK constraints, and UNIQUE constraints?
5. How do foreign keys, junction tables, and tenant-scoped keys preserve relationships?
6. When should a value use decimal, float, datetime2, datetimeoffset, or rowversion?
7. How do collation and UTF-8 affect equality, uniqueness, and varchar capacity?
8. How would you safely add a required column to a large production table?

# Concise interview answers

1. A superkey uniquely identifies rows; a candidate key is a minimal superkey; the primary key is the chosen candidate; other candidates are alternate keys and should remain UNIQUE if required.
2. Use natural keys when stable and meaningful; use a surrogate for stable internal references when domain identifiers can mutate, while preserving business-key constraints.
3. 1NF avoids repeating groups/non-atomic fields; 2NF removes partial dependencies on composite keys; 3NF removes transitive non-key dependencies under its formal condition; BCNF requires every nontrivial determinant be a superkey. They reduce anomalies, not necessarily query cost.
4. Comparisons with NULL often yield UNKNOWN; WHERE keeps TRUE only; CHECK rejects FALSE, so UNKNOWN passes; SQL Server unique keys treat NULL as a key value and permit at most one NULL for a single-column unique key.
5. A foreign key enforces the parent reference; a junction table represents many-to-many relationships; a composite tenant key prevents a valid child identifier from referencing a row belonging to a different tenant.
6. Decimal for exact decimal values, float for accepted approximation, datetime2 for date/time without zone, datetimeoffset when the numeric offset should be retained, and rowversion for optimistic change detection rather than time.
7. Collation controls string comparison/sort and sometimes encoding; UTF-8 varchar capacity is byte-bounded, so byte length and character count differ. Unique constraints follow collation equality semantics.
8. Expand compatibly, deploy compatible code, backfill in controlled resumable batches, validate, switch authority, then contract after old clients are gone.

# Deep follow-up answers

A schema is a formalized set of assumptions. A type constrains representation, a key defines identity, and constraints define allowed states. A normalization argument must name a functional dependency and anomaly rather than reciting “one value per column.” For temporal facts, distinguish when something was true in the business from when SQL Server recorded a row version. For migrations, defaults are convenient for future omitted values but can fabricate a past fact; backfill semantics should be explicit. SQL Server 2025 native JSON is generally available, but stable relational facts still benefit from keys and constraints; flexible payload structure does not itself enforce cross-row invariants.

# Scenario questions

1. **A unique email column should allow unlimited missing values.** A regular SQL Server UNIQUE key allows at most one NULL; use a filtered unique index for present values, after choosing canonicalization and deletion policy.
2. **A child row contains TenantId 8 and UserId belonging to tenant 9.** Use a composite candidate key `(TenantId, UserId)` and composite FK; an FK on UserId alone cannot enforce the tenant relation.
3. **A nullable CHECK column accepts NULL unexpectedly.** CHECK rejects FALSE but accepts UNKNOWN; add NOT NULL if the value is required.
4. **An index becomes unusable after comparing varchar column to nvarchar parameter.** Inspect the plan and conversion direction; align types/collations and parameter declarations to avoid converting the indexed column.
5. **A report needs historical “as known then” values.** Decide between system-versioned row history and business-valid-time modeling; specify actor/audit and retention needs separately.

# Tradeoffs and alternatives

Natural identifiers are meaningful but can change; surrogate identifiers are stable but require alternate-key rules. Composite keys encode domain relationships but widen references; a surrogate pair key can simplify references while a separate UNIQUE pair preserves association identity. Normalization avoids anomalies but may require joins; materialized or copied read models can serve latency goals with explicit refresh guarantees. Soft delete retains recoverability while complicating filtering and uniqueness; physical delete is simpler but loses row history unless separately archived.

# Common weak answers

- “Every table should have an integer ID, and that is enough.”
- “A CHECK makes the field required.”
- “All databases allow many NULLs in a unique column.”
- “A timestamp is a unique ordering key.”
- “datetimeoffset stores a time zone.”
- “Normalization always makes a database faster.”
- “A default backfills correct historical values.”
- “Application validation makes a foreign key unnecessary.”

# Self-check rubric

Score 0–2 for each: identifies key/dependency precisely; reasons about NULL as UNKNOWN; chooses enforceable constraints; selects types by range/exactness/offset/collation; handles tenant and lifecycle boundaries; and describes migration overlap/backfill/validation. A strong response states assumptions and failure modes before defending the design.

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
