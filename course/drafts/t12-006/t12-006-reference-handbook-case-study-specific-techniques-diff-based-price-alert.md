# end-to-end system design case studies — Reference: Diff-based price alert

Sources: [HLD Handbook](https://hld.handbook.academy/), [PostgreSQL range types](https://www.postgresql.org/docs/current/rangetypes.html), [RFC 3339: Date and Time on the Internet](https://www.rfc-editor.org/rfc/rfc3339.html), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html), [Transactional outbox pattern](https://microservices.io/patterns/data/transactional-outbox.html).

## Scope and version

This case study designs alerts when an observed product price changes enough to matter to a subscriber. “Price” is domain-dependent: currency, taxes, shipping, item variant, seller, availability, and promotion conditions may change the meaning. PostgreSQL range types and HTTP date/representation semantics are supporting implementation examples, not a complete price-tracking specification.

## How this group fits the mental model

The core job is to transform noisy observations into a trustworthy state change and then notify each subscriber once per meaningful transition. Keep raw observations, normalized comparable prices, alert rules, and notification delivery state distinct. A poller may observe a temporary scrape error or a product page variant; that is not automatically a real price drop.

The system has two independent correctness questions: did the item’s comparable price cross the user’s threshold, and did the notification reach the intended channel? Use durable state transitions and an outbox/queue pattern so retries do not lose alerts or send uncontrolled duplicates.

## Supplied names explained

- **Observation:** source, item/variant, seller, observed time, listed amount, currency, availability, and raw/source version.
- **Normalization:** convert observed data into comparable fields with explicit currency, unit, tax/shipping, and variant rules. Do not compare unlike quantities or currencies without a defined conversion policy.
- **Baseline:** prior valid observation used for comparison; retain its source/time and quality status.
- **Threshold rule:** absolute or percentage change, target price, direction, and optional conditions such as in-stock status or seller/variant.
- **Debounce/hysteresis:** suppress alerts for transient oscillations or require a meaningful threshold to be crossed and then re-crossed before another alert.
- **Idempotent alert event:** stable identity for one rule/item/state transition, preventing duplicate notification jobs when processing retries.
- **Notification outbox:** durable record written with the alert-state transition and dispatched asynchronously; delivery attempts/status are tracked separately from whether the price condition occurred.

## Cross-item comparison

| Comparison rule | Example | What to make explicit |
| --- | --- | --- |
| Absolute threshold | Alert when comparable price is at or below 80 currency units | Currency, taxes/shipping, item identity, and whether equality triggers |
| Percentage change | Alert when price falls at least 10% from baseline | Baseline selection, rounding, observation quality, and whether multiple small changes accumulate |
| Range/target band | Alert when price enters a user-defined interval | Inclusive/exclusive boundaries, currency, validity period, and range updates |
| Hysteresis/cooldown | Alert on downward crossing, then do not repeat until price recovers/re-crosses or cooldown ends | Avoids notification spam; must still surface meaningful repeated events and respect user settings |

## Examples

A product is observed at 100 USD, then 92 USD, then 100 USD, then 91 USD. A 10% drop rule from a fixed reference price does not trigger for either lower observation; a rolling previous-observation rule might produce different behavior. A target-price rule at 90 USD does not trigger until the comparable price reaches 90 USD or lower. Define the reference policy in the UI so the user understands what is being compared.

When a valid observation crosses the rule, atomically record the transition and an alert-event ID. A worker sends email/push and retries transient failures with bounded backoff; it records provider delivery outcomes. If the process crashes after sending but before marking success, downstream delivery may duplicate unless the provider supports idempotency or the message uses a stable deduplication key. Do not claim exactly-once delivery unless the full channel contract supports it; otherwise make duplicate behavior harmless and observable.

Keep invalid/unavailable observations out of price comparisons; track stale-data age and alert users when monitoring is paused or source data is no longer reliable. Respect notification preferences, unsubscribe/quiet-hour settings, rate limits, and personal-data retention.

## Common mistakes

- Comparing one seller/variant’s price with another or ignoring currency, unit, tax, shipping, or availability.
- Triggering on one malformed scrape or temporary source error.
- Using an undocumented moving baseline so users cannot explain why an alert fired.
- Sending an alert on every small fluctuation, creating spam and user distrust.
- Deduplicating solely by item and subscriber so a legitimate later price re-crossing is suppressed forever.
- Recording the price change and enqueuing notification in separate failure-prone writes with no outbox/reconciliation.
- Assuming delivery is exactly once after a worker crash or provider timeout.
- Reporting a stale observation as a current price without its observation time.
- Ignoring seller/item identity changes, deleted products, and source policy/rate limits.

## Knowledge checks with answers

1. **Why does baseline choice matter?** Fixed reference, rolling previous price, and minimum-ever price produce different alert outcomes even for the same observations.
2. **A scrape returns no price. Should the system treat that as zero?** No. Mark the observation invalid/unavailable and avoid a false threshold crossing.
3. **How can a notification worker avoid duplicate logical alerts?** Give each threshold-crossing transition a stable event ID and use idempotent processing/provider support where available.
4. **What should a user see when the source data is stale?** The last observation time and a clear stale/unavailable status rather than an unqualified current-price claim.

## Review status

Reviewed 2026-11-21. PostgreSQL range documentation was checked for inclusive/exclusive price bands; RFC 3339 for timestamp representation; RFC 9110 for HTTP representation semantics; and the transactional outbox pattern for atomic event recording with at-least-once relay and consumer deduplication. The lesson explicitly separates observed price validity, normalization, baseline policy, threshold crossing, alert identity, and channel delivery. No material omissions remain in the supplied topic scope.
