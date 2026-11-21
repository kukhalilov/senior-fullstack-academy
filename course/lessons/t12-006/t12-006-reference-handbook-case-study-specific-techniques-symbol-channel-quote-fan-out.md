# end-to-end system design case studies — Reference: Symbol-channel quote fan-out

Sources: [HLD Handbook](https://hld.handbook.academy/), [CME Group MDP 3.0 market data overview](https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457219613/CME+MDP+3.0+Market+Data), [CME MDP 3.0 recovery services](https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457325847/MDP+3.0+-+Recovery+Services+for+UDP), [CME MDP 3.0 channel reset](https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457326922/MDP+3.0+-+Channel+Reset), [FIX market data guidance](https://fixtrading.org/guidelines/data-transparency/), [Apache Kafka design and delivery semantics](https://kafka.apache.org/41/design/design/).

## Scope and version

This case study designs a low-latency quote distribution system that ingests market-data updates and fans them out to authorized subscribers by instrument (symbol) and channel. CME MDP 3.0 and FIX are concrete protocol examples; venue-specific sequencing, recovery, entitlements, and licensing rules are authoritative for each feed. CME materials and Kafka 4.1 docs were checked on 2026-11-21. This is a system-design lesson, not trading, market-data licensing, or exchange connectivity advice.

## How this group fits the mental model

The source feed is the authoritative stream; a book builder applies ordered updates to create current state; a fan-out service distributes either every event or a snapshot/delta view to subscribers. Correctness comes before delivery speed: after a sequence gap, the affected book may be invalid until recovered. A quote service must surface validity and freshness rather than silently publish a plausible but stale book.

Partitioning by symbol/channel makes parallel processing possible, but a hot symbol can attract far more updates and subscribers than the average. Fan-out is also asymmetric: ingestion may be manageable while one popular instrument requires replication to millions of downstream connections. Separate feed decoding, state building, entitlement checks, subscription management, and network delivery so that backpressure in one stage is visible.

## Supplied names explained

- **Instrument/symbol:** venue-defined identifier for a tradable instrument; symbol aliases, contract month, venue, currency, and security ID may be needed to avoid collisions.
- **Market-data channel:** feed partition or venue-defined stream with a sequence/recovery scope. Do not assume per-symbol sequence order when the feed defines packet/channel sequence or has multiple independent feeds.
- **Incremental update:** event changing one or more book entries or market statistics. Apply actions in source order and preserve venue message semantics; one packet may carry updates for multiple instruments.
- **Snapshot/full refresh:** state representation used to initialize or recover a book. A snapshot must be reconciled to its sequence boundary with queued incremental updates before declaring the book current.
- **Book builder:** stateful processor maintaining bids/offers, trades, and instrument status from feed updates. Its output should include sequence, source timestamp, receive time, and a valid/recovering/stale state.
- **Sequence gap and recovery:** missing sequence indicates state may be incomplete. Stop claiming current data for the affected scope, buffer/recover according to feed contract, reconcile snapshot and incrementals, and resume only after the required updates are applied.
- **Symbol/channel partitioning:** maps instruments or feed channels to ordered processing lanes. It provides parallelism across partitions; a single hot lane may still bottleneck.
- **Fan-out:** sends quote events or snapshots from a publisher to subscribers. Techniques include per-subscriber queues, multicast where supported, broker topics, hierarchical relays, and latest-value coalescing for consumers that do not need every tick.
- **Entitlement:** authorization to receive a particular venue/product/feed under commercial and access policy. Enforce before data leaves the trusted boundary; cache grants with explicit expiry/revocation behavior.
- **Backpressure and conflation:** slow consumers can accumulate queues. For display clients, coalesce superseded quote updates or disconnect/resync; for audit/trading consumers, dropping or conflating may be unacceptable and must follow contract.
- **Delivery semantics:** downstream transport can duplicate, delay, or drop events. Use sequence/version and deduplication; distinguish event delivery from a current-state snapshot API.

## Architecture and update flow

1. **Ingest primary and redundant feeds.** Receive both redundant sources where the venue recommends them. Decode packets, validate checksums/schema, record packet and per-instrument sequence data, and merge redundant copies by the provider's documented policy.
2. **Detect gaps and corruption.** Track the correct sequence scope. A gap, channel reset, malformed update, or recovery event invalidates the relevant book; mark it recovering and alert downstream consumers rather than publishing stale state as current.
3. **Build books in order.** Partition ordered updates by channel or instrument according to source guarantees. Apply each message's operations atomically where required, publish a state version, and keep source event time distinct from local receive/processing time.
4. **Recover state.** Use feed A/B redundancy, replay/TCP recovery, or market recovery snapshots as offered. Buffer concurrent incrementals, reconcile snapshot boundary against sequence/timestamp, apply only the correct subsequent updates, and verify the venue-required completion condition before restoring valid status.
5. **Publish internal topics.** Emit either ordered deltas or versioned snapshots keyed by instrument/channel. A durable broker can decouple consumers, but its ordering is typically partition-scoped; choose partition keys so same-scope updates preserve order and plan for hot-key limits.
6. **Authorize subscriptions.** Authenticate clients, verify venue entitlements for requested products, and avoid logging or exposing restricted data. A browser or client-supplied symbol list is not proof of entitlement.
7. **Fan out with bounded queues.** Maintain subscriptions and per-client/network budgets. For clients needing display state, coalesce superseded updates and send a recovery snapshot on resubscribe; for clients needing every update, use a delivery path with explicit persistence and gap detection.
8. **Scale hot symbols.** Replicate immutable current state or ordered events to regional fan-out workers, use hierarchical relays, and distribute subscriber groups. Preserve source sequence and validity metadata; do not create multiple independent writers for one book.
9. **Monitor and reconcile.** Track feed age, sequence gaps, recovery duration, book validity, per-symbol update rate/subscriber count, queue depth, dropped/coalesced updates, client latency, and entitlement failures. Reconcile state hashes or snapshots with the source when the feed supports it.

## Cross-item comparison

| Fan-out design | Strength | Limitation |
| --- | --- | --- |
| Direct source-to-client connections | Low intermediary latency and simple path | Large connection count, duplicated upstream work, difficult entitlements and client recovery |
| Broker topic per channel/symbol | Decouples publishers and consumers; ordered partition possible | Partition/key hot spots, consumer lag, broker hop and operational dependency |
| Hierarchical regional relays | Local distribution and controlled subscriber fan-out | Extra hops, state replication, sequence preservation, and regional recovery complexity |
| Latest-value coalescing | Keeps display clients current under bursts with bounded queues | Intermediate ticks are intentionally discarded; unsuitable where every event is contractually required |
| Durable event log plus snapshots | Replay, recovery, and audit for authorized consumers | Storage/retention cost and replay lag; does not make stale consumers current automatically |

## Examples

### Popular symbol spike

An earnings release causes one symbol's update rate and subscribers to surge. One ordered book builder remains authoritative; its versioned updates are replicated to several fan-out workers. Display clients receive the newest quote and may skip superseded intermediate values, while regulated or trading consumers use a separate loss-detecting stream. Alert when lag or fan-out queues exceed budget and prevent one symbol from starving other channels.

### Packet sequence gap

The consumer expects packet 500 and receives 502. It marks the affected channel/book invalid, buffers eligible later updates, and starts the provider's recovery flow. A snapshot's last-sequence marker is compared with the queued incremental feed; apply only the correct post-snapshot updates. Resume publication as valid only when the feed's recovery contract is satisfied. CME MDP 3.0 documents redundant UDP feeds and market recovery options; exact steps are specific to that service.

### Slow mobile client

A mobile client cannot read updates as fast as they arrive. If the client only renders the current best bid/ask, coalesce to the latest state and report that it skipped intermediate events. If the client requires every trade/tick, disconnect or move it to a bounded durable stream and force replay from a known sequence; do not let an unbounded socket buffer exhaust the fan-out worker.

## Common mistakes

- Treating an instrument's book as valid after a sequence gap without recovery.
- Confusing packet/channel sequence with per-instrument sequence or relying on a global order the feed does not promise.
- Assuming Kafka topic ordering extends across partitions or independent channels.
- Using conflation for consumers contractually requiring every update.
- Allowing one hot symbol to monopolize shared queues, CPU, or broker partitions.
- Publishing stale snapshots without source timestamp, sequence, and validity status.
- Performing entitlement checks only at the client or only when the subscription is first created.
- Merging redundant feeds without following venue-specific duplicate and sequence rules.
- Treating a broker acknowledgment as proof the downstream client applied the quote.
- Ignoring market-data license, redistribution, and retention constraints.

## Knowledge checks with answers

1. **What should happen after a sequence gap?** Mark affected state invalid, recover against the feed's sequence/snapshot semantics, and resume only after reconciliation.
2. **Can one symbol be processed in parallel by independent writers?** Not safely unless a defined sequencing/merge protocol preserves its book semantics; typically keep one authoritative ordered state owner and parallelize fan-out.
3. **When is conflation acceptable?** When the consumer's contract needs latest state rather than every event; expose dropped/intermediate-update semantics explicitly.
4. **Why keep entitlement checks server-side?** Market-data access is licensed and client inputs are untrusted; authorize every subscription/data path under the applicable policy.
5. **What does partitioning buy and cost?** Parallelism and bounded ordering scope, but hot keys remain a bottleneck and cross-partition global order is not implied.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder material with a complete quote ingestion, book recovery, entitlement, and fan-out design. CME MDP docs confirm redundant feeds, sequence-gap detection, recovery services, and channel reset behavior; FIX describes snapshot and incremental market-data structures; Kafka docs bound ordering/transaction guarantees to partitions and supported scope. No material omissions remain in the supplied topic scope.
