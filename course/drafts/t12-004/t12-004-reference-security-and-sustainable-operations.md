# architecture patterns multi-region tenancy and reliability — Reference: Security at scale, privacy, cost, and sustainability

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 3](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://csrc.nist.gov/pubs/sp/800/207/final), [reference 6](https://owasp.org/www-project-api-security/), [reference 7](https://opentelemetry.io/docs/concepts/), [reference 8](https://hld.handbook.academy/curriculum/architecture-patterns/), [reference 9](https://hld.handbook.academy/curriculum/reliability-and-operations/), [reference 10](https://hld.handbook.academy/curriculum/security-at-scale/), [reference 11](https://hld.handbook.academy/curriculum/emerging-patterns/), [reference 12](https://csrc.nist.gov/pubs/fips/203/final), [reference 13](https://csrc.nist.gov/pubs/fips/204/final).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Authentication` — Establishes a verified identity for a user, workload, or service; it does not by itself grant access to a resource.
- `Authorization` — Evaluates whether an authenticated principal may perform a particular action on a resource in its current context.
- `Role-based access control (RBAC)` — Groups permissions into roles assigned to principals; role growth and coarse resource context can limit precision.
- `Attribute-based access control (ABAC)` — Makes policy decisions from subject, resource, action, and environmental attributes, requiring trustworthy and current inputs.
- `Relationship-based access control (ReBAC)` — Derives permissions from relationships among principals and resources, useful for sharing graphs but requiring careful consistency.
- `Mutual TLS (mTLS)` — Authenticates both TLS peers and protects a service connection; it does not replace application-level user authorization.
- `Secrets manager` — Stores and controls access to credentials and cryptographic material with lifecycle, audit, and rotation responsibilities.
- `Web application firewall (WAF)` — Applies HTTP-aware filtering rules to reduce some application attack traffic; it cannot replace secure application logic.
- `Data residency and erasure` — Requires mapping storage, processing, replicas, logs, backups, and downstream copies to jurisdictional rules and deletion workflows.
- `Differential privacy` — Adds calibrated statistical noise to limit information about an individual in aggregate outputs, with a measurable privacy/utility budget.
- `Federated learning` — Trains across data held at distributed participants without centralizing raw examples; updates and metadata can still leak information.
- `Software supply-chain provenance` — Evidence about how software was built and where inputs came from; signatures and build isolation help verify provenance.
- `Carbon-aware scheduling` — Shifts deferrable work toward lower-carbon energy/time/region when user latency and data-residency constraints allow.
- `Power usage effectiveness (PUE)` — A data-center efficiency ratio of total facility energy to IT equipment energy; lower is generally more efficient but it is not a complete sustainability metric.
- `FinOps unit economics` — Relates infrastructure cost to a business unit such as request, tenant, transaction, or model answer to expose cost drivers.
- `Energy-per-workload measurement` — Tracks energy or proxy resource use for a defined useful unit so optimization does not reward doing less useful work.

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