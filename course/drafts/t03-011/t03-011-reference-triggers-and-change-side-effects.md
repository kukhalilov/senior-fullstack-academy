# stored procedures views functions triggers and dynamic SQL — Reference: DML triggers, inserted/deleted rows, and side-effect control

# Scope and version
Targets SQL Server 2025 (17.x). Azure SQL and Fabric details may differ. Every exact inventory item is explained below.

# How this group fits the mental model

Choose module form by composition, control-flow, and side-effect needs. Runtime behavior and permissions are part of the public contract.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `DML trigger` | Synchronous module fired by a DML statement; runs within its transaction and adds latency/failure effects. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `AFTER trigger` | Runs after statement actions and constraints succeed but before commit; not an after-commit callback. AFTER triggers cannot be defined on views. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `AFTER trigger cannot be defined on a view` | A DML trigger on a view must be `INSTEAD OF`; `AFTER` triggers are supported on tables, not views. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `INSTEAD OF trigger` | Runs in place of the triggering DML; useful to map writes through complex views. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `DDL trigger` | Fires for database/server DDL events and exposes EVENTDATA, not inserted/deleted. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/ddl-triggers?view=sql-server-ver17)) |
| `LOGON trigger` | Fires after authentication before session establishment; failure can deny login. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `CREATE TRIGGER` | Defines DML, DDL, or LOGON trigger with explicit event and scope. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `ALTER TRIGGER` | Replaces trigger definition; retest enablement and ordering after deployment. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `CREATE OR ALTER TRIGGER` | Creates/replaces trigger; event and batch rules still apply. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `CREATE TRIGGER batch boundary` | `CREATE TRIGGER` must be the first statement in a query batch; `GO` is a client batch separator, not T-SQL. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Trigger EXECUTE AS clause` | Selects the security context for referenced objects in trigger code; audit the effective principal and grant only the needed permissions. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Trigger WITH ENCRYPTION clause` | Obfuscates trigger text in metadata and prevents replication publication; it is not a security boundary. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Memory-optimized table trigger native compilation requirements` | Triggers on memory-optimized tables must be natively compiled, schema-bound, and use an `ATOMIC` block with `EXECUTE AS`; only supported trigger actions and T-SQL constructs are allowed. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `DML triggers cannot be defined on temporary tables` | SQL Server does not allow DML triggers on local or global temporary tables. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `INSTEAD OF trigger cannot coexist with view WITH CHECK OPTION` | SQL Server rejects an `INSTEAD OF` trigger on an updatable view that has `WITH CHECK OPTION`; remove or redesign the option before adding the trigger. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `inserted logical table` | Statement-scoped set of new images for INSERT/UPDATE. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/use-the-inserted-and-deleted-tables?view=sql-server-ver17)) |
| `deleted logical table` | Statement-scoped set of old images for DELETE/UPDATE. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/use-the-inserted-and-deleted-tables?view=sql-server-ver17)) |
| `Statement-level trigger firing` | One invocation per statement regardless of affected row count. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `DML trigger fires even when zero rows are affected` | A DML trigger can fire when a valid INSERT, UPDATE, or DELETE statement affects zero rows; use `inserted`/`deleted` rowset checks when work should happen only for actual changes. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `ROWCOUNT_BIG early exit for no-op trigger statements` | Check `IF (ROWCOUNT_BIG() = 0) RETURN;` at the start of a DML trigger to skip unnecessary work when the statement changed no rows. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Trigger result sets deprecated and disallowed for LOGON` | Returning result sets from triggers is slated for removal; avoid SELECTs that return rows to the caller. LOGON triggers always disallow result sets, and one that emits a result set denies that login. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Multirow trigger correctness` | Use set-based joins and aggregates over pseudo tables; never assume one affected row. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/use-the-inserted-and-deleted-tables?view=sql-server-ver17)) |
| `UPDATE(column)` | True if column was targeted, even if assigned its existing value. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/use-the-inserted-and-deleted-tables?view=sql-server-ver17)) |
| `COLUMNS_UPDATED` | Bit mask marks columns targeted by INSERT/UPDATE; map bits to column_id safely. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/use-the-inserted-and-deleted-tables?view=sql-server-ver17)) |
| `TRIGGER_NESTLEVEL` | Reports trigger nesting depth; use with care as a defensive guard, not as invariant enforcement. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `RECURSIVE_TRIGGERS setting` | Database setting controls direct recursive trigger firing; indirect nesting has separate server option. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Nested trigger` | Trigger DML can fire other triggers; chain has a 32-level cap. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Trigger order` | Same-event order is undefined unless a first/last trigger is designated. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `sp_settriggerorder` | Designates one AFTER trigger first and one last per event; ALTER may reset designation. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Disable trigger` | Suspends firing while preserving definition; specify table/database/server scope exactly. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Enable trigger` | Resumes firing; changes during disabled interval are not replayed. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Trigger recursion` | Direct or indirect re-entry can loop; coordinate database and server settings. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Trigger transaction context` | Trigger shares caller transaction; failure/rollback can abort caller work. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Trigger side-effect hazard` | Hidden writes or external actions complicate retries and latency; outbox is safer for post-commit delivery. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `NOT FOR REPLICATION trigger` | Suppresses firing for qualifying replication-agent changes, not general application sessions. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Trigger fires once per statement` | A multirow UPDATE still invokes trigger once with a set. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `inserted and deleted are sets` | Join by stable key; row order and singleton cardinality are not promised. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/use-the-inserted-and-deleted-tables?view=sql-server-ver17)) |
| `UPDATE() means column targeted` | Use inserted/deleted comparison to test actual change. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/use-the-inserted-and-deleted-tables?view=sql-server-ver17)) |
| `COLUMNS_UPDATED bitmask interpretation` | Use varbinary-safe bit checks for high column_id values; do not assume an int mask. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/use-the-inserted-and-deleted-tables?view=sql-server-ver17)) |
| `TRUNCATE TABLE does not fire DML trigger` | TRUNCATE is not DELETE and does not activate DELETE triggers. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Multiple triggers firing order undefined` | Without first/last designation, order is unspecified. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `One first and one last trigger per action` | Only one AFTER trigger per event can be designated first and one last. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Nested trigger maximum depth 32` | At most 32 nested trigger levels; excess nesting raises error and can abort transaction. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `RECURSIVE_TRIGGERS direct recursion only` | OFF disables direct recursive triggers; indirect nesting also requires nested triggers OFF. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `nested triggers server option indirect recursion` | Server option controls nested/indirect chains; disabling can affect recursive behavior too. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Trigger ROLLBACK stops remaining trigger chain` | ROLLBACK in a trigger ends the transaction and stops subsequent triggers in the chain. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Trigger runs in caller transaction` | Trigger writes commit/rollback with invoking statement; no autonomous transaction exists. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `DDL trigger EVENTDATA` | Returns XML describing the triggering DDL event; inspect event/object/login fields. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/ddl-triggers?view=sql-server-ver17)) |
| `LOGON trigger failed-login consequence` | An error rolls back login and denies connection; preserve tested sysadmin recovery path. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `NOT FOR REPLICATION trigger boundary` | Replication-agent changes can bypass trigger; normal sessions still activate it. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `Trigger pseudo tables lack ordinary indexes/statistics` | Internal rowsets have no user-managed indexes/statistics; large joins require plan testing. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `INSTEAD OF trigger one per action` | Only one INSTEAD OF trigger can be defined for each supported action on a table or view. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |
| `DDL trigger database and server scope` | DDL triggers can be database-scoped or server-scoped; select matching event scope and inspect EVENTDATA. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/triggers/ddl-triggers?view=sql-server-ver17)) |
| `AFTER trigger versus INSTEAD OF timing` | AFTER runs after statement and constraints but before commit; INSTEAD OF replaces the original operation. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-trigger-transact-sql?view=sql-server-ver17)) |

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
