# SOLID cohesion coupling DRY KISS YAGNI — Reference: Coupling forms used to reason about module dependencies

Sources: [Cohesion in software design](https://www.open.edu/openlearn/science-maths-technology/approaches-software-development/content-section-1.5.4) and [cohesion taxonomy study](https://publications.rwth-aachen.de/record/755886/files/755886.pdf?version=1).

## Scope and version

Coupling labels describe how one module depends on or communicates with another. Different teaching sources classify message and data coupling differently; this lesson uses the supplied categories as a practical diagnostic vocabulary.

## How this group fits the mental model

Dependencies are unavoidable. The aim is to make them explicit and narrow, so a change in one module does not force unrelated consumers to understand internal details.

## Supplied names explained

### No coupling

Two modules have no direct dependency or communication path. This is a useful ideal for independent capabilities, but most collaborating components necessarily have some coupling. Avoid using the phrase to imply that all coupling is harmful.

### Data coupling

Modules communicate through the specific data needed by a task. A caller supplies a customer identifier to a lookup operation rather than passing an entire mutable customer subsystem. This tends to make dependencies explicit and constrained.

### Stamp coupling

A module receives a composite record or structure but uses only a portion of it. Passing a large request object to a component that needs only an ID can couple that component to unrelated fields and changes. Pass a focused value when it improves clarity and does not cause needless parameter sprawl.

### Control coupling

One module passes flags or control data that direct another module’s internal path, such as `mode = 3`. This can be appropriate when the mode is part of a genuine contract, but many unrelated flags suggest the caller knows too much about implementation or the operation combines responsibilities.

### External coupling

Modules depend on an external format, protocol, device, or service contract. This dependency may be necessary; isolate unstable provider details behind a clear adapter and pin/validate the contract where possible.

### Common coupling

Modules share mutable global or ambient data. A write in one location can silently change behavior elsewhere, making order-dependent tests and reasoning difficult. Replace ambient shared mutation with explicit inputs, owned state, or a well-defined shared store when appropriate.

### Content coupling

One module reaches into or changes another module’s internal representation or execution path. This is highly restrictive because internal changes break consumers. Restore encapsulation through a public contract.

### Message coupling

Modules communicate through messages or events that describe an intent or fact without exposing the receiver’s internal methods/state. It can reduce direct compile-time dependencies, while introducing asynchronous delivery, ordering, schema evolution, and observability concerns.

## Cross-item comparison

Data and message coupling expose specific information through contracts. Stamp and control coupling can reveal overly broad data or knowledge of another module’s choices. External coupling is a necessary integration dependency; common and content coupling hide more implementation detail and tend to increase change ripple.

## Examples

Passing `GenerateInvoice(orderId)` is a focused data contract. Passing an entire application singleton that contains database, mail, cache, and current-user state creates a broad dependency. Letting an invoice component mutate the singleton’s internal cache is content/common coupling and makes tests order-sensitive.

## Common mistakes

- Treating all coupling as bad instead of controlling its direction and scope.
- Assuming message-based systems have no coupling; schemas and delivery guarantees are dependencies too.
- Splitting every composite parameter into many primitives without considering domain meaning.
- Hiding a dependency in global state and calling the modules independent.

## Knowledge checks with answers

1. **What is a stamp-coupling clue?** A consumer receives a large structure but uses only a small part.
2. **What makes common coupling risky?** Shared mutable state creates hidden, order-sensitive dependencies.
3. **Does messaging eliminate coupling?** No; it changes the contract and adds delivery/schema concerns.

### Exact terms covered

- `No coupling`
- `Data coupling`
- `Stamp coupling`
- `Control coupling`
- `External coupling`
- `Common coupling`
- `Content coupling`
- `Message coupling`

### Exact terms covered

- `No coupling`
- `Data coupling`
- `Stamp coupling`
- `Control coupling`
- `External coupling`
- `Common coupling`
- `Content coupling`
- `Message coupling`
