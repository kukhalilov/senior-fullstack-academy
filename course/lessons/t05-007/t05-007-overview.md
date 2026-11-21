
# password storage hashing MFA account recovery and rate limits — Big-picture orientation and mental model

## Problem and purpose
Passwords are human-chosen and often guessable. If a database leaks, storing passwords in recoverable or fast-to-guess form turns one breach into widespread account compromise. Login security also depends on additional authenticators, rate limits, recovery, and how a service responds when credentials are lost or stolen.

## Plain-language mental model
Do not store the password; store a deliberately expensive verifier made with a unique random salt. At login, process the submitted password the same way and compare verifiers. MFA asks for independent evidence in addition to the password. Recovery is another path into the account, so it needs comparable care. No single mechanism is the whole account-security system.

## How the parts fit together
Enrollment chooses a password and optional additional authenticators. Verification checks a password hash and MFA proof. Throttling slows automated guessing; generic responses reduce account discovery. Password changes and resets invalidate old authority as appropriate, notify the account owner, and require appropriate proof. [OWASP Password Storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) and [MFA guidance](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) cover these controls. [NIST SP 800-63B Revision 4](https://pages.nist.gov/800-63-4/sp800-63b.html) describes authentication assurance requirements in its government digital-identity context; do not treat every requirement as universal law.

## Concept map
- **Password verifier:** unique salt + password-specific hashing algorithm + work parameters.
- **Guessing resistance:** tune cost to service capacity; rehash old records as parameters change.
- **MFA:** knowledge, possession, and inherence are factor categories; phishing resistance varies by method.
- **Lifecycle:** reset, recovery, factor replacement, step-up, throttling, and notifications are security boundaries too.

## End-to-end walkthrough
During enrollment, the server checks the password against a blocklist, generates a random salt, and stores an Argon2id verifier with parameters. At login, it computes the verifier and compares it safely. It applies progressive throttling without making account existence easy to infer. If MFA is enrolled, it verifies the second authenticator. When the user resets a password, the service uses a single-use, expiring recovery token, invalidates existing sessions where the policy requires it, and sends a security notification. A high-impact change may require reauthentication.

## When to use it and tradeoffs
Use purpose-built password hashing, not raw SHA-256 or encryption. A stronger work factor increases attacker cost and your legitimate login cost, so benchmark and tune for the actual environment. Phishing-resistant public-key authenticators offer stronger phishing protection than replayable codes, but enrollment, devices, recovery, and user support matter. [NIST SP 800-63B Rev. 4](https://pages.nist.gov/800-63-4/sp800-63b.html) maps authenticator strength to assurance levels; its requirements depend on assurance target.

## What later lessons cover
The concepts lesson builds password and authenticator lifecycles. Two reference lessons cover password storage and MFA/recovery inventories. Practice and interview lessons apply the controls to compromise and recovery scenarios.

## Current standards notes
NIST SP 800-63B Rev. 4 provides specific password guidance in its scope: minimum 15 characters for single-factor passwords, at least 8 when the password is only used as part of MFA, and support for a maximum length of at least 64 characters. It also addresses blocklists, Unicode normalization, full-password verification, composition rules, and periodic changes. These details are introduced in the reference lesson and must not be generalized as universal law. WebAuthn Level 3 became a W3C Recommendation on 2026-08-25; platform support and passkey synchronization behavior still vary. [NIST](https://pages.nist.gov/800-63-4/sp800-63b.html) · [W3C WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/)
