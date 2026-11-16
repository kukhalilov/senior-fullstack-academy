# constraints keys defaults identity sequences and computed columns — Reference: Defaults, computed columns, and generated-value configuration

# Scope and version

This reference targets SQL Server 2025 (17.x) Database Engine semantics, with SQL Server 2022 ledger/constraint notes explicitly versioned. Azure SQL and Fabric can differ; do not assume that a similarly named object enforces the same rules.

# How this group fits the mental model

The exact inventory table explains each supplied name and its correctness boundary. Choose a declarative invariant, verify existing data/trust, and deploy under an explicit migration plan.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `DEFAULT expression` | The scalar expression supplies an omitted/DEFAULT column value at insert time. Built-ins such as SYSUTCDATETIME can be used, but a default does not continuously maintain a value after later updates. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17)) |
| `DEFAULT constraint binding` | A default constraint is attached to one column and is evaluated only when INSERT omits that column or specifies DEFAULT. Use an explicit, stable name so deployment scripts can find and replace it. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17)) |
| `DEFAULT versus explicit NULL` | Omitting a column or using DEFAULT invokes the default; explicitly supplying NULL bypasses it. NOT NULL then rejects that NULL rather than substituting the default. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17)) |
| `Computed column` | Defines a value from an expression over columns in the same row. It is virtual unless PERSISTED, cannot be assigned through ordinary INSERT/UPDATE, and is not a general materialized view. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Computed column expression` | Uses deterministic or nondeterministic scalar expressions over same-row columns, constants, and supported functions; subqueries and alias data types are not allowed. Type/precision of the expression determines downstream indexability. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `PERSISTED computed column` | Stores the computed result and updates it when dependencies change. The expression must be deterministic; PERSISTED can make deterministic but imprecise expressions indexable and is required for computed partition columns. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Deterministic computed expression` | Returns the same result for the same input values and database state under SQL Server’s determinism rules. Determinism is required for persistence and indexing decisions. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Precise computed expression` | Uses arithmetic that avoids approximate floating-point representation. Index keys require a deterministic precise expression, or a deterministic PERSISTED expression when permitted. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Computed-column index requirements` | Indexing requires a legal key type, deterministic expression, and either precision or deterministic PERSISTED storage for imprecise expressions. Required SET options must be correct for DDL and DML sessions. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/indexes-on-computed-columns?view=sql-server-ver17)) |
| `Virtual versus persisted computed value` | A virtual computed value is calculated when queried and is not stored in the base row; PERSISTED stores it and maintains it on dependency updates, trading storage/write cost for read/index options. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `GENERATED ALWAYS AS ROW START` | Marks the datetime2 start-of-validity column for a system-versioned temporal table. The Database Engine assigns period values; applications do not supply arbitrary values during ordinary DML. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/create?view=sql-server-ver17)) |
| `GENERATED ALWAYS AS ROW END` | Marks the datetime2 end-of-validity period column for a temporal table. Current rows use the maximum datetime2 end value; the engine adjusts it as versions move to history. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/create?view=sql-server-ver17)) |
| `PERIOD FOR SYSTEM_TIME` | Declares exactly one start/end period pair on a temporal table. The columns must be datetime2, with aligned precision and non-NULL semantics, and system versioning must be enabled to maintain history. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/create?view=sql-server-ver17)) |
| `Temporal period columns` | The two period columns define system validity time maintained by SQL Server, not user business-effective dates. They are used with SYSTEM_VERSIONING and an aligned history table. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/create?view=sql-server-ver17)) |
| `Hidden generated column` | HIDDEN omits a generated period or ledger column from implicit SELECT * and INSERT-without-column-list shape. It remains addressable by name and is still engine-managed. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `SPARSE column` | Optimizes storage for NULL-heavy columns by storing NULLs with little/no payload while adding overhead for non-NULL values. Measure actual data distribution and review type/feature restrictions. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/use-sparse-columns?view=sql-server-ver17)) |
| `ROWGUIDCOL property` | Labels one uniqueidentifier column as the table’s row GUID column for `$ROWGUID` references. It neither generates GUIDs nor creates uniqueness/default behavior; define NEWID/NEWSEQUENTIALID and a key separately. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Column encryption boundary` | Always Encrypted column definitions tie to column encryption keys and deterministic/randomized modes. Encryption mode changes allowed comparisons/indexes; schema constraints on encrypted columns have key/mode restrictions. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/encryption/always-encrypted-database-engine?view=sql-server-ver17)) |
| `Generated value retrieval with OUTPUT` | Use INSERT ... OUTPUT INSERTED.Key for each generated identity/computed/default value from the rows this statement inserted. Scope-based identity functions return only one identity and do not cover other generated columns. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)) |
| `Metadata default value` | Inspect `sys.default_constraints` joined to `sys.columns` using parent_object_id and parent_column_id. Its definition and is_system_named flag help migrations discover unnamed defaults safely. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-default-constraints-transact-sql?view=sql-server-ver17)) |
| `Migration backfill versus default constraint` | A DEFAULT handles future omitted inserts; it does not generally update old rows when added to an existing column. Backfill explicitly or use WITH VALUES where supported, and plan locks/log volume. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-transact-sql?view=sql-server-ver17)) |
| `One DEFAULT constraint per column` | A column can have only one default definition. Replacing it requires identifying and dropping the existing constraint before adding the new one. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17)) |
| `DEFAULT expression allowed forms` | A default may be a constant or supported scalar/system function expression, such as SYSUTCDATETIME() or NEXT VALUE FOR. It is not a subquery or arbitrary cross-table lookup. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17)) |
| `DEFAULT expression cannot reference another column` | A default definition cannot derive its value from another column in the same row. Use a computed column for a derived value or explicitly supply related values in DML. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17)) |
| `Adding a default to a populated table` | Adding only a default constraint affects later inserts, not existing rows. Adding a new NOT NULL column to a populated table requires a default or an empty table; operational cost depends on edition/operation and row count. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-transact-sql?view=sql-server-ver17)) |
| `WITH VALUES backfills existing rows` | When adding a nullable column with a default, `WITH VALUES` stores the default for existing rows; without it, existing rows remain NULL. Assess whether the operation rewrites rows, holds locks, or generates substantial log. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-transact-sql?view=sql-server-ver17)) |
| `Computed column cannot have DEFAULT or FOREIGN KEY` | A computed column cannot define DEFAULT or participate as a foreign key definition. Its value derives from its expression; it may qualify for an index/unique/primary key only under computed-index rules. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Computed column NOT NULL requires PERSISTED` | SQL Server permits NOT NULL on a computed column only when it is PERSISTED and the expression meets applicable rules. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Computed column primary or unique key eligibility` | A computed column can be a PRIMARY KEY or UNIQUE key only if its expression and result type satisfy indexing rules, including determinism and precision/persistence requirements. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Computed column filtered index restriction` | SQL Server does not allow a computed column as a filtered-index predicate column; evaluate supported index design or materialize a different schema representation. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/indexes-on-computed-columns?view=sql-server-ver17)) |
| `Computed-index required SET options` | The connection SET options must satisfy SQL Server’s documented requirements, including ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON and NUMERIC_ROUNDABORT OFF, for indexed computed columns. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/indexes-on-computed-columns?view=sql-server-ver17)) |
| `COLUMN_SET FOR ALL_SPARSE_COLUMNS` | A column set is one optional, updatable XML representation of all sparse columns; only one is allowed per table. It changes SELECT * shape and cannot have constraints, defaults, or indexes. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/use-column-sets?view=sql-server-ver17)) |
| `SPARSE storage and type restrictions` | Sparse columns trade extra non-NULL storage and retrieval overhead for savings when NULLs dominate; Microsoft suggests considering them when storage savings are material. Several types/features are unsupported, including rowversion/timestamp and column sets in replication. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/use-sparse-columns?view=sql-server-ver17)) |
| `ROWGUIDCOL does not generate or enforce uniqueness` | ROWGUIDCOL is metadata designation only. A UNIQUEIDENTIFIER column needs a DEFAULT or application-supplied value and a UNIQUE/PRIMARY KEY constraint if those properties are required. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Temporal period requires exactly one ROW START and ROW END` | A system-versioned temporal table needs exactly one PERIOD FOR SYSTEM_TIME with one GENERATED ALWAYS ROW START and one ROW END datetime2 column, plus a primary key. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/create?view=sql-server-ver17)) |
| `Temporal period datetime2 precision alignment` | The temporal period endpoints must use datetime2 with matching precision; SQL Server assumes non-NULL period values and rejects explicitly nullable period columns. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/create?view=sql-server-ver17)) |
| `Ledger generated TRANSACTION_ID START and END` | Updatable ledger tables add engine-managed BIGINT columns marking the transaction that started and ended a row version. END can be NULL for an active version; ledger uses the metadata to verify history. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-updatable-ledger-tables?view=sql-server-ver17)) |
| `Ledger generated SEQUENCE_NUMBER START and END` | Ledger-generated BIGINT columns order row versions within the transaction; START/END values are assigned by SQL Server and cannot be treated as application sequence numbers. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-updatable-ledger-tables?view=sql-server-ver17)) |
| `Ledger-generated columns hidden and engine-managed` | Ledger system columns may be HIDDEN so implicit projections remain compatible. They are still metadata-bearing engine-generated values and must not be inserted or maintained by the application. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-updatable-ledger-tables?view=sql-server-ver17)) |
| `Ledger generated columns SQL Server 2022 availability` | Ledger tables and their transaction/sequence generated metadata are a SQL Server 2022 (16.x) feature. Confirm ledger support and configuration on the target platform before using this schema. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-updatable-ledger-tables?view=sql-server-ver17)) |
| `Always Encrypted deterministic versus randomized constraint support` | Randomized encryption provides stronger ciphertext variation but blocks equality/index/constraint uses; deterministic encryption supports equality-related operations and selected keys but leaks equality patterns. Secure enclaves alter some capabilities; check exact engine/client support. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/encryption/always-encrypted-database-engine?view=sql-server-ver17)) |
| `Generated value OUTPUT retrieval boundary` | OUTPUT INSERTED can return identity, default, computed, and rowversion values for each changed row. It is a statement row image; transaction errors/rollback and trigger timing determine whether it represents durable final state. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)) |
| `sys.default_constraints metadata` | This catalog view has one row for each table default created inline or by ALTER TABLE; definition, parent_column_id, and is_system_named support discovery. Metadata visibility follows permissions. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-default-constraints-transact-sql?view=sql-server-ver17)) |
| `Default migration rollout and backfill cost` | Separate schema default deployment from historical backfill when large tables need controlled batches. A default alone is not data cleanup; choose locking, rollback, validation, and application dual-read/write order deliberately. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-transact-sql?view=sql-server-ver17)) |

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
