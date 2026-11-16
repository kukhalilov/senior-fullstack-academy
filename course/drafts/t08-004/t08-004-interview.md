# DDD entities value objects aggregates and bounded contexts — Interview questions and reasoning

Sources: [DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf), [DDD Community terminology](https://www.dddcommunity.org/resources/ddd_terms/), [Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design), and [Domain events](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation).

## Core questions

Answer with a business example and distinguish strategic modeling from tactical implementation. Explain consistency and delivery semantics rather than equating DDD terms with framework classes.

## Concise interview answers

A bounded context is where a model and language have consistent meaning. Entities have identity/continuity; value objects have value equality. An aggregate is a consistency boundary with one root. Application services orchestrate use cases; domain behavior protects rules. Domain events are internal facts; integration events cross context boundaries.

## Deep follow-up answers

### Entity versus Value Object?

An entity is recognized through identity over its lifecycle; a value object is defined by its values and is commonly immutable. A database key does not alone decide which one a concept is. Equality, replacement, and lifecycle semantics should come from the domain.

### What makes an aggregate boundary good?

It includes what must be consistent in one business transaction and exposes one root to protect invariants. Keep it as small as practical; reference other aggregates by identity. Cross-aggregate operations may become eventually consistent when the business accepts workflow and recovery semantics.

### Bounded context versus microservice?

A bounded context is a model/language boundary. It may be implemented as a module within one monolith or as a service. Deployment boundaries add operational/network concerns and should be chosen separately.

### Domain Service versus Application Service?

A Domain Service expresses a domain rule without a natural entity/value-object owner. An Application Service coordinates a use case, transactions, repository calls, and output. It should delegate the rule to domain behavior rather than become a generic business-logic container.

### Why distinguish Domain and Integration Events?

A Domain Event is an internal fact in a model. An Integration Event is a stable external contract with compatibility and delivery obligations. Publish after commit; use an outbox or equivalent if the database/message dual write must be reliable.

## Scenario questions

### A model uses one Customer class across five teams

Ask whether the term, identity, rules, and lifecycle mean the same thing in every team. If not, split bounded-context models and define translation contracts. Share only a narrow kernel when there is real joint ownership.

### An aggregate has 60 related entities

Find the business invariants requiring atomic consistency. Move references to other roots to IDs and split unrelated transactional rules. Do not split a boundary if it breaks a must-hold invariant; use a workflow only if the business can tolerate intermediate state.

### A domain model is mostly data

Assess rule complexity. For simple CRUD, that may be appropriate. For complex invariants, move behavior close to the data it protects and keep application orchestration separate.

## Tradeoffs and alternatives

Rich tactical modeling improves invariant ownership but adds design and mapping effort. Large aggregates simplify atomic rules but increase contention. Context translation protects language but costs code. DDD is most valuable when domain complexity makes these costs worthwhile.

## Common weak answers

- “Every bounded context is a microservice.”
- “Every entity is a database row.”
- “An aggregate is the full object graph.”
- “Domain events guarantee delivery.”
- “All business logic belongs in entities.”

## Self-check rubric

Define the business language/boundary, identity semantics, invariant owner, transaction scope, orchestration role, and event audience/delivery behavior. State what tradeoff your design makes.

## Senior-level signals

Uses event storming/discovery with experts, names core versus supporting investments, treats contexts as semantic boundaries, minimizes aggregates around true invariants, and accounts for commit/publication failures and team ownership.
