# End-to-end browser navigation and web request lifecycle — Reference: Cache layers and freshness decisions

## Scope and version

This reference distinguishes HTTP caching from application-managed caches and CDN behavior. Correct caching depends on representation privacy, freshness, validation, and invalidation.

## How this group fits the mental model

A response can be reused by a browser, intermediary, CDN, service worker, or application store. Identify the layer and owner before debugging stale data. A cache key that is too broad can leak or mix data; one that is too narrow reduces reuse.

## Supplied names explained

- `Cache-Control directives` — HTTP fields that express storage and freshness constraints for HTTP caches. Directives such as `private`, `no-store`, `max-age`, and revalidation instructions have defined semantics; do not assume they control CacheStorage.
- `ETag and If-None-Match` — An entity tag is a validator; a client can send it conditionally. If the representation is unchanged, the server may return `304 Not Modified`, allowing cached content reuse.
- `Last-Modified and If-Modified-Since` — A timestamp validator pair for conditional requests. Timestamp granularity and server correctness can make it less precise than an entity tag.
- `304 Not Modified` — A response indicating a conditional request’s representation remains unchanged, so the cached body can be reused. It is not a response with a replacement body.
- `Vary response header` — Declares request fields that influence representation selection and therefore cache key variation. Incorrect or missing variance can serve the wrong representation.
- `Private versus shared cache` — A private cache is associated with an individual user agent; a shared cache can serve multiple users. Personalized data must not be reused across users without safe cache semantics.
- `CDN cache hit and miss` — A hit is served by the edge cache; a miss or revalidation may contact an origin. CDN cache key, TTL, purge, and origin behavior are product-specific.
- `Service worker CacheStorage` — Application-managed Request/Response storage that a worker may use for offline or custom routing. HTTP directives do not automatically enforce application cache policy.
- `Stale response and revalidation` — A stale cached response can be checked with validators before reuse or refresh. Product UX should state when offline content may be old.
- `Cache invalidation and purge` — Removing or making old entries unusable after content, authorization, or policy changes. Purge may be asynchronous and provider-specific; use versioned immutable assets where possible.

## Cross-item comparison

ETag and Last-Modified are validators. `304` reuses a cached body. `Vary` influences representation separation. `Cache-Control` guides HTTP caches; CacheStorage uses application code. CDN cache hits are another boundary with its own key and purge behavior.

## Examples

A content-hashed public bundle can receive long-lived immutable HTTP caching because a new version has a new URL. A private account response should use privacy-appropriate directives and must not enter a shared CDN cache under a key that ignores user identity. An offline service worker cache can serve a stale public shell, but the UI should indicate freshness and update policy.

## Common mistakes

- Treating a `304` as an error or expecting it to contain the full body.
- Forgetting `Vary: Accept-Encoding` or other representation dimensions when an intermediary requires them.
- Caching personalized content publicly.
- Assuming a CDN purge immediately removes every browser or service-worker copy.
- Expecting `Cache-Control` to delete an application-managed CacheStorage entry.

## Knowledge checks with answers

1. What does ETag revalidation save? It can avoid retransmitting an unchanged response body.
2. What does `Vary` express? Request fields that select different representations.
3. Does a CDN purge clear the browser’s CacheStorage? No; these are separate cache owners.

### Sources

- [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html)
- [Cache-Control reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
- [ETag reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag)
- [MDN caching guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching)
- [MDN CacheStorage](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)
