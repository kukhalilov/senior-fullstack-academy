# inserts updates deletes merges and bulk operations — Interview questions and reasoning

# Core questions

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

# Concise interview answers

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

# Deep follow-up answers

OUTPUT rows can be returned even if a statement errors and rolls back; discard them on error. MERGE source duplicates and filtered NOT MATCHED BY SOURCE are hazards. HOLDLOCK may protect key ranges with blocking costs, while unique constraints enforce the invariant ([MERGE](https://learn.microsoft.com/en-us/sql/t-sql/statements/merge-transact-sql?view=sql-server-ver17)). Bulk ingestion requires correct file principal, parser, validation, and partial-failure recovery ([BULK INSERT](https://learn.microsoft.com/en-us/sql/t-sql/statements/bulk-insert-transact-sql?view=sql-server-ver17)).

# Tradeoffs and alternatives

MERGE compresses match/action logic but separate DML can be easier to reason about under concurrency. OUTPUT gives row images; @@ROWCOUNT gives a count. Compare-and-swap detects stale writes; idempotency keys detect replays.

# Common weak answers

- “MERGE is one statement, so it cannot race.”
- “OUTPUT returned, so it committed.”
- “FIRSTROW skips CSV headers correctly.”
- “A pre-check prevents duplicates.”
- “A timeout means rollback.”
- “rowversion tells when the row changed.”

# Self-check rubric

Score 0–2 for target identity; deterministic source; OUTPUT/trigger/error timing; MERGE concurrency; file principal/parser/validation; batch recovery; constraint/rowversion use; and known versus unknown retry outcome.

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
