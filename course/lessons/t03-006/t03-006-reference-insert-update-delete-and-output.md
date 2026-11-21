# inserts updates deletes merges and bulk operations — Reference: Insert, update, delete, row filters, and returned values

# Scope

This reference explains every frozen manifest entry in **Insert, update, delete, row filters, and returned values**. It targets SQL Server Database Engine semantics unless the item explicitly identifies a client utility or platform boundary. The inventory is authoritative for this lesson; a similarly named Fabric/Azure feature is not presumed to behave identically.

# Item-by-item reference

| Exact inventory item | Meaning and practical boundary |
| --- | --- |
| `INSERT statement` | Adds rows to a target table or view. State the target columns explicitly so a schema change cannot silently remap positional values; constraints, defaults, identity rules, and triggers still apply. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `INSERT ... VALUES` | Supplies literal or parameterized row values. The number and order of values must match the target column list; direct INSERT VALUES has a 1,000-row limit, while a derived VALUES rowset does not share that limit. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `INSERT multiple rows` | A single VALUES clause can insert several tuples in one statement. It is not an all-purpose bulk-loading substitute; large or external files have separate bulk tools, logging, validation, and recovery behavior. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `INSERT ... SELECT` | Inserts the rows returned by a query. Explicitly align target and select columns, conversions, nullability, and duplicate policy; source ordering does not define insertion order. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `INSERT ... DEFAULT VALUES` | Inserts one row using defaults for all columns. It fails where required columns have neither a default nor nullable support. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `INSERT ... EXEC` | Inserts the result set of a stored procedure or dynamic execution statement. The result shape must match the target columns; INSERT ... EXEC cannot be nested, so a called procedure that itself performs INSERT ... EXEC can make the outer operation fail. Prefer an explicit stable result contract. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `INSERT into view boundary` | INSERT through a view is limited to updatable-view rules; multi-table views may require an INSTEAD OF trigger. A view is not automatically a writable alias for every underlying table expression. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `DEFAULT keyword in VALUES` | DEFAULT asks SQL Server to use the column default; if none exists and the column is nullable, NULL is inserted. DEFAULT is not valid for an identity column and is permitted in a table value constructor only in INSERT context. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `INSERT TOP unordered selection` | INSERT TOP limits an unordered source subset. Select deterministic source keys/rows in an ordered subquery when the chosen rows matter; an outer ORDER BY does not control which rows are inserted. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `Explicit INSERT column list` | Names target columns in the intended mapping order. It protects code from table-column reordering and makes omitted identity/default/computed columns deliberate. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `SET IDENTITY_INSERT` | Temporarily permits an explicit identity value for one table in the session. Only one table per session may have it ON; turn it OFF in all paths and account for identity reseeding and collisions. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/insert-transact-sql?view=sql-server-ver17)) |
| `UPDATE statement` | Changes values in every target row satisfying its predicate. Confirm the predicate’s key cardinality and affected-row expectation before executing broad or destructive changes. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/update-transact-sql?view=sql-server-ver17)) |
| `UPDATE with FROM` | Joins a target to row sources that determine new values. SQL Server documents results as undefined when multiple source values can supply one updated target column; reduce the source to one deterministic row per key. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/update-transact-sql?view=sql-server-ver17)) |
| `UPDATE joined source` | Uses an explicit joined relation to derive values, commonly through UPDATE alias SET ... FROM target AS alias JOIN source. Put target identity in the join and eliminate duplicate source matches. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/update-transact-sql?view=sql-server-ver17)) |
| `UPDATE TOP unordered selection` | UPDATE TOP limits an unordered set of qualifying rows. To update a deterministic batch, first select ordered keys in a CTE/subquery, then update rows joined to those keys. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17)) |
| `DELETE statement` | Removes every target row matching its predicate. A missing or overly broad WHERE can delete the entire table; use a transaction, preview predicate, and expected row count for consequential deletion. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/delete-transact-sql?view=sql-server-ver17)) |
| `DELETE with FROM` | Names joined sources used to select target rows. Clearly identify which alias is the delete target; source multiplicity must not be mistaken for a larger target deletion count. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/delete-transact-sql?view=sql-server-ver17)) |
| `DELETE joined source` | Deletes target rows related to a source using a join. Ensure the join condition expresses the intended relationship and inspect target keys before the delete. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/delete-transact-sql?view=sql-server-ver17)) |
| `DELETE TOP unordered selection` | DELETE TOP affects an unordered qualifying subset. For oldest-first or priority order, select TOP keys with ORDER BY inside a subquery and delete by those keys. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17)) |
| `TRUNCATE TABLE boundary` | Removes all rows by deallocating data pages, resets an identity counter to its defined seed, and can be rolled back inside a SQL Server transaction. SQL Server disallows it for tables referenced by foreign keys (except self-reference), participating in indexed views, published for replication, system-versioned temporal, or referenced by EDGE constraints; it requires ALTER permission and does not fire DELETE triggers. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/truncate-table-transact-sql?view=sql-server-ver17)) |
| `DML without WHERE risk` | UPDATE or DELETE without WHERE targets every qualifying table row (all rows if no other limiting construct applies). Do not rely on a GUI preview or presumed key uniqueness as a safety barrier. ([UPDATE](https://learn.microsoft.com/en-us/sql/t-sql/queries/update-transact-sql?view=sql-server-ver17), [DELETE](https://learn.microsoft.com/en-us/sql/t-sql/statements/delete-transact-sql?view=sql-server-ver17)) |
| `OUTPUT clause` | Returns expressions from each affected row for INSERT, UPDATE, DELETE, or MERGE. Direct client output is forbidden when the target has an enabled trigger for that action; use OUTPUT INTO where allowed. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)) |
| `INSERTED pseudo-table` | In OUTPUT, INSERTED represents new values for INSERT/UPDATE and values after the DML statement but before triggers execute. It is not the trigger’s inserted transition table and cannot be used for DELETE output. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)) |
| `DELETED pseudo-table` | In OUTPUT, DELETED represents old values for UPDATE/DELETE. It cannot be used for INSERT output; update auditing can pair DELETED and INSERTED columns. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)) |
| `OUTPUT INTO` | Captures OUTPUT rows into a table variable or eligible table. The nested operation is atomic, but the destination has restrictions: for example it cannot have triggers or foreign keys. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)) |
| `OUTPUT direct-client trigger restriction` | If OUTPUT omits INTO, the modified target cannot have an enabled trigger for that DML action. OUTPUT INTO is subject to restrictions on its destination table. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)) |
| `OUTPUT result after statement error` | An OUTPUT result set can be returned even when an error causes the DML statement to roll back. Discard all such client results on error and do not persist them as committed audit evidence. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)) |
| `OUTPUT with MERGE` | MERGE OUTPUT can include INSERTED, DELETED, source columns, and $action (INSERT/UPDATE/DELETE). Correlate source and target keys explicitly; OUTPUT row order is not guaranteed. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)) |
| `TOP in DML` | Limits affected rows but does not order which rows qualify. To process a deterministic batch, select ordered keys in a subquery or CTE, then join the DML target to those keys. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17)) |
| `@@ROWCOUNT` | Returns the rows affected or read by the immediately preceding statement and is reset or overwritten by many statements. Capture it immediately; it reports a count, not proof that the intended keys changed. ([source](https://learn.microsoft.com/en-us/sql/t-sql/functions/rowcount-transact-sql?view=sql-server-ver17)) |
| `DML trigger interaction` | AFTER triggers run after a DML action and INSTEAD OF triggers replace the modification. OUTPUT values are before triggers, trigger side effects can alter final data, and MERGE action-trigger ordering is not guaranteed. ([source](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)) |

# Scope and version

SQL Server 2025 (17.x) DML behavior. The inventory table covers exact syntax and restrictions.

# How this group fits the mental model

Select target rows, apply the state transition, then observe row count or statement images. OUTPUT, triggers, and commit outcome are separate stages.

# Supplied names explained

The item-by-item table explains all 31 supplied names.

# Cross-item comparison

INSERT adds rows; UPDATE changes qualifying rows; DELETE removes qualifying rows; TRUNCATE removes all rows under different permission, trigger, and constraint rules. OUTPUT returns statement images; @@ROWCOUNT reports a count.

# Examples



```sql
DECLARE @Changed TABLE (OldName nvarchar(200), NewName nvarchar(200));
DECLARE @Rows int;

BEGIN TRANSACTION;
UPDATE dbo.Product
SET Name = @NewName
OUTPUT DELETED.Name, INSERTED.Name INTO @Changed
WHERE ProductId = @ProductId;
SET @Rows = @@ROWCOUNT;

IF @Rows <> 1
BEGIN
    ROLLBACK TRANSACTION;
    THROW 50001, 'Expected exactly one product row.', 1;
END;

COMMIT TRANSACTION;
SELECT OldName, NewName FROM @Changed;
```

`OUTPUT INTO` is used because an enabled UPDATE trigger exists. The returned row image is from the DML statement before trigger side effects; use a separate read if the final post-trigger state is needed. The output is only presented after successful commit.

# Common mistakes

- Confusing statement row images with committed final state.
- Treating batch/lock/retry behavior as an implementation detail rather than part of correctness.

# Knowledge checks with answers

1. **Which virtual table can an INSERT output use?** `INSERTED`; `DELETED` represents old values for UPDATE/DELETE.
2. **Why does a direct client OUTPUT fail when an enabled matching trigger exists?** SQL Server restricts direct OUTPUT for that action; use `OUTPUT INTO` where destination-table rules permit.
3. **What should a client do with OUTPUT rows if the DML reports an error?** Discard them. SQL Server can return output even when the statement rolls back.
4. **A joined UPDATE has two matching source rows for one target. Which value wins?** The result is undefined; reduce the source to one deterministic row per target key.
5. **How do you delete the oldest 100 queue entries deterministically?** Select the ordered TOP keys in a subquery/CTE, with a unique tie-breaker, then delete by those keys.
6. **Why capture `@@ROWCOUNT` immediately?** Later statements can overwrite/reset it; it reports affected/read rows, not whether the business intent was satisfied.


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
