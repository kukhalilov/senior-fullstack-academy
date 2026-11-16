import fs from 'node:fs/promises';

const manifestPath = 'curriculum/manifests/sql-server/t03-002.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const sql = 'https://learn.microsoft.com/en-us/sql/';
const U = {
  keys: sql + 'relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17',
  constraints: sql + 'relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17',
  alter: sql + 't-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17',
  null: sql + 't-sql/language-elements/null-and-unknown-transact-sql?view=sql-server-ver17',
  index: sql + 'relational-databases/indexes/create-unique-indexes?view=sql-server-ver17',
  types: sql + 't-sql/data-types/data-types-transact-sql?view=sql-server-ver17',
  numeric: sql + 't-sql/data-types/decimal-and-numeric-transact-sql?view=sql-server-ver17',
  money: sql + 't-sql/data-types/money-and-smallmoney-transact-sql?view=sql-server-ver17',
  strings: sql + 't-sql/data-types/char-and-varchar-transact-sql?view=sql-server-ver17',
  unicode: sql + 't-sql/data-types/nchar-and-nvarchar-transact-sql?view=sql-server-ver17',
  dates: sql + 't-sql/data-types/date-and-time-types?view=sql-server-ver17',
  datetime2: sql + 't-sql/data-types/datetime2-transact-sql?view=sql-server-ver17',
  datetimeoffset: sql + 't-sql/data-types/datetimeoffset-transact-sql?view=sql-server-ver17',
  rowversion: sql + 't-sql/data-types/rowversion-transact-sql?view=sql-server-ver17',
  precedence: sql + 't-sql/data-types/data-type-precedence-transact-sql?view=sql-server-ver17',
  cast: sql + 't-sql/functions/cast-and-convert-transact-sql?view=sql-server-ver17',
  trycast: sql + 't-sql/functions/try-cast-transact-sql?view=sql-server-ver17',
  collation: sql + 'relational-databases/collations/collation-and-unicode-support?view=sql-server-ver17',
  collate: sql + 't-sql/statements/collations?view=sql-server-ver17',
  json: sql + 't-sql/data-types/json-data-type?view=sql-server-ver17',
  jsonFeatures: sql + 'relational-databases/json/json-data-sql-server?view=sql-server-ver17',
  vector: sql + 't-sql/data-types/vector-data-type?view=sql-server-ver17',
  vectorSearch: sql + 't-sql/functions/vector-functions-transact-sql?view=sql-server-ver17',
  hierarchy: sql + 'relational-databases/hierarchical-data-sql-server?view=sql-server-ver17',
  legacyTypes: sql + 't-sql/data-types/string-and-binary-types?view=sql-server-ver17',
  sequence: sql + 't-sql/statements/create-sequence-transact-sql?view=sql-server-ver17',
  tableTypes: sql + 'relational-databases/tables/use-table-valued-parameters-database-engine?view=sql-server-ver17',
  aliasTypes: sql + 'relational-databases/user-defined-types/create-user-defined-data-types-database-engine?view=sql-server-ver17',
  spatial: sql + 'relational-databases/spatial/spatial-data-types-overview?view=sql-server-ver17',
  migration: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/expand-contract',
  temporal: sql + 'relational-databases/tables/temporal-tables?view=sql-server-ver17',
  computed: sql + 'relational-databases/tables/specify-computed-columns-in-a-table?view=sql-server-ver17',
  identity: sql + 't-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17',
  normalization: 'https://learn.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description'
};
const sourceUrls = [...new Set(Object.values(U))];
const addItems = (groupId, items) => {
  const group = manifest.inventory.find(value => value.id === groupId);
  group.items = [...new Set([...group.items, ...items])];
};
addItems('relational-facts-keys-and-normalization', [
  'Prime attribute', 'Nontrivial functional dependency', 'Lossless decomposition',
  'Dependency preservation', 'Multivalued dependency', 'Fourth normal form (4NF)',
  'Join dependency', 'Fifth normal form (5NF / project-join normal form)',
  'Sixth normal form (6NF)', 'Domain-key normal form (DKNF)',
  'Surrogate identifier generation with IDENTITY and SEQUENCE'
]);
addItems('constraints-and-null-semantics', [
  'ON DELETE SET DEFAULT', 'ON UPDATE NO ACTION', 'ON UPDATE CASCADE',
  'ON UPDATE SET NULL', 'ON UPDATE SET DEFAULT'
]);
addItems('sql-server-domain-types-and-collations', [
  'hierarchyid', 'vector(n, base_type)', 'text, ntext, and image legacy types',
  'sysname', 'table type and table-valued parameter boundary',
  'cursor type and column-storage boundary', 'Alias data type and CLR user-defined type',
  'timestamp deprecated synonym for rowversion'
]);
addItems('modeling-decisions-and-schema-evolution', [
  'IDENTITY property', 'SEQUENCE object', 'ON DELETE SET DEFAULT decision',
  'ON UPDATE CASCADE versus immutable key'
]);
manifest.sourceSnapshot = {
  authority: 'Microsoft SQL Server 2025 relational design, constraints, data types, temporal modeling, and T-SQL documentation',
  edition: 'SQL Server 2025 (17.x) modeling and type surface checked 2026-11-16',
  checkedAt: '2026-11-16',
  urls: sourceUrls
};
manifest.comparisonSources = [...new Set([...manifest.comparisonSources, ...sourceUrls])];
manifest.versionNotes[0].items = [
  'The SQL Server 2025 (17.x) native json data type and JSON indexes are generally available in SQL Server 2025; JSON functions predate this type and can also operate on text columns. The json type stores documents in a binary format, is available under all compatibility levels, and has explicit conversion and index-key limitations.',
  'A varchar(n) declaration counts bytes, not characters. SQL Server 2019 and later UTF-8 collations allow varchar/char to represent Unicode using UTF-8, so the number of characters that fit can vary by encoded byte length.',
  'SQL Server 2025 vector data type and vector functions are generally available. Vector indexes and VECTOR_SEARCH are preview in the SQL Server 2025 Database Engine; float16 vectors also remain preview for boxed SQL Server 2025. Do not carry Azure SQL availability status over to boxed SQL Server.'
];
manifest.versionNotes[0].sourceUrls = [U.json, U.jsonFeatures, U.strings, U.vector, U.vectorSearch];
manifest.accuracyFacts = [
  'In SQL Server, CHECK rejects FALSE but accepts UNKNOWN, so a nullable column can pass a CHECK; add NOT NULL when requiredness is part of the rule.',
  'SQL Server UNIQUE treats NULL as a key value and permits at most one NULL in a single-column nullable unique key; a filtered unique index can enforce uniqueness only for present values.',
  'SQL Server foreign-key and CHECK constraints are not deferred until transaction commit; WITH NOCHECK can leave an enabled constraint untrusted for existing rows.',
  'SQL Server 2025 native json type and JSON indexes are generally available. JSON functions predate the native type; a JSON column is not a standard index key and conversion out to character/binary types must be explicit.',
  'SQL Server 2025 vector data type and vector functions are GA, while vector indexes and VECTOR_SEARCH remain Preview in the boxed SQL Server 2025 engine; float16 vectors are also Preview there.',
  'SQL Server varchar(n) capacity is measured in bytes; UTF-8 collations allow Unicode in varchar, but multibyte characters consume more than one byte.',
  'datetimeoffset stores and preserves a numeric offset while SQL Server compares values in UTC; it does not preserve a named time zone or its DST rule history.',
  'rowversion is an automatically generated 8-byte database counter for change detection, not a date or time.',
  'IDENTITY and SEQUENCE values can have gaps and do not guarantee business chronology or commit order; IDENTITY does not enforce uniqueness without a key/unique constraint.',
  'float and real are approximate numeric types; decimal/numeric are exact fixed-precision types with precision/scale arithmetic and overflow considerations.',
  'SQL Server documentation warns that money/smallmoney calculations can encounter rounding or truncation issues; decimal is recommended when used in calculations.',
  'System-versioned temporal history records database system-time row versions and is not automatically business-valid-time history or a tamper-proof audit trail.',
  'An enabled but untrusted foreign-key or CHECK constraint may enforce future writes while old data has not been verified; trust requires validation of existing rows.',
  'The hierarchyid type encodes a node position but does not automatically enforce a valid tree or parent-child existence.',
  'Legacy text, ntext, and image types are deprecated and documented for removal in a future SQL Server version; new development should use max types as appropriate.',
  'A table-valued parameter uses a user-defined table type and is READONLY; table and cursor types are not ordinary scalar column types.'
];
manifest.sourceSnapshot.edition = 'SQL Server 2025 (17.x) relational modeling and type surface checked 2026-11-16';
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const groups = Object.fromEntries(manifest.inventory.map(group => [group.id, group.items]));
const D = {
  'Relation (table)': 'A relation is a set of tuples described by attributes; a SQL Server table is the practical storage object, with SQL details such as duplicate rows and physical indexes that are not part of the pure mathematical definition.',
  'Tuple (row)': 'A tuple is one record containing a value for each attribute, subject to nullability and constraints. A row has no guaranteed order; identity requires a key rather than its current physical position.',
  'Attribute (column)': 'An attribute describes one kind of fact for rows in a relation. Its type, nullability, collation, and constraints define which values it can represent and how they compare.',
  'Entity': 'An entity is a distinguishable thing about which the system stores facts, such as a customer or invoice. Decide what makes two real-world instances the same before choosing its key.',
  'Relationship': 'A relationship expresses an association between entity instances. A foreign key or junction table turns that conceptual association into enforceable relational structure.',
  'Entity integrity': 'Entity integrity requires each row to be identifiable; a SQL Server PRIMARY KEY enforces uniqueness and non-null values for its key columns.',
  'Domain integrity': 'Domain integrity restricts a column to values in its intended domain through its type, nullability, defaults, and constraints such as CHECK.',
  'Candidate key': 'A minimal set of attributes that uniquely identifies every row is a candidate key. “Minimal” means removing any member would lose uniqueness.',
  'Superkey': 'Any attribute set that uniquely identifies rows is a superkey; it may contain unnecessary columns. A candidate key is a minimal superkey.',
  'Primary key': 'The candidate key selected as the table’s principal identifier. SQL Server enforces one PRIMARY KEY constraint per table; a composite primary key may contain multiple columns.',
  'Alternate key': 'A candidate key not chosen as the primary key. If it must stay unique, enforce it with a UNIQUE constraint rather than relying on application checks.',
  'Composite key': 'A key formed from two or more columns. Uniqueness applies to the entire tuple, not to each component separately; order and nullability affect referencing/index design.',
  'Natural key': 'A key drawn from domain data, such as an externally assigned code. It can avoid a meaningless identifier but may change, be reused, have privacy implications, or have poor width.',
  'Surrogate key': 'An identifier introduced for database identity rather than business meaning, often an integer or GUID. It simplifies references but does not replace UNIQUE constraints on real business keys.',
  'Foreign key': 'A constraint requiring child key values to match a referenced primary or unique key, except that nullable foreign-key values can represent no referenced row. It protects the relationship at write time.',
  'Referential integrity': 'The invariant that each non-null reference points to a valid parent key, maintained by foreign keys and their configured delete/update actions.',
  'Functional dependency': 'X functionally determines Y when any two valid rows equal on X must also equal on Y. Dependencies reveal which facts belong to which key and where duplication creates anomalies.',
  'Full functional dependency': 'A dependency on an entire composite determinant where no proper subset is sufficient. In 2NF, non-key attributes should depend on the whole candidate key, not just part of it.',
  'Partial dependency': 'A non-key attribute depends on only part of a composite candidate key. It can duplicate a fact across rows and is the specific dependency 2NF removes.',
  'Transitive dependency': 'A non-key attribute depends on another non-key attribute through the key. In the usual 3NF teaching pattern, splitting that determinant prevents repeated facts and update anomalies.',
  'First normal form (1NF)': 'A practical 1NF design uses columns with values from declared domains and avoids repeating groups or comma-packed multi-valued fields. It does not itself guarantee good keys or eliminate all anomalies.',
  'Second normal form (2NF)': 'A relation is in 2NF when it is in 1NF and every non-key attribute depends on the whole of every candidate key, not a proper subset. This is chiefly relevant to composite keys.',
  'Third normal form (3NF)': 'A relation is in 3NF when it is in 2NF and non-key facts do not depend transitively on candidate keys; formally, each nontrivial FD X→A has X a superkey or A prime.',
  'Boyce-Codd normal form (BCNF)': 'BCNF requires every nontrivial functional dependency determinant to be a superkey. It is stricter than 3NF and decompositions may trade dependency preservation for stronger redundancy control.',
  'Normalization': 'Normalization decomposes relations according to dependencies so each fact has an appropriate home. It reduces anomalies but does not automatically produce ideal performance or eliminate every valid redundancy.',
  'Denormalization': 'Denormalization intentionally stores derived or repeated facts to serve measured access needs. It requires an authority and synchronization rule so updates cannot leave conflicting copies.',
  'Update anomaly': 'An update anomaly occurs when one fact is duplicated across rows and only some copies change, leaving contradictions. Store that fact once or maintain copies transactionally.',
  'Insertion anomaly': 'An insertion anomaly means a fact cannot be recorded without inventing an unrelated fact or creating an incomplete row. Separating independent entities usually removes the coupling.',
  'Deletion anomaly': 'A deletion anomaly occurs when removing one fact unintentionally removes the only stored copy of another fact. Separate entity facts and define dependent-row deletion deliberately.',
  'Junction (associative) table': 'A junction table represents a many-to-many relationship with one row per pair or association. Put relationship attributes there and enforce the intended pair uniqueness with a key/constraint.',
  'Identifying relationship': 'A relationship is identifying when the parent key participates in the child’s primary key, so child identity depends on its parent, as with an order line keyed by order plus line number.',
  'Non-identifying relationship': 'A non-identifying relationship references a parent while the child keeps an independent primary key. The FK establishes association without forming part of child identity.',
  'One-to-one relationship': 'A one-to-one relationship is implemented by a foreign key made unique on one side; choose the side based on optionality, lifecycle, access, and whether the facts share ownership.',
  'One-to-many relationship': 'A one-to-many relationship places the parent key as a foreign key in the many-side table. Nullability determines whether a child may be unassociated.',
  'Many-to-many relationship': 'A many-to-many relationship uses a junction relation with foreign keys to both parents. Add a composite uniqueness rule unless repeated associations are valid domain events.',
  'Weak entity': 'A weak entity cannot be identified independently in the domain and uses its owner’s key plus a partial key, commonly implemented by an identifying composite primary key and cascading lifecycle policy.',
  'Temporal data modeling': 'Temporal modeling distinguishes event/effective time from when data is recorded. Choose whether to retain history, correct past facts, or reconstruct state; SQL Server system-versioned temporal tables automate row history but do not replace business-valid-time rules.',
  'Soft-delete column modeling': 'Soft delete marks a row inactive instead of physically removing it. It affects uniqueness, foreign keys, query filters, retention, and privacy erasure; define how deleted rows participate in each invariant.',
  'NOT NULL constraint': 'Prevents the column from storing the SQL NULL marker. It does not prevent empty strings, zero, or default values, so pair it with suitable domain checks when those are invalid.',
  'PRIMARY KEY constraint': 'Declares a table’s chosen unique, non-null key and creates a supporting unique index. SQL Server permits one primary-key constraint per table, though the key may be composite.',
  'UNIQUE constraint': 'Declares that one column or a column combination cannot repeat, while allowing NULL subject to SQL Server’s unique-key rule. SQL Server creates a unique index to enforce it.',
  'FOREIGN KEY constraint': 'Declares a child-to-parent key relationship. Referenced columns must be a primary/unique key, and the FK columns must have compatible types; null child keys do not reference a parent.',
  'CHECK constraint': 'Rejects a row when its Boolean condition is FALSE. UNKNOWN passes, so CHECK alone does not make a nullable value required; combine with NOT NULL when needed.',
  'DEFAULT constraint': 'Supplies an expression when an INSERT omits the column or uses DEFAULT. It does not replace a constraint and does not generally overwrite an explicitly supplied NULL.',
  'Constraint naming': 'Explicit stable names make migrations, diagnostics, and deployments predictable. Unnamed constraints receive generated names that are awkward to reference consistently.',
  'Composite UNIQUE constraint': 'Enforces uniqueness of the combined key tuple. It does not imply uniqueness of any one component; SQL Server also treats repeated NULL-containing key combinations as duplicate index keys.',
  'Filtered unique index as partial uniqueness': 'A unique index with WHERE predicate enforces uniqueness only for included rows, such as one active email per tenant. It is an index rather than a UNIQUE constraint and its filter must match the invariant.',
  'ON DELETE NO ACTION': 'The parent deletion fails if referencing rows remain. SQL Server’s default referential action is NO ACTION; it is not a deferred check.',
  'ON DELETE CASCADE': 'Deleting a parent deletes its referencing child rows as part of the same referential action. Use only when child lifecycle is truly owned by the parent and review cascade paths/trigger restrictions.',
  'ON DELETE SET NULL': 'Deleting a parent sets its child FK columns to NULL. Every affected FK column must be nullable, and the resulting unassociated child must make domain sense.',
  'ON UPDATE referential action': 'SQL Server foreign keys can use NO ACTION, CASCADE, SET NULL, or SET DEFAULT when a referenced key changes, subject to restrictions. Stable surrogate keys usually avoid needing mutable-key cascades.',
  'Constraint enforcement': 'The engine checks enabled constraints during relevant writes, making the invariant apply across clients and concurrent writers. Constraint validity depends on the constraint being enabled and trusted as appropriate.',
  'Trusted constraint': 'A trusted FK/CHECK has been validated against existing data, so the optimizer can rely on it. Trust is separate from being enabled for future writes.',
  'Untrusted constraint': 'An enabled but untrusted FK/CHECK is enforced for new or modified rows but existing data was not verified, so the optimizer cannot assume every old row complies.',
  'WITH CHECK': 'When adding or re-enabling a constraint, WITH CHECK validates existing rows and establishes trust if successful. It may fail on legacy violations and require remediation first.',
  'WITH NOCHECK': 'Disables validation of existing rows when adding/enabling a constraint and can leave it untrusted. It is a controlled migration escape hatch, not proof that the data is valid.',
  'Nullable column': 'A nullable column permits a NULL marker in addition to values from its type. Decide what NULL means and how predicates, uniqueness, defaults, and application serialization treat it.',
  'NULL marker': 'SQL NULL represents an absent/unknown/not-applicable value according to the model. It is not a regular value and ordinary equality does not test it.',
  'Three-valued predicate logic': 'SQL predicates can be TRUE, FALSE, or UNKNOWN when NULL participates. WHERE and CHECK have different practical outcomes: WHERE retains TRUE only, while CHECK rejects FALSE and therefore accepts UNKNOWN.',
  'IS NULL predicate': 'Tests whether an expression is the SQL NULL marker. Use it instead of `= NULL`; it yields TRUE or FALSE rather than UNKNOWN.',
  'IS NOT NULL predicate': 'Tests whether an expression has a non-NULL value. It does not establish that the value is nonempty or valid for the domain.',
  'NULL is not equal to NULL': 'Under SQL Server’s ordinary comparison semantics, `NULL = NULL` evaluates UNKNOWN rather than TRUE. Use IS NULL to test the marker; set operators and grouping have their own documented treatment.',
  'NULL versus zero': 'Zero is a known numeric value; NULL is missing/unknown/not-applicable. Replacing one with the other changes arithmetic, aggregates, filtering, and business meaning.',
  'NULL versus empty string': 'An empty string is a known text value of length zero, whereas NULL indicates no value. Keep them distinct unless the domain explicitly normalizes them.',
  'NULL versus absent relationship': 'A nullable FK can represent no associated parent, but only if the relationship is optional. Do not use unrelated sentinel parent rows or empty keys to disguise absence.',
  'COALESCE null handling': 'Returns the first non-NULL argument, with result type determined by data-type precedence. Replacing NULL with a default can collapse distinct states and may cause implicit conversion.',
  'NULLIF null handling': 'Returns NULL when its two expressions compare equal; otherwise returns the first expression. It is often used to turn a sentinel such as zero into NULL before division, but data type and divide-by-zero handling still matter.',
  'Unique constraint and multiple NULL behavior boundary': 'SQL Server treats NULL as a key value for UNIQUE enforcement: a single-column unique key permits at most one NULL. For composite keys, duplicate full key tuples that contain NULL are likewise disallowed; use a filtered unique index when the intended rule is uniqueness only for present values. [Unique indexes](' + U.index + ')',
  'Deferred constraint checking (provider-specific distinction)': 'SQL Server checks these constraints as part of each statement and does not expose deferrable FK/UNIQUE constraints that wait until COMMIT. Design multi-step writes accordingly; another engine’s deferral behavior cannot be assumed here.',
  'bit': 'Stores 0, 1, or NULL when nullable. SQL Server converts numeric values to 0/1, with nonzero becoming 1; do not treat it as a general integer counter.',
  'tinyint': 'Unsigned 1-byte integer from 0 through 255. Choose it only when that narrow domain is a real invariant, not merely to save a small amount of storage.',
  'smallint': 'Signed 2-byte integer with range −32,768 through 32,767. Its range is a domain decision and overflow still matters in expressions/conversions.',
  'int': 'Signed 4-byte integer from −2,147,483,648 through 2,147,483,647. It is a common key/count type, but arithmetic can overflow and identity generation does not expand its range.',
  'bigint': 'Signed 8-byte integer with a much wider range than int. Use when expected cardinality or arithmetic requires it; wider keys increase index and foreign-key footprint.',
  'decimal(p,s)': 'Exact fixed-precision decimal with total precision p (maximum 38) and scale s fractional digits. Choose enough integer and fractional capacity; arithmetic result precision/scale rules can reduce scale or overflow.',
  'numeric(p,s)': 'A synonym for decimal(p,s) in SQL Server; the two are functionally equivalent. Precision and scale describe distinct declared type shapes.',
  'money': 'Fixed-scale monetary numeric type with four fractional digits and a broad range, but Microsoft warns of rounding/truncation risk in calculations. Prefer appropriately sized decimal for calculation-heavy financial amounts; currency code remains separate.',
  'smallmoney': 'Smaller-range fixed-scale monetary type with four fractional digits. Range and conversion behavior constrain it, and it has the same calculation caution as money.',
  'real': 'Approximate single-precision floating-point type. Many decimal fractions are not represented exactly; use for measured scientific values when approximate error is acceptable, not exact accounting.',
  'float(n)': 'Approximate floating-point type whose n selects precision class, not decimal digits after the point. It cannot guarantee exact decimal equality or arithmetic.',
  'char(n)': 'Fixed-length character storage, padded to declared length; n is bytes, not necessarily characters, particularly with multibyte encodings. Use for genuinely fixed-width domains.',
  'varchar(n)': 'Variable-length non-Unicode-by-default character data limited by bytes. Under UTF-8 collations it can encode Unicode and a character may consume multiple bytes, so n is not a character count. [char/varchar](' + U.strings + ')',
  'varchar(max)': 'Large-value variable-length character data up to the SQL Server limit. It can have different row/off-row and indexing behavior; use a bounded size when a domain has a meaningful maximum.',
  'nchar(n)': 'Fixed-length Unicode character data using UTF-16 storage semantics and padding. n is byte-pair units (byte-pairs), not a universal count of user-perceived grapheme characters.',
  'nvarchar(n)': 'Variable-length Unicode text with n measured in byte-pairs; supplementary characters can occupy two byte-pairs. Select limits carefully and distinguish code units from displayed characters.',
  'nvarchar(max)': 'Large-value Unicode text up to the SQL Server limit. Suitable for genuinely large documents/text, but not a default for every column because it changes indexing and storage options.',
  'binary(n)': 'Fixed-length binary data padded to n bytes. Useful for fixed-size hashes or protocol fields when their exact length is enforced.',
  'varbinary(n)': 'Variable-length binary data with an n-byte maximum. Use for bounded arbitrary bytes, hashes, or encoded payloads; do not confuse binary values with textual hex representations.',
  'varbinary(max)': 'Large-value variable-length binary data, up to the SQL Server limit, for large byte payloads. Streaming/API and backup/storage concerns may make external object storage preferable.',
  'uniqueidentifier': 'A 16-byte GUID value, commonly generated with NEWID or NEWSEQUENTIALID. Random GUID key ordering can fragment indexes; it is not a guarantee of globally coordinated business identity.',
  'date': 'Calendar date without time or offset, with a range from year 1 through 9999. It is not a timestamp and has day-level resolution.',
  'time(p)': 'Time of day without date or time-zone offset; p controls fractional precision from 0 to 7. It cannot identify a unique instant without date and zone context.',
  'smalldatetime': 'Legacy date/time type limited to 1900–2079 and minute accuracy; seconds are rounded. Prefer date/time types with required precision/range for new schemas.',
  'datetime': 'Legacy date/time type with 1753 lower bound and approximately 3.33 ms increments. Literal rounding and restricted range make datetime2 preferable for most new designs.',
  'datetime2(p)': 'Date plus time with range year 1–9999 and precision 0–7 (100 ns at p=7), but no offset or time-zone identity. Use a documented UTC convention for instants when offset is not stored. [datetime2](' + U.datetime2 + ')',
  'datetimeoffset(p)': 'Date/time plus numeric UTC offset, precision 0–7. SQL Server compares, sorts, and indexes values in UTC while preserving the supplied offset; it does not preserve a named zone or future DST rules. [datetimeoffset](' + U.datetimeoffset + ')',
  'rowversion': 'An automatically generated 8-byte database counter value for change detection, not a date/time. Updates change it, even when assigned values are unchanged; do not use it as a business timestamp or assume wall-clock chronology. [rowversion](' + U.rowversion + ')',
  'sql_variant': 'A value container for many supported SQL Server scalar types, retaining base-type metadata. It has strict restrictions and awkward comparison/conversion behavior; a regular typed column is clearer for stable domains.',
  'xml': 'SQL Server’s XML type stores XML instances, optionally bound to an XML schema collection for validation. It supports XML methods and indexing, but is distinct from text containing XML.',
  'json data type in SQL Server 2025': 'Native JSON storage introduced in SQL Server 2025 (17.x), generally available in SQL Server 2025 and supported Azure SQL offerings. It stores binary JSON, while JSON functions existed earlier for text; standard indexes cannot use a JSON column as a key, and conversion out to character/binary types must be explicit. [JSON type](' + U.json + ')',
  'spatial data types geography and geometry': '`geometry` models planar Euclidean space; `geography` models round-earth geographic coordinates. SRID, coordinate order, units, valid shapes, and spatial indexes affect correctness; choose based on the coordinate system, not names alone. [Spatial overview](' + U.spatial + ')',
  'Data type precedence': 'When an expression combines different types, SQL Server generally converts the lower-precedence type to the higher-precedence type if conversion is supported. This can change comparison semantics, fail on bad values, or apply a conversion to an indexed column. [Precedence](' + U.precedence + ')',
  'Implicit conversion': 'An automatic conversion SQL Server applies where an operation requires compatible types. It can round, fail, change semantics, or harm index use; align parameter and column types rather than depending on coercion.',
  'Explicit CAST conversion': '`CAST(expression AS type)` requests a conversion explicitly. Choose target length/precision and understand rounding, truncation, overflow, style, and error behavior. [CAST and CONVERT](' + U.cast + ')',
  'TRY_CAST': 'Attempts a conversion and returns NULL for a failed permitted conversion rather than raising that conversion error. It does not make every conversion permitted, and NULL then needs to be distinguished from a source NULL. [TRY_CAST](' + U.trycast + ')',
  'Collation': 'A collation controls string comparison and sorting rules and, for non-Unicode char/varchar, encoding/code page. Server/database/column/expression collations can differ and trigger conflict or conversion behavior. [Collation](' + U.collation + ')',
  'Case sensitivity': 'A collation option controlling whether letter case affects equality and ordering. Case-insensitive comparisons can consider differently cased identifiers equal; do not infer this from application-language comparison rules.',
  'Accent sensitivity': 'A collation option controlling whether accented and unaccented forms compare distinctly. It can affect uniqueness, searching, and ordering, not just display.',
  'Unicode string storage': 'Unicode text can use nchar/nvarchar UTF-16 semantics, or char/varchar with a UTF-8-enabled collation on SQL Server 2019+. Encoded-byte capacity, supplementary characters, and collation still matter. [Unicode support](' + U.collation + ')',
  'String length versus byte length': 'SQL Server declarations and functions differ in what “length” measures: varchar(n) limits bytes, nvarchar(n) limits byte-pairs, and LEN excludes trailing spaces while DATALENGTH returns bytes. Test multibyte/supplementary values explicitly.',
  'Precision and scale': 'For decimal, precision is total significant digits and scale is digits to the right of the decimal. SQL Server derives result precision/scale for arithmetic; conversions and `ARITHABORT` affect overflow handling. [Precision/scale](' + U.numeric + ')',
  'Floating-point approximation': 'Binary floating-point represents a finite set of values, so common decimal fractions may be approximations. Equality, aggregation, and rounding can surprise; use decimal for exact decimal domains and specify a tolerance for approximate measurement.',
  'SARGable type alignment': 'Keep predicate parameter and column types aligned so the optimizer can compare/index-seek the stored representation without converting the indexed column. A seek is not guaranteed, but avoid needless implicit conversion on the column side.',
  'datetimeoffset UTC offset preservation boundary': 'The stored numeric offset is preserved and comparisons normalize to UTC, but an offset like `-05:00` is not the named zone `America/New_York`; it cannot encode the zone’s historical/future DST rules. Retain a zone identifier separately when that rule is domain data. [datetimeoffset](' + U.datetimeoffset + ')',
  'Required attribute': 'A required attribute is enforced with NOT NULL and, if needed, domain constraints. Application validation alone cannot protect against alternate writers, races, or migration mistakes.',
  'Optional attribute': 'An optional attribute permits NULL because the fact may be absent or not applicable. Define each meaningful absence state; use separate columns/status when “unknown”, “not yet supplied”, and “not applicable” differ.',
  'Value object': 'A value object is a domain concept defined by its values rather than independent identity, such as a money amount with currency. In relational storage it may be columns in an owning row or a child relation when lifecycle/query needs justify it.',
  'Entity identity': 'Entity identity is the rule that distinguishes one entity instance over time. A primary key implements a database identifier, while natural-key uniqueness and lifecycle policy express business identity.',
  'Aggregate boundary': 'An aggregate boundary groups facts whose invariants should be changed together by one application operation. It informs ownership and transaction design but is not automatically a database transaction or a reason to denormalize.',
  'One-to-one foreign-key placement': 'Put the FK on the side whose existence depends on or is optional relative to the other; enforce one-to-one with UNIQUE. If both sides are mandatory, SQL constraints alone may not enforce simultaneous existence without additional design.',
  'One-to-many foreign-key placement': 'Put the FK on the many-side table, referencing the one-side candidate key. Make it NOT NULL when every child must have a parent; index it according to joins/deletes and workload.',
  'Many-to-many junction-table design': 'Create one row per association, include both FKs and relationship attributes, and enforce pair uniqueness if duplicates have no meaning. Choose cascade behavior and whether associations have their own identity.',
  'Composite foreign key': 'References multiple columns of a matching unique/primary key and enforces the tuple relationship. Column count, order, type compatibility, and NULL behavior must align on both sides.',
  'Natural-key mutability risk': 'Domain identifiers can be corrected, reissued, reformatted, or change ownership. If referenced widely, updates are costly and can break integrations; retain a stable surrogate while enforcing current business-key rules separately.',
  'Surrogate-key tradeoff': 'Surrogate keys make references independent of changing business labels but add a column and do not guarantee meaningful uniqueness. Keep a separate unique constraint on the intended natural identifier.',
  'Cascade delete decision': 'Use cascading delete only when child records truly have no independent lifecycle and deletion is authorized as a whole aggregate. Audit cascade paths, triggers, volume, retention, and accidental parent deletes.',
  'Restrict delete decision': 'NO ACTION blocks parent deletion while dependent rows exist. It protects retained history but requires an explicit child/archive/reassignment workflow; SQL Server checking is immediate, not deferred.',
  'Check constraint versus application validation': 'A CHECK constraint protects the invariant for all writers and concurrent requests; application validation provides clearer user feedback and richer context. Use both for different purposes, while keeping the database rule authoritative.',
  'Computed versus stored fact': 'A computed value is derived from other attributes; persisting a second manually updated copy creates drift risk. SQL Server computed columns may be persisted/indexed only under determinism and SET-option conditions; otherwise calculate in queries or maintain explicit history.',
  'Audit columns': 'Created/updated identity and time columns help answer who/when metadata questions but do not form a tamper-proof audit trail. Define actor source, UTC policy, update path, and whether full change history is required.',
  'Created-at timestamp': 'Store creation time with a clear clock/UTC convention and choose datetime2 or datetimeoffset based on whether only a UTC instant or the original numeric offset matters. A default alone does not prevent later edits.',
  'Updated-at timestamp': 'Define which changes update the field and whether updates are database- or application-owned. It is not supplied automatically by an ordinary column default on every update.',
  'Soft delete versus physical delete': 'Soft deletion preserves a row for recovery/history but complicates uniqueness, every query, FK lifecycle, and retention. Physical deletion removes active data; regulated retention/erasure policies may require both purge and evidence handling.',
  'Schema migration compatibility': 'A compatible migration lets old and new application versions coexist during rollout. Separate additive changes, backfills, constraint validation, cutover, and cleanup so deployment ordering is safe.',
  'Expand-and-contract schema change': 'First add a backward-compatible representation, deploy code that can work with both, backfill, switch reads/writes, then remove the old shape after all clients have moved. It avoids requiring an all-at-once deployment. [Pattern](' + U.migration + ')',
  'Backfill existing rows': 'Populate new columns in controlled batches with resumable progress, idempotency, throttling, and validation. A default does not necessarily rewrite existing rows the way the application expects.',
  'Default value during migration': 'A default can make inserts from old code continue to work, but a fabricated value may misrepresent historical facts. Backfill intentionally and remove temporary defaults if they encode migration convenience rather than domain truth.',
  'Data classification': 'Classify fields by sensitivity, purpose, and handling requirements before choosing access, encryption, logging, and retention. Classification is governance metadata, not a SQL type or an access control by itself.',
  'Retention policy': 'Defines how long facts remain and how they are archived or erased. Align retention with foreign keys, backups, temporal history, legal holds, and soft-delete behavior.',
  'Tenant key in relational schema': 'Include tenant ownership in keys/relationships when it is part of the invariant, and enforce that child rows cannot point across tenants. Application predicates alone are a weak isolation boundary.',
  'Unique constraint scoped by tenant': 'Use a composite unique key such as `(TenantId, EmailKey)` when the value must be unique only within one tenant. Normalize/canonicalize the key deliberately and decide how NULL/deleted rows participate.',
  'Collation choice for identifiers': 'Choose case/accent/width/Unicode comparison according to identifier rules before adding unique constraints. A collation affects both equality and sort semantics; changing it later can reveal duplicates.',
  'Deterministic ordering key modeling': 'If an application must page or replay rows deterministically, identify a unique tie-breaker and model it explicitly. A timestamp alone can collide; uniqueness and transaction consistency are separate guarantees.',
  'Temporal table modeling': 'System-versioned temporal tables maintain current and history rows with system period timestamps for database-time history. This is not automatically business-valid time, an audit identity trail, or a substitute for retention/security policy. [Temporal tables](' + U.temporal + ')',
  'Prime attribute': 'An attribute is prime when it belongs to at least one candidate key. The formal 3NF condition permits a non-superkey determinant for a dependency when the dependent attribute is prime.',
  'Nontrivial functional dependency': 'An FD X→Y is trivial when Y is a subset of X; otherwise it is nontrivial. Normal-form conditions focus on nontrivial dependencies because trivial ones follow from set inclusion.',
  'Lossless decomposition': 'A decomposition is lossless when joining its projections reconstructs exactly the original relation for every legal state, without spurious tuples or lost tuples. A split that merely looks normalized is not enough.',
  'Dependency preservation': 'A decomposition preserves dependencies when the original functional constraints can be checked on the decomposed relations without joining them back together. A design can be lossless yet fail to preserve every dependency locally.',
  'Multivalued dependency': 'X↠Y states that, for a given X, the set of Y values is independent of the remaining attributes. Independent multi-valued facts stored together create combinatorial duplication.',
  'Fourth normal form (4NF)': 'A relation is in 4NF when every nontrivial multivalued dependency has a superkey determinant. It separates independent multi-valued facts that ordinary FD-based 3NF/BCNF can miss.',
  'Join dependency': 'A join dependency says a relation is exactly reconstructible by joining several projections. It generalizes multivalued dependency and motivates the rare, higher-order 5NF decomposition.',
  'Fifth normal form (5NF / project-join normal form)': '5NF requires every nontrivial join dependency to be implied by candidate keys. It is specialized; decompose only when the business constraints justify the join reconstruction, not as a ritual.',
  'Sixth normal form (6NF)': 'A relation is in 6NF when it has no nontrivial join dependencies; equivalently, it cannot be further losslessly decomposed except into trivial projections. It is mainly useful in specialized temporal designs and can greatly increase relation count.',
  'Domain-key normal form (DKNF)': 'DKNF is an ideal in which every constraint follows solely from domain constraints and key constraints. It is useful as a design goal but is not always achievable without awkward schemas or procedural enforcement.',
  'Surrogate identifier generation with IDENTITY and SEQUENCE': 'IDENTITY generates values as rows are inserted into one table; SEQUENCE is a separately defined object that can allocate values to multiple consumers. Both can have gaps and neither guarantees commit order or business chronology. [IDENTITY](' + U.identity + ') [SEQUENCE](' + U.sequence + ')',
  'ON DELETE SET DEFAULT': 'On parent deletion, SQL Server assigns each child FK column its defined default (or NULL if nullable and no explicit default); the resulting value must still satisfy referential integrity, usually by referencing a valid default parent. [FK actions](' + U.keys + ')',
  'ON UPDATE NO ACTION': 'Changing a referenced parent key fails while dependent FK rows remain; SQL Server checks immediately as part of the statement. This is the default action.',
  'ON UPDATE CASCADE': 'Changing a parent key propagates the new value to referencing FK rows, subject to SQL Server trigger and cascade-path restrictions. Prefer stable identifiers when key mutation is not a domain operation. [FK actions](' + U.keys + ')',
  'ON UPDATE SET NULL': 'Changing a referenced key sets dependent FK columns to NULL. Every FK column must be nullable and the resulting unassociated row must be meaningful.',
  'ON UPDATE SET DEFAULT': 'Changing a referenced key sets dependent FK columns to their defaults; each default must satisfy the FK by resolving to a valid referenced row. [FK actions](' + U.keys + ')',
  'hierarchyid': 'A variable-length system type encoding one node’s position/path in a tree. It sorts in depth-first order, but does not itself enforce parent-child existence or generate a consistent tree; application logic and constraints must preserve that structure. [Hierarchical data](' + U.hierarchy + ')',
  'vector(n, base_type)': 'SQL Server 2025 vector stores a fixed-dimension numeric vector, exposed as a JSON-array representation but stored in optimized binary form. The default base type is float32 (maximum 1,998 dimensions); float16 supports up to 3,996 dimensions but is Preview in boxed SQL Server 2025. The type and vector functions are GA there, whereas vector indexes and VECTOR_SEARCH are Preview and require PREVIEW_FEATURES. Azure offering status differs. [Vector type](' + U.vector + ') [Vector function availability](' + U.vectorSearch + ')',
  'text, ntext, and image legacy types': 'Deprecated legacy large-value types for character/binary data; Microsoft says they will be removed in a future SQL Server version. Do not use for new schemas; migrate to varchar(max), nvarchar(max), or varbinary(max) with application behavior checked. [Legacy types](' + U.legacyTypes + ')',
  'sysname': 'A Microsoft-supplied system type equivalent to nvarchar(128) and used widely for SQL Server object names. It is not a special identifier or an authorization boundary; use it when matching system catalog metadata conventions.',
  'table type and table-valued parameter boundary': 'A table-valued parameter uses a user-defined table type to pass a structured rowset to a routine, and the parameter is READONLY. This is not a scalar column type or an automatically indexed temporary table; define keys/indexes on the type when supported and useful. [TVPs](' + U.tableTypes + ')',
  'cursor type and column-storage boundary': 'A cursor is a procedural result-set traversal handle for T-SQL variables and parameters, not a normal table-column value type. Prefer set-based operations when they express the operation clearly; cursor lifecycle and fetch state are procedural concerns.',
  'Alias data type and CLR user-defined type': 'An alias type names an existing SQL Server base type with a reusable schema-level contract; a CLR UDT is implemented by a .NET assembly and has additional serialization/deployment constraints. They can encode domain intent, but compatibility and client tooling matter. [User-defined types](' + U.aliasTypes + ')',
  'timestamp deprecated synonym for rowversion': '`timestamp` is the deprecated synonym for `rowversion`, not a temporal date/time type. Use `rowversion` in new SQL Server schemas and treat values as database change stamps. [rowversion](' + U.rowversion + ')',
  'IDENTITY property': 'The IDENTITY property generates a number when rows are inserted, using seed and increment, but it does not itself enforce uniqueness, prevent gaps, or guarantee consecutive/commit order. Add a key/unique constraint and never treat it as a clock. [IDENTITY](' + U.identity + ')',
  'SEQUENCE object': 'A sequence is a schema-scoped number generator that can be consumed independently of inserting a particular table row. Values can be lost on rollback, caching, or failure, so gaps are expected; use constraints to enforce uniqueness. [CREATE SEQUENCE](' + U.sequence + ')',
  'ON DELETE SET DEFAULT decision': 'Choose this only if a real, valid default parent represents the intended reassignment. Every FK column needs a usable default and the resulting tuple must reference an existing parent; otherwise the delete fails or silently misclassifies ownership.',
  'ON UPDATE CASCADE versus immutable key': 'ON UPDATE CASCADE propagates a changed key but couples every dependent row and has restrictions. A stable immutable surrogate key usually avoids that operational fan-out while a mutable natural key remains separately unique.'
};

