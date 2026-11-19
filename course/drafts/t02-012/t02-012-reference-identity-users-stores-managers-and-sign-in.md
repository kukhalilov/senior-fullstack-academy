# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Reference: Identity user/role models, manager APIs, stores, password and sign-in workflows

## Scope and version

ASP.NET Core Identity separates user-facing workflows (`UserManager<TUser>`, `SignInManager<TUser>`) from persistence contracts (stores). The EF Core store is one implementation; custom stores are possible. Managers apply validators, options, token providers, and security-stamp behavior. Callers must inspect `IdentityResult`, preserve rate/lockout policy, and avoid bypassing manager workflows with direct database edits. [Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) [Identity configuration](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration)

## How this group fits the mental model

The user entity represents account data; stores persist it; managers coordinate validation and workflows; sign-in manager creates/refreshes authentication sessions. Password hashing is intentionally one-way. Confirmation/reset tokens are purpose-bound workflow credentials, not API bearer tokens. Roles and claims are identity data used later by authorization; possessing a role in the store does not make every endpoint automatically protected.

## Supplied names explained

### Models and registration

| Supplied name | Explanation |
|---|---|
| `IdentityUser` | Convenience user class with string keys and common username/email/password/security fields. |
| `IdentityUser<TKey>` | Generic user model when the application's persistent user key is not a string. |
| `IdentityRole` | Convenience role model using a string key. |
| `IdentityRole<TKey>` | Generic role model with a selectable key type. |
| `IdentityBuilder` | Fluent registration object returned by Identity setup methods. |
| `AddIdentity<TUser,TRole>` | Registers full Identity services with roles and cookie/sign-in support for the selected models. |
| `AddDefaultIdentity<TUser>` | Registers a default UI-oriented Identity setup, commonly including default token providers and cookie behavior. |
| `AddIdentityCore<TUser>` | Registers core user-management services without automatically adding the full role/UI/sign-in setup. Add needed services explicitly. |
| `IdentityBuilder.AddRoles<TRole>` | Adds role services/model type to a core Identity builder. |
| `IdentityBuilder.AddSignInManager` | Registers the sign-in manager for the configured user type. |
| `IdentityBuilder.AddDefaultTokenProviders` | Adds default providers for confirmation, reset, and other Identity token workflows. |
| `IdentityBuilder.AddEntityFrameworkStores<TContext>` | Connects Identity to EF Core persistence stores for the selected context/model. |
| `IdentityOptions` | Container for password, lockout, sign-in, user, token, store, and claim-identity policies. |
| `IdentityOptions.User` | Configures user-name/email uniqueness and allowed-character rules. |
| `IdentityOptions.Password` | Password complexity/length policy; it does not replace breached-password checks or MFA. |
| `IdentityOptions.Lockout` | Configures failed-access threshold and lockout duration/behavior. |
| `IdentityOptions.SignIn` | Configures account confirmation and sign-in requirements. |
| `IdentityOptions.ClaimsIdentity` | Configures claim types/names used when constructing the Identity principal. |
| `IdentityOptions.Stores` | Controls store-related behavior such as whether a distinct confirmed-account store is required. |
| `IdentityOptions.Tokens` | Selects named token providers for confirmation, reset, and change workflows. |

### User manager workflows

