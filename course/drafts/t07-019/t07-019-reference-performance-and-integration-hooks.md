# React API reference React hooks components context and resources — Reference: Performance, external store, identity, and diagnostics hooks

## Scope and version

This group covers the seven supplied Hooks: `useMemo`, `useCallback`, `useTransition`, `useDeferredValue`, `useDebugValue`, `useId`, and `useSyncExternalStore`. They serve distinct purposes: optimization, update priority, custom-Hook diagnostics, accessibility identity, and external-store subscription. [Built-in Hooks](https://react.dev/reference/react/hooks)

## How this group fits the mental model

First make data flow correct and rendering pure. Then use scheduling when an update is expensive and should not block urgent feedback, or memoization when actual work/identity costs are measured. External stores need a subscription protocol React can read consistently during concurrent rendering. IDs support relationships such as label/control but are not data identity.

## Supplied names explained

- `useMemo` caches the result of a calculation between renders while dependencies compare equal using `Object.is`. The calculation runs during render and must be pure. React may discard cached values; this is not semantic state or a way to guarantee once-only work. [useMemo](https://react.dev/reference/react/useMemo)
- `useCallback` caches a function identity while dependencies compare equal. It is useful when a stable callback is required by a memoized child or another Hook dependency. It does not prevent the function from being created in source code, and it does not make a stale closure correct. [useCallback](https://react.dev/reference/react/useCallback)
- `useTransition` returns `[isPending, startTransition]`. It marks state updates scheduled synchronously inside the callback as non-urgent and exposes whether that Transition is pending. It cannot control text inputs directly, and state updates after an `await` may require another `startTransition` to be marked. [useTransition](https://react.dev/reference/react/useTransition)
- `useDeferredValue` returns a deferred version of a value and optionally accepts `initialValue` for the initial render. Without it, the first returned value is the supplied value because there is no previous value to defer. React may render with the old value and then process the new value in interruptible background work; an update already inside a Transition is already deferred, so the new value is returned directly. It has no fixed delay and is not a debounce or request-cancellation mechanism. A Suspense boundary can keep old content visible while deferred rendering suspends. Pass primitives or objects created outside render; a newly allocated object each render causes unnecessary background work. [useDeferredValue](https://react.dev/reference/react/useDeferredValue)
- `useDebugValue` adds a label for a custom Hook in React DevTools. An optional formatting function can avoid expensive formatting until DevTools needs the value. It does not change runtime behavior and is most useful in reusable custom Hooks. [useDebugValue](https://react.dev/reference/react/useDebugValue)
- `useId()` takes no parameters and returns a unique string for that Hook call in that component. The ID is stable while the component is mounted, but may change during rendering; it must not be used for list keys or `use()` cache keys. It currently cannot be called in an async Server Component. Server and client trees must match for hydration. For multiple independent roots, pass distinct `identifierPrefix` values; for a server-rendered root, use the same prefix in its server render and client `hydrateRoot`. [useId](https://react.dev/reference/react/useId)
- `useSyncExternalStore` subscribes to an external store through `subscribe` and reads a snapshot with `getSnapshot`; optional `getServerSnapshot` provides the initial server/hydration snapshot. `subscribe` returns an unsubscribe function. `getSnapshot` must return a cached immutable snapshot until the store changes; returning a new object every read can trigger repeated renders. React rechecks snapshots to avoid tearing during concurrent work. [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)

## Cross-item comparison

`useMemo` caches a calculated value; `useCallback` caches a function identity; `memo` (covered in the core API reference) can skip a child render when props compare equal. None is a correctness primitive. `useTransition` marks updates at their source, while `useDeferredValue` lets a consumer lag behind an input it does not control. `useId` names an accessibility relationship; stable domain IDs and list keys come from data, not this Hook. [Built-in Hooks](https://react.dev/reference/react/hooks) [React APIs](https://react.dev/reference/react/apis)

## Examples

### Defer expensive results while preserving the input

```jsx
function Search({ items }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  return <>
    <input value={query} onChange={event => setQuery(event.target.value)} />
    <SlowResults items={items} query={deferredQuery} />
  </>;
}
```

The input uses the immediate value; the slow subtree can render with the older deferred query until React can process the new one. This is useful only if the slow subtree can render independently (often aided by memoization). It does not delay or cancel a network request by a chosen number of milliseconds.

### External store contract

```jsx
function useOnlineStatus(store) {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
}
```

The store functions must have stable identities or subscription work can restart each render. `getSnapshot` should return a stable primitive or cached immutable object until the store changes. The server snapshot must agree with the initial hydration view; if the app is client-only, the server argument may be omitted according to the API contract.

## Common mistakes

- Adding `useMemo` around cheap work before measuring and making dependencies harder to reason about.
- Omitting a reactive dependency from memoization and returning a stale value/function.
- Calling `useTransition` around arbitrary work and assuming it makes computation or network IO faster.
- Treating `useDeferredValue` as a millisecond debounce.
- Using `useId` for keys in a list; keys should identify data records across updates.
- Returning a fresh object from `getSnapshot` every call, which violates snapshot stability.
- Omitting cleanup from `subscribe` or giving the server and hydration different initial snapshots.

## Knowledge checks with answers

1. **Does `useMemo` promise a value is never recalculated?** No; it is a performance cache that React may discard.
2. **Which API gives a child a lagging value without owning the source state?** `useDeferredValue`.
3. **Is `useId` a valid list key?** No; use stable data identity.
4. **What must `getSnapshot` return when the store has not changed?** The same cached snapshot identity/value.
5. **What does `useDebugValue` change for application behavior?** Nothing; it improves DevTools labeling for custom Hooks.

