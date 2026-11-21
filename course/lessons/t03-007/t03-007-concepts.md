# constraints keys defaults identity sequences and computed columns — Core concepts and how they fit together

# Learning objectives

Choose constraints that enforce the actual business invariant; distinguish defaults from nullability and backfills; select IDENTITY/SEQUENCE/GUID generation correctly; explain sequence/identity gaps; use rowversion for compare-and-swap; evaluate computed-column persistence and indexability; and recognize temporal/ledger engine-managed columns.

# Prerequisites

Know tables, columns, data types, INSERT/UPDATE/DELETE, transactions, and basic indexes. The DML topic explains OUTPUT and affected-row handling; index design and temporal querying are covered elsewhere.

# Core concepts

PRIMARY KEY and UNIQUE enforce tuple uniqueness through indexes. CHECK rejects only FALSE, so NULL often passes; NOT NULL is an independent rule. FOREIGN KEY checks relationships, but child-side indexing and optional-reference semantics are design choices. Constraint trust matters: an untrusted constraint may be enabled for future writes but cannot support the optimizer’s full reasoning about existing rows.

Defaults apply on omission or DEFAULT; an explicit NULL is a value supplied by the caller. A default constraint does not populate old rows when it is added to an existing column unless the migration operation requests backfill, such as WITH VALUES for a nullable added column. Large schema backfills have lock/logging consequences ([ALTER TABLE default behavior](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-transact-sql?view=sql-server-ver17)).

# Mechanisms and relationships

IDENTITY is table-column-local and generated during insert. SEQUENCE is an independent object that can be shared, requested before insertion, and configured with bounds/cache/cycle. Neither allocator rolls back consumed values with a failed transaction; neither promises gap-free numbering. Add a unique key for collisions. `SCOPE_IDENTITY()` is scope-aware; `@@IDENTITY` crosses triggers; IDENT_CURRENT is table-specific but session-agnostic and unsafe for predicting the next value ([identity functions](https://learn.microsoft.com/en-us/sql/t-sql/functions/scope-identity-transact-sql?view=sql-server-ver17)).

NEXT VALUE FOR assigns sequence values per row in defined statement contexts. OVER(ORDER BY) can impose assignment order in SELECT/INSERT...SELECT but not UPDATE/MERGE; it does not create commit order. CYCLE can reuse numbers; CACHE can lose unused values after failure; NO CACHE still cannot avoid unused reservations or rollback gaps ([NEXT VALUE FOR](https://learn.microsoft.com/en-us/sql/t-sql/functions/next-value-for-transact-sql?view=sql-server-ver17)).

rowversion is an 8-byte database-wide counter value. Every update to a row containing it changes the token, even if a column is assigned its old value. A predicate using the prior token detects stale state; it does not supply a timestamp, order all transactions by commit, or remain stable enough for a primary key ([rowversion](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17)).

For operations and diagnosis, `DBCC CHECKIDENT` checks or reseeds an identity; `sys.identity_columns` and `sys.sequences` expose generator metadata; `@@DBTS` reports the database rowversion counter. These are observational/repair tools, not substitutes for constraints. `SELECT INTO` can duplicate copied rowversion values, so rowversion is not a durable unique key. For computed expressions, `sys.computed_columns` and `COLUMNPROPERTY` expose definition, persistence, determinism, precision, and indexability metadata; still check the full documented type and SET-option requirements.

Older databases may contain standalone bound defaults and rules created with `CREATE DEFAULT`/`CREATE RULE` and attached by `sp_bindefault`/`sp_bindrule`. Microsoft marks these legacy families for future removal; prefer column DEFAULT constraints and CHECK constraints in new schemas. During cleanup, inspect bindings and existing data before unbinding/dropping objects so enforcement is not silently lost.

# Worked examples

```sql
CREATE TABLE dbo.UserAccount
(
    UserId bigint IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_UserAccount PRIMARY KEY,
    Email nvarchar(320) NULL,
    Balance decimal(19,4) NOT NULL
        CONSTRAINT DF_UserAccount_Balance DEFAULT (0),
    Version rowversion NOT NULL,
    CONSTRAINT CK_UserAccount_Balance CHECK (Balance >= 0)
);
CREATE UNIQUE INDEX UX_UserAccount_Email
    ON dbo.UserAccount(Email)
    WHERE Email IS NOT NULL;
```

The filtered index permits many NULL emails but prevents duplicate supplied emails. Balance is NOT NULL because CHECK alone accepts UNKNOWN/NULL. Identity supplies values, while the PK enforces uniqueness. For a stale-safe update, use `WHERE UserId=@id AND Version=@version` and require one affected row.

# Misconceptions and edge cases

- CHECK alone does not reject NULL.
- DEFAULT does not replace explicit NULL or update a value later.
- Identity/sequence are not gap-free business numbers.
- SCOPE_IDENTITY and @@IDENTITY differ when triggers insert identities.
- A rowversion is not time and changes on no-op UPDATE statements.
- A computed expression is not automatically indexable; deterministic/precision, SET options, and persistence matter.
- `DBCC CHECKIDENT` can create collisions if reseeded without reconciling stored keys.
- `SELECT INTO` can create duplicate copied rowversion values.
- Legacy bound defaults/rules are not modern equivalents of column DEFAULT/CHECK constraints; migrate bindings deliberately.
- NOT ENFORCED constraints in Fabric are not equivalent to SQL Server enforced constraints; this course targets the SQL Server Database Engine.

# Knowledge checks with answers

1. **Why add NOT NULL beside CHECK (X > 0)?** Because NULL makes the CHECK UNKNOWN and is accepted.
2. **Why can a UNIQUE constraint reject the second NULL?** SQL Server treats NULL as a value for single-column uniqueness.
3. **When is a filtered unique index better?** When values must be unique only when populated and many rows may be absent.
4. **Does a rolled-back NEXT VALUE FOR call restore its number?** No.
5. **Which identity function stays in the caller’s scope?** SCOPE_IDENTITY.
6. **What does rowversion tell you?** Whether a row changed since a token was read, not when it changed.
7. **When can an imprecise computed expression be indexed?** When it is deterministic and PERSISTED, subject to type and SET rules.
8. **What should replace a legacy bound rule?** A column CHECK constraint, after confirming the rule’s bindings and validating existing rows.
9. **Which tools inspect identity and sequence metadata?** `sys.identity_columns` and `sys.sequences`; `DBCC CHECKIDENT` checks or changes the current identity value.

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
- https://learn.microsoft.com/en-us/sql/t-sql/database-console-commands/dbcc-checkident-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-identity-columns-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-sequences-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-computed-columns-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/functions/columnproperty-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/functions/dbts-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/create-default-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/create-rule-transact-sql?view=sql-server-ver17
