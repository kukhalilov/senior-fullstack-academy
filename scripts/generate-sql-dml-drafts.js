import fs from 'node:fs/promises';

const manifestPath = 'curriculum/manifests/sql-server/t03-006.json';
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const urls = {
  insert: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17',
  update: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/update-transact-sql?view=sql-server-ver17',
  delete: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/delete-transact-sql?view=sql-server-ver17',
  truncate: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/truncate-table-transact-sql?view=sql-server-ver17',
  output: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17',
  merge: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17',
  bulk: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17',
  openrowset: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/openrowset-bulk-transact-sql?view=sql-server-ver17',
  bcp: 'https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17',
  format: 'https://learn.microsoft.com/en-us/sql/relational-databases/import-export/format-files-for-importing-or-exporting-data-sql-server?view=sql-server-ver17',
  minimal: 'https://learn.microsoft.com/en-us/sql/relational-databases/import-export/prerequisites-for-minimal-logging-in-bulk-import?view=sql-server-ver17',
  xact: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/set-xact-abort-transact-sql?view=sql-server-ver17',
  trycatch: 'https://learn.microsoft.com/en-us/sql/t-sql/language-elements/try-catch-transact-sql?view=sql-server-ver17',
  rowcount: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/rowcount-transact-sql?view=sql-server-ver17',
  transactions: 'https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver17',
  rowversion: 'https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17',
  bcpUse: 'https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-use-utility?view=sql-server-ver17',
  top: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17',
  unique: 'https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-unique-indexes?view=sql-server-ver17',
  xactState: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/xact-state-transact-sql?view=sql-server-ver17',
  noCount: 'https://learn.microsoft.com/en-us/sql/t-sql/statements/set-nocount-transact-sql?view=sql-server-ver17',
  deadlocks: 'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17',
};
manifest.sourceSnapshot = {
  ...manifest.sourceSnapshot,
  edition: 'SQL Server 2025 (17.x) data modification and bulk import documentation, checked 2026-11-16',
  checkedAt: '2026-11-16',
  urls: [...new Set([...manifest.sourceSnapshot.urls, ...Object.values(urls)])],
};
manifest.comparisonSources = [...new Set([...manifest.comparisonSources, ...Object.values(urls)])];
manifest.versionNotes = [
  { edition: 'SQL Server 2017 (14.x)', items: ['BULK INSERT added CSV format support, FIELDQUOTE, and remote FORMATFILE_DATA_SOURCE support. CSV quoting and delimiters are distinct from a naïve comma split; validate encoding, terminators, and target types.'], sourceUrls: [urls.bulk] },
  { edition: 'SQL Server 2025 (17.x) and bcp 18+', items: ['bcp 18 adds TDS 8.0 support. Vector transfer -z/-z0 requires bcp 18.6.1.1 or later; -z1 requires bcp 18.7.1.1 or later. The utility version is separate from the Database Engine version.'], sourceUrls: [urls.bcp] },
];
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const descriptions = {
  'INSERT statement': 'Adds rows to a target table or view. State the target columns explicitly so a schema change cannot silently remap positional values; constraints, defaults, identity rules, and triggers still apply.',
  'INSERT ... VALUES': 'Supplies literal or parameterized row values. The number and order of values must match the target column list; direct INSERT VALUES has a 1,000-row limit, while a derived VALUES rowset does not share that limit.',
  'INSERT multiple rows': 'A single VALUES clause can insert several tuples in one statement. It is not an all-purpose bulk-loading substitute; large or external files have separate bulk tools, logging, validation, and recovery behavior.',
  'INSERT ... SELECT': 'Inserts the rows returned by a query. Explicitly align target and select columns, conversions, nullability, and duplicate policy; source ordering does not define insertion order.',
  'INSERT ... DEFAULT VALUES': 'Inserts one row using defaults for all columns. It fails where required columns have neither a default nor nullable support.',
  'Explicit INSERT column list': 'Names target columns in the intended mapping order. It protects code from table-column reordering and makes omitted identity/default/computed columns deliberate.',
  'SET IDENTITY_INSERT': 'Temporarily permits an explicit identity value for one table in the session. Only one table per session may have it ON; turn it OFF in all paths and account for identity reseeding and collisions.',
  'UPDATE statement': 'Changes values in every target row satisfying its predicate. Confirm the predicate’s key cardinality and affected-row expectation before executing broad or destructive changes.',
  'UPDATE with FROM': 'Joins a target to row sources that determine new values. SQL Server documents results as undefined when multiple source values can supply one updated target column; reduce the source to one deterministic row per key.',
  'UPDATE joined source': 'Uses an explicit joined relation to derive values, commonly through UPDATE alias SET ... FROM target AS alias JOIN source. Put target identity in the join and eliminate duplicate source matches.',
  'DELETE statement': 'Removes every target row matching its predicate. A missing or overly broad WHERE can delete the entire table; use a transaction, preview predicate, and expected row count for consequential deletion.',
  'DELETE with FROM': 'Names joined sources used to select target rows. Clearly identify which alias is the delete target; source multiplicity must not be mistaken for a larger target deletion count.',
  'DELETE joined source': 'Deletes target rows related to a source using a join. Ensure the join condition expresses the intended relationship and inspect target keys before the delete.',
  'TRUNCATE TABLE boundary': 'Removes all rows by deallocating data pages, resets an identity counter to its defined seed, and can be rolled back inside a SQL Server transaction. SQL Server disallows it for tables referenced by foreign keys (except self-reference), participating in indexed views, published for replication, system-versioned temporal, or referenced by EDGE constraints; it requires ALTER permission and does not fire DELETE triggers.',
  'DML without WHERE risk': 'UPDATE or DELETE without WHERE targets every qualifying table row (all rows if no other limiting construct applies). Do not rely on a GUI preview or presumed key uniqueness as a safety barrier.',
  'OUTPUT clause': 'Returns expressions from each affected row for INSERT, UPDATE, DELETE, or MERGE. Direct client output is forbidden when the target has an enabled trigger for that action; use OUTPUT INTO where allowed.',
  'INSERTED pseudo-table': 'In OUTPUT, INSERTED represents new values for INSERT/UPDATE and values after the DML statement but before triggers execute. It is not the trigger’s inserted transition table and cannot be used for DELETE output.',
  'DELETED pseudo-table': 'In OUTPUT, DELETED represents old values for UPDATE/DELETE. It cannot be used for INSERT output; update auditing can pair DELETED and INSERTED columns.',
  'OUTPUT INTO': 'Captures OUTPUT rows into a table variable or eligible table. The nested operation is atomic, but the destination has restrictions: for example it cannot have triggers or foreign keys.',
  'OUTPUT with MERGE': 'MERGE OUTPUT can include INSERTED, DELETED, source columns, and $action (INSERT/UPDATE/DELETE). Correlate source and target keys explicitly; OUTPUT row order is not guaranteed.',
  'TOP in DML': 'Limits affected rows but does not order which rows qualify. To process a deterministic batch, select ordered keys in a subquery or CTE, then join the DML target to those keys.',
  '@@ROWCOUNT': 'Returns the rows affected or read by the immediately preceding statement and is reset or overwritten by many statements. Capture it immediately; it reports a count, not proof that the intended keys changed.',
  'DML trigger interaction': 'AFTER triggers run after a DML action and INSTEAD OF triggers replace the modification. OUTPUT values are before triggers, trigger side effects can alter final data, and MERGE action-trigger ordering is not guaranteed.',
  'MERGE statement': 'Matches one source relation to one target and applies clauses for matched, target-missing, or source-missing rows. Terminate MERGE with a semicolon. Test the exact engine/build, constraints, triggers, and concurrency profile.',
  'MERGE source': 'The source may be a table, view, CTE, or derived query. Make its match key unique for the intended target key and materialize/stage it if it is otherwise unstable or expensive.',
  'MERGE target': 'The table or view receiving actions. Index the match key appropriately and ensure its uniqueness constraints encode the business identity rather than expecting MERGE syntax to enforce it.',
  'MERGE ON predicate': 'Defines source-to-target identity matching. Keep it focused on key correspondence; moving action filters into ON can misclassify existing rows as unmatched and cause incorrect inserts or deletes.',
  'WHEN MATCHED': 'Applies when ON finds a source/target pair; one clause can UPDATE or DELETE, with an optional search condition. At most two WHEN MATCHED clauses are allowed and their conditions must distinguish actions.',
  'WHEN NOT MATCHED BY TARGET': 'Handles a source row that matched no target, commonly with INSERT. Duplicate source rows for the same missing key can attempt duplicate inserts; enforce source uniqueness and a target unique constraint.',
  'WHEN NOT MATCHED BY SOURCE': 'Handles target rows with no source match, commonly for synchronization deletion or deactivation. A filtered/incomplete source can therefore classify many valid target rows as missing; scope this action carefully.',
  'MERGE UPDATE action': 'Updates the matched target row. If multiple source rows match one target and the action updates it, SQL Server raises an error; deduplicate source keys before MERGE.',
  'MERGE INSERT action': 'Inserts a source row classified as missing from target. A concurrent transaction can insert the same business key after the match check; unique constraints plus suitable locking/transaction design remain necessary.',
  'MERGE DELETE action': 'Deletes a matched or source-missing target according to the selected WHEN clause. The latter is particularly dangerous when the source is filtered, partial, or stale.',
  'MERGE OUTPUT': 'Returns action-specific old/new values and $action. Do not treat output ordering as a sequence or consume results if the statement reports an error.',
  'MERGE semicolon terminator': 'SQL Server requires the MERGE statement to end with a semicolon. A missing terminator raises a syntax error.',
  'Duplicate source match error': 'Microsoft documents an error when an UPDATE would modify one target more than once; SQL Server also prevents updating and deleting the same target row. Do not rely on ambiguous source multiplicity for any action: collapse or reject duplicates before MERGE.',
  'MERGE trigger action ordering': 'For each specified action SQL Server fires corresponding AFTER triggers, but does not guarantee which action’s trigger runs first or last. Trigger logic must not infer action ordering.',
  'MERGE concurrency race': 'A concurrent insert can race with the not-matched check, and other schedules can block or deadlock. A MERGE statement is not automatically a serializable upsert.',
  'HOLDLOCK merge pattern': 'HOLDLOCK is equivalent to SERIALIZABLE for the referenced table and can protect a key range in some insert/update MERGE patterns. It reduces concurrency and does not substitute for unique constraints or workload testing.',
  'Separate UPDATE then INSERT upsert': 'A common alternative updates existing rows, then inserts missing keys. Protect the missing-key decision with appropriate transaction/locking strategy and a unique constraint; otherwise concurrent sessions can both insert.',
  'Unique constraint-backed upsert': 'A unique index/constraint on the true business key is the final integrity barrier. Catch duplicate-key races and retry or re-read according to an idempotent policy.',
  'Idempotent retry-safe write': 'Repeating the same operation produces the same intended state, commonly by stable request key, upsert key, or deduplicated event ID. Idempotence is a business contract, not a property granted by retries.',
  'MERGE defect and version verification': 'MERGE behavior can interact with particular indexes, triggers, and engine builds. Verify current Microsoft documentation and CU/build, test every action with actual constraints/indexes, and prefer separate DML when it gives clearer behavior; Microsoft notes it may perform better under heavy concurrency.',
  'BULK INSERT': 'Imports file rows using Database Engine access to local/network or supported cloud sources. File path visibility, identity/authentication, encoding, parser options, permissions, and target validation depend on deployment platform.',
  'OPENROWSET(BULK...)': 'Exposes a file as a rowset for INSERT...SELECT or queries, with single-LOB and format-file variants. It has separate server/provider/credential configuration and is not equivalent to client-side file access.',
  'bcp utility': 'A client command-line tool for bulk export and import. Client version, command-line shell quoting, code page, character/native format, authentication, and file location all matter.',
  'FORMATFILE': 'Maps file fields to target columns and types, allowing skipped, reordered, or differently shaped fields. Keep it versioned alongside the data contract; format files support at most 1,024 fields in BULK INSERT.',
  'FIELDTERMINATOR': 'Defines the delimiter between fields for char and widechar files; the default is a tab. A delimiter inside quoted CSV fields must be handled by FORMAT=CSV parsing, not by assuming simple delimiter splitting.',
  'ROWTERMINATOR': 'Defines record boundaries. The actual file may contain LF, CRLF, or custom terminators; inspect bytes and test on the target host/utility.',
  'FIRSTROW': 'One-based first source row to load (1 is the default first line). It is not a CSV header parser: skipped rows are scanned only for terminators and their field values are not validated.',
  'LASTROW': 'Limits the final source row number considered by BULK INSERT. It is a file row position control, not a durable restart/checkpoint mechanism.',
  'ERRORFILE': 'Writes formatting/conversion-failure rows and a diagnostic control file. The target error path must not already exist; protect sensitive rejected data and retain the file with controlled access.',
  'MAXERRORS': 'Sets tolerated data syntax errors; the default is 10. It does not apply to constraint checking and does not count every conversion failure; do not treat it as a guarantee that only that many invalid business records were present.',
  'TABLOCK bulk-load hint': 'Requests a table-level lock for the bulk import; locking/logging and concurrent-load behavior depend on table/index shape. It is not universally faster; test indexes, batch size, recovery model, and workload.',
  'BATCHSIZE': 'Divides a bulk import into batches; each batch is a transaction when no outer user transaction wraps the statement. A later failure can leave earlier batches committed.',
  'KEEPIDENTITY': 'Preserves identity values present in the input. Without it, SQL Server normally generates target identity values; ensure imported values do not collide and understand reseeding behavior.',
  'KEEPNULLS': 'Preserves source NULLs instead of replacing them with destination defaults during bulk import. Without it, missing/NULL handling can use defaults depending on load format and options.',
  'CHECK_CONSTRAINTS': 'Requests that bulk load check constraints and foreign keys. Without it, applicable constraints may be skipped/left untrusted; check and re-trust constraints deliberately after the load.',
  'FIRE_TRIGGERS': 'Requests that INSERT triggers fire for bulk rows; SQL Server fires them once for every completed batch. Without this option bulk insert triggers do not execute. Platform applicability differs.',
  'ROWS_PER_BATCH': 'Provides an estimated row count for a batch to the optimizer/load operation; it does not itself split the import. BATCHSIZE controls batch boundaries.',
  'ORDER bulk-load hint': 'Declares the file sort order to enable optimized bulk import when it matches the destination clustered index. It never sorts the file; SQL Server validates sort order for optimized bulk import and ignores the clause when ordering is not applicable.',
  'CODEPAGE': 'Controls character-file code-page interpretation. Use RAW only when bytes already match the destination representation; validate non-ASCII and replacement behavior.',
  'DATAFILETYPE': 'Selects character, Unicode character, native, or Unicode native representation. Native formats are type/platform sensitive and are generally suitable for controlled SQL Server-to-SQL Server exchange.',
  "FORMAT='CSV'": 'Uses SQL Server 2017+ CSV parser behavior with FIELDQUOTE and delimiter options. CSV quoting, escaped quotes, embedded delimiters/newlines, UTF encodings, and FIRSTROW header handling need explicit tests.',
  'Bulk-load transaction scope': 'Without an explicit outer transaction, BATCHSIZE creates separately committed units; with an outer transaction, all successful batches can be rolled back together, at greater log/lock cost.',
  'Minimal logging prerequisites': 'Bulk operations are not automatically minimally logged. Eligibility depends on recovery model, table/index state, replication, TABLOCK, and other documented conditions; inspect actual log behavior and recovery requirements.',
  'Staging table': 'Loads untrusted rows into a permissive landing schema first, preserving raw values and batch identity. It separates transport parsing from type/business validation and target promotion.',
  'Validate then promote': 'Validate encoding, row counts, keys, ranges, nulls, and business rules in staging, then promote transactionally or by a controlled batch. Rejected rows need traceable reasons and replay policy.',
  'External data source permission boundary': 'Server-side bulk access uses Database Engine credentials or external data source configuration, not the caller’s desktop path. Grant only required storage/table permissions and keep secrets out of scripts.',
  'Explicit transaction around DML': 'Wrap logically coupled writes in BEGIN/COMMIT with ROLLBACK on failure. Keep transactions short, define isolation/concurrency semantics, and never assume a client timeout proves rollback.',
  'XACT_ABORT': 'When ON, many run-time errors terminate and roll back the whole transaction; compile errors are unaffected, and TRY/CATCH still governs control flow. It is often useful for data modifications but test error classes.',
  'TRY...CATCH around DML': 'Catches many execution errors and allows cleanup/rollback, but not every compile, connection-terminating, or same-scope compilation error. Check XACT_STATE before choosing commit or rollback.',
  'SET NOCOUNT ON': 'Suppresses per-statement “n rows affected” messages; it does not disable @@ROWCOUNT or change DML. It reduces protocol noise in procedural/batched code.',
  '@@ROWCOUNT validation': 'Capture immediately after DML and compare with the expected count or use a concurrency predicate. A mismatch often means zero rows changed or a stale client version; decide whether to commit, roll back, or signal conflict.',
  'Unique constraint duplicate guard': 'A unique constraint guarantees key uniqueness across concurrent writers. Application pre-checks alone race; handle the constraint violation deliberately.',
  'rowversion concurrency predicate': 'rowversion is an automatically changing 8-byte database version token, not a date/time. Include the originally read token in UPDATE/DELETE WHERE and require exactly one affected row for optimistic concurrency.',
  'Compare-and-swap update': 'Atomically changes a row only if its old value/version still matches the expected value, e.g. WHERE Id=@id AND Version=@oldVersion. Check affected rows; zero means conflict or missing row.',
  'Idempotency key': 'A unique request identifier stored under a unique constraint lets a retried request detect prior completion. Persist the key and result atomically with the business mutation.',
  'Retry after deadlock': 'SQL Server chooses a deadlock victim and rolls back its transaction; retry the whole idempotent unit with bounded backoff, not only the failed statement inside stale application state.',
  'Retry after timeout with unknown commit outcome': 'A client timeout or broken connection can occur after the server commits but before the client receives confirmation. Query by idempotency/business key or use an idempotent command before retrying.',
  'Partial batch commit': 'Earlier committed batches remain after a later batch fails unless an outer transaction covers them. Record checkpoints and make restart logic reconcile rather than blindly replay.',
  'Savepoint partial rollback': 'SAVE TRANSACTION marks a rollback point inside a transaction; rollback to it does not end the transaction and has restrictions, especially with distributed transactions. It is not independent nested commit.',
  'Bulk-load recovery-model interaction': 'Recovery model, backup chain, table/index shape, and lock options affect logging. Minimal logging still logs allocation and has operational prerequisites; it does not mean no log or no recovery planning.',
  'INSERT ... EXEC': 'Inserts the result set of a stored procedure or dynamic execution statement. The result shape must match the target columns; INSERT ... EXEC cannot be nested, so a called procedure that itself performs INSERT ... EXEC can make the outer operation fail. Prefer an explicit stable result contract.',
  'INSERT into view boundary': 'INSERT through a view is limited to updatable-view rules; multi-table views may require an INSTEAD OF trigger. A view is not automatically a writable alias for every underlying table expression.',
  'DEFAULT keyword in VALUES': 'DEFAULT asks SQL Server to use the column default; if none exists and the column is nullable, NULL is inserted. DEFAULT is not valid for an identity column and is permitted in a table value constructor only in INSERT context.',
  'UPDATE TOP unordered selection': 'UPDATE TOP limits an unordered set of qualifying rows. To update a deterministic batch, first select ordered keys in a CTE/subquery, then update rows joined to those keys.',
  'DELETE TOP unordered selection': 'DELETE TOP affects an unordered qualifying subset. For oldest-first or priority order, select TOP keys with ORDER BY inside a subquery and delete by those keys.',
  'MERGE WHEN MATCHED clause limit': 'At most two WHEN MATCHED clauses are allowed; when two appear, the first requires an AND condition and one must UPDATE while the other DELETE. Their conditions must make action selection explicit.',
  'MERGE TOP unordered action batching': 'MERGE TOP applies after joining source and target and filtering rows that have no action, then distributes affected rows among INSERT/UPDATE/DELETE without order. It is not an ordered batch selector; repeated batches can also rescan both relations and misclassify already-processed rows.',
  'DATA_SOURCE': 'Names a database-scoped external data source used for supported remote files. The associated credential, location, and permissions are configured in the database; this is not the caller’s local path.',
  'FIELDQUOTE': 'Selects the quote character for CSV parsing with FORMAT=CSV; the default is a double quote, per the documented RFC 4180 convention. Validate escaped quotes, embedded delimiters/newlines, and the producer’s CSV dialect instead of assuming every CSV variant is identical.',
  'ERRORFILE_DATA_SOURCE': 'Identifies the external data source used to write BULK INSERT error files in supported remote-storage scenarios. Azure SQL Database requires this with ERRORFILE; verify platform-specific combinations.',
  'KILOBYTES_PER_BATCH': 'Provides a data-size estimate for bulk-load batching/planning. It does not itself establish a transaction boundary; BATCHSIZE controls row batch boundaries.',
  'BULK INSERT platform option differences': 'BULK INSERT syntax, paths, authentication, and option effects vary by SQL Server, Azure SQL Database/Managed Instance, and Fabric. For example, several SQL Server load hints are accepted but have no effect in Fabric Warehouse; consult the platform matrix for the actual target.',
  'bcp character native and Unicode formats': 'bcp -c/-w use character encodings, while -n/-N use native representations with type/platform coupling. Choose encoding and terminators deliberately; do not treat native files as portable interchange formats.',
  'bcp shell quoting': 'bcp command arguments pass through the operating-system shell. Characters such as <, >, |, &, and ^ need shell-specific quoting/escaping; test a command with representative paths and credentials without exposing secrets.',
  'bcp vector -z support boundary': 'bcp -z enables vector transfer; -z0 selects float32 and -z1 selects float16. With SQL Server 2025+, enabled transfer uses native vector binary, while disabled transfer uses JSON float-array strings. -z/-z0 require bcp 18.6.1.1+ and -z1 requires bcp 18.7.1.1+; support is disabled by default.',
  'bcp client and TDS version boundary': 'SQL Server 2025 introduces TDS 8.0 support in bcp 18. The bcp executable version is independent of the server engine version; confirm client option availability and endpoint support separately.',
  'XACT_STATE transaction health': 'Returns 1 for an active committable transaction, -1 for an active uncommittable transaction, and 0 when none exists. In CATCH, use it to decide whether rollback is required; an uncommittable transaction cannot commit or roll back to a savepoint.',
  'INSERT TOP unordered selection': 'INSERT TOP limits an unordered source subset. Select deterministic source keys/rows in an ordered subquery when the chosen rows matter; an outer ORDER BY does not control which rows are inserted.',
  'OUTPUT direct-client trigger restriction': 'If OUTPUT omits INTO, the modified target cannot have an enabled trigger for that DML action. OUTPUT INTO is subject to restrictions on its destination table.',
  'OUTPUT result after statement error': 'An OUTPUT result set can be returned even when an error causes the DML statement to roll back. Discard all such client results on error and do not persist them as committed audit evidence.',
  'MERGE action search conditions': 'A WHEN clause may have a search condition that limits the action after ON classification. Put action-specific eligibility here rather than filtering target identity in ON, which Microsoft warns can produce incorrect results.',
  'OPENROWSET SINGLE_BLOB SINGLE_CLOB SINGLE_NCLOB': 'Content options expose one file as one row and one column: SINGLE_BLOB returns varbinary(max), SINGLE_CLOB returns varchar(max), and SINGLE_NCLOB returns nvarchar(max). XML needing full encoding conversion should use SINGLE_BLOB.',
  'bcp in out queryout and format modes': 'The command modes are in (file to table), out (table to file), queryout (query result to file), and format (create format metadata). Pick mode based on direction and whether the source is a table or query.',
  'bcp -c -w -n -N data formats': '-c is character data, -w is Unicode character data, -n is native data, and -N is Unicode native data. Character formats suit external interchange; native forms are efficient but SQL Server/type coupled.',
  'bcp -f and -x format files': '-f consumes or creates a format file depending on command mode. -x creates an XML format file with format mode on Windows; it is not an import/export modifier and is unsupported on Linux/macOS.',
  'bcp -b -m -e batch and error controls': '-b sets rows per batch, -m sets maximum errors, and -e writes rejected rows to an error file. Earlier successful batches may remain committed after a later failure.',
  'bcp -E and -k identity and null switches': '-E preserves supplied identity values when importing; -k keeps NULL values rather than substituting defaults. Verify target identity and nullability contracts before using them.',
  'bcp -F -L -t -r row and field controls': '-F/-L select first/last input rows; -t and -r set field and row terminators. These delimiters are not a full quoted-CSV parser.',
  'bcp server and authentication switches': '-S selects the server, -d the database, -T uses integrated authentication, -U selects a login, -P supplies a password, and -G enables Microsoft Entra authentication. Avoid exposing passwords in process arguments or shell history.',
  'bcp input and output file switches': '-i supplies a command file and -o a console-output file; -e separately stores rejected rows. Protect each file because they can contain data or diagnostics.',
  'bcp -V compatibility and -C code page': '-V requests a data-format compatibility version; -C chooses a code page for character data. Neither changes the actual engine version or validates that the file encoding matches the declared code page.',
  'bcp -a -h -q -R -v -K runtime options': '-a sets packet size, -h supplies bulk hints, -q quotes identifiers, -R uses regional date/currency settings, -v prints version, and -K sets application intent. These affect transport/connection behavior, not the relational row contract.',
  'bcp -J -Y -u encryption options': '-J selects a server certificate, -Y selects encryption behavior, and -u trusts the server certificate where supported. Confirm exact client-version/platform behavior and prefer validated TLS in production.',
  'FORMATFILE_DATA_SOURCE': 'Names the external data source that holds a remote format file. It is supported by SQL Server 2017 (14.x) and later; distinguish it from DATA_SOURCE, which identifies the data file source.',
};

