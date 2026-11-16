# modular monolith layered hexagonal clean architecture — Interview questions and reasoning

Sources: [Common web application architectures](https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/common-web-application-architectures), [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture), and [Microsoft architectural principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles).

## Core questions

Explain the boundary model and show dependency direction separately from runtime flow. Relate architecture choices to team change, transaction requirements, testing, and deployment costs.

## Concise interview answers

A modular monolith has one deployable unit with enforced internal module ownership. Layered architecture groups responsibilities. Hexagonal architecture uses core-owned ports and translating adapters. Clean Architecture emphasizes inward source dependencies. They overlap and do not prescribe one project layout.

## Deep follow-up answers

### How can runtime flow point outward while dependencies point inward?

An inner use case calls an interface it owns. An outer infrastructure type implements it. The source reference points from infrastructure to the interface, but runtime dispatch invokes infrastructure. The two graphs answer different questions.

### What makes a modular monolith more than folders?

Explicit APIs, module/data ownership, allowed dependency directions, restricted internals, and automated checks that enforce those rules. Teams also need process ownership for changing shared contracts.

### When choose a modular monolith over microservices?

When one deployment and local transaction boundaries meet current needs while teams still need internal separation. Microservices may help independent deployment, scaling, or ownership, but introduce network failures, distributed data consistency, observability, and operational overhead.

### How much layering is enough?

Each boundary should protect a policy, isolate a real change, define a meaningful contract, or enable a useful test. Remove pass-through layers that add no value while preserving the dependency rules that matter.

## Scenario questions

### Infrastructure change forces domain edits

Move the technology-specific dependency behind a core-owned port if it protects domain policy and there is a real substitution/testing boundary. Translate provider errors/results at the adapter.

### Cross-module reporting needs data

Use an explicit read contract or owned projection and define freshness/consistency. Avoid direct writes or unrestricted table access. A shared database can still have module-owned schema.

### A small CRUD app has no rich domain rules

Do not force elaborate entities/use cases solely to match a diagram. Keep clear contracts and validation, but use proportionate layers; add richer domain modeling when invariant complexity warrants it.

## Tradeoffs and alternatives

More indirection improves isolation only when it shields meaningful changes. DTO translation protects contracts but adds mapping. Strict layers control dependencies but may create pass-through code. A monolith simplifies local calls/transactions; service extraction improves independent deployment at distributed-system cost.

## Common weak answers

- “Clean Architecture means four projects exactly.”
- “Hexagonal has six layers.”
- “Runtime calls must point inward if dependencies point inward.”
- “Microservices are always more scalable.”
- “Interfaces improve testability automatically.”

## Self-check rubric

Can you define ownership, state allowed references, trace one request, distinguish call and compile-time graphs, and justify the cost of every boundary?

## Senior-level signals

Names data ownership and transaction scope, addresses schema access and architecture tests, explains adapter translation/failure behavior, and evaluates service extraction from deployment and team constraints rather than fashion.
