<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# data protection encryption signing keys secrets and rotation — Reference: ASP.NET Core key management, storage, rotation, and secret operations

## Scope and version
This lesson covers the assigned ASP.NET Core 11 configuration and operational names. See Microsoft's [configuration overview](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/overview?view=aspnetcore-11.0), [key management](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/key-management?view=aspnetcore-11.0), and OWASP [Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html). Provider details vary by deployment.

## How this group fits the mental model
The key ring is durable cryptographic history. It must be protected, shared by intended replicas, and backed up. Rotation introduces keys for future payloads while retaining older keys as needed. Application secrets are delivered and revoked through their own lifecycle.

## Supplied names explained
- `ASP.NET Core Data Protection key ring` — Repository of Data Protection keys and metadata used to protect/unprotect application payloads. Protect repository access and plan persistence, encryption at rest, sharing, and recovery.
- `Key lifetime` — Intended active/usable period for a generated key before another becomes active. Expiration for new protection does not automatically mean old keys are immediately deleted or unusable for unprotect.
- `Key activation date` — Time when a key becomes eligible for new protection operations under the key management system.
- `Key expiration date` — Time after which a key should not be used for new protection under normal policy; it may remain necessary to unprotect older payloads.
- `Default Data Protection key lifetime (90 days; minimum configurable lifetime 7 days)` — Default lifetime is 90 days and the configured default cannot be shorter than seven days. This is framework key policy, not a recommendation for application credentials.
- `Default key activation delay (2 days) and rolling` — New keys normally activate two days after creation to propagate to replicas; they normally expire 90 days after creation. Automatic rolling creates the next key near expiry. If all keys are expired, a new key can activate immediately.
- `Key revocation` — Marks a key untrusted, stops it being selected for new protection and, by default, makes its payloads fail unprotection. Explicit override is possible for exceptional recovery; revocation differs from deletion.
- `IKeyManager.GetAllKeys` — Reads key metadata for operations and diagnostics; protect the output.
- `IKeyManager.CreateNewKey` — Explicitly creates a key with activation and expiration dates. Use rarely because automatic rolling is normally sufficient.
- `SetDefaultKeyLifetime` — Sets the lifetime of subsequently generated Data Protection keys. The system default is 90 days and the minimum accepted configured lifetime is seven days; existing persisted keys are immutable.
- `IKeyManager.RevokeKey` — Revokes one key with a reason; assess dependent cookies and payloads first.
- `IKeyManager.RevokeAllKeys` — Revokes keys created before a cutoff with a reason. This broad operation can invalidate substantial application state.
- `IKeyManager.GetCacheExpirationToken` — Signals expiration of the local process key-ring cache; it does not broadcast an immediate refresh to all replicas.
- `Key-ring cache refresh and cross-replica revocation delay` — Processes cache independently, refreshing about every 24 hours or when the default key expires. A mutation invalidates the writer's cache only; peers can temporarily use a revoked key. For urgent revocation, make every instance reload (for example, coordinated restart) and verify completion.
- `Key immutability after persistence` — Persisted key dates, algorithm, and at-rest protection metadata cannot be edited. Configuration changes affect later keys, not existing ones.
- `Key-ring persistence` — Saving keys to durable storage so application restarts/deployments can continue to read protected payloads. Persistence and access protection are separate concerns.
- `PersistKeysToFileSystem` — Data Protection configuration API selecting a filesystem directory for key persistence. Ensure it is durable, secured, shared if required, backed up, and protected at rest.
- `PersistKeysToDbContext` — Configuration API using the Data Protection Entity Framework Core integration to persist keys in a database context. It requires the package/schema/context setup and database availability.
- `PersistKeysToAzureBlobStorage` — Configuration API for persisting the key ring in Azure Blob Storage. Configure the storage client/identity and permissions narrowly; exact overloads depend on package version.
- `PersistKeysToRedis` — Redis persistence extension; durability, backups, access control, and package/API version are separate deployment responsibilities.
- `PersistKeysToRegistry (Windows)` — Windows registry persistence provider; ACL the location to the intended identity and account for its platform constraint.
- `ProtectKeysWithAzureKeyVault` — Configures Key Vault to encrypt persisted Data Protection keys at rest. It does not persist the ring; configure a separate repository such as Blob Storage.
- `UnprotectKeysWithAnyCertificate` — Allows configured certificates to decrypt key-ring entries during certificate rollover. Retain old private keys while entries still depend on them.
- `ProtectKeysWith* key-encryption extension family` — Includes certificate, Azure Key Vault, DPAPI, and DPAPI-NG integrations where supported. Explicit persistence disables automatic at-rest encryption discovery; set a compatible protector explicitly.
- `ProtectKeysWithCertificate` — Configuration API to encrypt key-ring material at rest using an X.509 certificate. Protect certificate private-key access and plan certificate rollover/unprotection compatibility.
- `ProtectKeysWithDpapi` — Windows Data Protection API integration for protecting keys at rest on Windows. Its machine/user scope and platform dependency affect whether replicas can share keys.
- `ProtectKeysWithDpapiNG` — Windows DPAPI-NG integration for protecting key material under Windows domain/group principals. Use only where the OS/domain environment and intended principals support it.
- `SetApplicationName` — Sets a common application discriminator so compatible apps can share protected payloads when they also share keys and compatible Data Protection behavior. Only trusted apps should share it.
- `DisableAutomaticKeyGeneration` — Prevents an instance from generating new keys, useful for read-only/secondary roles. Ensure another healthy instance remains responsible for key creation and the ring has an active key.
- `Key encryption at rest` — Protecting persisted key material from storage-only disclosure. It does not prevent a compromised app identity with unprotect access from using keys.
- `Shared key ring across replicas` — Common durable repository for instances that need to read each other's cookies/payloads. It expands trust among those instances and requires compatible application discriminator/purpose and access controls.
- `Container ephemeral filesystem risk` — Container-local key files may disappear on replacement or differ per replica, making old protected data unreadable and causing cookie/logouts or token failures. Persist and share the ring intentionally.
- `Secret manager` — Controlled system for storing, delivering, auditing, and rotating credentials/keys. It should provide fine-grained access and recovery operations; it is not automatically a key ring.
- `ASP.NET Core Secret Manager and user-secrets development-only boundary` — User Secrets stores local development values outside the project tree but does not encrypt them; it is not a trusted production store.
- `dotnet user-secrets init, set, list, remove, clear` — CLI commands initialize the project identifier and manage development entries. `list` prints secret values, so do not expose terminal output.
- `UserSecretsId and AddUserSecrets` — The project `UserSecretsId` selects the local file; `AddUserSecrets` adds it to configuration. Load it for development only; repository separation is not encryption.
- `Environment-variable secret injection` — Supplying a secret through process environment. It avoids committing the value to source but may expose it through process inspection, diagnostics, dumps, or deployment configuration; restrict and rotate it.
- `Cloud secret manager` — Provider service that stores and grants access to secrets using workload identity/policies. Configure least privilege, availability, audit, and recovery.
- `Secret rotation` — Replacing a credential and ensuring consumers/backends transition to the new value; revoke the old credential after overlap is complete. Rotation without revocation leaves stolen copies usable.
- `Signing-key rotation` — Introducing new signing keys while verifiers learn/accept appropriate old keys during a bounded transition. Publish trusted key sets and preserve validation for still-valid artifacts.
- `Key rollover overlap` — Period when old keys remain available for verification/decryption and new keys are used for new outputs. Bound overlap to artifact lifetime and incident constraints.
- `Key backup and restore` — Recovering the key ring from protected backups and verifying that restored keys can read necessary data. A backup without compatible application identity/purpose and access to encrypted-at-rest key protector may be useless.
- `Key access audit` — Recording who/what accessed key storage and configuration changes. Logs should be protected and should not expose secret values.
- `Compromised-key revocation` — Revoking a suspected-exposed key and assessing all payloads/signatures it protected. Rotate/reissue affected credentials, contain access, and accept possible invalidation of old data.
- `Secret scanning` — Detecting likely credentials in source, history, artifacts, and logs. Removing a secret from the current file does not revoke copies; rotate it at the issuing service.
- `IDataProtectionBuilder` — Fluent configuration surface returned when registering Data Protection, with extension methods for persistence, key protection, application name, and related settings. Available extensions depend on referenced provider packages.
- `AddDataProtection returning IDataProtectionBuilder` — Registers Data Protection and returns the fluent builder for configuration.
- `IDataProtectionBuilder.UseCryptographicAlgorithms` — Selects supported algorithms for newly generated keys; existing persisted keys retain their original algorithm metadata.
- `IDataProtectionBuilder extension and provider package boundaries` — Blob, Redis, EF Core, and Key Vault extensions come from provider packages and their overloads vary. Check the referenced package documentation for the installed release.

