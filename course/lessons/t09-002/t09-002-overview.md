# CI CD builds tests artifacts deployment and rollback — Big-picture orientation and mental model

Sources: [GitHub Actions workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts), [deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments), and [secure use](https://docs.github.com/en/actions/reference/security/secure-use).

## Problem and purpose

A code change is not ready merely because it builds on one laptop. Teams need repeatable evidence that a revision restores known dependencies, builds, passes relevant checks, produces an identifiable artifact, and can be deployed and verified safely.

Continuous integration validates changes frequently. Continuous delivery keeps a successful artifact releasable, possibly awaiting a human decision. Continuous deployment automatically releases changes after the defined controls pass. A green run proves only the checks configured in that run.

## Plain-language mental model

Treat a pipeline as a factory with a receipt. Source is the input; lockfiles define materials; build and tests inspect the product; an artifact is the packaged product; its digest and provenance are the receipt; deployment moves that same product through environments; health signals decide whether to proceed or recover.

A cache is a reusable toolbox for speed, not the product. A downstream environment should receive the immutable artifact built and tested earlier instead of rebuilding different bits.

## How the parts fit together

1. A push, pull request, schedule, or other event starts a workflow. Scheduled runs may be delayed; they are not precise timers.
2. Jobs form a dependency graph and run on selected runners with defined steps and permissions.
3. Restore dependencies deterministically from lockfiles; a cache may accelerate restore but must be disposable and contain no secrets.
4. Build and test. Use matrices where platform or runtime variation matters; preserve reports as artifacts.
5. Package once. Record a digest and build provenance where supported.
6. Publish to a registry and promote the same immutable artifact through environments.
7. Use environment controls, health checks, smoke tests, and traffic strategy to limit impact.
8. If verification fails, deploy a known-good artifact or roll forward. Plan data migrations separately.
9. Grant only required token permissions. Prefer short-lived OIDC federation over long-lived cloud keys where supported.
10. Treat workflow files, actions, caches, and runner state as supply-chain dependencies.

## Concept map

| Stage | Evidence | Main risk |
|---|---|---|
| Trigger and checkout | Revision and event identity | Wrong filter or untrusted code |
| Restore/build | Reproducible output | Mutable inputs or environment drift |
| Test and quality gate | Reports and pass/fail | Missing coverage or flaky checks |
| Package and attest | Artifact and provenance | Source/output mismatch |
| Publish/promote | Same digest in each environment | Rebuild or mutable tag drift |
| Deploy/verify | Health and deployment status | False-positive health or incompatible overlap |
| Recover | Known-good version or roll-forward | Data changes and side effects may not reverse |

## End-to-end walkthrough

A pull request runs checks with a read-only token and no production secrets. A merge to protected main restores locked dependencies, builds, tests, packages an image, scans it, and records provenance tied to the commit and workflow. The image is pushed by digest. Staging deploys that digest and runs smoke checks. Production applies environment controls and deploys the same digest gradually. If the user-facing error threshold trips, traffic returns to a known-good artifact while operators assess migration compatibility.

Event filters, expressions, and untrusted event fields need care. A workflow can be valid YAML and still never run due to a branch/path filter mismatch. Never execute fork-controlled code in a privileged job with production secrets.

## When to use it and tradeoffs

Automate repeatable checks and deployments where the evidence is meaningful. Extra jobs and gates can improve safety but increase latency and maintenance. Caches shorten builds but add trust and invalidation concerns. Gradual deployments limit exposure but need representative traffic and useful health signals.

Rollback is an application delivery action, not a universal undo button. Database migrations, external messages, and user-visible side effects may not be reversible. Design backward/forward compatibility before release.

## What later lessons cover

The concepts lesson follows a change from event to artifact promotion and recovery. References cover delivery models, Actions workflow syntax, builds/tests and dependencies, artifacts/provenance, deployment/recovery, and credentials/security. Practice designs a secure production pipeline; interview preparation covers rollout decisions.

