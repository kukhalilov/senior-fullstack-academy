# inserts updates deletes merges and bulk operations — Reference: MERGE match actions, upsert alternatives, and concurrency

# Scope

This reference explains every frozen manifest entry in **MERGE match actions, upsert alternatives, and concurrency**. It targets SQL Server Database Engine semantics unless the item explicitly identifies a client utility or platform boundary. The inventory is authoritative for this lesson; a similarly named Fabric/Azure feature is not presumed to behave identically.

# Item-by-item reference

| Exact inventory item | Meaning and practical boundary |
| --- | --- |
| `MERGE statement` | Matches one source relation to one target and applies clauses for matched, target-missing, or source-missing rows. Terminate MERGE with a semicolon. Test the exact engine/build, constraints, triggers, and concurrency profile. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE source` | The source may be a table, view, CTE, or derived query. Make its match key unique for the intended target key and materialize/stage it if it is otherwise unstable or expensive. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE target` | The table or view receiving actions. Index the match key appropriately and ensure its uniqueness constraints encode the business identity rather than expecting MERGE syntax to enforce it. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE ON predicate` | Defines source-to-target identity matching. Keep it focused on key correspondence; moving action filters into ON can misclassify existing rows as unmatched and cause incorrect inserts or deletes. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `WHEN MATCHED` | Applies when ON finds a source/target pair; one clause can UPDATE or DELETE, with an optional search condition. At most two WHEN MATCHED clauses are allowed and their conditions must distinguish actions. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE WHEN MATCHED clause limit` | At most two WHEN MATCHED clauses are allowed; when two appear, the first requires an AND condition and one must UPDATE while the other DELETE. Their conditions must make action selection explicit. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE action search conditions` | A WHEN clause may have a search condition that limits the action after ON classification. Put action-specific eligibility here rather than filtering target identity in ON, which Microsoft warns can produce incorrect results. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `WHEN NOT MATCHED BY TARGET` | Handles a source row that matched no target, commonly with INSERT. Duplicate source rows for the same missing key can attempt duplicate inserts; enforce source uniqueness and a target unique constraint. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `WHEN NOT MATCHED BY SOURCE` | Handles target rows with no source match, commonly for synchronization deletion or deactivation. A filtered/incomplete source can therefore classify many valid target rows as missing; scope this action carefully. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE UPDATE action` | Updates the matched target row. If multiple source rows match one target and the action updates it, SQL Server raises an error; deduplicate source keys before MERGE. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE INSERT action` | Inserts a source row classified as missing from target. A concurrent transaction can insert the same business key after the match check; unique constraints plus suitable locking/transaction design remain necessary. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE DELETE action` | Deletes a matched or source-missing target according to the selected WHEN clause. The latter is particularly dangerous when the source is filtered, partial, or stale. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE OUTPUT` | Returns action-specific old/new values and $action. Do not treat output ordering as a sequence or consume results if the statement reports an error. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)) |
| `MERGE TOP unordered action batching` | MERGE TOP applies after joining source and target and filtering rows that have no action, then distributes affected rows among INSERT/UPDATE/DELETE without order. It is not an ordered batch selector; repeated batches can also rescan both relations and misclassify already-processed rows. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17)) |
| `MERGE semicolon terminator` | SQL Server requires the MERGE statement to end with a semicolon. A missing terminator raises a syntax error. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `Duplicate source match error` | Microsoft documents an error when an UPDATE would modify one target more than once; SQL Server also prevents updating and deleting the same target row. Do not rely on ambiguous source multiplicity for any action: collapse or reject duplicates before MERGE. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE trigger action ordering` | For each specified action SQL Server fires corresponding AFTER triggers, but does not guarantee which action’s trigger runs first or last. Trigger logic must not infer action ordering. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE concurrency race` | A concurrent insert can race with the not-matched check, and other schedules can block or deadlock. A MERGE statement is not automatically a serializable upsert. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `HOLDLOCK merge pattern` | HOLDLOCK is equivalent to SERIALIZABLE for the referenced table and can protect a key range in some insert/update MERGE patterns. It reduces concurrency and does not substitute for unique constraints or workload testing. ([MERGE guidance](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17), [table hints](https://learn.microsoft.com/en-us/sql/t-sql/queries/hints-transact-sql-table?view=sql-server-ver17)) |
| `Separate UPDATE then INSERT upsert` | A common alternative updates existing rows, then inserts missing keys. Protect the missing-key decision with appropriate transaction/locking strategy and a unique constraint; otherwise concurrent sessions can both insert. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `Unique constraint-backed upsert` | A unique index/constraint on the true business key is the final integrity barrier. Catch duplicate-key races and retry or re-read according to an idempotent policy. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-unique-indexes?view=sql-server-ver17)) |
| `Idempotent retry-safe write` | Repeating the same operation produces the same intended state, commonly by stable request key, upsert key, or deduplicated event ID. Idempotence is a business contract, not a property granted by retries. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |
| `MERGE defect and version verification` | MERGE behavior can interact with particular indexes, triggers, and engine builds. Verify current Microsoft documentation and CU/build, test every action with actual constraints/indexes, and prefer separate DML when it gives clearer behavior; Microsoft notes it may perform better under heavy concurrency. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)) |

# Scope and version

SQL Server 2025 (17.x) MERGE behavior. The inventory table covers match, action, output, and concurrency clauses.

# How this group fits the mental model

ON classifies source/target rows; WHEN clauses choose actions. MERGE does not guarantee unique source keys, serialize all writers, or define application retries.

# Supplied names explained

The item-by-item table explains all 23 supplied names, including hazards and alternatives.

# Cross-item comparison

MERGE combines match classification and actions. Separate DML can be easier to test under heavy concurrency; either design still needs constraints and explicit transaction/retry behavior.

# Examples



```sql
MERGE dbo.Product WITH (HOLDLOCK) AS target
USING (SELECT ProductId, Price FROM dbo.StageProduct) AS source
    ON target.ProductId = source.ProductId
WHEN MATCHED THEN
    UPDATE SET Price = source.Price
WHEN NOT MATCHED BY TARGET THEN
    INSERT (ProductId, Price) VALUES (source.ProductId, source.Price);
```

Before running this, prove `StageProduct.ProductId` is unique and enforce uniqueness on the target. `HOLDLOCK` can protect key-range decisions in a suitable plan but increases blocking; it does not repair duplicate source rows or define retry outcomes. Microsoft advises thorough production testing and notes separate DML may perform better under heavy concurrency.

# Common mistakes

- Confusing statement row images with committed final state.
- Treating batch/lock/retry behavior as an implementation detail rather than part of correctness.

# Knowledge checks with answers

1. **Should an active flag filter be added to `ON` when identity is `ProductId`?** Usually no. A target filter in `ON` can turn an existing identity into an unmatched row; put action eligibility in the appropriate `WHEN` condition.
2. **What if two source rows match one target row that MERGE would update?** SQL Server raises an error; validate or deterministically reduce the source to one row per key.
3. **When is `WHEN NOT MATCHED BY SOURCE` safe for deactivation?** Only when the source represents a complete authoritative snapshot of the target scope; a partial feed makes omitted rows appear absent.
4. **Does MERGE make an upsert race-free by itself?** No. Enforce uniqueness and choose/test a locking and transaction design; HOLDLOCK can protect suitable key ranges at a concurrency cost.
5. **Can MERGE OUTPUT be treated as ordered actions or commit receipt?** No. Output ordering is not guaranteed, and output must be discarded if an error rolls back the statement.
6. **What is required after a SQL Server MERGE statement?** A terminating semicolon.


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
