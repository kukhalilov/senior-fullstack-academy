# observability signals instrumentation and service objectives — Big-picture orientation and mental model

# Problem and purpose

When a customer says “the checkout is slow,” the application’s internal state is not directly visible from that sentence. Observability is the practice of designing outputs that let an engineer infer what happened from evidence. Monitoring asks whether known conditions are healthy; observability helps investigate conditions that were not anticipated when a dashboard or alert was written. A useful system needs both.

The goal is not to collect every possible byte. It is to answer operational questions reliably: Is the service usable? Which user journeys are failing? Where is time being spent? Did a deployment change behavior? Is the evidence trustworthy, safe to retain, and affordable to query?

# Plain-language mental model

Think of a service as a busy restaurant. **Metrics** are totals and measurements on a wall chart: orders per minute, wait-time distribution, and open tables. **Logs** are timestamped event records: an order was rejected because an item was unavailable. **Traces** are the itinerary for one order as it crosses the cashier, kitchen, and payment service. **Profiles** sample where execution time or resources are consumed inside a process. **Baggage** is small contextual information carried along a request; it is not a telemetry signal or a place for secrets.

Each view answers a different question. A metric is efficient for detecting a broad pattern; it usually cannot tell which specific request was slow. A trace connects work across components but is not a reliable census when sampling is used. A log gives event detail but can be costly and sensitive. A profile can show expensive code paths but does not by itself explain the user-visible failure. Correlation comes from shared identifiers and context, not from assuming that the backend will magically join unrelated data. [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/) [Profiles](https://opentelemetry.io/docs/concepts/signals/profiles/)

# How the parts fit together

```text
application and infrastructure
  └─ instrumentation creates measurements, events, spans, and (where supported) profiles
       └─ SDKs add resources, context, sampling, and batching
            └─ OTLP or another supported format transports telemetry
                 └─ optional collectors receive, process, and export it
                      └─ backend stores and indexes it
                           └─ queries, dashboards, SLOs, and alerts turn evidence into decisions
```

Instrumentation can be automatic, library-based, or manual. Automatic instrumentation is a fast baseline, but it may not know business meaning or capture every boundary. Manual instrumentation adds domain-specific events and spans, but requires care to avoid noisy or sensitive attributes. OpenTelemetry supplies vendor-neutral APIs, SDKs, semantic conventions, a protocol, and Collector components; it does not make every implementation, exporter, or backend identical. Check maturity per component and per language. [OpenTelemetry status](https://opentelemetry.io/docs/specs/status/) [language and component status](https://opentelemetry.io/status/)

Collection and storage are different responsibilities. An agent collector near an application can buffer locally and reduce repeated configuration. A gateway collector can centralize routing and policy. Processors may batch, filter, redact, enrich, or sample. Every stage can drop, delay, duplicate, or transform data; each needs capacity, health monitoring, and a failure policy. More pipeline stages improve control but create more operational dependencies. [Collector data transformation](https://opentelemetry.io/docs/collector/transforming-telemetry/)

# Concept map

| Question | Primary evidence | Useful for | Main limitation |
| --- | --- | --- | --- |
| Is a population healthy over time? | Metrics and Prometheus queries | Rates, ratios, distributions, alert evaluation | Labels can multiply time series; aggregates hide individual cases |
| What happened in this operation? | Logs and traces | Event details and cross-service causality | Sampling, missing context, clocks, and sensitive data affect interpretation |
| Where does a process spend resources? | Profiles | CPU, allocation, or other sampled cost investigation | Profile formats and support are still maturing across the ecosystem |
| Is the service meeting user expectations? | SLIs and SLOs | Reliability targets, error budgets, and action | A poorly defined eligible-event denominator creates misleading targets |

The signals complement one another. Metrics can alert on a rising error ratio; a trace can locate a failing dependency; correlated logs can show the exception; a profile can reveal a hot code path after the failure is understood. Baggage may carry a bounded routing or tenant context when policy permits, but high-cardinality or personal values should not be copied indiscriminately into telemetry.

# End-to-end walkthrough

Suppose the checkout SLO is based on successful eligible requests completing within a latency objective. First define which requests count, what “success” means, and the evaluation window. Instrument request count and duration with bounded dimensions such as service and route template, not raw customer IDs or arbitrary URLs. A Prometheus scrape collects the measurements; `rate` converts a counter into a per-second rate before aggregation. A histogram lets the team reason about a latency distribution rather than only its average. A dashboard shows success and latency against the target. An alert uses a burn-rate condition that is fast enough for urgent damage and long enough to avoid reacting to one noisy scrape.

When the alert fires, the responder selects an affected time range and route, then follows a sampled trace to see whether application work or a downstream call dominates latency. Trace context is propagated over a trust boundary only after validation; logs contain the trace identifier when instrumentation explicitly injects it. The team checks whether collection queues dropped data before treating an empty chart as proof that nothing happened. After the incident, it verifies that the SLI denominator and alert logic represented the user impact and adjusts the design if needed. [Implementing SLOs](https://sre.google/workbook/implementing-slos/) [Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)

# When to use it and tradeoffs

Start from a user or operator question, then choose the minimum evidence needed to answer it. Use metrics for fleet-level rates and alert conditions; logs for discrete event context; traces for causal paths across components; profiles for sampled resource consumption. Use OpenTelemetry where vendor-neutral instrumentation and pipeline boundaries are useful, but verify actual SDK and Collector component stability in the target language and distribution. Prometheus is a strong fit for scrape-oriented metric collection and PromQL; a remote-write receiver or hosted backend may add different retention, query, or cost behavior.

Sampling and aggregation reduce storage and cost but remove information. Head-based trace sampling is inexpensive and makes an early decision; tail-based sampling can retain traces based on their completed outcome but needs state, buffering, and capacity. Metrics with too many unique label sets can become expensive and slow. Logs with unconstrained payloads can expose private data. Dashboards that show only averages or green uptime can hide tail latency and partial failures. Set retention, access, redaction, encryption, tenant boundaries, and data-quality checks as part of the architecture.

# What later lessons cover

The concepts lesson develops the signal lifecycle, data model, and reliability loop. Reference lessons cover telemetry pipelines and OpenTelemetry; metrics, the Prometheus data model and query functions, rules, and Alertmanager; logs, traces, propagation, and profile maturity; SLI/SLO design and dashboards; and security/data quality. Practice builds an end-to-end service health investigation. Interview preparation focuses on explaining choices and diagnosing misleading or missing evidence. The inventory is intentionally detailed; this overview gives the map without requiring the learner to memorize every name.

# Recent version changes

As checked on 2026-11-20, OpenTelemetry’s status is component-specific: the specification status summary reports tracing API/SDK/OTLP stable, metrics API and data model/protocol stable with SDK maturity mixed, logs specification/bridge/SDK/protocol stable, and Profiles protocol in development. OTTL v1 became stable for traces, metrics, and logs starting with Collector Contrib v0.164.0; the latest Contrib release is v0.165.1, but neither fact makes every Collector component stable. Prometheus 3.16.0 is the current release snapshot; native histograms are stable from v3.8.0, while v3 scraping and remote-write transmission still require explicit configuration. [OpenTelemetry status](https://opentelemetry.io/docs/specs/status/) [OTTL v1 announcement](https://opentelemetry.io/blog/2026/ottl-v1/) [Collector Contrib releases](https://github.com/open-telemetry/opentelemetry-collector-contrib/releases) [Prometheus downloads](https://prometheus.io/download/) [Native histogram specification](https://prometheus.io/docs/specs/native_histograms/)
