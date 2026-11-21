# end-to-end system design case studies — Reference: Cardinality control for observability

Sources: [HLD Handbook](https://hld.handbook.academy/), [Prometheus instrumentation practices](https://prometheus.io/docs/practices/instrumentation/), [Prometheus metric and label naming](https://prometheus.io/docs/practices/naming/), [Google SRE: monitoring distributed systems](https://sre.google/sre-book/monitoring-distributed-systems/).

## Scope and version

This lesson focuses on metrics label cardinality, with Prometheus as a concrete example. Other telemetry backends have different storage and pricing models, but high-dimensional labels commonly increase aggregation, indexing, and query cost. Prometheus’ published numeric recommendations are guidance, not hard universal thresholds; review the current docs and measure your actual system.

## How this group fits the mental model

Metrics turn repeated measurements into time series that operators can aggregate, alert on, and compare over time. Every distinct combination of metric name and label values creates a distinct series. If a label can take a huge or unbounded number of values, the system can create far more series than expected, increasing memory, CPU, disk, network, scrape, and query costs.

The goal is useful diagnostic dimensions with bounded combinations. Keep high-detail per-request context in traces or structured logs where it can be sampled, filtered, access-controlled, and retained under an explicit policy. Metrics help answer “how many/how often/how long?”; they are not an indexed event database for arbitrary user IDs.

## Supplied names explained

- **Cardinality:** the number of distinct values of a label, or more practically, the number of distinct label combinations for a metric.
- **Label/dimension:** a key-value attribute attached to a measurement, such as `route="/orders/{id}"` or `status="5xx"`.
- **Unbounded label:** a value domain that grows with requests or entities, such as user ID, email, request ID, raw URL, or exception message.
- **Series budget:** a measured or chosen bound for series growth by service, metric family, or tenant; alert on sudden growth and include retention and replica factors.
- **Alternative telemetry:** traces and logs retain richer per-event context; they also need sampling, indexing, privacy, and retention controls, and are not free or infinitely scalable.

## Cross-item comparison

| Signal design | Example | Suitable for |
| --- | --- | --- |
| Bounded metric label | `route="/users/{id}"`, `method="GET"`, `status_class="5xx"` | Aggregated rate, error ratio, and latency by stable route or outcome class |
| Unbounded metric label | `user_id="829103..."`, raw URL, request ID, free-form error text | Generally avoid; each new value can create additional metric series |
| Trace/log attribute | Request ID, user/tenant identifier where justified, detailed error context | Investigating individual requests with sampling, access control, and retention constraints |
| Top-K or sampled view | A bounded set of the highest-volume tenants/routes plus an “other” group | Finding major contributors without materializing every possible value as a metric series |

Replacing an unbounded metric label with traces or logs preserves context only if instrumentation actually records it and the collection system’s cost, privacy, access, and retention behavior are understood. Scrubbing or hashing an identifier does not necessarily bound its number of unique values.

## Examples

Suppose an HTTP request counter labels every sample with `path`. `/orders/1`, `/orders/2`, and every other identifier-bearing URL become distinct label values. With many users, the series count can grow continually. Use a route template such as `/orders/{id}` for the metric and retain the exact path or request ID in a trace/log when needed.

Before adding `tenant_id`, estimate cardinality as the product of the distinct values across all labels, then account for the number of metric families, scrape targets, replicas, and retention. A few hundred tenants may still create large series counts when combined with route, status, region, and histogram buckets. Monitor active series and churn, query cost, scrape size, and dropped/limited series. Prometheus guidance suggests investigating alternatives when cardinality is high or can grow beyond its stated rule-of-thumb thresholds; the correct budget depends on workload and resources.

For a top-ten tenant dashboard, produce a bounded aggregation or query over the event/analytics data and label the remaining group as “other.” Do not add every tenant ID as an always-on dimension solely because it makes one dashboard convenient.

## Common mistakes

- Putting request IDs, user IDs, email addresses, raw URLs, timestamps, or arbitrary exception text in metric labels.
- Counting only possible label values and forgetting combinations across labels, metric families, targets, replicas, histogram buckets, and time retention.
- Believing hashing a unique identifier lowers cardinality; it changes representation, not uniqueness.
- Removing every useful dimension and making the metric impossible to act on; bounded labels such as route template, method, status class, and region may be valuable.
- Moving detailed context into logs/traces without sampling, redaction, access control, or retention limits.
- Treating a tool’s suggested numeric threshold as a universal service limit rather than guidance to investigate and measure.
- Detecting series growth only after collection or query capacity is already exhausted.

## Knowledge checks with answers

1. **Why is `request_id` a poor Prometheus label?** Almost every request can have a new value, producing a series per request rather than a reusable aggregate.
2. **Is a hash of user ID safe as a low-cardinality label?** No. A stable hash preserves distinctness and can still create one series per user.
3. **How can operators see errors by endpoint without raw URLs?** Instrument route templates and bounded outcomes in metrics, then use trace/log correlation IDs for individual requests.
4. **Does moving the identifier into traces eliminate all risk?** No. Traces need their own volume, sampling, privacy, access, and retention controls.

## Review status

Series-per-labelset behavior and cardinality guidance are checked against Prometheus documentation. Numeric recommendations are identified as guidance, not universal capacity limits. This lesson remains pending full claim-by-claim audit and manifest omission check.