const citationFor = (name) => {
  if (/^INSERT|IDENTITY_INSERT|DEFAULT keyword/.test(name)) return urls.insert;
  if (/OPENROWSET/.test(name)) return urls.openrowset;
  if (/@@ROWCOUNT|rowcount/.test(name)) return urls.rowcount;
  if (/minimal logging/i.test(name)) return urls.minimal;
  if (/XACT_STATE/.test(name)) return urls.xactState;
  if (/NOCOUNT/.test(name)) return urls.noCount;
  if (/deadlock/i.test(name)) return urls.deadlocks;
  if (/unique constraint|duplicate guard/i.test(name)) return urls.unique;
  if (/TOP/.test(name)) return urls.top;
  if (/FORMATFILE/.test(name)) return urls.format;
  if (/^UPDATE/.test(name)) return urls.update;
  if (/^DELETE/.test(name)) return urls.delete;
  if (/TRUNCATE/.test(name)) return urls.truncate;
  if (/OUTPUT|INSERTED|DELETED|DML trigger/.test(name)) return urls.output;
  if (/MERGE|upsert|Idempotent retry/.test(name)) return urls.merge;
  if (/BULK|bulk|FIELD|ROWTERMINATOR|FIRSTROW|LASTROW|ERRORFILE|MAXERRORS|TABLOCK|BATCHSIZE|KEEP|CHECK_CONSTRAINTS|FIRE_TRIGGERS|ROWS_PER_BATCH|KILOBYTES|ORDER bulk|CODEPAGE|DATAFILETYPE|CSV|FORMATFILE|DATA_SOURCE|Staging|Validate then|External data/.test(name)) return urls.bulk;
  if (/bcp/.test(name)) return urls.bcp;
  if (/transaction|XACT_ABORT|TRY|ROWCOUNT|rowversion|Compare-and-swap|constraint|Savepoint|deadlock|timeout|retry|NOCOUNT/.test(name)) return urls.transactions;
  return urls.insert;
};
const allItems = manifest.inventory.flatMap(group => group.items);
const unknown = allItems.filter(name => !descriptions[name]);
if (unknown.length) throw new Error(`Missing item descriptions: ${unknown.join(', ')}`);
const sources = (extra = []) => [...new Set([...Object.values(urls), ...extra])];
const links = (items) => items.map(name => `[${name}](${citationFor(name)})`).join(', ');
const write = async (id, body) => {
  const section = (heading, text) => `\n\n# ${heading}\n\n${text}\n`;
  const extras = {
    overview: section('When to use it and tradeoffs', 'Use ordinary DML for selective transactional changes that require row-level logic. Use bulk ingestion when volume makes row-by-row statements impractical, but keep staging and validation. Use MERGE only when its concurrency behavior and source cardinality are proved; separate statements can be easier to test.') + section('What later lessons cover', 'Constraints, transaction isolation, indexes, stored procedures, and trigger implementation receive their own lessons. This topic covers only the interactions needed to reason safely about writes.'),
    concepts: section('Core concepts', 'A write contract defines target identity, source cardinality, allowed transition, success evidence, and retry/recovery behavior. Constraints protect invariants across writers; output and row counts report different kinds of evidence.') + section('Learning objectives', 'Choose the DML shape, guarantee source cardinality, interpret OUTPUT and @@ROWCOUNT, analyze MERGE and retry races, choose a bulk ingestion boundary, and define transaction/recovery behavior.') + section('Prerequisites', 'Know SELECT predicates and joins, keys, basic transaction syntax, and SQL NULL behavior. Dedicated lessons cover complete locking/isolation semantics, trigger authoring, and constraint design.') + section('Mechanisms and relationships', 'INSERT/UPDATE/DELETE change rows; OUTPUT exposes statement images; triggers may subsequently change final state. MERGE uses ON to classify rows and WHEN to choose an action. Bulk tools parse bytes into rows and batches. rowversion detects stale reads; idempotency keys recover unknown outcomes.') + section('Worked examples', 'Use UPDATE with `WHERE Id = @id AND RowVersion = @originalVersion`, capture OUTPUT DELETED/INSERTED values, then capture @@ROWCOUNT immediately. For a target with an enabled UPDATE trigger, use OUTPUT INTO. Discard output on error ([OUTPUT behavior](' + urls.output + ')).') + section('Misconceptions and edge cases', '- OUTPUT is not a durable commit receipt.\n- UPDATE FROM with multiple candidate source values is undefined.\n- MERGE is not automatically serializable.\n- FIRSTROW does not understand CSV header names.\n- BATCHSIZE and ROWS_PER_BATCH differ.\n- A client timeout does not reveal whether the server committed.') + section('Knowledge checks with answers', '1. A missing WHERE can affect every row.\n2. OUTPUT INSERTED is observed before triggers.\n3. Zero rows in a rowversion update means missing or stale.\n4. BATCHSIZE does not undo earlier committed batches.\n5. NOT MATCHED BY SOURCE is unsafe for partial feeds.'),
    practice: section('Goals', 'Practice safe target selection, source cardinality, output timing, merge concurrency, bulk failure recovery, and retry semantics.') + section('Worked example', 'A compare-and-swap update uses `WHERE EntityId=@id AND Version=@originalVersion`, then immediately captures @@ROWCOUNT; zero indicates a missing or stale row. If an enabled trigger exists, use OUTPUT INTO. On error, discard any output ([OUTPUT](' + urls.output + ')).') + section('Progressive hints', '1. Identify the key and expected row count.\n2. Prove source keys are unique.\n3. Select ordered TOP keys before deleting.\n4. Distinguish known rollback from unknown timeout outcome.\n5. Separate file parsing from validation and transaction scope.') + section('Complete solutions', 'A concise worked answer for each of the 15 exercises appears in the “Short answer key” section above. The answers specify target grain, concurrency requirement, and failure boundary where relevant.') + section('Reflection questions', 'Which invariant belongs in a unique constraint? What evidence says a write committed? How will replay behave after response loss? Which batch may remain committed after failure? How can rejected sensitive rows be protected?'),
    interview: section('Core questions', 'Explain target identity, source cardinality, observation timing, concurrent writes, and recovery after partial or unknown outcome.') + section('Concise interview answers', 'INSERT names columns; UPDATE FROM source must be unique per target; OUTPUT is before triggers and provisional; MERGE requires unique keys and tested concurrency; BULK INSERT and bcp access files as different principals; BATCHSIZE sets batch boundaries; rowversion is a concurrency token; idempotency keys resolve unknown outcomes.') + section('Deep follow-up answers', 'OUTPUT rows can be returned even if a statement errors and rolls back; discard them on error. MERGE source duplicates and filtered NOT MATCHED BY SOURCE are hazards. HOLDLOCK may protect key ranges with blocking costs, while unique constraints enforce the invariant ([MERGE](' + urls.merge + ')). Bulk ingestion requires correct file principal, parser, validation, and partial-failure recovery ([BULK INSERT](' + urls.bulk + ')).') + section('Tradeoffs and alternatives', 'MERGE compresses match/action logic but separate DML can be easier to reason about under concurrency. OUTPUT gives row images; @@ROWCOUNT gives a count. Compare-and-swap detects stale writes; idempotency keys detect replays.') + section('Common weak answers', '- “MERGE is one statement, so it cannot race.”\n- “OUTPUT returned, so it committed.”\n- “FIRSTROW skips CSV headers correctly.”\n- “A pre-check prevents duplicates.”\n- “A timeout means rollback.”\n- “rowversion tells when the row changed.”') + section('Self-check rubric', 'Score 0–2 for target identity; deterministic source; OUTPUT/trigger/error timing; MERGE concurrency; file principal/parser/validation; batch recovery; constraint/rowversion use; and known versus unknown retry outcome.'),
  };
  if (id.startsWith('reference-')) {
    extras[id] = section('Scope and version', 'Target SQL Server 2025 (17.x) unless an entry says otherwise. SQL Server 2017 added BULK INSERT CSV support; bcp 18+ adds client-side features ([BULK INSERT](' + urls.bulk + '), [bcp](' + urls.bcp + ')).') + section('How this group fits the mental model', 'Separate target selection, row-image observation, match/action policy, file transport, and transaction outcome. They are related but provide different guarantees.') + section('Supplied names explained', 'The item-by-item table above explains every exact inventory name for this group.') + section('Cross-item comparison', 'INSERT creates rows, UPDATE changes them, DELETE removes selected rows, TRUNCATE removes all under different restrictions. OUTPUT returns images; @@ROWCOUNT returns a count. BULK INSERT is server-side, bcp client-side, and OPENROWSET(BULK...) exposes a rowset.') + section('Examples', 'Use ordered key selection in a subquery before applying TOP to a batch DELETE; DML TOP itself does not order affected rows.') + section('Common mistakes', '- Treating OUTPUT as proof of commit.\n- Assuming duplicate update sources are deterministic.\n- Using partial snapshots with NOT MATCHED BY SOURCE.\n- Treating FIRSTROW as CSV-aware.\n- Assuming BATCHSIZE only changes speed.') + section('Knowledge checks with answers', '1. INSERT OUTPUT cannot refer to DELETED.\n2. Direct OUTPUT is disallowed for a target with an enabled same-action trigger.\n3. TRUNCATE does not fire DELETE triggers.\n4. Duplicate UPDATE sources are undefined.\n5. Capture @@ROWCOUNT immediately.');
  }
  if (id === 'practice') {
    extras.practice = '';
    body = body.replace('# Exercises', '# Goals\n\nPractice safe target selection, source cardinality, output timing, merge concurrency, bulk failure recovery, and retry semantics.\n\n# Exercises');
    body = body.replace('# Exercises\n\n1.', '# Exercises\n\n1.');
    body = body.replace('# Short answer key', '# Complete solutions');
    body = body.replace('# Tests and edge cases', '# Worked example\n\nA compare-and-swap update uses `WHERE EntityId=@id AND Version=@originalVersion`, then captures @@ROWCOUNT immediately; zero indicates a missing or stale row. With an enabled trigger, use OUTPUT INTO; discard staged output on error ([OUTPUT](' + urls.output + ')).\n\n# Progressive hints\n\n1. Identify the key and expected row count.\n2. Prove source keys are unique.\n3. Select ordered TOP keys before deleting.\n4. Distinguish a known rollback from an unknown timeout outcome.\n5. Separate parsing from validation and commit scope.\n\n# Tests and edge cases');
    body = body.replace('# Sources', '# Reflection questions\n\nWhich invariant belongs in a unique constraint? What evidence says a write committed? How will replay behave after response loss? Which batch may remain committed after failure? How can rejected sensitive rows be protected?\n\n# Sources');
  }
  if (id === 'interview') {
    body = body.replace('# Short-answer questions', '# Core questions').replace('# Answer guidance', '# Concise interview answers');
    extras.interview = extras.interview.slice(extras.interview.indexOf('\n\n# Deep follow-up answers'));
  }
  const rendered = body.replace('# Sources', `${extras[id] ?? ''}\n# Sources`).replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
  await fs.writeFile(`course/drafts/t03-006/t03-006-${id}.md`, rendered);
};
await fs.mkdir('course/drafts/t03-006', { recursive: true });

