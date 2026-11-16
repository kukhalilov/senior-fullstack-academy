# AWS architecture identity networking compute and data services — Reference: Account governance, IAM policy types, federation, and temporary credentials

Sources: [AWS IAM introduction](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html), [IAM policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html), [IAM policy types](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html), [IAM roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html), [SCP and RCP scope](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_rcps.html), [EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html), and [AWS Organizations](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html).

## Scope and version

This reference teaches the 48 supplied account, identity, policy, federation, secrets, keys and audit terms. AWS changes service behavior and quotas over time; the concepts here are durable, while policy support and service-specific integrations must be checked in current service documentation. A policy name is not a shortcut for understanding its principal, action, resource, conditions and applicable scope.

## How this group fits the mental model

Identity answers **who is making which AWS API request?** Governance answers **which accounts and resources are permitted to participate?** A role trust policy controls assumption; permissions control actions after assumption. AWS Organizations adds guardrails around accounts and resources. Temporary credentials identify the resulting session and expire. Service resource policies and organization controls can participate in the authorization decision. Network reachability remains independent.

## Supplied names explained

### Account and organization boundaries

- `Amazon Web Services (AWS)` — Cloud platform whose services expose resources and APIs under account, Region and service-specific boundaries. “AWS” is not a single global account or uniform service contract; each service documents its own availability and responsibility split.
- `AWS account` — Primary administrative, billing and many security boundaries identified by a 12-digit account ID. Some resource policies can grant cross-account access, but that relationship must be configured explicitly.
- `AWS Organizations` — Service for centrally grouping and governing member accounts, applying organization policies, and consolidating billing. It provides account-management controls; it does not automatically centralize every workload’s network or IAM role design.
- `AWS organization root` — Top node in an organization hierarchy. It contains organizational units and accounts and is a target scope for supported organization policies; protect its management credentials and recovery process.
- `Organizational unit (OU)` — Container for accounts and nested OUs used to group accounts by environment, business unit or control needs. An OU is a governance scope, not an AWS account, VPC or region.
- `AWS Organizations management account` — Account that creates/manages the organization and pays consolidated bills. Its privileged responsibilities and policy behavior differ from member accounts; keep ordinary workloads out of it and tightly control its root user.
- `AWS Organizations member account` — Account attached to an organization and governed by applicable organization policies. It owns its account resources and still needs local roles, resource policies and operational controls.
- `AWS Control Tower` — Managed landing-zone service for setting up and governing multi-account AWS environments using controls, account factory and integrations. It establishes governance patterns; it does not design each workload’s application architecture.
- `AWS Control Tower landing zone` — Multi-account baseline configured by Control Tower, including shared governance and audit/logging arrangements. Treat upgrades, drift, registered OUs and customizations as managed lifecycle concerns.
- `AWS IAM Identity Center` — Workforce identity service for centrally assigning people/group access to AWS accounts and supported applications. Permission sets provision role-based access; it is not the same as an IAM user or an application workload identity.
- `IAM Identity Center user` — Workforce identity represented in the Identity Center identity source or connected directory. Prefer federated workforce identities over creating a separate IAM user for each human.
- `IAM Identity Center group` — Collection used to assign a permission set to multiple users. Review membership and nested-group semantics in the connected identity source; group assignment can confer broad account access.
- `IAM Identity Center permission set` — Template of session duration and permissions provisioned as an IAM role in selected accounts. A permission set is not itself a runtime credential; a user signs in and receives a time-limited account role session.

### Principals, roles and policy evaluation

