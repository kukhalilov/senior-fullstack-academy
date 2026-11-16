# CQRS event sourcing and tradeoffs — Core concepts and how they fit together

Sources: [CQRS](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs), [Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing), [Materialized View](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view), [Fowler on CQRS](https://martinfowler.com/bliki/CQRS.html), and [Fowler on Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html).

## Learning objectives

Distinguish command/query separation from event sourcing; compare shared-store and separate-store deployments; explain projection lag, event replay, stream concurrency, and historical compatibility; and evaluate the operational cost against business needs.

## Prerequisites

Know transactions, aggregate invariants, domain/integration events, and eventual consistency. This topic does not assume a specific database or broker.

## Core concepts

CQRS separates a **Command** that requests a state change from a **Query** that returns data without changing state. A command can be accepted or rejected; a query should not have write side effects. A **Command model** protects business rules and updates state. A **Query model** is shaped for reads. Separate command/query handlers can use the same model and store; stronger separation can use denormalized read projections and separate stores, enabling independent scaling at the cost of synchronization and consistency complexity. CQRS does not imply Event Sourcing.

A **Projection** is a transformation of committed changes into a read view. A **Projector** applies events/changes and tracks a **Projection checkpoint** so work can resume. A materialized view stores precomputed query results. Asynchronous updates create **eventual consistency**: a successful write may not immediately appear in every read view. Define whether the user needs **read-your-own-write**, expose lag, and provide a path to wait or return authoritative command results.

With **Event Sourcing**, the event store is the system of record for an append-only stream. Events are persisted facts, ordered within a stream. Loading an aggregate replays events to rebuild current state; replay can also reconstruct historical state. Snapshots are derived accelerators and may be discarded/rebuilt; define the version they cover. Event append usually uses optimistic concurrency with an expected stream version so two writers cannot silently overwrite a sequence.

Historical events must remain readable as code evolves. Tolerant deserialization, explicit event versioning, and upcasting can transform old representations. Projection code may be versioned and rebuilt. Corrections are represented as compensating facts or a controlled event correction process rather than silently mutating immutable history. Sensitive data in an append-only log is difficult to erase; minimize it, use references or encryption/key strategies where appropriate, and design retention/privacy before adoption.

Event handlers and projectors must tolerate duplicate processing where retries occur. Exactly-once processing is not a general broker guarantee. Idempotent application and checkpoints help. A crash between state commit and external publish is a dual-write problem addressed by outbox/inbox patterns elsewhere.

## Mechanisms and relationships

```text
CQRS: command model ≠ query model (can still share storage)
Event Sourcing: append-only events are the authoritative write history
events → projector → denormalized read view → eventual read consistency
expected version → reject concurrent append → reload/re-evaluate/retry safely
```

## Worked examples

An `AccountDebited` event plus `AccountCredited` event can rebuild balances. A query projection can aggregate recent transactions for display. If a transfer command succeeds but the projection is behind, the write response can confirm the result or return a consistency token. Replaying the stream must produce the same aggregate state under a deterministic event evolution path.

## Misconceptions and edge cases

- CQRS does not require two databases or event sourcing.
- Event sourcing is not merely publishing domain events to a broker.
- An event log is not automatically an audit trail that satisfies legal requirements.
- Replay can be expensive and can invoke changed code; historical compatibility is essential.
- Projections are derived data and can lag, fail, and need rebuilds.
- Immutable history complicates privacy deletion and correction.

## Knowledge checks with answers

1. **Can CQRS use one store?** Yes; handler/read-write responsibility separation can be within one store.
2. **What is authoritative in event sourcing?** The persisted ordered event stream.
3. **What must projection consumers handle?** Lag, retries/duplicates, checkpoints, and rebuild.
4. **Why use expected stream version?** To detect concurrent writes against stale state.
