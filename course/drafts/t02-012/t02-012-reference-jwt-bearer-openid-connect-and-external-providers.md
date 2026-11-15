# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Reference: JWT validation, bearer options, OpenID Connect code flow, external login, and token handling

## Scope and version

This reference separates API access-token validation from interactive OpenID Connect sign-in. An API validates JWT access tokens from a trusted issuer; a server-side web app uses OIDC authorization code with PKCE and normally creates a local cookie. An ID token is for the OIDC client, not an API access token. The app remains responsible for safe claim mapping, local authorization, and external-account linking. [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication) [Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)

## How this group fits the mental model

`AddJwtBearer` validates each incoming API bearer token and creates a principal only after configured trust checks. `AddOpenIdConnect` is a challenge/remote-authentication handler for interactive login; it redirects to an identity provider, validates the callback, and signs the resulting principal into a local scheme. These are different request paths. Do not configure one scheme as a catch-all for arbitrary token types without strict selection and validation.

## Supplied names explained

### JWT bearer API validation

| Supplied name | Explanation |
|---|---|
| `AddJwtBearer` | Registers a JWT bearer authentication handler for APIs. Configure issuer/audience/signature/lifetime validation from a trusted authority. |
| `JwtBearerDefaults.AuthenticationScheme` | Conventional scheme name used to select the JWT bearer handler. |
| `JwtBearerOptions` | Configuration for metadata, token handling, validation parameters, claim mapping, and bearer events. |
| `JwtBearerOptions.Authority` | Trusted issuer/metadata authority used to discover signing keys and validation metadata. Use HTTPS outside controlled local development. |
| `JwtBearerOptions.Audience` | Expected resource audience for the API; tokens for another client/service should be rejected. |
| `JwtBearerOptions.MetadataAddress` | Explicit OIDC discovery metadata URL when it differs from the authority-derived default. Protect and validate the configured source. |
| `JwtBearerOptions.RequireHttpsMetadata` | Requires HTTPS for metadata retrieval; disabling it in production exposes trust metadata to interception. |
| `JwtBearerOptions.SaveToken` | Stores the raw token in authentication properties after validation; increases credential exposure and should be enabled only when needed. |
| `JwtBearerOptions.MapInboundClaims` | Controls claim-name mapping from JWT names to .NET claim types; be consistent with authorization claim configuration. |
| `JwtBearerOptions.TokenValidationParameters` | Core issuer, audience, signature-key, lifetime, clock-skew, and claim-type validation settings. |
| `JwtBearerOptions.Events` | Inline callbacks for token receipt, validation, failures, and challenges. |
| `JwtBearerEvents` | Event callback container for the bearer authentication lifecycle. |
| `JwtBearerEvents.OnMessageReceived` | Runs when obtaining a token from the request; avoid accepting bearer credentials from URLs unless a protocol-specific requirement is tightly controlled. |
| `JwtBearerEvents.OnTokenValidated` | Runs after cryptographic/claim validation; use for additional checks, not as a substitute for the core validation. |
| `JwtBearerEvents.OnAuthenticationFailed` | Observes validation failures for diagnostics; avoid logging the raw token. |
| `JwtBearerEvents.OnChallenge` | Customizes 401 challenge behavior and `WWW-Authenticate` response details. |
| `JwtBearerChallengeContext` | Context for customizing the bearer challenge response. |
| `JwtBearerHandler` | Handler that extracts the bearer token, validates it, and produces the authenticated principal or challenge. |
| `TokenValidationParameters.ValidateIssuer` | Enables issuer validation against trusted expected issuers. |
| `TokenValidationParameters.ValidateAudience` | Enables audience validation for the API/resource. |
| `TokenValidationParameters.ValidateIssuerSigningKey` | Requires validation of the cryptographic signing key. |
| `TokenValidationParameters.ValidateLifetime` | Enforces token not-before/expiration checks. |
| `TokenValidationParameters.ValidIssuer` | Single expected issuer value. |
| `TokenValidationParameters.ValidIssuers` | Allowlist of expected issuers when multiple trusted authorities are intentionally supported. |
| `TokenValidationParameters.ValidAudience` | Single expected audience value. |
| `TokenValidationParameters.ValidAudiences` | Allowlist of expected API audiences when the design requires multiple. |
| `TokenValidationParameters.ClockSkew` | Tolerance for clock differences in validity checks; keep bounded and synchronize clocks. |
| `TokenValidationParameters.NameClaimType` | Maps the principal's name claim for `Identity.Name`. |
| `TokenValidationParameters.RoleClaimType` | Maps the claim type used by role checks. |
| `Issuer signing key metadata refresh` | Metadata handlers periodically refresh trusted signing keys; ensure issuer metadata is reachable and respect rotation behavior. |
| `JWT access token signature validation` | Verifies authenticity/integrity using trusted keys; parsing a JWT is not validation. |
| `JWT issuer validation` | Checks who issued the token against an explicitly trusted issuer. |
| `JWT audience validation` | Ensures the token was intended for this API rather than another resource/client. |
| `JWT expiration validation` | Rejects expired/future-invalid tokens according to lifetime and clock-skew policy. |
| `JWT ID token must not be sent to an API` | ID tokens are issued to an OIDC client and have a different purpose/audience from API access tokens. |
| `OAuth 2.0 access token` | Credential presented to a resource server to authorize access; its format is issuer-defined, though this group covers JWT validation. |
| `OpenID Connect ID token` | Authentication assertion for the OIDC client, identifying the signed-in subject and client audience. |
| `Bearer Authorization header` | Standard request header form `Authorization: Bearer <access-token>`. Avoid query-string tokens. |
| `401 invalid token response` | Indicates missing/invalid credentials; bearer challenges communicate authentication requirements. |
| `403 insufficient authorization response` | Indicates an authenticated principal lacks permission for the resource/action. |
| `WWW-Authenticate challenge header` | Required on a 401 response and describes an applicable authentication challenge. |

