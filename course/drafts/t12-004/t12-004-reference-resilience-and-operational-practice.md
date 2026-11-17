# architecture patterns multi-region tenancy and reliability — Reference: Resilience experiments, scaling, and operational economics

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 3](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://csrc.nist.gov/pubs/sp/800/207/final), [reference 6](https://owasp.org/www-project-api-security/), [reference 7](https://opentelemetry.io/docs/concepts/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Chaos engineering` — Runs controlled experiments against explicit steady-state hypotheses to learn how a system behaves under faults; it is not random production breakage.
- `Game day` — A rehearsed operational exercise that validates people, runbooks, signals, and system recovery for a scoped scenario.
- `Autoscaling` — Adjusts capacity from measured signals or schedules; startup delay, warm-up, downstream limits, and scale-in safety constrain effectiveness.
- `Predictive scaling` — Adds capacity based on forecast demand, requiring forecast quality and a fallback for unexpected peaks.
- `Graceful degradation` — Preserves core user value by disabling or simplifying lower-priority functions under stress or dependency failure.
- `Load shedding` — Rejects or discards selected work to protect system capacity and critical operations when demand exceeds safe limits.
- `FinOps` — A cross-functional practice that relates cloud spending to business value, accountability, and optimization decisions.
- `Spot capacity` — Lower-cost interruptible compute that may be reclaimed; use only for work that can checkpoint, retry, or tolerate interruption.
- `Power usage effectiveness (PUE)` — A facility-energy-to-IT-equipment-energy ratio; it describes data-center overhead but not the full carbon impact of useful work.
- `Carbon-aware scheduling` — Moves deferrable workloads in time or place based on carbon intensity while honoring latency, residency, and capacity constraints.

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