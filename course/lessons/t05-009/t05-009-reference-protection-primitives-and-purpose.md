
# data protection encryption signing keys secrets and rotation — Reference: Confidentiality, integrity, signed payloads, and purpose isolation

## Scope and version
This reference covers the assigned primitive and ASP.NET Core Data Protection names. The framework overview and API boundary are documented by [Microsoft ASP.NET Core Data Protection](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/introduction?view=aspnetcore-11.0); key behavior is in [key management documentation](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/key-management?view=aspnetcore-11.0). Low-level cipher APIs are outside scope.

## How this group fits the mental model
Choose the protection property first, then use a reviewed API that manages key lifecycle and domain separation. Data Protection presents a purpose-bound protect/unprotect interface; callers do not manipulate its cryptographic payload internals.

## Supplied names explained
- `Encryption` — Transformation that makes plaintext unreadable without an appropriate key. Encryption alone may not detect tampering; use an authenticated mode or separate integrity protection.
- `Authenticated encryption` — Encryption combined with integrity/authenticity protection so modification is detected under the scheme's guarantees. Prefer reviewed platform implementations.
- `Message authentication code (MAC)` — Tag computed with a shared secret key to detect tampering and authenticate possession of that secret. It does not conceal the message.
- `Digital signature` — Public-key mechanism where a private key signs and a corresponding public key verifies. It supports verifiable integrity/origin but does not make the signed data confidential.
- `Confidentiality` — Property that unauthorized readers cannot learn protected content. It says nothing by itself about whether content was changed.
- `Integrity` — Property that unauthorized modification is detected. Integrity can be provided without confidentiality.
- `Key derivation` — Creating cryptographic key material from another key/secret using a defined derivation process. Use vetted derivation APIs and context separation rather than ad hoc concatenation.
- `Key separation` — Using distinct derived or managed keys for distinct purposes so compromise or misuse in one function does not automatically cross to another.
- `Purpose string` — Application-supplied context that identifies what protected data is for. Use a stable, unique purpose per data type/use and never allow untrusted values to select a privileged purpose.
- `Cryptographic agility` — Ability to update cryptographic algorithms/parameters as standards or requirements change. Prefer library-managed formats and migration plans; do not invent custom agility fields without validation.
- `Nonce uniqueness` — Requirement that a nonce be unique where the chosen algorithm requires it for a key. Reuse can break confidentiality/integrity; rely on reviewed implementations and understand their nonce contract.
- `Initialization vector (IV)` — Algorithm input that helps randomize encryption for a particular operation. Requirements differ by mode; do not treat IV as a secret key or reuse it where uniqueness/randomness is required.
- `Authenticated encryption with associated data (AEAD)` — Authenticated encryption that protects plaintext and authenticates additional associated data without encrypting that associated data. The caller must supply the same associated context during decryption.
- `Ciphertext` — Encrypted representation of plaintext. It may still reveal length/metadata and may be malleable if not integrity protected.
- `Authentication tag` — Output used to verify integrity/authenticity of authenticated encryption or a MAC. Reject data when tag verification fails; do not expose partial plaintext first.
- `Key compromise scope` — Set of data, systems, or periods affected if a key is exposed. Limit key reuse, access, lifetime, and application sharing to reduce scope.
- `Key version identifier` — Metadata identifying which key/version protects data so the correct key can be selected during rotation. Treat identifiers as selectors, not proof that the key or payload is trusted.
- `IDataProtector` — ASP.NET Core interface for protecting/unprotecting data under a particular purpose chain. Use a distinct protector per data use and treat its payload as opaque.
- `IDataProtectionProvider` — ASP.NET Core factory interface that creates protectors by purpose. It is typically obtained from dependency injection.
- `IDataProtectionProvider.CreateProtector` — Creates a protector for a purpose. The `CreateProtector` purpose-chain overloads accept `IEnumerable<string>` or `params string[]`; ordering and spelling are part of the purpose identity, so centralize purpose constants and avoid accidental changes.
- `CreateProtector purpose-chain overloads (IEnumerable<string> and params string[])` — These overloads compose an ordered purpose chain; changing its order or any value produces a different protection context.
- `IDataProtector.Protect` — Operation that transforms plaintext into a protected opaque string/byte representation. Store or transmit it intact and avoid exposing raw inputs in logs.
- `IDataProtector.Unprotect` — Operation that validates and recovers plaintext from a protected payload. Treat failure as untrusted/invalid data and do not bypass it with fallback plaintext parsing.
- `DataProtectionCommonExtensions.Protect(string)` — String extension that UTF-8 encodes the input, protects it through `IDataProtector`, and returns an opaque encoded string.
- `DataProtectionCommonExtensions.Unprotect(string)` — String extension that decodes and unprotects a string payload; malformed, wrong-purpose, unavailable-key, or tampered payloads fail (typically with `CryptographicException`).
- `ITimeLimitedDataProtector.Protect overloads (byte[]/string, DateTimeOffset/TimeSpan)` — Overloads accept an absolute expiration or a duration and protect byte or string content. The no-expiration overloads also exist, so choosing this interface alone does not guarantee expiry; use an overload with an explicit expiry.
- `ITimeLimitedDataProtector.Unprotect overloads and expiration output` — Byte/string overloads recover content; the overload with `out DateTimeOffset expiration` also returns the encoded expiry. An expired payload fails unprotection; expiry is not a substitute for checking authorization.
- `IDataProtector.ToTimeLimitedDataProtector` — Extension that adapts an existing protector for time-limited payload operations.
- `ISpanDataProtector (.NET 11)` — .NET 11 optimized interface for span input and `IBufferWriter<byte>` output; it complements rather than removes the established `IDataProtector` byte-array API.
- `ISpanDataProtector.Protect<TWriter>` — Generic span-based operation writing protected bytes to an `IBufferWriter<byte>` implementation, reducing intermediate allocations in suitable pipelines.
- `ISpanDataProtector.Unprotect<TWriter>` — Generic span-based operation writing recovered bytes to an `IBufferWriter<byte>` implementation. Validate the result through the API; do not parse the protected format yourself.
- `Purpose chain` — Ordered sequence of purpose identifiers associated with a protector. A different chain derives a different protection context, preventing accidental cross-use even with shared root keys.
- `Purpose isolation` — Separation between consumers/data types through distinct purposes. It reduces confusion and misuse but does not isolate apps that can read the same keys and deliberately use a compatible purpose.
- `Application discriminator` — Application-level isolation input used by Data Protection, normally derived from application identity unless explicitly configured. Setting the same name allows intended cross-app interoperability and should be restricted to trusted peers.
- `Cryptographic payload format` — Framework-defined representation that includes enough metadata to locate/validate protected content and keys. Treat the format as opaque and version-compatible only across supported framework arrangements.
- `ITimeLimitedDataProtector` — Extension interface supporting protected payloads with an expiration time. It helps reject stale tokens but does not replace business authorization or provide revocation before expiry.

## Cross-item comparison
`Encryption` addresses confidentiality; `Signing`/MAC address integrity and origin/secret possession. AEAD provides confidentiality and integrity together. `Purpose-isolated protector` reduces accidental cross-use compared with a shared generic protector; it does not create a separate key-access boundary. Microsoft documents purpose-based isolation and application discrimination in [Data Protection APIs](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/introduction?view=aspnetcore-11.0).

## Examples
Use separate purposes for an email-confirmation token and an antiforgery payload even when both are protected by the same provider. Set an application discriminator consistently only for replicas or related applications that must read the same payloads. Use a time-limited protector for an expiring token, and still check that the user/resource/action is authorized when it is presented.

## Common mistakes
- Calling a MAC or signature encryption.
- Parsing/modifying Data Protection payloads.
- Using the same purpose for unrelated payload types.
- Treating a purpose string as access control against an attacker who controls the application.
- Reusing nonces without understanding the selected algorithm.
- Accepting data after authentication-tag or unprotect failure.

## Knowledge checks with answers
1. Which property does a digital signature not provide? **Confidentiality.** 2. What separates protectors? **Purpose chains and application discriminator.** 3. Is the payload format intended for caller parsing? **No.**
