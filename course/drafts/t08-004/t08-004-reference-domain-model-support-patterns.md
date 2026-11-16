# DDD entities value objects aggregates and bounded contexts — Reference: Patterns that support a domain model

Sources: [DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf), [DDD Community terminology](https://www.dddcommunity.org/resources/ddd_terms/), and [Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design).

## Scope and version

This lesson explains supporting modeling patterns and design qualities. Use each only when it makes domain behavior or boundaries clearer.

## How this group fits the mental model

These patterns provide explicit ways to retrieve, construct, evaluate, and communicate about domain concepts without allowing infrastructure mechanics to dominate the model.

## Supplied names explained

### Repository

A collection-like abstraction for retrieving and persisting domain objects, commonly aggregate roots. It hides storage mechanics while preserving domain-relevant semantics. Read-heavy projections may use query-specific access paths instead of forcing all reads through repositories.

### Repository per Aggregate Root

Expose persistence operations at the aggregate boundary, not for every child entity. This keeps external mutation routed through the root’s invariant checks. A repository is a design boundary; ORM `DbSet` usage alone does not establish domain repository semantics.

### Factory

Encapsulates construction when valid creation requires domain decisions, coordinated objects, or invariant checks. Keep simple constructors direct. Factory methods should make the resulting object’s validity and ownership clear.

### Domain Factory

A factory expressed in domain terms that creates a valid domain object or aggregate. It should not become an infrastructure service locator or hide arbitrary side effects.

### Domain Module

A cohesive package/module of domain concepts and rules within a model. Organize by domain capability and language rather than only technical type categories when that improves understanding.

### Specification pattern

Encapsulates a reusable predicate or selection rule in a named form. It can compose domain queries or eligibility conditions. Avoid building a custom specification framework for a single simple condition or leaking database execution semantics into a pure domain rule.

### Domain policy

A rule that governs a decision across multiple domain concepts or situations, such as an eligibility rule. Keep ownership and inputs clear; policy may be implemented as a domain service/value object depending on the model.

### Intention-Revealing Interface

Names operations in terms of domain intent rather than low-level implementation mechanics. `ApproveInvoice` communicates a business action better than `SetStatus(2)` and can enforce allowed transitions.

### Side-Effect-Free Function

A calculation whose output depends only on its inputs and which does not mutate external state. Such functions are easy to test and reason about. Persistence, clock access, and messaging are effects and should be explicit at boundaries.

### Assertion

A statement/check of an invariant or precondition that must hold for valid model behavior. Assertions should clarify assumptions and fail visibly; do not use them as a replacement for user-facing validation or authorization.

### Standalone Class

A class with a focused purpose and minimal dependence on unrelated collaborators. It is easier to understand in isolation, but “standalone” does not mean it cannot participate in a meaningful model relationship.

### Closure of Operations

An algebraic design quality where operations on a type produce values within that same type/domain, allowing composition without conversion leaks. Apply where it improves a model, such as money arithmetic retaining currency rules; it is not a mandate for every operation.

### Declarative Design

Express what a rule or computation means while hiding incidental step-by-step mechanics where appropriate. Declarative forms can expose intent, but overly generic DSLs may obscure control flow.

### Domain-Specific Language

A vocabulary/notation tailored to a domain problem. It may be internal (a focused API) or external (parsed language). It can make rules readable but adds learning, parsing, validation, and evolution costs.

### Supple Design

A model that is expressive and easy for domain experts/developers to reason with, often through intention-revealing operations, side-effect-free functions, and explicit invariants. It emerges through iterative design rather than one universal pattern.

## Cross-item comparison

Repository loads/saves roots; Factory creates valid objects; Specification expresses predicates; Policy makes a domain decision. Intention-revealing interfaces and assertions make rules explicit, while side-effect-free functions simplify deterministic calculation.

## Examples

An `EligibleForCredit` specification can name a stable business predicate, while a domain policy combines it with context. A `Money` value object’s `Add` operation can return another valid `Money` and reject currency mismatch, demonstrating closure of operations and explicit invariants.

## Common mistakes

- Creating repositories for every table or child object.
- Hiding side effects inside a factory that appears pure.
- Using assertions for untrusted input validation.
- Building a DSL before the domain vocabulary is stable.
- Treating named patterns as required implementation artifacts.

## Knowledge checks with answers

1. **What should a repository normally manage?** Aggregate roots.
2. **When is a Specification useful?** A meaningful predicate is reusable/composable and deserves a name.
3. **Why prefer side-effect-free calculations?** Their results are deterministic from inputs and easier to test.

### Exact terms covered

- `Repository`
- `Repository per Aggregate Root`
- `Factory`
- `Domain Factory`
- `Domain Module`
- `Specification pattern`
- `Domain policy`
- `Intention-Revealing Interface`
- `Side-Effect-Free Function`
- `Assertion`
- `Standalone Class`
- `Closure of Operations`
- `Declarative Design`
- `Domain-Specific Language`
- `Supple Design`

### Exact terms covered

- `Repository`
- `Repository per Aggregate Root`
- `Factory`
- `Domain Factory`
- `Domain Module`
- `Specification pattern`
- `Domain policy`
- `Intention-Revealing Interface`
- `Side-Effect-Free Function`
- `Assertion`
- `Standalone Class`
- `Closure of Operations`
- `Declarative Design`
- `Domain-Specific Language`
- `Supple Design`
