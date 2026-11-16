# Microsoft Azure architecture identity networking compute and data services — Exercises and worked solutions

Sources: [Azure architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), [Managed identities](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview), [Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-overview), [App Service](https://learn.microsoft.com/en-us/azure/app-service/overview), [Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview), [Functions support](https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions), and [Azure Cache for Redis retirement FAQ](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/retirement-faq).

## Goals

Practice turning workload requirements into Azure service boundaries, identity grants, network paths, data choices, recovery plans and cost/observability checks. These exercises use fixed names from the Azure manifest and current official documentation. Cloud configuration is subscription/region dependent; treat the exercises as architecture reasoning, not a claim that every subscription has the same quota or SKU availability.

## Worked example

### Scenario

Deploy a customer API used by web clients. It has variable traffic, a relational customer database, sensitive credentials for one legacy integration, and an SLO requiring regional recovery within a defined business window. Deployments must not store long-lived cloud credentials in source control. Operators need to distinguish app errors from provider incidents and attribute monthly spend to the API team.

### Architecture sketch

```text
GitHub Actions / deployment pipeline
   -> federated Entra identity -> scoped Azure RBAC -> ARM/Bicep deployment
                                                     |
App Service + deployment slot -> managed identity ---+-> Key Vault (legacy credential)
                |                 |
                |                 +-> Azure SQL data-plane role
                |                           |
                +-> VNet/private endpoint -> private DNS -> SQL endpoint

Application Insights + resource diagnostics -> Azure Monitor/workspace/alerts
Azure SQL backup + geo-recovery design -> documented restore/failover exercise
resource tags -> Cost Management analysis/budget -> monthly ownership review
```

Use App Service when its managed web-hosting boundary meets runtime and networking requirements. Assign a federated pipeline identity only deployment actions at the target scope. Use a managed identity for runtime access and a separate narrow data-plane role. A private endpoint is useful only when DNS resolves the SQL host to the private IP from the app's network path. Plan backup/geo-recovery separately from the database connection. Add user-impact telemetry and test alerts before production traffic.

## Exercises

### Exercise 1 — Control plane succeeds, database connection fails

An App Service and private endpoint deployment reports success. The app times out connecting to Azure SQL Database. Give a step-by-step diagnosis across DNS, route/network filtering, endpoint/service configuration, authentication and data-plane authorization. Explain why adding a broad subscription Contributor role is unlikely to fix a private DNS failure.

### Exercise 2 — Replace a pipeline client secret

A GitHub Actions pipeline uses a client secret stored as a repository secret and a Contributor assignment at subscription scope. Design a workload identity federation replacement. Name the claims/trust boundaries to constrain and the permissions/scope to reduce.

### Exercise 3 — Choose a compute platform

Recommend between App Service, Container Apps, AKS, Functions and Batch for: (a) a conventional HTTP API; (b) a containerized worker that scales with queue depth and is idle overnight; (c) a .NET event handler with short intermittent executions; (d) a workload requiring Kubernetes operators; and (e) a large parallel scientific batch.

### Exercise 4 — Respond to Azure Functions model lifecycle

A .NET Function App still uses the in-process model after November 10, 2026. Explain its support state and give a safe migration plan to isolated worker. Include runtime/framework compatibility, trigger/binding extensions, settings, identity, deployment and validation.

### Exercise 5 — Pick an event service

An architecture needs (a) one worker to process commands with explicit completion and dead-letter handling; (b) several independent analytics consumers to replay a high-volume telemetry stream; and (c) notify a set of handlers when a resource changes. Choose between Service Bus, Event Hubs and Event Grid and describe the delivery/ordering caveat for each.

### Exercise 6 — Define database recovery

The product owner requests “high availability and disaster recovery.” Write the questions you must ask about RPO, RTO, region/zone, write consistency, backup retention, failover, DNS, identity and restore testing before selecting Azure SQL Database replication or recovery settings.

### Exercise 7 — Migrate Azure Cache for Redis

An existing cache is Enterprise tier, clustered, uses a Redis client with multi-key operations, and serves session-like data. Give the dated retirement deadline, identify compatibility checks for Azure Managed Redis, and explain how you would migrate without assuming a cache is disposable.

### Exercise 8 — Analyze a private service integration

A workload in a spoke VNet must call Azure Storage privately. Describe endpoint, DNS, VNet links/forwarding, route/filter, Entra data permission, public network policy and observability checks. State which signals distinguish a DNS issue from a 403 authorization failure.

### Exercise 9 — Observe and control cost

After launch, compute spend is higher than forecast and API latency is rising. Describe the metrics/logs/traces, health signals, tags, Cost Analysis views, reservation/savings-plan checks and architecture questions you would use. Explain why a budget alone does not stop spend.

## Progressive hints

1. Test the app's hostname resolution from its actual network integration. Then check TCP/TLS and service-side access before changing roles.
2. Trust the repository, branch/environment and audience claims only; separately grant the smallest role at resource group/resource scope.
3. Start from required host/platform control and traffic/event semantics, not the cloud product's popularity.
4. In-process support ended; isolate host/runtime model change from code behavior, then migrate triggers/extensions and configuration.
5. Commands with settlement, durable replayable streams, and push event fanout have different semantics.
6. Redundancy, replication, backup and tested recovery are distinct controls.
7. Enterprise Cache for Redis has an earlier retirement than Basic/Standard/Premium; check clustered-client and cross-slot behavior.
8. DNS can resolve to a public or wrong endpoint while the role is correct; a 403 typically means the network path reached a service that rejected authorization.
9. Trace cost by scope/service/tag, then check telemetry volume, autoscale capacity, commitments and data egress.

## Complete solutions

### Solution 1

First resolve the SQL fully qualified hostname from the App Service's actual VNet-connected environment. Confirm it resolves to the intended private endpoint IP and that the Private DNS zone is linked or forwarded to the VNet/resolver used by the app. Check route/NSG/Firewall/NVA paths and endpoint approval. Confirm SQL public network policy and private endpoint acceptance match the intended design. Next authenticate as the app's managed identity and verify the token audience/tenant; finally confirm the identity has the required database data-plane role/contained database user permission. A Contributor role is management-plane permission and does not fix DNS or route errors; it may also be dangerously broad.

### Solution 2

Configure an Entra application/service principal with a federated identity credential for the GitHub issuer, exact repository subject and protected branch or environment, plus the expected audience. Remove the static secret after testing the new path. Grant deployment permissions only to the resource group/resources the workflow manages, using the smallest built-in/custom role that supports the required ARM actions. Use environment protection/approvals for production and keep workload runtime identity separate. A federated token establishes authentication, not authorization.

### Solution 3

(a) App Service is a strong default for a conventional HTTP API when its runtime, plan, networking and scaling features fit. (b) Container Apps supports custom containers, event scale rules and optional scale-to-zero; confirm queue scaler, cold start and concurrency. (c) Functions Flex Consumption fits event-driven intermittent .NET work when trigger, execution limits and worker/runtime support match. The .NET in-process model is out of support, so use isolated worker. (d) AKS is appropriate when the application genuinely needs Kubernetes APIs/operators/policies and the team can operate the cluster; Container Apps may avoid that overhead. (e) Azure Batch is designed for large-scale parallel job/task scheduling. Compare security, identity, network, recovery, observability and cost before committing.

### Solution 4

Treat in-process as out of support since 2026-11-10. Inventory Function runtime version, target .NET version, triggers/bindings/extensions, host settings, deployment/hosting plan, identity/Key Vault access, network integration, storage and downstream dependencies. Build an isolated-worker version with current supported packages and compatible trigger extensions; move host configuration and dependency injection to the worker model, preserve function names/routes/message semantics, and update deployment artifacts. Deploy to a staging slot or parallel Function App, test trigger authentication, retry/poison/dead-letter behavior, scale and observability, then cut traffic/events gradually. Monitor duplicate processing and rollback limitations; keep the data contract backward compatible. Use Microsoft's migration guide and current support table rather than relying on a remembered runtime matrix.

### Solution 5

(a) Service Bus for commands/work queues: Peek-Lock, settle after durable work, and monitor the dead-letter queue. Lock expiry/redelivery means processing should be idempotent. (b) Event Hubs for high-volume partitioned streams with independent consumer groups and checkpointed offsets; ordering is within a partition and replay is bounded by retention. (c) Event Grid for discrete event push/fanout to subscribed handlers; design for retry/duplicate delivery and handler idempotency. Do not describe any as universal exactly-once business processing.

### Solution 6

Ask what data loss is tolerated (RPO) and how soon service must resume (RTO); whether outage is a zone, region, logical corruption or operator error; which region and residency rules apply; whether writes are synchronous/asynchronous and what consistency is acceptable; how backup retention and point-in-time restore work; whether a failover group/geo-replica is supported for the selected tier; how clients discover/reconnect to the secondary; whether secrets, roles, DNS, app compute and quotas exist there; and who initiates failover. Test restore and failover, including measured data loss, app startup, endpoint changes and return/failback. A replica handles some availability cases; backup handles recovery from historical state; neither makes the application plan automatic by itself.

### Solution 7

Microsoft Learn's current plan schedules Azure Cache for Redis Enterprise/Enterprise Flash retirement for 2027-03-31; Basic/Standard/Premium are scheduled for 2028-09-30. Confirm the instance tier, cloud and migration rules in the official FAQ. Azure Managed Redis is the recommended target, but check region/SKU/features, cluster policy, TLS/auth, client-library cluster support, cross-slot commands and data migration tooling. Inventory TTL/persistence, rebuild time and session consequences. If sessions are not safely reconstructible, migrate/copy state and validate consistency/cutover rather than simply flushing or recreating the cache. Run load/failover tests and update DNS/credentials/secrets safely.

### Solution 8

Create and approve a private endpoint for the storage resource in a subnet with correct address capacity. Associate the appropriate private DNS zone group; link the zone to the spoke or configure a supported central DNS resolver/forwarder. From the workload, verify the storage hostname resolves to the private endpoint IP and routes/NSGs/firewall allow the flow. Configure storage public network access/endpoint rules intentionally. Authenticate with Entra and grant an appropriate data-plane role (for example, blob data access if using blobs); management-plane Reader/Contributor alone is not the same. Enable storage diagnostic logs and app dependency telemetry. A name resolving to public/wrong IP or timeout points toward DNS/network; an HTTP 403 shows a service was reached but rejected the request, so inspect identity, role scope, token and service policy.

### Solution 9

Correlate App Insights traces/requests/dependencies and Azure Monitor metrics with resource logs and Activity Log changes. Check Service Health/Resource Health for provider or resource issues, but verify user-facing SLOs from app telemetry. Use tags and Cost Analysis grouped by service/resource group/owner to find the growth; account for log ingestion/retention, egress, redundancy, idle capacity, autoscale and backup costs. Compare measured eligible compute use before buying a reservation or savings plan and inspect current commitment coverage/utilization. Budgets provide alerts rather than guaranteed enforcement. Diagnose latency through app dependencies, database capacity, network path, throttling, autoscale and downstream saturation before simply increasing spend.

## Tests and edge cases

- Resolve a private endpoint hostname from a VM/app in the intended VNet and from a client that is not linked; compare results.
- Grant an identity a management role but no data role, then explain the service response distinction.
- Send a Service Bus message, crash a worker after its durable side effect but before settlement, and verify idempotency.
- Replay Event Hubs from a stored checkpoint and test what happens when a checkpoint lags or a partition is reassigned.
- Compare Azure SQL failover behavior with point-in-time restore after a logical deletion.
- Test App Service slot swap with sticky settings and an external schema change; document what rollback cannot reverse.
- Test an isolated-worker Function's trigger retry/poison behavior before moving production event traffic.
- Check Azure Managed Redis client behavior for cluster redirects and cross-slot multi-key calls.
- Model cost under quiet traffic, peak traffic, backup retention, diagnostics and regional redundancy.

## Reflection questions

1. Which boundaries does the cloud provider operate, and which are still owned by your team for each chosen service?
2. Where does each workload token come from, which exact scope grants access, and how is that grant removed?
3. How would you prove that private traffic cannot fall back to an unintended public endpoint?
4. Which failure case is handled by redundancy, which by backup, and which by a tested recovery procedure?
5. What assumptions make your cost estimate wrong, and how will you detect drift before the budget period ends?
