# model configuration entities properties and keys — Reference: Primary and alternate keys, indexes, generated values, and tokens

## Scope and version

This lesson follows the [EF Core key documentation](https://learn.microsoft.com/en-us/ef/core/modeling/keys), [generated-properties documentation](https://learn.microsoft.com/en-us/ef/core/modeling/generated-properties), and EF Core 11.0.0 release notes. EF11 shipped on 2026-11-10. Index storage, included columns, identity mechanisms, filters, and row-version behavior depend on the database provider.

## How this group fits the mental model

Keys define entity identity and relationship targets. Indexes define database access structures and uniqueness constraints. Generated-value metadata coordinates EF's expectations with the database's behavior. Concurrency tokens let EF detect that a row changed since it was read. Each is related to persistence but serves a distinct purpose.

## Supplied names explained

- **HasKey** — Configures an entity's primary key. EF uses it for identity resolution, tracking, update/delete predicates, and relationship targeting.
- **HasAlternateKey** — Adds a unique key other than the primary key. Unlike a unique index, it can be the target of a foreign key and has key metadata semantics.
- **HasIndex** — Configures a database index over one or more properties. An index improves selected access paths at storage and write-maintenance cost; it does not guarantee a particular query plan.
- **IsUnique** — Marks an index as unique, asking the database to reject duplicate indexed values under provider/database null and collation rules.
- **HasDatabaseName** — Sets the physical index or constraint name in relational mappings. It does not rename the CLR property or key semantics.
- **HasFilter** — Sets a provider-specific SQL filter for a filtered/partial index. SQL syntax and supported semantics are provider-dependent.
- **HasFillFactor** — Configures a provider-specific index fill factor where supported; it is a storage/write/read tradeoff and should be measured for the workload.
- **HasKey composite key** — Configures a key from multiple properties, whose tuple identifies the entity. Property order is significant for relational key/index column ordering and generated constraints.
- **Primary key convention** — EF conventionally recognizes a property named `Id` or `<EntityName>Id` as a primary key for suitable entity types; make identity explicit when relying on a less common shape.
- **Alternate key** — A unique, stable model key in addition to the primary key, suitable as a relationship target. If uniqueness alone is needed, a unique index usually expresses the intent more directly.
- **Unique index** — Database uniqueness enforcement through an index. It does not give EF a second entity identity or relationship-target key.
- **Foreign-key index convention** — EF creates an index for foreign-key properties by convention unless those properties are already covered by a key/index with suitable leading columns; inspect the resulting model and database indexes.
- **ValueGeneratedOnAdd** — Marks a value as expected to be generated on insert. It does not itself implement generation; provider conventions or database configuration must supply it.
- **UseIdentityColumn** — SQL Server provider configuration for identity-column generation. It is not a portable replacement for generated-value metadata.
- **UseHiLo** — Configures a provider-supported high/low sequence strategy that allocates key ranges; it reduces round trips but may leave gaps and depends on provider/database sequence support.
- **HasSequence** — Adds/configures a database sequence in the relational model. A sequence exists independently of any one table column and must be wired to a generation strategy/default expression.
- **HasData model-managed data** — Adds fixed data to the model so migrations can insert/update/delete it. It is migration-managed seed data, not runtime initialization; changing keys/data can generate migration operations.
- **IsConcurrencyToken** — Marks a property as part of optimistic concurrency checks. EF includes its original value in update/delete predicates and reports a conflict when no row matches.
- **IsRowVersion** — Configures a provider/database-generated version token where supported, commonly setting concurrency and generation behavior. SQL Server `rowversion` is a binary counter, not a date/time.
- **Concurrency token** — A value compared against the originally read value when saving. A changed value causes `DbUpdateConcurrencyException`; the application decides whether to reload, merge, retry, or reject.
- **Keyless entity type** — Model shape with no primary key and no tracked entity identity. It is useful for views/raw query results and has restricted update/navigation behavior.
- **Natural key** — Identity based on meaningful domain attributes, such as an externally assigned code. It can be appropriate when stable and immutable, but natural values may change or have normalization/collation concerns.
- **Surrogate key** — Artificial identity such as an integer or GUID. It separates persistence identity from business meaning but does not remove the need for unique business constraints.
- **Index sort order** — Per-column ascending/descending ordering for an index. Order can matter for multi-column query ordering and provider support; it is distinct from query `ORDER BY` correctness.
- **Included property provider-specific boundary** — Non-key included columns can cover a query without participating in index ordering/uniqueness, but the fluent API and physical semantics are provider-specific (for example SQL Server `IncludeProperties`). Do not assume portability.
- **Keys and indexes on complex type properties (EF Core 11)** — EF11 supports configuring keys/indexes on nested complex-type paths in supported mappings/providers. This does not turn a complex value into an independently identified entity; verify provider and JSON/relational mapping support.

## Cross-item comparison

A primary key is the entity's principal identity. An alternate key adds a second EF key and can be a foreign-key target; a unique index enforces uniqueness without becoming EF identity. A natural key describes business meaning, whereas a surrogate key is generated/assigned for persistence identity; either may coexist with a unique index for business constraints. A concurrency token answers “has this row changed since I read it?”, while a key answers “which row is this?”. `ValueGeneratedOnAdd` states an EF model expectation; `UseIdentityColumn`, `UseHiLo`, a sequence, or provider defaults implement generation. `HasData` is migration-managed fixed data, not a request-time seeding mechanism. Index keys determine ordering/uniqueness; included columns are provider-specific coverage payload.

## Examples

```csharp
modelBuilder.Entity<Order>()
    .HasKey(order => new { order.TenantId, order.OrderNumber });

modelBuilder.Entity<Customer>()
    .HasIndex(customer => customer.Email)
    .IsUnique()
    .HasDatabaseName("UX_Customers_Email");

modelBuilder.Entity<Invoice>()
    .Property(invoice => invoice.Version)
    .IsRowVersion();
```

The first example makes a composite tuple the identity. The second enforces uniqueness but does not create another relationship-target key. The third requires a provider/database that generates a compatible row-version value. A client-managed GUID concurrency token needs application code to change the token on every write; otherwise it cannot detect competing edits.

## Common mistakes

- Adding a unique index and assuming EF treats it as an alternate key for relationships.
- Treating a natural key as immutable when the business value can change.
- Believing `ValueGeneratedOnAdd` alone creates a database sequence/identity mechanism.
- Using `HasData` as a general runtime seeding framework or for data that changes independently of migrations.
- Calling SQL Server `rowversion` a timestamp or expecting the same type/behavior from every provider.
- Adding indexes without considering insert/update cost, storage, selectivity, and query-plan evidence.
- Assuming a filtered index, included columns, fill factor, or index sort options are portable.
- Treating a concurrency exception as an automatic instruction to overwrite the other writer's changes.

## Knowledge checks with answers

1. **When choose a unique index over an alternate key?** When the requirement is database uniqueness and the value need not be an EF relationship target or alternate identity key.
2. **Does `ValueGeneratedOnAdd` create an identity column?** No; provider/database generation must also be configured or conventionally supplied.
3. **What does a concurrency token protect against?** Silently overwriting a row changed since the current unit of work read it; conflict resolution remains application policy.
4. **Does `HasData` run as application startup seeding?** No; it participates in model-managed migration data operations.
5. **Are included-index columns portable?** No. Their API and storage behavior are provider-specific.
