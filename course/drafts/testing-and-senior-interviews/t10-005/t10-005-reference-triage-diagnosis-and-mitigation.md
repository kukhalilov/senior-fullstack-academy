# debugging production incidents and root cause analysis — Reference: Evidence-driven troubleshooting and safe service restoration

# Scope and version

This reference covers the supplied triage, hypothesis, evidence and mitigation vocabulary. It teaches the reasoning model, not diagnostic commands; detailed tools are in t09-013. Google SRE recommends restoring service, testing hypotheses, recording results and considering experiment side effects. Sources checked 2026-11-17. [Effective troubleshooting](https://sre.google/sre-book/effective-troubleshooting/) [Incident response workbook](https://sre.google/workbook/incident-response/)

# How this group fits the mental model

Triage limits harm and frames scope. Diagnosis gathers evidence and tests competing explanations. Mitigation changes the system to reduce current impact; recovery verification establishes that users are better served. These activities can overlap, but a technical fix and a proven recovery are not the same event.

# Supplied names explained

- `Triage` — Rapidly assessing impact, urgency and safe next actions. Triage is not a complete root-cause investigation; its purpose is to prioritize response.
- `Blast radius` — The users, services, regions, data or functionality exposed to the failure or to a proposed action. Estimate it before expanding a rollout, changing a dependency, or applying a mitigation.
- `Impact assessment` — A structured view of who/what is affected, how severely, since when, and what workaround exists. Include data integrity and delayed effects, not just availability.
- `Symptom versus cause` — A symptom is the observed effect (for example elevated latency); a cause is an explanation of the mechanism producing it. A symptom can be measured directly, while a cause needs evidence and may have multiple contributing conditions.
- `Working hypothesis` — A provisional explanation used to guide investigation. Label it as uncertain, state what evidence would support/refute it, and revise it as observations change.
- `Falsifiable hypothesis` — A hypothesis that makes a prediction which could be contradicted by an observation/test. “The system is broken” cannot guide a discriminating test; “requests from region A time out because the database rejects new connections” can.
- `Evidence collection` — Preserving relevant observations such as metrics, logs, traces, deployment/configuration changes, test outcomes and timestamps. Capture a representative sample with context while considering privacy and production load.
- `Log correlation` — Relating log records across a request or time window using identifiers and timestamps. Correlation can reveal a sequence, but clock skew, sampling and missing fields can distort it.
- `Trace correlation` — Following a request’s spans across service boundaries to identify where latency/errors occur. Sampling and missing instrumentation can leave gaps; a trace is one sample, not a population-level rate.
- `Metric correlation` — Comparing time-series indicators such as latency, error rate, saturation and traffic. A common time pattern narrows hypotheses but does not prove one metric caused another.
- `Change correlation` — Comparing incident onset/scope with a deployment, config, dependency, traffic or infrastructure change. It generates a useful hypothesis; controlled comparison/rollback evidence is needed before claiming cause.
- `Deployment marker` — A timestamped event indicating a release or rollout stage in observability data. It helps align telemetry and change history but can be incomplete or have clock/reporting delay.
- `Dependency failure` — A failure or degraded behavior in a service/data store/API the application relies on. Determine whether the dependency is unavailable, slow, rejecting requests, or behaving differently; “dependency is down” may be too broad.
- `Resource exhaustion` — A service reaching a limit such as CPU, memory, file handles, connections, or thread capacity. Confirm the saturated resource and affected workload; adding capacity without understanding demand can move or worsen the bottleneck.
- `Queue backlog` — Work accumulating faster than a consumer processes it, causing delay and potentially increasing memory/storage pressure. Check arrival/processing rates, oldest-message age, retry/dead-letter behavior, and downstream impact.
- `Traffic spike` — An increase or shift in request volume/pattern. Distinguish legitimate demand, retry amplification, abusive traffic and a routing change; the same request count can stress different paths differently.
- `Configuration drift` — Production configuration differing from the intended or reviewed configuration. Compare actual applied values safely; config can drift through manual edits, old deployments, environment overrides or incomplete rollout.
- `Feature flag rollback` — Changing a feature flag to disable/revert behavior for some or all users. It can reduce exposure quickly, but check flag targeting, cached values, dependent data formats and whether the flag actually guards the failing path.
- `Code rollback` — Reverting a release to a known prior application version. Verify schema/data compatibility, stateful side effects and rollout completion; a rollback can be unsafe if newer code has written data older code cannot read.
- `Traffic shift` — Redirecting some/all requests among regions, clusters or versions. Use staged, monitored movement and assess destination capacity and state consistency; traffic shift can spread a problem if the destination shares the same dependency.
- `Load shedding` — Deliberately rejecting or dropping lower-priority work to protect core service from overload. Make the choice explicit, communicate affected functionality, and verify that retries do not amplify load.
- `Graceful degradation` — Serving reduced but useful functionality when a dependency/capacity is impaired. Define which features may degrade and protect essential invariants such as data consistency and authorization.
- `Capacity expansion` — Increasing available compute, connection or processing capacity to relieve a proven capacity constraint. It may be a safe mitigation, but can increase downstream load or costs and should not replace investigation of demand/inefficiency.
- `Failover` — Switching service to a secondary instance/region/system. Check replica freshness, capacity, dependencies and consistency before switching; failover can reveal latent configuration differences or overload the standby.
- `Mitigation verification` — Confirming that the chosen action reduced the intended impact and did not introduce unacceptable side effects. Compare expected and actual indicators after the action.
- `Customer impact verification` — Checking the user-facing task/status for affected cohorts rather than assuming infrastructure health means users recovered. Use representative workflows and support/customer signals where appropriate.
- `Recovery validation` — A broader check that service indicators and critical workflows have returned to acceptable state, data is consistent, and delayed work/dependencies are under control. Recovery may require a watch period.
- `Reproduction after mitigation` — Recreating the failure after service is stable to understand the mechanism. Prefer a controlled staging/test environment or narrowly scoped experiment; do not re-trigger user harm in production merely to obtain a cleaner explanation.

# Cross-item comparison

**Symptom, trigger, contributor, cause:** A symptom is the observed failure; a triggering event may precede it; contributing factors make the event more likely or impactful; a causal explanation links evidence to the outcome. Do not treat temporal sequence alone as causation.

**Mitigation vs permanent fix:** Mitigation limits current harm and may be temporary/reversible. A permanent fix removes or reduces a failure mechanism and needs engineering validation. A rollback can mitigate without repairing the underlying defect.

**Evidence types:** Metrics show aggregate trends; logs describe individual events; traces connect a request path; deployment/configuration markers align changes. Combine them while accounting for sampling, clock differences and confounders.

**Traffic shift vs failover vs load shedding:** A traffic shift changes where work goes; failover activates a standby path/system; load shedding reduces accepted work. Each has different capacity and consistency risks. No within-group comparison applies to a single item.

# Examples

### Hypothesis testing with deployment and database signals

Checkout latency rises after a new release. Hypotheses include a code-path regression, database saturation, or an external payment slowdown. Compare affected and unaffected regions/versions; inspect traces for where time accumulates; check database connection/saturation metrics; and review relevant deployment markers. A low-risk traffic shift or flag disablement can mitigate and provide before/after evidence. Document that evidence before calling the release the root cause.

### Queue backlog mitigation

An asynchronous queue grows while downstream writes fail. First determine whether producers are retrying and whether consumers are making progress. If core synchronous requests are also affected, load shedding or pausing a noncritical producer may protect the database. Verify oldest-message age and downstream capacity before resuming; simply adding consumers can increase pressure on the failing database.

### Safe recovery check

After rollback, compare success rate and latency for affected customers, run a representative checkout workflow, inspect data consistency, and watch queued retries. If metrics recover but orders are duplicated, the service is not fully recovered. Record remaining repair work and keep the incident open or in a recovery-watch state according to local criteria.

# Common mistakes

- Promoting a plausible hypothesis to fact in an incident channel.
- Treating a deployment marker near onset as causal proof.
- Running a test from a different network/identity and overgeneralizing its result.
- Turning on expensive logging or experiments without evaluating their side effects.
- Expanding capacity without checking downstream bottlenecks.
- Failing over before checking standby freshness/capacity.
- Shifting traffic to a destination that shares the same failing dependency.
- Declaring a feature-flag disablement complete without checking targeting/caches.
- Rolling back code without considering schema and data compatibility.
- Reproducing a failure in production and harming users again.
- Verifying infrastructure health but not user-facing workflow/data correctness.

# Knowledge checks with answers

1. **What makes a hypothesis falsifiable?** It predicts observations that could prove it wrong, allowing a discriminating test.
2. **Does correlation with a deployment prove causation?** No. It focuses investigation; compare evidence and alternative explanations.
3. **Why can adding capacity make an incident worse?** It may push more work into a saturated downstream service or intensify cost/resource pressure.
4. **When is reproduction after mitigation appropriate?** When service is stable and the test can be done safely in a controlled environment or scoped experiment.
5. **What is the difference between mitigation verification and recovery validation?** Mitigation verification checks that the action reduced impact; recovery validation checks broader service/user/data health and delayed effects.

# Sources

- [Google SRE effective troubleshooting](https://sre.google/sre-book/effective-troubleshooting/)
- [Google SRE emergency response](https://sre.google/sre-book/emergency-response/)
- [Google SRE incident response workbook](https://sre.google/workbook/incident-response/)
- [Managing incidents](https://sre.google/sre-book/managing-incidents/)
