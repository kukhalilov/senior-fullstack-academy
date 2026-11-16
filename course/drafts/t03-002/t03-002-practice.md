# relational modeling constraints data types null and normalization — Exercises and worked solutions

# Goals

- Translate business statements into keys, relationships, types, nullability, and constraints.
- Diagnose normalization anomalies and choose a decomposition based on dependencies.
- Plan a migration that safely overlaps old and new application versions.

# Worked example

A library has branches, books, copies, members, and loans. A book title is a catalog fact; a physical copy belongs to one branch; a loan connects one member and one copy over time. Model `Book`, `Copy`, `Branch`, `Member`, and `Loan`. A copy has a stable key and required FK to Book and Branch. Loan references Copy and Member; it records checkout time and nullable return time, where NULL means the copy is currently on loan. Add a CHECK ensuring return time is not before checkout, but also define how to prevent two simultaneous open loans for one copy (for example, a filtered unique index on CopyId where ReturnedAt IS NULL). A nullable unique column by itself would permit only one NULL under SQL Server’s regular uniqueness semantics, so the filtered index is intentional.

# Exercises

1. A user has optional phone number; multiple users may have no phone, but a present phone must be unique. Choose columns and constraint.
2. An order line stores OrderId, LineNo, ProductId, ProductName, Quantity, and SalePrice. Explain the dependency/anomaly and what should move.
3. A tenant-scoped app requires unique usernames within a tenant and forbids references across tenants. Propose candidate/foreign keys.
4. A required status is being added while old and new app instances run together. Give safe deployment stages.
5. A sensor reports approximate measurements, and an invoice reports exact currency amounts. Choose numeric type families and explain scale/range.
6. A scheduler must preserve the original civil time zone for future DST-aware recurrence. Is datetimeoffset alone enough? What additional domain fact is needed?
7. A nullable age column has CHECK (Age >= 18). Can NULL be stored? Correct the schema if age is required.
8. An FK was added WITH NOCHECK. What can the team claim about old rows and how does it restore trust?

# Progressive hints

1. Distinguish missing phone from a supplied phone; think filtered unique index.
2. Ask what ProductId determines, and whether SalePrice means current catalog price or historical transaction price.
3. Tenant must participate in both uniqueness and the child-parent relationship tuple.
4. Add, dual-read/write as necessary, backfill, switch, validate, then contract.
5. Approximate binary values versus exact decimal capacity.
6. An offset is not a time-zone identifier with rule history.
7. UNKNOWN passes a CHECK; requiredness needs NOT NULL.
8. Enabled future enforcement does not prove existing rows were validated.

# Complete solutions

1. Define nullable `Phone` with a filtered unique index: `CREATE UNIQUE INDEX UX_User_Phone ON dbo.[User](Phone) WHERE Phone IS NOT NULL;`. Normalize/canonicalize phone representation first if formatting variants should be the same logical number. This lets many rows omit a phone while enforcing uniqueness among present values.
2. If ProductId determines ProductName, putting the name on every order line duplicates catalog data and causes update anomalies. Move current catalog name to Product. Keep SalePrice on the line if it means the amount agreed for that transaction; it does not functionally depend on current Product state. Preserve a historical description separately only if the domain requires a frozen snapshot.
3. `Tenant(TenantId)` primary key; `User(TenantId, UserId)` primary or unique key; `UNIQUE(TenantId, UsernameKey)`; and child rows carry TenantId plus UserId with a composite FK to User. Make the FK columns NOT NULL when association is required. This prevents an otherwise valid UserId from another tenant being paired with the child’s TenantId.
4. Add nullable `Status` or a compatible defaulted representation; deploy code that understands old and new states; backfill actual values in bounded batches; validate values; add/validate NOT NULL and CHECK constraints; switch all writers/readers; monitor; then remove temporary compatibility behavior after all old versions are retired. Do not invent an old status that changes historical meaning.
5. Use `float`/`real` only for the sensor if approximation and a tolerance are acceptable. Use `decimal(p,s)` for currency with explicit precision and scale sized to business maximums and fractions; decide rounding policy and currency separately. Test arithmetic result scale and overflow.
6. No. `datetimeoffset` retains a numeric offset, not an IANA/Windows named time zone or its historical and future daylight-saving rules. Store a canonical zone identifier separately and define ambiguous/nonexistent local-time handling.
7. Yes, because `Age >= 18` evaluates UNKNOWN for NULL and CHECK rejects FALSE only. If required, declare `Age int NOT NULL CHECK (Age >= 18)`; add appropriate range/business checks as needed.
8. The team cannot claim preexisting rows satisfied the FK. It must identify/remediate orphans, then re-enable with validation such as `ALTER TABLE ... WITH CHECK CHECK CONSTRAINT ...`; verify `is_not_trusted` is false in metadata. The exact command is for the named constraint/table and should be deployed after data cleanup.

# Tests and edge cases

Test duplicate and NULL values under single/composite UNIQUE constraints; tenant crossing; delete/update actions; CHECK with TRUE/FALSE/UNKNOWN; decimal boundary and arithmetic overflow; strings at byte boundaries under UTF-8; supplementary Unicode; mixed collations; offset-equivalent instants; daylight-saving overlaps/gaps; rowversion change on update; backfill restartability; and writes from old/new application versions during migration.

# Reflection questions

- What real-world fact does each row represent?
- Which minimal attribute set identifies it, and which alternate facts must remain unique?
- Does each NULL represent one well-defined absence state?
- Which constraint checks the invariant for every writer?
- What dependent fact is being duplicated, and who owns the authoritative copy?
- Which old application/database state must coexist during schema deployment?

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