| Supplied name | Explanation |
|---|---|
| `UserManager<TUser>` | Coordinates user creation, lookup, validation, password, email/phone, roles, claims, and token workflows over stores. |
| `UserManager<TUser>.CreateAsync` | Validates and creates a user; inspect the returned `IdentityResult` rather than assuming persistence succeeded. |
| `UserManager<TUser>.UpdateAsync` | Validates and persists user changes through the store. |
| `UserManager<TUser>.DeleteAsync` | Deletes the user through the configured store and returns validation/persistence outcome. |
| `UserManager<TUser>.FindByIdAsync` | Looks up a user by the store's normalized primary key. |
| `UserManager<TUser>.FindByNameAsync` | Looks up by normalized username, not necessarily a case-sensitive raw string. |
| `UserManager<TUser>.FindByEmailAsync` | Looks up by normalized email when the store supports email. |
| `UserManager<TUser>.CheckPasswordAsync` | Verifies a password hash without creating a sign-in session or applying all sign-in/lockout workflow decisions. |
| `UserManager<TUser>.ChangePasswordAsync` | Changes a password after verifying the current password and applying validators. |
| `UserManager<TUser>.AddPasswordAsync` | Adds a password to an account that does not currently have one, subject to password validation. |
| `UserManager<TUser>.RemovePasswordAsync` | Removes the local password when supported; ensure another safe sign-in/recovery method remains. |
| `UserManager<TUser>.ResetPasswordAsync` | Resets a password using a purpose-protected reset token and configured password validators. |
| `UserManager<TUser>.GeneratePasswordResetTokenAsync` | Creates a reset token for delivery through a verified out-of-band channel. |
| `UserManager<TUser>.GenerateEmailConfirmationTokenAsync` | Creates a token used to confirm the account email address. |
| `UserManager<TUser>.ConfirmEmailAsync` | Validates the email-confirmation token and updates confirmation state. |
| `UserManager<TUser>.GenerateChangeEmailTokenAsync` | Creates a purpose-bound token for changing to a proposed email address. |
| `UserManager<TUser>.ChangeEmailAsync` | Validates the change-email token and updates the email through the manager/store. |
| `UserManager<TUser>.GenerateChangePhoneNumberTokenAsync` | Generates a verification code tied to the proposed phone number. |
| `UserManager<TUser>.ChangePhoneNumberAsync` | Confirms the phone change using the code and updates the store. |
| `UserManager<TUser>.AddToRoleAsync` | Assigns one role by its configured normalized name. |
| `UserManager<TUser>.AddToRolesAsync` | Assigns multiple roles; validate every requested role against trusted application policy. |
| `UserManager<TUser>.RemoveFromRoleAsync` | Removes a user's role assignment. |
| `UserManager<TUser>.GetRolesAsync` | Returns roles associated with the user for authorization/UI use. |
| `UserManager<TUser>.GetClaimsAsync` | Reads user claims persisted through a claims-capable store. |
| `UserManager<TUser>.AddClaimAsync` | Adds a claim to the user store; client-supplied claim names/values must not be trusted blindly. |
| `UserManager<TUser>.AddClaimsAsync` | Adds multiple claims; apply an explicit allowlist and provenance policy. |
| `UserManager<TUser>.RemoveClaimAsync` | Removes a matching user claim. |
| `UserManager<TUser>.GetUserId` | Gets the user key as a string from a principal, using the configured user-ID claim type. |
| `UserManager<TUser>.GetUserName` | Gets the configured user-name claim from a principal. |
| `UserManager<TUser>.GetEmailAsync` | Retrieves the user's stored email, if the store supports it. |
| `UserManager<TUser>.SetEmailAsync` | Updates the email field but does not by itself prove ownership; use the confirmation workflow when required. |
| `UserManager<TUser>.GetSecurityStampAsync` | Reads the stamp used to detect account credential/security changes. |
| `UserManager<TUser>.UpdateSecurityStampAsync` | Changes the stamp so validation can invalidate existing authentication state according to policy. |
| `UserManager<TUser>.GetUserAsync` | Resolves the current principal to its Identity user through the configured store; a missing or stale principal may produce no user. |
| `UserManager<TUser>.SetUserNameAsync` | Updates the username and normalized lookup value through the manager's validation/store workflow. |
| `UserManager<TUser>.GetPhoneNumberAsync` | Reads the stored phone number, if supported by the store. |
| `UserManager<TUser>.SetPhoneNumberAsync` | Changes the stored phone number. Setting a number does not establish ownership; use the verification flow before treating it as confirmed. |
| `UserManager<TUser>.GetTwoFactorEnabledAsync` | Reads the account's 2FA-enabled flag. |
| `UserManager<TUser>.SetTwoFactorEnabledAsync` | Changes the account's 2FA-enabled flag. Enabling should follow completed enrollment and verified authenticator setup, not just flip the flag. |
| `UserManager<TUser>.AccessFailedAsync` | Increments the account's failed-access counter and can lock the user when the configured threshold is reached. |
| `UserManager<TUser>.ResetAccessFailedCountAsync` | Resets the failed-access counter through the configured store. |
| `UserManager<TUser>.GetAccessFailedCountAsync` | Reads the current failed-access counter. Normal sign-in flows coordinate these operations with lockout policy; do not build a parallel password endpoint that skips them. |
| `UserManager<TUser>.IsLockedOutAsync` | Checks the store's lockout state; the result is account state, not a network-wide rate-limit decision. |
| `UserManager<TUser>.GenerateUserTokenAsync` | Generates a token for a named provider and purpose. |
| `UserManager<TUser>.VerifyUserTokenAsync` | Verifies a token for the specified provider and purpose. Purpose and provider must match; these workflow tokens are not API access tokens. |
| `UserManager<TUser>.GenerateTwoFactorTokenAsync` | Generates a configured second-factor token. |
| `UserManager<TUser>.VerifyTwoFactorTokenAsync` | Verifies a configured second-factor token. Prefer SignInManager's pending-user flow so a code cannot be detached from the login being completed. |
| `UserManager<TUser>.FindByLoginAsync` | Looks up a user by external provider/key; provider keys are issuer-scoped identifiers, not email addresses. |
| `UserManager<TUser>.GetLoginsAsync` | Lists the external provider associations linked to a user. |
| `UserManager<TUser>.AddLoginAsync` | Adds an external provider association after a fresh, authorized linking flow. |
| `UserManager<TUser>.RemoveLoginAsync` | Removes an external provider association; ensure a recovery credential remains. |
| `UserManager<TUser>.GetAuthenticationTokenAsync` | Reads a provider token via a token-capable store. Treat the value as a credential, minimize retention, and protect it at rest. |
| `UserManager<TUser>.SetAuthenticationTokenAsync` | Stores a provider token via a token-capable store; protect it at rest and retain it only as long as needed. |
| `UserManager<TUser>.RemoveAuthenticationTokenAsync` | Removes a stored provider token when it is no longer needed or must be revoked locally. |
| `UserManager<TUser>.RemoveClaimsAsync` | Removes persisted user claims through the store; authorize changes and keep claim provenance explicit. |
| `UserManager<TUser>.ReplaceClaimAsync` | Replaces a persisted user claim through the store; authorize changes and keep claim provenance explicit. |
| `UserManager<TUser>.GetUsersInRoleAsync` | Lists members of a role when the configured role store supports that operation; avoid using a large enumeration as an authorization check. |

