# end-to-end system design case studies — Reference: Content-addressed attachment deduplication

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 6920: Naming Things with Hashes](https://www.rfc-editor.org/rfc/rfc6920.html), [NIST policy on hash functions](https://csrc.nist.gov/projects/hash-functions/nist-policy-on-hash-functions), [NIST hash-function guidance](https://csrc.nist.gov/Projects/Hash-Functions), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

This case study covers attachments addressed by a cryptographic digest and reused when identical bytes are uploaded. It focuses on authorization, tenant privacy, integrity, and lifecycle behavior, not on a specific object store.

## How this group fits the mental model

Content addressing names an object by a digest of its bytes rather than by a mutable path. The server can use that digest to detect duplicate uploads, verify content after transfer, and cache immutable blobs. A separate metadata record maps a user-visible attachment to its blob and enforces ownership, filename, media type, retention, and permissions. Knowing a digest is not authorization to read the blob.

## Supplied names explained

- **Content digest:** hash of the uploaded bytes under a named algorithm and encoding; persist the algorithm/version with the identifier so future migrations are possible. For adversarially chosen files, select a currently accepted collision-resistant cryptographic hash such as a SHA-2 or SHA-3 member under the applicable policy; do not use MD5 or SHA-1 as a security-sensitive content identity. A digest is public metadata, not a secret or authorization token.
- **Blob/object:** immutable byte content stored under a digest-derived key.
- **Attachment metadata:** owner/tenant, filename, declared and detected media type, size, scan status, retention, and access policy.
- **Deduplication:** reusing existing bytes for identical content; cross-tenant reuse can expose membership or timing signals.
- **Integrity verification:** hash the bytes received/stored and compare with the expected digest; a digest alone does not encrypt the blob or prove uploader identity.

## Cross-item comparison

| Design | Benefits | Risks |
| --- | --- | --- |
| Per-tenant digest namespace | Limits accidental cross-tenant reuse and some membership leakage | Less deduplication; tenant boundaries must still be enforced on every read |
| Global content-addressed store | Maximum reuse and simple immutable blob identity | Existence/timing oracle, shared deletion/reference-count complexity, and potential side channels |
| Random object key plus stored checksum | Hides content equality in the object key while still detecting corruption | Does not provide natural dedup lookup; checksum metadata must be protected and checked |

## Examples

On upload, authenticate the user, enforce size/type limits, stream bytes into quarantine while computing a strong digest, inspect/scan content, then atomically create authorized metadata and make the immutable blob available. If a blob with the digest already exists, verify trust and storage integrity before attaching it; do not skip malware scanning or authorization merely because content was previously uploaded.

On download, authorize against attachment metadata first, then stream the blob and optionally verify its digest. Return a safe content disposition and validated media type; treat filenames and uploaded MIME declarations as untrusted. Deleting one attachment removes its metadata/reference; delete the underlying blob only when no live metadata, retention hold, legal hold, version, or in-flight operation still needs it.

If clients can query whether a digest exists before upload, a malicious user could test for known private documents. Require authorization, avoid revealing global existence, and consider tenant-scoped lookup or always accepting bytes before deciding to reuse them. Any optimization should be evaluated as a privacy side channel.

## Common mistakes

- Treating a digest as a secret access token or as proof that the requester owns the file.
- Returning a global “already uploaded” answer that leaks another user’s content.
- Trusting filename, file extension, or client-declared content type for safe serving.
- Skipping malware/content inspection because the bytes deduplicate to an existing object.
- Updating metadata and blob references non-atomically, causing visible records with missing blobs or uncollectable orphans.
- Deleting shared bytes when one user removes their attachment.
- Ignoring digest algorithm migration, corruption detection, encryption, backup, retention, and lifecycle holds.
- Assuming content-addressing provides confidentiality; it provides naming/integrity properties only when implemented and verified appropriately.

## Knowledge checks with answers

1. **Does a correct digest let any user download the blob?** No. Authorization must be checked through the user/tenant attachment metadata.
2. **Should malware scanning be skipped for a duplicate digest?** Not without a carefully justified trusted scanning state and policy; content can be reintroduced under changed context and existing scan results may be stale.
3. **Why can global deduplication leak information?** A response or timing difference may reveal that a guessed digest/content already exists for another user.
4. **When can the physical blob be deleted?** Only after proving no authorized reference, retained version, hold, or in-flight write requires it.

## Review status

Digest naming is checked against RFC 6920; algorithm-selection and collision-resistance cautions are checked against NIST hash-function policy. The design examples are application patterns; authorization and lifecycle rules must be enforced by the owning service.