const missing = Object.values(groups).flat().filter(item => !D[item]);
if (missing.length) throw new Error('Missing exact explanations: ' + missing.join(' | '));
const citations = [...new Set(Object.values(D).flatMap(text => [...text.matchAll(/\]\((https?:[^)]+)\)/g)].map(match => match[1])))];
const sources = [...new Set([...sourceUrls, ...citations])];
const bibliography = sources.map(url => `- [Microsoft Learn](${url})`).join('\n');
const title = manifest.title;
const write = async (name, text) => fs.writeFile(`course/drafts/t03-002/t03-002-${name}.md`, text.trim() + '\n');
const concepts = manifest.concepts.map((concept, index) => `${index + 1}. ${concept}`).join('\n');

await fs.mkdir('course/drafts/t03-002', { recursive: true });
await write('overview', `# ${title} — Big-picture orientation and mental model

# Problem and purpose

Relational modeling decides which facts exist, how they identify one another, and which invalid states the database refuses to store. A good schema makes ordinary operations natural while making corruption difficult. Types, keys, nullability, and constraints are part of the meaning of the data, not storage decoration.

# Plain-language mental model

Treat a database as a set of related fact ledgers. Each table should have a clear subject; each row should describe one instance; each column should have one stable meaning. Keys name rows and connect facts. Constraints are guardrails that apply to every writer. Normalization is the method for giving each fact one authoritative home; denormalization deliberately repeats or precomputes information and therefore creates a synchronization obligation.

# How the parts fit together

1. Identify entities, relationships, and business rules before choosing columns.
2. Find candidate keys, choose a stable primary key, and preserve alternate business-key rules.
3. Decide optionality and types from domain meaning; make NULL semantics explicit.
4. Express row and relationship invariants with NOT NULL, PRIMARY KEY, UNIQUE, FOREIGN KEY, and CHECK constraints.
5. Normalize according to dependencies, then add deliberate read optimizations only after identifying their authority and update path.
6. Evolve production schemas through compatible stages that allow old and new application instances to coexist.

# Concept map

| Design question | Main tool | Typical failure when skipped |
| --- | --- | --- |
| What fact is this row about? | Relation and entity boundary | One row mixes independent facts |
| How is it identified? | Candidate, primary, alternate keys | Duplicates or unstable references |
| How are facts related? | Foreign key and junction table | Dangling or cross-tenant references |
| What values are valid? | Type, nullability, CHECK | Invalid ranges or ambiguous absence |
| Where should a fact live? | Functional dependencies and normalization | Update, insert, and delete anomalies |
| What does a value compare as? | Collation and data-type rules | Unexpected uniqueness, rounding, or sorting |
| How can schema change safely? | Expand, backfill, cut over, contract | Old code fails during rolling deployment |

The broad method is more important than memorizing every type. First define identity and invariants, then select a representation that preserves them. SQL Server supplies enforcement mechanisms, but their precise behavior matters: a CHECK accepts UNKNOWN, a UNIQUE key permits at most one NULL in a single nullable key, and \`datetimeoffset\` stores an offset rather than a named time zone. [Constraints](${U.constraints}) [Unique indexes](${U.index}) [datetimeoffset](${U.datetimeoffset})

# End-to-end walkthrough

Model a multi-tenant order system. A customer belongs to one tenant, an order belongs to one customer, and an order has lines. Define \`TenantId\` and stable surrogate keys, then require a UNIQUE \`(TenantId, CustomerCode)\` rule if codes are tenant-local. Put the customer FK on the many-side order table and include tenant identity in the relational key where needed to prevent cross-tenant links. Put each product/quantity/price fact on the line; make the line key unique within its order. Store price as a suitably sized \`decimal(p,s)\`, not an approximate float. Make required values NOT NULL, define nullable fields only when their absence has a meaning, and add CHECK constraints for row-local ranges. A schema migration that adds a new required status should add it compatibly, backfill real values, validate constraints, deploy readers/writers, and only then remove old columns.

# When to use it and tradeoffs

Normalize independent facts and declare keys/constraints when integrity and independent updates matter. A surrogate key is useful when business identifiers can change, but retain UNIQUE constraints for true business identity. Use a composite key when the relationship itself is the identity and the tuple is stable. Denormalize only when a workload justifies the repeated data and you have a transactional refresh or authoritative recomputation strategy. Choose types for exactness/range and collation for domain comparison, not convenience alone.

# What later lessons cover

The four references explain relational dependencies; constraints and NULL; SQL Server types and collations; and schema decisions/evolution. Practice designs a small tenant/order schema and migration. Query syntax, indexes, temporal-table operation, and engine comparison are covered in adjacent topics.

# Sources

${bibliography}`);

