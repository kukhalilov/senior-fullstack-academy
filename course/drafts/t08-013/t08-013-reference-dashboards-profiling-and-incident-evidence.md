# observability logs metrics tracing alerts and OpenTelemetry — Reference: Operational views, profile signals, alert response, and incident learning

Sources: [official reference 1](https://opentelemetry.io/docs/concepts/signals/), [official reference 2](https://sre.google/workbook/alerting-on-slos/).

## Scope and version

This guide explains the assigned observability inventory group in the context of the current OpenTelemetry specification snapshot and Prometheus 3.x/current documentation checked 2026-11-14. The terminology and component maturity can evolve. The observability profiles signal and individual Collector components do not have a universal stability guarantee.

## How this group fits the mental model

Operational views are tools for decisions, not decoration. A dashboard should expose user impact, dependencies, and saturation; a runbook and escalation path turn an alert into action. Profiles help locate resource cost inside a process. Incident evidence becomes organizational learning when the timeline and impact are recorded and follow-up changes address system conditions rather than assign blame.

## Supplied names explained

- `Operational dashboard` — A set of visual queries supporting a specific operational decision; design for questions and actions, not metric inventory.
- `Dashboard variable` — A parameter that changes dashboard queries, such as service or environment; bound choices so the dashboard remains interpretable.
- `Dashboard panel` — A visualized query and annotation area; title, units, time range, and aggregation should match the displayed data.
- `Dashboard time range` — The interval used for displayed evidence; compare it with scrape interval, alert window, and incident timeline.
- `Dashboard annotation` — A time marker for deployments or incidents that helps correlate change with metric behavior.
- `Service overview dashboard` — A first-stop view of user-facing traffic, errors, latency, and saturation for a service.
- `Dependency dashboard` — A view of downstream health, latency, error rate, and request volume by dependency.
- `Saturation dashboard` — A view of constrained resource pressure and queued demand, helping identify limits before complete failure.
- `Continuous profiling` — Ongoing or repeated collection of profile samples to find resource cost across realistic workloads; sampling overhead and privacy still matter.
- `CPU profile` — A profile showing where CPU execution time is attributed; compare representative load and distinguish wall time from CPU time.
- `Heap profile` — A profile of live or allocated heap behavior according to profiler semantics; use it to investigate memory growth and retention.
- `Allocation profile` — A profile emphasizing allocation sites and volume; high allocation rate can cause garbage collection pressure even if retained heap is modest.
- `Lock contention profile` — Evidence showing time or blocked work associated with synchronization contention; it points toward coordination hot spots, not automatically the fix.
- `OpenTelemetry Profiles signal status` — The official Profiles signal page currently labels the signal Alpha. Treat it as pre-stable, and verify support and maturity in the exact SDK, Collector, and backend before depending on it. [Profiles status](https://opentelemetry.io/docs/concepts/signals/profiles/)
- `Alert runbook` — A response document explaining validation, diagnosis, mitigation, escalation, and recovery checks for an alert.
- `On-call escalation` — A defined path to involve additional responders when urgency, expertise, or response time requires it.
- `Incident timeline` — A timestamped record of detection, decisions, actions, and observed effects that supports coordination and later learning.
- `Incident severity` — A classification of impact and urgency used to choose response structure and communication.
- `Impact assessment` — A clear estimate of affected users, workflows, duration, and data consequences, updated as evidence improves.
- `Detection time` — When the organization or monitoring first recognized the incident; it informs detection coverage and response analysis.
- `Time to acknowledge` — Elapsed time from alert/incident notification to responder acknowledgement; measure definitions must be consistent.
- `Time to mitigate` — Elapsed time until the damaging condition is contained, which may precede full recovery.
- `Time to recover` — Elapsed time until service and user outcomes return to the accepted state.
- `Post-incident review` — A structured examination of what happened, impact, contributing conditions, response, and improvements.
- `Blameless incident review` — A review focused on system conditions and learning rather than assigning individual fault; accountability still includes completing improvements.
- `Monitoring coverage gap` — A user journey, dependency, failure mode, or resource without evidence or alert coverage needed to detect impact.
- `Synthetic monitoring` — Scheduled scripted transactions that test a user journey; test data, cost, and false positives need control.
- `Black-box monitoring` — Monitoring from externally observable behavior without relying on internal implementation details.
- `White-box monitoring` — Monitoring based on internal state and telemetry, useful for diagnosis but not a direct guarantee of user experience.
- `Telemetry loss during outage` — Missing evidence caused by the same failure being investigated; buffer, queue, and monitor pipeline health while accepting finite limits.
- `Monitoring system self-observability` — Telemetry about collection, queues, drops, scrape health, and export failures so operators can detect blind spots.

## Cross-item comparison

Dashboards display evidence, alerts request a response, and runbooks explain response. Black-box evidence checks outcomes externally; white-box evidence exposes internals. Profiles focus on execution resource cost.

## Examples

**Worked example**
An on-call landing dashboard starts with user-facing request rate, error ratio, latency distribution, and saturation; a dependency view narrows a slow request to its downstream call. An alert links to a runbook. During response, record detection, acknowledgement, mitigation, and recovery times; use profiles when traces identify a slow process but not the CPU or allocation cause.

**Common mistakes:**
Building dashboards as metric dumps; omitting units or time windows; treating a synthetic success as proof every user path works; using internal white-box health as the sole user-impact signal; and writing a post-incident review without owners for follow-up work.

## Common mistakes

Building dashboards as metric dumps; omitting units or time windows; treating a synthetic success as proof every user path works; using internal white-box health as the sole user-impact signal; and writing a post-incident review without owners for follow-up work.

## Knowledge checks with answers

1. **What question does this group help answer?** It helps identify the evidence type, data boundary, or operational action appropriate to a real service investigation.
2. **Why do identity and semantics matter?** Consistent names and bounded dimensions allow safe grouping and correlation across producers without uncontrolled series growth.
3. **Name a common failure mode.** Incomplete context, unsafe sensitive data, unsupported component assumptions, or missing delivery health can make apparently healthy dashboards misleading.
4. **How should you apply these terms?** Start from a user or operator question, select the minimal sufficient evidence, verify lifecycle and backend support, and rehearse the investigation.

## Recent version changes

OpenTelemetry Semantic Conventions documentation identifies version 1.45.0 in the checked snapshot. Individual conventions have their own stability status, and migrations may use explicit opt-in modes; do not assume a global release makes every convention stable. [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)

Prometheus 3.0 added UTF-8 metric and label name support; conventional naming remains useful for tool interoperability. Current Prometheus docs distinguish native histograms from classic bucket series. [Prometheus data model](https://prometheus.io/docs/concepts/data_model/) [Metric types](https://prometheus.io/docs/concepts/metric_types/)