### Sign-in, stores, and results

| Supplied name | Explanation |
|---|---|
| `SignInManager<TUser>` | Coordinates password/passkey/external/MFA sign-in and creates or refreshes the configured authentication session. |
| `SignInManager<TUser>.PasswordSignInAsync` | Checks password plus lockout, confirmation, and two-factor flow options before creating a session. |
| `SignInManager<TUser>.CheckPasswordSignInAsync` | Performs password sign-in checks without issuing the cookie/session, useful when application flow needs the result separately. |
| `SignInManager<TUser>.SignInAsync` | Creates a signed-in principal/session for a user after the application has established authentication. |
| `SignInManager<TUser>.SignOutAsync` | Signs out through configured authentication schemes and clears the local session. |
| `SignInManager<TUser>.RefreshSignInAsync` | Reissues the signed-in principal/session using current account claims and state. |
| `SignInManager<TUser>.IsSignedIn` | Determines whether the principal contains an authenticated Identity application identity. |
| `SignInManager<TUser>.TwoFactorAuthenticatorSignInAsync` | Completes the second-factor sign-in using an authenticator-generated code. |
| `SignInManager<TUser>.TwoFactorRecoveryCodeSignInAsync` | Completes sign-in with a one-time recovery code; protect and consume codes carefully. |
| `SignInManager<TUser>.TwoFactorSignInAsync` | Validates a code from a configured two-factor token provider. |
| `SignInManager<TUser>.GetTwoFactorAuthenticationUserAsync` | Retrieves the account in the pending two-factor sign-in flow; do not accept an arbitrary client-supplied user ID as a substitute. |
| `SignInManager<TUser>.ExternalLoginSignInAsync` | Completes local sign-in using a previously linked external provider/key, while applying configured lockout/confirmation behavior. |
| `IUserStore<TUser>` | Minimum persistence contract for user CRUD and normalized lookup operations. |
| `IUserPasswordStore<TUser>` | Optional store contract for password hashes. |
| `IUserEmailStore<TUser>` | Optional contract for email/confirmation state. |
| `IUserRoleStore<TUser>` | Optional contract for role membership. |
| `IUserClaimStore<TUser>` | Optional contract for user claims. |
| `IUserAuthenticationTokenStore<TUser>` | Optional store for external-provider authentication tokens; storage and encryption choices matter. |
| `IUserLoginStore<TUser>` | Optional store for provider/key associations that map external identities to local users. |
| `IUserTwoFactorStore<TUser>` | Optional contract for reading/writing whether a user has 2FA enabled. |
| `IUserLockoutStore<TUser>` | Optional contract for failed-access counts, lockout end time, and lockout enablement. |
| `IUserSecurityStampStore<TUser>` | Optional contract for a security stamp used to detect selected credential/security changes. |
| `IUserPhoneNumberStore<TUser>` | Optional contract for a phone number and its confirmation state. |
| `IUserTokenStore<TUser>` | Optional store contract for user tokens; do not confuse stored provider tokens with Identity-generated confirmation/reset tokens. |
| `RoleManager<TRole>` | Coordinates role validation, lookup, create/update/delete, and claims over an `IRoleStore<TRole>`. Role assignment still requires application authorization. |
| `RoleManager<TRole>.CreateAsync` | Validates and persists a role; inspect `IdentityResult`. |
| `RoleManager<TRole>.UpdateAsync` | Validates and persists a role update; audit permission changes. |
| `RoleManager<TRole>.DeleteAsync` | Deletes a role through the configured role store and returns the operation result. |
| `RoleManager<TRole>.AddClaimAsync` | Adds a claim to a role through a claim-capable role store. |
| `RoleManager<TRole>.GetClaimsAsync` | Retrieves claims attached to a role when the role store supports claims. |
| `RoleManager<TRole>.RemoveClaimAsync` | Removes a claim from a role when the role store supports claims. Role claims become authorization inputs only after principal construction and policy evaluation. |
| `IRoleStore<TRole>` | Persistence contract for role creation, lookup, update, and deletion. |
| `IdentityResult` | Result object indicating whether a manager operation succeeded and which errors were returned. |
| `IdentityResult.Succeeded` | Boolean success state; check it after manager operations. |
| `IdentityResult.Errors` | Collection of safe validation/store error codes and descriptions; avoid exposing internal details indiscriminately. |
| `IdentityError` | Describes an Identity validation or operation failure. |
| `PasswordHasher<TUser>` | Default password-hash implementation using versioned, salted, computationally expensive hashes; it never decrypts a password. |
| `IPasswordHasher<TUser>` | Abstraction for hashing and verifying a user's password. |
| `PasswordVerificationResult` | Distinguishes failed verification, success, and success requiring rehash with current settings. |
| `PasswordOptions` | Rules applied by the password validator, such as length and character classes. |
| `LockoutOptions` | Failure-count and lockout behavior settings. |
| `SignInOptions` | Account-confirmation requirements that affect sign-in eligibility. |
| `ClaimsIdentityOptions` | Claim names and roles used when building Identity identities. |
| `SecurityStampValidatorOptions` | Timing/behavior settings for periodically validating cookie principals against account security state. |
| `UserValidator<TUser>` | Validates user name/email rules before create/update. |
| `PasswordValidator<TUser>` | Validates password policy before setting/resetting a password. |
| `IUserValidator<TUser>` | Extensible user validation contract. |
| `IPasswordValidator<TUser>` | Extensible password validation contract. |
| `Identity store abstraction versus EF Core store implementation` | Managers depend on store interfaces; EF Core is the common implementation, but custom persistence can implement the same contracts. |

