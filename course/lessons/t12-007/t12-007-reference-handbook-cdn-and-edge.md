# system design technology landscape and selection — Reference: CDN and edge

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [Cloudflare cache rules](https://developers.cloudflare.com/cache/how-to/cache-rules/), [Cloudflare purge and invalidation](https://developers.cloudflare.com/cache/guides/invalidate-cache/), [CloudFront overview](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html), [CloudFront cache key policy](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html), [CloudFront origin request policy](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html), [Akamai caching](https://techdocs.akamai.com/property-mgr/reference/ga-caching), [Akamai purge methods](https://techdocs.akamai.com/purge-cache/docs/purge-methods), [Fastly cache freshness](https://www.fastly.com/documentation/guides/concepts/cache/cache-freshness/), [Fastly surrogate-key purge](https://www.fastly.com/documentation/guides/full-site-delivery/purging/purging-with-surrogate-keys/), [Fastly cache control](https://www.fastly.com/documentation/guides/full-site-delivery/caching/controlling-caching/).

## Scope and version

This lesson compares Cloudflare, CloudFront, Akamai, and Fastly as CDN/edge platforms. Their products include different combinations of DNS, proxying, security, caching, and edge compute; included capabilities and limits depend on product, account plan, and configuration. The common concepts below are HTTP caching and global request delivery.

## How this group fits the mental model

A content delivery network places cache and request-handling capacity closer to users. A request reaches an edge point of presence; on a cache hit, a valid representation can be returned without contacting the origin. On a miss or stale entry, the edge follows its origin/revalidation policy. This reduces origin load and can lower latency, but it introduces a second copy whose freshness and variation rules must be correct.

The cache key determines which requests may share a cached response. If the response varies by language, authorization, cookie, query, or tenant, the key and cache policy must reflect that safely—or the response should not be shared. More key dimensions reduce cache hits; too few can leak personalized content or serve the wrong representation. TTL, validation, purge/invalidation, stale serving, and origin failure are separate controls.

“Edge” also refers to code execution or security/routing near the user. Edge compute can handle suitable low-latency logic, but runtime limits, consistency, data residency, cold starts, and the need for centralized authoritative state still apply.

## Supplied names explained

- **Cloudflare** — A global network platform spanning DNS, reverse proxy/CDN caching, security products, and edge compute (Workers). Cache Rules and custom cache keys determine what is cached and how request attributes affect variants. Purge methods include URL, tag, host, prefix, or full-zone choices depending on API/product. Custom key dimensions must be included in targeted purge requests where required. Cloudflare is broader than a CDN; evaluate each service and plan separately.
- **CloudFront** — AWS CDN that routes viewer requests through its network to an edge location and fetches misses from a configured origin. A cache policy controls the cache key and TTL; an origin request policy can forward additional headers/cookies/query values without adding them to the cache key. This separation helps preserve cache reuse while supplying origin data. Be careful: a positive minimum TTL can make CloudFront cache content even when origin headers say `no-cache`, `no-store`, or `private`.
- **Akamai** — A content delivery and edge platform configured through properties and delivery behaviors. Cache behavior can honor origin `Cache-Control`/`Expires` headers or use configured max-age/bypass behavior. Its purge tools distinguish invalidation (mark stale and revalidate) from deletion (remove and fetch a full current object on next request); cache tags and cache-key identifiers provide ways to target groups or variants. Exact options depend on product configuration.
- **Fastly** — An edge cloud/CDN whose cache freshness can be controlled through response headers such as `Surrogate-Control`, `Cache-Control`, and `Expires`, with platform-specific precedence and configuration. `Surrogate-Key` headers let an origin associate related responses so a group can be purged without enumerating every URL. Purge behavior and soft-purge/stale options are configuration-dependent.

## Cross-item comparison

| Design concern | Cloudflare | CloudFront | Akamai | Fastly |
|---|---|---|---|---|
| Cache variation | Cache Rules/custom key | Cache policy; separate origin-request policy | Property cache key/configuration | HTTP headers and service configuration |
| Targeted refresh | URL/tag/host/prefix options | Invalidation paths; versioned URLs also common | URL/ARL/CP code/tag options, with invalidate/delete modes | URL and surrogate-key methods |
| Broader platform pairing | DNS, security, Workers | AWS origins and edge services | CDN/security/edge portfolio | CDN and programmable edge platform |
| Core risk | Mis-keyed variants or purge mismatch | Mis-keyed data; TTL interactions | Stale configuration/cache-key mismatch | Incorrect cacheability/freshness or tag coverage |

Compare provider routing, contract, geographic coverage, origin integrations, security controls, purge latency, observability, support, cost, and operational skills using a workload benchmark. Marketing claims such as “nearest edge” do not replace measuring actual end-to-end latency for the target user population.

## Examples

### Cacheable public product image

The origin serves `/images/product-42.avif` with a long freshness lifetime and an immutable content hash in the URL. The CDN cache key uses the path and relevant content negotiation dimensions only. A new image gets a new URL, avoiding a broad purge. If assets are grouped by product tag, a product update can purge the related variants with the provider’s supported tag mechanism.

### Personalized API response

`/account` returns user-specific information. The design disables shared caching or uses a rigorously isolated private cache policy; it never ignores identity-bearing headers/cookies in a way that allows one user’s response to be reused for another. A broad CDN cache key is not made safe merely because the origin authenticates requests.

## Common mistakes

- Caching a personalized response with a key that omits the identity/tenant dimension.
- Including every cookie, query string, and header in the key, destroying cache reuse and increasing variant count.
- Assuming a purge by URL reaches every custom-key variant or every downstream browser/proxy cache.
- Using purge as the only freshness strategy instead of versioned asset names and appropriate TTL/revalidation.
- Setting CloudFront minimum TTL above zero while expecting `private` or `no-store` from origin to prevent caching.
- Assuming stale-if-error, soft purge, edge code, or cache tags behave identically across vendors and plans.
- Forgetting origin shielding, request coalescing, and rate limits when a broad purge creates a thundering herd.

## Knowledge checks with answers

1. **What does the cache key control?** Which request variants can reuse the same cached representation.
2. **Why separate CloudFront cache and origin request policies?** Some values can be forwarded to the origin without fragmenting the cache key, if they do not affect the cached response.
3. **How do purge and invalidation differ in principle?** A purge/delete removes the cached object; invalidation marks it stale so it can be revalidated, though provider terminology differs.
4. **Why are content-hashed static URLs useful?** A changed asset gets a new key, allowing long cache lifetimes without waiting for stale copies to expire.
