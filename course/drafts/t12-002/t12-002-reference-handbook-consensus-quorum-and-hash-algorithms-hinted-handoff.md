# distributed systems consistency coordination and convergence — Reference: Hinted handoff

Sources: [Handbook module 3](https://hld.handbook.academy/curriculum/distributed-systems-theory/), [Dynamo paper](https://assets.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf), [Cassandra hints](https://cassandra.apache.org/doc/stable/cassandra/managing/operating/hints.html), [Cassandra repair](https://cassandra.apache.org/doc/stable/cassandra/managing/operating/repair.html).

## Scope and version

This lesson explains the temporary missed-write record used by hint-based replication. Persistence, expiry, delivery, and monitoring settings are product-specific.

## How this group fits the mental model

When a replica is temporarily unavailable, a coordinator can keep a record that the replica missed a mutation. Later, it attempts to replay that mutation to the intended replica. The hint is a repair aid for a bounded outage window; it is not the replica itself and does not guarantee that every missed update will arrive.

## Supplied names explained

Hints consume storage at coordinators and require expiry, retry, back-pressure, and observability policies. A coordinator may fail, a hint may expire, or the replica may remain unavailable beyond the retention window. Cassandra explicitly treats hints as best-effort and lists read repair and full/incremental anti-entropy repair as additional convergence mechanisms.

Replay must also coexist with newer writes and deletions. The database's version/timestamp reconciliation determines whether an old hinted mutation is superseded; tombstone retention and repair timing matter. Never build an application workflow that treats hint acknowledgement as proof that every replica durably stores the value.

## Cross-item comparison

Hinted handoff is targeted replay to replicas believed to have missed writes. Read repair fixes discrepancies discovered by reads, while anti-entropy repair compares broader replica ranges on a schedule or operator command. Hints can reduce inconsistency duration but do not replace those wider repair paths.

## Examples

Replica B is unavailable for 20 minutes while coordinator A accepts a mutation at the configured write threshold and stores a hint for B. When B returns, A replays the hint. If A fails before replay, or the hint expires, B may remain stale; a later read repair or anti-entropy repair must detect and fix the difference. Define how operators monitor pending hint volume and what repair covers a missed hint.

## Common mistakes

- Treating a hint as a durable replica or guaranteed write-ahead log.
- Assuming a hint queue is unbounded or retained until successful delivery.
- Treating hinted handoff as a substitute for full/incremental repair.
- Ignoring old writes, tombstones, expiration, coordinator failure, and hint backlog.

## Knowledge checks with answers

1. **What does a hint record?** A mutation that an intended replica missed, for later attempted delivery.
2. **Does successful hint storage prove every replica has the update?** No; it proves at most that the current implementation accepted the hint under its write path.
3. **What repairs discrepancies if a hint is lost or expires?** Read repair may fix data encountered by reads; anti-entropy repair compares wider ranges.
