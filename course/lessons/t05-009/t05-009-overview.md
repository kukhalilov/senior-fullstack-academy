
# data protection encryption signing keys secrets and rotation — Big-picture orientation and mental model

## Problem and purpose
Applications need to preserve trusted state across untrusted storage and communicate with external systems. Encryption, signatures, framework payload protection, key rings, and operational secrets solve related but different problems. Confusing them can cause data exposure, tampering, or application-wide outages.

## Plain-language mental model
Encryption hides a message from parties without the key. Integrity protection detects modification; a MAC or signature can provide integrity/authentication without hiding the message. ASP.NET Core Data Protection packages reviewed cryptographic operations and key management for application payloads. Its key ring is the durable history needed to continue reading prior protected values. Application secrets such as database passwords have different consumers and rotation needs.

## How the parts fit together
An application chooses a protector with a purpose, protects a payload, stores or sends the result, then unprotects it later. Shared replicas need compatible application identity and access to the same durable key ring. Rotation introduces a new active key while old keys may remain necessary to read existing payloads. Secret stores separately provide controlled delivery and auditing for credentials. Microsoft outlines [Data Protection](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/introduction?view=aspnetcore-11.0); OWASP covers [secrets lifecycle](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

## Concept map
- **Goal:** confidentiality, integrity, authenticity, or combinations.
- **API boundary:** `IDataProtectionProvider` creates purpose-scoped `IDataProtector` instances.
- **Key lifecycle:** persist, protect at rest, share across replicas, rotate, revoke, back up, restore.
- **Operational secrets:** deliver with least privilege; audit and rotate independently of Data Protection keys.

## End-to-end walkthrough
An app protects a password-reset token with a purpose-specific protector. It stores the protected value and later unprotects it with the same application discriminator, purpose chain, and a key still available in the key ring. If the app runs in two containers with ephemeral local storage, a restart or replica switch may make old values unreadable. Persist a shared key ring in durable storage, restrict access, encrypt keys at rest as appropriate, and retain backups. Set a shared application name only among apps intended to interoperate.

## When to use it and tradeoffs
Use platform cryptographic APIs rather than implementing cipher composition yourself. Data Protection is designed for web payloads and key lifecycle, not indefinite archival encryption or arbitrary cryptographic requirements. Shared keys improve cross-replica continuity but expand compromise scope. Rotation improves future protection; revocation can deliberately make payloads unreadable. Secret stores improve controlled delivery but introduce availability and access-policy dependencies. See [Microsoft key management](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/key-management?view=aspnetcore-11.0) and OWASP [Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

## What later lessons cover
The next lesson explains protection primitives and purpose isolation. The reference lesson covers key-ring configuration and operational secret lifecycle. Practice and interview lessons reason about multi-replica deployment and compromise response.