const title = manifest.title;
const sourceList = sources().map(u => `- ${u}`).join('\n');
await write('overview', `# ${title} — Big-picture orientation and mental model

# Problem and purpose

Data modification is where query correctness becomes persistent state. INSERT adds rows; UPDATE changes selected rows; DELETE removes selected rows; MERGE chooses actions from a match relation; bulk tools trade row-by-row control for throughput. Correctness depends on identifying the intended target keys, respecting constraints and triggers, and defining what happens when a request races, fails, or is retried.

# Plain-language mental model

Treat each write as a contract: which keys may change, which values are authoritative, what counts as success, and how the caller learns the outcome. A predicate is the address of the write. A unique constraint is the database’s concurrency-safe identity rule. A transaction makes database steps atomic, but it cannot make a client timeout reveal whether the server committed. OUTPUT is a row image captured at a specific point in trigger timing, not a durable success receipt.

Bulk loading adds a second boundary: file parsing and storage access happen in the engine or client process, and batches may commit independently. Stage untrusted input, validate it, then promote it according to an explicit transaction and replay policy.

# How the parts fit together

1. Define the target key and affected-row expectation before writing the DML.
2. Use explicit target columns, deterministic source joins, and a predicate tied to a key or version.
3. Keep uniqueness and other invariants in database constraints; an application pre-check is not concurrency control.
4. Use OUTPUT when row images matter, while accounting for trigger timing, rollback, and output-target restrictions.
5. Choose MERGE only after proving source uniqueness, action scope, concurrency behavior, trigger interactions, and build support.
6. For file ingestion, choose BULK INSERT, OPENROWSET(BULK...), or bcp based on where data and credentials live; stage, validate, and promote.
7. Define batch/transaction boundaries and recovery behavior before enabling retries.

# Concept map

| Need | Main construct | Main correctness question |
| --- | --- | --- |
| Add rows from values or query | INSERT | Are target columns, defaults, identity values, and duplicates explicit? |
| Change selected values | UPDATE | Can each target receive exactly one deterministic source value? |
| Remove selected rows | DELETE | Does the predicate address exactly the intended keys? |
| Synchronize a source and target | MERGE or separate DML | Are match semantics and concurrent schedules safe? |
| Return affected row images | OUTPUT | Is the image before/after triggers, and can failed output be discarded? |
| Load a file | BULK INSERT, OPENROWSET, bcp | Which process reads the file, and what does a failed batch leave behind? |
| Detect concurrent change | rowversion / compare-and-swap | Does the write require the version the caller actually read? |
| Safely retry uncertain requests | Idempotency key | Can a replay be recognized after the original commit? |

# End-to-end walkthrough

Suppose an application edits an order after reading its rowversion. The UPDATE includes both OrderId and the original rowversion. It captures @@ROWCOUNT immediately: one means the guarded update succeeded; zero means missing or changed state. If the connection times out, the client does not blindly repeat a non-idempotent side effect; it checks the command’s idempotency key. For a nightly CSV import, bulk-load into staging with a batch identifier and rejected-row handling, validate the full contract, then promote keys under a transaction with unique constraints. The transport completing is not equivalent to business data being accepted.

# Version and platform boundaries

SQL Server 2017 (14.x) added CSV format support, FIELDQUOTE, and remote format-file data-source support to BULK INSERT. In SQL Server 2025, bcp 18 adds TDS 8.0; vector transfer switches require bcp 18.6.1.1 for -z/-z0 and 18.7.1.1 for -z1. These are client utility capabilities, not generic engine syntax. BULK INSERT paths, authentication, and supported options differ across SQL Server, Azure SQL, and Fabric. MERGE is supported but Microsoft advises thorough concurrency testing and notes that separate DML may perform better under heavy concurrency. See the [BULK INSERT platform matrix](${urls.bulk}), [bcp utility](${urls.bcp}), and [MERGE concurrency guidance](${urls.merge}).

# What the references cover

The references cover row DML and OUTPUT, MERGE/upsert, bulk ingestion, and transaction/retry design. Practice combines them with failure and concurrency cases; the interview lesson tests semantic choices. Transaction isolation internals, triggers as a programming topic, and schema constraints are covered elsewhere, but their interaction with writes is included here.

# Sources

${sourceList}
`);

