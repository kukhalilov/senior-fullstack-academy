# relational modeling constraints data types null and normalization — Reference: Declarative constraints, NULL, defaults, and relational integrity rules

# Scope and version

This is the assigned reference group from the SQL Server 2025 (17.x) snapshot checked 2026-11-16. Every supplied name is explained below. Scope outside this group belongs to the overview or neighboring references.

# How this group fits the mental model

The table below is a design toolkit, not a sequence of independent vocabulary cards. Begin with what fact a row represents, then choose identity and relationships, constrain valid values, and preserve one authoritative copy of each fact. The next references connect these design choices to SQL Server enforcement and exact scalar behavior.

# Supplied names explained

- `NOT NULL constraint` — Prevents the column from storing the SQL NULL marker. It does not prevent empty strings, zero, or default values, so pair it with suitable domain checks when those are invalid.

- `PRIMARY KEY constraint` — Declares a table’s chosen unique, non-null key and creates a supporting unique index. SQL Server permits one primary-key constraint per table, though the key may be composite.

- `UNIQUE constraint` — Declares that one column or a column combination cannot repeat, while allowing NULL subject to SQL Server’s unique-key rule. SQL Server creates a unique index to enforce it.

- `FOREIGN KEY constraint` — Declares a child-to-parent key relationship. Referenced columns must be a primary/unique key, and the FK columns must have compatible types; null child keys do not reference a parent.

- `CHECK constraint` — Rejects a row when its Boolean condition is FALSE. UNKNOWN passes, so CHECK alone does not make a nullable value required; combine with NOT NULL when needed.

- `DEFAULT constraint` — Supplies an expression when an INSERT omits the column or uses DEFAULT. It does not replace a constraint and does not generally overwrite an explicitly supplied NULL.

- `Constraint naming` — Explicit stable names make migrations, diagnostics, and deployments predictable. Unnamed constraints receive generated names that are awkward to reference consistently.

- `Composite UNIQUE constraint` — Enforces uniqueness of the combined key tuple. It does not imply uniqueness of any one component; SQL Server also treats repeated NULL-containing key combinations as duplicate index keys.

- `Filtered unique index as partial uniqueness` — A unique index with WHERE predicate enforces uniqueness only for included rows, such as one active email per tenant. It is an index rather than a UNIQUE constraint and its filter must match the invariant.

- `ON DELETE NO ACTION` — The parent deletion fails if referencing rows remain. SQL Server’s default referential action is NO ACTION; it is not a deferred check.

- `ON DELETE CASCADE` — Deleting a parent deletes its referencing child rows as part of the same referential action. Use only when child lifecycle is truly owned by the parent and review cascade paths/trigger restrictions.

- `ON DELETE SET NULL` — Deleting a parent sets its child FK columns to NULL. Every affected FK column must be nullable, and the resulting unassociated child must make domain sense.

- `ON UPDATE referential action` — SQL Server foreign keys can use NO ACTION, CASCADE, SET NULL, or SET DEFAULT when a referenced key changes, subject to restrictions. Stable surrogate keys usually avoid needing mutable-key cascades.

- `Constraint enforcement` — The engine checks enabled constraints during relevant writes, making the invariant apply across clients and concurrent writers. Constraint validity depends on the constraint being enabled and trusted as appropriate.

- `Trusted constraint` — A trusted FK/CHECK has been validated against existing data, so the optimizer can rely on it. Trust is separate from being enabled for future writes.

- `Untrusted constraint` — An enabled but untrusted FK/CHECK is enforced for new or modified rows but existing data was not verified, so the optimizer cannot assume every old row complies.

- `WITH CHECK` — When adding or re-enabling a constraint, WITH CHECK validates existing rows and establishes trust if successful. It may fail on legacy violations and require remediation first.

- `WITH NOCHECK` — Disables validation of existing rows when adding/enabling a constraint and can leave it untrusted. It is a controlled migration escape hatch, not proof that the data is valid.

- `Nullable column` — A nullable column permits a NULL marker in addition to values from its type. Decide what NULL means and how predicates, uniqueness, defaults, and application serialization treat it.

- `NULL marker` — SQL NULL represents an absent/unknown/not-applicable value according to the model. It is not a regular value and ordinary equality does not test it.

- `Three-valued predicate logic` — SQL predicates can be TRUE, FALSE, or UNKNOWN when NULL participates. WHERE and CHECK have different practical outcomes: WHERE retains TRUE only, while CHECK rejects FALSE and therefore accepts UNKNOWN.

- `IS NULL predicate` — Tests whether an expression is the SQL NULL marker. Use it instead of `= NULL`; it yields TRUE or FALSE rather than UNKNOWN.

- `IS NOT NULL predicate` — Tests whether an expression has a non-NULL value. It does not establish that the value is nonempty or valid for the domain.

