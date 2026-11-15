<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

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

## Progressive hints
1. Consider per-account randomness. 2. Consider factor categories. 3. Factor replacement grants future account access. 4. Who can trigger lockout? 5. Recovery tokens are credentials.

## Complete solutions
1. The password hash likely lacks a unique random salt. Add a per-password salt using the password-hashing library; the salt need not be secret.
2. Not necessarily. Password and PIN are both knowledge factors. MFA requires independent categories such as knowledge plus possession.
3. Require current-factor proof or a strong recovery process before factor replacement, notify the user, and revoke the old factor/related sessions as appropriate. OWASP's [MFA guidance](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html) treats enrollment and reset as security-critical.
4. An attacker can intentionally lock out a victim. Use layered progressive throttling, broader abuse detection, and safe recovery rather than relying only on account lockout.
5. Make the token unpredictable, account-bound, single-use, short-lived, and invalidated after success. Avoid account enumeration in the request response; notify the user and define session invalidation after password compromise. See [OWASP Authentication guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).

## Tests and edge cases
- Two users choosing same password should have different stored salted verifiers.
- Work-factor upgrade occurs after successful verification without losing account access.
- Replayed reset token fails after first use and after expiry.
- Factor replacement from an old session requires renewed proof.
- Generic login/reset responses do not expose account existence through text or obvious timing differences.
- Recovery channel change triggers a security notification and appropriate waiting/revocation policy.

## Reflection questions
Where is the pepper stored? Which recovery path is weakest? Could an attacker lock out a target? What proof is needed to add a new authenticator?
