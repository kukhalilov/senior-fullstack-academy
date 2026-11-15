# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Reference: WebAuthn passkeys, multi-factor flows, authenticator tokens, and recovery

## Scope and version

ASP.NET Core Identity's built-in passkey flows target Identity accounts, not every WebAuthn server use case. This lesson covers the Identity options and account-level security flows represented by the supplied inventory. Passkeys arrived in ASP.NET Core 10; check the target framework's API reference for exact availability and defaults. [ASP.NET Core passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/) [ASP.NET Core 10 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-10.0) [IdentityPasskeyOptions](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.identity.identitypasskeyoptions)

## How this group fits the mental model

A registration ceremony lets an authenticator create a public-key credential for a relying party. The server supplies fresh challenge and relying-party context; the browser mediates the ceremony; the server validates the response and stores credential information. On sign-in, a fresh assertion is checked against the expected origin, relying-party ID, challenge, credential, and stored public key. The private key remains with the authenticator. Identity's passkey support is a primary sign-in path. Its authenticator-app two-factor and recovery-code flows are separate account workflows.

## Supplied names explained

### Passkey configuration and credential data

| Supplied name | Meaning and use |
|---|---|
| `IdentityPasskeyOptions` | Identity configuration for relying-party domain, challenge, authenticator, origin, algorithms, and attestation behavior. Decide security-critical values from the production host/origin topology. |
| `IdentityPasskeyOptions.AttestationConveyancePreference` | Requests a WebAuthn attestation conveyance preference during creation. Browser/authenticator behavior and privacy choices affect what is returned; the request is not a guarantee of a verified authenticator identity. |
| `IdentityPasskeyOptions.AuthenticatorAttachment` | Hints whether a platform or cross-platform authenticator is preferred. The browser may not be able to satisfy the preference. |
| `IdentityPasskeyOptions.AuthenticatorTimeout` | Browser-facing timeout hint for a ceremony. Do not rely on it as the only server-side challenge expiry or request cancellation control. |
| `IdentityPasskeyOptions.ChallengeSize` | Size of generated ceremony challenge material. Challenges must be unpredictable, fresh, tied to the correct account and ceremony, and accepted only once. |
| `IdentityPasskeyOptions.IsAllowedAlgorithm` | Predicate for allowing public-key algorithms offered by authenticators. Allow only algorithms the target runtime can verify and the application is prepared to support. |
| `IdentityPasskeyOptions.ResidentKeyRequirement` | Sets whether discoverable credentials are discouraged, preferred, or required. Discoverability supports username-less flows but affects account discovery and user experience. |
| `IdentityPasskeyOptions.ServerDomain` | Relying-party identifier/domain. A parent domain can include subdomains, so select the narrowest domain that supports the app and protect every covered host. |
| `IdentityPasskeyOptions.UserVerificationRequirement` | Requests authenticator user verification such as a local PIN/biometric. It does not mean Identity's separate second-factor workflow has been completed. |
| `IdentityPasskeyOptions.ValidateOrigin` | Callback for validating ceremony origin. Use a strict explicit allowlist based on trusted application origins; never accept arbitrary Host or forwarded-host values. |
| `IdentityPasskeyOptions.VerifyAttestationStatement` | Custom callback for verifying attestation. Identity does not validate attestation statements by default. Custom policy requires a maintained trust source and a clear reason to collect/use provenance. |
| `UserPasskeyInfo` | Stored Identity representation of a user's passkey credential and metadata. Restrict management to the authenticated account owner. |
| `UserPasskeyInfo.CredentialId` | Credential identifier used to locate a registered key. It is an identifier rather than a private secret; enforce uniqueness and ownership. |
| `UserPasskeyInfo.PublicKey` | Key used by the server to verify assertions. The authenticator retains the corresponding private key. |
| `UserPasskeyInfo.Name` | User-facing display label for distinguishing a user's registered credentials. Treat it as untrusted text, cap its length, and authorize rename operations for the credential owner. |
| `UserPasskeyInfo.SignCount` | Authenticator-provided counter metadata. Some synced credentials may not expose a simple increasing counter; avoid treating zero/non-increase as conclusive cloning proof. |
| `UserPasskeyInfo.IsBackedUp` | Reported current backup state. It is not proof that the user can recover the account or that another device will successfully sign in. |
| `UserPasskeyInfo.IsBackupEligible` | Indicates eligibility for backup/synchronization, distinct from whether the credential is currently reported backed up. |
| `UserManager<TUser>.AddOrUpdatePasskeyAsync` | Persists passkey data through a passkey-capable user store. Call only after a validated registration ceremony and authorized account-management action. |
| `UserManager<TUser>.GetPasskeysAsync` | Lists the current user's stored passkeys for management. Do not expose another account's credential metadata or permit cross-account removal/update. |
| `IUserPasskeyStore<TUser>` | Store contract for Identity passkey persistence. A custom user store must support the capability when the configured passkey flow depends on it. |
| `IPasskeyHandler<TUser>` | Passkey service contract for creating ceremony options and validating browser attestation/assertion responses. Prefer `SignInManager<TUser>` flows unless a documented customization requires the lower-level interface. |
| `IPasskeyHandler<TUser>.MakeCreationOptionsAsync` | Produces WebAuthn credential-creation options plus attestation state. The state identifies which account the new credential is being registered to. |
| `IPasskeyHandler<TUser>.MakeRequestOptionsAsync` | Produces assertion/request options and state for authenticating a passkey. Supplying a user constrains eligible credentials; a null user can support discoverable/username-less scenarios. |
| `IPasskeyHandler<TUser>.PerformAttestationAsync` | Validates a browser registration response against the supplied state and returns the account/credential result. If called directly, protect state integrity, bind ownership, enforce expiry, and consume it once. |
| `IPasskeyHandler<TUser>.PerformAssertionAsync` | Validates a browser authentication assertion using the supplied state and stored credential, producing the result without necessarily completing Identity sign-in. Persist updated credential state when required. |
| `PasskeyHandler<TUser>` | Identity's default `IPasskeyHandler<TUser>` implementation. `SignInManager<TUser>` calls it for the supported high-level ceremony workflows. |
| `PasskeyCreationOptionsResult` | Result from creation-option generation that carries browser-facing options and server-retained ceremony state. |
| `PasskeyCreationOptionsResult.CreationOptionsJson` | Serialized options passed to the browser and then to `navigator.credentials.create()`. It is not a substitute for retaining the accompanying server state. |
| `PasskeyCreationOptionsResult.AttestationState` | State returned alongside creation options and required when validating registration. Do not expose it as editable client state unless it is integrity-protected and bound to the requesting session/user. |
| `PasskeyAttestationResult` | Result from validating registration, including whether validation succeeded and the validated passkey/account data. Check success before storing. |
| `PasskeyAssertionResult` | Result from validating authentication, including the resolved user and updated passkey metadata. If using lower-level validation instead of `PasskeySignInAsync`, handle persistence and session establishment deliberately. |
| `PasskeyUserEntity` | User identity encoded in the passkey ceremony state/result. When directly managing registration state, compare it with the currently authenticated user before persisting the credential. |
| `SignInManager<TUser>.MakePasskeyCreationOptionsAsync` | High-level API that creates passkey registration options and securely manages temporary ceremony state for the subsequent request. |
| `SignInManager<TUser>.MakePasskeyRequestOptionsAsync` | High-level API to create authentication options for a named user or discoverable/username-less sign-in. |
| `SignInManager<TUser>.PerformPasskeyAttestationAsync` | High-level registration validation API using SignInManager-managed state. Check the result and persist through `UserManager<TUser>.AddOrUpdatePasskeyAsync`. |
| `SignInManager<TUser>.PerformPasskeyAssertionAsync` | High-level assertion validation API for applications that need to inspect the result before session establishment. Updated sign-count/flag data may need to be persisted. |
| `SignInManager<TUser>.PasskeySignInAsync` | Completes passkey authentication and signs in the resolved user after checking the pending assertion state. Missing or expired ceremony state is a recoverable failed result; calling out of sequence is an application error. |
| `Passkey ceremony state integrity` | State must not be client-modifiable. SignInManager protects its temporary state; if the app handles it directly, keep it server-side or protect it with Data Protection before returning it. |
| `Passkey ceremony state account ownership binding` | Bind state to the session/user that initiated registration and compare the returned `PasskeyUserEntity` with the signed-in account before saving. Otherwise an attacker can attach a credential to another user's account. |
| `Passkey ceremony state single-use expiration` | Consume state once and give it a short lifetime. This prevents replaying an old ceremony or leaving an enrollment request open indefinitely. |