- `NULL is not equal to NULL` — Under SQL Server’s ordinary comparison semantics, `NULL = NULL` evaluates UNKNOWN rather than TRUE. Use IS NULL to test the marker; set operators and grouping have their own documented treatment.

- `NULL versus zero` — Zero is a known numeric value; NULL is missing/unknown/not-applicable. Replacing one with the other changes arithmetic, aggregates, filtering, and business meaning.

- `NULL versus empty string` — An empty string is a known text value of length zero, whereas NULL indicates no value. Keep them distinct unless the domain explicitly normalizes them.

- `NULL versus absent relationship` — A nullable FK can represent no associated parent, but only if the relationship is optional. Do not use unrelated sentinel parent rows or empty keys to disguise absence.

- `COALESCE null handling` — Returns the first non-NULL argument, with result type determined by data-type precedence. Replacing NULL with a default can collapse distinct states and may cause implicit conversion.

- `NULLIF null handling` — Returns NULL when its two expressions compare equal; otherwise returns the first expression. It is often used to turn a sentinel such as zero into NULL before division, but data type and divide-by-zero handling still matter.

- `Unique constraint and multiple NULL behavior boundary` — SQL Server treats NULL as a key value for UNIQUE enforcement: a single-column unique key permits at most one NULL. For composite keys, duplicate full key tuples that contain NULL are likewise disallowed; use a filtered unique index when the intended rule is uniqueness only for present values. [Unique indexes](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-unique-indexes?view=sql-server-ver17)

- `Deferred constraint checking (provider-specific distinction)` — SQL Server checks these constraints as part of each statement and does not expose deferrable FK/UNIQUE constraints that wait until COMMIT. Design multi-step writes accordingly; another engine’s deferral behavior cannot be assumed here.

- `ON DELETE SET DEFAULT` — On parent deletion, SQL Server assigns each child FK column its defined default (or NULL if nullable and no explicit default); the resulting value must still satisfy referential integrity, usually by referencing a valid default parent. [FK actions](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)

- `ON UPDATE NO ACTION` — Changing a referenced parent key fails while dependent FK rows remain; SQL Server checks immediately as part of the statement. This is the default action.

- `ON UPDATE CASCADE` — Changing a parent key propagates the new value to referencing FK rows, subject to SQL Server trigger and cascade-path restrictions. Prefer stable identifiers when key mutation is not a domain operation. [FK actions](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)

- `ON UPDATE SET NULL` — Changing a referenced key sets dependent FK columns to NULL. Every FK column must be nullable and the resulting unassociated row must be meaningful.

- `ON UPDATE SET DEFAULT` — Changing a referenced key sets dependent FK columns to their defaults; each default must satisfy the FK by resolving to a valid referenced row. [FK actions](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)

# Cross-item comparison

Use a natural key when its domain meaning is stable and uniqueness rules are clear; prefer a surrogate for stable internal references when business identifiers can change, but still protect alternate keys. A primary key is the selected row identity; a UNIQUE constraint protects additional candidate keys. A normalized schema stores facts according to dependencies; deliberate denormalization repeats facts for a measured need and creates synchronization work. A one-to-many foreign key belongs on the many side; a many-to-many relation requires an association table. These comparisons do not make one choice universal: lifecycle, invariants, access patterns, and migration cost decide.

# Examples

Consider a `Course`, a `Student`, and an `Enrollment`. A candidate key may be an institution-assigned `StudentNumber`, while a surrogate `StudentId` gives stable internal references if that number can be corrected. `Enrollment(StudentId, CourseId, AttemptNo, EnrolledAt, Grade)` models the association and its facts. If attempts are not distinct, remove `AttemptNo` and enforce pair uniqueness. Store course catalog name in Course, but store the name as it appeared on a signed historical transcript only if that is a separate historical fact with a defined source.

# Common mistakes

- Adding columns to a key without checking whether they are functionally necessary.
- Assuming a surrogate primary key makes a business identifier unique.
- Duplicating mutable facts without defining which copy is authoritative.
- Treating a many-to-many link as a comma-separated list.
- Cascading deletes through data that has independent retention or audit needs.
- Assuming physical row order or a generated identifier is chronological business time.

# Knowledge checks with answers

1. What is the difference between candidate key and superkey? **A candidate key is minimal; a superkey may contain redundant attributes.**
2. Where do relationship attributes for a many-to-many link belong? **On the junction/associative row that represents that link.**
3. What problem does 2NF address? **A non-key fact depending on only part of a composite candidate key.**
4. Why might a product price remain on an order line even when Product has a current price? **The line may record the historical transaction price, a distinct event fact.**
5. Does normalization guarantee the fastest query? **No. It primarily organizes dependencies and avoids anomalies; performance must be measured and any denormalization made explicit.**

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
