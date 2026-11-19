# stored procedures views functions triggers and dynamic SQL — Interview questions and reasoning

# Core questions

1. Procedure versus view versus function?
2. Secure dynamic SQL with optional ORDER BY?
3. QUOTENAME behavior and length boundary?
4. Indexed view requirements and costs?
5. Inline TVF versus MSTVF?
6. Does SQL Server 2025 always inline scalar UDFs?
7. inserted/deleted semantics for UPDATE?
8. How do triggers behave with multirow statements and transactions?
9. UPDATE(column) versus comparing values?
10. EXECUTE AS and ownership chaining with dynamic SQL?

# Concise interview answers

1. Procedure executes command flow; view names a relational query; function returns composable scalar/table under stricter rules.
2. Allow-list identifiers, quote chosen identifier, bind values separately with sp_executesql.
3. Delimits identifier or one-character quoted string; sysname input max 128, longer returns NULL.
4. Schema-bound deterministic definition, required SET settings, same owner/two-part names, unique clustered index first; writes maintain it.
5. iTVF exposes one SELECT; MSTVF populates a table variable and can have weaker estimates, partly mitigated by eligible interleaved execution.
6. No. SQL Server 2019+ at compatibility 150+ supports eligible scalar UDF inlining; each use remains conditional.
7. Both contain all affected rows: deleted before image, inserted after image.
8. One invocation per statement in caller transaction; trigger writes/errors participate in that transaction.
9. UPDATE(column) detects target-list mention; compare pseudo-table values to detect change.
10. Static ownership chaining does not cover dynamic SQL. The caller needs permissions unless the module deliberately supplies an `EXECUTE AS` context or signed permissions; those mechanisms do not make unsafe SQL construction safe.

# Deep follow-up answers

Trigger order is undefined unless first/last is configured; only one of each can be designated per event. RECURSIVE_TRIGGERS controls direct recursion; nested triggers configuration affects indirect chains. Nesting is capped at 32. DDL triggers use EVENTDATA and have no inserted/deleted. LOGON failures can deny access.

A view has no guaranteed order. Indexed views require a unique clustered index and synchronous maintenance; NOEXPAND/optimizer matching affects use. Metadata refresh does not change definition. is_inlineable is not proof of plan transformation.

# Scenario questions

**A batch inserts 500 rows but the audit trigger records one.** The trigger likely treats inserted as a scalar. Rewrite as set-based INSERT SELECT.

# Tradeoffs and alternatives

Prefer constraints for declarative row invariants, procedures for explicit operations, an outbox for post-commit side effects, and views/iTVFs for composable reads. Triggers can enforce synchronous rules across writers.

# Common weak answers

- “The trigger fires once per row.”
- “QUOTENAME parameterizes values.”
- “Views always store results.”
- “is_inlineable means it ran inline.”
- “EXECUTE AS OWNER makes dynamic SQL harmless.”

# Self-check rubric

Score 0–2: (0) slogan only; (1) mechanism but misses edge; (2) exact contract, multirow/runtime boundary, security context, and tradeoff.

# Sources

- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/execute-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-views?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-function-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/user-defined-functions?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/create-user-defined-functions-database-engine?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/dml-triggers?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/create-dml-triggers-to-handle-multiple-rows-of-data?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/use-the-inserted-and-deleted-tables?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/ddl-triggers?view=sql-server-ver17)
