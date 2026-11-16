# stored procedures views functions triggers and dynamic SQL — Core concepts and how they fit together

# Learning objectives

Choose the right SQL module contract; distinguish parameter/result/error channels; compose safe dynamic SQL; explain view/function optimization boundaries; write set-correct triggers.

# Prerequisites

Know SELECT/DML, schemas, permissions, transactions, and execution plans.

# Core concepts

A stored procedure is an executable module. Parameters have declared types and optional defaults; omitted arguments invoke defaults while explicit NULL remains NULL. Result sets, OUTPUT values, and RETURN status are independent channels. Keep result shape stable for clients. SET NOCOUNT ON removes row-count messages, not result sets or @@ROWCOUNT. TRY/CATCH does not catch every error class, and transaction cleanup belongs in the procedure/client contract.

Dynamic SQL has a separate parse/compile scope. sp_executesql accepts Unicode batch text and typed parameters; stable statement text can reuse plans. Parameters represent values, not identifiers, sort directions, keywords, or fragments. Permit-list structural choices, quote identifiers, and use wide buffers. Static ownership chaining does not automatically protect dynamic SQL references.

A normal view stores a query definition, not rows. It has no inherent order and can be expanded into the caller query. An indexed view is different: its result is stored via a unique clustered index and synchronously maintained. Schema binding, determinism/precision, two-part names, required SET options, and write amplification make it a physical-design choice.

Functions are constrained query components. Inline TVFs expose one relational SELECT; MSTVFs populate a table variable; scalar UDFs return one value. SQL Server 2019+ scalar UDF inlining at compatibility 150+ can transform eligible definitions, but eligibility does not guarantee inlining. MSTVF interleaved execution can improve estimates on eligible compilation paths without making the body inline.

Triggers fire once per statement, not once per row. inserted/deleted are sets: INSERT supplies new rows, DELETE supplies old rows, UPDATE supplies both images. UPDATE(column) reports target-list use, not changed values. Trigger execution shares the caller transaction; failures, rollback, recursion, and hidden latency affect the initiating statement.

# Mechanisms and relationships

Views and inline TVFs compose in FROM. Procedures own command flow. Scalar UDFs are scalar expressions, with optimization contingent on eligibility/context. Use constraints for declarative rules and triggers only when synchronous behavior across all writers is required.

# Worked examples

A procedure accepts a customer id and sort key. It validates sort key against a finite allow-list, safely quotes that identifier, and passes customer id via sp_executesql binding. It returns a stable result set. A trigger that maintains audit rows uses a set-based INSERT from inserted joined to deleted.

# Misconceptions and edge cases

- A stored procedure is not automatically a safe transaction or permission boundary.
- Parameterization protects values, not identifiers.
- Ordinary procedures are not schema-bound; natively compiled procedures are a specific exception.
- Views are not materialized or ordered by default.
- UDF inlining and MSTVF interleaved execution are conditional optimizer features.
- Triggers are not per-row or after-commit callbacks.

# Knowledge checks with answers

1. Safely vary a sort column? Allow-list and quote the identifier; bind values.
2. What makes a view indexed? Schema-bound deterministic definition, required SET options, and unique clustered index.
3. What are inserted/deleted? Statement-scoped rowsets with new/old images.
4. Does is_inlineable prove the function was inlined? No; inspect query plan.

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