await write('concepts', `# ${title} — Core concepts and how they fit together

# 1. A write has a target set and a result contract

In SQL Server, an UPDATE or DELETE affects every row its predicate qualifies. A predicate that returns the expected number on a sample is not enough: write down the unique key and expected count, then make those visible in the query. For UPDATE FROM, each target column must have at most one source value; if the join produces multiple candidates, SQL Server documents the result as undefined. Reduce source rows deterministically (with an explicit business ordering and tie-breaker) before updating. [UPDATE semantics](${urls.update})

Always write INSERT’s target column list. Omitted columns can use defaults or NULL only when schema rules permit. Explicit identity insertion is a session-scoped exception, not a normal import strategy. DML without a limiting predicate can alter the whole table. TOP does not choose rows in order; select ordered keys in a subquery if a repeatable batch is required. [INSERT](${urls.insert}) · [DELETE](${urls.delete})

# 2. OUTPUT is a row image, not a commit acknowledgment

For UPDATE, DELETED is the pre-change image and INSERTED is the post-statement image. For INSERT only INSERTED applies; for DELETE only DELETED applies. The output reflects statement processing before triggers. An INSTEAD OF trigger can make the output look as if a modification occurred even when the trigger performed none. More subtly, OUTPUT rows can be sent even when a statement errors and rolls back; discard them on error. Direct OUTPUT to the client is disallowed when the target has an enabled trigger for that action; OUTPUT INTO has its own target restrictions. Order is never promised. Capture @@ROWCOUNT immediately; later statements overwrite it. [OUTPUT](${urls.output})

# 3. MERGE matching is not automatically an atomic upsert policy

ON defines identity matching. Keep it about stable source-target key correspondence; a target filter placed there can turn an existing target into a “missing” row and lead to an attempted insert. Make source keys unique before matching. One target matched by multiple source rows cannot receive multiple UPDATE/DELETE actions and causes an error. WHEN NOT MATCHED BY SOURCE can delete targets excluded from a partial or filtered source. MERGE must end with a semicolon. The $action output reports action kind but has no order guarantee. [MERGE syntax and guidance](${urls.merge})

The match and action decision is still exposed to concurrency. A concurrent writer can invalidate a not-matched decision; a unique key constraint is essential. HOLDLOCK gives serializable range protection for the referenced table in appropriate patterns, with blocking costs. Microsoft recommends heavy-concurrency testing; separate UPDATE/INSERT/DELETE may be clearer or perform better. A unique constraint plus a transaction-aware pattern is the invariant; MERGE itself is not a universal concurrency shield. [MERGE concurrency](${urls.merge})

# 4. File ingestion is a parser, security boundary, and transaction design

BULK INSERT runs from the Database Engine’s perspective: local paths must be accessible to its process, while cloud sources need supported external data source and credentials. bcp runs as a client and sees client-side paths. OPENROWSET(BULK...) exposes a file rowset and has separate server configuration. Do not conflate their credentials or deployment support. [BULK INSERT](${urls.bulk}) · [bcp](${urls.bcp})

Choose format deliberately. CSV parsing handles quoting and field quotes; FIELDTERMINATOR alone does not parse CSV. FIRSTROW is a physical row offset and is not a header-aware parser; skipped rows are not validated field-by-field. CODEPAGE, DATAFILETYPE, row terminators, format files, and type conversions are part of the data contract. Test commas, quotes, embedded newlines, Unicode, decimal formatting, empty strings, and NULL distinctly. [BULK INSERT format options](${urls.bulk})

ERRORFILE captures rows with formatting/conversion errors, but it is not a full business validation system. MAXERRORS does not bound all constraint or conversion failures. Load into staging, preserve file/batch identity and raw data where appropriate, validate business constraints, and promote under the intended uniqueness and transaction rules. CHECK_CONSTRAINTS and FIRE_TRIGGERS affect load behavior; platform matrices matter. [Bulk validation options](${urls.bulk})

# 5. Batches, logging, and recovery are coupled

BATCHSIZE creates separate transaction units when no outer user transaction encloses the load. Earlier batches may remain committed after a later failure. With an outer transaction, a rollback can undo batches, but locks and log retention grow. TABLOCK, recovery model, indexes, and target conditions affect minimal logging eligibility; bulk loading is never “no logging.” ROWS_PER_BATCH is an estimate, not a commit boundary. A false ORDER declaration does not sort or validate the file. [Bulk transaction and logging behavior](${urls.bulk}) · [Minimal logging prerequisites](${urls.minimal})

# 6. Optimistic concurrency and retry semantics

rowversion is an automatically generated binary version token; it is not a timestamp. Include the original token in the write predicate and require one affected row. This compare-and-swap pattern detects stale reads. A unique constraint, not “check then insert,” closes concurrent duplicate races. [rowversion](${urls.rowversion})

Use a transaction for database actions that must commit together. SET XACT_ABORT ON causes many runtime errors to terminate and roll back the transaction; TRY/CATCH can inspect XACT_STATE and clean up. Neither handles a lost connection as proof of outcome. A deadlock victim’s transaction was rolled back and may be retried as a whole idempotent unit. A timeout may occur after commit, so an idempotency key stored atomically with the mutation lets a caller determine whether a retry is safe. Savepoints are rollback markers inside a transaction, not nested independent commits. [Transactions](${urls.transactions}) · [XACT_ABORT](${urls.xact}) · [TRY/CATCH](${urls.trycatch})

# Version and platform notes

BULK INSERT CSV support, FIELDQUOTE, and FORMATFILE_DATA_SOURCE begin in SQL Server 2017. In SQL Server 2025, bcp 18 adds TDS 8.0; -z/-z0 require bcp 18.6.1.1 and -z1 requires 18.7.1.1. Engine and utility version must be checked separately. BULK INSERT option applicability differs by platform, so do not transfer a SQL Server example uncritically to Azure SQL or Fabric. [BULK INSERT](${urls.bulk}) · [bcp](${urls.bcp})

# Sources

${sourceList}
`);