- `AWS Identity and Access Management (IAM)` — Service defining principals, authentication credentials, roles and policy-based authorization for AWS requests. IAM settings interact with service resource policies and organization controls rather than replacing them.
- `IAM user` — Long-lived IAM identity in one account, optionally holding console credentials or access keys. Human and workload access should normally use federation or roles; if a user remains necessary, enforce MFA, rotate keys and constrain permissions.
- `IAM group` — IAM collection for organizing IAM users and attaching identity policies. Groups do not act as principals, cannot be assumed, and do not replace role-based access for workloads.
- `IAM role` — Assumable identity with a trust policy and permissions that yields temporary session credentials. Roles support workload, federation and cross-account access without distributing a persistent user key.
- `IAM role trust policy` — Resource-based policy on a role describing which principals may assume it and under which conditions. A role’s trust policy does not grant the caller the actions available after assumption; both caller-side permission and trust can matter.
- `AssumeRole` — AWS STS operation for obtaining a session for a role, subject to the caller’s permission, target trust and any session settings. The returned credentials expire; session name, tags, source identity and external ID can support auditing or third-party trust controls.
- `AWS Security Token Service (AWS STS)` — Service issuing temporary security credentials for roles and federation. Prefer regional STS endpoints where appropriate to reduce latency and align endpoint behavior; never treat temporary credentials as non-sensitive.
- `Temporary security credentials` — Access key ID, secret access key and session token with a limited lifetime. SDK credential providers should refresh them; copying them into source control or logs defeats the security benefit.
- `IAM identity-based policy` — Policy attached to a user, group or role that states allowed/denied actions and resources with optional conditions. Identity policies alone do not establish the principal’s right to reach a resource or override an applicable explicit deny.
- `IAM resource-based policy` — Policy attached to a supported resource that names principals and allowed/denied actions. It is particularly important for cross-account access; some same-account resource policy forms have evaluation nuances depending on whether the principal is a role ARN or assumed-role session ARN.
- `IAM permissions boundary` — Managed policy setting the maximum permissions an IAM user or role identity policy can grant. It does not grant permissions by itself, and it does not constrain every resource-based grant in the same way for every principal form.
- `IAM session policy` — Optional policy supplied when creating an assumed-role session to further restrict that session’s permissions. It cannot expand the role’s permissions and is not a substitute for a reviewed role policy.
- `Service control policy (SCP)` — AWS Organizations policy that limits the maximum permissions available to principals in affected member accounts. It does not grant permissions; an action must also be allowed by applicable identity/resource policies, and important exceptions (including the management account) apply.
- `Resource control policy (RCP)` — Organizations guardrail restricting external principals’ access to supported resources in member accounts. It does not grant access, has a service support list, and does not affect resources in the management account; it is not a replacement for IAM or a bucket/key policy.
- `AWS managed policy` — Policy created and maintained by AWS for common permissions. Its contents may change; attaching a broad managed policy can silently add future permissions, so inspect the current document and prefer narrower access where practical.
- `Customer managed policy` — Customer-owned reusable policy that can be versioned and attached to principals. It offers centralized reuse and review; change impact can span all attached roles/users.
- `Inline policy` — Policy embedded in a single IAM identity or resource. Its lifecycle is tied to that object and reuse/version governance is weaker than with a customer managed policy; keep it small and reviewed.
- `AWS policy evaluation logic` — Request-time evaluation of applicable policies, principal, action, resource and context. A required allow must exist, explicit deny overrides an allow, and boundaries/session/org/resource policies can constrain the result; validate with the exact request path.
- `Explicit deny` — Applicable policy statement that denies a matching request and overrides an allow. A deny can come from identity, resource or organization controls; find its policy scope and condition rather than adding another allow.

### Visibility and federation

- `IAM Access Analyzer` — Analyzer for findings such as external access to supported resources, policy validation and access analysis features. A clean result is bounded by analyzer configuration and supported resource types; it is not proof of overall workload security.
- `IAM Access Advisor` — Shows service access information for principals to help review permissions. Activity history has coverage/retention limits and should inform, not automatically dictate, least-privilege removal.
- `IAM credential report` — Account-level report about IAM users’ credential status and age/rotation signals. It does not replace live identity-provider review, role analysis, CloudTrail or incident investigation.
- `Multi-factor authentication (MFA)` — Requires an additional proof factor in supported human sign-in flows. MFA reduces password-only account takeover risk; it is not how a server workload should obtain credentials.
- `IAM Roles Anywhere` — Lets workloads outside AWS obtain temporary credentials by presenting X.509 certificates trusted by a configured profile/trust anchor. Certificate issuance, storage, revocation and role permissions remain customer responsibilities.
- `OIDC identity provider` — OpenID Connect issuer trusted by IAM for web-identity federation. The issuer, audience and subject conditions must be scoped tightly to the workload identity; do not trust an entire public issuer without claim restrictions.
- `SAML 2.0 identity provider` — Identity provider participating in federated authentication using SAML assertions. Validate issuer, audience, signing certificates and role mappings; SAML federation commonly supports workforce console access.
- `GitHub Actions OIDC provider for AWS` — IAM OIDC provider and role trust used by GitHub Actions to exchange a job identity token for AWS credentials. Restrict `aud` and `sub` claims to the intended repository, branch/environment and workflow context; use short-lived role sessions instead of repository secrets containing AWS keys.
- `EC2 instance profile` — Container that passes an IAM role to an EC2 instance so applications can request temporary credentials from the instance metadata service. Enforce IMDS protections and avoid exposing instance credentials to untrusted processes or containers.
- `IAM role for service account (IRSA)` — EKS pattern that maps a Kubernetes service account to an IAM role through the cluster’s OIDC provider and a projected service-account token. It provides workload-specific credentials but creates a role trust relationship tied to the cluster issuer and subject.
- `EKS Pod Identity` — EKS-managed association of an IAM role with a Kubernetes service account, using the Pod Identity Agent and AWS credential provider chain. It removes per-cluster OIDC provider configuration for this use case, but has cluster/OS/agent constraints and is distinct from IRSA. Review supported versions and SDKs. [EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html)

