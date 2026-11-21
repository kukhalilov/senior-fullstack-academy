# architecture patterns multi-region tenancy and reliability — Reference: HashiCorp Vault

Sources: [Vault architecture](https://developer.hashicorp.com/vault/docs/about-vault/how-vault-works), [leases](https://developer.hashicorp.com/vault/docs/concepts/lease), [seal/unseal](https://developer.hashicorp.com/vault/docs/concepts/seal), [KV secrets engine](https://developer.hashicorp.com/vault/docs/secrets/kv), [database secrets engine](https://developer.hashicorp.com/vault/docs/secrets/databases), [audit devices](https://developer.hashicorp.com/vault/docs/audit), [policies](https://developer.hashicorp.com/vault/docs/concepts/policies), [authentication methods](https://developer.hashicorp.com/vault/docs/auth).

## Scope and version

This is a conceptual guide to HashiCorp Vault as documented on 2026-11-20. Vault editions, licensed features, storage/seal integrations, and product behavior vary by release. Verify the current version and edition. Vault is a secrets and cryptographic operations system; it is not a replacement for application authorization or a general-purpose identity provider.

## How this group fits the mental model

Applications need credentials and cryptographic operations, but embedding long-lived secrets in source, images, or configuration spreads them to every copy and makes rotation difficult. Vault centralizes access policy and can issue short-lived dynamic credentials, maintain static secret versions, or perform cryptographic operations without exporting a key. This adds a high-value service dependency: availability, identity bootstrap, unseal/recovery, audit, and network boundaries must be designed before relying on it.

## Supplied names explained

- **Vault server/core:** authenticates requests, evaluates ACL policies, routes to secrets engines, and audits operations.
- **Storage backend:** persists encrypted Vault data. It stores ciphertext; Vault must access its key hierarchy to serve secrets.
- **Seal/unseal:** Vault starts sealed and cannot decrypt stored data until it obtains access to its root key. With the default Shamir seal, unseal key material is divided into shares and a threshold is required. Auto-unseal delegates protection to a configured KMS/HSM/trusted service; recovery keys are not equivalent to the seal mechanism and cannot decrypt the root key if that mechanism is permanently lost.
- **Authentication method:** verifies a client (for example, Kubernetes, cloud IAM, OIDC, or AppRole depending on deployment) and issues a Vault token with policies.
- **ACL policy:** capabilities such as read, create, update, delete, list, or sudo on API paths. A token receives only the policies attached through its auth flow.
- **Secrets engine:** a mounted API backend. KV stores static values; database/cloud engines can generate credentials; transit performs cryptographic operations; other engines depend on enabled plugins/configuration.
- **Lease:** metadata for dynamic secrets and service tokens, including TTL, renewability, and revocation behavior. Expiration/revocation can invalidate the credential at its target when the engine supports it.
- **Audit device:** records request/response metadata for audit. Sensitive values are HMAC-obfuscated in supported audit records rather than simply emitted in plaintext; protect and test audit storage.

## Static secrets, dynamic credentials, and Transit

**KV v1** stores one current value per key; updates overwrite previous data. **KV v2** retains configurable versions and supports check-and-set to prevent accidental overwrite, plus version-specific read/delete/destroy behavior. Version history is not a backup plan: protect, expire, and destroy old versions according to retention needs.

Dynamic engines create credentials on demand. For example, a database engine can issue a unique database username/password for a role and revoke it when its lease expires or is revoked. The target system, network, plugin, and Vault availability determine whether issuance/revocation succeeds. Consumers should renew only when allowed, acquire replacements before expiry, and handle a failed renewal without silently sharing credentials.

Transit exposes cryptographic operations through Vault without requiring the application to read raw key material. Depending on key type and operation, Vault can encrypt/decrypt, sign/verify, hash, or perform other supported operations. Transit is not a substitute for choosing sound cryptographic protocols, controlling input/output, or maintaining key lifecycle and backup policy.

## Request lifecycle and policy

1. A client authenticates using a configured auth method. The method maps verified identity/claims to a Vault token and policy set.
2. The client sends a request to a mounted engine path. Vault checks token capabilities and path/operation permissions.
3. The engine reads or creates the secret/credential or performs the cryptographic operation; audit devices record configured events.
4. For dynamic output, Vault returns lease metadata. The client tracks TTL, renews if supported, or obtains a replacement; expiration is not a substitute for checking the target system’s actual revocation semantics.
5. On incident or access removal, revoke tokens/leases, remove the principal’s access, rotate affected target credentials, and inspect audit logs. Not all secret engines can undo already copied plaintext.

Use narrow path policies and short-lived identity. Avoid broad `*` capabilities, root tokens in applications, and sharing one token across unrelated services. Vault policies grant capability on Vault paths; the database/cloud credential generated may have a different permission scope configured in its role.

## Example: .NET API using database credentials

A .NET service authenticates to Vault using its platform workload identity. It can read only the database role endpoint for its environment. Vault issues a short-lived database credential constrained to the application’s required schema operations. The service opens a connection pool, schedules credential refresh before lease expiry, and safely drains/recreates connections when credentials rotate. A separate migration job uses a more privileged role and identity.

For failure handling, the service sets explicit timeouts and a bounded retry policy. If Vault is unavailable, it does not log secrets or fall back to a broad static credential hidden in configuration. The platform team monitors issuance failures and lease expiry, and rehearses Vault storage restore and seal-mechanism recovery.

## Availability, sealing, audit, and recovery

- An unsealed Vault node can serve requests; a sealed node can access physical storage but cannot decrypt stored Vault data. Multi-node clusters must meet their storage/quorum and unseal requirements.
- Shamir unseal shares and auto-unseal each create different operator and dependency risks. Protect shares/recovery material separately. Auto-unseal creates a lifecycle dependency on the KMS/HSM/service; deletion or unavailability can make a cluster unrecoverable or unavailable.
- Configure multiple audit devices where required. Vault requires at least one audit device to successfully log an operation; behavior during audit-device failure can affect availability. Test failure scenarios and protect logs from tampering.
- Back up and restore storage together with the seal configuration and necessary key-access path. A ciphertext backup alone is not sufficient if the seal mechanism is gone.
- Use namespaces/tenancy features only where supported by the edition, and do not assume they remove the need for policy review and separate administrative controls.

## Cross-item comparison

- **Vault vs AWS Secrets Manager:** Vault offers a broad secrets-engine/plugin and cryptographic API ecosystem with self-managed or vendor-operated deployments; Secrets Manager is AWS-managed and integrates with AWS IAM and rotation workflows. Compare cloud portability, operational responsibility, dynamic credential support, compliance, and failure dependencies.
- **Static secret store vs dynamic secrets:** static stores preserve a value and require rotation orchestration; dynamic engines issue scoped, leased credentials and need reliable issuance/renewal/revocation integration.
- **Transit vs KMS:** both can keep key operations behind an API. Vault Transit integrates with Vault auth/policies and engines; cloud KMS integrates with cloud IAM/services and has provider-specific key policies, grants, and regional behavior. Neither automatically encrypts application data correctly without a protocol/design.
- **Vault token vs application user session:** Vault tokens authorize a client to Vault API paths; they are not end-user identity tokens for your application.

## Common mistakes

- Treating KV version history as encrypted backup/retention without limits.
- Assuming every dynamic lease automatically revokes a target credential in the same way.
- Embedding long-lived Vault tokens or root tokens in application images/configuration.
- Logging plaintext secrets or returning them to broad application layers.
- Choosing auto-unseal without preserving the external key/service lifecycle and disaster recovery plan.
- Treating a successful Vault policy check as authorization for a user’s business action.
- Failing open to stale credentials when Vault is unavailable without an explicit risk boundary.
- Assuming audit logs can be disabled or allowed to fail without impacting requests.

## Knowledge checks with answers

1. **What is the key difference between KV and a dynamic secrets engine?** KV returns stored values; dynamic engines can create leased credentials in a target system.
2. **Does Vault lease expiry always guarantee immediate target-side revocation?** No; the engine and target integration define revocation behavior, and consumers should verify it.
3. **What is the difference between unseal and recovery keys with auto-unseal?** Auto-unseal uses the external seal mechanism to decrypt the root key; recovery keys authorize certain operations but cannot replace a permanently lost seal mechanism.
4. **Why can audit-device failure affect availability?** Vault requires successful audit logging for operations; configure and test the operational behavior rather than assuming requests continue.
5. **Should a .NET application use one Vault root token?** No. Authenticate workload identity and grant a narrow path policy.

## Examples

When a database credential’s lease has two minutes remaining, the service requests a replacement, validates a new connection, swaps the pool, and only then retires old connections. If renewal fails, it alerts and follows a bounded outage policy; it neither writes the password to logs nor silently promotes an unrestricted fallback credential.

## Practice exercise

Design Vault access for an API and a schema-migration job. Define auth methods, path policies, database role grants, lease TTL/renewal, audit delivery, auto-unseal dependency, backup/restore steps, and behavior during Vault/network/audit failure. Mark every place plaintext can exist.
