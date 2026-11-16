# model configuration entities properties and keys — Reference: CLR properties, field access, value conversion, and column mapping

## Scope and version

The names follow [EF Core entity property documentation](https://learn.microsoft.com/en-us/ef/core/modeling/entity-properties). EF Core 11.0.0 shipped on 2026-11-10; nested complex property mapping and complex collections are included according to the [EF Core 11 what's-new guide](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew). Provider-specific store types and generated SQL still need database-specific verification.

## How this group fits the mental model

Each model property connects a CLR representation to a provider/database representation. Access mode controls how EF reads/writes state; column facets describe schema/value constraints; converters change representation; comparers define equality and snapshots. These settings do not replace domain validation or guarantee that every provider supports the same type/features.

## Supplied names explained

- **PropertyBuilder** — Fluent builder for one model property, used to configure its column mapping, facets, access, conversion, defaults, and generation behavior.
- **PropertyBuilder<TProperty>** — Strongly typed property builder with type-aware configuration and expression-based access.
- **PropertyAccessMode** — Enum whose values are `Field`, `FieldDuringConstruction`, `Property`, `PreferField`, `PreferFieldDuringConstruction`, and `PreferProperty`. The three `Prefer...` choices fall back when the preferred member is unavailable; construction-specific modes can use a different access path while materializing an entity.
- **UsePropertyAccessMode** — Configures the selected access mode on a property or broader model scope. Field access can preserve encapsulation but may bypass property setter side effects.
- **HasField** — Associates a CLR field with a model property/navigation so EF can persist state without exposing a public setter.
- **HasField access mode** — Field-oriented access configuration; decide whether EF always uses the field or prefers it with fallback. Backing fields are not the same as shadow properties.
- **HasColumnName** — Sets the relational column name. It affects schema mapping, not the CLR member's name.
- **HasColumnType** — Sets an explicit database/provider store type such as a provider-specific numeric or text type. It can reduce portability and should be validated against the target provider.
- **HasColumnOrder** — Sets relational column order for schema generation where supported; physical column order is rarely a query-performance contract and existing migrations may not reorder columns.
- **HasMaxLength** — Configures maximum length metadata for applicable string/binary properties. Database enforcement and provider schema vary; it is not complete request validation.
- **IsRequired** — Marks a property non-nullable in the EF model where the CLR/provider mapping supports it. It does not validate arbitrary application input before persistence.
- **IsUnicode** — Configures whether a relational string column uses Unicode-capable storage where the provider distinguishes it; exact SQL type behavior is provider-specific.
- **HasPrecision** — Configures precision and optional scale metadata, commonly for decimal/date-time types. Rounding/overflow behavior is provider-specific; choose precision from business requirements.
- **HasDefaultValue** — Configures a database default literal/value when an insert omits the column. A CLR initializer is a separate mechanism; generated/default semantics can determine whether EF sends a value.
- **HasDefaultValue (named constraint overload)** — EF Core 10 SQL Server overload that sets the default literal/value and explicitly names the generated default constraint. The constraint name is schema metadata, not a runtime property value.
- **HasDefaultValueSql** — Configures a database SQL expression used as a default when the column is omitted. The SQL is provider-specific and evaluated by the database.
- **HasDefaultValueSql (named constraint overload)** — EF Core 10 SQL Server overload that configures the SQL default expression and its database constraint name.
- **HasComputedColumnSql** — Configures a database-computed expression, optionally stored/persisted depending on provider. It is not a C# computed getter; generated behavior must match provider support.
- **ValueGeneratedOnAdd** — Marks a property's value as generated when a row is inserted; actual generation requires provider/database configuration or supported conventions.
- **ValueGeneratedOnAddOrUpdate** — Marks a value as generated on insert and update, often for database-managed values such as row versions or computed columns where supported.
- **ValueGeneratedNever** — Tells EF not to expect store generation for a property; the application is responsible for supplying its value.
- **HasSentinel** — Configures the sentinel value EF uses to determine whether a generated/defaulted property was explicitly set or should be treated as unset. The default sentinel is the CLR type's default value; a custom sentinel can allow a meaningful CLR default to be explicitly stored. Choose a value that cannot be confused with legitimate application data.
- **ValueConverter** — Converts values between a model CLR type and a provider CLR type before database storage/query materialization. Conversion does not automatically ensure SQL translation of every operation on the model type.
- **HasConversion** — Configures a `ValueConverter` or a supported built-in conversion between model and provider representations, such as enum-to-string. Null values are generally handled outside converter delegates.
- **ValueComparer** — Defines equality, hash, and snapshot semantics for change tracking, especially important for mutable/reference/converted values whose default comparison is insufficient.
- **HasColumnName mapping** — Name mapping from a model property to its relational column, including cases where CLR and store naming conventions differ; avoid configuring the same property inconsistently.
- **Backing field** — Private/protected field EF reads/writes for a mapped property, allowing a public getter/domain method without a public setter.
- **Shadow property** — Model property with no CLR member, stored in EF's state manager and database mapping; access it through EF APIs/expressions, and account for its value being unavailable outside tracked/model query contexts.
- **Indexer property** — Model property accessed through an indexer (for example, a dictionary key) rather than a named CLR property; useful for flexible/property-bag shapes but less compile-time safe.
- **Owned property versus complex type** — An owned type is an entity with ownership and identity/navigation semantics; a complex type is a value-like structure without independent identity. Choose based on domain/lifecycle behavior, not only table shape.
- **JSON column mapping via ToJson (EF Core 10)** — Maps structured owned/complex data to a JSON column where supported. EF Core 10 supports complex types in JSON; EF Core 11 extends support to TPT/TPC, nested paths, collections, and Cosmos. JSON query/index behavior depends on provider/database.
- **ComplexCollection** — EF Core 11 model-building API for a collection-valued complex type, commonly configured with JSON storage for nested value objects. It has no independent entity identity; the provider must support the mapping.
- **Complex type property path configuration** — EF Core 11 permits fluent configuration of a nested complex member through a chained property expression such as `Property(e => e.Address.PostalCode)` instead of opening each complex builder first.

## Cross-item comparison

`HasColumnName` changes relational naming; `HasColumnType` changes provider store type. `HasDefaultValue` is a default literal/value, `HasDefaultValueSql` is a database expression, and `HasComputedColumnSql` describes a computed expression. Named default-constraint overloads change schema naming only. `HasSentinel` determines whether EF considers a value supplied; it is not the database default itself. `ValueGeneratedOnAdd`/`OnAddOrUpdate` describe generation expectations; `ValueGeneratedNever` declares application ownership. A backing field is a CLR member; a shadow property has no CLR member. A value converter changes representation; a comparer changes change-tracking equality/snapshot semantics. Owned types have entity semantics; complex types are identity-free values. `ComplexCollection` is the EF11 collection shape for complex values, distinct from a collection of entity instances.

## Examples

```csharp
builder.Property(customer => customer.Balance)
    .HasPrecision(19, 4)
    .HasDefaultValue(0m);

builder.Property(customer => customer.Status)
    .HasConversion<string>()
    .HasMaxLength(24);

builder.Property(customer => customer.Address.PostalCode)
    .HasMaxLength(16);
```

These settings must agree with domain rules and provider schema. A database default only runs if the insert omits the column; a conversion can affect query translation and ordering; the EF11 nested property path requires a complex type and a compatible provider.

## Common mistakes

- Assuming `HasMaxLength`, `IsRequired`, or `HasPrecision` validates all incoming CLR values.
- Confusing CLR initializers with database defaults.
- Using provider-specific SQL/default types without migration/testing on the target database.
- Adding a converter but forgetting equality/snapshot behavior for mutable values.
- Using field access when property setter side effects are required for domain invariants.
- Treating shadow properties like ordinary CLR properties available on detached objects.
- Mapping a value object as owned solely because it is nested, even though it lacks entity identity.
- Assuming JSON mapping or nested path indexes are portable across all providers.

## Knowledge checks with answers

1. **What is the difference between a converter and a comparer?** A converter changes model/provider representation; a comparer defines equality/hash/snapshot for tracking.
2. **When does a database default execute?** When the insert omits the column so the database can apply the default.
3. **Does a complex type have its own EF entity identity?** No; it is value-like and belongs to its containing entity.
4. **What did EF Core 11 add for complex properties?** Nested property path configuration, complex collections, broader TPT/TPC/Cosmos support, and supported keys/indexes on nested paths.
