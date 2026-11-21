# relationships cardinality cascading and owned types — Interview questions and reasoning

Source basis: Microsoft [relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships), [relationship discovery conventions](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/conventions), [navigation behavior](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/navigations), [owned entities](https://learn.microsoft.com/en-us/ef/core/modeling/owned-entities), [cascade delete](https://learn.microsoft.com/en-us/ef/core/saving/cascade-delete), and [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Core questions

1. What does EF Core persist to represent a relationship, and what do navigations add?
2. How do one-to-many, one-to-one, and many-to-many differ in relational mapping?
3. What does required relationship mean? Does it require a principal to have a dependent?
4. How does EF discover and pair navigations, and when do you use fluent configuration or mapping attributes?
5. Does navigation fix-up load related rows?
6. What is the difference between `Cascade`, `ClientCascade`, and client set-null behavior?
7. What is orphan deletion, and how is it different from cascade delete?
8. When should a many-to-many use an explicit join entity?
9. How do owned entity types differ from complex types?
10. What is the risk of deleting a principal with unloaded dependents?
11. What is the distinction between required FK and required dependent in one-to-one?
12. How do you handle multiple relationships between the same two CLR types?

## Concise interview answers

1. The dependent FK points to a principal primary/alternate key. Navigations provide object references/collections for traversing the same association.
2. One-to-many has FK on each dependent; one-to-one additionally requires a unique dependent FK; many-to-many uses a join entity/table with two FKs.
3. It means each dependent must reference a principal. It does not require any dependent to exist for every principal.
4. Conventions inspect navigation candidates, inverse shapes, FK names, keys, and nullability. Use fluent configuration for ambiguity and explicit important constraints; attributes can annotate straightforward mappings.
5. No. Fix-up synchronizes relationships for tracked/materialized entities but does not issue a load query.
6. `Cascade` can delete tracked dependents and configure database cascade; `ClientCascade` only deletes tracked dependents; client set-null updates tracked optional FKs, while unloaded rows need database action or can block deletion.
7. Cascade delete follows principal deletion. Orphan deletion follows severing a required relationship while principal remains.
8. When the relationship has payload, identity, lifecycle, auditing, or behavior of its own.
9. Owned types are dependent entities with owner-bound key/lifecycle. Complex types are identity-free values with no entity key.
10. Client-side behavior cannot reach unloaded rows; database FK constraints can reject the delete or database cascade can affect those rows.
11. Required FK controls whether a dependent points to a principal. Required dependent controls the one-to-one dependent's presence for a principal; configure and verify separately.
12. Give each relationship distinct navigation/FK members and configure each inverse pair explicitly; attributes such as `[InverseProperty]` can disambiguate simpler cases.

## Deep follow-up answers

The object graph and relational representation are separate layers. A populated collection can be an in-memory subset, and an initialized empty collection says nothing about whether rows exist in the database. Use explicit query/loading semantics and verify filter predicates. FK and navigation values can be synchronized by fix-up for tracked entities, but this is not a database fetch.

For one-to-one, a pair of reference properties is insufficient: relational uniqueness on the dependent FK is required. The dependent side carries the FK and may be optional or required; separately, the principal may or may not be required to have its dependent. Table-split optional dependents have additional materialization implications when all dependent columns are null.

Cascade action has two execution scopes. EF can change tracked entity states; the database can enforce FK actions against rows not loaded into the context. `ClientCascade` is not a safe replacement for database cascade unless the application reliably loads/deletes every dependent. `Restrict` and `NoAction` should be described through generated provider behavior rather than assuming SQL equivalence.

Owned types are entities and have keys, often implicit owner-derived keys. Owned collection identity often includes the owner FK, expressing that moving the item changes its identity. Complex types have value semantics and no key identity. EF Core 11 supports additional complex/JSON scenarios, nested keys/indexes and collections; support still depends on the provider and actual mapping.

## Scenario questions

### Scenario: accidental high-level delete

An administrator deletes an organization. It has millions of rows in several dependent tables, and the application loads only the organization.

**Strong approach:** Do not casually rely on tracked client cascade or a broad database cascade. Define retention and deletion policy, estimate row volume/locks/logging, use explicit staged/batched deletion or soft-delete/archival where required, maintain FK integrity, and make the operation observable/retriable. Validate provider behavior and operational limits.

### Scenario: navigation seems empty

`order.Items.Count` is zero while SQL shows rows.

**Strong approach:** Check if items were loaded, whether lazy loading is configured, query filters, FK values and tenant predicates, use of a different context, and whether the collection getter returns a new collection. Do not infer loading from the existence of the navigation.

### Scenario: many-to-many grows business data

Membership now records joined date, inviter, and approval state.

**Strong approach:** Promote the join table to an explicit join entity and model those properties/invariants. Keep skip navigations only if they still make traversal convenient and avoid conflicting duplicate configuration.

### Scenario: reusable address object

The same address value is referenced by multiple aggregates, and changes should not imply a separate row or identity.

**Strong approach:** Use a complex type if value semantics/provider mapping fit. Owned entity types carry hidden key/identity and ownership rules; shared instance semantics can be problematic. If the address is independently managed/audited, model it as a regular entity instead.

### Scenario: deletion fails despite cascade configuration

**Strong approach:** Inspect tracked dependents, actual FK constraint action, generated migration status, provider semantics, cycles/multiple cascade paths, and whether the configured behavior is client-only. Reconcile the model and deployed schema, then choose database cascade or explicit tracked deletion/restriction based on policy.

## Tradeoffs and alternatives

- Bidirectional navigations simplify traversal but add object graph coupling and serialization-cycle risk; keep only useful directions.
- Skip navigations reduce mapping noise; explicit join entities support relationship state.
- Database cascade handles unloaded rows efficiently but can create wide, expensive deletes; client cascade offers explicit tracking behavior but needs graph completeness.
- Owned entities provide owner-bound persistence identity; complex types model values; regular entities model independent identity/lifecycle.
- Required FKs enforce integrity; optional FKs represent genuinely absent relationships. Nullable annotations should reflect the same contract.

## Common weak answers

- “The navigation is the relationship; the FK is just an implementation detail.”
- “If the collection is empty, there are no related rows.”
- “One-to-one is created by putting a property on each class.”
- “Client cascade deletes everything in the database.”
- “Required means every parent has a child.”
- “Owned and complex types are both just nested classes.”
- “Every many-to-many should be an implicit join table.”
- “EF11 features are still previews.”

## Self-check rubric

Strong answers separate persisted FK semantics from navigation behavior, distinguish client and database actions, state assumptions about tracked/unloaded rows, identify provider-specific effects, and connect identity/lifecycle to type choice. Always state how you would verify generated schema and runtime effects.
