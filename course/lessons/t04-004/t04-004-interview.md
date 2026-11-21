# change tracking identity resolution no tracking and concurrency tokens — Interview questions and reasoning

Source basis: Microsoft [change tracking](https://learn.microsoft.com/en-us/ef/core/change-tracking/), [change detection](https://learn.microsoft.com/en-us/ef/core/change-tracking/change-detection), [identity resolution](https://learn.microsoft.com/en-us/ef/core/change-tracking/identity-resolution), [tracking queries](https://learn.microsoft.com/en-us/ef/core/querying/tracking), [explicit tracking](https://learn.microsoft.com/en-us/ef/core/change-tracking/explicit-tracking), and [concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency).

## Core questions

1. What does the EF Core change tracker remember?
2. Explain the five `EntityState` values and resulting SaveChanges actions.
3. How does snapshot change detection work, and when does EF run it?
4. Compare snapshot, notification, and change-tracking proxy strategies.
5. Why can one `DbContext` track only one instance per key?
6. Compare tracking, `AsNoTracking`, and `AsNoTrackingWithIdentityResolution`.
7. Can a projection still track an entity?
8. What is the difference between `Attach` and `Update` for a disconnected graph?
9. Why is blind `Update` risky for an HTTP partial update?
10. How do concurrency tokens work in an UPDATE?
11. How would you resolve a `DbUpdateConcurrencyException`?
12. What is the purpose and risk of `SaveChanges(false)`?
13. How do you safely disable automatic change detection?
14. Why is `DbContext` unsuitable for concurrent operations?

## Concise interview answers

1. It stores tracked identity, state, original/current values, relationship information, and modified-property flags that drive writes.
2. Detached: no action; Added: insert; Unchanged: no write; Modified: update modified values; Deleted: delete.
3. EF snapshots values when tracking starts and compares current values at detection points. SaveChanges detects changes by default; callers can invoke `DetectChanges` explicitly.
4. Snapshot is default/simple but compares values. Notification strategies require complete correctly timed events. Proxies intercept virtual changes but require proxy-created instances and proxy-compatible entity types.
5. Duplicate instances could disagree on values and relationships, leaving update choice ambiguous.
6. Tracking uses context state and identity resolution; no-tracking avoids context state and may duplicate instances; identity-resolving no-tracking uses a temporary tracker only during materialization.
7. Yes, if the projection contains an entity instance. A scalar/DTO-only projection has no entity to track.
8. `Attach` usually marks keyed graph nodes Unchanged; `Update` commonly marks existing graph nodes Modified. Generated unset keys can cause new nodes to be Added.
9. It may overwrite fields omitted by the client and can accept tampered relationships/keys. Load the authorized row and patch only allowed fields.
10. EF includes the original token in the update/delete predicate. A zero-row result causes `DbUpdateConcurrencyException`.
11. Read current database values, handle deletion, compare original/proposed/latest values, apply domain-specific merge or reject, refresh baseline, and retry within a bound if appropriate.
12. It delays accepting tracker states after a successful save; application must accept changes only when its transaction protocol commits or reset the context after rollback.
13. Measure first; when disabled, explicitly detect changes or mark each property/state correctly before save, and restore the flag reliably.
14. EF documents contexts as non-thread-safe; overlapping operations can corrupt state or throw. Use separate contexts per concurrent unit of work and await each operation.

## Deep follow-up answers

Identity resolution is context-scoped for tracking queries. A tracking query returning an already-tracked key returns that same instance and does not overwrite its current/original values with a fresh database copy. This matters for stale data and explains why long-lived contexts are risky. Query a new context when a fresh unit of work is required.

No-tracking does not mean “never tracks anything in the query pipeline”: `AsNoTrackingWithIdentityResolution` creates a separate temporary state manager for deduplication, and custom projections embedding entity instances may still track those entities under tracking behavior. Keyless entity types are never tracked.

Disconnected graph methods infer state from method and key configuration, not from database existence or user authorization. `Update` is convenient for a complete trusted graph but too broad for partial web payloads. Safer updates query the row, check authorization, and apply allowed DTO fields; use property-level flags for deliberate blind writes.

Optimistic concurrency does not lock, merge, or decide a winner. The row predicate compares the original token and the database reports affected-row count. Conflict policy is domain-specific. A retry is valid only after examining latest values and reapplying the intended operation; a blind replay can erase someone else's change. Unique insert collisions are separate provider errors.

## Scenario questions

### Scenario: query then duplicate attach

An action queries an entity and then attaches an object deserialized from the request with the same key.

**Strong approach:** Explain the one-instance-per-key invariant. Update the queried instance with allowed request values, or use a single disconnected attach path without first querying, while handling authorization, original values, partial update semantics, and concurrency explicitly.

### Scenario: PATCH clears omitted fields

The endpoint maps a partial DTO to an entity and calls `Update`.

**Strong approach:** `Update` may mark omitted members modified as null/default. Load the entity and apply fields explicitly present in the patch, validate them, and use a token/precondition to detect concurrent edits.

### Scenario: stale tab saves

An operator submits a form opened hours earlier.

**Strong approach:** Use a concurrency token or HTTP conditional request/ETag backed by a stable version; return a conflict with current representation or merge after comparing original/proposed/current fields. Do not silently apply stale values.

### Scenario: same context shared between tasks

Two async operations use a singleton `DbContext` simultaneously.

**Strong approach:** Reject the lifetime/concurrency design. Scope contexts to independent units of work (typically request-scoped for web, factory-created for background parallel work), await operations, and never use one context concurrently.

## Tradeoffs and alternatives

- A short-lived tracking context gives convenient unit-of-work semantics; no-tracking is appropriate for read-only access but may need DTO projection and identity resolution tradeoffs.
- Snapshot tracking minimizes entity constraints; notification/proxy strategies can reduce detection scans but increase design requirements and debugging complexity.
- Query-and-patch costs a read but gives precise authorization and partial-update semantics; blind attach/update can reduce round trips but needs complete, trusted values and concurrency safeguards.
- Optimistic concurrency avoids locks for ordinary low-conflict work; pessimistic locking/serializable transactions suit narrower high-contention invariants and add contention/deadlock risk.

## Common weak answers

- “EF saves every tracked entity every time.”
- “No-tracking is always faster.”
- “`AsNoTrackingWithIdentityResolution` tracks entities in the context.”
- “`Update` changes only the property that differs.”
- “A concurrency token automatically retries or merges.”
- “Use one context as a global cache.”
- “Unique constraint violations are concurrency exceptions.”
- “If auto-detection is disabled, SaveChanges still sees every mutation.”

## Self-check rubric

Identify whether objects are tracked, who owns the canonical instance, what state/property flags will be written, how stale data is detected, and which values the caller is authorized to change. Give a bounded conflict policy and a provider-realistic test strategy.
