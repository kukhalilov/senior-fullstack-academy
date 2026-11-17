# distributed systems consistency coordination and convergence — Reference: Read repair

Sources: [Handbook module 3](https://hld.handbook.academy/curriculum/distributed-systems-theory/), [Cassandra 5.0 read repair](https://cassandra.apache.org/doc/stable/cassandra/managing/operating/read_repair.html), [Cassandra repair](https://cassandra.apache.org/doc/stable/cassandra/managing/operating/repair.html).

## Scope and version

This lesson uses Apache Cassandra 5.0 to make read repair concrete. Other databases may use the term for different mechanisms.

## How this group fits the mental model

Replicas can disagree because writes were missed, delayed, or only partly acknowledged. During a read, the coordinator compares responses from the replicas needed by the requested consistency level. If it finds a mismatch, read repair sends the newer reconciled data to stale replicas involved in that read. This repairs the data touched by that request, not every partition in the cluster.

## Supplied names explained

In Cassandra 5.0, blocking read repair waits for repair writes to reach the requested consistency level and supports monotonic quorum reads: under the documented conditions, successive quorum reads do not go backward after a failed quorum write. It can break partition-level write atomicity when only part of a multi-row partition write is read and repaired. The table option `read_repair='NONE'` reconciles data for the response without sending repairs; this preserves partition-level write atomicity but does not provide the same monotonic quorum-read property.

Read repair adds work and latency to reads that discover mismatches. It is distinct from hinted handoff, which replays a recorded missed mutation, and anti-entropy repair, which compares broader replica ranges. Neither a successful read nor a read-repair setting proves that all data across all replicas is synchronized.

## Cross-item comparison

Use blocking read repair where the monotonic-quorum-read property is required and its write-atomicity tradeoff is acceptable. Use NONE when preserving partition-level write atomicity is more important and the read model can tolerate a value appearing in one read then disappearing from a later read after a failed quorum write. Schedule or operate anti-entropy repair for broader convergence regardless of which rows users happen to read.

## Examples

Two replicas store a partition with rows x and y. A batch intends to update both, but a failed write leaves only one replica with the newer values. A later query selects only x. Blocking read repair may make x converge among the read replicas; it does not necessarily repair y, and this granular repair can expose a partially applied partition update. With NONE, the read returns reconciled x without repairing replicas, preserving partition-level write atomicity while sacrificing the same monotonic-quorum-read guarantee.

## Common mistakes

- Calling a read repair a cluster-wide synchronization job.
- Assuming every database's “read repair” has Cassandra's semantics.
- Ignoring the Cassandra BLOCKING versus NONE tradeoff.
- Treating repair-on-read as a replacement for scheduled anti-entropy repair.

## Knowledge checks with answers

1. **Which data can a read repair cover?** The data/rows and replicas involved in the read, not the entire cluster.
2. **What does Cassandra BLOCKING favor?** Monotonic quorum reads, with a possible loss of partition-level write atomicity.
3. **What does Cassandra NONE favor?** Partition-level write atomicity, without the same monotonic-quorum-read guarantee.
