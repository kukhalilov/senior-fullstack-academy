# React API reference React hooks components context and resources — Interview questions and reasoning

## Core questions

1. How do you decide between state, a ref, and a derived render value?
2. What problem do Effects solve, and what is their setup/cleanup lifecycle?
3. Compare `useEffect`, `useLayoutEffect`, and `useInsertionEffect`.
4. How do `useTransition` and `useDeferredValue` differ?
5. What is special about React's `use` API compared with Hooks?
6. What does a Context default value mean, and how do consumers update?
7. How does `<Activity>` differ from conditionally unmounting a subtree?
8. What does `useSyncExternalStore` require from an external store?
9. How does React 19's ref-as-prop behavior relate to `useImperativeHandle`?
10. How do `<ViewTransition>` and Transition Types coordinate an animation?

## Concise interview answers

1. Use state when a value affects UI and React should render from it; a ref for mutable imperative data that should not render; calculate pure derived values during render instead of duplicating state.
2. Effects synchronize a committed component with an external system. Setup starts synchronization; cleanup stops it before changed dependencies re-synchronize and on unmount.
3. `useEffect` is the general post-commit synchronization API. `useLayoutEffect` runs before paint for layout work but blocks paint. `useInsertionEffect` is a specialized early style-insertion hook for library integrations.
4. `useTransition` marks updates at the update source and offers pending status; `useDeferredValue` lets a consumer use a lagging version of an existing value. Neither is a fixed debounce.
5. `use` reads a supported resource during render and can suspend. It may appear in loops/conditions unlike ordinary Hooks, but remains limited to components/custom Hooks and supported resource types.
6. The default is used only when no matching provider exists. A consumer subscribes to the nearest provider and updates when its value changes by `Object.is`.
7. Unmounting discards component state. Hidden Activity retains state, hides DOM output, and cleans up Effects; hidden children can still be rendered at lower priority.
8. `subscribe` registers and returns cleanup; `getSnapshot` returns a cached immutable snapshot; an optional server snapshot must match hydration's initial data.
9. React 19 function components can receive `ref` as a prop. `useImperativeHandle` remains a way to expose a narrow custom imperative handle; declarative props remain preferable where possible.
10. React coordinates browser transitions for eligible Transition/Suspense/deferred updates. Names match shared elements; types carry the cause for choosing styling. React owns the browser transition coordination.

## Deep follow-up answers

### Why not synchronize derived values with an Effect?

The first render commits values based on current inputs but stale derived state. The Effect then enqueues another render, adding latency and a possible inconsistent intermediate UI. Derivation during render keeps one source of truth. Memoization may reduce measured cost but should not change semantics. [Hooks](https://react.dev/reference/react/hooks)

### Why are Effect dependencies not a scheduling preference?

Setup and cleanup close over reactive values. Omitting a value allows synchronization to keep using an outdated closure; including it makes the lifecycle respond to the actual inputs. If a non-reactive callback needs the latest presentation value without restarting the connection, `useEffectEvent` may separate that concern. It must not conceal a true connection dependency. [useEffect](https://react.dev/reference/react/useEffect) [useEffectEvent](https://react.dev/reference/react/useEffectEvent)

### What does “concurrent-safe external store” mean here?

React can render work without immediately committing it and can restart work when snapshots change. A store API that only pushes a copied value into component state through an Effect can show a stale combination around these schedules. `useSyncExternalStore` lets React subscribe and re-read a stable snapshot consistently. The snapshot must be immutable/cached until a store change, or React sees a new value on every read. [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)

### What is the security boundary for a Server Function?

The generated reference makes a remote call possible; it does not make arguments trusted. Validate input, authenticate from trusted server state, authorize the requested record and operation on every call, handle duplicate requests safely, and return only intended data. Treat the function like a network endpoint. [use-server](https://react.dev/reference/rsc/use-server)

### How should an engineer assess React API version claims?

Check the current official versioned API reference and release notes, then verify the framework's actual bundled React/runtime version. Current APIs include features added in React 19, 19.2, and 19.3; low-level or integration-dependent behavior can have separate stability/support caveats. Do not infer runtime support from editor types or a tutorial date. [React versions](https://react.dev/versions) [React 19.3](https://react.dev/blog/2026/09/09/react-19-3)

## Scenario questions

1. A component keeps a DOM node and a visible `isOpen` flag. Which values belong in state and which in refs, and why?
2. A parent memoizes a child, but the child still re-renders whenever a Context provider changes. Is that a bug?
3. An app starts a fetch during render and wants abandoned work cancelled. Which API could provide an RSC cache-lifetime signal, and what are its current limitations?
4. A developer uses `<Activity mode="hidden">` but a hidden child still re-renders after props change. Is that unexpected?
5. A view-transition animation runs for navigation but not for a direct setter. What should be checked?

## Tradeoffs and alternatives

Prefer plain state and derived rendering before reducer/memo complexity. Prefer a direct event handler for user-caused work and an Effect only for synchronization. Choose `<Activity>` when hidden UI state should persist and Effects should stop; choose unmounting when hidden content should release state/resources. Use `useSyncExternalStore` when integrating a true external store, not as a wrapper around ordinary component state. For animation, CSS transitions suit simple style changes; React `<ViewTransition>` is useful when a tree change should be coordinated with the browser snapshot model.

## Common weak answers

- “Effects run after every render, so I put all logic there.” This confuses synchronization with derived computation and event handling.
- “Refs are just state that does not render.” They are imperative mutable storage and do not notify React.
- “Memo always improves performance.” It can add work and does not guarantee skipping updates.
- “Suspense catches fetch.” It handles suspension from supported integrations; a fetch started in an Effect is not automatically a Suspense resource.
- “A Transition makes a request atomic.” It controls UI update priority, not server transaction or authorization semantics.
- “`'use server'` means secure.” The exposed call still needs validation and authorization.

## Self-check rubric

Score each response from 0 to 2: **0** names an API without explaining behavior; **1** explains the API but misses a lifecycle/boundary caveat; **2** chooses based on ownership, explains tradeoffs and current caveats, and describes a concrete failure mode. A strong answer consistently distinguishes render data, external synchronization, imperative handles, scheduling, and framework/server boundaries.

