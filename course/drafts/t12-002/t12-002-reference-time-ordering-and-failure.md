# distributed systems consistency coordination and convergence — Reference: Time, failure detection, and anti-entropy

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.postgresql.org/docs/current/mvcc.html), [reference 3](https://sre.google/sre-book/table-of-contents/), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Wall-clock timestamp` — A reading from a physical clock that can skew or jump; it cannot by itself prove causality between machines.
- `Lamport clock` — A logical counter that preserves happened-before ordering when events are causally related, but concurrent events may receive ordered values.
- `Vector clock` — A version vector that can identify causal ordering or concurrency across tracked participants, with metadata growth and membership costs.
- `Hybrid logical clock` — Combines physical-time proximity with logical ordering information to provide useful timestamps while accounting for skew.
- `Failure detector` — A mechanism that suspects a node based on missing or late signals; in an asynchronous network suspicion is not proof of failure.
- `Gossip protocol` — Spreads membership or state through repeated peer exchange, trading convergence speed against communication and false suspicion.
- `Anti-entropy` — Compares replicas and transfers missing state to repair divergence after missed updates or reconnection.
- `Merkle tree` — A hash tree that lets peers efficiently locate differing data ranges without comparing every record.

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