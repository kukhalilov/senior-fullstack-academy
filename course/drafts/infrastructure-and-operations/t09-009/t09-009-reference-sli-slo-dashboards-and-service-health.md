# observability signals instrumentation and service objectives — Reference: User-oriented indicators, objective windows, error budgets, and dashboard design

# Scope and version

This lesson covers the supplied service-health, SLI/SLO, alerting, and dashboard vocabulary. It uses the SRE Workbook guidance and current Prometheus concepts in the source snapshot checked 2026-11-17. An objective is meaningful only when its eligible population, good-event definition, window, data source, and missing-data policy are explicit. [SLO implementation](https://sre.google/workbook/implementing-slos/) [SLO alerting](https://sre.google/workbook/alerting-on-slos/)

# How this group fits the mental model

Telemetry becomes operationally useful when it answers whether users receive the service they need and whether someone should act. SLIs translate evidence into a user-relevant measurement. SLOs set a target. Error budgets express the allowed unreliability and support a policy decision. Dashboards expose behavior and data quality; alerts notify people only when timely action is expected.

# Supplied names explained

## Health measures and objectives

- `Service health indicator` — A measurement that summarizes a service property relevant to users or operators. It should name the population and evaluation method rather than merely report a component state.
- `Service-level indicator (SLI)` — A quantitative measure of a user-relevant aspect of service behavior, such as successful eligible requests. Define numerator, denominator, exclusions, source, and missing-data treatment.
- `Service-level objective (SLO)` — A target for an SLI over a specified window. It expresses an internal reliability goal and needs a response policy when performance departs from target.
- `Service-level agreement (SLA)` — An agreement with customers or another party, potentially including remedies and contractual conditions. It may use an SLI/SLO-like measure but has distinct legal and commercial meaning.
- `Error budget` — The allowed bad portion implied by the SLO over its measurement window. For an availability target of 99.9%, the nominal budget is 0.1% of eligible events, subject to the defined event model.
- `Error-budget policy` — The team’s agreed response to budget consumption, such as reducing risky changes or prioritizing reliability work. A policy should be established before an incident rather than improvised from a chart.
- `SLO compliance window` — The interval over which good events are compared with eligible events. Window selection changes responsiveness, reporting, and the effective tolerance.
- `Rolling SLO window` — A window that moves continuously with evaluation time, such as the previous 30 days. It avoids calendar reset effects but requires evaluating a continuously changing data range.
- `Calendar SLO window` — A fixed calendar period, such as a month. It simplifies periodic reporting but can reset accumulated bad events at a boundary and hide recent burn if viewed alone.

## SLI event models and properties

- `Availability SLI` — A measure of whether eligible requests or periods are available according to an explicit success definition. HTTP status alone may not reflect a successful business outcome.
- `Latency SLI` — A measure of response speed, often the share of eligible requests under a threshold or a distribution statistic. State whether it uses client-observed or server-observed timing.
- `Throughput SLI` — A measure of completed work rate or volume. High throughput is not automatically good if failed, duplicated, or unintended work is counted.
- `Correctness SLI` — A measure of whether results are accurate or conform to expected business rules. It may require domain validation rather than transport-level status.
- `Freshness SLI` — A measure of how current data or processing is relative to a defined source timestamp or schedule. Distinguish stale inputs from delayed delivery and define acceptable lag.
- `Good event` — An eligible observation meeting the SLI’s success criterion. The rule should be deterministic and not depend on subjective chart interpretation.
- `Total event` — The denominator population of eligible observations. Excluding too many failures or including non-user work biases the resulting ratio.
- `Request-based SLI` — An SLI calculated over eligible requests, often good requests divided by all eligible requests. It weights high-volume periods and requests according to actual counts.
- `Window-based SLI` — An SLI that classifies fixed or rolling time windows as good/bad. It can fit periodic or availability evaluation, but a quiet and busy window may receive equal weight.

## Budget consumption and alerting

- `Burn rate` — The ratio of observed bad-event rate to the allowed bad-event rate implied by the objective. A burn rate above 1 consumes budget faster than the target pace.
- `Error-budget burn rate` — The measured rate of error-budget consumption over a particular window, usually expressed relative to the allowed rate. The window and population must match the SLO.
- `Multi-window alert` — An alert evaluating more than one time window to balance a fast signal with confidence that impact persists. A short window catches severity quickly; a longer window filters brief noise.
- `SLO alert` — A notification based on actual SLI/SLO behavior or budget burn. It should be tied to expected human action and not merely mirror every metric threshold.
- `Alert threshold` — The value or condition that changes an alert state. Choose it from objective and operational risk, and test boundary behavior.
- `Alert evaluation window` — The duration of data considered by an alert expression. A wider window smooths noise but delays detection; a narrow window can be volatile.
- `Actionable alert` — A notification with an owner and a concrete response that is worth interrupting someone for. It should state impact, scope, and next step.
- `Symptom-based alert` — An alert on user-visible service degradation, such as errors or latency. It prioritizes impact over a guessed root cause.
- `Cause-based alert` — An alert on a suspected mechanism such as CPU pressure or queue growth. It can aid diagnosis but can be noisy when the cause has no user impact.
- `Alert fatigue` — Reduced attention caused by excessive, repetitive, or unactionable notifications. It degrades response to important pages and should be treated as a reliability problem.

## Dashboard signals and methods

- `SLO dashboard` — A view of SLI, target, error budget, burn, and data quality over relevant windows. It should help decide whether users are affected and whether policy action is needed.
- `Golden signals` — A service-level monitoring frame commonly emphasizing latency, traffic, errors, and saturation. It is a starting diagnostic set, not a complete SLI for every product.
- `RED method` — A service monitoring approach organized around rate, errors, and duration for requests. It is useful for request-oriented services but does not replace user-defined SLO semantics.
- `USE method` — A resource analysis method organized around utilization, saturation, and errors for a resource. It can expose bottlenecks but should not be mistaken for proof of user impact.
- `Latency percentile` — A quantile of observed durations such as p95 or p99. It describes a rank under a particular window and aggregation; it is not an exact bound for each request.
- `p50 latency` — The median latency: half of measured observations are at or below the value, subject to percentile estimation. It describes the center and can hide a damaging tail.
- `p90 latency` — The 90th percentile latency: approximately 90% of observations are at or below the estimate. Its usefulness depends on enough samples and a correctly formed distribution.
- `p95 latency` — The 95th percentile latency, often used as a tail view. It is still sensitive to bucket design, sample count, time window, and aggregation.
- `p99 latency` — The 99th percentile latency, emphasizing a rarer tail. It can be statistically noisy at low traffic and should be read with request volume and impact.
- `Tail latency` — The slower portion of a latency distribution that harms a subset of requests. Queueing, retries, contention, and dependency variance can make it much worse than the mean.
- `Apdex score` — An application performance index that classifies response times as satisfied, tolerating, or frustrated using thresholds. It compresses a distribution into a score and can hide detail if thresholds or population are poorly chosen.
- `Saturation metric` — A measurement of pressure or demand approaching a resource limit, such as a queue filling or workers fully occupied. High saturation can predict user impact, but context and headroom matter.
- `Queue depth signal` — A measure of queued work count. Pair it with arrival rate, completion rate, and age of oldest work; a static depth alone may not reveal whether delays are growing.
- `Service dependency dashboard` — A view of service relationships and dependency health/latency. It helps localize cross-service issues but should show observed evidence and avoid implying a dependency graph is complete.
- `Deployment annotation` — A marker for a release/change on time-series or dashboard views. It helps correlate behavior with change, but temporal proximity alone does not prove causation.
- `Telemetry dashboard` — A visual view of telemetry queries. It should state units, time range, aggregation, and data freshness so colors and axes are not misleading.
- `Dashboard panel` — One chart, table, or statistic in a dashboard. A panel should have a clear question, meaningful title, stable units, and a useful empty/error state.
- `Dashboard variable` — A selectable parameter that changes dashboard queries or labels. Defaults and allowed values should prevent accidental broad, expensive, or misleading queries.
- `Dashboard time range` — The interval over which panels query and display data. Different windows can produce different conclusions; annotate the selected range and account for ingestion lag.
- `Dashboard misleading average` — A mean that hides skew, rare failures, or tail latency. Pair it with distribution or threshold-based views and request volume.
- `Monitoring coverage` — The extent to which important services, user journeys, and failure modes have reliable telemetry and alerting. Inventory known gaps and stale instruments rather than equating dashboard count with coverage.

## External and internal checks

- `Synthetic monitoring` — A scheduled scripted check that exercises a user journey or endpoint. It can detect problems without real traffic but may not match authentic user conditions or identity.
- `Black-box monitoring` — Monitoring from outside a component using observable behavior such as response success and latency. It sees the user-facing contract but often cannot explain internal cause.
- `White-box monitoring` — Monitoring internal state such as queues, threads, resource use, and application metrics. It supports diagnosis but may look healthy while a user path is broken.

# Cross-item comparison

| Method | Measures | Best use | Watch for |
| --- | --- | --- | --- |
| RED method | Request rate, errors, duration | APIs and request-serving services | Does not define which events count toward the product SLO |
| USE method | Resource utilization, saturation, errors | Infrastructure/resource bottleneck analysis | Resource health is not equivalent to user success |
| Golden signals | Latency, traffic, errors, saturation | Broad initial service dashboard | A template is not a substitute for product-specific indicators |
| Request-based SLI | Individual eligible events | Uneven traffic and request outcomes | Correct denominator and event eligibility |
| Window-based SLI | Time windows | Periodic availability or time-based service | Quiet and high-volume windows can be weighted equally |
| Black-box | External behavior | Customer-path validation | Limited internal diagnosis |
| White-box | Internal state | Root-cause narrowing | May miss externally visible failure modes |

SLI describes what is measured; SLO sets the target; SLA sets an external agreement. An alert is a response mechanism, not any of these definitions. [SRE Workbook](https://sre.google/workbook/implementing-slos/)

# Examples

For a request-based availability target, define `eligible` as completed customer API requests after excluding health probes and explicitly documented client cancellations. Define `good` as requests whose application outcome satisfies the business success rule. Then calculate `good / eligible` across the selected window and compare with the target. Confirm that failures are not accidentally omitted because the server never emitted a completion metric.

If the SLO target is 99.9% over 30 days, the tolerated error ratio is 0.001. At an observed 0.006 bad-event ratio in a five-minute window, burn rate is 6.0. A team may require both a fast and a sustained burn condition before paging, while showing the current budget on the dashboard. It should test those rules on known examples, including no traffic, missing samples, deployment changes, and a service with very low request volume.

# Common mistakes

- Defining “success” as HTTP 2xx without checking the product’s real completion semantics.
- Excluding failed requests from the denominator because only successful handler paths incremented a metric.
- Comparing a request-based numerator with a window-based denominator.
- Assuming 99.9% availability means the same number of minutes regardless of window and event model.
- Paging on a cause metric without evidence of impact or expected action.
- Using an average to represent a tail-latency objective.
- Omitting volume and data-freshness panels, making a quiet service look healthy.
- Treating calendar budget reset as proof that reliability risk has disappeared.
- Copying multi-window burn-rate constants without matching them to the SLO and response urgency.

# Knowledge checks with answers

1. What separates an SLI from an SLO? **The SLI is the measured indicator; the SLO is the target set for it over a window.**
2. What is the error budget for 99.9% good events? **0.1% bad events, if the eligible population and good-event definition are exactly those measured.**
3. Why might request-based and window-based availability differ? **They count different units and weight traffic differently.**
4. What does burn rate above 1 mean? **The observed bad-event rate is consuming budget faster than the allowed pace.**
5. Why pair a percentile with volume? **Low sample counts make tail estimates less stable and can change how representative the result is.**
6. Is an SLA interchangeable with an SLO? **No. An SLA is an external agreement with contractual meaning; an SLO is an internal reliability target.**

# Sources

[Google SRE: implementing SLOs](https://sre.google/workbook/implementing-slos/) · [Google SRE: alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) · [Prometheus alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) · [Prometheus histograms and summaries](https://prometheus.io/docs/practices/histograms/)
