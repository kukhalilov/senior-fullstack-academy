
# password storage hashing MFA account recovery and rate limits — Reference: Authenticator types, enrollment, recovery, and abuse controls

## Scope and version
This group covers authenticator classes and recovery controls. Current practices are in the [OWASP MFA Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html); [NIST SP 800-63B Rev. 4](https://pages.nist.gov/800-63-4/sp800-63b.html) sets requirements for its assurance framework. Requirements differ by AAL and application; do not generalize them into universal law. [WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/) became a W3C Recommendation on 2026-08-25, succeeding Level 2. This specification status does not imply that every browser, platform, or authenticator supports every feature.

## How this group fits the mental model
MFA combines independent evidence, but methods vary in phishing resistance, recovery complexity, availability, and user burden. Enroll, replace, and recover factors with the same care as sign-in because each path can grant account control.

## Supplied names explained
- `Multi-factor authentication (MFA)` — Authentication requiring evidence from at least two distinct factor categories. It reduces risk from a stolen password but strength depends on factor independence and protocol.
- `Knowledge factor` — Something the user knows, such as a password. Multiple knowledge secrets do not make two-factor authentication.
- `Possession factor` — Something the user has and can prove control of, such as a cryptographic authenticator. Secure enrollment and replacement are essential.
- `Inherence factor` — A biometric characteristic used as an authentication factor. Biometric matching has privacy, false-accept/reject, and recovery limitations; systems often use it locally to unlock a device-held key.
- `Time-based one-time password (TOTP)` — A short code derived from a shared secret and time step. It can be phished or relayed in real time; protect the seed and enforce a narrow validation window with replay controls.
- `HMAC-based one-time password (HOTP)` — A code derived from a shared secret and counter. Synchronization and resynchronization need careful handling; a code remains vulnerable to phishing/relay.
- `Web Authentication Level 3 (W3C Recommendation, 2026)` — This specification became a W3C Recommendation on 2026-08-25 and succeeds Level 2 (2021). That is the current standards status; it does not mean all browsers, platforms, or authenticators support every feature. [W3C WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/).
- `WebAuthn` — A W3C web API and protocol model for scoped public-key credentials. Registration (`navigator.credentials.create()`) and authentication (`navigator.credentials.get()`) are server-coordinated ceremonies: the server creates fresh options/challenge, the browser mediates the authenticator, and the server verifies the returned client data, challenge, origin, RP ID hash, flags, credential and signature. A client-side “success” alone is not authentication. [WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/) is the current W3C Recommendation (2026-08-25); Level 2 (2021) was its predecessor.
- `FIDO2` — An ecosystem commonly described as WebAuthn plus CTAP, which enables communication between clients and external/platform authenticators. These specifications are related but distinct; WebAuthn defines the web-facing API and relying-party ceremony, while CTAP supports client-to-authenticator communication. Do not treat the term FIDO2 as a single Web API.
- `Passkey` — A user-facing credential experience based on FIDO public-key credentials; discoverable credentials enable username-less account selection. Depending on platform and provider it may be synced across devices or device-bound. It is not synonymous with “biometric”: local user verification can use a PIN or biometric. Origin binding resists phishing; sync ecosystems and account recovery still need planning. The Credential Manager API is a separate platform integration surface and support varies.
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
- `Saved recovery code versus issued code` — NIST describes saved codes retained offline and issued codes delivered to a verified recovery address as distinct methods. In its framework, saved codes contain at least 64 bits of approved randomness, are stored hashed, throttled, invalidated after use, and replaced after use. Issued codes are throttled and have channel-specific maximum lifetimes (10 minutes by SMS/voice, 24 hours by email; postal limits differ). These precise values are NIST requirements in scope, not general product defaults. [NIST §4.2.1](https://pages.nist.gov/800-63-4/sp800-63b.html).
- `Recovery assurance` — NIST requires a recovery notification after recovery and recognizes saved codes, issued codes, recovery contacts, and repeated identity proofing. Its AAL2 recovery rules require either two codes from different methods, one code plus a bound single-factor authenticator, or repeated identity proofing when available; AAL3 recovery has additional scope conditions. Recovery is therefore a designed protocol, not simply “email a reset link.” [NIST §4.2](https://pages.nist.gov/800-63-4/sp800-63b.html).
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

NIST specifies at AAL2 that covered applications must offer at least one phishing-resistant option; the user need not necessarily use it for every transaction solely because the application is assessed at AAL2. At AAL3, a phishing-resistant authenticator with a non-exportable authentication key and two distinct factors is required. This is a framework-specific distinction, not a universal requirement for all apps. [NIST §2 and §3.2.5](https://pages.nist.gov/800-63-4/sp800-63b.html).

## Examples
For WebAuthn registration, issue a fresh challenge, specify expected RP ID and allowed origins, verify the response signature and challenge, and then bind the credential to the authenticated account. For a lost device, require a separate recovery proof, notify the user, revoke the old credential and relevant sessions, and guide enrollment of a replacement. Never let a stolen session silently replace every authenticator.

In a NIST-aligned AAL2 recovery design, an example valid route is a saved recovery code plus a still-bound single-factor authenticator; another is two codes obtained through different supported methods. Store saved codes as one-way hashes, consume each once, and issue a replacement with notification. Choose these combinations only when the service is actually applying NIST's requirements; otherwise set recovery assurance from the product's risk model and explain why it is comparable to normal sign-in.

## Common mistakes
- Calling two passwords MFA.
- Treating SMS/email codes as phishing-resistant.
- Confusing user presence with user verification.
- Skipping challenge freshness, RP ID, or origin validation.
- Allowing factor replacement with only a current session that may be stolen.
- Using account-wide lockout as the only abuse control.
- Calling every passkey biometric or assuming all passkeys synchronize in the same way.
- Confusing WebAuthn with CTAP/FIDO2 terminology or trusting browser-returned assertions without server-side ceremony validation.
- Reusing a consumed recovery code or storing saved recovery codes in plaintext.

## Knowledge checks with answers
1. What makes passkeys phishing-resistant? **Public-key proof is bound to the RP/origin.** 2. Is touch the same as user verification? **No.** 3. Why secure recovery? **It is an alternate route to account control.**
