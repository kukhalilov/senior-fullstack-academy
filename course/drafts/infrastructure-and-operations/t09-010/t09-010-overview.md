# Microsoft Azure architecture identity networking compute and data services — Big-picture orientation and mental model

Sources: [Azure architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), [Azure regions and availability zones](https://learn.microsoft.com/en-us/azure/well-architected/resiliency/regions-availability-zones), [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/), [Microsoft Entra managed identities](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview), [Azure Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-overview), [Azure Functions support](https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions), and [Azure Cache for Redis retirement](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/retirement-faq).

## Problem and purpose

Azure is a large cloud platform for provisioning infrastructure, identity, networking, application hosting, data services, operations and governance. Learning its architecture means understanding the boundaries and responsibilities that connect those services, not memorizing product names. A design must answer where a resource lives, who can administer it, how a workload gets credentials, which network path reaches a dependency, where data is stored, how failure is handled, and how cost and behavior are observed.

The platform gives a consistent management plane, but the services behind it have different data planes, pricing, regions, service levels, deployment models and lifecycle policies. “Managed” means Microsoft operates some responsibilities; the customer still owns application code, identity grants, data classification, network decisions, recovery objectives and cost controls.

## Plain-language mental model

Picture Azure as a hierarchy of scopes containing resources. Microsoft Entra ID identifies users, applications and workloads. Azure Resource Manager (ARM) accepts control-plane operations to create and configure resources; the resource's data plane handles application-specific operations such as reading a blob or querying a database. A resource can exist and be healthy in ARM while the application cannot reach its data endpoint, or an application can keep using data while a management operation is temporarily unavailable.

```text
Microsoft Entra tenant (identity)
└── management group(s) -> subscription(s) -> resource group(s) -> resources
             |                  |                 |
          policy/RBAC         billing/quota     lifecycle/tags/locks

workload identity -> Azure RBAC/data-plane grant -> network path -> service endpoint
        |                                                        |
  app platform -> VNet/private endpoint/DNS -> database/storage/messaging
        |                                                        |
        +------------- logs/metrics/traces/alerts ----------------+
                           cost + governance + recovery
```

Azure service choices are responsibility choices. A virtual machine gives the team control of its operating system and much of its runtime. App Service manages more of web hosting. Container Apps abstracts container orchestration for many microservice and job patterns. AKS exposes Kubernetes and its operational model. Functions packages event-triggered compute. Managed databases reduce platform work while constraining some engine-level choices. None eliminates configuration, security review or failure planning.

## How the parts fit together

| Concern | Design question | Common Azure building blocks |
|---|---|---|
| Governance | Where are resources, policies and billing grouped? | Management groups, subscriptions, resource groups, Azure Policy, tags |
| Deployment | How is desired configuration reviewed and repeated? | ARM templates, Bicep, CLI/PowerShell, deployment stacks |
| Identity | Which human or workload acts as which principal? | Entra ID, app registrations, service principals, managed identity, federation |
| Authorization | Which operation is allowed at which scope? | Azure RBAC, role assignments, conditions, Key Vault data-plane access |
| Geography and reliability | Which failures are tolerated and where is data allowed? | Regions, zones, region pairs, zone/geo redundancy, backup and Site Recovery |
| Networking | Which path and name resolution reach the service? | VNets, subnets, NSGs, routes, DNS, Private Link, gateways, load balancers |
| Compute | How much infrastructure does the team operate? | VMs, App Service, Container Apps, AKS, Functions, Batch |
| Data and integration | What consistency, retention and delivery behavior is needed? | Storage, SQL, Cosmos DB, PostgreSQL, Service Bus, Event Grid, Event Hubs |
| Operations | How do teams detect and respond to faults? | Azure Monitor, Application Insights, logs, alerts, Service Health, Advisor |
| Cost | Which usage, redundancy and traffic choices drive recurring spend? | Cost Analysis, budgets, reservations, savings plans, tags |

Azure RBAC and service data authorization must be examined separately. A principal may be allowed to create a database through ARM but lack permission to query its data. A private endpoint provides private network addressing but does not grant application permissions. Conversely, an identity with data permission still needs DNS, routing, firewall rules and service configuration to connect.

## Concept map

```text
tenant -> identity objects -> user/workload token
  |
  +-> management groups -> subscriptions -> resource groups -> resources
         |                     |                 |
       policy/RBAC           quota/billing      deployment/lifecycle

application -> hosting plan/profile -> VNet/subnet/routes/DNS
                                      -> private/public service endpoint
                                                   -> service data plane
                                                        -> data + backup

all layers -> metrics/logs/traces/alerts -> response + recovery practice
all resource use -> tags + cost analysis + budget/architecture review
```

An Azure region is not automatically a failure domain shared uniformly by every service. Availability zones, region pairs and data replication options vary by region and product. A service's global control plane also does not imply globally available application data. Select a failure model from measured recovery objectives, then verify the exact service configuration, dependencies, quotas and failover behavior.

## End-to-end walkthrough

For a customer API, define response-time, availability, data-residency, RPO/RTO and budget requirements first. Place production and nonproduction resources in intentionally governed subscriptions/resource groups. Deploy an App Service Plan and web app with Bicep; use a deployment slot to validate a release before swapping. Give the app a system-assigned or user-assigned managed identity and assign only the required Azure RBAC/data-plane roles. Store credentials or certificates in Key Vault only when the service truly requires a secret; prefer identity-based access where supported.

Connect the API to Azure SQL Database through a private endpoint if network isolation is required. Link the correct Private DNS zone to the VNet and test resolution from the app's network path; a private endpoint that resolves publicly or to an unreachable IP is not usable private connectivity. Configure backup/retention and test restore. Instrument the app with Application Insights/Azure Monitor, build alerts around user-visible objectives, and retain the logs needed for diagnosis. Add tags for ownership/environment/cost allocation, inspect Cost Analysis after deployment, and review zone/region recovery instead of assuming the platform will fail over the entire application automatically.

## When to use it and tradeoffs

Azure's managed services can reduce patching and control-plane work and integrate with Microsoft Entra, networking and monitoring. The tradeoffs include product-specific behavior, region/SKU gaps, quota limits, service lifecycle changes, billing complexity and dependence on provider APIs. Hybrid or multicloud patterns can meet residency, latency or organizational needs, but introduce more identity, network, operations and incident-response paths. Choose them to meet a stated requirement and test the failure scenario they are meant to address.

The service map here covers common architecture choices, not every Azure product, SKU, API property or CLI flag. Product availability and pricing change independently; use current Microsoft Learn service docs and the Azure Pricing Calculator for an actual design.

## Current lifecycle notes

As checked 2026-11-16, Microsoft Learn says support for the Azure Functions .NET in-process execution model ended on 2026-11-10; for supported .NET function apps, plan migration to the isolated worker model and verify the supported runtime/framework matrix ([support table](https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions), [migration guide](https://learn.microsoft.com/en-us/azure/azure-functions/migrate-dotnet-to-isolated-model)). Azure Cache for Redis Enterprise and Enterprise Flash are scheduled for retirement on 2027-03-31, while Basic, Standard and Premium are scheduled for retirement on 2028-09-30; the dates and creation rules vary by tier/cloud/customer status. Microsoft recommends Azure Managed Redis as the migration destination, but verify feature, region, tier and migration-tool support ([retirement FAQ](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/retirement-faq)).

These are service lifecycle facts, not a forced Azure version-history unit. Recheck them before making an operational plan.

## What later lessons cover

The concepts lesson connects governance, ARM and deployments, Entra identities and scope inheritance, regions and networking, platform responsibility, data/messaging choices, and observability/cost. Six reference guides explain every fixed manifest term within governance/deployment, identity, networking, compute, storage/data/messaging, and operations/cost. Practice applies the services to a production design and migration scenarios; interview questions test architecture boundaries and troubleshooting. AWS and provider-neutral patterns are in separate topics.
