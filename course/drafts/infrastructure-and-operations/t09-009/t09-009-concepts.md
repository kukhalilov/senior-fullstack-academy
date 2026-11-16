# observability signals instrumentation and service objectives — Core concepts and how they fit together

# Learning objectives

- Distinguish observability from monitoring and explain why multiple signals are needed.
- Trace telemetry from instrumentation through collection, processing, transport, storage, query, and response.
- Explain metric identity, label cardinality, histogram tradeoffs, trace context, sampling, and missing-data failure modes.
- Define an SLI, SLO, eligible event, and error budget before building alerts.
- Evaluate whether telemetry is sufficiently accurate, private, available, and affordable for a decision.

# Prerequisites

You should know what a service, request, process, dependency, and deployment are. A time series is a sequence of timestamped values; a label is a key/value dimension attached to a metric series. A percentile is a rank in an ordered distribution, not the value of an individual request. You do not need a particular vendor dashboard to understand this lesson.

# Core concepts

## Observability is a design property; monitoring is a planned check

Monitoring defines signals and rules for anticipated failure modes: a process is down, an error ratio is high, or a queue is growing. Observability means the system emits enough useful, structured evidence to investigate behavior that was not already encoded as a specific alert. It does not mean that telemetry can reveal every fact, or that an operator can ask any question without suitable instrumentation and retention. Good monitoring is built on observability, and good observability is aimed at real operational questions.

An alert is most useful when it identifies user impact and implies a timely action. A page for a high CPU reading may be noise if no user is affected; CPU can still be an important diagnostic dashboard signal. Conversely, a low error count can matter greatly for a small but critical workflow. Prioritize service behavior over a large collection of component thresholds.

## Signals are complementary views, not interchangeable storage formats

Metrics are numeric measurements aggregated across populations and time. A counter records a monotonically increasing total; a gauge represents a value that can rise and fall; a histogram represents observations grouped into buckets or another distribution structure. Logs are timestamped records of events, with severity, body, and attributes. A trace is a graph of spans representing a causally related operation across process boundaries. Profiles summarize sampled resource consumption inside execution. Baggage is propagated key/value context and must be handled as data crossing trust boundaries, not as a fifth telemetry signal.

The best signal depends on the question. To alert on request failures across a fleet, use a stable metric and an SLO. To diagnose one failed request, inspect the trace and correlated log records. To find a CPU hotspot, use a profile. A trace is not automatically a log, and a dashboard does not become a trace store. Correlation identifiers make navigation possible only when instrumentation preserves them and the destination contains corresponding data.

## The telemetry pipeline has independent failure and ownership points

Instrumentation creates data. An SDK may add resource identity, manage context, sample, batch, and export. A receiver accepts data; processors can transform or filter it; exporters send it onward. A Collector connector can bridge signals or pipelines; extensions add operational capabilities. A backend indexes and retains data for query. A dashboard visualizes query results; an alerting system evaluates conditions and routes notifications.

Treat each arrow as a contract: encoding, protocol, identity, retry behavior, queue limits, timeout, and security. In-process exporters can couple an application to backend availability; a local agent can isolate that dependency but consumes host resources; a gateway centralizes policy but creates a shared capacity and availability concern. Retries do not guarantee delivery if buffers are bounded or the destination remains unavailable. “Telemetry delivery guarantee” must be described for the specific queue, protocol, and backend, not as universal exactly-once delivery.

## Instrumentation should preserve meaning and bounded identity

Automatic instrumentation can cover common framework operations quickly; manual instrumentation is needed for domain-specific boundaries and business outcomes. Library instrumentation uses a maintained library’s integration. Every approach can be incomplete, duplicative, or too costly. A resource describes the entity producing telemetry (for example, a service instance); an attribute describes a particular resource, span, log, or data point. Semantic conventions make common operations comparable across instrumentation, but the convention and implementation version matter.

Metric cardinality is the number of unique metric-name/label-set combinations. A label such as `route="/orders/{id}"` has bounded values by route template; `customer_id="..."` can create one series per customer and grow without bound. Do not use raw URLs, request IDs, email addresses, or exception messages as metric labels. Put high-detail values in appropriately protected logs or traces only when needed and governed.

## Sampling changes what conclusions can be drawn

Head-based sampling chooses whether to keep a trace near its start, before its full outcome is known. It is cheap and consistent across a distributed trace when the decision propagates, but it may miss rare errors. Tail-based sampling can decide after observing more spans, retaining errors or slow traces, but it requires collecting and buffering spans long enough to make the decision and can be costly during bursts. Sampling is a selection mechanism: sampled traces are not necessarily a statistically representative population unless the policy and analysis account for the selection.

