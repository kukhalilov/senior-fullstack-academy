# end-to-end system design case studies — Reference: Trace-log correlation

Sources: [OpenTelemetry Logs data model and correlation](https://opentelemetry.io/docs/specs/otel/logs/), [OpenTelemetry context propagation](https://opentelemetry.io/docs/concepts/context-propagation/), [W3C Trace Context](https://www.w3.org/TR/trace-context/), [W3C Baggage](https://www.w3.org/TR/baggage/), [OpenTelemetry .NET log correlation](https://github.com/open-telemetry/opentelemetry-dotnet/blob/main/docs/logs/correlation/README.md).

## Scope and version

Trace-log correlation connects log records with the distributed trace and span active when the log was emitted. OpenTelemetry log records can carry `TraceId` and `SpanId` fields; SDKs and bridges differ in how they populate and export them. W3C Trace Context standardizes propagation headers such as `traceparent`, but an organization may use other propagators or vendor-specific context. This lesson covers correlation mechanics, not a guarantee that every log is sampled, retained, or queryable with its trace.

## How this group fits the mental model

Traces show a request’s path and timing across instrumented components. Logs provide discrete detailed events, often with application-specific values. A shared trace ID links records to one request trace; a span ID narrows a log to one operation within it. Time and resource identity provide additional ways to search when context is absent.

Correlation works only if context flows through every boundary and logging occurs while the intended context is active. Propagate context across HTTP, messaging, background jobs, and asynchronous execution using supported instrumentation. At a queue boundary, decide whether a new trace is a child of the producer span, linked to it, or independent; long-running jobs may be clearer as a new trace with a span link rather than an extremely long parent-child trace.

## Supplied names explained

- **Trace ID**: identifier shared by spans in one trace. OpenTelemetry log data can include it so a backend can find logs associated with the trace.
- **Span ID**: identifier of the active span, allowing a log to be associated with a particular operation. It is meaningful only together with the trace ID.
- **Trace flags/state**: propagation metadata, including sampling-related flags and vendor state. These values are not authorization or trust signals.
- **`traceparent`**: W3C header carrying version, trace ID, parent span ID, and trace flags. Validate and propagate according to the W3C specification; do not invent or silently corrupt IDs.
- **Baggage**: user-defined key/value context propagated across services by supported propagators. It can expose sensitive data and multiply network/log volume; allow-list keys and avoid personal or secret values.
- **Resource context**: attributes describing the service/process/host that emitted telemetry. It complements trace IDs and helps distinguish records across deployments.
- **Sampling**: a trace may be sampled out while logs remain, or logs may be filtered while the trace remains. Correlation identifiers cannot recover telemetry that was never recorded or retained.

## Cross-item comparison

An application correlation ID can connect logs and requests when tracing is unavailable, but it does not provide span hierarchy or standardized trace semantics. A trace ID and span ID are usually preferable when OpenTelemetry instrumentation is present; an additional business-operation ID may still be useful across retries or multiple traces. A metric label should generally not contain trace IDs because their high cardinality creates unbounded time-series growth. Exemplars can associate selected metric measurements with a trace without labeling every series by trace ID.

Backend-specific trace-to-log UI is a query and storage feature, not an OpenTelemetry guarantee. Verify field names, casing, formatting, ingestion mapping, sampling configuration, and retention in every backend. For privacy, restrict log access and redact values before export; correlation makes sensitive logs easier to discover as well as easier to debug.

## Examples

An ASP.NET Core request enters with a valid `traceparent`. OpenTelemetry instrumentation creates server and database spans. The active .NET `Activity` context is present when the application writes a structured log, so the configured logging integration populates `TraceId` and `SpanId`. The exporter sends trace and log signals separately; the backend joins them using those fields. A log written on a fire-and-forget thread after the request context has ended may have no IDs, so propagate context deliberately or record the operation as a linked background task.

At a message broker, include trace context in message headers through instrumentation rather than copying arbitrary incoming headers. On consume, extract and validate context, create a consumer span, and emit logs while that span is active. Avoid copying user-controlled baggage into logs without an allow-list. If traces are head-sampled, choose log retention and error-sampling policy independently so important failures do not become impossible to investigate.

## Common mistakes

- Assuming correlation works without context propagation or active-span context.
- Logging only a trace ID and omitting the span ID when operation-level drilldown is useful.
- Putting trace IDs in metric labels and causing cardinality explosions.
- Treating trace flags, baggage, or IDs as trusted identity or authorization data.
- Assuming a log and trace have identical sampling, retention, or export success.
- Propagating sensitive baggage across third-party or untrusted boundaries.
- Creating one never-ending trace for a long-running job when span links are more appropriate.
- Believing every log will appear in the tracing UI without backend field mapping and storage.

## Knowledge checks with answers

1. **What do TraceId and SpanId each identify?** The TraceId identifies the trace; the SpanId identifies a specific operation within it.
2. **Does W3C trace context authenticate a caller?** No. It is correlation context and can be supplied by an untrusted sender.
3. **Why avoid trace IDs as metric labels?** Their high cardinality can create an enormous number of distinct time series.
4. **Can a trace ID link a log to data that was never exported?** No. Correlation cannot restore unsampled, dropped, or expired telemetry.
