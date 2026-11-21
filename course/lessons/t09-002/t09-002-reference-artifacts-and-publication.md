# CI CD builds tests artifacts deployment and rollback — Reference: Build outputs, retention, integrity, registry publication, and provenance

Sources: [Workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts), [Artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations).

## Scope and version

Covers the exact assigned inventory against current GitHub Actions documentation checked 2026-11-20. Runner images, action runtimes, product-plan capabilities, and event details can change independently; verify current behavior before depending on it.

## How this group fits the mental model

Artifacts are outputs to retain or transfer. Names route data, digests identify content, registries distribute packages, and attestations/SBOMs add verifiable metadata. Promotion should preserve the exact digest.

## Supplied names explained

- `Workflow artifact upload` — A step that sends selected job files to run-scoped artifact storage.
- `actions/upload-artifact` — The official action for uploading files from a job into an artifact associated with that workflow run.
- `actions/download-artifact` — The official action for retrieving a previously uploaded workflow artifact in a later job/run where accessible.
- `Artifact name` — A run-scoped identifier used to select an artifact; it is not a content integrity check.
- `Artifact retention-days` — A requested retention interval bounded by repository/organization policy; set for investigation and cost needs.
- `Artifact overwrite` — Replacing an artifact with the same name can change which output consumers receive; prefer unique/versioned names and digest checks.
- `Artifact digest` — A content hash used to identify exact artifact bytes independently of a mutable name.
- `Artifact immutability` — The guarantee or policy that published content is not modified in place; still verify digest at consumption.
- `Artifact retention policy` — Rules for how long artifacts remain available and who can access them.
- `Dependency cache` — Optional reusable data to accelerate runs; unlike an artifact it is not a release record and may be evicted.
- `Container image registry` — A service that stores and distributes OCI container manifests and layers under access policy.
- `Package registry` — A service that hosts versioned packages for dependency retrieval or distribution.
- `Image tag` — A mutable human-readable registry reference that can be moved to another digest.
- `Image digest` — A content-derived identifier for an image manifest; use it to bind deployment to the tested image.
- `OCI image manifest` — An OCI document describing an image’s config and layer descriptors, identified by digest.
- `OCI image index` — A manifest list selecting platform-specific image manifests, allowing one reference to support multiple architectures.
- `Release asset` — A file attached to a named software release; publish integrity metadata and retention expectations alongside it.
- `Artifact provenance` — Metadata describing source and build process for an artifact, used to assess origin.
- `Artifact attestation verification` — Validation that a signed provenance statement matches expected identity and subject before trusting its origin.
- `SBOM attachment` — Publishing the component inventory alongside the artifact so consumers can inspect its dependency contents.
- `Build metadata` — Recorded toolchain, revision, parameters, and timestamps that aid reproducibility and incident analysis.
- `Signing keyless with OIDC` — Obtains signing identity from a short-lived workflow token rather than a long-lived private signing key; verify identity claims.
- `Registry credential scope` — The repository/package operations a registry token permits; use the least scope and duration required.
- `Artifact access control` — Rules governing which actors/workflows can read or overwrite build outputs.
- `Artifact promotion between environments` — Advancing the same digest through environments, preserving the tested output identity.

## Cross-item comparison

Cache is reusable/disposable; artifact is a retained run output. Tag is a mutable alias; digest identifies content. Attestation records build provenance; SBOM lists components.

## Examples

Publish a package once, record digest and provenance, and make staging and production consume that digest. Verify expected repository/workflow identity before release.

## Common mistakes

Do not confuse caches with artifacts, mutable tags with digests, or attestations with a security review. Set access and retention intentionally.

## Knowledge checks with answers

1. **How do artifacts differ from caches?** Artifacts preserve outputs for later workflow stages; caches accelerate reuse and must not be treated as authoritative deliverables.
2. **What integrity check should publication include?** Verify artifact identity/digest and the source revision that produced it.
3. **Why should release packages be immutable?** It makes provenance, rollback, and environment promotion refer to the same bytes.
