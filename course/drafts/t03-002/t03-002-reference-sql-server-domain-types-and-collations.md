# relational modeling constraints data types null and normalization — Reference: SQL Server scalar types, exactness, temporal values, and text comparison

# Scope and version

This is the assigned reference group from the SQL Server 2025 (17.x) snapshot checked 2026-11-16. Every supplied name is explained below. Scope outside this group belongs to the overview or neighboring references.

# How this group fits the mental model

The table below is a design toolkit, not a sequence of independent vocabulary cards. Begin with what fact a row represents, then choose identity and relationships, constrain valid values, and preserve one authoritative copy of each fact. The next references connect these design choices to SQL Server enforcement and exact scalar behavior.

# Supplied names explained

- `bit` — Stores 0, 1, or NULL when nullable. SQL Server converts numeric values to 0/1, with nonzero becoming 1; do not treat it as a general integer counter.

- `tinyint` — Unsigned 1-byte integer from 0 through 255. Choose it only when that narrow domain is a real invariant, not merely to save a small amount of storage.

- `smallint` — Signed 2-byte integer with range −32,768 through 32,767. Its range is a domain decision and overflow still matters in expressions/conversions.

- `int` — Signed 4-byte integer from −2,147,483,648 through 2,147,483,647. It is a common key/count type, but arithmetic can overflow and identity generation does not expand its range.

- `bigint` — Signed 8-byte integer with a much wider range than int. Use when expected cardinality or arithmetic requires it; wider keys increase index and foreign-key footprint.

- `decimal(p,s)` — Exact fixed-precision decimal with total precision p (maximum 38) and scale s fractional digits. Choose enough integer and fractional capacity; arithmetic result precision/scale rules can reduce scale or overflow.

- `numeric(p,s)` — A synonym for decimal(p,s) in SQL Server; the two are functionally equivalent. Precision and scale describe distinct declared type shapes.

- `money` — Fixed-scale monetary numeric type with four fractional digits and a broad range, but Microsoft warns of rounding/truncation risk in calculations. Prefer appropriately sized decimal for calculation-heavy financial amounts; currency code remains separate.

- `smallmoney` — Smaller-range fixed-scale monetary type with four fractional digits. Range and conversion behavior constrain it, and it has the same calculation caution as money.

- `real` — Approximate single-precision floating-point type. Many decimal fractions are not represented exactly; use for measured scientific values when approximate error is acceptable, not exact accounting.

- `float(n)` — Approximate floating-point type whose n selects precision class, not decimal digits after the point. It cannot guarantee exact decimal equality or arithmetic.

- `char(n)` — Fixed-length character storage, padded to declared length; n is bytes, not necessarily characters, particularly with multibyte encodings. Use for genuinely fixed-width domains.