Metric aggregation is also lossy, but in a different way. Histograms preserve a distribution representation that supports quantile estimates; summaries may calculate local quantiles that generally cannot be aggregated into a fleet-wide quantile. A mean can conceal a long tail. A percentile is useful but unstable at low sample counts and depends on the measurement window and aggregation method. Always pair a tail measure with request volume and a clear eligibility definition.

## Prometheus turns scraped samples into queryable series and decisions

Prometheus commonly scrapes targets at configured intervals. A target belongs to a job, and target labels identify dimensions such as service, environment, or instance. The exposition format carries metric samples and metadata. PromQL selectors select series; instant vectors contain current samples; range vectors contain samples over a time interval; scalars and strings are other expression value types. Range selectors, offsets, and subqueries alter which samples are evaluated and when.

For a counter, calculate `rate` or `increase` before aggregating so resets can be detected per original series. `irate` uses only the latest pair of samples and is mainly useful for volatile graphs, not stable alerts. Recording rules precompute reusable or expensive expressions; alerting rules evaluate conditions over time and produce pending/firing alert instances. Alertmanager groups related alerts, deduplicates repeated notifications, applies routes, inhibits lower-priority notifications when a broader incident is active, and supports silences during planned or acknowledged work. A rule expression is not an incident response plan; attach ownership and a useful runbook.