### Secrets, encryption and audit

- `AWS Secrets Manager` — Managed secret storage with access control, rotation integrations, version stages and audit support. Applications should retrieve secrets through an identity with narrow read access and cache safely; rotation is not automatic for every secret type.
- `AWS Systems Manager Parameter Store` — Hierarchical configuration/parameter store with standard and advanced tiers and optional KMS encryption for secure strings. It can hold configuration and secrets, but feature, throughput and rotation semantics differ from Secrets Manager.
- `AWS Key Management Service (AWS KMS)` — Managed cryptographic key service used directly or through AWS service integrations. Authorization, key policy, grants, key lifecycle and regional scope must fit the data-encryption path.
- `KMS key policy` — Primary resource policy controlling access to a KMS key; IAM permissions alone may not suffice unless the key policy enables IAM delegation. A key policy must retain a recoverable administrative path and separate key administration from routine cryptographic use where possible.
- `AWS CloudTrail organization trail` — Trail configured for an organization to deliver management events across member accounts and, when configured, data events. Confirm multi-Region coverage, organization account inclusion, log-file validation, encryption, access protection and retention; not every event category is enabled by default.

## Cross-item comparison

| Mechanism | What it controls | What it does not do |
|---|---|---|
| Trust policy | Who can assume a role | What that role session can call |
| Identity policy | Actions a principal may request | Network reachability or an applicable deny override |
| Resource policy | Access at a supported resource boundary | All identity and organization requirements |
| Permissions boundary/session policy | Maximum permissions for a principal/session | Grant permissions by itself |
| SCP/RCP | Organization-level maximum/guardrails | Grant access or replace service policies |
| MFA/federation | How a person/workload proves identity | Least-privilege authorization by itself |

IAM user credentials are long-lived account credentials; assumed-role credentials expire and are better suited to workloads. Identity Center permission sets provision account roles for human workforce sessions. IRSA and EKS Pod Identity both give pods AWS credentials, but their setup, trust, agent and supported-platform details differ.

## Examples

### Trace a CI deployment role

GitHub Actions requests an OIDC token whose subject identifies a specific repository/environment. IAM validates the trusted issuer and claim conditions in the role trust policy. The job’s federated principal must also have permission to call `AssumeRoleWithWebIdentity`. STS returns a short-lived role session. The role’s policy, permissions boundary, session policy, organization controls and target resource policy then determine each deployment action. If deployment can alter only one stack and pass only a named execution role, compromise of an unrelated repository does not automatically become account-wide administration.

### Diagnose an access denied response

Record the exact principal ARN, action, resource ARN, Region and request context. Confirm which credential provider supplied the identity. Check the role trust if assumption failed. If assumption succeeded, evaluate identity and resource policies, permission boundary, session policy, SCP/RCP, condition keys, KMS key policy and service-specific endpoint policy. Search for explicit deny and for missing allows. A network timeout is not an IAM denial; separate transport and authorization symptoms.

## Common mistakes

- Attaching permissions to a role but forgetting its trust policy—or making trust broad and ignoring caller permission.
- Assuming an SCP grants permissions or applies identically to the management account.
- Treating an AWS managed policy as a fixed permission snapshot.
- Reusing a CI role across all branches, pull requests and production deployments with no claim restrictions.
- Putting access keys in container images, local scripts, user data, logs or repository secrets when role federation is available.
- Believing that MFA makes a human’s workload access key safe, or that an IAM allow opens a blocked network path.
- Granting KMS use without checking the key policy, or granting key administration to every application role.
- Enabling an organization trail but assuming all data events are recorded without configuring them.

## Knowledge checks with answers

1. **What is the difference between a role trust policy and its permission policy?** Trust governs which principal may assume the role; permissions govern actions of the resulting session.
2. **Does an SCP grant `s3:GetObject`?** No. It limits the maximum available permissions; another applicable policy must allow the request.
3. **Why use OIDC in GitHub Actions?** It exchanges a narrowly scoped job token for temporary AWS role credentials, avoiding a stored long-lived access key.
4. **Do permissions boundaries grant access?** No. They cap what identity policies may grant.
5. **How do IRSA and EKS Pod Identity differ?** IRSA uses the cluster OIDC provider and service-account token trust; Pod Identity uses EKS associations and the Pod Identity Agent, with distinct support requirements.
6. **Why might an IAM-allowed KMS-encrypted S3 read still fail?** The KMS key policy/grant or encryption context may not authorize decryption, or another network/resource policy may deny the request.
7. **What is needed for trustworthy CloudTrail coverage?** Correct account/Region scope, selected event categories including needed data events, protected delivery, retention and access review.
