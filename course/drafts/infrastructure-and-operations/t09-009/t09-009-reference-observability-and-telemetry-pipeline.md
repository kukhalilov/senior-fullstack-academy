# observability signals instrumentation and service objectives — Reference: Telemetry signal lifecycle, collection, transport, storage, and sampling

# Scope and version

This lesson explains the supplied telemetry pipeline vocabulary and OpenTelemetry foundations. It reflects the source snapshot checked 2026-11-17. Component lifecycle is independent: tracing API/SDK/OTLP are stable in the specification summary; metric SDK support is mixed; Collector components have mixed maturity; Profiles protocol is in development. Verify the specific language distribution and component before production use. [OpenTelemetry status](https://opentelemetry.io/docs/specs/status/) [Component status](https://opentelemetry.io/status/)

# How this group fits the mental model

The pipeline begins when a program or host produces evidence and ends when a backend makes it queryable. Each stage has its own data contract, cost, failure mode, and operator. A diagram that says “send telemetry to the cloud” hides important questions: which process instruments, which component buffers, which policy removes data, where secrets are redacted, what happens during an outage, and how delivery is observed.

# Supplied names explained

## Purpose, monitoring, and creation

- `Observability` — Designing emitted evidence so operators can infer internal behavior, including unanticipated behavior. It is bounded by what was instrumented, retained, and made queryable.
- `Monitoring` — Repeatedly evaluating known conditions, often through dashboards and alerts. It is a practical use of observability data, not a synonym for all diagnosis.
- `Telemetry` — Measurements and records emitted by software or infrastructure for analysis. Telemetry quality depends on correct instrumentation and context, not just volume.
- `Instrumentation` — Code or agents that create or capture telemetry. It should make important operations visible while controlling overhead and sensitive fields.
- `Library instrumentation` — Instrumentation supplied by a framework or library integration. It gives consistent coverage of common operations but cannot infer every business event.
- `Automatic instrumentation` — Instrumentation added at runtime/build/deployment without editing each call site. It accelerates baseline coverage; verify what it captures and avoid duplicate manual spans.
- `Manual instrumentation` — Explicit telemetry added by application developers at meaningful boundaries. It can express domain intent, but careless event or attribute creation can create cost, cardinality, or privacy issues.

## Pipeline roles and topology

- `Telemetry pipeline` — The stages that receive, process, transport, store, and expose telemetry. Draw boundaries and define failure behavior instead of assuming a single reliable pipe.
- `Telemetry receiver` — A component endpoint that accepts a format or protocol. It may validate and decode input, but successful acceptance does not prove durable storage downstream.
- `Telemetry processor` — A stage that transforms, batches, filters, samples, or enriches data. Ordering matters: redaction before export protects destinations, while filtering before a needed policy decision may remove evidence.
- `Telemetry exporter` — A component that sends telemetry to a destination or protocol. Endpoint, authentication, retries, queue limits, and error reporting determine its operational behavior.
- `Telemetry backend` — The storage/query service used by dashboards, alert rules, or investigators. Retention, indexing, consistency, query language, and access controls are backend-specific.
- `Telemetry collector` — A general intermediary that receives, processes, and exports telemetry, commonly the OpenTelemetry Collector or an agent. It decouples applications from destinations but adds a component to operate.
- `Agent collector` — A collector deployed near each host, node, or workload. It can provide local buffering and enrichment, while increasing deployment footprint and requiring fleet-wide configuration management.
- `Gateway collector` — A shared collector tier that centralizes routing, policy, and credentials. It can simplify application configuration but requires capacity, availability, isolation, and backpressure planning.

## OpenTelemetry model and protocol

- `OpenTelemetry` — A vendor-neutral observability framework covering APIs, SDKs, semantic conventions, protocols, and collection components. It standardizes interfaces and data models; it does not guarantee identical backend behavior.
- `OpenTelemetry API` — Language-facing interfaces used by application code to create telemetry without binding instrumentation to a particular SDK/exporter. A no-op or disabled implementation can satisfy the API while producing no exported data.
- `OpenTelemetry SDK` — The language-specific implementation that configures processors, sampling, resources, and exporters. Stability and feature availability vary by signal and language.
- `OpenTelemetry specification` — The normative, signal-by-signal definitions for data models, APIs, protocol, and component behavior. Its lifecycle status is not a blanket product certification.
- `OpenTelemetry component lifecycle` — The maturity labels Draft, Experimental, Stable, Deprecated, and Removed. Read status at the exact component/API/SDK level.
- `OpenTelemetry stable component` — A component with backward-compatibility and long-term-support guarantees defined by its project policy. Stable does not mean feature-complete or operationally configured for your deployment.
- `OpenTelemetry experimental component` — A released component intended for evaluation whose behavior or configuration may change. Treat upgrades and compatibility as higher risk.
- `OpenTelemetry deprecated component` — A stable component marked for eventual removal. Plan migration and heed the published timeline rather than starting new dependencies casually.
- `OpenTelemetry Protocol (OTLP)` — OpenTelemetry’s vendor-neutral wire protocol for telemetry transfer. A receiver and exporter must agree on supported signals, transport, encoding, and authentication.
- `OTLP/gRPC` — OTLP over gRPC. It is a binary RPC transport that can be efficient, but network proxies, HTTP/2 support, and firewall configuration must permit it.
- `OTLP/HTTP` — OTLP over HTTP. It can fit common HTTP networking environments; confirm endpoint paths, compression, TLS, and encoding support at both ends.
- `OTLP JSON encoding` — The JSON mapping for OTLP protobuf messages, useful where JSON tooling or transport compatibility matters. It is a defined encoding, not arbitrary JSON shaped like telemetry.
- `OTLP Protobuf encoding` — The protobuf wire encoding used by OTLP. It is compact and typed; it requires compatible protobuf protocol handling.

## Collector components

- `OpenTelemetry Collector` — A vendor-neutral service that receives, processes, and exports telemetry. The core and contrib distributions include different component sets and stability levels; audit the actual binary’s components.
- `Collector receiver` — A Collector component that ingests a signal from an OTLP endpoint or another supported source. A pipeline must explicitly enable the receiver for the intended signal.
- `Collector processor` — A Collector pipeline stage that transforms data after reception and before export. Processor order and per-signal support affect results.
- `Collector exporter` — A Collector component that writes to a configured destination. Backpressure and export errors need monitoring; exporter presence in a registry is not the same as stable support.
- `Collector connector` — A component that consumes one pipeline’s output and emits data into another pipeline, often converting or deriving signals. It creates a deliberate signal boundary that needs its own semantics.
- `Collector extension` — A component that adds a service capability such as health reporting or authentication support rather than acting as a telemetry pipeline processor. Extensions have their own configuration and status.
- `Collector pipeline` — A signal-specific path composed from receivers, processors, and exporters. A component not referenced by an enabled pipeline may not process data at all.
- `Collector transform processor` — A processor that applies transformations using OTTL for supported telemetry. OTTL v1 stability from Collector Contrib v0.164.0 is a language guarantee and does not itself declare every transform-processor release stable. [OTTL v1](https://opentelemetry.io/blog/2026/ottl-v1/) [Transformation guide](https://opentelemetry.io/docs/collector/transforming-telemetry/)
- `Collector batch processor` — A processor that groups telemetry before export to reduce request overhead and improve throughput. Batch size and timeout trade latency against efficiency; batching is not a durable queue.
- `Collector memory limiter processor` — A protective processor that monitors memory and can refuse data under pressure so the process remains within configured limits. It is a safeguard, not extra memory or a guarantee that upstream retries will succeed.

## Sampling, governance, and cost

- `Telemetry sampling` — Keeping only selected telemetry according to a policy. It reduces volume, but changes what can be inferred and must be reflected in analysis.
- `Head-based sampling` — Deciding whether to record/export a trace near its start, commonly using trace context. It is cheap and can keep trace decisions consistent, but cannot use the final error or latency outcome at decision time.
- `Tail-based sampling` — Deciding after collecting enough of a trace to evaluate its outcome. It can prioritize errors or slow traces but requires state, buffering, complete routing to the decision point, and burst capacity.
- `Telemetry filtering` — Excluding telemetry based on rules such as signal, attribute, or environment. Filtering can lower cost and risk, but document the removed evidence and test that required diagnostics remain.
- `Telemetry redaction` — Removing or masking sensitive values before they reach destinations. Prefer allowlisting approved attributes and test nested or encoded payload paths; redaction should not rely on naming convention alone.
- `Telemetry retention` — How long data remains queryable or archived. Choose per signal and use case; longer retention increases storage cost and can increase privacy exposure.
- `Telemetry cardinality` — The number of distinct metric series or attribute combinations produced. Metric cardinality especially affects indexing and memory; distinguish it from raw log volume.
- `Telemetry cost attribution` — Connecting ingestion, storage, and query cost to teams, services, or environments. Consistent resource identity helps, but allocation is only as accurate as those attributes and backend accounting.

## Identity and conventions

- `Telemetry resource` — Attributes describing the entity that produced telemetry, such as a service or deployment. Resource identity should be stable enough to join data without embedding secrets or per-request identifiers.
- `Telemetry attribute` — A key/value attached to a resource, span, log, or metric point. Attribute meaning, type, cardinality, and sensitivity should be designed deliberately.
- `Semantic convention` — A shared naming and meaning convention for common telemetry fields and operations. It improves interoperability but can evolve; keep the convention version and migration behavior in view.
- `OpenTelemetry resource detector` — An SDK or Collector component that discovers resource attributes from runtime or environment sources. Detectors can expose environment metadata, so review and constrain the collected fields.

# Cross-item comparison

An agent collector places processing close to workloads; a gateway collector centralizes it. Many systems use both: agents handle local discovery/buffering and a gateway handles policy/export. Head sampling chooses early with low state; tail sampling chooses later with richer outcome knowledge but higher memory and routing requirements. Filtering drops records; redaction changes values; retention controls duration. They address different risks and should not be treated as synonyms. OTel API provides an instrumentation boundary; SDK provides runtime behavior; OTLP transports data; Collector routes/processes it.

# Examples

A service can instrument its HTTP framework with a stable language SDK, attach a bounded service resource, and export OTLP/HTTP to an agent. The agent batches records, applies an allowlist-based redaction policy, and exports over authenticated transport to a gateway. The gateway routes traces and logs to different backends. Each collector exposes its health and queue behavior, and a load test verifies behavior while the gateway is unreachable. This is an architecture example; actual component names and stability must be checked against the selected distribution.

# Common mistakes

- Assuming a receiver’s successful response proves durable downstream storage.
- Assuming all Collector components in a distribution are stable because OpenTelemetry itself is mature.
- Treating SDK defaults as a substitute for explicitly configuring sampling, resource attributes, and exporter security.
- Redacting only at the backend after sensitive data has already crossed network and storage boundaries.
- Increasing queues without memory budgets or a policy for prolonged destination failure.
- Using high-cardinality attributes as metric labels and expecting filtering after ingestion to undo the cost.
- Treating sampling as random in every configuration; policies may deliberately favor certain outcomes and bias analysis.

# Knowledge checks with answers

1. What does OTLP standardize? **A protocol/data transfer contract, not every backend’s query or storage semantics.**
2. When can tail sampling choose based on an error? **After enough spans arrive to observe the outcome, which requires buffering and complete trace routing.**
3. Why is a redaction processor placed before export? **So excluded sensitive values do not leave the controlled boundary for downstream exporters.**
4. Is the Collector’s component maturity identical across the distribution? **No. Check each selected receiver, processor, exporter, connector, or extension.**
5. What is the difference between a resource and a span attribute? **A resource identifies the producing entity; a span attribute describes an operation or its context.**

# Sources

[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) · [OTLP specification](https://opentelemetry.io/docs/specs/otlp/) · [Semantic conventions](https://opentelemetry.io/docs/specs/semconv/) · [Status summary](https://opentelemetry.io/docs/specs/status/) · [OTTL v1](https://opentelemetry.io/blog/2026/ottl-v1/)
