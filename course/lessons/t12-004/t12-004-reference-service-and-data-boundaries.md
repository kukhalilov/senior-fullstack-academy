# architecture patterns multi-region tenancy and reliability — Reference: Application and integration patterns

Sources: [HLD Handbook](https://hld.handbook.academy/), [Azure Architecture Center: architecture styles](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/), [Azure CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs), [Azure event-driven architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven), [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [AWS saga pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/saga-pattern.html), [AWS saga variants](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-patterns.html), [AWS strangler fig pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html), [Microsoft DDD tactical design](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd), [Microsoft BFF pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends).

## Scope and version

This reference explains the supplied application and integration patterns as architecture choices, not product APIs. A pattern is a reusable response to a recurring pressure; it is not a requirement that every application adopt it. Exact implementation details vary by runtime, database, broker, framework, and cloud. The named scope is: modular monolith, microservices, hexagonal architecture, Domain-Driven Design bounded context, event-driven architecture, CQRS, saga, Strangler Fig, multi-tenant architecture, and backend for frontend (BFF).

## How this group fits the mental model

These patterns answer different questions. **Where should code and ownership boundaries go?** Modular monolith, microservices, bounded context, and hexagonal architecture. **How should work or data cross a boundary?** Events, CQRS, and sagas. **How should an existing system change safely?** Strangler Fig. **How are customers isolated?** Multi-tenancy. **How should an API fit a particular client?** BFF.

Start by drawing the simplest correct request and identifying who owns the business rule and authoritative data. Add a pattern only when it resolves a stated problem. Combining patterns can be useful, but each adds a separate obligation: event delivery and schema evolution, read-model freshness, saga recovery, tenant isolation, or BFF authorization and deployment.

## Supplied names explained

- **Modular monolith** — One deployable application with explicit internal modules, interfaces, and ownership. In-process calls avoid network failure and a shared relational database can support local transactions. The modules must still protect boundaries: unrestricted cross-module table access and shared domain models create coupling even though everything ships together. This is often a strong starting point when independent deployment is not yet a proven requirement.
- **Microservices** — Independently deployable services aligned to capabilities and responsible for their own data. They can enable independent releases, scaling, and fault/security boundaries, but add network timeouts, partial success, distributed observability, contract compatibility, and on-call overhead. “One database per service” means ownership and access boundaries; it does not necessarily require one physical database server per service.
- **Hexagonal architecture (ports and adapters)** — Organizes application/domain behavior behind ports that describe required or offered capabilities, with adapters for HTTP, databases, queues, and other infrastructure. It makes substitution and testing easier when the boundary is meaningful. It does not by itself create a microservice or guarantee clean design; excessive abstractions can obscure a small application.
- **Domain-driven design bounded context** — A boundary within which a domain model and its language have a consistent meaning. The same word can mean different things in different contexts; for example, “Customer” in billing may differ from “Customer” in support. Context maps and explicit translations protect each model. A bounded context is a modeling boundary; it may be implemented as a module or service and does not automatically imply a separate database or team.
- **Event-driven architecture (EDA)** — Producers publish events that consumers can process without a direct synchronous call from producer to every consumer. A fact event such as `OrderPlaced` describes something that happened; a command asks a specific owner to do something. A broker can buffer and fan out work, but delivery semantics, ordering scope, retention, schema compatibility, poison-event handling, and observability must be selected. Events usually introduce eventual consistency between producer and projections.
- **Command Query Responsibility Segregation (CQRS)** — Separates commands that change state from queries that return data. It can begin as separate code paths over one database; separate read and write stores are a larger step. Commands should express business intent and enforce invariants; queries should return purpose-built read models. With asynchronous projections, the UI must tolerate lag and offer a path to read-your-write behavior where needed. CQRS is not synonymous with event sourcing, microservices, or a separate database.
- **Saga** — A business workflow composed of local transactions across services. A step commits in its owner, then the workflow proceeds; on failure the system may retry, continue along an alternate path, or run a compensating action. Compensation is a new business operation, not time travel: a refund does not erase a card charge that already occurred, and some actions cannot be undone. Persist saga progress, make steps idempotent, define timeouts and manual recovery, and expose a status the business can understand.
- **Strangler Fig** — Replaces an old system capability by capability: route a bounded slice to a new implementation, compare behavior, migrate data or traffic, and retire the old path after evidence and rollback readiness. The routing layer, shared data, and dual-running interval can become sources of complexity. Avoid indefinitely maintaining two writable sources of truth; use explicit ownership and a migration/rollback plan.
- **Multi-tenant architecture** — One product serves multiple customer organizations. Isolation may be implemented in a shared schema with tenant keys, separate schemas, separate databases, or a hybrid. The choice balances isolation, noisy-neighbor control, cost, operational scale, and tenant-specific recovery. Tenant identity must come from trusted authentication context and be enforced on every access path, background job, cache key, export, and administrative action; filtering only in the browser is not security.
- **Backend for frontend (BFF)** — A server-side API tailored to a particular client or experience, such as web versus mobile. It can aggregate calls, shape payloads, and adapt client-specific release needs. A BFF is not automatically a domain service or authorization boundary: it must propagate identity and enforce policy through trusted services. It can also multiply endpoints, duplicate logic, and add another hop.

## Cross-item comparison

| Pattern | Primary pressure it addresses | Main cost or risk | A sensible starting point |
|---|---|---|---|
| Modular monolith | Clear internal ownership without distributed deployment | Boundary erosion and coordinated releases | One deployable with module APIs and data ownership |
| Microservices | Independent deploy, scale, ownership, or isolation | Partial failure, distributed data and operations | Extract only a capability with a measurable reason |
| Hexagonal architecture | Keep core rules independent of external mechanisms | Over-abstraction and indirection | Ports around real external dependencies |
| Bounded context | Different domain meanings and model ownership | Translation and integration work | Map domain terms before choosing a service boundary |
| Event-driven architecture | Fan-out, buffering, temporal decoupling | Eventual consistency, retries, tracing, schema evolution | Publish durable facts with replay and idempotency design |
| CQRS | Asymmetric write rules and read/query needs | Projection maintenance and stale reads | Separate handlers/models first; split stores only if justified |
| Saga | Long-running workflow across local transactions | Compensation, orchestration state, recovery complexity | Explicit state machine with observable status and idempotent steps |
| Strangler Fig | Incremental replacement of a legacy capability | Long-lived routing/data migration complexity | Migrate one bounded capability with rollback criteria |
| Multi-tenancy | Efficiently serve many customer organizations | Cross-tenant data leakage and noisy neighbors | Threat-model isolation and prove it with tests/operations |

These patterns compose at different layers. A bounded context might be a module in a modular monolith today and a service later. A service might publish events through an outbox and maintain a CQRS read projection. A saga coordinates transactions; the outbox safely publishes a local event. A BFF adapts a client but should not become the only place that protects tenant data. Keep the distinction between design boundary, deployment boundary, and data boundary explicit.

## Examples

**Order placement without premature microservices:** Start with an `Orders` module in a modular .NET application. A command checks inventory rules and commits the order plus an outbox row in one SQL transaction. A background publisher emits `OrderPlaced`. A separate search projection consumes it idempotently; the UI shows “processing” until that projection catches up. If inventory, payment, and fulfillment later need separate ownership, model the cross-service process as a saga with explicit compensation and status.

**React web and mobile:** If both clients need different response shapes or aggregation, a web BFF and mobile BFF can reduce client chattiness and decouple UI release needs. Keep domain invariants and authorization in trusted services; propagate user/tenant context and test object-level authorization even when the BFF has already filtered results. If both clients can use one stable API efficiently, a BFF may only add cost and latency.

**Legacy extraction:** Route only new search requests to a new search capability while the old application remains authoritative for writes. Backfill a read model, compare results, shadow or canary traffic, then switch ownership through a planned cutover. Define behavior for updates arriving during backfill and a clear rollback threshold before production migration.

## Common mistakes

- Splitting a monolith because microservices are fashionable before proving independent deployment, scaling, security, or ownership is worth the cost.
- Treating a bounded context, module, service, team, database, and deployment unit as the same boundary.
- Calling a request/command an event, or assuming publish/subscribe makes delivery exactly once or preserves global order.
- Implementing CQRS with separate stores without defining projection lag, rebuild, failure recovery, or read-your-write behavior.
- Calling a saga compensation a rollback that erases an already observed external effect.
- Publishing an event only after a database commit without an outbox or another mechanism that addresses the dual-write failure window.
- Assuming tenant IDs supplied by the React client are authoritative, or forgetting tenant context in caches, workers, exports, and operator tooling.
- Putting all authorization in the BFF while downstream services accept untrusted calls or fail to check the requested object.
- Running old and new implementations indefinitely with ambiguous write ownership during strangler migration.

## Knowledge checks with answers

1. **Does CQRS require two databases?** No. It separates command and query responsibilities; they can share storage. Separate stores are an optional scaling/read-model choice with synchronization and freshness costs.
2. **When is a saga more appropriate than one database transaction?** When a long-running business workflow crosses services that own separate transactional stores. Each step is local; failures require explicit forward recovery, compensation, or human handling.
3. **What does the outbox solve, and what remains?** It atomically persists a business change and its event record in one local transaction. Publishing may repeat; consumer idempotency and ordering policy remain necessary.
4. **Is every bounded context a microservice?** No. It is a domain-model boundary that can be implemented as a module or service.
5. **What must be true before trusting a multi-tenant shared database?** The tenant context is derived from a trusted identity, every query and write path enforces it, and automated tests plus operational controls cover caches, jobs, exports, and admin paths.
6. **What is the core strangler migration question?** Who is authoritative for each capability and data set at every migration phase, and how can traffic or ownership safely roll forward or back?
