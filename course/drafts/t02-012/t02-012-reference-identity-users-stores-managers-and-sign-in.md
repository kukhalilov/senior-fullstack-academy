# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Reference: Identity user/role models, manager APIs, stores, password and sign-in workflows

## Scope and version

This reference covers the ASP.NET Core Identity account-management surface for the current ASP.NET Core 11 curriculum, including user and role models, manager workflows, store contracts, results, password hashing, option groups, and the distinction between an Identity abstraction and a particular EF Core store. Exact option defaults are configurable and can change; inspect the options for the target app rather than relying on remembered defaults. [Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) [Identity configuration](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration) [UserManager API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.identity.usermanager-1)

## How this group fits the mental model

Identity separates **orchestration** from **persistence**. `UserManager<TUser>` and `SignInManager<TUser>` implement common account and sign-in workflows. They depend on store interfaces, validators, token providers, and options. A store persists user/role data; it does not by itself decide whether a request's cookie or bearer credential is valid. After a successful sign-in, an authentication handler issues or validates the request credential. [Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)

## Supplied names explained

### Models, registration, and option groups

| Supplied name | Meaning and use |
|---|---|
| `IdentityUser` | Convenience user entity with the default string key and the common username, email, password-hash, lockout, two-factor, and security-stamp fields. Extend it for app-specific data, but keep authorization decisions in explicit policy/resource logic. |
| `IdentityUser<TKey>` | Generic base user entity where `TKey` selects the primary-key type. The chosen key type must match the configured stores and related entities. |
| `IdentityRole` | Convenience role entity using the default string key, with a role name and normalized name. Roles are broad labels; they are not a substitute for resource-level authorization. |
| `IdentityRole<TKey>` | Generic role entity with an application-selected key type that must align with the user-role join/store configuration. |
| `IdentityBuilder` | Registration builder returned by Identity service-registration APIs. It lets the application add related Identity services and alter user/role types before the service provider is built. |
| `AddIdentity<TUser,TRole>` | Registers the full Identity system for the supplied user and role types, including role services and cookie-related authentication setup. It is commonly used when composing a traditional Identity UI/account stack. |
| `AddDefaultIdentity<TUser>` | Registers the default Identity UI-oriented setup for a user type and includes default UI/token-provider services; add roles explicitly if needed. It is a convenience preset, not an authorization policy. |
| `AddIdentityCore<TUser>` | Registers the core user-management services without automatically composing the full UI/role/sign-in stack. Add roles, sign-in management, token providers, stores, and authentication integration as the app requires. |
| `IdentityBuilder.AddRoles<TRole>` | Adds role support for a selected role type to a core Identity registration; role stores must also be configured. |
| `IdentityBuilder.AddSignInManager` | Adds `SignInManager<TUser>` and its related sign-in orchestration services to an Identity builder. |
| `IdentityBuilder.AddDefaultTokenProviders` | Registers the built-in providers for common account and two-factor tokens. Registration does not make email/SMS delivery happen; the application must deliver generated tokens through a suitable channel. |
| `IdentityBuilder.AddEntityFrameworkStores<TContext>` | Connects Identity's store contracts to EF Core stores using the application's context. The context must include the required Identity entity sets and compatible key types. |
| `IdentityOptions` | Root settings object for user, password, lockout, sign-in, claims identity, store, and token behavior. Configure it at startup and test policies against the actual deployed account workflows. |
| `IdentityOptions.User` | Controls username and email-related user rules, including allowed username characters and whether email must be unique. Uniqueness depends on store support and database constraints as well as validation. |
| `IdentityOptions.Password` | Controls password validation requirements such as length and character categories. These are policy checks, not a replacement for a modern password hasher or breached-password strategy. |
| `IdentityOptions.Lockout` | Controls lockout threshold, duration, and which users are subject to lockout. Lockout can reduce online guessing but can also be abused for denial of service; pair it with sensible monitoring and recovery. |
| `IdentityOptions.SignIn` | Controls requirements such as confirmed account, email, or phone before sign-in and whether confirmed email is required for username/email sign-in. It gates sign-in; it does not send confirmation messages. |
| `IdentityOptions.ClaimsIdentity` | Controls claim types and identity metadata used when Identity creates a claims identity, including user identifier, username, role, and security-stamp claim types. Keep claim mapping consistent with authorization policies. |
| `IdentityOptions.Stores` | Controls store-level behavior such as maximum key length and personal-data protection. Store capabilities still vary; options cannot create an interface capability the store does not implement. |
| `IdentityOptions.Tokens` | Selects token-provider names for account confirmation, password reset, change email, and authenticator flows. Providers need registration, and sensitive tokens must be delivered and validated through the intended workflow. |

