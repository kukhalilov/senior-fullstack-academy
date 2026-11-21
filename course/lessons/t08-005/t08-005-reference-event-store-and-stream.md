# CQRS event sourcing and tradeoffs — Reference: Append-only event history and current-state reconstruction

Sources: [Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) and [Fowler on Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html).

## Scope and version

This lesson covers event-sourced persistence and replay. It distinguishes the event store from a broker used to distribute messages.

## How this group fits the mental model

The event stream is the authoritative history; current state is derived by replaying its facts. Read projections are separately derived. Events are durable domain records, not merely notifications that something happened.

## Supplied names explained

### Event Sourcing

A persistence model that stores state changes as an append-only sequence of events and reconstructs current state from them. It preserves history naturally but changes how updates, queries, migrations, privacy, and debugging work.

### Event store

A persistence component optimized for appending and reading ordered events by stream. It should define atomic append, expected-version behavior, retention, backups, and query/projection mechanisms. A message broker is not automatically an event store.

### Append-only event stream

An ordered sequence for one identity/aggregate to which new facts are appended rather than overwriting prior facts. Corrections are usually new compensating facts or controlled correction records; deleting or mutating old events undermines history semantics.

### Domain event as persisted fact

In Event Sourcing, an event such as `PaymentCaptured` is persisted as part of the authoritative stream. This is stronger than an in-memory domain event raised during a conventional database update. Design the persisted event as a durable statement of what happened.

### Stream identity

A stable identifier for the entity/aggregate whose events are stored. Define tenant and type scoping to avoid collisions and unauthorized cross-stream access.

### Stream ordering

Events have a defined order within a stream, typically by sequence/version. Do not assume a global total order across independent streams unless the store provides and the domain needs one; such ordering can limit scale.

### Event append

Adds one or more events atomically to a stream, usually with an expected version to prevent stale writers. Appending should return the resulting sequence/position needed for projection coordination.

### Aggregate rehydration

Rebuild an aggregate by loading its stream and applying events in order. The evolution code must preserve historical meaning. Rehydration should be deterministic and should not perform external side effects.

### Event replay

Reprocess events to reconstruct state, rebuild projections, or examine history. Replay can execute old data through new code, so versioning and side-effect isolation are essential. Replay throughput and operational load need planning.

### Snapshot

A stored derived state at a known stream version that shortens rehydration. It is an optimization, not authoritative history; discard and rebuild it from events if necessary. Validate snapshot version/compatibility.

### Snapshot frequency tradeoff

Frequent snapshots reduce replay work but consume storage and write/maintenance effort. Infrequent snapshots increase load latency and replay cost. Measure stream length and access patterns; do not snapshot every arbitrary number of events without observing cost.

### Historical state reconstruction

Rebuild state as of a stream position/time by replaying only events up to that point. It supports temporal questions if event history is complete and event semantics remain interpretable. It may require careful timezone, ordering, and schema/version handling.

## Cross-item comparison

An event store is authoritative write history; a broker is usually a delivery mechanism. A snapshot accelerates reconstruction but does not replace events. A projection reshapes events for queries; aggregate rehydration recreates write-side state.

## Examples

An account stream may contain `AccountOpened`, `MoneyDeposited`, and `MoneyWithdrawn`, each with an account ID, amount/currency, timestamp, and schema version. Replaying them reconstructs a balance. A snapshot at version 10,000 can seed replay from 10,001 onward, while historical reconstruction can start from the stream itself.

## Common mistakes

- Treating events as mutable current-state rows.
- Publishing an event to a broker and assuming it is durable authoritative history.
- Performing email or payment side effects during replay.
- Assuming event order across streams is globally meaningful.
- Treating snapshots as the source of truth.

## Knowledge checks with answers

1. **What is authoritative in Event Sourcing?** The persisted append-only event stream.
2. **Why keep snapshots?** To reduce replay work; they are rebuildable.
3. **What should replay avoid?** Non-idempotent external side effects.

### Exact terms covered

- `Event Sourcing`
- `Event store`
- `Append-only event stream`
- `Domain event as persisted fact`
- `Stream identity`
- `Stream ordering`
- `Event append`
- `Aggregate rehydration`
- `Event replay`
- `Snapshot`
- `Snapshot frequency tradeoff`
- `Historical state reconstruction`

### Exact terms covered

- `Event Sourcing`
- `Event store`
- `Append-only event stream`
- `Domain event as persisted fact`
- `Stream identity`
- `Stream ordering`
- `Event append`
- `Aggregate rehydration`
- `Event replay`
- `Snapshot`
- `Snapshot frequency tradeoff`
- `Historical state reconstruction`
