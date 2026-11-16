# relationships cardinality cascading and owned types — Big-picture orientation and mental model

## Problem and purpose

An object graph uses references and collections; a relational database uses foreign-key columns and constraints. EF Core connects these representations so application code can navigate related objects while persistence maintains a coherent key relationship. The mapping also determines what optionality, deletion, ownership, and identity mean.

## Plain-language mental model

Treat a relationship as one association defined by a dependent foreign key. Navigations are object-oriented doors through which code traverses that association. A one-to-many association has one principal and many dependents; a one-to-one constrains the dependent FK to one row; a many-to-many normally uses a join table and can be exposed through skip navigations. The FK value is the durable relational link. A navigation is not a second relationship and loading a navigation is not implied by defining it.

## How the parts fit together

EF discovers common navigation pairs and FK names by convention. When the shape is ambiguous, configure the association with `HasOne`/`HasMany`, `WithOne`/`WithMany`, `HasForeignKey`, and when needed `HasPrincipalKey`. Requiredness follows FK nullability unless configured otherwise. Relationship fix-up coordinates FK values and navigation references for entities tracked in one context; it does not fetch missing rows.

Deletion is a separate policy. Deleting a principal can cascade to dependents; severing a required relationship can delete an orphan. EF may act on tracked entities, while database referential actions cover rows the context has not loaded. Pick behavior deliberately and verify generated constraints and provider behavior.

Owned entity types have owner-bound identity and lifecycle. Complex types are value-like structures without independent entity identity. Both can be nested; their relationship, tracking, and storage semantics differ. EF Core 11.0.0 shipped 2026-11-10, so EF11 complex-type features are released. The [EF11 What's New page](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew) still contains an old “in development” banner; the [final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md) confirm the released line.

## Concept map

```text
Principal key ← dependent FK → relationship metadata
       ↑                           ↕
 navigations ← tracked graph fix-up → cardinality/requiredness
                                     ↘ delete/orphan policy
                         owned entity: owner-bound identity
                         complex type: value, no entity key
```

## End-to-end walkthrough

For a `Blog` with many `Post` rows, `Post.BlogId` is the FK and `BlogId` identifies the principal `Blog.Id`. `Post.Blog` is a reference navigation, and `Blog.Posts` is its inverse collection. EF can discover this shape by convention. If posts must always belong to a blog, use a non-nullable FK and required relationship. If removing a blog must delete all its posts, choose a cascade strategy and test it against the real database. If a post can move between blogs, that differs from an owned value that cannot exist independently.

## When to use it and tradeoffs

Use navigations when object graph traversal improves the domain/application model; expose only the direction needed when a bidirectional graph adds synchronization burden. Use implicit many-to-many skip navigations for a pure link, and an explicit join entity when the link has attributes, lifecycle, auditing, or domain behavior. Use owned types when lifecycle belongs to the owner and entity semantics are appropriate; use complex types for identity-free values. Use cascading deletion only when dependent loss is an intentional invariant.

## What later lessons cover

The reference lessons cover discovery/cardinality/configuration APIs, then requiredness/deletion/ownership. Practice exercises configure mappings and reason about untracked rows and conflicts. Change-tracking internals and database-specific DDL are treated in their own topics.
