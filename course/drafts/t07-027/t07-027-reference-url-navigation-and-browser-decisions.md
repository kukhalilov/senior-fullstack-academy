# End-to-end browser navigation and web request lifecycle — Reference: From entered address to navigation request

## Scope and version

This reference follows a top-level document navigation at a conceptual level. Browser UI, caches, and platform implementations differ; observe the actual request path in developer tools.

## How this group fits the mental model

Before network setup, the browser decides what the input means and whether policy, a worker, a cache, or a reusable connection can serve it. These decisions explain why two visits to the same URL may have different waterfalls.

## Supplied names explained

- `URL parsing and scheme selection` — The browser parses an address into scheme, host, port, path, and other components. A missing scheme may be inferred or interpreted as search input; do not assume typing always starts an HTTP request.
- `Browser autocomplete and search-engine decision` — Browser chrome may complete a known address or send text to a configured search engine. This decision occurs before a page request and is partly browser/product behavior.
- `HSTS upgrade before network request` — A remembered HSTS policy can cause the browser to use HTTPS for a host before attempting cleartext HTTP. A first visit is protected only if the policy was learned earlier or the host is preloaded.
- `Service worker navigation interception` — A controlling service worker may receive a navigation fetch event and answer from network or application-managed cache. Only pages within its registration scope are controlled.
- `Navigation preload` — A browser feature can start a network request while a service worker starts, reducing delay for some navigation paths. It is not universally enabled and the worker must use the preload response deliberately.
- `Same-origin policy` — A browser security model that restricts how documents and scripts interact across origins. It is broader than CORS and includes multiple API-specific rules.
- `Redirect chain` — A response can direct the browser to another URL, producing additional requests and affecting cookies, methods, security, and latency. Inspect the full chain rather than only the final URL.
- `Browser HTTP cache lookup` — The browser may use a fresh cached response or revalidate a stale one according to HTTP semantics. A cache hit may avoid network transfer but does not imply application data stores were consulted.
- `Connection pool and connection reuse` — The browser can reuse eligible connections for later requests. Reuse avoids repeated setup but depends on origin, protocol, connection state, and browser policy.

## Cross-item comparison

Browser chrome decides intent; HSTS and service workers affect request routing; the HTTP cache may reuse representations; a connection pool reuses transport. These are separate reuse points, and the observed path can combine several.

## Examples

On a repeat visit, HSTS may upgrade the URL, the service worker may intercept the navigation, a fresh app-shell response may come from CacheStorage, and the existing connection may be reused for an API call. Another browser with cleared site data may perform network setup. Compare both traces before attributing timing to DNS or TLS.

## Common mistakes

- Saying the browser always sends HTTP and waits for a redirect to HTTPS.
- Assuming every navigation reaches the network.
- Assuming a registered worker controls every route on an origin.
- Counting each subresource as a fresh TCP/TLS connection.

## Knowledge checks with answers

1. Can HSTS upgrade before sending a cleartext request? Yes, when policy is already known or preloaded.
2. Does a service worker control all paths automatically? No, registration scope controls eligibility.
3. What does a warm connection change? It can avoid new connection setup for eligible requests.

### Sources

- [Fetch Standard](https://fetch.spec.whatwg.org/)
- [HTTP Strict Transport Security](https://www.rfc-editor.org/rfc/rfc6797.html)
- [Service Worker usage](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Navigation preload](https://developer.mozilla.org/en-US/docs/Web/API/NavigationPreloadManager)
- [HTTP caching](https://www.rfc-editor.org/rfc/rfc9111.html)
