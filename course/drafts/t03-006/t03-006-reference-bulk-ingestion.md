# inserts updates deletes merges and bulk operations — Reference: Bulk loading, file formats, validation, and operational controls

# Scope

This reference explains every frozen manifest entry in **Bulk loading, file formats, validation, and operational controls**. It targets SQL Server Database Engine semantics unless the item explicitly identifies a client utility or platform boundary. The inventory is authoritative for this lesson; a similarly named Fabric/Azure feature is not presumed to behave identically.

# Item-by-item reference

| Exact inventory item | Meaning and practical boundary |
| --- | --- |
| `BULK INSERT` | Imports file rows using Database Engine access to local/network or supported cloud sources. File path visibility, identity/authentication, encoding, parser options, permissions, and target validation depend on deployment platform. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `OPENROWSET(BULK...)` | Exposes a file as a rowset for INSERT...SELECT or queries, with single-LOB and format-file variants. It has separate server/provider/credential configuration and is not equivalent to client-side file access. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/openrowset-bulk-transact-sql?view=sql-server-ver17)) |
| `OPENROWSET SINGLE_BLOB SINGLE_CLOB SINGLE_NCLOB` | Content options expose one file as one row and one column: SINGLE_BLOB returns varbinary(max), SINGLE_CLOB returns varchar(max), and SINGLE_NCLOB returns nvarchar(max). XML needing full encoding conversion should use SINGLE_BLOB. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/openrowset-bulk-transact-sql?view=sql-server-ver17)) |
| `bcp utility` | A client command-line tool for bulk export and import. Client version, command-line shell quoting, code page, character/native format, authentication, and file location all matter. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp in out queryout and format modes` | The command modes are in (file to table), out (table to file), queryout (query result to file), and format (create format metadata). Pick mode based on direction and whether the source is a table or query. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp -c -w -n -N data formats` | -c is character data, -w is Unicode character data, -n is native data, and -N is Unicode native data. Character formats suit external interchange; native forms are efficient but SQL Server/type coupled. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp -f and -x format files` | -f consumes or creates a format file depending on command mode. -x creates an XML format file with format mode on Windows; it is not an import/export modifier and is unsupported on Linux/macOS. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp -b -m -e batch and error controls` | -b sets rows per batch, -m sets maximum errors, and -e writes rejected rows to an error file. Earlier successful batches may remain committed after a later failure. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp -E and -k identity and null switches` | -E preserves supplied identity values when importing; -k keeps NULL values rather than substituting defaults. Verify target identity and nullability contracts before using them. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp -F -L -t -r row and field controls` | -F/-L select first/last input rows; -t and -r set field and row terminators. These delimiters are not a full quoted-CSV parser. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp server and authentication switches` | -S selects the server, -d the database, -T uses integrated authentication, -U selects a login, -P supplies a password, and -G enables Microsoft Entra authentication. Avoid exposing passwords in process arguments or shell history. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp input and output file switches` | -i supplies a command file and -o a console-output file; -e separately stores rejected rows. Protect each file because they can contain data or diagnostics. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp -V compatibility and -C code page` | -V requests a data-format compatibility version; -C chooses a code page for character data. Neither changes the actual engine version or validates that the file encoding matches the declared code page. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp -a -h -q -R -v -K runtime options` | -a sets packet size, -h supplies bulk hints, -q quotes identifiers, -R uses regional date/currency settings, -v prints version, and -K sets application intent. These affect transport/connection behavior, not the relational row contract. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp -J -Y -u encryption options` | -J selects a server certificate, -Y selects encryption behavior, and -u trusts the server certificate where supported. Confirm exact client-version/platform behavior and prefer validated TLS in production. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `FORMATFILE` | Maps file fields to target columns and types, allowing skipped, reordered, or differently shaped fields. Keep it versioned alongside the data contract; format files support at most 1,024 fields in BULK INSERT. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/import-export/format-files-for-importing-or-exporting-data-sql-server?view=sql-server-ver17)) |
| `FORMATFILE_DATA_SOURCE` | Names the external data source that holds a remote format file. It is supported by SQL Server 2017 (14.x) and later; distinguish it from DATA_SOURCE, which identifies the data file source. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/import-export/format-files-for-importing-or-exporting-data-sql-server?view=sql-server-ver17)) |
| `DATA_SOURCE` | Names a database-scoped external data source used for supported remote files. The associated credential, location, and permissions are configured in the database; this is not the caller’s local path. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `FIELDTERMINATOR` | Defines the delimiter between fields for char and widechar files; the default is a tab. A delimiter inside quoted CSV fields must be handled by FORMAT=CSV parsing, not by assuming simple delimiter splitting. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `FIELDQUOTE` | Selects the quote character for CSV parsing with FORMAT=CSV; the default is a double quote, per the documented RFC 4180 convention. Validate escaped quotes, embedded delimiters/newlines, and the producer’s CSV dialect instead of assuming every CSV variant is identical. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `ROWTERMINATOR` | Defines record boundaries. The actual file may contain LF, CRLF, or custom terminators; inspect bytes and test on the target host/utility. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `FIRSTROW` | One-based first source row to load (1 is the default first line). It is not a CSV header parser: skipped rows are scanned only for terminators and their field values are not validated. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `LASTROW` | Limits the final source row number considered by BULK INSERT. It is a file row position control, not a durable restart/checkpoint mechanism. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `ERRORFILE` | Writes formatting/conversion-failure rows and a diagnostic control file. The target error path must not already exist; protect sensitive rejected data and retain the file with controlled access. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `ERRORFILE_DATA_SOURCE` | Identifies the external data source used to write BULK INSERT error files in supported remote-storage scenarios. Azure SQL Database requires this with ERRORFILE; verify platform-specific combinations. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `MAXERRORS` | Sets tolerated data syntax errors; the default is 10. It does not apply to constraint checking and does not count every conversion failure; do not treat it as a guarantee that only that many invalid business records were present. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `TABLOCK bulk-load hint` | Requests a table-level lock for the bulk import; locking/logging and concurrent-load behavior depend on table/index shape. It is not universally faster; test indexes, batch size, recovery model, and workload. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `BATCHSIZE` | Divides a bulk import into batches; each batch is a transaction when no outer user transaction wraps the statement. A later failure can leave earlier batches committed. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `KEEPIDENTITY` | Preserves identity values present in the input. Without it, SQL Server normally generates target identity values; ensure imported values do not collide and understand reseeding behavior. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `KEEPNULLS` | Preserves source NULLs instead of replacing them with destination defaults during bulk import. Without it, missing/NULL handling can use defaults depending on load format and options. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `CHECK_CONSTRAINTS` | Requests that bulk load check constraints and foreign keys. Without it, applicable constraints may be skipped/left untrusted; check and re-trust constraints deliberately after the load. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `FIRE_TRIGGERS` | Requests that INSERT triggers fire for bulk rows; SQL Server fires them once for every completed batch. Without this option bulk insert triggers do not execute. Platform applicability differs. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `ROWS_PER_BATCH` | Provides an estimated row count for a batch to the optimizer/load operation; it does not itself split the import. BATCHSIZE controls batch boundaries. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `KILOBYTES_PER_BATCH` | Provides a data-size estimate for bulk-load batching/planning. It does not itself establish a transaction boundary; BATCHSIZE controls row batch boundaries. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `ORDER bulk-load hint` | Declares the file sort order to enable optimized bulk import when it matches the destination clustered index. It never sorts the file; SQL Server validates sort order for optimized bulk import and ignores the clause when ordering is not applicable. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `CODEPAGE` | Controls character-file code-page interpretation. Use RAW only when bytes already match the destination representation; validate non-ASCII and replacement behavior. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `DATAFILETYPE` | Selects character, Unicode character, native, or Unicode native representation. Native formats are type/platform sensitive and are generally suitable for controlled SQL Server-to-SQL Server exchange. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `FORMAT='CSV'` | Uses SQL Server 2017+ CSV parser behavior with FIELDQUOTE and delimiter options. CSV quoting, escaped quotes, embedded delimiters/newlines, UTF encodings, and FIRSTROW header handling need explicit tests. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `BULK INSERT platform option differences` | BULK INSERT syntax, paths, authentication, and option effects vary by SQL Server, Azure SQL Database/Managed Instance, and Fabric. For example, several SQL Server load hints are accepted but have no effect in Fabric Warehouse; consult the platform matrix for the actual target. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `bcp character native and Unicode formats` | bcp -c/-w use character encodings, while -n/-N use native representations with type/platform coupling. Choose encoding and terminators deliberately; do not treat native files as portable interchange formats. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp shell quoting` | bcp command arguments pass through the operating-system shell. Characters such as <, >, |, &, and ^ need shell-specific quoting/escaping; test a command with representative paths and credentials without exposing secrets. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp vector -z support boundary` | bcp -z enables vector transfer; -z0 selects float32 and -z1 selects float16. With SQL Server 2025+, enabled transfer uses native vector binary, while disabled transfer uses JSON float-array strings. -z/-z0 require bcp 18.6.1.1+ and -z1 requires bcp 18.7.1.1+; support is disabled by default. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `bcp client and TDS version boundary` | SQL Server 2025 introduces TDS 8.0 support in bcp 18. The bcp executable version is independent of the server engine version; confirm client option availability and endpoint support separately. ([source](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)) |
| `Bulk-load transaction scope` | Without an explicit outer transaction, BATCHSIZE creates separately committed units; with an outer transaction, all successful batches can be rolled back together, at greater log/lock cost. ([source](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver17)) |
| `Minimal logging prerequisites` | Bulk operations are not automatically minimally logged. Eligibility depends on recovery model, table/index state, replication, TABLOCK, and other documented conditions; inspect actual log behavior and recovery requirements. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/import-export/prerequisites-for-minimal-logging-in-bulk-import?view=sql-server-ver17)) |
| `Staging table` | Loads untrusted rows into a permissive landing schema first, preserving raw values and batch identity. It separates transport parsing from type/business validation and target promotion. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `Validate then promote` | Validate encoding, row counts, keys, ranges, nulls, and business rules in staging, then promote transactionally or by a controlled batch. Rejected rows need traceable reasons and replay policy. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |
| `External data source permission boundary` | Server-side bulk access uses Database Engine credentials or external data source configuration, not the caller’s desktop path. Grant only required storage/table permissions and keep secrets out of scripts. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)) |

# Reasoning checks

1. Name the keys and expected row count before executing a write.
2. For source-driven updates and MERGE, prove one source match per target key.
3. For OUTPUT, state which row image is used, when triggers run, and how errors/rollback invalidate client output.
4. For file loads, identify the process that reads the file, the format/parser, and the security principal.
5. State the batch commit and restart behavior, including whether any earlier batch can remain committed.
6. Explain how duplicate prevention, stale-write detection, and timeout retries are enforced by database invariants and idempotency.

# Scope and version

Target SQL Server 2025 (17.x) unless an entry says otherwise. SQL Server 2017 added BULK INSERT CSV support; bcp 18+ adds client-side features ([BULK INSERT](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17), [bcp](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)).

# How this group fits the mental model

Separate target selection, row-image observation, match/action policy, file transport, and transaction outcome. They are related but provide different guarantees.

# Supplied names explained

The item-by-item table above explains every exact inventory name for this group.

# Cross-item comparison

INSERT creates rows, UPDATE changes them, DELETE removes selected rows, TRUNCATE removes all under different restrictions. OUTPUT returns images; @@ROWCOUNT returns a count. BULK INSERT is server-side, bcp client-side, and OPENROWSET(BULK...) exposes a rowset.

# Examples

Use ordered key selection in a subquery before applying TOP to a batch DELETE; DML TOP itself does not order affected rows.

# Common mistakes

- Treating OUTPUT as proof of commit.
- Assuming duplicate update sources are deterministic.
- Using partial snapshots with NOT MATCHED BY SOURCE.
- Treating FIRSTROW as CSV-aware.
- Assuming BATCHSIZE only changes speed.

# Knowledge checks with answers

1. INSERT OUTPUT cannot refer to DELETED.
2. Direct OUTPUT is disallowed for a target with an enabled same-action trigger.
3. TRUNCATE does not fire DELETE triggers.
4. Duplicate UPDATE sources are undefined.
5. Capture @@ROWCOUNT immediately.

# Sources

- https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/queries/update-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/delete-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/truncate-table-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/functions/openrowset-bulk-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/import-export/format-files-for-importing-or-exporting-data-sql-server?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/import-export/prerequisites-for-minimal-logging-in-bulk-import?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/set-xact-abort-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/language-elements/try-catch-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/functions/rowcount-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-use-utility?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-unique-indexes?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/functions/xact-state-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/t-sql/statements/set-nocount-transact-sql?view=sql-server-ver17
- https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17
