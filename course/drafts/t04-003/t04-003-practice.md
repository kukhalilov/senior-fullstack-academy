# relationships cardinality cascading and owned types — Exercises and worked solutions

Source basis: Microsoft [relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships), [relationship conventions](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/conventions), [owned entity types](https://learn.microsoft.com/en-us/ef/core/modeling/owned-entities), [cascade delete](https://learn.microsoft.com/en-us/ef/core/saving/cascade-delete), and [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Goals

- Map relational FK and object navigation semantics without ambiguous inverse discovery.
- Predict what EF can do for tracked entities versus what the database must enforce for unloaded rows.
- Choose skip navigations, explicit join entities, owned entities, and complex values from domain behavior.
- Design tests that verify the provider's constraints and generated behavior.

## Worked example

A `Blog` owns `Post` rows. Each post must have a blog. Deleting a blog should be blocked if posts exist, so accidental deletion cannot erase published content.

```csharp
modelBuilder.Entity<Post>()
    .HasOne(post => post.Blog)
    .WithMany(blog => blog.Posts)
    .HasForeignKey(post => post.BlogId)
    .IsRequired()
    .OnDelete(DeleteBehavior.Restrict);
```

The FK is the persisted link; `Post.Blog` and `Blog.Posts` are inverse navigation paths. Restriction must be verified in generated provider DDL and integration-tested. A unit test with EF InMemory does not enforce relational FK constraints.

## Exercises

1. Configure a required one-to-many `Tenant` → `Document` with explicit FK `TenantId`, a collection/reference inverse pair, and an alternate principal key `Tenant.Code`.
2. `User` and `Role` have many-to-many membership with `AssignedAt` and `AssignedBy`. Choose a mapping and explain why.
3. A principal is deleted with `ClientCascade`, but dependents are not loaded. Predict the possible outcome and provide two safe remedies.
4. A required dependent is removed from a tracked parent's collection and then re-added to another parent in the same unit of work. Explain orphan timing and what to test.
5. Model `Order.Address` as an identity-free value, and `Order.Lines` as owner-lifecycle children with per-line identity. Choose between complex and owned types.
6. Two different relationships connect `Person` to `Person` (`Manager` and `Mentor`). Configure them without convention ambiguity.
7. Diagnose an empty `Blog.Posts` list when the database contains posts. List plausible causes without assuming model discovery is broken.
8. A cascade-cycle migration fails on the target database. Describe a principled remediation that preserves referential integrity.
9. An owned collection item must move to a different owner. Explain why the default key strategy may make that invalid and propose a domain-model decision.
10. Verify EF11 JSON complex collection mapping before production deployment. What exact evidence would you collect?

## Progressive hints

1. The relationship targets a principal key, which can be an alternate key; specify the FK member explicitly.
2. The join itself contains domain data, so it needs a modeled entity.
3. EF only cascades tracked dependents in its client behavior; an FK constraint can reject the delete. Load and delete or use database cascade if policy permits.
4. EF may mark the dependent orphan as soon as relationship severing is processed. Configure delayed timing only when it supports a real reparenting workflow and restore a valid relationship before save.
5. Address is a value; lines are independently distinguishable members of the owner's collection but remain owner-bound.
6. Give each relationship a unique FK and paired navigation configuration.
7. The query may not include/load them; they could be filtered, queried through a different context, or navigation fix-up may only contain tracked matches.
8. Change selected delete actions or delete order and keep FK constraints. Evaluate tracked-client behaviors only when the app guarantees the full relevant graph is loaded.
9. A composite owner-FK key encodes immutable ownership. If moving is a valid domain operation, consider an independent key or a regular entity relationship.
10. Check the exact EF/provider versions, generated migration/SQL, schema/index support, query translation, update behavior, and provider integration tests.

## Complete solutions

1. ```csharp
   modelBuilder.Entity<Tenant>().HasAlternateKey(x => x.Code);
   modelBuilder.Entity<Document>()
       .HasOne(x => x.Tenant).WithMany(x => x.Documents)
       .HasForeignKey(x => x.TenantId)
       .HasPrincipalKey(x => x.Code)
       .IsRequired();
   ```
   `TenantId` must have a type compatible with `Tenant.Code`; use a clearly named property if it stores the code rather than an integer ID.

2. Use an explicit `Membership` join entity with the two FKs and payload fields. Configure its key (composite or surrogate) and any uniqueness rule. A pure skip navigation hides join implementation and is less suitable when the association has its own data/lifecycle.

3. EF deletes only dependents tracked by the current context. Unloaded rows remain and the FK can reject deletion. Safe options: load the dependents and delete them under the same transaction, or configure database cascade if cascading data loss is the intended policy. Alternatively restrict/delete explicitly and return a domain conflict.

4. Orphan timing can make a severed required dependent enter the deleted state before it is reattached. If reparenting is valid, consider delaying orphan processing within the unit of work and restore the relationship before saving; test state transitions and ensure no invalid FK/null state is persisted. Do not globally disable orphan deletion as a substitute for clear ownership rules.

5. Use `ComplexProperty` for the address (no entity identity) and `OwnsMany` for lines if each line is an owned entity whose lifecycle belongs to the order. Give line items an owner-scoped/composite or suitable independent key based on whether lines can move. EF11 `ComplexCollection` is another choice only if the lines are truly value elements with no entity identity and provider/JSON semantics fit.

6. ```csharp
   modelBuilder.Entity<Person>()
       .HasOne(x => x.Manager).WithMany()
       .HasForeignKey(x => x.ManagerId);
   modelBuilder.Entity<Person>()
       .HasOne(x => x.Mentor).WithMany()
       .HasForeignKey(x => x.MentorId);
   ```
   If inverse collections exist, pair each one explicitly. Each association needs distinct navigations and FKs.

7. A navigation is not automatically loaded. Check whether the query used `Include`, explicit loading, or configured lazy loading; check global query filters and the actual query predicate; inspect context identity/tracking and FK values; verify that the database rows belong to the expected principal. Navigation fix-up only incorporates tracked related rows.

8. Keep FK constraints and choose a deletion plan: remove database cascade from one or more edges and explicitly delete dependents in application order, or use client cascade only when all relevant dependents are guaranteed tracked. Confirm generated DDL, transaction behavior, and failure recovery on the target database.

9. By default, the owner FK contributes to the owned collection's key, expressing that the item belongs to that owner and making transfer conflict with identity immutability. Decide whether transfer is actually valid: if not, preserve ownership; if yes, consider an independent key or a normal entity with a mutable relationship, then define authorization/audit rules for transfer.

10. Pin EF Core 11.0.0 and the specific provider version; generate and inspect migration/DDL; run insert, read, nested query, update, and index exercises against the target database; review SQL and query plans; test null/missing nested values and migrations from the prior schema. EF InMemory is not evidence for JSON provider support.

## Tests and edge cases

- Check the EF model's FK principal/dependent, requiredness, uniqueness, and delete behavior.
- Run relational integration tests that delete a principal with both loaded and unloaded dependents.
- Test orphan removal and valid reparenting with the chosen timing.
- Test unique dependent FK enforcement for one-to-one on the target database.
- Verify all required FKs and cascade operations appear in generated migrations.
- Test many-to-many payload changes through the join entity.
- Test navigation fix-up separately from explicit/eager loading.
- For EF11 complex/JSON features, inspect generated SQL and migrations and test on the production provider.

## Reflection questions

- Is the FK direction clear from your class design?
- Which relationship needs explicit join data or lifecycle?
- Which rows can a delete reach in the application and in the database?
- Does the chosen type have independent identity, or is it part of an owner/value?
- What provider-specific integration test prevents a false sense of safety?
