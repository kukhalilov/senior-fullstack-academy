# observability logs metrics tracing alerts and OpenTelemetry — Reference: Trace graphs, span lifecycle, sampling, and cross-service causality

Sources: [official reference 1](https://opentelemetry.io/docs/specs/otel/trace/), [official reference 2](https://opentelemetry.io/docs/concepts/signals/traces/).

## Scope and version

This guide explains the assigned observability inventory group in the context of the current OpenTelemetry specification snapshot and Prometheus 3.x/current documentation checked 2026-11-14. The terminology and component maturity can evolve. The observability profiles signal and individual Collector components do not have a universal stability guarantee.

## How this group fits the mental model

A distributed trace is a causal graph of spans, not necessarily a single tree: links can express relationships that are not parent-child, such as asynchronous work. Span kind describes the boundary role; context carries identifiers across process boundaries; attributes and events add bounded facts. Sampling and propagation determine whether the stored trace is complete enough to answer the incident question.

## Supplied names explained

- `Distributed trace` — A collection of related spans connected by parent relationships or links across a request or asynchronous workflow.
- `Trace graph` — The causal structure of spans; parent-child edges and links represent different relationships.
- `Span` — A timed operation with context and attributes, describing a unit of work rather than every line of code.
- `SpanContext` — The immutable trace/span identity and trace state needed to propagate a span’s causal context.
- `Span kind` — The role of a span at a boundary, helping interpret client/server or messaging relationships.
- `Internal span` — A span for work inside one instrumented component rather than an external request boundary.
- `Server span` — A span describing server-side handling of a request received from a client.
- `Client span` — A span describing an outgoing call made by a client to another service or dependency.
- `Producer span` — A span associated with producing a message for asynchronous processing.
- `Consumer span` — A span associated with consuming or processing a message.
- `Parent span ID` — The identifier of the direct parent span; root spans have no valid parent ID.
- `Root span` — The top-level span for a trace segment, created without a remote or local parent.
- `Span event` — A timestamped named event attached to a span for a meaningful point during its lifetime.
- `Span link` — A causal association to another span context that is not represented by a parent-child relationship.
- `Span status` — The outcome state recorded for a span; instrument meaningful errors rather than marking every handled condition as failure.
- `StatusCode` — The defined status category for a span, such as unset, ok, or error.
- `Status description` — Optional explanatory text associated with span status; keep it bounded and free of sensitive data.
- `Span attribute` — A key/value fact about the operation; stable bounded attributes are more useful and safer than arbitrary payloads.
- `Span name` — A low-cardinality operation name; do not place IDs or raw user input in it.
- `Span duration` — Elapsed time between span start and end, useful for attributing latency across a request path.
- `Span IsRecording state` — Whether a span is currently recording attributes/events according to SDK sampling and lifecycle behavior; instrumentation should not assume all spans are exported.
- `TraceState` — Vendor-specific trace state propagated alongside trace context; it is distinct from application Baggage.
- `Trace propagation` — Moving trace context through network or messaging carriers to preserve causal identity.
- `Context injection` — Writing current context into an outbound carrier before a call or message publish.
- `Context extraction` — Reading context from an inbound carrier and making it current for downstream work.
- `W3C Trace Context propagator` — An implementation of W3C trace headers for injection and extraction across interoperable services.
- `B3 propagator` — A propagator for the B3 trace context format; configure it only when interoperability with B3 systems is required.
- `Trace sampling` — Choosing which traces are recorded/exported; account for probability, bias, and completeness.
- `Parent-based sampler` — A sampler that follows a parent decision for child spans and applies a root policy when no parent exists.
- `Trace ID ratio sampler` — A probabilistic root sampler selecting traces based on trace ID ratio; it cannot select based on a later outcome.
- `Tail-based sampling` — A collector-side strategy that decides after collecting enough spans to evaluate a trace; requires buffering and trace affinity.
- `Sampling decision` — The keep/drop choice and recording behavior applied to a span or trace; inconsistent layers can fragment evidence.
- `Trace completeness` — How fully a trace contains relevant operations; depends on instrumentation, propagation, sampling, and delivery.
- `Trace fragmentation` — A trace split into disconnected segments because context, sampling, or export was lost across a boundary.
- `OpenTelemetry Tracing API` — The instrumentation interface used to create tracers and spans without coupling code to a concrete exporter.
- `OpenTelemetry Tracing SDK` — The implementation that configures processors, samplers, resources, and span exporters.
- `OpenTelemetry Protocol (OTLP)` — The OpenTelemetry transport protocol for telemetry between SDKs, Collectors, and backends.

## Cross-item comparison

Parent-child spans express nested work. Span links connect related work without imposing that nesting. Client/server and producer/consumer kinds describe boundaries, not arbitrary severity.

## Examples

**Worked example**
An API server span parents a client span for a payment call. The payment server extracts incoming context and continues the same trace. A message producer may create a span linked to a later consumer span when asynchronous causality does not fit a direct parent-child lifetime. Record operation names and bounded attributes; capture an exception event and error status when the call fails. If tail sampling is used, route all spans for a trace to the same decision point.

**Common mistakes:**
Starting a fresh root on every service; putting IDs in span names; treating Baggage as trusted identity; marking handled outcomes as errors indiscriminately; assuming links are parent relationships; and tail-sampling at collectors that see only partial traces.

## Common mistakes

Starting a fresh root on every service; putting IDs in span names; treating Baggage as trusted identity; marking handled outcomes as errors indiscriminately; assuming links are parent relationships; and tail-sampling at collectors that see only partial traces.

## Knowledge checks with answers

1. **What question does this group help answer?** It helps identify the evidence type, data boundary, or operational action appropriate to a real service investigation.
2. **Why do identity and semantics matter?** Consistent names and bounded dimensions allow safe grouping and correlation across producers without uncontrolled series growth.
3. **Name a common failure mode.** Incomplete context, unsafe sensitive data, unsupported component assumptions, or missing delivery health can make apparently healthy dashboards misleading.
4. **How should you apply these terms?** Start from a user or operator question, select the minimal sufficient evidence, verify lifecycle and backend support, and rehearse the investigation.

## Recent version changes

OpenTelemetry Semantic Conventions documentation identifies version 1.45.0 in the checked snapshot. Individual conventions have their own stability status, and migrations may use explicit opt-in modes; do not assume a global release makes every convention stable. [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)

Prometheus 3.0 added UTF-8 metric and label name support; conventional naming remains useful for tool interoperability. Current Prometheus docs distinguish native histograms from classic bucket series. [Prometheus data model](https://prometheus.io/docs/concepts/data_model/) [Metric types](https://prometheus.io/docs/concepts/metric_types/)

