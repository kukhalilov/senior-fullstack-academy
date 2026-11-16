# CQRS event sourcing and tradeoffs — Exercises and worked solutions

Sources: [CQRS](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs), [Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing), and [Materialized View](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view).

## Goals

Choose proportionate read/write architecture, design projection consistency behavior, and reason about event replay, concurrency, schema change, and failure.

## Worked example

A support dashboard reads denormalized customer and case data, while updates enforce case workflow rules. Start with separate handlers over one database. If measured read load requires it, add an asynchronous view; surface freshness and provide authoritative command results. Add Event Sourcing only if durable event history and temporal reconstruction justify long-lived event compatibility and replay operations.

## Exercises

### Exercise 1: Is CQRS warranted?

A small catalog has simple forms and list views with similar throughput. Should the team create separate databases and projectors?

#### Worked solution

Probably not. A conventional CRUD model or separate handlers over one store is simpler. Add physical read/write separation only after query shape, scaling, or ownership requirements show a benefit.

### Exercise 2: Projection duplicate

A projector increments a monthly total, crashes after writing the total but before advancing its checkpoint, then receives the same event again. What is the risk and repair?

#### Worked solution

The total can double-count. Apply the projection effect and checkpoint atomically when possible, or track event IDs/versions transactionally and make replay idempotent. Monitor lag and provide a deterministic rebuild path.

### Exercise 3: Concurrent stream append

Two commands load stream version 14. The first appends; the second receives an expected-version conflict. Is blind retry correct?

#### Worked solution

No. Reload the stream and re-evaluate the command against new state. The command may now be invalid or require a different event. Return a conflict if business semantics require user confirmation.

### Exercise 4: Read-your-own-write

A user updates an address and immediately opens a profile read model that can lag by seconds. Give two explicit solutions.

#### Worked solution

Return the authoritative updated result from the command and use it in the UI; or return a write position/token and wait until the projection checkpoint reaches it. A temporary read from the write model is another option. Choose by UX and load requirements.

### Exercise 5: Event schema change

An old event stores `amount` as a decimal string; new code uses a structured money value with currency. How should history remain readable?

#### Worked solution

Version the event representation and apply a deterministic upcaster to a current in-memory shape, with explicit default/legacy currency rules. Test old fixtures and replay. Do not silently assume missing currency when meaning is ambiguous.

### Exercise 6: Privacy erasure

An event stream contains a person’s name and address in every event. A deletion request arrives. What design issue should have been considered?

#### Worked solution

Append-only history makes deletion difficult. Minimize personal data in events; store sensitive details by reference or use an appropriate encryption/key strategy where legally acceptable. Define retention, access control, and erasure obligations before choosing Event Sourcing.

## Progressive hints

Separate the write authority from the read projection. Identify the crash window between effect and checkpoint. For every retry, ask whether the same operation is still valid after current state changes.

## Complete solutions

Each exercise gives a safe baseline. Provider features may offer more precise transactions/positions; verify their actual guarantees and failure behavior.

## Tests and edge cases

Test duplicate delivery, out-of-order records where applicable, concurrent append, projection rebuild, version-upcaster chains, poison events, delayed read-your-own-write, deleted/sensitive information, and snapshot fallback. Simulate a crash between every durable write/checkpoint boundary.

## Reflection questions

What business need makes history authoritative? What lag can the user tolerate? Who owns replay, schema migration, and privacy incidents in production?
