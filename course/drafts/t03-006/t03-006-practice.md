# inserts updates deletes merges and bulk operations — Exercises and worked solutions

# Goals

Practice safe target selection, source cardinality, output timing, merge concurrency, bulk failure recovery, and retry semantics.

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

# Complete solutions

1. `INSERT dbo.Product (Sku, Name) VALUES (N'P-101', N'Cable'), (N'P-102', N'Adapter');` Explicit columns omit the generated identity.
2. Enforce a unique index on BusinessKey. A pattern is `INSERT dbo.Target (BusinessKey, Value) SELECT s.BusinessKey, s.Value FROM dbo.Stage AS s WHERE NOT EXISTS (SELECT 1 FROM dbo.Target AS t WITH (UPDLOCK, HOLDLOCK) WHERE t.BusinessKey = s.BusinessKey);` The unique index remains the final guard; handle duplicate-key errors because other write paths may race.
3. `WITH ranked AS (SELECT s.*, ROW_NUMBER() OVER (PARTITION BY ProductId ORDER BY SourcePriority DESC, UpdatedAt DESC, SourceRowId DESC) AS rn FROM dbo.StagePrice AS s) UPDATE p SET Price = r.Price FROM dbo.Product AS p JOIN ranked AS r ON r.ProductId = p.ProductId AND r.rn = 1;` The last key makes ties deterministic; validate source types and intended priority.
4. `WITH batch AS (SELECT TOP (500) QueueId FROM dbo.WorkQueue WHERE Status = N'Complete' ORDER BY CreatedAt, QueueId) DELETE q FROM dbo.WorkQueue AS q JOIN batch AS b ON b.QueueId = q.QueueId;` The key resolves timestamp ties.
5. Use `DECLARE @Changed TABLE (OldValue nvarchar(200), NewValue nvarchar(200)); UPDATE dbo.Product SET Name=@NewName OUTPUT DELETED.Name, INSERTED.Name INTO @Changed WHERE ProductId=@Id;` Direct OUTPUT is disallowed with an enabled UPDATE trigger. The images are before trigger effects; use a transactional audit design if final committed state is required, and do not expose staged OUTPUT values after rollback.
6. SQL Server can return OUTPUT rows even when an error rolls back the DML. An error means those rows are not a success receipt.
7. `MERGE dbo.Product WITH (HOLDLOCK) AS t USING dbo.StageProduct AS s ON t.ProductId=s.ProductId WHEN MATCHED THEN UPDATE SET Price=s.Price WHEN NOT MATCHED BY TARGET THEN INSERT (ProductId, Price) VALUES (s.ProductId, s.Price);` Ensure source uniqueness and a target unique constraint; HOLDLOCK’s concurrency cost must be tested. A duplicate source row matching an UPDATE target raises an error.
8. With a complete snapshot, scope the target set and use `WHEN NOT MATCHED BY SOURCE AND target.IsActive = 1 THEN UPDATE SET IsActive = 0`; a partial feed falsely makes omitted targets appear absent. For partial feeds, omit this action.
9. The documented error occurs when multiple source rows would UPDATE the same target row. Enforce one source row per key through validation, aggregation, or a deterministic ROW_NUMBER policy; never let arbitrary input order choose.
10. A unique constraint prevents duplicate state; suitable SERIALIZABLE/HOLDLOCK range protection may prevent a race but costs concurrency and requires test.
11. `BULK INSERT dbo.ImportStage FROM 'daily/orders.csv' WITH (DATA_SOURCE='OrdersBlob', FORMAT='CSV', FIRSTROW=2, FIELDQUOTE='"', ERRORFILE='daily/orders-rejects', ERRORFILE_DATA_SOURCE='OrdersBlob', BATCHSIZE=50000);` Credentials/external-source configuration is separate. FIRSTROW skips physical rows and does not parse or validate the header.
12. BATCHSIZE defines batch/transaction boundaries when no outer transaction exists. ROWS_PER_BATCH is a hint/estimate and does not split work. Earlier batches may remain committed.
13. KEEPNULLS retains NULLs; CHECK_CONSTRAINTS requests constraint checks; FIRE_TRIGGERS requests insert triggers for bulk rows. Verify platform behavior.
14. `UPDATE dbo.Entity SET Value=@value WHERE EntityId=@id AND Version=@originalVersion; DECLARE @rows int = @@ROWCOUNT;` Capture immediately; zero means missing or stale, one means the guarded write matched, and a value greater than one signals a broken uniqueness assumption.
15. In one database transaction, insert the caller’s unique RequestId and apply the order mutation, then persist the response/result. If duplicate RequestId is detected on retry, read and return the prior result. If a side effect is external, use an outbox or an independently idempotent downstream key; a database transaction cannot atomically commit an arbitrary network call.

# Worked example

A compare-and-swap update uses `WHERE EntityId=@id AND Version=@originalVersion`, then captures @@ROWCOUNT immediately; zero indicates a missing or stale row. With an enabled trigger, use OUTPUT INTO; discard staged output on error ([OUTPUT](https://learn.microsoft.com/en-us/sql/t-sql/queries/output-clause-transact-sql?view=sql-server-ver17)).

# Progressive hints

1. Identify the key and expected row count.
2. Prove source keys are unique.
3. Select ordered TOP keys before deleting.
4. Distinguish a known rollback from an unknown timeout outcome.
5. Separate parsing from validation and commit scope.

# Tests and edge cases

Test zero/multiple target matches, duplicate source keys, NULL and collation behavior, trigger side effects, OUTPUT followed by rollback, TOP ordering, concurrent upserts, stale rowversion, deadlock retry, unknown timeout outcome, CSV embedded quotes/newlines/Unicode, missing and malformed columns, rejected-row privacy, constraint trust, identity collisions, partial batch failure, and outer-transaction rollback.

# Reflection questions

Which invariant belongs in a unique constraint? What evidence says a write committed? How will replay behave after response loss? Which batch may remain committed after failure? How can rejected sensitive rows be protected?

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
