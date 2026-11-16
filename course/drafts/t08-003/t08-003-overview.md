# modular monolith layered hexagonal clean architecture — Big-picture orientation and mental model

Sources: [Common web application architectures](https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/common-web-application-architectures), [Presentation-Domain-Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html), [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture), and [Microsoft architectural principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles).

## Problem and purpose

Application architecture organizes responsibilities and dependencies so business policy can change without accidental reliance on transport, persistence, or framework details. Architecture names describe overlapping boundary models, not mandatory project templates or deployment products.

## Plain-language mental model

Keep related rules together, expose narrow contracts, and make dependencies point toward the policy they serve. A modular monolith can enforce these rules inside one deployable program. Layers separate broad responsibilities; ports/adapters isolate an application core from outside actors; Clean Architecture emphasizes inward source dependencies.

## How the parts fit together

```text
HTTP/UI adapter → application use case → domain policy
                         ↓ outbound port
                  database/message adapter
single deployable process; explicit module APIs and ownership
```

Compile-time references, runtime calls, and deployment boundaries are different things. A use case may call an interface implemented by an outer infrastructure adapter: runtime control flows outward, while source dependencies still point inward to the interface.

## Concept map

Layered architecture organizes code by presentation/application/domain/infrastructure concerns. Hexagonal architecture describes a core with inbound and outbound ports and adapters. Clean Architecture provides a related dependency rule with policy near the center. A modular monolith enforces domain/module boundaries while retaining one deployable unit and often one operational database.

## End-to-end walkthrough

An order request arrives through an HTTP adapter. The application use case validates the command and invokes domain rules. It depends on an outbound repository port; a database adapter implements that port. The module owns its schema and exports a narrow API. Architecture tests can prevent another module from reading its tables directly. All components deploy together, so the team avoids network failure and distributed transaction concerns unless future scale or ownership requires them.

## When to use it and tradeoffs

Use clear internal boundaries when policies need independent tests, ownership, or eventual replacement. A modular monolith often keeps transactions and operations simple. Layers/interfaces add translation and navigation cost; do not create empty projects or ports with only one trivial caller without a meaningful seam. Microservices introduce independent deployment but also network, observability, data consistency, and failure costs.

## What later lessons cover

References distinguish modular monolith, layered responsibilities, ports/adapters roles, and Clean Architecture dependency/data boundaries. Practice maps a request across compile-time and runtime flows and tests module isolation.

## Version notes

These architecture styles are timeless concepts, not versioned framework APIs. Project layout should fit the team, runtime, and framework while preserving the chosen dependency rules.
