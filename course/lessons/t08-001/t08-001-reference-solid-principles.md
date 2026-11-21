# SOLID cohesion coupling DRY KISS YAGNI — Reference: The five SOLID principles and related design principles

Sources: [Microsoft architectural principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles) and [SOLID principles in C#](https://learn.microsoft.com/en-us/archive/msdn-magazine/2014/may/csharp-best-practices-dangers-of-violating-solid-principles-in-csharp).

## Scope and version

The lesson covers the five SOLID principles and two closely related boundary ideas in the supplied list. They are object-oriented design heuristics, not compiler rules or measurable laws.

## How this group fits the mental model

SOLID suggests where responsibility and dependency boundaries can protect policy from unrelated change. Apply a principle where a real change or correctness risk exists; adding abstraction without that evidence can reduce clarity.

## Supplied names explained

### Single Responsibility Principle (SRP)

A module should have one coherent responsibility, often described as one reason to change. Think in terms of policy and stakeholder, not raw method count. If authentication policy, email formatting, and invoice persistence change for different reasons, they may belong in separate collaborators. Excessive slicing can make a simple feature impossible to follow, so keep cohesive behavior together.

### Open-Closed Principle (OCP)

Software entities should accommodate useful extension without repeatedly modifying stable core behavior. A strategy interface, registry, or policy object can isolate a demonstrated variation point. OCP does not require speculative extension hooks for every hypothetical feature; ordinary code changes are still expected when requirements change.

### Liskov Substitution Principle (LSP)

Subtypes or implementations should be usable wherever the abstraction is expected, preserving its behavioral contract. A subtype that throws for ordinary base operations, strengthens preconditions, weakens postconditions, or violates invariants surprises clients. Prefer a smaller honest contract or composition when substitutability does not hold.

### Interface Segregation Principle (ISP)

Clients should not be forced to depend on operations they do not use. Split a large contract along coherent client needs when changes to unrelated operations cause coupling. Do not create a separate interface for every single method without a reason; contract boundaries should make usage clearer.

### Dependency Inversion Principle (DIP)

High-level policy should not depend directly on low-level implementation details; both should depend on abstractions that express the policy-facing contract. The abstraction should usually be owned by the policy/client that needs the capability. This is distinct from dependency injection, which supplies dependencies at runtime or construction time.

### Separation of concerns

Keep distinct responsibilities or policies separable so they can be understood and changed without accidental cross-effects. A concern may be represented by a module, layer, function, or explicit policy object; it does not always require a class or service.

### Composition over inheritance

Prefer assembling behavior from collaborators when inheritance would couple a subtype to base implementation details or force an invalid “is-a” relationship. Inheritance remains appropriate for genuine behavioral subtyping with a stable contract. Composition can improve flexibility but may also introduce delegation boilerplate.

## Cross-item comparison

SRP focuses on reasons to change; ISP focuses on what a client must know; DIP focuses on dependency direction. OCP concerns extension points, while LSP protects behavior at those points. Composition can implement extension without creating a subtype hierarchy.

## Examples

An order policy depends on an `ITaxPolicy` contract owned by the order domain. Infrastructure supplies the provider. A consumer that only needs tax calculation does not depend on persistence methods. A second tax rule can be added behind the contract when it is a real requirement, while tests use a deterministic implementation.

## Common mistakes

- Creating abstractions for imagined future plugins.
- Treating dependency injection as automatic DIP compliance.
- Using inheritance where subclasses cannot honor all base behavior.
- Splitting cohesive methods so widely that navigation becomes harder.
- Claiming OCP means existing code is never modified.

## Knowledge checks with answers

1. **What is an SRP signal?** Independent stakeholders or policies cause unrelated reasons to change.
2. **What does LSP protect?** Client assumptions about behavioral contracts.
3. **How does ISP help?** It keeps clients from depending on unrelated operations.

### Exact terms covered

- `Single Responsibility Principle (SRP)`
- `Open-Closed Principle (OCP)`
- `Liskov Substitution Principle (LSP)`
- `Interface Segregation Principle (ISP)`
- `Dependency Inversion Principle (DIP)`
- `Separation of concerns`
- `Composition over inheritance`

### Exact terms covered

- `Single Responsibility Principle (SRP)`
- `Open-Closed Principle (OCP)`
- `Liskov Substitution Principle (LSP)`
- `Interface Segregation Principle (ISP)`
- `Dependency Inversion Principle (DIP)`
- `Separation of concerns`
- `Composition over inheritance`
