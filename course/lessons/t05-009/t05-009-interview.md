
# data protection encryption signing keys secrets and rotation — Interview questions and reasoning

## Core questions
1. Distinguish encryption, MAC, and signature.
2. Why does ASP.NET Core Data Protection need a persistent shared key ring?
3. Compare key rotation and key revocation.

## Concise interview answers
1. Encryption provides confidentiality; a MAC uses a shared secret for integrity/authentication; a signature uses private/public keys for signing/verification. MACs and signatures do not hide content.
2. Replicas and restarts must access compatible keys to unprotect existing payloads such as authentication cookies. Use a durable repository, consistent intended application discriminator, and appropriate at-rest protection. See [Microsoft Data Protection guidance](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/overview?view=aspnetcore-11.0).
3. Rotation introduces new keys while old keys may still read prior payloads; revocation distrusts a key and can make those payloads unreadable. See [key management documentation](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/key-management?view=aspnetcore-11.0).

## Deep follow-up answers
**What does purpose isolation do?** Data Protection derives context from an ordered purpose chain and application discriminator, preventing accidental cross-use between components sharing root keys. It is not a substitute for storage ACLs or isolation from a malicious app with key access.

**What happens if a container restarts with ephemeral keys?** It may no longer validate cookies or other values created before restart; replicas with different rings cannot understand each other's payloads. Persist and share the ring only among intended instances.

**How do you respond to a leaked application secret?** Revoke/rotate it at the consuming service, identify systems and data affected, update clients, audit use, and check source history/artifacts/logs. Removing the file does not revoke copies. OWASP discusses the secret lifecycle in its [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

## Scenario questions
- Users are logged out during a rolling deployment: inspect ring persistence, replica sharing, application discriminator, and key protection certificate availability.
- Old encrypted values become unreadable after rotation: check premature key deletion, revocation, purpose mismatch, application name, and backup restore.
- A team wants apps to share cookies: require explicit trust, identical compatible key access, matching discriminator, purpose, and ticket configuration; sharing increases compromise scope.

## Tradeoffs and alternatives
Central shared key storage improves continuity and revocation coordination but becomes a sensitive dependency. Local ephemeral keys isolate instances but fail continuity. A secret manager offers controlled delivery/audit for external credentials, while Data Protection manages framework payload keys. These systems should not be conflated. Microsoft Data Protection is intended for common web payload scenarios, not indefinite arbitrary archival encryption; see [the overview](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/introduction?view=aspnetcore-11.0).

## Common weak answers
- “Signing encrypts the data.” It does not.
- “We rotated so we deleted every old key.” Old payloads may still need those keys.
- “All apps in the cluster should share the same key ring.” Only intended trusted peers should.
- “The key ring is durable, so it is safe.” Durability does not imply encryption at rest or access control.

## Self-check rubric
You can identify confidentiality versus integrity goals, explain purpose/application separation, design persistence and access control for replicas, and account for old payloads during rotation, revocation, backup, and recovery.
