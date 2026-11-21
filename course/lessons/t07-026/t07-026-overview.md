# Browser persistence offline operation and web workers — Big-picture orientation and mental model

## Problem and purpose

A browser application must decide where each piece of information lives, how long it should remain available, and what the user sees when the network or storage is unavailable. These are product and data-integrity choices, not merely API choices. A shopping cart, a draft document, an authentication cookie, and a downloaded image have different owners and recovery needs.

## Plain-language mental model

Think of browser storage as a set of local tools with different jobs. A cookie is a small note that can accompany matching requests to a server. Web Storage is a small synchronous notebook for simple string preferences. IndexedDB is a local database for structured records and transactions. The HTTP cache follows HTTP freshness rules, while CacheStorage holds request/response pairs that application code manages. OPFS provides origin-private file-like storage for workloads that need it.

None of these is automatically a durable, cross-device source of truth. The browser or user can remove local data, and the device can be lost. If data matters, define how the server, export, or another recovery path restores it.

## How the parts fit together

The application first classifies data by owner, sensitivity, size, access pattern, and lifetime. It then chooses storage and a freshness policy. A service worker may intercept requests within its scope and use CacheStorage for offline reads. IndexedDB can retain structured records and pending operations. A worker can move expensive computation away from the UI thread. React presents loading, stale, pending, synchronized, and failed states; it should not be treated as the persistence system.

Cookies are also an authentication and security topic. Their `Secure`, `HttpOnly`, `SameSite`, domain, path, and expiry behavior is covered in the web-security and ASP.NET Core lessons; this topic focuses on how cookies differ from client-side stores.

## Concept map

1. Classify the information: preference, server-owned record, offline draft, or reusable response.
2. Select a store that matches the data and access pattern.
3. Define freshness, deletion, and failure behavior.
4. For offline writes, persist an operation and its identity before reporting it as safely pending.
5. Replay with idempotency and a conflict policy when connected.
6. Keep the UI responsive and make uncertainty visible.

## End-to-end walkthrough

Suppose a user edits a task while offline. The app loads the last synchronized task from IndexedDB and labels it as potentially stale. On save, it records both the new local view and a pending operation with a stable identifier. It does not claim the server has saved the change. When connectivity returns, synchronization sends the operation with its identifier and a version precondition. The server can recognize a retry, accept it, or report a conflict. The app then records the server result and updates the UI. If local storage fails or was cleared, the app explains that offline recovery is unavailable and offers the server copy when possible.

## When to use it and tradeoffs

Use local persistence for fast startup, offline reads, drafts, and bounded caches when the product has a clear freshness and recovery policy. Keep server-owned or sensitive information under deliberate security controls. Avoid storing data locally merely because an API is convenient. Offline writes add queue durability, duplicate delivery, conflict, logout, and privacy problems; only promise the behavior the product can actually support.

## What later lessons cover

The references compare stores, explain IndexedDB transactions and upgrades, distinguish CacheStorage from HTTP caching, cover service-worker lifecycle and offline synchronization, and connect these mechanisms to workers and React. The practice lessons design an offline editor and a safe asset-cache rollout.

### Sources

- [WHATWG Storage Standard](https://storage.spec.whatwg.org/)
- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN caching guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
