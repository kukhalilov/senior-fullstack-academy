# Browser persistence offline operation and web workers — Reference: Integrating persistence and offline work into a React application

## Scope and version

This lesson focuses on application boundaries and user experience, not a second exhaustive React API reference. Browser APIs may be absent during server rendering and should be accessed through a client-side boundary.

## How this group fits the mental model

React state describes the current rendered interface. Persistence belongs behind a data-access boundary that can load, save, synchronize, and report errors. Components should consume a coherent state model rather than directly scattering storage calls throughout render logic.

## Supplied names explained

- `Persistent domain data versus React view state` — Domain data is the task, document, or preference that has a lifetime beyond one render. View state is presentation state such as an open panel. Persist domain data only where needed; do not serialize every transient component detail by default.
- `Repository/service boundary` — A module or service that owns browser storage and synchronization operations. It lets components depend on methods and state transitions rather than browser-specific storage details.
- `Effect subscription and cleanup` — An Effect can connect React to an external system, such as a storage-change or message subscription. Return cleanup that removes listeners or closes the subscription; avoid using Effects to derive ordinary render data.
- `Hydration and server rendering boundary` — Server-rendered output is produced without browser-only APIs. Do not read `window`, IndexedDB, or service-worker state during server rendering; load client data after hydration and avoid initial markup disagreement.
- `Optimistic UI with durable pending state` — An optimistic update may render immediately, but a durable pending operation should be recorded and the UI should distinguish unconfirmed from synchronized results.
- `Cross-tab invalidation` — Another tab may commit a newer record. Notify or subscribe to changes and reread the authoritative local record; do not assume a message contains the final state.
- `Storage failure UI` — When a read, write, migration, or quota operation fails, preserve recoverable input and explain whether the content is only in memory, persisted locally, or synchronized.
- `Offline and stale-state accessibility` — Make connection, freshness, pending, and conflict status available to assistive technology and understandable without color alone. Provide keyboard-operable retry and recovery actions.
- `Progressive enhancement` — The core task should degrade gracefully when a storage or worker capability is unavailable. Detect support and provide a simpler online path where the product permits it.

## Cross-item comparison

The repository/service boundary owns persistence and synchronization; React view state renders the resulting status. Effects attach and clean up external subscriptions. Hydration separates server output from browser-only data. Progressive enhancement allows the app to offer reduced capability when a browser feature is missing.

## Examples

On mount, a task screen asks a repository for a local snapshot. It renders loading first, then the snapshot with its last-sync time. A save command asks the repository to commit the edit and queue its operation; only after durable local success does the screen mark it “saved on this device, waiting to sync.” A later subscription reports server acceptance or conflict. If IndexedDB is unavailable, show the supported fallback instead of throwing during render.

## Common mistakes

- Reading `localStorage` during server rendering.
- Persisting every keystroke without defining debounce, transaction, and recovery behavior.
- Updating UI to “synced” when only a local write completed.
- Setting up subscriptions in an Effect without cleanup.
- Hiding storage errors from assistive technology or relying only on a color badge.

## Knowledge checks with answers

1. Should React component state be the only copy of a recoverable draft? No; use an explicit persistence service and show its success/failure state.
2. Why must browser access wait for a client boundary? Server rendering may not have browser globals and the initial markup must remain consistent.
3. What does an Effect cleanup do here? Removes listeners/subscriptions and prevents stale or duplicate external connections.

### Sources

- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
