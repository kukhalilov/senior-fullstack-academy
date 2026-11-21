# architecture interviews tradeoffs requirements and constraints — Problem: Investigate a latency regression after release

Sources: [Google SRE service-level objectives](https://sre.google/sre-book/service-level-objectives/), [Google Cloud reliability guidance](https://docs.cloud.google.com/architecture/framework/reliability), [Azure safe deployments](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments)

## Goals

Practice user-centered SLI and percentiles, traces and dependency breakdown, rollback and feature flags, data-plane versus client evidence under interview constraints.

## Worked example

p50 latency is unchanged, but users report delays after a deployment. Describe evidence collection, blast-radius reduction, rollback decision, and follow-up.

Check p95/p99 and user journey metrics by route, region, device, and release cohort. Compare traces and resource saturation to the prior version; distinguish server, database, dependency, and browser main-thread time. Stop expansion or roll back when impact exceeds policy; preserve evidence, then reproduce and add a regression guard.

## Exercises

1. Define the user-facing latency SLI and compare the affected release cohort with a stable baseline.
2. p50 is unchanged, but p99 doubled in one region. What dimensions and dependency spans do you inspect?
3. Decide when to stop rollout, roll back, or mitigate forward. Which signals and authority govern that choice?
4. Preserve useful incident evidence while avoiding uncontrolled personal or credential data.

## Progressive hints

1. Averages and p50 can hide a tail or cohort-specific regression.
2. Separate client/browser, edge, application, database, and downstream time; correlate traces with saturation and errors.
3. Reduce blast radius first; use the service's defined guardrails rather than an arbitrary universal threshold.
4. Compare release IDs and timestamps, queue age, resource saturation, and dependency behavior.

## Complete solutions

1. Use an operation-specific latency objective under a defined workload and segment by release, region, route, and client class. Compare equivalent windows and account for traffic mix.
2. Inspect p95/p99 distributions, trace spans, resource saturation, queue age, retries, database plans/latency, dependency calls, and real-user browser timing for the affected cohort.
3. Pause expansion when agreed rollout guardrails are breached. Roll back if the change is the likely cause and rollback is safe; otherwise mitigate forward with incident authority, preserve diagnostics, and verify recovery.
4. Retain bounded logs/traces with correlation IDs and release metadata; redact credentials and minimize sensitive fields. Record actions and timestamps for later review.

## Tests and edge cases

Check low-volume percentile instability, traffic-mix changes, one-region degradation, client-only regressions, missing traces, sampling bias, a rollback that worsens schema compatibility, and recovery confirmation after mitigation.

## Reflection questions

Which signal would demonstrate user impact most directly, and what blind spot remains?


Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
