# creational structural and behavioral design patterns — Interview questions and reasoning

Sources: [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.oreilly.com/library/view/design-patterns-elements/0201633612/) and [design pattern catalog](https://refactoring.guru/design-patterns/catalog).

## Core questions

Explain pattern intent, forces, roles, and consequences. Be able to compare neighboring patterns and describe when not to use a pattern.

## Concise interview answers

Creational patterns organize object construction; structural patterns organize relationships; behavioral patterns organize interaction and algorithms. A pattern is a named tradeoff for a recurring problem, not a required code template.

## Deep follow-up answers

### Compare Factory Method, Abstract Factory, and Builder.

Factory Method varies a product creation operation, often through specialization. Abstract Factory creates a compatible product family. Builder controls multi-step construction. If creation is simple, a constructor or factory function may be clearer.

### Compare Adapter, Decorator, and Proxy.

Adapter translates an interface. Decorator preserves a compatible interface while adding behavior. Proxy controls access or lifecycle to a subject. Their implementation may all delegate, but their intent and guarantees differ.

### How do you decide whether to use a pattern?

Describe the concrete variation or dependency problem and compare the pattern’s indirection with a direct solution. Use it when its roles clarify change, testability, or ownership. Reconsider it when the variation disappears or the abstraction becomes harder to follow than the original logic.

### Why is Singleton controversial?

It combines instance cardinality and global access. Global access hides dependencies, complicates tests and lifecycle, and may create mutable shared-state races. A composition root can provide a shared lifetime without global lookup.

## Scenario questions

### Third-party API changes without changing business policy

Place an Adapter at the integration boundary and keep provider-specific types from leaking into core policy. Contract tests should verify mapping and failure behavior.

### Too many classes for one algorithm choice

Consider a Strategy represented as a function/delegate or a direct conditional if it is simpler. Pattern vocabulary describes the design intent; it does not mandate class-per-role implementation.

### Many listeners miss state changes

Clarify Observer delivery and lifetime requirements. If durability, replay, or cross-process delivery is needed, an in-memory Observer may be insufficient and a messaging system belongs to a separate architecture discussion.

## Tradeoffs and alternatives

Patterns add named structure and indirection that can aid extension, isolation, and communication. They can also obscure control flow and inflate object graphs. Language-native functions, pattern matching, modules, or dependency composition may implement the same idea more directly.

## Common weak answers

- Listing pattern definitions without identifying their problem.
- Saying “always use composition” or “never use Singleton.”
- Confusing a wrapper’s syntax with its pattern intent.
- Claiming Observer guarantees persistence or exactly-once delivery.
- Applying patterns solely to satisfy a coding style guide.

## Self-check rubric

Can you state the forces, pattern roles, alternatives, lifecycle implications, and one reason to reject the pattern? Can you compare the same structure by intent?

## Senior-level signals

Connects pattern selection to change direction, contracts, object lifetime, failure and retry semantics, testability, and the cost of abstraction.