Classic histograms expose cumulative fixed buckets as series, so the `le` boundary label must be retained for a classic-histogram quantile aggregation. Prometheus native histograms are structured samples with sparse buckets and can support higher-resolution distributions. Native histogram stability does not enable scrape or remote-write transport automatically: v3 scrape configuration needs `scrape_native_histograms`, and remote-write needs `send_native_histograms`. Test the complete producer, scrape, storage, query, remote receiver, and dashboard path before relying on the feature. [Native histograms](https://prometheus.io/docs/specs/native_histograms/) [PromQL functions](https://prometheus.io/docs/prometheus/latest/querying/functions/)

## Context propagation is explicit and crosses trust boundaries

Trace context carries a trace identifier, span identifier, and trace flags; W3C Trace Context standardizes the `traceparent` and `tracestate` headers. A client injects context into an outgoing request, and a server extracts it before creating a child span. Inbound context is untrusted input: validate syntax and decide whether to continue or restart context at a boundary. Baggage can propagate additional key/value members, but it is not automatically safe, private, or free. Apply size limits, allowlists, and policy; never put credentials or personal data there.

Span kinds describe the role of an operation: internal work, server handling, client call, message production, or message consumption. Span events record timestamped happenings within a span; links connect spans that are related without a parent/child relationship. Span status describes outcome, not every business detail. A trace waterfall is a visualization, and its apparent critical path depends on correct timing, parentage, concurrency, and clock behavior. Clock skew can make cross-host timing confusing; the visual longest span is not always a causal bottleneck.

## SLOs connect measurement to a reliability decision

An SLI is a measured indicator of a user-relevant property. An SLO is the target for that indicator over a defined window. An SLA is an external agreement and can include remedies or obligations beyond the internal SLO. An error budget is the tolerated bad portion of the SLO window. These are only meaningful after defining the eligible population, what counts as good, measurement source, aggregation, and treatment of missing data.

For a request-based availability SLI, good eligible requests divided by all eligible requests is often intuitive. For a window-based SLI, good time windows divided by total eligible windows may fit a service whose health is sampled periodically. They answer different questions and can yield different results. Latency SLI may count requests completed under a threshold; an average latency does not tell what fraction met a threshold. Freshness and correctness need domain-specific definitions. Throughput by itself is not user success.

Burn rate is the observed error-budget consumption rate relative to the allowed rate. Multi-window alerts combine a short window for urgency and a longer window for confidence; multiple burn thresholds can trade fast detection against notification noise. Calendar windows align to calendar boundaries; rolling windows move continuously. A budget policy defines what the team does when budget is consumed, such as slowing risky releases or prioritizing reliability work. A dashboard should show the target, actual SLI, remaining budget, data freshness, and enough segmentation to reveal a harmed cohort without creating uncontrolled dimensions. [Google SRE: SLO implementation](https://sre.google/workbook/implementing-slos/) [Google SRE: SLO alerting](https://sre.google/workbook/alerting-on-slos/)

# Mechanisms and relationships

Consider these three diagnostic cases:

1. **No metric series appears.** Possible causes include a stopped target, scrape discovery or network failure, an exporter error, a label/name change, a query selector mismatch, or telemetry dropped in a pipeline. The absence is ambiguous. A target health signal and an explicit absence alert can help, but only if the metric is expected and its labels are understood.
2. **The average is healthy but users complain.** Inspect tail latency, request volume, route or cohort segmentation, and failures. Confirm the histogram bucket boundaries or native histogram resolution can answer the threshold question. An average over a broad population can hide a small but severely affected route.
3. **A trace is incomplete.** Check sampling decisions, context injection/extraction, process boundaries, dropped spans, retention, and trust-policy resets. Do not conclude that a missing span proves a dependency was not called.

Useful reliability loops combine symptom-based detection with diagnostic signals. A symptom alert pages when users are harmed; a cause metric narrows investigation. A threshold must have a defined evaluation window and data-quality expectation. For example, a queue-depth threshold may be meaningful only with worker throughput and age-of-oldest-work; a saturated queue with no user impact may be a warning, while growing age may show delayed work. Synthetic monitoring probes an externally visible journey, while white-box metrics reveal internal state. Neither covers every failure mode.

# Worked examples

Assume `http_requests_total` is a counter labeled by `service`, `route`, and `status_class`, while `http_request_duration_seconds` is a histogram. A five-minute fleet error ratio can be expressed as:

```promql
sum(rate(http_requests_total{status_class="5xx"}[5m]))
/
sum(rate(http_requests_total[5m]))
```

The numerator and denominator use the same window and corresponding eligible request population. If no requests exist, the division may be absent or undefined; decide whether to show “no traffic” separately instead of silently treating it as 0% errors. For a classic histogram, a p99 query needs to retain `le` while summing buckets. For a native histogram, aggregation is different and the query and ingestion path must be confirmed. A percentile from a distribution is an estimate, not a promise that exactly 99% of each future request will finish within that value.

Suppose an objective allows 99.9% of eligible requests to succeed in a rolling 30-day window. The tolerated error fraction is 0.001. If a measured five-minute error ratio is 0.01, its burn rate is 0.01 / 0.001 = 10 times the allowed pace. That does not alone determine a page: the team also selects windows, minimum traffic, alert duration, and action policy. A longer window helps reject a brief blip; a shorter window catches severe impact quickly. Multi-window rules should be checked against actual traffic patterns and tested with rule tests.

# Misconceptions and edge cases

- “Collect everything” is not a strategy: cost, privacy, retention, and queryability impose real limits.
- An empty query result is not equivalent to zero. It may mean no matching series, stale data, no eligible events, a collection failure, or a wrong selector.
- A dashboard cannot establish correctness if its instrumentation or denominator is wrong.
- A sampled trace is not a complete request census; head sampling may miss rare outcomes.
- Adding labels for arbitrary identifiers can cause unbounded cardinality and ingest failure.
- A histogram quantile is not an exact percentile unless the distribution representation supports exact boundaries; bucket layout and interpolation matter.
- A stable OpenTelemetry specification does not guarantee every language SDK or Collector component has stable support.
- OTTL v1 stability applies to the language guarantee, not automatically to all processors or Collector components.
- Prometheus native histograms being stable does not mean v3 scrape or remote-write is enabled by default.
- An SLA is not automatically the same as an internal SLO, and an error budget is not a count of incidents.
- Alerting on causes alone can page for harmless symptoms; alerting only on symptoms can slow diagnosis. Use each for its intended role.
- Baggage, logs, span attributes, and exemplars can leak sensitive values; propagation multiplies exposure across services.

# Knowledge checks with answers

1. Which signal is best suited to summarize request failure rate across a fleet? **A bounded-dimension counter or histogram-derived metric queried as a rate/ratio.**
2. Why apply `rate` before PromQL aggregation? **It lets Prometheus detect resets on each original counter series before series are combined.**
3. Does a tail-based sampler remove the need for capacity planning? **No. It needs state and buffering while it waits to observe the trace outcome.**
4. What must be defined before calculating availability SLI? **The eligible event population and exact rules for good versus bad outcomes, including missing-data treatment.**
5. Does stable native histogram support enable scraping in Prometheus v3? **No. `scrape_native_histograms` must be configured; remote-write requires its separate setting.**
6. Is baggage a secure location for an authorization token? **No. It can propagate across service boundaries and should carry only approved, bounded, non-secret context.**
7. What does a missing span prove? **Nothing by itself; sampling, propagation, collection, storage, retention, or query problems can all explain it.**
8. Why show request volume beside a percentile? **Low volume makes tail estimates less stable and helps distinguish user impact from a few observations.**

# Sources

[OpenTelemetry signal concepts](https://opentelemetry.io/docs/concepts/signals/) · [OpenTelemetry status](https://opentelemetry.io/docs/specs/status/) · [Prometheus metric types](https://prometheus.io/docs/concepts/metric_types/) · [Prometheus operators](https://prometheus.io/docs/prometheus/latest/querying/operators/) · [SLO implementation](https://sre.google/workbook/implementing-slos/)
