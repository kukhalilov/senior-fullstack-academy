# system design tradeoffs and decision methods — Reference: Single-region vs multi-region deployment

Sources: [Microsoft Azure Well-Architected: high availability across zones and regions](https://learn.microsoft.com/en-us/azure/architecture/high-availability/building-solutions-for-high-availability), [Google Cloud: disaster recovery](https://docs.cloud.google.com/architecture/disaster-recovery), [Google Cloud: multi-regional deployment archetype](https://docs.cloud.google.com/architecture/deployment-archetypes/multiregional), [Google Cloud: recovery testing](https://docs.cloud.google.com/architecture/framework/reliability/perform-testing-for-recovery-from-data-loss).

## How this group fits the mental model

A deployment can run in multiple availability zones in one region and survive some local infrastructure failures. That does not necessarily protect it from losing the whole region. A second region can help with regional disaster recovery or serve distant users, but only if the application, data, traffic routing, dependencies, and operators can actually use it. “We deployed twice” is not a recovery plan.

First specify the failure scope and user promise: which failures matter, how long service may be interrupted, how much recent data may be lost, which operations must continue, and where data is allowed to reside. Two core disaster-recovery measures are:

- **Recovery Time Objective (RTO):** the target maximum time to restore the service after a disruption.
- **Recovery Point Objective (RPO):** the target maximum amount of data loss, usually expressed as the time window of changes that might not be recovered.

An RTO/RPO target is a requirement to design and test against; it is not a guarantee merely because a cloud provider offers regions.

## Supplied names explained

| Pattern | Normal traffic and recovery | Benefits | Costs and failure concerns |
| --- | --- | --- | --- |
| One region, with appropriate zone redundancy | One regional service handles traffic; zone-level redundancy may survive supported zone failures | Simplest data ownership, lower cross-region complexity and cost; good baseline when regional outage targets permit | Does not by itself provide recovery from a full regional outage; backups still need separate failure-domain planning |
| Active-passive multi-region | Primary handles normal traffic; secondary is prepared to take over, either warm, pilot-light, or scaled up after failure | Clearer single-writer model; can reduce data conflicts; recovery capacity can be sized to objectives | Failover may be manual or automated; standby readiness, capacity, data lag, routing, dependencies and failback all need practice; less than zero recovery time is not implied |
| Active-active multi-region | More than one region handles production requests concurrently | Can place users nearer to compute, use capacity across regions, and keep some traffic flowing after a regional failure | More complex state ownership, write conflicts, consistency, global routing, capacity headroom, testing and cost; some operations may still depend on a single region |

These are patterns, not vendor-specific feature guarantees. Some systems permit multi-region reads but only one write region; some offer multi-writer capabilities with product-specific conflict semantics. Verify the selected service’s documented behavior and limits.

## Data replication shapes the trade-off

- **Synchronous replication** waits for a remote acknowledgement before treating a write as complete, according to the system’s protocol. It can provide a smaller data-loss window for acknowledged writes, but cross-region round trips add latency and a remote-region problem may block or reject writes.
- **Asynchronous replication** allows the primary to acknowledge before a remote copy catches up. This usually keeps the write path from waiting for inter-region acknowledgement, but a sudden primary loss can leave recent acknowledged changes absent from the secondary. Replication lag and promotion rules therefore affect RPO and consistency.
- Replication alone does not define which copy is authoritative, how conflicting writes are resolved, whether all required tables/files/configuration are copied, or when a secondary is safe to promote. Those are application and service contract questions.

For example, an online store could keep the authoritative inventory reservation in one region while serving catalog reads nearby. After a regional outage, the team may accept a brief interruption rather than risk selling the same final item twice. A social feed may accept temporarily stale reads or mergeable user updates to preserve more local activity. The right decision follows the operation’s invariant and recovery objective, not a blanket rule that every write must be globally synchronous.

## Cross-item comparison

1. **State objectives:** define RTO/RPO for region, zone, service, and data-loss scenarios; identify which user journeys must be restored first.
2. **Map dependencies:** include database, object storage, queues, identity, secrets and keys, DNS or global routing, certificates, container images, external providers, control-plane operations, and staff access. A healthy second compute region is useless if a required dependency exists only in the failed region.
3. **Choose data ownership and replication:** specify writer/leader behavior, replication mode and lag, consistency of reads after promotion, conflict handling, backups, and what happens to in-flight work.
4. **Provide traffic and capacity:** determine how clients reach the surviving region, how health is detected, how quickly routing converges, whether the secondary has enough quota and capacity, and what overload behavior protects it from a sudden traffic surge.
5. **Define failover and failback:** establish who or what declares an incident, how split brain is prevented, how writes are fenced, how data is reconciled, and how traffic returns after recovery. Automated failover can shorten response time but a false promotion or two active writers can corrupt state.
6. **Test and measure:** regularly exercise backups, restore, regional failover, dependency loss, and failback. Verify data integrity as well as the measured RTO and RPO. Update the runbook when product behavior or architecture changes.
7. **Account for constraints:** compare continuous standby, duplicated production capacity, cross-region traffic and storage, operational staffing, security exposure, privacy, and data-residency rules. Geographic separation does not automatically satisfy legal requirements.

## Examples

Start with one region plus the appropriate in-region redundancy and tested backups when its recovery characteristics meet the product requirement. Add a second region when measured business or user needs justify regional recovery or geographic serving. Choose active-passive when preserving a clear write authority is more valuable than serving all regions concurrently; consider active-active only when its latency/availability benefits warrant the extra state and operational complexity. Calculate the full recovery path and test it before making an RTO/RPO promise.

## Common mistakes

- Confusing availability-zone redundancy, backups, and regional disaster recovery; they address different failure scopes.
- Claiming a multi-region deployment guarantees failover, zero downtime, or zero data loss without specifying service behavior, replication mode, routing, and tested objectives.
- Forgetting that DNS, identity, secrets, deployment artifacts, quotas, external APIs, or control-plane dependencies may be unavailable or region-bound.
- Promoting a stale replica without assessing lost acknowledged writes, duplicate processing, or split-brain risk.
- Designing failover but never testing failback, restore integrity, and the operational steps during an incident.
- Selecting distant regions without checking latency, data residency, service availability, and the cost of cross-region traffic and duplicated capacity.

## Knowledge checks with answers

1. **If asynchronous replication is behind by 40 seconds when the primary region is lost, what should the RPO discussion include?** Whether the recovery target permits losing up to that recent window, how actual lag is monitored, and whether promotion or other recovery can reduce or worsen the loss. The exact recoverable data depends on the product protocol and failure sequence.
2. **Can a single-region architecture still be highly available?** It can be designed for resilience to some component and zone failures; whether that meets the product’s full availability requirement depends on failure scope and architecture. It does not automatically cover loss of the entire region.
3. **Does active-active mean every operation is writable everywhere without conflict?** No. Write capability and conflict behavior are product- and data-model-specific, and some operations may retain a single authority.

## Scope and version

The recovery objective definitions and architecture trade-offs are cross-checked against the cited Google Cloud and Microsoft architecture guidance. Exact service behavior is intentionally not generalized across vendors. This lesson remains in draft pending full claim-by-claim audit and manifest omission check.
