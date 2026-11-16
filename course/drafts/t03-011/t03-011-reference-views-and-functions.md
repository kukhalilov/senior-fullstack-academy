# stored procedures views functions triggers and dynamic SQL — Reference: Views, inline functions, and scalar or table-valued functions

# Scope and version
Targets SQL Server 2025 (17.x). Azure SQL and Fabric details may differ. Every exact inventory item is explained below.

# How this group fits the mental model

Choose module form by composition, control-flow, and side-effect needs. Runtime behavior and permissions are part of the public contract.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `CREATE VIEW` | Defines a virtual named SELECT in the current database; ordinary views store definitions, not result rows. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `ALTER VIEW` | Replaces a view definition; refresh dependent metadata when required. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `CREATE OR ALTER VIEW` | Creates or replaces a view; DDL starts its own batch. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `View definition` | A named SELECT expression with view-specific restrictions; no inherent output order. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `Schema-bound view` | WITH SCHEMABINDING prevents incompatible changes to dependencies and requires two-part names. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `Indexed view` | Stores and maintains a view result with a unique clustered index; strict definition and SET requirements apply. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17)) |
| `View metadata refresh` | Refreshes persisted metadata after underlying shape changes; it does not alter the SELECT definition. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `Inline table-valued function` | Returns one SELECT expression that optimizer can expand relationally. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining?view=sql-server-ver17)) |
| `Multi-statement table-valued function` | Populates a return table variable; imperative flexibility can hide cardinality and optimization details. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-function-transact-sql?view=sql-server-ver17)) |
| `Scalar user-defined function` | Returns one scalar and can be used in expressions; traditional execution may be iterative and serial. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining?view=sql-server-ver17)) |
| `CREATE FUNCTION` | Defines scalar or table-valued UDF; T-SQL UDFs cannot perform permanent side-effecting DML or dynamic SQL. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-function-transact-sql?view=sql-server-ver17)) |
| `Deterministic function property` | Same inputs yield same output independent of database state; determinism/precision affect indexed expressions. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-function-transact-sql?view=sql-server-ver17)) |
| `SCHEMABINDING` | Binds module to referenced schema and prevents incompatible dependency changes. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-views?view=sql-server-ver17)) |
| `Function side-effect restriction` | T-SQL UDFs cannot modify persistent database state; errors can cancel the invoking statement. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-function-transact-sql?view=sql-server-ver17)) |
| `Function inlining` | Eligible function logic may be transformed into the outer relational query; eligibility is not a guarantee. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-function-transact-sql?view=sql-server-ver17)) |
| `Table-valued function estimate` | iTVFs expose a query; MSTVFs historically have weak estimates, partly improved by eligible interleaved execution. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-function-transact-sql?view=sql-server-ver17)) |
| `View versus stored procedure` | View composes in FROM; procedure executes control flow and can return result sets, OUTPUT, and status. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `View is not automatically ordered` | Only outer ORDER BY guarantees output order; TOP inside a view is not an ordering contract. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `View column list and SELECT * risk` | Explicit columns stabilize API; star expansion can become stale after base-schema changes. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `View CHECK OPTION` | Requires writes through an updatable view to remain in its predicate; it is not a general invariant mechanism. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `View updatability boundary` | Joins, aggregates, DISTINCT, and computed expressions constrain unambiguous writes through a view. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `View expansion and optimizer substitution` | Optimizer often expands regular views and may match indexed views; reference does not force materialization. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `View metadata refresh sp_refreshview` | Refreshes stored non-schema-bound view metadata after dependency changes. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql?view=sql-server-ver17)) |
| `Indexed view unique clustered index prerequisite` | Create schema-bound view first; its first index must be unique clustered. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17)) |
| `Indexed view required SET options` | Required: ANSI_NULLS, ANSI_PADDING, ANSI_WARNINGS, ARITHABORT, CONCAT_NULL_YIELDS_NULL, QUOTED_IDENTIFIER ON; NUMERIC_ROUNDABORT OFF. Apply at create, base DML, and optimizer use. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17)) |
| `Indexed view determinism and precision` | Definition must be deterministic; precise expressions are required for keys, WHERE, and GROUP BY. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17)) |
| `Indexed view DML maintenance cost` | Every base-table write maintains the view index synchronously and can increase write cost. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17)) |
| `Inline TVF relational expansion` | Single SELECT is exposed to the optimizer, unlike a populated return table variable. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining?view=sql-server-ver17)) |
| `MSTVF return table variable` | RETURNS @name TABLE declares output table populated by function statements. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/create-user-defined-functions-database-engine?view=sql-server-ver17)) |
| `MSTVF interleaved execution` | Eligible compatibility 140+ queries can use observed first-execution row count during optimization; it does not inline body or provide full stats. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/create-user-defined-functions-database-engine?view=sql-server-ver17)) |
| `Scalar UDF inlining compatibility level 150` | SQL Server 2019+ eligibility begins at compatibility 150; definition and query context still gate transformation. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining?view=sql-server-ver17)) |
| `Scalar UDF is_inlineable metadata` | Definition-derived eligibility flag, not proof a particular compiled query inlined the function. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining?view=sql-server-ver17)) |
| `Scalar UDF inlining not guaranteed` | Optimizer chooses per use; inspect the actual/compiled plan and configuration. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining?view=sql-server-ver17)) |
| `INLINE function option` | INLINE=ON/OFF controls scalar UDF inlining for that function; ON errors if the definition is ineligible. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining?view=sql-server-ver17)) |
| `UDF dynamic SQL restriction` | T-SQL UDF definitions cannot execute dynamic SQL; use a procedure or caller batch. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `UDF temporary table restriction` | T-SQL UDFs cannot use temporary tables; table variables are allowed only in supported forms. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-function-transact-sql?view=sql-server-ver17)) |
| `Indexed view COUNT_BIG grouped aggregate requirement` | A grouped indexed view must include COUNT_BIG(*) so the engine can maintain group row counts correctly. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17)) |
| `Indexed view unsupported syntax boundary` | Indexed views exclude constructs including DISTINCT, TOP, outer joins, APPLY, derived tables, UNION, window functions, and several others; check current full restriction list. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17)) |
| `Indexed view base owner and two-part names` | Base tables and view must share an owner; table and function references use schema-qualified two-part names. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17)) |
| `Indexed view IGNORE_DUP_KEY OFF` | The unique clustered index on an indexed view requires IGNORE_DUP_KEY=OFF. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views?view=sql-server-ver17)) |
| `Scalar UDF inlining disable scopes` | Inlining can be disabled through database-scoped configuration, function INLINE option, or query hint; precedence differs by scope. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining?view=sql-server-ver17)) |
| `DISABLE_TSQL_SCALAR_UDF_INLINING hint` | USE HINT disables scalar UDF inlining for that query and takes precedence over database-scoped setting. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/scalar-udf-inlining?view=sql-server-ver17)) |

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
