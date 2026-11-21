# end-to-end system design case studies — Reference: Traffic-heavy, realtime, and discovery cases

Sources: [HLD Handbook case studies](https://hld.handbook.academy/curriculum/case-studies/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110), [RFC 9309 Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309), [RFC 8216 HTTP Live Streaming](https://www.rfc-editor.org/rfc/rfc8216), [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html).

## Scope and version

The eight supplied cases have different hot paths: lookup, durable message delivery, fan-out, geo-matching, prefix retrieval, media delivery, or telemetry ingestion. The design goal is to make the dominant path fast and bounded without weakening the operation’s correctness or safety contract. Protocol specifications define interoperable behavior; provider implementations still differ.

## How this group fits the mental model

Ask what grows with traffic: key reads, recipients per write, active connections, candidate count, media bytes, or samples per time window. Model per-user and per-tenant skew instead of relying only on average rates. Then separate the request’s critical path from background materialization and identify which result may be stale.

## Supplied names explained

- **URL shortener** — Write path validates destination and abuse policy, allocates a collision-safe short code, and stores mapping. Redirect path is read-heavy and can use a cache/CDN where status and freshness permit. Treat 301/302/307 semantics deliberately: permanent caching can make destination changes difficult. Protect preview/crawler behavior and prevent the service from becoming an open redirect or malware link host.
- **Paste service** — Stores text under an unguessable or access-controlled identifier with size limits, expiry, and abuse controls. Separate content from metadata and deletion state; cache only if expiration and privacy rules are preserved. Public paste content can contain secrets or malicious markup, so encode output and provide reporting/takedown.
- **Chat system** — Persist message identity, conversation membership, sender authorization, and ordering scope before acknowledging durable send. WebSocket or another push channel reduces delivery delay but is not the durable source of history. Support offline cursor sync, deduplication, read receipts as separate state, fan-out limits, and backpressure for hot group conversations.
- **Social feed** — Fan-out-on-write precomputes recipient timelines and makes reads cheap but makes high-follower writes expensive. Fan-out-on-read shifts work to reads and helps celebrity accounts. Hybrid strategies, ranking, mute/block/privacy filters, and deletion propagation affect correctness; cache entries must not bypass current visibility rules.
- **Ride-hailing dispatch** — Maintain fresh driver/rider locations with timestamps and bounded staleness; use spatial cells to find candidates, then apply eligibility, capacity, ETA, and policy. Matching is a time-bounded optimization under changing supply, not a static nearest-neighbor query. Make reservation/acceptance atomic enough to prevent one driver accepting conflicting rides; handle stale location and duplicate offers.
- **Search autocomplete** — Prefix/trie/FST or indexed retrieval yields candidates, then ranking uses popularity, recency, locale, and context. Debounce and cancel obsolete requests in the client; server should enforce query length/rate, cache with locale/version keys, and avoid returning unsafe or private suggestions. Keep index refresh and typo behavior measurable.
- **Video streaming platform** — Ingest/upload validates and stores source media, transcode creates renditions, packaging emits segments/manifests, and CDN delivery serves authorized compatible bitrate. HLS and DASH are adaptive streaming approaches; player and CDN behavior must be measured under real networks. Preserve entitlement, signed URL/token, content lifecycle, and origin shielding; playback QoE is more than CDN hit ratio.
- **Metrics ingestion platform** — Accepts timestamped samples/events with tenant quotas and backpressure. High-cardinality labels multiply series and memory; validate label dimensions, aggregate/downsample according to retention policy, and separate write ingestion from analytical query. Track dropped samples, ingest lag, cardinality, and query cost; never silently change metric meaning during aggregation.

## Cross-item comparison

| Workload | Scaling pressure | Typical split | Correctness that remains critical |
|---|---|---|---|
| Short URL/paste | Read/write skew and hot keys | Write validation, durable mapping, cacheable read | Code uniqueness, authorization, expiry |
| Chat/feed | Recipients and persistent connection count | Durable event/history plus fan-out and push | Membership, ordering scope, privacy |
| Ride dispatch | Fresh geo state and matching deadline | Spatial candidate retrieval plus reservation | Eligibility, single acceptance, stale data |
| Autocomplete | High QPS and small response deadline | Edge cache plus compact index and ranker | Current policy, privacy, relevance |
| Video | Egress bandwidth and rendition mix | Origin/object storage, packaging, CDN | Entitlement, integrity, playback continuity |
| Metrics | Ingest volume and cardinality | Queue/partitioned ingest, storage, rollups | Timestamp/label semantics, tenant isolation |

## Examples

**Celebrity feed.** Ordinary accounts can use write fan-out into follower timelines. For a celebrity, do not enqueue millions of writes synchronously. Store a celebrity post once and merge it into a feed read or use bounded asynchronous fan-out. The read path merges ordinary timeline items with celebrity posts, ranks them, and rechecks block/mute/privacy policy. Monitor fan-out lag and read amplification.

**Video event spike.** A live event creates a sudden segment request burst. CDN cache and regional origin shielding reduce duplicate origin fetches, but cache misses can still stampede. Pre-position known content where possible, protect origin with concurrency limits, and monitor startup delay, rebuffering, bitrate, and segment errors by geography/device. Entitlement checks must not be skipped just because bytes are cacheable.

**Dispatch surge.** A concert ends and many riders request trips. The system bounds offer fan-out and uses recent driver positions to generate local candidates. It applies eligibility and an atomic accept transition. If no qualified driver exists before the deadline, report that honestly rather than returning a stale candidate as confirmed.

## Common mistakes

- Using a global average to size a workload with celebrities, hot keys, or events.
- Making WebSocket delivery the only copy of a chat message.
- Applying feed cache before visibility/block filters without partitioning keys correctly.
- Treating nearest driver as an assignment without an atomic acceptance path.
- Building autocomplete suggestions from unrestricted/private query logs.
- Optimizing video cache hit ratio while ignoring playback QoE and origin saturation on misses.
- Accepting arbitrary metric labels and discovering cardinality failure after ingestion.
- Downsampling without defining how it changes alert and query semantics.

## Knowledge checks with answers

1. **When does fan-out-on-read help?** When write fan-out is too costly for highly followed publishers and read-side merge cost is acceptable.
2. **What is durable chat state?** Persisted, authorized message history with stable IDs and defined ordering; push is a delivery optimization.
3. **Why use recent location timestamps?** Spatial proximity from stale coordinates may select unavailable or unsafe candidates.
4. **What does adaptive bitrate streaming adapt to?** The player selects among encoded renditions based on manifest and observed network/buffer conditions; it does not guarantee uninterrupted playback.
5. **What makes telemetry cardinality dangerous?** Every unique label combination can create a separate time series and storage/index cost.