for (const group of manifest.inventory) {
  const rows = group.items.map(item => `| \`${item.replaceAll('|', '\\|')}\` | ${descriptions[item]} ([source](${citationFor(item)})) |`).join('\n');
  await write(`reference-${group.id}`, `# ${title} — Reference: ${group.title}

# Scope

This reference explains every frozen manifest entry in **${group.title}**. It targets SQL Server Database Engine semantics unless the item explicitly identifies a client utility or platform boundary. The inventory is authoritative for this lesson; a similarly named Fabric/Azure feature is not presumed to behave identically.

# Item-by-item reference

| Exact inventory item | Meaning and practical boundary |
| --- | --- |
${rows}

# Reasoning checks

1. Name the keys and expected row count before executing a write.
2. For source-driven updates and MERGE, prove one source match per target key.
3. For OUTPUT, state which row image is used, when triggers run, and how errors/rollback invalidate client output.
4. For file loads, identify the process that reads the file, the format/parser, and the security principal.
5. State the batch commit and restart behavior, including whether any earlier batch can remain committed.
6. Explain how duplicate prevention, stale-write detection, and timeout retries are enforced by database invariants and idempotency.

# Sources

${sourceList}
`);
}

const practice = `# ${title} — Exercises and worked solutions

# Exercises

1. Insert two products while omitting an identity and preserving explicit column mapping.
2. Insert qualifying staging rows while skipping duplicates according to a unique business key. Explain why pre-check alone is insufficient under concurrency.
3. Update a target from a source that can contain duplicate keys. Make the source deterministic before the UPDATE.
4. Delete old queue rows in batches of 500 in deterministic creation-time/key order.
5. Return old and new values from an UPDATE with an enabled trigger. Capture them legally and explain trigger timing.
6. Explain why OUTPUT rows must be ignored if the statement reports an error.
7. Write a MERGE that updates matched product price and inserts new products; define the unique key and source deduplication.
8. Safely deactivate target rows absent from a full authoritative source. Contrast with filtered-source danger.
9. A MERGE fails because one target matches two source rows. Repair the source contract.
10. Explain a concurrent not-matched race and how a unique constraint/HOLDLOCK changes the invariant and blocking.
11. Bulk load CSV using an engine-readable Azure data source, skipping the physical header and capturing parse errors. State the header caveat.
12. Distinguish BATCHSIZE from ROWS_PER_BATCH and describe partial commits.
13. Preserve imported NULLs rather than defaults and request trigger/constraint checks. Name the relevant options.
14. An application update uses a rowversion token and reports affected count. Write the compare-and-swap predicate and interpret zero.
15. A request times out after possibly committing an order. Design a retry-safe idempotency-key flow.

# Short answer key

1. \`INSERT dbo.Product (Sku, Name) VALUES (N'P-101', N'Cable'), (N'P-102', N'Adapter');\` Explicit columns omit the generated identity.
2. Enforce a unique index on BusinessKey. A pattern is \`INSERT dbo.Target (BusinessKey, Value) SELECT s.BusinessKey, s.Value FROM dbo.Stage AS s WHERE NOT EXISTS (SELECT 1 FROM dbo.Target AS t WITH (UPDLOCK, HOLDLOCK) WHERE t.BusinessKey = s.BusinessKey);\` The unique index remains the final guard; handle duplicate-key errors because other write paths may race.
3. \`WITH ranked AS (SELECT s.*, ROW_NUMBER() OVER (PARTITION BY ProductId ORDER BY SourcePriority DESC, UpdatedAt DESC, SourceRowId DESC) AS rn FROM dbo.StagePrice AS s) UPDATE p SET Price = r.Price FROM dbo.Product AS p JOIN ranked AS r ON r.ProductId = p.ProductId AND r.rn = 1;\` The last key makes ties deterministic; validate source types and intended priority.
4. \`WITH batch AS (SELECT TOP (500) QueueId FROM dbo.WorkQueue WHERE Status = N'Complete' ORDER BY CreatedAt, QueueId) DELETE q FROM dbo.WorkQueue AS q JOIN batch AS b ON b.QueueId = q.QueueId;\` The key resolves timestamp ties.
5. Use \`DECLARE @Changed TABLE (OldValue nvarchar(200), NewValue nvarchar(200)); UPDATE dbo.Product SET Name=@NewName OUTPUT DELETED.Name, INSERTED.Name INTO @Changed WHERE ProductId=@Id;\` Direct OUTPUT is disallowed with an enabled UPDATE trigger. The images are before trigger effects; use a transactional audit design if final committed state is required, and do not expose staged OUTPUT values after rollback.
6. SQL Server can return OUTPUT rows even when an error rolls back the DML. An error means those rows are not a success receipt.
7. \`MERGE dbo.Product WITH (HOLDLOCK) AS t USING dbo.StageProduct AS s ON t.ProductId=s.ProductId WHEN MATCHED THEN UPDATE SET Price=s.Price WHEN NOT MATCHED BY TARGET THEN INSERT (ProductId, Price) VALUES (s.ProductId, s.Price);\` Ensure source uniqueness and a target unique constraint; HOLDLOCK’s concurrency cost must be tested. A duplicate source row matching an UPDATE target raises an error.
8. With a complete snapshot, scope the target set and use \`WHEN NOT MATCHED BY SOURCE AND target.IsActive = 1 THEN UPDATE SET IsActive = 0\`; a partial feed falsely makes omitted targets appear absent. For partial feeds, omit this action.
9. The documented error occurs when multiple source rows would UPDATE the same target row. Enforce one source row per key through validation, aggregation, or a deterministic ROW_NUMBER policy; never let arbitrary input order choose.
10. A unique constraint prevents duplicate state; suitable SERIALIZABLE/HOLDLOCK range protection may prevent a race but costs concurrency and requires test.
11. \`BULK INSERT dbo.ImportStage FROM 'daily/orders.csv' WITH (DATA_SOURCE='OrdersBlob', FORMAT='CSV', FIRSTROW=2, FIELDQUOTE='"', ERRORFILE='daily/orders-rejects', ERRORFILE_DATA_SOURCE='OrdersBlob', BATCHSIZE=50000);\` Credentials/external-source configuration is separate. FIRSTROW skips physical rows and does not parse or validate the header.
12. BATCHSIZE defines batch/transaction boundaries when no outer transaction exists. ROWS_PER_BATCH is a hint/estimate and does not split work. Earlier batches may remain committed.
13. KEEPNULLS retains NULLs; CHECK_CONSTRAINTS requests constraint checks; FIRE_TRIGGERS requests insert triggers for bulk rows. Verify platform behavior.
14. \`UPDATE dbo.Entity SET Value=@value WHERE EntityId=@id AND Version=@originalVersion; DECLARE @rows int = @@ROWCOUNT;\` Capture immediately; zero means missing or stale, one means the guarded write matched, and a value greater than one signals a broken uniqueness assumption.
15. In one database transaction, insert the caller’s unique RequestId and apply the order mutation, then persist the response/result. If duplicate RequestId is detected on retry, read and return the prior result. If a side effect is external, use an outbox or an independently idempotent downstream key; a database transaction cannot atomically commit an arbitrary network call.

# Tests and edge cases

Test zero/multiple target matches, duplicate source keys, NULL and collation behavior, trigger side effects, OUTPUT followed by rollback, TOP ordering, concurrent upserts, stale rowversion, deadlock retry, unknown timeout outcome, CSV embedded quotes/newlines/Unicode, missing and malformed columns, rejected-row privacy, constraint trust, identity collisions, partial batch failure, and outer-transaction rollback.

# Sources

${sourceList}
`;
await write('practice', practice);

