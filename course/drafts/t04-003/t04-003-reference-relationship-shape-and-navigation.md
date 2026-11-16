# relationships cardinality cascading and owned types — Reference: Cardinality, navigations, and relationship discovery

## Scope and version

Based on [relationship mapping](https://learn.microsoft.com/en-us/ef/core/modeling/relationships), [discovery conventions](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/conventions), [navigation rules](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/navigations), and [mapping attributes](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/mapping-attributes). EF Core 11.0.0 shipped 2026-11-10; the final release notes are [here](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## How this group fits the mental model

The foreign key defines persisted association. Navigation properties expose that association to object code. Fluent configuration makes EF's principal/dependent, cardinality, FK, principal key, and join mapping explicit when conventions are insufficient.

## Supplied names explained

- **One-to-many relationship** — Each dependent references one principal; one principal can have zero or many dependents.
- **One-to-one relationship** — A dependent FK references a principal key and is unique, so at most one dependent points to each principal. Requiredness of the dependent and principal sides must be considered separately.
- **Many-to-many relationship** — Each side can relate to many of the other, implemented relationally through a join entity/table with two FKs.
- **Navigation property** — CLR reference or collection that gives an object-oriented path through a relationship; it is not the stored FK itself.
- **[ForeignKey] attribute** — Mapping annotation that associates a member with FK properties (or identifies the FK member); use fluent configuration for complicated/disambiguated mappings.
- **[InverseProperty] attribute** — Identifies the inverse navigation when multiple associations between the same entity types make pairing ambiguous.
- **Collection navigation** — Navigation holding related entities on the “many” side. Underlying collection must support EF's collection operations; arrays and expression-bodied properties returning a new collection are unsuitable.
- **Reference navigation** — Navigation to one related entity on the “one” side. Optional references should align with nullable FK/model semantics.
- **Inverse navigation** — The opposite navigation on the other type; both directions describe a single association.
- **Unidirectional relationship** — Association with only one navigation or none; the FK and model metadata still define it.
- **Bidirectional relationship** — Same association exposed by navigations at both ends; it is one relationship, not two.
- **Relationship convention** — Default model rule for discovering and configuring associations from CLR members, FK naming, nullability, and keys.
- **Relationship discovery** — Convention process identifies reference/collection navigation candidates and pairs them, subject to type mapping, accessibility, and ambiguity rules.
- **Shadow foreign key** — FK property stored in EF model/change tracker but absent as a CLR member. It can be configured by name or accessed through EF APIs; explicit CLR FKs improve visibility/debugging in many domains.
- **Explicit foreign-key property** — CLR property storing the dependent FK. It makes relationship state visible, supports disconnected updates, and can simplify serialization/API boundaries.
- **HasOne** — Starts fluent configuration from an entity to one reference navigation or principal type.
- **HasMany** — Starts fluent configuration from an entity to a collection navigation or dependent type.
- **WithOne** — Configures the inverse as one reference navigation or explicitly no navigation; this is a one-to-one shape when paired with `HasOne`.
- **WithMany** — Configures the inverse as a collection or explicitly no navigation; combined shapes determine one-to-many or many-to-many intent.
- **HasForeignKey** — Specifies dependent FK property/properties. With composite FKs, property order and compatible types matter.
- **HasPrincipalKey** — Chooses the principal key referenced by the FK; if it is not the PK, it must be a configured alternate key.
- **HasPrincipalKey alternate key** — Uses a principal alternate key for a relationship; this is different from referencing an ordinary unique index.
- **UsingEntity many-to-many join entity** — Configures the join entity behind a many-to-many association, including its FK mappings and payload when needed.
- **Skip navigation** — Many-to-many navigation that traverses a join entity without requiring application code to expose it in ordinary traversal.
- **Join entity type** — Entity mapped to the link table. Use it explicitly when the link needs attributes, identity, lifecycle, auditing, or behavior.
- **Navigation backing field** — CLR field used by EF to read/write a navigation, allowing encapsulated collection/reference APIs. Access mode and field discovery can be configured.
- **Navigation fix-up** — Synchronizes navigation references/collections with FK values when EF tracks or materializes related entities; it does not query the database to load missing entities.
- **Change-tracking relationship fix-up** — Tracking-time process that aligns FK and navigation state in the context identity map. It is scoped to entities known to that context and is distinct from eager, explicit, or lazy loading.

## Cross-item comparison

FKs are the relational link; navigations are object graph paths. Explicit FK properties expose persisted state; shadow FKs keep it in EF metadata. Inverse navigations are two directions across one association. One-to-one requires a unique dependent FK. Many-to-many skip navigations simplify graph traversal, while an explicit join entity models link data. `HasOne`/`HasMany` begins from one side; `WithOne`/`WithMany` declares inverse cardinality, and `HasForeignKey` marks the dependent side.

## Examples

```csharp
modelBuilder.Entity<Post>()
    .HasOne(post => post.Blog)
    .WithMany(blog => blog.Posts)
    .HasForeignKey(post => post.BlogId);

modelBuilder.Entity<Blog>()
    .HasMany(blog => blog.Tags)
    .WithMany(tag => tag.Blogs);
```

If two entity types have multiple associations (for example `CreatedBy` and `ApprovedBy`), configure each pairing explicitly and give each its own FK/navigation pair. Do not rely on convention to guess the intended inverse.

## Common mistakes

- Assuming a navigation loads related rows just because it exists or is initialized.
- Treating inverse properties as separate relationships.
- Forgetting dependent FK uniqueness in a one-to-one mapping.
- Using a new collection instance on every navigation getter call.
- Sharing a navigation between two FKs.
- Choosing skip navigations when the join needs domain data or lifecycle.
- Assuming virtual navigations are required; they are needed only for proxy-based lazy loading/change tracking.

## Knowledge checks with answers

1. **What identifies the dependent side?** The entity containing the FK.
2. **What does `HasPrincipalKey` configure?** The principal key targeted by the relationship FK, often an alternate key.
3. **Does relationship fix-up execute SQL?** No.
4. **When expose a join entity?** When the association itself carries state or behavior.
