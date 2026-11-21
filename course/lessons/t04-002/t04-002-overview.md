# model configuration entities properties and keys — Big-picture orientation and mental model

## Problem and purpose

EF Core needs a mapping contract between C# types and database structures. The model decides which types are entities, how properties map to columns, what defines identity, and how database values are generated. A model mismatch can produce incorrect SQL, migration churn, runtime validation errors, or data that does not preserve the intended domain meaning.

## Plain-language mental model

Think of the EF model as a blueprint compiled from several inputs: conventions provide defaults, attributes annotate the CLR types, and fluent configuration states precise choices. EF builds model metadata from that blueprint and providers use it to translate queries and saves. The blueprint is not the live database schema; migrations compare/model changes and deploy schema evolution separately.

EF Core 11.0.0 shipped on 2026-11-10. New model capabilities include nested complex-type configuration, complex types and JSON mappings across TPT/TPC, complex collections, and keys/indexes over nested complex properties. See the [official EF Core 11 what's-new page](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew) and [final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md); earlier EF Core 10 notes still describe these as forthcoming.

## How the parts fit together

1. EF discovers entity types from `DbSet<TEntity>`, navigation relationships, explicit model configuration, and conventions.
2. A model-building API adds or configures entity metadata; configuration precedence resolves conflicts.
3. Entity properties map CLR values to columns through field/property access, type conversion, nullability, precision, defaults, or computed expressions.
4. Keys define EF identity and relationship targets; indexes define database access/uniqueness structures. They overlap only in selected roles.
5. Generated values and concurrency metadata define what the database writes/compares during persistence.
6. The provider and migrations turn the model into provider-specific schema and commands.

Complex types model value-like data without entity identity. Owned entity types remain entities with ownership/identity semantics. Keyless types are read-only query shapes, not ordinary tracked entities. These distinctions affect keys, relationships, updates, JSON mapping, and query behavior.

## Concept map

| Question | Model mechanism | Common mistake |
|---|---|---|
| What is persisted? | Entity discovery, ignore/exclusion, entity configuration | Assuming every CLR class becomes a table |
| How is a value stored? | CLR property, backing field, shadow/indexer property, converter | Assuming the CLR type equals the database type |
| What is identity? | Primary/alternate key or keyless shape | Using a unique index as if it were an EF key |
| What can the database generate? | Defaults, computed values, generated-on-add/update | Believing the CLR initializer always controls inserts |
| Is a value object an entity? | Owned entity versus complex type | Treating both as interchangeable |
| How does uniqueness work? | Unique index versus alternate key | Assuming every unique index can be a relationship target |

## End-to-end walkthrough

Suppose `Customer` has an `Address` value object and a database-generated key. Define `Customer` as an entity, map the primary key, and configure `Address` as a complex type when it has no independent identity/lifecycle. Configure a nested property such as postal code's maximum length and index it as supported by the provider. EF Core 11 permits nested complex-type paths in keys/indexes and JSON paths where provider capabilities allow. Set precision for money, select a conversion only when the stored representation differs, and choose whether a database default/computed expression or the application supplies each value. Generate/review a migration and test it on the target provider; the model alone does not alter a deployed database.

## When to use it and tradeoffs

Prefer conventions for conventional mappings and explicit fluent configuration for important domain/storage decisions. Use attributes when metadata belongs naturally with the CLR type; use fluent configuration for centralized/provider-specific rules and when attributes cannot express the shape. Use keyless entity types for views/reporting queries that have no stable identity. Use complex types for value data without identity; owned entity types when ownership-specific entity/navigation semantics are needed. Use unique indexes for uniqueness, alternate keys only when the model needs a key target. Provider-generated values and JSON/index support must be tested against the actual database.

## What later lessons cover

Reference lessons inventory entity discovery/configuration, property/column mapping, and keys/indexes/generation/concurrency metadata. Practice covers conflicting configuration, value generation, and complex-type/key choices. Interview questions focus on model versus schema, key versus unique index, owned versus complex types, shadow fields, and provider-specific mapping.
