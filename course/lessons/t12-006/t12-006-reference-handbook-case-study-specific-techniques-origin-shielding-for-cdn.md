# end-to-end system design case studies — Reference: Origin shielding for CDN

Sources: [HLD Handbook case studies](https://hld.handbook.academy/curriculum/case-studies/), [Amazon CloudFront Origin Shield](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/origin-shield.html), [CloudFront cache invalidation and versioning](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html), [CloudFront cache-key guidance](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/understanding-the-cache-key.html).

## Scope and version

This lesson explains the cache-hierarchy pattern and uses CloudFront Origin Shield as a vendor example. Other CDNs use different names, routing rules, cache-key controls, pricing, and failure behavior; verify the selected CDN's current documentation.

## How this group fits the mental model

An origin shield is an additional shared cache layer between distributed CDN cache locations and an origin. When multiple edge or regional caches miss on the same cacheable object, they can converge on the shield instead of independently reaching the origin. The shield may serve a hit or consolidate simultaneous misses, reducing duplicate origin fetches and protecting expensive origin work such as live packaging or image transformation.

The shield is an optimization layer, not the source of truth and not a guarantee that the origin receives only one request under every condition. The result depends on cache key, request method, TTL, object popularity, regional routing, request collapsing behavior, and cacheability. In CloudFront, requests from a regional edge cache in the same Region as the selected Origin Shield can bypass that layer; gRPC requests also do not use Origin Shield.

## Supplied names explained

- `Origin shielding for CDN` — A shared mid-tier cache that aggregates misses from downstream cache locations before forwarding eligible requests toward the origin.

## Cache correctness and operations

### Cache key

The cache key identifies which requests may safely share a stored response. Include every representation-changing dimension that matters, such as normalized path, selected query parameters, language, content encoding, or a bounded personalization segment. Excluding a dimension can serve the wrong variant or tenant's content; including irrelevant high-cardinality values fragments the cache and reduces hit rate. Do not assume an origin shield fixes a bad cache key.

### Freshness and invalidation

Choose TTL and revalidation behavior based on how quickly content changes and how stale a response may be. Versioned immutable assets are easier to cache safely than mutable URLs. For mutable content, design purge/invalidation propagation, stale-on-error behavior, and origin revalidation. Purging one cache tier does not automatically prove every browser, intermediary, or CDN cache has discarded an older copy; verify the provider's invalidation scope.

### Load and failure behavior

Shielding can reduce repeated concurrent misses but can also add a network hop, request charges, and a regional dependency. Measure shield hit/miss ratio, origin request rate, collapsed-request count if exposed, latency by cache tier, error rate, and cost. Decide what a shield outage means: provider-managed failover may apply, but application availability and stale response behavior still require testing. Origin shielding is often a poor fit for dynamic or low-cacheability requests because it adds a layer without useful reuse.

## Cross-item comparison

- **Edge cache only:** fewer layers and possibly lower hit latency, but independent regional misses can reach the origin repeatedly.
- **Regional cache tier:** consolidates traffic within a region; requests from separate regional tiers may still duplicate origin fetches.
- **Origin shield:** centralizes eligible misses across more downstream regions, trading some extra hop/cost for origin protection and shared cache reuse.
- **Application cache:** can cache domain-level results and may have richer invalidation rules, but it is managed by the application and does not automatically protect CDN-to-origin traffic.

CloudFront describes Origin Shield as an optional extra cache tier and notes that it can consolidate simultaneous cache misses; those product behaviors should not be assumed for every CDN.

## Examples

During a live event, several regional edge caches request the same newly published segment. Without a shared shield, each region may fetch the segment from a just-in-time packager. With a shield near the origin, eligible misses can converge there; one shield hit can serve multiple downstream cache layers. If the segment URL is personalized per viewer, however, the cache key may prevent sharing. If the packager publishes updated bytes at a stable URL while a stale object remains cached, a high hit rate can deliver incorrect media until freshness or invalidation rules take effect.

## Common mistakes

- Enabling a shield before measuring origin duplicate misses or cacheability.
- Assuming all CDNs use the same request-collapse and bypass rules.
- Omitting tenant or representation dimensions from the cache key.
- Making the cache key include every raw cookie or query value and destroying hit rate.
- Treating invalidation as instantaneous across browser, intermediary, edge, and shield caches.
- Ignoring incremental request charges and the added dependency/hop.

## Knowledge checks with answers

1. **What does an origin shield protect?** It can reduce eligible repeated or simultaneous cache misses reaching the origin by adding a shared cache tier.
2. **Does a shield guarantee one origin fetch per object?** No. Product routing, cache key, request eligibility, timing, and cache state affect the result.
3. **What is the most important correctness risk?** A cache key or freshness policy that lets different representations share the wrong object, or serves content longer than allowed.
