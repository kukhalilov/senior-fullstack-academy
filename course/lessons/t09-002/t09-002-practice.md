# CI CD builds tests artifacts deployment and rollback — Exercises and worked solutions

Sources: [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching), [artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations), [deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments), and [secure use](https://docs.github.com/en/actions/reference/security/secure-use).

## Goals

- Design a pipeline that passes one artifact from build through production.
- Distinguish cache, artifact, digest, and provenance.
- Limit untrusted event code and workflow credentials.
- Define a deployment verification and recovery plan.

## Worked example

A pull request receives read-only permissions and runs validation without production secrets. The protected main branch rebuilds from locked inputs, tests, scans, packages once, records the digest, and uploads the artifact. A staging job downloads it, deploys by digest, and runs smoke checks. A production environment applies its policy, then deploys the same digest gradually. OIDC grants short-lived cloud identity under a trust rule that matches the repository and production environment. If user-facing health breaches its threshold, pause and restore a compatible known-good artifact or roll forward.

## Exercises

1. **Cache or artifact?** A test job needs to pass a package to a deploy job. Another job wants to reuse downloaded dependencies. Select storage for each and explain why.
2. **Build once.** Staging and production show the same image tag but different digests. What happened and how should release promotion work?
3. **Fork threat.** A workflow triggered by fork pull requests checks out their code and has a production secret. Identify the risk and repair the design.
4. **OIDC trust.** A cloud role accepts every token from GitHub’s Actions issuer. Which constraints should narrow this policy?
5. **Canary failure.** Error ratio rises in a canary, but a schema migration removed a column used by the prior app. Should the deployment automatically roll back? What safer approach exists?
6. **Workflow never runs.** A push to a feature branch did not start the workflow. What should you inspect?
7. **Flaky test matrix.** One operating-system matrix entry fails intermittently. How do you preserve useful failure evidence without making intermittent green runs an implicit quality gate?
8. **Attestation.** What does an artifact attestation establish, and what does it not establish?

## Progressive hints

1. One storage type preserves run outputs; the other is optional and regenerable.
2. Tags can move or be resolved differently. Compare content digests.
3. Untrusted code can execute arbitrary commands and exfiltrate available secrets.
4. Constrain issuer, audience, subject claims (repository/ref/environment), and granted cloud role scope.
5. The old app may not run against the changed schema. Consider a compatible roll-forward or mitigation.
6. Check workflow file location, event activity type, branch/path/tag filters, default branch conditions, and YAML validity.
7. Keep logs/reports, stabilize the test, and define whether retry is diagnostic or a pass condition.
8. It links an artifact to signed build provenance, not semantic correctness or absence of vulnerabilities.

## Complete solutions

### 1. Cache or artifact?

Use a workflow artifact to pass the built package to deploy; use a dependency cache to reuse downloaded packages. The deploy job must work from the artifact even if every cache is absent. Do not place secrets in either storage.

### 2. Build once

The image tag is an alias and may have been overwritten or resolved during separate builds. Build once, record the image digest, and deploy/promote by that digest. Staging and production should report the same digest; investigate provenance and registry immutability if they do not.

### 3. Fork threat

The workflow executes attacker-controlled code with access to a production secret. Remove privileged credentials from the fork-triggered job, use minimal read permissions, and separate validation from trusted publishing/deployment. Do not combine a privileged base-context trigger with checkout and execution of untrusted pull-request code.

### 4. OIDC trust

Require the expected issuer and audience, then match the subject to the exact repository and approved branch or protected environment. Grant the cloud role only necessary actions/resources. Token issuance permission alone does not authorize cloud access; the relying provider’s trust policy does.

### 5. Canary failure

Do not automatically restore an old application if the schema is incompatible; that can create a second outage or data corruption. Pause traffic expansion, assess impact, and choose a compatible roll-forward or mitigation. Avoid destructive contract migration until all old versions and readers are gone. If rollback is required, make schema and app recovery an explicit coordinated plan.

### 6. Workflow never runs

Inspect the file path under the expected workflow directory, trigger type and activity filters, branch/tag/path filters, default-branch requirements for some events, YAML syntax, and whether the event payload matches. Read the workflow run list and repository Actions policy too.

### 7. Flaky test matrix

Preserve per-platform logs and test reports, reproduce under a stable runner/toolchain, and fix nondeterministic dependencies. A retry can help diagnose flakiness but should not silently turn a known unreliable test into accepted green status. Make the required gate semantics explicit.

### 8. Attestation

It provides signed claims about where/how an artifact was built and links it to source/workflow identity for verification. It does not prove that code is correct, benign, adequately tested, or vulnerability-free; combine with independent checks and trust policy.

## Tests and edge cases

- Cache miss still yields a correct build.
- The deployed digest equals the tested digest.
- A fork pull request cannot read production credentials or write package/repository state.
- OIDC claims match only the approved repository and deployment context.
- A failed smoke test stops rollout before broad traffic exposure.
- A recovery path is compatible with already-applied schema/data changes.
- Artifact retention is long enough for release investigation but not indefinite by accident.
- Workflow cancellation cannot interrupt a critical deployment unsafely.

## Reflection questions

1. Can you identify exactly which commit produced the artifact in production?
2. Which pipeline checks are required gates, and what does each prove?
3. What is the maximum outage or data loss your rollback path tolerates?
4. Which workflow jobs can access secrets, write tokens, or cloud identity, and why?

