# end-to-end system design case studies — Problem: Design a large subscription video platform

Sources: [HLD Handbook Netflix case](https://hld.handbook.academy/curriculum/case-studies/), [Netflix Open Connect](https://openconnect.netflix.com/en/), [Netflix Open Connect overview](https://openconnect.netflix.com/Open-Connect-Overview.pdf), [AWS streaming delivery guidance](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/on-demand-streaming-video.html), [Netflix video encoding engineering](https://netflixtechblog.com/optimized-shot-based-encodes-now-streaming-4b9464204830).

## Goals

Practice content delivery, personalization, resilience, and multi-service operations; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a global subscription streaming experience from catalog browsing through playback and recommendations.

**Worked design.** Treat the exact Netflix implementation as a public case study, not a template that can be inferred from product names. Separate account/entitlement, catalog/discovery, playback authorization and steering, media encoding/packaging, client playback, recommendations, and delivery operations. Keep entitlement authoritative and evaluate it before returning playback URLs. Use client/device capabilities and network conditions to choose supported media files and a suitable delivery path.

Netflix describes Open Connect as part of its delivery network: purpose-built appliances cache playable media, embedded appliances and IXP/private peering localize traffic with ISP partners, and a control plane steers clients based on file availability, health, and network proximity. Its public overview describes proactive fills as well as delivery on request. A generic service can instead use one or more commercial CDNs, a pull cache, origin shielding, multi-CDN steering, or negotiated ISP arrangements; these have different cost, control, and operational requirements. Do not infer that Open Connect appliances or Netflix’s topology are available to another company.

Encode and package device-compatible renditions in HLS, DASH, or compatible CMAF workflows after testing codec, DRM, and player support. For high-value catalog video, content-aware/per-title encoding may improve quality or bitrate efficiency but increases analysis/encoding complexity and must be measured. Keep media objects cacheable and immutable where possible; handle changing manifests and authorization separately. Degrade recommendations, artwork, and nonessential browse features before blocking a valid playback session. Set service objectives for authorization, startup, playback continuity, and recovery; exercise CDN, region, control-plane, and origin failures. Correlate client startup/rebuffer/rendition telemetry with playback decisions, encoding, manifest, and CDN traces.

## Exercises

1. Write the top functional requirements and the quality objective that most changes the architecture.
2. Estimate demand, storage growth, and the likely hot key or constrained resource. State assumptions.
3. Define authoritative data, identifiers, API behavior, and transaction boundary.
4. Trace a write and a read, including a timeout or duplicate request.
5. Describe one scaling change and its consistency, cost, and operational tradeoffs.

## Progressive hints

Start with the invariant and user-visible outcome. Separate write and read paths. Identify a simpler baseline before adding distributed components. Make one failure case concrete.

## Complete solutions

1. Prioritize user-visible correctness and measurable latency, availability, freshness, durability, or cost for the relevant path.
2. Use ranges for traffic and growth. Identify skew and fan-out rather than assuming uniform keys. Validate the sensitive estimate with a representative benchmark.
3. Name one authoritative owner for each critical fact. Specify idempotency and compatibility when callers may retry or remain old.
4. Treat missing acknowledgements as unknown outcomes. Retry only with idempotency or verify state; make asynchronous effects deduplicable.
5. Add replication, caching, partitioning, or queueing only to meet a stated need; explain the operations burden and recovery plan.

### Case-specific design answer

Keep entitlement and account state authoritative; isolate catalog, playback orchestration, and recommendation workloads. Video bytes are pre-positioned or cached near viewers, with origin shielding and measured regional capacity. Encode content into multiple formats and select delivery based on device/network. Degrade recommendations and artwork before blocking playback. Use explicit service objectives, bulkheads, and tested regional recovery; do not assume service decomposition guarantees resilience. Observe playback startup/rebuffer metrics at the client and correlate with server/CDN traces.

## Tests and edge cases

Test regional CDN loss, stale entitlement, recommendation outage, popular release surge, and mixed-version deployment.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?
