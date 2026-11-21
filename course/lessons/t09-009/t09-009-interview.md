# observability signals instrumentation and service objectives — Interview questions and reasoning

# Core questions

1. **What is the difference between observability and monitoring?**
2. **When would you use metrics, logs, traces, and profiles together?**
3. **How do you prevent metric cardinality from growing without bound?**
4. **Why should `rate` be applied before aggregation in PromQL?**
5. **What is the difference between a classic Prometheus histogram and a summary?**
6. **How do you define a useful SLI and SLO?**
7. **What does an error budget tell a team?**
8. **How do head-based and tail-based trace sampling differ?**
9. **How does trace context propagate across an HTTP service boundary?**
10. **What is the difference between a span parent and a span link?**
11. **What roles do Prometheus rules and Alertmanager play?**
12. **What should an actionable alert contain?**
13. **What are the privacy risks of baggage and span attributes?**
14. **How do you distinguish missing telemetry from a healthy zero?**
15. **What is a multi-window burn-rate alert?**

# Concise interview answers

1. Monitoring checks anticipated conditions; observability is the quality and structure of emitted evidence that supports understanding both anticipated and unanticipated behavior. Monitoring is one operational use of observability.
2. Metrics summarize population behavior and support alerts; logs record event detail; traces show a causally related operation across boundaries; profiles show sampled resource consumption inside execution. Correlation requires explicit context and retained records.
3. Use bounded labels such as route templates and status classes, reject arbitrary IDs and raw paths, monitor series growth, and choose logs/traces only for approved high-detail fields with retention and access controls.
4. Applying `rate` per source series lets Prometheus detect counter resets before series are combined. Aggregating first can hide a reset and produce a misleading rate.
5. Classic histograms expose cumulative fixed buckets that can be aggregated when bucket boundaries align; summaries may expose local quantiles that cannot generally be combined into an accurate fleet-wide quantile. Native histograms use structured sparse buckets, but ingestion and forwarding must be configured.
6. Select a user-relevant indicator, define eligible events and good outcomes, choose a window and data source, handle missing data, then set a target and response policy. Do not choose a denominator merely because it is convenient.
7. The error budget is the allowed unreliability implied by the objective over its window. Its consumption informs release and reliability priorities through an agreed policy.
8. Head sampling decides early with low state but cannot see final outcome; tail sampling decides after collecting spans and can retain failures/slow traces, but needs buffering, complete routing, and capacity.
9. The client injects trace context into outgoing metadata; the server validates/extracts it and creates a related span. External context is untrusted correlation data, not identity.
10. A parent expresses direct hierarchy; a link connects related work without claiming a parent-child execution relationship, useful for asynchronous or fan-in cases.
11. Prometheus evaluates alerting/recording rule expressions; Alertmanager groups, routes, deduplicates, silences, inhibits, and sends notifications.
12. It states impact and scope, identifies an owner, links a current runbook, and gives a response that is worth the interruption.
13. They can propagate secrets or personal data to downstream services and create high cardinality. Allowlist, bound, redact, and never put credentials in baggage.
14. Check expected-series presence, scrape/target status, timestamps/staleness, ingestion and collector drop signals, selector labels, and traffic. Empty result, zero sample, and missing data are distinct states.
15. It combines fast and sustained windows at burn thresholds so severe budget consumption is detected quickly while short noise is filtered. Thresholds must match SLO semantics and response urgency.

# Deep follow-up answers

## How would you design telemetry for a new checkout service?

Start with user journeys and failure decisions rather than a dashboard template. Define eligible checkout attempts and good outcomes, including asynchronous completion and retries. Emit bounded metrics for rate, errors, duration distribution, and queue age; instrument server/client spans with stable operation names and safe route templates; structure logs around meaningful failures and correlate them with trace context. Select a sampling policy that retains representative traces or explicitly biases toward high-value failures. Add data freshness, scrape success, collector drops, and exporter errors so operators can assess telemetry health. Apply attribute governance, access boundaries, encryption, and signal-specific retention. Then validate SLI arithmetic and alert behavior with realistic traffic and failure injection.

## Why can a trace waterfall mislead?

It depends on complete spans, accurate start/end times, context propagation, sampling, and meaningful parentage. Clock skew can make cross-host timestamps look out of order. Parallel work means summed span durations exceed wall-clock time; the critical path is the chain of causally dependent work. Missing spans may be dropped or unsampled rather than nonexistent. A waterfall is evidence for a hypothesis, not a perfect execution recording.

## How do you decide between Prometheus scraping and OTLP metrics?

Compare instrumentation, discovery, network constraints, ownership, metric model conversion, temporality, histogram behavior, and operational maturity in the actual versions. Prometheus scrape is pull-based and has a mature target/job model. OTLP is a push/export protocol used by OpenTelemetry, often through a collector. They can interoperate, but conversion and feature support are not automatic; validate names, labels/attributes, histograms, timestamps, and failure behavior end to end.

## What is the difference between error rate and SLO burn rate?

