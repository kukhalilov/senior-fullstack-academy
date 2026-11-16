# constraints keys defaults identity sequences and computed columns — Reference: IDENTITY, SEQUENCE, rowversion, and key-generation boundaries

# Scope and version

This reference targets SQL Server 2025 (17.x) Database Engine semantics, with SQL Server 2022 ledger/constraint notes explicitly versioned. Azure SQL and Fabric can differ; do not assume that a similarly named object enforces the same rules.

# How this group fits the mental model

The exact inventory table explains each supplied name and its correctness boundary. Choose a declarative invariant, verify existing data/trust, and deploy under an explicit migration plan.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `IDENTITY(seed,increment)` | Defines the initial identity value and the signed step between generated values, for example `IDENTITY(1000, 10)`. Neither parameter guarantees gap-free numbering or uniqueness. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)) |
| `IDENTITY property` | Automatically assigns a numeric value on inserts. It supports integer types and decimal/numeric with scale zero; only one identity column is allowed per table, and it cannot be added to an existing column with ALTER COLUMN. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)) |
| `IDENTITY_INSERT` | Temporarily allows explicit identity values for one table in the session. Only one table per session can be ON; explicit values greater than the current value advance the current identity. Turn it OFF reliably. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)) |
| `IDENT_CURRENT` | Returns the last identity generated for a named table/view across all sessions and scopes. It is not safe to predict the next identity because concurrent inserts can intervene; metadata permissions can make it return NULL. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/ident-current-transact-sql?view=sql-server-ver17)) |
| `SCOPE_IDENTITY` | Returns the last identity generated in the current session and current scope, as numeric(38,0). It avoids an INSERT trigger’s identity from another scope and returns NULL before a qualifying insert in the scope. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/scope-identity-transact-sql?view=sql-server-ver17)) |
| `@@IDENTITY` | Returns the last identity generated in the current session across all scopes. An insert trigger or replication trigger can make it return another table’s value; prefer SCOPE_IDENTITY for a same-scope insert or OUTPUT for affected rows. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/identity-transact-sql?view=sql-server-ver17)) |
| `IDENTITY value gaps` | Failed statements, rolled-back transactions, ignored duplicates, concurrent inserts, and identity cache loss can all leave gaps. Identity values are allocation tokens, not invoice numbers or transaction counts. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)) |
| `IDENTITY does not guarantee uniqueness` | IDENTITY generates values but does not itself enforce uniqueness. Add a PRIMARY KEY or UNIQUE constraint to protect against explicit values, reseeding mistakes, and other collision paths. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)) |
| `CREATE SEQUENCE` | Creates a schema-scoped numeric generator with type, start, increment, bounds, cycle, and cache options. It is independent of any table and can serve several tables. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `NEXT VALUE FOR` | Consumes a sequence value in supported query/DML contexts or a DEFAULT constraint. Values are allocated before the statement’s transaction commits and do not roll back if the row is rolled back. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/next-value-for-transact-sql?view=sql-server-ver17)) |
| `Sequence object` | A database object whose values can be requested without inserting a row. It is shared across consumers, so allocation order is not automatically commit order or business chronology. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `Sequence cache` | CACHE persists a range boundary and keeps remaining values in memory for throughput. An unexpected shutdown can lose unused cached values and create gaps. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `Sequence cycling` | CYCLE restarts at the minimum (ascending) or maximum (descending), not necessarily START WITH. Reuse can collide with historical values; uniqueness still requires a constraint. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `Sequence restart` | ALTER SEQUENCE ... RESTART WITH resets the next generated value to a chosen point within bounds. Coordinate with all consumers and existing table values to avoid duplicate keys. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `Sequence allocated outside transaction rollback` | Sequence allocation is not rolled back with the transaction. A value obtained in an aborted write remains consumed even with NO CACHE. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `Sequence gap behavior` | Unused reservations, rolled-back writes, cache loss, and concurrent callers create gaps. NO CACHE reduces cache-loss gaps but cannot promise gap-free values. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `Sequence versus IDENTITY` | IDENTITY is tied to one table column and generated during row insertion. SEQUENCE is a shared standalone object that can allocate in advance, serve multiple tables, and use NEXT VALUE FOR or a default. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)) |
| `rowversion data type` | An automatically generated 8-byte binary version token backed by a database-wide counter. Each insert/update of a row with a rowversion column gets a new token. ([source](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17)) |
| `rowversion is not a date or time` | rowversion does not encode wall-clock time or temporal ordering across commit; the old synonym `timestamp` is deprecated. Use datetime2/datetimeoffset for actual time. ([source](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17)) |
| `rowversion optimistic concurrency token` | Include the value originally read in an UPDATE/DELETE predicate and require one affected row. A changed token means the row was updated since the client read it; zero rows signals conflict or absence. ([source](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17)) |
| `NEWID` | Generates a GUID value. Its randomized distribution is useful for independent identifiers but can cause scattered inserts and page splits in a clustered GUID index. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/newid-transact-sql?view=sql-server-ver17)) |
| `NEWSEQUENTIALID` | Generates a sequentially clustered GUID only in a DEFAULT constraint on a uniqueidentifier column; it cannot be called in an ordinary SELECT. Values may restart in a lower range after restart/failover and can be guessable. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `GUID key fragmentation tradeoff` | Random NEWID clustered keys spread inserts throughout the index; NEWSEQUENTIALID tends to append locally and reduce page splits but has privacy and failover clustering tradeoffs. Nonclustered GUID identity is a separate choice. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Application-generated key` | A caller can create a GUID, ULID, or domain key before persistence, enabling distributed/offline creation. The database still needs an appropriate uniqueness constraint and canonicalization rules. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `Database-generated key` | Identity, sequence, default GUID, or other engine generation centralizes allocation. Retrieve the generated value from the same write via OUTPUT or an appropriate scoped mechanism, not a racy MAX query. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `IDENTITY one column per table and supported types` | At most one identity property is allowed per table. Supported types are tinyint, smallint, int, bigint, and decimal/numeric with scale 0; DEFAULT is not permitted on that identity column. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)) |
| `IDENTITY cannot be added to an existing column` | ALTER COLUMN cannot add the IDENTITY property to an existing column. A migration generally creates a replacement column/table and copies data under an explicit key-mapping plan. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)) |
| `IDENTITY_INSERT one table per session and reseed effect` | Only one table can have IDENTITY_INSERT ON in a session. Explicit values above the current identity advance the current value; ensure cleanup in error paths and avoid collisions. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)) |
| `IDENT_SEED` | Returns the seed configured for an identity column in a table. It describes configuration, not the last allocated value; IDENT_CURRENT answers a different question. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)) |
| `IDENT_INCR` | Returns the increment configured for an identity column. It does not predict a safe next value when concurrent writers or gaps exist. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)) |
| `Sequence AS type and bounds` | CREATE SEQUENCE AS chooses an integer type; MINVALUE/MAXVALUE constrain its legal range, and defaults derive from that type. Pick a range large enough for the lifetime and define exhaustion behavior. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `Sequence nonzero positive or negative increment` | INCREMENT BY cannot be zero. Positive values ascend, negative values descend; bounds and cycle restart point must match the intended direction. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `Sequence CACHE and NO CACHE` | CACHE reduces system-table I/O but can lose unused values after unexpected shutdown. NO CACHE persists each advance, lowering cache-loss gaps at an I/O cost; neither prevents gaps from unused or rolled-back allocations. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `Sequence values allocated outside transaction rollback` | NEXT VALUE FOR advances the sequence outside transaction rollback. An aborted transaction consumes its number, so sequence values cannot be a gap-free commit ledger. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `Sequence number requested but not consumed` | Applications may reserve a value or range and never insert it. The unused values stay consumed; `sp_sequence_get_range` likewise reserves a range independent of later writes. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `ALTER SEQUENCE RESTART WITH` | Sets the next generated sequence value to the restart value. Validate it against every consumer table and concurrent allocator before restart. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17)) |
| `sp_sequence_get_range` | Atomically reserves a range of sequence values for a client to use later. It improves allocation throughput but unused values remain gaps and range ownership must be tracked. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-sequence-get-range-transact-sql?view=sql-server-ver17)) |
| `NEXT VALUE FOR repeated references in one row` | When a sequence is referenced multiple times for a single result row, including by a default and the insert expression, SQL Server returns the same sequence value for all references in that row. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/next-value-for-transact-sql?view=sql-server-ver17)) |
| `NEXT VALUE FOR OVER ORDER BY` | The OVER(ORDER BY ...) form assigns sequence values in the specified query-row order in SELECT or INSERT...SELECT. It does not support PARTITION BY and is not allowed in UPDATE/MERGE. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/next-value-for-transact-sql?view=sql-server-ver17)) |
| `NEXT VALUE FOR default constraint restrictions` | A sequence used by a default must be in the same database as the table; the creator needs REFERENCES permission. The default cannot use OVER, and the sequence cannot be dropped while referenced. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/next-value-for-transact-sql?view=sql-server-ver17)) |
| `Sequence cycle can repeat keys` | CYCLE deliberately reuses values after the bound. If consumers store values under a unique key, a later insert can fail; choose NO CYCLE for identifiers that must never be reused. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)) |
| `rowversion database-wide 8-byte counter` | The rowversion counter is per database, increments when rows in tables with rowversion are inserted or updated, and occupies 8 bytes. It represents change order within that database, not time. ([source](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17)) |
| `One rowversion column per table` | A table can contain only one rowversion column. Updating a row changes it even if an UPDATE assigns a column its existing value; avoid using it as a primary/foreign key. ([source](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17)) |
| `NEWID random GUID` | NEWID returns a pseudo-random uniqueidentifier. It is usable in expressions/defaults, but a random clustered key can fragment pages and increase I/O. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/newid-transact-sql?view=sql-server-ver17)) |
| `NEWSEQUENTIALID default-only and privacy boundary` | NEWSEQUENTIALID can appear only as an unwrapped DEFAULT for a uniqueidentifier column. It tends to improve insertion locality, but its next values can be guessed and values can cluster after failover/restart. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17)) |

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
