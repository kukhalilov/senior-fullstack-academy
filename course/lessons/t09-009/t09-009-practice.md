# observability signals instrumentation and service objectives — Exercises and worked solutions

# Goals

- Translate a user-facing reliability goal into a measurable SLI with an explicit denominator.
- Query counters and histogram data without hiding resets or tails.
- Trace missing or misleading telemetry through the pipeline.
- Select sampling and data-protection controls for a concrete scenario.

# Worked example

An API has `http_requests_total{service,route,status_class}` and a classic histogram `http_request_duration_seconds_bucket{service,route,le}`. The team wants to know whether requests are failing and whether latency is meeting a 300 ms threshold. It first defines eligible requests as completed customer requests, excluding health probes; `good` means both the application outcome is successful and latency is at most 300 ms. The histogram must include bucket boundaries at or near the threshold to measure that condition accurately. If the bucket boundary is exactly 0.3 seconds, a classic histogram query can use the cumulative bucket count.

The team applies `rate` to each counter series before summing. This preserves reset detection if one instance restarts. It compares good and eligible rates over the same range and labels. It also checks sample volume and scrape/target health. If no eligible traffic exists, it reports “no data/no traffic” distinctly from 100% success. It does not infer success from a missing error series.

# Exercises

## Exercise 1: define an SLI

A photo upload service reports HTTP 200 when an upload is accepted into a queue, but a background worker may later reject an invalid file. Propose an availability or correctness SLI that reflects what the user considers successful. State the eligible events, numerator, denominator, and an important instrumentation risk.

## Exercise 2: counter aggregation

Two API instances export `requests_total`. Instance A grows from 1000 to 1100 in five minutes. Instance B restarted and grows from 20 to 40 in the same interval. Should the team sum the raw counters and then calculate one rate, or calculate rates per series and then sum? Explain why.

## Exercise 3: classic histogram p95

Write a PromQL expression for a five-minute p95 request duration, aggregated by service, from a classic histogram named `http_request_duration_seconds_bucket`.

## Exercise 4: diagnose missing traces

The service error metric increased, but traces show only frontend spans and no database spans. List at least four plausible causes and the evidence you would inspect before concluding the database was not called.

## Exercise 5: tail sampling policy

A team wants to retain all failed or slow traces, while sampling most successful fast traces at 5%. What pipeline capabilities and failure modes must it consider? Explain why this retained trace population cannot directly estimate the overall request failure percentage.

## Exercise 6: privacy boundary

An HTTP instrumentation currently records raw URL paths, query strings, and `Authorization` headers as span attributes. Propose a safer policy and identify where it should be enforced.

## Exercise 7: burn rate

An SLO target is 99.9% good eligible events. In a ten-minute window, 0.004 of eligible events are bad. Calculate the approximate burn rate and explain whether that one number alone tells you to page.

# Progressive hints

1. Measure the point at which the user’s accepted upload becomes a completed successful outcome; acceptance and durable processing are distinct.
2. Counter resets are interpreted per original time series; apply the rate function before aggregating.
3. Keep the classic histogram `le` label in the aggregation used by the quantile function.
4. Check context injection/extraction, async context, instrumentation, sampling, collector drops, exporter errors, and storage/query filters.
5. Tail sampling needs complete trace routing and a buffer long enough to observe outcomes; high load and collector outage can overwhelm it.
6. Prefer route templates and approved attributes; remove secret headers at source and enforce collector-side redaction as defense in depth.
7. Error budget fraction is 0.001; divide the observed bad fraction by that allowed fraction.

# Complete solutions

## Exercise 1 solution

One suitable correctness SLI is “eligible upload attempts whose file is eventually accepted by the processing workflow and made available to the user / all eligible user upload attempts.” Count each user intent once according to a defined correlation/idempotency policy; decide how retries and cancellations count. Emit a durable outcome event or metric from the point where processing determines acceptance, and retain a bounded correlation key to reconcile the asynchronous result. A risk is counting HTTP queue acceptance as final success and thereby excluding worker-side rejection. The exact event definition should match product behavior and service promises.

## Exercise 2 solution

