# constraints keys defaults identity sequences and computed columns — Big-picture orientation and mental model

# Problem and purpose

Schema rules decide which states are legal before application code can accidentally persist invalid data. Keys identify rows, constraints enforce relationships and domains, defaults fill omissions, identity/sequences allocate values, rowversion detects changes, and computed/temporal/ledger columns derive or record system-managed values.

# Plain-language mental model

Treat a table definition as a contract. A PRIMARY KEY says which row is this; a FOREIGN KEY says which parent relationship is valid; a CHECK says which row values are permitted; NOT NULL distinguishes “missing” from “present.” Defaults answer what to do when an insert omits a value. They do not clean up old data or override explicit NULL.

Generated numbers are identifiers or version tokens, not business chronology. Identity and sequence values can have gaps; uniqueness must be enforced separately. A computed column derives from current row values, temporal periods track system validity, and ledger columns record transaction/sequence metadata under engine control.

# How the parts fit together

1. Define stable candidate keys and enforce them with primary/unique constraints.
2. Use foreign keys for relationships and NOT NULL/CHECK for required domain rules.
3. Model optional uniqueness with a filtered unique index if multiple absent values are valid.
4. Add defaults only for omitted inputs; use explicit backfill for historical rows.
5. Choose IDENTITY, SEQUENCE, GUID, or application keys according to allocation, distribution, and ordering needs; put uniqueness in a key.
6. Use rowversion for optimistic concurrency, not timestamps.
7. Use computed columns for same-row derivations; evaluate deterministic/precise/persisted and index SET-option rules.
8. Use temporal/ledger generation only when their system-maintained history contracts fit the requirement.

# Concept map

| Requirement | Schema tool | Guarantee and limit |
| --- | --- | --- |
| One stable row identity | PRIMARY KEY | Unique, NOT NULL, one constraint per table |
| Alternate business uniqueness | UNIQUE / filtered unique index | Unique over all rows or a filtered subset |
| Valid parent relationship | FOREIGN KEY | Requires matching referenced key; NULL components change the relationship contract |
| Legal row domain | CHECK + NOT NULL | CHECK rejects FALSE, permits UNKNOWN; it is not cross-table validation |
| Omitted insert value | DEFAULT | Applied on omission/DEFAULT, not explicit NULL and not UPDATE |
| New numeric identifier | IDENTITY or SEQUENCE | Values may be skipped; uniqueness is separate |
| Detect stale write | rowversion | New binary token on insert/update; not a date/time |
| Derived same-row value | Computed column | Virtual by default; persistence/indexing has exact rules |
| System validity/audit metadata | Temporal or ledger columns | Engine generated; not application-authored business timestamps |

# End-to-end walkthrough

An account has a stable AccountId primary key, an optional ExternalCode that should be unique when present, and a required nonnegative Balance. Model these as PRIMARY KEY, filtered UNIQUE index, NOT NULL, and `CHECK (Balance >= 0)`; the check alone would permit NULL because UNKNOWN is accepted. Add `CreatedAt DEFAULT SYSUTCDATETIME()` for future omitted values, while separately backfilling existing rows if the migration requires it. Add rowversion if clients must detect stale updates. Do not use identity gaps or rowversion ordering to infer invoice sequence or wall-clock time.

# Version and platform boundaries

System-versioned temporal tables date to SQL Server 2016. SQL Server 2022 added ledger tables with engine-managed transaction and sequence generated columns; it also supports resumable addition of PRIMARY KEY and UNIQUE constraints. SQL Server 2025 documentation remains the source baseline for current syntax; platform variants can expose different enforcement behavior. See [temporal creation](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/create?view=sql-server-ver17), [ledger tables](https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-updatable-ledger-tables?view=sql-server-ver17), and [ALTER TABLE constraints](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17).

Legacy standalone `CREATE DEFAULT`/`CREATE RULE` objects and their binding procedures remain relevant when maintaining older schemas, but Microsoft marks these features for future removal and recommends column DEFAULT and CHECK constraints. SQL Server 2016 introduced `IF EXISTS` for `DROP DEFAULT`/`DROP RULE`; that convenience does not change the deprecation guidance. ([CREATE DEFAULT](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-default-transact-sql?view=sql-server-ver17), [CREATE RULE](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-rule-transact-sql?view=sql-server-ver17), [DROP DEFAULT](https://learn.microsoft.com/en-us/sql/t-sql/statements/drop-default-transact-sql?view=sql-server-ver17), [DROP RULE](https://learn.microsoft.com/en-us/sql/t-sql/statements/drop-rule-transact-sql?view=sql-server-ver17))

# When to use it and tradeoffs

Prefer declarative constraints for row/key/relationship invariants. Use triggers only when the rule is inherently procedural and transactionally safe. Use identity for simple table-local surrogate allocation; sequences when multiple consumers or preallocation/order-by-value are needed; GUIDs for distributed generation. Use persisted computed values only when storage/index access justifies their write cost.

# What later lessons cover

Index design, query patterns, temporal querying/history retention, Always Encrypted architecture, and transaction isolation receive dedicated topics. This unit covers their schema-level interactions only.

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
