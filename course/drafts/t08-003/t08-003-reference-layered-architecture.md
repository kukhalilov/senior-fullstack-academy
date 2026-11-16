# modular monolith layered hexagonal clean architecture — Reference: Layered application architecture and allowed dependencies

Sources: [Common web application architectures](https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/common-web-application-architectures) and [Presentation-Domain-Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html).

## Scope and version

This lesson describes common application layers and dependency choices. Layer count and project layout are not canonical; the allowed dependency rule matters more than folder names.

## How this group fits the mental model

Layers group responsibilities to control where presentation, application orchestration, domain policy, and external technology live. Translation at each boundary adds code, so use layers where they clarify policy or isolate change.

## Supplied names explained

### Layered architecture

Organizes an application into responsibility bands. Common slices include presentation, application, domain, and infrastructure/data. A layer may be logical rather than a separate project. Define which direction references and calls are permitted.

### Presentation layer

Handles interaction protocols such as HTTP, UI, or CLI: parse input, perform transport-level validation, call application behavior, and map results/errors to the host contract. Keep business invariants out of transport-specific controllers where they need consistent enforcement.

### Application layer

Coordinates use cases, transaction boundaries, authorization checks that require application context, and collaboration among domain objects and ports. It should orchestrate rather than duplicate domain rules. Not every simple app needs a thick layer.

### Domain layer

Contains business concepts, invariants, and domain policy expressed without unnecessary framework/transport details. Some CRUD systems have modest domain behavior; forcing rich domain abstractions into them can add ceremony.

### Infrastructure layer

Implements external capabilities such as storage, messaging, file systems, and provider integrations. It translates between core contracts and technology-specific APIs. Keep secrets, network retry policy, and persistence concerns at the appropriate boundary.

### Presentation-Domain-Data layering

A common three-part organization: presentation owns user interaction, domain owns business rules, and data access owns persistence. Real applications may add application services or infrastructure. The model is descriptive, not a universal project template.

### Strict layering

Each layer may call only the immediately lower layer; a request passes through each. This protects separation but can create pass-through methods and redundant models if layers add no policy.

### Relaxed layering

A layer may call a lower layer while bypassing intermediate layers when appropriate. This reduces indirection but can allow presentation or policy to depend on infrastructure in ways that undermine isolation. Define exceptions explicitly.

### Layer dependency direction

The rule for source references among layers. Traditional layering often points presentation→domain/application→data, while Clean/hexagonal variants invert compile-time dependencies so infrastructure implements core-owned ports. State whether the diagram shows references or runtime calls.

### Cross-layer data transfer object

A value shape used to carry data across a layer boundary. DTOs prevent transport/persistence models from becoming accidental domain contracts, but mapping creates maintenance work. Reuse a DTO only when its ownership and semantics truly match both boundaries.

### Layer leakage

One layer exposes its technology/policy details into another, such as ORM tracking entities returned directly through an HTTP API. Leakage couples clients to implementation and can cause security or serialization surprises.

### Anemic domain layer

Domain entities mostly hold data while business behavior is centralized in services. This can make invariants hard to keep together in a behavior-rich domain; it may be adequate for simple data-centric CRUD. Evaluate actual rule complexity rather than treating the label as an automatic defect.

## Cross-item comparison

Strict layering strengthens the call path but may create pass-through code. Relaxed layering improves direct access but needs explicit controls. DTOs can prevent leakage, yet too many nearly identical transfer types become friction; model them at actual contract boundaries.

## Examples

An HTTP endpoint validates request shape and maps to an application command. Domain policy checks whether an order can be canceled. An infrastructure repository persists it. Returning the ORM model directly may leak internal columns and tracking behavior; a response DTO can define the external contract.

## Common mistakes

- Creating one project per layer without enforcing dependency rules.
- Putting business invariants in controllers because they are easy to access.
- Adding pass-through layers with no coordination or protection role.
- Treating every anemic model as wrong regardless of domain complexity.
- Confusing dependency direction with runtime call sequence.

## Knowledge checks with answers

1. **What does strict layering enforce?** Calls pass through adjacent layers.
2. **What does a DTO protect?** A boundary contract from unrelated internal model changes.
3. **Is an anemic domain always a defect?** No; assess rule complexity and invariant ownership.

### Exact terms covered

- `Layered architecture`
- `Presentation layer`
- `Application layer`
- `Domain layer`
- `Infrastructure layer`
- `Presentation-Domain-Data layering`
- `Strict layering`
- `Relaxed layering`
- `Layer dependency direction`
- `Cross-layer data transfer object`
- `Layer leakage`
- `Anemic domain layer`

### Exact terms covered

- `Layered architecture`
- `Presentation layer`
- `Application layer`
- `Domain layer`
- `Infrastructure layer`
- `Presentation-Domain-Data layering`
- `Strict layering`
- `Relaxed layering`
- `Layer dependency direction`
- `Cross-layer data transfer object`
- `Layer leakage`
- `Anemic domain layer`
