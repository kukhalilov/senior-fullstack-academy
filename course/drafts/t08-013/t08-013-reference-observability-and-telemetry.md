# observability logs metrics tracing alerts and OpenTelemetry — Reference: System signals, instrumentation boundaries, and correlation context

Sources: [official reference 1](https://opentelemetry.io/docs/concepts/signals/), [official reference 2](https://opentelemetry.io/docs/concepts/signals/), [official reference 3](https://opentelemetry.io/docs/specs/otel/trace/).

## Scope and version

This guide explains the assigned observability inventory group in the context of the current OpenTelemetry specification snapshot and Prometheus 3.x/current documentation checked 2026-11-14. The terminology and component maturity can evolve. The observability profiles signal and individual Collector components do not have a universal stability guarantee.

## How this group fits the mental model

This group establishes the vocabulary for a complete evidence system: what is observed, where it is emitted, how identity and context follow work, and how much evidence is retained. A useful mental model is a parcel moving through services: telemetry is the package of evidence, signals are its forms, and propagated context supplies the shared tracking number. Instrumentation should answer a question while keeping dimensions bounded and sensitive values out.

## Supplied names explained

- `Observability` — The ability to infer internal behavior from emitted evidence; it depends on useful dimensions and query access, not a vendor product or a promise that every failure is diagnosable.
- `Monitoring` — Repeatedly checking known indicators against expected behavior; alerts need an owner and response action or they create noise.
- `Telemetry` — Measurements and events emitted by software or infrastructure for analysis; define collection boundaries because it can expose sensitive information and consume resources.
- `Instrumentation` — Code or agent behavior that creates telemetry at meaningful boundaries; instrument business outcomes and dependency calls rather than indiscriminately wrapping every line.
- `Telemetry pipeline` — The route from creation through buffering, processing, transport, storage, and query; each boundary can delay, transform, sample, or drop data.
- `Signal` — A category of evidence such as logs, metrics, or traces with different shape and query strengths.
- `Operational event` — A meaningful occurrence such as a failed dependency call, expressed with enough context to investigate and without secrets.
- `Structured event` — A record with typed fields rather than only prose, allowing reliable filtering and aggregation.
- `Correlation identifier` — A value used to connect related records; generate or validate it at trust boundaries and avoid using it as an unbounded metric dimension.
- `Trace identifier` — An identifier shared by spans in one distributed trace; it aids navigation but grants no authorization.
- `Span identifier` — An identifier for one span within a trace; include it in logs only when it accurately represents active context.
- `Trace context propagation` — Injecting and extracting trace context across process or asynchronous boundaries to preserve causal relationships.
- `W3C Trace Context` — A standard interoperable format for propagating trace context; validate incoming values and do not treat them as trusted user identity.
- `traceparent` — The W3C header carrying version, trace ID, parent span ID, and trace flags; malformed or unsupported values require safe handling.
- `tracestate` — The W3C header for vendor-specific trace state; propagate only according to the standard and bound size and trust exposure.
- `Baggage` — A separate propagated collection of application key/value context; it may cross services and third-party boundaries, so avoid secrets and constrain allowed values.
- `Resource attributes` — Stable attributes describing the telemetry-producing entity, distinct from per-event attributes; inconsistent service identity splits dashboards and series.
- `Service identity` — The resource identity by which operators recognize a logical service; it must be stable across replicas and distinct across environments when needed.
- `Environment identity` — A resource dimension such as production or staging; missing it can mix signals from environments and mislead alert evaluation.
- `Instrumentation scope` — Metadata identifying the library or component that emitted telemetry, useful for attribution and migration.
- `Telemetry sampling` — A policy that retains only selected telemetry; record its effect because conclusions from sampled evidence may be biased.
- `Head sampling` — Sampling decided near trace start, which is cheap and consistent but cannot use a later error outcome.
- `Tail sampling` — Sampling decided after spans arrive, enabling outcome-aware retention but requiring buffering and trace-affine routing.
- `Telemetry cardinality` — The number of distinct attribute or label combinations; uncontrolled values multiply time series and cost.
- `Telemetry retention` — How long evidence remains queryable; align it with incident investigation, compliance, and cost requirements.
- `Sensitive-data redaction` — Removing or transforming secrets and personal data before broad collection or export; prevention at source is safer than relying only on downstream filters.
- `Signal correlation` — Using shared identity, timestamps, and trace context to navigate between metrics, logs, and traces; correlation improves investigation but does not prove causation.
- `Golden signals` — Latency, traffic, errors, and saturation as a useful service-level starting set; they do not replace domain-specific outcomes.
- `RED method` — Rate, errors, and duration for request-driven services; define denominator, error meaning, and duration distribution consistently.
- `USE method` — Utilization, saturation, and errors for resources; apply to a specific resource and avoid mistaking utilization alone for user impact.

## Cross-item comparison

Logs, metrics, and traces differ by evidence shape; Baggage carries propagated application context rather than a telemetry signal. Head sampling decides early; tail sampling can use outcomes but requires more pipeline resources.

## Examples

**Worked example**
For a request that crosses API and inventory services, propagate trace context, attach service/environment resource identity, emit bounded request metrics, and write a structured failure event with trace correlation. Choose head sampling if uniform low-cost sampling is sufficient; consider tail sampling when rare slow or failed traces matter and the pipeline can buffer and route them safely. A metric dimension containing the raw request identifier is usually the wrong location for that value.

**Common mistakes:**
Collecting every field; mixing environment identity; forwarding untrusted Baggage; putting identifiers into metric labels; confusing monitoring coverage with complete observability; and assuming sampled evidence is unbiased.

## Common mistakes

Collecting every field; mixing environment identity; forwarding untrusted Baggage; putting identifiers into metric labels; confusing monitoring coverage with complete observability; and assuming sampled evidence is unbiased.

## Knowledge checks with answers

1. **What question does this group help answer?** It helps identify the evidence type, data boundary, or operational action appropriate to a real service investigation.
2. **Why do identity and semantics matter?** Consistent names and bounded dimensions allow safe grouping and correlation across producers without uncontrolled series growth.
3. **Name a common failure mode.** Incomplete context, unsafe sensitive data, unsupported component assumptions, or missing delivery health can make apparently healthy dashboards misleading.
4. **How should you apply these terms?** Start from a user or operator question, select the minimal sufficient evidence, verify lifecycle and backend support, and rehearse the investigation.

## Recent version changes

OpenTelemetry Semantic Conventions documentation identifies version 1.45.0 in the checked snapshot. Individual conventions have their own stability status, and migrations may use explicit opt-in modes; do not assume a global release makes every convention stable. [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)

Prometheus 3.0 added UTF-8 metric and label name support; conventional naming remains useful for tool interoperability. Current Prometheus docs distinguish native histograms from classic bucket series. [Prometheus data model](https://prometheus.io/docs/concepts/data_model/) [Metric types](https://prometheus.io/docs/concepts/metric_types/)

