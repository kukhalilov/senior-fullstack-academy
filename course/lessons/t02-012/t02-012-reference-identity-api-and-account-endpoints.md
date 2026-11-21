# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Reference: Built-in Identity API endpoints, endpoint behavior, and proprietary token distinction

## Scope and version

ASP.NET Core Identity API endpoints provide a convenient account/API surface for first-party apps. They support cookie and proprietary protected-token modes but are not a full standards-based OAuth/OIDC identity provider. Browser apps should generally prefer cookies when same-origin/security design supports them; non-cookie clients can use the built-in tokens with their defined limits. [Identity API authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization) [Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)

## How this group fits the mental model

`AddIdentityApiEndpoints<TUser>` configures Identity and the endpoint-compatible authentication mechanisms. `MapIdentityApi<TUser>` maps routes. The login request chooses cookies or the built-in bearer token mode. Authorization still has to be required on application endpoints; mapping account endpoints does not secure every route. Cookie sign-out clears the browser cookie, whereas stateless bearer tokens remain valid until expiry unless additional revocation/validation behavior is implemented.

## Supplied names explained

| Supplied name | Explanation |
|---|---|
| `AddIdentityApiEndpoints<TUser>` | Configures Identity services and API endpoint support, including cookie and bearer-token authentication schemes. |
| `IdentityBuilder.AddApiEndpoints` | Adds endpoint-related Identity services to an existing Identity builder. |
| `IdentityBuilderExtensions.AddBearerToken` | Adds the built-in proprietary Identity bearer-token handler; it does not create JWTs or an OAuth authorization server. |
| `IdentityBuilderExtensions.AddIdentityCookies` | Adds Identity cookie schemes for browser-based session authentication. |
| `MapIdentityApi<TUser>` | Maps the account-management endpoints for the specified Identity user type. |
| `MapIdentityApi endpoint group` | The mapped route group containing register/login/refresh and account-management endpoints; apply authorization to app endpoints separately. |
| `Identity API register endpoint` | Creates an account using email/password and returns validation errors when requirements fail; confirmation behavior depends on Identity configuration. |
| `Identity API login endpoint` | Verifies credentials and optional two-factor input, then issues a cookie or proprietary tokens based on query parameters. |
| `Identity API refresh endpoint` | Uses a valid built-in refresh token to return a new token response; it is not a JWT refresh protocol from a general-purpose OAuth server. |
| `Identity API logout endpoint` | Cookie sign-out clears the browser cookie. For stateless bearer tokens, clients discard tokens; they otherwise remain valid until expiry absent extra revocation controls. |
| `Identity API confirm-email endpoint` | Confirms an email using the account ID/code included in the confirmation link. |
| `Identity API resend-confirmation-email endpoint` | Triggers another confirmation message for an account, subject to app delivery/rate-limit policy. |
| `Identity API forgot-password endpoint` | Starts a password-reset workflow and should avoid revealing whether an account exists. |
| `Identity API reset-password endpoint` | Resets a password with the purpose-bound reset code and new password. |
| `Identity API manage-two-factor endpoint` | Manages authenticator/MFA setup and recovery state for the current account. |
| `Identity API proprietary bearer token` | Framework-protected opaque token format for simple first-party API scenarios, not a standard JWT. |
| `Identity API token protection purpose` | Data Protection isolates the token's use/purpose; it is not a JWT signature contract for third-party validation. |
| `Identity API bearer token versus JWT access token` | Built-in token is proprietary; a JWT access token is issued by an authorization server and validated for issuer, audience, signature, and lifetime. |
| `Identity API cookie authentication option` | Browser-friendly session mode where the browser stores/sends a protected authentication cookie. |
| `useCookies query parameter` | On login, requests a persistent cookie when `useSessionCookies` is not true. |
| `useSessionCookies query parameter` | On login, requests a nonpersistent browser session cookie. |
| `Identity API endpoint customization boundary` | Customize or replace routes when business policy requires; retain endpoint authorization, antiforgery, validation, rate limits, and safe enumeration behavior. |
| `MapIdentityApi<TUser> route inventory` | The framework maps `POST /register`, `POST /login`, `POST /refresh`, `GET /confirmEmail`, `POST /resendConfirmationEmail`, `POST /forgotPassword`, `POST /resetPassword`, `POST /manage/2fa`, `GET /manage/info`, and `POST /manage/info`. These routes form an account API, not a complete application authorization policy. |
| `POST /manage/2fa` | Reads or updates authenticator-app 2FA state for the authenticated account, including shared-key setup, authenticator verification, and recovery-code management. Review the framework request/response contract for the target version; never expose the setup key after enrollment or recovery codes beyond the one-time display. |
| `GET /manage/info` | Reads the signed-in user's account information through the built-in API. Apply the normal authorization and privacy controls. |
| `POST /manage/info` | Updates the signed-in user's account information through the built-in API. Apply confirmation, uniqueness, validation, authorization, and abuse controls; do not treat a client-side form as authorization. |
| `Identity API access-token response` | Token mode returns `tokenType`, `accessToken`, `expiresIn`, and `refreshToken`. The access token is sent as a bearer credential; protect both tokens and use the refresh endpoint only for this built-in token flow. |
| `Identity API refresh response` | A successful `POST /refresh` returns a new access-token response, including a refresh token. Replace the client-side token set and handle refresh failure by requiring sign-in; do not assume this provides OAuth-standard revocation or interoperability. |
| `AddEntityFrameworkStores<TContext>` | Connects Identity persistence to EF Core; accounts/tokens are stored in the configured context/database. |
| `Identity API endpoint authorization` | Protect application resources with authorization metadata/policies; a route being in the app or a client-side guard does not authorize it. |
| `Identity API account confirmation requirement` | Confirmation settings can prevent sign-in until email/phone/account requirements are satisfied. |
| `Identity API tokens are not OAuth server tokens` | Identity API endpoints do not provide OAuth scopes, delegated consent, federation, or a general standards-compliant token service. |