### WebAuthn boundaries

| Supplied name | Meaning and use |
|---|---|
| `Web Authentication API (WebAuthn)` | Browser API and W3C protocol for public-key credentials. Browser origin enforcement complements, but does not replace, server validation of state and response. |
| `FIDO2 passkey credential` | Public-key credential in the WebAuthn/FIDO ecosystem. A passkey may be synced or device-bound depending on the provider; the app should not assume one physical device per credential. |
| `Relying Party ID` | Domain scope for a credential. Use a stable intended domain and account for all covered subdomains. |
| `Passkey origin validation` | Ensures ceremony response is bound to a trusted web origin. Configure trusted proxy/host handling to prevent untrusted forwarding headers from influencing origin decisions. |
| `Passkey challenge and assertion` | The challenge is fresh server state; assertion proves possession of the private key for that challenge. Verify challenge, ceremony type, origin, RP ID, credential ownership, and signature before sign-in. |
| `Passkey attestation verification` | Optional process for assessing attestation information about an authenticator. It is distinct from verifying the credential's assertion and requires a maintained authenticator trust policy. |
| `Passkey public key storage` | Persist the public key, credential ID, and required metadata with integrity and account ownership protections. Never store or request the authenticator's private key. |
| `No default attestation validation` | Identity's default registration path does not establish that the authenticator vendor/model was attested and trusted. Do not present AAGUID or display name as an attestation decision. |
| `Passkeys do not provide built-in Identity 2FA` | The built-in passkey path is a primary sign-in method, not automatically the separate Identity second-factor challenge. A platform biometric unlock is not itself proof that Identity's 2FA step ran. |
| `IdentityPasskeyOptions defaults` | Defaults exist and can change with framework versions. Review the target reference, and explicitly set domain/origin policy that must remain fixed across deployment environments. |

