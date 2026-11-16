# observability logs metrics tracing alerts and OpenTelemetry — Core concepts and how they fit together

Sources: [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/), [OpenTelemetry Trace specification](https://opentelemetry.io/docs/specs/otel/trace/), [OpenTelemetry Metrics specification](https://opentelemetry.io/docs/specs/otel/metrics/), and [Google SRE: alerting on SLOs](https://sre.google/workbook/alerting-on-slos/).

## Learning objectives

By the end, you should be able to choose a signal for an operational question, explain how request traces connect services, reason about metric dimensions and sampling, and turn a user-centered objective into a useful alert and investigation.

## Prerequisites

A service receives requests, calls dependencies, and emits information while doing work. A distributed system has multiple processes communicating over networks and failing independently. A time series is a sequence of timestamped measurements for one identity and set of dimensions.

## Core concepts

### Evidence has different shapes

A metric aggregates measurements over time. It efficiently answers whether latency or error rate is changing across a population. A log records a timestamped event and attributes. A trace links spans describing work across process boundaries. A profile samples execution behavior such as CPU use or allocation.

For one failed request, a metric might show that 4% of requests failed in five minutes; a trace can locate the failing downstream call; a log can preserve the exception type and safe message. A profile is useful for a different question, such as CPU cost.

### Context creates a connected story

A span has a trace ID and span ID. Before a service calls a dependency, it injects trace context into a protocol carrier. The receiving service extracts that context and creates a child span. This preserves causality when each relevant boundary participates; a boundary that drops context can split a trace.

Logs written during a span can copy its trace and span identifiers. This enables navigation from a trace to associated events, but does not require every log to become a span event or every signal to have equal retention. Trace identifiers are correlation keys, not authorization tokens. Baggage is propagated application context and should not contain secrets by default.

### Identity and dimensions govern query meaning and cost

Resource attributes describe the producing entity, such as a service deployment. Instrumentation scope identifies the library or component that emitted telemetry. Data-point and log attributes describe a measurement or event. Keeping these levels distinct makes it easier to find whether an incident affects a service, version, or operation.

Every unique label combination in a dimensional metric system can create a separate time series. A bounded route template such as `/orders/{orderId}` is safer than a raw path containing every ID. User IDs, request IDs, unbounded error messages, and timestamps are usually unsuitable metric dimensions. Keep selective high-cardinality detail in controlled traces or logs.

### Sampling and retention choose affordable evidence

Head sampling chooses early, often before the request outcome is known. It is simple and limits volume but can discard a rare error trace. Tail sampling evaluates a trace after spans have arrived and can preserve errors or slow traces, but must buffer related spans and consumes memory. Collector placement and routing must keep spans for one trace together. Multiple sampling layers can compound loss, so document which component makes each decision.

Retention differs from sampling. Short metric retention can prevent long-range trends; short trace retention can remove evidence before an investigation. Set both according to explicit questions, privacy needs, and budgets.

### OpenTelemetry separates instrumentation and delivery

The OpenTelemetry API is the instrumentation-facing interface. The SDK supplies runtime behavior such as processors, samplers, and exporters. OTLP is a telemetry protocol. The Collector is a separate executable with configured pipelines that receive, optionally process, and export telemetry. A component included in a binary is not automatically active: a service pipeline must reference it, and it must support that signal.

This separation avoids tight coupling to one backend. It adds responsibilities: secure endpoints, resource identity, retries, queues, back-pressure, memory protection, and pipeline health. Distributions differ in included components and maturity, so verify a component in the chosen distribution before relying on it.

### Metrics and histograms answer distribution questions

A monotonic sum accumulates events and is usually queried as a rate rather than a lifetime total. A gauge-like measurement can rise and fall. A histogram aggregates observations into a distribution. For latency it supports population-level distribution analysis, with accuracy and cost depending on representation and configuration.

Averages hide tail behavior. A small fraction of requests taking ten seconds can harm users while the average remains acceptable. Choose a latency SLI and histogram representation that match the question and backend. Aggregating per-instance quantiles is not generally equivalent to computing a quantile from combined observations.

### SLO alerts prioritize user impact

An SLI measures a user-relevant outcome. An SLO states a target over a window. An SLA is an external or contractual commitment with consequences, not merely another name for an internal target. The difference between the target and observed good events is an error budget, subject to the SLI’s exact definition.

Burn rate compares observed error rate with the rate allowed by the SLO. Multi-window alerting combines a short window for fast detection with a longer window to reject brief noise. An alert should name the symptom and link the objective, dashboard, and runbook. Cause-based alerts can help with known actionable risks, but paging on every internal failure creates noise when users are unaffected.

## Mechanisms and relationships

### Request flow

1. The entry service receives a request and starts a server span.
2. It records bounded request measurements and attributes.
3. Before calling a dependency, it creates a client span and injects trace context.
4. The dependency extracts context and creates a server span.
5. A structured log records a safe error message and active trace/span identifiers.
6. Exporters or a Collector send telemetry to backends; delivery health is measured too.
7. A metric query computes a user-facing SLI, and an alert evaluates SLO burn.
8. The operator follows alert links to traces, logs, and a runbook, mitigates, and verifies recovery.

### Metric data model and query safety

Prometheus identifies a series by metric name and its complete label set. Adding a label is a schema and capacity decision. A scrape timeout should fit within the scrape interval and target response budget. An absent or stale target must not silently be interpreted as a current zero. Process restarts reset counters, so use reset-aware rate functions before aggregating across instances.

Classic histograms expose bucket counters and related series. Native histograms represent distributions differently and require compatible scrape, storage, and query paths. Confirm the actual end-to-end pipeline instead of assuming all backends handle both identically.

## Worked examples

### Choose evidence

1. “Did checkout errors rise across users?” Start with error-rate metrics and an SLO view.
2. “Why did one order take four seconds?” Open its trace, then search correlated logs. Do not use order IDs as unbounded metric labels.
3. “Why is CPU high while request latency is normal?” Use a CPU profile and compare it with deployment and workload metrics.

### Interpret an objective

Suppose the target is 99.9% successful eligible requests over 30 days. The budget is the remaining 0.1% of eligible requests, according to the SLI definition. If the current rolling error ratio is 0.5%, its instantaneous burn rate relative to a 0.1% allowed rate is five times. That ratio alone does not dictate paging; alert windows, traffic, impact, and response policy matter.

## Misconceptions and edge cases

- “Observability means collecting everything.” Collection has privacy, cardinality, storage, and query costs.
- “A log is a trace.” A log is an event; a span is timed work participating in causal context.
- “A trace contains every operation.” Sampling, missing instrumentation, drops, or broken propagation can make it incomplete.
- “A metric label is free metadata.” Every distinct label set can increase series count.
- “A Collector retries forever.” Queues, retry policy, storage, memory, and outage duration bound delivery.
- “An empty query means zero.” It can mean no scrape, a stale series, changed labels, failed ingestion, or a query mismatch.
- “A passing health check proves users are fine.” A process can be alive while the user journey is broken.
- “Every exception should page someone.” Page when response is needed; use impact and budget to prioritize.
- “Baggage is harmless.” Propagated values cross trust boundaries and can expose data.

## Knowledge checks with answers

1. **Which evidence shows whether service-wide latency distribution is worsening?** A latency metric and SLO view; traces explain individual slow requests.
2. **Why add trace identifiers to logs?** To link an event to its active trace and span.
3. **Why is a request ID a poor metric label?** It may create one series per request.
4. **Why can tail sampling preserve errors better than head sampling?** It can decide after seeing outcomes, at the cost of buffering and routing complexity.
5. **How is the SDK different from OTLP?** The SDK creates and processes telemetry in an application; OTLP transports it.
6. **What makes an alert actionable?** It signals meaningful impact or a defined operational risk, identifies ownership, and gives a response path.

