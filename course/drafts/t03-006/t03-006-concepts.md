# inserts updates deletes merges and bulk operations — Core concepts and how they fit together

# 1. A write has a target set and a result contract

In SQL Server, an UPDATE or DELETE affects every row its predicate qualifies. A predicate that returns the expected number on a sample is not enough: write down the unique key and expected count, then make those visible in the query. For UPDATE FROM, each target column must have at most one source value; if the join produces multiple candidates, SQL Server documents the result as undefined. Reduce source rows deterministically (with an explicit business ordering and tie-breaker) before updating. [UPDATE semantics](https://learn.microsoft.com/en-us/sql/t-sql/queries/update-transact-sql?view=sql-server-ver17)

Always write INSERT’s target column list. Omitted columns can use defaults or NULL only when schema rules permit. Explicit identity insertion is a session-scoped exception, not a normal import strategy. DML without a limiting predicate can alter the whole table. TOP does not choose rows in order; select ordered keys in a subquery if a repeatable batch is required. [INSERT](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17) · [DELETE](https://learn.microsoft.com/en-us/sql/t-sql/statements/delete-transact-sql?view=sql-server-ver17)

# 2. OUTPUT is a row image, not a commit acknowledgment

For UPDATE, DELETED is the pre-change image and INSERTED is the post-statement image. For INSERT only INSERTED applies; for DELETE only DELETED applies. The output reflects statement processing before triggers. An INSTEAD OF trigger can make the output look as if a modification occurred even when the trigger performed none. More subtly, OUTPUT rows can be sent even when a statement errors and rolls back; discard them on error. Direct OUTPUT to the client is disallowed when the target has an enabled trigger for that action; OUTPUT INTO has its own target restrictions. Order is never promised. Capture @@ROWCOUNT immediately; later statements overwrite it. [OUTPUT](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)

# 3. MERGE matching is not automatically an atomic upsert policy

ON defines identity matching. Keep it about stable source-target key correspondence; a target filter placed there can turn an existing target into a “missing” row and lead to an attempted insert. Make source keys unique before matching. One target matched by multiple source rows cannot receive multiple UPDATE/DELETE actions and causes an error. WHEN NOT MATCHED BY SOURCE can delete targets excluded from a partial or filtered source. MERGE must end with a semicolon. The $action output reports action kind but has no order guarantee. [MERGE syntax and guidance](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)

The match and action decision is still exposed to concurrency. A concurrent writer can invalidate a not-matched decision; a unique key constraint is essential. HOLDLOCK gives serializable range protection for the referenced table in appropriate patterns, with blocking costs. Microsoft recommends heavy-concurrency testing; separate UPDATE/INSERT/DELETE may be clearer or perform better. A unique constraint plus a transaction-aware pattern is the invariant; MERGE itself is not a universal concurrency shield. [MERGE concurrency](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)

# 4. File ingestion is a parser, security boundary, and transaction design

BULK INSERT runs from the Database Engine’s perspective: local paths must be accessible to its process, while cloud sources need supported external data source and credentials. bcp runs as a client and sees client-side paths. OPENROWSET(BULK...) exposes a file rowset and has separate server configuration. Do not conflate their credentials or deployment support. [BULK INSERT](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17) · [bcp](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)

Choose format deliberately. CSV parsing handles quoting and field quotes; FIELDTERMINATOR alone does not parse CSV. FIRSTROW is a physical row offset and is not a header-aware parser; skipped rows are not validated field-by-field. CODEPAGE, DATAFILETYPE, row terminators, format files, and type conversions are part of the data contract. Test commas, quotes, embedded newlines, Unicode, decimal formatting, empty strings, and NULL distinctly. [BULK INSERT format options](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)

ERRORFILE captures rows with formatting/conversion errors, but it is not a full business validation system. MAXERRORS does not bound all constraint or conversion failures. Load into staging, preserve file/batch identity and raw data where appropriate, validate business constraints, and promote under the intended uniqueness and transaction rules. CHECK_CONSTRAINTS and FIRE_TRIGGERS affect load behavior; platform matrices matter. [Bulk validation options](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)

# 5. Batches, logging, and recovery are coupled

BATCHSIZE creates separate transaction units when no outer user transaction encloses the load. Earlier batches may remain committed after a later failure. With an outer transaction, a rollback can undo batches, but locks and log retention grow. TABLOCK, recovery model, indexes, and target conditions affect minimal logging eligibility; bulk loading is never “no logging.” ROWS_PER_BATCH is an estimate, not a commit boundary. A false ORDER declaration does not sort or validate the file. [Bulk transaction and logging behavior](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17) · [Minimal logging prerequisites](https://learn.microsoft.com/en-us/sql/relational-databases/import-export/prerequisites-for-minimal-logging-in-bulk-import?view=sql-server-ver17)

# 6. Optimistic concurrency and retry semantics

rowversion is an automatically generated binary version token; it is not a timestamp. Include the original token in the write predicate and require one affected row. This compare-and-swap pattern detects stale reads. A unique constraint, not “check then insert,” closes concurrent duplicate races. [rowversion](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17)

Use a transaction for database actions that must commit together. SET XACT_ABORT ON causes many runtime errors to terminate and roll back the transaction; TRY/CATCH can inspect XACT_STATE and clean up. Neither handles a lost connection as proof of outcome. A deadlock victim’s transaction was rolled back and may be retried as a whole idempotent unit. A timeout may occur after commit, so an idempotency key stored atomically with the mutation lets a caller determine whether a retry is safe. Savepoints are rollback markers inside a transaction, not nested independent commits. [Transactions](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver17) · [XACT_ABORT](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-xact-abort-transact-sql?view=sql-server-ver17) · [TRY/CATCH](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/try-catch-transact-sql?view=sql-server-ver17)

# Version and platform notes

BULK INSERT CSV support, FIELDQUOTE, and FORMATFILE_DATA_SOURCE begin in SQL Server 2017. In SQL Server 2025, bcp 18 adds TDS 8.0; -z/-z0 require bcp 18.6.1.1 and -z1 requires 18.7.1.1. Engine and utility version must be checked separately. BULK INSERT option applicability differs by platform, so do not transfer a SQL Server example uncritically to Azure SQL or Fabric. [BULK INSERT](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17) · [bcp](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17)

# Core concepts

A write contract defines target identity, source cardinality, allowed transition, success evidence, and retry/recovery behavior. Constraints protect invariants across writers; output and row counts report different kinds of evidence.

# Learning objectives

Choose the DML shape, guarantee source cardinality, interpret OUTPUT and @@ROWCOUNT, analyze MERGE and retry races, choose a bulk ingestion boundary, and define transaction/recovery behavior.

# Prerequisites

Know SELECT predicates and joins, keys, basic transaction syntax, and SQL NULL behavior. Dedicated lessons cover complete locking/isolation semantics, trigger authoring, and constraint design.

# Mechanisms and relationships

INSERT/UPDATE/DELETE change rows; OUTPUT exposes statement images; triggers may subsequently change final state. MERGE uses ON to classify rows and WHEN to choose an action. Bulk tools parse bytes into rows and batches. rowversion detects stale reads; idempotency keys recover unknown outcomes.

# Worked examples

Use UPDATE with `WHERE Id = @id AND RowVersion = @originalVersion`, capture OUTPUT DELETED/INSERTED values, then capture @@ROWCOUNT immediately. For a target with an enabled UPDATE trigger, use OUTPUT INTO. Discard output on error ([OUTPUT behavior](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)).

# Misconceptions and edge cases

- OUTPUT is not a durable commit receipt.
- UPDATE FROM with multiple candidate source values is undefined.
- MERGE is not automatically serializable.
- FIRSTROW does not understand CSV header names.
- BATCHSIZE and ROWS_PER_BATCH differ.
- A client timeout does not reveal whether the server committed.

# Knowledge checks with answers

1. A missing WHERE can affect every row.
2. OUTPUT INSERTED is observed before triggers.
3. Zero rows in a rowversion update means missing or stale.
4. BATCHSIZE does not undo earlier committed batches.
5. NOT MATCHED BY SOURCE is unsafe for partial feeds.

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
