# observability logs metrics tracing alerts and OpenTelemetry — Reference: Shared telemetry names, service objectives, budgets, and actionable alerts

Sources: [official reference 1](https://opentelemetry.io/docs/specs/semconv/), [official reference 2](https://sre.google/workbook/alerting-on-slos/), [official reference 3](https://prometheus.io/docs/alerting/latest/alertmanager/).

## Scope and version

This guide explains the assigned observability inventory group in the context of the current OpenTelemetry specification snapshot and Prometheus 3.x/current documentation checked 2026-11-20. The terminology and component maturity can evolve. The observability profiles signal and individual Collector components do not have a universal stability guarantee.

## How this group fits the mental model

Semantic conventions make telemetry interoperable by agreeing on names and meanings, while explicit stability and schema migration protect consumers from silent changes. SLOs put user outcomes into measurable objectives; alert policy translates error-budget consumption into a response. Keep the objective, query, time window, notification route, and runbook aligned.

## Supplied names explained

- `OpenTelemetry Semantic Conventions` — Shared attribute names and meanings for common resources and operations; conventions improve interoperability when instrumentation follows matching versions.
- `Semantic convention stability status` — The lifecycle state assigned to each convention; treat it as part of dependency risk and migration planning.
- `Telemetry schema URL` — A URL identifying the schema version associated with telemetry, enabling consumers to understand attribute transformations.
- `Semantic convention migration` — A planned transition between convention schemas or names; test dual emission or translation where needed and avoid silent dashboard breakage.
- `HTTP semantic conventions` — Conventional attributes for HTTP operations; select client/server conventions appropriate to the operation and convention stability.
- `Database semantic conventions` — Conventional attributes for database operations; avoid recording query text or credentials when they can contain sensitive values.
- `RPC semantic conventions` — Conventional attributes for remote procedure calls, aiding consistent cross-service analysis.
- `Messaging semantic conventions` — Conventions for message systems and operations, which must account for asynchronous producer/consumer causality.
- `Resource semantic conventions` — Conventions for identifying service, host, process, container, and deployment resources.
- `Exception semantic conventions` — Conventions for representing exception type and details; collect stack information with sensitivity and volume controls.
- `Service Level Indicator (SLI)` — A quantitative measure of an outcome users care about, with explicit eligible events and good-event criteria.
- `Service Level Objective (SLO)` — A target for an SLI over a defined window; an SLO is an internal reliability goal unless made part of a formal commitment.
- `Service Level Agreement (SLA)` — A commitment to customers that may specify remedies or consequences; its measurement and exclusions must be explicit.
- `Availability SLI` — A ratio or rate defining whether eligible requests are successfully served; define what counts as eligible and successful.
- `Latency SLI` — A measure of request response time against a boundary or threshold; use distributions or threshold compliance to represent tails.
- `Correctness SLI` — A measure of whether results are semantically correct, not merely returned without a transport error.
- `Throughput SLI` — A measure of completed useful work over time; distinguish demand received from work successfully completed.
- `Error budget` — The allowed unreliability implied by the SLO over its window; it informs release and response policy.
- `Error-budget policy` — A pre-agreed action when budget is consumed, such as changing release risk or prioritizing reliability work.
- `Burn rate` — The rate at which observed bad events consume budget relative to the allowed rate; use a defined SLI and window.
- `Multi-window multi-burn-rate alert` — An SLO alert pattern combining long and short windows at chosen burn thresholds to balance speed and noise.
- `Symptom-based alert` — An alert on user-visible degradation, generally a strong paging candidate because it represents impact.
- `Cause-based alert` — An alert on an internal condition that may cause future impact; page only when action is defined and urgency justifies it.
- `Alert threshold` — The condition that changes a measurement into alert state; set from objective and response needs, not an arbitrary graph line.
- `Alert pending duration` — A time condition before an alert fires, helping reject brief fluctuations while potentially delaying detection.
- `Alert grouping` — Combining related alerts into one notification to reduce interruption while preserving distinct actionable details.
- `Alert deduplication` — Suppressing repeated copies of the same alert identity during ongoing state.
- `Alert inhibition` — Suppressing lower-level alerts when a related higher-level alert already explains the incident.
- `Alert routing` — Selecting recipients or integrations based on labels and policy; ensure every actionable alert has an accountable route.
- `Alert severity` — A response-priority classification tied to impact and urgency, with explicit expectations for action.
- `Actionable alert` — An alert that indicates a condition requiring a human or automated response and supplies enough context to act.
- `Alert fatigue` — Reduced responsiveness caused by frequent, noisy, duplicate, or unactionable notifications.
- `Prometheus Alertmanager` — The Prometheus alert handling component that groups, deduplicates, routes, silences, and inhibits notifications.
- `Prometheus silence` — A time-bounded matcher-based suppression used during maintenance or an acknowledged incident; include an owner and expiry.
- `Prometheus inhibition rule` — A rule suppressing notifications for matching alerts when a source alert is firing.
- `Prometheus notification receiver` — A configured destination/integration to which Alertmanager routes notifications.
- `Recording rule versus alerting rule` — A recording rule stores a query result as a series; an alerting rule evaluates a condition into alert state and notification flow.

## Cross-item comparison

An SLI is a measure, an SLO is a target, and an SLA is a commitment. Recording rules store query results; alerting rules evaluate conditions. Symptom alerts represent user impact; cause alerts require clear action.

## Examples

**Worked example**
Define checkout availability as successful eligible requests divided by eligible requests, state whether rejected input is excluded, and set the target and rolling window. Define an alert from budget burn at both short and long windows, label it with service and objective, route it to the responsible team, and include a runbook. Version convention changes with dashboards and queries rather than silently renaming dimensions.

**Common mistakes:**
Using an internal CPU threshold as the only customer reliability page; hiding SLI exclusions; treating the SLA as identical to an SLO; notifying on every sample fluctuation; allowing unowned silences; and migrating semantic names without checking consumers.

## Common mistakes

Using an internal CPU threshold as the only customer reliability page; hiding SLI exclusions; treating the SLA as identical to an SLO; notifying on every sample fluctuation; allowing unowned silences; and migrating semantic names without checking consumers.

## Knowledge checks with answers

1. **What does an SLI measure?** A defined aspect of user-visible service behavior, such as successful requests within a latency threshold.
2. **How is an SLO different from an alert threshold?** An SLO is a target over a window; alerting policies decide when action is needed based on burn or symptoms.
3. **Why pin semantic-convention versions or migration modes?** Names and stability can evolve; controlled migration preserves query and dashboard meaning.
4. **Should every attribute become a metric dimension?** No; high-cardinality or sensitive attributes should be excluded or handled in suitable signals.
## Recent version changes

OpenTelemetry Semantic Conventions documentation identifies version 1.45.0 in the checked 2026-11-20 snapshot. Individual conventions have their own stability status, and migrations may use explicit opt-in modes; do not assume a global release makes every convention stable. [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)

Prometheus 3.0 added UTF-8 metric and label name support; conventional naming remains useful for tool interoperability. Current Prometheus docs distinguish native histograms from classic bucket series. [Prometheus data model](https://prometheus.io/docs/concepts/data_model/) [Metric types](https://prometheus.io/docs/concepts/metric_types/)

