# cloud computing foundations and architecture — Reference: Service models, shared responsibility, accounts, and control planes

Sources: [Azure application architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/), [AWS Well-Architected Framework definitions](https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html), and [Azure cloud adoption decision guides](https://learn.microsoft.com/en-us/azure/architecture/cloud-adoption/decision-guides/).

## Scope and version

Cloud models are provider-neutral concepts with provider-specific implementations. Official Azure and AWS architecture material was checked on 2026-11-16. Exact account names, API semantics, policy inheritance, quotas, and pricing differ; Azure and AWS details live in their separate track topics.

## How this group fits the mental model

Before selecting a product, identify who operates each layer, which administrative boundary owns it, which plane carries the action, and which objective/contract you are measuring. These choices affect security, incident response, deployment automation, billing, and the blast radius of mistakes.

## Supplied names explained

### Hosting and service abstractions

- **Cloud computing** — On-demand access to configurable compute, network, storage and managed services over provider-operated infrastructure, commonly billed by commitment or use.
- **On-premises infrastructure** — Facilities and systems operated on customer-controlled premises or datacenters; ownership may still involve vendors or managed operators.
- **Hybrid cloud** — Architecture integrating cloud services with on-premises or edge environments. Connectivity, identity, data placement and operations must work across boundaries.
- **Public cloud** — Provider-operated services available to multiple customers with logically isolated tenancy. It does not mean workload data is public.
- **Private cloud** — Cloud-like self-service/elastic infrastructure dedicated to one organization, on-premises or hosted. Dedicated hardware does not automatically provide good cloud operations.
- **Infrastructure as a Service (IaaS)** — Provider supplies virtualized infrastructure; customer commonly manages guest OS, patches, runtime, app and data, though exact division varies.
- **Platform as a Service (PaaS)** — Provider manages more of host/runtime/platform; customer manages app code, configuration, identity, and data. Customization/control is traded for operational reduction.
- **Software as a Service (SaaS)** — Provider operates a finished application; customer still controls users, data handling, configuration, integrations and endpoint policy.
- **Function as a Service (FaaS)** — Event-triggered function execution with provider-managed provisioning/host lifecycle and often per-invocation billing; execution duration, concurrency and state have limits.
- **Serverless computing** — Abstraction where provider automates much infrastructure capacity/lifecycle and often scales with use; servers still exist, quotas/cold starts and responsibility still apply.
- **Managed service** — Provider operates specified infrastructure/platform tasks. The service contract defines which tasks; customer retains configuration/data/access and business accountability.
- **Shared responsibility model** — Provider/customer division of operational/security tasks. It changes with service type and configuration; read the provider's service-specific matrix, not only a generic diagram.

### Planes and administrative hierarchy

- **Control plane** — APIs/control systems that create/configure resources and policies. It can be impaired independently of existing workload traffic.
- **Management plane** — Administrative interfaces for resource inventory, configuration, authorization and lifecycle; providers may use “management plane” and “control plane” differently.
- **Data plane** — Endpoints/processes that serve workload requests, such as database queries or object reads. Management access can fail while some data-plane operations continue.
- **Cloud account** — Provider administrative container for resources, identities/policy context, quotas and/or billing; “account” exact meaning differs by provider.
- **Cloud tenant** — Identity/directory or isolation boundary in some providers; it is not necessarily the same object as a billing account or subscription.
- **Cloud subscription** — Provider-specific resource/billing/administration scope (Azure terminology); not a provider-neutral synonym for every account.
- **Cloud project** — Provider-specific resource and IAM boundary (Google/AWS concept varies); do not infer semantics from the word “project.”
- **Organization hierarchy** — Parent-child arrangement of accounts/tenants/projects for governance, billing, identity and policy inheritance.
- **Resource group** — Lifecycle/management grouping (e.g. Azure) for related resources; it is not a security boundary unless policies/permissions make it one.
- **Management group** — Azure hierarchy scope above subscriptions for policy/role assignment; provider-specific term.
- **Organizational unit (OU)** — Grouping construct in some cloud/account hierarchies, notably AWS Organizations; policy inheritance semantics are provider-specific.
- **Landing zone** — Governed cloud foundation including identity, network, policy, security monitoring and account/subscription structure, tailored to organizational requirements.
- **Workload** — Components and operations delivering a business outcome; use a boundary meaningful for ownership, reliability, security, and cost.
- **Environment boundary** — Deliberate separation between development/test/production resources, identities, secrets and data. Naming alone does not isolate access.

### Resources, automation, and service objectives

- **Resource** — Provider-managed object such as VM, network, key vault, database or role assignment; lifecycle and identifiers are provider-specific.
- **Resource provider** — Provider API/service namespace implementing a resource type; some platforms require registration/enabling before creation.
- **Resource identifier** — Provider-specific name/URN/URI identifying a resource and often its hierarchy; it can change on replacement and may encode region/scope.
- **Infrastructure as code (IaC)** — Versioned code/config that creates and manages infrastructure. Use review, state controls, secrets separation, least-privilege deployment identity and drift handling.
- **Declarative provisioning** — Describe desired state; tool computes a plan/reconciliation. Idempotence depends on the tool/provider and external side effects.
- **Imperative provisioning** — Issue explicit ordered create/update/delete actions. It can be precise but needs careful retry/partial-failure/idempotence handling.
- **Configuration drift** — Actual cloud state differs from approved code/baseline because of manual edits, automation, or provider changes; detect and choose deliberate remediation.
- **Policy as code** — Machine-enforced or audited rules for resource settings/access; test policies and distinguish deny-at-deploy from detect-and-remediate.
- **Cloud service quota** — Provider/service/region/API capacity ceiling. Quota may be adjustable or hard; reserve headroom and request increases before scale events.
- **Service-level agreement (SLA)** — Contract with defined measurement, exclusions, and often remedies/credits. It is not a workload availability promise.
- **Service-level objective (SLO)** — Target for an SLI over a time window, such as successful request fraction or latency percentile.
- **Service-level indicator (SLI)** — Quantitative measurement of user-relevant service behavior; define population, numerator/denominator, window, and source.

## Cross-item comparison

| Model | Provider manages | Customer commonly manages | Main tradeoff |
|---|---|---|---|
| IaaS | Facilities, hardware, virtualization | OS, runtime, app, data and much networking | High control and operational burden |
| PaaS | Infrastructure plus more platform/runtime | App, data, identity, settings | Faster operations with platform constraints |
| SaaS | Application stack and service | Users, data use, configuration, integration | Less operation, less implementation control |
| FaaS | Host/runtime scaling and invocation layer | Function behavior, triggers, permissions, data | Event scaling with execution/concurrency constraints |

Control/management plane provisions and configures; data plane serves workload. They share dependencies but need separate availability/security design.

## Examples

An IaC deployment identity may need permission to create a VM and role assignment at a project scope. Granting owner at the organization root is simpler but increases blast radius. A team can instead grant the pipeline identity narrow scope and separately approve role-assignment creation. If a deployment fails because the control plane is unavailable, existing app traffic may continue; confirm behavior before assuming recovery or stopping services.

## Common mistakes

- Treating tenant, subscription, account, project, and resource group as interchangeable.
- Assuming a managed service means the provider handles data classification, IAM or recovery tests.
- Treating a service SLA credit as proof the workload meets its SLO.
- Assuming declarative IaC automatically prevents drift or safely imports manual changes.
- Giving deployment automation organization-wide administrator rights by default.
- Assuming cloud “private” means physically isolated or “public” means data is visible to everyone.

## Knowledge checks with answers

1. Does SaaS remove customer responsibility? **No; customer still governs users, data, configuration, integrations and use.**
2. Can a data plane work during control-plane impairment? **Sometimes; it is service-specific, so test and design explicitly.**
3. Does an SLA equal an SLO? **No; SLA is a contractual commitment, SLO is an engineering target.**
4. Is a resource group always an IAM boundary? **No; it may be a lifecycle grouping, and effective policy determines access.**

