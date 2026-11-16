# Microsoft Azure architecture identity networking compute and data services — Core concepts and how they fit together

Sources: [Azure architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), [Azure Resource Manager overview](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview), [Azure RBAC](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview), [Azure Well-Architected reliability guidance](https://learn.microsoft.com/en-us/azure/well-architected/resiliency/regions-availability-zones), [Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-overview), [Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/overview), [Flex Consumption](https://learn.microsoft.com/en-us/azure/azure-functions/flex-consumption-plan), [Azure Functions runtime support](https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions), [Azure Cache for Redis lifecycle](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/retirement-faq), and [Cost Management](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/overview-cost-management).

## Learning objectives

After this lesson, you should be able to map Azure's governance hierarchy; distinguish management-plane and data-plane requests; choose an identity and authorization model; reason about region/zone failure domains; trace a private network connection from DNS through authorization; compare compute and data service responsibility boundaries; and plan observability, recovery and cost as part of deployment rather than as afterthoughts.

## Prerequisites

Know what an identity, role, permission, IP address, DNS name, process, database and API request are. Understand the difference between deploying a resource and using that resource. Azure service names are product names, not substitutes for requirements such as latency, consistency, availability, portability or recovery time.

## Core concepts

### 1. Scope and control-plane boundaries

Azure resources belong to a hierarchy: management groups can group subscriptions; subscriptions contain resource groups; resource groups contain resources. A resource ID encodes its provider/type/name and scope. Azure Policy and Azure RBAC can apply at several scopes, and grants typically inherit down. A subscription is an important billing, quota and governance boundary, but exact organization strategy depends on identity, compliance, workload separation and operational ownership.

ARM is Azure's control-plane service for creating, updating and deleting resources. A successful ARM deployment means the management operation was accepted/completed according to the provider's provisioning state; it does not prove a workload can use the data plane. For example, assigning a storage account role and uploading a blob are separate operations with different endpoints, role actions, network requirements and eventual propagation behavior.

Infrastructure as code (IaC) declares desired resource configuration. ARM templates use JSON; Bicep is a higher-level language that compiles to ARM deployment definitions. Modules factor reusable components; parameters provide environment-specific inputs; outputs expose selected result values. A what-if operation previews planned changes, but it is not a transactional guarantee for all dependent or external effects. Incremental mode updates resources in the deployment without deleting unspecified resources; complete mode has deletion implications and should be used only with a clearly owned scope. Deployment stacks can group/manage a set of resources and define deletion/deny behavior. Review rendered/compiled output, role grants, private endpoints, secrets and destructive changes before production.

Azure Policy evaluates resources against definitions and effects at assignment scopes. Initiatives group policy definitions; exemptions document allowed exceptions with scope/expiry/justification. Evaluation can be asynchronous and remediation may require identity/permissions. Policy is distinct from RBAC: policy says which configurations are compliant or may be changed/denied, while RBAC says who can perform actions. Locks and quotas add further constraints; a lock is not a backup or an authorization design.

### 2. Identity, credentials and authorization

Microsoft Entra ID is the identity provider for tenants. A user, group, application object, service principal and managed identity are related but distinct identity objects. App registration defines application identity/configuration; its service principal is a tenant-local instance used for assignment and sign-in. Enterprise application commonly refers to the service principal view in a tenant. The application/client ID identifies the application; the tenant ID identifies its directory. Neither ID is a secret.

Humans authenticate interactively, often through OAuth 2.0 authorization code flow with OpenID Connect for sign-in and Conditional Access/MFA policy. A confidential service can use OAuth 2.0 client credentials, ideally with managed identity or federated credentials rather than a long-lived client secret. Tokens have a target audience/resource and expiry. An ID token communicates authentication claims to a client; an access token is presented to a resource API; a refresh token is a credential used by a client flow to acquire new tokens and must be protected. Do not decode a token and assume claims alone grant Azure resource access.

Managed identities are Entra service principals whose credential lifecycle is handled by Azure. A system-assigned identity is tied to a resource's lifecycle; deleting/recreating that resource creates a different identity. A user-assigned identity has an independent lifecycle and can be associated with supported resources, which is useful when identity must persist across deployments or serve several workloads. Azure-hosted workload code obtains a token through supported identity SDK/endpoints, then needs a role assignment for the target data plane. AKS Workload Identity federates Kubernetes service-account tokens with Entra, avoiding static credentials in Pods.

Workload identity federation trusts claims from an external identity provider, such as a GitHub Actions OIDC token. Restrict issuer, subject/repository/branch/environment and audience. A federated identity credential permits an app/service principal to exchange that signed assertion for an Entra token; it does not itself grant Azure resource permissions. MSAL implements Microsoft identity platform flows for clients; choose the correct confidential/public client and supported credential source.

Azure RBAC role assignments combine a security principal, role definition and scope; conditions can further limit selected access. Built-in roles are convenient but may be broader than the workload needs; custom roles let an organization define actions. Management-plane `Actions` and data-plane `DataActions` are conceptually separate. A role at a subscription can inherit to child resource scopes. Deny assignments can block actions even when an allow role exists. PIM supports just-in-time/eligible privileged access rather than standing admin grants. Admin consent grants an application permission in a tenant; delegated permissions act on behalf of a signed-in user, while application permissions act as the app. Consent and Azure RBAC are separate grant systems.

Key Vault stores secrets, keys and certificates, but applications still need a network path and authorization. Key Vault access policies are a legacy access model; Key Vault data-plane RBAC uses Azure RBAC roles for vault operations. Choose the supported access model, avoid mixing assumptions, restrict secret retrieval, and plan rotation/versioning. A key object can perform cryptographic operations without exporting key material; a certificate also has issuance/renewal and private-key handling considerations. Prefer managed identity/federation over stored credentials wherever the target service supports it.

### 3. Geography, resilience and data placement

An Azure geography groups regions; an Azure region is a deployment location; availability zones are physically separate datacenter groups within a region where supported. A region pair is an Azure-defined pairing relationship, not an automatic application failover plan and not a guarantee that every service replicates to the paired region. Some services are zonal, some zone-redundant, and some regional without zones. Verify the exact service's deployment model, replication scope, recovery behavior, supported regions and data residency before selecting it.

RPO describes tolerated data loss; RTO describes tolerated recovery time. Backups, replication, high availability and disaster recovery solve different problems. Zone redundancy may handle a datacenter outage but not a regional failure or bad logical writes. Geo-replication may be asynchronous, so failover can lose recent data. Azure Site Recovery orchestrates supported VM replication/failover; Azure Backup protects supported data/resource types with separate retention/recovery controls. A recovery plan must account for identities, DNS, network, secrets, quotas, dependencies and the application startup order.

### 4. Networking is a path, a policy and a name

A VNet owns address space; subnets carve it into ranges and attach policies/delegations. Network Security Groups (NSGs) filter traffic with ordered inbound/outbound rules associated with subnets or NICs. User-defined routes affect next hop; peering connects VNet address spaces but is not transitive by default. Gateways, Virtual WAN, VPN and ExpressRoute cover different connectivity needs. NAT Gateway provides controlled outbound connectivity, while Azure Bastion provides browser/managed access to VMs without exposing their management ports publicly.

Private Link and a private endpoint place a private IP network interface in a VNet for access to a supported service resource. Private DNS zone records/links, routing, endpoint approval, service firewall/public-access settings and the client's resolver all affect connection success. A private endpoint changes network reachability; it does not replace Entra identity or data-plane permission. A Private Link Service publishes a provider's own service behind Private Link; it is distinct from a consumer private endpoint.

Load-balancing choices have different layers: Azure Load Balancer operates at network transport; Application Gateway can route HTTP(S) and apply WAF rules; Front Door provides global edge HTTP routing; Traffic Manager answers DNS with endpoint selection and does not proxy data traffic itself. Health probes, frontend/listener configuration, backend/origin pools, TLS, DNS and firewall rules must be configured for the chosen path. Network Watcher tools can diagnose connectivity but do not automatically repair it. Network Security Perimeter is a service-level network access control construct for supported PaaS resources; it is not a replacement for VNet, identity and service firewall decisions.

### 5. Compute choices move the responsibility boundary

Azure Virtual Machines give control of an OS image, VM size, disks, NICs and extensions, and therefore require patching, hardening, capacity and recovery operations. VM Scale Sets provide a managed set of VMs with Uniform or Flexible orchestration modes; Flexible supports broader VM-level flexibility, while Uniform is a more standardized scale-set model. Availability sets distribute VMs across fault/update domains but are not the same as zone redundancy. Proximity placement groups target low-latency colocation and can constrain placement. Spot VMs use spare capacity at discounts but can be evicted; use interruption-tolerant workloads.

App Service hosts web apps/APIs on an App Service Plan. Deployment slots support staged deployment and swaps; slot-sticky settings and external state still need care. Azure Container Apps runs containers with managed revisions, ingress, jobs and event-driven scale rules. Workload profiles (Consumption, Dedicated and Flex where available) define compute/billing boundaries; consumption apps can scale to zero if the workload rule allows it. Dapr integration provides building blocks but adds a runtime/component architecture that must be secured and operated. AKS is managed Kubernetes: Azure operates the control plane, while cluster/node pools and workload operations remain a customer responsibility unless using AKS Automatic's higher-managed experience. ACR stores container images and manifests; tags can move, digests identify content; geo-replication and regional access need configuration.

Functions executes event-triggered code using triggers and bindings. Flex Consumption is the current recommended serverless plan in Microsoft Learn and supports Linux, VNet integration, per-function scaling, configurable memory and optional always-ready instances; quotas and feature support vary ([Flex Consumption guide](https://learn.microsoft.com/en-us/azure/azure-functions/flex-consumption-plan)). Consumption, Premium and Dedicated plans have distinct scale/cold-start/networking/billing behaviors. Durable Functions orchestrates stateful workflows using event-sourced orchestration history; activities should be deterministic where replay requires it. In .NET Azure Functions, isolated worker runs app code separately from the host; in-process runs inside the host. In-process support ended 2026-11-10, so new/recently maintained .NET apps should use the supported isolated model ([runtime support table](https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions)).

Azure Container Instances runs containers without a cluster abstraction and can fit simple burst or task cases. Azure Batch schedules large-scale batch jobs and tasks. Service Fabric is a distributed application platform for services/containers with its own cluster/service programming model. Azure deployment center connects source/build/deployment workflows to eligible app services; it is a deployment integration, not a general CI/CD engine. Web App for Containers is App Service hosting for a custom container image.

### 6. Storage, databases and messaging are not interchangeable

Azure Storage accounts define namespace, access, network, redundancy and billing settings for several storage services. Blob Storage is object storage: block blobs suit general objects, append blobs append-oriented logs, and page blobs support random access patterns used by some disk scenarios. Lifecycle policies move data according to age/rules; versioning, soft delete, point-in-time recovery and immutability address different recovery/retention needs. Hot/Cool/Cold/Archive tiers trade storage price against access cost/latency/rehydration; choose using access patterns, minimum retention and account type. Data Lake Storage Gen2 adds hierarchical namespace semantics for analytics. Azure Files provides managed SMB/NFS shares; Queue Storage and Table Storage are simple queue/key-attribute services with different guarantees from Service Bus or Cosmos DB.

Azure Managed Disks provide VM block storage. LRS keeps copies within a datacenter; ZRS spans availability zones in supported regions; GRS replicates to a paired region; RA-GRS additionally supports read access to secondary replicated data. These options have distinct failover, consistency, cost and availability behaviors. Redundancy is not backup: accidental deletion/corruption can replicate.

Azure SQL Database is a managed database engine; SQL Managed Instance offers broader instance-level SQL Server compatibility; SQL Server on Azure VMs gives OS/engine control and maintenance responsibility. vCore and DTU are purchasing models, elastic pools share capacity across databases, and serverless compute can auto-pause/scale under eligible configurations. Evaluate compatibility, networking, HA/backup, connection behavior, scaling and cost before migration.

Cosmos DB offers multiple APIs; this unit focuses on NoSQL. Request Units (RUs) are a normalized throughput/charge abstraction, not raw CPU time. Partition key choice controls logical data grouping, distribution and transaction scope. Consistency levels trade read latency/consistency guarantees. Change feed exposes ordered changes within partition boundaries for projections/integration, not a universal exactly-once event log. PostgreSQL Flexible Server is a managed PostgreSQL deployment option with engine compatibility and service-specific HA/backup/network settings.

Azure Cache for Redis is a legacy managed cache and has a scheduled retirement; Azure Managed Redis is the recommended destination. Azure Managed Redis uses Redis Enterprise software and is clustered by default, so clients must handle cluster behavior and cross-slot limitations. Managed Redis's GA product status does not imply every tier/feature is GA. Cache contents should usually be treated as reconstructible; it is not a primary database. The current tier-specific retirement deadlines and migration advice are documented in the [retirement FAQ](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/retirement-faq).

Service Bus is brokered messaging for commands/work queues/topics and subscriptions, with locks, duplicate detection, sessions and dead-lettering options. Event Grid routes discrete events to handlers; Event Hubs ingests high-throughput streams organized in partitions and consumer groups, with retention/replay behavior. They are not interchangeable: choose based on delivery semantics, ordering, replay, throughput, routing and consumer ownership. Azure Backup provides backup/restore for supported workloads; Site Recovery replicates supported workloads for disaster recovery.

### 7. Observability, lifecycle and cost

Azure Monitor unifies metrics, logs, traces and alerts. Metrics are typically numeric time-series with dimensions and aggregation; logs are records queried in Log Analytics with Kusto Query Language (KQL); traces represent correlated operations across services. Application Insights captures application telemetry and distributed traces. Azure Monitor OpenTelemetry Distro configures collection/export for supported languages; instrument boundaries and sampling affect cost and diagnostic detail. Diagnostic settings route supported resource logs/metrics to destinations; not every service emits every signal automatically.

Azure Service Health reports provider incidents/maintenance affecting services/subscriptions; Azure Resource Health reports resource-specific availability state. Azure Activity Log records management-plane events, while resource logs/data-plane logs vary by service. An alert rule evaluates a signal and routes actions through an action group; define thresholds and deduplicate response so an alert identifies a user-impacting condition rather than mere noise. Azure Monitor managed Prometheus and Managed Grafana provide Prometheus-compatible metrics and visualization for supported setups.

Azure Cost Management analyzes spend by scope, service, tag and time; budgets/cost alerts notify but do not automatically cap all usage. Reservations and compute savings plans are commitment discounts with eligibility, scope and utilization details; they are not identical purchase models. Advisor gives recommendations but does not replace architecture review. Pricing Calculator estimates a planned configuration; TCO Calculator compares on-premises/cloud assumptions. Tag resources for owner/environment/cost center and account for egress, redundancy, logs, idle capacity, backups and support in the estimate.

## Mechanisms and relationships

### Trace a private API call

The app chooses a hostname; DNS returns an address. If the service is reached through a private endpoint, DNS must resolve through the intended private zone/link and the client network must route to the endpoint's private IP. NSGs/routes/firewalls and service network policy must allow the path. The app authenticates, obtains an access token or other supported credential, and the target service authorizes a data operation. TLS validates the service endpoint. A failure at any stage can produce similar client timeouts or authorization errors, so test name resolution, TCP/TLS connection, token audience/identity, role assignment and service logs independently.

### Compare reliability patterns

Use a zonal or zone-redundant deployment for a zone-level failure only when the product supports that design and the application can use it. Use cross-region replication/failover for regional scenarios only after evaluating write consistency, DNS/routing, secret/identity availability, and failover orchestration. A backup is a recoverable point; a replica is a copy; neither proves that recovery time meets the business objective. Run restore/failover drills and record evidence.

## Worked examples

### Least-privilege workload access

An App Service needs to read one Key Vault secret. Enable a managed identity, assign a narrowly scoped Key Vault data-plane RBAC role, ensure the app can resolve and reach the vault endpoint, and retrieve a token for the correct resource through the supported SDK. Do not grant Owner/Contributor just to read a secret. If Key Vault access fails, check the selected access model, role scope/propagation, identity principal, token audience, private DNS/network and service diagnostics independently.

### Select a platform for a background worker

An intermittently active queue consumer may fit Functions Flex Consumption when supported trigger semantics, execution limits, cold start and scaling behavior match. A continuously running custom worker with sidecars/ingress needs may fit Container Apps. A workload needing cluster-level Kubernetes APIs/operators may justify AKS. A large scheduled finite compute job may fit Azure Batch. Compare operations, queue/message semantics, networking, observability and spend; do not choose by “serverless” label alone.

## Misconceptions and edge cases

- ARM provisioning success does not prove data-plane access or application health.
- Entra authentication, Azure RBAC, Key Vault authorization and network reachability are distinct checks.
- Private Endpoint requires correct DNS and routing; it does not automatically block every public path or authorize a principal.
- Region pair and zone names do not imply that every product supports the same resilience options.
- Redundancy can replicate logical corruption; backup and tested restore remain necessary.
- A deployment slot swap does not move or reverse external state changes automatically.
- Container Apps and Functions scale behavior depends on triggers/rules, quotas and configuration; scale-to-zero causes cold start.
- Cosmos DB partition-key mistakes affect scalability and transaction boundaries; RUs do not directly map to a fixed number of database queries.
- Event Grid, Service Bus and Event Hubs have different delivery/retention/order models.
- A budget is a notification control, not a hard spending cap.
- Azure Cache for Redis lifecycle dates differ by tier and cloud; Azure Managed Redis feature/SKU availability also varies.
- The .NET Functions in-process model is out of support as of 2026-11-10; distinguish this from the still-supported Functions runtime host.

## Knowledge checks with answers

1. **What is the difference between ARM and a resource data plane?** ARM creates/configures resources; the data plane carries service-specific operations such as database queries or blob reads.
2. **Does a managed identity grant permissions automatically?** No. It supplies an identity/credential; assign appropriate Azure RBAC or service data-plane permissions.
3. **Does a private endpoint make a service private and authorized by itself?** It provides a private endpoint path; DNS, routes, endpoint approval, public network settings and identity permissions still matter.
4. **What does a region pair guarantee?** It defines an Azure pairing relationship, not automatic application failover or uniform support across services.
5. **When choose Event Hubs over Service Bus?** For high-throughput event streams with partitioned consumption/replay patterns; choose Service Bus for brokered commands/work queues/topics and its messaging features.
6. **What changed for .NET Azure Functions in November 2026?** Microsoft ended support for the in-process execution model on Nov 10, 2026; .NET function apps should migrate to the supported isolated worker model and verify target runtime support.
7. **Why are budgets not enough to control spend?** They notify on thresholds but do not necessarily block resource consumption; also use quotas, policy, ownership, cost review and architecture controls.