### User and sign-in managers

| Supplied name | Meaning and use |
|---|---|
| `UserManager<TUser>` | High-level coordinator for creating, finding, updating, deleting, validating, and changing credentials or claims for a user. Prefer it over directly editing password hashes or security-sensitive fields. |
| `UserManager<TUser>.CreateAsync` | Validates and persists a new user; the password overload also validates/hashes the password. Inspect `IdentityResult` and do not report success until the store operation succeeds. |
| `UserManager<TUser>.UpdateAsync` | Validates and persists changes to a user through the store, including relevant normalization and security-stamp behavior. Avoid bypassing it for security-sensitive changes. |
| `UserManager<TUser>.DeleteAsync` | Deletes the user through the configured store and returns validation/store errors through `IdentityResult`; related-data behavior depends on the store/database configuration. |
| `UserManager<TUser>.FindByIdAsync` | Looks up a user by the store's string representation of the configured key. It returns null when no user is found. |
| `UserManager<TUser>.FindByNameAsync` | Looks up by normalized username, so store normalization behavior is important; usernames should not be compared with ad hoc case rules elsewhere. |
| `UserManager<TUser>.FindByEmailAsync` | Looks up by normalized email when the configured store supports email. This method does not by itself establish that an email address is verified. |
| `UserManager<TUser>.CheckPasswordAsync` | Checks a candidate against the stored password hash and returns a Boolean. For a full sign-in, use `SignInManager` so lockout, two-factor, and sign-in policy are applied. |
| `UserManager<TUser>.ChangePasswordAsync` | Changes the current user's password after verifying the current password and validating the new one, then persists the new hash. It is not a password-reset flow for a user who cannot authenticate. |
| `UserManager<TUser>.AddPasswordAsync` | Adds a password to a user who currently has no password, after validation and hashing. Protect the operation with a verified authenticated flow. |
| `UserManager<TUser>.RemovePasswordAsync` | Removes a user's password where the configured store supports password storage. Ensure another secure sign-in/recovery method remains before exposing password removal. |
| `UserManager<TUser>.ResetPasswordAsync` | Resets a password after validating a reset token generated for the user by the configured provider. A reset token is a capability; protect its delivery and avoid leaking it in logs or analytics. |
| `UserManager<TUser>.GeneratePasswordResetTokenAsync` | Creates a time/purpose-protected token for the password-reset workflow. It must be sent to the user through a verified channel and passed back to `ResetPasswordAsync`. |
| `UserManager<TUser>.GenerateEmailConfirmationTokenAsync` | Creates a confirmation token for the current email-confirmation operation. The application must encode it safely for the chosen transport and deliver the confirmation link. |
| `UserManager<TUser>.ConfirmEmailAsync` | Confirms the stored email when a valid user-specific confirmation token is supplied. Confirmation changes account state; it does not prove ownership of unrelated contact channels. |
| `UserManager<TUser>.GenerateChangeEmailTokenAsync` | Generates a purpose-bound token for changing a user's email to a specified new address. Confirm the new address before making it the account's trusted contact address. |
| `UserManager<TUser>.ChangeEmailAsync` | Applies a requested new email only when a matching change-email token validates. Handle uniqueness conflicts and update security-sensitive sessions as required. |
| `UserManager<TUser>.GenerateChangePhoneNumberTokenAsync` | Generates a token for confirming a phone-number change to the specified number. It does not send an SMS; the application owns delivery and rate limits. |
| `UserManager<TUser>.ChangePhoneNumberAsync` | Changes the phone number after verifying the matching token. Treat phone numbers as mutable identifiers and avoid using them as the sole proof of high-risk account recovery. |
| `UserManager<TUser>.AddToRoleAsync` | Assigns the user to one named role if role stores are configured. Validate that the caller may grant that role; never expose arbitrary role assignment to an untrusted user. |
| `UserManager<TUser>.AddToRolesAsync` | Adds the user to multiple roles. Treat the entire requested role set as privileged input and inspect the result for role/store errors. |
| `UserManager<TUser>.RemoveFromRoleAsync` | Removes a user from a role. Changes may not affect an already-issued cookie principal until it is refreshed, revalidated, or expires. |
| `UserManager<TUser>.GetRolesAsync` | Returns the names of the user's roles from the configured role store. Role membership is a source for claims/policies, not proof that the role is sufficient for a specific resource. |
| `UserManager<TUser>.GetClaimsAsync` | Reads claims stored for the user through a claim-capable store. Distinguish persisted user claims from claims produced by an external identity provider. |
| `UserManager<TUser>.AddClaimAsync` | Adds one persisted user claim. Restrict who can assign security claims, and account for session/principal refresh after changes. |
| `UserManager<TUser>.AddClaimsAsync` | Adds a set of persisted user claims. Validate each claim type/value against a trusted policy; do not blindly copy untrusted request fields into authorization claims. |
| `UserManager<TUser>.RemoveClaimAsync` | Removes a stored claim matching the supplied claim. Existing session tickets may continue carrying previously issued claims until refreshed or invalidated. |
| `UserManager<TUser>.GetUserId` | Reads the user identifier claim from a principal. It does not query the user store or prove the user still exists. |
| `UserManager<TUser>.GetUserName` | Reads the username claim from a principal. Treat it as display/identity data, not a stable database key or authorization decision. |
| `UserManager<TUser>.GetEmailAsync` | Reads the email stored for a user from the configured store. Whether it is confirmed is a separate state check. |
| `UserManager<TUser>.SetEmailAsync` | Sets the email through the store after validation. Applications that require verified email should use the token-based change/confirmation flow instead of treating arbitrary input as verified. |
| `UserManager<TUser>.GetSecurityStampAsync` | Reads a random security-change marker where the store supports it. Do not expose the stamp as a user-facing credential. |
| `UserManager<TUser>.UpdateSecurityStampAsync` | Regenerates the user's security stamp, enabling cookie validation to detect some account changes. It is not instant global revocation unless validation is performed and relevant nodes share state. |
| `SignInManager<TUser>` | Coordinates password, external, and multi-factor sign-in with Identity policy and authentication schemes. It bridges user/account state to the application's authentication ticket. |
| `SignInManager<TUser>.PasswordSignInAsync` | Checks credentials and sign-in restrictions, optionally records lockout failures, and may return a two-factor-required result instead of issuing a normal session. Handle each `SignInResult` state. |
| `SignInManager<TUser>.CheckPasswordSignInAsync` | Checks password sign-in conditions and lockout behavior without completing the ordinary cookie sign-in. It is useful for controlled workflows, not a replacement for handling the result states. |
| `SignInManager<TUser>.SignInAsync` | Issues an authenticated sign-in using the configured application scheme and principal factory. Calling it directly bypasses password verification, so only use it after an independently trusted authentication step. |
| `SignInManager<TUser>.SignOutAsync` | Signs out of the configured Identity authentication schemes by issuing the necessary sign-out behavior. Clearing one local cookie does not revoke an external provider's session or every copied token. |
| `SignInManager<TUser>.RefreshSignInAsync` | Reissues the current sign-in for the user, refreshing the principal/ticket after selected account changes while preserving applicable properties. It is not universal token revocation. |
| `SignInManager<TUser>.IsSignedIn` | Determines whether the principal has an authenticated identity for the relevant scheme. It does not check current authorization or guarantee the account remains active in the store. |
| `SignInManager<TUser>.TwoFactorAuthenticatorSignInAsync` | Completes sign-in using a time-based authenticator code, with options for remembered client and lockout handling. Enforce rate limits and protect authenticator setup/recovery. |
| `SignInManager<TUser>.TwoFactorRecoveryCodeSignInAsync` | Attempts sign-in with a one-time recovery code and consumes a successfully used code. Recovery codes should be shown once, stored safely by the user, and never logged. |
| `SignInManager<TUser>.TwoFactorSignInAsync` | Completes an Identity two-factor sign-in using a selected token provider and code. The provider name and two-factor user state must match the configured account flow. |

