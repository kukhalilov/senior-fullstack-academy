# observability signals instrumentation and service objectives — Reference: Measurements, metric types, PromQL, rules, and actionable alerts

# Scope and version

This reference explains the supplied metric, Prometheus, PromQL, rule, and notification names against the latest Prometheus documentation checked 2026-11-17. Prometheus native histograms are stable beginning in v3.8.0; in v3, scrape and remote-write settings still require explicit enablement. Some current PromQL functions are experimental and feature-flagged, and their behavior may change. Consult the deployed server version before using them. [Native histogram specification](https://prometheus.io/docs/specs/native_histograms/) [PromQL functions](https://prometheus.io/docs/prometheus/latest/querying/functions/) [Feature flags](https://prometheus.io/docs/prometheus/latest/feature_flags/)

# How this group fits the mental model

Metrics summarize measurements with labels; Prometheus scrapes and stores the resulting series; PromQL turns them into answers; rules repeatedly evaluate selected expressions; Alertmanager routes resulting notifications. The key design steps are to select an appropriate metric type, keep dimensions bounded, query counters correctly, preserve distribution information where it matters, and make each alert actionable.

# Supplied names explained

## Data model and measurement types

- `Metric` — A named measurement such as request count or queue depth. Its semantics, unit, temporality, and dimensions determine how users can interpret it.
- `Metric data point` — One timestamped measurement with a value and attributes. A collection of data points forms a metric stream; missing points and temporality transitions affect calculations.
- `Metric time series` — A sequence of samples identified by a metric name and full label set. Changing a label value creates a different series rather than updating a property on the same one.
- `Metric name` — The identifier describing what is measured. Give it a stable, unit-aware meaning so querying and aggregation remain understandable.
- `Metric label` — A key/value dimension on a Prometheus series. Labels enable filtering and grouping, but each unique combination multiplies series count.
- `Metric cardinality` — The number of unique series created by names and label combinations. Unbounded values such as request IDs can overwhelm memory, indexes, and query cost.
- `Counter metric` — A cumulative quantity that normally increases and resets when its process restarts. Use rate-oriented functions and apply them before aggregation to detect resets correctly.
- `Gauge metric` — A value that can increase or decrease, such as current queue depth. A rate is generally not meaningful unless the measurement itself has rate semantics.
- `Histogram metric` — An observation distribution represented by counts across buckets plus count/sum information. It can support aggregated quantile estimation when the bucket design is appropriate.
- `Summary metric` — A metric type that may expose locally calculated quantiles plus count/sum. Precomputed quantiles from separate instances generally cannot be aggregated into a fleet-wide quantile.
- `Exponential histogram` — A histogram whose bucket boundaries grow exponentially with scale, used in OpenTelemetry’s metric data model. Conversion and resolution behavior depend on the receiving system.
- `Classic histogram` — Prometheus’s traditional histogram representation: cumulative bucket series ending with an infinite bucket, plus sum and count series. Quantile aggregation requires retaining the `le` bucket label.
- `Histogram bucket` — A bucket count for observations at or below its upper boundary in a classic histogram. Because counts are cumulative, adjacent bucket values are nondecreasing; bucket layout controls quantile resolution.
- `Histogram quantile` — An estimated rank value derived from histogram buckets or native histogram samples. It is not an exact per-request guarantee; interpolation and resolution affect the estimate.

## Scraping and query language

- `Prometheus` — A time-series monitoring system that scrapes targets, stores samples, evaluates PromQL and rules, and can expose or remote-write data. Retention and high availability require explicit operational design.
- `Prometheus scrape` — A pull operation in which Prometheus requests metrics from a target on a schedule. Scrape success is distinct from application health and from whether the desired series are present.
- `Prometheus exposition format` — A text or protocol representation of metric samples and metadata served to scrapers. Content negotiation and format support influence which metric features can be transferred.
- `Prometheus target` — A discovered endpoint from which Prometheus scrapes metrics. Target health can be up while an individual expected metric is absent.
- `Prometheus job` — A scrape configuration grouping targets with common settings and a job identity. Job labels support consistent filtering, but should not be overloaded with per-target detail.
- `Prometheus label` — A string key/value attached to a Prometheus time series. Labels form identity and grouping dimensions; changing a label creates a new series.
- `PromQL` — Prometheus’s expression language for selecting, transforming, aggregating, and analyzing time series. It has rules about sample types, vector matching, evaluation time, and histogram behavior.
- `PromQL instant vector` — A set of series with one sample per series at the evaluation time. A selector without a range returns an instant vector, subject to lookback and staleness behavior.
- `PromQL range vector` — A set of series with their samples across a selected time range. Range functions such as `rate` consume this type; it is not the same as a dashboard’s range of repeated instant evaluations.
- `PromQL scalar` — A single numeric value in an expression. It can be used for thresholds or parameters, but vector/scalar arithmetic still follows PromQL’s matching rules.
- `PromQL string` — A string expression value, used mainly in selected functions and templates rather than as a metric sample.
- `PromQL selector` — A metric name and/or label matchers selecting time series. Regex matchers and absent labels have defined semantics; broad selectors may be expensive.
- `PromQL range selector` — A duration suffix such as `[5m]` that selects recent samples for each matching series. The chosen range must include enough samples for the function and desired responsiveness.
- `PromQL offset modifier` — A modifier that shifts the selector’s evaluation into the past or, where supported, relative to another time. It enables comparisons but can mislead if traffic patterns or labels changed.
- `PromQL subquery` — A range-producing evaluation of an expression at a chosen resolution over a duration. It is useful for applying range functions to computed expressions but may be expensive.
- `PromQL aggregation operator` — An operation such as `sum` or `avg` that combines samples across selected label dimensions. Choose `by` or `without` deliberately so essential separation is retained.

## PromQL counter and histogram functions

- `PromQL rate function` — The `rate` function estimates average per-second counter increase across a range, correcting resets and extrapolating endpoints. Apply it before aggregation; it is generally preferred for alerts and smooth graphs.
- `PromQL irate function` — The `irate` function estimates a per-second rate from the last two samples. It reacts sharply to recent changes and is mainly for volatile visualizations, not stable paging conditions.
- `PromQL increase function` — The `increase` function estimates total counter growth over a range, including reset correction and extrapolation. It is effectively rate scaled by the range duration and may return non-integers.
- `PromQL histogram_quantile function` — `histogram_quantile` estimates a requested quantile. Classic histogram queries preserve `le` during aggregation; native histogram queries use structured samples and do not need that bucket label.
- `PromQL absent function` — `absent` returns a one-element vector when its input instant vector has no elements, and an empty vector otherwise. It is useful for detecting expected missing series but cannot explain why the data is absent.

## PromQL function catalog: scalar and vector shaping

The following supplied function names are separate APIs with different input types; histogram samples may be ignored by float-only functions. Check the function page for sample-type annotations and current feature flags. [PromQL function reference](https://prometheus.io/docs/prometheus/latest/querying/functions/)

- `PromQL abs function` — `abs` returns absolute values for float samples in an instant vector; histogram samples are ignored.
- `PromQL ceil function` — `ceil` rounds float samples upward to the nearest integer-valued float; it is a numeric display/transformation tool, not a substitute for unit conversion.
- `PromQL clamp function` — `clamp` bounds float samples between scalar limits; an invalid minimum greater than maximum produces an empty vector.
- `PromQL clamp_max function` — `clamp_max` limits float samples to a maximum while preserving labels.
- `PromQL clamp_min function` — `clamp_min` imposes a lower bound on float samples while preserving labels.
- `PromQL exp function` — `exp` applies the natural exponential to float samples; special values such as NaN and infinity follow floating-point rules.
- `PromQL floor function` — `floor` rounds float samples downward to the nearest integer-valued float.
- `PromQL ln function` — `ln` computes the natural logarithm for float samples; zero, negatives, NaN, and infinity produce the documented special values.
- `PromQL log2 function` — `log2` computes the base-two logarithm for float samples, with special-value behavior analogous to `ln`.
- `PromQL log10 function` — `log10` computes the base-ten logarithm for float samples, with special-value behavior analogous to `ln`.
- `PromQL round function` — `round` rounds float samples to a configurable nearest multiple, with ties rounded upward; it ignores histogram samples.
- `PromQL scalar function` — `scalar` converts a one-element float instant vector into a scalar; vectors with a different cardinality or unsuitable sample return NaN.
- `PromQL sgn function` — `sgn` maps float samples to -1, 0, or 1 according to sign; histograms are ignored.
- `PromQL sort function` — `sort` orders instant-query vector elements by float value ascending; it does not reorder range-query output.
- `PromQL sort_desc function` — `sort_desc` orders instant-query vector elements by float value descending.
- `PromQL sort_by_label function` — `sort_by_label` sorts instant-query results by one or more label values in natural ascending order; current documentation marks it experimental and feature-flagged.
- `PromQL sort_by_label_desc function` — `sort_by_label_desc` sorts by label values in descending order and is experimental/feature-flagged in the current docs.
- `PromQL sqrt function` — `sqrt` computes square roots of float samples and ignores histogram samples.
- `PromQL vector function` — `vector` converts a scalar into a one-element instant vector with no labels; use cautiously because it does not represent observed service telemetry.

## PromQL time, calendar, and timestamp functions

- `PromQL day_of_month function` — `day_of_month` interprets float values as Unix timestamps and returns their UTC day number from 1 to 31; its default input is the evaluation time.
- `PromQL day_of_week function` — `day_of_week` returns the UTC weekday index from 0 (Sunday) through 6 for timestamp values.
- `PromQL day_of_year function` — `day_of_year` returns the UTC day index, including leap-day behavior, for timestamp values.
- `PromQL days_in_month function` — `days_in_month` returns the number of days in the UTC month represented by each timestamp value.
- `PromQL hour function` — `hour` returns the UTC hour from 0 to 23 for timestamp values.
- `PromQL minute function` — `minute` returns the UTC minute from 0 to 59 for timestamp values.
- `PromQL month function` — `month` returns the UTC month number from 1 to 12 for timestamp values.
- `PromQL year function` — `year` returns the UTC year for timestamp values; absent an argument, the evaluated time is used.
- `PromQL time function` — `time` returns the expression evaluation timestamp in seconds, not necessarily wall-clock “now” during a range query.
- `PromQL timestamp function` — `timestamp` returns the timestamp of each sample in an instant vector, including histogram samples.
- `PromQL start function` — `start` returns the start time of the current range-query evaluation; it is experimental/feature-flagged in current documentation.
- `PromQL end function` — `end` returns the end time of the current range-query evaluation; it is experimental/feature-flagged in current documentation.
- `PromQL range function` — `range` returns the range duration being evaluated; instant queries return zero, and the function is experimental/feature-flagged.
- `PromQL step function` — `step` returns the query resolution step in seconds; instant queries return zero and the function is experimental/feature-flagged.
- `PromQL start_timestamp function` — `start_timestamp` returns a sample’s start timestamp when used directly on an instant vector and when its required feature is enabled; otherwise results may be empty.

## PromQL change, trend, and histogram functions

- `PromQL changes function` — `changes` counts value/type changes in a range, including a float-to-histogram transition as a change. It is not the same as counting counter increments.
- `PromQL delta function` — `delta` estimates the first-to-last difference for a gauge over a range and extrapolates to the range edges; it is not a counter-reset-aware increase.
- `PromQL deriv function` — `deriv` uses linear regression to estimate the per-second slope of float gauge samples; it needs at least two samples and does not process histogram samples as values.
- `PromQL double_exponential_smoothing function` — This experimental, feature-flagged function smooths float gauge samples with level and trend factors between 0 and 1. Older Prometheus v2 called it `holt_winters`; do not confuse double smoothing with triple smoothing.
- `PromQL idelta function` — `idelta` subtracts the last two samples in a range and is intended for gauges; a float/histogram mismatch omits the result with a warning annotation.
- `PromQL predict_linear function` — `predict_linear` extrapolates a float gauge using linear regression to a future time horizon; it is not a reliable capacity promise when trends, seasonality, or workload change.
- `PromQL resets function` — `resets` counts counter resets, including specific histogram changes; use it for counter diagnostics, not for gauges.
- `PromQL histogram_avg function` — `histogram_avg` divides the observation sum by count for each native histogram sample; it drops float samples and can conceal a long tail.
- `PromQL histogram_count function` — `histogram_count` extracts observation counts from native histograms; applying it to a histogram rate yields an observation rate.
- `PromQL histogram_fraction function` — `histogram_fraction` estimates the fraction of observations between bounds in classic or native histograms. Misaligned bounds require interpolation and can create substantial estimation error.
- `PromQL histogram_quantiles function` — This experimental, feature-flagged function computes multiple requested quantiles and adds a label identifying each. Its input and interpolation considerations match `histogram_quantile`.
- `PromQL histogram_stddev function` — `histogram_stddev` estimates standard deviation from native histogram buckets by assigning representative values within buckets; it is not an exact reconstruction of raw observations.
- `PromQL histogram_stdvar function` — `histogram_stdvar` estimates variance from native histogram buckets using representative bucket values; resolution and bucket distribution limit precision.
- `PromQL histogram_sum function` — `histogram_sum` extracts observation sums from native histogram samples, useful with histogram rates but not a substitute for a latency percentile.
- `PromQL label_join function` — `label_join` joins selected source-label values with a separator into a destination label for each vector element. It transforms labels on the query result; high-cardinality or sensitive joins can still create costly or unsafe outputs.
- `PromQL label_replace function` — `label_replace` uses a regular expression and replacement expression to set a destination label from another label. Nonmatching series are returned unchanged, so test patterns and named capture groups against real labels.

## PromQL range-vector functions

- `PromQL absent_over_time function` — `absent_over_time` returns a marker vector when no samples exist in a range; it detects prolonged absence but not its cause.
- `PromQL avg_over_time function` — `avg_over_time` averages samples in each range with equal weight per sample, not equal weight per elapsed time; mixed float/histogram input can remove a series with a warning.
- `PromQL count_over_time function` — `count_over_time` counts samples in a range, regardless of their spacing; it can help reveal scrape coverage.
- `PromQL first_over_time function` — `first_over_time` returns the oldest sample in the selected range and supports float and histogram samples.
- `PromQL last_over_time function` — `last_over_time` returns the newest sample in the selected range and supports float and histogram samples.
- `PromQL max_over_time function` — `max_over_time` finds the maximum float sample; histograms are ignored, so the result is not a maximum histogram.
- `PromQL min_over_time function` — `min_over_time` finds the minimum float sample; histograms are ignored.
- `PromQL present_over_time function` — `present_over_time` returns 1 for each series with any sample in the range, which is useful for presence checks.
- `PromQL quantile_over_time function` — `quantile_over_time` calculates a quantile across float samples in the range; histogram samples are ignored and sample spacing is not time-weighted.
- `PromQL stddev_over_time function` — `stddev_over_time` computes population standard deviation across float samples; it is sensitive to outliers and equally weights observations.
- `PromQL stdvar_over_time function` — `stdvar_over_time` computes population variance across float samples, the squared dispersion measure.
- `PromQL sum_over_time function` — `sum_over_time` sums samples, including compatible histogram samples; a mixed float/histogram range is removed with a warning.
- `PromQL mad_over_time function` — `mad_over_time` computes median absolute deviation for float samples and is experimental/feature-flagged in current docs.
- `PromQL ts_of_min_over_time function` — This experimental function returns the timestamp of the last minimum float sample in the range.
- `PromQL ts_of_max_over_time function` — This experimental function returns the timestamp of the last maximum float sample in the range.
- `PromQL ts_of_last_over_time function` — This experimental function returns the timestamp of the most recent sample in the range.
- `PromQL ts_of_first_over_time function` — This experimental function returns the timestamp of the earliest sample in the range.

## PromQL specialized and experimental functions

- `PromQL info function` — `info` enriches a vector with data labels from matching info series. It is experimental/feature-flagged, its behavior may change, and its identifying-label assumptions should be checked before relying on it.
- `PromQL integral function` — `integral` estimates the time integral of float gauge samples using a selected quadrature strategy; it is experimental/feature-flagged and is meaningful only when units and sampling make the area meaningful.

## Rules, notifications, and exporters

- `PromQL recording rule` — A named expression evaluated periodically and stored as a new time series. It can simplify repeated queries, but naming and labels should preserve aggregation meaning and avoid unnecessary cardinality.
- `PromQL alerting rule` — A periodically evaluated condition that creates alert instances while its expression is present; a `for` duration can suppress brief conditions. Rule tests should cover missing data, labels, and recovery behavior.
- `Prometheus rule group` — A collection of recording and/or alerting rules evaluated together with shared scheduling settings. Evaluation delays and rule ordering matter when one rule depends on another.
- `promtool check rules` — A `promtool` command that validates rule files syntactically and structurally. It does not prove that expressions represent the intended SLI or that production data will behave correctly.
- `Alertmanager` — The Prometheus alert routing and notification service. It groups, deduplicates, silences, and inhibits alerts; it does not evaluate PromQL rules.
- `Alertmanager route` — A routing tree that matches alert labels to receivers and can adjust grouping or timing. A broad early match can shadow more specific routing intent.
- `Alertmanager receiver` — A configured notification destination or integration. Delivery credentials, retry behavior, and receiver availability remain operational dependencies.
- `Alertmanager inhibition rule` — A rule suppressing notifications for matching alerts when a source alert is active. It should reduce duplicate pages without hiding distinct user-impacting conditions.
- `Alertmanager silencing` — A time-bounded matcher that suppresses matching notifications, often for planned work or an acknowledged incident. A silence hides notifications, not the underlying alert condition.
- `Alert grouping` — Combining related alert instances into a notification. Appropriate group labels reduce floods; over-grouping can hide distinct affected services.
- `Alert deduplication` — Suppressing repeated notifications for the same alert identity across evaluations or replicas. Labels define identity, so unstable labels can defeat deduplication.
- `Alert notification` — The message delivered to a human or system. It should state impact, affected scope, ownership, and a useful next action.
- `Alert severity` — A classification for urgency or impact, such as page versus ticket. Define it consistently so severity does not become decorative metadata.
- `Alert runbook link` — A pointer from an alert to diagnosis and response instructions. Keep the runbook specific, available during an outage, and aligned with the alert’s actual condition.
- `Blackbox exporter` — A Prometheus exporter that probes endpoints from an external perspective, such as reachability or protocol response. It reports the probe’s view, which may differ by network vantage point.
- `Prometheus exporter` — An endpoint or adapter that exposes metrics for Prometheus scraping, including metrics translated from another system. Exporter health and metric semantics must be validated.
- `Prometheus client library` — A library for instrumenting an application with Prometheus metrics and exposition. Use the official or maintained library for the language and understand its concurrency, label, and histogram semantics.
- `Recording rule naming` — A convention for naming derived series, commonly encoding aggregation and operation. Clear names prevent confusing raw and aggregated quantities; follow the project’s current naming guidance.
- `Multi-window multi-burn-rate alert` — An SLO alert pattern using multiple time windows and burn-rate thresholds to balance fast detection with confidence. Tune it to objective, traffic, and response urgency rather than copying constants blindly.

# Cross-item comparison

| Choice | What it preserves | Main limitation |
| --- | --- | --- |
| Counter | Accumulated event total | Must account for resets and query a rate over time |
| Gauge | Current/instant state | A single sample can miss short-lived behavior |
| Classic histogram | Fixed cumulative buckets plus count and sum | Quantile resolution is bounded by configured buckets; many bucket series cost more |
| Summary | Locally computed quantiles | Quantiles usually cannot be correctly aggregated across instances |
| Native histogram | Structured sparse distribution in one sample | Scrape, remote-write, storage, and query compatibility must all be configured/verified |
| Recording rule | Reusable precomputed expression | Can freeze a flawed aggregation or consume storage |
| Alerting rule | Repeated condition evaluation | Only actionable if semantics, missing data, window, ownership, and route are correct |

Prometheus native histograms and OpenTelemetry exponential histograms are related distribution approaches but have different data models and conversion rules. Do not assume every OTLP histogram becomes a native histogram without configuration; Prometheus documents conversion behavior separately. [Metric types](https://prometheus.io/docs/concepts/metric_types/) [Native histograms](https://prometheus.io/docs/specs/native_histograms/)

# Examples

Counter rates should be calculated per series before aggregation:

```promql
sum by (service) (rate(http_requests_total[5m]))
```

For a classic histogram, preserve `le` until the quantile is calculated:

```promql
histogram_quantile(0.99, sum by (service, le) (rate(http_request_duration_seconds_bucket[5m])))
```

A native-histogram query instead aggregates the structured samples without a bucket label:

```promql
histogram_quantile(0.99, sum by (service) (rate(http_request_duration_seconds[5m])))
```

These examples assume the indicated series exist and that the target format and ingestion path support the histogram type. The rule file should be checked with `promtool`, then tested with rule-test data and observed in the real deployment.

# Common mistakes

- Summing counters first and then applying `rate`, which can hide individual resets.
- Using `irate` for a paging condition and reacting to one scrape interval.
- Averaging percentiles from separate instances or using summary quantiles as if they aggregate.
- Forgetting the classic `le` label in quantile aggregation or trying to carry it into a native-histogram query.
- Treating a successful scrape as proof that expected metrics exist or are correct.
- Assuming experimental PromQL functions exist without the feature flag or have a stable contract.
- Treating `promtool check rules` as semantic testing or operational validation.
- Sending one notification per raw label combination and overwhelming responders.

# Knowledge checks with answers

1. Why does a classic histogram query retain `le`? **Each cumulative bucket is a separate series distinguished by its upper-bound label; quantile calculation needs those boundaries.**
2. What does `rate` do that a simple difference does not? **It adjusts for counter resets and extrapolates over the selected range.**
3. Is `histogram_avg` enough to monitor latency? **No. An average can hide tail behavior; inspect a distribution or threshold-based SLI too.**
4. What does a silence change? **It suppresses notifications for matching alerts during its interval; it does not clear or stop evaluation of the alert.**
5. What does an alert rule do that Alertmanager does not? **Prometheus evaluates the expression and creates alert instances; Alertmanager groups, routes, inhibits, silences, and notifies.**
6. Does Prometheus v3 scrape native histograms because they are stable? **No. Scrape configuration must enable them, and remote-write needs a separate setting.**

# Sources

[Prometheus metric types](https://prometheus.io/docs/concepts/metric_types/) · [PromQL basics](https://prometheus.io/docs/prometheus/latest/querying/basics/) · [PromQL functions](https://prometheus.io/docs/prometheus/latest/querying/functions/) · [PromQL operators](https://prometheus.io/docs/prometheus/latest/querying/operators/) · [Native histograms](https://prometheus.io/docs/specs/native_histograms/) · [Recording rules](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/) · [Alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) · [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)
