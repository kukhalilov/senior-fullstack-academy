# creational structural and behavioral design patterns — Core concepts and how they fit together

Sources: [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.oreilly.com/library/view/design-patterns-elements/0201633612/), [Hillside Group book page](https://www.hillside.net/elements-of-reusable-object-oriented-software-book), and [design pattern catalog](https://refactoring.guru/design-patterns/catalog).

## Learning objectives

Recognize the intent of the canonical pattern categories; distinguish pattern intent from implementation form; compare similar patterns; and justify when a direct solution is clearer.

## Prerequisites

Know interfaces, composition, object lifetime, callbacks, and basic object-oriented design. Language features may implement a pattern without reproducing its original class diagram.

## Core concepts

A pattern describes a recurring context, problem/force, solution roles, and consequences. **Creational patterns** control object creation or families of products. **Structural patterns** relate objects/classes into larger structures. **Behavioral patterns** assign communication and algorithm responsibilities. A named pattern is useful only when the reader can explain the underlying problem and resulting tradeoff.

Factory Method delegates creation to a subclass or overridable operation; Abstract Factory creates compatible families; Builder separates stepwise construction from representation; Prototype creates by copying a configured exemplar; Singleton restricts a class to one accessible instance and introduces global access/lifetime risks.

Adapter translates an existing contract to one a client expects; Bridge separates two dimensions that vary; Composite lets clients treat leaf and aggregate structures uniformly; Decorator adds behavior by wrapping; Facade offers a simpler subsystem entry point; Flyweight shares intrinsic state to reduce large numbers of similar objects; Proxy controls access to another object or resource.

Chain of Responsibility forwards a request through potential handlers; Command packages a request as an object/value; Iterator traverses a collection without exposing its representation; Mediator centralizes coordination among peers; Memento stores a snapshot while limiting exposure of internal state. Interpreter represents and evaluates a small grammar; Observer distributes change notifications; State changes behavior according to an internal state; Strategy selects a behavior/algorithm; Template Method fixes an algorithm skeleton and leaves steps customizable; Visitor adds operations across a stable element structure.

Patterns can overlap in implementation but differ in intent. A wrapper may adapt a contract, decorate behavior, act as a proxy, or simplify a subsystem; determine which responsibility it provides. Strategy selects interchangeable behavior, while State models transitions and behavior associated with an object’s current state. Observer broadcasts notifications; Mediator coordinates interactions through a central object.

## Mechanisms and relationships

```text
creation variation → creational pattern
object relationships → structural pattern
communication / algorithm variation → behavioral pattern
pattern intent + context + consequences → choose or reject
```

Modern functions, modules, records, generics, and dependency injection may make a simpler implementation possible. The structural intent remains a useful discussion tool even if the original implementation diagram is unnecessary.

## Worked examples

If a library expects `IClock` but an existing vendor object exposes `ReadTime()`, an Adapter translates the contract. If the application instead wants to add retrying around an otherwise compatible `IClock`, Decorator adds behavior. If it needs to restrict access or lazily create a remote object, Proxy may fit. Identical wrappers can serve different patterns because intent differs.

## Misconceptions and edge cases

- Pattern names are not required class names or mandatory abstractions.
- Singleton does not automatically make shared mutable state safe.
- A factory is not automatically one of the GoF patterns; identify its creation role.
- Design patterns do not replace domain modeling or concurrency guarantees.
- Visitor is most useful when element types are stable and operations vary; frequent element changes can make it costly.

## Knowledge checks with answers

1. **What defines a pattern?** Context, recurring problem/forces, solution roles, and consequences.
2. **How distinguish Adapter and Decorator?** Contract translation versus behavior addition.
3. **Why can Singleton be risky?** It adds global access and lifecycle/shared-state coupling.
4. **What should come before a pattern?** The concrete design force and the simplest adequate solution.
