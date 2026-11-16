# relationships cardinality cascading and owned types — Core concepts and how they fit together

This lesson follows the official [relationship guide](https://learn.microsoft.com/en-us/ef/core/modeling/relationships), [relationship conventions](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/conventions), and [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). EF Core 11.0.0 shipped on 2026-11-10.

## Learning objectives

Explain how FKs and navigations make one EF relationship; configure cardinality without ambiguous inverse pairing; distinguish client-side fix-up from database loading; choose requiredness and deletion behavior; and select owned versus complex mapping from identity/lifecycle semantics.

## Prerequisites

Know EF entities, keys, properties, and the `DbContext` unit-of-work boundary. A relationship requires a principal key (primary or alternate) and FK metadata even when the CLR class has no explicit FK property.

## Core concepts

### Association, FK, and navigation

The dependent holds the FK; the principal key is the value it references. A navigation is an in-memory reference or collection layered over that FK. One association can have zero, one, or two navigations. Two inverse navigations still represent one relationship. A foreign key can have at most one navigation in each direction; a navigation cannot be shared by multiple associations.

### Cardinality and requiredness are distinct

One-to-many: each dependent points to at most one principal, and a principal can have many dependents. One-to-one: the dependent FK is unique (commonly its PK), in addition to referencing a principal. Many-to-many: each side can relate to many of the other; a join entity/table stores the two FKs. Requiredness says whether the dependent must reference a principal, not whether the principal must have any dependents. An optional dependent one-to-one is a separate question from whether the relationship exists.

### Discovery and explicit mapping

Conventions infer navigations, inverse pairs, FK names, cardinality, and requiredness from CLR shape, nullability, and keys. `[ForeignKey]` and `[InverseProperty]` can disambiguate annotation-based mappings; fluent API is clearer for complex relationships and generally overrides conventions/annotations. Explicitly configure both ends when multiple relationships connect the same pair of types.

### Fix-up is not loading

When related entities are tracked, EF can synchronize FK and navigation values as one changes. Query materialization can also fix up already tracked instances. This does not issue a query to load missing related data. Loading is explicit via eager, explicit, or lazy-loading mechanisms covered elsewhere; do not infer “loaded” merely because a navigation is non-null or has a collection instance.

### Deletion and relationship severing

For a required relationship, a dependent cannot be left with a null FK. Default cascade semantics often delete dependents; severing the association can cause orphan deletion. Optional relationships can usually be severed by nulling the FK. `DeleteBehavior` values distinguish database actions from client actions on tracked dependents. `ClientCascade` only deletes tracked dependents; untracked rows require a database cascade or will cause a constraint failure. `Restrict` and `NoAction` are provider/database-specific constraint behaviors and should not be promised as identical SQL across engines. `ClientSetNull` changes tracked FK values; `ClientNoAction` asks EF not to perform that client action.

### Owner-bound entities and identity-free values

`OwnsOne`/`OwnsMany` model owned entity types. They are always dependents of an owner; an owned reference has owner-derived key semantics, while an owned collection needs per-item identity (default commonly combines owner FK and a local key). Reusing the same owned instance in multiple places is constrained by entity identity. `ComplexProperty` and EF11 `ComplexCollection` model value-like nested structures without their own entity key/identity. EF11 supports complex types with TPT/TPC, in Cosmos, nested property configuration, and certain nested keys/indexes; exact provider mapping and query support still matter.

## Mechanisms and relationships

`HasOne`/`HasMany` selects the dependent/principal navigation shape. `WithOne`/`WithMany` declares the inverse cardinality and navigation (or explicitly no navigation). `HasForeignKey` identifies dependent FK properties; `HasPrincipalKey` selects a principal key, usually an alternate key if not the primary. `UsingEntity` configures the join entity for many-to-many. `OnDelete` selects the delete behavior. `WithOwner` configures ownership and owner FK. `IsRequiredDependent` configures whether the dependent side of a one-to-one must exist for a principal where supported by the relationship model.

## Worked examples

```csharp
modelBuilder.Entity<Post>()
    .HasOne(post => post.Blog)
    .WithMany(blog => blog.Posts)
    .HasForeignKey(post => post.BlogId)
    .IsRequired()
    .OnDelete(DeleteBehavior.Restrict);

modelBuilder.Entity<Student>()
    .HasMany(student => student.Courses)
    .WithMany(course => course.Students)
    .UsingEntity<Enrollment>(
        enrollment => enrollment.HasOne(x => x.Course).WithMany().HasForeignKey(x => x.CourseId),
        enrollment => enrollment.HasOne(x => x.Student).WithMany().HasForeignKey(x => x.StudentId));
```

The first model declares a required FK and restrict-style deletion intent; confirm the provider-generated FK action. The second exposes an explicit join entity because `Enrollment` can carry grade/date/status data.

## Misconceptions and edge cases

- A collection navigation may be empty because nothing is loaded; it does not prove the principal has no related database rows.
- A nullable navigation does not alone determine database nullability if FK/configuration says otherwise; align C# nullable annotations and model rules.
- A one-to-one requires relational uniqueness on the dependent FK; a pair of reference properties alone is insufficient.
- Client cascade behavior cannot affect untracked dependent rows. Database cascade behavior can affect rows not loaded in memory.
- Orphan deletion is triggered by severing a required association, not only by deleting an owner.
- Owned entity and complex value types are not interchangeable merely because both may share a table/JSON document.
- EF11's stale What's New banner is not a release signal: the final .NET 11 release notes establish the shipped state.

## Knowledge checks with answers

1. **What stores the durable relational association?** The dependent FK referencing a principal key; navigations are object access paths.
2. **Does a required one-to-many mean a principal must have a child?** No. It means each dependent must reference a principal.
3. **Does fix-up load a navigation?** No; it synchronizes already tracked relationships.
4. **When is an explicit join entity preferable?** When the link itself has attributes, lifecycle, audit fields, or domain behavior.
5. **What is the untracked-dependent caveat of `ClientCascade`?** EF cannot delete rows it did not load; the database can reject the principal deletion.
6. **What distinguishes EF11 complex values from owned entities?** Complex types have no entity key/identity; owned types are dependent entities with owner-bound identity/lifecycle.
