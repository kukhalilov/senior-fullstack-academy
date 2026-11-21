# raw SQL bulk updates and Dapper comparison — Interview questions and reasoning

Sources: Microsoft's [SQL queries](https://learn.microsoft.com/en-us/ef/core/querying/sql-queries), [ExecuteUpdate/Delete](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete), and the [Dapper official project documentation](https://github.com/DapperLib/Dapper).

## Core questions

1. When do you use raw SQL with EF Core?
2. How do interpolated EF SQL APIs prevent injection, and what do they not protect?
3. How do `FromSql`, `SqlQuery<T>`, and `ExecuteSql` differ?
4. What does composable SQL mean? Why are stored procedures often non-composable?
5. What does `ExecuteUpdate` change compared with tracked `SaveChanges`?
6. How do you handle optimistic concurrency with a set-based update?
7. Are multiple `ExecuteUpdate` calls automatically atomic together?
8. What does Dapper provide relative to EF Core?
9. How can EF and Dapper participate in one transaction?
10. What are the risks of buffered versus unbuffered queries?

## Concise interview answers

1. When translation is unavailable, database-specific SQL is required, or measured generated SQL is unsuitable. Keep the escape hatch narrow and test it on the production provider.
2. `FormattableString` interpolation values become DB parameters. It does not parameterize SQL identifiers/keywords, and safety is lost if interpolation is pre-rendered into a normal string.
3. `FromSql` begins an entity query from a DbSet; `SqlQuery<T>` queries scalar/unmapped results through the database facade; `ExecuteSql` runs a non-query command and returns affected count.
4. Composable SQL can be wrapped as a subquery so EF appends server-side LINQ. Stored procedure syntax often cannot appear in a subquery, particularly on SQL Server.
5. It executes immediately as set-based DML, does not load rows, call `SaveChanges`, run normal tracked change detection, or synchronize already tracked entities.
6. Put the expected token/state in the update filter and inspect the affected count; zero may indicate a stale row or no authorized/matching row.
7. No. Each executes immediately; use an explicit transaction for a multi-command atomic unit.
8. Dapper executes SQL and maps rows over ADO.NET with lightweight helpers. It does not provide EF's model-driven change tracker, relationship fix-up, LINQ provider, or migrations.
9. Reuse the same connection and active transaction, passing that transaction explicitly to Dapper. A different connection is outside the transaction.
10. Buffering consumes memory but finishes reading before later processing. Unbuffered enumeration lowers full-result memory but keeps reader/connection resources occupied until consumed/disposed.

## Deep follow-up answers

### A team concatenates a user-selected column into `FromSqlRaw`

Database parameters cannot represent identifiers. Accept a closed set of sort choices, map each to a fixed reviewed fragment, and parameterize all values. Validate the entire selection; escaping arbitrary SQL text is not an adequate allow-list. Also consider whether each allowed sort has an acceptable index and whether it exposes data the caller may not access.

### A raw entity result fails at runtime

Check that the SQL returns all mapped columns with expected database column names/aliases and compatible types. Determine whether the SQL is composable; check whether the provider wraps it as a subquery. Stored procedures frequently require stopping server composition before materialization. Verify tracking mode: raw entity queries track by default unless changed.

### How would you combine a set-based update and Dapper audit insert?

If both must commit atomically, use one EF transaction/underlying connection and pass the same transaction to Dapper. The set-based update is immediate and tracked entries remain stale. Check affected-row count, rollback on failure, and make the unit safe under the configured retry strategy. Ensure the Dapper connection isn't disposed by two owners.

### When is Dapper worth adding?

When SQL-first control, a reporting query, or focused mapping makes the boundary clearer or measurably better. Include team familiarity, migration/schema ownership, tests, transaction and retry policy, and duplicated domain logic in the cost. Dapper's lower framework overhead alone does not establish application-level performance gains.

## Scenario questions

1. **A stored procedure returns a report result and needs another filter.** Decide whether filtering belongs in the procedure/query or can safely occur after bounded materialization; avoid attempting unsupported server composition.
2. **A bulk update should only succeed if version is still 12.** Add row key, tenant scope, and expected version to the predicate; update and check affected count as the concurrency outcome.
3. **One command succeeds and the next fails.** If both were required atomically, use a shared explicit transaction; otherwise document partial-commit behavior and add recovery.
4. **Dapper and EF both access the same row in one request.** Define ownership and ordering; avoid stale tracked state and use the same transaction if consistency needs one atomic unit.

## Tradeoffs and alternatives

LINQ favors model composition and provider portability; raw SQL favors exact control but binds code to SQL/provider details. Tracked updates run application unit-of-work logic; set-based DML minimizes row materialization but bypasses it. EF Core offers broader ORM services; Dapper offers lightweight SQL mapping. Choose the smallest boundary that fulfills the requirement and can be tested/maintained.

## Common weak answers

- “Interpolation is always safe” without naming the API overload or identifier limitation.
- “Raw SQL is faster” without an actual plan and workload measurement.
- “`ExecuteUpdate` will be saved later” or “it updates my tracked object.”
- “The transaction covers both libraries” when they use different connections.
- “Dapper is an ORM replacement” without acknowledging mapping, unit-of-work, and migration responsibilities.
- “The update affected zero, so the row doesn't exist” when the predicate also includes tenant/concurrency conditions.

## Self-check rubric

| Skill | A strong answer demonstrates |
|---|---|
| API selection | Correct result shape and execution boundary for query versus command. |
| SQL safety | Parameterized values and allow-listed identifiers/keywords. |
| State semantics | Immediate set-based writes, stale tracking, and explicit concurrency handling. |
| Atomicity | Same connection and active transaction for mixed tool operations. |
| Tool tradeoffs | Specific reason to choose EF LINQ, EF raw SQL, or Dapper, plus testing/maintenance cost. |
