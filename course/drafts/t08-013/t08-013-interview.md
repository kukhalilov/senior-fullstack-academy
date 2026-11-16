# observability logs metrics tracing alerts and OpenTelemetry — Interview questions and reasoning

Sources: [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/), [OpenTelemetry Collector architecture](https://opentelemetry.io/docs/collector/architecture/), [Prometheus metric types](https://prometheus.io/docs/concepts/metric_types/), and [Google SRE: alerting on SLOs](https://sre.google/workbook/alerting-on-slos/).

## Core questions

1. How do logs, metrics, traces, and profiles differ?
2. How does trace context flow across service boundaries?
3. Why is high metric cardinality dangerous?
4. How do counters, gauges, and histograms differ?
5. What is the difference between an SLI, SLO, and SLA?
6. How does an OpenTelemetry Collector pipeline work?
7. What are the advantages and risks of head and tail sampling?
8. What makes an alert actionable?

## Concise interview answers

1. Metrics summarize populations and trends; traces connect work across boundaries; logs record events; profiles sample resource cost inside a program.
2. A caller injects trace context into the request carrier; the receiver extracts it and creates a related span. Missing propagation fragments the trace.
3. Unique label combinations create distinct series, increasing memory, storage, ingestion, and query cost.
4. Counters accumulate events, gauges represent values that can rise or fall, and histograms preserve observation distributions.
5. An SLI measures an outcome, an SLO sets its target and window, and an SLA is a commitment that may carry external consequences.
6. Receivers accept data, processors operate in order, exporters send it, connectors join pipelines, and extensions add capabilities outside signal flow.
7. Head sampling is early and inexpensive but cannot know the final outcome. Tail sampling can preserve errors or slow traces but needs buffering and trace-affine routing.
8. It signals impact or a defined operational risk, requires action, has an owner, and includes response context.

## Deep follow-up answers

### When do you prefer a metric over a trace?

Use a metric to evaluate a population, trend, or SLO and alert consistently. Use traces to inspect causal paths of selected operations. A sampled trace is not a complete denominator, so do not calculate service success rates from traces when a properly defined metric can do so.

### How do you avoid misleading latency dashboards?

Instrument a distribution, choose a percentile or threshold-compliance SLI appropriate to users, and preserve bounded dimensions. Quantiles from separate instances generally cannot be averaged into a fleet quantile. Understand whether data uses classic buckets or native histograms, and verify backend support.

### How do you prevent logs from becoming a privacy and cost problem?

Define a schema and data classification, avoid secrets and unnecessary personal data at the source, control volume, protect access, redact before broad export, and set retention. Give audit evidence a deliberate integrity policy rather than treating it as ordinary debug output.

### How would you diagnose a missing trace?

Check context injection, extraction, instrumentation, sampling, SDK export, Collector receipt/export, and backend ingestion/indexing. Verify trace-affine routing for tail sampling. Correlation IDs help distinguish an instrumentation gap from a query or delivery issue.

### How do you choose an SLO alert?

Define eligible and good events for the user journey. Set a target and window aligned with expectations, then alert on meaningful budget consumption using windows suited to impact and traffic. Route to a team able to act, include a runbook, and review false positives and missed incidents. Avoid paging on every underlying component condition.

### What are the Collector’s failure modes?

A receiver may not be enabled or exposed correctly; a processor may filter data unexpectedly; an exporter may fail; a bounded queue can fill; memory pressure can create back-pressure or loss; and components differ across distributions. Monitor queue depth, send failures, retries, refusals/drops, memory, and end-to-end signal arrival.

## Scenario questions

### Checkout latency rises, but CPU is low. What do you inspect?

Confirm the SLI, affected routes/regions, and recent changes. Compare latency distributions and dependencies, then follow slow traces to locate waiting time. Correlate safe logs for the same trace. Investigate network, database, queue, and external dependency delays; low CPU does not rule out blocking or saturation elsewhere.

### A team adds user ID to every metric. What do you say?

Each distinct value can create another series, and dimensions multiply. Remove it from metrics. If identity is truly needed, assess necessity and use a controlled trace/log path with data minimization, access control, and retention. Prefer aggregate cohorts where possible.

### A deploy causes error-budget burn while all component health checks are green. What now?

The user-facing SLI is stronger impact evidence than process liveness. Compare deployment timing, outcomes, traces, and logs. Mitigate with the rollback or traffic-control procedure, verify recovery through the same SLI, and record the timeline and follow-up. Health checks can be green while business behavior is broken.

### The telemetry backend is unavailable during an incident. What should the system do?

Bound memory and disk use, queue and retry within known limits, apply priority/shedding rules, and expose pipeline health independently where possible. Record expected loss boundaries. Telemetry export should not take down the application; isolate it and keep behavior bounded.

## Tradeoffs and alternatives

- **Logs versus span events:** use standalone events when searchable event semantics or independent retention matters; attach a span event for a meaningful point in one operation.
- **Head versus tail sampling:** head sampling offers predictable volume reduction; tail sampling can preserve outcomes but requires buffering and routing.
- **Agent versus gateway Collector:** agents add locality and metadata; gateways centralize policy and credentials. Hybrid topologies add components but can clarify boundaries.
- **Cause versus symptom alerts:** symptom pages map to user impact; cause alerts need a clear intervention before symptoms.
- **Classic versus native histograms:** choose by resolution, storage, query compatibility, migration status, and end-to-end backend behavior.

## Common weak answers

- “Use logs for everything.” Logs are costly and poor substitutes for population metrics or causal traces.
- “Add more labels to debug it.” Unique labels can exhaust series capacity and expose data.
- “A 99.9% SLO means 99.9% uptime.” The actual SLI may concern eligible requests, latency, correctness, or another outcome over a defined window.
- “Tail sampling always keeps errors.” Complete spans, policy, capacity, and correct routing are prerequisites.
- “The Collector guarantees delivery.” Queues and retries are bounded.
- “All OpenTelemetry components are stable.” Maturity varies by component, signal, distribution, and release.
- “A healthy process means a healthy service.” Liveness does not prove user-visible correctness or latency.

## Self-check rubric

Rate each answer from 0 to 2: 0 = missing/incorrect; 1 = correct but generic; 2 = explains mechanism, tradeoff, and verification.

- I can select a signal and state its blind spots.
- I can explain context injection/extraction and diagnose fragmentation.
- I can reason about cardinality, aggregation, resets, and histogram limits.
- I can define an SLI and connect SLO burn to an owner and response.
- I can explain Collector wiring and bounded failure behavior.
- I can protect sensitive data and audit records while controlling cost.
- I can distinguish a symptom page from diagnostic evidence.

