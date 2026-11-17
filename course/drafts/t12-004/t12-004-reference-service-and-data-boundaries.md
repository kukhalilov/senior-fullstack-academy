# architecture patterns multi-region tenancy and reliability — Reference: Application and integration patterns

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 3](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://csrc.nist.gov/pubs/sp/800/207/final), [reference 6](https://owasp.org/www-project-api-security/), [reference 7](https://opentelemetry.io/docs/concepts/), [reference 8](https://hld.handbook.academy/curriculum/architecture-patterns/), [reference 9](https://hld.handbook.academy/curriculum/reliability-and-operations/), [reference 10](https://hld.handbook.academy/curriculum/security-at-scale/), [reference 11](https://hld.handbook.academy/curriculum/emerging-patterns/), [reference 12](https://csrc.nist.gov/pubs/fips/203/final), [reference 13](https://csrc.nist.gov/pubs/fips/204/final).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Modular monolith` — One deployable application with explicit internal modules and ownership; it avoids network hops while requiring boundary discipline.
- `Microservices` — Independently deployable services around bounded ownership; they add network, data, and operational failure modes.
- `Hexagonal architecture` — Keeps domain/application logic behind ports and adapters so infrastructure choices do not dominate core rules.
- `Domain-driven design bounded context` — A boundary within which a domain model and language have consistent meaning; integration translates between contexts.
- `Event-driven architecture` — Components communicate through events to reduce temporal coupling; observability, ordering, replay, and schema evolution need design.
- `CQRS` — Separates command handling from query models where different responsibilities justify the added consistency and projection work.
- `Saga` — Coordinates a multi-step business operation through local transactions and compensating actions; compensation is not a true rollback of external effects.
- `Strangler Fig` — Migrates capabilities incrementally by routing selected behavior to a replacement while the legacy system remains active.
- `Multi-tenant architecture` — Shares application resources among customers with isolation enforced at data, compute, identity, and operational layers.
- `Backend for frontend (BFF)` — Shapes server responses for specific client experiences; keep authorization and domain ownership in trusted server-side boundaries.

## Cross-item comparison

Use the item descriptions above to compare purpose, guarantee, and cost. Choose the smallest mechanism that provides the needed behavior; similar names may operate at different layers or under different assumptions.

## Examples

For a new feature, trace one successful operation and one failure through the relevant items. Identify the authoritative component, the state that is copied or derived, and what happens when a request is delayed, repeated, or interrupted.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Which item is the source of truth?** That is an explicit application data-ownership decision, not implied by a cache or replica.
2. **What if an acknowledgement is lost?** Treat the outcome as unknown; use idempotency or verification before repeating an effect.
3. **How do you choose among alternatives?** Compare them against the named workload, guarantee, cost, operational skill, and failure scenario.