- `varchar(n)` — Variable-length non-Unicode-by-default character data limited by bytes. Under UTF-8 collations it can encode Unicode and a character may consume multiple bytes, so n is not a character count. [char/varchar](https://learn.microsoft.com/en-us/sql/t-sql/data-types/char-and-varchar-transact-sql?view=sql-server-ver17)

- `varchar(max)` — Large-value variable-length character data up to the SQL Server limit. It can have different row/off-row and indexing behavior; use a bounded size when a domain has a meaningful maximum.

- `nchar(n)` — Fixed-length Unicode character data using UTF-16 storage semantics and padding. n is byte-pair units (byte-pairs), not a universal count of user-perceived grapheme characters.

- `nvarchar(n)` — Variable-length Unicode text with n measured in byte-pairs; supplementary characters can occupy two byte-pairs. Select limits carefully and distinguish code units from displayed characters.

- `nvarchar(max)` — Large-value Unicode text up to the SQL Server limit. Suitable for genuinely large documents/text, but not a default for every column because it changes indexing and storage options.

- `binary(n)` — Fixed-length binary data padded to n bytes. Useful for fixed-size hashes or protocol fields when their exact length is enforced.

- `varbinary(n)` — Variable-length binary data with an n-byte maximum. Use for bounded arbitrary bytes, hashes, or encoded payloads; do not confuse binary values with textual hex representations.

- `varbinary(max)` — Large-value variable-length binary data, up to the SQL Server limit, for large byte payloads. Streaming/API and backup/storage concerns may make external object storage preferable.

- `uniqueidentifier` — A 16-byte GUID value, commonly generated with `NEWID()` or, for locality, `NEWSEQUENTIALID()`. Random GUID key ordering can increase page splits and reduce index page density; `NEWSEQUENTIALID()` is allowed only in a column DEFAULT, can reveal guessable values, and does not provide business chronology. [uniqueidentifier](https://learn.microsoft.com/en-us/sql/t-sql/data-types/uniqueidentifier-transact-sql?view=sql-server-ver17) [NEWSEQUENTIALID](https://learn.microsoft.com/en-us/sql/t-sql/functions/newsequentialid-transact-sql?view=sql-server-ver17)

- `date` — Calendar date without time or offset, with a range from year 1 through 9999. It is not a timestamp and has day-level resolution.

- `time(p)` — Time of day without date or time-zone offset; p controls fractional precision from 0 to 7. It cannot identify a unique instant without date and zone context.

- `smalldatetime` — Legacy date/time type limited to 1900–2079 and minute accuracy; seconds are rounded. Prefer date/time types with required precision/range for new schemas.

- `datetime` — Legacy date/time type with 1753 lower bound and approximately 3.33 ms increments. Literal rounding and restricted range make datetime2 preferable for most new designs.

- `datetime2(p)` — Date plus time with range year 1–9999 and precision 0–7 (100 ns at p=7), but no offset or time-zone identity. Use a documented UTC convention for instants when offset is not stored. [datetime2](https://learn.microsoft.com/en-us/sql/t-sql/data-types/datetime2-transact-sql?view=sql-server-ver17)

- `datetimeoffset(p)` — Date/time plus numeric UTC offset, precision 0–7. SQL Server compares, sorts, and indexes values in UTC while preserving the supplied offset; it does not preserve a named zone or future DST rules. [datetimeoffset](https://learn.microsoft.com/en-us/sql/t-sql/data-types/datetimeoffset-transact-sql?view=sql-server-ver17)

- `rowversion` — An automatically generated 8-byte database counter value for change detection, not a date/time. Updates change it, even when assigned values are unchanged; do not use it as a business timestamp or assume wall-clock chronology. [rowversion](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17)

- `sql_variant` — A value container for many supported SQL Server scalar types, retaining base-type metadata. It has strict restrictions and awkward comparison/conversion behavior; a regular typed column is clearer for stable domains.

- `xml` — SQL Server’s XML type stores XML instances, optionally bound to an XML schema collection for validation. It supports XML methods and indexing, but is distinct from text containing XML.

- `json data type in SQL Server 2025` — Native binary JSON storage introduced in SQL Server 2025 (17.x), generally available in SQL Server 2025 and supported Azure SQL offerings; JSON functions date to SQL Server 2016. The type accepts only top-level objects or arrays (SQL NULL is allowed, JSON literal `null` is not), keeps the first duplicate object key, and can round JSON numbers during conversion. A JSON column cannot be a key in a standard index, though JSON indexes are available; conversion from JSON to character types must be explicit. Use a string column if exact original JSON text or scalar top-level JSON must be retained. [JSON type](https://learn.microsoft.com/en-us/sql/t-sql/data-types/json-data-type?view=sql-server-ver17)

- `spatial data types geography and geometry` — `geometry` models planar Euclidean space; `geography` models ellipsoidal round-earth coordinates. `geometry` distances use the coordinate units; `geography` uses angular latitude/longitude coordinates and typically measures in meters. SRID, input coordinate order (for example WKT longitude then latitude), ring orientation, valid shapes, and spatial indexes affect correctness; choose based on the coordinate system, not names alone. [Spatial overview](https://learn.microsoft.com/en-us/sql/relational-databases/spatial/spatial-data-types-overview?view=sql-server-ver17) [geography point example](https://learn.microsoft.com/en-us/sql/t-sql/spatial-geography/stpointfromtext-geography-data-type?view=sql-server-ver17)

- `Data type precedence` — When an expression combines different types, SQL Server generally converts the lower-precedence type to the higher-precedence type if conversion is supported. This can change comparison semantics, fail on bad values, or apply a conversion to an indexed column. [Precedence](https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-type-precedence-transact-sql?view=sql-server-ver17)

- `Implicit conversion` — An automatic conversion SQL Server applies where an operation requires compatible types. It can round, fail, change semantics, or harm index use; align parameter and column types rather than depending on coercion.

- `Explicit CAST conversion` — `CAST(expression AS type)` requests a conversion explicitly. Choose target length/precision and understand rounding, truncation, overflow, style, and error behavior. [CAST and CONVERT](https://learn.microsoft.com/en-us/sql/t-sql/functions/cast-and-convert-transact-sql?view=sql-server-ver17)

- `TRY_CAST` — Attempts a conversion and returns NULL for a failed permitted conversion rather than raising that conversion error. It does not make every conversion permitted, and NULL then needs to be distinguished from a source NULL. [TRY_CAST](https://learn.microsoft.com/en-us/sql/t-sql/functions/try-cast-transact-sql?view=sql-server-ver17)

- `Collation` — A collation controls string comparison and sorting rules and, for non-Unicode char/varchar, encoding/code page. Server/database/column/expression collations can differ and trigger conflict or conversion behavior. [Collation](https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support?view=sql-server-ver17)

- `Case sensitivity` — A collation option controlling whether letter case affects equality and ordering. Case-insensitive comparisons can consider differently cased identifiers equal; do not infer this from application-language comparison rules.

- `Accent sensitivity` — A collation option controlling whether accented and unaccented forms compare distinctly. It can affect uniqueness, searching, and ordering, not just display.

- `Unicode string storage` — Unicode text can use nchar/nvarchar UTF-16 semantics, or char/varchar with a UTF-8-enabled collation on SQL Server 2019+. Encoded-byte capacity, supplementary characters, and collation still matter. [Unicode support](https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support?view=sql-server-ver17)

- `String length versus byte length` — SQL Server declarations and functions differ in what “length” measures: varchar(n) limits bytes, nvarchar(n) limits byte-pairs, and LEN excludes trailing spaces while DATALENGTH returns bytes. Test multibyte/supplementary values explicitly.

- `Precision and scale` — For decimal, precision is total significant digits and scale is digits to the right of the decimal. SQL Server derives result precision/scale for arithmetic; conversions and `ARITHABORT` affect overflow handling. [Precision/scale](https://learn.microsoft.com/en-us/sql/t-sql/data-types/decimal-and-numeric-transact-sql?view=sql-server-ver17)

- `Floating-point approximation` — Binary floating-point represents a finite set of values, so common decimal fractions may be approximations. Equality, aggregation, and rounding can surprise; use decimal for exact decimal domains and specify a tolerance for approximate measurement.

- `SARGable type alignment` — Keep predicate parameter and column types aligned so the optimizer can compare/index-seek the stored representation without converting the indexed column. A seek is not guaranteed, but avoid needless implicit conversion on the column side.

- `datetimeoffset UTC offset preservation boundary` — The stored numeric offset is preserved and comparisons normalize to UTC, but an offset like `-05:00` is not the named zone `America/New_York`; it cannot encode the zone’s historical/future DST rules. Retain a zone identifier separately when that rule is domain data. [datetimeoffset](https://learn.microsoft.com/en-us/sql/t-sql/data-types/datetimeoffset-transact-sql?view=sql-server-ver17)

- `hierarchyid` — A variable-length system type encoding one node’s position/path in a tree. It sorts in depth-first order, but does not itself enforce value uniqueness, parent-child existence, or a consistent tree; use a UNIQUE constraint when duplicate node positions are invalid, and application logic/transactions to preserve tree relationships. [Hierarchical data](https://learn.microsoft.com/en-us/sql/relational-databases/hierarchical-data-sql-server?view=sql-server-ver17)

- `vector(n, base_type)` — SQL Server 2025 vector stores a fixed-dimension numeric vector, exposed as a JSON-array representation but stored in optimized binary form. The default base type is float32 (maximum 1,998 dimensions); float16 supports up to 3,996 dimensions but is Preview in boxed SQL Server 2025. The type and scalar functions `VECTOR_DISTANCE`, `VECTOR_NORM`, `VECTOR_NORMALIZE`, and `VECTORPROPERTY` are GA there, whereas `CREATE VECTOR INDEX` and `VECTOR_SEARCH` are Preview and require `PREVIEW_FEATURES`. Those search/index capabilities and float16 availability differ across Azure SQL update policies. [Vector type](https://learn.microsoft.com/en-us/sql/t-sql/data-types/vector-data-type?view=sql-server-ver17) [Vector function availability](https://learn.microsoft.com/en-us/sql/t-sql/functions/vector-functions-transact-sql?view=sql-server-ver17)

- `text, ntext, and image legacy types` — Deprecated legacy large-value types for character/binary data; Microsoft says they will be removed in a future SQL Server version. Do not use for new schemas; migrate to varchar(max), nvarchar(max), or varbinary(max) with application behavior checked. [Legacy types](https://learn.microsoft.com/en-us/sql/t-sql/data-types/string-and-binary-types?view=sql-server-ver17)

- `sysname` — A system-supplied user-defined type equivalent to `nvarchar(128)`, except it is not nullable, and is used widely for SQL Server object names. It is not a special identifier or an authorization boundary; use it when matching system catalog metadata conventions. [nchar and nvarchar](https://learn.microsoft.com/en-us/sql/t-sql/data-types/nchar-and-nvarchar-transact-sql?view=sql-server-ver17)

- `table type and table-valued parameter boundary` — A table-valued parameter uses a user-defined table type to pass a structured rowset to a routine by reference, and the parameter is READONLY. It is not a scalar column type or a normal temporary table: SQL Server maintains no column statistics for TVPs, so large or cardinality-sensitive inputs may need staging in a temporary table. A type can declare keys and unique ordering metadata, but not arbitrary post-creation indexes. [TVPs](https://learn.microsoft.com/en-us/sql/relational-databases/tables/use-table-valued-parameters-database-engine?view=sql-server-ver17)

- `cursor type and column-storage boundary` — A cursor is a procedural result-set traversal handle for T-SQL variables and parameters, not a normal table-column value type. Prefer set-based operations when they express the operation clearly; cursor lifecycle and fetch state are procedural concerns.

- `Alias data type and CLR user-defined type` — An alias type names an existing SQL Server base type with a reusable schema-level contract; a CLR UDT is implemented by a .NET assembly and has additional serialization/deployment constraints. They can encode domain intent, but compatibility and client tooling matter. [User-defined types](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-types/create-user-defined-data-types-database-engine?view=sql-server-ver17)

- `timestamp deprecated synonym for rowversion` — `timestamp` is the deprecated synonym for `rowversion`, not a temporal date/time type. Use `rowversion` in new SQL Server schemas and treat values as database change stamps. [rowversion](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17)

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
- [Microsoft Learn — float and real](https://learn.microsoft.com/en-us/sql/t-sql/data-types/float-and-real-transact-sql?view=sql-server-ver17)
- [Microsoft Learn — uniqueidentifier](https://learn.microsoft.com/en-us/sql/t-sql/data-types/uniqueidentifier-transact-sql?view=sql-server-ver17)
- [Microsoft Learn — NEWSEQUENTIALID](https://learn.microsoft.com/en-us/sql/t-sql/functions/newsequentialid-transact-sql?view=sql-server-ver17)
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
- [Microsoft Learn — geography point input](https://learn.microsoft.com/en-us/sql/t-sql/spatial-geography/stpointfromtext-geography-data-type?view=sql-server-ver17)
- [Microsoft Learn — CREATE VECTOR INDEX](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-vector-index-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/patterns/expand-contract)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal-tables?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-computed-columns-in-a-table?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description)
