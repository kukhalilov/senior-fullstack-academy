# model configuration entities properties and keys — Core concepts and how they fit together

This lesson follows the [EF Core modeling guide](https://learn.microsoft.com/en-us/ef/core/modeling/), [entity properties guide](https://learn.microsoft.com/en-us/ef/core/modeling/entity-properties), [keys guide](https://learn.microsoft.com/en-us/ef/core/modeling/keys), and [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). EF Core 11.0.0 shipped on 2026-11-10.

## Learning objectives

Explain how EF builds and caches a model, distinguish entities/keyless/owned/complex types, predict configuration precedence, map CLR values intentionally, select keys and indexes, and reason about provider-generated values and concurrency metadata.

## Prerequisites

Know basic C# classes, properties, attributes, relational tables/columns/keys/indexes, and EF Core context setup. Relationship configuration is treated in the next EF Core topic.

## Core concepts

**The model is metadata, not the database.** EF Core combines conventions, annotations, and fluent configuration into an `IModel`. A provider consumes that model to translate queries and persistence. The database changes only through explicit schema-management operations such as migrations or controlled SQL. A successful model build does not prove the live schema is aligned.

**Entity types have identity; query shapes may not.** Entity types participate in change tracking and identity resolution, normally through a primary key. Keyless entity types are read-only query sources and cannot behave like normal tracked entities. Shared-type entity types allow multiple model entity types to use one CLR type distinguished by model name; property-bag types use an indexer/dictionary-like shape. These patterns are specialized, not substitutes for clear domain types.

**Owned entities and complex types are related but distinct.** Owned types are entity types whose lifecycle/identity is tied to an owner and can participate in entity/navigation semantics. Complex types are value-like structures without independent key identity or entity lifecycle. EF Core 10 added complex-type JSON mapping; EF Core 11 extended complex mappings to TPT/TPC, Cosmos, nested property paths, complex collections, and supported keys/indexes over nested complex values. Provider support remains relevant.

**Configuration has precedence.** Conventions establish defaults, data annotations can override convention behavior, and fluent configuration is generally the most explicit final choice. Repeated fluent calls and provider extensions can compose or conflict; do not assume adding an attribute neutralizes a fluent rule. Keep one authoritative configuration for high-impact mappings and inspect the built model/migration when behavior is surprising.

**CLR and store types are separate contracts.** `HasColumnType` selects a provider store type; `HasConversion` maps CLR and provider representations; `ValueComparer` defines equality/snapshot behavior for mutable or converted values. `HasMaxLength`, `IsUnicode`, and `HasPrecision` shape schema/provider metadata but do not guarantee application-level validation. Field access/backing fields let EF persist encapsulated state while application code uses a public API.

**Keys and indexes solve different problems.** A primary key gives an entity model identity. An alternate key is another key identity usable as a relationship target. A unique index enforces uniqueness and may improve lookup, but is not automatically an alternate key. Foreign-key indexes may be introduced by conventions. Composite keys/order, filters, fill factor, included columns, and sort direction are provider-dependent.

**Generated values need a clear owner.** `ValueGeneratedOnAdd`, `ValueGeneratedOnAddOrUpdate`, and `ValueGeneratedNever` describe EF expectations; the database/provider configuration must actually generate a value when expected. Defaults run when the insert omits a value; computed SQL is database-expression-based. `HasData` is model-managed data included in migrations, not runtime initialization; EF Core 9's `UseSeeding`/`UseAsyncSeeding` are separate initialization APIs covered in the migration topic.

**Concurrency metadata changes update predicates.** `IsConcurrencyToken` tells EF to compare an original value during updates/deletes; `IsRowVersion` is a provider-oriented convenience for database-generated version tokens where supported. A token detects conflicts but does not decide conflict resolution or merge policy.

## Mechanisms and relationships

Start from domain semantics, then map: decide entity identity/lifecycle; choose an entity/complex/keyless representation; define property access and store representation; define primary/alternate keys and indexes; configure database-generated values and concurrency; review provider-specific migration output. When a property is nested in a complex type, EF Core 11 can configure it through a nested lambda and use supported nested paths in keys/indexes. A provider limitation may still make a theoretically valid model operation unavailable.

## Worked examples

```csharp
modelBuilder.Entity<Customer>(customer =>
{
    customer.HasKey(x => x.Id);
    customer.Property(x => x.Balance)
        .HasPrecision(19, 4)
        .HasDefaultValue(0m);
    customer.Property(x => x.Address.PostalCode).HasMaxLength(16);
    customer.HasIndex(x => x.Address.PostalCode);
});
```

The nested property configuration and index are supported by EF Core 11 for complex types; confirm support and generated schema for the chosen provider. `HasDefaultValue` configures a database default and does not validate the C# value before save.

```csharp
modelBuilder.Entity<ImportRow>().HasNoKey().ToView("ImportRows");
```

This is a query shape, not a normal tracked aggregate. Mutations and identity resolution are not available in the same way as a keyed entity.

## Misconceptions and edge cases

- `DbSet<TEntity>` does not define the entire model; discovery can happen through navigation/configuration, and types can be ignored.
- Model metadata and database schema can drift; migrations are a separate artifact/process.
- Keyless does not mean “EF will infer an arbitrary key.” It means no entity identity tracking.
- A unique index is not automatically an alternate key or relationship target.
- Complex types have no independent entity identity; owned types do have entity semantics.
- A value converter does not automatically define correct equality/snapshot semantics for mutable values.
- Column type, precision, Unicode, and max length are provider/schema settings, not comprehensive validation rules.
- A default/computed value requires matching database configuration and has insert/update semantics distinct from a CLR initializer.
- EF Core 11 complex-type feature notes are released capabilities; provider support and exact behavior still need verification.
- `HasData` model-managed values are captured in migrations; runtime seeding has a distinct lifecycle.

## Knowledge checks with answers

1. **Does changing `OnModelCreating` alter an existing database immediately?** No; schema deployment is separate.
2. **Can a keyless entity type be updated like a normal tracked entity?** No; it is a query-only shape without entity identity.
3. **When choose alternate key instead of unique index?** When EF needs key identity, especially as a relationship target; use a unique index for uniqueness/access without that role.
4. **What is new for complex-type mapping in EF Core 11?** TPT/TPC and Cosmos support, nested property configuration, collections, and keys/indexes over supported complex paths.
5. **Does `HasMaxLength` enforce user-input validation?** No; it contributes model/store metadata and provider behavior, while input validation is a separate concern.
