# architecture patterns multi-region tenancy and reliability — Reference: Clean Architecture

Sources: [HLD Handbook](https://hld.handbook.academy/), [Microsoft architecture styles](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/), [Microsoft CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs), [Martin Fowler on Dependency Injection](https://martinfowler.com/articles/injection.html).

## Scope and version

Clean Architecture is a family of dependency-direction ideas, not one mandated folder tree or framework. This lesson focuses on the dependency rule and practical boundaries; names for rings, layers, and use cases vary among implementations.

## How this group fits the mental model

The central problem is change: business rules should remain understandable and testable when a web framework, database, cloud provider, or user interface changes. Clean Architecture keeps policy and use-case decisions inward, with outer delivery and infrastructure code depending on those inner contracts. The key constraint is source-code dependency direction: inner policy must not import concrete outer mechanisms. At runtime, an inner use case may call an interface implemented outside; dependency injection supplies that implementation.

This direction is not a demand to hide every line of code behind an interface. Add a boundary when it protects an important decision, makes a volatile dependency replaceable, or enables a useful test. Extra indirection has a cost in navigation, mapping, and duplicated abstractions.

## Supplied names explained

- **Clean Architecture** — An approach that places domain policy and application use cases at the center, surrounded by adapters and external mechanisms. Dependencies point toward inner policy; concrete frameworks and persistence are replaceable details behind boundaries.

### A practical shape

- **Domain policy** contains concepts and invariants that can be expressed without HTTP or database types. It should not know about a specific ORM, controller, React component, or cloud SDK.
- **Application/use-case code** coordinates a single application action: validates its command, invokes domain behavior, calls ports such as repository or payment interfaces, and returns an application result. It defines transaction and authorization expectations explicitly.
- **Adapters** translate external inputs and outputs: HTTP request to command, persistence rows to domain representations, or use-case results to API responses.
- **Infrastructure/frameworks** provide concrete database, message broker, filesystem, identity-provider, telemetry, and web-host mechanisms.

Dependency inversion means the use case owns a needed interface such as `OrderRepository`; an outer adapter implements it. The interface should express the use case’s need rather than copy an entire database API. A test can supply an in-memory fake, but integration tests must still verify that the real adapter honors transaction and query semantics.

## Cross-item comparison

| Approach | Emphasis | Shared idea | Practical distinction |
|---|---|---|---|
| Clean Architecture | Policy/use cases surrounded by adapters and mechanisms | Dependencies point inward toward stable policy | Commonly names use-case/interactor and adapter boundaries |
| Onion Architecture | Domain model at center, surrounding application/services and infrastructure | Outer code depends inward; domain avoids infrastructure dependency | Often depicts concentric layers with domain model as core |
| Hexagonal/Ports and Adapters | Application core exposes ports; adapters connect technologies | External mechanisms are replaceable through contracts | Uses “port” language to emphasize inside/outside interaction |
| Layered architecture | Responsibilities grouped by technical or logical layers | Separation can improve local reasoning | A layer can still depend downward on concrete lower layers; dependency rule is not guaranteed |

These are related architectural styles, not interchangeable checklists. A project can combine their ideas. Keep the design aligned with actual change boundaries and avoid duplicating the same separation in several sets of nearly identical folders.

## Examples

**Place an order.** The HTTP adapter authenticates the caller, parses the request, and maps it to `PlaceOrder`. The use case obtains current price/stock through explicit ports, applies order policy, persists the order and an outbox record in the appropriate transaction, and returns an application result. The web adapter maps that result to HTTP status and response. The domain model need not know about HTTP status codes or EF Core entities.

**Test selection.** Unit-test pure policy and use-case decision paths with deterministic fakes. Test database mapping, locking, isolation, and transaction boundaries against the actual database adapter. Test the HTTP contract and authentication at the API boundary. A passing fake-based test cannot prove the production database’s concurrency semantics.

## Common mistakes

- Treating a specific number of rings, projects, or interfaces as the definition of the style.
- Letting domain/application code import framework or persistence types, then relying on folder names to claim dependency inversion.
- Creating generic repository abstractions that expose ORM internals or cannot express important queries/transaction requirements.
- Building interfaces for every class without a real boundary or substitution need.
- Mapping the same data through many nearly identical DTO/domain/entity forms without protecting meaningful invariants.
- Believing in-memory tests prove database constraints, isolation, retries, or performance behavior.
- Moving all logic into a “domain” layer even when the rules belong to an application workflow or external system.

## Knowledge checks with answers

1. **Which way do source dependencies point?** Toward inner policy and use cases; outer adapters implement the interfaces those inner parts define.
2. **Can an inner use case invoke a database at runtime?** Yes, through an inward-owned port whose concrete outer adapter is injected; the inner source does not depend on the specific database library.
3. **Should every class have an interface?** No. Use a boundary where it protects policy, isolates a volatile mechanism, or enables a useful test.
4. **Why test a real database adapter if use-case unit tests pass?** Fakes cannot establish actual mapping, constraint, transaction, isolation, and concurrency behavior.
