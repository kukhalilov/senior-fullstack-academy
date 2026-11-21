# architecture patterns multi-region tenancy and reliability — Reference: Onion Architecture

Sources: [HLD Handbook](https://hld.handbook.academy/), [Microsoft architecture styles](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/), [Microsoft tactical DDD guidance](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-ddd), [Martin Fowler on Dependency Injection](https://martinfowler.com/articles/injection.html).

## Scope and version

Onion Architecture is a style for organizing dependencies around domain behavior. The exact rings differ by author and codebase; this lesson explains the common dependency direction and how to apply it without confusing diagram shape with a correctness guarantee.

## How this group fits the mental model

Picture the domain model in the center, with application services and ports around it, and technology-specific infrastructure farther out. A source dependency should point inward: a database adapter may depend on a domain/application contract, while the domain does not depend on the ORM. At runtime, dependency injection can connect an inner port to an outer adapter. This keeps business rules less sensitive to database, delivery, and framework choices.

The architectural goal is not to make the domain ignorant of all external facts. It should model business concepts accurately. The boundary should translate external representation into concepts the domain understands, preserve its invariants, and translate results back. Choose boundaries according to stable policy and reasons for change.

## Supplied names explained

- **Onion Architecture** — A dependency-oriented style with domain policy in the center and outer rings for application coordination, adapters, and infrastructure. Dependencies point inward; outer mechanisms implement or invoke contracts required by inner code.

### Responsibilities and flow

1. An inbound adapter receives an HTTP request or message, performs transport parsing and authentication integration, and calls an application operation.
2. The application service coordinates the use case and uses ports for required capabilities such as loading an aggregate, publishing an event, or obtaining a payment result.
3. Domain entities/value objects enforce business invariants that belong to the model. They should not become passive bags if behavior is part of the rule.
4. Outbound adapters implement ports with a database, payment provider, message broker, or other external system.
5. Composition wiring binds the implementations for a particular environment. Tests can substitute fakes at a deliberate boundary, while integration tests verify the real adapters.

Keep transaction boundaries and failure semantics explicit. For example, an order write plus an outbox record may require one local transaction. Calling a payment provider is a separate distributed side effect and cannot be made atomic with the local database merely because the code sits in one application service.

## Cross-item comparison

| Style | Central image | Useful vocabulary | Caveat |
|---|---|---|---|
| Onion | Domain at the center, surrounding rings | Core, services, infrastructure | Teams may disagree on exact ring names |
| Clean Architecture | Policy/use cases inside, adapters and mechanisms outside | Use case, boundary, adapter | Often makes application-specific use cases explicit |
| Hexagonal Architecture | Application core surrounded by ports and adapters | Port, adapter | Emphasizes interaction points and replaceable adapters |
| Traditional layers | Responsibilities stacked in layers | Presentation, business, data access | A lower layer may leak concrete dependencies upward unless constrained |

Use the common principle, not terminology debates: stable policy should not import volatile implementation details. Onion and Clean Architecture overlap substantially; neither automatically guarantees good domain modeling or low coupling.

## Examples

**Inventory reservation.** `ReserveInventory` is an application operation. It loads the relevant inventory aggregate through a repository port, asks domain behavior to reserve quantity under its invariant, and persists the outcome. An infrastructure adapter implements persistence. If the operation emits an event, an outbox may persist that event in the same local transaction as the reservation. A later consumer handles delivery; do not imply that a broker publish and database commit are one atomic operation.

**Boundary placement test.** Suppose a rule says an order cannot be shipped until payment is captured. This is a domain/business invariant and should be represented in a stable model or policy. The HTTP status code, SQL query syntax, and vendor payment SDK request belong outside. A use case may coordinate the payment call and state transitions, but the workflow must define what happens when the remote outcome is unknown.

## Common mistakes

- Depending on folder names like `Core` and `Infrastructure` while inner code still references an ORM or web framework.
- Making every operation an interface and every entity a separate persistence DTO without a reason.
- Letting entities directly call network services and thereby hiding latency, retries, and partial failure in domain methods.
- Pretending a local transaction can atomically cover a remote provider call.
- Hiding business rules in database triggers or controllers while claiming the domain is central.
- Requiring all projects to have a pure domain library even when the product has little domain complexity and the separation would add more indirection than value.

## Knowledge checks with answers

1. **What do the onion rings guarantee?** Nothing by their shape alone. The intended constraint is inward source dependency and separation of policy from technology.
2. **Can the application service call an external provider?** It can coordinate through a port, but must model timeout, duplicate, and unknown-outcome behavior explicitly.
3. **Where should a shipping eligibility invariant live?** In domain policy or an explicit application policy, not only in an HTTP controller or ORM callback.
4. **When should this style be simplified?** When the system has little volatile infrastructure or domain complexity and extra interfaces/mapping layers are not buying testability or change isolation.
