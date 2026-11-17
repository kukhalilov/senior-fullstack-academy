# distributed systems consistency coordination and convergence — Reference: Read quorum and write quorum

Sources: [DeCandia et al., Dynamo paper](https://cdn.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf), [Cassandra 5.0 replication and tunable consistency](https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html).

## Scope and version

This lesson introduces read and write quorum thresholds for replicated data. The guarantees depend on the database protocol, replica membership, version ordering, and failure behavior.

## How this group fits the mental model

With N fixed replicas, a write quorum W is the number of acknowledgements needed before a write succeeds; a read quorum R is the number of replica responses a read collects. If R+W>N, every fixed-set read quorum intersects every fixed-set write quorum. If 2W>N, every pair of fixed-set write quorums intersects. These are set-intersection facts, not complete consistency guarantees.

## Supplied names explained

To turn intersection into a useful read result, the protocol must retain enough version information, compare or order concurrent values correctly, and return/reconcile the appropriate value. Membership changes, sloppy quorum substitutes, local versus global datacenter scopes, speculative requests, and failed writes can alter the argument. To provide linearizability, a protocol must add ordering and recovery rules; a leader or consensus-backed protocol is one common approach, while quorum intersection is only one building block.

Cassandra's consistency levels select response thresholds for a particular operation, while writes are sent to all replicas; its documentation describes when quorum intersections make writes visible to subsequent reads. This should not be generalized to every datastore or called linearizability without checking the full contract.

## Work through the thresholds

| Condition for a fixed replica set | What the arithmetic guarantees | What it does not guarantee alone |
| --- | --- | --- |
| `R + W > N` | Every read quorum of size `R` intersects every successful write quorum of size `W` | Which version is returned, conflict resolution, monotonic reads, or linearizability |
| `2W > N` | Any two write quorums intersect | That overlapping writes are ordered or that concurrent writes cannot conflict |
| `R + W <= N` | A read and write quorum can be disjoint | They may still intersect in a particular execution, but overlap is not guaranteed |
| Sloppy quorum / substitute replicas | A chosen number of nodes may acknowledge work during failure | The fixed-set intersection proof no longer applies unless the protocol separately establishes the needed membership/version rules |

Example: with `N=5`, `R=3`, and `W=3`, the read/write sets must share at least one replica because `3+3>5`. With `R=2` and `W=3`, they can be disjoint. With `W=2`, two write quorums can also be disjoint because `2W` is not greater than five.

### Cassandra 5.0 example

For a keyspace with replication factor `RF=3`, Cassandra `QUORUM` requires two replica responses. A `QUORUM` write and a later `QUORUM` read therefore intersect, and Cassandra documents that this makes the acknowledged write visible to the later read. Cassandra still sends writes to all replicas and waits for the configured consistency level before responding. Its conflict resolution uses mutation timestamps and last-write-wins behavior; the intersection property does not establish causal ordering between concurrent updates. Consistency level, datacenter scope, read repair, and replica failure behavior are part of the product contract.

## Cross-item comparison

Larger quorums can guarantee overlap under the fixed-set conditions above, but require more nodes to respond and can increase latency or reduce availability. Configure R and W together with replication factor, region scope, failure domains, version reconciliation, and whether concurrent writes need serialization.

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