### Account requirements, token providers, and recovery

| Supplied name | Meaning and use |
|---|---|
| `IdentityOptions.SignIn.RequireConfirmedAccount` | Requires account confirmation under Identity's sign-in checks. A configured flag does not deliver a confirmation message or provide a recovery channel. |
| `IdentityOptions.SignIn.RequireConfirmedEmail` | Requires confirmed email for sign-in. Keep confirmation bound to the address and do not assume email confirmation alone is strong authentication. |
| `IdentityOptions.SignIn.RequireConfirmedPhoneNumber` | Requires confirmed phone for sign-in. Phone/SMS verification is vulnerable to interception and reassignment; avoid treating it as phishing-resistant MFA. |
| `IdentityOptions.Lockout.MaxFailedAccessAttempts` | Failed-access threshold that can trigger lockout where the sign-in workflow records failures. Combine with rate limiting and recovery against lockout denial of service. |
| `IdentityOptions.Lockout.DefaultLockoutTimeSpan` | Duration for the configured account lockout. It is not a distributed IP/device rate limiter. |
| `IdentityOptions.Lockout.AllowedForNewUsers` | Determines whether new users may be locked out. Consider operational support and abuse resistance. |
| `IdentityOptions.Password.RequiredLength` | Minimum length enforced by Identity's validator. Favor usable long passwords and compromised-password defenses over assuming length alone guarantees safety. |
| `IdentityOptions.Password.RequireDigit` | Requires a digit under the configured validator. This composition rule is not a measure of password entropy or resistance to reuse. |
| `IdentityOptions.Password.RequireLowercase` | Requires lowercase characters. Balance with usable password-manager-generated secrets. |
| `IdentityOptions.Password.RequireUppercase` | Requires uppercase characters. This does not prevent common, breached, or reused passwords. |
| `IdentityOptions.Password.RequireNonAlphanumeric` | Requires a non-alphanumeric character according to the validator. It is one policy rule, not proof of strength. |
| `IdentityOptions.Password.RequiredUniqueChars` | Requires a minimum number of distinct characters. It may reject repetitive strings but does not replace length or breached-password checks. |
| `IdentityOptions.Tokens.AuthenticatorTokenProvider` | Provider name used for authenticator-app two-factor tokens. It must resolve to an appropriate registered provider. |
| `IdentityOptions.Tokens.EmailConfirmationTokenProvider` | Provider selected for email confirmation tokens. Deliver only to the address the user is confirming. |
| `IdentityOptions.Tokens.PasswordResetTokenProvider` | Provider selected for reset tokens. Pair with non-enumerating responses, rate limits, and short, purpose-bound reset flows. |
| `IdentityOptions.Tokens.ChangeEmailTokenProvider` | Provider for email-change confirmation. Bind confirmation to the new address before updating account ownership data. |
| `AddDefaultTokenProviders` | Adds standard Identity token providers. It does not implement email/SMS delivery or make every provider suitable for every threat model. |
| `IUserTwoFactorTokenProvider<TUser>` | Contract to generate/verify a token for an Identity second-factor flow. Expiry, replay, and delivery behavior depends on its implementation. |
| `TotpSecurityStampBasedTokenProvider<TUser>` | Base provider for time-based codes associated with security-stamp state. Ensure time and verification-attempt policy are appropriate. |
| `AuthenticatorTokenProvider<TUser>` | Verifies authenticator-app one-time codes using the registered authenticator key. Protect enrollment, key reset, and recovery code handling. |
| `EmailTokenProvider<TUser>` | Provider for email-delivered Identity codes. Email account security and recovery become part of the factor's security; it is not phishing-resistant. |
| `PhoneNumberTokenProvider<TUser>` | Provider for phone-number-delivered codes. SMS has interception/reassignment risks; avoid using it as the sole protection for high-value accounts. |
| `UserManager<TUser>.GenerateTwoFactorTokenAsync` | Generates a code for a named configured provider. Deliver through the intended channel and redact it from logs, traces, and analytics. |
| `UserManager<TUser>.VerifyTwoFactorTokenAsync` | Verifies a supplied code for a provider. Use the complete SignInManager flow so the code is tied to the pending user's sign-in. |
| `UserManager<TUser>.GenerateNewTwoFactorRecoveryCodesAsync` | Replaces/generates recovery codes for enabled 2FA. Display the new set once and invalidate the old set. |
| `UserManager<TUser>.RedeemTwoFactorRecoveryCodeAsync` | Redeems one matching unused code. Treat it as a bearer secret and prevent re-use after success. |
| `Two-factor enabled state` | Account setting showing that a second-factor method has been enrolled/enabled. It does not establish that the current login passed the second step. |
| `Recovery code one-time use` | Each recovery code is consumed once. Regenerate the set if it is exposed or replaced. |
| `Passkey versus password` | Password is a memorized secret that can be phished/reused; passkey is a domain-scoped public-key ceremony. Both need safe recovery and account lifecycle controls. |
| `Passkey versus second-factor authenticator` | Identity passkey sign-in and authenticator-app one-time code are distinct primary and second-factor paths. Do not infer Identity MFA from local device unlock. |
| `Identity MFA limitations` | Identity supplies account-level 2FA primitives, but applications still design step-up policies, enrollment, phishing resistance, recovery, risk signals, and enterprise requirements. |

