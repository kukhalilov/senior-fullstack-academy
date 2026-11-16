# cloud computing foundations and architecture — Reference: Principals, permissions, network boundaries, and secret handling

Sources: [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/), [Azure application architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), and [AWS Well-Architected Framework definitions](https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html).

## Scope and version

This lesson covers provider-neutral IAM/network/security patterns. Azure and AWS use different principal, role, policy, scope, federation and private-connectivity APIs; consult provider-specific references for exact evaluation order and fields.

## How this group fits the mental model

Cloud authorization asks which principal may perform which action against which resource, under which conditions, at what scope. Network reachability is separate: a permitted identity cannot reach a private endpoint if routes/DNS/firewalls fail, and a reachable endpoint does not grant authorization. Secrets and keys have lifecycle and recovery requirements beyond “stored securely.”

## Supplied names explained

### Principals, roles, and policy

- **Cloud identity and access management (IAM)** — Provider services for principals, authentication, authorization, role/policy assignment and federation; exact service names and evaluation rules differ.
- **Human identity** — Workforce user identity authenticated through an identity provider, commonly federated with MFA/conditional access.
- **Workload identity** — Non-human principal for application/service automation. Prefer short-lived federated credentials over embedded long-lived keys when supported.
- **User principal** — Identity representing a user. Human accounts should use strong authentication and distinct administrative roles.
- **Service principal** — Application/service identity object in some providers, often paired with credentials/certificates; rotate and scope credentials carefully.
- **Managed identity** — Provider-managed identity/credential lifecycle attached to a workload where available; access still depends on role assignments and metadata-service protection.
- **Federated identity** — Trust relationship allowing an external identity provider's signed claims to authenticate to cloud without a static secret; constrain issuer, audience, subject and workflow.
- **OpenID Connect workload federation** — Protocol pattern where a CI/workload obtains short-lived cloud credentials from a trusted OIDC token; restrict repositories, branches/environments and audiences.
- **Security principal** — Entity used in authorization decisions, such as user, group, app, managed identity, or role session.
- **Role** — Named collection of permitted actions at a scope. Built-in/custom role semantics vary; avoid broad roles when a narrow permission set suffices.
- **Role assignment** — Binding of principal + role + scope (and optional conditions) that grants effective access after policy inheritance/deny rules are evaluated.
- **Identity-based policy** — Permission policy attached to a principal/role that states what the identity can do; effective access can also depend on boundaries/denies.
- **Resource-based policy** — Policy attached to a target resource that grants or denies access to principals; not all providers/services support it uniformly.
- **Role-based access control (RBAC)** — Grants permissions through role membership at scopes; simple for job-function and resource hierarchy patterns.
- **Attribute-based access control (ABAC)** — Evaluates principal/resource/action/context attributes and conditions; expressive but harder to reason about/test.
- **Least privilege** — Minimum actions, resources, time and conditions needed for a task; review effective access and remove stale grants.
- **Permission scope** — Hierarchy boundary at which a grant applies and may inherit. Use narrow scopes and understand parent policy.
- **Management-group scope** — Azure-specific scope above subscriptions; use for shared governance only when broad inheritance is intended.
- **Subscription scope** — Azure resource/billing boundary. A grant here may affect many resource groups/resources.
- **Resource-group scope** — Azure grouping and policy/role scope; affects resources within group but is not interchangeable with subscription/tenant.
- **Resource scope** — Individual resource or provider-specific descendant path; often the narrowest practical grant.

### Network boundary and endpoints

- **Cloud security group** — Provider-specific virtual firewall rule set associated with network interfaces/subnets/resources. Stateful behavior, default rules and processing order differ.
- **Network security rule** — Allow/deny condition on protocol, ports, addresses, direction and priority; default/implicit rules and precedence are provider-specific.
- **Public endpoint** — Service endpoint reachable through public network address space, possibly still authenticated/filtered. “Public” does not mean anonymous, but expands exposure.
- **Private endpoint** — Private network interface/path to a managed service, often tied to private DNS. It does not by itself grant service IAM permission or eliminate all public access.
- **Private service connectivity** — Provider mechanism connecting a workload privately to a service without ordinary public routing; names and routing/DNS behavior vary.

### Secrets, encryption, and evidence

- **Secret** — Sensitive value such as API token, password, signing credential or connection string. Minimize copies, scope access, rotate after exposure and avoid logs.
- **Managed secret store** — Provider service for storing/retrieving secrets with IAM, versioning and audit. Availability, network access, recovery and rotation must be designed.
- **Key rotation** — Replace or roll encryption/signing credentials on a planned schedule or after compromise; ensure consumers and backups can transition safely.
- **Encryption at rest** — Cryptographic protection of stored data/media. Understand provider-managed defaults, key scope, backups/replicas and who can decrypt.
- **Encryption in transit** — Protects data over network protocols (typically TLS); validate identity, certificate handling, minimum protocols and internal hops.
- **Customer-managed key** — Customer controls key lifecycle/policy in provider key service; improved control can create availability/recovery risks if key disabled/deleted.
- **Provider-managed key** — Provider manages underlying key lifecycle under service default; less operational burden, with different control/audit requirements.
- **Cloud security posture** — Current configuration/risk view across resources, identity, network, data and controls; findings require prioritization and evidence, not just score chasing.
- **Cloud audit log** — Records management/API activity and sometimes data access. Configure retention, access, integrity/export and alerting; not every service emits every event by default.

## Cross-item comparison

| Access mechanism | Main input | Strength | Operational challenge |
|---|---|---|---|
| RBAC | Principal's role at a scope | Understandable job permissions | Broad inheritance and role sprawl |
| ABAC | Principal/resource/request attributes | Fine-grained contextual decisions | Attribute quality, policy testing, explainability |
| Identity policy | What principal may request | Central identity governance | Resource owner must still trust identity |
| Resource policy | Who target resource accepts | Cross-account/resource sharing | Service-specific support and precedence |
| OIDC federation | Signed short-lived external claims | Avoid stored CI secret | Trust conditions must tightly bind issuer/subject/audience |

## Examples

A CI pipeline can exchange an OIDC token for temporary credentials only when issuer, audience, repository, branch/environment and workflow identity match. Give it deployment permissions at a dedicated environment resource scope and no production data-read permission unless required. For a private database, separately verify DNS resolves to its private endpoint, route/security policy allows the path, and the workload identity is authorized by the database.

## Common mistakes

- Storing a service principal client secret in source code, image, or CI logs.
- Granting Owner/Administrator at tenant/organization scope to a routine deployment pipeline.
- Assuming an inherited role assignment is visible from the resource's local configuration only.
- Treating private endpoint as a replacement for IAM or public-access policy.
- Disabling a customer-managed key without checking encrypted backups and dependent services.
- Assuming management audit logs include data-plane reads or are retained indefinitely.
- Using ABAC conditions without tests for absent/null/malformed attributes.

## Knowledge checks with answers

1. What are the three core pieces in an RBAC grant? **Principal, role/permissions, and scope.**
2. Does a private endpoint authorize a user? **No; network path and IAM authorization are separate.**
3. Why prefer federated CI identity? **It can exchange short-lived claims for cloud credentials rather than storing long-lived secrets.**
4. Why can customer-managed keys reduce availability? **Key disable/deletion/access failures can make encrypted data inaccessible.**

