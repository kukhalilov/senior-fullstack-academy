# end-to-end system design case studies — Problem: Design a photo-sharing service

Sources: [HLD Handbook photo-sharing case](https://hld.handbook.academy/curriculum/case-studies/), [CloudFront cache invalidation and versioning](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html), [CloudFront Origin Shield](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/origin-shield.html), [Netflix Open Connect](https://openconnect.netflix.com/en/).

## Goals

Practice upload workflow, media derivatives, object storage, CDN, and feed integration; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design photo upload and viewing for a social application with multiple resolutions, private accounts, and a feed.

**Worked design.** Upload directly or through a bounded API using short-lived authorized upload credentials, then verify object completion and metadata. Store immutable originals and generate derivatives asynchronously with idempotent jobs. Keep privacy and ownership in authoritative metadata; CDN cache keys and purge behavior must respect visibility changes. The feed references media IDs rather than copying bytes. Use responsive formats and image dimensions for clients. A CDN edge cache and optional origin-shield tier reduce eligible repeated origin requests; at a different scale, some content providers negotiate ISP-local caches or peering, as Netflix documents for Open Connect. These operate at different layers and require provider-specific design. Monitor upload completion, derivative backlog, origin and cache-tier errors, CDN hit rate, stale/private-object denials, and cost.

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

Upload directly or through a bounded API using short-lived authorized upload credentials, then verify object completion and metadata. Store immutable originals and generate derivatives asynchronously with idempotent jobs. Keep privacy and ownership in authoritative metadata; CDN cache keys and purge behavior must respect visibility changes. The feed references media IDs rather than copying bytes. Use responsive formats and image dimensions for clients. Monitor upload completion, transcode backlog, origin load, CDN hit rate, and access denials.

## Tests and edge cases

Test partial multipart upload, duplicate transcode event, private-to-public transition, CDN stale access, and corrupt media.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?
