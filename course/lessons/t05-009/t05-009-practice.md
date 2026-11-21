
# data protection encryption signing keys secrets and rotation — Exercises and worked solutions

## Goals
Choose a protection primitive, reason about application discriminator and key sharing, and plan safe rotation/recovery.

## Worked example
Two replicas issue cookies, but users are logged out whenever load balancing sends them to a different instance. Each container has its own ephemeral Data Protection keys. Persist and share the key ring among intended replicas, configure matching application identity, and protect repository access. Microsoft describes deployment configuration in [Data Protection configuration](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/overview?view=aspnetcore-11.0).

## Exercises
1. A team signs a public JSON payload and assumes the data is hidden. What property is missing?
2. An app changes its key repository but omits key encryption at rest. What should be reviewed?
3. A new key is generated and operators immediately delete all old keys. What can break?
4. Two unrelated apps share a key ring and application name. Explain the risk.
5. An API key is accidentally committed to a public repository and later deleted. What response remains necessary?

## Progressive hints
1. Integrity differs from confidentiality. 2. Persistence does not equal encryption. 3. Existing cookies/payloads may depend on old keys. 4. Shared keys enlarge mutual trust. 5. Git history is not the credential authority.

## Complete solutions
1. A signature provides integrity/authenticity, not confidentiality. Use reviewed authenticated encryption if readers must not see the payload.
2. Verify key files/records have appropriate ACLs and are encrypted at rest using an appropriate mechanism. Microsoft notes custom persistence may require explicit key encryption configuration in its [configuration documentation](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/overview?view=aspnetcore-11.0).
3. Existing cookies, antiforgery values, or other protected payloads may no longer be unprotectable. Retain old keys through their required lifetime; revoke only when a compromise/risk decision justifies invalidation.
4. Either app that can access the ring and uses a compatible purpose/discriminator may be able to unprotect payloads. Share only among intended trusted apps, use purpose separation, restrict repository access, and do not set a common application name casually.
5. Revoke/rotate the key at the issuing service, audit access, assess downstream use, update consumers, and scan history/artifacts/logs. Deleting the current copy does not invalidate exposed credentials. See [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

## Tests and edge cases
- New replica can unprotect a payload from another replica.
- Restarted container can unprotect a payload issued before restart.
- Unintended application with a different discriminator cannot unprotect data.
- Old key remains available through the expected payload lifetime.
- Revoked key behavior is tested against cookies and any other protected state.
- Backup restore includes key encryption certificate/private key access and compatible app identity.

## Reflection questions
Which keys are shared among apps? What data becomes unreadable on revocation? Which backup restores both the ring and at-rest protector? How are external credentials rotated independently?
