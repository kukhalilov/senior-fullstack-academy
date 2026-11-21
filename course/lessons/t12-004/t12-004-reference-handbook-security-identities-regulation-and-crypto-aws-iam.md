# architecture patterns multi-region tenancy and reliability — Reference: AWS IAM

Sources: [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html), [policy types](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html), [policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html), [policy evaluation details](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html), [permissions boundaries](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html), [IAM roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html), [temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html), [IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).

## Scope and version

This is a conceptual guide to AWS Identity and Access Management (IAM) and its policy evaluation model based on AWS’s current User Guide on 2026-11-20. IAM rules can vary by service, principal type, account relationship, and policy type. Always verify the action/resource/condition support in the target service’s authorization reference and test the actual request path. IAM is AWS-specific; its policy semantics are not equivalent to Azure RBAC, Google Cloud IAM, Kubernetes RBAC, or application-level authorization.

## How this group fits the mental model

Every AWS request needs a principal, an action, a resource, and context such as account, tags, source network, or MFA state. IAM evaluates applicable policies and conditions to decide whether the request is allowed. The mental model is: **default deny; at least one applicable allow is needed; any applicable explicit deny wins; additional policy types can constrain the result.** The details depend on the request path, especially resource policies, role sessions, cross-account access, and organization guardrails.

## Supplied names explained

- **Principal:** the authenticated identity making a request, such as an IAM role session, federated user, or AWS service. A role’s trust policy controls who can assume it; permissions policies control what the assumed role may do.
- **Action:** an AWS API operation such as `s3:GetObject`.
- **Resource:** the ARN or resource scope to which a statement applies. Some actions do not support resource-level scoping and require `"*"`; check service documentation.
- **Condition:** additional predicates evaluated against request context, such as tags, source account, VPC endpoint, MFA, or organization ID. Missing keys and operators can change evaluation; design conditions deliberately.
- **Identity-based policy:** attached to a user, group, or role. It grants actions to that identity when applicable.
- **Resource-based policy:** attached to a resource, such as an S3 bucket policy, and names principals that may access it.
- **Role trust policy:** a resource-based policy on a role that controls which principals may assume it. It is not the role’s permissions policy.
- **Permissions boundary:** a managed policy setting the maximum actions identity-based policies can grant to a user or role; it does not itself grant permission.
- **Session policy:** an optional policy that narrows a temporary role/federated session.
- **SCP/RCP:** AWS Organizations service control policies constrain permissions available to principals in member accounts; resource control policies constrain access to resources in member accounts. They are guardrails, not grants.
- **VPC endpoint policy:** constrains requests traversing that endpoint; it is an additional filter, not a replacement for identity/resource permissions.
- **STS temporary credentials:** short-lived credentials used by assumed roles and federation, preferred for workloads and human access over embedded long-lived access keys.

AWS documents ten policy types, including identity-based, resource-based, VPC endpoint, permissions boundary, SCP, RCP, ACL, AWS RAM resource shares, session policy, and scope-down policies. Not every type applies to every service/request.

## Evaluation: safe mental model and important exceptions

For a same-account request, identity- and resource-based grants often combine as a union, and an explicit deny overrides an allow. Boundaries, session policies, endpoint policies, and Organizations controls may further limit effective access. In many common cases, identity permissions intersect with a permissions boundary and an applicable SCP/RCP guardrail.

Do not reduce all AWS decisions to “all policies are intersected.” AWS documents important principal-specific exceptions. For example, a same-account resource policy granting directly to an IAM user ARN or role-session principal can behave differently from a grant to a role ARN; implicit denies in some identity policy/boundary/session policies may not limit a direct resource-policy grant to a session principal. Cross-account access generally requires both the principal’s account to authorize the request and the resource-owning account to trust/grant it, with applicable organization controls. Use AWS’s exact evaluation diagrams and policy simulator for the principal/resource path in question.

An explicit `Deny` in any applicable policy type normally overrides an `Allow`. A missing `Allow` is an implicit deny. Policy statements match only when effect, action, resource, principal (where applicable), and all conditions match the request context.

## Example: .NET workload reading one S3 prefix

Run the application on an AWS compute service with an attached IAM role and temporary credentials. Its identity policy grants only the required `s3:GetObject` on the exact bucket prefix and, if necessary, `kms:Decrypt` on the specific KMS key. The bucket policy can require the expected organization, TLS, or VPC endpoint where the service supports those conditions. An SCP can prevent risky account-level actions, but it does not give the application access to the bucket. Avoid static credentials in app settings or source control.

