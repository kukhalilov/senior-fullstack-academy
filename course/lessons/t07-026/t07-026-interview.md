# Browser persistence offline operation and web workers — Interview questions and reasoning

## Core questions

1. How do cookies, Web Storage, IndexedDB, HTTP cache, and CacheStorage differ?
2. How would you design a React application that can read and edit data offline?
3. What happens when an IndexedDB schema upgrade is requested while another tab has an older connection?
4. Why does a service worker need an update strategy for old open tabs?
5. How do Dedicated Workers, SharedWorkers, and service workers differ?

## Concise interview answers

1. Cookies can accompany matching HTTP requests; Web Storage is synchronous string storage; IndexedDB is asynchronous structured transactional storage; HTTP cache follows HTTP freshness rules; CacheStorage is application-managed Request/Response storage.
2. Define local data and freshness first. Persist a local snapshot and durable pending operations, make pending state visible, replay with stable IDs, and handle server conflicts. Keep a foreground sync path.
3. The older connection can block the upgrade. Close on `versionchange`, coordinate the tab, and show a blocked/reload path.
4. Old pages may still request assets that a new worker/cache removed. Preserve compatibility or coordinate a safe reload.
5. Dedicated workers serve a creating context; SharedWorkers can serve compatible connected contexts; service workers are event-driven and can mediate requests for controlled pages.

## Deep follow-up answers

An offline save should not be described as server-synchronized. A local transaction can establish that the browser accepted the local write, but browser storage remains subject to quota failure, eviction, user clearing, and device loss. A retry after timeout is ambiguous, so the server should deduplicate a stable operation identity. Idempotency handles duplicate delivery of one operation; it does not decide which of two concurrent edits wins. Use version checks and a domain-specific conflict policy.

CacheStorage is useful when the app needs to manage offline responses, but it does not automatically obey HTTP cache directives. Define cache keys, user isolation, freshness, invalidation, and old-client compatibility. A service worker can be terminated between events, so durable work cannot depend on its in-memory state.

In React, isolate browser APIs behind a repository/service boundary. Load client-only data after the server-rendered boundary, model loading/stale/pending/error/conflict states, and clean up Effects that subscribe to external events. Test unavailable storage and quota failure rather than assuming every browser has the same behavior.

## Scenario questions

1. A user reports “saved” but a server request timed out. What state should the UI show and how would you retry?
2. A new app worker activates while an old tab is open. How do you avoid a mixed asset set?
3. A browser reports little remaining quota during an import. How do you avoid partial user data loss?
4. A second tab updates the same IndexedDB record. How should the first tab learn and reconcile?

## Tradeoffs and alternatives

Choose Web Storage for small simple values only when synchronous access is acceptable. Choose IndexedDB for structured records and transactional local writes. Choose HTTP caching when protocol freshness semantics match the resource. Choose CacheStorage for explicit application-managed offline response logic. Keep authoritative data on a server when it must survive device loss or be shared across devices. A simpler online-only flow can be safer than offline writes when conflict resolution and recovery cannot be supported.

## Common weak answers

- “Use localStorage for everything because it is easy.”
- “The `online` event means the server accepted the write.”
- “A service worker runs continuously in the background.”
- “Cache-Control controls every CacheStorage entry.”
- “Idempotency solves concurrent edits.”
- “IndexedDB data is permanent.”

## Self-check rubric

Score each answer from 0 to 2: (0) misses the central distinction, (1) names the mechanism but omits failure behavior, (2) explains the mechanism, its limits, and a user-visible recovery policy. A strong answer also distinguishes local persistence from server authority and identifies how duplicate requests and concurrent edits differ.

### Sources

- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Using web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