### OIDC client and code flow

| Supplied name | Explanation |
|---|---|
| `AddOpenIdConnect` | Registers the OIDC remote authentication handler for interactive sign-in/challenge callbacks. |
| `OpenIdConnectDefaults.AuthenticationScheme` | Conventional OIDC challenge scheme name. |
| `OpenIdConnectOptions` | OIDC authority/client/callback/flow, token, claim, validation, and event settings. |
| `OpenIdConnectOptions.Authority` | Identity provider base authority used to discover metadata and endpoints. |
| `OpenIdConnectOptions.MetadataAddress` | Explicit discovery document address when it is not derived from authority. |
| `OpenIdConnectOptions.ClientId` | Registered OIDC client identifier. It is not necessarily secret. |
| `OpenIdConnectOptions.ClientSecret` | Confidential server-side client credential; protect it and never ship it to browser code. Client assertion is an alternative when supported. |
| `OpenIdConnectOptions.CallbackPath` | Local path receiving the provider's authorization response; register the exact HTTPS redirect URI with the provider. |
| `OpenIdConnectOptions.SignedOutCallbackPath` | Local path for the provider's post-logout response. |
| `OpenIdConnectOptions.ResponseType` | Authorization response type; current interactive web apps should use authorization code flow. |
| `OpenIdConnectOptions.ResponseMode` | How the authorization response is returned, commonly query or form-post as required by provider/flow. |
| `OpenIdConnectOptions.UsePkce` | Adds a verifier/challenge pair to bind authorization-code redemption to the initiating client. |
| `OpenIdConnectOptions.SaveTokens` | Saves tokens in authentication properties; token retention can enlarge cookie tickets and increases credential exposure. |
| `OpenIdConnectOptions.GetClaimsFromUserInfoEndpoint` | Requests additional claims from the provider's UserInfo endpoint when supported and appropriately scoped. |
| `OpenIdConnectOptions.Scope` | Requested OIDC/OAuth scopes; request only those needed and understand provider-specific consent. |
| `OpenIdConnectOptions.TokenValidationParameters` | Validation and claim-mapping settings for OIDC tokens, including the ID token. |
| `OpenIdConnectOptions.Events` | Event callbacks for modifying redirects, validating tokens, handling user information, and remote failures. |
| `OpenIdConnectEvents.OnRedirectToIdentityProvider` | Customizes the outbound authorization request; preserve state/nonce/correlation protections. |
| `OpenIdConnectEvents.OnTokenValidated` | Runs after token validation for local checks/claim transformations. |
| `OpenIdConnectEvents.OnUserInformationReceived` | Runs after optional UserInfo retrieval; do not trust unvalidated provider-specific values. |
| `OpenIdConnectEvents.OnRemoteFailure` | Handles errors from the remote authentication flow and maps them to safe local behavior. |
| `OpenIdConnectHandler` | Implements challenge, callback validation, code redemption, and sign-in to the configured local scheme. |
| `Authorization Code flow` | Browser receives a short-lived code; the server exchanges it for tokens rather than exposing access tokens directly in the front channel. |
| `Proof Key for Code Exchange (PKCE)` | Binds the code exchange to a client-generated verifier and mitigates code interception. |
| `Confidential web client` | Server-side OIDC client that can protect a client secret or assertion; unlike a public browser client, it keeps credentials off the browser. |
| `Client credentials flow for app-only access` | OAuth flow for a confidential service acting as itself without a user; it is not a user sign-in flow. |
| `AddOpenIdConnect external provider` | Adds a remote OIDC scheme that can be used to challenge an external identity provider. |
| `HttpContext.GetTokenAsync` | Retrieves a token saved in authentication properties for the selected scheme; protect and limit its use. |
| `SaveTokens storage implications` | Persisted access/refresh tokens may increase cookie size or reside in a ticket store; minimize scope/lifetime and storage. |

