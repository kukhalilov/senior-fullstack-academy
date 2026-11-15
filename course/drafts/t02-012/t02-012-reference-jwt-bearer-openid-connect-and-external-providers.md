# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Reference: JWT validation, bearer options, OpenID Connect code flow, external login, and token handling

## Scope and version

This reference connects API bearer-token validation to interactive OIDC sign-in and Identity external-login linking. Use `JwtBearer` to validate access tokens issued for an API; use `OpenIdConnect` to perform browser redirects and handle the provider callback. An ID token is not an API access token. [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication)

## How this group fits the mental model

For an API request, the bearer handler validates a presented token under a specific scheme and creates a principal only when validation succeeds. For browser sign-in, the OIDC handler redirects to an identity provider and processes a registered callback; an app cookie commonly carries the resulting local session. Identity external-login operations associate a provider subject with a local account. These are connected flows, but they consume different protocol messages and credentials.

## Supplied names explained

### JWT bearer API validation

| Supplied name | Meaning and use |
|---|---|
| `AddJwtBearer` | Registers a JWT bearer authentication handler for an API scheme. It validates presented bearer tokens; it does not issue access tokens or implement OAuth login. |
| `JwtBearerDefaults.AuthenticationScheme` | The default scheme name used by the JWT bearer handler. Use the same scheme in defaults/policies when an API endpoint should authenticate with this handler. |
| `JwtBearerOptions` | Configuration for metadata/key discovery, audience, claim mapping, token validation, events, and token storage. Configure values to match the trusted issuer and API boundary. |
| `JwtBearerOptions.Authority` | Issuer base address used for discovery/metadata and signing keys when the provider exposes OpenID Connect metadata. It must be a trusted HTTPS authority in production. |
| `JwtBearerOptions.Audience` | Expected API audience for the access token. A valid token for a different API must be rejected even if the signature is valid. |
| `JwtBearerOptions.MetadataAddress` | Explicit discovery-document address when it differs from the authority's default metadata endpoint. Only use a trusted metadata endpoint. |
| `JwtBearerOptions.RequireHttpsMetadata` | Controls whether discovery metadata must be retrieved over HTTPS. Disabling it is generally limited to local development; production metadata and keys require protected transport. |
| `JwtBearerOptions.SaveToken` | Controls whether the successfully authenticated token is retained in authentication properties. Saved tokens are credentials; avoid storing them in browser-visible tickets or logging them. |
| `JwtBearerOptions.MapInboundClaims` | Controls automatic mapping of selected JWT claim names to framework claim types. Choose deliberately and keep authorization claim expectations consistent. |
| `JwtBearerOptions.TokenValidationParameters` | Fine-grained token validation configuration including issuer/audience/lifetime/key checks, claim-type mapping, and clock skew. Do not weaken defaults without an explicit threat analysis. |
| `JwtBearerOptions.Events` | Authentication lifecycle callbacks for receiving a token, reacting to validation failure, or customizing challenge behavior. Events should not bypass required validation. |
| `JwtBearerEvents` | Event callbacks supported by the JWT bearer handler. Use for controlled logging or transport adaptation without revealing token contents. |
| `JwtBearerEvents.OnMessageReceived` | Runs while the handler extracts a token from the request. Custom query-string or alternate transport token extraction increases leakage risk; prefer the Authorization header. |
| `JwtBearerEvents.OnTokenValidated` | Runs after the token has passed configured validation and a principal has been created. Add only trusted application checks; this is not a substitute for issuer/audience/signature validation. |
| `JwtBearerEvents.OnAuthenticationFailed` | Runs when token authentication throws/fails. Log safe diagnostics, not the raw bearer token or sensitive claims. |
| `JwtBearerEvents.OnChallenge` | Runs when an unauthenticated request is challenged. Preserve proper 401 and `WWW-Authenticate` semantics unless the API has a deliberate alternative contract. |
| `JwtBearerChallengeContext` | Challenge event context containing the response and authentication properties. It permits controlled response handling but should not convert invalid credentials into a success. |
| `JwtBearerHandler` | Implements bearer-token extraction, validation, authentication, and challenge behavior for its scheme. It validates resource credentials; it does not sign users in through a browser. |
| `TokenValidationParameters.ValidateIssuer` | Enables validation that the token issuer matches a configured trusted issuer. Issuer validation prevents accepting a correctly signed token from an unintended authority. |
| `TokenValidationParameters.ValidateAudience` | Enables checking that the token targets this API. Audience validation prevents token reuse across services that were not intended recipients. |
| `TokenValidationParameters.ValidateIssuerSigningKey` | Requires validation of the key used to verify the token signature. Signature/key validation establishes integrity and trusted issuance. |
| `TokenValidationParameters.ValidateLifetime` | Requires checking token lifetime claims such as expiration/not-before. A correctly signed but expired token should not authenticate. |
| `TokenValidationParameters.ValidIssuer` | One accepted issuer value for validation. Compare exact configured values with the issuer that the trusted metadata/token service emits. |
| `TokenValidationParameters.ValidIssuers` | Set of accepted issuer values for a deliberately multi-issuer configuration. Keep it narrow and ensure each issuer's keys/audiences are also trusted. |
| `TokenValidationParameters.ValidAudience` | One accepted resource audience. Match the identifier the token issuer uses for this API. |
| `TokenValidationParameters.ValidAudiences` | Set of accepted resource audiences. Multiple values broaden token acceptance and should represent only APIs this handler is authorized to serve. |
| `TokenValidationParameters.ClockSkew` | Tolerance applied around time-based claims to account for clock differences. Large skew extends effective token acceptance; synchronize server clocks and keep the tolerance small. |
| `TokenValidationParameters.NameClaimType` | Claim type mapped to the principal's name. Mapping affects APIs such as `User.Identity.Name`; it does not itself grant authorization. |
| `TokenValidationParameters.RoleClaimType` | Claim type interpreted as roles by the principal. Ensure issuer mapping is trusted and consistent with policy use; never infer roles from arbitrary user-controlled claims. |
| `Issuer signing key metadata refresh` | Discovery-backed handlers refresh signing keys as issuer metadata changes, enabling rotation. Plan for provider outages and key rollover; do not pin a stale key without a rotation strategy. |
| `JWT access token signature validation` | Verifies the signed token contents against a trusted issuer key. This is essential but insufficient by itself: validate issuer, audience, and lifetime too. |
| `JWT issuer validation` | Confirms the token's `iss` identifies an accepted issuer. Do not accept arbitrary issuer text merely because a signature can be verified. |
| `JWT audience validation` | Confirms the token's `aud` includes this resource API. It prevents a token intended for a different client/service from being replayed here. |
| `JWT expiration validation` | Rejects a token outside its validity window according to trusted time claims and configured clock skew. It does not replace refresh-token or reauthentication design. |
| `JWT ID token must not be sent to an API` | ID tokens are assertions to the OIDC client about authentication. An API needs an access token issued for that API, with the audience and authorization claims expected by the resource. |
| `OAuth 2.0 access token` | Credential presented to a resource server to authorize access. Its exact format may be opaque or JWT; the API follows the issuer's validation/introspection contract rather than assuming JWT. |
| `OpenID Connect ID token` | Authentication assertion for the OIDC client, carrying identity/authentication information and an audience for that client. Do not use it as a resource API access token. |
| `Bearer Authorization header` | Standard HTTP transport form `Authorization: Bearer <token>`. Protect the channel with HTTPS and prevent token values from entering URLs, logs, or telemetry. |
| `401 invalid token response` | Authentication failure response for missing/invalid credentials. The client may need to obtain a new token; the API should not disclose sensitive validation internals. |
| `403 insufficient authorization response` | Indicates authentication succeeded but policy forbids the requested action. Distinguish it from 401 so clients do not treat authorization failure as a login prompt. |
| `WWW-Authenticate challenge header` | HTTP response header describing the authentication challenge/error for a protected resource. Keep values standards-compatible and avoid leaking internals. |