const interview = `# ${title} — Interview questions and reasoning

# Short-answer questions

1. Why always write an INSERT target column list?
2. What is undefined about UPDATE FROM with multiple source matches?
3. Why is OUTPUT not a commit acknowledgment?
4. What is the difference between INSERTED and DELETED in OUTPUT?
5. Why does TOP in DELETE not guarantee oldest-first deletion?
6. What key belongs in MERGE ON, and what does NOT MATCHED BY SOURCE mean?
7. How can duplicate source keys break MERGE?
8. Is MERGE automatically safe for concurrent upsert?
9. What does HOLDLOCK buy and cost?
10. Which process needs file access for BULK INSERT versus bcp?
11. Does FIRSTROW understand CSV headers?
12. BATCHSIZE versus ROWS_PER_BATCH?
13. What does rowversion represent?
14. Why can timeout retry duplicate a committed write?
15. What belongs in an idempotency key design?

# Answer guidance

1. It binds values to named columns despite schema changes and makes omitted defaults/identity behavior explicit.
2. SQL Server cannot define which candidate supplies a target value; deduplicate deterministically to one source row per target.
3. OUTPUT is produced before triggers and may be returned even after an error causes rollback; discard on failure.
4. INSERTED is the inserted/new image; DELETED is the removed/old image. UPDATE can use both. Neither includes subsequent trigger changes.
5. TOP chooses an unordered subset. Use ordered keys in a subquery then delete those keys.
6. ON should match stable identity. NOT MATCHED BY SOURCE identifies target rows absent from the supplied source, which can be dangerous for filtered snapshots.
7. Multiple source matches to one target can raise an error for UPDATE/DELETE; duplicate missing source keys can attempt repeated inserts.
8. No. Unique constraints and a tested locking/transaction design are needed; separate DML can be preferable under concurrency.
9. HOLDLOCK is SERIALIZABLE for the referenced table and can preserve key-range decisions; it increases blocking and still needs proper keys and constraints.
10. BULK INSERT file access is by the Database Engine/service-side credential context; bcp reads the file as the client process.
11. No. FIRSTROW is a physical offset; fields in skipped lines are not validated as CSV headers.
12. BATCHSIZE splits transactional work; ROWS_PER_BATCH is an estimate/hint and does not define commit boundaries.
13. An automatically changing 8-byte binary version token; it is not a wall-clock timestamp.
14. The server may commit before the response is lost. The client cannot infer rollback from its own timeout.
15. A unique durable request key, atomically persisted with the mutation and a retrievable outcome, plus a clear conflict/replay policy.

# Scenario questions

1. **OUTPUT shows an inserted identity, then the statement reports an error.** Explain why the output is discarded and why it is not proof of committed state.
2. **A MERGE causes duplicate-key errors only in production.** Analyze concurrent missing-key checks, source uniqueness, and target constraints; propose a transaction-safe pattern.
3. **A nightly load failed halfway through.** Determine whether batches committed, identify file/batch checkpoints, and design reconciliation before replay.
4. **A user saves a stale form.** Use rowversion compare-and-swap and report a conflict when no row matches.
5. **A feed omits a region due to filtering, but MERGE deactivates all targets absent from source.** Explain why NOT MATCHED BY SOURCE is unsafe for a partial feed.

# Sources

${sourceList}
`;
await write('interview', interview);

console.log(`Wrote ${manifest.inventory.length} exact-inventory references covering ${allItems.length} items, plus overview, concepts, practice, and interview.`);
