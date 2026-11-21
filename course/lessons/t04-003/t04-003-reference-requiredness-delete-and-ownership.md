# relationships cardinality cascading and owned types — Reference: Requiredness, delete behavior, ownership, and complex types

## Scope and version

This reference uses Microsoft [relationship](https://learn.microsoft.com/en-us/ef/core/modeling/relationships), [owned entity](https://learn.microsoft.com/en-us/ef/core/modeling/owned-entities), [cascade delete](https://learn.microsoft.com/en-us/ef/core/saving/cascade-delete), and [EF Core 11 what's-new](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew) documentation. EF Core 11.0.0 shipped 2026-11-10 per the [final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). Delete SQL and complex/JSON mapping capabilities vary by provider.

## How this group fits the mental model

Requiredness says whether a dependent can exist without its principal. Delete behavior says how EF/database respond when the principal is deleted or an association is severed. Ownership binds an entity's lifecycle to its owner; a complex type is a nested value with no entity identity.

## Supplied names explained

- **Required relationship** — Dependent FK cannot be null; the dependent must reference a principal. It does not require that a principal have a dependent.
- **Optional relationship** — Dependent may have no principal, normally represented by nullable FK. A nullable navigation alone does not override explicit model/FK configuration.
- **IsRequired relationship builder** — Fluent setting for FK requiredness; ensure nullable annotations and database column nullability agree with the intended domain rule.
- **DeleteBehavior.Cascade** — Configures cascade behavior for tracked dependents and, for relational providers, commonly a database cascade constraint. Required relationships use cascade by default; verify generated DDL.
- **DeleteBehavior.ClientCascade** — EF deletes tracked dependents but does not request a database cascade. Unloaded dependents can cause a database FK violation when the principal is deleted.
- **DeleteBehavior.Restrict** — Requests restriction of principal deletion while dependents remain; database translation/semantics can vary.
- **DeleteBehavior.NoAction** — Does not cascade at the database; enforcement timing/constraint semantics are database-specific. Do not assume it is SQL-identical to `Restrict` across providers.
- **DeleteBehavior.SetNull** — Requests setting dependent FK columns to null when principal is deleted; requires nullable FK and provider support.
- **DeleteBehavior.ClientSetNull** — EF sets nullable FKs to null for tracked dependents; database action is non-cascading. Untracked rows are not modified by EF.
- **DeleteBehavior.ClientNoAction** — EF does not automatically null/delete tracked dependents; database constraints may reject the operation.
- **OnDelete** — Fluent relationship configuration selecting `DeleteBehavior`; schema/migration and runtime effects should be verified together.
- **Cascade delete** — Deleting principal causes dependent deletion. Tracked entities are handled by EF; database cascade can reach unloaded rows.
- **Client-side cascade** — EF applies configured action only to dependents it tracks; it cannot operate on rows absent from the context.
- **Orphan deletion** — Deleting a required dependent after its relationship to the principal is severed while the principal remains.
- **Delete orphan timing** — Controls when EF processes required orphans during change tracking/save. Delaying can support reparenting within a unit of work, but the final state must satisfy relationship constraints.
- **ChangeTracker.CascadeDeleteTiming** — Configures when tracked cascade actions occur in the change tracker.
- **ChangeTracker.DeleteOrphansTiming** — Configures when tracked required dependents become deleted after severing; setting timing to `Never` requires explicit resolution before saving or EF can reject the invalid state.
- **Owned entity type** — Entity allowed only as part of an owner relationship, with owner-bound identity/lifecycle. It is always a dependent and cannot be independently rooted like a regular entity.
- **OwnsOne** — Configures an owned reference. Its key is generally the owner's key/FK, and relational mapping commonly uses table splitting unless configured otherwise.
- **OwnsMany** — Configures owned dependents in a collection. Each item needs identity; the default commonly uses the owner FK plus a local key, keeping it tied to its owner.
- **WithOwner** — Configures the ownership relationship and owner navigation/FK.
- **Ownership foreign key** — FK linking owned entity to owner. It participates in owned identity, especially for collections.
- **Table splitting** — Maps owner and owned reference columns into the same relational row/table. It is still two EF entity types and has materialization/optional-dependent constraints.
- **ToTable owned mapping** — Maps owned entity to a separate relational table, still preserving ownership semantics.
- **ToJson owned mapping** — Maps owned data into a JSON column where supported by the provider/version; query/update translations are not portable assumptions.
- **ComplexProperty** — Configures a complex type property: value-like nested state without independent entity key/identity.
- **Complex type** — Identity-free value structure whose properties are mapped as part of a containing entity. Sharing the same instance across owners can have value semantics rather than owned-entity identity semantics.
- **Complex collection** — EF Core 11 complex collection of value objects, commonly mapped to JSON; it has no per-element EF entity identity. Provider operations and querying are version-sensitive.
- **Complex type has no key identity** — A complex value is not tracked as a separate keyed entity and cannot be the principal of an entity relationship.
- **Optional dependent** — Dependent side may be absent, such as optional one-to-one. With table splitting, EF may need to determine whether all dependent columns being null means the dependent is absent.
- **Required dependent** — Dependent is required to exist for a principal in a one-to-one association where configured; this is distinct from requiring each dependent FK to reference a principal.
- **IsRequiredDependent** — Fluent relationship-builder configuration for requiredness of the dependent side in a one-to-one relationship; do not confuse with FK `IsRequired`.
- **[Owned] attribute** — Marks a CLR type as owned where applicable; the type still requires owner relationship semantics.
- **[ComplexType] attribute** — Marks a CLR type as a complex type; no independent key is introduced.
- **Relationship cycle delete behavior** — Multiple cascade paths/cycles may be rejected by a database. Resolve by changing cascade policy, using client actions when all dependents are tracked, or explicitly sequencing deletes; never remove FK integrity casually.

## Cross-item comparison

`Cascade` may act both in EF and in the database; `ClientCascade` only acts on tracked objects. `ClientSetNull` changes tracked optional FKs, whereas `ClientNoAction` leaves dependent tracked state alone. `Restrict`/`NoAction` database translations are provider-specific. Orphan deletion is a severed-required-link event; cascade delete is principal deletion. `IsRequired` configures a dependent FK; `IsRequiredDependent` describes whether the principal must have a dependent in one-to-one. Owned entities have key and entity lifecycle; complex types have value semantics and no key. Table splitting and JSON are storage choices, not proof these types share identity semantics.

## Examples

```csharp
modelBuilder.Entity<Blog>()
    .HasMany(blog => blog.Posts)
    .WithOne(post => post.Blog)
    .HasForeignKey(post => post.BlogId)
    .IsRequired()
    .OnDelete(DeleteBehavior.ClientCascade);

modelBuilder.Entity<Order>().OwnsMany(order => order.Lines, lines =>
{
    lines.WithOwner().HasForeignKey("OrderId");
    lines.Property<int>("LineId");
    lines.HasKey("OrderId", "LineId");
});

modelBuilder.Entity<Customer>().ComplexProperty(customer => customer.Address);
```

With client cascade, load/track relevant posts or delete them explicitly; otherwise the database may reject the principal delete. For the owned collection, the composite key makes line identity owner-scoped. The complex address remains a value, not a related entity.

## Common mistakes

- Assuming cascade is harmless when deleting a high-level principal with a large dependent graph.
- Expecting client-side actions to touch rows not loaded in the context.
- Using `SetNull` for a non-nullable FK.
- Assuming `Restrict` and `NoAction` generate identical constraints on every provider.
- Confusing required FK with required dependent in a one-to-one.
- Treating orphan deletion as a database feature; it often depends on EF tracking the graph.
- Using owned entities for reusable identity-free values without understanding hidden keys and instance-sharing restrictions.
- Assuming a complex JSON collection supports the same relational joins/indexes across providers.

## Knowledge checks with answers

1. **Can `ClientCascade` delete unloaded dependents?** No; the database may block the principal delete.
2. **What happens when a required dependent is removed from its principal collection?** EF can mark it as an orphan/deleted according to orphan timing and relationship state.
3. **Does `IsRequiredDependent` make the FK non-null?** No; it configures the required dependent side of one-to-one, while FK requiredness is separate.
4. **What differs between owned and complex types?** Owned is an entity with owner-bound key/lifecycle; complex is a keyless value structure.
