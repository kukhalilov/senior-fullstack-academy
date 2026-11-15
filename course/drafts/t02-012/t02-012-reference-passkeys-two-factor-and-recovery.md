# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Reference: WebAuthn passkeys, multi-factor flows, authenticator tokens, and recovery

## Scope and version

ASP.NET Core 10 introduced built-in Identity passkey registration and authentication. ASP.NET Core 11 retains that support and exposes additional passkey configuration through `IdentityPasskeyOptions` as described by the current curriculum manifest. The built-in feature is scoped to Identity authentication scenarios; it is not a general-purpose WebAuthn server. Verify defaults and exact API availability against the targeted framework because the passkey surface is recent. [ASP.NET Core 10 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-10.0) [Passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/) [IdentityPasskeyOptions API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.identity.identitypasskeyoptions)

## How this group fits the mental model

Passkey registration is an attestation ceremony: the server provides a fresh challenge and relying-party context, the authenticator creates a public-key credential, and the server stores public credential data. Sign-in is an assertion ceremony: the server sends a fresh challenge, the authenticator signs it with the private key, and the server verifies the signature against the stored public key and the expected relying-party/origin context. The private key stays with the authenticator. Identity's `UserManager` persists passkey data and its passkey handler participates in verification. [Passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)

Two-factor authentication is a separate account flow. Identity can combine a primary sign-in attempt with authenticator or recovery codes, but built-in passkeys are treated as a primary factor and do not automatically become Identity's second factor. Recovery codes are single-use capabilities; secure enrollment and recovery are part of the authentication design, not optional UI details.

## Supplied names explained

### Passkey configuration and credential data

| Supplied name | Meaning and use |
|---|---|
| `IdentityPasskeyOptions` | Options for Identity's WebAuthn/passkey behavior, including relying-party domain, challenge, authenticator, origin, algorithm, and attestation controls. Configure only after understanding the production host/origin topology. |
| `IdentityPasskeyOptions.AttestationConveyancePreference` | Sets the requested attestation conveyance preference for credential creation. It controls what attestation information the authenticator/browser may provide; it does not force every browser or authenticator to return a particular attestation. |
| `IdentityPasskeyOptions.AuthenticatorAttachment` | Influences whether creation options prefer a platform authenticator or a cross-platform authenticator. It is a selection hint; availability and user-agent behavior can vary. |
| `IdentityPasskeyOptions.AuthenticatorTimeout` | Browser-facing time allowance hint for the authenticator ceremony. The browser may ignore it, so server-side challenge expiry and cancellation handling are still necessary. |
| `IdentityPasskeyOptions.ChallengeSize` | Number of random challenge bytes generated for creation/assertion flows. Challenges must be unpredictable and bound to one operation; the client must not choose them. |
| `IdentityPasskeyOptions.IsAllowedAlgorithm` | Predicate used to allow or reject credential public-key algorithm identifiers offered by an authenticator. Restrict algorithms to implementations the server can securely verify and maintain. |
| `IdentityPasskeyOptions.ResidentKeyRequirement` | Controls whether a discoverable credential is discouraged, preferred, or required in the creation request. Discoverable credentials can enable username-less sign-in, but browser/authenticator support and account discovery policy matter. |
| `IdentityPasskeyOptions.ServerDomain` | Effective relying-party ID/domain used for passkey registration and authentication. Set it deliberately in production; a broad parent domain also broadens subdomain scope, and untrusted content on covered subdomains is dangerous. |
| `IdentityPasskeyOptions.UserVerificationRequirement` | Requests whether the authenticator should verify the user (for example through a device PIN or biometric) during the ceremony. This requirement is a WebAuthn ceremony setting and does not by itself establish Identity's second factor. |
| `IdentityPasskeyOptions.ValidateOrigin` | Custom origin-validation callback for passkey ceremonies. Only accept explicit trusted origins; broad acceptance can undermine the origin binding that makes passkeys phishing-resistant. |
| `IdentityPasskeyOptions.VerifyAttestationStatement` | Custom attestation validation callback. Identity does not validate attestation statements by default; custom verification requires trustworthy metadata/certificate trust management and should be implemented only for a defined authenticator policy. |
| `UserPasskeyInfo` | Identity model for a user's stored passkey credential and relevant metadata. Persist it through a passkey-capable store and expose management operations only to the authenticated account owner. |
| `UserPasskeyInfo.CredentialId` | Credential identifier used to select the registered public key during authentication. Treat it as an identifier, not a secret; enforce uniqueness and safe storage. |
| `UserPasskeyInfo.PublicKey` | Stored public key used to verify a later authenticator assertion. The private key remains with the authenticator and must never be requested or stored by the server. |
| `UserPasskeyInfo.SignCount` | Authenticator-supplied signature counter metadata that some authenticators increment. A zero or non-monotonic value can occur with synced/multi-device credentials, so interpret it as a risk signal rather than a universal proof of cloning. |
| `UserPasskeyInfo.IsBackedUp` | Indicates the credential's reported backup state. It may help guide account-security UX, but it is not a guarantee of recovery or a credential-strength verdict. |
| `UserPasskeyInfo.IsBackupEligible` | Indicates whether a credential is eligible for backup/synchronization according to its WebAuthn flags. It is distinct from whether that credential is currently backed up. |
| `UserManager<TUser>.AddOrUpdatePasskeyAsync` | Persists a new passkey for a user or updates the associated credential data through a passkey-capable store. Restrict it to a verified registration ceremony and authenticated account-management action. |
| `UserManager<TUser>.GetPasskeysAsync` | Retrieves a user's registered passkey information from the store. Avoid exposing credential metadata or management actions to another account. |
| `IUserPasskeyStore<TUser>` | Store capability for reading/writing a user's passkeys. Custom Identity stores must implement it when the configured passkey manager workflow depends on it. |
| `PasskeyHandler<TUser>` | Default Identity service that creates passkey options and verifies registration/authentication responses. Identity sign-in methods manage protected ceremony state; application code should generally use those workflows rather than manually accepting credentials. |
| `SignInManager<TUser> passkey integration` | Identity sign-in APIs that coordinate passkey registration/assertion state and turn a verified assertion into a sign-in result. Protect both initiation and completion endpoints against CSRF, replay, and account confusion. |

