# observability signals instrumentation and service objectives — Reference: Structured events, trace graphs, span data, and cross-service context

# Scope and version

This lesson explains the supplied log, trace, context, and profile names. The OpenTelemetry source snapshot is checked 2026-11-17. The Logs data model and core logging specification are stable, while language-level implementations differ. The Profiles protocol is in development/alpha; treat its interoperability and implementation maturity accordingly. HTTP semantic conventions evolve and may include stability differences by attribute or convention. [OpenTelemetry logs](https://opentelemetry.io/docs/concepts/signals/logs/) [Specification status](https://opentelemetry.io/docs/specs/status/) [Profiles](https://opentelemetry.io/docs/specs/otel/profiles/)

# How this group fits the mental model

Metrics reveal aggregate behavior; logs record events; traces connect spans in a causal request path; context propagation carries correlation across process boundaries. Profiles add a view of sampled resource consumption, but their ecosystem maturity is still developing. These records can be correlated, yet they remain separate data with separate retention and sampling policies. An absent child span or log record may reflect instrumentation or pipeline loss rather than absence of work.

# Supplied names explained

## Logs and their structure

- `Log record` — A timestamped event record with body and contextual fields such as severity, attributes, resource, and trace context. Structured fields support querying more reliably than parsing free-form prose.
- `Structured log` — A log whose fields have explicit keys and types, often encoded as JSON or mapped into an observability data model. Stable structure enables filters and aggregation but needs a schema and privacy policy.
- `Log severity` — A level indicating event importance, commonly used for filtering and alert context. Severity mappings vary across libraries, so do not assume identical names always map identically.
- `Log body` — The primary event content, which may be text or structured content. Avoid putting secrets or unbounded payloads in it merely because it is not a metric label.
- `Log attribute` — A typed key/value field describing an event. Use bounded, meaningful keys; constrain sensitive and high-volume values.
- `Log resource` — The identity attributes of the process or service emitting the log record. Consistent resource identity helps correlate records across telemetry.
- `Log correlation` — Linking a log to related trace/span or business context identifiers. Correlation requires instrumentation to populate fields and a backend to preserve/search them.
- `Log sampling` — Selecting only some log records for export or retention. Sampling can remove the rare event needed to diagnose an incident; policies should favor high-value events and disclose selection.

OpenTelemetry’s logs data model can represent existing logs and structured records. Existing application logs do not become trace-correlated automatically: a bridge/appender or other instrumentation must attach active context, and the implementation must export it. [Logs concepts](https://opentelemetry.io/docs/concepts/signals/logs/) [Status](https://opentelemetry.io/docs/specs/status/)

## Trace identity and span graph

- `Trace` — A set of causally related spans describing an operation across components. It is a diagnostic representation, not necessarily every request, because sampling and data loss may apply.
- `Trace ID` — The identifier shared by spans in one distributed trace. It enables grouping, but externally supplied IDs must be treated as untrusted and validated at boundaries.
- `Span` — A timed unit of work with a name, kind, attributes, status, events, and links. Good span boundaries align with meaningful operations rather than every trivial function call.
- `Span ID` — The identifier of one span, used to reference it as a parent or correlate events. It is distinct from the trace identifier.
- `Parent span ID` — The identifier of the direct parent span, when a parent-child relationship exists. Root spans have no parent; asynchronous related work may instead use a link.
- `Span context` — The immutable identity and trace-state information needed to correlate a span across process boundaries. It is the propagation payload, not the entire span record.
- `Span kind` — A role classification describing how an operation participates in a request or messaging interaction. Correct kinds help interpret client/server direction and semantic conventions.
- `Internal span` — A span describing work within one process that is not modeled as a remote client/server or messaging boundary. It can reveal internal stages without pretending to be a network call.
- `Server span` — A span representing the server side of handling a request. It generally begins when the server accepts the operation and ends when its handling is complete.
- `Client span` — A span representing an outgoing call to another service or resource. It helps distinguish local processing from dependency latency.
- `Producer span` — A span representing production of a message for asynchronous processing. It normally does not parent a consumer’s later execution in a synchronous tree; propagation or links connect the work.
- `Consumer span` — A span representing message processing. A consumer may process a batch or be retried, so links and message context can be more accurate than assuming a simple one-parent chain.
- `Span attribute` — A key/value describing a span, such as a bounded HTTP method or route template. Attributes should use conventions and avoid secrets, arbitrary payloads, and uncontrolled cardinality.
- `Span event` — A timestamped event attached to a span, useful for notable points such as a retry or exception. It is not a separate child span and should not replace structured logs for every detail.
- `Span status` — A coarse outcome state associated with a span. Status is not a universal application error taxonomy; set it consistently with operation semantics.
- `Span link` — A relationship from one span to another context that is not expressed as a parent-child edge. Links suit batch, fan-in, and asynchronous relationships.
- `Distributed trace` — A trace whose spans were created across multiple processes or services. It depends on context propagation, consistent identifiers, compatible sampling, and collector/backend retention.
- `Trace context propagation` — Injecting and extracting trace context across an execution or network boundary. Missing or untrusted context must be handled deliberately; propagation is not automatic in every library.

## W3C and OpenTelemetry context

- `W3C Trace Context` — The W3C standard for propagating trace identity and trace state in request metadata. It provides interoperability conventions, not authorization or proof that an inbound context is trustworthy.
- `traceparent header` — The W3C HTTP header encoding trace ID, parent span ID, and trace flags. Parse and validate it; do not use it as an authentication credential.
- `tracestate header` — The W3C header carrying vendor-specific trace state associated with the trace context. Apply size, parsing, and trust policies at boundaries.
- `Baggage` — A propagated collection of user-defined key/value context. It can be forwarded to downstream services, so allowlist fields, limit size, and never place credentials or sensitive personal data in it.
- `Baggage member` — One key/value entry in baggage with optional properties. The value may cross many services and should be treated as externally visible data.
- `Baggage propagation` — Injecting/extracting baggage along a request path. Propagation can amplify privacy and cardinality risks; restrict keys and destinations.
- `OpenTelemetry context` — The execution-scoped container used to carry the active span and other context through instrumentation. Correct context management is necessary for automatic parentage and log correlation.
- `OpenTelemetry propagator` — A component that injects or extracts context using a format such as W3C Trace Context and Baggage. Configure compatible propagators and trust behavior at each boundary.
- `OpenTelemetry context manager` — A language-specific mechanism for setting and retrieving the current context during execution. Async/task boundaries must preserve it correctly; otherwise spans become disconnected.
- `OpenTelemetry trace API` — The language API used to create tracers and spans independently of the SDK implementation. Actual recording/export depends on configured SDK behavior.
- `OpenTelemetry meter API` — The language API for creating metric instruments and recording measurements. Its interface can be stable while SDK support or particular instrument behaviors differ by language.
- `OpenTelemetry log API` — The OpenTelemetry logging/bridge API surface for emitting or adapting log records. It is distinct from the stability and maturity of each language’s logging integration.

## Semantic conventions and correlation

- `OpenTelemetry semantic conventions for HTTP` — Shared attribute names and meanings for HTTP operations. Convention versions and individual attribute stability matter for migration and backend queries.
- `HTTP server span` — A server-side HTTP span following the relevant semantic conventions, with fields such as method, route, and status where applicable. Prefer a route template over raw path values to avoid privacy leaks and cardinality growth.
- `HTTP client span` — A span for an outgoing HTTP operation. It should identify the dependency and relevant operation without copying sensitive query strings or authorization headers.
- `Database client span` — A span representing a database operation from the client’s perspective. It can show latency and operation context; avoid embedding full SQL parameters or credentials.
- `Messaging producer span` — A span describing publishing a message. Its context may be carried in message metadata for downstream correlation.
- `Messaging consumer span` — A span describing consuming/processing a message. Batches, fan-in, reprocessing, and retries may make a span link more faithful than direct parentage.
- `Trace sampling decision` — The choice whether a trace is recorded/exported, potentially represented in trace flags and SDK policy. Propagated decisions can improve consistency, but decisions may be overridden by trust or local policy.
- `Trace exemplar` — A sampled reference from a metric data point to a trace or other diagnostic record. Exemplars provide a navigation hint, not a guarantee that the trace is retained or searchable.
- `Metric-to-trace correlation` — Navigation from a metric observation/exemplar to a trace. It requires compatible trace identifiers and exemplar storage; aggregates may not retain one representative trace for every observation.
- `Log-to-trace correlation` — Associating a log record with trace and span identifiers. Instrumentation must add valid IDs, and log export must preserve them.

## Trace interpretation and profiling

- `Trace waterfall` — A timeline visualization of spans and their parent-child relations. It helps locate duration and overlap, but clock skew, missing spans, sampling, and inaccurate boundaries can distort the picture.
- `Trace critical path` — The longest causally dependent path contributing to a trace’s completion time. Parallel branches mean adding all span durations is wrong; the path is only trustworthy when timing and parentage are sound.
- `Trace context trust boundary` — A boundary where externally supplied trace metadata is validated, limited, continued, or replaced according to policy. Trace IDs are correlation data, not trusted identity.
- `OpenTelemetry Profiles signal` — A developing signal for sampled resource-consumption data such as where execution uses CPU or memory. It can complement traces and metrics, but interoperability and support remain less mature than established signals.
- `OpenTelemetry Profiles protocol` — The protocol/data model work for carrying profiles through OpenTelemetry. Its status is development/alpha in this snapshot; do not assume broad stable SDK, Collector, or backend support. [Profiles specification](https://opentelemetry.io/docs/specs/otel/profiles/) [Profiles concepts](https://opentelemetry.io/docs/concepts/signals/profiles/)

# Cross-item comparison

| Data | Shape | Diagnostic question |
| --- | --- | --- |
| Log record | Event with body and fields | What event or error was recorded? |
| Span | Timed operation in a trace | Which operation took time or failed? |
| Trace | Related span graph | How did one request flow across boundaries? |
| Baggage | Propagated key/value context | What approved context should downstream work receive? |
| Profile | Samples of resource use over execution | Where did process resources go? |

A parent-child edge means a direct causal execution relationship; a link means related context without asserting that hierarchy. A log can carry trace IDs, but remains a log event. Baggage can be forwarded but is not automatically recorded as a log or span attribute. Profiles are complementary evidence, not an alternative trace view. [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/) [W3C/OTel status](https://opentelemetry.io/docs/specs/status/)

# Examples

A web server extracts a validated `traceparent`, starts a server span, and records a bounded route template. The handler calls a database client, which creates a client span parented to the server span. The handler logs an error and explicitly attaches the active trace and span IDs through its logging integration. It then publishes a message with approved trace context; a later consumer creates a processing span linked or parented according to the messaging semantics. A metric histogram records request duration; an exemplar may link one observation to an available trace. None of these steps means every request has a retained trace.

# Common mistakes

- Assuming existing logs become correlated merely because OpenTelemetry is installed.
- Passing external trace IDs through authorization or tenant checks as if they were trusted identity.
- Putting secrets, email addresses, or raw query strings in baggage or span attributes.
- Assuming all messaging work is a synchronous child span of the producer.
- Treating span status as a complete business outcome model.
- Reading wall-clock span alignment as exact causal truth despite clock skew or missing data.
- Assuming a metric exemplar guarantees its referenced trace will still be retained.
- Calling Profiles stable because the established trace signal is stable.

# Knowledge checks with answers

1. What identifies an individual span? **Its span ID; the trace ID identifies the encompassing trace.**
2. When is a span link useful? **When work is related but parent-child hierarchy would misrepresent the relationship, such as fan-in or asynchronous processing.**
3. Does `traceparent` authenticate a caller? **No. It supplies correlation context and must be treated as untrusted at external boundaries.**
4. How do logs gain trace correlation? **An integration or instrumentation explicitly records the active trace/span identifiers.**
5. What is the maturity caveat for Profiles? **The protocol is still in development/alpha; implementation support is not broadly stable.**

# Sources

[OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/) · [Logs](https://opentelemetry.io/docs/concepts/signals/logs/) · [Traces](https://opentelemetry.io/docs/concepts/signals/traces/) · [Baggage](https://opentelemetry.io/docs/concepts/signals/baggage/) · [Profiles specification](https://opentelemetry.io/docs/specs/otel/profiles/) · [HTTP semantic conventions](https://opentelemetry.io/docs/specs/semconv/http/)
