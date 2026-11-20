<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# password storage hashing MFA account recovery and rate limits — Reference: Password lifecycle, storage, and breach defense

## Scope and version
This lesson explains the password storage and verification inventory. Algorithm recommendations should be selected and parameterized from current [OWASP Password Storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). [NIST SP 800-63B Rev. 4](https://pages.nist.gov/800-63-4/sp800-63b.html) is the 2025 digital identity guideline; requirements vary by assurance target and covered system. NIST password requirements below are scoped to verifiers and credential service providers following that publication; treat them as a clearly sourced baseline, not automatically applicable law for every product.

## How this group fits the mental model
The stored record should let the service verify a guess without revealing the password. Salts and expensive password hashing slow offline guessing; throttling addresses online guessing; reset and breach response address lifecycle events.

## Supplied names explained
- `Password verifier` — Stored value and parameters used to test a submitted password. It should be produced by a password hashing scheme and should not permit recovery of the original secret.
- `Password hashing` — A one-way transformation using a password-specific algorithm and work parameters. Unlike encryption, there is no decryption key to retrieve the password.
- `Unique random salt` — Per-password random input stored with the verifier. It prevents equal passwords from producing equal records and frustrates precomputed attacks; it is not a secret.
- `Configurable work factor` — Cost parameters that increase the time or memory required for each guess. Choose and benchmark them against production capacity, then raise them as hardware and guidance change.
- `Argon2id` — A memory-hard password hashing variant designed to balance resistance to GPU and side-channel attack classes. It is a strong default where available; choose parameters from current guidance and benchmark them.
- `scrypt` — A memory-hard password hashing function that raises the memory cost of large-scale guessing. It remains an option when supported and parameterized appropriately.
- `bcrypt` — A widely deployed adaptive password hash with a configurable cost. Account for implementation input-length limits and migration considerations; do not assume every library handles long inputs identically.
- `PBKDF2` — A password-based key derivation function using repeated pseudorandom operations. It may be selected where standards or validated module requirements call for it; use a current work factor and appropriate PRF.
- `Password pepper` — A secret value combined with password processing and stored separately from the password database. It can add defense if the database alone leaks, but compromise/loss of the pepper affects all records and needs key management.
- `Password pepper rotation` — Changing a pepper presents a migration challenge because existing verifiers may require the old pepper to verify. Version records, keep old peppers only as needed, and rehash after successful login or force reset when safe migration is impossible.
- `Fast hash SHA-256 unsuitable alone for password storage` — SHA-256 is a general-purpose fast hash, so attackers can test guesses quickly. It can be a component in carefully designed constructions, but alone it is not a password hashing scheme; use a dedicated password hash.
- `Constant-time verifier comparison` — Comparing derived verifier bytes without early exit based on matching prefix can reduce timing leakage. Prefer vetted library comparison functions; this does not compensate for poor password hashing.
- `Password length policy under NIST SP 800-63B Rev. 4` — NIST requires at least 15 characters for single-factor passwords; it permits a shorter minimum for passwords used only within MFA, but that minimum must be at least 8. It says verifiers SHOULD permit a maximum of at least 64 characters. These are requirements/recommendations in NIST's covered framework, not a universal law. Do not silently truncate a password. [NIST §3.1.1](https://pages.nist.gov/800-63-4/sp800-63b.html).
- `Unicode password handling (code points and NFC normalization)` — NIST says each Unicode code point counts as one character for length checks and recommends NFC normalization before hashing when Unicode is accepted. Document one consistent normalization policy; normalization changes the byte sequence and must be identical at enrollment and verification. [NIST §3.1.1](https://pages.nist.gov/800-63-4/sp800-63b.html).
- `Composition rules and periodic password changes under NIST SP 800-63B Rev. 4` — NIST prohibits composition rules and periodic password changes in its covered framework, while requiring a change when there is evidence of compromise. This guidance reflects the risk of predictable substitutions and unnecessary rotation; do not state it as a universal legal requirement outside that framework. [NIST §3.1.1](https://pages.nist.gov/800-63-4/sp800-63b.html).
- `Full-password verification without truncation` — NIST requires requesting and verifying the entire submitted password rather than a subset or truncated prefix. [NIST SP 800-63B Rev. 4](https://pages.nist.gov/800-63-4/sp800-63b.html).
- `Common-password blocklist` — NIST requires comparison of the full proposed password to a blocklist of commonly used, expected, or compromised secrets at creation/change, including breach corpora and context-specific values; reject a match with a reason. Compare the complete password, not substrings. [NIST §3.1.1](https://pages.nist.gov/800-63-4/sp800-63b.html).
- `Password manager support` — Allowing paste/autofill and encouraging unique generated passwords. Blocking password managers pushes users toward reuse and weaker memorized secrets.
- `Credential stuffing` — Automated reuse of credentials leaked from another service. It is distinct from guessing one user's password; monitor and throttle login patterns without exposing account existence.
- `Password spraying` — Trying a small set of common passwords across many accounts to avoid per-account lockout thresholds. Detect distributed patterns and use MFA and throttling.
- `Brute-force throttling` — Rate limiting or delaying repeated guesses. NIST requires effective limits for failed attempts in covered verifiers; its general throttling section sets an upper bound of 100 consecutive failures for applicable authenticator types, while allowing stricter limits and additional techniques. This is not a universal recommendation to allow 100 password guesses. Use account and broader signals carefully; attackers can distribute attempts and lockout itself can be abused. [NIST §3.2.2](https://pages.nist.gov/800-63-4/sp800-63b.html).
- `Generic authentication error` — A response that does not reveal whether the username, password, or account state was the cause. Keep internal logs detailed while external responses remain appropriately uniform.
- `Account enumeration` — Learning which accounts exist through response text, status, timing, or recovery behavior. Reduce distinguishable signals while preserving usable instructions.
- `Password reset token` — A credential proving access to a recovery channel and authorizing a password reset. Generate unpredictable tokens, protect delivery, and bind them to an account and purpose.
- `Single-use recovery token` — A token invalidated after successful use. Enforce single use on the server to prevent replay or concurrent duplicate reset.
- `Password reset expiry` — A bounded token lifetime limiting exposure if delivery is intercepted or delayed. Balance security with accessibility and require a new request after expiry.
- `Re-authentication for password change` — Requiring recent proof of identity before changing a password from an active session. It protects against unattended/stolen sessions and should be risk-appropriate.
- `Session invalidation after password change` — Revoking or refreshing existing sessions after credential change, especially after suspected compromise. Decide explicitly whether trusted devices persist and notify the user.
- `Compromised-password response` — Steps after credential exposure: block known compromised values, require reset or reauthentication as appropriate, invalidate sessions, monitor suspicious access, and communicate safely.

## Cross-item comparison
`Password hashing` creates a verifier; `Encryption` is reversible with a key and is not a substitute. `Argon2id`, `scrypt`, and `bcrypt` have different memory/time and compatibility tradeoffs; `PBKDF2` may be required in some validated contexts. Select based on current guidance and operational constraints rather than claiming one universal configuration. `Password reset` proves account control through recovery; an authenticated password change can additionally require current authentication. OWASP details tradeoffs in its [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

## Examples
For a new password, normalize only according to a deliberate documented policy, check a common/compromised-password list, create a random salt, compute Argon2id with benchmarked parameters, and store the algorithm/version/parameters/salt/verifier. On login, verify through the library, then rehash on successful login if the stored parameters are obsolete. Keep any pepper outside the credential database and define recovery if it rotates.

NIST SP 800-63B Rev. 4 supplies useful policy details for systems in its scope: 15 characters minimum for single-factor passwords; at least 8 if the password is used only as part of MFA; support a maximum of at least 64 characters; no composition rules or periodic changes absent evidence of compromise; accept the full password without truncation; compare the complete proposed secret to the blocklist; and, when accepting Unicode, count code points and SHOULD normalize to NFC before hashing. OWASP currently recommends Argon2id at minimum m=19 MiB, t=2, p=1 (among several tradeoff-equivalent minimum profiles); measure on the target system and assess denial-of-service/resource costs before choosing parameters. These values are guidance snapshots, not timeless universal constants. [NIST §3.1.1](https://pages.nist.gov/800-63-4/sp800-63b.html), [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

## Common mistakes
- Storing plaintext or reversible encrypted passwords.
- Using fast SHA-256 alone.
- Reusing salts or treating a salt as the secret pepper.
- Choosing work factors without measuring legitimate login capacity.
- Truncating passwords, enforcing arbitrary character mixtures, or rotating them on a calendar as a blanket policy; NIST's covered framework explicitly addresses these choices.
- Limiting password length so password managers cannot create long values.
- Sending reset links that never expire or remain reusable.
- Treating reset delivery as harmless and not invalidating sessions after compromise.

## Knowledge checks with answers
1. Is salt confidential? **No. It must be random and unique.** 2. Why use a work factor? **To make each offline guess costly.** 3. Why is pepper rotation difficult? **Stored verifiers may depend on the previous secret, which cannot always be reversed.**
