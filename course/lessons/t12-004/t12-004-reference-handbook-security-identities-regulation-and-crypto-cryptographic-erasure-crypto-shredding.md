# architecture patterns multi-region tenancy and reliability — Reference: Cryptographic erasure (crypto-shredding)

Sources: [NIST SP 800-88 Rev. 2](https://csrc.nist.gov/pubs/sp/800/88/r2/final), [NIST SP 800-88r2 FAQ](https://csrc.nist.gov/pubs/sp/800/88/r2/final), [NIST glossary: media sanitization](https://csrc.nist.gov/glossary/term/media_sanitization), [AWS KMS key deletion](https://docs.aws.amazon.com/kms/latest/developerguide/deleting-keys.html), [AWS KMS envelope encryption](https://docs.aws.amazon.com/kms/latest/developerguide/kms-cryptography.html#enveloping), [GDPR Article 17](https://eur-lex.europa.eu/eli/reg/2016/679/oj).

## Scope and version

This lesson covers cryptographic erase (CE), often called crypto-shredding, in the context of sanitizing storage and deleting application data. It uses NIST SP 800-88 Rev. 2, finalized September 2025, and the FAQ current at the review date. CE is a sanitization technique whose suitability depends on the media, encryption implementation, key lifecycle, and assurance requirements. It is not automatically equivalent to deleting a database row or satisfying every legal erasure obligation.

## How this group fits the mental model

Ordinary deletion removes a pointer or marks a row deleted; old bytes may remain in pages, replicas, logs, backups, caches, or snapshots. Crypto-shredding attempts to make encrypted data infeasible to recover by destroying all cryptographic keys needed to decrypt it. It can make large-scale deletion fast, but only if the data was protected by strong encryption before it was written and every usable copy of the relevant keys is irrecoverably removed or rendered unavailable.

## Supplied names explained

- **Cryptographic erase (CE):** sanitization by sanitizing the cryptographic keys that protect target data rather than overwriting every storage location. Under NIST SP 800-88 Rev. 2 it is evaluated as a Purge technique and requires assurance that the encryption/key-management conditions are met.
- **Crypto-shredding:** application/data architecture pattern that destroys a key or key-encryption key associated with a data subject, tenant, object, or retention unit so encrypted copies become inaccessible.
- **Data-encryption key (DEK):** encrypts the data, often locally with authenticated encryption.
- **Key-encryption key (KEK):** wraps one or more DEKs. Destroying a per-subject KEK can make many wrapped DEKs unusable, but only if no plaintext or alternate key copy survives.
- **Sanitization assurance:** NIST Rev. 2 treats assurance as both verification of the technique’s execution and validation that evidence supports the organization’s risk-based decision.

## Preconditions and limits

Before relying on CE, document and verify at least:

1. **Encryption came first:** sensitive data was never stored in plaintext on the target media before the relevant encryption key was established. Later encryption cannot erase an earlier plaintext copy or unencrypted fragments.
2. **Approved cryptography:** encryption used appropriate algorithms, key sizes, secure implementation, and random key generation. NIST SP 800-88r2 FAQ states federal use requires cryptographic modules validated to the current FIPS 140 standard; follow applicable jurisdiction/organization policy.
3. **Key scope is correct:** the destroyed key protects only the intended deletion unit, or impact to all data sharing it is acceptable. Shared keys can make selective erasure impossible.
4. **All key copies are covered:** inventory active keys, wrapped keys, replicas, backups, HSM/KMS versions, escrow/recovery material, derived keys, application caches, and disaster-recovery sites. Delete/disable paths must cover every route that could restore decryptability.
5. **No residual plaintext path:** inspect indexes, search systems, logs, analytics, exports, object previews, caches, crash dumps, and downstream consumers. Destroying a database key cannot erase those independent copies.
6. **Execution is verified:** collect evidence that the intended key material was destroyed or rendered irrecoverable and that operations completed without errors; then validate the evidence and residual risk for the data classification.

The current NIST FAQ also calls out adequate cryptographic strength (for example, at least 128-bit algorithm strength) and entropy appropriate to key length. Consult the complete current NIST text/FAQ for exact prerequisites; do not treat this summary as a compliance checklist.

## Design pattern: per-tenant wrapped DEKs

For each tenant or retention unit, generate random DEKs and encrypt data using a vetted authenticated-encryption library. Wrap each DEK under a tenant-specific KEK protected by KMS/HSM. Store ciphertext and wrapped DEK together with non-secret metadata. On read, authorize the user and tenant, unwrap the DEK through the key service, then authenticate/decrypt.

For a deletion request, first verify the requester, scope, legal holds, and retention duties. Stop new writes, delete or mark primary data for removal, remove application-visible records and indexes, destroy the tenant-specific KEK and all key backups/replicas according to the key provider’s semantics, then verify that old ciphertext is no longer decryptable. Record an audit receipt that contains identifiers and proof of process, not plaintext or recoverable key material.

Key granularity is a trade-off. A key per row maximizes selective deletion but adds metadata, KMS operations, and lifecycle burden. A key per tenant is more efficient but deleting one user may require re-encrypting shared tenant data. A shared global key makes selective crypto-erasure ineffective.

## Backups, replicas, and legal erasure

Backups may be immutable or retained for disaster recovery. A common design lets deleted data age out of backups under a documented retention window while suppressing it from restored systems using a tombstone/deletion ledger. Crypto-erasure can make retained encrypted backups unreadable only if the backup does not also contain the key or an independently decryptable copy.

A GDPR erasure right has legal conditions and exceptions, including obligations that may require retaining data; technical key destruction is one implementation measure, not the legal decision itself. Define data-owner workflows, legal hold handling, processor propagation, restore procedures, and evidence of completion with privacy/legal stakeholders.

## Example: deleting a customer export

A .NET service stores each customer export encrypted with a data key wrapped by a customer-specific KMS key. The deletion workflow removes the export from its primary bucket, search index, and active cache, then disables and later destroys key material according to approved retention policy. It scans backup catalogs and replica Regions for the key identifier and verifies that no copy remains usable. A recovery test restores an old encrypted backup and confirms the deletion ledger prevents reappearance or successful decryption. The React UI reports completion only after the defined asynchronous process reaches its verified state.

## Cross-item comparison

- **Logical deletion:** hides/removes records from normal queries but residual bytes and backups may remain.
- **Overwrite/clear:** writes over addressable data using media-appropriate methods; may be ineffective on remapped or inaccessible storage areas.
- **Physical destruction:** renders media unusable through physical means where required; it can be costly and is not appropriate for every medium or operational need.
- **Cryptographic erase:** fast for encrypted data when key prerequisites are satisfied, but dependent on complete key inventory and assurance.
- **KMS automatic rotation:** changes/retains key material for ongoing use and usually preserves decryption of old ciphertext; it does not crypto-shred old data.

## Common mistakes

- Encrypting data after the fact and assuming crypto-erase removes preexisting plaintext remnants.
- Destroying a KMS key while a backup, replica, cached plaintext DEK, or escrow copy remains.
- Using one shared key when selective deletion is a requirement.
- Treating scheduled KMS deletion as immediate irreversible destruction; a pending period may allow cancellation, and actual semantics are provider-specific.
- Assuming deletion of a primary database row removes derived data, analytics, logs, exports, and backups.
- Calling crypto-shredding a legal erasure guarantee without analyzing applicable exceptions and retention duties.
- Failing to test restores and key-provider recovery paths.
- Keeping the destroyed key in the audit record or another backup “for safety.”

## Knowledge checks with answers

1. **What must be true before CE can sanitize data?** Strong encryption and key control must have protected it before plaintext was stored, and every decryptable key copy must be covered.
2. **Does KMS key rotation erase old ciphertext?** No. KMS retains old material for decryption; rotation supports continued access, not sanitization.
3. **Why is a global data key unsuitable for per-user deletion?** Destroying it affects every user, while preserving it leaves the target user’s data decryptable.
4. **Does destroying one database key cover logs and exports?** No. Each derived copy and its keys need their own data inventory and deletion path.
5. **What does NIST assurance add?** Verify execution, then validate that the evidence and method meet the organization’s risk and policy needs.

## Examples

If the database ciphertext is wrapped by a per-tenant key but an analytics export is encrypted under a shared data-lake key, destroying the tenant key does not sanitize that export. The deletion inventory must find and handle both encryption paths.

## Practice exercise

Design crypto-erasure for a SaaS tenant’s personal data across SQL, object storage, caches, logs, analytics, replicas, and backups. Draw the key hierarchy and identify which key destruction affects only the target tenant. Include legal hold, restore, verification, and false-success cases.
