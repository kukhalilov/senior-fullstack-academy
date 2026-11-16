# raw SQL bulk updates and Dapper comparison — Reference: Parameterized SQL, entity queries, and command execution

## Scope and version

Sources: Microsoft's [SQL query guidance](https://learn.microsoft.com/en-us/ef/core/querying/sql-queries), [ExecuteUpdate/Delete guidance](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete), [related-data guidance](https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager), and [.NET 11 EF Core release notes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew). EF Core 11.0.0 shipped on 2026-11-10. Provider SQL syntax and command APIs remain provider-specific.

## How this group fits the mental model

EF raw SQL lets application code own SQL while retaining EF mapping/query integration for supported result shapes. Values must still flow as database parameters; SQL syntax and identifiers are a separate trusted construction problem.

## Supplied names explained

- `FromSql` — EF Core 7+ recommended interpolated DbSet entry point for entity SQL. It accepts interpolated SQL as a `FormattableString`, parameterizes value holes, and can compose LINQ if the SQL is valid as a subquery.
- `FromSql<T>` — generic API form for querying a mapped entity type from SQL via a DbSet. Its `T` must match the DbSet's mapped entity; it is not a general arbitrary-result mapper. Use the current DbSet `FromSql` entry point for ordinary mapped queries.
- `FromSqlInterpolated` — older explicit interpolated-SQL API retained for compatibility; its `FormattableString` values become parameters. Prefer the current `FromSql` naming in new code when available in the target EF version.
- `FromSqlRaw` — DbSet SQL API accepting SQL text and separately supplied parameter values. SQL text is not automatically safe: interpolate only trusted/allow-listed structure and pass data separately as parameters.
- `SqlQuery<T>` — `Database.SqlQuery<T>` entry point for supported scalar or unmapped CLR result types. It can compose where the provider supports it; a composable scalar query generally aliases its result column as `Value` so EF's outer SQL can refer to it.
- `SqlQueryRaw<T>` — raw-string counterpart of `SqlQuery<T>` for dynamic SQL construction; any inserted structural SQL must be trusted/allow-listed and values should be parameters.
- `Database.SqlQuery<T>` — relational database facade method that queries scalar/non-entity CLR values without adding them as model entity types. It also supports unmapped result types in current EF versions when result columns map to the CLR type.
- `Database.SqlQueryRaw<T>` — raw SQL counterpart on the database facade for scalar or unmapped results. It does not make string concatenation safe.
- `ExecuteSql` — interpolated database-facade command API for executing SQL that returns no result set; interpolated values are parameterized. It returns an affected-row count.
- `ExecuteSqlInterpolated` — explicit interpolated command API with `FormattableString` parameter behavior; use it when the target API/version requires the explicit name.
- `ExecuteSqlRaw` — raw command execution API; SQL text and provided parameters are separate. Raw construction must validate structure and parameterize values.
- `Database.ExecuteSql` — database facade operation for an interpolated non-query command, parameterizing interpolated values and returning affected rows.
- `Database.ExecuteSqlRaw` — database facade operation for a raw non-query command with explicit parameters; it does not parameterize literal text assembled into the SQL string.
- `FormattableString SQL parameterization` — interpolated holes are represented as values in a `FormattableString`, allowing EF to create DB parameters. If converted to an ordinary string first, that safety information is lost.
- `SqlParameter` — provider-specific ADO.NET parameter object used to control the parameter's type and facets such as size, precision, scale, direction, and name. Match the database/procedure contract.
- `Interpolated SQL safety` — EF's interpolated APIs parameterize interpolation values; they do not safely quote dynamic identifiers. Confirm that the API overload is the interpolated one and never pre-render the `FormattableString` into SQL text.
- `Raw SQL identifier injection` — parameter placeholders cannot stand for table/column names or keywords. If structure must vary, map a validated enum/request choice to fixed SQL fragments; never directly insert user input as an identifier.
- `Composable SQL query` — SQL that EF can wrap as a subquery and append translated LINQ operators to. It generally needs a compatible `SELECT` form and must avoid trailing syntax invalid inside a subquery; exact restrictions are provider-specific.
- `Stored procedure non-composable query` — SQL Server cannot generally compose additional server-side operators over a stored procedure invocation. Materialize or switch to client-side enumeration after the procedure call when appropriate, recognizing later filters then run in application code.
- `Keyless entity raw SQL result` — keyless model type can represent a read-only shaped result without a primary key. Configure its columns/type and do not expect normal tracked updates or relationships.
- `Entity tracking for FromSql results` — entity instances returned from SQL follow ordinary query tracking defaults; add no-tracking mode when read-only behavior is intended.
- `Column-name matching requirement` — mapped entity SQL should return every property column EF expects, using mapped column names, not simply CLR property names. Aliases and provider behavior matter; verify materialization against the real database.
- `TagWith raw SQL query` — query tags can annotate EF queries that begin from raw SQL and help correlate commands. A tag is observability metadata, not a safety or performance mechanism.
- `DbCommand execution boundary` — lower-level ADO.NET command execution gives direct access to command text, parameters, connection, and transaction. The caller owns execution, result reader/resource disposal, mapping, timeout/cancellation, and transaction participation.

## Cross-item comparison

`FromSql`/`FromSqlInterpolated` preserve parameterized interpolation, while `FromSqlRaw` requires the caller to keep SQL structure trusted and values parameterized. `SqlQuery<T>`/`SqlQueryRaw<T>` target scalar or unmapped result shapes; `FromSql` targets model entities. `ExecuteSql` APIs execute commands, not mapped queries. `SqlParameter` offers precise type/facet control that inferred parameters may not provide.

## Examples

```csharp
var category = "Books";
var ids = await context.Database
    .SqlQuery<int>($"SELECT [Id] AS [Value] FROM [dbo].[Products] WHERE [Category] = {category}")
    .ToListAsync();
```

The category is a value parameter; `Value` is the scalar alias used when composing. For a dynamic sort column, select one of a few prewritten SQL fragments from a validated enum and concatenate only the chosen constant fragment; keep search values parameterized. For entity SQL, return the full mapped column shape or configure an appropriate keyless result type.

## Common mistakes

- Interpolating into `FromSqlRaw` as though it were `FromSql`.
- Building an ordinary string before passing it to an interpolated API.
- Trying to parameterize a column/table name.
- Composing LINQ over a stored procedure call that the provider cannot place in a subquery.
- Returning incomplete or incorrectly aliased columns for an entity mapping.
- Forgetting that entity results from raw SQL are tracked by default.
- Treating command execution as an automatically transactional multi-command workflow.

## Knowledge checks with answers

1. **Why does interpolated EF SQL parameterize values?** It receives a `FormattableString` and retains holes separately for DB parameter creation.
2. **Can a parameter represent a sort column?** No. Choose from trusted fixed fragments after validation.
3. **When can EF compose over raw SQL?** When the SQL is valid as a provider-supported subquery.
4. **What does `Database.ExecuteSql` return?** An affected-row count from a non-query command, not a set of mapped entities.
