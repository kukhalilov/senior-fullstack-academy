# creational structural and behavioral design patterns — Reference: Behavioral patterns: observation, state, algorithms, language, and templates

Sources: [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.oreilly.com/library/view/design-patterns-elements/0201633612/) and [design pattern catalog](https://refactoring.guru/design-patterns/catalog).

## Scope and version

This lesson covers six GoF behavioral patterns for grammar evaluation, notifications, state-dependent behavior, algorithm selection, algorithm skeletons, and operations over element structures.

## How this group fits the mental model

Each pattern changes where behavior lives or how it is selected. Choose based on what varies, who owns transitions, and whether adding another dimension should be easy.

## Supplied names explained

### Interpreter

Represents a grammar and its interpretation, commonly as a tree of expressions. It can suit small, stable domain-specific languages. For complex grammars, parser generators or dedicated language tooling may be more manageable.

### Observer

Defines a one-to-many notification relationship: a subject notifies subscribers when its state changes. Subscription lifetime, duplicate delivery, ordering, exceptions, and memory leaks from forgotten unsubscription must be addressed. It does not inherently mean asynchronous messaging.

### State

Encapsulates behavior that changes with an object’s internal state and can make transitions explicit. It helps when conditionals over state become difficult to maintain. It may be excessive for a small finite conditional whose transitions are simple.

### Strategy

Encapsulates interchangeable algorithms behind a common contract so a client can select one. It is useful when algorithm choice varies independently of the context. A function or delegate may express it more simply than a class hierarchy.

### Template Method

Defines a stable algorithm skeleton in a base type while allowing selected steps to vary. It uses inheritance and can constrain extension; composition/Strategy may be preferable when step combinations vary independently.

### Visitor

Adds operations over elements of a stable object structure by dispatching behavior to element types. It makes adding operations easier but adding new element types harder because visitors must account for them. It is best when the element set is relatively stable.

## Cross-item comparison

Strategy selects an algorithm supplied from outside; State associates behavior with current state and transitions. Observer notifies many dependents; Mediator coordinates interactions centrally. Template Method fixes an inherited skeleton; Strategy composes a replaceable algorithm. Visitor adds operations over a stable element set; Interpreter evaluates grammar expressions.

## Examples

Use Strategy to select a tax calculation policy by jurisdiction. Use State for a workflow whose permitted actions depend on Draft, Approved, or Closed transitions. A small observer can notify UI listeners, but subscriptions should be cleaned up. Choose Visitor for adding operations to a stable AST node set, not when new node kinds arrive frequently.

## Common mistakes

- Treating Observer as a durable message broker.
- Using Strategy for a state machine with meaningful transitions and invariants.
- Extending a Template Method hierarchy until subclasses violate the skeleton.
- Choosing Visitor when element types change weekly.
- Building an Interpreter for a language that needs a full parser/type system.

## Knowledge checks with answers

1. **State versus Strategy?** Internal lifecycle transitions versus interchangeable algorithms.
2. **What is Visitor’s tradeoff?** Easier new operations, harder new element types.
3. **What does Observer require operationally?** Correct subscription lifecycle and delivery semantics.

### Exact terms covered

- `Interpreter`
- `Observer`
- `State`
- `Strategy`
- `Template Method`
- `Visitor`

### Exact terms covered

- `Interpreter`
- `Observer`
- `State`
- `Strategy`
- `Template Method`
- `Visitor`
