# scaling availability replication sharding load balancing — Reference: Replica roles, lag, failover, and data recovery boundaries

Sources: [Google Cloud reliability guidance](https://docs.cloud.google.com/architecture/framework/reliability), [highly available systems](https://docs.cloud.google.com/architecture/framework/reliability/build-highly-available-systems), and [Azure sharding pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/sharding).

## Scope and version

This is a provider-neutral reference for replica roles, visibility, failover, and recovery. Exact guarantees depend on the database or replication protocol and its configured acknowledgement rules. This lesson does not enumerate database-engine replication commands.

## How this group fits the mental model

Replication creates additional copies to improve availability or read capacity, but copies may lag. The design must define when a write is acknowledged, which copy may serve each read, who is authorized to write, and how an alternate is promoted or restored. Backup and point-in-time recovery solve a different problem from live replicas.

## Supplied names explained

- `Data replication` copies changes or state from one data holder to another. It can improve redundancy or distribute reads, but adds lag, bandwidth, consistency, and recovery decisions.
- `Primary-replica replication` has a primary that accepts writes and one or more replicas that receive changes. This role split can make ownership clear, but read freshness and promotion remain explicit concerns.
- `Leader-follower replication` is a general name for a leader accepting ordered writes and followers applying them. Names vary among systems; do not infer a particular protocol's guarantees from the label.
- `Synchronous replication` waits for a specified replica acknowledgement before reporting a write complete. It can reduce loss within the assumed acknowledgement/failure model but adds latency and may reduce write availability.
- `Asynchronous replication` acknowledges before all replicas confirm changes. It reduces writer latency but allows lag and may lose acknowledged writes if the writer fails before changes reach a promoted copy.
- `Replication lag` is the delay or unapplied change gap between a source and replica. Monitor it in units relevant to the system, such as time or log position.
- `Read replica` is a replica used to serve reads. It may return stale data, and its read capacity competes with replication apply work and other reads.
- `Write primary` is the currently authorized destination for writes. Failover requires ensuring there is only one accepted writer or that conflicts are safely handled.
- `Replica read staleness` is the possibility that a replica read omits a recently committed source write. It is expected under asynchronous or delayed replication.
- `Read-after-write consistency` means a client can observe its own successful write on a subsequent read. Routing to a replica without a freshness guarantee can violate it.
- `Strong consistency` commonly means operations behave as if they occur atomically in a single agreed order consistent with the model's real-time constraints. Specify the system's formal guarantee rather than using the term loosely.
- `Eventual consistency` means replicas can temporarily disagree but converge if updates stop and communication/reconciliation succeeds. It does not promise convergence time or conflict resolution without further rules.
- `Quorum read` and `Quorum write` use acknowledgement thresholds across a replica set. Their guarantees depend on replica count, read/write thresholds, failure independence, and protocol; intersecting counts alone are not a complete safety proof.
- `Split brain` occurs when multiple nodes accept writes as authoritative at the same time. It can create conflicting histories and requires prevention or explicit conflict resolution.
- `Fencing token` is an ownership value that advances when leadership changes. A resource checks the token and rejects stale owners, preventing a paused former leader from continuing writes.
- `Replica promotion` makes a replica the new writer. Choose the most appropriate up-to-date copy, fence the former writer, verify its state, and understand potential acknowledged-write loss.
- `Automatic failover` detects failure and promotes/reroutes without manual intervention. Detection errors, split-brain risks, and data-loss boundaries must be tested.
- `Manual failover` requires an operator decision to change ownership or routing. It can avoid unsafe automatic actions but may extend recovery time and depend on clear runbooks.
- `Failback and resynchronization` return service to a preferred node/site and reconcile the histories accumulated during failover. Copy direction and ownership must be explicit before resync.
- `Cross-region replication` sends changes between geographic regions. It can support regional recovery and locality but adds network delay, bandwidth cost, data residency, and conflict concerns.
- `Conflict resolution` determines the surviving or merged value when concurrent or divergent updates exist. Last-write-wins can discard meaningful updates; domain-specific merge rules may be required.
- `Replication versus backup` contrasts a live copy that tends to mirror current changes with a recoverable historical copy. Replication can faithfully copy accidental deletion or corruption; backup retention supports rollback to an earlier point.
- `Point-in-time recovery` restores or reconstructs data to a chosen time using a base backup and change history. Its usable point depends on retained logs, backup integrity, and restoration procedure.
- `Restore test` verifies that backup data can be located, decrypted, restored, and used by the application within objectives. Test the complete dependency and authorization path.
- `Acknowledged-write loss window` is the interval or set of successful writes that may not exist on the copy selected after failure. It depends on acknowledgement policy, replication progress, and failure timing.
- `Consistency versus availability during partition` describes the tradeoff that can arise when replicas cannot communicate: a design may reject or delay operations to preserve one consistent history, or continue locally with possible divergence. State the exact system behavior and business choice.

## Cross-item comparison

| Design | Write acknowledgement | Main benefit | Main risk |
|---|---|---|---|
| Synchronous replication | Waits for configured acknowledgements | Smaller loss window under those assumptions | Latency and reduced availability when acknowledgements fail |
| Asynchronous replication | Does not wait for all replicas | Lower writer latency | Lag and possible acknowledged-write loss |
| Live replica | Tracks current changes | Failover/read capacity | Can copy deletion/corruption; may be stale |
| Backup with history | Retains recoverable prior state | Recovery from logical damage | Restore time and retention/restore gaps |

## Examples

If the primary acknowledges a write before the read replica applies it, a subsequent replica read may show the old value. A client that needs read-after-write behavior can route that read to the writer or use a verified version/wait mechanism. The guarantee must be tied to the actual protocol.

During promotion, suppose replica B has applied changes through position 100 while the old writer accepted writes through 103. Promoting B may lose writes 101–103. Fence the old writer before allowing B to accept new writes, then record and communicate the recovery point.

## Common mistakes

- Saying synchronous means “zero data loss” without defining failure assumptions and acknowledgement quorum.
- Treating asynchronous replicas as current.
- Promoting a replica while the old writer can still accept writes.
- Assuming a quorum count alone proves consistency.
- Using a live replica as the only protection against deletion or corruption.
- Failing back without checking divergent histories and resynchronization direction.
- Defining RPO without measuring the actual acknowledged-write loss window.

## Knowledge checks with answers

1. Why can a replica read be stale? **Replication is delayed and the replica has not applied the latest write.**
2. Does a read replica replace backups? **No; it may copy destructive or corrupt changes and usually represents current state.**
3. What does a fencing token prevent? **A former owner from writing after a newer owner has taken over.**
4. What must be specified for quorum claims? **Replica count, thresholds, failure model, and the protocol's read/write semantics.**

### Exact terms covered

- `Data replication`
- `Primary-replica replication`
- `Leader-follower replication`
- `Synchronous replication`
- `Asynchronous replication`
- `Replication lag`
- `Read replica`
- `Write primary`
- `Replica read staleness`
- `Read-after-write consistency`
- `Strong consistency`
- `Eventual consistency`
- `Quorum read`
- `Quorum write`
- `Split brain`
- `Fencing token`
- `Replica promotion`
- `Automatic failover`
- `Manual failover`
- `Failback and resynchronization`
- `Cross-region replication`
- `Conflict resolution`
- `Replication versus backup`
- `Point-in-time recovery`
- `Restore test`
- `Acknowledged-write loss window`
- `Consistency versus availability during partition`
