# distributed systems consistency coordination and convergence — Reference: Sloppy quorum

Sources: [DeCandia et al., Dynamo paper](https://cdn.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf).

## Scope and version

This lesson explains sloppy quorum as used in Dynamo-style replication. Similar product terms can have different meanings; check each database's consistency contract.

## How this group fits the mental model

In a fixed replica set, a quorum calculation assumes the read and write participants come from the same designated replicas. If one preferred replica is down, strict quorum rules may reject a write. A sloppy quorum relaxes the placement rule: it accepts writes on reachable substitute nodes so the operation can continue, then tries to deliver those updates to the intended replicas later.

## Supplied names explained

Sloppy quorum improves write availability during some failures, but its acknowledgements may come from nodes outside the key's preferred replica set. Therefore the usual fixed-set arithmetic, such as R+W>N, does not automatically prove that a later read intersects the write. The design needs version/conflict handling, hinted handoff, and anti-entropy to converge. Availability still depends on reachable substitute capacity and the system's policy; it is not an unconditional promise.

In Amazon's Dynamo description, the coordinator uses the N highest-ranked reachable nodes in the preference list, which can include nodes beyond the N preferred replicas during failures. Those substitute nodes keep hinted data separately and later attempt delivery to the intended replica. This is distinct from Cassandra's documented write path: Cassandra coordinators send mutations to all replicas, and unavailable replicas can receive best-effort hints; Cassandra's documentation does not describe Dynamo's substitute-node sloppy-quorum contract. Do not infer identical behavior from the shared Dynamo-inspired architecture label.

## Cross-item comparison

Strict quorum placement can preserve a simpler intersection argument but may fail operations when designated replicas are unavailable. Sloppy quorum can accept a write through substitute nodes, at the cost of more complicated reconciliation and weaker immediate visibility guarantees. Decide whether the product requires writes to remain available or must reject writes that cannot reach the intended consistency set.

## Examples

For a key with preferred replicas A, B, and C, suppose B is unreachable. A sloppy write may be stored on A, C, and substitute D, with D recording B as the intended recipient. A later operation may contact a different set of N reachable preference-list nodes; fixed-set intersection is not guaranteed across those participant sets. Hinted handoff attempts to deliver D’s copy to B when B returns, while replica synchronization/anti-entropy addresses divergence that hints alone may not repair. Trace acknowledgement, read placement, version reconciliation, and recovery; do not conclude that a two-of-three quorum intersection applies across these different sets.

## Common mistakes

- Applying fixed-replica quorum arithmetic when substitutes participated.
- Assuming a successful write immediately appears on every preferred replica.
- Treating sloppy quorum as a durability policy without checking substitute persistence.
- Assuming eventual handoff resolves concurrent versions without a defined conflict rule.

## Knowledge checks with answers

1. **Why can R+W>N fail to prove intersection under sloppy quorum?** The responders may not be drawn from the same fixed replica set.
2. **What happens to a copy stored on substitute D for unavailable B?** D records a hint and later attempts to deliver the replica to B; a separate synchronization/anti-entropy path handles divergence hints do not repair.
3. **What product behavior does sloppy quorum favor?** Accepting writes during some preferred-replica failures, with more complex convergence afterward.