await write('concepts', `# ${title} — Core concepts and how they fit together

# Learning objectives

- Translate a domain description into entities, relationships, candidate keys, and enforceable invariants.
- Explain functional dependencies, normal forms, and the anomalies normalization addresses.
- Predict SQL Server behavior for nullable predicates, constraints, keys, conversions, types, and collations.
- Choose identifiers, relationship placement, delete behavior, and migration stages with explicit tradeoffs.

# Prerequisites

Know that tables contain rows and columns, and recognize that SQL queries can insert, update, and delete rows. This lesson focuses on the design guarantees around those operations.

# Core concepts

${concepts}

# Mechanisms and relationships

## Identity and relationships

For each table, list candidate identifiers: every minimal column set that uniquely identifies a row. Pick one primary key for stable database reference, and enforce alternate business keys separately. A foreign key connects child values to a candidate key on the parent. A many-to-many relationship becomes a junction table, where relationship facts (such as quantity, role, or effective date) can be stored once per association. When tenant is part of identity, include it in the relevant uniqueness and relationship rules; otherwise a valid customer id from tenant A might be paired with a row in tenant B.

## Dependencies and normalization

Suppose \`OrderLine(OrderId, LineNo, ProductId, ProductName, Quantity, UnitPrice)\`. If \`(OrderId, LineNo)\` determines every line fact, but \`ProductId\` determines \`ProductName\`, the product name is duplicated for every order line. Changing only some copies creates an update anomaly; a product without any order cannot be inserted, an insertion anomaly; deleting the last line could erase the only copy of a product name, a deletion anomaly. Put product facts in \`Product\` and reference it. Keep line-specific \`UnitPrice\` on the line if it represents the historical sale price, because that fact is determined by the order-line event, not today’s product catalog price.

1NF asks for atomic domain values and no repeating groups. 2NF rules out non-key facts depending on part of a composite candidate key. 3NF removes the usual transitive non-key dependencies (with a precise formal condition). BCNF strengthens this to require every nontrivial determinant to be a superkey. Normalize according to actual functional dependencies, not merely by counting columns; some schemas cannot preserve every dependency after decomposition.

## NULL, constraints, and domain meaning

SQL predicates use TRUE, FALSE, and UNKNOWN. For example, \`NULL = 5\` and \`NULL = NULL\` are UNKNOWN. WHERE retains only TRUE. CHECK rejects FALSE, so a nullable column can pass \`CHECK (Age >= 18)\` with NULL; add NOT NULL if absence is invalid. Use \`IS NULL\` to test the marker. COALESCE may collapse unknown into a default, so only do so when the default preserves meaning. SQL Server UNIQUE treats NULL as a key value and allows only one NULL in a single-column unique key. A filtered unique index can express “unique only when present.” [NULL logic](${U.null}) [CHECK and UNIQUE](${U.constraints}) [unique index behavior](${U.index})

Foreign keys protect referential integrity. SQL Server does not offer deferred constraint checking to postpone the decision until commit; multi-step migration/order logic must satisfy constraints as statements execute. WITH NOCHECK can leave a constraint untrusted: future relevant writes can be checked while old rows were never validated. Revalidate existing data and restore trust before assuming optimizer or integrity guarantees. [Constraint creation](${U.alter})

## Types carry meaning and comparison rules

Use decimal when decimal exactness matters, float/real for approximations, and date/time types whose range and offset behavior match the domain. \`datetime2\` has no offset; \`datetimeoffset\` preserves a numeric offset and compares instants in UTC, but does not preserve a named zone’s rules. \`rowversion\` is a database change counter, not a timestamp. \`varchar(n)\` limits bytes; UTF-8 collations permit Unicode but multibyte characters consume multiple bytes. Collation affects equality and sorting, so it can change whether a UNIQUE key accepts a pair of strings. Data-type precedence can cause implicit conversions and affect correctness or index use. [Data types](${U.types}) [precedence](${U.precedence}) [collations](${U.collation})

SQL Server 2025’s native JSON type is generally available alongside the older JSON functions and string storage approach. A JSON type is useful for semistructured values but does not remove the need to model stable relationships as relational facts or validate invariants. [JSON data type](${U.json})

## Evolving a live schema

For a breaking change, use an expand-and-contract sequence: add a backward-compatible field/table; deploy code that can read/write old and new shape; backfill in resumable, throttled batches; verify; switch the authoritative read/write path; then remove obsolete schema after all old clients are gone. A default can help old writers but must not invent historical truth. Validate constraints after cleanup, and measure lock duration and deployment overlap.

# Worked examples

## Put relationship attributes in the right place

An \`Enrollment\` between \`Student\` and \`Course\` has its own \`EnrolledAt\` and \`Grade\`. Store one row per student-course association in a junction table, with both foreign keys and a unique pair if re-enrollment is not modeled as separate attempts. If attempts are distinct events, introduce an attempt number or event identity instead of incorrectly forbidding them.

## Enforce a row-local rule and requiredness

\`\`\`sql
CREATE TABLE dbo.Product
(
    ProductId int NOT NULL,
    Price decimal(12, 2) NOT NULL,
    CONSTRAINT PK_Product PRIMARY KEY (ProductId),
    CONSTRAINT CK_Product_Price CHECK (Price >= 0)
);
\`\`\`

The key makes identity unique and non-null. NOT NULL expresses that price is required; CHECK supplies the nonnegative domain rule. The example is valid SQL Server DDL; it is not a claim that a server was run.

## Optional unique value

If a customer may have no external code, a normal SQL Server single-column UNIQUE constraint allows only one NULL. If many customers may have no code and present codes must be unique, a filtered unique index on \`ExternalCode IS NOT NULL\` expresses that rule. The intended meaning determines the design.

# Misconceptions and edge cases

- A primary key is not necessarily a single integer or a business identifier.
- A foreign key does not automatically create a useful child-side index.
- A UNIQUE constraint and primary key both enforce uniqueness, but nullability and table identity roles differ.
- CHECK does not imply NOT NULL because UNKNOWN passes.
- A default is used when a value is omitted; it is not a substitute for a required constraint.
- Normalization is not “always split every attribute”; preserve event facts, dependencies, and transaction boundaries.
- A database timestamp, rowversion, and offset-bearing datetime represent different concepts.
- The text limit in varchar(n) is byte-based; user-visible character counts can differ.
- Soft delete must be reconciled with unique constraints and every query’s active-row predicate.
- Temporal system history is not automatically legal audit evidence or business-valid time.

# Knowledge checks with answers

1. Why can \`CHECK (Quantity > 0)\` accept NULL? **Because the predicate evaluates UNKNOWN, and CHECK rejects FALSE only. Use NOT NULL too if required.**
2. What does \`(TenantId, Email)\` uniqueness mean? **No two rows may share the same pair; the email may repeat in another tenant.**
3. Does \`datetimeoffset\` remember the named time zone? **No; it retains a numeric offset and compares in UTC, but not the zone’s rules.**
4. When is a denormalized product name defensible? **When read needs justify it and a clear source-of-truth plus synchronization/rebuild process prevents drift.**
5. What makes a constraint trusted? **SQL Server has validated existing data, not merely enforced new writes after a NOCHECK addition.**

# Sources

${bibliography}`);

