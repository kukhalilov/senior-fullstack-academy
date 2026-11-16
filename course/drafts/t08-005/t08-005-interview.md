# CQRS event sourcing and tradeoffs — Interview questions and reasoning

Sources: [CQRS](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs), [Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing), [Fowler on CQRS](https://martinfowler.com/bliki/CQRS.html), and [Fowler on Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html).

## Core questions

Clearly separate command/query responsibilities, persistence authority, projections, and message delivery. Explain consistency behavior and operational cost rather than treating CQRS/Event Sourcing as default architecture.

## Concise interview answers

CQRS separates change and read models; it can use one store and does not require Event Sourcing. Event Sourcing stores ordered changes as the write-side system of record. Projections derive query models and can lag. Choose these patterns only when workload divergence, history, or reconstruction needs justify complexity.

## Deep follow-up answers

### CQRS versus Event Sourcing?

CQRS is separation of write and read responsibilities/models. Event Sourcing is a persistence model whose authoritative data is an append-only event history. They can be adopted independently or together.

### How do you handle read-your-own-write?

Return the authoritative command result, read from the write side temporarily, or wait for a projection token/checkpoint. Explicitly define latency and failure behavior; do not promise synchronous consistency from an asynchronous projection.

### How does optimistic concurrency work?

Append with an expected stream version. If another writer advanced it, reload current state and re-evaluate the command; never assume the old event is still correct. Some conflicts should return to the caller.

### How do you evolve event schemas?

Use explicit versions, tested deterministic upcasters/tolerant readers where safe, and projection versioning/rebuilds. Preserve historical semantics. Event data has a long lifetime and must be treated more carefully than transient DTOs.

### Is an event store a message broker?

Not necessarily. The event store is authoritative history with stream append/read semantics; a broker transports messages to consumers. An architecture may use both, but their guarantees differ.

## Scenario questions

### Reads are 100 times more frequent than writes

Measure query cost and freshness needs. A materialized projection or read replica may help; define lag, rebuild, and read-your-own-write behavior. Do not introduce Event Sourcing unless history/replay independently matters.

### Audit requires immutable records

Clarify audit integrity, actor attribution, retention, search, and regulatory requirements. Event Sourcing may provide useful history but does not automatically meet compliance or deletion obligations. A dedicated audit log may be simpler.

### A projector has fallen behind

Track source position and lag, inspect poison/failure records, verify checkpoint/effect atomicity, and assess whether to resume or rebuild a versioned projection. Make replay safe and avoid partial cutover.

## Tradeoffs and alternatives

CRUD is simpler for conventional state. CQRS handlers/models may clarify policy without multiple stores. Separate stores improve workload specialization but add propagation and operational work. Event Sourcing supports temporal reconstruction at the cost of compatibility, replay, privacy, and debugging complexity.

## Common weak answers

- “CQRS means two databases.”
- “Event Sourcing is just emitting events.”
- “A projection is always immediately consistent.”
- “Retry the append until it succeeds.”
- “Events are immutable, so they’re automatically a compliant audit log.”

## Self-check rubric

Name the authoritative state, projection path, consistency promise, conflict strategy, schema-evolution method, and operational owner. State why a simpler CRUD alternative is insufficient.

## Senior-level signals

Discusses source-position/checkpoint semantics, dual-write failure windows, deterministic replay, sensitive-data lifecycle, idempotency, and the human/on-call cost of maintaining projections and event schemas.
