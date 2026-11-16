# constraints keys defaults identity sequences and computed columns — Reference: Primary, unique, foreign-key, check, and default constraints

# Scope and version

This reference targets SQL Server 2025 (17.x) Database Engine semantics, with SQL Server 2022 ledger/constraint notes explicitly versioned. Azure SQL and Fabric can differ; do not assume that a similarly named object enforces the same rules.

# How this group fits the mental model

The exact inventory table explains each supplied name and its correctness boundary. Choose a declarative invariant, verify existing data/trust, and deploy under an explicit migration plan.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `PRIMARY KEY` | Enforces a non-NULL unique row identifier and creates a unique index. A table can have only one PRIMARY KEY constraint, though that key may contain multiple columns; choose a stable candidate key and do not confuse physical clustering with logical identity. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17)) |
| `UNIQUE constraint` | Enforces uniqueness on a non-primary candidate key and creates a unique index. SQL Server permits NULL in a UNIQUE key; for a single-column UNIQUE constraint only one NULL value is allowed. Use a filtered unique index when the requirement is “unique only when present.” ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `FOREIGN KEY` | Requires each non-NULL referencing key tuple to match an eligible primary or unique key in the referenced table. It does not automatically create an index on the referencing columns; index them when workload and parent-delete checks justify it. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)) |
| `CHECK constraint` | Rejects a row only when its Boolean expression is FALSE. UNKNOWN, including many expressions involving NULL, is accepted; pair CHECK with NOT NULL when NULL itself is forbidden. A CHECK is row-scoped and cannot enforce an aggregate or cross-table invariant. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `DEFAULT constraint` | Supplies a value when INSERT omits the column or uses DEFAULT. It does not replace NOT NULL and does not override an explicitly supplied NULL; defaults do not automatically recalculate on UPDATE. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17)) |
| `NOT NULL` | Disallows NULL for a column. It is separate from CHECK and DEFAULT: a default may supply an omitted value, but callers can still supply NULL unless the column is NOT NULL. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17)) |
| `Composite primary key` | Defines identity as a tuple of columns. Each component is NOT NULL and only the full combination must be unique; individual component values may repeat. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Composite UNIQUE constraint` | Enforces uniqueness of the complete ordered key tuple, not each member separately. Decide whether each nullable component is allowed and test the exact NULL combinations the business rule permits. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `Filtered unique index` | Enforces uniqueness only among rows satisfying its WHERE filter, commonly `WHERE Email IS NOT NULL` to allow many absent optional values. It is an index, not a table constraint, and filtered indexes have their own eligibility restrictions. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `Constraint name` | A stable explicit name makes migrations, error diagnosis, and later ALTER TABLE operations predictable. Auto-generated names are harder to address safely across environments. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17)) |
| `WITH CHECK` | Validates existing rows when adding or re-enabling a FOREIGN KEY or CHECK constraint. A successfully validated constraint is trusted by the optimizer for applicable reasoning. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `WITH NOCHECK` | Skips validation of existing rows when adding or re-enabling a FOREIGN KEY or CHECK. Future changes are checked, but pre-existing violating rows can remain and the constraint is untrusted. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `Trusted constraint` | An enabled constraint that SQL Server knows was validated against all relevant existing rows. Trusted metadata lets the optimizer use its guarantee; check `sys.foreign_keys.is_not_trusted` or `sys.check_constraints.is_not_trusted` during migration review. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17)) |
| `Untrusted constraint` | An enabled constraint that enforces future writes but has not validated all existing data. It cannot support the same optimizer assumptions; repair rows and re-enable with `WITH CHECK CHECK`. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17)) |
| `ON DELETE NO ACTION` | The default referential action: if children reference the parent, deleting that parent fails and the statement is rolled back. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)) |
| `ON DELETE CASCADE` | Deleting a referenced parent automatically deletes matching child rows. Use only when child lifecycle truly depends on the parent; cascade paths and trigger interactions can restrict the design. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)) |
| `ON DELETE SET NULL` | Deleting the parent sets every foreign-key column in the child tuple to NULL. All affected child key columns must permit NULL. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)) |
| `ON UPDATE referential action` | Defines what happens when a referenced candidate key changes: NO ACTION, CASCADE, SET NULL, or SET DEFAULT. Stable surrogate keys usually avoid routine parent-key updates. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)) |
| `Self-referencing foreign key` | References a key in the same table, commonly for parent-child hierarchies. NULL may represent a root; deletion/update actions and cycle prevention remain separate design decisions. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)) |
| `Disabled constraint` | A disabled constraint does not protect data while disabled. Re-enabling without validation can leave it enabled but untrusted; plan cleanup and validation explicitly. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Enable constraint with validation` | Use `ALTER TABLE dbo.T WITH CHECK CHECK CONSTRAINT CK_or_FK` to enable and validate existing rows. The repeated CHECK is intentional: the first controls validation, the second enables the constraint. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Constraint violation error` | An insert/update that violates an enabled enforced constraint fails and rolls back the violating statement. Catch expected uniqueness/FK races at the application boundary rather than relying on pre-check queries. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17)) |
| `Unique index backing a constraint` | SQL Server creates an index to enforce PRIMARY KEY or UNIQUE constraints. A separate unique index can express additional rules such as filtered uniqueness, but it is not automatically equivalent to a named constraint. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Constraint versus trigger` | Constraints express declarative row/key/referential invariants that SQL Server can enforce consistently and reason about. Triggers run procedural code and may model more complex effects, but are harder to reason about and do not replace basic keys or NOT NULL rules. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17)) |
| `DEFAULT constraint expression` | A default is a scalar constant/expression such as a literal or supported built-in function; it is evaluated when a value is omitted or DEFAULT is requested. It is not an update-on-change rule. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17)) |
| `DEFAULT keyword in INSERT` | The DEFAULT token requests the column default for that row; if no default exists, nullable columns receive NULL while NOT NULL columns reject the insert. DEFAULT cannot be used for an IDENTITY column. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17)) |
| `CHECK UNKNOWN permits NULL` | SQL CHECK rejects FALSE, not UNKNOWN. For example `CHECK (Quantity > 0)` accepts NULL; add `NOT NULL` if missing quantity is invalid. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `CHECK constraint is row-level` | A CHECK expression is evaluated for each row being inserted or updated. It cannot enforce “at least one row,” compare against another table, or safely count siblings. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `CHECK cannot enforce cross-table invariants` | A CHECK constraint cannot query other tables; model cross-row/cross-table integrity with keys, unique indexes, foreign keys, or carefully designed transaction logic/triggers where no declarative invariant fits. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `UNIQUE nullable value behavior` | A single-column UNIQUE constraint allows one NULL because SQL Server treats it as a key value for uniqueness. If an optional value may be NULL for many rows, use a filtered unique index over non-NULL values. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `Filtered unique index WHERE IS NOT NULL` | For optional email, `CREATE UNIQUE INDEX UX_User_Email ON dbo.UserAccount(Email) WHERE Email IS NOT NULL;` enforces uniqueness for supplied addresses while permitting many NULLs. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `Filtered unique index is not a constraint` | A filtered unique index enforces a filtered rule but does not become a PRIMARY KEY or UNIQUE constraint and is not a general referenced key for foreign keys. Document and manage it as an index. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `Foreign key references unique key` | A referenced key must be uniquely identified by a supported primary/unique key/index and match the referencing column count and compatible types. A foreign key points to the parent candidate key, not to arbitrary nonunique columns. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Foreign key does not auto-create an index` | Creating an FK does not create an index on the child columns. Parent deletes/updates and joins may scan children, so add a suitable child index based on access paths and cascade cost. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `NULL foreign-key component` | For a single-column FK, NULL does not require a parent match. For composite keys, SQL Server’s MATCH SIMPLE behavior means a NULL component can exempt the composite tuple from requiring a full parent match; do not use partial NULLs to represent a valid relationship. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `ON DELETE SET DEFAULT` | Deleting the parent assigns the declared default to each child FK column; if no explicit default exists on a nullable column, NULL is its implicit default. The resulting tuple must still satisfy an FK reference, often to a designated “unknown” parent row. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)) |
| `ON UPDATE CASCADE` | Changing the referenced parent key propagates the new value to matching child FK columns. It is unavailable in some trigger/timestamp configurations and can create long cascading work. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)) |
| `ON UPDATE SET NULL` | Changing a parent key sets child FK columns to NULL. Those columns must be nullable, and the application must interpret the now-detached relationship correctly. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)) |
| `ON UPDATE SET DEFAULT` | Changing a parent key sets child FK columns to their defaults. Defaults must exist or be nullable, and the resulting tuple must reference an existing parent. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)) |
| `ON UPDATE NO ACTION` | The default update action rejects changing a referenced parent key while child rows depend on its old value. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)) |
| `Cascade cycle and multiple-path restriction` | SQL Server prevents cascading referential actions that create cycles or multiple cascade paths. Model the lifecycle explicitly or perform ordered transactional DML when cascades cannot be represented safely. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `NOT FOR REPLICATION constraint` | Suppresses enforcement for changes applied by replication agents while ordinary user changes remain subject to the constraint. It is a replication-specific trust decision, not a general way to bypass invalid data. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Validate existing rows when adding constraint` | Adding a new FOREIGN KEY or CHECK normally scans existing data and fails if violations exist. Use a deliberate cleanup/migration before deployment instead of silently opting out of validation. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `WITH CHECK CHECK enable and trust` | The two CHECK keywords mean “validate existing rows” and “enable constraint.” It is the migration pattern that restores both enforcement and trusted metadata after repair. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)) |
| `One primary key per table` | SQL Server permits one PRIMARY KEY constraint per table. If several candidate keys exist, designate one as primary and use UNIQUE constraints for the others. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Primary-key columns are NOT NULL` | Every PRIMARY KEY column is NOT NULL. If nullability is omitted in the declaration, SQL Server sets the participating columns to NOT NULL. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17)) |

# Cross-item comparison

PRIMARY KEY and UNIQUE both create unique enforcement, but only one primary key exists and its columns are NOT NULL. A UNIQUE constraint allows NULL but limits duplicates; filtered unique indexes express conditional uniqueness. CHECK handles row predicates, while FOREIGN KEY handles parent membership. DEFAULT handles omitted input and is independent of both.

# Examples

For an optional unique code, use a filtered unique index where the value is not NULL. For a parent relationship, define a foreign key to a unique key and consider an index on child columns. To restore trust after cleanup, use `ALTER TABLE dbo.Child WITH CHECK CHECK CONSTRAINT FK_Child_Parent` and verify catalog metadata.

# Common mistakes

- Treating CHECK as a NOT NULL rule.
- Assuming FK creates its child index.
- Re-enabling with NOCHECK and assuming old rows were validated.
- Using a trigger instead of a basic declarative key.
- Choosing SET NULL/SET DEFAULT without checking child nullability/defaults.
- Forgetting cascade-cycle/multiple-path limits.

# Knowledge checks with answers

1. **Does CHECK validate cross-table membership?** No; use FK or other transactional design.
2. **Does WITH NOCHECK validate historic rows?** No; it creates/re-enables an untrusted constraint.
3. **What does SET DEFAULT require?** A valid default and a resulting value that still references a parent.
4. **Does a foreign key create an index automatically?** No.
5. **What is the purpose of a filtered unique index?** Unique values only for rows in its filter.

# Sources

- https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/functions/ident-current-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/functions/scope-identity-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/functions/identity-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-sequence-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/functions/next-value-for-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-sequence-get-range-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/functions/newid-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/functions/newsequentialid-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/indexes/indexes-on-computed-columns?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal-tables?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/create?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-updatable-ledger-tables?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/tables/use-sparse-columns?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/tables/use-column-sets?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/security/encryption/always-encrypted-database-engine?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-default-constraints-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17
