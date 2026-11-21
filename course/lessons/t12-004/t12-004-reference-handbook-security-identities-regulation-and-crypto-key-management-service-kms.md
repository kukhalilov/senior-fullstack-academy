# architecture patterns multi-region tenancy and reliability — Reference: Key Management Service (KMS)

Sources: [AWS KMS Developer Guide](https://docs.aws.amazon.com/kms/latest/developerguide/), [KMS key concepts](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html), [envelope encryption](https://docs.aws.amazon.com/kms/latest/developerguide/kms-cryptography.html#enveloping), [key policies](https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html), [grants](https://docs.aws.amazon.com/kms/latest/developerguide/grants.html), [key rotation](https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html), [multi-Region keys](https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html), [key deletion](https://docs.aws.amazon.com/kms/latest/developerguide/deleting-keys.html).

## Scope and version

This lesson covers AWS Key Management Service (AWS KMS), its keys, authorization, envelope encryption, rotation, and multi-Region behavior as documented on 2026-11-20. Algorithms, quotas, service integrations, and rotation eligibility vary by key type and Region. Check the live Developer Guide for the actual use case. KMS is not a general-purpose database for application secrets and does not automatically encrypt arbitrary application data.

## How this group fits the mental model

KMS protects and controls access to cryptographic keys. Applications or AWS services ask KMS to perform approved operations or protect data keys. The plaintext data key encrypts the payload locally; KMS protects the data key under a KMS key. This envelope-encryption pattern avoids sending every payload byte through KMS and supports large objects. Authorization, key lifecycle, ciphertext storage, and recovery must all be planned together.

## Supplied names explained

- **KMS key:** a logical cryptographic key with a key ID/ARN, policy, state, usage, and managed key material. The material is not exportable for ordinary AWS-generated keys.
- **Key types:** symmetric encryption keys, asymmetric keys for supported encryption/signature operations, and HMAC keys. The key’s `KeySpec`, `KeyUsage`, origin, and state determine permitted operations.
- **Key policy:** primary resource policy for a KMS key. IAM policies may also participate when the key policy enables IAM delegation; do not assume an IAM `Allow` alone grants key use.
- **Grant:** a delegable permission mechanism used by services and applications. Grants are evaluated with key and IAM policies and can be constrained/revoked.
- **Data key:** a symmetric key returned by `GenerateDataKey` in plaintext plus an encrypted copy, or returned encrypted by `GenerateDataKeyWithoutPlaintext`. Encrypt data locally with the plaintext key, then discard it from memory when possible; store the encrypted data key with ciphertext.
- **Envelope encryption:** local data encryption with a data key, plus wrapping that data key under a KMS key. Decryption requires authorization to decrypt the encrypted data key before using it on ciphertext.
- **Alias:** a mutable friendly name pointing to a KMS key. It is useful for application indirection but is not itself a cryptographic identity or a stable key ARN.
- **Multi-Region key:** related regional KMS keys with same key material and key ID, usable across Regions without a cross-Region KMS call for certain operations. Each regional replica is still managed independently for policy, grants, aliases, enable/disable, and lifecycle.

## Envelope encryption flow

1. An authorized producer calls `GenerateDataKey` with the intended symmetric KMS key and encryption context.
2. KMS returns plaintext data key and its encrypted copy. The application uses an authenticated encryption mode from a vetted library to encrypt the payload and bind relevant metadata as associated data.
3. The application stores ciphertext, encrypted data key, algorithm/version metadata, and required encryption context. It erases plaintext key material from memory as far as the runtime permits.
4. A reader retrieves ciphertext and encrypted data key, calls `Decrypt` with the required context, then authenticates/decrypts locally. A wrong context or tampered ciphertext must fail, not return partial plaintext.
5. Access policy grants data-key operations only to the workload and resource scope that needs them. KMS CloudTrail events and application audit records provide complementary evidence.

Encryption context is non-secret authenticated metadata. It is not encrypted by KMS and may appear in logs/audit events. Never put passwords or personal data in it. Bind context to stable identifiers (such as tenant and object) to make ciphertext substitution harder; the decrypting application must reconstruct and supply the expected context.

## Authorization and service integration

KMS authorization can involve key policy, IAM policy, grants, and Organizations controls. A key policy that omits the account principal/IAM delegation can make an IAM allow ineffective. Conversely, overly broad key policy or grant permissions can permit decrypt, data-key generation, grant creation, or policy changes beyond the intended workload. Separate key administrators from key users and protect policy mutation and deletion operations.

Many AWS services use KMS grants on behalf of a caller. Validate the service’s encryption-at-rest documentation to understand which principal calls KMS, how grants are created, and which conditions are available. `kms:ViaService`, encryption context, and source-account conditions can narrow access where supported; test the exact service path.

## Rotation, replacement, and data availability

- **Automatic rotation:** supported for customer-managed symmetric encryption KMS keys with AWS-generated key material. AWS managed keys rotate automatically (currently approximately annually); customer-managed rotation is configurable. Automatic rotation does not change the logical key ID/ARN or require re-encrypting existing ciphertext: KMS retains prior material and selects the right version for decrypt.
- **On-demand rotation:** supported for eligible symmetric keys, including certain imported-material cases; check current eligibility.
- **Manual rotation:** needed for asymmetric/HMAC/custom-key-store keys not eligible for automatic/on-demand rotation. Often this means creating a new KMS key and updating clients, aliases, and ciphertext metadata under a migration plan.
- **Rotation is not revocation:** old material remains available to decrypt historical ciphertext. If compromise requires invalidating old material, re-encrypt data under a new key and plan for old ciphertext, backups, and downstream replicas.
- **Disable vs delete:** disabling stops cryptographic use but is reversible. Scheduling deletion makes the key unusable during the pending period and then permanently deletes it after 7–30 days; ciphertext depending on it may become unrecoverable. If uncertain, disable rather than delete and check actual key usage before scheduling deletion.

## Multi-Region choices

Multi-Region primary and replica keys share key material/ID and can support local encryption/decryption in separate Regions. They are not a globally replicated authorization policy: configure key policies, grants, tags, aliases, and enabled state independently. They do not automatically replicate encrypted application data, establish application consistency, or provide failover routing. A multi-Region key may simplify decrypting locally replicated ciphertext during a regional outage, but the ciphertext, metadata/context, IAM access, replica state, and service dependencies must also be available.

Use single-Region keys when regional isolation and simpler blast radius are more important; use multi-Region keys when cross-region data operations justify shared material and associated governance complexity. Consider data residency and key-compromise blast radius before replicating key material.

## Example: encrypting tenant exports

A .NET export worker obtains a data key for each export or bounded object group, with encryption context containing the tenant and export ID. It encrypts the file using a vetted AEAD library, stores ciphertext and the encrypted data key in object storage, and never sends plaintext keys to React. A download worker checks application access to the tenant/export, then asks KMS to decrypt the data key with the expected context. The KMS key policy limits the role to the required key operations and may constrain the service path; the application’s tenant check remains necessary because AWS KMS authorization does not authorize an end user to read a particular row/file.

## Cross-item comparison

- **KMS vs Secrets Manager:** KMS provides key operations and data-key protection; Secrets Manager stores secret values and coordinates secret rotation, often using KMS encryption at rest.
- **KMS vs Vault Transit:** both can centralize cryptographic operations. KMS integrates with AWS IAM/services and provider-managed key material; Vault Transit uses Vault authentication/policies and operations. Portability and operational responsibility differ.
- **Automatic key-material rotation vs application key migration:** the former keeps one logical KMS key and retains old material for decrypt; the latter creates a new key and may require data re-encryption and policy migration.
- **Key policy vs IAM policy:** KMS key policy is central to authorization; IAM grants participate only under the applicable key-policy model. An alias does not grant access.

## Common mistakes

- Sending large plaintext payloads directly through KMS instead of using envelope encryption.
- Assuming automatic rotation makes old encrypted data unreadable or re-encrypts it.
- Assuming IAM policy alone always grants use of a KMS key.
- Placing secrets in encryption context or treating context values as confidential.
- Deleting/rotating a key without inventorying old ciphertext, backups, replicas, and restore procedures.
- Assuming a multi-Region key automatically replicates ciphertext, policies, grants, or application failover.
- Using the same broad key for unrelated tenants/services without a threat-model reason.
- Assuming KMS authorization replaces application-level tenant and object authorization.

## Knowledge checks with answers

1. **Why use envelope encryption for large files?** Encrypt locally with a data key and use KMS to protect that key, avoiding a KMS request for every payload byte.
2. **Does automatic rotation require rewriting every ciphertext?** For eligible KMS keys, no; KMS retains old material and can decrypt prior ciphertext.
3. **Does key rotation revoke the old material?** No. Re-encrypt and retire old ciphertext/material under an explicit migration plan if revocation is required.
4. **Why include an encryption context?** It binds non-secret authenticated metadata to the cryptographic operation; callers must provide the expected context to decrypt.
5. **Do multi-Region keys replicate key policies?** No. Manage each regional key’s policy, grants, alias, tags, and state independently.
6. **What should you do if unsure whether to delete a key?** Disable it first, inspect use and recovery impact, and only schedule deletion after verified retention/restore requirements.

## Examples

During key rotation, new exports use the current key material while old exports continue to decrypt because KMS retains previous material. During a compromise response that requires cryptographic erasure, the team separately migrates or destroys old ciphertext and verifies backups/replicas; merely enabling automatic rotation is not that response.

## Practice exercise

Design envelope encryption for a multi-tenant export service. Specify data-key granularity, algorithm and authenticated metadata, encryption context, key policy, IAM/grant boundaries, rotation vs re-encryption, multi-Region recovery, audit events, and a safe key-deletion checklist.
