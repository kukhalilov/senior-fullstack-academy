# model configuration entities properties and keys — Exercises and worked solutions

Source basis: [EF Core entity properties](https://learn.microsoft.com/en-us/ef/core/modeling/entity-properties), [keys](https://learn.microsoft.com/en-us/ef/core/modeling/keys), and [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Goals

- Build a model whose CLR shape, EF metadata, and relational schema express the same domain rules.
- Choose between entity, owned type, complex type, key, index, default, and generated-value mechanisms.
- Detect when a feature is provider-specific and verify its behavior without treating a lightweight test provider as proof of production SQL behavior.

## Worked example

An order belongs to a tenant. The externally visible order number is unique within a tenant; email must be unique; address is a value object; a database-generated row version detects competing updates.

```csharp
modelBuilder.Entity<Order>(order =>
{
    order.HasKey(x => new { x.TenantId, x.OrderNumber });
    order.HasIndex(x => new { x.TenantId, x.CreatedAt });
    order.ComplexProperty(x => x.ShippingAddress, address =>
    {
        address.Property(x => x.PostalCode).HasMaxLength(16);
    });
    order.Property(x => x.Version).IsRowVersion();
});

modelBuilder.Entity<Customer>()
    .HasIndex(x => x.Email)
    .IsUnique();
```

The composite key identifies an order within its tenant. Address has no independent identity. The email index enforces uniqueness but is not an EF alternate key. The row-version mapping only works when the target provider/database supplies compatible generation semantics.

## Exercises

1. Configure a `Product` with a generated surrogate key, a required SKU, a unique SKU constraint, and a decimal price with four fractional digits.
2. A database default supplies `CreatedAt` when omitted. Explain when EF might send a CLR default instead of omitting the column. Show how a custom sentinel could distinguish “unset” from a meaningful default value.
3. Map a private `List<string>`-like mutable value through a converter. Explain why a `ValueComparer` may be required and what it must implement conceptually.
4. A report view has no stable key. Configure it for querying and state which normal entity operations are unavailable.
5. A migration suddenly renames every SQL Server default constraint after enabling model-wide named default constraints. Explain why and propose a safe rollout review.
6. Two users edit the same row. Design a concurrency conflict response that preserves both users' intent rather than blindly retrying the stale update.
7. EF Core 11 stores nested address values as JSON. Identify what must be confirmed before adding an index on a nested path in production.

## Progressive hints

1. Separate uniqueness enforcement from identity. Use `HasKey`/provider generation for the surrogate key and a unique `HasIndex` for SKU.
2. A database default applies when a column is omitted. EF uses sentinel semantics to decide whether a generated/defaulted value is considered set.
3. Mutable references can change internally while retaining the same object reference. Snapshot, equality, and hash behavior need to reflect the persisted value.
4. Use a keyless entity type and view mapping; it is query-shaped rather than a tracked row identity.
5. The opt-in naming convention changes constraint metadata and can produce rename operations. Inspect generated SQL and migration operations against a restored production-like schema.
6. Reload current values, present/merge conflicting fields, validate invariants, and save with a fresh concurrency token; the right policy is domain-specific.
7. Confirm EF/provider version, JSON path/index support and generated DDL, null/collation semantics, query translation, migration behavior, and performance with representative data.

## Complete solutions

1. One possible relational configuration:

   ```csharp
   modelBuilder.Entity<Product>(product =>
   {
       product.Property(x => x.Id).ValueGeneratedOnAdd();
       product.Property(x => x.Sku).IsRequired().HasMaxLength(40);
       product.HasIndex(x => x.Sku).IsUnique();
       product.Property(x => x.Price).HasPrecision(19, 4);
   });
   ```

   The primary key is assumed to be discovered by convention or configured explicitly. The actual key-generation strategy and types/constraints must be checked for the selected provider.

2. If `CreatedAt` has a meaningful CLR value equal to the default sentinel, EF may treat it as unset and omit it so the database default runs. Choose a sentinel outside the valid domain, for example `DateTime.MinValue` only if it is invalid business data, and configure it with `HasSentinel`. Do not assume sentinel behavior is a database feature; it is EF's set/unset decision.

3. Configure a converter between the domain value and a provider-supported scalar representation. The comparer should provide value equality, a stable hash consistent with equality, and a deep snapshot that does not share mutable state with the tracked value. Test mutations after tracking and ensure parameter/query translation fits the operations required.

4. Configure `HasNoKey()` and `ToView("... ")` (using the actual view name). It can be queried but does not have normal tracked entity identity and cannot be inserted, updated, or deleted through ordinary entity persistence.

5. Review the generated migration and SQL, identify renames versus drop/recreate operations, test against a backup/production-like database, assess locks and deployment ordering, and use an explicit migration plan. The automatic naming setting can affect existing constraints, so the migration should not be accepted without review.

6. Catch `DbUpdateConcurrencyException`, load the current database state and original user intent, then resolve field-by-field or ask for a user decision. Revalidate domain invariants and retry with the current token only after choosing merged values. An unconditional overwrite discards the other writer's update.

7. Validate the exact provider's EF11 support and generated migration/SQL, inspect query translation and index expression/path semantics, test inserts/updates and representative query plans, verify null and collation behavior, and measure write/storage cost. The feature is not portable merely because the EF model API compiles.

## Tests and edge cases

- Verify the relational model has the expected key/index/filter/column facets, then inspect provider-generated migrations/SQL.
- Test duplicate SKU/email inserts against the actual database engine because provider-specific uniqueness and null behavior matter.
- Test generated defaults both when a value is omitted and when it is explicitly set, including the sentinel value.
- Test change tracking after in-place mutation of converted mutable values.
- Test stale-token updates and deletion conflicts with two independent contexts.
- Verify EF11 complex/JSON mapping and nested indexes with the exact provider and migration path; do not infer support from InMemory tests.
- Confirm a `HasData` change produces intended migration operations and stable keys.

## Reflection questions

- Which constraints belong in the database even if the application validates them first?
- Which model assumptions are provider-specific and therefore require integration tests?
- Does each key represent stable identity, and does each index serve a measured query or integrity rule?
- How will operators diagnose and resolve concurrency conflicts in production?
