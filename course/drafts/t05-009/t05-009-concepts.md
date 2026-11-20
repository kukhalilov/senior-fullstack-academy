<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# data protection encryption signing keys secrets and rotation — Core concepts and how they fit together

## Learning objectives
Distinguish confidentiality from integrity, explain the ASP.NET Core Data Protection provider/protector model, plan shared key storage and rotation, and separate framework keys from application secrets.

## Prerequisites
Know that cryptographic operations use keys and that protected data may outlive a process or deployment. This lesson intentionally avoids direct cipher selection and low-level cryptographic APIs.

## Core concepts
Encryption provides confidentiality: only parties with appropriate decryption capability can read plaintext. Integrity protection detects modification. A MAC authenticates data using a shared secret; a digital signature allows verification with a public key and signing with a private key. A signature does not hide the payload. Authenticated encryption with associated data (AEAD) combines confidentiality and integrity for plaintext plus authenticated, unencrypted context.

ASP.NET Core Data Protection provides an API for protecting application payloads and manages keys. `IDataProtectionProvider` creates `IDataProtector` instances scoped with purpose strings. Purpose chains isolate consumers even when they share the same key ring. The application discriminator adds application-level isolation. Microsoft describes Data Protection as protection of trusted state round-tripped through an untrusted persistence mechanism in its [overview](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/introduction?view=aspnetcore-11.0).

## Mechanisms and relationships
`Protect` produces an opaque protected payload; `Unprotect` requires compatible purpose/application identity and an available key. Purpose strings must be stable, unique to the data use, and not derived from attacker input. A time-limited protector adds expiry semantics for payloads that should not live indefinitely. The format is framework-managed; consumers should not parse or modify it.

The key ring holds keys with creation, activation, and expiration times. Defaults are a 90-day lifetime and a two-day activation delay, giving replicas time to receive a new key; old non-revoked keys remain available to unprotect existing payloads. Revocation normally makes a key's payloads fail unprotection, while deleting a key makes them permanently unrecoverable. Each process caches the ring independently, so revocation in one replica is not instantly observed by all others. Persistence must survive restarts and be shared among replicas that need interoperability. Explicitly choosing a key repository disables the automatic at-rest encryption mechanism, so configure a compatible protector and repository access controls. Microsoft documents the [key management lifecycle](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/key-management?view=aspnetcore-11.0) and [configuration choices](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/overview?view=aspnetcore-11.0).

External-service credentials, signing keys, and the Data Protection key ring are different assets. A Data Protection key protects framework payloads; an API key authenticates to a service; a signing key may establish trust across systems. Use least privilege, auditing, controlled delivery, backup/recovery, and planned rotation for each. A leaked secret must be revoked at the system that honors it; restarting an app does not revoke a stolen credential. OWASP's [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) discusses lifecycle and rotation.

ASP.NET Core Secret Manager (`dotnet user-secrets`) is only a local development convenience: its values are not encrypted and it is not a production vault. Production credentials belong in a controlled secret service or deployment identity flow. See [Microsoft's secret storage guidance](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-11.0).

## Worked examples
**Confidential data:** use authenticated encryption or a reviewed platform API; a plain signature would expose content.

**Tamper-evident but public data:** use a signature or MAC as appropriate; encryption is unnecessary if readers may see the payload.

**Replicas:** two instances share the same durable key ring and application discriminator only if they must read each other's payloads. If each uses ephemeral local keys, cookies or tokens may stop working after restart/scale-out.

## Misconceptions and edge cases
- Signing is not encryption; base64 is not encryption.
- Key rotation does not mean deleting old keys immediately; old payloads may depend on them.
- Revocation is different from routine rotation and may invalidate data abruptly.
- Sharing a key ring means all authorized apps may have broad ability to unprotect compatible payloads; purpose strings help separation but are not a substitute for access control.
- A purpose string is a domain separation input, not a human password or encryption key.
- Persisting keys to a custom location can change at-rest protection behavior; verify both persistence and encryption-at-rest configuration.
- Backups of encrypted data without keys may be unrecoverable; keys without corresponding access controls expand risk.

## Knowledge checks with answers
1. Does a signature hide content? **No.** 2. Why retain old keys? **Existing payloads may still require them for unprotection.** 3. What does the application discriminator do? **Separates applications sharing a repository unless explicitly configured to interoperate.**
