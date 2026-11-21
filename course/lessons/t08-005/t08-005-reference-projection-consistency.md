# CQRS event sourcing and tradeoffs — Reference: Building and consuming query projections

Sources: [Materialized View](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view), [CQRS](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs), and [Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing).

## Scope and version

This lesson covers derived read models and their operational behavior. Broker-specific delivery and outbox mechanics are separate topics.

## How this group fits the mental model

Projections transform authoritative writes/events into query-friendly data. Because projection work may be asynchronous, the read model is derived and can lag or require rebuilding.

## Supplied names explained

### Projection

A transformation from source changes/events to a read representation. Define included fields, ordering, deduplication, and update semantics. It is usually rebuildable derived data.

### Projector

The process/handler applying source records to a projection. It needs a stable processing checkpoint, observability, retry policy, and idempotent application where records may be redelivered.

### Materialized view

A persisted precomputed query result or denormalized view. It reduces read-time joins/calculation but consumes storage and must be refreshed or rebuilt consistently.

### Projection checkpoint

A durable cursor/position recording how far the projector has processed. Persist the checkpoint consistently with projection effects, or make reprocessing safe. Checkpoint semantics can be per partition/stream.

### Asynchronous projection update

Projection work happens after the write transaction, allowing decoupled scaling but creating a visibility delay and independent failure modes. Expose this tradeoff rather than promising immediate read consistency.

### Eventual consistency

Replicas/projections converge after updates propagate, assuming continued processing and repair. It does not specify a maximum delay by itself; define acceptable lag and alert when breached.

### Read-your-own-write requirement

A user expects to see a change they just made. Options include returning authoritative command output, reading from the write model temporarily, or waiting for a projection checkpoint/consistency token. Pick based on user flow and load.

### Projection rebuild

Recompute a derived view from source history or authoritative data. Support versioned projection code, isolate rebuild traffic, and plan for checkpoint reset, duplicate safety, and cutover.

### Projection lag

The distance in time or source position between committed writes and the read model. Track it as an operational signal; raw queue depth may not equal user-visible lag.

### Projection error recovery

Handle malformed records, transient failures, poison data, and partial writes. Retry only transient conditions, quarantine or alert for permanent failures, and ensure recovery does not skip data silently.

### Projection idempotency

Applying the same source event more than once yields the same intended projection state. Use event IDs, sequence positions, or upsert semantics to prevent duplicates, especially after crash/retry windows.

## Cross-item comparison

Materialized view describes the stored read result; projection describes transformation/update logic. Checkpoint tracks progress; lag measures freshness. Idempotency makes replay/retry safe but does not guarantee ordering or completeness.

## Examples

A projector updates account balance summary from account events and stores last processed stream version. On restart it resumes from that version. If a duplicate event arrives, event ID/version checks prevent a second increment. A rebuild writes a new projection generation and swaps it after catch-up.

## Common mistakes

- Treating a queue acknowledgement as proof the projection transaction committed.
- Advancing checkpoint before applying the projected effect.
- Silently skipping poison events and claiming convergence.
- Ignoring query freshness in user experience.
- Rebuilding in place while readers see a partially reset view.

## Knowledge checks with answers

1. **Why is idempotency useful?** Crash and retry can reapply the same source item.
2. **What should a checkpoint mean?** Precisely which source work has been durably reflected.
3. **Does eventual consistency define a time bound?** No; the system must define and monitor an acceptable lag.

### Exact terms covered

- `Projection`
- `Projector`
- `Materialized view`
- `Projection checkpoint`
- `Asynchronous projection update`
- `Eventual consistency`
- `Read-your-own-write requirement`
- `Projection rebuild`
- `Projection lag`
- `Projection error recovery`
- `Projection idempotency`

### Exact terms covered

- `Projection`
- `Projector`
- `Materialized view`
- `Projection checkpoint`
- `Asynchronous projection update`
- `Eventual consistency`
- `Read-your-own-write requirement`
- `Projection rebuild`
- `Projection lag`
- `Projection error recovery`
- `Projection idempotency`