### OpenID Connect client and authorization-code flow

| Supplied name | Meaning and use |
|---|---|
| `AddOpenIdConnect` | Registers the OIDC remote authentication handler. It handles challenge/callback protocol steps; pair it with a local sign-in scheme such as a protected application cookie. |
| `OpenIdConnectDefaults.AuthenticationScheme` | Default scheme name for the OIDC handler. It is typically the challenge scheme for an interactive server-side web app, not the local session scheme. |
| `OpenIdConnectOptions` | OIDC client configuration for authority, client registration, callbacks, response types, PKCE, scopes, tokens, claim handling, and events. Values must match the identity-provider registration. |
| `OpenIdConnectOptions.Authority` | Trusted provider base URI used for discovery and protocol endpoints. Use the intended environment/tenant and protect metadata retrieval. |
| `OpenIdConnectOptions.MetadataAddress` | Explicit discovery-document address when provider metadata is hosted at a nonstandard location. Treat it as a trust anchor. |
| `OpenIdConnectOptions.ClientId` | Identifier of this registered OIDC client. It is not a secret, but it must correspond to the configured redirect URIs and client type. |
| `OpenIdConnectOptions.ClientSecret` | Server-side client credential for a confidential client, if the provider uses a secret. Store it in a secret manager and never ship it to browser JavaScript or commit it. |
| `OpenIdConnectOptions.CallbackPath` | Local request path intercepted for the OIDC authorization response. Register the exact external redirect URI with the provider and account for proxy/path-base configuration. |
| `OpenIdConnectOptions.SignedOutCallbackPath` | Local path that receives the provider's post-logout callback. Register it when using remote sign-out and do not confuse it with local cookie deletion. |
| `OpenIdConnectOptions.ResponseType` | Protocol response type requested from the provider. For interactive web apps, use authorization code flow rather than exposing tokens in a front-channel response. |
| `OpenIdConnectOptions.ResponseMode` | Controls how the provider returns the authorization response, such as query or form-post where supported. Match provider behavior and ensure callback/cookie protections work. |
| `OpenIdConnectOptions.UsePkce` | Enables PKCE for authorization code flow. Use it to bind the authorization request to token redemption; it complements confidential-client authentication. |
| `OpenIdConnectOptions.SaveTokens` | Stores protocol tokens in authentication properties after sign-in. Saved access/refresh tokens are secrets and can enlarge the cookie; prefer server-side token storage where warranted. |
| `OpenIdConnectOptions.GetClaimsFromUserInfoEndpoint` | Requests additional claims from the OIDC UserInfo endpoint after token validation when configured and supported. Claims need careful trust/mapping; it is an optional extra request. |
| `OpenIdConnectOptions.Scope` | Requested OIDC/OAuth scopes. `openid` is required for OIDC authentication; other scopes request provider resources/claims and should be minimized. |
| `OpenIdConnectOptions.TokenValidationParameters` | Validation and claim-mapping settings for tokens handled in the OIDC flow, especially the ID token. Do not weaken issuer, audience, signature, nonce, or lifetime checks. |
| `OpenIdConnectOptions.Events` | OIDC lifecycle event configuration for redirect, token validation, user info, and remote failure. Customization must preserve protocol state and correlation checks. |
| `OpenIdConnectEvents.OnRedirectToIdentityProvider` | Runs before redirecting to the provider and can add supported authorization parameters. Do not place secrets in front-channel URLs or disable state/correlation behavior. |
| `OpenIdConnectEvents.OnTokenValidated` | Runs after the OIDC token has been validated. It is a place for trusted claim transformation/account checks, not for accepting an unvalidated token. |
| `OpenIdConnectEvents.OnUserInformationReceived` | Runs after UserInfo claims are received. Merge only claims allowed by the provider/client contract and avoid allowing UserInfo to override trusted identifiers carelessly. |
| `OpenIdConnectEvents.OnRemoteFailure` | Handles failures during remote authentication. Return safe, user-friendly errors without exposing state, codes, provider tokens, or raw protocol exceptions. |
| `OpenIdConnectHandler` | Implements OIDC challenge, callback, token exchange, and sign-out protocol interactions. It normally signs the resulting identity into a separate local sign-in scheme. |
| `Authorization Code flow` | Redirects the user to authorize, returns a short-lived code to the registered callback, and redeems it server-to-server for tokens. For server-side web apps, use code flow with PKCE. |
| `Proof Key for Code Exchange (PKCE)` | Adds a per-request verifier/challenge pair so an intercepted authorization code cannot be redeemed without the verifier. It is recommended for the server-side code flow as defense in depth. |
| `Confidential web client` | Server-side client capable of protecting a client credential (secret or assertion). Keep credentials on the server; a browser-delivered app is a public client and cannot safely hold a secret. |
| `Client credentials flow for app-only access` | OAuth grant for a workload authenticating as itself rather than a user. It is for service-to-service authorization where supported; it is not an interactive user login flow. |

