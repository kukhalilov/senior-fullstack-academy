# architecture interviews tradeoffs requirements and constraints — Problem: Plan a safe full-stack deployment and rollback

## Goals

Describe a verifiable path from reviewed source to production, deploy compatible application and database changes, and choose recovery actions from observed evidence.

## Worked example

A release adds a non-null database field, changes an API response, and updates a React page. During rollout, old and new API instances can serve traffic at the same time, and browser clients may remain open across the deployment.

### Build and promotion

On a trusted branch or reviewed pull request, CI restores dependencies, builds in a pinned environment, runs unit/integration/security checks, and creates a versioned artifact. Build once and promote that artifact through test and production so each environment does not silently compile different source. Record the commit, artifact digest, configuration version, and migration version. Frontend assets should be content-hashed and served with cache headers that let old HTML continue to load the assets it references.

Credentials for production belong in a protected deployment environment or a secret manager. Limit the workflow permissions and secret availability; untrusted pull-request code must not receive production credentials. An environment can gate production deployment and restrict allowed branches. Validate configuration before rollout, and avoid logging secrets or personally sensitive values.

### Expand, deploy, contract

The database change must tolerate overlap between old and new code. First add a nullable or defaulted column without requiring old code to write it. Deploy code that can read both old and new shapes and writes the new value where appropriate. Backfill existing rows in bounded, observable batches. After all writers and data are ready, enforce the new constraint in a later change. Remove old compatibility only after old instances and long-lived clients no longer depend on it. This sequence is often called expand-and-contract; exact steps depend on the database's locking and DDL behavior.

Deploy to a staging environment with production-like topology and representative data. Run smoke tests and verify migrations, health, logs, metrics, traces, and key user journeys. In production, use an appropriate rolling, canary, or blue/green strategy. Send limited traffic first when risk warrants it, compare error rate and latency against a baseline, then increase traffic. Readiness checks should keep an instance without required dependencies from receiving traffic; liveness checks should detect a process that cannot recover. A health endpoint is not proof that every user workflow works.

### Decide whether to roll back

If the release causes a clear regression, stop promotion and reduce or shift traffic. Roll back application code when the prior version remains compatible with the schema and persisted data. Database rollback is not always safe: a destructive migration or newly written data may make reversal lossy. Prefer a forward fix or compensating migration when necessary. Keep feature flags and traffic controls separate from schema changes; disabling a feature can limit impact while a repair is prepared.

## Exercises

1. The new code expects a required `Customer.Region` field, but old instances do not write it. Put the schema, code, and backfill steps in a safe order.
2. A canary has a 2% HTTP 500 rate while the baseline has 0.2%; CPU is normal and database latency doubled. What do you do before increasing traffic?
3. A deployment job uses a repository secret and runs on every pull request from forks. Identify the risk and propose a safer boundary.
4. The database migration drops a column and the previous application version needs it. Is application rollback safe? What recovery options remain?

## Progressive hints

1. Old and new instances must both work during the overlap window.
2. Compare the canary with a baseline and check user-impacting signals before promoting.
3. A workflow executing untrusted code should not have access to production credentials.
4. A migration can be irreversible in practice even if a reverse SQL statement exists.

## Complete solutions

1. Add the column in a backward-compatible form; deploy code that tolerates existing nulls and writes the value; backfill existing rows; verify completeness; enforce non-null only after all deployed writers maintain the invariant. Remove compatibility in a later release after all old readers are gone.
2. Halt or roll back the canary, preserve diagnostic evidence, correlate the increased database latency with the change, and inspect query plans, saturation, and traces. Do not scale traffic while the error and latency signals are worse. Decide on rollback or a small fix based on compatibility and impact, then repeat validation.
3. Fork pull requests can modify workflow-executed code and must be treated as untrusted. Do not expose production secrets to those jobs. Separate build/test permissions from deployment permissions, use a protected branch and production environment gate, grant only required token scopes, and obtain short-lived identity credentials where supported.
4. No: the old application can fail against the dropped column, and restoring the column may not restore its data. Use a forward-compatible application repair, restore from a verified backup if data loss warrants it, or perform a carefully planned compensating schema/data migration. This is why destructive contract steps wait until old code is retired and backups/recovery have been tested.

## Tests and edge cases

- Migration lock duration, table size, backfill throttling, transaction behavior, and database-specific DDL semantics.
- Mixed application versions, mobile/long-lived clients, cached frontend HTML, and asset retention across rollout.
- Secret scope, workflow token permissions, artifact provenance, dependency pinning, and image/package scanning.
- Readiness versus liveness behavior, startup warm-up, dependency outages, and whether health checks themselves overload dependencies.
- Canary metrics need enough traffic and time to be meaningful; compare equivalent cohorts and account for normal variance.
- Backups must be restorable within the required recovery-point and recovery-time objectives.
- Rollback can restore code but cannot automatically undo emails, payments, external events, or data already observed by users.

## Reflection questions

1. Which changes are safe to roll back independently: frontend, API, schema, and data?
2. What evidence would make you continue a rollout, pause it, or roll it back?
3. How do immutable artifacts and deployment records improve incident diagnosis?

## Sources

- [ASP.NET Core: Host and deploy](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/?view=aspnetcore-10.0)
- [.NET: Application publishing overview](https://learn.microsoft.com/en-us/dotnet/core/deploying/)
- [GitHub Actions: Deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments)
- [GitHub Actions: Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
