# ASP.NET Core authentication principals claims roles authorization policies and handlers — Reference: Claims and role requirements, policy helpers, authentication state, and claims mapping

## Scope and version

This reference covers claims/principal semantics and common policy requirements. Claims have type, value, issuer, and identity context; a policy helper does not make an untrusted claim trustworthy. [Claims-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/claims) [Role-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/roles)

## How this group fits the mental model

An authentication handler creates one or more `ClaimsIdentity` values inside a `ClaimsPrincipal`. Policy helpers turn common predicates about that principal into requirements. Claim mapping and transformation can change what authorization sees, so define who issues each claim, what it means, and when it is fresh.

## Supplied names explained

### Claims and principal inspection

| Supplied name | Meaning and use |
|---|---|
| `Claim` | A typed value associated with an identity, optionally carrying issuer, value-type, and property metadata. A claim is data, not a permission until policy code interprets it. |
| `Claim.Type` | Identifier for the kind of assertion, such as a department or permission. Use consistent names and validate issuer/type mapping. |
| `Claim.Value` | String value carried by the claim. Validate accepted values and avoid parsing arbitrary values as trusted application state. |
| `Claim.ValueType` | Metadata describing how the claim value should be interpreted. It does not validate or convert the value automatically. |
| `Claim.Issuer` | Issuer associated with the claim. Authorization may need to distinguish values from different trusted issuers. |
| `Claim.OriginalIssuer` | Original issuer metadata retained when a claim is transformed or reissued. It can help diagnostics/trust decisions but should not be assumed equal to `Issuer`. |
| `Claim.Properties` | Additional string metadata attached to a claim. Avoid storing secrets or relying on arbitrary properties without a documented contract. |
| `Claim.Subject` | The `ClaimsIdentity` to which the claim belongs, when attached. Claims without the expected subject/context should be treated carefully. |
| `ClaimsIdentity.IsAuthenticated` | Indicates whether the identity has a non-empty authentication type. This is a status flag, not proof that every claim is trusted or current. |
| `ClaimsIdentity.AuthenticationType` | Authentication method/type label used by the identity. It helps describe the authentication source but is not itself a cryptographic guarantee. |
| `ClaimsPrincipal.Identity` | The primary identity exposed by the principal. A principal can hold multiple identities, so this property alone may not represent all claims. |
| `ClaimsPrincipal.Identities` | All identities contained by the principal. Multiple schemes/transformation may merge identities; inspect the intended identity rather than assuming only one exists. |
| `ClaimsPrincipal.Claims` | Claims across the principal's identities. Duplicate types/values may exist from different identities or issuers. |
| `ClaimsPrincipal.IsInRole` | Checks whether any identity reports the specified role using that identity's configured role-claim type. It does not query the current role store. |
| `ClaimsPrincipal.FindFirst` | Returns a first matching claim across the principal. With multiple identities/issuers, “first” should not be treated as a trust-priority rule. |
| `ClaimsPrincipal.FindAll` | Returns all claims matching a type or predicate. Use it when duplicates/multiple identities matter. |
| `ClaimsPrincipal.HasClaim` | Tests for a matching claim/type-value or predicate across identities. It does not verify the claim issuer or resource context automatically. |
| `ClaimsIdentity.RoleClaimType` | Claim type interpreted as a role for that identity's `IsInRole` checks. Must align with trusted token/claim mapping. |
| `ClaimsIdentity.NameClaimType` | Claim type used to populate the identity's name. It affects presentation/accessors, not authorization by itself. |
| `ClaimsPrincipal.AddIdentity` | Adds another identity to a principal. Merge only identities that have independently passed their intended validation and claim-mapping rules. |
| `ClaimsIdentity.AddClaim` | Adds a claim to one identity. Adding a claim to an authenticated principal is security-sensitive; only trusted server code should do it. |
| `ClaimsIdentity.RemoveClaim` | Removes a claim from that identity. It does not update serialized cookies/tokens already issued elsewhere. |
| `ClaimsIdentity.AddClaims` | Adds multiple claims to an identity. Validate values and source before adding them, especially for role/permission types. |

### Claims transformation and authorization styles

