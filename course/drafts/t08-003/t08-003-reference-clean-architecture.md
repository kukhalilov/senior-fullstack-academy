# modular monolith layered hexagonal clean architecture — Reference: Clean Architecture dependency rules and boundary crossings

Sources: [Microsoft architectural principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles) and [Common web application architectures](https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/common-web-application-architectures).

## Scope and version

This lesson covers policy-centered boundaries and dependency direction. It does not mandate a fixed number of projects or reproduce any one canonical folder structure.

## How this group fits the mental model

Keep enterprise/application policy independent of frameworks and delivery mechanisms. Outer components depend on inner contracts; runtime execution can still travel from a use case to an outer implementation through an interface.

## Supplied names explained

### Clean Architecture

A family of architecture diagrams that organizes policy near the center and outer mechanisms at the edge. Names and exact rings vary, but the key idea is inward source dependencies and explicit boundary crossings.

### Entities (enterprise business rules)

Core domain rules/invariants that apply across application use cases. In a simpler domain they may be ordinary objects and functions; the term does not demand elaborate entity classes.

### Use cases (application business rules)

Application-specific orchestration of a user or system goal. A use case coordinates entities and boundary contracts, controls transaction/application flow, and returns an application result. It should not depend on web framework types.

### Interface adapters

Translate between outer formats and inner use-case/domain structures. Controllers, presenters, and gateways may perform this role. Translation is a deliberate boundary cost that helps keep contracts from leaking across layers.

### Frameworks and drivers

Outer tools and mechanisms such as web frameworks, databases, user interfaces, and external services. They are replaceable details in principle, but replacement is not free; isolate them where change or testability makes the seam worthwhile.

### Dependency Rule

Source-code dependencies should point toward inner policy. An inner module must not import an outer framework implementation. Outer code can implement an inner-owned interface. This is about source/reference direction, not necessarily runtime invocation direction.

### Source-code dependency direction

The compile-time reference graph between modules. For example, infrastructure may reference an application contract assembly while the application does not reference infrastructure. Keeping this direction acyclic helps isolate build-time coupling.

### Runtime control flow

The sequence of calls when the program runs. A use case may invoke an inner interface that dispatches to an outer database implementation, so runtime control flows outward while the compile-time dependency remains inward. Diagrams should label which graph they depict.

### Boundary crossing

Moving a request/result or control across a layer boundary. Define mapping, error semantics, transaction ownership, and serialization at crossings. Avoid passing raw framework/database objects into inner policy.

### Boundary data structure

A DTO/value shape chosen for a particular crossing. It should carry only needed information and remain owned by the appropriate contract. Reusing a persistence entity as an HTTP contract may leak fields and couple independent change.

### Dependency inversion across a boundary

The inner policy declares the abstraction it needs; an outer implementation conforms to it. A composition root connects them. The abstraction is useful when it protects policy or a real seam, not simply because every call must have an interface.

### Composition root

The outermost place where application components and concrete implementations are assembled, often during startup. It knows concrete types and wiring; inner policy does not. Keep object graph construction separate from use-case behavior.

## Cross-item comparison

Source dependencies point inward according to the Dependency Rule. Runtime control can point outward through dynamic dispatch. Boundary DTOs manage data shape; the composition root handles concrete wiring. These roles should not be collapsed into one generic “service layer.”

## Examples

An application use case depends on an `IClock` and `IOrderRepository` contract. Infrastructure implements them. Startup configures concrete implementations. The use case returns an application result; an HTTP adapter maps it to status and JSON. Neither inner component imports the web framework or database library.

## Common mistakes

- Making every dependency an interface despite no meaningful isolation need.
- Confusing runtime call direction with source-code reference direction.
- Letting DTOs accumulate persistence fields or framework annotations.
- Putting use-case business flow in the composition root.
- Treating “frameworks are details” as proof that replacing one is trivial.

## Knowledge checks with answers

1. **What does the Dependency Rule control?** Compile-time/source-code references.
2. **Can runtime flow point toward an outer implementation?** Yes, through an inner-owned abstraction.
3. **What belongs in the composition root?** Wiring concrete implementations and the application object graph.

### Exact terms covered

- `Clean Architecture`
- `Entities (enterprise business rules)`
- `Use cases (application business rules)`
- `Interface adapters`
- `Frameworks and drivers`
- `Dependency Rule`
- `Source-code dependency direction`
- `Runtime control flow`
- `Boundary crossing`
- `Boundary data structure`
- `Dependency inversion across a boundary`
- `Composition root`

### Exact terms covered

- `Clean Architecture`
- `Entities (enterprise business rules)`
- `Use cases (application business rules)`
- `Interface adapters`
- `Frameworks and drivers`
- `Dependency Rule`
- `Source-code dependency direction`
- `Runtime control flow`
- `Boundary crossing`
- `Boundary data structure`
- `Dependency inversion across a boundary`
- `Composition root`
