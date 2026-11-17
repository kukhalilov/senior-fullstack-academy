# architecture patterns multi-region tenancy and reliability — Reference: Architecture evolution, teams, and execution models

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 3](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://csrc.nist.gov/pubs/sp/800/207/final), [reference 6](https://owasp.org/www-project-api-security/), [reference 7](https://opentelemetry.io/docs/concepts/), [reference 8](https://hld.handbook.academy/curriculum/architecture-patterns/), [reference 9](https://hld.handbook.academy/curriculum/reliability-and-operations/), [reference 10](https://hld.handbook.academy/curriculum/security-at-scale/), [reference 11](https://hld.handbook.academy/curriculum/emerging-patterns/), [reference 12](https://csrc.nist.gov/pubs/fips/203/final), [reference 13](https://csrc.nist.gov/pubs/fips/204/final).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Conway's Law` — An organization tends to produce system boundaries that reflect communication boundaries; architecture and team design influence one another.
- `Team topology` — How teams are organized around stream-aligned ownership, enabling platforms, complicated subsystems, or temporary collaboration; it affects cognitive load and service boundaries.
- `Serverless computing` — Runs code or managed capabilities without direct server administration, while capacity limits, cold starts, event semantics, and unit economics still require design.
- `Function as a service (FaaS)` — Executes bounded functions on demand under a provider runtime; execution duration, concurrency, startup, and state constraints shape use.
- `Local-first software` — Keeps useful data and behavior on the user device and synchronizes later, requiring merge/conflict, privacy, and revocation rules.
- `Platform engineering` — Builds supported internal capabilities and workflows as a product for delivery teams, with adoption and developer outcomes as measures.
- `Internal developer platform (IDP)` — A collection of self-service tools and paved paths that standardize common delivery tasks while allowing justified exceptions.

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