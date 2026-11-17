# distributed systems consistency coordination and convergence — Reference: G-Counter

Sources: [Shapiro et al., Conflict-free Replicated Data Types](https://www.csa.iisc.ac.in/~raghavan/CleanedPods2021/crdt-shapiro-2011.pdf).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `G-Counter` — A grow-only counter can be represented as a vector of non-negative components, one owned by each replica. Replica i increments only its own component; merge takes the component-wise maximum; the visible count is the sum. Max is associative, commutative, and idempotent, so repeated or reordered state merges converge after replicas exchange state. The design relies on stable component identity and a merge of states that eventually includes all updates.

## Operational consequences

The state vector grows with the number of replica identities unless the design safely compacts or bounds membership. A G-Counter cannot decrement: subtracting a component or deleting an increment can make merge order matter. Use a PN-Counter or another defined construction for increments and decrements, and ensure replica identity is not reused in a way that overwrites prior component state. The mergeable arithmetic does not enforce a business invariant such as “no more than 10 seats”; that requires coordination or a rights-allocation design.

## Cross-item comparison

G-Counter favors coordination-free increments and monotone convergence. A centralized transactional counter provides immediate serialized reads/writes but depends on a reachable authority. Choose from the meaning of the counter, acceptable staleness, replica count, and whether a hard upper bound must be enforced.

## Examples

Replicas A and B begin at [0,0]. A increments to [1,0]; B increments twice to [0,2]. After exchanging states both merge to [1,2] and display 3. Repeating the same state transfer still yields [1,2]. Explain why a “decrement” operation cannot simply reduce A’s component, and how you would handle a hard quota.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Assuming a mergeable counter also enforces a quota or can safely delete an increment.

## Knowledge checks with answers

1. **How do replicas merge G-Counter components?** Component-wise maximum; the value is the sum of components.
2. **Why is a repeated merge safe?** The max merge is idempotent, associative, and commutative.
3. **Can it enforce a hard inventory cap?** No; concurrent increments can exceed a cap without coordination or preallocated rights.
