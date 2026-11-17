# distributed systems consistency coordination and convergence — Reference: Sloppy quorum

Sources: [Handbook module 3](https://hld.handbook.academy/curriculum/distributed-systems-theory/), [Dynamo paper](https://assets.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf), [Apache Cassandra replication and consistency](https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html).

## Scope and version

This lesson explains sloppy quorum as used in Dynamo-style replication. Similar product terms can have different meanings; check each database's consistency contract.

## How this group fits the mental model

In a fixed replica set, a quorum calculation assumes the read and write participants come from the same designated replicas. If one preferred replica is down, strict quorum rules may reject a write. A sloppy quorum relaxes the placement rule: it accepts writes on reachable substitute nodes so the operation can continue, then tries to deliver those updates to the intended replicas later.

## Supplied names explained

Sloppy quorum improves write availability during some failures, but its acknowledgements may come from nodes outside the key's preferred replica set. Therefore the usual fixed-set arithmetic, such as R+W>N, does not automatically prove that a later read intersects the write. The design needs version/conflict handling, hinted handoff, and anti-entropy to converge. Availability still depends on reachable substitute capacity and the system's policy; it is not an unconditional promise.

In Amazon's Dynamo description, the coordinator selects the first N healthy nodes in the preference list for storage, rather than requiring exactly the top N intended replicas. Cassandra's tunable consistency levels describe a related but distinct contract; do not assume Cassandra implements Dynamo's sloppy-quorum behavior merely because its architecture is Dynamo-inspired.

## Cross-item comparison

Strict quorum placement can preserve a simpler intersection argument but may fail operations when designated replicas are unavailable. Sloppy quorum can accept a write through substitute nodes, at the cost of more complicated reconciliation and weaker immediate visibility guarantees. Decide whether the product requires writes to remain available or must reject writes that cannot reach the intended consistency set.

## Examples

For a key with preferred replicas A, B, and C, suppose B is unreachable. A sloppy write may be stored on A, C, and substitute D. A later read sent only to A, B, and C may miss the newest value on D until handoff or repair moves it. Trace acknowledgement, read placement, version reconciliation, and recovery; do not conclude that a two-of-three quorum intersection applies across these different sets.

## Common mistakes

- Applying fixed-replica quorum arithmetic when substitutes participated.
- Assuming a successful write immediately appears on every preferred replica.
- Treating sloppy quorum as a durability policy without checking substitute persistence.
- Assuming eventual handoff resolves concurrent versions without a defined conflict rule.

## Knowledge checks with answers

1. **Why can R+W>N fail to prove intersection under sloppy quorum?** The responders may not be drawn from the same fixed replica set.
2. **What mechanisms help after a substitute accepts a write?** Handoff and anti-entropy repair, together with version/conflict reconciliation.
3. **What product behavior does sloppy quorum favor?** Accepting writes during some preferred-replica failures, with more complex convergence afterward.
