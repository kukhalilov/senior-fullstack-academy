# end-to-end system design case studies — Reference: OpenTelemetry Protocol (OTLP)

Sources: [OTLP specification](https://opentelemetry.io/docs/specs/otlp/), [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/), [OpenTelemetry signal specification status](https://opentelemetry.io/docs/specs/status/).

## Scope and version

OTLP 1.11.1 is the specification edition checked for this lesson. It identifies traces, metrics, and logs as stable signals and profiles as in development; confirm the deployed SDK, collector, backend, and protocol versions because their feature support may not match the latest specification. OTLP defines protocol/schema behavior, not storage duration, query language, alerting, or end-to-end delivery guarantees across an entire telemetry pipeline.

## How this group fits the mental model

An application or agent creates telemetry, an exporter batches and sends it, an optional collector receives/transforms/routes it, and a backend accepts it for storage and query. OTLP standardizes the encoding and transport between these stages so implementations can interoperate. It is a request/response protocol: clients send an Export request and a receiver responds. That acknowledgement is local to the receiving hop; it does not prove that every downstream system permanently stored or indexed the data.

The protocol supports gRPC and HTTP transports with Protobuf-based payloads, including binary Protobuf and JSON mappings as defined by the spec. Select transport based on runtime, proxies, firewall policy, payload overhead, and interoperability. Common endpoint paths and signal-specific configuration should follow exporter/collector documentation; do not assume every backend supports every encoding or compression option.

## Supplied names explained

- **OTLP**: the protocol name and the standardized Export request/response model for OpenTelemetry telemetry data.
- **Traces, metrics, logs, profiles**: telemetry signals with distinct data models. Stable OTLP support for the first three does not imply the profiles signal is stable; the profiles protocol section is currently in development.
- **OTLP/gRPC**: OTLP over gRPC using Protobuf messages and gRPC status semantics.
- **OTLP/HTTP**: OTLP over HTTP, typically using signal-specific export endpoints and Protobuf or JSON payloads as specified. Verify supported content type and endpoint for the exporter/backend pair.
- **Export request/response**: the client sends telemetry; the server acknowledges or reports an error/partial rejection. A response may include `partial_success` with rejected item counts and a message.
- **Partial success**: a receiver accepted part of a payload and rejected some spans, data points, log records, or profiles. Treat rejected-item counts and messages as actionable; an overall successful HTTP/gRPC exchange does not mean every record was accepted.
- **Collector**: an optional pipeline component that receives OTLP, processes or transforms it, and exports to another destination. It is not required by OTLP and is not automatically a durable queue.
- **Resource and instrumentation scope**: metadata describing the producing entity and instrumentation library/version; correct attributes improve attribution but can create sensitive-data or cardinality concerns.

## Cross-item comparison

OTLP is a telemetry protocol, while formats such as Prometheus exposition, Jaeger-specific protocols, Zipkin, or vendor agents are ingestion interfaces or ecosystems with different models. OpenTelemetry SDKs can expose or export to multiple destinations, but semantic conversion may lose fields or change behavior. A collector can bridge formats and route data, but every translation needs compatibility and loss tests.

Direct-to-backend export has fewer moving parts but ties services to backend endpoints and credentials. A collector tier centralizes processors, routing, batching, and policy, while adding a hop, resource demand, configuration ownership, and failure modes. Choose based on operational control, network boundaries, data governance, and whether the pipeline can absorb outages.

## Examples

An application batches trace spans and sends an OTLP/HTTP Export request to a nearby collector. The collector returns success for the request but reports a nonzero rejected-span count in `partial_success`. The exporter should surface that signal, avoid blindly resending already accepted spans, and follow the protocol’s retry guidance. Retrying an entire partially accepted batch may create duplicates or repeat rejected content; deduplication and backend behavior are implementation-specific.

During a backend outage, decide whether the collector buffers in memory or on disk, how much data it can retain, and what happens when capacity is exhausted. An in-memory queue can lose data on restart. A persistent queue improves restart tolerance but consumes disk and still needs bounded capacity, backpressure, and monitoring. Sampling, filtering, and dropping policy should be explicit because telemetry is often best-effort and can itself overwhelm the system during an incident.

## Common mistakes

- Treating OTLP as a durable end-to-end exactly-once delivery system.
- Assuming an Export success response means all records were accepted or stored permanently.
- Ignoring `partial_success` and rejected-item counts.
- Claiming profiles are stable because traces, metrics, and logs are stable.
- Assuming every collector or backend supports every transport, encoding, signal, or version.
- Building unbounded queues that convert a backend outage into memory or disk exhaustion.
- Sending secrets or high-cardinality user identifiers in resource attributes without governance.
- Treating a collector as durable storage without checking its queue and persistence configuration.

## Knowledge checks with answers

1. **Which OTLP signals are stable in the current specification status?** Traces, metrics, and logs; profiles are in development.
2. **What does `partial_success` mean?** Some telemetry items were rejected even though the receiver returned a response; inspect the rejected count/message.
3. **Does collector acknowledgement prove backend persistence?** No. It acknowledges that hop; downstream durability depends on collector/exporter/backend behavior.
4. **Why might an organization deploy a collector?** To centralize routing, processing, batching, and policy, while accepting its additional operational and failure costs.
