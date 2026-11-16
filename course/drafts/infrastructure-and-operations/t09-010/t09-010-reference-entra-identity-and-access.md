# Microsoft Azure architecture identity networking compute and data services — Reference: Microsoft Entra identities, workload credentials, and authorization

Sources: [Microsoft Entra app and service-principal objects](https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals), [Managed identities](https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview), [Workload identity federation](https://learn.microsoft.com/en-us/entra/identity-platform/workload-identity-federation), [OAuth authorization code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow), [OAuth client credentials](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow), [Azure RBAC](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview), [Key Vault RBAC](https://learn.microsoft.com/en-us/azure/key-vault/general/rbac-guide), and [Azure Functions support](https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions).

## Scope and version

This reference explains Microsoft Entra identities and common Azure authorization/credential paths. Token claims, Conditional Access features, workload federation, Key Vault access models and service data-plane roles change; follow current Microsoft Learn and the destination service's permissions reference. The .NET Azure Functions in-process model support ended on 2026-11-10; this is a service support lifecycle fact, not an Entra identity feature.

## How this group fits the mental model

Authentication proves an identity to a token issuer/resource. Authorization then decides what that principal may do at a particular scope and plane. A credential is how a workload obtains a token; a role assignment is what can authorize the resulting principal. Key Vault is a service with its own data-plane operations, and network/DNS access is an additional requirement. Avoid storing credentials if a managed or federated identity can be used.

## Supplied names explained

### Tenant and directory objects

- `Microsoft Entra ID` — Microsoft's identity and directory service for users, groups, applications and authentication policies.
- `Microsoft Entra tenant` — Organization-specific Entra directory boundary containing identities, app objects, policies and tenant-local service principals.
- `Tenant ID` — Stable identifier for a directory, used to scope authentication authority and identify a tenant; it is not secret.
- `Microsoft Entra user` — Human identity object. Authentication method, licensing, guest status and Conditional Access policies affect its sign-in.
- `Microsoft Entra group` — Directory collection of users/service principals used for access assignment and governance; nested/group membership behavior must match the target assignment.
- `Microsoft Entra application object` — Global application definition including redirect URIs, credentials, app roles and requested permissions. It is distinct from its per-tenant service principal.
- `App registration` — Registration workflow/object configuration for an application in Entra. Registration alone does not grant Azure resource permissions.
- `Application (client) ID` — Identifier of the application object used by authentication requests and federated credentials; not a client secret.
- `Service principal object` — Tenant-local security principal representing an application or managed identity; role assignments generally target this object identity.
- `Enterprise application` — Entra portal term for the tenant-local service-principal view and its sign-in/provisioning/access configuration.

### Workload identity and token acquisition

- `Managed identity` — Azure-managed Entra identity/credential lifecycle for supported Azure resources; application permissions must still be granted.
- `Azure managed identity token` — Short-lived Microsoft Entra access token acquired for a target resource using the workload's managed identity; request the correct audience/scope and let the SDK handle endpoint selection and renewal instead of persisting the token.
- `System-assigned managed identity` — Identity created with a resource and removed when that resource is deleted. Recreating the resource generally creates a new principal ID.
- `User-assigned managed identity` — Independent identity resource associated with one or more supported workloads. It can survive an app/VM replacement and requires explicit lifecycle ownership.
- `Managed identity lifecycle` — Creation, association, principal-ID change, assignment, rotation and deletion process. Do not leave stale role assignments or assume a re-created identity has the same object ID.
- `Microsoft Entra workload identity federation` — Trust pattern exchanging a signed token from an external identity provider for an Entra token without a stored client secret.
- `Federated identity credential` — Trust configuration on an app/identity that restricts issuer, subject and audience claims accepted from an external identity provider.
- `Azure workload identity for AKS` — Federates a Kubernetes ServiceAccount token to Entra for Pod workload access, avoiding long-lived cloud secrets in cluster configuration.
- `Microsoft identity platform` — Microsoft identity endpoints and protocols used to authenticate users/apps and issue tokens for Microsoft APIs and registered resources.
- `Microsoft Authentication Library (MSAL)` — Client libraries that implement Microsoft identity platform authentication flows, token caching and acquisition; use a supported credential flow for the app type.
- `OAuth 2.0 authorization code flow` — Interactive authorization flow where a user authenticates and a client obtains tokens through a redirect. Use PKCE for public clients and validate redirect/state/nonce protections appropriate to the client.
- `OAuth 2.0 client credentials flow` — App-only flow for a confidential client authenticating with a certificate, secret, or federated credential. It has no signed-in user and normally uses application permissions/resource roles.
- `OpenID Connect` — Authentication layer built on OAuth 2.0 that returns an ID token describing a user authentication event to a client.
- `Microsoft Entra access token` — Bearer credential intended for a resource API identified by its audience. Protect it as a secret and validate issuer/audience/signature/expiry at the resource.
- `Microsoft Entra ID token` — Token for a client to learn about an authenticated identity. It is not a general bearer token for Azure resource APIs.
- `Microsoft Entra refresh token` — Credential a supported client flow can use to obtain new tokens without another interactive sign-in. It is not issued/used identically in every flow; protect it and follow MSAL cache practices.

### Application permissions and user access

- `Microsoft Entra app role` — Application-defined role that can be assigned to users/groups or applications, depending on the app configuration, and emitted as an authorization claim.
- `Microsoft Entra delegated permission` — Permission allowing an app to call a resource API on behalf of a signed-in user, constrained by the user and consent.
- `Microsoft Entra application permission` — App-only permission allowing an application to call a resource API without a user; often requires admin consent and should be narrowly scoped.
- `Admin consent` — Tenant administrator approval for permissions requiring privileged consent. It grants consent to the API permission request; Azure RBAC assignments remain separate.
- `Microsoft Entra Conditional Access` — Policy engine evaluating supported sign-in context to require or block access. Policy coverage differs across user/workload scenarios; do not assume it protects every service-to-service token flow.
- `Microsoft Entra multifactor authentication` — Requires more than one authentication factor in supported user sign-in flows; MFA for human sign-in is not a workload credential strategy.

### Azure resource authorization

- `Azure role-based access control (Azure RBAC)` — Azure authorization system granting management-plane roles and, for services that support it, data-plane roles at scopes.
- `Azure role definition` — Permission set containing allowed actions/data actions, exclusions, assignable scopes and metadata.
- `Azure role assignment` — Binding of a principal, role definition and scope, optionally with a condition; effective access may inherit from parent scopes.
- `Azure built-in role` — Microsoft-provided role definition. Names such as Reader/Contributor can still be broader than a workload's least-privilege need.
- `Azure custom role` — Organization-defined permission set. Keep its actions/data actions reviewed as service APIs change.
- `Azure RBAC scope` — Management group, subscription, resource group or resource where a role assignment applies; grants can flow down to child resources.
- `Azure RBAC control-plane action` — Management operation permission, represented as `Actions` in a role definition, such as read/update resource configuration.
- `Azure RBAC data-plane action` — Permission to use data operations supported by the service, represented as `DataActions`; a management role may not include it.
- `Azure role assignment condition` — Attribute-based condition that restricts a supported role assignment to selected requests/resources; service and permission support varies.
- `Azure deny assignment` — Authorization restriction that blocks specified access even if a role assignment otherwise allows it; it can be platform/managed-resource generated.
- `Azure Privileged Identity Management (PIM)` — Governance feature for eligible, time-bounded privileged role activation and access review; configuration and licensing determine capabilities.

### Secrets, keys and certificates

- `Azure Key Vault` — Managed service for secrets, cryptographic keys and certificates. Network configuration, access model, role assignment and vault recovery settings all matter.
- `Key Vault secret` — Opaque value/version stored for an application to retrieve. Prefer managed identity and limit exposure/rotation; avoid copying it into logs or environment output.
- `Key Vault key` — Cryptographic key used for operations such as signing/encryption. A key can be nonexportable; callers need operation permissions, not simply vault read access.
- `Key Vault certificate` — Certificate lifecycle object connecting certificate metadata, key and secret representations; renewal, CA integration and private-key export policy matter.
- `Key Vault access policy` — Legacy per-vault data-plane permission model. When a vault uses Azure RBAC authorization, access policies do not grant the same permissions; choose and audit the active model.
- `Key Vault data-plane RBAC` — Azure RBAC roles for Key Vault operations such as reading secrets or performing key crypto. Assign a narrow role at a narrow scope and separately test network reachability.

## Cross-item comparison

| Pattern | Credential lifecycle | Permission grant | Typical use |
|---|---|---|---|
| System-assigned managed identity | Follows one Azure resource | Azure RBAC/data role on its service principal | Single resource identity with coupled lifecycle |
| User-assigned managed identity | Independent Azure resource | Azure RBAC/data role on the shared principal | Identity must outlive or be shared across workload replacement |
| Workload identity federation | External signed assertion exchanged for token | Azure role or API permission on target principal | GitHub Actions/AKS without static secret |
| App registration + secret/certificate | App-controlled credential lifecycle | Entra application permission and/or Azure RBAC | External confidential app when managed/federated identity is unsuitable |

## Examples

For a GitHub Actions deployment, configure an Entra application or user-assigned identity with a federated credential restricted to the exact repository and protected branch/environment. Grant the principal only the deployment actions at its target scope. During the workflow, exchange the GitHub OIDC token for an Entra access token, then deploy. The OIDC trust does not automatically grant resource permissions, and a Contributor role does not automatically grant access to service data.

For an App Service reading a Key Vault secret, enable a managed identity, select the vault's actual authorization model, grant only the secret read role, and ensure the app's network/DNS path reaches the vault. Validate the token's audience and the principal ID when deployment recreates or changes the app.

## Common mistakes

- Treating App registration, service principal and managed identity as synonyms.
- Checking a token signature/claims but not validating issuer, audience, expiry and required authorization.
- Using an ID token to call an Azure resource API.
- Treating successful Entra login as Azure RBAC/data-plane permission.
- Granting subscription-wide Contributor to read one Key Vault secret.
- Assuming a managed identity eliminates role-assignment lifecycle or token/network issues.
- Leaving a GitHub OIDC federated credential broad enough for untrusted branches or repositories.
- Confusing Key Vault access policies and data-plane RBAC.
- Assuming Conditional Access/MFA applies uniformly to workload identity flows.
- Exposing access/refresh tokens or secrets in logs, telemetry or deployment outputs.

## Knowledge checks with answers

1. **What is the difference between an app registration and service principal?** The app object defines application configuration; the service principal is its tenant-local security principal used for access/sign-in.
2. **Does a managed identity automatically grant Key Vault access?** No. It provides identity; the vault authorization model and a correctly scoped role/policy must grant access.
3. **Why is an access token not interchangeable with an ID token?** The access token is intended for an API audience; the ID token informs the client about authentication.
4. **Does GitHub OIDC federation alone allow deployment?** No. It establishes a way to obtain a token as a principal; Azure RBAC permissions at the target scope are still required.
5. **How do Actions and DataActions differ?** They represent management-plane and supported data-plane permissions. A role can include one without the other.
6. **What Azure Functions .NET model is currently out of support?** The in-process execution model, as of 2026-11-10. Migrate to the isolated worker and check the current supported runtime table.
