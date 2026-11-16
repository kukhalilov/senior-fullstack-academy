# constraints keys defaults identity sequences and computed columns — Exercises and worked solutions

# Goals

Design constraints and generated values that preserve invariants through NULLs, concurrency, migrations, retries, and changing schema.

# Exercises

1. A CHECK allows NULL in a required positive quantity. Repair the definition.
2. An optional email must be unique when present but any number of accounts can omit it. Define the key enforcement.
3. A new FK is enabled with NOCHECK after legacy data has violations. Make it trusted safely.
4. A child table references a parent through a composite FK. Explain why NULL components and parent deletion behavior must be designed.
5. A nullable FK should be detached when parent is deleted. Define action and preconditions.
6. An insert trigger writes another identity value. Choose the right identity retrieval function and explain the alternatives.
7. A failed transaction consumed identity and sequence values. Explain why and what guarantee each allocator gives.
8. Reserve 500 sequence values for a batch, with generated order matching an input sort. Name the APIs and limitations.
9. A sequence cycles and begins duplicating a table key. Repair the policy and state the invariant.
10. A client must reject updates made since it read a profile. Use rowversion and explain affected count.
11. Add a non-null CreatedAt to a large populated table with a default, while controlling deployment risk. Distinguish future default from backfill.
12. A computed price expression must be indexed. State determinism, precision/persistence, result-type, and SET-option requirements.
13. A temporal table’s period columns use mismatched datetime2 precision. Repair the schema requirements.
14. Name the SQL Server 2022 ledger generated column families and state who writes them.
15. A schema uses SPARSE and COLUMN_SET to store optional properties. Explain storage tradeoff and SELECT * compatibility risk.

# Complete solutions

1. Declare `Quantity int NOT NULL CHECK (Quantity > 0)`; the NOT NULL handles UNKNOWN from NULL.
2. `CREATE UNIQUE INDEX UX_Account_Email ON dbo.Account(Email) WHERE Email IS NOT NULL;` A single-column UNIQUE constraint would allow only one NULL.
3. Repair invalid rows, then run `ALTER TABLE dbo.Child WITH CHECK CHECK CONSTRAINT FK_Child_Parent;`. Verify is_disabled=0 and is_not_trusted=0 in sys.foreign_keys.
4. All non-NULL tuples must match a referenced candidate key. Decide whether any NULL component means “no relationship” or is forbidden; use NOT NULL if partial-null relationships are invalid. Define NO ACTION/CASCADE/SET NULL/SET DEFAULT explicitly.
5. Use `ON DELETE SET NULL` only if every FK component is nullable. Otherwise choose NO ACTION, CASCADE, or a valid SET DEFAULT policy that resolves to a real parent.
6. Use `SCOPE_IDENTITY()` in the same scope; `@@IDENTITY` may return the trigger’s insert and IDENT_CURRENT can be affected by another session. OUTPUT is preferable when multiple rows/columns are needed.
7. Allocators are not transactional: failed/rolled-back work and failures can leave gaps. Identity is table-bound; sequence is a shared object. Neither means gap-free numbering; use unique constraints for uniqueness.
8. Call `sys.sp_sequence_get_range` to reserve a batch; for ordered assignment in a SELECT/INSERT...SELECT use `NEXT VALUE FOR seq OVER (ORDER BY ...)`. The OVER form has no PARTITION BY and cannot be used in UPDATE/MERGE; unused values stay consumed.
9. Change to NO CYCLE or use a new nonoverlapping range, reconcile existing keys, and retain a UNIQUE/PRIMARY KEY. Cycling explicitly reuses values.
10. `UPDATE dbo.Profile SET DisplayName=@name WHERE ProfileId=@id AND RowVersion=@original;` Capture @@ROWCOUNT immediately; exactly one means matched version, zero indicates missing/stale. rowversion is binary, not time.
11. Add the nullable column/default first, backfill in controlled batches, validate, then make NOT NULL if required. WITH VALUES can populate existing rows when adding a nullable column with a default, but may write/lock/log the table; adding a default constraint alone affects future omitted values.
12. The expression must be deterministic and have an indexable result type. It must be precise or deterministic and PERSISTED if imprecise; required SET options apply to creation and DML sessions. Computed columns cannot be filtered-index predicate columns.
13. Use exactly one ROW START and ROW END datetime2 pair with matching precision, NOT NULL semantics, one PERIOD FOR SYSTEM_TIME, and a table primary key before enabling SYSTEM_VERSIONING.
14. SQL Server 2022 adds GENERATED ALWAYS AS TRANSACTION_ID START/END and SEQUENCE_NUMBER START/END. SQL Server assigns these metadata values; applications must not supply them.
15. SPARSE saves space for NULL-heavy columns but costs more for non-NULL retrieval/storage and has type/feature restrictions. A column set is one updatable XML view of sparse values and changes SELECT * shape; client projections should be explicit.

# Worked example

```sql
CREATE TABLE dbo.Customer
(
  CustomerId bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_Customer PRIMARY KEY,
  Email nvarchar(320) NULL,
  Quantity int NOT NULL CONSTRAINT CK_Customer_Quantity CHECK (Quantity > 0),
  CreatedAt datetime2(7) NOT NULL CONSTRAINT DF_Customer_CreatedAt DEFAULT SYSUTCDATETIME(),
  Version rowversion NOT NULL
);
CREATE UNIQUE INDEX UX_Customer_Email
  ON dbo.Customer(Email) WHERE Email IS NOT NULL;
```

This separates requiredness, domain, optional uniqueness, generated value, and concurrency token instead of forcing one feature to imply another.

# Tests and edge cases

- Insert two rows with NULL email; both should succeed. Insert the same non-NULL email twice; the second insert should fail.
- Attempt `INSERT` with `Quantity = NULL`; NOT NULL rejects it even though the CHECK result would be UNKNOWN.
- Roll back an insert that requests an identity or sequence value; verify later values can contain a gap.
- Update a rowversion row without changing business values; the token still changes, so optimistic concurrency detects the write.
- Add a default to a populated table without a backfill; verify historical rows remain unchanged unless the chosen ALTER TABLE operation explicitly uses WITH VALUES.
- After enabling a constraint with validation, inspect `sys.foreign_keys` or `sys.check_constraints` for enabled and trusted state.

The assigned SQL Server references are [CHECK and UNIQUE semantics](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17), [ALTER TABLE validation](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-transact-sql?view=sql-server-ver17), [sequence allocation](https://learn.microsoft.com/en-us/sql/t-sql/functions/next-value-for-transact-sql?view=sql-server-ver17), [rowversion](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17), and [default values](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17).

# Progressive hints

1. Ask which rows the rule applies to and whether NULL is a valid state.
2. Ask whether values are allocated, unique, ordered, or gap-free; these are different properties.
3. Check the migration’s existing-row behavior and constraint trust.
4. For computed values, classify determinism, precision, persistence, result type, and SET options.
5. Identify which generated fields are writable by the engine only.

# Reflection questions

Which invariants should survive application bugs and concurrent sessions? Which generated values may have gaps? Which default changes future inserts, and which migration step updates old rows? What metadata would prove a constraint is both enabled and trusted?

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