### External Identity sign-in and scheme selection

| Supplied name | Meaning and use |
|---|---|
| `AddOpenIdConnect external provider` | Uses an OIDC handler as a remote sign-in provider, commonly challenged from an account-link/login flow and followed by local cookie sign-in. The app must validate/link the external subject safely. |
| `HttpContext.GetTokenAsync` | Retrieves a named token saved in authentication properties for a selected scheme. Treat returned values as secrets and ensure the relevant handler actually saved them. |
| `SaveTokens storage implications` | Persisting tokens in authentication properties can make them available after sign-in but increases ticket size and credential exposure. A browser cookie is protected from clients by encryption, but theft/replay and server logging remain risks. |
| `ExternalLoginSignInAsync` | Signs in a local Identity user already linked to the supplied provider and provider key. Do not link based only on matching email unless the provider's verified-email semantics and account-linking policy justify it. |
| `SignInManager<TUser>.GetExternalLoginInfoAsync` | Reads the external login information retained for the current remote-authentication callback, including provider key and claims. Validate callback state and treat provider claims according to configured trust. |
| `UserManager<TUser>.AddLoginAsync` | Associates a trusted external provider/key with a local user account. Require an authenticated account-linking flow and protect against account-takeover/link-confusion attacks. |
| `UserManager<TUser>.RemoveLoginAsync` | Removes a provider association from a local user. Prevent removal of the last usable sign-in method unless the user has established an alternative and recovery path. |
| `IUserLoginStore<TUser>` | Store capability for external login records associated with a user. It persists provider identity linkage; it does not validate a provider's OIDC response. |
| `ExternalLoginInfo` | Identity object carrying external provider identity and claims for account sign-in/linking. Use the stable provider key, not a mutable display name, as the linkage key. |
| `RemoteAuthenticationOptions` | Base options for remote handlers such as OIDC, covering callbacks, correlation, and event configuration. Preserve correlation protections and match callback registration to deployment routing. |
| `RemoteAuthenticationEvents` | Common event base for remote authentication lifecycle callbacks. Changes can affect external protocol handling and should be narrowly scoped. |
| `RemoteAuthenticationHandler<TOptions>` | Base handler model for remote protocols that challenge through redirects and process callback requests. It differs from a local per-request cookie or bearer credential handler. |
| `Multiple authentication scheme selection` | The app may register cookie, bearer, OIDC, and other handlers. Set defaults or use policies/endpoint metadata so a request is authenticated with the correct credential protocol. |
| `AddPolicyScheme scheme forwarding` | Registers a policy scheme that chooses/forwards authentication to another scheme based on request characteristics. Use strict, unambiguous selection; avoid routing attacker-controlled token content to a weaker validator. |
| `IdentityProvider challenge versus API token validation` | A provider challenge redirects a user agent to sign in; API token validation examines a credential already presented to the resource. A successful provider login does not bypass access-token validation at an API. |

