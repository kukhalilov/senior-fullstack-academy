# cloud computing foundations and architecture — Core concepts and how they fit together

Sources: [Azure application architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/), [AWS Well-Architected Framework definitions](https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html), [AWS VPC basics](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-subnet-basics.html), and [AWS subnet route tables](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-route-tables.html).

## Learning objectives

Distinguish service models and control/data planes; reason about account and resource scopes; select regions and failure domains against requirements; define IAM access by principal/action/resource; compare compute/data/network integration options; express recovery using RTO/RPO; and connect operations telemetry and cost to architecture decisions.

## Prerequisites

Know basic networking (addresses, routes, DNS, ports), application components (API, database, queue), processes/containers, identity and access basics, and the idea of availability and backups. Provider examples are generic unless a lesson explicitly names Azure or AWS.

## Core concepts

### Service abstraction and responsibility

IaaS exposes virtualized compute/network/storage with substantial OS/runtime operation left to the customer. PaaS manages more of the host/runtime, while the customer configures app/data/access. SaaS delivers a finished application where the customer mainly manages users, data, settings, and integration. FaaS runs event-triggered functions with provider-managed infrastructure and event/runtime constraints. Serverless describes operations/consumption abstraction and can include databases, queues, and platforms, not only functions. These are spectra and provider offerings do not fit perfectly into one box.

The shared responsibility model assigns security and operations tasks per service. Provider responsibility for physical facilities does not mean customer data is automatically classified, access-controlled, backed up, or compliant. Managed service transfers operational tasks, not business accountability.

### Organization, scope, and provisioning

Organizations group accounts/tenants/projects/subscriptions and policy/billing scopes. Resource groups are lifecycle/management containers in some providers, not identical to an account boundary. A landing zone is a governed foundation for identity, network, policy, logging, and connectivity. Environments should have deliberate isolation, including credentials and data. Resource IDs are provider-specific locators and do not necessarily make an object portable.

IaC describes infrastructure in version-controlled code. Declarative provisioning states desired configuration and reconciles it; imperative provisioning issues ordered operations. Both can be valid. State handling, secret separation, review, drift detection, idempotence, and rollback remain important. Policy as code prevents or audits noncompliant configurations. Quotas are provider/service/region limits; design capacity and request quota increases before an emergency.

### Failure domains, geography, and recovery

Regions, zones, edge locations, local zones, datacenters, and availability sets have provider/service-specific meaning. A zone-redundant resource is not the same as a zonal resource; a region label alone does not guarantee isolation or residency. Region selection balances latency, service availability, sovereignty, cost, staff proximity, and recovery topology. Active-active improves some failover characteristics but adds consistency/routing/operations complexity; active-passive has simpler normal operation but may have slower failover and stale standby data.

RTO is the target time to restore service; RPO is the maximum acceptable data loss measured in time. Synchronous replication can reduce committed-data loss but adds latency and distance constraints; asynchronous replication permits lag and nonzero RPO. Backups, snapshots and replicas have different failure/corruption independence. Test restore and failback, not just backup creation.

### Architecture, operations, and economics

Workloads compose compute, network, data, messaging, integration and security. Distributed components add partial failure, retries, duplicate events, ordering, timeouts, capacity and observability needs. Autoscaling can respond to demand but requires warm-up, maximum bounds, quotas, and data-plane health; it does not fix bottlenecks automatically.

SLI is a measured indicator (e.g. successful request ratio); SLO is a target over a window; SLA is a provider/customer agreement with defined exclusions and remedies. A provider SLA for one service does not equal workload availability across dependencies. Design SLOs from user needs and measure end-to-end paths.

Cloud costs are multidimensional: provisioned/consumed compute, storage capacity and operations, requests, redundancy, license/support, and ingress/egress/inter-region transfer. Reserved capacity/savings plans trade commitment for discounts; spot/preemptible capacity is interruptible and suitable only for fault-tolerant work. Rightsize from measurements, retain headroom, and keep idle-resource cleanup safe.

## Mechanisms and relationships

1. A management/control-plane API creates or changes a resource; a data-plane endpoint serves workload operations. IAM and availability may differ between them.
2. Account, subscription, project, resource group and resource are different levels. Attach identity and policy at the narrowest useful scope, while understanding inheritance.
3. A region contains multiple zones in many providers, but service availability and zone independence are product-specific. Verify topology for the actual managed service.
4. A VPC/VNet route table directs traffic; an internet/NAT/private gateway, security rules, DNS, and service endpoint/private connectivity each solve different problems.
5. Redundancy prevents or tolerates selected failures; backup restores earlier state. A replica can replicate accidental deletion or corruption.
6. Cost allocation tags map spend to owners/workloads; a budget/alert reports or constrains according to platform capability, but may not stop spending instantly.

## Worked examples

**A team says it needs five-nines availability.** Ask for user-facing SLI, measurement window, exclusions, and acceptable data loss/recovery. Calculate the combined availability of serial dependencies; add independent failure domains only where the data path, capacity and failover are truly independent. Practice failover and restore.

**A private database is inaccessible from an app subnet.** Trace identity authorization, subnet routes, network rules, name resolution, private endpoint/DNS association, database firewall, and application credentials separately. A private endpoint does not automatically grant IAM access or guarantee the app resolves its private address.

**The bill doubled after launch.** Group cost by resource, owner, environment, region, and usage dimension. Check autoscale maxima, idle instances, logs/retention, storage operations, snapshots, cross-zone/region egress, public egress and reserved/spot fit before shrinking a production safety buffer.

## Misconceptions and edge cases

- Cloud provider responsibility for security “of” the cloud does not remove customer responsibility for configuration/data/access “in” it.
- PaaS/SaaS lowers operational burden but does not automatically meet the workload's security, retention, residency, or availability needs.
- Multi-region architecture can increase cost and complexity and still fail if identity, DNS, data dependencies, or deployment pipelines are shared failure points.
- Synchronous replication is not a substitute for independent backups; deletion/corruption may replicate.
- A service SLA is not a guaranteed end-to-end workload SLO.
- Autoscaling is bounded by quotas, capacity and warm-up time; it can amplify cost or downstream load.
- Spot capacity can be reclaimed; do not place irreplaceable state or non-resumable critical work there without mitigation.

## Knowledge checks with answers

1. Who owns customer data classification in SaaS? **The customer remains responsible for deciding data purpose/access/retention even though the provider operates the SaaS platform.**
2. What does RPO measure? **The acceptable recovery point/data loss window.**
3. Does a zone-redundant label always guarantee independent copies? **No; confirm the service's actual replication/failure semantics.**
4. What can `depends on` style account hierarchy scopes do to an IAM grant? **Parent-scope inheritance may widen access; check effective policy and scope.**
5. Why is backup different from replication? **Replication mirrors current state; it can mirror deletion/corruption, while an independent backup retains recoverable historical state.**

