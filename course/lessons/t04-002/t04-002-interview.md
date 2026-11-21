# model configuration entities properties and keys — Interview questions and reasoning

Source basis: [EF Core modeling](https://learn.microsoft.com/en-us/ef/core/modeling/), [entity properties](https://learn.microsoft.com/en-us/ef/core/modeling/entity-properties), [keys](https://learn.microsoft.com/en-us/ef/core/modeling/keys), and [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Core questions

1. How does EF Core construct a model, and when is it cached?
2. What are the differences among a primary key, alternate key, and unique index?
3. When would you choose a shadow property, backing field, owned type, or complex type?
4. How do database defaults, computed columns, value-generation metadata, and sentinels differ?
5. What are value converters and comparers, and why might both be needed?
6. What does a concurrency token do, and how do you resolve a conflict?
7. What are the tradeoffs of natural and surrogate keys?
8. What is model-managed data (`HasData`), and when is it a poor fit?
9. How do conventions, attributes, and fluent configuration interact?
10. Which index configuration options are provider-specific?

## Concise interview answers

1. EF combines discovered CLR types, conventions, attributes, and fluent configuration into an `IModel`; the context caches the model, so request-specific model mutation is not appropriate.
2. A primary key is entity identity; an alternate key is another EF key and relationship target; a unique index enforces uniqueness without becoming EF identity.
3. Shadow properties have no CLR member; backing fields are CLR storage used by EF; owned types have ownership/entity semantics; complex types are identity-free value objects.
4. A database default applies when a column is omitted; a computed column is calculated by the database; generation metadata describes EF expectations; a sentinel tells EF whether a property value is considered set.
5. A converter changes the model/provider representation. A comparer defines equality, hash, and snapshot semantics for tracking, especially for mutable or converted values.
6. EF includes the originally read token in the update/delete predicate. If no row matches, EF reports a concurrency conflict; application policy reloads, merges, retries, or rejects.
7. Natural keys express business identity but can change or carry normalization/collation concerns. Surrogate keys are stable persistence identifiers but do not replace unique business constraints.
8. `HasData` is migration-managed fixed data, not general startup seeding. It is unsuitable for data that changes independently at runtime.
9. Conventions provide defaults, annotations add mapping metadata, and fluent configuration generally has the highest precedence for conflicting configuration.
10. SQL filters, fill factor, included columns, identity mechanisms, store types, and JSON/index support can vary by provider.

## Deep follow-up answers

A model is not the database itself: migrations and deployment tooling apply schema changes. Successful model construction therefore does not prove that a production database has the expected columns or constraints. Review generated migrations and exercise them against the intended provider.

The distinction between a unique index and alternate key affects relationship modeling. If another entity must reference the unique value as an EF principal key, configure an alternate key. If uniqueness alone is required, a unique index states that narrower requirement and avoids unnecessary key semantics.

Value generation is a coordination contract. `ValueGeneratedOnAdd` alone does not create an identity or sequence. Configure provider/database generation as needed. Similarly, a default only runs when EF omits the column. Sentinel selection matters when a legitimate value equals the CLR default; the chosen sentinel should not be valid domain data.

A value converter does not automatically translate every domain operation or provide deep change snapshots. For a mutable converted object, a comparer may need value-based equality, matching hash computation, and independent snapshot copies. Test both mutation detection and query operations.

Optimistic concurrency prevents a stale write from silently overwriting newer state; it does not pick the winning value. Reloading and blindly resaving the stale object defeats the protection. A correct resolution merges or rejects according to domain rules, revalidates invariants, and uses a current token.

Index design must follow real query and integrity requirements. Composite column order, selectivity, write amplification, storage, database collation/null semantics, filters, included columns, and query plans matter. An index can be unused or harmful despite being syntactically valid.

## Scenario questions

### Scenario: business key changes

An account's email is used in foreign keys and can change. What would you do?

**Strong approach:** Prefer a stable surrogate primary key, enforce email uniqueness with a unique index, and reference the stable key. Normalize/canonicalize email consistently and define the database collation/uniqueness policy. Use an alternate key only if the value genuinely needs to serve as a principal key and its mutation semantics are acceptable.

### Scenario: duplicate values race

The API checks for an existing username, but two concurrent requests both pass and insert.

**Strong approach:** Retain application validation for a useful error, and enforce uniqueness in the database with a unique index. Translate the provider's unique-constraint violation into a conflict response. A pre-check alone is race-prone.

### Scenario: updates overwrite each other

Two staff members edit different fields on one record.

**Strong approach:** Add a concurrency token, catch the concurrency exception, reload the current row, compare original/current/proposed values, and merge disjoint changes if domain rules permit. Surface overlapping conflicts for resolution. Do not blindly overwrite.

### Scenario: default unexpectedly missing

The database default does not run because EF sends zero for an integer property.

**Strong approach:** Inspect generated SQL and generated-value/sentinel metadata. EF treats the CLR default as unset by default in relevant generated scenarios; configure a sentinel outside the valid domain if zero is meaningful and must be sent. Confirm behavior with the selected provider.

### Scenario: production migration renames many defaults

The team enables SQL Server named default constraints and generated migration renames all existing defaults.

**Strong approach:** Explain that the model-wide opt-in changes constraint naming metadata. Inspect the migration SQL, test runtime/locking impact on a production-like copy, stage deployment if needed, and do not merge a broad rename without understanding its operational effect.

## Tradeoffs and alternatives

- Use a unique index for uniqueness-only constraints; an alternate key when EF relationship/key semantics are needed.
- Use database-generated keys for centralized allocation and client-generated identifiers when offline/distributed creation requires them, accounting for provider and key/index costs.
- Use a database default for database-owned fallback values, a CLR initializer for application-owned initialization, and explicit values when the application owns the value; do not conflate them.
- Use concurrency tokens for stale-write detection; pessimistic locking may be appropriate for narrow high-contention workflows but increases blocking and deadlock concerns.
- Use model conventions for consistency, but explicit fluent config for important constraints and mapping decisions.

## Common weak answers

- “A unique index and alternate key are the same.”
- “`ValueGeneratedOnAdd` makes SQL Server generate an identity.”
- “A database default always replaces a CLR value of zero.”
- “A concurrency token automatically merges changes.”
- “Indexes always make reads faster.”
- “`HasData` seeds the database each time the app starts.”
- “A value converter means EF tracks every change inside the converted object.”
- “The EF model guarantees the deployed schema matches.”

## Self-check rubric

For each answer, identify the exact EF model semantics, the provider/database dependency, the operational implication, and a concrete verification method. Distinguish the mechanism from the policy: EF can detect a concurrency conflict, but the domain decides how to resolve it.
