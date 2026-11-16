# stored procedures views functions triggers and dynamic SQL — Reference: Stored procedures, parameters, execution, and dynamic SQL

# Scope and version
Targets SQL Server 2025 (17.x). Azure SQL and Fabric details may differ. Every exact inventory item is explained below.

# How this group fits the mental model

Choose module form by composition, control-flow, and side-effect needs. Runtime behavior and permissions are part of the public contract.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `CREATE PROCEDURE` | Defines a reusable executable T-SQL module; the DDL must be alone in its batch. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `ALTER PROCEDURE` | Replaces a procedure definition while retaining its object identity and permissions. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `CREATE OR ALTER PROCEDURE` | Creates or replaces a procedure in one deployment statement; it must start a batch. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `EXECUTE (Transact-SQL)` | Executes a procedure or dynamic batch; result, permission, and transaction behavior depend on the target. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `EXECUTE procedure` | Invoke with positional or named arguments; named binding avoids order mistakes. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Procedure parameter` | Typed input by default; an omitted optional parameter uses its default, while explicit NULL is still NULL. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `OUTPUT parameter` | Procedure and caller must both mark OUTPUT to copy the assigned value back. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `RETURN status code` | Integer control/status channel, not a general data-return mechanism. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Table-valued parameter` | Passes a user-defined table type; must be READONLY and has no column statistics. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Procedure result set` | Rows returned by SELECT are client contract; define shape and multiple-result behavior deliberately. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `SET NOCOUNT ON` | Suppresses row-count messages, not result sets or @@ROWCOUNT. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `TRY...CATCH in procedure` | Handles catchable execution errors in scope; some compile errors, attentions, and severe errors escape. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `THROW` | Raises or rethrows an error; bare THROW preserves caught error and honors XACT_ABORT. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Dynamic SQL` | Runtime SQL text is separately parsed/compiled; bind values and allow-list structural variation. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `sp_executesql` | Executes Unicode batch text with separately typed parameters; stable text can reuse plans. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `Parameterized dynamic SQL` | Bind data values; SQL parameters cannot stand in for object names or keywords. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `QUOTENAME` | Delimits an identifier or one-character quoted string; input over 128 characters returns NULL. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `SQL injection in dynamic SQL` | Untrusted syntax can execute as code; bind values, quote identifiers, validate choices, and avoid truncation. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `EXECUTE AS` | Runs module code under a selected security principal; it changes authorization, not input safety. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `WITH EXECUTE AS clause` | Sets CALLER, SELF, OWNER, or named execution context; review cross-database boundaries. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Recompile option` | Trades compile CPU for plan specialization; procedure, call, and statement scopes differ. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Temporary procedure` | Stored in tempdb with local-session or global-server visibility rules. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Procedure batch boundary` | CREATE/ALTER PROCEDURE must be the only statement in its batch; GO is a client batch separator. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Procedure parameter default and NULL` | Default applies only when argument is omitted; passing NULL supplies NULL. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Named parameter invocation` | Bind as @name=value and use declared names; positional arguments follow declaration order. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Output parameter caller binding` | Caller declares compatible variable and includes OUTPUT in EXEC; otherwise no copy-back occurs. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `RETURN status versus result set` | RETURN is an integer status; SELECT yields rows; OUTPUT assigns scalar/cursor values. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Table-valued parameter READONLY` | A TVP cannot be modified within its procedure; copy to a temp table if mutation or statistics are required. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `sp_executesql parameter definition string` | Declare parameter names and SQL types in @params, then supply matching values separately. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `sp_executesql variable scope` | Dynamic batch locals are isolated; return values through OUTPUT parameters or result sets. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `Dynamic SQL plan reuse` | Constant parameterized statement text is likely to reuse a plan; parameter sensitivity still applies. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `Dynamic SQL identifier allow-list` | Identifiers cannot be bound; choose from fixed allowed names and QUOTENAME each identifier part. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `QUOTENAME 128-character limit` | Accepts sysname up to 128 characters; longer input returns NULL and must be rejected. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `Dynamic SQL buffer truncation risk` | Truncation can remove quoting/predicates; use sufficiently large nvarchar buffers and validate assembled text. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `Dynamic SQL permission context` | Dynamic batches are separately compiled and generally require caller permissions unless signing/context is designed. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `WITH ENCRYPTION is not source-code security` | Obfuscates metadata text for casual inspection; it is not cryptographic protection. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Procedure recompilation scopes` | WITH RECOMPILE affects each call; EXEC WITH RECOMPILE targets one call; OPTION(RECOMPILE) one statement. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Deferred name resolution for stored procedures` | Some missing table dependencies are resolved at execution/first compilation; successful CREATE does not prove runtime validity. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Natively compiled procedure SCHEMABINDING` | Natively compiled procedures require NATIVE_COMPILATION, SCHEMABINDING, and an ATOMIC block with fixed SET options. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `EXECUTE WITH RECOMPILE` | Invocation option recompiles the procedure for that execution; compare against statement-level OPTION(RECOMPILE) and procedure WITH RECOMPILE. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `T-SQL procedure parameter default catalog limitation` | sys.parameters.default is NULL for T-SQL procedures even when a default is declared; do not use it as complete parameter-default metadata. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-procedure-transact-sql?view=sql-server-ver17)) |
| `Dynamic SQL parameter type and length contract` | Declare exact SQL types and lengths in sp_executesql; mismatches can add conversions, truncate data, or change plan/cache behavior. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |

# Cross-item comparison

Procedures execute commands; views and inline TVFs compose relational logic; scalar functions return expressions; triggers run synchronously inside the caller transaction.

# Examples

Bind dynamic values with sp_executesql; select structural identifiers from an allow-list and quote them. Views have no guaranteed ordering. Trigger code joins inserted/deleted as sets.

# Common mistakes

- Confusing procedure RETURN, OUTPUT, and result sets.
- Concatenating data values into SQL text or trying to bind identifiers.
- Assuming ordinary views materialize or functions always inline.
- Writing triggers for one row or treating them as post-commit callbacks.

# Knowledge checks with answers

1. Can a parameter stand for a column name? No.
2. Does is_inlineable guarantee UDF inlining? No.
3. How many rows can inserted contain? Any number affected by one statement.

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
