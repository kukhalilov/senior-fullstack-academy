# DDD entities value objects aggregates and bounded contexts — Reference: Identity-based and value-based domain objects

Sources: [Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design), [Domain model](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model), and [DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf).

## Scope and version

This lesson distinguishes identity-based domain objects from value-based ones and explains where behavior/invariants belong.

## How this group fits the mental model

Choose an object shape from domain semantics: does it remain the same thing as attributes change, or is it defined entirely by its values? Use the model to protect valid business state.

## Supplied names explained

### Entity

An object whose identity persists through changes. Two entities can have equal attributes but still be different because their identities differ. Equality and lifecycle should reflect the domain, not be dictated solely by the persistence key.

### Entity identity

A stable way to distinguish one entity through its lifecycle. Identity may be assigned by the domain, a system, or a persistence mechanism depending on the model. Avoid exposing identity rules that let clients mutate or confuse aggregate ownership.

### Entity lifecycle

The valid creation, state transitions, and retirement of an entity. Model transitions that protect invariants rather than allowing arbitrary property mutation. Not every state transition needs a separate subclass.

### Value Object

An object described entirely by its values and typically treated as immutable. Examples include a validated postal address or money amount/currency pair. Replacing it with a new value is often clearer than mutating shared instances.

### Value equality

Two value objects are equal when their meaningful values are equal according to domain semantics. Decide normalization and precision: case sensitivity, currency scale, timezone, and units can affect equality.

### Value-object immutability

Once created, the value’s meaning does not change. Immutability simplifies sharing, comparison, and reasoning; it does not automatically guarantee thread safety if nested members remain mutable.

### Domain invariant

A rule that valid domain state must always satisfy, such as a paid invoice having been issued. Protect it at the entity/aggregate operation that owns the relevant facts. Input validation alone may be insufficient if other code can mutate state later.

### Rich domain model

A model that contains meaningful behavior and invariants close to the domain state they govern. “Rich” is relative to actual complexity; avoid moving orchestration, persistence, and external side effects into entities indiscriminately.

### Anemic domain model

Objects mostly store data while services implement behavior elsewhere. It can be a poor fit when complex invariants scatter, but may be simple and effective for data-centric CRUD. Evaluate consistency and change costs instead of applying a blanket rule.

## Cross-item comparison

Entity equality follows identity/continuity; value equality follows meaningful values. Entities often have lifecycles and controlled transitions; value objects are commonly immutable. Domain invariants may span multiple objects and therefore belong at an aggregate boundary.

## Examples

`Money(10, "USD")` can be a value object with currency-aware arithmetic and equality. Two `Customer` entities can share a name and still be different customers. An `Invoice` entity can transition from Draft to Issued while preserving its identity and enforcing issuance rules.

## Common mistakes

- Making every object an entity because the database has a primary key.
- Comparing money by amount while ignoring currency.
- Exposing setters that allow invalid entity state.
- Assuming immutable outer objects have no mutable aliases.
- Treating anemic objects as automatically wrong in simple CRUD applications.

## Knowledge checks with answers

1. **What is the key semantic distinction?** Identity/continuity versus value equality.
2. **Where protect an invariant?** At the model boundary that owns the required facts.
3. **Does immutability mean every model must be immutable?** No; choose according to domain semantics and ownership.

### Exact terms covered

- `Entity`
- `Entity identity`
- `Entity lifecycle`
- `Value Object`
- `Value equality`
- `Value-object immutability`
- `Domain invariant`
- `Rich domain model`
- `Anemic domain model`

### Exact terms covered

- `Entity`
- `Entity identity`
- `Entity lifecycle`
- `Value Object`
- `Value equality`
- `Value-object immutability`
- `Domain invariant`
- `Rich domain model`
- `Anemic domain model`