## Cross-item comparison

| Concern | JWT bearer handler | OIDC handler |
|---|---|---|
| Main use | Authenticate an API request that already carries a bearer token | Sign a browser user in through a remote provider |
| Request shape | `Authorization: Bearer ...` | Redirect/challenge, provider callback, server-side token exchange |
| Token purpose | Validates an access token for this API | Validates OIDC protocol response/ID token for this client |
| Typical resulting credential | Request principal for this API call | Local app cookie for subsequent browser requests |
| Main failure response | 401 for invalid/missing token; 403 after authentication but insufficient permission | Safe login/error page after remote challenge/callback failure |

Do not confuse OAuth's authorization server, an OIDC client, and a JWT bearer resource server. A system may contain all three roles, but each has different trust and validation responsibilities.

## Examples

### API validates a provider-issued JWT access token

```csharp
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Auth:Authority"];
        options.Audience = builder.Configuration["Auth:ApiAudience"];
        options.TokenValidationParameters.ValidateIssuer = true;
        options.TokenValidationParameters.ValidateAudience = true;
        options.TokenValidationParameters.ValidateIssuerSigningKey = true;
        options.TokenValidationParameters.ValidateLifetime = true;
        options.MapInboundClaims = false;
    });
```

Configuration must identify the real issuer and API audience. Do not set these values from untrusted request data. [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)

