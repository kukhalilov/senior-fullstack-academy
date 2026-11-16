# inserts updates deletes merges and bulk operations — Reference: Atomic changes, concurrency checks, and retry behavior

# Scope

This reference explains every frozen manifest entry in **Atomic changes, concurrency checks, and retry behavior**. It targets SQL Server Database Engine semantics unless the item explicitly identifies a client utility or platform boundary. The inventory is authoritative for this lesson; a similarly named Fabric/Azure feature is not presumed to behave identically.

# Item-by-item reference

| Exact inventory item | Meaning and practical boundary |
| --- | --- |
| `Explicit transaction around DML` | Wrap logically coupled writes in BEGIN/COMMIT with ROLLBACK on failure. Keep transactions short, define isolation/concurrency semantics, and never assume a client timeout proves rollback. ([source](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver17)) |
| `XACT_ABORT` | When ON, many run-time errors terminate and roll back the whole transaction; compile errors are unaffected, and TRY/CATCH still governs control flow. It is often useful for data modifications but test error classes. ([source](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver17)) |
| `TRY...CATCH around DML` | Catches many execution errors and allows cleanup/rollback, but not every compile, connection-terminating, or same-scope compilation error. Check XACT_STATE before choosing commit or rollback. ([source](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver17)) |
| `XACT_STATE transaction health` | Returns 1 for an active committable transaction, -1 for an active uncommittable transaction, and 0 when none exists. In CATCH, use it to decide whether rollback is required; an uncommittable transaction cannot commit or roll back to a savepoint. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/xact-state-transact-sql?view=sql-server-ver17)) |
| `SET NOCOUNT ON` | Suppresses per-statement “n rows affected” messages; it does not disable @@ROWCOUNT or change DML. It reduces protocol noise in procedural/batched code. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-nocount-transact-sql?view=sql-server-ver17)) |
| `@@ROWCOUNT validation` | Capture immediately after DML and compare with the expected count or use a concurrency predicate. A mismatch often means zero rows changed or a stale client version; decide whether to commit, roll back, or signal conflict. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/rowcount-transact-sql?view=sql-server-ver17)) |
| `Unique constraint duplicate guard` | A unique constraint guarantees key uniqueness across concurrent writers. Application pre-checks alone race; handle the constraint violation deliberately. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-unique-indexes?view=sql-server-ver17)) |
| `rowversion concurrency predicate` | rowversion is an automatically changing 8-byte database version token, not a date/time. Include the originally read token in UPDATE/DELETE WHERE and require exactly one affected row for optimistic concurrency. ([source](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver17)) |
| `Compare-and-swap update` | Atomically changes a row only if its old value/version still matches the expected value, e.g. WHERE Id=@id AND Version=@oldVersion. Check affected rows; zero means conflict or missing row. ([source](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver17)) |
| `Idempotency key` | A unique request identifier stored under a unique constraint lets a retried request detect prior completion. Persist the key and result atomically with the business mutation. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `Retry after deadlock` | SQL Server chooses a deadlock victim and rolls back its transaction; retry the whole idempotent unit with bounded backoff, not only the failed statement inside stale application state. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)) |
| `Retry after timeout with unknown commit outcome` | A client timeout or broken connection can occur after the server commits but before the client receives confirmation. Query by idempotency/business key or use an idempotent command before retrying. ([source](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver17)) |
| `Partial batch commit` | Earlier committed batches remain after a later batch fails unless an outer transaction covers them. Record checkpoints and make restart logic reconcile rather than blindly replay. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `Savepoint partial rollback` | SAVE TRANSACTION marks a rollback point inside a transaction; rollback to it does not end the transaction and has restrictions, especially with distributed transactions. It is not independent nested commit. ([source](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-transact-sql?view=sql-server-ver17)) |
| `Bulk-load recovery-model interaction` | Recovery model, backup chain, table/index shape, and lock options affect logging. Minimal logging still logs allocation and has operational prerequisites; it does not mean no log or no recovery planning. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |

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