| Supplied name | Meaning and use |
|---|---|
| `Claims transformation` | A step that can enrich a principal with application claims after authentication. Transformation should be deterministic, trusted, and safe if called repeatedly. |
| `IClaimsTransformation` | Contract for transforming a principal after authentication. Use it to add derived claims from trusted sources, not to trust request parameters. |
| `IClaimsTransformation.TransformAsync` | Performs transformation and returns a principal. Framework flows may invoke it multiple times; avoid duplicate claims or repeated expensive lookups. |
| `ClaimsTransformation` | Framework implementation that coordinates configured claims transformations. It may wrap identities to preserve original authentication context. |
| `Role-based authorization` | Checks membership in broad named roles. Roles suit stable categories, but dynamic per-resource access is usually better expressed by resource authorization. |
| `Claims-based authorization` | Evaluates one or more claim predicates. Define issuer, type, value semantics, mapping, and freshness to avoid accepting similarly named untrusted claims. |
| `RequireRole` | Policy-builder helper that adds a role requirement for one or more role names. The listed roles are alternatives for that requirement. |
| `RequireRole overloads` | Overloads accept role names in supported forms, including a set of acceptable names. Confirm whether declarations are grouped together or applied as separate policy metadata. |
| `RequireClaim` | Policy-builder helper requiring a claim of a specified type, optionally with one of a set of allowed values. It checks the principal, not an external source's trustworthiness. |
| `RequireClaim overloads` | Overloads allow checking type alone or type plus one/more acceptable values. Use exact allowlists for privilege-bearing claims. |
| `RequireUserName` | Adds a requirement that the principal's name match the configured username value. Names can be mutable/display-oriented; use stable identifiers for data ownership. |
| `RequireUserName overloads` | Overloads support username requirements from one or multiple configured names, as defined by the framework API. Avoid using this as a substitute for resource ownership. |
| `RequireAuthenticatedUser` | Adds a requirement that the principal contain an authenticated identity. It does not require a particular scheme unless the policy also selects one. |
| `RequireAssertion` | Adds a predicate-based requirement for a compact custom rule. Keep the assertion simple and avoid hiding database/resource logic inside an opaque lambda. |
| `RequireAssertion overloads` | Supported assertion forms let the policy evaluate a predicate with authorization context. Use named requirement/handler classes when logic needs dependencies or substantial testing. |
| `Requirements within policy all must succeed` | Distinct requirements are combined with AND semantics. Succeeding a role requirement does not compensate for a failed claim or custom requirement. |
| `Multiple handlers can satisfy one requirement` | Several handlers may be registered for the same requirement; one can succeed it while others leave it pending. Explicit failure can block success. |
| `Claims issuer and trust boundary` | The same type/value can be issued by different authorities. Accept only trusted issuers and map external names deliberately before using them for authorization. |
| `Name claim mapping` | Maps a provider's claim into the identity's name field. This affects principal accessors and should not be confused with a stable user key. |
| `Role claim mapping` | Maps provider role claims into the role type used by `IsInRole` and role requirements. Validate the provider mapping and avoid role-name collision across issuers. |
| `ClaimsPrincipal merging multiple identities` | A principal can contain claims from several identities. Claims from one identity may not share the trust, authentication type, or expiry of another. |

### Policy composition helpers

| Supplied name | Meaning and use |
|---|---|
| `AuthorizationPolicy.CombineAsync` | Asynchronously builds a combined policy from authorization metadata, registered policies, a policy provider, and an optional fallback policy according to framework selection rules. |
| `AuthorizationPolicy.Combine` | Combines concrete policy requirements and schemes into one policy. Requirements remain conjunctive. |
| `AuthorizationPolicy.Combine(IEnumerable<AuthorizationPolicy>)` | Combines a sequence of policies by collecting their requirements/schemes. Every distinct requirement must be satisfied. |
| `AuthorizationPolicy.Combine(AuthorizationPolicy,AuthorizationPolicy)` | Combines two concrete policies using the same requirement-collection semantics. It is not an “either policy” operation. |

## Cross-item comparison

| Question | Relevant surface | Caution |
|---|---|---|
| Is the user authenticated? | `ClaimsIdentity.IsAuthenticated` / `RequireAuthenticatedUser` | This alone grants no role, claim, or resource access |
| Is the user in a broad role? | `IsInRole` / `RequireRole` | Uses the identity's configured role claim type and current principal snapshot |
| Does the principal carry a required permission fact? | `HasClaim` / `RequireClaim` | Validate issuer/type/value and freshness |
| Can this user edit this loaded document? | Resource handler and `IAuthorizationService` | Must evaluate actual resource ownership/state |
| Can two policies be combined with OR? | Not by ordinary `AuthorizationPolicy.Combine` | Add a requirement whose handler expresses the intended alternatives |

## Examples

### Require an exact permission claim

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Billing.Read", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("permission", "billing.read"));
});
```

The app should map only trusted issuer data to `permission`, and the caller must still pass resource-specific checks for a particular invoice. [Claims-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/claims)

### Handle multiple identities deliberately

When an app combines identities, do not assume the first `FindFirst("role")` result is the most trusted. Configure schemes and claim mapping so the principal contains intended identities, and use issuer-aware requirements if claims can come from multiple authorities. Normalize only after verifying the source.

## Common mistakes

- Treating any claim named `role`, `admin`, or `permission` as trusted without validating its issuer.
- Using a display name as a stable account/database key.
- Assuming `ClaimsPrincipal.Identity` describes every identity in a multi-scheme principal.
- Assuming a claim transformation runs once for the lifetime of a request/user.
- Adding claims from user-submitted form fields.
- Confusing authentication type with cryptographic proof of how the principal was created.
- Treating `AuthorizationPolicy.Combine` as OR instead of a combined set of conjunctive requirements.
- Using roles for volatile per-resource permissions and then expecting immediate updates to old tickets.

## Knowledge checks with answers

1. **What does `IsAuthenticated` mean?** The identity has an authentication type set; it does not prove a claim is authorized or still current.
2. **How does `IsInRole` know which claim type to inspect?** Each identity has a `RoleClaimType` setting.
3. **Why check a claim's issuer?** Different authorities can issue the same type/value with different trust, and policy must accept only intended sources.
4. **What does combining two policies do?** It combines requirements and schemes; every distinct requirement still must succeed.
5. **How can several handlers satisfy one requirement?** One handler may mark it succeeded while others leave it pending; explicit context failure is a hard failure.

## Sources

- [Claims-based authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/claims)
- [Role-based authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/roles)
- [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)
