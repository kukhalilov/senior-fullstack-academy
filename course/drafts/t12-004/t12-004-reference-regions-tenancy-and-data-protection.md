# architecture patterns multi-region tenancy and reliability — Reference: Regions, tenants, and privacy boundaries

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 3](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://csrc.nist.gov/pubs/sp/800/207/final), [reference 6](https://owasp.org/www-project-api-security/), [reference 7](https://opentelemetry.io/docs/concepts/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Single-region deployment` — Keeps serving and data placement in one geographic region; zone-level resilience and tested backup are separate concerns.
- `Multi-zone deployment` — Places redundant components across failure zones within a region, reducing some correlated failures without eliminating regional outage.
- `Active-passive multi-region` — A standby region is promoted during a failure; replication lag, promotion time, and failback require tested procedures.
- `Active-active multi-region` — Multiple regions serve writes or reads concurrently; conflict, routing, consistency, and data residency become core design.
- `RTO` — Maximum target time to restore a defined service after disruption; the end-to-end restore process must be exercised.
- `RPO` — Maximum target data loss measured in time for a defined failure; backup/replication cadence alone does not prove recovery.
- `Tenant isolation` — Controls preventing one tenant from accessing or exhausting another tenant’s resources; logical IDs alone are insufficient.
- `Noisy neighbor` — A tenant or workload consumes shared capacity and degrades others; quotas, fairness, and isolation mitigate it.
- `Data residency` — A requirement governing where personal or regulated data is stored or processed, including copies, logs, backups, and support access.
- `Data deletion workflow` — Tracks deletion across authoritative records, replicas, caches, indexes, backups, and downstream processors with auditable completion.

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