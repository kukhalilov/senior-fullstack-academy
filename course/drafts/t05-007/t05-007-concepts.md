<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# password storage hashing MFA account recovery and rate limits — Core concepts and how they fit together

## Learning objectives
Explain password hashing and tuning, distinguish MFA factors and phishing resistance, trace enrollment and recovery, and design abuse controls without creating avoidable account enumeration or denial of service.

## Prerequisites
Understand authentication and HTTPS. A password verifier is stored; the original password should not be recoverable. MFA combines independent evidence, not merely two prompts from the same factor category.

## Core concepts
Password hashing is intentionally one-way and expensive. A unique random salt prevents identical passwords from producing identical stored values and defeats precomputed tables. A configurable work factor lets defenders raise the cost over time. General-purpose fast hashes are designed for speed, which helps attackers test guesses; password-specific algorithms make each guess more expensive. Encryption is reversible with a key and is therefore the wrong primitive for password verifiers. OWASP details algorithm and parameter choices in its [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

MFA combines factors from distinct categories: knowledge, possession, and inherence. A password plus a second password is not MFA. One-time codes add a possession-style factor but can be phished or relayed. Public-key authenticators bound to a relying-party origin can resist phishing more strongly. NIST SP 800-63B Rev. 4 sets requirements by Authentication Assurance Level for its covered systems, including phishing-resistant options at AAL2 and phishing-resistant public-key use at AAL3; those normative requirements are scoped to that framework, not automatically universal. [NIST guidance](https://pages.nist.gov/800-63-4/sp800-63b.html).

## Mechanisms and relationships
At sign-in, verify the password and any required factor, throttle attempts, and avoid distinct responses that reveal whether an account exists. Progressive delay can slow automation while reducing lockout denial-of-service risk; hard lockout can let attackers deny service to a victim. Recovery tokens should be unpredictable, single-use, short-lived, and bound to the intended account. Reset flows should avoid exposing whether an account exists and notify on security changes. Reauthentication before sensitive changes confirms recent control of an authenticator but does not replace authorization. OWASP [Authentication guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) covers generic responses and reauthentication.

MFA enrollment and factor replacement are high-impact operations. Require proof of an existing factor or an appropriately strong recovery process before enrolling a new one. A stolen authenticated session can otherwise be used to replace the owner's factor. Step-up authentication raises assurance for a sensitive action; risk-based authentication can adapt friction but must not silently weaken required assurance.

## Worked examples
**Database theft:** an attacker gets a salted password verifier. Unique salt prevents identical-password matching across users; a high work factor slows guesses; a pepper stored separately can add defense but creates key management and rotation dependencies.

**Password change vs reset:** an authenticated user changing a password can prove current account control; a reset user must prove control through a recovery channel. Treat these flows differently.

**Factor replacement:** an attacker who steals an active session requests a new MFA device. Requiring current factor proof or a well-protected recovery process blocks this account takeover path.

## Misconceptions and edge cases
- Salt is not secret and does not make a weak password strong; it must be unique and random.
- Pepper is not a substitute for a salt or slow hash and must be stored separately.
- MFA does not automatically resist phishing; the method matters.
- Generic messages should not make recovery unusable; preserve a clear, safe next step.
- A hard account lockout can be weaponized against targeted users.
- A password reset should consider existing sessions, refresh credentials, and recovery-channel compromise.

## Knowledge checks with answers
1. Why not SHA-256 alone? **It is fast and makes offline guessing efficient.**
2. Is password + PIN always MFA? **No; both may be knowledge factors.**
3. Why protect MFA replacement? **It can let an attacker who has a session remove the legitimate owner's protection.**
