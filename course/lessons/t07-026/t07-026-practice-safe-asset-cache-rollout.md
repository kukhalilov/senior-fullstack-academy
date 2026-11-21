# Browser persistence offline operation and web workers — Problem: Roll out cached application assets without stale-version breakage

## Goals

Plan a release that handles cached assets, an old tab, an interrupted installation, and a recoverable update path without mixing incompatible application versions.

## Worked example

Release A is active with `app-a.js` and `style-a.css`. Release B adds `app-b.js` and `style-b.css`. A user keeps an A page open while B installs. Deleting A assets as soon as B activates can break that open page. The rollout must either preserve compatible assets while old clients remain or deliberately prompt/reload at a safe boundary.

## Exercises

1. Define a versioning rule for named asset caches.
2. Decide which files are essential for installation and what happens if one fetch fails.
3. Describe how a waiting worker is presented to a user with an open editor.
4. Define cleanup timing for the old cache and a recovery path if B cannot load.
5. Explain how API responses differ from immutable static assets in the cache policy.

## Progressive hints

1. Use an exact build asset manifest; content-hashed assets are easier to distinguish.
2. Make install fail if a required asset is missing, leaving the prior active worker intact.
3. Do not force activation during unsaved work unless the app can preserve it.
4. Old pages may still request old assets after the new worker activates.
5. Cache public static assets separately from user-specific API responses.

## Complete solutions

Create a release-specific cache name and precache the complete required app shell. During installation, treat a failed required asset as installation failure, so the existing active worker remains available. Allow the new worker to wait while clients use the old release. Present a refresh action when the user can safely leave or after preserving their work. If immediate activation is needed, first ensure the new worker can serve old page requests and that the new code remains compatible with old clients. During activation, remove caches only when they are no longer needed by controlled clients or when old assets remain addressable. Keep runtime caches bounded and exclude authenticated responses unless a narrowly scoped privacy policy is justified. Provide a recovery route, such as a network reload or a known-good release, if the new app shell fails. A service worker does not automatically implement rollback; the deployment and server must retain compatible assets or a rollback release.

## Tests and edge cases

- Fail the network during precache; the old worker must remain usable.
- Keep an old tab open during activation; its next asset request must not produce a blank screen.
- Switch accounts and log out; private API responses must not leak from a shared cache.
- Delete a cache while the worker remains registered; the app must recover if a cache entry is missing.
- Deploy a new API contract; old clients must have a compatible server path during rollout.

## Reflection questions

1. What exact compatibility promise do old clients receive during deployment?
2. When is it safe to delete an old asset cache?
3. How would telemetry distinguish installation failure from a runtime cache miss?

### Sources

- [Progressive web app caching guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching)
- [Using service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN CacheStorage](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)
