# stored procedures views functions triggers and dynamic SQL — Big-picture orientation and mental model

# Problem and purpose

SQL modules create reusable boundaries around data and behavior. Procedures execute commands, views expose relational interfaces, functions compose into expressions, triggers add synchronous side effects, and dynamic SQL creates runtime code. Correct choice keeps permission, transaction, result, and performance behavior visible.

# Plain-language mental model

A view is a named window onto a query; a function is a constrained expression or table producer; a procedure is an executable command; a trigger is an automatic hook inside the caller transaction. Dynamic SQL is code assembled at runtime, so values and identifiers need separate treatment.

# How the parts fit together

1. Choose a module by composition and control-flow needs.
2. Define parameter, result-set, error, and transaction contracts.
3. Make permission context explicit, especially for dynamic SQL.
4. Keep views/functions composable and measure optimizer transformations.
5. Treat triggers as multirow, synchronous side effects.

# Concept map

| Need | Module | Main boundary |
| --- | --- | --- |
| Command/workflow | Procedure | Result sets, OUTPUT, errors, transaction ownership |
| Reusable relational shape | View / inline TVF | No implicit ordering |
| Scalar or table expression | Function | Side-effect and syntax restrictions |
| Synchronous cross-writer behavior | Trigger | Once per statement inside caller transaction |
| Variable SQL structure | sp_executesql | Bind values; allow-list and quote identifiers |

# End-to-end walkthrough

An API lists orders with an optional sort column. The procedure validates the sort key against a fixed allow-list, quotes the selected identifier, passes filter values through sp_executesql parameters, and returns one documented result set. A normal view can supply shared join logic. An audit trigger, if necessary, joins inserted/deleted as sets and writes within the same transaction.

# When to use it and tradeoffs

Prefer procedures for explicit commands, views/iTVFs for relational composition, and triggers only when every writer must synchronously obey an invariant. Indexed views trade read speed for write amplification. Dynamic SQL supports structural variation but increases injection and plan-management responsibility.

# What later lessons cover

Principals and permissions are in t03-012; plan analysis is in t03-009/t03-013; distributed side effects and outbox are in track-08.

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
