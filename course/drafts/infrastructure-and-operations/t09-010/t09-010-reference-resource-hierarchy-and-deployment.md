# Microsoft Azure architecture identity networking compute and data services — Reference: Azure governance hierarchy, ARM, templates, and policy

Sources: [Azure Resource Manager overview](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview), [Management groups](https://learn.microsoft.com/en-us/azure/governance/management-groups/overview), [Bicep overview](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview), [Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/overview), [Deployment stacks](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/deployment-stacks), [Azure Resource Graph](https://learn.microsoft.com/en-us/azure/governance/resource-graph/overview), and [Azure landing zones](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/landing-zone/).

## Scope and version

This guide covers common governance, ARM deployment and policy concepts, not every Azure Resource Provider API or CLI option. Microsoft services evolve independently; verify the subscription, cloud, region, provider registration and current documentation before deployment. Current service concepts were checked 2026-11-16.

## How this group fits the mental model

The scope hierarchy determines where resources live, inherit policy/role assignments and are billed. ARM provides the control plane. IaC and command-line tools submit repeatable management operations. Azure Policy evaluates configuration; RBAC controls who may perform actions. Activity logs and Resource Graph provide different views of changes and inventory.

## Supplied names explained

### Geography and resource scopes

- `Microsoft Azure` — Microsoft's cloud platform for managed infrastructure, identity, applications and data services. Its products do not all share one deployment or availability model.
- `Microsoft Azure region` — Geographic deployment location containing one or more datacenters. Service availability, SKU and zone support vary by region.
- `Azure availability zone` — Physically separate location within a supported region, with independent power/network/cooling characteristics; products differ in how they use zones.
- `Azure region pair` — Microsoft-defined region pairing relationship used by some platform recovery/update patterns. It does not automatically fail over an application or every service.
- `Azure geography` — Broad geographic boundary used for residency and service organization; it is not the same unit as a region or zone.
- `Azure resource` — Deployable/manageable instance such as a VNet, database or app. Resource provider and resource type define its management schema.
- `Azure resource provider` — Service namespace that exposes resource types and control-plane operations, commonly registered/used through ARM.
- `Azure resource ID` — Canonical path identifying a resource and its scope/type/name; use it to reason about role assignments, dependencies and logging.
- `Azure management group` — Optional scope above subscriptions for organizing governance and inheriting policy/role assignments. Broad inheritance should be deliberate.
- `Azure subscription` — Governance, quota and billing boundary containing resource groups. Separate subscriptions can isolate environments, teams or billing responsibilities.
- `Azure resource group` — Lifecycle and management scope for resources. Group resources with related lifecycle/ownership, while recognizing that dependencies can cross groups.
- `Azure Resource Manager (ARM)` — Azure's deployment and management service/API. It provisions resource configurations but is distinct from the resource's data-plane endpoint.
- `Azure Resource Manager control plane` — Management operations such as create/update/delete, role assignment or policy configuration. A control-plane success is not proof of application data access.
- `Azure resource data plane` — Service-specific operations such as reading a blob or querying a database. It may use separate authorization, endpoint and network rules from ARM.
- `Azure Resource Manager template (ARM template)` — JSON declaration of Azure resources and dependencies interpreted by ARM. Parameterization/reuse and deployment mode affect change behavior.

### Repeatable deployment and tools

- `Bicep` — Declarative language that compiles to ARM deployment templates; it reduces JSON verbosity but still requires review of the generated resource and permission changes.
- `Bicep module` — Reusable deployment unit that exposes typed parameters and outputs at a scope. Module boundaries should reflect ownership and not conceal broad permissions.
- `Bicep parameter` — Input value for a Bicep deployment. Keep secrets out of checked-in parameter files and use secure delivery mechanisms.
- `Bicep output` — Deployment result value exposed to a parent deployment or caller; do not output secret values into logs/history.
- `Bicep targetScope` — Declares deployment scope such as tenant, management group, subscription or resource group; the scope determines what resources/operations are valid.
- `Azure Resource Manager what-if operation` — Previews expected resource changes for a deployment. It helps catch destructive differences but is not a transaction guarantee for provider-side effects.
- `Azure Resource Manager incremental deployment mode` — Applies declared resource changes while leaving unrelated resources in the scope; removing a resource from the template does not generally delete it.
- `Azure Resource Manager complete deployment mode` — Historical deployment mode with deletion implications for resources omitted from a deployment at certain scopes. Prefer safer scoped ownership and verify current support/behavior before use.
- `Bicep resource symbolic name` — Local name used to refer to a declared resource within Bicep; distinct from the deployed resource's Azure name.
- `Azure CLI (az)` — Cross-platform CLI for Azure management and service operations. Authenticate and set the intended cloud/subscription/context before any mutation.
- `Azure PowerShell Az module` — PowerShell cmdlets for Azure management and service operations. Context selection is a critical safety step in multi-subscription sessions.
- `Azure Cloud Shell` — Browser-accessible authenticated shell with Azure CLI/PowerShell and a managed environment; persisted files and installed tools have environment-specific limits.

### Policy, inventory and operational governance

- `Azure Policy` — Governance service evaluating resource configuration against assigned rules/effects; evaluation and remediation are distinct asynchronous operations.
- `Azure Policy definition` — Rule and effect describing a configuration requirement or action, such as audit, deny, modify or deploy-if-not-exists where supported.
- `Azure Policy initiative` — Group of related policy definitions assigned together, often aligned to a compliance goal.
- `Azure Policy assignment` — Binds a definition/initiative to a scope with parameters and identity/options; assignment scope determines reach.
- `Azure Policy exemption` — Documented scoped exception from an assignment, ideally with category, owner, justification and expiry.
- `Azure Policy compliance evaluation` — Periodic/on-demand assessment of resources against assigned policy. A compliant state does not mean the whole workload is secure or available.
- `Azure Resource Graph` — Query service for resource inventory/metadata across authorized scopes; results are not a real-time replacement for every provider API.
- `Azure deployment stack` — Resource-management feature grouping a deployment's resources and governing cleanup/deny settings. Deletion behavior is powerful; scope and ownership need deliberate review.
- `Azure deployment stack deny settings` — Controls that block selected management actions on stack-managed resources; validate exceptions and don't mistake deny settings for backup.
- `Azure landing zone` — Enterprise-scale Azure environment pattern with governance, identity, network and management foundations. It is an architecture approach, not one resource type.
- `Azure naming convention` — Organization rule for predictable resource names and uniqueness. Resource-specific length/character constraints still apply.
- `Azure tag` — Key/value metadata for ownership, environment, cost allocation or automation. Tags are not authorization controls and may not automatically inherit.
- `Azure resource lock` — Management-plane guard against accidental deletion or modification at a scope; it can block automation but does not protect data from all changes or failure.
- `Azure Activity Log` — Subscription-level record of control-plane events such as resource writes/deletes and service health events. Configure export/retention if longer analysis is needed.
- `Azure service quota` — Limit on resource capacity/operations by service, region or subscription. Quotas can prevent scale-out even when deployment templates are valid.
- `Azure service quota` — Service/provider limit that may require a quota increase and is not the same as a budget.
- `Azure Well-Architected Framework` — Microsoft guidance organized around reliability, security, cost optimization, operational excellence and performance efficiency; use it to review tradeoffs, not as a compliance certificate.
- `Azure Well-Architected reliability pillar` — Guidance on designing, operating and recovering workloads against defined reliability targets.
- `Azure Well-Architected security pillar` — Guidance on threat modeling, identity, network, data and operational security controls.
- `Azure Well-Architected cost optimization pillar` — Guidance on value-aware spending, measurement, sizing and cost governance.
- `Azure Well-Architected operational excellence pillar` — Guidance on observability, automation, deployment safety and continuous improvement.
- `Azure Well-Architected performance efficiency pillar` — Guidance on meeting workload demand efficiently through measurement, scaling and appropriate service design.

## Cross-item comparison

| Scope/tool | What it groups or does | Main caution |
|---|---|---|
| Management group | Multiple subscriptions | Inherited policy/roles can have wide impact |
| Subscription | Billing, quota and resource-group scope | It does not isolate Entra tenant identity by itself |
| Resource group | Related resources and lifecycle operations | Cross-group dependencies still need planning |
| ARM template/Bicep | Desired control-plane configuration | IaC changes can still delete, expose or overprivilege resources |
| Policy | Configuration compliance and effects | Evaluation/remediation is asynchronous and not a complete security review |
| RBAC | Who can perform which management/data action | Scope inheritance and data-plane role differences matter |

## Examples

For a production deployment, keep a Bicep module for the shared VNet, one for application resources, and one for monitoring/alerts only if ownership and lifecycle boundaries are clear. Supply location/tier as non-secret parameters; retrieve secret material at runtime through identity. Use what-if in the review pipeline and inspect role assignments, public exposure, policy effects, locks and delete behavior before applying. After deployment, query resource inventory and activity changes, then verify the data-plane connection from the workload.

## Common mistakes

- Treating resource group as a hard isolation boundary for all identity/network access.
- Assuming region pair means automatic replicated application state.
- Mixing data-plane permission needs into broad ARM Contributor grants.
- Using complete mode without understanding what omitted resources may be deleted.
- Printing secrets through Bicep outputs or CLI command history.
- Relying on tags as a security boundary or assuming every service inherits tags.
- Treating Policy compliance as proof that the workload meets its reliability/security requirements.
- Ignoring quota until autoscaling or a deployment needs additional capacity.
- Running a PowerShell/CLI command against the wrong subscription context.
- Adding a resource lock that blocks a necessary restore, upgrade or cleanup action without documenting an operator path.

## Knowledge checks with answers

1. **How do ARM control plane and resource data plane differ?** ARM provisions/configures resources; data-plane endpoints perform service-specific operations such as reading or writing application data.
2. **What is the main difference between management group and subscription?** Management groups organize subscriptions for inheritance/governance; subscriptions commonly define billing/quota and contain resource groups.
3. **Does what-if guarantee that apply will have no side effects?** No. It previews expected resource changes; provider/runtime side effects and external dependencies still require review.
4. **When use a Policy exemption?** For a documented, scoped exception with accountable owner and duration, not to silently bypass policy.
5. **Does a lock protect data from corruption?** No. It restricts selected management operations; backup, access control, retention and tested recovery address other risks.
6. **Can a budget stop usage automatically?** A cost budget typically notifies; use additional quota/policy/operational controls for prevention.
