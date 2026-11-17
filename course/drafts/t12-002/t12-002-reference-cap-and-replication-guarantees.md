# distributed systems consistency coordination and convergence — Reference: Partition tradeoffs and replication guarantees

Sources: [Gilbert and Lynch, Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf), [Abadi, Problems with CAP, and Yahoo’s little known NoSQL solution](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf), [Apache Cassandra 5.0 replication and consistency](https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html), [Cassandra hinted handoff](https://cassandra.apache.org/doc/stable/cassandra/managing/operating/hints.html), [Cassandra read repair](https://cassandra.apache.org/doc/stable/cassandra/managing/operating/read_repair.html), [Cassandra repair](https://cassandra.apache.org/doc/stable/cassandra/managing/operating/repair.html).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `CAP theorem` — Gilbert and Lynch formalize an impossibility for an atomic (linearizable) read/write object: with faulty communication that may delay or lose messages, the system cannot guarantee both a response to every request and a single real-time-consistent order. For practical design, CAP is commonly framed as the consistency/availability tradeoff when a partition actually occurs. It does not rank all designs or imply every architecture chooses exactly two fixed features.
- `PACELC` — Abadi’s formulation says that if a partition occurs, a system trades availability against consistency (P→A/C); else, during normal operation, it can trade latency against consistency (E→L/C). It is a useful classification lens, not a protocol or a complete product taxonomy.
- `Read quorum` — A configured response threshold for a read in a replication protocol. Whether it observes a concurrent or prior write depends on replica placement, version comparison, read/write paths, and the protocol’s consistency semantics.
- `Write quorum` — A configured acknowledgement threshold for a write. In a simple fixed replica set with RF replicas and compatible version semantics, choosing read threshold R and write threshold W with R + W > RF makes the sets intersect; intersection alone does not prove linearizability or freshness.
- `Sloppy quorum` — In Dynamo-style systems, when preferred replicas are unavailable, a write may be accepted by reachable substitutes. The substitute set may not intersect a later read’s replica set, so temporary availability does not provide the simple fixed-set quorum guarantee; handoff and anti-entropy are recovery mechanisms.
- `Hinted handoff` — A node temporarily records a hint for an unavailable intended replica and later forwards the mutation. Cassandra documents hints as best-effort; hints can expire or be unavailable after failure, so they do not replace repair.
- `Read repair` — A read path may compare versions and repair stale replicas participating in that read. Cassandra 5.0’s blocking mode can provide monotonic quorum reads, but only the data covered by a query is repaired; this can trade away partition-level write atomicity for granular reads. `NONE` avoids that read-repair side effect but does not provide the same monotonic-quorum-read property. It is not a full replica scan and does not replace operator-run anti-entropy repair.

## A concrete quorum calculation

Suppose a protocol replicates a partition to RF = 3 fixed replicas and uses W = 2 acknowledgements for writes and R = 2 responses for reads. Since R + W = 4 > 3, every such read set intersects every such write set. This is only a set-intersection argument: the protocol must also return/merge the correct versions and define concurrent writes. Cassandra consistency levels are implementation-specific; `QUORUM` is calculated from replication factor, while local levels scope acknowledgements to a data center. `ANY` may accept a hinted write without an ordinary replica response, and should not be mistaken for a read quorum.

## Repair and recovery are separate

Replication writes, hints, foreground read repair, and operator-run anti-entropy repair cover different failure windows. A successful quorum acknowledgement does not mean every replica has the value. Hints can bridge temporary outages; Cassandra repair compares replica data (using Merkle trees) and streams differences. Repair has I/O and network cost and is operator-run; a repair command covers ranges on the node where it runs, so a cluster-wide plan must cover the required nodes and ranges. Applications and operators still need to understand conflict resolution, repair scope, operational load, and what happens when hints or tombstones expire.

## Cross-item comparison

Use CAP/PACELC to describe tradeoffs, quorum thresholds to configure one replication protocol, and handoff/repair to recover missed replica updates. Do not infer a product’s user-visible guarantee from a quorum equation alone.

## Examples

For a three-replica cart service, choose R=2 and W=2 only after deciding what a read must mean. Show the write acknowledgement path, a read that overlaps the write, one unavailable preferred replica, and the recovery path. Then ask whether a substitute node accepted data, whether a later read can see it, and which repair process guarantees eventual convergence under the implementation’s documented assumptions.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.
- Claiming `R + W > RF` guarantees linearizability without stating fixed replica membership and the protocol’s version/order rules.
- Treating hinted handoff as guaranteed durable storage or as a substitute for anti-entropy repair.

## Knowledge checks with answers

1. **With RF=3, R=2, W=2, do the sets intersect?** Yes, under a fixed three-replica set, because 2+2>3; this fact alone does not prove a linearizable read.
2. **Does a hint guarantee a missed replica will be repaired?** No. Treat hints as a temporary best-effort path and use the system’s repair/reconciliation mechanism.
3. **What trade-off does Cassandra 5.0 read-repair mode expose?** `BLOCKING` can provide monotonic quorum reads; `NONE` preserves partition-level write atomicity. Neither turns a query into a full cluster repair.