## Cross-item comparison

Cookie mode relies on browser cookie behavior and server-side Data Protection. Token mode returns a short-lived access token plus a longer-lived refresh token. Neither mode makes the endpoint a complete authorization server. Cookie logout can delete the local cookie; a stateless bearer token is not centrally revoked simply because the client logged out. If the product requires independent clients, scopes/consent, federation, interoperable access tokens, or centralized revocation, use an actual identity provider.

## Examples

```csharp
builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
app.MapIdentityApi<ApplicationUser>();
app.MapGet("/profile", (ClaimsPrincipal user) => new
{
    UserId = user.FindFirstValue(ClaimTypes.NameIdentifier)
}).RequireAuthorization();
```

The built-in `/login` endpoint accepts `useCookies`/`useSessionCookies` choices; when both are false or omitted, it returns proprietary access/refresh tokens. Setting `useCookies=true` requests a persistent cookie unless `useSessionCookies=true`; setting `useSessionCookies=true` requests a nonpersistent session cookie, including when both are true. Do not accept these tokens as JWTs in another service. For browser `fetch`, include credentials when cookie cross-origin policy allows it, and protect state-changing cookie-authenticated operations against CSRF.

## Common mistakes

- Calling the built-in token a JWT or claiming it is an OAuth authorization server.
- Assuming `MapIdentityApi` protects every application endpoint automatically.
- Returning “account not found” for forgot-password or confirmation flows where that enables account enumeration.
- Treating cookie logout as server-side invalidation of already issued bearer tokens.
- Putting long-lived refresh tokens in JavaScript-accessible persistent storage without assessing XSS/storage risks.
- Using cookie authentication cross-site without deliberate `SameSite`, CORS/credentials, and antiforgery design.
- Assuming the default account endpoint workflow meets every app's rate-limit, recovery, email-delivery, and abuse-control requirements.

## Knowledge checks with answers

1. **What does the token-mode login return?** A proprietary protected access token and a refresh token, not a JWT/OAuth access token.
2. **Does calling cookie sign-out revoke stateless bearer tokens?** No. The client discards them; server-side validity otherwise lasts to expiration unless extra revocation is implemented.
3. **Does mapping Identity endpoints authorize `/admin`?** No. Protect app endpoints with authorization policies/attributes.
4. **When should a separate identity provider be used?** When standard OAuth/OIDC, scopes, delegated consent, federation, or broader token-server features are required.

## Sources

[Identity API authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization) · [Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
