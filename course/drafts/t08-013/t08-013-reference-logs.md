# observability logs metrics tracing alerts and OpenTelemetry — Reference: Log records, severity, structure, context, and retention

Sources: [official reference 1](https://opentelemetry.io/docs/specs/otel/logs/), [official reference 2](https://opentelemetry.io/docs/concepts/signals/logs/).

## Scope and version

This guide explains the assigned observability inventory group in the context of the current OpenTelemetry specification snapshot and Prometheus 3.x/current documentation checked 2026-11-14. The terminology and component maturity can evolve. The observability profiles signal and individual Collector components do not have a universal stability guarantee.

## How this group fits the mental model

Logs are event records, not merely printed strings. A robust log path preserves event time, observation time, severity, body, resource identity, instrumentation scope, attributes, and optional trace context as separate fields. This separation enables filtering and correlation without parsing prose. Logs complement metrics and spans: use an event record for a detailed decision or failure, while aggregates and traces answer population and causal questions.

## Supplied names explained

- `Log record` — A structured telemetry record representing an event, with body, timestamps, severity, attributes, resource, and scope kept distinct.
- `Log body` — The human-readable or structured content describing the event; avoid embedding fields that should be queryable as attributes.
- `Log severity number` — A numeric severity used for ordering and filtering; map source levels consistently rather than assuming every library uses identical names.
- `Log severity text` — The source-facing severity label; retain it for interpretation while using normalized severity where interoperating.
- `Log timestamp` — The event time supplied by the source, if known; it may differ from the time a collector observes the record.
- `Observed timestamp` — When the telemetry system observed the record; useful when the source event time is missing or clocks differ.
- `Log TraceId field` — Optional trace correlation field containing the trace identifier associated with the event.
- `Log SpanId field` — Optional span correlation field that narrows an event to the active operation.
- `TraceFlags log field` — Trace flags associated with log trace context; interpret as trace metadata, not as a security decision.
- `Log Resource field` — Resource identity shared by records from an entity, such as service and deployment.
- `Log InstrumentationScope field` — Identity of the instrumentation library or component that emitted the log.
- `Log Attributes field` — Per-record key/value fields for queryable event details; choose stable names and avoid uncontrolled values.
- `Log EventName field` — A stable event type name that supports grouping independently of variable body text.
- `Structured logging` — Writing explicit fields with stable types and names; it enables safe querying and avoids fragile prose parsing.
- `Unstructured logging` — Free-form text; it remains readable but is harder to filter reliably and often tempts downstream parsing.
- `Semantic log attributes` — Conventional attribute names with shared meanings, improving correlation across libraries and services.
- `Exception event` — Telemetry describing an exception occurrence; include safe type and context while avoiding raw secrets or huge stack payloads by default.
- `Application log` — An event emitted by application code to explain a decision, transition, or failure.
- `Audit log` — A record of security-relevant actions requiring stronger integrity, access, and retention controls than routine diagnostic logs.
- `Access log` — A record of an access request and result; ensure fields and retention align with privacy and operational needs.
- `Log correlation` — Connecting records to traces or requests using identifiers and time; identifiers must be propagated correctly.
- `Log sampling` — Retaining a subset of logs; preserve important security/audit records under their separate policy and avoid sampling away rare errors unknowingly.
- `Log aggregation` — Combining records from producers into a queryable destination; centralization adds access control and outage-delivery responsibilities.
- `Log retention` — The period records remain available; longer retention costs more and increases the impact of sensitive-data exposure.
- `Log rotation` — Closing and replacing local log files to bound disk use; rotation must coordinate with readers and avoid loss or disk exhaustion.
- `Sensitive-field redaction` — Masking or removing sensitive log fields before they reach broadly accessible storage.
- `High-volume log cost` — The storage, ingestion, indexing, and query expense of verbose events; control it with useful levels, sampling, and retention.
- `OpenTelemetry Logs data model` — A vendor-neutral record model that keeps event timestamps, severity, body, context, resource, scope, and attributes separate.
- `OpenTelemetry log bridge` — An integration that maps an existing logging API/provider into OpenTelemetry log records; verify mapping and duplicate-export behavior.

## Cross-item comparison

Structured logs preserve queryable fields, while unstructured text needs parsing. Exception events, application diagnostics, audit records, and access records have different retention and access needs.

## Examples

**Worked example**
A checkout failure record should separate its event body from severity, source event timestamp, observed timestamp, service resource, instrumentation scope, stable event name, safe attributes, and any valid trace/span context. A downstream query can filter by service and event name, then follow trace context to the request path. An audit event needs stronger integrity and access controls than a routine debug record.

**Common mistakes:**
Parsing unstable prose for dashboards; logging tokens or raw payment data; treating event and observed timestamps as interchangeable; sampling audit events under ordinary debug policy; and allowing local log files to fill a disk.

## Common mistakes

Parsing unstable prose for dashboards; logging tokens or raw payment data; treating event and observed timestamps as interchangeable; sampling audit events under ordinary debug policy; and allowing local log files to fill a disk.

## Knowledge checks with answers

1. **What question does this group help answer?** It helps identify the evidence type, data boundary, or operational action appropriate to a real service investigation.
2. **Why do identity and semantics matter?** Consistent names and bounded dimensions allow safe grouping and correlation across producers without uncontrolled series growth.
3. **Name a common failure mode.** Incomplete context, unsafe sensitive data, unsupported component assumptions, or missing delivery health can make apparently healthy dashboards misleading.
4. **How should you apply these terms?** Start from a user or operator question, select the minimal sufficient evidence, verify lifecycle and backend support, and rehearse the investigation.

## Recent version changes

OpenTelemetry Semantic Conventions documentation identifies version 1.45.0 in the checked snapshot. Individual conventions have their own stability status, and migrations may use explicit opt-in modes; do not assume a global release makes every convention stable. [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)

Prometheus 3.0 added UTF-8 metric and label name support; conventional naming remains useful for tool interoperability. Current Prometheus docs distinguish native histograms from classic bucket series. [Prometheus data model](https://prometheus.io/docs/concepts/data_model/) [Metric types](https://prometheus.io/docs/concepts/metric_types/)

