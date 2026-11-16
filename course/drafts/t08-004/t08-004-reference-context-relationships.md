# DDD entities value objects aggregates and bounded contexts — Reference: Bounded-context relationships and integration vocabulary

Sources: [DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf), [DDD Community terminology](https://www.dddcommunity.org/resources/ddd_terms/), and [Domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis).

## Scope and version

These terms describe collaboration and translation between contexts. They are relationship patterns, not required service topology or deployment rules.

## How this group fits the mental model

When two contexts collaborate, decide who shapes the contract, how models translate, and how much shared language is safe. Explicitly naming the relationship makes organizational power and technical dependency visible.

## Supplied names explained

### Shared Kernel

A small subset of the model or code shared by collaborating contexts. Both teams must coordinate changes and keep it deliberately limited; a broad shared kernel creates tight release and language coupling.

### Customer-Supplier relationship

An upstream team supplies capabilities or data to a downstream customer team. The customer’s requirements should influence the supplier’s priorities through an explicit relationship. If the supplier ignores them, the customer may need translation or independence.

### Customer-Supplier Teams

Teams negotiate their relationship and change process, including how downstream needs affect upstream planning. This is a collaboration contract, not just a database/API dependency.

### Conformist

A downstream context adopts an upstream model because it cannot influence the supplier or the integration cost of translation is not justified. It reduces mapping work but imports the upstream model’s limitations and language.

### Anti-Corruption Layer

A translation boundary that protects one model from another system’s concepts and semantics. It maps data, errors, and behavior rather than merely renaming fields. It costs code and ongoing mapping maintenance.

### Open Host Service

An upstream context offers a well-defined protocol/API for multiple consumers. Stable contracts reduce ad hoc integration, but require versioning, availability, and compatibility commitments.

### Published Language

A documented, shared interchange format or vocabulary used by integrations, such as a schema. It supports interoperability but can constrain model evolution; map it to local concepts rather than assuming it is the internal domain model.

### Separate Ways

Contexts choose not to integrate because the business benefit is lower than the coupling and coordination cost. They may maintain independent representations or processes.

### Partnership

Teams coordinate closely and succeed or fail together on an integration or capability. Shared planning is needed because neither side can treat the other as an independent supplier.

### Big Ball of Mud

An unstructured shared model/code region where context distinctions and ownership are absent. Changes ripple unpredictably. It is a warning description, not a formal architecture component.

### Bounded-context translation

Mapping between concepts at a context boundary, with explicit handling of meanings that do not map one-to-one. Translation may be a lightweight adapter or a larger Anti-Corruption Layer depending on semantic distance and change risk.

### Context boundary

The point beyond which a model’s terms, invariants, and assumptions no longer automatically hold. Contracts at the boundary should express only what the consumer needs and define errors/consistency.

## Cross-item comparison

Conformist minimizes translation by adopting upstream language. An Anti-Corruption Layer preserves local semantics. Shared Kernel shares a small model and requires joint changes. Separate Ways avoids coupling entirely. Choose based on influence, semantic mismatch, and integration value.

## Examples

An external logistics provider uses a status model with ambiguous codes. An Anti-Corruption Layer maps those codes into the shipping context’s local state machine. A published event schema may remain stable while internal entities evolve independently.

## Common mistakes

- Calling any mapping function an Anti-Corruption Layer without identifying protected semantics.
- Sharing a large common package and expecting independent context evolution.
- Publishing internal entity serialization as a permanent integration contract.
- Assuming team relationship terms prescribe separate deployments.

## Knowledge checks with answers

1. **What does an Anti-Corruption Layer protect?** Local model semantics from an external model.
2. **What is the cost of a Shared Kernel?** Coordinated ownership and changes.
3. **When can Separate Ways be rational?** When integration value is lower than ongoing coupling cost.

### Exact terms covered

- `Shared Kernel`
- `Customer-Supplier relationship`
- `Customer-Supplier Teams`
- `Conformist`
- `Anti-Corruption Layer`
- `Open Host Service`
- `Published Language`
- `Separate Ways`
- `Partnership`
- `Big Ball of Mud`
- `Bounded-context translation`
- `Context boundary`

### Exact terms covered

- `Shared Kernel`
- `Customer-Supplier relationship`
- `Customer-Supplier Teams`
- `Conformist`
- `Anti-Corruption Layer`
- `Open Host Service`
- `Published Language`
- `Separate Ways`
- `Partnership`
- `Big Ball of Mud`
- `Bounded-context translation`
- `Context boundary`