### WebAuthn protocol and deployment boundaries

| Supplied name | Meaning and use |
|---|---|
| `Web Authentication API (WebAuthn)` | Browser API and W3C standard for creating and using public-key credentials. The browser enforces origin and relying-party constraints; the server must still validate ceremony state and the returned credential. |
| `FIDO2 passkey credential` | Public-key credential in the FIDO2/WebAuthn ecosystem. Modern passkeys may be synced or device-bound; the user experience and metadata depend on authenticator/provider support. |
| `Relying Party ID` | Domain identifier to which a credential is scoped. A credential cannot normally be used on a different unrelated domain; choosing a parent domain includes its subdomain scope. |
| `Passkey origin validation` | Check that the assertion/registration came from an expected web origin under the relying-party rules. Host-header and forwarded-host trust must be controlled at the server/proxy boundary. |
| `Passkey challenge and assertion` | A fresh random challenge prevents replay; the authenticator signs an assertion over ceremony data. Validate the challenge, origin, relying-party context, credential, and signature before sign-in. |
| `Passkey attestation verification` | Optional validation of attestation data that can provide authenticator provenance. Identity does not do this by default; enterprise allow/deny policies require maintained trust information and careful privacy/security decisions. |
| `Passkey public key storage` | Store the credential's public key and needed identifiers/metadata, never the private key. Protect integrity, uniqueness, ownership, and backup/restore of this data. |
| `No default attestation validation` | The Identity implementation accepts registration without validating attestation statements by default. Do not claim that a registered authenticator has been vendor-verified; enable a reviewed custom policy only when required. |
| `Passkeys do not provide built-in Identity 2FA` | Identity's passkey support treats the credential as a primary sign-in method; it does not automatically feed the separate Identity two-factor-code workflow. Do not claim a passkey alone is both factors. |
| `IdentityPasskeyOptions defaults` | Framework options have defaults, but browser support, server deployment, and framework version affect behavior. Inspect the exact target framework reference; explicitly set critical domain/origin policy rather than depending on host-derived defaults. |

### Sign-in requirements, token providers, and recovery

