# Frontend state management Redux Toolkit and MobX comparisons — Reference: State categories and appropriate ownership

## Scope and version

This lesson classifies the supplied state categories. It is a tool-selection reference, not an API catalog. The goal is to identify the value's owner, consumers, and lifetime before selecting a library. [React managing state](https://react.dev/learn/managing-state) [Choosing state structure](https://react.dev/learn/choosing-the-state-structure)

## How this group fits the mental model

State belongs where its updates and lifetime make sense. Start at the smallest boundary that supports all consumers; expand only when sharing or persistence requires it.

## Supplied names explained

- `Component-local UI state` is transient interaction data owned by one component or small subtree, such as an open menu or draft input.
- `Shared client state` is client-owned data consumed/updated across distant features, such as a local preference or active client workflow. Use a global store only when the sharing requirement is real.
- `URL and navigation state` belongs in path/search/hash/history when it should survive refresh, be shareable, or participate in back/forward navigation.
- `Server-owned data` is authoritative on the backend. Client copies can be stale; writes need validation, error handling, and a refresh/cache policy.
- `Client-side server-data cache` stores a client replica of remote data with request status, cache identity, subscriptions, and invalidation. RTK Query is one Redux-integrated option; framework loaders/server caches are alternatives.
- `Form draft state` is the user's in-progress edit. Keep it separate from saved server data until the user commits, especially when cancel/reset behavior matters.
- `Derived view state` is a calculated projection, such as filtered items. Derive from source state at render unless a measured need justifies memoized computation.
- `State ownership boundary` is the component/store/router/cache responsible for a value's updates and lifetime. One value should have one clear source of truth.
- `State colocation` keeps state close to its consumers and owner, reducing unnecessary global coupling.
- `Global state overreach` is promoting local/transient/derived data to a global store without cross-feature need. It adds synchronization, lifecycle, and debugging work.

## Cross-item comparison

| Category | Owner/lifetime | Typical place |
|---|---|---|
| Component-local UI state | One interaction/component lifetime | React local state |
| URL state | Navigation/history lifetime | URL/search params |
| Form draft | Editing session | Form component or form-state boundary |
| Server-owned data | Backend authority | Loader/query cache + invalidation |
| Shared client state | App/feature lifetime | Context or client store |
| Derived view state | Recomputed from source | Render calculation |

## Examples

For a product grid, put `sort=price` in the URL if the result should be bookmarkable, keep the currently focused menu item local, cache products through the app's server-data layer, and derive the visible/sorted list from the products and URL filter. Avoid storing the same filter in both URL and global Redux state unless synchronization is explicitly designed.

## Common mistakes

- Copying server data into a client store and forgetting to update both copies.
- Keeping URL-relevant filters only in component state.
- Storing filtered/sorted results as a second source of truth.
- Globalizing every modal, input, and hover flag.
- Treating cache invalidation as the same thing as changing client UI state.
- Failing to define who owns reset/cancel behavior for a form draft.

## Knowledge checks with answers

1. Where should a state value go first? At the smallest boundary that serves its consumers/lifetime.
2. What distinguishes server data from client-owned state? The backend is authoritative for server data.
3. Why put a filter in the URL? Sharing, refresh persistence, and navigation history.
4. What is the risk of storing derived view data? It can diverge from the source.

## Sources

- [React managing state](https://react.dev/learn/managing-state)
- [Choosing the state structure](https://react.dev/learn/choosing-the-state-structure)
