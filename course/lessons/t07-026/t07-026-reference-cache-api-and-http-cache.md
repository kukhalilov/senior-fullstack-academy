# Browser persistence offline operation and web workers — Reference: Cache API, HTTP cache, and response freshness

## Scope and version

This lesson covers browser response caching and application-managed CacheStorage. The Cache API and HTTP cache are distinct layers and can both affect what a fetch returns.

## How this group fits the mental model

A cache is useful only when the application can say how fresh the response must be and how it will be invalidated. Cache-first, network-first, and stale-while-revalidate represent different user-visible choices. Private and authenticated responses need a deliberate isolation policy.

## Supplied names explained

- `CacheStorage named cache` — A named collection of Cache objects available to window and worker contexts. Names can encode an application release or asset group, but old caches need bounded cleanup.
- `Cache request/response matching` — Cache lookups match stored Request/Response entries according to the API’s matching rules and options. URL, method, query parameters, and `Vary` behavior affect whether entries are appropriate; define canonical keys carefully.
- `Manual cache policy` — Application code chooses what to store, return, refresh, and delete. This control requires explicit expiration, validation, and privacy decisions.
- `HTTP cache directives` — Response and request directives such as freshness lifetime and revalidation instructions guide the HTTP cache. They do not automatically govern application-managed CacheStorage entries.
- `Cache versioning and cleanup` — New code can install a versioned cache set and remove obsolete names after activation. Keep compatibility with pages that may still use older assets.
- `Cache-first strategy` — Return a usable cache entry before making a network request. It helps offline access and latency, but content can become stale until explicit refresh or invalidation.
- `Network-first strategy` — Try the network and fall back to cache when a request fails or times out according to policy. It favors current data while reachable, but online failure can add latency.
- `Stale-while-revalidate strategy` — Return a cached entry quickly while updating it from the network for a later request. The current request receives potentially stale data, so this is unsuitable when the user must see only current values.
- `Authenticated response cache boundary` — The cache key and storage lifetime must not mix users, tenants, or authorization scopes. Logout, account switching, and permission changes need purge or partition behavior; avoiding caching sensitive responses can be safer.
- `Cache invalidation` — A process that makes obsolete or unauthorized entries unavailable, by deletion, version change, or validation. A cache without an invalidation plan can preserve stale or private data.

## Cross-item comparison

HTTP cache directives let the server describe freshness and validation. CacheStorage gives application code direct control over Request/Response entries. Cache-first prioritizes availability; network-first prioritizes current responses; stale-while-revalidate prioritizes fast return while refreshing later. None eliminates the need to define privacy boundaries and invalidation.

## Examples

For hashed public JavaScript assets, precache the exact release asset set and remove old caches only when the new worker is ready to serve compatible clients. For a public article, stale-while-revalidate may be acceptable if the interface communicates freshness. For an account balance, do not return an old cached value as current without an explicit product rule.

## Common mistakes

- Assuming `Cache-Control: no-store` automatically controls CacheStorage.
- Caching a response by URL alone when user or tenant identity changes the representation.
- Activating a new worker while deleting assets still needed by old tabs.
- Treating “a cache hit” as proof that data is current.

## Knowledge checks with answers

1. Which layer applies HTTP cache directives? The HTTP cache; CacheStorage policy is app-managed.
2. Which strategy may return stale content immediately and refresh for later? Stale-while-revalidate.
3. What must happen on logout if private responses were cached? The policy must remove or isolate entries so another session cannot receive them.

### Sources

- [MDN Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [MDN CacheStorage](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)
- [Progressive web app caching guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching)
- [HTTP cookies and caching context](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
