# Browser persistence offline operation and web workers — Core concepts and how they fit together

## Learning objectives

- Select browser persistence by data shape, lifetime, sensitivity, and server visibility.
- Explain why Web Storage, IndexedDB, HTTP cache, and CacheStorage are not interchangeable.
- Design offline reads and writes with explicit freshness, replay, and conflict behavior.
- Describe service workers and web workers without treating either as an always-running thread.
- Integrate persistence with React while representing loading, failure, and synchronization states.

## Prerequisites

You should know the same-origin model, HTTP requests and responses, JavaScript promises, React state and Effects, and basic client/server responsibility. A transaction groups database operations so they succeed or fail together. An origin is the browser security boundary based on scheme, host, and port.

## Core concepts

### Choose by responsibility, not familiarity

Start with who owns the data. A server-owned account record needs server authorization and a synchronization path. A local preference may be a good Web Storage value. A larger structured offline record is a better IndexedDB candidate. A reusable network response may belong in an HTTP cache or CacheStorage, depending on who controls freshness. A cookie is sent with matching requests under cookie rules; that makes it useful for server interactions but also means its scope and security attributes matter.

The browser does not promise that local data will remain forever. Storage is origin-scoped, subject to quotas and user clearing, and may be evicted. A storage estimate is an estimate, not a reservation. Asking for persistent storage can be denied. Therefore local persistence is a performance and offline capability, not a substitute for backups or server authority.

### Treat freshness as part of the data model

Every cached value needs a freshness rule. The UI can show “updated just now,” “last synced at…,” or “may be out of date.” Cache-first favors speed and offline availability but can serve stale data. Network-first favors current data when reachable but needs a fallback. Stale-while-revalidate returns a cached response quickly and refreshes it for a later request. These are policies with different user-visible consequences, not universally correct recipes.

CacheStorage is a programmable store of request/response pairs. It does not automatically make HTTP cache directives enforce the application’s policy. HTTP caching and CacheStorage can both affect a fetch path, so define which layer owns freshness and invalidation. Avoid cache keys that accidentally mix users or authorization contexts, and remove obsolete caches deliberately.

### Make an offline write honest and replayable

Persist the intended operation before showing it as safely queued. Give it a stable operation identifier so retries can be recognized by the server. A network timeout is ambiguous: the server may have committed the request even though the client did not receive the response. Idempotency protects against duplicate effects when the same logical operation is retried, but it does not resolve two different edits to the same record.

For conflicts, use a policy suitable for the domain: reject with a version conflict and ask the user, merge independent fields, or use a domain-specific rule. “Last write wins” is a choice that can discard work. Keep pending, accepted, rejected, and conflicted states distinct. Connectivity signals are hints; a successful request and server response establish synchronization.

### Understand worker roles and lifetimes

A Dedicated Worker is generally owned by one page; a SharedWorker can be used by compatible same-origin contexts. Both can perform suitable computation away from the main UI thread. A Service Worker has a different purpose: it is event-driven and can mediate requests for controlled clients. The browser can stop a service worker between events, so do not use it as an in-memory, permanently running process. Workers cannot directly manipulate the page DOM.

Messages use structured cloning unless transferable objects move supported underlying resources. Copying large data has cost; transferring can change ownership and make the original unusable. Design message payloads around the minimum data needed, and handle worker errors, termination, and stale messages.

## Mechanisms and relationships

### Storage lifecycle

1. The page opens a store and reads a local snapshot asynchronously where appropriate.
2. The UI renders the snapshot with its freshness and synchronization state.
3. A user edit is persisted locally and represented as pending work.
4. A service worker may provide cached network responses, but it does not replace application data synchronization.
5. A foreground sync process sends pending operations with stable IDs and version information.
6. The result is committed locally; conflicts and storage failures remain visible to the user.

### Schema and cross-tab changes

IndexedDB schema changes happen during a version upgrade transaction. Another open tab may keep an older connection and block that upgrade. Applications should notify older clients to close their connections, close them on `versionchange`, and give users an understandable recovery path if an upgrade is blocked. Keep upgrades atomic and avoid assuming every tab has refreshed simultaneously.

## Worked examples

### Preference versus durable record

Store a small display preference in Web Storage if synchronous access and simple strings meet the need. Store a set of offline task records and pending operations in IndexedDB because records need structured data, indexes, and transactions. In both cases, validate data when reading: storage contents can be stale or malformed, and an older app version may have written a different shape.

### Cache outage behavior

For a public help page, cache-first may be acceptable if the interface displays that content can be old. For a private balance, do not silently return a stale cached response as if it were current. Either avoid caching it or design an explicit, secure, user-visible stale-data rule. The correct choice depends on the endpoint’s privacy and freshness contract.

## Misconceptions and edge cases

- “Offline” is not the same as “saved.” A local pending edit is not a server commit.
- A retry after a timeout can duplicate an operation unless the server supports idempotent handling.
- CacheStorage does not automatically follow HTTP cache directives.
- A service worker is not a daemon that runs continuously in the background.
- A persistent-storage request is not guaranteed to be granted.
- `navigator.storage.estimate()` does not reserve space; writes can still fail.
- A React Effect should synchronize with an external system and clean up subscriptions. It should not be used as a hidden substitute for a domain-level persistence and synchronization design.
- Server rendering may not have `window`, `indexedDB`, or service-worker APIs. Access them behind a browser-only boundary and avoid hydration output that depends on client-only data before it is loaded.

## Knowledge checks with answers

1. Why is IndexedDB a better fit than Web Storage for many offline records? It supports asynchronous structured data and transactional operations; Web Storage is synchronous string storage.
2. Does CacheStorage honor `Cache-Control` automatically? No. It is application-managed; the application must implement its freshness and invalidation policy.
3. Can the app assume a timed-out write did not reach the server? No. The result is ambiguous; replay needs stable identity/idempotency and conflict handling.
4. What should happen when an IndexedDB upgrade is blocked? Existing connections should close, typically after handling `versionchange`; the user should receive a recovery path rather than an unexplained hang.
5. What does a successful local write prove? Only that the local operation completed according to the store’s result; it does not prove server synchronization.

### Sources

- [IndexedDB API guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Service worker usage](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [Structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