### Server-rendered app challenges with OIDC and keeps an app cookie

```csharp
builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddOpenIdConnect(options =>
    {
        options.Authority = builder.Configuration["Oidc:Authority"];
        options.ClientId = builder.Configuration["Oidc:ClientId"];
        options.ClientSecret = builder.Configuration["Oidc:ClientSecret"];
        options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.ResponseType = OpenIdConnectResponseType.Code;
        options.UsePkce = true;
    });
```

Store the secret outside source-controlled settings. Register callback URIs at the provider and ensure the reverse proxy reports the correct external scheme/host/path. The OIDC handler authenticates the remote response; the cookie carries the app session. [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication)

## Common mistakes

- Accepting any correctly signed JWT without checking issuer, audience, and lifetime.
- Treating JWT decoding as signature validation.
- Sending an ID token to an API, or assuming every OAuth access token is a JWT.
- Disabling HTTPS metadata in production or trusting an attacker-controlled discovery endpoint.
- Exposing a client secret in a browser bundle, URL, checked-in settings file, or log.
- Treating OIDC as a replacement for local authorization or resource ownership checks.
- Linking an external provider solely because an email string matches, without verified-provider and account-linking policy.
- Saving provider tokens in a large browser cookie without considering replay, storage, and header-size risk.
- Customizing `OnMessageReceived` to read access tokens from query strings, which can leak through logs/referrers.
- Using a policy scheme selector that chooses a weaker validator based on untrusted token claims before validating the token.

## Knowledge checks with answers

1. **What four checks must an API commonly perform on a JWT access token?** Signature/key, issuer, audience, and lifetime validation.
2. **What is the difference between 401 and 403?** 401 means valid authentication is absent/failed; 403 means authentication succeeded but authorization denied the requested action.
3. **Why is an ID token not accepted as an access token?** Its audience and purpose are the OIDC client authentication result, not the resource API.
4. **Where does an OIDC confidential-client secret belong?** On the server in a secure secret store, never in browser-delivered code.
5. **How should an external account be linked?** After a trusted authenticated account-linking flow, store the stable provider/key association, and enforce policy against cross-account takeover.

## Sources

- [Configure JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)
- [Configure OpenID Connect web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication)
- [ASP.NET Core Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [Use Identity to secure a web API backend for SPAs](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)
