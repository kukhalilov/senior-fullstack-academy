# system design tradeoffs and decision methods — Reference: Monolith vs microservices

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Azure microservices assessment](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/microservices-assessment), [.NET common web application architectures](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures), [Azure microservices architecture](https://learn.microsoft.com/en-us/azure/architecture/microservices/migrate-monolith).

## Scope and version

“Monolith” describes a deployment unit, not necessarily poor internal structure. A modular monolith can enforce clear boundaries in one process/deployment. Microservices split capabilities into independently deployable networked services, each with ownership and operational cost.

## How this group fits the mental model

In a monolith, function calls and one local transaction can cross modules easily; deployment, scaling, and failure boundaries are shared. In microservices, teams can deploy and scale services independently, but each remote call can time out/fail, data transactions cross boundaries, and tracing/security/versioning/operations become distributed-system problems.

## Supplied names explained

- `Monolith vs microservices` — A modular monolith has one deployable application boundary with internal modules; microservices introduce independently deployable network boundaries, ownership and failure isolation alongside contract, operations, latency, and data-consistency costs.

## Cross-item comparison

Service boundaries should follow cohesive business capabilities and data ownership, not code-size targets. Microservices require CI/CD automation, service discovery, telemetry, compatibility practices, resilience, incident ownership, and a way to manage eventual consistency. Splitting too early can freeze an unstable domain model across APIs; a well-factored monolith can later provide extraction seams.

## Examples

An order and inventory module in one application can update both within one database transaction. If split into order and inventory services, a timeout after reservation leaves the caller unsure whether inventory changed; use an idempotency key and a durable workflow/outbox/saga, and design compensation. Scaling the catalog separately may justify a boundary, but verify the shared database or deployment pipeline does not preserve the old coupling.

## Common mistakes

- Equating monolith with a single unstructured codebase.
- Splitting by technical layers or database tables rather than business ownership.
- Assuming microservices make each failure isolated when dependencies are synchronous.
- Ignoring distributed data transactions, deployment automation, tracing, and on-call load.

## Knowledge checks with answers

1. **Can a monolith be modular?** Yes; deployment shape and internal module quality are separate.
2. **What does a service split add to a cross-module call?** Network failure, timeout ambiguity, versioning, and distributed consistency work.
3. **What is a strong reason to split?** A measured need for independent ownership, scaling, isolation, or release cadence with the operational capacity to support it.