### External Identity account linking

| Supplied name | Explanation |
|---|---|
| `ExternalLoginSignInAsync` | Signs in a local user associated with an external provider key, applying confirmation/lockout options. |
| `SignInManager<TUser>.GetExternalLoginInfoAsync` | Retrieves validated external login information from the temporary external-authentication state. |
| `UserManager<TUser>.AddLoginAsync` | Links a provider/key pair to a local account; require a secure, verified account-linking flow. |
| `UserManager<TUser>.RemoveLoginAsync` | Removes an external login association; ensure the user retains another valid credential/recovery path. |
| `IUserLoginStore<TUser>` | Store contract for external provider login associations. |
| `ExternalLoginInfo` | Validated provider key, login provider, and principal returned from a remote authentication flow. |
| `RemoteAuthenticationOptions` | Shared settings for callback paths, correlation, and remote-authentication state. |
| `RemoteAuthenticationEvents` | Base event callbacks for remote authentication handlers. |
| `RemoteAuthenticationHandler<TOptions>` | Base implementation for challenge/callback remote handlers such as OIDC. |
| `Multiple authentication scheme selection` | Selects cookie, OIDC challenge, or API bearer handler based on endpoint and intended credential contract. |
| `AddPolicyScheme scheme forwarding` | Routes authentication to a selected scheme based on controlled request/token characteristics; selection must not weaken validation. |
| `IdentityProvider challenge versus API token validation` | OIDC challenge redirects a browser for login; API bearer validation returns 401/403 and never redirects to an identity provider. |

## Cross-item comparison

An API's bearer handler validates an access token on each request; an OIDC handler challenges a browser and processes a callback. `Authority` identifies trusted metadata, while `Audience` identifies the protected API. A valid signature without the correct issuer/audience is still the wrong token. OIDC `SaveTokens` is a storage choice, not a validation setting. External account linking associates an issuer-scoped provider key with a local user; email equality alone is insufficient proof of ownership.

## Examples

### Validate an API token

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Api:Authority"];
        options.Audience = builder.Configuration["Api:Audience"];
        options.RequireHttpsMetadata = true;
        options.MapInboundClaims = false;
    });
```

The authority and audience must be trusted deployment values. The handler validates signature, issuer, audience, and lifetime using issuer metadata; do not set validation flags false to accommodate malformed tokens.

### OIDC web app scheme split

Use a cookie as the default authenticate/sign-in scheme and OIDC as the challenge scheme. Set `ResponseType` to code, keep PKCE enabled, store client credentials server-side, register exact callback URLs, and validate state/nonce. Avoid saving tokens unless the application needs them; saved tokens become additional secrets to protect.

## Common mistakes

- Decoding a JWT and treating its claims as verified.
- Validating signature but not issuer, audience, and lifetime.
- Accepting an ID token at an API endpoint.
- Putting a client secret in a SPA or source-controlled settings.
- Disabling HTTPS metadata in production.
- Saving all OIDC tokens into a large browser cookie without considering ticket protection/size.
- Treating a provider's email claim as sufficient to auto-link accounts.
- Using an OIDC browser redirect for API clients expecting 401/403.
- Building a multi-scheme policy selector that accepts attacker-controlled token issuer data before validation.
- Logging bearer tokens, authorization codes, client secrets, or refresh tokens.

## Knowledge checks with answers

1. **What must an API validate on a JWT access token?** Trusted signature, issuer, intended audience, and lifetime at minimum.
2. **Can an ID token be sent as an API bearer token?** No; its purpose and audience are the OIDC client.
3. **Where does a confidential OIDC client secret live?** On the server in protected configuration, never in browser code.
4. **Should an API challenge redirect users to the OIDC provider?** Generally no; return a bearer challenge (401) or an authorization denial (403).

## Sources

[JWT bearer](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) · [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication) · [Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