| Supplied name | Meaning and use |
|---|---|
| `IdentityOptions.SignIn.RequireConfirmedAccount` | Requires account confirmation before ordinary sign-in according to Identity's sign-in flow. Configure the needed confirmation process; a flag without deliverable recovery/confirmation can strand legitimate users. |
| `IdentityOptions.SignIn.RequireConfirmedEmail` | Requires a confirmed email for sign-in. This is distinct from confirming the account generally and does not itself send the confirmation message. |
| `IdentityOptions.SignIn.RequireConfirmedPhoneNumber` | Requires a confirmed phone number for sign-in. Ensure the phone-verification channel is secure and do not treat SMS as strong phishing-resistant MFA. |
| `IdentityOptions.Lockout.MaxFailedAccessAttempts` | Number of failed attempts allowed before the configured lockout behavior applies when the sign-in method counts failures. Choose with rate limits and recovery to avoid lockout abuse. |
| `IdentityOptions.Lockout.DefaultLockoutTimeSpan` | Duration an account remains locked after the relevant threshold. It governs Identity lockout state; it does not rate-limit distributed attacks by IP/device. |
| `IdentityOptions.Lockout.AllowedForNewUsers` | Controls whether new accounts are eligible for lockout. Lockout behavior is useful against guessing but may be abused to deny service to a victim. |
| `IdentityOptions.Password.RequiredLength` | Minimum password length enforced by the password validator. Longer passwords/passphrases and breached-password checks are more useful than assuming a specific character mixture makes a password strong. |
| `IdentityOptions.Password.RequireDigit` | Requires at least one numeric digit under the configured password validator. This is one composition rule, not an entropy measure. |
| `IdentityOptions.Password.RequireLowercase` | Requires at least one lowercase character. Consider usability and password-manager support when setting composition policy. |
| `IdentityOptions.Password.RequireUppercase` | Requires at least one uppercase character. It does not prevent common/reused passwords. |
| `IdentityOptions.Password.RequireNonAlphanumeric` | Requires a non-letter/digit character under the validator's definition. Treat this as policy configuration rather than proof of password quality. |
| `IdentityOptions.Password.RequiredUniqueChars` | Requires a minimum number of distinct characters in the password. This can reject repetitive strings but is not a substitute for length and compromised-password defenses. |
| `IdentityOptions.Tokens.AuthenticatorTokenProvider` | Selects the provider name used for authenticator-app two-factor tokens. It must match a registered provider that can validate the user's authenticator key. |
| `IdentityOptions.Tokens.EmailConfirmationTokenProvider` | Selects the token provider for email confirmation. Tokens are purpose-specific and should be delivered only to the address being confirmed. |
| `IdentityOptions.Tokens.PasswordResetTokenProvider` | Selects the provider for password-reset tokens. Use a safe reset workflow with non-enumerating responses and rate limits. |
| `IdentityOptions.Tokens.ChangeEmailTokenProvider` | Selects the provider for confirmation of email change. The change should be bound to the new address and completed only after its verification token succeeds. |
| `AddDefaultTokenProviders` | Registers built-in providers for Identity account and two-factor workflows. It does not send email/SMS, and applications should check which providers are appropriate for their threat model. |
| `IUserTwoFactorTokenProvider<TUser>` | Contract for generating and verifying a token used in a user's two-factor flow. Provider lifetime, replay handling, and delivery channel semantics depend on the implementation. |
| `TotpSecurityStampBasedTokenProvider<TUser>` | Provider base for time-based tokens tied to a user's security-stamp state. Tokens are short-lived and should be verified with rate limiting and careful clock configuration. |
| `AuthenticatorTokenProvider<TUser>` | Identity provider that validates authenticator-app one-time codes using the user's authenticator key. The application must protect key enrollment and recovery codes. |
| `EmailTokenProvider<TUser>` | Provider for short numeric email verification/two-factor codes according to configured Identity behavior. Email is not equivalent to a phishing-resistant possession factor. |
| `PhoneNumberTokenProvider<TUser>` | Provider for phone-delivered verification codes. SMS/phone channels have interception and account-reassignment risks; avoid relying on them as the only protection for sensitive accounts. |
| `UserManager<TUser>.GenerateTwoFactorTokenAsync` | Generates a code for the named registered two-factor provider. Send it only through the intended channel and prevent logs/telemetry from capturing it. |
| `UserManager<TUser>.VerifyTwoFactorTokenAsync` | Validates a supplied two-factor token with the selected provider. Use `SignInManager`'s full sign-in flow so successful verification is connected to the pending user and challenge state. |
| `UserManager<TUser>.GenerateNewTwoFactorRecoveryCodesAsync` | Replaces/generates a set of recovery codes for a user with two-factor authentication enabled. Show codes once, invalidate prior codes, and tell the user to store them safely. |
| `UserManager<TUser>.RedeemTwoFactorRecoveryCodeAsync` | Consumes a recovery code when it matches an unused stored code. Treat each code as a bearer secret and ensure it cannot be replayed after redemption. |
| `Two-factor enabled state` | Identity user state indicating whether the account has completed setup and enabled its two-factor method. It is not proof that the current sign-in has passed the second step. |
| `Recovery code one-time use` | A recovery code is accepted once and then invalidated. If a code is lost or exposed, regenerate the set and communicate that previous codes no longer work. |
| `Passkey versus password` | A password is a memorized shared secret vulnerable to phishing and reuse; a passkey uses a site-bound public-key challenge and keeps the private key with the authenticator. Account recovery and device availability remain concerns for both. |
| `Passkey versus second-factor authenticator` | A passkey is Identity's primary sign-in method in the built-in integration; an authenticator code is a separate one-time factor used in Identity's two-step sign-in. A passkey's local user verification does not make it the built-in Identity 2FA factor. |
| `Identity MFA limitations` | Identity provides account-level two-factor workflows and token-provider abstractions, but does not automatically solve every risk-based MFA, phishing-resistant step-up, recovery, or enterprise-authenticator policy. Define the required factors and threat model explicitly. |