Error rate is the observed bad share over a specified population/window. Burn rate normalizes that rate by the allowed bad fraction implied by the SLO, so a rate can be interpreted as budget-consumption pace. The ratio is meaningful only if numerator, denominator, eligibility, and time windows match the objective.

## What recent maturity caveats should you know?

OpenTelemetry maturity is component-specific: stable specification elements do not guarantee every language SDK or Collector component is stable. OTTL v1 became stable for traces, metrics, and logs with Collector Contrib v0.164.0, but that is a language guarantee. Profiles protocol remains in development/alpha. Prometheus native histograms are stable from v3.8, but v3 scraping and remote-write still require separate configuration. PromQL experimental functions may require a feature flag and can change. [OpenTelemetry status](https://opentelemetry.io/docs/specs/status/) [OTTL v1](https://opentelemetry.io/blog/2026/ottl-v1/) [Profiles](https://opentelemetry.io/docs/specs/otel/profiles/) [Native histograms](https://prometheus.io/docs/specs/native_histograms/)

# Scenario questions

## Scenario: SLO dashboard shows 100%, users report failures

Ask how the SLI denominator is defined and whether failed or incomplete requests are emitted. Check whether a low-traffic subgroup is hidden by fleet aggregation, whether queue acceptance is mistaken for workflow completion, whether telemetry is stale/dropped, and whether the dashboard treats empty input as zero errors. Verify client-visible synthetic checks and correlate affected requests with logs/traces. Fix measurement semantics before adjusting the target.

## Scenario: alert storms after a deployment

First determine whether the deployment caused user impact or exposed noisy cause-based thresholds. Group by stable service/route dimensions, inspect error-budget burn and time windows, compare deployment annotations, and confirm alert labels are stable enough for deduplication. Silence only the known duplicate notification while preserving incident visibility. Update rule tests and alert/runbook ownership after identifying the cause.

## Scenario: metrics are available, but traces are missing for slow requests

Check whether tail sampling or head sampling discarded them, whether sampling decision/context propagated, whether slow spans arrived after the tail decision window, whether the collector queue overflowed, and whether backend retention/query filters exclude them. Consider an outcome-aware sampling policy only after sizing memory and routing all spans for each trace to one decision point.

## Scenario: an organization wants to add customer ID to all metrics

Explain that each distinct value creates additional series and can cause unbounded cardinality, cost, and service instability. Ask what decision requires per-customer aggregation. Prefer bounded cohorts or tenant tiers in metrics and controlled, access-limited traces/logs for individual investigations, with explicit privacy/retention policy.

# Tradeoffs and alternatives

Use external synthetic or black-box checks for customer-path reachability, internal white-box signals for diagnosis, and both for coverage. Use histograms for aggregatable distributions, while understanding bucket resolution and storage; summaries suit some local quantile needs but do not aggregate quantiles generally. Head sampling lowers pipeline state; tail sampling preserves chosen outcomes at higher operational cost. Request-based SLOs weight actual events; window-based SLOs weight periods. Choose based on the contract, not convenience.

# Common weak answers

- “Observability means collecting logs.” It requires fit-for-purpose signals and operational questions.
- “Just add every label.” It ignores cardinality and privacy.
- “99.9% uptime means about 43 minutes down.” That assumes a calendar time-based model; request-based objectives and window definitions may differ.
- “A trace shows exactly what happened.” Sampling, missing spans, clock skew, and instrumentation gaps limit it.
- “Tail sampling is always better.” It needs memory, complete trace routing, and a decision window.
- “Alert when CPU is high.” It lacks user impact, a time condition, ownership, and an action.
- “A 100% dashboard means the system is healthy.” It could mean no data or a biased denominator.
- “OpenTelemetry is stable.” Maturity differs among specifications, signals, language implementations, and Collector components.

# Self-check rubric

Score each item 0 (cannot explain), 1 (partial), or 2 (clear, accurate, with tradeoffs):

- I can choose signals from an operational question and explain their limits.
- I can define numerator, denominator, eligibility, and window for an SLI.
- I can query counters and classic/native histograms without mixing their semantics.
- I can explain sampling bias and trace propagation failure modes.
- I can distinguish Prometheus rule evaluation from Alertmanager notification work.
- I can design telemetry data controls and identify drop/backpressure risks.
- I can explain current component-specific OpenTelemetry maturity and Prometheus native histogram enablement.

A total below 10 suggests revisiting the concepts and reference lessons; 10–12 suggests practicing system-specific examples; 13–14 indicates a strong interview-ready explanation, while still verifying version-specific details against official documentation.

# Sources

[OpenTelemetry signals and status](https://opentelemetry.io/docs/concepts/signals/) · [OpenTelemetry specification status](https://opentelemetry.io/docs/specs/status/) · [Prometheus functions](https://prometheus.io/docs/prometheus/latest/querying/functions/) · [Prometheus native histograms](https://prometheus.io/docs/specs/native_histograms/) · [SRE SLO implementation](https://sre.google/workbook/implementing-slos/) · [SRE alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
