# change tracking identity resolution no tracking and concurrency tokens — Big-picture orientation and mental model

This overview follows Microsoft's [change tracking guide](https://learn.microsoft.com/en-us/ef/core/change-tracking/) and the final [.NET 11 EF Core release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Problem and purpose

EF Core must know which database row each object represents, what changed since it was read, and what SQL operation should be issued at `SaveChanges`. The change tracker is the context's unit-of-work memory: it holds identity, current/original values, relationships, and intended state. Query mode and concurrency configuration decide how much tracking work occurs and how stale writes are detected.

## Plain-language mental model

Think of a `DbContext` as a short-lived workbench with one tracked object per entity key. A query can place objects on the bench; EF remembers their original values, detects changes, and computes inserts, updates, and deletes. `SaveChanges` applies that unit of work. No-tracking reads do not put entity objects on this workbench. A concurrency token asks the database to confirm that the row still has the version you originally read.

## How the parts fit together

Every tracked entity has a state: Detached, Added, Unchanged, Modified, or Deleted. Snapshot tracking is the default: EF compares current values with original snapshots at detection points. Notification strategies and proxies can detect changes earlier, but their notification coverage and construction requirements must be satisfied. The tracker performs identity resolution: a key maps to one tracked instance. This makes graphs coherent but means attaching a second instance with the same key throws.

Tracking queries are convenient for read-modify-save work. `AsNoTracking` avoids context tracking and may return duplicate objects for repeated keys; `AsNoTrackingWithIdentityResolution` deduplicates within the query result using a temporary tracker that is not the context's tracker. Disconnected update graphs need explicit key/property decisions: `Update` commonly marks existing graph values modified, which can over-write omitted fields.

Optimistic concurrency includes original token values in update/delete predicates. A mismatch yields `DbUpdateConcurrencyException`, not a magical merge. Application code reloads and chooses store-wins, client-wins, or a field-aware merge. A unique constraint race during insert is normally a provider-specific constraint exception, not a concurrency-token exception.

## Concept map

```text
query/attach → one context identity map → state + original/current values
                                  ↓ change detection
                           SaveChanges → INSERT/UPDATE/DELETE
                                  ↑                  ↓
                        concurrency token ← database predicate/version

tracking query: context identity + changes
no tracking: no context state
no tracking + identity resolution: temporary query-only identity map
```

## End-to-end walkthrough

Load a customer using a tracking query. EF returns an existing tracked instance if its key is already present; otherwise it creates and tracks one as Unchanged. Modify `Name`; snapshot detection marks that property modified before save. `SaveChangesAsync` sends an update, including the original concurrency token when configured. If another writer updated the row first, the update affects zero rows and EF throws. The application reads database values, compares original/proposed/current values, resolves the conflict, then saves with a fresh token.

## When to use it and tradeoffs

Use tracking for a normal unit of work that reads and writes entities together. Use no-tracking for read-only projections where persistence state is unnecessary. Use identity-resolving no-tracking when a read graph repeats entities and object identity consistency matters. Use notification/proxy strategies only when the entity design can satisfy them and profiling justifies complexity. Prefer query-and-patch or DTO-to-entity mapping with explicit modified properties over blind graph `Update` when clients send partial data.

## What later lessons cover

The reference lessons cover states/detection, tracking/identity modes, and concurrency resolution. Practice builds disconnected updates and conflict loops. Relationship loading and transaction retry strategies are separate topics.
