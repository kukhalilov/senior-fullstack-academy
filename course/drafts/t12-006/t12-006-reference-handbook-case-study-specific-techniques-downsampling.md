# end-to-end system design case studies — Reference: Downsampling

Sources: [HLD Handbook](https://hld.handbook.academy/), [Prometheus recording rules](https://prometheus.io/docs/practices/rules/), [Prometheus histograms and summaries](https://prometheus.io/docs/practices/histograms/), [Prometheus query functions](https://prometheus.io/docs/prometheus/latest/querying/functions/).

## Scope and version

This lesson covers reducing the resolution or volume of time-series data for long-term storage and cheaper/faster queries. Downsampling is a lossy transformation unless raw data is retained separately. Prometheus recording rules are cited for aggregation practices, not as a general replacement for a dedicated long-term downsampling store.

## How this group fits the mental model

Fine-grained measurements support incident investigation but grow in storage and query cost. Downsampling summarizes older/high-volume data into larger time buckets or precomputed metrics. The system trades detail and some ability to answer future questions for lower data volume and faster historical queries. Define the questions the coarse data must still answer, the retention period at each resolution, and which raw data can be safely discarded.

Aggregation must preserve the meaning of the metric. Averages of averages can be wrong when buckets contain different sample counts; aggregate numerators and denominators separately. Counters must be converted to rates/increases before aggregation in the appropriate order, and histograms/quantiles have their own mergeability constraints. Averages and maxima also answer different questions: averaging a spike can hide it.

## Supplied names explained

- **Resolution/step:** spacing between retained samples or aggregation windows; coarser resolution loses short-lived detail.
- **Rollup/downsample:** summary over a time interval, such as sum, count, min/max, quantile approximation, or last value. Select based on metric semantics and desired query.
- **Gauge:** sampled value that can move up or down; last/mean/min/max may each be useful but mean alone hides peaks.
- **Counter:** monotonic cumulative total except for reset; calculate rate/increase with reset handling before aggregating across instances.
- **Histogram:** distribution represented by buckets/counts/sums (or native representation); combine distributions appropriately before computing quantiles where supported.
- **Recording rule:** precomputes a query result into a new time series on an interval; speeds repeated queries but creates new data and can have gaps if evaluations are missed.
- **Retention tier:** policy for keeping raw, medium-resolution, and coarse data for different periods.
- **Downsampling error:** loss introduced by bucket width, aggregation, approximation, missing samples, or resets; document it rather than presenting a rollup as raw truth.

## Cross-item comparison

| Summary | Preserves | Loses/can distort |
| --- | --- | --- |
| Mean/average | Typical level when sample weighting is correct | Short spikes, distribution shape, and uneven sample-count information if averages are averaged |
| Min/max | Extremes seen in the bucket | Timing, duration, and number of occurrences |
| Sum/count | Totals and sample counts for compatible measures | Individual event distribution and exact timing |
| Histogram bucket counts | Approximate distribution within bucket boundaries | Resolution within buckets; quantile accuracy depends on bucket layout/representation |
| Last sample | Most recent value in the interval | Earlier behavior and brief excursions |

## Examples

Suppose one minute has 60 observations with mean latency 100 ms and another has 6 observations with mean 1,000 ms. The combined mean is weighted by observation counts: `(60×100 + 6×1000) / 66 ≈ 181.8 ms`, not the unweighted average of the two means (550 ms). Preserve sum and count or combine histogram observations before deriving an aggregate. For percentiles, average of per-minute p99 values does not generally equal the p99 of all requests in the hour.

For a service dashboard, retain raw latency histograms for a short period and create longer-window rollups with rates/counts, error ratios, and selected extrema for older history. Alert on raw/high-resolution data where brief incidents matter; use coarser history for trend comparison. Maintain names that disclose resolution and operations, version rollup rules, monitor rule evaluation gaps, and compare rollups against raw data during migration.

## Common mistakes

- Averaging already-averaged values without weighting by sample count.
- Averaging percentiles and presenting the result as the percentile over the combined population.
- Summing cumulative counters before computing rates, creating reset/instance errors.
- Dropping raw data before confirming retained summaries answer incident and compliance questions.
- Using a bucket width that hides short spikes or makes trends misleading.
- Treating missing samples as zero without knowing why data is absent.
- Assuming a recording rule is free; it creates series, may miss evaluations, and needs naming/retention/capacity planning.
- Changing aggregation definitions without versioning, leaving dashboards comparing incompatible metrics.
- Calling an approximate histogram/quantile an exact value.

## Knowledge checks with answers

1. **Can you average two bucket means directly?** Only if they have equal sample counts; otherwise use each bucket’s sum and count to weight correctly.
2. **Is the average of hourly p99 values the daily p99?** No. Quantiles are not generally composable by averaging quantiles; combine underlying distributions or use a supported mergeable histogram/sketch.
3. **When should a counter rate be calculated relative to aggregation?** Compute the per-series rate/reset-aware increase first, then aggregate compatible series according to the Prometheus guidance.
4. **What does downsampling trade away?** Fine timing/distribution detail and the ability to answer some future questions from raw observations.

## Review status

Prometheus recording-rule guidance supports aggregating ratio numerators and denominators separately and avoiding averages of averages; its query-function and histogram documentation supports counter-rate ordering, histogram aggregation, and quantile caveats. These semantics are Prometheus-specific where stated; other stores may expose different rollup and histogram behavior.
