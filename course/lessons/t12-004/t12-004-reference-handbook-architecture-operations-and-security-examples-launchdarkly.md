# architecture patterns multi-region tenancy and reliability — Reference: LaunchDarkly

Sources: [HLD Handbook](https://hld.handbook.academy/), [LaunchDarkly feature flags](https://launchdarkly.com/how-it-works/feature-flags/), [LaunchDarkly React Web SDK](https://launchdarkly.com/docs/sdk/client-side/react/react-web), [LaunchDarkly kill-switch flags](https://launchdarkly.com/docs/home/flags/killswitch), [LaunchDarkly deployment strategies](https://launchdarkly.com/docs/guides/infrastructure/deployment-strategies).

## Scope and version

LaunchDarkly is a commercial feature-management service. This reference explains feature flags and the service’s documented concepts; it is not a promise of universal propagation time, availability, or plan entitlement. SDK behavior, supported frameworks, evaluation mode, and platform features change, so verify current documentation and the exact SDK version.

## How this group fits the mental model

A deployment places code in an environment. A release changes which users experience that code. A feature flag can separate those decisions: deploy a dormant or guarded code path, then change exposure through a flag rule or rollout. This can reduce release blast radius and support controlled experiments or a rapid kill switch, but it introduces a runtime dependency, additional branches, configuration risk, and cleanup work.

LaunchDarkly provides a control plane for defining flags and targeting rules and SDKs that evaluate them for application contexts. A client-side SDK can evaluate only flags made available to it; if a flag cannot be evaluated, an SDK fallback value may be used. Server-side SDKs and client-side SDKs have different key/security models. Never expose a server-side secret SDK key in a browser bundle.

## Supplied names explained

- **LaunchDarkly** — A feature-management platform for defining feature flags, evaluating them through SDKs, targeting user/context cohorts, and controlling progressive exposure. The broader product may include experimentation and release workflows, subject to current product configuration and plan.

### Flag categories and life cycle

- **Release flag** separates deploying code from enabling the experience. Roll out to internal users, then a small cohort, then progressively broader exposure while comparing technical and product signals.
- **Kill switch** is designed to turn off a risky feature or dependency path quickly. It should have a safe fallback branch, simple targeting, a clear owner, and tests for the disabled mode. Do not rely on a flag service for a critical safety function unless local fallback and outage behavior are explicitly sound.
- **Experiment flag** assigns variants and records exposure/outcomes. Randomization, identity stability, sample size, metric definitions, and privacy consent must be designed; merely toggling variants does not make a valid experiment.
- **Operational/configuration flag** changes runtime behavior, such as a rate limit or backend route. Its validation, audit, access policy, and rollback matter because it can act like production configuration.

Use a flag lifecycle: define owner, category, environments, default/fallback, targeting, expiry/cleanup criteria, and dashboards; test both branches; roll out gradually; monitor user and service indicators; remove temporary flags when code convergence is complete. Permanent flags need an explicit owner and reason. Avoid flag combinations that create an untested state explosion.

### Evaluation and resilience

Client applications may initialize asynchronously. Render a deliberate loading state or use a safe default rather than briefly showing the wrong high-impact path. Context keys should be stable enough for targeting and should not contain raw personal data unless justified and protected. Limit attributes and ensure targeting rules do not accidentally reveal or grant tenant data.

For outages, decide whether the SDK serves last-known configuration, local defaults, or fallback values; that behavior varies by SDK and configuration. A flag change also does not instantly roll back a database migration or already-completed side effect. Pair progressive rollout with backward-compatible schema changes, observability, and a rollback plan. Measure the propagation and control-path behavior you rely on instead of assuming the dashboard update is instantaneous.

## Cross-item comparison

| Mechanism | Controls | Main boundary |
|---|---|---|
| Feature flag | Runtime behavior/exposure of deployed code | Does not undo deployment, schema change, or completed side effects |
| Canary deployment | Which infrastructure/instances receive a new build | May overlap with flags but changes the deployment rollout boundary |
| A/B experiment | Random assignment and outcome measurement | Requires valid experimental design and analytics, not just a flag |
| Configuration service | Operational parameters | Needs validation, access control, audit, and outage defaults |
| Authorization policy | Whether a principal may perform an action | A rollout flag is not a security boundary or durable entitlement authority |

## Examples

**Progressive checkout release.** Deploy code that supports both old and new checkout paths. Start with an internal cohort, then a low percentage. Monitor successful-order rate, latency, error rate, and payment-provider outcomes by flag variation. If the new path regresses, disable the flag and confirm traffic returns to the old compatible path. Keep the database schema backward compatible until both paths are removed.

**React client evaluation.** Initialize the SDK using its browser-safe client-side identifier and authenticated context. If the feature is not available to the client SDK or initialization has not completed, render the documented fallback/loading behavior. The API independently checks authorization and tenant access; a browser flag only controls presentation and is never trusted to protect data.

## Common mistakes

- Confusing deployment, release, experiment, and authorization.
- Leaving temporary flags indefinitely, making every future change reason about an expanding branch matrix.
- Assuming a kill switch undoes irreversible work or that every SDK receives changes instantly during an outage.
- Putting a server credential in frontend code or sending unnecessary personal information as targeting context.
- Using flags as the only enforcement for server-side access control.
- Rolling out by percentage without defining stable context identity, success metrics, or a stop condition.
- Enabling a new path while schema/data changes are incompatible with the old path needed for rollback.

## Knowledge checks with answers

1. **What distinction do feature flags enable?** Code can be deployed before broad user exposure; a flag can control release/targeting independently of the deployment operation.
2. **Can a frontend flag protect an API endpoint?** No. The server must independently authenticate and authorize each request.
3. **What should a kill-switch flag define?** A safe off-path, simple rules, owner, fallback/outage behavior, monitoring, and how to test/retire it.
4. **When should a temporary release flag be removed?** Once rollout is complete, rollback is no longer needed, and code can be simplified and tested without the old branch.
