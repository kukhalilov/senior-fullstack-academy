# raw SQL bulk updates and Dapper comparison — Exercises and worked solutions

Sources: Microsoft's [SQL query guide](https://learn.microsoft.com/en-us/ef/core/querying/sql-queries), [ExecuteUpdate/Delete guide](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete), and [Dapper official project](https://github.com/DapperLib/Dapper). EF Core 11.0.0 shipped 2026-11-10.

## Goals

Practice selecting an appropriate data-access path, keeping values parameterized, understanding set-based state boundaries, and coordinating a mixed EF/Dapper transaction.

## Worked example

An application needs to update expired subscriptions and write an audit row. First decide whether the update can be expressed as a translated set-based operation. If yes, use a tenant- and concurrency-aware predicate with `ExecuteUpdateAsync`, inspect the affected count, and remember tracked instances are stale. If audit and update must be atomic and audit uses Dapper, start one EF transaction, execute the update, execute the Dapper insert on the same connection/transaction, and commit. If the entire unit is retried, make it idempotent and reconcile uncertain commits. Parameterize all data values.

## Exercises

1. A query needs provider-specific ranking SQL and returns a DTO not modeled as an entity. Choose between LINQ, `FromSql`, `Database.SqlQuery<T>`, and Dapper. Explain mapping constraints.
2. A user may choose a column to sort by. Show how to safely support a fixed set of sort columns.
3. A bulk update affects zero rows, but the request expected one. Explain what this means and how to distinguish missing data from a concurrency conflict.
4. Two `ExecuteUpdateAsync` calls must either both happen or neither. What boundary is needed?
5. After an `ExecuteUpdateAsync`, a tracked entity is later saved. Explain a stale-state failure and prevention.
6. A Dapper query returns 100,000 rows. Compare buffered and unbuffered use and connection lifetime.

## Progressive hints

1. Scalar/unmapped SQL and DbSet entity SQL are different shapes. Ask whether EF needs to track/map the result.
2. Parameters handle values, not identifiers. Do not sanitize by merely removing punctuation.
3. The affected-row count tells you the predicate result, but the predicate should encode expected token/state.
4. Immediate calls need an explicit transaction for a multi-command atomic unit.
5. The context tracker does not learn about direct SQL updates.
6. Unbuffered iteration keeps its reader/connection active until consumption ends.

## Complete solutions

1. Prefer `Database.SqlQuery<SummaryDto>` if current EF supports mapping the unmapped result shape and you want EF integration; check each result column maps to a DTO property and provider translation. Use `FromSql` on a mapped/keyless model type when the result fits the model and entity/query behavior is needed. Dapper is reasonable for a deliberately SQL-first read boundary and requires explicit row mapping. Choose based on mapping, composition, tracking, and provider support, not an assumption that raw SQL is faster.
2. Map a typed sort choice such as `SortMode.Name` or `SortMode.CreatedAt` to fixed, reviewed SQL fragments or prebuilt LINQ branches. Keep search terms as parameters. Never place raw request text into the SQL identifier slot.
3. Zero affected rows means no row matched the full predicate (or provider count semantics differ). If the predicate contains ID, tenant, and expected concurrency token, treat zero as a stale/missing/unauthorized case without leaking which one unless policy allows; perform a separate authorized check if the business response must distinguish them. Do not silently report success.
4. Use one explicit transaction on the same connection for both updates. Roll back on failure. If the provider uses a retrying execution strategy, execute the whole transaction delegate according to the provider's guidance and ensure replay is safe.
5. The direct update changes the database, not the tracked snapshot/current object. A later `SaveChanges` may overwrite the set-based value from stale state. Avoid mixing paths for the same entities, reload/clear affected entries, or use a fresh context.
6. Buffered results simplify use after the query returns but consume memory proportional to all rows. Unbuffered results let the consumer process incrementally but keep the data reader and connection occupied; finish/dispose enumeration before reusing the connection. For huge results, also consider bounded server paging and streaming cancellation/error behavior.

## Tests and edge cases

- A value contains SQL-looking text; verify it remains one parameter value and cannot change command structure.
- A caller selects an unrecognized sort field; reject it rather than defaulting to arbitrary SQL text.
- A bulk update has a concurrency token mismatch; affected count is zero and the API reports the chosen conflict policy.
- The second command fails; verify the first command rolls back when both share the explicit transaction.
- A retry repeats an audit insert; enforce an idempotency/unique operation key or verify before replay.
- A Dapper unbuffered iterator is abandoned early; dispose it so the reader/connection is released.

## Reflection questions

1. What specific requirement justified leaving LINQ translation?
2. Which exact values are parameters, and which structural choices are from an allow-list?
3. What EF behaviors change when using immediate set-based DML?
4. How is the shared connection/transaction lifetime owned?
5. What integration test against the production database engine would protect provider-specific SQL and mapping?
