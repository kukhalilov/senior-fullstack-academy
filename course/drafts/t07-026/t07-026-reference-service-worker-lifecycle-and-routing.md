# Browser persistence offline operation and web workers — Reference: Service worker registration, lifecycle, and fetch handling

## Scope and version

This lesson explains the supplied lifecycle and routing concepts. A service worker is browser-managed and event-driven; it is not a continuously running background service.

## How this group fits the mental model

A service worker can mediate requests made by pages it controls, enabling offline responses and application-shell caching. Its scope and lifecycle determine which pages it controls and which version handles events. The browser may stop it between events and start it again later.

## Supplied names explained

- `Service worker` — A worker script associated with an origin and registration scope that receives lifecycle and functional events. It can coordinate network access for controlled clients but cannot manipulate the DOM.
- `Secure context requirement` — Registration requires a secure context, normally HTTPS; localhost is treated as trustworthy for development. Do not expect production registration over ordinary insecure HTTP.
- `Registration scope` — The URL path range a registration can control, subject to script-location and scope rules. Choose it deliberately; a worker does not automatically control every page on the origin.
- `installing, waiting, and active workers` — Registration moves through lifecycle states as scripts install and become eligible to control clients. A new worker may wait while pages are controlled by the old active version.
- `install event and precache` — Installation is a place to prepare required resources before the worker becomes active. If essential precaching fails, fail installation rather than activate a worker that cannot serve a coherent application shell.
- `activate event and cleanup` — Activation can remove obsolete cache versions and perform setup. Cleanup must account for pages or assets still used by clients of an older application version.
- `skipWaiting and clients.claim` — Lifecycle controls that can make a waiting worker active sooner or allow an active worker to claim eligible clients. They can create mixed-version risks; use only with an update strategy that keeps old pages and new assets compatible.
- `Worker event lifetime` — The browser can terminate a worker when events finish; event handlers must extend lifetime only through the event mechanisms the platform provides and complete necessary work within that event.
- `fetch event and respondWith` — A worker can inspect a fetch event and provide a response through `respondWith`. Restrict routing carefully so API, navigation, and asset responses follow their intended freshness and authorization rules.
- `Update and rollback behavior` — A changed worker script can install while the old worker still serves clients. Design for failed installation, waiting clients, cache cleanup, and recovery to a known working release; a service worker is not an automatic rollback system.

## Cross-item comparison

Registration and scope decide where the worker participates. Install and activate manage version preparation and cleanup. Fetch handling implements response behavior. `skipWaiting` and `clients.claim` can speed transitions but reduce the natural separation between old and new clients, so version compatibility becomes essential.

## Examples

For an asset release, precache a complete immutable asset manifest during install. If a required fetch fails, leave the previous active worker in place. On activation, clean old caches only when old clients will not need them or when assets remain backward compatible. Provide a user-facing refresh prompt if keeping an old page open is safer.

## Common mistakes

- Treating a service worker as always running and relying on in-memory state between events.
- Registering at a scope that does not include the intended pages.
- Calling `skipWaiting` without checking whether old pages can use the new cache/assets.
- Intercepting every request with the same cache rule, including private API calls.
- Assuming an update script automatically preserves a working rollback path.

## Knowledge checks with answers

1. Can a service worker access the page DOM? No.
2. Can it rely on staying alive between events? No; the browser can stop it.
3. What risk can immediate activation create? Old clients may be served by a new worker or cache with incompatible assets.

### Sources

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Using service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Service Worker specification](https://w3c.github.io/ServiceWorker/)
- [Progressive web app caching guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching)
