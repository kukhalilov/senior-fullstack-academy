# DDD entities value objects aggregates and bounded contexts — Reference: Domain behavior coordination and meaningful change events

Sources: [Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design), [Domain events](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation), and [DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf).

## Scope and version

This lesson distinguishes domain decisions, use-case orchestration, internal facts, and cross-context contracts. Reliable outbox delivery and CQRS are covered separately.

## How this group fits the mental model

Put business decisions with the model that owns their invariants. Keep use-case flow at the application boundary. Record meaningful domain facts and translate them into explicit integration contracts after state is committed when external consumers need them.

## Supplied names explained

### Domain Service

Encapsulates a domain operation that does not naturally belong to one entity or value object, often because it involves several domain concepts. It should express domain language and avoid becoming a generic home for all business logic.

### Application Service

Orchestrates a use case: receives a request, loads required models, invokes domain behavior, manages transaction/application flow, and returns a result. It should not absorb the invariant logic that belongs in domain objects/services.

### Domain Event

An immutable statement that a meaningful fact occurred in the domain, often named in the past tense. It can coordinate reactions within a model or application boundary. It is not automatically persisted, replayable, or delivered exactly once.

### Integration Event

A message contract that communicates a committed change to another bounded context or system. It is designed for external consumers and can evolve independently of the internal domain event. Delivery, schema compatibility, and duplicate handling must be explicit.

### Domain event handler

Code reacting to a domain event. It may update related model behavior or produce an integration event. Define whether it runs inside or after a transaction, how failures affect the original operation, and whether handlers are idempotent.

### Post-commit integration event publication

External communication should represent a committed business change. If the database commits but publishing fails, direct post-commit publishing can lose the event. A transactional outbox or equivalent reliable mechanism addresses that dual-write gap; details are covered in the distributed transaction topic.

### Domain logic

Rules, calculations, decisions, and invariants expressed in the model’s language. Keep it free from transport and persistence concerns where practical. Not all logic belongs inside entities; use value objects, domain services, or policies according to ownership.

### Use-case orchestration

The sequence and coordination needed to fulfill an application request: authorization context, repository calls, transaction scope, and response shaping. It invokes domain policy rather than replacing it with an anemic procedural service layer.

## Cross-item comparison

Domain services make domain decisions without a natural single owner; application services coordinate the use case. Domain events are internal model facts; integration events are external contracts. A handler’s transaction and failure behavior determines whether its effects are reliable.

## Examples

An `InvoiceIssued` domain event can be raised after the aggregate transitions successfully. An application handler may create an integration event for accounting. Persist invoice and outbox message atomically, then publish with retry and idempotent consumers if delivery must survive process failure.

## Common mistakes

- Putting every rule in an Application Service because it has repositories available.
- Publishing external messages before the originating transaction commits.
- Assuming in-memory event handlers survive process crashes.
- Sharing internal domain-event types as permanent public contracts.
- Claiming exactly-once delivery without defining durable idempotency semantics.

## Knowledge checks with answers

1. **Who owns use-case sequencing?** Application service/orchestrator.
2. **What is an Integration Event for?** Communicating a committed fact across a context/system boundary.
3. **Why can post-commit publish lose a message?** The process can fail after DB commit but before broker send.

### Exact terms covered

- `Domain Service`
- `Application Service`
- `Domain Event`
- `Integration Event`
- `Domain event handler`
- `Post-commit integration event publication`
- `Domain logic`
- `Use-case orchestration`

### Exact terms covered

- `Domain Service`
- `Application Service`
- `Domain Event`
- `Integration Event`
- `Domain event handler`
- `Post-commit integration event publication`
- `Domain logic`
- `Use-case orchestration`
