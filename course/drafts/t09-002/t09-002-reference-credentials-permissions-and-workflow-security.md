# CI CD builds tests artifacts deployment and rollback — Reference: Least privilege, secrets, OIDC, and untrusted workflow boundaries

Sources: [Secure use](https://docs.github.com/en/actions/reference/security/secure-use), [OIDC](https://docs.github.com/en/actions/reference/security/oidc), [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).

## Scope and version

Covers the exact assigned inventory against current GitHub Actions documentation checked 2026-11-14. Runner images, action runtimes, product-plan capabilities, and event details can change independently; verify current behavior before depending on it.

## How this group fits the mental model

Workflow security starts with event trust, then limits code execution, token permissions, secrets, action revisions, and cloud identity. OIDC is only as restrictive as the cloud trust policy.

## Supplied names explained

- `GITHUB_TOKEN` — A per-workflow repository credential; its default and explicit scopes govern what a job can read/write.
- `permissions: contents: read` — Token permission grant; give this scope only to the job that requires it and keep other jobs minimized.
- `permissions: contents: write` — Token permission grant; give this scope only to the job that requires it and keep other jobs minimized.
- `permissions: id-token: write` — Token permission grant; give this scope only to the job that requires it and keep other jobs minimized.
- `permissions: packages: write` — Token permission grant; give this scope only to the job that requires it and keep other jobs minimized.
- `Permission minimization` — Granting only the actions, resources, and duration a job requires.
- `Job-scoped token permission` — A permission grant limited to one job, reducing blast radius compared with workflow-wide elevation.
- `Repository Actions permission policy` — Repository settings governing which Actions and reusable workflows are permitted to run.
- `Environment-scoped secret` — A secret tied to a deployment environment and gated by its protections.
- `Repository secret` — A secret available to authorized workflows in a repository; minimize exposure because write-capable contributors may access it indirectly.
- `Organization secret` — A centrally managed secret made available to selected repositories under organization policy.
- `Secret masking` — Runner log redaction of exact secret values; transformations and structured encodings may escape masking.
- `Secret exposure through logs` — Credential disclosure in workflow output; revoke/rotate it and remove affected logs/artifacts where possible.
- `Pull-request fork token restriction` — Reduced write/token access for workflows from forks; do not assume this removes every risk of executing untrusted code.
- `pull_request_target trust boundary` — A base-repository-context event that can expose privileged capabilities if it checks out and executes fork-controlled code.
- `Untrusted pull request code` — Contributor-controlled source and event strings that may run arbitrary commands; isolate from secrets and write permissions.
- `GitHub Actions OIDC token` — A signed, short-lived workflow identity token requested for external federation.
- `OIDC issuer` — The identity provider issuing tokens; cloud trust must expect the correct issuer URL.
- `OIDC audience` — The intended token recipient; constrain it to the value expected by the cloud role.
- `OIDC subject claim` — A claim identifying repository/ref/environment context; match the exact permitted deployment source.
- `Cloud workload identity federation` — A cloud trust exchange that grants credentials to an authenticated workload without storing a static key.
- `Short-lived cloud credential` — A temporary credential with limited validity, reducing exposure window but still requiring narrow role scope.
- `Static cloud access key` — A long-lived secret credential that must be stored/rotated and can be exposed until revoked.
- `Branch claim condition` — A trust rule restricting identity to a specified source branch or ref.
- `Environment claim condition` — A trust rule restricting cloud access to a named protected deployment environment.
- `Action pinning by full commit SHA` — References an immutable action revision so a moved tag cannot silently alter executed code.
- `Dependency lockfile for Actions` — Pins action dependencies according to supported tooling so workflow executable inputs are reviewable.
- `Third-party action compromise` — A supply-chain event where an action or its dependency executes malicious code with workflow permissions.
- `Artifact provenance verification` — Checks that signed artifact claims match an expected source/workflow identity before deployment.

## Cross-item comparison

Repository/environment secrets differ by scope and controls. Static keys persist; OIDC uses short-lived identity. Mutable action tags differ from full commit SHA pins.

## Examples

A deployment job requests an OIDC identity token; the cloud role accepts only expected issuer, audience, repo, and production environment subject. Fork jobs get no production secret.

## Common mistakes

Secret masking can fail for transformed values. Pin executable dependencies, minimize scopes, constrain OIDC claims, and do not privilege fork code.

## Knowledge checks with answers

1. **What decision does this inventory support?** Selecting a workflow boundary, artifact control, delivery signal, release strategy, or credential policy.
2. **What evidence should be preserved?** Source revision, check results, artifact digest, deployment outcome, and provenance where available.
3. **How do you reduce risk?** Declare inputs, restrict permissions, promote the same tested output, and define failure handling.

