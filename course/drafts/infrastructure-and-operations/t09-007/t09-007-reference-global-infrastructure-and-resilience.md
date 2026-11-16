# cloud computing foundations and architecture — Reference: Geography, failure domains, redundancy, and recovery objectives

Sources: [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/), [Azure application architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), [AWS Well-Architected Framework definitions](https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html), [AWS VPC basics](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-subnet-basics.html), and [AWS subnet route tables](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-route-tables.html).

## Scope and version

This covers general cloud geography and resilience terminology. Region/zone semantics, service support, replication guarantees, maintenance, and failover are service-specific and change over time. Check current product docs and residency/legal requirements before choosing a deployment location.

## How this group fits the mental model

Resilience requires placing independent capacity and data across failure domains, routing traffic to healthy components, and practicing recovery. Names such as “zone redundant” or “global” are not substitutes for verifying which failures the service survives, what consistency it provides, and how customers initiate or automate failover.

## Supplied names explained

### Geography and placement

- **Cloud region** — Geographic cluster of provider infrastructure and services. Region choice affects latency, residency, service availability, cost, and recovery design.
- **Availability zone** — Provider-defined isolated location within a region; exact physical separation and service semantics vary.
- **Availability set** — Provider-specific logical placement across update/fault domains (Azure construct); not a universal cloud object.
- **Datacenter** — Physical facility containing compute/network/storage; customers often cannot choose a specific facility inside a region/zone.
- **Edge location** — Distributed provider point closer to users for delivery, caching, DNS or compute; distinct from a full region.
- **Local zone** — Provider extension of a region that places selected services nearer a metro/edge location; service catalog and latency/resilience differ.
- **Region selection** — Evaluate user latency, legal residency, service feature availability, dependency placement, quota, cost, staff access, and disaster recovery—not geography alone.
- **Data residency** — Requirement about where data is stored/processed, depending on law/contract and data type; backups, telemetry and support access may also matter.
- **Data sovereignty** — Legal/regulatory control over data due to jurisdiction/ownership, not simply physical disk location.
- **Regional service** — Service instance whose control/data resources are tied to a region; a regional service may still use zone redundancy internally.
- **Global service** — Service with global namespace/control or distributed endpoints; not necessarily globally replicated data or zero-latency worldwide.
- **Zonal resource** — Resource deployed in or pinned to a specific zone; zone failure may make it unavailable.
- **Zone-redundant resource** — Service replicates or distributes across zones according to its contract; confirm write/read behavior and failover guarantees.
- **Multi-zone deployment** — Application instances across multiple zones, requiring load balancing, replicated/shared dependencies and sufficient per-zone capacity.
- **Multi-region deployment** — Workload spans regions for latency or disaster recovery; adds data consistency, routing, cost, identity and operational complexity.
- **Region pair** — Provider-specific relationship between regions for selected recovery/replication features; not automatic duplication or a universal pairing guarantee.
- **Fault domain** — Group of resources likely to fail together due to shared hardware/power/network location.
- **Update domain** — Provider-specific grouping used to sequence planned maintenance/reboots; availability sets may distribute instances across domains.
- **Failure domain** — A boundary within which one fault can affect multiple components; examples include process, host, rack, zone, region, identity provider, or control plane.

### Redundancy, replication, and recovery

- **Redundancy** — Extra independent capacity/components to survive selected failures; shared dependencies can negate it.
- **High availability** — Design that meets an uptime/continuity target through redundancy, detection, routing and recovery; it requires realistic SLO and tested failure behavior.
- **Disaster recovery** — Processes/architecture to restore workload/data after major disruption, including people, access, communications, backups, failover and validation.
- **Active-active deployment** — Multiple sites serve production concurrently. It can improve availability/latency but requires conflict/consistency strategy, global routing, capacity, and coordinated changes.
- **Active-passive deployment** — Primary handles traffic while standby is prepared for failover. It can simplify normal operation but requires replication, activation procedure and capacity testing.
- **Synchronous replication** — A write waits for replica acknowledgment under a defined protocol; can reduce committed-data loss but adds latency and has quorum/distance constraints.
- **Asynchronous replication** — Writes acknowledge before replica catches up; allows lag and nonzero RPO during failure.
- **Recovery time objective (RTO)** — Target maximum time to restore a service after disruption; define start/end measurement and dependencies.
- **Recovery point objective (RPO)** — Target maximum amount of time/data that can be lost after recovery; replication lag and backup interval affect it.
- **Cloud failover** — Shift traffic/workload to another instance/site after failure, automatically or manually; ensure decision, data state, identity and DNS/routes align.
- **Cloud failback** — Return service to preferred site after recovery. Reconcile writes and avoid split-brain before switching back.
- **Service health dashboard** — Provider's view of service incidents/maintenance; useful evidence but not a substitute for workload telemetry or synthetic user checks.
- **Planned maintenance event** — Provider or customer scheduled updates/restarts; design for interruption where service contract requires.
- **Cloud service SLA versus workload availability** — Provider SLA covers specified service metric/exclusions. Workload availability is end-to-end across app, identity, network, data, DNS, deployment and customer operations.

## Cross-item comparison

| Strategy | Expected failure tolerance | Main cost/complexity |
|---|---|---|
| Single zonal | Component/host faults only if separately handled | Lowest; zone outage may take service down |
| Multi-zone | Selected zone failures | Replication, routing and spare capacity |
| Active-passive multi-region | Regional outage after failover | Standby cost, RTO, replication lag and procedure |
| Active-active multi-region | Some regional outages with traffic continuity | Data conflicts, global routing, high cost and operational complexity |
| Backup and restore | Corruption/deletion and selected disasters | Recovery time, restore capacity and RPO between backups |

## Examples

If a database has a one-hour asynchronous replication lag, a regional failover may violate a five-minute RPO even if the app starts quickly. If RTO is two hours, a manual approval and restore may be acceptable, but only if the restore has been practiced within that time. Record the chosen failure scenario and measure RTO/RPO during exercises.

## Common mistakes

- Assuming two instances in one region are independent when they share a zone or control dependency.
- Assuming a provider pairs regions and replicates a service automatically.
- Using a global product name as proof that data is stored globally or legally compliant.
- Treating a snapshot as a full backup if it shares identity, account, encryption key, or deletion controls with production.
- Failing over without resolving write ownership/consistency, then creating split brain.
- Promising an RPO/RTO without testing backup restore and capacity.

## Knowledge checks with answers

1. What is the difference between RTO and RPO? **RTO is time to restore; RPO is acceptable data loss measured as time.**
2. Why can synchronous replication increase latency? **A write waits on acknowledgment from a remote replica/quorum.**
3. Is multi-region automatically more available? **No; shared identity, routing, data, deployment and operator failures can still take both regions down.**
4. Why is failback a separate plan? **Data may have changed during failover and needs reconciliation before traffic returns.**