## Cross-item comparison

| Mechanism | What the server verifies | Important boundary |
|---|---|---|
| Passkey assertion | Fresh challenge, credential ID, public-key signature, RP ID/origin and ceremony state | Default Identity attestation validation is absent; built-in support is primary-factor Identity sign-in |
| Authenticator code | Short-lived code from a registered token provider and the account's authenticator state | Separate Identity two-factor flow; protect enrollment and recovery |
| Recovery code | One stored, unused recovery capability | Single use; weaker recovery paths can undermine otherwise strong sign-in |
| Password | Candidate against Identity's stored password hash and policy | Reuse/phishing risk; secure reset and lockout handling are essential |

Passkey `IsBackupEligible` describes whether a credential can be backed up; `IsBackedUp` describes its reported backup state. Neither flag proves the user's account can be recovered. A signature counter can be useful telemetry but may not be monotonic for synchronized credentials, so a simplistic counter rejection rule can lock out legitimate users.

## Examples

### Configure a deliberate relying-party domain and ceremony policy

```csharp
builder.Services.Configure<IdentityPasskeyOptions>(options =>
{
    options.ServerDomain = "academy.example.com";
    options.ChallengeSize = 32;
    options.AuthenticatorTimeout = TimeSpan.FromMinutes(3);
    options.ValidateOrigin = context =>
        ValueTask.FromResult(context.Origin == "https://academy.example.com");
});
```

The allowlisted origin must match the deployed external origin exactly. If the application supports multiple legitimate origins, enumerate them explicitly and validate the forwarded host/scheme at the proxy boundary. Do not copy an example's domain into production without confirming the RP ID scope. [Passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)

### Build a recoverable account flow

Before enabling passwordless-only registration, decide how a user recovers from device loss, authenticator replacement, or account takeover. Possible design inputs include a second registered passkey, an external provider, carefully protected recovery codes, or a verified contact flow. Rate-limit changes, notify the user about authenticator enrollment/removal, and require recent reauthentication for high-impact changes. A recovery process should not be easier to exploit than primary authentication.

## Common mistakes

- Trusting the inbound `Host` or forwarded-host header to establish the RP ID without host validation and explicit trusted proxy configuration.
- Setting a broad parent `ServerDomain` while allowing untrusted content on subdomains within that scope.
- Accepting every origin in a custom `ValidateOrigin` callback.
- Claiming that Identity validates attestation by default or that it is a general-purpose WebAuthn server.
- Treating passkeys as built-in Identity second factor or ignoring local authenticator user verification semantics.
- Treating `SignCount` as a universal monotonic security counter for synced credentials.
- Exposing public-key credential management to another user's account or failing to limit credential count/display-name size.
- Enabling passkeys without planning recovery or safe credential removal.
- Confusing email/SMS codes with phishing-resistant passkeys.
- Displaying recovery codes repeatedly or failing to invalidate replaced codes.

## Knowledge checks with answers

1. **Where is the passkey private key?** With the authenticator/provider. The server stores the corresponding public key and credential metadata.
2. **What does a fresh challenge prevent?** Replaying an old signed assertion as though it were a current ceremony.
3. **Does default Identity passkey support validate attestation statements?** No. Custom attestation validation is available for applications with a defined authenticator policy.
4. **Is a passkey the same as Identity's authenticator-app 2FA?** No. Built-in passkeys are treated as a primary sign-in factor; authenticator codes are a separate Identity second-factor workflow.
5. **Can `SignCount` alone reliably detect a cloned passkey?** No. Some synchronized credentials do not provide a simple monotonically increasing counter; use it as one risk signal, not a universal rule.
6. **What production security setting must be decided deliberately?** The relying-party domain and allowed origins, together with host/forwarded-header validation and an HTTPS-only deployment.

## Sources

- [Enable Web Authentication API passkeys in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)
- [IdentityPasskeyOptions API reference](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.identity.identitypasskeyoptions)
- [Configure ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration)
- [ASP.NET Core 10 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-10.0)
