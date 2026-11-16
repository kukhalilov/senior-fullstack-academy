# model configuration entities properties and keys — Reference: Entity types, discovery, configurations, and model metadata

## Scope and version

This lesson uses the [EF Core modeling guide](https://learn.microsoft.com/en-us/ef/core/modeling/), [entity type reference](https://learn.microsoft.com/en-us/ef/core/modeling/entity-types), and final [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). EF Core 11.0.0 shipped 2026-11-10; model capabilities introduced in EF11 are distinguished from EF Core 10 behavior below.

## How this group fits the mental model

These names decide which CLR shapes enter the model, how their metadata is configured, and how EF records that mapping blueprint. Model configuration does not itself create or alter a database; migrations or another deployment mechanism apply schema changes.

## Supplied names explained

- **Entity type** — A model type with identity and lifecycle tracked by EF, normally represented by a primary key and mapped to a table/view/provider object.
- **EntityTypeBuilder<TEntity>** — Fluent builder for configuring one entity type's metadata, including keys, table/view mapping, properties, and indexes.
- **DbSet<TEntity>** — Context property/API surface commonly used as a query root and add/update/remove set for an entity type; its presence is one discovery path, not the only one.
- **DbContext.Set<TEntity>** — Retrieves a set for an entity type from a context, including when no strongly typed `DbSet<TEntity>` property exists.
- **Entity discovery convention** — Built-in rules that discover entity types and infer common metadata from context sets, navigations, and CLR shape; conventions are defaults that can be overridden.
- **[EntityTypeConfiguration] attribute** — Attribute used to associate an entity type with an `IEntityTypeConfiguration<TEntity>` implementation for configuration discovery where supported by the EF version/tooling.
- **IEntityTypeConfiguration<TEntity>** — Interface for organizing one entity's fluent configuration in a separate class's `Configure` method.
- **ApplyConfiguration<TEntity>** — Adds one `IEntityTypeConfiguration<TEntity>` instance to a `ModelBuilder`.
- **ApplyConfigurationsFromAssembly** — Scans an assembly for entity configuration implementations and applies them; constructor/assembly-scan assumptions and ordering should remain deterministic.
- **modelBuilder.Entity<TEntity>** — Gets or creates the model builder for a CLR entity type to configure it explicitly.
- **ToTable** — Maps an entity to a relational table, optionally configuring table-specific metadata; exact overloads are relational/provider-specific.
- **ToView** — Maps an entity type to a database view/query source. It is commonly read-only in migrations/model intent but does not itself make the underlying database object immutable.
- **HasNoKey** — Configures an entity type as keyless. It is not tracked with normal entity identity and is intended for query scenarios.
- **Keyless entity type** — Query-only model type without a primary key; it cannot participate in normal update/insert/delete tracking as a keyed entity.
- **ExcludeFromMigrations** — Excludes a mapped table from migrations, useful when another system owns its schema. It does not prevent runtime mapping/querying.
- **Ignore<TEntity>** — ModelBuilder operation that excludes a CLR type from the EF model.
- **EntityTypeBuilder.Ignore** — Excludes a property/navigation/member from one entity type's model mapping.
- **ModelBuilder.Ignore** — Excludes a type from the model, preventing convention/discovery from mapping it.
- **Shared-type entity type** — Distinct EF entity types that share the same CLR type but have different model names/metadata, useful in specialized join/property-bag cases.
- **Property-bag entity type** — Entity represented through an indexer-backed property bag, often a dictionary, rather than a conventional CLR property class; access is string/key-based and less refactor-safe.
- **Model metadata** — EF's `IModel` description of entity/property/key/index/relationship mapping, consumed by query/update pipelines and model validation.
- **Convention-based model configuration** — Defaults inferred from CLR patterns and provider conventions; convenient but should be inspected when persistence-critical assumptions matter.
- **Fluent API precedence** — Fluent model configuration generally overrides conventions and data annotations for the same metadata; conflicting repeated configuration should be resolved explicitly.
- **Data annotation precedence** — Attribute-based mapping metadata usually overrides conventions but is generally overridden by fluent configuration.
- **OnModelCreating** — Context hook where a `ModelBuilder` configures entity/property/key metadata. EF caches the resulting model; do not mutate it per request.
- **UseNamedDefaultConstraints (EF Core 10 SQL Server)** — Enables automatic deterministic naming of SQL Server default constraints. If a database already has migrations/default constraints, the next migration can rename all existing default constraints; review and deploy that migration deliberately.

## Cross-item comparison

`DbSet<TEntity>` and `DbContext.Set<TEntity>` expose a set; only the property itself is a conventional discovery signal. `IEntityTypeConfiguration<TEntity>` separates configuration from the context; `ApplyConfiguration<TEntity>` applies one instance, while `ApplyConfigurationsFromAssembly` scans many. `ToTable` maps to a table; `ToView` maps to a view/query source. `HasNoKey` opts into keyless query semantics; `Ignore<TEntity>` removes a type entirely. `ModelBuilder.Ignore` removes a type, while `EntityTypeBuilder.Ignore` removes a member. Fluent configuration is generally the final explicit mapping layer after conventions and annotations.

## Examples

```csharp
public sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");
        builder.HasKey(customer => customer.Id);
        builder.Property(customer => customer.Name).HasMaxLength(160);
    }
}

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfiguration(new CustomerConfiguration());
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(CustomerConfiguration).Assembly);
    modelBuilder.Ignore<LegacyImportRow>();
}
```

Do not apply the same configuration twice without understanding duplicate calls. Prefer one deterministic assembly scan or explicit registrations.

## Common mistakes

- Assuming every class in an assembly is an entity or every entity requires a `DbSet` property.
- Treating a view mapping as a security/read-only guarantee.
- Using a keyless type for data that must be updated by EF.
- Forgetting that assembly scanning has discovery/ordering and constructor assumptions.
- Assuming `ExcludeFromMigrations` stops EF from querying a mapped table.
- Mutating model metadata based on request-specific state in `OnModelCreating`.
- Using property bags/shared-type types for core domain concepts when strong types are clearer.

## Knowledge checks with answers

1. **Does `DbSet<TEntity>` define the only way to discover an entity?** No; conventions/configuration/navigation can discover types.
2. **What does `HasNoKey` imply?** Query-only shape without normal tracked identity.
3. **Does `ExcludeFromMigrations` stop queries?** No; it affects migration generation only.
4. **Which usually wins: a convention, attribute, or fluent mapping?** Fluent mapping generally wins, then annotations, then conventions.
