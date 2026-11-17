# end-to-end system design case studies — Problem: Design a video-streaming platform

Sources: [HLD Handbook video-streaming case](https://hld.handbook.academy/curriculum/case-studies/), [AWS video streaming guidance](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/on-demand-streaming-video.html), [AWS VOD workflow architecture](https://docs.aws.amazon.com/solutions/latest/video-on-demand-on-aws/architecture-details.html), [Netflix Open Connect](https://openconnect.netflix.com/en/), [Netflix video encoding engineering](https://netflixtechblog.com/optimized-shot-based-encodes-now-streaming-4b9464204830).

## Goals

Practice ingest, transcoding, adaptive playback, CDN delivery, and entitlement; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design user video upload and playback across devices and variable network quality.

**Worked design.** Separate video-on-demand (VOD) from live workflows because their ingest, timing, packaging, and freshness constraints differ. For VOD, issue a resumable or multipart upload into private object storage, verify completion and media metadata, scan/validate the source, then enqueue a durable, idempotent workflow. Preserve the original and create device-compatible output renditions, audio/subtitle tracks, thumbnails, and manifests. Encoding ladders should be selected from the device matrix, content complexity, quality target, storage, and delivery bandwidth; per-title or content-aware encoding is an optimization to measure, not a required architecture.

Keep job state and catalog metadata separate from large media objects. Make each workflow stage retryable, observable, and resumable; deduplicate duplicate storage events and publish outputs only after all required renditions and manifests validate. Failed jobs should expose status and a safe retry or operator path rather than publishing partial manifests.

Package outputs as HLS, MPEG-DASH, or a compatible CMAF workflow according to tested player support. A manifest points to addressable media segments; it does not contain the media. Deliver immutable media through a CDN with carefully scoped cache keys and versioned URLs. Use origin shielding when cache misses or just-in-time packaging justify it. At very large scale, provider-specific ISP cache or peering programs such as Netflix Open Connect are an alternative delivery topology, not a generic CDN feature. Keep entitlement and playback authorization in the control path; use signed URLs/cookies or DRM where required, and prevent public object-store access. The client adapts among supported renditions and reports playback QoE.

For live video, use a live ingest/contribution path, real-time encoding, packaging, manifest/segment publication, and a CDN or provider distribution network. Coordinate encoder timestamps, segment/part availability, manifest refresh, cache behavior, and player buffering. Low latency requires support across the whole chain; shortening segments alone is insufficient. Live and VOD can share some storage, packaging, and playback components, but should not be forced into identical workflow assumptions.

Measure upload completion, validation failures, queue age, transcode duration/failure, publish delay, origin and CDN tier errors, startup time, rebuffer ratio, live-edge distance, rendition switches, authorization failures, and cost per stored or viewed minute. Preserve correlation from upload/job ID through package, manifest, CDN request, and client playback telemetry.

## Exercises

1. Write the top functional requirements and the quality objective that most changes the architecture.
2. Estimate demand, storage growth, and the likely hot key or constrained resource. State assumptions.
3. Define authoritative data, identifiers, API behavior, and transaction boundary.
4. Trace a write and a read, including a timeout or duplicate request.
5. Describe one scaling change and its consistency, cost, and operational tradeoffs.

## Progressive hints

Start with the invariant and user-visible outcome. Separate write and read paths. Identify a simpler baseline before adding distributed components. Make one failure case concrete.

## Complete solutions

1. Prioritize user-visible correctness and measurable latency, availability, freshness, durability, or cost for the relevant path. For VOD that includes a valid completed package before publication; for live video it includes an explicit end-to-end live latency and rebuffer objective.
2. Use ranges for traffic and growth. Identify skew and fan-out rather than assuming uniform keys. Validate the sensitive estimate with a representative benchmark.
3. Name one authoritative owner for each critical fact. Specify idempotency and compatibility when callers may retry or remain old.
4. Treat missing acknowledgements as unknown outcomes. Retry only with idempotency or verify state; make asynchronous effects deduplicable.
5. Add replication, caching, partitioning, or queueing only to meet a stated need; explain the operations burden and recovery plan.

### Case-specific design answer

Accept resumable uploads into object storage, validate media, and enqueue idempotent transcode jobs to create bitrate/resolution renditions and manifests. Keep media processing separate from metadata and entitlement. Deliver segments through a CDN with origin protection; playback selects a rendition based on player/network conditions. Live video adds ingest latency, packaging, and regional routing constraints. Signed access and DRM requirements affect cache design. Measure time-to-first-frame, rebuffering, transcode backlog, origin errors, and cost per viewing hour.

## Tests and edge cases

Test interrupted or duplicated upload, malformed media, transcode retry and poison input, partial output publication, manifest pointing to an unavailable segment, cache-key authorization leak, entitlement revocation, CDN/origin miss storm, regional cache loss, stale live manifest, clock skew, and poor-network adaptation.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?
