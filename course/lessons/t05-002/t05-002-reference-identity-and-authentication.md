
# authentication versus authorization identities claims and roles — Reference: Credentials, authentication, and principal construction

## Scope and version
This reference explains the assigned identity/authentication terms without entering password storage, session/token formats, OAuth/OIDC, or framework-specific APIs. Use [OWASP Authentication guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) for operational context and [Microsoft's ASP.NET Core authorization introduction](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction?view=aspnetcore-11.0) for framework concepts.

## How this group fits the mental model
Authentication transforms presented evidence into a server-recognized principal. The resulting identity and claims are inputs to later authorization. The type of evidence, the selected mechanism, and the assurance of the result are related but not interchangeable.

In ASP.NET Core, an authentication scheme names both a handler and its options. The handler's authenticate operation can produce a successful ticket/principal, no result, or failure; challenge and forbid are separate handler operations. This distinction matters because a handler may successfully authenticate a caller who still fails authorization. See [Microsoft's authentication overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-11.0).

## Supplied names explained
- `Identity` — The represented subject, such as a user or service, in a security decision. An identity label is not proof; it must be connected to trusted authentication.
- `Credential` — Evidence presented to establish identity, such as a secret or cryptographic proof. Protect it during collection, transmission, validation, recovery, and revocation.
- `Authentication` — The process of validating evidence and establishing an authenticated identity under a scheme. It answers who the requester is, not what every requester may do.
- `Authentication factor` — A category of evidence, often knowledge, possession, or inherence. Two passwords are not two independent factors just because there are two entries; factor independence matters.
- `Authentication scheme` — A named configuration that determines how credentials are interpreted and which mechanism handles them. Choosing a scheme is a trust decision; accepting the wrong one can create identity confusion.
- `Authentication handler` — A component that processes a request under a scheme and produces outcomes such as success, no result, or failure. Do not treat handler execution as authorization by itself.
- `Authentication ticket` — A framework-level representation associating a principal with authentication properties for a request or persistence mechanism. Its validity, lifetime, and protection depend on the surrounding implementation; this topic does not specify cookie/token mechanics.
- `Authentication context` — The request-time context in which a scheme evaluates credentials and creates an outcome. It carries processing state, not a user-controlled grant.
- `ClaimsPrincipal` — In .NET terminology, a container representing one or more identities used as the request principal. Applications must know which identity/scheme supplied relevant claims and avoid ambiguous selection.
- `ClaimsIdentity` — A .NET identity described by claims, with metadata including authentication type, name-claim type, and role-claim type. `IsAuthenticated` is true when `AuthenticationType` is non-null and non-empty; setting that field on an arbitrary identity is not proof that credentials were actually validated. The authentication pipeline must establish trust before constructing/accepting the identity. See [ClaimsIdentity](https://learn.microsoft.com/en-us/dotnet/api/system.security.claims.claimsidentity?view=net-11.0) and [IsAuthenticated](https://learn.microsoft.com/en-us/dotnet/api/system.security.claims.claimsidentity.isauthenticated?view=net-11.0).
- `Claim` — In .NET, a statement about a subject by an issuer, represented with properties such as type, value, value type, subject, issuer, and original issuer. The type identifies the meaning of the value; claims are not self-authenticating. A claim named `admin` is not meaningful until the application defines who can issue it and what it grants. See [Claim](https://learn.microsoft.com/en-us/dotnet/api/system.security.claims.claim?view=net-11.0).
- `Claim issuer` — The authority that asserts a claim. Authorization should distinguish trusted issuers and validate mapping rules instead of accepting same-named claims from arbitrary sources.
- `Subject identifier` — An identifier for the authenticated subject within a defined issuer/realm. Treat it as stable only within that issuer's documented contract; usernames may change or collide across issuers. Bind records to the correctly scoped subject key rather than a display name.
- `Authentication assurance` — The confidence level associated with how an identity was verified, considering factor strength, process, and context. It should match action risk; “authenticated” is not one universal assurance level.
- `Account recovery authentication` — Identity proof used to regain access after loss of a credential. Recovery is an alternate authentication path and can become the weakest path into an account; protect it with comparable risk controls and notifications.
- `Re-authentication for sensitive action` — Requiring fresh identity proof before a high-impact action such as changing recovery details. It limits the impact of an unattended or stolen authenticated session but does not replace authorization.
- `Multi-factor authentication boundary` — The point where the system requires independent factor evidence before accepting authentication. MFA improves resistance to some credential attacks but does not by itself make every later request authorized or every factor phishing-resistant.

## Cross-item comparison
`Credential` is evidence; `Identity` is the represented subject after validation. An `Authentication scheme` selects processing rules; an `Authentication handler` performs that processing. A `Claim issuer` explains where an assertion came from, while a `Subject identifier` says which subject it describes. Authentication assurance describes confidence; it is not a permission.

`ClaimsPrincipal` can contain multiple `ClaimsIdentity` instances. Principal-level claim queries can aggregate across identities, while identity-specific inspection can matter when schemes differ. In .NET, `ClaimsPrincipal.IsInRole` checks each identity using that identity's configured `RoleClaimType`; do not assume every provider uses the same role-claim type or that a role in one identity is from the scheme expected by a policy. See [ClaimsPrincipal](https://learn.microsoft.com/en-us/dotnet/api/system.security.claims.claimsprincipal?view=net-11.0) and [RoleClaimType](https://learn.microsoft.com/en-us/dotnet/api/system.security.claims.claimsidentity.roleclaimtype?view=net-11.0).

## Examples
An API request supplies a credential validated by a configured scheme. The handler creates an authenticated principal with a subject identifier and issuer-qualified claims. The authorization layer can then evaluate those facts. If two schemes can produce a principal, explicitly define which scheme is valid for the endpoint so a weaker or unintended identity source cannot silently satisfy the requirement.

For account recovery, do not allow an easily guessed personal fact to bypass the main authentication controls. Treat recovery as an authentication path, record/notify sensitive changes, and require fresh proof for subsequent high-impact actions. OWASP discusses secure authentication and recovery concerns in its [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).

## Common mistakes
- Equating a claim's name with a trusted fact, without checking issuer and mapping.
- Assuming every authenticated principal has equal assurance.
- Treating `ClaimsIdentity.IsAuthenticated` as cryptographic validation; it reflects the presence of a nonempty authentication type, so only trusted authentication code should construct the accepted principal.
- Assuming a role claim is recognized by `IsInRole` without checking the identity's `RoleClaimType` and scheme mapping.
- Confusing a principal/ticket representation with a credential itself.
- Letting account recovery bypass the security level of normal sign-in.
- Requiring MFA and then assuming object-level authorization is no longer needed.

## Knowledge checks with answers
1. Does an identity prove itself? **No; authentication validates credentials/evidence and establishes the identity.**
2. Why record claim issuer? **The same claim type/value from different authorities may not deserve equal trust.**
3. What does MFA not answer? **Whether the authenticated subject may perform a particular operation on a particular resource.**
