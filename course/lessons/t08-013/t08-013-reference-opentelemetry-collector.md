# observability logs metrics tracing alerts and OpenTelemetry — Reference: Collector components, configuration, pipelines, and delivery resilience

Sources: [official reference 1](https://opentelemetry.io/docs/collector/architecture/), [official reference 2](https://opentelemetry.io/docs/collector/configuration/).

## Scope and version

This guide explains the assigned observability inventory group in the context of the current OpenTelemetry specification snapshot and Prometheus 3.x/current documentation checked 2026-11-20. The terminology and component maturity can evolve. The observability profiles signal and individual Collector components do not have a universal stability guarantee.

## How this group fits the mental model

The Collector is a separately operated telemetry router. Receivers accept data, processors transform or control it, exporters deliver it, connectors bridge pipelines, and extensions add operational capabilities. Components are not active just because a binary contains them: configuration must wire compatible components into a signal-specific service pipeline. Queues, retries, memory limits, and routing define behavior during outages.

## Supplied names explained

- `OpenTelemetry Collector` — A vendor-neutral executable that receives, processes, and exports telemetry using configured pipelines.
- `Collector distribution` — A packaged Collector binary with a specific set of components; component availability depends on that distribution.
- `Core distribution` — The minimal official Collector distribution containing a focused set of core components; do not assume it includes contrib integrations.
- `Contrib distribution` — A broader Collector distribution containing community-contributed components, with individual stability and maintenance differing.
- `Collector Builder (ocb)` — A tool for building a custom Collector distribution from selected components; the resulting binary and configuration must be versioned and maintained.
- `Receiver` — A Collector component that accepts telemetry through a protocol or source.
- `Processor` — A Collector component that modifies, filters, batches, samples, or otherwise processes data in a pipeline.
- `Exporter` — A Collector component that sends telemetry to a destination.
- `Connector` — A component that links one pipeline’s output to another pipeline’s input, enabling signal transformation or derived data flows.
- `Extension` — A component that provides Collector capabilities outside a telemetry pipeline, such as health or storage services.
- `Receiver configuration` — Settings that enable a receiver and define endpoints, protocols, and related behavior; secure network exposure explicitly.
- `Processor ordering` — The order processors execute in a pipeline; transformations and filtering may change what later processors see.
- `Exporter queue` — A bounded buffer that absorbs short downstream interruptions; it consumes memory or persistent storage and can still fill.
- `Service pipeline` — The Collector service configuration that wires receivers, processors, exporters, and a signal type into an active flow.
- `Traces pipeline` — A service pipeline whose receiver, processors, and exporters support trace data.
- `Metrics pipeline` — A service pipeline whose receiver, processors, and exporters support metric data.
- `Logs pipeline` — A service pipeline whose receiver, processors, and exporters support log data.
- `Pipeline fan-out` — Sending a pipeline’s data to multiple exporters or downstream paths; delivery and failure behavior must be understood per branch.
- `Pipeline connector` — A connector instance wired between pipelines; it is not automatically active merely because its component exists.
- `OTLP receiver` — A receiver accepting telemetry using OTLP; configure transport, endpoint, authentication, and TLS intentionally.
- `OTLP exporter` — An exporter sending telemetry via OTLP to a Collector or compatible backend.
- `Batch processor` — A processor that groups telemetry before export to improve efficiency; tune size and timeout against latency and memory.
- `Memory limiter processor` — A guard that applies back-pressure or drops data near memory limits; it is a safety mechanism, not a substitute for capacity planning.
- `Attributes processor` — A processor for inserting, updating, hashing, or deleting selected attributes according to supported actions.
- `Transform processor` — A processor for expressive telemetry transformations; validate statements and test behavior against the Collector version and signal.
- `Filter processor` — A processor that drops telemetry matching configured conditions; filtering can reduce cost but can remove incident evidence.
- `Resource processor` — A processor that changes resource attributes; use carefully because incorrect identity merges unrelated telemetry.
- `Tail sampling processor` — A processor that buffers traces and applies policies after observing spans; size memory and route all spans for one trace consistently.
- `Health Check extension` — An extension exposing Collector health for orchestrators and monitoring; healthy process status does not guarantee successful telemetry export.
- `zPages extension` — A diagnostic extension exposing internal Collector telemetry/state for troubleshooting; restrict access and verify its maturity and deployment suitability.
- `Collector gateway deployment` — A centralized or tiered Collector topology receiving telemetry from agents or applications; it centralizes policy but needs scale and failure planning.
- `Collector agent deployment` — A Collector close to the workload, often as a local agent; it can enrich local metadata but adds per-host operational overhead.
- `Collector load balancing exporter` — An exporter that routes telemetry among downstream Collectors; traces require routing that preserves trace affinity for tail sampling.
- `Collector persistent queue` — A queue backed by configured storage so queued telemetry can survive process restarts; it does not guarantee unlimited retention or delivery.
- `Collector retry and back-pressure` — Delivery controls that retry transient failures and slow upstream producers; queues and retry limits bound outage absorption.
- `Collector component stability level` — The maturity status of an individual component or feature; stability can differ by signal and component within one distribution.
- `Collector configuration validation` — Checking configuration syntax and component compatibility before rollout; pair it with runtime health and end-to-end delivery checks.

## Cross-item comparison

Receivers ingest, processors operate in order, exporters send, connectors join pipelines, and extensions serve Collector capabilities outside signal flow. Agent and gateway are deployment patterns with different locality, scale, and failure considerations.

## Examples

**Worked example**
A metrics pipeline might receive OTLP, pass through memory protection and batching, then export OTLP. Verify each component supports metrics, appears in the service pipeline, and has a configured endpoint. During backend interruption, a bounded queue absorbs a limited outage and retry policy applies back-pressure. Persistent queues need configured storage and disk monitoring.

**Common mistakes:**
Assuming installed components run automatically; copying configuration for another distribution; placing a signal-incompatible component in a pipeline; putting a sensitive health endpoint on a public interface; and claiming a queue guarantees delivery through unlimited outages.

## Common mistakes

Assuming installed components run automatically; copying configuration for another distribution; placing a signal-incompatible component in a pipeline; putting a sensitive health endpoint on a public interface; and claiming a queue guarantees delivery through unlimited outages.

## Knowledge checks with answers

1. **What is a Collector pipeline made from?** Receivers accept telemetry, processors transform/filter/batch it, and exporters send it onward.
2. **Does an in-memory queue guarantee delivery through restart?** No; persistence and exporter/queue configuration determine durability.
3. **Why monitor Collector self-telemetry?** A saturated or dropping telemetry pipeline can make the backend look healthy while evidence is lost.
4. **What is a safe rollout strategy for a new processor?** Validate configuration, canary it, compare accepted/sent/failed data, and retain a rollback path.
## Recent version changes

OpenTelemetry Semantic Conventions documentation identifies version 1.45.0 in the checked 2026-11-20 snapshot. Individual conventions have their own stability status, and migrations may use explicit opt-in modes; do not assume a global release makes every convention stable. [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)

Prometheus 3.0 added UTF-8 metric and label name support; conventional naming remains useful for tool interoperability. Current Prometheus docs distinguish native histograms from classic bucket series. [Prometheus data model](https://prometheus.io/docs/concepts/data_model/) [Metric types](https://prometheus.io/docs/concepts/metric_types/)

