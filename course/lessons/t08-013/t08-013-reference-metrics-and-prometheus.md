# observability logs metrics tracing alerts and OpenTelemetry — Reference: Measurements, instruments, time series, PromQL, and storage behavior

Sources: [official reference 1](https://opentelemetry.io/docs/specs/otel/metrics/), [official reference 2](https://prometheus.io/docs/concepts/data_model/), [official reference 3](https://prometheus.io/docs/concepts/metric_types/).

## Scope and version

This guide explains the assigned observability inventory group in the context of the current OpenTelemetry specification snapshot and Prometheus 3.x/current documentation checked 2026-11-20. The terminology and component maturity can evolve. The observability profiles signal and individual Collector components do not have a universal stability guarantee.

## How this group fits the mental model

Metrics turn repeated measurements into queryable time series. Instrument choice defines what operations mean; temporality and aggregation define what is exported; dimensions define how the data can be grouped and how many series are created. Prometheus scrapes targets and labels series by metric name plus a complete label set. Query counters as rates over time, and use distribution instruments when tail latency matters.

## Supplied names explained

- `Metric` — A named quantitative observation reported over time; its meaning depends on instrument, unit, dimensions, temporality, and aggregation.
- `Measurement` — A recorded value with context and time; instrument semantics determine how individual measurements combine.
- `Metric instrument` — An API used to record measurements, selected according to whether values accumulate, fluctuate, or represent distributions.
- `Counter` — An instrument for nonnegative accumulating events; reset-aware rates are usually more useful than raw totals.
- `UpDownCounter` — An additive instrument whose value may increase or decrease, suitable for an aggregate count of active entities when updates are balanced.
- `Gauge` — A measurement representing a value at observation time, useful for state that can rise or fall; aggregating gauges requires semantic care.
- `Histogram` — An instrument that records a distribution of measurements, supporting count/sum and configured distribution aggregation.
- `ExponentialHistogram` — A scale-based histogram representation that can adapt bucket resolution across a wide range; interoperability and backend support must be checked.
- `ObservableCounter` — An asynchronous instrument whose callback observes an accumulating value; report cumulative state consistently rather than treating it as an event delta.
- `ObservableUpDownCounter` — An asynchronous callback instrument reporting a value that may rise or fall, useful when polling a current aggregate.
- `ObservableGauge` — An asynchronous callback instrument that reports current observed values without synchronous record calls.
- `Meter` — The API object from which instruments are created, commonly associated with an instrumentation scope.
- `Metric name` — A stable identifier for what is measured; naming and units should describe a consistent quantity.
- `Metric unit` — The unit of measurement; consistent units enable meaningful aggregation and readable dashboards.
- `Metric description` — Human-readable metadata explaining a metric’s meaning and intended interpretation.
- `Metric type` — The measurement aggregation shape, such as sum, gauge, or histogram; do not infer query semantics from the name alone.
- `Metric temporality` — Whether points represent changes over intervals or accumulated state; consumers must interpret resets and intervals correctly.
- `Metric aggregation` — Combining measurements into data points, such as sum, count, or histogram buckets; aggregation loses detail and must fit the question.
- `AggregationTemporality` — The data-model field describing delta or cumulative aggregation behavior.
- `Monotonic sum` — A sum instrument constrained to nondecreasing updates within its aggregation semantics; appropriate for event totals, not values that can fall.
- `Data point attributes` — Dimensions attached to a metric point; each distinct combination can multiply series in a backend.
- `Data point flags` — Metadata flags about a metric point, for example indicating a no-recorded-value condition; consumers should preserve and interpret defined semantics.
- `Time series` — A sequence of samples for a metric identity and dimensions; adding unique labels creates more separate series.
- `Prometheus dimensional data model` — A series is identified by metric name and label set, with timestamped samples; dimensional queries are powerful but cardinality has memory and cost impact.
- `Prometheus sample` — A timestamped numeric value in a time series; counter resets, staleness, and missing samples affect query interpretation.
- `Prometheus label` — A key/value dimension on a time series; keep values bounded and avoid user/request IDs and unbounded paths.
- `Label cardinality` — The number of distinct label combinations; it grows multiplicatively as dimensions combine.
- `Counter rate` — The increase per unit time of a counter over a range, adjusted for counter resets by Prometheus rate functions.
- `Gauge aggregation` — Combining instantaneous values such as current queue depth; choose sum, max, or another operator based on what the values represent.
- `Classic histogram` — A cumulative bucket-based histogram represented by separate time series; quantile estimates depend on bucket boundaries.
- `Native histogram` — A composite histogram sample with configurable resolution, reducing some classic-series overhead while requiring compatible ingestion and query support.
- `Histogram bucket` — A count of observations falling within a bucket range; classic buckets are cumulative.
- `Histogram bucket boundary` — The cutoff that determines a classic bucket; poor boundaries yield poor quantile resolution where users care most.
- `Histogram quantile estimation` — Estimating a percentile from bucketed or native distribution data; it is an estimate, not an exact individual observation.
- `Exemplar` — A sample reference linking an aggregate metric observation to a trace or other detailed evidence without labeling every sample with a trace ID.
- `PromQL selector` — An expression selecting series by metric name and label matchers.
- `PromQL range vector` — Samples for each selected series over a time range, used by functions that need temporal history.
- `PromQL instant vector` — One sample per selected series at an evaluation time, used in expressions and aggregations.
- `PromQL rate()` — Calculates an average per-second increase over a range and handles counter resets; use a range long enough for reliable samples.
- `PromQL increase()` — Estimates total counter increase over a range, accounting for resets and extrapolating to range boundaries.
- `PromQL histogram_quantile()` — Estimates a quantile from histogram bucket rates or native histogram data; aggregate compatible buckets before quantile calculation.
- `PromQL aggregation operator` — Combines selected series, such as sum or max; preserve only labels needed for the resulting question.
- `Prometheus scrape` — A pull request that collects metrics from a configured target; scrape health itself should be monitored.
- `Scrape interval` — The configured cadence for collecting a target; faster intervals increase resolution and ingestion load.
- `Scrape timeout` — The maximum time allowed for a scrape; it must not exceed the interval and should account for target response time.
- `Target discovery` — Finding scrape targets from static or dynamic service sources; stale discovery can leave missing coverage.
- `Target relabeling` — Transforming or filtering target labels before scrape, commonly to shape target identity and selection.
- `Metric relabeling` — Transforming or dropping samples after scrape before ingestion; useful for cost control but can remove needed evidence.
- `Recording rule` — A periodically evaluated PromQL expression stored as a new series for reusable or expensive queries.
- `Alerting rule` — A periodically evaluated condition that creates alert state when true for configured evaluation behavior.
- `Prometheus staleness` — The handling of series that stop being reported; absent data is not equivalent to a measured zero.
- `Metric retention` — How long samples remain queryable; storage sizing must account for ingestion rate and series count.
- `OpenTelemetry Metrics data model` — The vendor-neutral model for metric instruments, data points, temporality, aggregation, attributes, and resource/scope identity.

## Cross-item comparison

Counters fit accumulating events; UpDownCounters represent counts that can rise and fall; gauges represent observed state; histograms preserve distribution evidence. Classic and native histograms have different representation and compatibility tradeoffs.

## Examples

**Worked example**
To alert on request errors, instrument total and failed requests with the same bounded dimensions, compute reset-aware rates over a useful range, and divide failures by eligible requests. For latency, record a distribution rather than only an average. Keep route labels templated. A scrape timeout needs room under its interval; a missing target is not a zero-error target.

**Common mistakes:**
Summing unrelated gauges; averaging instance quantiles; applying a counter rate after aggregating away reset boundaries; exploding label combinations; confusing bucket counts with disjoint intervals; or assuming a backend supports every histogram representation.

## Common mistakes

Summing unrelated gauges; averaging instance quantiles; applying a counter rate after aggregating away reset boundaries; exploding label combinations; confusing bucket counts with disjoint intervals; or assuming a backend supports every histogram representation.

## Knowledge checks with answers

1. **Why can instance p99 values not simply be averaged?** Quantiles are not generally composable; aggregate distributions or use suitable histogram buckets.
2. **How should a monotonically increasing counter be interpreted?** As cumulative state; calculate a rate over a time interval and account for resets.
3. **What makes a label set dangerous?** Unbounded or high-cardinality values such as user IDs create excessive time series.
4. **What does a histogram bucket count represent?** Cumulative observations up to a boundary, not a disjoint interval count.
## Recent version changes

OpenTelemetry core specification documentation identifies version 1.62.0, while Semantic Conventions are version 1.45.0. These are separate version streams, and individual conventions have their own stability status. Migrations may use explicit opt-in modes; do not assume a global release makes every convention stable. [OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/) [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)

Prometheus 3.0 added UTF-8 metric and label name support; conventional naming remains useful for tool interoperability. As of 2026-11-20, 3.16.0 is the latest release. Current Prometheus docs distinguish native histograms from classic bucket series. [Prometheus data model](https://prometheus.io/docs/concepts/data_model/) [Metric types](https://prometheus.io/docs/concepts/metric_types/) [Current releases](https://prometheus.io/download/)