for (const [groupId, items] of Object.entries(groups)) {
  const group = manifest.inventory.find(value => value.id === groupId);
  const entries = items.map(item => `- \`${item}\` — ${D[item]}`).join('\n\n');
  const slug = groupId;
  await write(`reference-${slug}`, `# ${title} — Reference: ${group.title}

# Scope and version

This is the assigned reference group from the SQL Server 2025 (17.x) snapshot checked 2026-11-16. Every supplied name is explained below. Scope outside this group belongs to the overview or neighboring references.

# How this group fits the mental model

The table below is a design toolkit, not a sequence of independent vocabulary cards. Begin with what fact a row represents, then choose identity and relationships, constrain valid values, and preserve one authoritative copy of each fact. The next references connect these design choices to SQL Server enforcement and exact scalar behavior.

# Supplied names explained

${entries}

# Cross-item comparison

Use a natural key when its domain meaning is stable and uniqueness rules are clear; prefer a surrogate for stable internal references when business identifiers can change, but still protect alternate keys. A primary key is the selected row identity; a UNIQUE constraint protects additional candidate keys. A normalized schema stores facts according to dependencies; deliberate denormalization repeats facts for a measured need and creates synchronization work. A one-to-many foreign key belongs on the many side; a many-to-many relation requires an association table. These comparisons do not make one choice universal: lifecycle, invariants, access patterns, and migration cost decide.

# Examples

Consider a \`Course\`, a \`Student\`, and an \`Enrollment\`. A candidate key may be an institution-assigned \`StudentNumber\`, while a surrogate \`StudentId\` gives stable internal references if that number can be corrected. \`Enrollment(StudentId, CourseId, AttemptNo, EnrolledAt, Grade)\` models the association and its facts. If attempts are not distinct, remove \`AttemptNo\` and enforce pair uniqueness. Store course catalog name in Course, but store the name as it appeared on a signed historical transcript only if that is a separate historical fact with a defined source.

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

${bibliography}`);
}

