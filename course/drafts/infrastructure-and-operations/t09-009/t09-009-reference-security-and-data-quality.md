# observability signals instrumentation and service objectives — Reference: Sensitive data, governance, telemetry validation, and signal limitations

# Scope and version

This lesson covers the supplied privacy, security, data-quality, and cost-control names. OpenTelemetry and Prometheus specifications provide formats and mechanisms, but retention, identity, and service guarantees depend on the deployment. Design controls end-to-end: application instrumentation, local collection, network transport, backend storage, query access, exports, and deletion. The snapshot is checked 2026-11-17. [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) [OTLP](https://opentelemetry.io/docs/specs/otlp/) [Prometheus security](https://prometheus.io/docs/operating/security/)

# How this group fits the mental model

Telemetry can be a sensitive production dataset. It may include personal data, secrets, business activity, internal topology, or identifiers that become sensitive when joined. At the same time, poor-quality or missing telemetry can cause operators to make dangerous decisions. Governance therefore balances confidentiality, integrity, availability, diagnostic value, and cost. Security controls cannot repair an inaccurate SLI, and richer telemetry is not useful if no one can trust or access it during an incident.

# Supplied names explained

- `Telemetry data classification` — Assigning telemetry fields and datasets sensitivity categories based on content and use. Classification drives collection, access, retention, export, and deletion rules.
- `Personally identifiable information (PII) in telemetry` — Information that identifies or can reasonably be linked to a person, including indirect combinations. Avoid collection where possible and define lawful purpose, retention, access, and masking where needed.
- `Secret redaction` — Removing credentials, tokens, keys, and other authentication material before telemetry is exported or stored. Prefer preventing secret capture at source, then use tested defense-in-depth redaction.
- `Attribute allowlist` — A policy permitting only explicitly approved telemetry attributes or keys. It reduces unknown-field leakage and drift, but requires updates when safe instrumentation changes.
- `Attribute denylist` — A policy dropping known sensitive attributes. It is useful as a backstop but can miss renamed, nested, encoded, or newly introduced secret fields.
- `Telemetry access control` — Authentication and authorization policies governing who can ingest, query, export, administer, or delete telemetry. Separate read access from administrative and cross-tenant privileges.
- `Telemetry tenant isolation` — Controls preventing one tenant or customer from reading another tenant’s telemetry. Enforce isolation in ingestion, storage, query, export, and support workflows.
- `Telemetry encryption in transit` — Cryptographic protection for telemetry moving between applications, collectors, and backends. Configure peer authentication and certificate validation; encryption without endpoint verification can still connect to an impostor.
- `Telemetry encryption at rest` — Cryptographic protection for stored telemetry and backups. Key custody, rotation, access logging, and deletion behavior determine the real protection.
- `Telemetry sampling bias` — Distortion introduced when retained telemetry systematically differs from the full population. Error-focused tail sampling is useful for diagnosis but cannot be treated as a random sample for prevalence estimates.
- `Metric label explosion` — Uncontrolled growth in metric series caused by high-cardinality or unbounded labels. It can exhaust memory/index budgets and cause data loss or expensive queries.
- `High-cardinality attribute` — An attribute with many possible values, especially request-specific or user-specific values. It may be appropriate in restricted traces or logs, but generally should not become a metric label without a bounded design.
- `Missing span context` — A trace where relevant spans are disconnected or lack expected context. Causes include missing propagation, async context loss, sampling, instrumentation gaps, trust-boundary resets, and dropped telemetry.
- `Broken trace` — An incomplete or structurally inconsistent trace graph. Investigate propagation, span IDs/parents, clock behavior, sampling, and ingestion before treating the picture as the true execution path.
- `Clock skew in telemetry` — Differences between system clocks that distort event ordering and cross-host duration interpretation. Use synchronized clocks where possible and avoid assuming wall-clock order proves causality.
- `Out-of-order metric sample` — A sample received with a timestamp earlier than another sample for the same series or outside backend expectations. It may arise from retries, batching, clock error, or parallel writers and can be rejected or misinterpreted.
- `Duplicate log event` — The same event delivered more than once, often from retry behavior or overlapping collectors. Include event identity/idempotency where possible and avoid assuming every record is unique.
- `Dropped telemetry` — Data discarded by instrumentation, queues, processors, network, limits, or backend rejection. Expose drop counters and queue health so a clean-looking dashboard is not mistaken for complete evidence.
- `Collector queue overflow` — A collector’s configured queue reaches its capacity, forcing rejection, blocking, or loss according to component behavior. Size it against bursts and recovery duration while respecting memory/disk limits.
- `Backpressure in telemetry pipeline` — A slower downstream stage causes upstream buffering, throttling, or rejection. Define how the application and collector respond so telemetry failures do not cascade into service failures.
- `Telemetry delivery guarantee` — The actual durability, ordering, retry, and duplication behavior of a given pipeline. Do not claim “exactly once” or durable delivery without evidence for every stage and failure mode.
- `Telemetry schema evolution` — Changes to names, types, meanings, and conventions over time. Use compatibility planning, versioning, dual-read/write strategies, and dashboard/rule migration when needed.
- `Semantic convention version` — The revision of a shared telemetry naming/meaning set used by instrumentation. Mixed versions can produce different fields; pin and migrate conventions deliberately.
- `Telemetry source attribution` — Identifying which service, deployment, host, or instrumentation generated a record. Reliable attribution enables ownership and cost allocation but must avoid unstable or sensitive labels.
- `Instrumentation overhead` — CPU, memory, latency, network, and allocation cost incurred by creating and exporting telemetry. Measure under representative load and keep high-frequency instrumentation proportional to diagnostic value.
- `Sampling rate` — The fraction or policy-defined likelihood of telemetry selected for retention. A numeric probability is insufficient if stratification, tail decisions, and downstream drop rates are not considered.
- `Always-on profiling cost` — The ongoing overhead and storage/processing expense of continuously collecting profiles. Profiles may be sampled, but measure impact and apply retention and access limits.
- `Alert evaluation delay` — Time between the underlying condition and notification, including scrape interval, rule interval, pending duration, grouping, and delivery. A threshold may be correct but operationally too slow for the failure mode.
- `SLO denominator definition` — The exact population of eligible events or windows in the SLI denominator. Ambiguity or exclusions can make reliability appear better while users are failing.
- `SLI event eligibility` — The criteria determining which observed events count toward an SLI. Define treatment of probes, cancellations, retries, internal calls, and incomplete operations consistently.
- `Telemetry retention policy` — Rules defining storage duration, archival, deletion, and holds per data class or signal. Match it to the diagnostic purpose and legal/privacy obligations, and test deletion behavior across replicas/backups.

# Cross-item comparison

| Control or condition | Primary purpose | Does not guarantee |
| --- | --- | --- |
| Allowlist | Only known fields pass | That allowed values are safe or correct |
| Denylist | Block known unsafe fields | That unknown/renamed fields are caught |
| Encryption in transit | Protect network confidentiality/integrity | Correct endpoint identity without validation |
| Encryption at rest | Reduce exposure from storage media | Safe access control or key custody |
| Sampling | Reduce volume or prioritize evidence | A representative dataset for statistical estimates |
| Backpressure | Communicate downstream inability to keep up | Durable delivery or non-impact to applications |
| SLI denominator | Defines measurement population | That the chosen population reflects user experience |

OpenTelemetry Collector transforms can support filtering and redaction, but component support, configuration, and ordering must be verified. OTTL v1 being stable does not make every processor stable. [Collector transformation guide](https://opentelemetry.io/docs/collector/transforming-telemetry/) [OTTL v1 announcement](https://opentelemetry.io/blog/2026/ottl-v1/)

# Examples

A safe-by-default telemetry schema might allow `service.name`, deployment environment, HTTP method, route template, response class, and bounded duration dimensions. It would reject authorization headers, raw query strings, request bodies, email addresses, session tokens, and customer identifiers unless a documented, protected use case exists. A collector redaction rule is tested with sample payloads containing secrets in top-level and nested fields. Access is separated by tenant, exports use authenticated TLS, retention is short for high-detail logs, and deletion is verified through replicas and backups.

For a pipeline, instrument queue depth, refused data, exporter failures, and collector memory. Test by making the backend unavailable long enough to fill the configured queue. Observe whether telemetry is blocked, retried, spilled to disk, or dropped, then check the application’s latency and the recovery behavior after connectivity returns. This rehearsal defines the delivery guarantee more honestly than a generic “reliable pipeline” label.

# Common mistakes

- Collecting personal data because a field is “only for debugging.”
- Assuming encryption makes a secret safe after it is stored or exported to the wrong tenant.
- Relying on a denylist that silently misses new fields.
- Treating a sampled error-focused trace set as a statistically representative request sample.
- Not surfacing collector drops because dashboards show only received telemetry.
- Increasing queue memory until the collector competes with the application or host.
- Claiming exactly-once delivery across retries and independent pipeline components.
- Ignoring timestamp/clock issues when interpreting cause and effect.
- Defining the SLI denominator from whichever metric happens to be easiest to query.
- Keeping high-detail telemetry indefinitely without matching purpose, access, and retention requirements.

# Knowledge checks with answers

1. Why is an allowlist stronger than a denylist for unknown telemetry fields? **Unknown values fail closed instead of passing because their names were not anticipated.**
2. Does TLS guarantee the exporter connected to the right backend? **Only when peer identity is validated as part of the secure connection.**
3. Can an error-focused sample estimate overall failure prevalence directly? **Not without accounting for its selection policy; it is biased toward errors.**
4. What should happen when a collector queue fills? **A documented, observable policy—bounded retry, backpressure, spill, or drop—selected for the service’s failure and resource constraints.**
5. Why is the SLO denominator a security/data-quality concern? **It controls what user events the reliability claim includes; omissions can hide harm and mislead decisions.**

# Sources

[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) · [Transforming telemetry](https://opentelemetry.io/docs/collector/transforming-telemetry/) · [OTLP specification](https://opentelemetry.io/docs/specs/otlp/) · [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/) · [Prometheus security](https://prometheus.io/docs/operating/security/)
