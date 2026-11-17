# system design tradeoffs and decision methods — Reference: Leader-follower vs multi-leader vs leaderless replication

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Dynamo paper](https://assets.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf), [PostgreSQL streaming replication](https://www.postgresql.org/docs/current/warm-standby.html), [Cassandra replication and consistency](https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html).

## Scope and version

Replication topology determines who accepts writes and how replicas reconcile. These labels cover a family of designs; they do not by themselves specify consistency, failover safety, or durability.

## How this group fits the mental model

**Leader-follower:** one leader accepts or orders writes and followers copy its log/state. It makes a primary write order straightforward and supports read replicas, but replication lag can make follower reads stale. Failover must choose a sufficiently up-to-date leader and prevent the former leader from accepting writes (fencing/epochs).

**Multi-leader:** multiple leaders accept writes, often in different regions, and exchange updates. It can improve local write latency and availability, but concurrent updates need conflict detection/resolution or partitioning ownership. Conflict policy must match business semantics; last timestamp wins may lose intent.

**Leaderless:** clients/coordinators contact replica sets and use quorum/version reconciliation rather than one fixed write leader for every key. Dynamo-style systems may use sloppy quorums, version vectors, hinted handoff, and anti-entropy. Quorum arithmetic depends on placement and protocol assumptions; leaderless does not mean coordination-free or strongly consistent by default.

## Supplied names explained

Every topology must define acknowledgment durability, read consistency, membership changes, conflict handling, repair, replay, and client behavior after ambiguous timeout. Application-level uniqueness or balance invariants may require a consensus/transaction layer even when storage replication is multi-leader or leaderless.

## Cross-item comparison

| Requirement | Likely fit | Must still solve |
|---|---|---|
| Single ordered write authority and simpler conflict model | Leader-follower | Failover, lag, stale reads, fencing |
| Low-latency writes in several regions | Multi-leader | Concurrent conflict policy and ownership |
| Replicated key-value availability with tunable replica participation | Leaderless | Quorum placement, version merge, repair |

Pick by invariants, geographic latency, write conflict rate, failure policy, and operational skill—not by the topology label alone.

## Examples

In a global profile service, region A and region B both accept a name update during a network split. After connectivity returns, multi-leader replication must choose or expose the conflict. If the same topology is used for account balance, two independently accepted debits may violate a nonnegative invariant. A leader-follower design instead routes both writes to one authority and may reject/queue writes in the isolated region. A leaderless design needs a defined quorum and reconciliation path; simulate substitute replicas and delayed repair.

## Common mistakes

- Assuming followers are current or that asynchronous replication provides read-your-writes.
- Promoting a new leader without fencing a paused former leader.
- Treating multi-leader conflict resolution as an application-correct merge.
- Assuming leaderless quorum reads/writes imply linearizability or omit repair obligations.

## Knowledge checks with answers

1. **Which topology naturally creates one primary write order?** Leader-follower, with failover/fencing requirements.
2. **What new issue comes with multi-leader writes?** Concurrent updates and their conflict semantics.
3. **Does leaderless mean no coordination or repair?** No; quorum participation, reconciliation, and anti-entropy may still be required.