const practice = `# ${title} — Exercises and worked solutions

# Goals

- Translate business statements into keys, relationships, types, nullability, and constraints.
- Diagnose normalization anomalies and choose a decomposition based on dependencies.
- Plan a migration that safely overlaps old and new application versions.

# Worked example

A library has branches, books, copies, members, and loans. A book title is a catalog fact; a physical copy belongs to one branch; a loan connects one member and one copy over time. Model \`Book\`, \`Copy\`, \`Branch\`, \`Member\`, and \`Loan\`. A copy has a stable key and required FK to Book and Branch. Loan references Copy and Member; it records checkout time and nullable return time, where NULL means the copy is currently on loan. Add a CHECK ensuring return time is not before checkout, but also define how to prevent two simultaneous open loans for one copy (for example, a filtered unique index on CopyId where ReturnedAt IS NULL). A nullable unique column by itself would permit only one NULL under SQL Server’s regular uniqueness semantics, so the filtered index is intentional.

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

1. Define nullable \`Phone\` with a filtered unique index: \`CREATE UNIQUE INDEX UX_User_Phone ON dbo.[User](Phone) WHERE Phone IS NOT NULL;\`. Normalize/canonicalize phone representation first if formatting variants should be the same logical number. This lets many rows omit a phone while enforcing uniqueness among present values.
2. If ProductId determines ProductName, putting the name on every order line duplicates catalog data and causes update anomalies. Move current catalog name to Product. Keep SalePrice on the line if it means the amount agreed for that transaction; it does not functionally depend on current Product state. Preserve a historical description separately only if the domain requires a frozen snapshot.
3. \`Tenant(TenantId)\` primary key; \`User(TenantId, UserId)\` primary or unique key; \`UNIQUE(TenantId, UsernameKey)\`; and child rows carry TenantId plus UserId with a composite FK to User. Make the FK columns NOT NULL when association is required. This prevents an otherwise valid UserId from another tenant being paired with the child’s TenantId.
4. Add nullable \`Status\` or a compatible defaulted representation; deploy code that understands old and new states; backfill actual values in bounded batches; validate values; add/validate NOT NULL and CHECK constraints; switch all writers/readers; monitor; then remove temporary compatibility behavior after all old versions are retired. Do not invent an old status that changes historical meaning.
5. Use \`float\`/\`real\` only for the sensor if approximation and a tolerance are acceptable. Use \`decimal(p,s)\` for currency with explicit precision and scale sized to business maximums and fractions; decide rounding policy and currency separately. Test arithmetic result scale and overflow.
6. No. \`datetimeoffset\` retains a numeric offset, not an IANA/Windows named time zone or its historical and future daylight-saving rules. Store a canonical zone identifier separately and define ambiguous/nonexistent local-time handling.
7. Yes, because \`Age >= 18\` evaluates UNKNOWN for NULL and CHECK rejects FALSE only. If required, declare \`Age int NOT NULL CHECK (Age >= 18)\`; add appropriate range/business checks as needed.
8. The team cannot claim preexisting rows satisfied the FK. It must identify/remediate orphans, then re-enable with validation such as \`ALTER TABLE ... WITH CHECK CHECK CONSTRAINT ...\`; verify \`is_not_trusted\` is false in metadata. The exact command is for the named constraint/table and should be deployed after data cleanup.

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

${bibliography}`;
await write('practice', practice);

const interview = `# ${title} — Interview questions and reasoning

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
2. **A child row contains TenantId 8 and UserId belonging to tenant 9.** Use a composite candidate key \`(TenantId, UserId)\` and composite FK; an FK on UserId alone cannot enforce the tenant relation.
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

${bibliography}`;
await write('interview', interview);

console.log(`Wrote eight SQL modeling lessons covering ${Object.values(groups).flat().length} exact inventory terms.`);