## Cross-item comparison
`Key rotation` is routine transition to newer material while older keys may still decrypt; `Key revocation` distrusts a key and may make existing payloads unreadable. An ephemeral local ring is simple but breaks continuity across restarts/replicas; a persistent shared ring supports continuity while enlarging trust scope. A Data Protection key protects framework payloads; an application secret authenticates to a separate service. Microsoft explains these lifecycle distinctions in its [key management docs](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/key-management?view=aspnetcore-11.0); OWASP discusses secret lifecycle in its [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

## Examples
For two web replicas, persist the key ring to shared durable storage, configure the same intended application name, grant only the app identity access, encrypt keys at rest as appropriate, and test restart/scale-out. Back up the ring and certificate/private key needed to unprotect it. For an API credential, use a secret manager and a separate rotation plan; changing Data Protection keys does not rotate that external credential.

## Common mistakes
- Storing key files in an ephemeral container layer.
- Sharing a key ring across unrelated apps without a purpose/trust design.
- Assuming persistence automatically encrypts keys at rest.
- Deleting old keys during rotation before protected tickets/tokens expire.
- Revoking keys without assessing impact on cookies and other payloads.
- Treating secret scanning as remediation instead of revoking exposed credentials.
- Assuming exact extension overloads are identical across provider package versions.

## Knowledge checks with answers
1. Why share a key ring? **Replicas must unprotect values created by one another.** 2. What does rotation preserve? **Old key availability for existing payloads during the transition.** 3. Does deleting a leaked value from Git revoke it? **No; rotate/revoke it at the service that accepts it.**
