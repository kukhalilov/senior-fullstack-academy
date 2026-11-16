# CQRS event sourcing and tradeoffs — Big-picture orientation and mental model

Sources: [CQRS](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs), [Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing), [Materialized View](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view), [Fowler on CQRS](https://martinfowler.com/bliki/CQRS.html), and [Fowler on Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html).

## Problem and purpose

Write operations protect business rules; read operations answer presentation/query needs. When those workloads need different models or scaling, Command Query Responsibility Segregation (CQRS) separates their responsibilities. Event sourcing goes further: it stores an append-only sequence of changes as the system of record.

## Plain-language mental model

A command asks to change state and can be rejected. A query reads a representation. CQRS can use one model/store or separate read/write models and stores. Event sourcing stores facts and rebuilds current state by replay; projections turn those facts into query-friendly views that may lag.

## How the parts fit together

```text
command → validate/invariant → write model/store
                              → committed event/change
                                      ↓ projector
query ← read model/projection ← checkpoint/replay
```

Separating handlers is a lightweight form of CQRS; separate stores are a larger architectural choice. Neither requires event sourcing. Event sourcing creates a different persistence and operations model with ordering, replay, evolution, and sensitive-data consequences.

## Concept map

Commands express intent; queries return data. A projector consumes committed changes into materialized views. Event sourcing uses per-stream ordered events to rehydrate aggregates and reconstruct history. Snapshots can reduce replay time but do not replace the authoritative stream. Concurrency and schema compatibility must be explicit.

## End-to-end walkthrough

A customer submits a transfer command. The write model validates balance and appends events to an account stream with an expected version. A projector updates an account summary. A query reads the projection, which may briefly lag. The confirmation can return the write result or a position token so the next read waits for that projection checkpoint when read-your-own-write behavior is required.

## When to use it and tradeoffs

Consider CQRS when read/write needs genuinely diverge or independent scaling helps. Consider event sourcing when temporal reconstruction, audit, or domain history is central enough to justify replay, schema evolution, and operational expertise. For ordinary CRUD, one transactional model is simpler. Make projection lag visible and test business acceptance of it.

## What later lessons cover

References explain CQRS shapes, projections, event stores/replay, concurrency/evolution, and design fit. Broker delivery, outbox/inbox, and saga coordination are separate topics.

## Version notes

These are architecture patterns, not framework-specific or versioned features. Storage/provider behavior and operational guarantees must be verified for the selected implementation.