## Cross-item comparison

| Mechanism | Server verifies | Main caution |
|---|---|---|
| Passkey assertion | Fresh ceremony, expected account/RP/origin, credential and signature | Default attestation is not validated; it is a primary sign-in factor |
| Authenticator-app code | Provider code and enrolled authenticator state | Protect enrollment and recovery; apply attempt limits |
| Recovery code | One unused stored recovery secret | Single use; weaker recovery can defeat strong primary authentication |
| Password | Candidate against stored password hash and policy | Prevent phishing/reuse; support safe reset and lockout |

`IsBackupEligible` and `IsBackedUp` are distinct credential-state flags. Neither guarantees the app's account recovery works. Signature counters can be unreliable for synchronized passkeys and should not be treated as universal clone detection.

## Examples

### Configure relying-party policy deliberately

```csharp
builder.Services.Configure<IdentityPasskeyOptions>(options =>
{
    options.ServerDomain = "accounts.example.com";
    options.AuthenticatorTimeout = TimeSpan.FromMinutes(3);
    options.ChallengeSize = 64;
});
```

These properties are part of the documented options surface. The default origin validation allows subdomains and disallows cross-origin iframes; when strict origin control is needed, use the documented `ValidateOrigin` callback and a deliberate allowlist. If `ServerDomain` is omitted, Identity infers the relying-party ID from the host, so validate Host headers and configure trusted forwarded hosts. Passkey operations require HTTPS. [Passkey security guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)

