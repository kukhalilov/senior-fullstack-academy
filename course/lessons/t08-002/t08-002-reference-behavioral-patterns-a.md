# creational structural and behavioral design patterns — Reference: Behavioral patterns: responsibility, commands, iteration, and mediation

Sources: [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.oreilly.com/library/view/design-patterns-elements/0201633612/) and [design pattern catalog](https://refactoring.guru/design-patterns/catalog).

## Scope and version

This lesson covers five GoF behavioral patterns that route requests, represent actions, traverse structures, coordinate peers, or preserve snapshots.

## How this group fits the mental model

Behavioral patterns allocate communication and responsibility among collaborating objects. They can reduce direct coupling but introduce indirection, lifecycle, ordering, and observability requirements.

## Supplied names explained

### Chain of Responsibility

Passes a request through an ordered sequence of handlers until one handles it or the chain ends. It decouples the sender from a specific receiver and supports middleware-like processing. Ordering, short-circuit behavior, and unhandled requests must be explicit.

### Command

Encapsulates a request as an object or value, separating the invoker from the receiver. It can support queueing, logging, undo, or delayed execution. A command does not guarantee transactional behavior or safe retries; those semantics belong to the system executing it.

### Iterator

Provides sequential access to elements without exposing collection representation. It can encapsulate traversal state and allow multiple traversals. Mutation during iteration has collection-specific rules that callers must understand.

### Mediator

Centralizes coordination among peer objects so they need not reference one another directly. A mediator can reduce many-to-many dependencies, but can become a god object if all behavior accumulates there. Keep policy focused and boundaries visible.

### Memento

Captures and later restores an object state snapshot while preserving encapsulation. It supports undo/history when snapshot semantics are defined. Deep versus shallow data, resource handles, memory use, and version compatibility matter.

## Cross-item comparison

Chain distributes request handling among potential handlers; Mediator centralizes peer coordination. Command represents an action as data; Memento records state. Iterator abstracts traversal rather than coordinating business requests.

## Examples

A request may pass through authorization, validation, and audit handlers in a chain. A toolbar button can invoke a `SaveDocument` command without knowing the storage receiver. An editor can store mementos for undo, but a large document may require deltas or bounded history rather than full snapshots.

## Common mistakes

- Allowing a chain to silently drop requests.
- Treating a command as automatically idempotent or transactional.
- Letting a Mediator collect unrelated business policies.
- Capturing a Memento that still aliases mutable state.
- Assuming iteration is safe while its collection changes.

## Knowledge checks with answers

1. **What decouples sender from receiver?** Command encapsulates a request.
2. **What centralizes peer interaction?** Mediator.
3. **What must a Memento define?** Snapshot depth, restore behavior, and retained-state cost.

### Exact terms covered

- `Chain of Responsibility`
- `Command`
- `Iterator`
- `Mediator`
- `Memento`

### Exact terms covered

- `Chain of Responsibility`
- `Command`
- `Iterator`
- `Mediator`
- `Memento`
