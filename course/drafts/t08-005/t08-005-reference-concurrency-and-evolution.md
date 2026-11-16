# CQRS event sourcing and tradeoffs — Reference: Concurrency control and historical event compatibility

Sources: [Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing), [Fowler on Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html), and [CQRS](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs).

## Scope and version

This lesson covers stream concurrency and long-lived event compatibility. Provider-specific guarantees and broker delivery details vary and must be checked against the chosen implementation.

## How this group fits the mental model

Append-only history makes conflict detection, schema evolution, replay, and privacy lifetime explicit. The system must preserve old meaning while accepting new writes and safely rebuilding derived views.

## Supplied names explained

### Optimistic concurrency control for stream append

The writer states which stream version it read. The store accepts append only if that version is still current. This detects competing commands without locking a stream through the whole application decision.

### Expected stream version

The version/sequence the command expects before appending. Use an explicit “no stream yet” expectation for creation where supported. Wildcard/unconditional append may bypass conflict protection and should be a deliberate choice.

### Concurrency conflict retry

When an append loses a race, reload current state, re-evaluate the command and invariants, then decide whether to retry. Blindly retrying the same event can violate business rules or duplicate effects; some commands must be rejected to the user.

### Idempotent event handler

A handler applies an event once in effect even if delivery repeats. Track event IDs/versions transactionally with the projection update or use naturally idempotent set/upsert operations. Idempotency is distinct from ordering and completeness.

### Event schema evolution

Persisted event representations outlive current code. Changes to names, fields, types, and semantics need a compatibility strategy before deployment. Treat event contracts as durable data rather than transient DTOs.

### Tolerant deserialization

Readers can handle compatible unknown or optional fields where safe. Too-tolerant behavior can silently misinterpret changed meaning; validate required semantics and reject unsupported versions clearly.

### Event versioning

Record or infer schema versions so readers know how to interpret historical payloads. Versioning strategy should be consistent per event type and maintain a backward-compatibility plan.

### Event upcasting

Transform an older serialized event to a newer in-memory representation during read/replay, without rewriting original history. Keep transformations deterministic, tested, and composable across versions.

### Projection versioning

Give projection code/schema generations explicit identity so a new implementation can rebuild separately, catch up, and be switched over. Preserve the previous projection until the new one is valid.

### Event correction by compensating event

Add a new fact that reverses or corrects the business effect instead of erasing history. The correction must be meaningful and auditable; it does not retroactively make the original event never happen.

### Sensitive data in immutable history

Append-only logs are difficult to erase, creating privacy and retention risk. Avoid storing unnecessary personal data; consider indirection, encryption and key destruction where legally/technically appropriate, and define access/retention before choosing the model. Legal erasure requirements need qualified review for the jurisdiction/system.

### Event-store retention tradeoff

Long retention enables replay and historical reconstruction but increases storage, security, and compliance obligations. Shorter retention may require snapshots/archives and can limit rebuild/audit needs. Retention is a business/data-governance decision, not only an operations setting.

## Cross-item comparison

Expected version detects append conflict; retry means re-evaluating current domain state. Event version/upcasting preserves historical readability. Projection versioning governs a derived view, not the authoritative stream. Compensating events preserve history but add new facts.

## Examples

Two commands both load stream version 8. One appends version 9; the other receives a conflict. It reloads version 9 and re-checks whether the second operation remains valid. Separately, a projector applies versioned event records idempotently and writes its checkpoint atomically with its materialized view update.

## Common mistakes

- Retrying a failed append without re-evaluating invariants.
- Rewriting historical payloads in place without preserving audit meaning.
- Making deserialization so tolerant that incompatible semantics pass unnoticed.
- Rebuilding a projection over the one serving table and exposing partial state.
- Treating immutable history as automatically compliant or tamper-proof.

## Knowledge checks with answers

1. **What must happen after an optimistic conflict?** Reload and re-evaluate the command.
2. **What does upcasting change?** The in-memory representation read from old stored events, not the original history.
3. **What privacy issue is fundamental?** Sensitive data can be difficult to erase from immutable history.

### Exact terms covered

- `Optimistic concurrency control for stream append`
- `Expected stream version`
- `Concurrency conflict retry`
- `Idempotent event handler`
- `Event schema evolution`
- `Tolerant deserialization`
- `Event versioning`
- `Event upcasting`
- `Projection versioning`
- `Event correction by compensating event`
- `Sensitive data in immutable history`
- `Event-store retention tradeoff`

### Exact terms covered

- `Optimistic concurrency control for stream append`
- `Expected stream version`
- `Concurrency conflict retry`
- `Idempotent event handler`
- `Event schema evolution`
- `Tolerant deserialization`
- `Event versioning`
- `Event upcasting`
- `Projection versioning`
- `Event correction by compensating event`
- `Sensitive data in immutable history`
- `Event-store retention tradeoff`
