<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# password storage hashing MFA account recovery and rate limits — Interview questions and reasoning

## Core questions
1. Why use password-specific hashing?
2. Compare TOTP and passkeys for phishing resistance.
3. Why is account recovery part of authentication security?

## Concise interview answers
1. Human passwords have low entropy; slow password hashes with unique salts make offline guesses more expensive than fast general-purpose hashes. Current parameter choices should follow [OWASP Password Storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
2. TOTP codes are shared-secret outputs and can be phished or relayed. Passkeys use public-key credentials bound to a relying-party origin, making them phishing-resistant when correctly implemented.
3. Recovery is an alternate path into an account. If weaker than normal login, attackers bypass the main controls by taking over the recovery channel or factor replacement flow.

## Deep follow-up answers
**What does a salt do?** A unique random salt ensures the same password produces different stored verifiers and defeats precomputed lookup tables. It is stored with the verifier and need not be secret. A pepper is a separate secret stored outside the credential database and creates its own rotation/key-management concerns.

**Why not lock accounts permanently after failed logins?** An attacker could intentionally deny service to a victim. Layered throttling, progressive delay, detection, MFA, and a secure recovery path can reduce guessing while limiting lockout abuse.

**How should factor replacement work?** Require strong proof of current control or recovery, notify the account owner, invalidate the lost factor, consider session revocation, and bind the replacement to the correct account. Avoid letting an active but possibly stolen session replace all defenses.

## Scenario questions
- A user changes their password after suspected compromise. Which sessions or refresh credentials need revocation, and how is the user notified?
- A compliance team cites NIST AAL2. Explain why requirements must be interpreted within SP 800-63B's assurance context rather than generalized to every application.
- A service wants SMS because it is easy to use. Explain its limitations and how to offer stronger choices without excluding users who need recovery.

## Tradeoffs and alternatives
Argon2id is memory-hard and a strong option where supported; scrypt, bcrypt, or PBKDF2 may fit compatibility or validated-module requirements with appropriate parameters. A higher cost strengthens offline resistance but consumes login resources. TOTP is broadly supported but phishable; origin-bound public-key credentials resist phishing but require device and recovery planning. NIST SP 800-63B Rev. 4 assigns controls by assurance level; see [the current publication](https://pages.nist.gov/800-63-4/sp800-63b.html).

## Common weak answers
- “SHA-256 is secure, so it is fine for passwords.” It is fast and not a password hash by itself.
- “SMS is MFA, so it stops phishing.” A code can be relayed and phone numbers can be taken over.
- “Recovery is just support.” Recovery changes account authority and needs strong proof.
- “Lockout prevents brute force.” It can also be weaponized to deny service.

## Self-check rubric
You can distinguish hash, salt, pepper, and encryption; explain authenticator factors and phishing resistance; describe reset and MFA replacement protections; and balance abuse throttling with denial-of-service and account-enumeration risks.
