# stored procedures views functions triggers and dynamic SQL — Exercises and worked solutions

# Goals

Select module boundaries, secure dynamic SQL, reason about view/UDF behavior, and handle trigger sets correctly.

# Worked example

A validated sort identifier is selected from an allow-list and quoted; values remain typed sp_executesql parameters. A multirow trigger joins inserted and deleted by key.

# Exercises

1. A procedure needs optional filters and arbitrary sort columns. Separate values and identifiers safely.
2. Why are RETURN, OUTPUT, and SELECT result sets not interchangeable?
3. A view uses SELECT *. What can break when a base table changes?
4. List indexed-view prerequisites and its write tradeoff.
5. A scalar UDF has is_inlineable=1. What can you conclude?
6. A trigger assigns inserted.Email to a scalar variable. Why is this unsafe?
7. What does UPDATE(Price) prove? How do you detect an actual change?
8. A trigger sends email then transaction rolls back. Why inconsistent?
9. Why might EXECUTE AS OWNER with static SQL differ from dynamic SQL?
10. What does MSTVF interleaved execution improve and not change?

# Progressive hints

1. Values can be bound; identifiers cannot.
2. Status, assignment, and row output are separate channels.
3. Explicit projections stabilize contracts.
4. Determinism, schema binding, SET options, unique clustered key.
5. Eligibility is not actual optimizer choice.
6. Join pseudo tables by key.

# Complete solutions

1. Validate the sort key against a fixed whitelist, quote that identifier, and bind filter values in sp_executesql. Reject raw expressions and fragments.
2. RETURN is integer status, OUTPUT copies assigned values, SELECT emits result sets with their own metadata. Clients consume them differently.
3. View metadata can be stale or star expansion can change unexpectedly; explicit view columns stabilize the interface.
4. Use schema binding and two-part references, deterministic and sufficiently precise expressions, required SET options, same ownership, and a unique clustered index first. Base writes synchronously maintain view indexes.
5. The function definition appears eligible. Optimizer may not inline a specific use; inspect plan and configuration.
6. inserted can contain many rows and has no defined order; scalar assignment picks an unspecified row. Use set-based joins/inserts.
7. It proves the statement targeted the column, even when value stays equal. Compare inserted/deleted values with correct NULL semantics.
8. Trigger runs in caller transaction; external email cannot roll back. Write an outbox row transactionally and deliver after commit.
9. Ownership chaining does not apply to dynamic SQL. Unless the module intentionally supplies an `EXECUTE AS` context or certificate-signed permissions, dynamic statements require permissions from the executing caller. Use the narrowest safe context and never treat it as protection from injection.
10. Eligible optimization can use observed MSTVF row count at compile time; it does not inline the function body or supply full output statistics.

# Tests and edge cases

- Exercise quotes, NULL, long names, and invalid sort inputs.
- Run multirow INSERT/UPDATE/DELETE through triggers.
- Test indexed-view write cost and SET settings from application connections.
- Compare scalar UDF plans under relevant compatibility/configuration.
- Verify rollback removes trigger writes; external effects use an outbox.

# Reflection questions

Can the module contract be composed? Which identity runs dynamic SQL? Can one statement affect many rows? Which behavior is guaranteed versus optimizer-selected?

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
