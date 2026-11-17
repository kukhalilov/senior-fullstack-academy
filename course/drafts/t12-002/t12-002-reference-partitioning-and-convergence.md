# distributed systems consistency coordination and convergence — Reference: Data placement and mergeable state

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.postgresql.org/docs/current/mvcc.html), [reference 3](https://sre.google/sre-book/table-of-contents/), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Consistent hashing` — Maps keys and nodes around a hash space so membership changes can limit reassignment; virtual nodes and capacity weights affect balance.
- `Rendezvous hashing` — Ranks candidate nodes per key by a hash score, providing stable placement with a simple node-set model.
- `Hot partition` — A shard or partition receiving disproportionate demand; remedies include key redesign, salting, split reads, or workload isolation.
- `Conflict-free replicated data type (CRDT)` — A replicated data type whose defined operations/state merge converge under its assumptions; the data type must match product meaning.
- `State-based CRDT` — Replicas exchange state and merge through an idempotent, commutative, associative join operation, often with larger transfer cost.
- `Operation-based CRDT` — Replicas disseminate operations that must satisfy delivery and causal assumptions for convergence.
- `Last-write-wins register` — A register that selects a value by timestamp or tie-break rule; it can silently discard a meaningful concurrent update.
- `Split brain` — Multiple nodes act as authoritative leaders for overlapping state, risking conflicting writes unless fencing or consensus prevents it.

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