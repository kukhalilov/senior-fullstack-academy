# system design technology landscape and selection — Reference: Observability

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [Prometheus data model](https://prometheus.io/docs/concepts/data_model/), [Prometheus instrumentation practices](https://prometheus.io/docs/practices/instrumentation/), [Grafana documentation](https://grafana.com/docs/), [Jaeger 2.x architecture](https://www.jaegertracing.io/docs/latest/architecture/), [Jaeger release/download information](https://www.jaegertracing.io/download/), [OpenTelemetry overview](https://opentelemetry.io/docs/what-is-opentelemetry/), [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/).

## Scope and version

This lesson explains Prometheus, Grafana, Jaeger, and OpenTelemetry as parts of an observability system. Jaeger 2.23 is the current release identified by its documentation at review time; Jaeger v1 reached end of life at the end of 2025. Product capabilities and backend integrations change; check current documentation and deployment configuration.

## How this group fits the mental model

Observability means using a system’s emitted data to understand its internal behavior, especially for questions not anticipated by a fixed dashboard. Instrumentation creates telemetry; collection and processing move it; storage retains it; query and visualization make it usable; alerts notify people when a user-impacting condition needs action. A tool that performs one role does not automatically provide the entire pipeline.

The three common signals answer different questions:

- **Metrics:** aggregated numeric measurements over time—useful for rates, ratios, saturation, and alerts.
- **Traces:** spans showing a request’s path and timing across components—useful for locating latency and errors in a distributed operation.
- **Logs:** discrete event records with contextual detail—useful for explaining what a component observed at a moment.

Correlate signals with shared trace/request identifiers and resource attributes, while keeping high-cardinality or sensitive values out of metric labels and broadly accessible telemetry.

## Supplied names explained

- **Prometheus** — An open-source monitoring and alerting system whose data model represents each metric name plus label-value set as a time series. It commonly scrapes instrumented targets and supports PromQL queries, rules, and alerting integrations. Changing a label value creates a distinct series; unbounded labels such as user IDs, emails, raw URLs, or request IDs can produce severe cardinality and storage growth. Prometheus is a metrics system, not the default store for full-fidelity request logs or traces.
- **Grafana** — An observability and analytics platform for querying data sources, building dashboards, exploring telemetry, and configuring alerting workflows. It often visualizes Prometheus metrics and trace/log backends, but it is not itself the source of truth for every connected dataset. A dashboard can hide an aggregation error or stale data; alert rules need explicit evaluation windows and actionable ownership.
- **Jaeger** — A distributed tracing platform for collecting, storing, querying, and visualizing traces. The current Jaeger v2 architecture is built on the OpenTelemetry Collector framework and can be configured in roles such as collector, query, ingester, or all-in-one. Storage is a separate operational choice. Sampling reduces volume but can omit traces; tail sampling can retain traces based on their completed outcome when the deployment supports it. Use the current Jaeger release; older v1 tutorials may describe an architecture that is no longer supported.
- **OpenTelemetry (OTel)** — A vendor-neutral framework/toolkit for generating, collecting, processing, and exporting telemetry, including traces, metrics, logs, and baggage. It provides APIs, SDKs, semantic conventions, the OTLP protocol, and the OpenTelemetry Collector. It is not a telemetry storage backend or dashboard. Exporters and collector pipelines send data to backends such as Jaeger, Prometheus-compatible systems, or commercial platforms.

## Cross-item comparison

| Layer | Example here | Main job | Does not provide by itself |
|---|---|---|---|
| Instrumentation and transport conventions | OpenTelemetry | Generate/contextualize signals; collect, process, export | Long-term queryable storage or a complete incident process |
| Metrics storage and alert evaluation | Prometheus | Store time series, query and evaluate rules | Full distributed trace or log context |
| Trace storage/query | Jaeger | Ingest and inspect distributed traces | Application instrumentation or every metric/log backend |
| Dashboards and exploration | Grafana | Present and query connected data sources | Automatically correct instrumentation, retention, or alert semantics |

## Examples

An API has rising p99 latency. A Prometheus histogram provides request rate, errors, and duration aggregated by bounded route template and service. An alert fires when the user-facing latency objective is breached over an appropriate window. The on-call engineer opens a Grafana dashboard and follows a trace sampled for the slow request; OTel context propagation links service spans, while Jaeger displays the span tree. Logs include the trace ID but redact credentials and personal data. Metrics never use per-user IDs as labels. This combination helps identify a slow downstream database call without storing every raw request as a metric series.

## Design and operations checklist

- Start from service-level indicators and user journeys, then instrument the measurements that explain them.
- Use counters for cumulative occurrences, gauges for current values, and histograms/distributions for latency or size according to backend support.
- Use bounded labels such as service, method, status class, and normalized route; budget cardinality before adding dimensions.
- Propagate trace context across supported HTTP/RPC/message boundaries and include sampling behavior in diagnosis expectations.
- Set retention, sampling, ingestion limits, storage budgets, and access controls across all signals.
- Scrub secrets and sensitive data before export; telemetry often has broader access and retention than application data.
- Test alerts for actionable symptoms, missing-data behavior, and recovery; dashboards alone do not notify responders.

## Common mistakes

- Treating OpenTelemetry as a database or Grafana as the telemetry source.
- Adding user, session, or raw URL values to Prometheus labels.
- Expecting sampled traces to contain every request or expecting traces to replace service-level metrics.
- Creating alerts on noisy low-level symptoms without connecting them to user impact.
- Ignoring dropped spans, scrape failures, queue backpressure, storage retention, and telemetry pipeline cost.
- Retaining sensitive request bodies or credentials in logs/traces.

## Knowledge checks with answers

1. **Which tool is the instrumentation framework rather than a backend?** OpenTelemetry; it generates, collects, processes, and exports telemetry.
2. **Why should a user ID not be a Prometheus label?** It can create a unique series per user and drive unbounded cardinality and storage cost.
3. **What does a trace add beyond a metrics dashboard?** A request’s causal path and per-span timing across services, subject to instrumentation and sampling.
4. **Does Jaeger v2 require using a Jaeger-specific SDK?** No. It is built on the OpenTelemetry Collector framework and accepts supported telemetry pipelines; instrumentations can export via standard OpenTelemetry protocols.