### Store contracts, results, and validators

| Supplied name | Meaning and use |
|---|---|
| `IUserStore<TUser>` | Core persistence contract for creating, reading, updating, and deleting users. Additional capabilities are separate interfaces so a store can support only the features it implements. |
| `IUserPasswordStore<TUser>` | Adds password-hash read/write capability to a user store. The application should store only hashes, using Identity's password-hashing abstraction rather than plaintext or reversible encryption. |
| `IUserEmailStore<TUser>` | Adds email and confirmation state operations. A store's normalization and uniqueness behavior must align with application policy and database constraints. |
| `IUserRoleStore<TUser>` | Adds role membership operations for a user. This is distinct from simply having a role claim on a principal. |
| `IUserClaimStore<TUser>` | Adds persistence operations for claims associated with users. Protect claim assignment because these claims may feed authorization. |
| `IUserAuthenticationTokenStore<TUser>` | Adds storage for authentication tokens associated with a user/provider/name tuple. This store capability is distinct from issuing an application session cookie. |
| `IRoleStore<TRole>` | Persistence contract for role creation, retrieval, update, deletion, and normalization. It is used with role-enabled Identity registration. |
| `IdentityResult` | Result object returned by many Identity operations. Its success flag and error collection should drive user-visible handling without exposing internal details unnecessarily. |
| `IdentityResult.Succeeded` | Boolean indicating that the Identity operation completed successfully according to the manager/store result. Check it before assuming state changed. |
| `IdentityResult.Errors` | Collection of `IdentityError` values explaining validation or store failures. Map carefully to safe user feedback; do not disclose sensitive account existence details by default. |
| `IdentityError` | Structured error with a code and description for an Identity operation failure. Codes are more suitable than descriptions for stable program logic. |
| `PasswordHasher<TUser>` | Default password-hash implementation used by Identity registrations. It hashes passwords with versioned formats and can request rehash on verification when policy evolves. |
| `IPasswordHasher<TUser>` | Contract for producing and verifying user password hashes. Custom implementations must use a reviewed password hashing scheme and preserve safe upgrade behavior. |
| `PasswordVerificationResult` | Result that distinguishes failed verification, successful verification, and successful verification that needs rehash. Handle the rehash case through the manager's normal update path. |
| `PasswordOptions` | Password validation settings, such as minimum length and required character categories. Composition is policy-dependent; complexity categories alone do not guarantee a strong password. |
| `LockoutOptions` | Lockout thresholds, duration, and applicability options used by sign-in flows. Consider user enumeration, denial-of-service, and recovery behavior when configuring them. |
| `SignInOptions` | Sign-in gates such as confirmation requirements and confirmed-email sign-in rules. They are account policy inputs, not delivery or verification mechanisms themselves. |
| `ClaimsIdentityOptions` | Claim-type names and identity settings used when Identity constructs principals. Align these with claim mapping and authorization expectations. |
| `SecurityStampValidatorOptions` | Controls periodic cookie principal/security-stamp validation behavior. A validation interval is a revocation-delay tradeoff, not immediate invalidation. |
| `UserValidator<TUser>` | Default manager validator for user-related rules such as username validity/uniqueness where supported. It participates in manager operations and can be replaced or extended. |
| `PasswordValidator<TUser>` | Default password-policy validator for new or changed passwords. It validates a candidate before hashing; it does not authenticate an existing password. |
| `IUserValidator<TUser>` | Extension contract for validating user records during manager operations. Custom validators should be deterministic, server-side, and consistent with store constraints. |
| `IPasswordValidator<TUser>` | Extension contract for password validation. Use it for policy checks such as disallowed values; do not store or log candidate passwords. |
| `Identity store abstraction versus EF Core store implementation` | The Identity store interfaces define capability contracts; EF Core stores are one persistence implementation. Replacing EF Core requires implementing every capability the configured managers use, including normalization, concurrency, token, role, or passkey support as applicable. |

