# Browser persistence offline operation and web workers — Reference: Choosing browser persistence by data and lifetime

## Scope and version

This reference compares storage roles and decision criteria. Browser quotas, eviction, and implementation details vary by user agent. The names below are copied from the supplied inventory.

## How this group fits the mental model

Pick a store only after describing what the data means, who owns it, how large it is, how often it is read, how long it should remain, whether the server must receive it, and whether script access is acceptable. A local copy can improve speed and offline behavior, but it is not automatically durable or authoritative.

## Supplied names explained

- `HTTP cookie` — A small name/value record associated with matching HTTP requests under domain, path, expiry, and security rules. Since it can be sent to the server, keep its scope narrow and use appropriate attributes. Authentication-cookie details belong to the security lessons.
- `Web Storage` — The umbrella for `localStorage` and `sessionStorage`. It stores strings and exposes synchronous calls, making it suitable for small values but a poor choice for large or frequently accessed data.
- `localStorage` — A per-origin key/value store that normally survives a browser session. It is readable by same-origin script, so do not treat it as a secret vault; it can also block the main thread during access.
- `sessionStorage` — A per-origin store scoped to a page session and its browsing context. It is useful for short-lived tab state, but its lifetime and tab behavior should match the product’s expectation.
- `IndexedDB` — An asynchronous structured database with object stores, indexes, and transactions. It is suited to larger records, offline application data, and queries that do not fit simple strings.
- `Cache API and CacheStorage` — APIs for storing and retrieving Request/Response pairs in named application-managed caches. They are useful for offline resources and response reuse; the app must define freshness and invalidation.
- `HTTP cache` — The browser’s HTTP response cache, influenced by protocol cache directives and validators. It is useful for network resource reuse when response semantics and headers express the intended policy.
- `Origin Private File System (OPFS)` — Origin-private file-like storage for applications needing file-oriented access or large data workflows. It is not a general replacement for records in IndexedDB, and availability/behavior should be checked for the target browsers.
- `Client-side source of truth` — A data ownership decision in which the browser copy is authoritative for a defined domain or workflow. It requires explicit synchronization, conflict, backup/export, device-loss, and migration rules; a cache alone does not create this model.
- `Sensitive-data persistence` — A decision to retain information that could expose a user if the device, browser profile, or script context is compromised. Minimize what is stored, limit retention, and do not assume script-readable storage is protected from cross-site scripting.

## Cross-item comparison

Cookies accompany matching requests and are server-visible. Web Storage is simple but synchronous and string-only. IndexedDB is transactional structured storage. HTTP cache applies HTTP freshness semantics; CacheStorage is managed by application logic. OPFS is file-oriented. These tools solve different problems and can coexist with clear ownership boundaries.

## Examples

Use `localStorage` for a small theme preference if synchronous access is acceptable. Use IndexedDB for offline task records and a pending-operation log. Use an HTTP cache for correctly cacheable static responses; use CacheStorage when application code must select and manage offline response entries. Keep a server-owned account balance on the server, even if a clearly labeled cached snapshot is shown offline.

## Common mistakes

- Putting secrets in script-readable storage and assuming that an origin boundary prevents XSS from reading them.
- Treating a local record as backed up or synchronized.
- Using CacheStorage without a freshness and cleanup policy.
- Choosing an origin-private store without handling quota failure, browser support, or user data clearing.

## Knowledge checks with answers

1. Which is a better fit for many structured offline records: Web Storage or IndexedDB? IndexedDB, because it supports asynchronous structured records and transactions.
2. Does a Cache API entry automatically follow HTTP cache headers? No; CacheStorage policy is application-managed.
3. Does persistent browser storage mean permanent storage? No. User deletion and device loss remain possible, and quotas/eviction behavior vary.

### Sources

- [WHATWG Storage Standard](https://storage.spec.whatwg.org/)
- [MDN cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
