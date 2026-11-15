# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Reference: ASP.NET Core 11 Identity time testing passkey names and experimental device-bound sessions

## Scope and version

This reference covers Identity changes documented for ASP.NET Core 11: injectable time, friendly passkey labels, and Device Bound Session Credentials (DBSC). It treats DBSC as experimental in this release and distinguishes it from established Identity passkey and cookie features. Framework prerelease packages and browser support can change; verify the exact target framework and package before adopting DBSC. [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

## How this group fits the mental model

`TimeProvider` makes time an explicit dependency. Identity can use the application's registered provider for operations whose correctness depends on “now,” so tests can advance a fake clock without sleeping. Passkey display names are presentation metadata inferred from authenticator AAGUIDs; they do not change cryptographic verification or prove vendor identity. DBSC adds an experimental browser/device-bound refresh mechanism around a short-lived cookie session. It does not replace user authentication, application authorization, CSRF defenses, or a safe cookie policy.

## Supplied names explained

| Supplied name | Meaning and use |
|---|---|
| `ASP.NET Core 11 Identity TimeProvider support` | Identity's time-dependent behavior can use `TimeProvider`, making operations deterministic in tests. This improves testability without creating a new token format. |
| `Identity uses TimeProvider for time-related operations` | Expiration and other time comparisons use the configured time abstraction. A fake provider changes application-observed time; it does not fake unrelated services automatically. |
| `TimeProvider dependency injection for Identity` | Register the provider in DI so Identity services resolve the intended instance. Production normally uses `TimeProvider.System`; tests can inject a controllable provider before constructing services. |
| `Deterministic Identity tests for token expiration lockout and security stamp validation` | Advance a fake clock to cover expiration, lockout duration, and validation interval boundaries without flaky delays. Test just-before, exact-boundary, and just-after cases. |
| `ASP.NET Core 11 passkey display name inference from authenticator AAGUID` | Identity can infer a friendly label from an authenticator AAGUID. It is a type identifier, not a credential secret, unique user identifier, attestation verdict, or cryptographic trust guarantee. |
| `PasskeyAuthenticators dictionary` | Mapping used to associate known authenticator AAGUIDs with readable names. Extend or customize it when needed; treat unknown values as untrusted input. |
| `AAGUID Authenticator Attestation GUID` | Authenticator Attestation Globally Unique Identifier: an identifier for an authenticator model/class when present. It is not the credential ID and does not itself establish that attestation was validated. |
| `Known passkey authenticator display names assigned automatically` | Recognized AAGUIDs can have a readable label in passkey management. The label helps users distinguish credentials; it must not grant privileges. |
| `Unknown passkey authenticator rename page` | Unknown authenticators can be named by the user in the management flow. Validate and encode this untrusted text, cap its length, and authorize changes for the signed-in account. |
| `ASP.NET Core 11 experimental Device Bound Session Credentials support` | Framework DBSC support is explicitly experimental. Treat it as an opt-in evaluation, not a production default or replacement for established cookie controls. |
| `Microsoft.AspNetCore.Authentication.DeviceBoundSessions package` | Package containing the DBSC integration. Check framework compatibility, release state, browser support, and current documentation before use. |
| `AddDeviceBoundSession` | Registration extension shown by release guidance to add DBSC services/middleware support. Follow required endpoint and pipeline setup; it does not authenticate users or configure authorization by itself. |
| `ShortLivedCookieExpiration` | Controls short-lived session-cookie lifetime in the DBSC setup. A short expiry does not remove the need for HTTPS, HttpOnly, SameSite, antiforgery, revocation, and account recovery. |
| `DBSC browser implementation is experimental` | Browser support/interoperability are experimental. Feature-detect and test supported clients, and provide a safe fallback. |
| `Device-bound session registration endpoint and refresh cookie` | DBSC setup includes registration and a refresh cookie scoped to that purpose. Protect registration from CSRF, bind it to the authenticated account/device key, narrow cookie scope, and plan revocation. |

## Cross-item comparison

| Change | What it improves | What it does not imply |
|---|---|---|
| `TimeProvider` | Predictable testing of time-dependent Identity behavior | That all application/framework code shares the fake clock unless it resolves the same provider |
| AAGUID-derived label | An understandable passkey list | Attestation verification, device identity, or permission to trust an authenticator |
| DBSC support | Experimental protection against some cookie theft/replay scenarios through device-bound session refresh | Broad browser support, immunity to XSS/CSRF, automatic revocation, or a stable API contract |

DBSC and ordinary cookies operate at different layers: the short-lived cookie authenticates requests during its lifetime, while a device-bound credential participates in refreshing a session. Evaluate device loss, key rotation, multi-device use, logout/revocation, account recovery, and fallback together. DBSC is not a passkey: a passkey authenticates a user to a relying party; DBSC protects session refresh.

## Examples

### Make Identity time behavior deterministic in a test

The exact fake-provider class depends on the test framework and runtime. The essential arrangement is one provider instance shared by Identity and the test:

```csharp
var clock = new FakeTimeProvider(initialTime);
services.AddSingleton<TimeProvider>(clock);
services.AddIdentityCore<ApplicationUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Resolve Identity services from this provider, perform the operation,
// advance the clock, then assert the expected expiration/lockout boundary.
clock.Advance(TimeSpan.FromMinutes(16));
```

If Identity resolves a different provider or is built before test registration, the test does not control its clock. Cover exact boundaries rather than testing only a distant expiration.

### Treat passkey names as user-facing metadata

Use the inferred name for recognized AAGUIDs and ask the user to name unknown authenticators. Escape names on output, cap their length, authorize changes for the current account, and never use the label to establish attestation trust or select security policy.

### Evaluate DBSC as an experimental deployment feature

Verify package and browser support for the deployment matrix. Test registration, refresh, logout, server revocation, stolen refresh cookies, lost device keys, and fallback behavior. Retain conventional cookie security attributes and antiforgery defenses. Do not make DBSC a sign-in prerequisite until the intended clients interoperate reliably.

## Common mistakes

- Assuming a fake clock advances in every service; only consumers resolving that provider observe it.
- Testing expiry with sleeps, causing slow and flaky boundary tests.
- Treating an AAGUID or friendly label as a verified manufacturer identity or attestation result.
- Assuming every authenticator has a known AAGUID or a stable label across synchronized credentials.
- Treating DBSC as stable in ASP.NET Core 11 or universally supported by browsers.
- Confusing passkey authentication with device-bound session refresh.
- Dropping cookie, CSRF, revocation, or recovery controls because DBSC is enabled.

## Knowledge checks with answers

1. **Why inject `TimeProvider` into Identity tests?** To control the time Identity observes and test expiry/lockout/validation boundaries without waiting.
2. **Does a known AAGUID prove Identity validated attestation?** No. AAGUID-based labeling is metadata; attestation verification is a separate policy.
3. **What if an authenticator AAGUID is unmapped?** The management experience can ask the user for a name; treat the name as untrusted display text.
4. **Can ASP.NET Core 11 DBSC be assumed across browsers?** No. Both framework support and browser implementations are experimental; verify support and provide fallback.
5. **Does DBSC replace passkey sign-in or cookie controls?** No. It is experimental session-refresh protection layered with cookie authentication and does not remove authentication, authorization, cookie, CSRF, or recovery requirements.

## Sources

- [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)
- [ASP.NET Core passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)
- [Cookie authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)