## Cross-item comparison

`AddIdentity<TUser,TRole>` and `AddDefaultIdentity<TUser>` are higher-level compositions, while `AddIdentityCore<TUser>` is a narrower foundation that you extend deliberately. `UserManager` handles durable account operations; `SignInManager` coordinates authentication attempts and sign-in outcomes. Store interfaces express persistence capabilities, and `IdentityResult` reports whether the manager's operation succeeded. Directly changing a database row can skip normalization, validation, security-stamp, and concurrency behavior that the manager expects.

## Examples

### Configure a core user system with roles and an EF store

```csharp
builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.SignIn.RequireConfirmedEmail = true;
        options.Lockout.MaxFailedAccessAttempts = 5;
    })
    .AddRoles<IdentityRole>()
    .AddSignInManager()
    .AddDefaultTokenProviders()
    .AddEntityFrameworkStores<ApplicationDbContext>();
```

This composes user services, roles, sign-in orchestration, token providers, and EF persistence. Authentication schemes and UI/endpoints still need appropriate configuration. Confirmation policy does not deliver the email; the application must send the confirmation token through a verified channel. [Identity configuration](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration)

### Respect the result from a password change

```csharp
var result = await userManager.ChangePasswordAsync(user, currentPassword, newPassword);
if (!result.Succeeded)
{
    foreach (var error in result.Errors)
        logger.LogInformation("Password update rejected with code {Code}", error.Code);
    return Results.ValidationProblem(ToSafeValidationErrors(result.Errors));
}

await signInManager.RefreshSignInAsync(user);
```

