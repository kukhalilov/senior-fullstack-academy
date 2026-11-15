<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# password storage hashing MFA account recovery and rate limits — Reference: Authenticator types, enrollment, recovery, and abuse controls

## Scope and version
This group covers authenticator classes and recovery controls. Current practices are in the [OWASP MFA Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html); [NIST SP 800-63B Rev. 4](https://pages.nist.gov/800-63-4/sp800-63b.html) sets requirements for its assurance framework. Requirements differ by AAL and application; do not generalize them into universal law.

## How this group fits the mental model
MFA combines independent evidence, but methods vary in phishing resistance, recovery complexity, availability, and user burden. Enroll, replace, and recover factors with the same care as sign-in because each path can grant account control.

## Supplied names explained
- `Multi-factor authentication (MFA)` — Authentication requiring evidence from at least two distinct factor categories. It reduces risk from a stolen password but strength depends on factor independence and protocol.
- `Knowledge factor` — Something the user knows, such as a password. Multiple knowledge secrets do not make two-factor authentication.
- `Possession factor` — Something the user has and can prove control of, such as a cryptographic authenticator. Secure enrollment and replacement are essential.
- `Inherence factor` — A biometric characteristic used as an authentication factor. Biometric matching has privacy, false-accept/reject, and recovery limitations; systems often use it locally to unlock a device-held key.
- `Time-based one-time password (TOTP)` — A short code derived from a shared secret and time step. It can be phished or relayed in real time; protect the seed and enforce a narrow validation window with replay controls.
- `HMAC-based one-time password (HOTP)` — A code derived from a shared secret and counter. Synchronization and resynchronization need careful handling; a code remains vulnerable to phishing/relay.
- `WebAuthn` — A browser/API protocol for public-key credentials scoped to a relying-party ID and origin. The authenticator signs a server challenge; correct challenge and origin validation are essential.
- `FIDO2` — The broader standards family commonly comprising WebAuthn and CTAP for web and authenticator interactions. It enables phishing-resistant public-key authentication when correctly implemented.
- `Passkey` — A discoverable FIDO credential, often synchronized or device-bound depending on ecosystem. It can provide phishing resistance through origin binding; synchronization and account recovery still need consideration.
- `Platform authenticator` — Authenticator integrated with a device platform, such as a built-in biometric-capable secure component. User verification may unlock a private key; biometric material is not necessarily sent to the service.
- `Roaming authenticator` — External authenticator usable with multiple devices, such as a security key. Protect it physically and support safe replacement/recovery.
- `Relying-party ID (RP ID)` — Domain-scoped identifier to which a WebAuthn credential is bound. A credential for one RP ID cannot simply be replayed to a different origin; validate the expected RP ID.
- `Origin binding` — Binding browser-based public-key assertion to the expected web origin. Validate exact expected origin to prevent a malicious site from using a response.
- `Public-key credential challenge` — Fresh server-generated unpredictable value signed by the authenticator. Verify it matches the outstanding ceremony and consume it once to prevent replay.
- `User verification` — Evidence that the authenticator locally verified the user, such as PIN or biometric, when requested and supported. It differs from user presence.
- `User presence` — Evidence that the user intentionally interacted with the authenticator, such as a touch. Presence alone does not necessarily prove local identity verification.
- `Phishing-resistant authentication` — Authentication resistant to verifier impersonation because the protocol binds proof to the legitimate origin/service. Public-key origin-bound methods are stronger than codes that can be relayed.
- `SMS one-time code limitation` — SMS can be intercepted or redirected through SIM swap, number takeover, or telecom weaknesses and is not phishing-resistant. It may still be better than password-only in some contexts, but choose stronger options when available.
- `Email one-time code limitation` — Email security depends on the mailbox account and can be vulnerable to forwarding, compromise, or phishing; it may not be an independent factor if email is also the recovery channel.
- `Recovery code` — A one-time or limited-use fallback secret. Generate with sufficient entropy, display/store safely, invalidate after use, and regenerate carefully.
- `MFA enrollment proofing` — Verifying the account holder before registering an authenticator. Weak enrollment can let an attacker add their own factor after stealing only a password.
- `MFA factor replacement` — Replacing a lost or compromised factor. Require strong proof, notify the account owner, and consider revoking the old factor and sessions.
- `Step-up authentication` — Requiring stronger or fresher proof for a sensitive operation. Bind the step-up result to the action and do not treat it as permanent elevated access.
- `Risk-based authentication` — Adjusting checks based on risk signals. Signals can be noisy or manipulated; never silently bypass a required assurance policy.
- `Progressive delay` — Increasing wait time after repeated failed attempts. It slows automation while avoiding some lockout denial-of-service, but should be coordinated across accounts and infrastructure.
- `CAPTCHA tradeoff` — A challenge that can deter simple automation but creates accessibility/usability costs and can be outsourced or bypassed. It is one signal/control, not a substitute for throttling or MFA.
- `Account lockout denial-of-service risk` — Hard lockout can let an attacker intentionally block a victim's access. Prefer layered throttling, careful recovery, and monitoring appropriate to risk.
- `Recovery contact verification` — Confirming control of a recovery email/phone before relying on it. Recovery channels are high-value credentials and should be updated with notice and delay where appropriate.
- `Security notification` — Alerting the user about password, MFA, recovery, or session changes. Deliver through an established channel without including secrets; it aids detection but does not itself prevent takeover.
- `Sensitive-action reauthentication` — Requiring recent proof before high-impact actions. It limits risk from stale sessions; it must not allow a weaker recovery route to bypass the main controls.

## Cross-item comparison
`TOTP` and `HOTP` are shared-secret codes and can be phished/relayed; `Passkey/WebAuthn` uses public-key origin binding and is phishing-resistant when correctly implemented. `User presence` confirms interaction; `User verification` confirms an additional local verification action. `Progressive delay` slows guesses without the same direct victim lockout as a hard lockout. NIST requirements depend on assurance target; see [SP 800-63B Rev. 4](https://pages.nist.gov/800-63-4/sp800-63b.html) and [OWASP MFA guidance](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html).

## Examples
For WebAuthn registration, issue a fresh challenge, specify expected RP ID and allowed origins, verify the response signature and challenge, and then bind the credential to the authenticated account. For a lost device, require a separate recovery proof, notify the user, revoke the old credential and relevant sessions, and guide enrollment of a replacement. Never let a stolen session silently replace every authenticator.

## Common mistakes
- Calling two passwords MFA.
- Treating SMS/email codes as phishing-resistant.
- Confusing user presence with user verification.
- Skipping challenge freshness, RP ID, or origin validation.
- Allowing factor replacement with only a current session that may be stolen.
- Using account-wide lockout as the only abuse control.

## Knowledge checks with answers
1. What makes passkeys phishing-resistant? **Public-key proof is bound to the RP/origin.** 2. Is touch the same as user verification? **No.** 3. Why secure recovery? **It is an alternate route to account control.**