Calculate each series’ rate, then sum. A raw counter sum can decrease when a process restarts, and that decrease can mask increases from the other instance. Per-series `rate(requests_total[5m])` detects each reset before aggregation. The total rate is approximately the sum of those per-series rates; extrapolation and scrape timing mean the result need not be an integer.

## Exercise 3 solution

```promql
histogram_quantile(
  0.95,
  sum by (service, le) (rate(http_request_duration_seconds_bucket[5m]))
)
```

The `le` label identifies cumulative bucket boundaries and must remain until quantile calculation. Ensure the metric really is a classic histogram, that the bucket layout has useful resolution around the p95, and that traffic volume supports a meaningful estimate.

## Exercise 4 solution

Possible causes include: the frontend did not inject trace context into the database call; async execution lost the active context; database instrumentation is disabled or incompatible; a sampler retained only some spans; the SDK or collector dropped spans under pressure; exporter/backend ingestion failed; the database span is stored under a different trace due to a propagation boundary; or the query hides spans through a filter or retention mismatch. Inspect trace flags/sampling policy, outgoing propagation, instrumentation configuration, collector refused/dropped counters, exporter errors/queues, backend ingestion, and the actual database call logs/metrics. Missing telemetry is not evidence of missing work.

## Exercise 5 solution

Use a tail-sampling component that receives all spans for each trace at a decision point, retains state for the decision window, applies error/latency policies, and uses a probability policy for other traces. Plan memory, trace-completion delay, late spans, burst traffic, routing affinity, duplicate and partial traces, queue pressure, and what happens if the sampler is unavailable. Avoid splitting one trace across independent decision nodes without coordination. Because failure cases are intentionally retained at a higher probability than successful cases, this set is selected by outcome and is biased; use an unbiased metric or account for sampling probabilities to estimate failure prevalence.

## Exercise 6 solution

Stop capturing authorization headers at the source instrumentation and avoid raw query strings and IDs. Use a normalized route template such as `/uploads/{uploadId}` only if the identifier itself is not embedded; capture bounded method/status attributes and a separately approved outcome. Add collector-side allowlist/redaction before export as defense in depth, test nested fields and alternate header casing, restrict access, encrypt transport/storage, and set short retention for detailed traces. Do not rely only on a backend display mask because sensitive values have already been transmitted and stored.

## Exercise 7 solution

Allowed bad fraction is `1 - 0.999 = 0.001`. Burn rate is `0.004 / 0.001 = 4`. That indicates budget is being consumed four times the target pace over the selected window. It does not alone determine a page: check the SLO’s eligible population, traffic volume, data freshness, longer-window confirmation, alert policy, and whether a responder has an action. A multi-window rule can balance urgency and confidence.

# Tests and edge cases

- No eligible requests: return a distinct no-traffic/no-data state rather than silently treating the ratio as perfect.
- An instance restarts: rate each original counter series before aggregation.
- A route label changes from raw path to template: expect a new series identity and account for historical query continuity.
- A histogram lacks a bucket at the user threshold: recognize that the fraction estimate may be coarse; change instrumentation/bucket design if that question matters.
- Telemetry queue fills: verify drops/backpressure are visible and application impact is bounded.
- Tail sampling receives only part of a trace: verify its policy does not misclassify an incomplete trace as successful.
- A trace includes external context: validate and apply boundary policy before continuing it.
- A secret is present in a test payload: confirm it is absent from exported collector output and backend records.

# Reflection questions

- Which user journey would you measure first in a service you know, and what should count as an eligible event?
- Which telemetry fields in your design are unbounded or sensitive?
- What evidence would distinguish an application failure from a pipeline failure?
- What is the highest-cost failure mode in your chosen sampling policy?
- Which alert would you page on, and what exact action should the recipient take?

# Sources

[PromQL functions](https://prometheus.io/docs/prometheus/latest/querying/functions/) · [Prometheus native histograms](https://prometheus.io/docs/specs/native_histograms/) · [OpenTelemetry context propagation](https://opentelemetry.io/docs/concepts/context-propagation/) · [Collector transformation](https://opentelemetry.io/docs/collector/transforming-telemetry/) · [SLO alerting](https://sre.google/workbook/alerting-on-slos/)
