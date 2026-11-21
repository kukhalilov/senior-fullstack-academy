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

1. **Specify the contract.** From this case — Design user video upload and playback across devices and variable network quality. — write three must-have behaviors, one explicit non-goal, and the invariant that must remain true under concurrency.
2. **Model demand.** Estimate average, peak, and burst requests; identify the work that scales with ingest, transcoding, adaptive playback, CDN delivery, and entitlement. State units and unknowns, and choose one production measurement that would revise your estimate.
3. **Trace ownership and API.** Name the authoritative record, its stable identifier, the read path, and the write/acceptance path. State where authorization and idempotency are checked and which derived data may be stale.
4. **Resolve a failure.** Analyze this case-specific drill: A regional media path degrades during a peak. Describe what stays available, how the client detects and recovers, what old events are discarded, and how you prevent overload from cascading. Identify the state before/after, retry rule, user-visible result, and recovery signal.
5. **Defend a trade-off.** Compare a simple baseline with one scaling mechanism relevant to ingest, transcoding, adaptive playback, CDN delivery, and entitlement. Give the quality metric, latency/cost metric, and failure mode that decide whether to keep the mechanism.

## Progressive hints

Start with the user promise and the invariant, not a vendor diagram. Sketch the smallest correct read/write flow. Put timestamps and operation IDs on the path. Separate authoritative state from cache, index, notification, or analytics. Use the named failure drill to test retry and recovery. Add a scale mechanism only after identifying the bottleneck.

## Complete solutions

1. The contract should make the case-specific promise observable and name one invariant. For Design a video-streaming platform, write a distinct browse/read promise and a command/write promise; define which actor is authorized and what happens when the invariant cannot be confirmed.
2. Estimate the busiest interval and skew, not just a daily average. For the supplied patterns (ingest, transcoding, adaptive playback, CDN delivery, and entitlement), account for the dominant fan-out, payload, active-state, or storage multiplier. Keep the estimate as a range and validate it with representative traffic or a replay.
3. Keep one authoritative owner for the critical fact. Use stable IDs and explicit request/response semantics. Authenticate first, authorize at the data/action boundary, record durable acceptance before claiming completion, and mark caches or projections with their freshness/rebuild policy.
4. For the drill, a timeout means outcome unknown. Query durable operation state or retry with the same idempotency identity; never issue a second unguarded effect. Bound retries, expose pending/unknown status, alert on age/backlog, and reconcile external or derived state after recovery.
5. Keep the baseline until measurements show it misses the stated SLO. A cache, queue, partition, fan-out, replica, or specialized index earns its cost only if the chosen measure improves without breaking the invariant, privacy, or recovery contract. Use a rollback/disable path and monitor tail latency, errors, saturation, and the case-specific quality signal.
### Case-specific design answer

Accept resumable uploads into object storage, validate media, and enqueue idempotent transcode jobs to create bitrate/resolution renditions and manifests. Keep media processing separate from metadata and entitlement. Deliver segments through a CDN with origin protection; playback selects a rendition based on player/network conditions. Live video adds ingest latency, packaging, and regional routing constraints. Signed access and DRM requirements affect cache design. Measure time-to-first-frame, rebuffering, transcode backlog, origin errors, and cost per viewing hour.

## Tests and edge cases

Test interrupted or duplicated upload, malformed media, transcode retry and poison input, partial output publication, manifest pointing to an unavailable segment, cache-key authorization leak, entitlement revocation, CDN/origin miss storm, regional cache loss, stale live manifest, clock skew, and poor-network adaptation.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?
