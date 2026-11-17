# distributed systems consistency coordination and convergence — Reference: Partition tradeoffs and replication guarantees

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.postgresql.org/docs/current/mvcc.html), [reference 3](https://sre.google/sre-book/table-of-contents/), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://hld.handbook.academy/curriculum/distributed-systems-theory/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `CAP theorem` — During a network partition, a distributed data system cannot guarantee both linearizable consistency and a successful response from every non-failing side; outside a partition, the theorem does not rank all designs.
- `PACELC` — Extends the partition tradeoff by describing a latency-versus-consistency choice when there is no partition, alongside behavior during partitions.
- `Read quorum` — The number of replicas whose responses are required for a read under a specified replication protocol; it does not by itself define freshness or ordering.
- `Write quorum` — The number of replica acknowledgements required before a write is reported successful under a specified protocol.
- `Sloppy quorum` — Accepts writes from temporary nodes outside the usual replica set during failure, improving availability but requiring later handoff and repair.
- `Hinted handoff` — Temporarily stores a replica's missed update at another node and forwards it when the intended replica returns.
- `Read repair` — Reconciles stale replicas during a read path; it can improve convergence but adds latency and does not replace background repair.

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