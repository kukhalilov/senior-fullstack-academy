# Microsoft Azure architecture identity networking compute and data services — Reference: Virtual machines, app platforms, containers, and functions

Sources: [Azure Virtual Machines](https://learn.microsoft.com/en-us/azure/virtual-machines/overview), [App Service](https://learn.microsoft.com/en-us/azure/app-service/overview), [App Service deployment slots](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots), [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/overview), [Container Apps workload profiles](https://learn.microsoft.com/en-us/azure/container-apps/workload-profiles-overview), [AKS](https://learn.microsoft.com/en-us/azure/aks/what-is-aks), [AKS Automatic](https://learn.microsoft.com/en-us/azure/aks/automatic), [Azure Functions Flex Consumption](https://learn.microsoft.com/en-us/azure/azure-functions/flex-consumption-plan), [Functions support](https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions), and [.NET worker models](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-in-process-differences).

## Scope and version

This guide compares Azure compute and application-hosting responsibility boundaries, not every VM SKU, runtime version or deployment API field. Service regions and features vary. Current guidance was checked 2026-11-20. Microsoft Learn lists Functions Flex Consumption as the recommended serverless Functions plan. Support for .NET Azure Functions in-process execution ended 2026-11-10. Functions 4.x now lists .NET 11 for isolated worker when using Azure.Functions.Sdk 1.0.1 or later and an explicit Microsoft.Azure.Functions.Worker reference; .NET 11 is not available on Linux Consumption. Check the live plan/runtime matrix.

## How this group fits the mental model

Choose a platform by deciding what the team must control. More abstraction usually reduces infrastructure tasks but can constrain runtime, networking, scale behavior, deployment and diagnostics. Image building and app code are only part of operation: identity, secrets, persistent state, ingress, quotas, health, rollout and telemetry must also be designed.

## Supplied names explained

### Virtual machines and scale sets

- `Azure Virtual Machines` — Infrastructure-as-a-service compute where the customer controls OS/image, installed software and most guest operations. Patch, secure, monitor and recover the VM.
- `Azure Container Instances` — Runs containers directly without provisioning a Kubernetes cluster, suitable for simple burst/task scenarios with limited orchestration needs.
- `Azure VM size` — Compute/memory/network/disk capacity shape. Region availability, quotas, architecture, accelerator and disk/network limits vary by size.
- `Azure VM image` — Source OS/application image used to create a VM; patch level, publisher trust and image versioning affect repeatability.
- `Azure Compute Gallery` — Repository/distribution service for VM images and versions across regions/subscriptions, subject to replication and access configuration.
- `Azure managed disk` — Managed block storage resource attached to VM(s), with disk type, performance, encryption, redundancy and lifecycle choices.
- `Azure VM Scale Sets` — Group of VMs managed as a scalable set, integrated with autoscale/orchestration and load-balancing options.
- `Uniform orchestration mode` — Scale-set mode applying a consistent VM model and instance lifecycle across the set; suited to homogeneous fleets.
- `Flexible orchestration mode` — Scale-set mode supporting a broader set of VM lifecycle/availability patterns, including individual VM flexibility; validate feature compatibility and behavior.
- `Azure availability set` — Places VMs across fault and update domains within a datacenter to reduce correlated maintenance/failure risk; not the same as availability-zone deployment.
- `Azure proximity placement group` — Placement constraint intended to keep related Azure resources physically close for lower latency; it can constrain capacity and availability choices.
- `Azure Spot Virtual Machines` — Discounted spare capacity that may be evicted when Azure needs it. Use interruption-tolerant, restartable workloads with checkpointing.

### Managed web, container and Kubernetes platforms

- `Azure App Service` — Managed web app/API hosting for supported stacks and custom containers, reducing OS operations compared with a VM.
- `App Service Plan` — Compute capacity and hosting tier shared by App Service apps. Scaling the plan affects its apps and cost; plan features vary by operating system/tier.
- `App Service deployment slot` — Separate live app environment for staging/validation and swap workflows. Configuration stickiness and external database/state changes need deliberate handling.
- `App Service staging slot swap` — Exchanges selected slot configuration/content into production to reduce deployment downtime; it is not a rollback for external side effects or schema changes.
- `App Service deployment slot setting` — Configuration marked sticky to a slot so it remains associated with that slot during swap; review secrets, connection strings and environment-specific settings.
- `App Service autoscale` — Adds/removes App Service Plan instances from metrics/schedules within configured limits; app startup, plan quota and downstream capacity constrain results.
- `App Service Managed Certificate` — Platform-managed certificate option for eligible custom domains/scenarios; verify renewal, hostname and TLS configuration requirements.
- `Azure Container Apps` — Managed container application platform for APIs, microservices and jobs, abstracting cluster management and exposing revisions, ingress, workload profiles and event-driven scaling.
- `Container Apps environment` — Shared secure boundary for apps/jobs and their networking/observability configuration. Apps may communicate privately inside an environment.
- `Container Apps revision` — Immutable snapshot of an app configuration version. Multiple revisions can run in single or multiple revision mode for rollout/canary patterns.
- `Container Apps ingress` — Managed external or internal HTTP/TCP entry for an app, configured with target port, transport and exposure. It is separate from container process binding.
- `Container Apps jobs` — Finite container executions started manually, on a schedule or by an event trigger. Retry and execution semantics must account for duplicate work.
- `Container Apps scale rule` — Event/metric rule that adjusts app replicas, commonly using supported KEDA scalers. Credential and metric configuration affect whether the rule can see demand.
- `Container Apps workload profile` — Compute/memory/resource model selected by an app inside an environment; determines isolation, capacity and billing behavior.
- `Container Apps Consumption profile` — Serverless profile that scales based on demand and can scale to zero when configured; cold starts and quota must be accepted.
- `Container Apps Dedicated profile` — Dedicated compute profile for workloads needing more controlled capacity/isolation; costs and scaling behavior differ from consumption.
- `Container Apps scale to zero` — Allows eligible apps/jobs to reach zero replicas when rules show no demand. The trigger must remain observable and users must tolerate startup delay or use buffering.
- `Container Apps Dapr integration` — Optional managed integration with Dapr building blocks for service invocation/state/pub-sub/secrets depending on configured components; it adds identity, component and network requirements.
- `Azure Kubernetes Service (AKS)` — Managed Kubernetes control plane with Azure integrations. Customers still own workload design and, depending on mode, node pools, networking, upgrades and cluster operations.
- `AKS node pool` — Group of cluster nodes sharing configuration, size/OS and upgrade/scaling lifecycle. Workloads can target pools through labels/taints.
- `AKS system node pool` — Node pool intended for critical system Pods; protect its capacity and scheduling eligibility.
- `AKS user node pool` — Pool intended for user workloads, separated from system services by configuration and scheduling.
- `AKS managed control plane` — Azure-operated Kubernetes control-plane components/API availability; it does not imply Azure runs every workload, node or cluster add-on operation for you.
- `AKS workload identity` — Entra federation for Kubernetes workloads, allowing Pods to obtain tokens for Azure resources without static credentials.
- `AKS automatic` — Higher-managed AKS mode with production defaults and more automated node, scaling, security, monitoring and upgrade behavior; inspect its supported customizations and responsibility boundary.
- `AKS node auto-provisioning` — Capability in AKS Automatic to create/select node capacity for unschedulable workloads; quotas, constraints, startup time and supported configuration still apply.
- `Azure Container Registry (ACR)` — Managed registry for container images/artifacts with identity, access, scanning/replication options depending on tier/configuration.
- `ACR repository` — Logical collection of image manifests/tags under a registry namespace.
- `ACR image tag` — Mutable label pointing to a manifest; pinning a tag alone does not guarantee immutable content.
- `ACR image manifest` — Metadata describing image configuration/layers for a platform. A multi-platform index can reference different manifests for different architectures.
- `ACR geo-replication` — Replicates registry content to selected regions for regional locality/availability; validate replication lag and endpoint/client behavior.

### Functions, batch and distributed app platform

- `Azure Functions` — Event-driven serverless compute using triggers and bindings. Runtime version, hosting plan, storage, scale limits and execution model shape behavior.
- `Function App` — Deployment, configuration and scaling boundary grouping Functions; Functions inside an app may share host settings and resources.
- `Azure Functions hosting plan` — Hosting/capacity/billing model for a Function App; plans differ in scale, cold start, networking and instance control.
- `Azure Functions Consumption plan` — Traditional event-driven consumption plan with dynamic scale and execution-based billing; platform, OS, runtime and networking limitations apply.
- `Azure Functions Flex Consumption plan` — Linux serverless plan with per-function scaling, VNet integration, selectable memory and optional always-ready instances; Microsoft Learn recommends it for serverless Functions.
- `Azure Functions Premium plan` — Elastic Premium option with prewarmed/always-ready capacity and additional networking/runtime capabilities, traded against baseline cost.
- `Azure Functions Dedicated plan` — Functions hosted on an App Service Plan with dedicated capacity; scaling is tied to that plan and may be shared with other apps.
- `Azure Functions trigger` — Event source that starts a function execution, such as HTTP/timer/queue/event input. Trigger-specific concurrency, retries and checkpointing matter.
- `Azure Functions binding` — Declarative connection between function code and an input/output service, often reducing boilerplate but requiring correct extension/configuration/identity.
- `Azure Functions isolated worker model` — .NET app runs in a separate process from the Functions host, providing independent dependency/configuration control. As of 2026-11-20, Functions 4.x lists .NET 11 GA for isolated worker with Azure.Functions.Sdk 1.0.1+ and an explicit Microsoft.Azure.Functions.Worker package; .NET 11 is not supported on Linux Consumption.
- `Azure Functions in-process model` — .NET function code runs in the host process. Microsoft support ended 2026-11-10; migrate to isolated worker for continued support.
- `Azure Functions in-process model support end date` — Support ended on 2026-11-10 according to Microsoft Learn. This is a lifecycle date; check the official runtime/framework support table before migration.
- `Durable Functions` — Extension for stateful workflows/orchestrations using durable history/checkpointing. Orchestrator code can replay, so it must follow deterministic/replay-safe patterns.
- `Azure Batch` — Managed service for scheduling parallel batch jobs/tasks across pools of compute nodes; suited to large-scale batch work, not general web ingress.
- `Azure Service Fabric` — Distributed application platform for microservices and containers with its own cluster and service lifecycle model; it is distinct from AKS.
- `Azure deployment center` — App Service deployment integration for supported source/build workflows; CI pipelines, security and production approval policies still need design.
- `Azure Web App for Containers` — App Service deployment option hosting a custom container image with App Service web-app management features.

## Cross-item comparison

| Platform | Team controls most | Useful fit | Main tradeoff |
|---|---|---|---|
| VM/VM Scale Set | Guest OS, runtime, patching and deployment details | Legacy/custom OS or software needs | Highest OS and fleet operations burden |
| App Service | App code/config and plan choices | Web/API hosting with managed runtime/container support | Less host control; plan/runtime feature constraints |
| Container Apps | Container image, app configuration and scale rules | Microservices/jobs without operating Kubernetes directly | Platform abstraction and trigger/profile constraints |
| AKS | Kubernetes APIs/workloads, with managed control plane | Need Kubernetes ecosystem and cluster-level control | Cluster/node/upgrade/security operations remain substantial |
| Functions | Event handler/orchestration and triggers | Discrete event-driven compute | Runtime/plan limits, cold start and retry semantics |
| Batch | Job/task definition and compute pools | Large parallel or scheduled batch | Not a general long-lived web application platform |

## Examples

For an HTTP API with ordinary web requirements, start by comparing App Service and Container Apps. Choose AKS only if Kubernetes APIs, ecosystem, policy or workload orchestration requirements justify operating the cluster. For a queue-triggered .NET background task, compare Functions Flex Consumption with Container Apps jobs; include retry/idempotency behavior, max execution, cold start, VNet needs, scale quota and monitoring. If using Functions .NET, do not create or keep an in-process model app after its 2026 support end; select isolated worker and confirm the exact framework/runtime pair.

## Common mistakes

- Choosing AKS for every container because it is the most flexible option.
- Assuming managed control plane means Microsoft operates workload, node and add-on behavior.
- Treating App Service Plan scaling as an isolated per-app action when capacity is shared.
- Assuming a deployment-slot swap reverses database or message side effects.
- Forgetting Container Apps scale-to-zero cold start or trigger credential failures.
- Treating a Container Apps revision as a database migration or immutable image digest.
- Assuming an ACR tag is immutable or geo-replication is immediate.
- Treating VM availability set as equivalent to availability zones.
- Using Spot VMs for non-interruptible state without checkpointing.
- Using an outdated Azure Functions .NET in-process execution model; its support end date has passed.
- Confusing Azure Functions runtime host version with .NET function execution model.
- Assuming Functions trigger/binding retries deliver exactly once.

## Knowledge checks with answers

1. **What does AKS manage for you?** Azure manages the control plane; node and workload responsibilities depend on the selected mode, especially AKS Automatic, and still need review.
2. **How do Container Apps and AKS differ?** Container Apps abstracts more orchestration for app/revision/job patterns; AKS exposes Kubernetes cluster APIs and operational choices.
3. **Why could a Container Apps scale rule fail to scale from zero?** The trigger/metric or credential may not work with zero replicas, or quota/capacity may block the result.
4. **What is the difference between a Functions trigger and binding?** A trigger initiates execution; bindings connect input/output data sources through configured extensions.
5. **Which .NET Functions model is out of support?** In-process support ended 2026-11-10; migrate to the isolated worker and verify supported runtime/framework combinations.
6. **Why is a deployment slot not a full release transaction?** It swaps app content/configuration aspects but does not atomically migrate or reverse databases, queues, identity grants or external effects.
