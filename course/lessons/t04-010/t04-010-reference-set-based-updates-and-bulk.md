# raw SQL bulk updates and Dapper comparison — Reference: Set-based update/delete, batching, and change-tracker boundaries

## Scope and version

Sources: Microsoft's [ExecuteUpdate and ExecuteDelete](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete), [EF Core 7 release notes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-7.0/whatsnew), and [.NET 11 EF Core release notes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew). These built-in set-based APIs started in EF Core 7 and remain available in EF Core 11.0.0, released 2026-11-10. They require provider translation support.

## How this group fits the mental model

Tracked `SaveChanges` accumulates entity changes and persists them as a unit of work. Set-based DML translates a query filter into an immediate database statement. Third-party bulk tools may add insertion/identity features, but their semantics are library-specific.

## Supplied names explained

- `ExecuteUpdate` — applies translated property assignments to every matching row in one database update without loading entities. It executes immediately, does not update tracked instances, and does not call `SaveChanges`.
- `ExecuteUpdateAsync` — asynchronous counterpart returning the affected-row count. Pass cancellation where supported; cancellation does not prove the database did not commit.
- `ExecuteDelete` — deletes matching rows directly in the database without materializing entities or marking each one deleted in the tracker.
- `ExecuteDeleteAsync` — asynchronous counterpart returning affected rows. Database constraints/cascades and provider behavior still apply.
- `SetProperty` — expresses the property assignment for `ExecuteUpdate`; a value can be constant/parameterized or derived from the row's current value in a translatable expression. Translation is provider-limited.
- `SetPropertyCalls<TSource>` — the fluent setter-expression type passed to the update lambda, allowing chained property assignments. It is an expression-building API, not a command executed independently.
- `ExecuteUpdate does not call SaveChanges` — the database update has already happened when the method returns; later `SaveChanges` is a separate operation and may overwrite values from stale tracked entities.
- `ExecuteUpdate bypasses change tracker` — tracked objects are not loaded, detected, refreshed, or reconciled. Reload/clear affected entities or keep set-based and tracked workflows separate.
- `ExecuteDelete bypasses tracked entities` — tracked deleted rows are not automatically detached/marked deleted. Avoid later saving stale instances as if they still represent database state.
- `Concurrency token handling for ExecuteUpdate` — optimistic concurrency is not automatically checked against the tracked entity's original token. Add the expected token to the filter and treat affected-row count zero as a conflict when that is the required policy.
- `Affected row count` — returned count is useful for checking whether the intended predicate matched rows. Provider/database behavior around triggers, matched versus changed rows, and large counts can differ; do not assume it proves every business invariant.
- `Multiple ExecuteUpdate calls transaction boundary` — each call executes immediately and EF does not automatically wrap a series of calls in one transaction. Start an explicit transaction if all statements must commit or roll back together.
- `SaveChanges batching` — EF may batch multiple tracked insert/update/delete commands into fewer round trips when supported by the relational provider. Batching retains change tracking and SaveChanges semantics; exact grouping is provider/configuration dependent.
- `Relational batching` — grouping relational modification commands for execution. It reduces trips, but command ordering, generated values, provider capabilities, and transaction rules constrain grouping.
- `Provider max batch size` — provider option that can cap a modification batch. Raising it can reduce trips but may encounter parameter/command limits or longer commands; use provider documentation and measurements.
- `Third-party bulk extension boundary` — external packages may provide bulk insert/update/delete, staging, or merge operations beyond EF's built-in set-based API. Verify supported providers, generated SQL, transaction participation, identity/concurrency semantics, and license/maintenance status.
- `Bulk insert extension comparison` — EF's built-in `ExecuteUpdate`/`ExecuteDelete` do not insert sets of rows. Bulk insert libraries may use provider-specific bulk-copy/staging mechanisms and have different defaults for generated keys, triggers, and validation.
- `Bulk update extension comparison` — compare extension-generated SQL, batching, graph handling, and transaction semantics with built-in translated `ExecuteUpdate`; neither automatically reproduces application per-entity domain logic.
- `Bulk delete extension comparison` — inspect whether the library issues set-based delete, key batches, or other provider-specific commands and whether cascades/soft-delete filters apply.
- `Identity retrieval in bulk insert` — obtaining generated keys for many inserted rows depends on provider/library strategy and may require an output clause, sequence, staging table, or follow-up query. Verify ordering and mapping; never assume returned IDs align with input order.

## Cross-item comparison

`ExecuteUpdate` is immediate and set-based, while a tracked entity update waits for `SaveChanges` and invokes change detection/SaveChanges pipeline behavior. `ExecuteDelete` avoids loading each row; `DbSet.RemoveRange` marks entities for later persistence and requires entity instances or tracked entries. `SaveChanges batching` groups tracked commands but is not the same as one set-based update. Bulk extensions vary, particularly for inserts and generated identity values.

## Examples

An optimistic update can filter by both row key and expected concurrency token, set new values, and treat an affected-row count of zero as a conflict. If the same entity is already tracked, reload it or avoid mixing the workflows. To update multiple fields atomically with another database command, begin an explicit transaction around both commands. Use a provider-supported isolation level appropriate to the invariant.

## Common mistakes

- Expecting `SaveChanges` to flush or coordinate several `ExecuteUpdate` calls.
- Updating rows without a token predicate and claiming optimistic concurrency is automatic.
- Reading stale tracked entities after a set-based update.
- Assuming a bulk library retrieves identity values in input order.
- Treating relational batching as a universal fixed batch size.
- Choosing a bulk package without checking provider support, transaction behavior, and maintenance.

## Knowledge checks with answers

1. **Does `ExecuteUpdate` invoke change detection?** No; it translates and executes a database update without using the change tracker.
2. **How do you implement optimistic conflict detection?** Add the expected token to the predicate and inspect whether the affected count matches the expected result.
3. **Are two set-based calls atomic together by default?** No. Use an explicit transaction for a multi-command atomic unit.
4. **Does EF Core provide a general built-in bulk insert counterpart in this scope?** No; use tracked inserts or evaluate provider/third-party bulk facilities with their own semantics.
