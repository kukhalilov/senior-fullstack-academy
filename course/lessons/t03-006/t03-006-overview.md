# inserts updates deletes merges and bulk operations — Big-picture orientation and mental model

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

SQL Server 2017 (14.x) added CSV format support, FIELDQUOTE, and remote format-file data-source support to BULK INSERT. In SQL Server 2025, bcp 18 adds TDS 8.0; vector transfer switches require bcp 18.6.1.1 for -z/-z0 and 18.7.1.1 for -z1. These are client utility capabilities, not generic engine syntax. BULK INSERT paths, authentication, and supported options differ across SQL Server, Azure SQL, and Fabric. MERGE is supported but Microsoft advises thorough concurrency testing and notes that separate DML may perform better under heavy concurrency. See the [BULK INSERT platform matrix](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17), [bcp utility](https://learn.microsoft.com/en-us/sql/tools/bcp/bcp-utility?view=sql-server-ver17), and [MERGE concurrency guidance](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17).

# What the references cover

The references cover row DML and OUTPUT, MERGE/upsert, bulk ingestion, and transaction/retry design. Practice combines them with failure and concurrency cases; the interview lesson tests semantic choices. Transaction isolation internals, triggers as a programming topic, and schema constraints are covered elsewhere, but their interaction with writes is included here.

# When to use it and tradeoffs

Use ordinary DML for selective transactional changes that require row-level logic. Use bulk ingestion when volume makes row-by-row statements impractical, but keep staging and validation. Use MERGE only when its concurrency behavior and source cardinality are proved; separate statements can be easier to test.

# What later lessons cover

Constraints, transaction isolation, indexes, stored procedures, and trigger implementation receive their own lessons. This topic covers only the interactions needed to reason safely about writes.

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
