# end-to-end system design case studies — Reference: Harness Feature Management & Experimentation (FME)

Sources: [HLD Handbook](https://hld.handbook.academy/), [Harness FME overview](https://developer.harness.io/docs/feature-management-experimentation/), [Harness Java SDK](https://developer.harness.io/docs/feature-management-experimentation/sdks-and-infrastructure/server-side-sdks/java-sdk/), [Harness metric design](https://developer.harness.io/docs/feature-management-experimentation/getting-started/overview/create-a-metric/), [Harness pipeline integration](https://developer.harness.io/docs/feature-management-experimentation/pipelines/), [Harness feature-flag alerts](https://developer.harness.io/docs/feature-management-experimentation/release-monitoring/alerts/automated-alerts-and-notifications/).

## Scope and version

Harness Feature Management & Experimentation (FME) combines feature flags, controlled rollouts, experiment assignment, metrics, and release monitoring. The official documentation was checked on 2026-11-17. SDK APIs, supported clients, statistical options, product entitlements, and pipeline steps evolve; use the specific SDK and account documentation for implementation details. This lesson separates safe delivery from causal measurement: a rollout can reduce release risk without proving that a treatment improved a product metric.

## How this group fits the mental model

A feature flag is a remotely configurable decision that lets an application choose a treatment, such as old checkout versus new checkout. The application asks a flag SDK for a treatment using a stable target identity and attributes. The SDK evaluates configured rules and returns a value; the application controls what that value means and must keep a safe default when configuration is absent or stale.

The same mechanism can be used for two different jobs. **Progressive delivery** exposes a change to a small audience, watches operational health, and increases or rolls back exposure. **Experimentation** randomly assigns eligible units to treatments and compares predefined outcomes to estimate impact. A canary chosen by risk, geography, or employee status is not automatically a randomized experiment. For causal conclusions, assignment, exposure, event collection, metrics, and statistical design must all be sound.

## Supplied names explained

- `Harness Feature Management & Experimentation (FME)` — Harness's feature-management and experimentation platform. It can evaluate flags and treatments through SDKs, target users or segments, allocate traffic, collect impressions/events, and monitor metrics. It supplies platform capabilities; application identity, safe defaults, event correctness, and experiment interpretation remain design responsibilities.

### End-to-end flow

1. **Define the decision.** State the feature's intended behavior, the kill/default behavior, who may see each treatment, and which product or operational metric determines success or harm. Do not use one flag as a substitute for server-side authorization.
2. **Model environments and treatments.** Create separate development, test, and production definitions as supported by the platform. Define a baseline and treatment with explicit defaults. Configuration updates should be reviewed, versioned or audited, and reversible.
3. **Identify the assignment unit.** Use a stable target key such as user, account, or device. The unit should match how the feature affects outcomes; if users in a household or organization influence one another, assigning at individual level can contaminate the comparison. Avoid unstable identities that change between sessions.
4. **Evaluate locally and safely.** The SDK evaluates a flag using its configuration and target attributes. Many SDKs cache definitions, and some can return a default when offline; verify the exact SDK behavior. Keep application behavior safe when evaluation fails, the flag is unknown, or stale configuration is present. Do not block a critical request indefinitely on flag-service availability.
5. **Target or allocate.** Rules may select by attributes or segments; a percentage allocation can split eligible targets across treatments. For an experiment, assignment should remain stable for the unit and period unless the design intentionally re-randomizes. Check that exclusions and targeting rules do not systematically skew treatment groups.
6. **Record exposure and outcomes.** An impression or exposure event connects the unit to the flag version/treatment actually served. Track outcome events with a stable identity, timestamps, and clear definitions. Avoid recording only assignment if the feature was never rendered or used; define whether the estimand is assignment-based or exposure-based and keep its analysis consistent.
7. **Roll out or analyze.** For a canary, inspect error rate, latency, resource use, and user harm before expanding exposure. For an experiment, predefine the primary metric, guardrails, sample unit, duration, exclusions, and analysis. Do not repeatedly peek and stop when results look favorable unless the statistical method supports sequential monitoring.
8. **Clean up.** When the feature is fully launched, remove obsolete branches and flags after the required rollback window. Archive or delete only after checking dependencies, historical analysis, and environments. A forgotten flag adds branches, test combinations, and operational confusion.

## Cross-item comparison

This group contains one platform, so no within-group comparison applies. Distinguish flag configuration from application code: the platform selects a treatment, but the application implements its behavior. Distinguish flags from authorization policy: a user should not gain a protected capability because a client-controlled flag says “on.” Distinguish canary rollout from randomized experiment: the former manages delivery risk; the latter aims to measure causal impact under statistical assumptions.

Also distinguish kill switches from rollback. Killing a flag can rapidly select a safe treatment if the code and dependencies remain compatible. It cannot undo database migrations, external messages already sent, or irreversible side effects. Design backward-compatible schema changes and compensating actions separately.

## Examples

### Progressive checkout release

Deploy code with the new checkout behind a flag. Start with internal test accounts, then a small production percentage. Verify that old and new paths both handle the same persisted order schema. Watch payment errors, completion latency, duplicate-charge signals, and support contacts. If a guardrail trips, kill the flag and keep the old path available. Increase rollout only after the change meets the predeclared release criteria. This is a staged rollout; unless users were randomly assigned and outcomes are measured correctly, do not claim it proves the new checkout improved conversion.

### Conversion experiment

Randomly assign eligible accounts to control or treatment using a stable account key. Record the flag configuration version and actual exposure, then record completed purchases with deduplicated order IDs. Compare a preselected conversion metric and guardrails such as refund rate and checkout latency. Ensure users are not counted multiple times as independent observations if assignment is by account. Check sample size and minimum detectable effect before launch; a statistically significant result can still be too small to matter commercially.

### Flag service outage

If an SDK cannot refresh configuration, it may continue with cached values or its configured default, depending on SDK and application behavior. A checkout flag should not make purchases unavailable simply because control-plane connectivity fails. Test a cold process with no cached config, a stale config, a malformed rule, and a timeout. Log evaluation errors without flooding logs or exposing user attributes.

## Metrics, statistics, and safety

Define events before the experiment. An impression means a target was assigned or evaluated in a particular way according to the platform's definition; an outcome event measures user behavior or system performance. Verify the documented semantics for the SDK/version you use. Missing impressions, duplicate events, clock skew, identity changes, late conversions, bot traffic, and cross-device behavior can bias results.

Choose one primary metric connected to the hypothesis and a limited set of guardrails. Examples include conversion per assigned account, revenue per eligible account, crash-free sessions, payment errors, or p95 latency. Denominators matter: clicks per impression differs from purchases per randomized account. Do not change metric definitions after seeing results. Separate statistical uncertainty from business importance, and account for multiple comparisons, repeated looks, seasonality, and novelty effects where relevant.

Experiment tooling does not guarantee randomization quality or causal validity. Review allocation, exposure parity, sample-ratio mismatch, pre-treatment covariates, interference, missing data, and instrumentation changes. If the system detects a low sample count or invalid configuration, it may not alert; do not interpret “no alert” as proof of no harm.

## Common mistakes

- Treating a feature flag as an authorization control or security boundary.
- Assuming a kill switch undoes side effects, schema changes, or external transactions.
- Calling a targeted employee or percentage canary an experiment without valid random assignment and outcome measurement.
- Using a changing or non-unique target key that assigns the same person to inconsistent treatments.
- Confusing flag evaluation, impression, exposure, and outcome events.
- Counting events without deduplication or ignoring account-level clustering and interference.
- Changing metrics or stopping at a favorable time after repeated peeking.
- Deploying only one side of a flag branch, leaving the disabled treatment untested.
- Forgetting temporary flags and accumulating permanent conditional complexity.
- Assuming SDK offline, cache, or default behavior without verifying the concrete SDK and version.

## Knowledge checks with answers

1. **What does a feature-flag service decide?** It evaluates configured rules and allocation to return a treatment for a target; application code implements that treatment and must handle failure safely.
2. **Does a staged rollout prove causal impact?** No. It limits exposure and can reveal operational problems. A causal experiment needs a suitable assignment and measurement design.
3. **What is the difference between an impression and an outcome event?** An impression records treatment assignment/evaluation under the platform's definition; an outcome records behavior or system results. Verify exact SDK semantics.
4. **Does killing a flag reverse a database migration?** No. It changes the selected code path if the app supports it; database and external side effects need separate compatibility and recovery designs.
5. **Why use a stable randomization unit?** Stable assignment prevents one unit from switching treatments and allows outcomes to be attributed to the intended group; choose the unit based on interference and product behavior.

## Practice

Plan an experiment for a new search ranking. Define eligibility and randomization unit, control and treatment, exposure event, primary metric, guardrails, sample-size rationale, rollout stages, outage behavior, and cleanup plan. Explain how you would distinguish an operational canary from an experiment and what would make the results inconclusive.
