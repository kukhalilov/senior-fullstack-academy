# cloud computing foundations and architecture — Reference: Common workload building blocks and managed service boundaries

Sources: [Azure technology choices](https://learn.microsoft.com/en-us/azure/architecture/cloud-adoption/decision-guides/), [Azure application architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), [AWS VPC basics](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-subnet-basics.html), and [AWS subnet route tables](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-route-tables.html).

## Scope and version

This is a provider-neutral map of common building blocks; each provider's product names and defaults are covered separately. The same label can represent different availability, networking, scaling, and pricing semantics. Compare the current service-specific documentation and supported regions before choosing.

## How this group fits the mental model

Choose a service by workload behavior, responsibility, failure needs, data model, network path, team skills and cost—not by product familiarity alone. Managed services can remove host maintenance while making the workload dependent on provider API, quota, regional availability, and specific consistency/security semantics.

## Supplied names explained

### Compute and application hosting

- **Virtual machine (VM)** — Virtualized server with OS/runtime responsibility mostly on the customer; choose when OS control or legacy compatibility matters.
- **Virtual machine scale set** — Provider-managed group of VM instances with coordinated scaling/updates (Azure terminology); health, image, zone distribution and scale limits still require configuration.
- **Container service** — Managed platform for running container images, from single-container instances to larger orchestration; network, storage, lifecycle and isolation differ by product.
- **Managed Kubernetes service** — Provider operates some Kubernetes control-plane components; customer still manages workload objects, cluster configuration, identity/network, node pools or add-ons to varying degrees.
- **Container registry** — Stores OCI/container artifacts with authentication, scanning/signing integrations, retention and replication options.
- **Application platform service** — Managed web/API hosting that abstracts VM/cluster operations; inspect runtime versions, scaling, networking, filesystem persistence and deployment slots/revisions.
- **Function service** — Event-triggered or request-triggered code execution with provider-managed scaling; consider cold starts, concurrency, duration, local state and event delivery guarantees.
- **Autoscaling** — Adjusts capacity based on demand/schedule/metrics. Configure min/max, cooldown, warm-up, quota, health and downstream limits; scale-out does not fix a saturated dependency.

### Traffic distribution and network primitives

- **Load balancer** — Distributes network traffic across endpoints, often at transport or service layer; health probes and session/persistence behavior affect failover.
- **Application gateway** — Provider-specific application-layer reverse proxy/load balancing with HTTP/TLS features such as routing/WAF; exact feature scope varies.
- **Content delivery network (CDN)** — Edge caches/proxies static/dynamic content near users; cache keys, invalidation, TLS, origin security, and stale behavior matter.
- **Virtual network** — Provider-defined private network boundary (Azure VNet terminology) with address space, subnets, routes and attachments.
- **Virtual private cloud (VPC)** — Provider-defined private network boundary (AWS terminology); it can span availability zones while subnets are placed in specific zones in AWS.
- **Subnet** — Address range and routing/security attachment within a virtual network; segmentation is useful only with rules and route intent.
- **Route table** — Prefix-to-next-hop decisions for subnet/network traffic; longest-prefix and provider-specific system routes affect actual path.
- **Internet gateway** — Provider-specific attachment enabling public internet routing when routes/public addresses and rules permit; presence alone does not expose every resource.
- **NAT gateway** — Provides outbound address translation for private resources in common designs; it generally does not create unsolicited inbound connectivity and can incur hourly/data charges.
- **Network peering** — Private routing between networks; transitivity, overlapping CIDRs, gateway transit and route propagation are provider-specific.
- **Site-to-site VPN** — Encrypted network tunnel between cloud and customer network over public infrastructure; monitor tunnel/BGP/route state and redundancy.
- **Dedicated private connection** — Provider/carrier private connectivity option (e.g. dedicated circuit); not necessarily encryption, and it still needs routes, redundancy and failover.
- **Firewall service** — Managed network/application filtering and inspection; throughput, rule order, statefulness, logging and cost can constrain architecture.
- **DNS zone** — Authoritative namespace records for names; private/public zones and resolver forwarding/split-horizon behavior must match client networks.

### Storage, databases, and integration

- **Object storage** — Key/object API for unstructured data, backups and static content; consistency, versioning, lifecycle, retention, access and request costs matter.
- **Block storage** — Virtual disk blocks attached to compute; filesystem/database durability, snapshots, IOPS/throughput and attachment limits matter.
- **File storage** — Shared file protocol/namespace; concurrent locking, permissions, throughput, latency and mount connectivity vary.
- **Storage lifecycle policy** — Rules transition/delete objects or versions based on age/tags; verify retention/legal-hold constraints and transition/retrieval fees.
- **Relational database as a service** — Managed SQL engine with backups/patching options; customer still designs schema, identity, connections, query performance, HA and restore.
- **NoSQL database service** — Managed nonrelational data store with model-specific consistency/partition/index/query limits; “NoSQL” does not describe one data model.
- **Cache as a service** — Managed in-memory/key-value cache used for latency or load reduction; caches are generally reconstructible, and invalidation/TTL/failover semantics must be designed.
- **Message queue service** — Buffers point-to-point tasks between producers/consumers. Delivery may be at-least-once; idempotency, visibility timeout, poison messages and DLQ are important.
- **Publish-subscribe service** — Fans events/messages to multiple subscribers; subscription delivery, ordering, replay, filtering and dead-letter behavior are service-specific.
- **Event broker service** — Ingests/stores/routes event streams or events; schema, partitioning, ordering, retention and consumer offsets determine behavior.
- **Data replication** — Copies data across replicas/sites for availability, locality or recovery; consistency, lag, conflict resolution and failover ownership are explicit design decisions.
- **Backup service** — Creates/restores point-in-time or scheduled copies; isolation, encryption, retention, immutability, permissions and restore tests determine usefulness.
- **Snapshot** — Point-in-time storage/volume/database image. It may be crash-consistent or application-consistent and may share the same deletion/failure domain.
- **Point-in-time restore** — Recreates database/storage state at a selected time using backups/logs; retention window, restore duration and target capacity constrain recovery.
- **Managed database high availability** — Provider-managed replica/failover arrangement for database continuity; inspect synchronous/asynchronous behavior, failover time, client retries and SLA exclusions.

## Cross-item comparison

| Workload need | Common candidate | Key questions |
|---|---|---|
| OS/custom runtime control | VM | Patch/backup/scale ownership? |
| Web/API without host management | Application platform or container service | Runtime limits, network, filesystem, deployment model? |
| Event-driven short tasks | Function service or queue worker | Duration, concurrency, event delivery, cold starts? |
| Durable unstructured bytes | Object storage | Versioning, lifecycle, egress, retention? |
| Shared low-latency disk | Block storage | IOPS, attachment, zone, consistency? |
| Async decoupling | Queue/pub-sub/event broker | Ordering, replay, duplicate delivery, DLQ? |

## Examples

For a web workload, a CDN can cache public assets; a load balancer routes to healthy app instances; app services access a private database through network and identity controls; a queue absorbs asynchronous work; object storage holds user files with retention/lifecycle policy; telemetry measures the request path. If the API scales to 20 workers but the database supports only 10 concurrent connections, autoscaling may worsen the incident—bound concurrency and scale dependencies together.

## Common mistakes

- Treating a managed Kubernetes service as “Kubernetes operations solved.”
- Assuming a NAT gateway permits unsolicited inbound connections.
- Assuming peering is transitive or automatically resolves DNS across networks.
- Treating cache as durable source of truth without explicit persistence semantics.
- Using queue delivery as exactly once without idempotent consumers.
- Assuming a snapshot is independent from source account/credentials or is application consistent.
- Choosing a database by marketing category rather than consistency, query and transaction requirements.

## Knowledge checks with answers

1. Does NAT generally permit new inbound sessions from the internet? **No; it is commonly an outbound translation path, with provider-specific exceptions.**
2. Is a cache normally the system of record? **No; design it as derived/replaceable unless the selected service explicitly provides durable semantics.**
3. Why can adding app instances increase database incidents? **More concurrent workers can exceed connection/query capacity downstream.**
4. Is a snapshot always application-consistent? **No; it may only be crash-consistent unless coordinated with the application/database.**

