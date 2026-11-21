# DDD entities value objects aggregates and bounded contexts — Core concepts and how they fit together

Sources: [DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf), [DDD Community terminology](https://www.dddcommunity.org/resources/ddd_terms/), [Domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis), [Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design), and [Domain events](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation).

## Learning objectives

Distinguish strategic and tactical DDD; model entities and value objects; define an aggregate around atomic invariants; separate domain from application services; and distinguish internal domain events from cross-context integration events.

## Prerequisites

Know domain modeling, transactions, modules, and application architecture boundaries. Persistence mapping and distributed delivery mechanisms are covered in separate topics.

## Core concepts

The **domain** is the subject area the software supports. **Subdomains** separate parts of that subject; the core subdomain differentiates the business, supporting subdomains enable it, and generic subdomains solve common problems. **Ubiquitous language** aligns domain experts and developers within a bounded context. A **Bounded Context** is the boundary within which a model and language have consistent meaning. The same term may mean different things elsewhere. A **Context Map** describes relationships among contexts and teams.

An **entity** has identity and continuity through changes. Equality follows identity according to domain rules, not every property. A **Value Object** is defined by values, is commonly immutable, and can protect validation/invariants. Do not choose based on database table shape. A **domain invariant** is a rule that must always hold for valid state. A rich model places meaningful behavior near the data/invariants; an anemic model separates data from behavior, which can be acceptable for simple CRUD but awkward for complex rules.

An **aggregate** is a transactional consistency boundary with one **Aggregate Root** through which external code accesses and mutates protected members. The root protects invariants inside the boundary. Other aggregates are referenced by identity rather than traversed as one large object graph. Aggregate size trades atomic guarantees against contention and loading cost. Cross-aggregate workflows may use eventual consistency; do not claim that one database transaction spans distributed contexts automatically.

A **Domain Service** holds domain logic that does not naturally belong to an entity/value object. An **Application Service** orchestrates a use case, coordinates repositories and transaction boundaries, and delegates domain decisions. A **Domain Event** represents a meaningful fact in one model. An **Integration Event** is a contract sent to another context/system, commonly after commit. Event publication failure and atomicity require dedicated delivery design; a domain event handler alone does not ensure reliable cross-process delivery.

**Repositories** provide collection-like persistence access, typically per aggregate root. **Factories** construct valid complex domain objects. Specifications express reusable predicates when appropriate. Intention-revealing interfaces expose business operations rather than generic plumbing. Side-effect-free functions, assertions, standalone classes, closure of operations, declarative design, domain-specific languages, and supple design are modeling techniques for explicit, predictable rules; apply them when they improve clarity, not as mandatory checkboxes.

## Mechanisms and relationships

```text
Context A language/model ≠ automatically Context B language/model
aggregate root → invariant-preserving transaction boundary
application service → use-case flow; domain object/service → business rule
domain event (internal fact) → integration event (external contract after commit)
```

## Worked examples

Represent `Money(amount, currency)` as an immutable value object with validated currency/scale and value equality. Represent `Invoice` as an entity whose ID persists while status changes. An `Invoice` aggregate root rejects payment before issuance. A domain service may calculate a rule involving several domain concepts; an application service loads the invoice, invokes `Pay`, saves it, and coordinates event publication.

## Misconceptions and edge cases

- A bounded context is not automatically a microservice.
- An aggregate is not every reachable object loaded from one table graph.
- An entity is not defined by its primary key column alone.
- Domain events and integration events have different audiences and durability requirements.
- “Rich” does not mean behavior on every object; use the model where rules live.
- A repository per aggregate root is a tactical pattern, not a requirement for every query/read model.

## Knowledge checks with answers

1. **What defines an entity?** Domain identity and continuity.
2. **What does the aggregate root protect?** Invariants within its transactional boundary.
3. **Who orchestrates a use case?** An application service; domain decisions remain in domain behavior.
4. **When publish an integration event?** After the originating change commits, using reliability mechanisms as required.
