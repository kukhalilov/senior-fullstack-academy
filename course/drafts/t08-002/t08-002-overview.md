# creational structural and behavioral design patterns — Big-picture orientation and mental model

Sources: [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.oreilly.com/library/view/design-patterns-elements/0201633612/), [Hillside Group book page](https://www.hillside.net/elements-of-reusable-object-oriented-software-book), and [design pattern catalog](https://refactoring.guru/design-patterns/catalog).

## Problem and purpose

Design patterns give names to recurring design problems and solution shapes. A name lets a team discuss roles and tradeoffs without rediscovering every idea, but it does not mean every application should contain a class named after that pattern.

## Plain-language mental model

Ask what varies, who creates or coordinates an object, and which dependency or communication constraint is painful. Then choose the smallest design that addresses that force. A pattern is a vocabulary for a relationship, not a recipe to copy blindly.

## How the parts fit together

```text
recurring force in a design
  → identify roles and relationships
  → choose a pattern that fits the force
  → implement with suitable language features
  → evaluate added indirection, lifetime, and complexity
```

Creational patterns organize object creation. Structural patterns compose objects or classes into larger structures. Behavioral patterns organize communication, responsibility, and algorithms. The Gang of Four catalog contains 23 patterns in these categories; other catalogs cover enterprise, concurrency, and integration concerns.

## Concept map

Factory Method, Abstract Factory, Builder, Prototype, and Singleton concern creation. Adapter, Bridge, Composite, Decorator, Facade, Flyweight, and Proxy concern structure. The behavioral group covers responsibility chains, commands, iteration, mediation, snapshots, interpretation, observation, state transitions, algorithm selection, templates, and operations over structures.

## End-to-end walkthrough

A reporting system supports several file formats. If each format needs a different family of compatible writer and schema objects, Abstract Factory may make that family selection explicit. If only one object varies, a simple factory function can suffice. If the report has many optional construction steps, Builder may improve readability. Measure the complexity of creation and expected change rather than applying all three patterns.

## When to use it and tradeoffs

Patterns help when the problem matches their forces and their roles clarify ownership. They can add types, indirection, lifecycle constraints, and abstraction vocabulary. A function, closure, discriminated union, or direct composition may express the same idea more simply. Refactor away ceremony when the variation disappears.

## What later lessons cover

Reference lessons explain the 23 canonical GoF patterns in their frozen categories. Practice compares neighboring patterns and chooses a minimal implementation. Interview lessons focus on intent, distinction, and tradeoffs.

## Version notes

The catalog is the classic 23-pattern GoF set, including Interpreter. Modern language features may replace older implementation mechanics while leaving the design problem relevant.
