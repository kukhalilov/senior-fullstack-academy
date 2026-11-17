# end-to-end system design case studies — Reference: Reusable design artifacts and validation

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 3](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 5](https://www.rfc-editor.org/rfc/rfc9110), [reference 6](https://learn.microsoft.com/en-us/ef/core/saving/transactions).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Requirements table` — Records prioritized user behaviors, quality targets, constraints, and measurable acceptance conditions.
- `Workload model` — Captures average, peak, burst, read/write ratio, concurrency, payload, retention, and growth assumptions.
- `Entity and ownership map` — Shows authoritative data, identifiers, relationships, and which component may change each fact.
- `API contract` — Defines request, response, errors, pagination, idempotency, authentication, and compatibility rules.
- `Read path` — Traces how a user-visible query gets current or intentionally stale data from the authoritative or derived stores.
- `Write path` — Traces validation, authorization, transaction, event/job publication, acknowledgement, and recovery.
- `Failure matrix` — Lists component failures, user impact, detection, containment, recovery, and data-loss risk.
- `Capacity estimate` — Models resource use and redundancy from workload assumptions, then identifies the most sensitive unknown.
- `Architecture decision record (ADR)` — Captures decision context, alternatives, consequences, and evidence or triggers for revisiting it.
- `Operational runbook` — Gives responders actionable signals, safe mitigations, escalation, and recovery verification steps.

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