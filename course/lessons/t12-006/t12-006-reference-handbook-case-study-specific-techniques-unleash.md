# end-to-end system design case studies — Reference: Unleash

Sources: [HLD Handbook](https://hld.handbook.academy/), [Unleash architecture overview](https://docs.getunleash.io/get-started/unleash-overview), [Unleash feature flags](https://docs.getunleash.io/concepts/feature-flags), [Unleash context](https://docs.getunleash.io/concepts/unleash-context), [Unleash A/B testing](https://docs.getunleash.io/guides/a-b-testing), [Unleash impression data](https://docs.getunleash.io/concepts/impression-data), [Unleash flag lifecycle](https://docs.getunleash.io/concepts/technical-debt), [Unleash best practices](https://docs.getunleash.io/guides/feature-flag-best-practices).

## Scope and version

This lesson covers Unleash as a feature-flag service and the architecture choices around evaluating flags, safely releasing changes, and measuring experiments. Product capabilities, editions, API names, and SDK behavior can change; the official docs were checked on 2026-11-21. Consult the current docs for the exact SDK, deployment mode, token type, environment, and edition. A flag decides application behavior; it is not an authorization system or a substitute for deployment rollback.

## How this group fits the mental model

Treat a feature flag as remotely managed configuration that selects among code paths already present in an application. The flag service manages definitions and targeting; an SDK or evaluation service supplies the decision; application code implements the behavior and safe fallback. This lets a team deploy code separately from exposing it, gradually widen exposure, and quickly disable a feature when its guardrails fail.

There are two distinct workflows. **Progressive delivery** asks whether the change is safe to expose more broadly, using operational signals such as errors, latency, saturation, and support impact. **Experimentation** asks whether a treatment changes a predeclared outcome, requiring valid assignment, exposure measurement, and statistical analysis. A rollout percentage alone does not make a causal experiment.

## Supplied names explained

- **Feature flag / toggle:** named conditional behavior with a lifecycle and a configuration per environment. Unleash supports flag types and lifecycle metadata; flag type helps communicate intended use but does not enforce sound application behavior.
- **Project and environment:** organize flags and their environment-specific configuration. Keep development, test, and production behavior deliberately separated; promote reviewed changes rather than assuming every environment has identical targeting.
- **Activation strategy:** a rule that determines whether a flag is enabled for the supplied context. Strategies can be combined; understand whether the combination is OR-like and how constraints apply in the selected strategy before composing rules.
- **Unleash Context:** evaluation input such as `userId`, `sessionId`, `remoteAddress`, `appName`, `environment`, and custom properties. Static fields are set during SDK initialization and dynamic fields can vary by evaluation. Missing context fields can make a strategy fail to match.
- **Constraint:** predicate on a context property, such as equality, membership, or a range, depending on supported operators and field types. Do not pass untrusted client-supplied attributes as authoritative entitlements.
- **Gradual rollout and stickiness:** percentage allocation based on a stable identity/context value, so the same unit tends to receive a stable cohort assignment. A missing or changing stickiness field can cause a user to move between treatments; use a randomization unit aligned with the feature and experiment.
- **Variant:** named treatment and optional payload, used when an enabled/disabled value is insufficient. Variant assignment must remain consistent with the experiment's unit and its exposure event.
- **Backend SDK:** retrieves flag configuration and evaluates strategies locally from cached configuration. This avoids a network round trip on each decision, but configuration changes propagate with polling/streaming behavior and may be stale during outages.
- **Frontend SDK / Frontend API / Edge:** frontend clients should receive evaluated flags rather than backend credentials or the full sensitive configuration. Unleash documents evaluation in its server/Edge path for frontend use; treat exposed flags and context as public to the client and never encode secrets or permission decisions in them.
- **Impression data:** opt-in evaluation/exposure events that can be forwarded to analytics. An evaluation event is not necessarily proof that the user saw or used the feature; define exposure at the product event boundary when that distinction matters.
- **Impact metrics and release monitoring:** operational/product time-series signals used to monitor a rollout. Aggregate impact monitoring is different from user-level attribution in an A/B analysis.
- **Stale flag, archive, cleanup:** lifecycle tools help find flags that outlived their purpose. Marking stale is a cleanup signal, not a behavior change; remove code references and verify deployed clients before archiving because archived flags are no longer served and clients treat them as off.

## Architecture and request flow

1. **Author the flag.** Define its purpose, owner, expected lifetime, type, environments, default behavior, and cleanup plan. Keep the number of simultaneously active flags manageable: each flag can multiply code-path combinations and test burden.
2. **Define the context contract.** Choose the targeting identity and authoritative attributes. Use stable IDs for stickiness; minimize personal data and do not put secrets in context. For authorization, evaluate server-side policy independently of a rollout flag.
3. **Configure strategies and variants.** Specify who qualifies, cohort allocation, constraints, and variants per environment. Review the combined logic and test representative contexts, including absent fields and boundary values, in a playground or equivalent evaluation harness.
4. **Fetch and evaluate.** Backend SDKs cache definitions and evaluate locally; the control plane is not normally in the request path for each backend check. Frontend integrations use an evaluated-flag path so sensitive rules and backend keys are not shipped to the browser. Treat cache age, refresh interval, offline behavior, and safe default as explicit availability choices.
5. **Serve application behavior.** Branch on the returned treatment using code that remains safe if the flag is unknown, stale, or unavailable. A flag cannot atomically coordinate a database migration or retract an already-sent email/payment; use expand-and-contract schema changes and separately managed side effects.
6. **Observe and decide.** For canary release, monitor operational guardrails and roll back/disable exposure when thresholds are breached. For an experiment, record stable assignment and valid exposure, define primary and guardrail metrics before launch, account for exclusions and interference, and use an analysis method appropriate to repeated looks or sequential allocation.
7. **Close the lifecycle.** Keep, discard, or extend the feature, then remove obsolete branches and tests. Mark stale, verify remaining code use, remove references, and archive only when clients no longer need the flag. Preserve audit/experiment data under the product's retention policy.

## Cross-item comparison

| Need | Unleash capability/pattern | What it does not guarantee |
| --- | --- | --- |
| Gradual code exposure | Activation strategies and percentage rollout | Safety by itself; monitor real operational guardrails and preserve rollback-compatible data changes |
| Targeted release | Context and constraints | Secure authorization; attributes may be incomplete or untrusted |
| Multiple treatments | Variants and stickiness | A valid statistical experiment unless assignment and outcome collection are sound |
| Fast backend decisions | Local SDK evaluation over cached configuration | Instant control-plane propagation or current configuration during a partition |
| Frontend feature selection | Evaluated frontend flags through server/Edge integration | Secrecy of the feature's visible behavior or permission enforcement in client code |
| Emergency disable | Kill switch / flag state change | Reversal of side effects, incompatible schema changes, or already-running processes without propagation |
| Experiment attribution | Impression data plus application analytics | That a flag check means rendered/consumed exposure; event semantics must be defined |

Compared with a homegrown boolean in a database, a flag platform adds targeting, environment organization, SDKs, auditability, lifecycle, and rollout controls. Compared with a deployment canary, a feature flag can expose a code path without changing the deployed binary, but it does not roll back a bad artifact or isolate resource consumption automatically. Compared with authorization, rollout flags control release audience while permission checks enforce access; keep the two separate.

## Examples

### Safe checkout rollout

Deploy compatible code with a new checkout path behind a flag. Begin with internal test identities, then a small, stable production cohort. Measure payment errors, duplicate-charge reports, completion latency, and support contacts. If a guardrail crosses its threshold, disable the flag while preserving the old path. Keep the database schema readable by both versions until rollout completes. Once the release is stable, remove the old branch and flag. This is progressive delivery; it is not evidence of improved conversion unless assignment and outcome analysis support that claim.

### Controlled experiment

Randomize by account if household members share a cart, assign a stable variant, and emit an exposure event only when the treatment is actually rendered. Record conversions with the same account key and a defined attribution window. Predeclare one primary metric, guardrails, exclusions, stopping rule, and treatment analysis. Check sample-ratio mismatch, missing impressions, contamination, and novelty effects. Avoid repeatedly checking ordinary fixed-horizon significance and stopping at the first favorable result.

### Offline client behavior

A backend SDK has cached configuration and loses contact with Unleash. Decide whether it may continue with the last known configuration, default off, or fail the request. For a cosmetic change, cached behavior may be acceptable; for an emergency kill switch or high-risk operation, define a more conservative path and an operational fallback. Test both configuration age and application restart behavior. Never depend on flag availability to authorize a sensitive operation.

## Common mistakes

- Treating a percentage rollout as a randomized causal experiment.
- Using an unstable or missing context field for stickiness, causing assignment churn or a variant lookup to fail.
- Putting secrets, confidential targeting rules, or authorization decisions in frontend-visible flags.
- Assuming a flag change reaches every SDK instantly; local caches and network partitions create propagation delay.
- Making one flag control incompatible data migrations or irreversible side effects.
- Recording assignment/evaluation as if it proved a feature was rendered or used.
- Repeatedly inspecting experiment results without a statistical plan, or changing primary metrics after seeing outcomes.
- Keeping stale flags and dead branches indefinitely, increasing test combinations and risk.
- Archiving a flag before removing code dependencies; archived flags are no longer served to SDKs.
- Using a kill switch as a substitute for artifact rollback, incident response, or access control.

## Knowledge checks with answers

1. **A feature is enabled for 10% of users. Is that an A/B test?** Not necessarily. It is a rollout unless assignment and outcome measurement support a valid experiment with an analysis plan.
2. **Where should a payment authorization check live?** In trusted server-side authorization/business logic, independent of a rollout flag or client evaluation.
3. **Why can a backend SDK continue using an old flag value after a change?** It evaluates cached configuration locally; updates propagate asynchronously and may be delayed by polling or network failure.
4. **Does an impression event prove that a user saw the treatment?** Only if the event is emitted at a point that matches the product's exposure definition; an evaluation call may occur before rendering or interaction.
5. **What should happen before archiving a stale flag?** Remove code references, verify no live clients require it, preserve needed experiment/audit records, and then archive under the lifecycle policy.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder material with a topic-specific system-design lesson. Official Unleash documentation was checked for backend local evaluation/caching, frontend evaluated-flag architecture, context and stickiness, flag and variant behavior, impression events, A/B testing guidance, and stale/archive lifecycle. The lesson distinguishes rollout from causal experimentation and flagging from authorization. No material factual issues or missing core architectural concepts were found in the supplied scope.
