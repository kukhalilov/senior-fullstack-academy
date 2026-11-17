# distributed systems consistency coordination and convergence — Reference: Read quorum and write quorum

Sources: [Handbook module 3](https://hld.handbook.academy/curriculum/distributed-systems-theory/), [Dynamo paper](https://assets.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf), [Cassandra replication and consistency](https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html).

## Scope and version

This lesson introduces read and write quorum thresholds for replicated data. The guarantees depend on the database protocol, replica membership, version ordering, and failure behavior.

## How this group fits the mental model

With N fixed replicas, a write quorum W is the number of acknowledgements needed before a write succeeds; a read quorum R is the number of replica responses a read collects. If R+W>N, every fixed-set read quorum intersects every fixed-set write quorum. If 2W>N, every pair of fixed-set write quorums intersects. These are set-intersection facts, not complete consistency guarantees.

## Supplied names explained

To turn intersection into a useful read result, the protocol must retain enough version information, compare or order concurrent values correctly, and return/reconcile the appropriate value. Membership changes, sloppy quorum substitutes, local versus global datacenter scopes, speculative requests, and failed writes can alter the argument. Strong consistency can require a leader or a consensus-backed protocol rather than merely intersecting thresholds.

Cassandra's consistency levels select response thresholds for a particular operation, while writes are sent to all replicas; its documentation describes when quorum intersections make writes visible to subsequent reads. This should not be generalized to every datastore or called linearizability without checking the full contract.

## Cross-item comparison

Larger quorums can improve overlap and reduce the number of stale responses that determine a read, but require more nodes to respond and can increase latency or reduce availability. Configure R and W together with replication factor, region scope, failure domains, and whether concurrent writes need serialization.

## Examples

For N=5, choose W=3 and R=3. Any three responders intersect any other three, so a read set overlaps a successful write set. But if the common replica is stale, if version reconciliation chooses incorrectly, or if the participants are substitute nodes outside the fixed set, arithmetic alone does not tell you what the client observes. Add a failed write and a concurrent write to the trace before claiming the required guarantee.

## Common mistakes

- Claiming R+W>N proves linearizability without stating the fixed-set and version assumptions.
- Assuming the latest wall-clock timestamp always means the causally latest write.
- Applying fixed-set arithmetic to sloppy quorums or membership transitions.
- Ignoring the latency/availability cost of requiring more responses.

## Knowledge checks with answers

1. **With N=5,R=3,W=3, do fixed-set read/write quorums intersect?** Yes, because 3+3>5.
2. **Does that prove linearizability?** No; protocol-level version, ordering, failure, and membership rules matter.
3. **What availability cost can a larger quorum impose?** More replicas must respond before the operation completes.
