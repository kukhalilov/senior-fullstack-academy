# end-to-end system design case studies — Reference: Block-level deduplication

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 6920: Naming Things with Hashes](https://www.rfc-editor.org/rfc/rfc6920.html), [NIST policy on hash functions](https://csrc.nist.gov/projects/hash-functions/nist-policy-on-hash-functions), [NIST hash-function guidance](https://csrc.nist.gov/Projects/Hash-Functions).

## Scope and version

This lesson covers identifying repeated file chunks to avoid storing or transferring the same content repeatedly. Hash choice, chunking, encryption, and privacy policy are design-specific; do not infer a universal storage saving or security guarantee from the technique name.

## How this group fits the mental model

Instead of comparing whole files, divide each file into chunks, fingerprint each chunk, and reuse a stored chunk when the same content already exists. A file manifest records chunk order and metadata so the file can be reconstructed. This helps when edits shift only part of a large file or many users share common blocks, but adds indexing, integrity, privacy, and garbage-collection work.

## Supplied names explained

- **Fixed-size chunking:** splits at fixed byte offsets; simple, but an insertion near the start shifts later boundaries and can reduce reuse.
- **Content-defined chunking:** chooses boundaries based on content fingerprints so similar regions can remain aligned after insertions; costs more computation and needs boundary/min/max controls.
- **Chunk digest:** hash used as a candidate identifier. For adversarially chosen content, use a currently accepted collision-resistant cryptographic hash such as an appropriate SHA-2 or SHA-3 member. Compare length and, where threat/correctness requires, verify bytes before reusing; collision risk is small with suitable hashes, not mathematically impossible.
- **Manifest:** ordered chunk references, lengths, and file metadata needed to rebuild the original file.
- **Reference count/mark-and-sweep:** ways to determine whether a chunk is still reachable by any live manifest before deleting it; concurrent upload/delete and retention windows complicate safe reclamation.

## Cross-item comparison

| Strategy | Advantage | Limitation |
| --- | --- | --- |
| Whole-file dedup | Simple index and verification | Small file changes often prevent reuse of the complete file |
| Fixed-size chunks | Simple and low CPU | Insertions shift boundaries and reduce matching |
| Content-defined chunks | Better reuse across shifted content | More CPU and implementation complexity; adversarial input and tiny-chunk floods need resource limits |
| Client-side cross-user dedup | Avoids sending/storing content already present | Can leak whether another user has a guessed file; encryption and tenant isolation complicate reuse |

## Examples

An uploaded 1 GB virtual-machine image changes in one region. Whole-file hashing sees a different object; fixed chunks or content-defined chunks can reuse unchanged blocks and store only changed chunks plus a new manifest. On download, verify chunk lengths/digests, reconstruct in manifest order, and verify the whole-file digest before exposing the result. If one chunk is missing or corrupt, fail clearly and repair from a replica or source rather than returning silent corruption.

For multi-tenant attachments, a global “does this digest exist?” response can reveal another tenant’s content. Scope lookup and authorization to an appropriate privacy boundary, avoid timing/response behavior that acts as a membership oracle, and evaluate whether cross-tenant dedup savings justify leakage risk. Server-side encryption with tenant-specific keys may prevent shared encrypted chunks; convergent encryption enables dedup but has separate confidentiality risks and must not be treated as ordinary encryption.

## Common mistakes

- Treating digest equality as a substitute for integrity checks and durable manifests.
- Selecting chunk sizes without measuring metadata/index overhead, dedup ratio, CPU, and workload distribution.
- Assuming fixed boundaries will reuse data after edits near the beginning of files.
- Exposing a “file already exists” response that lets attackers probe private content.
- Deleting a chunk while an upload or manifest commit is still referencing it.
- Forgetting orphan cleanup, replication repair, versioning, retention, and backup semantics.
- Claiming strong confidentiality from convergent/client-side dedup without analyzing confirmation attacks and key scope.
- Allowing adversarial uploads to generate excessive tiny chunks or hash-index work.

## Knowledge checks with answers

1. **Why can content-defined chunking outperform fixed chunks after an insertion?** Boundaries can resynchronize based on content, preserving matching chunks beyond the insertion.
2. **Does a matching digest prove two chunks are byte-identical?** It is strong evidence under a suitable hash, but applications can verify bytes or use additional safeguards for the required threat model.
3. **Why can global dedup leak information?** An attacker may infer that guessed content is stored by observing deduplication or response behavior.
4. **What must be safe before garbage-collecting a chunk?** Establish that no committed/live manifest, in-flight operation, retained version, or required backup still references it.

## Review status

Hash-based naming is checked against RFC 6920; algorithm-selection and collision-resistance cautions are checked against NIST policy. Chunking and storage examples are design patterns, not guarantees of a particular deduplication ratio.
