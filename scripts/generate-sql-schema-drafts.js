import fs from 'node:fs/promises';

const manifestPath = 'curriculum/manifests/sql-server/t03-007.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const urls = {
  primaryForeign: 'https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17',
  uniqueCheck: 'https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17',
  tableConstraint: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17',
  alterTable: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-transact-sql?view=sql-server-ver17',
  createTable: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17',
  identity: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17',
  identityCurrent: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/ident-current-transact-sql?view=sql-server-ver17',
  scopeIdentity: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/scope-identity-transact-sql?view=sql-server-ver17',
  identityAny: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/identity-transact-sql?view=sql-server-ver17',
  sequence: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17',
  alterSequence: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-sequence-transact-sql?view=sql-server-ver17',
  nextValue: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/next-value-for-transact-sql?view=sql-server-ver17',
  sequenceRange: 'https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-sequence-get-range-transact-sql?view=sql-server-ver17',
  rowversion: 'https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17',
  newid: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/newid-transact-sql?view=sql-server-ver17',
  newSequential: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/newsequentialid-transact-sql?view=sql-server-ver17',
  computed: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver17',
  computedIndex: 'https://learn.microsoft.com/en-us/sql/relational-databases/indexes/indexes-on-computed-columns?view=sql-server-ver17',
  temporal: 'https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal-tables?view=sql-server-ver17',
  temporalCreate: 'https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal/create?view=sql-server-ver17',
  ledger: 'https://learn.microsoft.com/en-us/sql/relational-databases/security/ledger/ledger-updatable-ledger-tables?view=sql-server-ver17',
  sparse: 'https://learn.microsoft.com/en-us/sql/relational-databases/tables/use-sparse-columns?view=sql-server-ver17',
  columnSet: 'https://learn.microsoft.com/en-us/sql/relational-databases/tables/use-column-sets?view=sql-server-ver17',
  alwaysEncrypted: 'https://learn.microsoft.com/en-us/sql/relational-databases/security/encryption/always-encrypted-database-engine?view=sql-server-ver17',
  default: 'https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-default-values-for-columns?view=sql-server-ver17',
  defaultMetadata: 'https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-default-constraints-transact-sql?view=sql-server-ver17',
  output: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17',
};
manifest.sourceSnapshot = {
  ...manifest.sourceSnapshot,
  edition: 'SQL Server 2025 (17.x) constraints, generated values, and table-column documentation, checked 2026-11-16',
  checkedAt: '2026-11-16',
  urls: [...new Set([...manifest.sourceSnapshot.urls, ...Object.values(urls)])],
};
manifest.comparisonSources = [...new Set([...manifest.comparisonSources, ...Object.values(urls)])];
manifest.versionNotes = [
  { edition: 'SQL Server 2022 (16.x)', items: ['Ledger tables introduced GENERATED ALWAYS AS TRANSACTION_ID START/END and SEQUENCE_NUMBER START/END metadata columns; these are engine-generated and can be HIDDEN. SQL Server 2022 also supports resumable ALTER TABLE addition of PRIMARY KEY and UNIQUE constraints.'], sourceUrls: [urls.ledger, urls.createTable, urls.tableConstraint] },
  { edition: 'SQL Server 2016 (13.x) and later', items: ['System-versioned temporal tables use one PERIOD FOR SYSTEM_TIME with GENERATED ALWAYS ROW START and ROW END datetime2 columns; the Database Engine maintains period values.'], sourceUrls: [urls.temporalCreate] },
];
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const d = {
  'PRIMARY KEY': 'Enforces a non-NULL unique row identifier and creates a unique index. A table can have only one PRIMARY KEY constraint, though that key may contain multiple columns; choose a stable candidate key and do not confuse physical clustering with logical identity.',
  'UNIQUE constraint': 'Enforces uniqueness on a non-primary candidate key and creates a unique index. SQL Server permits NULL in a UNIQUE key; for a single-column UNIQUE constraint only one NULL value is allowed. Use a filtered unique index when the requirement is “unique only when present.”',
  'FOREIGN KEY': 'Requires each non-NULL referencing key tuple to match an eligible primary or unique key in the referenced table. It does not automatically create an index on the referencing columns; index them when workload and parent-delete checks justify it.',
  'CHECK constraint': 'Rejects a row only when its Boolean expression is FALSE. UNKNOWN, including many expressions involving NULL, is accepted; pair CHECK with NOT NULL when NULL itself is forbidden. A CHECK is row-scoped and cannot enforce an aggregate or cross-table invariant.',
  'DEFAULT constraint': 'Supplies a value when INSERT omits the column or uses DEFAULT. It does not replace NOT NULL and does not override an explicitly supplied NULL; defaults do not automatically recalculate on UPDATE.',
  'NOT NULL': 'Disallows NULL for a column. It is separate from CHECK and DEFAULT: a default may supply an omitted value, but callers can still supply NULL unless the column is NOT NULL.',
  'Composite primary key': 'Defines identity as a tuple of columns. Each component is NOT NULL and only the full combination must be unique; individual component values may repeat.',
  'Composite UNIQUE constraint': 'Enforces uniqueness of the complete ordered key tuple, not each member separately. Decide whether each nullable component is allowed and test the exact NULL combinations the business rule permits.',
  'Filtered unique index': 'Enforces uniqueness only among rows satisfying its WHERE filter, commonly `WHERE Email IS NOT NULL` to allow many absent optional values. It is an index, not a table constraint, and filtered indexes have their own eligibility restrictions.',
  'Constraint name': 'A stable explicit name makes migrations, error diagnosis, and later ALTER TABLE operations predictable. Auto-generated names are harder to address safely across environments.',
  'WITH CHECK': 'Validates existing rows when adding or re-enabling a FOREIGN KEY or CHECK constraint. A successfully validated constraint is trusted by the optimizer for applicable reasoning.',
  'WITH NOCHECK': 'Skips validation of existing rows when adding or re-enabling a FOREIGN KEY or CHECK. Future changes are checked, but pre-existing violating rows can remain and the constraint is untrusted.',
  'Trusted constraint': 'An enabled constraint that SQL Server knows was validated against all relevant existing rows. Trusted metadata lets the optimizer use its guarantee; check `sys.foreign_keys.is_not_trusted` or `sys.check_constraints.is_not_trusted` during migration review.',
  'Untrusted constraint': 'An enabled constraint that enforces future writes but has not validated all existing data. It cannot support the same optimizer assumptions; repair rows and re-enable with `WITH CHECK CHECK`.',
  'ON DELETE NO ACTION': 'The default referential action: if children reference the parent, deleting that parent fails and the statement is rolled back.',
  'ON DELETE CASCADE': 'Deleting a referenced parent automatically deletes matching child rows. Use only when child lifecycle truly depends on the parent; cascade paths and trigger interactions can restrict the design.',
  'ON DELETE SET NULL': 'Deleting the parent sets every foreign-key column in the child tuple to NULL. All affected child key columns must permit NULL.',
  'ON UPDATE referential action': 'Defines what happens when a referenced candidate key changes: NO ACTION, CASCADE, SET NULL, or SET DEFAULT. Stable surrogate keys usually avoid routine parent-key updates.',
  'Self-referencing foreign key': 'References a key in the same table, commonly for parent-child hierarchies. NULL may represent a root; deletion/update actions and cycle prevention remain separate design decisions.',
  'Disabled constraint': 'A disabled constraint does not protect data while disabled. Re-enabling without validation can leave it enabled but untrusted; plan cleanup and validation explicitly.',
  'Enable constraint with validation': 'Use `ALTER TABLE dbo.T WITH CHECK CHECK CONSTRAINT CK_or_FK` to enable and validate existing rows. The repeated CHECK is intentional: the first controls validation, the second enables the constraint.',
  'Constraint violation error': 'An insert/update that violates an enabled enforced constraint fails and rolls back the violating statement. Catch expected uniqueness/FK races at the application boundary rather than relying on pre-check queries.',
  'Unique index backing a constraint': 'SQL Server creates an index to enforce PRIMARY KEY or UNIQUE constraints. A separate unique index can express additional rules such as filtered uniqueness, but it is not automatically equivalent to a named constraint.',
  'Constraint versus trigger': 'Constraints express declarative row/key/referential invariants that SQL Server can enforce consistently and reason about. Triggers run procedural code and may model more complex effects, but are harder to reason about and do not replace basic keys or NOT NULL rules.',
  'DEFAULT constraint expression': 'A default is a scalar constant/expression such as a literal or supported built-in function; it is evaluated when a value is omitted or DEFAULT is requested. It is not an update-on-change rule.',
  'DEFAULT keyword in INSERT': 'The DEFAULT token requests the column default for that row; if no default exists, nullable columns receive NULL while NOT NULL columns reject the insert. DEFAULT cannot be used for an IDENTITY column.',
  'CHECK UNKNOWN permits NULL': 'SQL CHECK rejects FALSE, not UNKNOWN. For example `CHECK (Quantity > 0)` accepts NULL; add `NOT NULL` if missing quantity is invalid.',
  'CHECK constraint is row-level': 'A CHECK expression is evaluated for each row being inserted or updated. It cannot enforce “at least one row,” compare against another table, or safely count siblings.',
  'CHECK cannot enforce cross-table invariants': 'A CHECK constraint cannot query other tables; model cross-row/cross-table integrity with keys, unique indexes, foreign keys, or carefully designed transaction logic/triggers where no declarative invariant fits.',
  'UNIQUE nullable value behavior': 'A single-column UNIQUE constraint allows one NULL because SQL Server treats it as a key value for uniqueness. If an optional value may be NULL for many rows, use a filtered unique index over non-NULL values.',
  'Filtered unique index WHERE IS NOT NULL': 'For optional email, `CREATE UNIQUE INDEX UX_User_Email ON dbo.UserAccount(Email) WHERE Email IS NOT NULL;` enforces uniqueness for supplied addresses while permitting many NULLs.',
  'Filtered unique index is not a constraint': 'A filtered unique index enforces a filtered rule but does not become a PRIMARY KEY or UNIQUE constraint and is not a general referenced key for foreign keys. Document and manage it as an index.',
  'Foreign key references unique key': 'A referenced key must be uniquely identified by a supported primary/unique key/index and match the referencing column count and compatible types. A foreign key points to the parent candidate key, not to arbitrary nonunique columns.',
  'Foreign key does not auto-create an index': 'Creating an FK does not create an index on the child columns. Parent deletes/updates and joins may scan children, so add a suitable child index based on access paths and cascade cost.',
  'NULL foreign-key component': 'For a single-column FK, NULL does not require a parent match. For composite keys, SQL Server’s MATCH SIMPLE behavior means a NULL component can exempt the composite tuple from requiring a full parent match; do not use partial NULLs to represent a valid relationship.',
  'ON DELETE SET DEFAULT': 'Deleting the parent assigns the declared default to each child FK column; if no explicit default exists on a nullable column, NULL is its implicit default. The resulting tuple must still satisfy an FK reference, often to a designated “unknown” parent row.',
  'ON UPDATE CASCADE': 'Changing the referenced parent key propagates the new value to matching child FK columns. It is unavailable in some trigger/timestamp configurations and can create long cascading work.',
  'ON UPDATE SET NULL': 'Changing a parent key sets child FK columns to NULL. Those columns must be nullable, and the application must interpret the now-detached relationship correctly.',
  'ON UPDATE SET DEFAULT': 'Changing a parent key sets child FK columns to their defaults. Defaults must exist or be nullable, and the resulting tuple must reference an existing parent.',
  'ON UPDATE NO ACTION': 'The default update action rejects changing a referenced parent key while child rows depend on its old value.',
  'Cascade cycle and multiple-path restriction': 'SQL Server prevents cascading referential actions that create cycles or multiple cascade paths. Model the lifecycle explicitly or perform ordered transactional DML when cascades cannot be represented safely.',
  'NOT FOR REPLICATION constraint': 'Suppresses enforcement for changes applied by replication agents while ordinary user changes remain subject to the constraint. It is a replication-specific trust decision, not a general way to bypass invalid data.',
  'Validate existing rows when adding constraint': 'Adding a new FOREIGN KEY or CHECK normally scans existing data and fails if violations exist. Use a deliberate cleanup/migration before deployment instead of silently opting out of validation.',
  'WITH CHECK CHECK enable and trust': 'The two CHECK keywords mean “validate existing rows” and “enable constraint.” It is the migration pattern that restores both enforcement and trusted metadata after repair.',
  'One primary key per table': 'SQL Server permits one PRIMARY KEY constraint per table. If several candidate keys exist, designate one as primary and use UNIQUE constraints for the others.',
  'Primary-key columns are NOT NULL': 'Every PRIMARY KEY column is NOT NULL. If nullability is omitted in the declaration, SQL Server sets the participating columns to NOT NULL.',
  'IDENTITY(seed,increment)': 'Defines the initial identity value and the signed step between generated values, for example `IDENTITY(1000, 10)`. Neither parameter guarantees gap-free numbering or uniqueness.',
  'IDENTITY property': 'Automatically assigns a numeric value on inserts. It supports integer types and decimal/numeric with scale zero; only one identity column is allowed per table, and it cannot be added to an existing column with ALTER COLUMN.',
  'IDENTITY_INSERT': 'Temporarily allows explicit identity values for one table in the session. Only one table per session can be ON; explicit values greater than the current value advance the current identity. Turn it OFF reliably.',
  'IDENT_CURRENT': 'Returns the last identity generated for a named table/view across all sessions and scopes. It is not safe to predict the next identity because concurrent inserts can intervene; metadata permissions can make it return NULL.',
  'SCOPE_IDENTITY': 'Returns the last identity generated in the current session and current scope, as numeric(38,0). It avoids an INSERT trigger’s identity from another scope and returns NULL before a qualifying insert in the scope.',
  '@@IDENTITY': 'Returns the last identity generated in the current session across all scopes. An insert trigger or replication trigger can make it return another table’s value; prefer SCOPE_IDENTITY for a same-scope insert or OUTPUT for affected rows.',
  'IDENTITY value gaps': 'Failed statements, rolled-back transactions, ignored duplicates, concurrent inserts, and identity cache loss can all leave gaps. Identity values are allocation tokens, not invoice numbers or transaction counts.',
  'IDENTITY does not guarantee uniqueness': 'IDENTITY generates values but does not itself enforce uniqueness. Add a PRIMARY KEY or UNIQUE constraint to protect against explicit values, reseeding mistakes, and other collision paths.',
  'CREATE SEQUENCE': 'Creates a schema-scoped numeric generator with type, start, increment, bounds, cycle, and cache options. It is independent of any table and can serve several tables.',
  'NEXT VALUE FOR': 'Consumes a sequence value in supported query/DML contexts or a DEFAULT constraint. Values are allocated before the statement’s transaction commits and do not roll back if the row is rolled back.',
  'Sequence object': 'A database object whose values can be requested without inserting a row. It is shared across consumers, so allocation order is not automatically commit order or business chronology.',
  'Sequence cache': 'CACHE persists a range boundary and keeps remaining values in memory for throughput. An unexpected shutdown can lose unused cached values and create gaps.',
  'Sequence cycling': 'CYCLE restarts at the minimum (ascending) or maximum (descending), not necessarily START WITH. Reuse can collide with historical values; uniqueness still requires a constraint.',
  'Sequence restart': 'ALTER SEQUENCE ... RESTART WITH resets the next generated value to a chosen point within bounds. Coordinate with all consumers and existing table values to avoid duplicate keys.',
  'Sequence allocated outside transaction rollback': 'Sequence allocation is not rolled back with the transaction. A value obtained in an aborted write remains consumed even with NO CACHE.',
  'Sequence gap behavior': 'Unused reservations, rolled-back writes, cache loss, and concurrent callers create gaps. NO CACHE reduces cache-loss gaps but cannot promise gap-free values.',
  'Sequence versus IDENTITY': 'IDENTITY is tied to one table column and generated during row insertion. SEQUENCE is a shared standalone object that can allocate in advance, serve multiple tables, and use NEXT VALUE FOR or a default.',
  'rowversion data type': 'An automatically generated 8-byte binary version token backed by a database-wide counter. Each insert/update of a row with a rowversion column gets a new token.',
  'rowversion is not a date or time': 'rowversion does not encode wall-clock time or temporal ordering across commit; the old synonym `timestamp` is deprecated. Use datetime2/datetimeoffset for actual time.',
  'rowversion optimistic concurrency token': 'Include the value originally read in an UPDATE/DELETE predicate and require one affected row. A changed token means the row was updated since the client read it; zero rows signals conflict or absence.',
  'NEWID': 'Generates a GUID value. Its randomized distribution is useful for independent identifiers but can cause scattered inserts and page splits in a clustered GUID index.',
  'NEWSEQUENTIALID': 'Generates a sequentially clustered GUID only in a DEFAULT constraint on a uniqueidentifier column; it cannot be called in an ordinary SELECT. Values may restart in a lower range after restart/failover and can be guessable.',
  'GUID key fragmentation tradeoff': 'Random NEWID clustered keys spread inserts throughout the index; NEWSEQUENTIALID tends to append locally and reduce page splits but has privacy and failover clustering tradeoffs. Nonclustered GUID identity is a separate choice.',
  'Application-generated key': 'A caller can create a GUID, ULID, or domain key before persistence, enabling distributed/offline creation. The database still needs an appropriate uniqueness constraint and canonicalization rules.',
  'Database-generated key': 'Identity, sequence, default GUID, or other engine generation centralizes allocation. Retrieve the generated value from the same write via OUTPUT or an appropriate scoped mechanism, not a racy MAX query.',
  'IDENTITY one column per table and supported types': 'At most one identity property is allowed per table. Supported types are tinyint, smallint, int, bigint, and decimal/numeric with scale 0; DEFAULT is not permitted on that identity column.',
  'IDENTITY cannot be added to an existing column': 'ALTER COLUMN cannot add the IDENTITY property to an existing column. A migration generally creates a replacement column/table and copies data under an explicit key-mapping plan.',
  'IDENTITY_INSERT one table per session and reseed effect': 'Only one table can have IDENTITY_INSERT ON in a session. Explicit values above the current identity advance the current value; ensure cleanup in error paths and avoid collisions.',
  'IDENT_SEED': 'Returns the seed configured for an identity column in a table. It describes configuration, not the last allocated value; IDENT_CURRENT answers a different question.',
  'IDENT_INCR': 'Returns the increment configured for an identity column. It does not predict a safe next value when concurrent writers or gaps exist.',
  'Sequence AS type and bounds': 'CREATE SEQUENCE AS chooses an integer type; MINVALUE/MAXVALUE constrain its legal range, and defaults derive from that type. Pick a range large enough for the lifetime and define exhaustion behavior.',
  'Sequence nonzero positive or negative increment': 'INCREMENT BY cannot be zero. Positive values ascend, negative values descend; bounds and cycle restart point must match the intended direction.',
  'Sequence CACHE and NO CACHE': 'CACHE reduces system-table I/O but can lose unused values after unexpected shutdown. NO CACHE persists each advance, lowering cache-loss gaps at an I/O cost; neither prevents gaps from unused or rolled-back allocations.',
  'Sequence values allocated outside transaction rollback': 'NEXT VALUE FOR advances the sequence outside transaction rollback. An aborted transaction consumes its number, so sequence values cannot be a gap-free commit ledger.',
  'Sequence number requested but not consumed': 'Applications may reserve a value or range and never insert it. The unused values stay consumed; `sp_sequence_get_range` likewise reserves a range independent of later writes.',
  'ALTER SEQUENCE RESTART WITH': 'Sets the next generated sequence value to the restart value. Validate it against every consumer table and concurrent allocator before restart.',
  'sp_sequence_get_range': 'Atomically reserves a range of sequence values for a client to use later. It improves allocation throughput but unused values remain gaps and range ownership must be tracked.',
  'NEXT VALUE FOR repeated references in one row': 'When a sequence is referenced multiple times for a single result row, including by a default and the insert expression, SQL Server returns the same sequence value for all references in that row.',
  'NEXT VALUE FOR OVER ORDER BY': 'The OVER(ORDER BY ...) form assigns sequence values in the specified query-row order in SELECT or INSERT...SELECT. It does not support PARTITION BY and is not allowed in UPDATE/MERGE.',
  'NEXT VALUE FOR default constraint restrictions': 'A sequence used by a default must be in the same database as the table; the creator needs REFERENCES permission. The default cannot use OVER, and the sequence cannot be dropped while referenced.',
  'Sequence cycle can repeat keys': 'CYCLE deliberately reuses values after the bound. If consumers store values under a unique key, a later insert can fail; choose NO CYCLE for identifiers that must never be reused.',
  'rowversion database-wide 8-byte counter': 'The rowversion counter is per database, increments when rows in tables with rowversion are inserted or updated, and occupies 8 bytes. It represents change order within that database, not time.',
  'One rowversion column per table': 'A table can contain only one rowversion column. Updating a row changes it even if an UPDATE assigns a column its existing value; avoid using it as a primary/foreign key.',
  'NEWID random GUID': 'NEWID returns a pseudo-random uniqueidentifier. It is usable in expressions/defaults, but a random clustered key can fragment pages and increase I/O.',
  'NEWSEQUENTIALID default-only and privacy boundary': 'NEWSEQUENTIALID can appear only as an unwrapped DEFAULT for a uniqueidentifier column. It tends to improve insertion locality, but its next values can be guessed and values can cluster after failover/restart.',
  'DEFAULT expression': 'The scalar expression supplies an omitted/DEFAULT column value at insert time. Built-ins such as SYSUTCDATETIME can be used, but a default does not continuously maintain a value after later updates.',
  'DEFAULT constraint binding': 'A default constraint is attached to one column and is evaluated only when INSERT omits that column or specifies DEFAULT. Use an explicit, stable name so deployment scripts can find and replace it.',
  'DEFAULT versus explicit NULL': 'Omitting a column or using DEFAULT invokes the default; explicitly supplying NULL bypasses it. NOT NULL then rejects that NULL rather than substituting the default.',
  'Computed column': 'Defines a value from an expression over columns in the same row. It is virtual unless PERSISTED, cannot be assigned through ordinary INSERT/UPDATE, and is not a general materialized view.',
  'Computed column expression': 'Uses deterministic or nondeterministic scalar expressions over same-row columns, constants, and supported functions; subqueries and alias data types are not allowed. Type/precision of the expression determines downstream indexability.',
  'PERSISTED computed column': 'Stores the computed result and updates it when dependencies change. The expression must be deterministic; PERSISTED can make deterministic but imprecise expressions indexable and is required for computed partition columns.',
  'Deterministic computed expression': 'Returns the same result for the same input values and database state under SQL Server’s determinism rules. Determinism is required for persistence and indexing decisions.',
  'Precise computed expression': 'Uses arithmetic that avoids approximate floating-point representation. Index keys require a deterministic precise expression, or a deterministic PERSISTED expression when permitted.',
  'Computed-column index requirements': 'Indexing requires a legal key type, deterministic expression, and either precision or deterministic PERSISTED storage for imprecise expressions. Required SET options must be correct for DDL and DML sessions.',
  'Virtual versus persisted computed value': 'A virtual computed value is calculated when queried and is not stored in the base row; PERSISTED stores it and maintains it on dependency updates, trading storage/write cost for read/index options.',
  'GENERATED ALWAYS AS ROW START': 'Marks the datetime2 start-of-validity column for a system-versioned temporal table. The Database Engine assigns period values; applications do not supply arbitrary values during ordinary DML.',
  'GENERATED ALWAYS AS ROW END': 'Marks the datetime2 end-of-validity period column for a temporal table. Current rows use the maximum datetime2 end value; the engine adjusts it as versions move to history.',
  'PERIOD FOR SYSTEM_TIME': 'Declares exactly one start/end period pair on a temporal table. The columns must be datetime2, with aligned precision and non-NULL semantics, and system versioning must be enabled to maintain history.',
  'Temporal period columns': 'The two period columns define system validity time maintained by SQL Server, not user business-effective dates. They are used with SYSTEM_VERSIONING and an aligned history table.',
  'Hidden generated column': 'HIDDEN omits a generated period or ledger column from implicit SELECT * and INSERT-without-column-list shape. It remains addressable by name and is still engine-managed.',
  'SPARSE column': 'Optimizes storage for NULL-heavy columns by storing NULLs with little/no payload while adding overhead for non-NULL values. Measure actual data distribution and review type/feature restrictions.',
  'ROWGUIDCOL property': 'Labels one uniqueidentifier column as the table’s row GUID column for `$ROWGUID` references. It neither generates GUIDs nor creates uniqueness/default behavior; define NEWID/NEWSEQUENTIALID and a key separately.',
  'Column encryption boundary': 'Always Encrypted column definitions tie to column encryption keys and deterministic/randomized modes. Encryption mode changes allowed comparisons/indexes; schema constraints on encrypted columns have key/mode restrictions.',
  'Generated value retrieval with OUTPUT': 'Use INSERT ... OUTPUT INSERTED.Key for each generated identity/computed/default value from the rows this statement inserted. Scope-based identity functions return only one identity and do not cover other generated columns.',
  'Metadata default value': 'Inspect `sys.default_constraints` joined to `sys.columns` using parent_object_id and parent_column_id. Its definition and is_system_named flag help migrations discover unnamed defaults safely.',
  'Migration backfill versus default constraint': 'A DEFAULT handles future omitted inserts; it does not generally update old rows when added to an existing column. Backfill explicitly or use WITH VALUES where supported, and plan locks/log volume.',
  'One DEFAULT constraint per column': 'A column can have only one default definition. Replacing it requires identifying and dropping the existing constraint before adding the new one.',
  'DEFAULT expression allowed forms': 'A default may be a constant or supported scalar/system function expression, such as SYSUTCDATETIME() or NEXT VALUE FOR. It is not a subquery or arbitrary cross-table lookup.',
  'DEFAULT expression cannot reference another column': 'A default definition cannot derive its value from another column in the same row. Use a computed column for a derived value or explicitly supply related values in DML.',
  'Adding a default to a populated table': 'Adding only a default constraint affects later inserts, not existing rows. Adding a new NOT NULL column to a populated table requires a default or an empty table; operational cost depends on edition/operation and row count.',
  'WITH VALUES backfills existing rows': 'When adding a nullable column with a default, `WITH VALUES` stores the default for existing rows; without it, existing rows remain NULL. Assess whether the operation rewrites rows, holds locks, or generates substantial log.',
  'Computed column cannot have DEFAULT or FOREIGN KEY': 'A computed column cannot define DEFAULT or participate as a foreign key definition. Its value derives from its expression; it may qualify for an index/unique/primary key only under computed-index rules.',
  'Computed column NOT NULL requires PERSISTED': 'SQL Server permits NOT NULL on a computed column only when it is PERSISTED and the expression meets applicable rules.',
  'Computed column primary or unique key eligibility': 'A computed column can be a PRIMARY KEY or UNIQUE key only if its expression and result type satisfy indexing rules, including determinism and precision/persistence requirements.',
  'Computed column filtered index restriction': 'SQL Server does not allow a computed column as a filtered-index predicate column; evaluate supported index design or materialize a different schema representation.',
  'Computed-index required SET options': 'The connection SET options must satisfy SQL Server’s documented requirements, including ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON and NUMERIC_ROUNDABORT OFF, for indexed computed columns.',
  'COLUMN_SET FOR ALL_SPARSE_COLUMNS': 'A column set is one optional, updatable XML representation of all sparse columns; only one is allowed per table. It changes SELECT * shape and cannot have constraints, defaults, or indexes.',
  'SPARSE storage and type restrictions': 'Sparse columns trade extra non-NULL storage and retrieval overhead for savings when NULLs dominate; Microsoft suggests considering them when storage savings are material. Several types/features are unsupported, including rowversion/timestamp and column sets in replication.',
  'ROWGUIDCOL does not generate or enforce uniqueness': 'ROWGUIDCOL is metadata designation only. A UNIQUEIDENTIFIER column needs a DEFAULT or application-supplied value and a UNIQUE/PRIMARY KEY constraint if those properties are required.',
  'Temporal period requires exactly one ROW START and ROW END': 'A system-versioned temporal table needs exactly one PERIOD FOR SYSTEM_TIME with one GENERATED ALWAYS ROW START and one ROW END datetime2 column, plus a primary key.',
  'Temporal period datetime2 precision alignment': 'The temporal period endpoints must use datetime2 with matching precision; SQL Server assumes non-NULL period values and rejects explicitly nullable period columns.',
  'Ledger generated TRANSACTION_ID START and END': 'Updatable ledger tables add engine-managed BIGINT columns marking the transaction that started and ended a row version. END can be NULL for an active version; ledger uses the metadata to verify history.',
  'Ledger generated SEQUENCE_NUMBER START and END': 'Ledger-generated BIGINT columns order row versions within the transaction; START/END values are assigned by SQL Server and cannot be treated as application sequence numbers.',
  'Ledger-generated columns hidden and engine-managed': 'Ledger system columns may be HIDDEN so implicit projections remain compatible. They are still metadata-bearing engine-generated values and must not be inserted or maintained by the application.',
  'Ledger generated columns SQL Server 2022 availability': 'Ledger tables and their transaction/sequence generated metadata are a SQL Server 2022 (16.x) feature. Confirm ledger support and configuration on the target platform before using this schema.',
  'Always Encrypted deterministic versus randomized constraint support': 'Randomized encryption provides stronger ciphertext variation but blocks equality/index/constraint uses; deterministic encryption supports equality-related operations and selected keys but leaks equality patterns. Secure enclaves alter some capabilities; check exact engine/client support.',
  'Generated value OUTPUT retrieval boundary': 'OUTPUT INSERTED can return identity, default, computed, and rowversion values for each changed row. It is a statement row image; transaction errors/rollback and trigger timing determine whether it represents durable final state.',
  'sys.default_constraints metadata': 'This catalog view has one row for each table default created inline or by ALTER TABLE; definition, parent_column_id, and is_system_named support discovery. Metadata visibility follows permissions.',
  'Default migration rollout and backfill cost': 'Separate schema default deployment from historical backfill when large tables need controlled batches. A default alone is not data cleanup; choose locking, rollback, validation, and application dual-read/write order deliberately.',
};

