# CI CD builds tests artifacts deployment and rollback — Reference: Environment gates, deployment strategies, health checks, and rollback limits

Sources: [Deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments), [Managing environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).

## Scope and version

Covers the exact assigned inventory against current GitHub Actions documentation checked 2026-11-20. Runner images, action runtimes, product-plan capabilities, and event details can change independently; verify current behavior before depending on it.

### Plan and visibility limits

On GitHub Free, environments and their secrets/protection features are available for public repositories; on private/internal repositories these require Pro, Team, or Enterprise. On Free, Pro, and Team, required reviewers and wait timers are limited to public repositories. A YAML `environment:` declaration alone therefore does not guarantee an approval gate or environment secret access; confirm repository visibility and plan. [Deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments) · [Reviewing deployments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments)

## How this group fits the mental model

Deployment strategies manage traffic and version overlap. Pick health checks that reflect users, preserve artifact identity, and ensure schema compatibility across old/new application versions.

## Supplied names explained

- `Deployment environment` — A named deployment target with history and optional protection rules/secrets, subject to repository plan and visibility capabilities.
- `Environment secret` — A secret scoped to an environment and available to a job only after required environment protection passes.
- `Environment protection rule` — A condition that must pass before deployment jobs run, such as approval or a custom protection check.
- `Environment required reviewer` — A configured reviewer who must approve before an environment deployment proceeds, where plan/policy supports it.
- `Environment deployment branch restriction` — A rule limiting which branches/tags may deploy to that environment.
- `Deployment job` — A workflow job that targets an environment and performs release actions under its protection and secret rules.
- `Deployment status` — A recorded state for a deployment attempt, useful for history and status reporting but not a health proof by itself.
- `Rolling deployment` — Gradually replaces instances while old/new versions overlap; requires capacity and backward compatibility.
- `Blue-green deployment` — Maintains two deployment environments and shifts traffic between them; consumes extra capacity but supports a fast switch.
- `Canary deployment` — Exposes a small traffic fraction to a new version and expands only when measured criteria pass.
- `Traffic shifting` — Changing the proportion/routing of requests across versions during rollout.
- `Feature flag rollout` — Controls feature exposure separately from binary deployment; flags need ownership, safe defaults, and cleanup.
- `Progressive delivery` — A staged rollout that uses measurements and/or approvals to decide whether to expand exposure.
- `Deployment health threshold` — A measurable condition for pausing or failing rollout, ideally tied to user impact and adequate sample size.
- `Automatic rollback trigger` — A condition that initiates a rollback; it must be reliable and paired with a compatible previous artifact and data state.
- `Manual rollback` — An operator-directed restoration to a known-good release, requiring clear runbook, access, and compatibility knowledge.
- `Known-good artifact` — A previously verified immutable output available for recovery, identified by digest and associated provenance.
- `Rollback versus roll-forward` — Rollback restores previous behavior when safe; roll-forward applies a corrective change when reversal is unsafe or incomplete.
- `Database expand-and-contract migration` — A staged schema evolution: add compatible structures, migrate callers/data, then remove old structures after old versions are gone.
- `Backward-compatible schema change` — A data-contract change allowing the prior application version to continue operating during overlap.
- `Forward-compatible application version` — An application that tolerates schema changes introduced by a newer version, supporting safe deployment sequencing.
- `Irreversible data migration` — A transformation that cannot restore original data exactly; requires backup, compensation, or forward recovery planning.
- `Deployment smoke test` — A small live check after release that confirms a critical route/behavior, not full coverage.
- `Post-deployment verification` — Checks that deployed version and user-facing behavior match expected release state.
- `Release freeze` — A policy period restricting change deployment; it does not replace emergency-response procedures.
- `Deployment concurrency lock` — Serialization preventing conflicting deployments to the same target.
- `GitHub deployment history` — The platform record of environment release attempts and statuses, useful for audit and rollback discovery.
- `Failed deployment recovery` — The response path that diagnoses impact, pauses/rolls back/rolls forward, verifies data safety, and confirms restored service.

## Cross-item comparison

Rolling replaces instances; blue-green switches environments; canary expands traffic gradually. Rollback restores prior bits; roll-forward corrects forward. Data may not safely roll back with app code.

## Examples

A small traffic share receives a canary. If the defined user-facing error/latency threshold fails, pause and return traffic to the known-good version only if live data remains compatible.

## Common mistakes

Smoke checks are narrow. Canary thresholds need representative traffic/time. Old and new app versions must both tolerate the migration phase.

## Knowledge checks with answers

1. **What does a canary reveal?** Behavior of a limited release cohort under real traffic, compared with a control or baseline.
2. **Why is database rollback different from app rollback?** Data migrations can be irreversible or shared with old code; use compatible expand/migrate/contract steps.
3. **What makes a rollback decision operationally useful?** A measured trigger, known-good artifact, owner, and tested recovery path.
