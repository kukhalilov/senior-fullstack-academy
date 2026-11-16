# Microsoft Azure architecture identity networking compute and data services — Interview questions and reasoning

Sources: [Azure architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), [Azure RBAC](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview), [Azure regions and zones](https://learn.microsoft.com/en-us/azure/well-architected/resiliency/regions-availability-zones), [Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-overview), [Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/overview), [Azure Functions support](https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions), and [Redis retirement FAQ](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/retirement-faq).

## Core questions

1. Explain the Azure management-group, subscription, resource-group and resource hierarchy. Where do billing, policy and RBAC fit?
2. Distinguish ARM control-plane operations from resource data-plane operations.
3. Compare ARM templates and Bicep. What does what-if prove, and what does it not prove?
4. Distinguish Entra application object, app registration, service principal, managed identity and federated identity credential.
5. How does a workload obtain an Azure token without a stored secret? What permissions are still required?
6. Compare delegated permissions, application permissions and Azure RBAC assignments.
7. Explain why a private endpoint can exist while an application still cannot reach a PaaS service.
8. Compare NSG, Azure Firewall, Application Gateway WAF, Front Door WAF and Network Security Perimeter.
9. Compare Azure Load Balancer, Application Gateway, Front Door and Traffic Manager.
10. Choose among VM, App Service, Container Apps, AKS, Functions and Batch for different workload requirements.
11. Compare Azure SQL Database, SQL Managed Instance and SQL Server on Azure VMs.
12. Explain Cosmos DB request units, partition key and consistency choices.
13. Compare Service Bus, Event Grid and Event Hubs with concrete delivery/ordering use cases.
14. How would you design zonal resilience, regional failover, backup and tested restore for a customer API?
15. How do Azure Monitor metrics, logs, traces, Activity Log, Service Health and Resource Health differ?
16. Explain how a deployment pipeline can use workload identity federation and what additional authorization it needs.
17. What changed in Azure Functions .NET support in November 2026?
18. What are the Azure Cache for Redis retirement deadlines, and what should a migration check?
19. Why do budgets not guarantee a workload cannot overspend? How do reservations differ from compute savings plans?
20. A deployment succeeds but the app receives 403s/timeouts. How do you troubleshoot without broadening access blindly?

## Concise interview answers

1. Management groups group subscriptions; subscriptions contain resource groups/resources and form important billing/quota scopes; resource groups support shared lifecycle. Policy and role assignments can inherit down from parent scopes.
2. ARM creates/configures resources; data-plane operations access resource-specific content such as blobs or database rows. They can use different endpoints, permissions and network rules.
3. Bicep is a higher-level declarative language compiled to ARM templates. What-if previews expected resource changes but is not a transaction guarantee and cannot prove the application will work.
4. App registration defines the application object; service principal is its tenant-local principal; managed identity is an Azure-managed credential lifecycle; a federated credential trusts external token claims.
5. Use managed identity in Azure or OIDC federation for an external workload where supported. Then assign a narrow Azure RBAC/data-plane role; identity alone is not permission.
6. Delegated permission acts on behalf of a user; application permission is app-only access to an API; Azure RBAC grants Azure resource operations/data actions at Azure scopes. Consent and RBAC are distinct.
7. DNS may still resolve publicly or incorrectly, VNet links/routes/NSGs may be wrong, endpoint may await approval, public access/service firewall may conflict, or the app's identity may lack data permission.
8. NSG filters stateful L3/L4 flows; Azure Firewall centralizes network/application filtering; Application Gateway WAF protects regional HTTP ingress; Front Door WAF filters global edge HTTP traffic; Network Security Perimeter controls public access to supported PaaS resources. None replaces identity or all the others.
9. Load Balancer is regional Layer 4 flow distribution; Application Gateway is regional Layer 7 web routing/WAF; Front Door is global edge HTTP/S; Traffic Manager is DNS endpoint selection, so clients connect directly and can cache answers.
10. VM for OS/runtime control; App Service for managed web apps; Container Apps for managed container apps/jobs and event scaling; AKS for Kubernetes APIs/operations needs; Functions for event-triggered code; Batch for large parallel jobs.
11. Azure SQL Database is managed database-per-service; Managed Instance offers broader SQL Server instance compatibility; SQL Server on VM gives most control and most OS/engine operations responsibility.
12. RUs normalize database work/throughput, partition key defines placement/locality/transaction boundary, and consistency levels trade latency against read guarantees. Poor partitioning creates hot partitions.
13. Service Bus for brokered commands/queues/topics with locks/settlement; Event Grid for discrete event routing; Event Hubs for partitioned high-throughput streams and replay within retention.
14. Define RPO/RTO and data residency first, select service-supported zone/region replication, preserve identity/DNS/network dependencies in recovery, keep point-in-time backup, and regularly test restore/failover with measured results.
15. Metrics are time-series, logs are detailed records, traces correlate request spans, Activity Log is control-plane history, Service Health is provider incident/maintenance and Resource Health is individual resource state.
16. A federated service connection exchanges a signed pipeline OIDC token for an Entra token with issuer/subject/audience restrictions. Azure RBAC at the deployment scope is still required; do not grant subscription Contributor by default.
17. Microsoft ended support for .NET Functions in-process execution on 2026-11-10. Migrate to the isolated worker and verify the current runtime/framework/extensions matrix.
18. Enterprise/Enterprise Flash Cache for Redis retirement is scheduled for 2027-03-31; Basic/Standard/Premium for 2028-09-30. Check tier/cloud, cluster-aware client behavior, features/SKU/region, migration tooling and whether data is truly reconstructible.
19. Budgets notify on measured/forecast spend and billing data can lag; additional quotas/policy/automation are needed. Reservations are typically more capacity-specific commitments; savings plans commit hourly eligible compute spend more flexibly.
20. Separate DNS/route/TLS timeout diagnosis from identity/token/role 403 diagnosis. Check the exact principal, audience, RBAC/data-plane model/scope and service logs; don't add broad permissions until evidence identifies an authorization gap.

## Deep follow-up answers

### How would you secure an API that reads a Key Vault secret and Azure SQL data?

Use an App Service managed identity or supported workload identity, with a narrow Key Vault data-plane role for the exact secret scope and a separate Azure SQL data-plane principal/role. Avoid subscription-wide Contributor and avoid storing a client secret in app settings. Ensure private DNS/routes/firewalls allow each endpoint. Consider whether the legacy credential is necessary at all; use identity-based service authentication when supported. Rotate/version the remaining secret and test recovery if Key Vault or its private endpoint is unavailable.

### How do you prove a multi-region design meets its RTO?

Identify critical dependencies, data write path/consistency, replication lag, backup interval, DNS/client retry behavior, identity/secrets, quota and automation. Simulate regional unavailability and record time to detect, authorize, route, start capacity and restore data. Measure actual RPO as well as RTO. A region pair, global load balancer or replicated database is only one part of the recovery path; test failback and protect against logical corruption.

### When would you choose Azure Managed Redis over another data service?

Use it when Redis protocol/data structures and low-latency in-memory behavior fit, and the data can tolerate cache semantics or the deployment's durability design is explicitly validated. It uses Redis Enterprise software and is clustered by default; clients must be cluster-aware. Check feature/tier/region support and costs. For workloads on Azure Cache for Redis, plan around tier-specific retirement dates instead of creating a new long-lived dependency on the retiring service.

### How do you choose between Azure SQL and Cosmos DB for a new API?

Start with data relationships, transaction boundaries, query patterns, consistency, global writes, partition distribution, operational expertise and cost. Azure SQL is a relational SQL engine with managed service options. Cosmos DB NoSQL requires an intentional partition key and RU model, and offers configurable consistency. Do not select Cosmos merely for “scale” or SQL merely for familiarity without load/data modeling. Prototype representative queries and failure/backup behavior.

### What is the operational meaning of Functions isolated worker?

The .NET application executes in a process separate from the Functions host, so the app controls its dependency injection/configuration and can target supported frameworks independently. Trigger/binding extensions and host/app settings still require migration. In-process support ended 2026-11-10; selecting the isolated model is not sufficient without verifying package/runtime support, local tooling, deployment plan and trigger retry semantics.

## Scenario questions

### Scenario A: API deployment reports healthy but users see timeouts

Walk through DNS, route, NSG/firewall, private endpoint, TLS, load balancer/backend health, app process, dependency and telemetry checks. A strong answer distinguishes network timeout from 403 authorization and uses App Insights dependency traces plus resource health/diagnostic logs to narrow the boundary.

### Scenario B: an Azure SQL region becomes unavailable

Explain when you initiate failover versus restore, who owns the decision, the expected data loss, how clients reconnect, and what happens to app compute, Entra access, Key Vault, DNS and quotas. A strong answer states measured RPO/RTO and the last tested date.

### Scenario C: monthly cost doubles after a release

Use Cost Analysis grouped by service/resource/tag/time, correlate deployment/activity logs, inspect autoscale and log ingestion/retention, identify egress/redundancy/backups/idle resources, and compare actual requests/latency. A strong answer treats reservations/savings plans as a later right-sizing decision based on stable eligible usage.

### Scenario D: the pipeline needs to deploy but policy blocks a public endpoint

Explain whether the public endpoint is actually required. If not, fix the design to use private connectivity. If there is a legitimate exception, use a documented scoped/time-limited Policy exemption and owner approval. Do not disable the policy subscription-wide or grant broader RBAC to bypass it.

## Tradeoffs and alternatives

- Managed services reduce OS/engine maintenance but can constrain features, network options, versions and migration paths.
- Managed identity/federation reduces long-lived secrets but still needs role design, token audience and network access.
- Private endpoints reduce public exposure but add DNS, route, endpoint and service configuration complexity.
- Multi-region redundancy improves some availability scenarios but increases cost, consistency/failover complexity and data-residency risk.
- SQL offers familiar relational transactions; Cosmos DB offers distributed document APIs with partition/consistency design requirements.
- Service Bus provides broker semantics and explicit settlement; Event Grid routes events; Event Hubs ingests/replays streams.
- App Service/Container Apps/Functions reduce orchestration burden; AKS offers Kubernetes control at a higher operations cost.

## Common weak answers

- “Azure RBAC controls everything.” Data-plane roles, service access policies and network rules can be separate.
- “A private endpoint means no public access.” Service public network configuration and DNS still need verification.
- “Managed identity needs no setup.” It still needs role assignment, token/resource audience and endpoint reachability.
- “GRS means the app automatically fails over.” Replication and application failover are separate.
- “Event Grid and Event Hubs are both event services, so either works.” Their delivery/partition/replay semantics differ.
- “A budget prevents overspend.” A budget typically alerts; it is not a hard cap.
- “Managed service means Microsoft owns operations.” Customer application/data/security/recovery responsibilities remain.
- “Azure Functions .NET in-process still runs, so it is supported.” Support ended November 10, 2026.
- “Azure Cache for Redis is being retired in 2028.” Enterprise tiers have an earlier 2027-03-31 date; Basic/Standard/Premium retire 2028-09-30.
- “Contributor is the easiest fix for 403.” First identify principal, data-plane authorization model and exact missing permission.

## Self-check rubric

Score each item from 0 to 2: **0** = cannot explain; **1** = can define but misses the failure boundary; **2** = can explain mechanism, tradeoff and how to validate it.

1. Map Azure scopes and explain ARM versus data-plane behavior.
2. Distinguish Entra objects, token types, managed identities, federation and Azure RBAC scope.
3. Trace DNS, routing, endpoint, filtering and authorization for private access.
4. Choose compute and data services from workload requirements and team ownership.
5. Explain zone/region, replication, backup, RPO/RTO and recovery test boundaries.
6. Compare Service Bus, Event Grid and Event Hubs delivery semantics.
7. Use metrics/logs/traces/health correctly and design actionable response.
8. Explain cost budgets, tags, reservations/savings plans and current service lifecycle facts.

Aim for 14/16 before calling yourself interview-ready. For each score below 2, revisit the matching reference lesson and repeat the relevant practice scenario without notes.
