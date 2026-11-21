# modular monolith layered hexagonal clean architecture — Core concepts and how they fit together

Sources: [Common web application architectures](https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/common-web-application-architectures), [Presentation-Domain-Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html), [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture), and [Microsoft architectural principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles).

## Learning objectives

Compare layered, hexagonal, and clean boundary models; design internal module ownership; distinguish source dependencies from runtime calls; and recognize when architecture indirection has no value.

## Prerequisites

Know modules, interfaces, dependency direction, transactions, and application design principles. Framework-specific registration and deployment mechanics are covered elsewhere.

## Core concepts

A **modular monolith** is one deployable application with explicit internal boundaries. Modules own behavior and ideally their data, expose APIs, and interact in-process. Shared infrastructure may exist, but unrestricted access to internals or tables turns the design into a big-ball-of-mud monolith. Boundary tests can enforce dependencies.

**Layered architecture** separates presentation, application, domain, and infrastructure concerns. Strict layering requires calls through each adjacent layer; relaxed layering permits some layers to call lower layers directly. The critical choice is the dependency rule and what data crosses. Layer leakage occurs when infrastructure/UI concepts enter domain policy or layers bypass the intended boundary. An anemic domain layer holds little behavior while rules accumulate elsewhere; it is a modeling risk, not automatically a defect for simple CRUD domains.

**Hexagonal Architecture** (Ports and Adapters) places an application core behind ports. Primary/driving actors initiate behavior through inbound ports; primary adapters translate HTTP, CLI, or UI inputs. The core calls outbound ports for secondary/driven capabilities such as storage; secondary adapters implement those ports. A port describes a protocol/capability at the boundary; adapters translate technology-specific details. “Hexagonal” does not require six layers or interfaces.

**Clean Architecture** organizes entities, use cases, interface adapters, and frameworks/drivers around policy. Its Dependency Rule says source-code dependencies point inward: outer details depend on inner policy contracts, not vice versa. Runtime control flow can point outward across an interface implemented by an outer layer. Boundary crossing maps between inner data structures and transport/database formats; keep those structures appropriate to the boundary rather than passing framework objects into core policy. A composition root wires implementations at startup.

These models overlap. Layered describes responsibility slices; hexagonal emphasizes actors and ports; Clean emphasizes inward dependency direction. A system can use all three ideas. None prescribes a single project count or folder layout.

## Mechanisms and relationships

```text
request → primary adapter → inbound port/use case → domain policy
                                      ↓ outbound port
                               secondary adapter → database
source dependency: adapter → core-owned port
runtime call: use case → port implementation
```

## Worked examples

An HTTP endpoint maps JSON into an application command, calls a use case, and maps a result to an HTTP response. The use case depends on `IOrderStore` owned by the application/domain boundary. Infrastructure implements it with SQL. The endpoint does not return an ORM entity, and domain code does not depend on HTTP status types.

## Misconceptions and edge cases

- Hexagonal does not mean six technical layers.
- Clean Architecture’s runtime call direction need not match compile-time references.
- A monolith can be modular; a multi-project solution is not automatically modular.
- A database shared by modules does not justify unrestricted cross-module queries.
- Every small app does not need a domain layer full of abstractions.
- In-process module calls avoid network failures but still need contract and ownership discipline.

## Knowledge checks with answers

1. **What makes a monolith modular?** Enforced internal boundaries and ownership, not deployment count alone.
2. **Who owns an outbound port?** The core policy that needs the capability.
3. **What does the Clean Architecture dependency rule govern?** Source-code dependency direction.
4. **Can runtime control flow point outward?** Yes, across an inner-owned interface implemented externally.
