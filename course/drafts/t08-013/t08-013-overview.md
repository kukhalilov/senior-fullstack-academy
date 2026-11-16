# observability logs metrics tracing alerts and OpenTelemetry — Big-picture orientation and mental model

Sources: [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/), [Prometheus data model](https://prometheus.io/docs/concepts/data_model/), and [Google SRE: alerting on SLOs](https://sre.google/workbook/alerting-on-slos/).

## Problem and purpose

A distributed application has internal state that operators cannot inspect directly during an incident. A customer says checkout is slow, but the cause could be a database, queue, failed dependency, deployment, or network. Observability is the practice of emitting and connecting evidence so engineers can infer what the software is doing and how users are affected.

Monitoring answers questions anticipated when dashboards and alerts were designed. Observability also supports investigation of unfamiliar failures. It does not mean collecting everything: excess detail raises cost, risks privacy, and can bury useful evidence.

## Plain-language mental model

Treat a request as a parcel moving through a delivery network. A trace is its route and waiting time at each stop. A metric summarizes the flow of many parcels. A log is a detailed event note about one moment. A profile samples where a program spends CPU time or memory.

Each signal has different resolution and cost. A metric can show that latency rose across customers; a trace can show that one request waited on a database; a correlated log can explain that the database call timed out. No signal replaces the others.

## How the parts fit together

1. Instrument applications and platforms at useful boundaries.
2. Attach stable resource identity, such as service and environment, and consistent semantic attributes.
3. Propagate trace context between services. Include active trace and span identifiers in relevant logs.
4. Send signals through a telemetry pipeline. OpenTelemetry APIs and SDKs instrument and process telemetry; OTLP transports it; a Collector can receive, process, and export it to one or more backends.
5. Query metrics for rates, errors, latency distributions, and saturation; use traces and logs to explain an anomaly.
6. Define user-centered SLIs and SLOs. Alert when symptoms threaten objectives or consume the error budget at an actionable rate.
7. Use dashboards, runbooks, and an incident timeline to coordinate investigation, mitigation, and learning.

A request might follow `Browser → API service → payment service → database`. The API records request count, errors, and latency distribution. It creates server and client spans, then forwards trace context. The payment service continues the trace and writes a safe error log with the trace ID if its database call fails. A metric alert signals that checkout reliability is degrading. The operator opens an affected trace, finds the slow dependency span, searches logs by trace ID, mitigates the issue, and verifies recovery with the same SLI.

Metric labels must be bounded. A request ID or raw user ID creates a new time series for each value and can overwhelm storage. Put high-detail per-request context in controlled logs or sampled traces, and do not collect secrets or unnecessary personal data.

## Concept map

| Question | Best starting evidence | Why |
|---|---|---|
| Is the service failing or slowing for many users? | Metrics and SLO indicators | Compact, aggregate, suitable for rates and alerts |
| What happened during one request? | Distributed trace | Connects work and time across service boundaries |
| What did a component report at a moment? | Structured log | Preserves event details and severity |
| Where does CPU or memory go inside the process? | Profile | Samples execution or resource use |
| Which workload or deployment produced it? | Resource identity and attributes | Enables grouping and filtering |
| How can evidence move to a backend? | OpenTelemetry SDK, OTLP, Collector | Separates instrumentation from transport and routing |

## End-to-end walkthrough

Suppose checkout latency rises after a release. The SLO alert shows a rapid error-budget burn, so the on-call engineer confirms customer impact and deployment timing. A latency dashboard breaks results down by bounded route and status dimensions. A slow trace shows a long client span to inventory. Correlated logs show connection timeouts. The incident lead rolls back the release, then checks the SLI and new traces until the symptom recovers. The timeline records impact, detection, mitigation, and follow-up work.

Labels such as raw request paths containing IDs may create excessive cardinality; use bounded route templates. The tradeoff is that sampling can omit a rare failure, high-cardinality attributes inflate metrics cost, logs can contain sensitive data, traces can fragment when context is not propagated, and pipelines can drop telemetry under overload. Monitor delivery health and rehearse investigations.

## When to use it and tradeoffs

Use metrics for trends and alerts, traces for causal paths, logs for event detail, and profiles for CPU, allocation, heap, or lock contention questions. Correlate them with propagated context and consistent resource identity. Choose sampling and retention based on incident questions, privacy needs, and budget.

More telemetry is not automatically better. Define collection boundaries, data access, retention, and escalation responsibilities. A dashboard without ownership, thresholds, or a response procedure is not a complete monitoring system.

## What later lessons cover

The concepts lesson builds the request-path mental model and signal-selection method. Reference lessons explain the supplied observability, logging, metric/Prometheus, tracing, Collector, semantic-convention/SLO, and dashboard/incident terms. Practice applies these ideas to an incident; interview preparation focuses on design and failure scenarios.