For a cross-account access pattern, the consuming workload assumes a role in the resource account. The target role’s trust policy restricts the source role/account and appropriate conditions; its permissions policy limits the allowed actions/resources. Confirm the bucket/resource policy and KMS key policy also permit the path. Test the assumed role session—not only a policy document in isolation.

## Roles, federation, and credential lifecycle

- Use IAM roles and STS sessions for AWS workloads, cross-account access, and federated humans. Prefer IAM Identity Center or an external identity provider for workforce access rather than creating long-lived IAM users for each person.
- Restrict role assumption with specific principals and conditions such as audience, source identity, organization, or external ID where the federation scenario requires them. External ID mitigates a particular confused-deputy risk; it is not a general secret password.
- Reduce session duration and permissions to what the task needs. Session tags can support ABAC if trusted and constrained at assumption time.
- Rotate, remove, and monitor any necessary access keys; use credential reports and access analysis to find unused or public access. Never place credentials in frontend React code: browser code is public to its user. A backend should obtain temporary credentials through its workload role.
- Separate break-glass access, routine deployment access, and human administration. Audit role assumptions and sensitive policy mutations.

## Least privilege and policy engineering

1. Start with a narrowly scoped role per workload or task; avoid shared administrative roles.
2. Enumerate required API actions and resources from application behavior and service authorization docs.
3. Add conditions only when their context keys are supported by the service and request type. Test both matching and non-matching requests.
4. Use permission boundaries/Organizations guardrails to limit delegation and account-wide blast radius, understanding their exceptions and scope.
5. Review access with IAM Access Analyzer, CloudTrail, policy validation tools, and the IAM Policy Simulator. These tools assist; they do not prove all runtime paths safe.
6. Deploy policy changes through review and infrastructure-as-code. Keep rollback access that is tightly controlled.
7. Monitor `AccessDenied`, unusual role assumptions, privilege escalation paths, changes to trust/permission policies, and anomalous resource policy edits.

## Cross-item comparison

- **Identity policy** attaches permissions to a principal; **resource policy** attaches permissions to a resource and can support direct or cross-account grants.
- **Trust policy** answers who may assume a role; **permissions policy** answers what the resulting role session may do.
- **Permissions boundary** and **SCP/RCP** cap/guard access; none grants an action on its own.
- **RBAC** groups permissions by role; IAM policies can also use attributes and conditions for ABAC-style controls. Attribute values must come from trusted sources.
- **AWS IAM is cloud-plane authorization.** It does not replace authorization inside a multi-tenant .NET application. An AWS role allowed to read a database does not prove that an end user is permitted to see a particular tenant’s row.

## Common mistakes

- Assuming an attached identity policy is the only policy that affects a request.
- Saying permissions boundaries or SCPs grant permissions; they are guardrails.
- Confusing role trust policy with the role’s permission policy.
- Using `Resource: "*"` without verifying whether resource-level scoping is supported and needed.
- Assuming every resource-policy allow is limited by an implicit boundary/session-policy deny in the same way; principal type matters.
- Treating a successful policy simulation as proof of the entire live path, including resource policies, service-specific behavior, and organization controls.
- Embedding IAM access keys in a React bundle, container image, or source repository.
- Granting a backend broad account administration because its data path uses only one service action.
- Assuming cloud IAM protects tenant rows inside an application database.

## Knowledge checks with answers

1. **Does a permissions boundary grant an action?** No. It limits what identity-based policies may grant.
2. **What is the difference between a role trust policy and its permissions policy?** Trust controls who can assume the role; permissions control what the resulting session can do.
3. **What is the default when no applicable allow exists?** Deny, even if no explicit deny is present.
4. **What happens when an applicable explicit deny matches?** It overrides an allow.
5. **Why can “all policies intersect” be misleading?** AWS has policy-type and principal-specific evaluation rules, particularly for resource policies and session principals. Follow the official evaluation path for the exact request.
6. **Should React code call AWS using a long-lived IAM user key?** No. Browser-delivered code is visible; route requests through a backend or a carefully designed federated client flow using temporary, narrowly scoped credentials.

## Examples

The report worker’s role is allowed to read `arn:aws:s3:::reports-prod/daily/*` and decrypt with the specific KMS key. An SCP blocks disabling organization-level audit controls, while the permissions boundary caps what a deployment role can grant. If the bucket policy explicitly denies non-TLS access, that denial wins even when the role policy allows `GetObject`.

## Practice exercise

Design IAM access for a .NET report worker that reads one S3 prefix and decrypts with one KMS key. Write the role trust policy separately from the permission policy. Add a boundary and organization guardrail, explain which are grants versus caps, and test same-account and cross-account access—including a deliberate explicit deny.