The handler should not log password values or token contents. Whether to refresh the current session depends on the app's account policy; changing credentials and revoking all active sessions are related but not identical decisions. [Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)

## Common mistakes

- Registering core Identity but forgetting to add the sign-in manager, token providers, roles, or store needed by the chosen features.
- Treating `FindByEmailAsync` as email verification or uniqueness enforcement without store/database configuration.
- Checking a password with `UserManager` and then ignoring lockout, confirmation, or two-factor result states instead of using a complete sign-in flow.
- Setting `IdentityOptions.Password` to a complexity recipe and assuming this makes weak or reused passwords safe.
- Storing a password, raw reset token, or recovery code in logs or telemetry.
- Granting roles or authorization claims directly from user-controlled input.
- Assuming `UpdateSecurityStampAsync` immediately revokes every cookie and bearer credential on every node.
- Using a `UserManager` method on a store that lacks the corresponding capability and assuming Identity can synthesize it.

## Knowledge checks with answers

1. **Why are stores split into interfaces?** A persistence provider may support users but not every optional capability. Managers depend on the capability interfaces required for the configured workflow.
2. **Why is `PasswordSignInAsync` preferable to only `CheckPasswordAsync` for login?** It coordinates sign-in restrictions such as lockout, two-factor requirements, and issuing the configured sign-in ticket.
3. **What does a successful password check prove?** Only that the candidate matches the stored password hash. It does not by itself prove confirmation, account status, MFA completion, or authorization.
4. **When is a reset token valid?** Only for the intended user, token provider/purpose, and validity state; it must be delivered safely and consumed through the matching reset operation.
5. **Can role membership alone authorize access to a particular order?** Not necessarily. The order's ownership or other resource policy may require a resource-based check.

## Sources

- [Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [Identity configuration](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration)
- [UserManager API reference](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.identity.usermanager-1)
