# end-to-end system design case studies — Reference: Ad-click event-time windows

Sources: [HLD Handbook](https://hld.handbook.academy/), [Apache Flink event time and watermarks](https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/), [Apache Flink streaming analytics](https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/streaming_analytics/), [Apache Flink window allowed lateness](https://nightlies.apache.org/flink/flink-docs-release-1.19/docs/dev/datastream/operators/windows/).

## Scope and version

This case study covers counting advertising click events in event-time windows. The semantics are general; Flink is used as a concrete streaming example. The linked stable documentation can change across Flink releases, and allowed-lateness details can be API-specific, so verify the version and operator API used by an implementation.

## How this group fits the mental model

An ad click has at least two relevant times: when the user action happened and when the analytics pipeline received it. If an event is delayed by a mobile device, network outage, queue backlog, or retry, counting by arrival time can place it in the wrong reporting hour. Event-time windows group by the recorded occurrence time, while watermarks let a streaming system estimate how far event time has progressed so it can produce results without waiting forever.

This is an analytics pipeline, not automatically the financial source of truth for billing advertisers. Define whether a count is provisional, finalized for a reporting deadline, or later corrected. Preserve enough event identity and provenance to audit deduplication and corrections.

## Supplied names explained

- **Event time:** the timestamp associated with when the event occurred, as recorded by the producer or source.
- **Ingestion time:** when the stream processor accepts the event.
- **Processing time:** when an operator handles the event according to its local processing clock.
- **Window:** a bounded grouping such as a tumbling 5-minute interval, a sliding interval, or a session window. The window type defines which events are grouped; it does not by itself determine when a result is considered complete.
- **Watermark:** a progress signal in event time. In Flink, `Watermark(t)` indicates that the stream is considered complete through time `t` (events with timestamps at or below `t` are not expected); it is an estimate/contract of progress, and late events can still occur.
- **Allowed lateness:** a policy for retaining window state and accepting late elements after the watermark has passed the window end. In Flink’s documented window behavior, the default allowed lateness is zero; configuring a positive duration retains state longer, and late elements may cause updated window results depending on the trigger. Very late events after the configured period can be dropped or routed using an appropriate late-data strategy.
- **Deduplication:** preventing repeated delivery of the same logical click from inflating the metric. Event identity, deduplication scope, retention duration, and replay semantics must be defined; a timestamp alone is not a reliable unique key.

## Cross-item comparison

| Time choice | Useful when | What the result means |
| --- | --- | --- |
| Processing time | Operational monitoring where “when the pipeline processed it” is the desired metric | Results depend on pipeline delay and replay speed; replaying history can change which processing-time window receives an event |
| Ingestion time | A source-level arrival metric is explicitly useful | Less sensitive to later operator delay than processing time, but still records arrival rather than occurrence |
| Event time | Business analytics should group events by the time they happened despite bounded out-of-order arrival | Results depend on timestamp quality, watermark strategy, and late-event/correction policy |

For ad reporting, event time is often the meaningful grouping, but a fast dashboard may publish a provisional count first and update it as late data arrives. A settlement process may have a cutoff and reconciliation path. Those are separate product policies layered on window mechanics.

## Examples

Suppose a click occurred at 10:04:58 but was buffered offline and arrives at 10:08. A five-minute event-time window for 10:00–10:05 should include it if the operator still accepts that window’s late data. A processing-time window would count it around 10:08 instead. If the window has already been finalized and its allowed-lateness retention expired, the event needs an explicit late-data route, correction process, or documented exclusion; merely using event time does not recover discarded state.

A practical pipeline might:

1. Validate event schema, timestamp range, campaign identity, and producer identity; quarantine malformed or implausible timestamps.
2. Assign a stable event ID and deduplicate within a documented scope while accounting for retries and replay.
3. Partition the stream by the aggregation key, such as campaign and time window, while considering skew from a single very popular campaign.
4. Choose a watermark strategy based on observed out-of-order delay and source behavior. A watermark that advances too slowly delays results and retains state; one that advances aggressively yields faster but more incomplete results.
5. Emit provisional or updated aggregates with an idempotent result key/version so downstream stores can apply corrections safely.
6. Track watermark lag, late-event counts, duplicate rates, window-state size, processing backlog, and reconciliation differences against source records.

If sources are idle or one partition lags far behind, downstream event-time progress can stall because operators may wait on the slowest input. The system should monitor watermark progress and configure idleness handling only with an understanding of the possibility that supposedly idle partitions later resume with older events.

## Common mistakes

- Calling a window “complete” because wall-clock time passed while ignoring the watermark and allowed-lateness policy.
- Treating a watermark as proof that no older event can ever arrive.
- Choosing allowed lateness without balancing reporting delay, correction needs, retained state, and storage cost.
- Dropping late data silently even though advertiser billing or audit requirements require correction.
- Counting each delivery as a distinct click, or deduplicating across an overly broad key that merges legitimate clicks.
- Trusting client timestamps without clock-skew, replay, tampering, timezone, and validation policies.
- Assuming exactly-once stream processing by itself prevents duplicate business events from producers or external side effects.
- Ignoring hot keys, source-partition skew, idle partitions, and replay behavior when estimating throughput and state size.

## Knowledge checks with answers

1. **An event arrives after its event-time window fired. Is it necessarily lost?** No. If the operator retains state under its allowed-lateness policy, it may update the result; after that policy expires, it may be dropped or handled through a late-data route. Behavior depends on the operator and configuration.
2. **Why can a slow input partition delay otherwise current windows?** Event-time progress is derived from watermarks; downstream progress can be bounded by the slowest active upstream input.
3. **Should a click timestamp alone identify a click?** No. Multiple valid clicks can share a timestamp, and retries can replay one click; use a stable event identity plus an explicit deduplication policy.
4. **How can a dashboard be fast while preserving later corrections?** Publish provisional aggregates and apply idempotent updates when late events arrive, while stating a separate cutoff/finality policy for any settlement use.

## Review status

The event-time, watermark, and lateness distinctions are checked against Apache Flink documentation. Exact API behavior must be verified for the deployed Flink version and window operator. This lesson remains pending complete claim-by-claim audit and manifest omission check.