## Cross-item comparison

`UserManager` changes account data and validates workflow operations; `SignInManager` decides whether a user may sign in and issues/refreshes the session. `CheckPasswordAsync` proves a password matches but does not itself create a session or run the full sign-in workflow. `IPasswordHasher` performs hash/verify; it cannot recover the original password. Store interfaces isolate persistence, while `AddEntityFrameworkStores` supplies the EF implementation. Always inspect `IdentityResult` before reporting success.

## Examples

```csharp
var result = await userManager.CreateAsync(user, password);
if (!result.Succeeded)
{
    foreach (var error in result.Errors)
    {
        logger.LogInformation("Identity operation rejected with code {Code}", error.Code);
    }
}
```

Return user-safe validation messages through the account UI/API, but do not expose store exceptions or internal state. Password reset and confirmation tokens should be delivered through a verified channel and validated through the corresponding manager operation.

## Common mistakes

- Calling `CheckPasswordAsync` and treating it as a complete lockout/two-factor sign-in flow.
- Ignoring a failed `IdentityResult` and reporting account creation/update as successful.
- Storing or logging raw passwords, reset tokens, MFA codes, or recovery codes.
- Treating Identity password hashes as reversible encryption.
- Trusting client-selected role/claim updates without authorization and allowlisting.
- Updating email and considering it verified without confirmation when policy requires it.
- Injecting the EF Identity store directly into every workflow and bypassing manager validation.
- Assuming every custom store supports optional email, roles, claims, or authentication-token interfaces.

## Knowledge checks with answers

1. **Does `CheckPasswordAsync` issue the auth cookie?** No; use the sign-in flow when the password should establish a session.
2. **Why inspect `IdentityResult.Errors`?** Manager operations can fail validation or persistence without throwing; errors communicate the outcome.
3. **Can a password hash be converted back to the password?** No. The hasher verifies a candidate and may request rehash after successful verification.
4. **What is the store/manager boundary?** Stores persist primitive data; managers coordinate validators, tokens, and account workflows.

## Sources

[Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) · [Identity configuration](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration)