### Protect registration state if using the lower-level handler

Most applications should use `SignInManager<TUser>` because it stores the temporary state in a Data Protection-protected authentication cookie, consumes it once, and checks whether it belongs to registration or assertion. If an application calls `IPasskeyHandler<TUser>` directly, it owns those guarantees: keep state server-side or protect it before sending it to the browser, bind it to the authenticated user/session, delete it before use, expire it quickly, and compare the result's `PasskeyUserEntity` to the current account before storing the passkey. The browser response itself does not identify which account should receive the new credential. [Passkey handler and ceremony state](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)

### Keep second-factor enrollment and recovery deliberate

When enrolling an authenticator app, require a currently authenticated account, confirm possession by verifying a code, store the key safely, generate recovery codes, show them once, and record the change. Replacing the key should invalidate old enrollment and recovery material. Rate-limit verification attempts and do not log codes.

## Common mistakes

- Assuming passkey support is a general WebAuthn server or default attestation verifier.
- Using an overly broad relying-party domain or trusting arbitrary forwarded host values.
- Treating passkey local biometrics as Identity's configured second factor.
- Treating `SignCount` as a reliable monotonic clone detector for every synchronized credential.
- Confusing currently backed-up state with backup eligibility or account recoverability.
- Logging reset tokens, authenticator codes, or recovery codes.
- Enabling account lockout without rate limits and a support/recovery design.
- Requiring email or SMS confirmation and claiming it is equivalent to phishing-resistant MFA.

## Knowledge checks with answers

1. **Where is the passkey private key?** With the authenticator/provider; the server stores public key material and credential metadata.
2. **What prevents replay of an old assertion?** A fresh one-time challenge bound to the expected ceremony and account, validated with origin, RP ID, credential and signature.
3. **Does Identity validate authenticator attestation by default?** No; custom verification is possible when a maintained policy requires it.
4. **Is a passkey automatically Identity 2FA?** No. Built-in passkey sign-in and Identity's separate second-factor code flow are distinct.
5. **Does `SignCount` prove a credential was cloned when it does not increase?** No. Synced credentials may not provide a monotonically increasing count.
6. **Which settings deserve deliberate production review?** RP domain, allowed origins, HTTPS/proxy trust, user verification, recovery, credential management authorization, and rate limits.

## Sources

- [Enable Web Authentication API passkeys in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)
- [IdentityPasskeyOptions API reference](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.identity.identitypasskeyoptions)
- [Configure ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration)
- [ASP.NET Core 10 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-10.0)
