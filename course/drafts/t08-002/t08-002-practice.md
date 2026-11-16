# creational structural and behavioral design patterns — Exercises and worked solutions

Sources: [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.oreilly.com/library/view/design-patterns-elements/0201633612/) and [design pattern catalog](https://refactoring.guru/design-patterns/catalog).

## Goals

Identify pattern intent from a design force, distinguish superficially similar patterns, and avoid adding pattern machinery without a requirement.

## Worked example

A legacy payment SDK has an incompatible method signature. Adapt it to the application’s payment contract, then add retry metrics only if policy permits retries and idempotency is understood. The first wrapper is an Adapter; a compatible wrapper that adds behavior resembles Decorator. The name follows intent, not syntax.

## Exercises

### Exercise 1: Choose creation structure

A document has six optional construction steps and must satisfy cross-field invariants before use. Which creation pattern could help, and what simpler alternative should be considered?

#### Worked solution

Builder can express ordered configuration and validate the completed object. A constructor with named arguments or an immutable record may be simpler if combinations remain small. Compare readability and invariant enforcement rather than using Builder by default.

### Exercise 2: Adapter, Decorator, Proxy, or Facade?

Classify: (a) translates a vendor API, (b) adds metrics around a compatible service, (c) delays opening a remote connection, (d) provides one simple API over a subsystem.

#### Worked solution

(a) Adapter, (b) Decorator, (c) Proxy, and (d) Facade. Each may use delegation but solves a different problem. State which contract or access behavior changes.

### Exercise 3: Strategy or State?

A shipping service chooses one rate algorithm based on destination. A workflow allows actions to change after approval and closure. Which pattern is a better model for each?

#### Worked solution

Strategy fits interchangeable rate algorithms. State can fit the workflow because state transitions govern legal actions. For a tiny set of conditions, direct code may still be clearest.

### Exercise 4: Event notifications

A UI object publishes changes to listeners. List lifecycle risks that a simple Observer implementation must address.

#### Worked solution

Listeners must unsubscribe when no longer needed. Define ordering, exception handling, duplicate subscription behavior, synchronous/asynchronous delivery, and whether notifications can be missed. Observer alone does not provide durable delivery.

### Exercise 5: Visitor suitability

A compiler AST gains new node types every sprint but only one stable operation. Is Visitor necessarily a good fit?

#### Worked solution

Probably not: each new node type requires visitor updates, so element churn makes the pattern costly. If operations multiply while node types stabilize, Visitor may become more useful. Use language-native pattern matching or another explicit dispatch approach when it better fits the change direction.

### Exercise 6: Singleton pressure

The team wants a Singleton database service to avoid passing dependencies. What problem does that create, and what alternative preserves one shared instance?

#### Worked solution

Global access hides dependencies, makes tests order-sensitive, and complicates lifetime/concurrency. A composition root or DI container can construct one shared instance and pass its contract explicitly while preserving test substitutions.

## Progressive hints

Name what varies: construction, structure, communication, or algorithm. Then identify client-visible contract, lifecycle, and extension direction. Consider a plain function/composition before introducing a pattern.

## Complete solutions

Each worked solution provides a likely fit and a simpler alternative where relevant. Pattern names do not overrule product constraints or language idioms.

## Tests and edge cases

Test wrapper ordering, subscriber disposal, failed command retries, memento aliasing, singleton concurrency, and behavior when a chain has no handler. Verify the chosen pattern preserves the underlying contract.

## Reflection questions

Which variation justified the pattern? What indirection/lifecycle cost did it add? Could a function or direct composition now express the design more clearly?
