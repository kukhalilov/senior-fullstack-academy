# modular monolith layered hexagonal clean architecture — Exercises and worked solutions

Sources: [Common web application architectures](https://learn.microsoft.com/en-us/dotnet/standard/modern-web-apps-azure-architecture/common-web-application-architectures), [Presentation-Domain-Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html), and [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture).

## Goals

Map application responsibilities and dependency flows, define enforceable module boundaries, and distinguish useful seams from empty architectural ceremony.

## Worked example

An HTTP request enters an adapter, is mapped into a use-case command, and reaches a domain rule. The use case calls a core-owned persistence port. An outer adapter implements it with a database. Compile-time reference points from adapter to port, while runtime invocation reaches the adapter implementation.

## Exercises

### Exercise 1: Draw both dependency graphs

An application service calls `IInvoiceStore`; `SqlInvoiceStore` implements it. Which way do source references point? Which way does runtime control flow go?

#### Worked solution

The infrastructure source references the application-owned `IInvoiceStore` contract, so compile-time dependency points inward. At runtime the use case calls the interface and dispatch reaches `SqlInvoiceStore`, so control flow invokes the outer implementation.

### Exercise 2: Modular monolith or microservices?

Three teams deploy one application and share a database but have frequent conflicting writes to each other’s tables. What boundary improvement can be attempted before service extraction?

#### Worked solution

Assign module/schema ownership, expose supported APIs, block direct cross-module writes, and add architecture tests. A modular monolith preserves one deployment while clarifying boundaries. Extract a service only if independent deployment/scale/ownership requirements justify network and consistency costs.

### Exercise 3: Is this a useful port?

A trivial function is wrapped by an interface used once and has no external effect, replacement, or testing need. Should every such call get a port?

#### Worked solution

No. Keep a direct call unless a genuine policy boundary, change seam, or testability need exists. Architecture is not maximized by interface count.

### Exercise 4: Spot layer leakage

The domain model uses an ORM entity with lazy-loading proxies and the API serializes it directly. What concerns arise?

#### Worked solution

Persistence and serialization details leak across the domain/API boundary. This can expose fields, trigger unexpected queries, or couple clients to schema changes. Map to boundary-appropriate data structures and keep domain rules independent of ORM behavior.

### Exercise 5: Strict or relaxed layering?

A read-only endpoint needs data from a query component. Routing it through three empty pass-through services adds no policy. How might the team adjust?

#### Worked solution

Use a relaxed path or remove empty layers while documenting the dependency rule and preserving meaningful boundaries. Strict layering is useful when each layer contributes a contract or policy; otherwise it adds navigation and mapping cost.

## Progressive hints

Label every arrow as source reference or runtime call. Mark who owns data, policy, and contract. Ask what behavior the proposed layer protects and what work it introduces.

## Complete solutions

Worked solutions are attached to each exercise. Alternative layouts are valid if they preserve explicit ownership, correct dependency direction, and boundary semantics.

## Tests and edge cases

Add architecture checks for forbidden module references and cross-schema access. Exercise transaction ownership, error mapping, invalid DTOs, and an adapter failure. Verify that in-process boundaries do not create circular dependencies or hidden shared mutable state.

## Reflection questions

Which boundary is enforced by code or tests? Which is only a diagram? What evidence would justify moving from one deployable monolith to independent services?