const cite = (name) => {
  if (/Computed|computed/.test(name)) return /index|SET option|filtered/.test(name) ? urls.computedIndex : urls.computed;
  if (/IDENTITY|IDENT_|SCOPE_IDENTITY|@@IDENTITY/.test(name)) return /SCOPE_IDENTITY/.test(name) ? urls.scopeIdentity : /IDENT_CURRENT/.test(name) ? urls.identityCurrent : /@@IDENTITY/.test(name) ? urls.identityAny : urls.identity;
  if (/Sequence|NEXT VALUE|sp_sequence/.test(name)) return /NEXT VALUE/.test(name) ? urls.nextValue : /sp_sequence/.test(name) ? urls.sequenceRange : /RESTART/.test(name) ? urls.alterSequence : urls.sequence;
  if (/rowversion|Timestamp/.test(name)) return urls.rowversion;
  if (/NEWID/.test(name) && /SEQUENTIAL/.test(name)) return urls.newSequential;
  if (/NEWID/.test(name)) return urls.newid;
  if (/FOREIGN KEY|referential|ON DELETE|ON UPDATE|Self-referencing|CASCADE/.test(name)) return urls.primaryForeign;
  if (/CHECK|UNIQUE|PRIMARY KEY|Filtered unique|Constraint|WITH CHECK|WITH NOCHECK|Trusted|Untrusted|NOT NULL/.test(name)) return /CHECK|UNIQUE|Filtered/.test(name) ? urls.uniqueCheck : urls.tableConstraint;
  if (/Temporal|SYSTEM_TIME|ROW START|ROW END/.test(name)) return urls.temporalCreate;
  if (/Ledger|TRANSACTION_ID|SEQUENCE_NUMBER/.test(name)) return urls.ledger;
  if (/SPARSE|COLUMN_SET/.test(name)) return /COLUMN_SET/.test(name) ? urls.columnSet : urls.sparse;
  if (/encryption|encrypted/i.test(name)) return urls.alwaysEncrypted;
  if (/Metadata|sys.default/.test(name)) return urls.defaultMetadata;
  if (/WITH VALUES|populated|migration|backfill/i.test(name)) return urls.alterTable;
  if (/DEFAULT|default|Migration/.test(name)) return /WITH VALUES|populated|migration/.test(name) ? urls.alterTable : urls.default;
  if (/OUTPUT|generated value/.test(name)) return urls.output;
  return urls.createTable;
};
const allItems = manifest.inventory.flatMap(g => g.items);
const unknown = allItems.filter(name => !d[name]);
if (unknown.length) throw new Error(`Missing scoped explanations: ${unknown.join(', ')}`);
const sourceList = [...new Set(Object.values(urls))].map(url => `- ${url}`).join('\n');
const write = async (id, text) => fs.writeFile(`course/drafts/t03-007/t03-007-${id}.md`, text.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
await fs.mkdir('course/drafts/t03-007', { recursive: true });
const title = manifest.title;

await write('overview', `# ${title} — Big-picture orientation and mental model

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

An account has a stable AccountId primary key, an optional ExternalCode that should be unique when present, and a required nonnegative Balance. Model these as PRIMARY KEY, filtered UNIQUE index, NOT NULL, and \`CHECK (Balance >= 0)\`; the check alone would permit NULL because UNKNOWN is accepted. Add \`CreatedAt DEFAULT SYSUTCDATETIME()\` for future omitted values, while separately backfilling existing rows if the migration requires it. Add rowversion if clients must detect stale updates. Do not use identity gaps or rowversion ordering to infer invoice sequence or wall-clock time.

# Version and platform boundaries

System-versioned temporal tables date to SQL Server 2016. SQL Server 2022 added ledger tables with engine-managed transaction and sequence generated columns; it also supports resumable addition of PRIMARY KEY and UNIQUE constraints. SQL Server 2025 documentation remains the source baseline for current syntax; platform variants can expose different enforcement behavior. See [temporal creation](${urls.temporalCreate}), [ledger tables](${urls.ledger}), and [ALTER TABLE constraints](${urls.tableConstraint}).

# When to use it and tradeoffs

Prefer declarative constraints for row/key/relationship invariants. Use triggers only when the rule is inherently procedural and transactionally safe. Use identity for simple table-local surrogate allocation; sequences when multiple consumers or preallocation/order-by-value are needed; GUIDs for distributed generation. Use persisted computed values only when storage/index access justifies their write cost.

# What later lessons cover

Index design, query patterns, temporal querying/history retention, Always Encrypted architecture, and transaction isolation receive dedicated topics. This unit covers their schema-level interactions only.

# Sources

${sourceList}
`);

await write('concepts', `# ${title} — Core concepts and how they fit together

# Learning objectives

Choose constraints that enforce the actual business invariant; distinguish defaults from nullability and backfills; select IDENTITY/SEQUENCE/GUID generation correctly; explain sequence/identity gaps; use rowversion for compare-and-swap; evaluate computed-column persistence and indexability; and recognize temporal/ledger engine-managed columns.

# Prerequisites

Know tables, columns, data types, INSERT/UPDATE/DELETE, transactions, and basic indexes. The DML topic explains OUTPUT and affected-row handling; index design and temporal querying are covered elsewhere.

# Core concepts

PRIMARY KEY and UNIQUE enforce tuple uniqueness through indexes. CHECK rejects only FALSE, so NULL often passes; NOT NULL is an independent rule. FOREIGN KEY checks relationships, but child-side indexing and optional-reference semantics are design choices. Constraint trust matters: an untrusted constraint may be enabled for future writes but cannot support the optimizer’s full reasoning about existing rows.

Defaults apply on omission or DEFAULT; an explicit NULL is a value supplied by the caller. A default constraint does not populate old rows when it is added to an existing column unless the migration operation requests backfill, such as WITH VALUES for a nullable added column. Large schema backfills have lock/logging consequences ([ALTER TABLE default behavior](${urls.alterTable})).

# Mechanisms and relationships

IDENTITY is table-column-local and generated during insert. SEQUENCE is an independent object that can be shared, requested before insertion, and configured with bounds/cache/cycle. Neither allocator rolls back consumed values with a failed transaction; neither promises gap-free numbering. Add a unique key for collisions. \`SCOPE_IDENTITY()\` is scope-aware; \`@@IDENTITY\` crosses triggers; IDENT_CURRENT is table-specific but session-agnostic and unsafe for predicting the next value ([identity functions](${urls.scopeIdentity})).

NEXT VALUE FOR assigns sequence values per row in defined statement contexts. OVER(ORDER BY) can impose assignment order in SELECT/INSERT...SELECT but not UPDATE/MERGE; it does not create commit order. CYCLE can reuse numbers; CACHE can lose unused values after failure; NO CACHE still cannot avoid unused reservations or rollback gaps ([NEXT VALUE FOR](${urls.nextValue})).

rowversion is an 8-byte database-wide counter value. Every update to a row containing it changes the token, even if a column is assigned its old value. A predicate using the prior token detects stale state; it does not supply a timestamp, order all transactions by commit, or remain stable enough for a primary key ([rowversion](${urls.rowversion})).

# Worked examples

\`\`\`sql
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
\`\`\`

The filtered index permits many NULL emails but prevents duplicate supplied emails. Balance is NOT NULL because CHECK alone accepts UNKNOWN/NULL. Identity supplies values, while the PK enforces uniqueness. For a stale-safe update, use \`WHERE UserId=@id AND Version=@version\` and require one affected row.

# Misconceptions and edge cases

- CHECK alone does not reject NULL.
- DEFAULT does not replace explicit NULL or update a value later.
- Identity/sequence are not gap-free business numbers.
- SCOPE_IDENTITY and @@IDENTITY differ when triggers insert identities.
- A rowversion is not time and changes on no-op UPDATE statements.
- A computed expression is not automatically indexable; deterministic/precision, SET options, and persistence matter.
- NOT ENFORCED constraints in Fabric are not equivalent to SQL Server enforced constraints; this course targets the SQL Server Database Engine.

# Knowledge checks with answers

1. **Why add NOT NULL beside CHECK (X > 0)?** Because NULL makes the CHECK UNKNOWN and is accepted.
2. **Why can a UNIQUE constraint reject the second NULL?** SQL Server treats NULL as a value for single-column uniqueness.
3. **When is a filtered unique index better?** When values must be unique only when populated and many rows may be absent.
4. **Does a rolled-back NEXT VALUE FOR call restore its number?** No.
5. **Which identity function stays in the caller’s scope?** SCOPE_IDENTITY.
6. **What does rowversion tell you?** Whether a row changed since a token was read, not when it changed.
7. **When can an imprecise computed expression be indexed?** When it is deterministic and PERSISTED, subject to type and SET rules.

# Sources

${sourceList}
`);

for (const group of manifest.inventory) {
  const rows = group.items.map(item => `| \`${item.replaceAll('|', '\\|')}\` | ${d[item]} ([source](${cite(item)})) |`).join('\n');
  await write(`reference-${group.id}`, `# ${title} — Reference: ${group.title}

# Scope and version

This reference targets SQL Server 2025 (17.x) Database Engine semantics, with SQL Server 2022 ledger/constraint notes explicitly versioned. Azure SQL and Fabric can differ; do not assume that a similarly named object enforces the same rules.

# How this group fits the mental model

The exact inventory table explains each supplied name and its correctness boundary. Choose a declarative invariant, verify existing data/trust, and deploy under an explicit migration plan.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
${rows}

# Cross-item comparison

PRIMARY KEY and UNIQUE both create unique enforcement, but only one primary key exists and its columns are NOT NULL. A UNIQUE constraint allows NULL but limits duplicates; filtered unique indexes express conditional uniqueness. CHECK handles row predicates, while FOREIGN KEY handles parent membership. DEFAULT handles omitted input and is independent of both.

# Examples

For an optional unique code, use a filtered unique index where the value is not NULL. For a parent relationship, define a foreign key to a unique key and consider an index on child columns. To restore trust after cleanup, use \`ALTER TABLE dbo.Child WITH CHECK CHECK CONSTRAINT FK_Child_Parent\` and verify catalog metadata.

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

${sourceList}
`);
}

const practice = `# ${title} — Exercises and worked solutions

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

1. Declare \`Quantity int NOT NULL CHECK (Quantity > 0)\`; the NOT NULL handles UNKNOWN from NULL.
2. \`CREATE UNIQUE INDEX UX_Account_Email ON dbo.Account(Email) WHERE Email IS NOT NULL;\` A single-column UNIQUE constraint would allow only one NULL.
3. Repair invalid rows, then run \`ALTER TABLE dbo.Child WITH CHECK CHECK CONSTRAINT FK_Child_Parent;\`. Verify is_disabled=0 and is_not_trusted=0 in sys.foreign_keys.
4. All non-NULL tuples must match a referenced candidate key. Decide whether any NULL component means “no relationship” or is forbidden; use NOT NULL if partial-null relationships are invalid. Define NO ACTION/CASCADE/SET NULL/SET DEFAULT explicitly.
5. Use \`ON DELETE SET NULL\` only if every FK component is nullable. Otherwise choose NO ACTION, CASCADE, or a valid SET DEFAULT policy that resolves to a real parent.
6. Use \`SCOPE_IDENTITY()\` in the same scope; \`@@IDENTITY\` may return the trigger’s insert and IDENT_CURRENT can be affected by another session. OUTPUT is preferable when multiple rows/columns are needed.
7. Allocators are not transactional: failed/rolled-back work and failures can leave gaps. Identity is table-bound; sequence is a shared object. Neither means gap-free numbering; use unique constraints for uniqueness.
8. Call \`sys.sp_sequence_get_range\` to reserve a batch; for ordered assignment in a SELECT/INSERT...SELECT use \`NEXT VALUE FOR seq OVER (ORDER BY ...)\`. The OVER form has no PARTITION BY and cannot be used in UPDATE/MERGE; unused values stay consumed.
9. Change to NO CYCLE or use a new nonoverlapping range, reconcile existing keys, and retain a UNIQUE/PRIMARY KEY. Cycling explicitly reuses values.
10. \`UPDATE dbo.Profile SET DisplayName=@name WHERE ProfileId=@id AND RowVersion=@original;\` Capture @@ROWCOUNT immediately; exactly one means matched version, zero indicates missing/stale. rowversion is binary, not time.
11. Add the nullable column/default first, backfill in controlled batches, validate, then make NOT NULL if required. WITH VALUES can populate existing rows when adding a nullable column with a default, but may write/lock/log the table; adding a default constraint alone affects future omitted values.
12. The expression must be deterministic and have an indexable result type. It must be precise or deterministic and PERSISTED if imprecise; required SET options apply to creation and DML sessions. Computed columns cannot be filtered-index predicate columns.
13. Use exactly one ROW START and ROW END datetime2 pair with matching precision, NOT NULL semantics, one PERIOD FOR SYSTEM_TIME, and a table primary key before enabling SYSTEM_VERSIONING.
14. SQL Server 2022 adds GENERATED ALWAYS AS TRANSACTION_ID START/END and SEQUENCE_NUMBER START/END. SQL Server assigns these metadata values; applications must not supply them.
15. SPARSE saves space for NULL-heavy columns but costs more for non-NULL retrieval/storage and has type/feature restrictions. A column set is one updatable XML view of sparse values and changes SELECT * shape; client projections should be explicit.

# Worked example

\`\`\`sql
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
\`\`\`

This separates requiredness, domain, optional uniqueness, generated value, and concurrency token instead of forcing one feature to imply another.

# Tests and edge cases

- Insert two rows with NULL email; both should succeed. Insert the same non-NULL email twice; the second insert should fail.
- Attempt \`INSERT\` with \`Quantity = NULL\`; NOT NULL rejects it even though the CHECK result would be UNKNOWN.
- Roll back an insert that requests an identity or sequence value; verify later values can contain a gap.
- Update a rowversion row without changing business values; the token still changes, so optimistic concurrency detects the write.
- Add a default to a populated table without a backfill; verify historical rows remain unchanged unless the chosen ALTER TABLE operation explicitly uses WITH VALUES.
- After enabling a constraint with validation, inspect \`sys.foreign_keys\` or \`sys.check_constraints\` for enabled and trusted state.

The assigned SQL Server references are [CHECK and UNIQUE semantics](${urls.uniqueCheck}), [ALTER TABLE validation](${urls.alterTable}), [sequence allocation](${urls.nextValue}), [rowversion](${urls.rowversion}), and [default values](${urls.default}).

# Progressive hints

1. Ask which rows the rule applies to and whether NULL is a valid state.
2. Ask whether values are allocated, unique, ordered, or gap-free; these are different properties.
3. Check the migration’s existing-row behavior and constraint trust.
4. For computed values, classify determinism, precision, persistence, result type, and SET options.
5. Identify which generated fields are writable by the engine only.

# Reflection questions

Which invariants should survive application bugs and concurrent sessions? Which generated values may have gaps? Which default changes future inserts, and which migration step updates old rows? What metadata would prove a constraint is both enabled and trusted?


# Sources

${sourceList}
`;
await write('practice', practice);

const interview = `# ${title} — Interview questions and reasoning

# Core questions

1. What does a PRIMARY KEY guarantee beyond UNIQUE?
2. Why do CHECK and NOT NULL solve different problems?
3. UNIQUE constraint versus filtered unique index?
4. Does a foreign key create a child-side index?
5. What does untrusted mean for an enabled constraint?
6. SET NULL versus SET DEFAULT versus CASCADE?
7. Why do identity values have gaps?
8. SCOPE_IDENTITY versus @@IDENTITY versus IDENT_CURRENT?
9. IDENTITY versus SEQUENCE?
10. Why is NEXT VALUE FOR not rolled back?
11. How does rowversion support optimistic concurrency?
12. When is a computed column indexable?
13. What does PERSISTED change?
14. What makes a temporal PERIOD valid?
15. Which generated columns distinguish ledger tables?

# Concise interview answers

1. PRIMARY KEY also requires NOT NULL and only one PK constraint is allowed per table; both enforce uniqueness.
2. CHECK accepts UNKNOWN, including NULL; NOT NULL explicitly rejects missing values.
3. UNIQUE applies across the constraint key and permits at most one NULL in a single nullable key; filtered unique index can allow many NULLs while enforcing present values.
4. No; create a child index based on workload.
5. Existing data was not validated, so future writes are checked but optimizer trust is unavailable.
6. CASCADE propagates delete/update, SET NULL requires nullable child columns, SET DEFAULT requires valid defaults, NO ACTION rejects referenced parent changes.
7. Failed/rolled-back allocations, concurrency and caching can consume numbers without committed rows.
8. SCOPE_IDENTITY is current scope; @@IDENTITY is current session across scopes; IDENT_CURRENT is one table across sessions/scopes.
9. IDENTITY belongs to one column and insert; SEQUENCE is a standalone shareable object that can be requested before insert.
10. Sequence allocation is outside transaction rollback by design.
11. Compare the originally read token in WHERE and require one affected row.
12. Deterministic and precise, or deterministic and persisted if imprecise, plus legal type and SET options.
13. It physically stores a deterministic computed value and maintains it as dependencies change.
14. Exactly one ROW START and ROW END datetime2 pair with aligned precision, plus a primary key and system versioning.
15. Transaction ID start/end and sequence number start/end columns generated by SQL Server 2022 ledger tables.

# Deep follow-up answers

A default is only an omitted-input rule. It does not replace NOT NULL, handle explicit NULL, or update an old row just because a new default was attached. Existing-row backfill is a separate migration with locking/logging and verification consequences ([ALTER TABLE](${urls.alterTable})).

Constraint trust is observable metadata. \`WITH NOCHECK\` skips validation, and \`ALTER TABLE ... CHECK CONSTRAINT\` can enable without restoring trust; use \`WITH CHECK CHECK\` after cleaning data. Check both enabled and trusted catalog flags. This matters to optimizer reasoning and deployment confidence ([ALTER TABLE constraints](${urls.tableConstraint})).

IDENTITY, SEQUENCE, GUID, and rowversion address different requirements. Identity/sequence allocate numbers but do not promise gap-free or commit-order values. GUIDs can be created across nodes but have index-locality tradeoffs. rowversion detects changes but is not time. Add the key/unique index that enforces identity and use the correct retrieval/concurrency mechanism ([identity](${urls.identity}), [sequence](${urls.sequence}), [rowversion](${urls.rowversion})).

# Scenario questions

**A legacy table contains rows that violate a new CHECK rule, but the deployment must not begin enforcing a partially understood rule.** Repair or quarantine invalid rows, then use validation while enabling the constraint; confirm it is enabled and trusted before relying on optimizer or integrity guarantees.

**A batch insert needs preallocated identifiers and a deterministic assignment to sorted input rows.** Use \`sys.sp_sequence_get_range\` for reservation when appropriate, and \`NEXT VALUE FOR ... OVER (ORDER BY ...)\` in supported SELECT/INSERT...SELECT contexts. Persist the input-to-value mapping; allocated values are not rolled back if later work fails.

**A web client submits an old profile version after another request has edited it.** Update with both primary key and original rowversion in the predicate and treat zero affected rows as a conflict requiring reload or merge.

# Tradeoffs and alternatives

Use UNIQUE or a filtered unique index for optional uniqueness; use a trigger only for invariants that cannot be expressed declaratively. Use identity for local surrogate values, sequence for shared/preallocated values, and application-generated GUIDs for disconnected creation. Use virtual computed columns unless persisted storage/indexing is justified. Temporal history tracks system time; ledger adds tamper-evidence and transaction metadata under a separate feature contract.

# Common weak answers

- “CHECK makes a value required.”
- “An identity column is automatically unique.”
- “NO CACHE makes sequence numbers gap-free.”
- “@@IDENTITY gives the row just inserted.”
- “rowversion is the row’s timestamp.”
- “Computed means stored.”
- “A DEFAULT constraint backfills every existing row.”
- “Enabled means trusted.”

# Self-check rubric

Score 0–2 for identity versus uniqueness; NULL/UNKNOWN; FK and referential actions; trust state; allocation and retrieval scopes; gap/cache/rollback semantics; concurrency token; computed-column index rules; and migration/backfill/temporal/ledger boundaries. Strong answers distinguish a feature’s allocation behavior from its enforced invariant.

# Sources

${sourceList}
`;
await write('interview', interview);

console.log(`Wrote ${manifest.inventory.length} exact-inventory references covering ${allItems.length} schema items plus overview, concepts, practice, and interview.`);
