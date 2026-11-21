# end-to-end system design case studies — Reference: Content-addressed build artifact

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 6920: Naming Things with Hashes](https://www.rfc-editor.org/rfc/rfc6920.html), [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use), [GitHub Actions artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts).

## Scope and version

This lesson covers immutable build outputs identified and verified by digest, with CI artifacts as an example. Artifact retention, provenance, cache semantics, and platform APIs change; use the platform docs for exact behavior. A digest verifies byte identity relative to a trusted expected digest; it does not prove who built the artifact or whether its contents are safe.

## How this group fits the mental model

A build artifact—binary, package, container image, or generated bundle—should be addressed immutably so tests, promotion, deployment, and rollback refer to the same bytes. Compute a digest, store the bytes and metadata, verify the digest after retrieval, and pass the artifact between stages rather than rebuilding independently in each environment. Record source revision, build inputs/toolchain, workflow identity, and provenance separately so operators can answer what code and process produced it.

Build caches and artifact stores serve different purposes. A cache is an optimization whose contents can be discarded and recomputed; a release artifact is an input to deployment and needs retention, access, and integrity policy. Cache keys must include all inputs that affect output or stale/cross-branch results can be reused incorrectly.

## Supplied names explained

- **Digest-addressed artifact:** immutable identifier derived from artifact bytes, typically with an explicitly selected modern cryptographic hash and algorithm label.
- **Build provenance/attestation:** signed or otherwise authenticated statement binding an artifact digest to source, builder, workflow, and build parameters; verify the attestation’s issuer and policy, not only its presence.
- **Cache key:** identifier for reusable computation/output derived from every relevant input; incomplete keys can return stale or poisoned output.
- **Promotion:** moving the same verified artifact from test to staging/production, rather than rebuilding under different inputs.
- **Retention and access control:** lifecycle and permissions for artifacts, logs, caches, and attestations; public or overly broad caches can leak proprietary data or enable poisoning.

## Cross-item comparison

| Item | Purpose | Required trust check |
| --- | --- | --- |
| Digest | Detect byte changes and identify the exact output | Obtain expected digest from a trusted channel; attacker can replace both artifact and untrusted digest |
| Signature/attestation | Bind claims about origin/build to a signing identity | Verify signature, issuer identity, repository/workflow/ref claims, and required policy |
| Cache | Avoid repeating expensive work | Validate cache key coverage and trust boundary; never assume cache contents are authoritative release artifacts |
| Artifact registry/store | Retain and distribute build output | Restrict write/read access, immutability/tag behavior, retention, and audit according to release risk |

## Examples

A CI pipeline builds `service.tar`, computes a digest, runs tests against that exact artifact, stores the artifact with source revision and provenance, and deploys the same digest to staging and production. The deployment stage verifies the downloaded bytes against the trusted digest and checks provenance policy for the expected repository and protected workflow. A mutable tag such as `latest` may point somewhere else later; deployment by immutable digest avoids that ambiguity, while tags remain useful labels.

If two branches share a cache, ensure the key includes lockfiles, compiler/runtime version, relevant build flags, and source inputs. Scope cache write permissions so untrusted pull-request code cannot poison cache entries later consumed by privileged release workflows. Treat cache restore as untrusted input and validate outputs as appropriate.

## Common mistakes

- Assuming an artifact is trustworthy because its SHA-256 digest matches a digest stored alongside the artifact in the same untrusted location.
- Treating digest verification as proof of source, builder, workflow identity, review, or safety.
- Rebuilding for production after testing a different artifact, so the deployed bytes were never tested.
- Using mutable tags alone for release identity.
- Reusing broad caches across trust boundaries or allowing untrusted code to write cache entries consumed by privileged builds.
- Omitting environment/toolchain/dependency inputs from cache keys, creating nondeterministic or stale results.
- Retaining sensitive build logs, artifacts, or caches indefinitely or exposing them publicly.
- Assuming a valid attestation is sufficient without verifying signer identity and policy constraints.

## Knowledge checks with answers

1. **Does a matching digest prove an artifact came from the expected repository?** No. It proves byte equality to the expected digest; provenance must bind that digest to an authenticated builder/source and be verified.
2. **Why deploy the exact artifact tested in CI?** It avoids a second build producing different bytes and preserves the test-to-release chain.
3. **Can an untrusted pull request safely write to a cache used by privileged deployment?** Not without a strong isolation and validation design; attacker-controlled cache contents can poison later trusted execution.
4. **What does an attestation verifier need to check?** Signature and issuer, plus policy claims such as repository, source revision, workflow identity, and expected build context.

## Review status

Hash-based naming and digest limitations are checked against RFC 6920; workflow trust boundaries, artifact handling, and provenance guidance are checked against GitHub Actions documentation. A digest only confirms byte identity against an expected digest obtained through a trusted channel.
