# DDD entities value objects aggregates and bounded contexts — Exercises and worked solutions

Sources: [DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf), [Domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis), [Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design), and [Domain events](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation).

## Goals

Model strategic boundaries, choose identity/value semantics, draw an aggregate around real invariants, and keep use-case coordination distinct from domain policy and integration delivery.

## Worked example

An invoice has a stable ID and status lifecycle, so it is an entity. Its billing address and currency/amount values can be immutable value objects. The invoice aggregate root prevents paying a draft. The application service loads it and coordinates persistence; a domain event records issuance, and an outbox-backed integration event tells another context after commit.

## Exercises

### Exercise 1: Same name, different models

Marketing stores prospect interests; billing stores legal party, tax, and payment details. Should both contexts share one `Customer` type?

#### Worked solution

No automatic sharing is warranted. Each bounded context has different language and invariants. Define translation at the boundary and a Context Map relationship. Shared types are justified only for a small, stable shared kernel with joint ownership.

### Exercise 2: Entity or value object?

Compare a postal address used on an invoice with a customer account whose status changes over years.

#### Worked solution

The address can be a value object if defined by values and replaced immutably. The account is an entity if identity/continuity matter through status changes. Domain usage, equality, and lifecycle decide—not table shape.

### Exercise 3: Aggregate boundary

An order has line items, while product inventory is updated by a separate team. Should the Order aggregate include the entire Product and inventory object graph?

#### Worked solution

Usually no. The order can own its lines and protect order invariants; it can reference product identity/price snapshot. Inventory has separate ownership and consistency requirements. Cross-aggregate reservation may be a workflow with explicit eventual outcomes.

### Exercise 4: Domain or application service?

One operation calculates a domain eligibility rule from customer risk and outstanding debt. Another loads an account, calls the rule, saves changes, and returns an API result. Classify them.

#### Worked solution

The rule is a domain service/policy if it has no natural single object owner. The load-call-save-response sequence is application service orchestration. Domain decisions remain explicit in the domain model.

### Exercise 5: Domain event or integration event?

An account is suspended and the billing context must stop renewals. Which event semantics are needed?

#### Worked solution

The domain may raise `AccountSuspended` internally. An integration event should be a stable external contract published after commit. If loss is unacceptable, persist outbox data atomically and use retry/idempotent consumption; an in-memory handler is not reliable delivery.

### Exercise 6: Choose a supporting pattern

Several queries use the same named eligibility predicate; one simple check uses a single boolean comparison. Should both use Specification objects?

#### Worked solution

The repeated meaningful predicate may warrant a Specification. The one-off boolean is clearer inline. Keep abstractions proportional and avoid a framework around trivial conditions.

## Progressive hints

Ask where the language is valid, what remains identical through change, which invariants must be atomic, and whether a rule or an orchestration sequence is being described. Trace external publication through commit/failure.

## Complete solutions

Each exercise includes a reasoned choice. Alternative designs are valid when they preserve ownership, invariant, and boundary semantics.

## Tests and edge cases

Test entity lifecycle transitions, value equality and units, aggregate invariant rejection, concurrent updates, integration publish failure after commit, context translation of unknown enum values, and whether repositories expose root boundaries. Include retries and duplicate event handling where external messages are involved.

## Reflection questions

Which rule would break if the aggregate were split? Which shared language is truly stable? What does the team need to own jointly at a context boundary?
