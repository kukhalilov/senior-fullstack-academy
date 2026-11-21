# observability logs metrics tracing alerts and OpenTelemetry — Exercises and worked solutions

Sources: [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/), [Prometheus data model](https://prometheus.io/docs/concepts/data_model/), [OpenTelemetry Collector architecture](https://opentelemetry.io/docs/collector/architecture/), and [Google SRE: alerting on SLOs](https://sre.google/workbook/alerting-on-slos/).

## Goals

- Select evidence for operational questions.
- Design bounded dimensions and correlated log/trace context.
- Turn an objective into an alert and response path.
- Diagnose telemetry delivery loss instead of trusting an empty dashboard.

## Worked example

An API and inventory service share a request path. Define the question first: “Are successful eligible checkout requests meeting the latency objective?” Instrument request totals and latency with bounded route and outcome dimensions. Start a server span at the API boundary and a client span for inventory; propagate trace context. If inventory times out, emit a structured safe log with trace and span identifiers. Compute the SLI from eligible requests and the latency threshold, then alert on sustained budget burn. A responder opens the linked trace and log, mitigates, and checks recovery against the same SLI.

Use a trace ID to find evidence for one request; do not add it as a metric label. Metrics summarize a population; traces describe individual causal paths.

## Exercises

Try each before reading its hints and solution.

1. **Signal selection.** Checkout error rate rises. One trace shows a slow inventory call, but the dashboard shows no errors. Give three plausible reasons and a next check for each.
2. **Cardinality review.** A team proposes route, status, customer ID, and request ID labels. Which should be removed or transformed? Where can per-request context live?
3. **Trace design.** Draw the spans for browser-to-API-to-payment. What changes if payment publishes a message processed later?
4. **SLO alert.** A fixed CPU threshold pages repeatedly while checkout success is healthy. Redesign the paging signal and explain where CPU evidence belongs.
5. **Pipeline outage.** Backend export fails for 20 minutes while a Collector queue fills after 8 minutes. What evidence is needed, what can be lost, and how should the topology improve?
6. **Log schema.** One text line contains failure text, an email, HTTP status, exception, and timestamp. Propose safer structured fields and retention boundaries.

## Progressive hints

1. Check SLI denominator, query labels, scrape freshness, and whether the trace shows a slow request rather than an error.
2. Unique values multiply series; keep bounded route/status dimensions and keep sensitive identifiers out of telemetry unless justified.
3. Use client/server spans and propagate context; asynchronous work may need a causal link rather than synchronous nesting.
4. Page on user-visible symptoms or budget risk; use CPU as diagnostic evidence unless a tested cause threshold requires action.
5. Queue capacity is finite. Inspect export errors, queue depth, drops, retry policy, persistent storage, and recovery behavior.
6. Separate stable event name, severity, timestamps, safe status/error type, resource identity, and correlation IDs. Remove or mask the email at source.

## Complete solutions

### 1. Signal selection

The trace may show latency without failure; the dashboard may filter another route or status label; the failed series may be missing because of scrape, ingestion, or staleness; or the trace may be sampled. Inspect the SLI definition and labels, check target and exporter health, and compare trace status with the user-visible result. No data does not mean zero.

### 2. Cardinality review

Keep a normalized route template and bounded status code. Remove customer ID and request ID from metric labels. If an identity is essential for a restricted investigation, prefer a minimized, access-controlled trace or log field with a suitable retention policy; often a pseudonymous value is safer. Never collect credentials merely because a backend can index them.

### 3. Trace design

The API creates a server span and a child client span for payment. Payment extracts context and creates its server span. If it publishes a message, the producer span describes publish work and a consumer span describes later processing. A span link can express causality when a parent-child lifetime is inappropriate. Each boundary must propagate context for a connected trace.

### 4. SLO alert

Define an SLI for successful eligible checkout requests and a latency threshold representing user experience. Alert on significant sustained error-budget burn with useful windows, an owner, impact description, and runbook. Keep CPU on a diagnostic dashboard; a cause-based page is justified only if a tested threshold predicts imminent impact and requires action. A fixed CPU line does not express customer consequence.

### 5. Pipeline outage

Inspect exporter failures, retries, queue capacity/depth, persistent storage, memory pressure, and dropped telemetry. A 20-minute outage exceeds the eight-minute buffer, so data can be lost unless durable storage and retry cover the interruption. Size bounded queues for realistic outages, alert on drops and export lag, configure persistent storage if restart survival matters, and define overload shedding. Persistence is not unlimited retention.

### 6. Log schema

Use a stable event name, normalized severity, source and observed timestamps, service/environment resource, bounded status, safe exception type, and trace/span identifiers when context exists. Do not log the email; if identity is required, use a protected system designed for that purpose. Give audit records a deliberate integrity and retention policy separate from routine diagnostics.

## Tests and edge cases

- A route template stays bounded even if the path contains a unique order ID.
- Missing scrape data is surfaced as unknown, not a successful zero.
- A trace missing a downstream span triggers checks for sampling, instrumentation, propagation, and export.
- Metric aggregation does not merge production and staging unintentionally.
- Audit records are not discarded by a routine diagnostic sampling policy.
- Collector queues have finite capacity, failure alerts, and documented loss behavior.
- Alerts identify ownership, user impact, dashboards, and response instructions.

## Reflection questions

1. Which incident question can your telemetry not answer, and what minimum safe evidence would close the gap?
2. Which dimensions dominate series growth, and what cardinality budget will you enforce?
3. Can an on-call responder distinguish a symptom from a cause quickly?
4. How will you detect telemetry loss when the application and telemetry backend fail together?

