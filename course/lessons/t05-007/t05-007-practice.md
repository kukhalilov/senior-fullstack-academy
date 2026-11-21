
# password storage hashing MFA account recovery and rate limits — Exercises and worked solutions

## Goals
Apply password-storage choices, distinguish phishing resistance, and secure reset and factor replacement flows.

## Worked example
A developer stores `SHA256(password)` and says the database is safe because SHA-256 is cryptographic. A fast hash lets an attacker test guesses rapidly. Replace it with a password-specific scheme such as Argon2id, with a unique random salt and benchmarked work parameters. Store algorithm/version data so successful logins can migrate old verifiers. OWASP discusses options in its [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

## Exercises
1. A database contains identical hashes for users who chose the same password. What design flaw does this reveal?
2. A service requires password plus PIN and calls it MFA. Is that correct?
3. An attacker steals a logged-in session and enrolls a new MFA device. What lifecycle check is missing?
4. An application locks an account after five failed attempts. Describe a denial-of-service risk and an alternative control.
5. A user resets a password with a token that can be reused for a week. Identify required changes.
6. Your product accepts Unicode passwords and checks length using JavaScript string `.length`. What standards-related edge case should you investigate?
7. A security review says “we have AAL2, so every account must use a passkey.” What does NIST actually require from covered AAL2 applications?
8. A user loses every authenticator. Compare a saved recovery code with a code sent to email, including storage and expiry considerations.

## Progressive hints
1. Consider per-account randomness. 2. Consider factor categories. 3. Factor replacement grants future account access. 4. Who can trigger lockout? 5. Recovery tokens are credentials.

## Complete solutions
1. The password hash likely lacks a unique random salt. Add a per-password salt using the password-hashing library; the salt need not be secret.
2. Not necessarily. Password and PIN are both knowledge factors. MFA requires independent categories such as knowledge plus possession.
3. Require current-factor proof or a strong recovery process before factor replacement, notify the user, and revoke the old factor/related sessions as appropriate. OWASP's [MFA guidance](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) treats enrollment and reset as security-critical.
4. An attacker can intentionally lock out a victim. Use layered progressive throttling, broader abuse detection, and safe recovery rather than relying only on account lockout.
5. Make the token unpredictable, account-bound, single-use, short-lived, and invalidated after success. Avoid account enumeration in the request response; notify the user and define session invalidation after password compromise. See [OWASP Authentication guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).
6. JavaScript string length counts UTF-16 code units, which can differ from Unicode code points. NIST Rev. 4 says each Unicode code point counts as one character for its password length rule and recommends NFC normalization before hashing when Unicode is accepted. Apply the same policy on enrollment and verification. [NIST §3.1.1](https://pages.nist.gov/800-63-4/sp800-63b.html).
7. NIST Rev. 4 says a covered AAL2 application must offer at least one phishing-resistant authentication option; it does not say all users must use a passkey for every AAL2 authentication. AAL3 has stronger requirements, including a phishing-resistant authenticator with a non-exportable key and two distinct factors. Scope this to the NIST framework.
8. NIST's saved recovery codes are generated with at least 64 bits of approved randomness, stored hashed, throttled, invalidated after use, and replaced after use. Issued codes are sent to a verified recovery address, throttled, and have channel-specific maximum lifetimes; NIST lists at most 24 hours for email. Recovery events trigger notification. These are NIST-specific rules, not universal product laws. [NIST §4.2](https://pages.nist.gov/800-63-4/sp800-63b.html).

## Tests and edge cases
- Two users choosing same password should have different stored salted verifiers.
- Work-factor upgrade occurs after successful verification without losing account access.
- Replayed reset token fails after first use and after expiry.
- Factor replacement from an old session requires renewed proof.
- Generic login/reset responses do not expose account existence through text or obvious timing differences.
- Recovery channel change triggers a security notification and appropriate waiting/revocation policy.
- Unicode passwords with supplementary-plane characters should be checked using the documented code-point policy, not silently truncated by a storage or UI layer.
- A saved recovery code fails after use and cannot be replayed; any replacement triggers the configured notification.

## Reflection questions
Where is the pepper stored? Which recovery path is weakest? Could an attacker lock out a target? What proof is needed to add a new authenticator?
