# distributed systems consistency coordination and convergence — Reference: Hinted handoff

Sources: [Handbook module 3](https://hld.handbook.academy/curriculum/distributed-systems-theory/), [Dynamo paper](https://cdn.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf), [Cassandra hints](https://cassandra.apache.org/doc/stable/cassandra/managing/operating/hints.html), [Cassandra repair](https://cassandra.apache.org/doc/stable/cassandra/managing/operating/repair.html).

## Scope and version

This lesson compares hinted handoff in the original Dynamo design with hints in Apache Cassandra 5.0. Retention, persistence, delivery, and repair guarantees are product- and version-specific; Cassandra examples below use its 5.0 documentation.

## How this group fits the mental model

When a replica is temporarily unavailable, a coordinator can keep a record that the replica missed a mutation. Later, it attempts to replay that mutation to the intended replica. The hint is a repair aid for a bounded outage window; it is not the replica itself and does not guarantee that every missed update will arrive.

## Supplied names explained

A hint is a temporary record of work a replica missed, kept by another node so the mutation can be replayed after recovery. This improves recovery from short outages but adds disk use, replay traffic, and backlog. Monitor hint volume and age, ensure enough disk headroom, and tune delivery so replay does not overwhelm foreground traffic. A node or coordinator can fail before replay, and finite retention can end while a target remains unavailable.

In Cassandra 5.0, the coordinator stores hints on its local filesystem; the documented default maximum hint window is three hours. Hint files are not guaranteed to be fsynced by the periodic flush setting, and Cassandra calls hints best-effort. These are implementation details, not universal properties of hinted handoff. The Cassandra docs describe a successful LOCAL_QUORUM example with RF=3 as acknowledged by two replicas while a hint is stored for the unavailable third; do not claim the hint itself makes every replica durable.

Replaying the original mutation timestamp allows Cassandra hint application to be idempotent and not overwrite a future mutation. Deletions still require attention: tombstones can expire, and unrepaired replicas can resurrect deleted data. Run the product’s repair process within its tombstone-retention constraints. Hints reduce inconsistency duration; they do not replace read repair or scheduled anti-entropy repair.

## Cross-item comparison

Hinted handoff is targeted replay to a known replica after missed writes. Read repair reconciles data encountered by reads. Anti-entropy repair compares replica ranges (Cassandra uses Merkle trees) and streams differences; Cassandra repair is operator-run rather than automatic. Hints and read repair are best-effort paths and do not remove the need for planned repair. In Dynamo, hinted handoff handles temporary failures; replica synchronization with Merkle trees is the separate recovery path for longer or permanent divergence.

## Examples

In Cassandra RF=3 at LOCAL_QUORUM, two replicas acknowledge a write while the coordinator records a hint for an unavailable third replica. If the target returns within the hint window, the coordinator replays the mutation; if not, later read repair may fix rows read by clients, while scheduled anti-entropy repair covers replica ranges. Check hint backlog and disk, replay throttle, node outage duration, tombstone grace, and repair completion before assuming replicas converged.

## Common mistakes

- Treating a best-effort hint as a durable replica or a guaranteed write-ahead log.
- Assuming a hint queue is unbounded or retained until successful delivery.
- Treating hinted handoff as a substitute for Cassandra repair or Dynamo replica synchronization.
- Saying a Cassandra hint is fsynced merely because it is stored on local disk.
- Ignoring tombstone grace, expiration, coordinator failure, disk pressure, or replay backlog.

## Knowledge checks with answers

1. **What does a hint record?** A mutation that an intended replica missed, for later attempted delivery.
2. **Does Cassandra’s local hint storage make the hint a durable replica?** No. Hints are best-effort and their buffering/flush behavior has implementation-specific durability limits.
3. **What repairs discrepancies if a hint is lost or expires?** Read repair may reconcile data encountered by reads; anti-entropy repair compares and streams broader replica-range differences.
