# modular monolith layered hexagonal clean architecture — Reference: Monolithic deployment with explicit internal module boundaries

Sources: [Common web application architectures](https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/common-web-application-architectures) and [Microsoft architectural principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles).

## Scope and version

This lesson covers one deployable runtime with internal module contracts. Distributed services are compared only to clarify the boundary distinction.

## How this group fits the mental model

A modular monolith applies ownership and dependency rules without distributing every boundary over a network. It can preserve local transactions and straightforward operations while maintaining room for later extraction where evidence supports it.

## Supplied names explained

### Modular monolith

An application deployed as one unit whose modules have explicit responsibilities, APIs, and dependency constraints. The shared process does not guarantee modularity; architecture tests and team conventions must prevent hidden cross-module access.

### Module boundary

A line around owned policy/data and allowed interactions. A useful boundary reflects cohesive business responsibility and limits change ripple. It need not correspond one-to-one with a project or assembly.

### Module API

The supported contract another module may call. Keep it small, intention-revealing, and stable enough for independent changes. Avoid exposing implementation entities or persistence internals unnecessarily.

### Module ownership

Clear responsibility for changing, operating, and evolving a module and its data. Ownership can belong to a team or domain group. Shared ownership and shared schema writes create coordination and accidental coupling.

### Encapsulation of module internals

Consumers cannot directly rely on private types, tables, or implementation details. Encapsulation allows an owner to refactor internals while preserving its API. Enforce access at language/project and architecture-test levels where practical.

### Shared database with module-owned schema

Modules may use one database server while owning separate schemas/tables and write paths. This can simplify operations but does not itself guarantee isolation. Cross-module reads/writes need explicit contracts and coordinated consistency expectations.

### In-process module interaction

Modules call one another through APIs in the same process, avoiding network serialization and transport failure. They still share CPU, memory, deployment, and process failure; circular references and synchronous call chains can cause coupling or latency.

### Module dependency rule

An explicit allowed direction for module references. A dependency graph should usually be directed and acyclic, or cycles should be broken at a well-defined contract. Centralize shared kernel concepts sparingly because shared abstractions can become a coupling hub.

### Architecture test for module boundaries

Automated checks assert that modules do not reference forbidden namespaces/assemblies or access another module’s persistence. Tests preserve the intended structure as the codebase changes; they complement, rather than replace, clear ownership and review.

### Big-ball-of-mud monolith

A monolithic deployment whose modules have no meaningful internal boundaries: arbitrary shared state, direct cross-domain writes, cycles, and broad dependencies. The problem is not one process but the lack of controlled structure.

## Cross-item comparison

A modular monolith has one deployment but many explicit internal boundaries. A big-ball-of-mud monolith also has one deployment but lacks enforceable ownership. Microservices have network/deployment boundaries and additional distributed-system costs, which are outside this topic’s implementation scope.

## Examples

An ordering module owns order tables and exposes `PlaceOrder` and query contracts. A reporting module requests a report through a read API rather than querying order tables directly. Both may share one relational database instance while preserving ownership.

## Common mistakes

- Treating separate folders as module boundaries.
- Allowing direct cross-module database writes because all modules share one server.
- Creating a shared project that contains every domain concept.
- Assuming a modular monolith can never be split later.
- Extracting services before understanding ownership and data contracts.

## Knowledge checks with answers

1. **What makes a boundary real?** Enforced ownership and a constrained interaction contract.
2. **Does one database server prevent modularity?** No, if data ownership and access paths remain explicit.
3. **What does architecture testing add?** Repeatable enforcement of allowed dependency rules.

### Exact terms covered

- `Modular monolith`
- `Module boundary`
- `Module API`
- `Module ownership`
- `Encapsulation of module internals`
- `Shared database with module-owned schema`
- `In-process module interaction`
- `Module dependency rule`
- `Architecture test for module boundaries`
- `Big-ball-of-mud monolith`

### Exact terms covered

- `Modular monolith`
- `Module boundary`
- `Module API`
- `Module ownership`
- `Encapsulation of module internals`
- `Shared database with module-owned schema`
- `In-process module interaction`
- `Module dependency rule`
- `Architecture test for module boundaries`
- `Big-ball-of-mud monolith`
