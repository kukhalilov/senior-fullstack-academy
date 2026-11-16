<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# React Redux Toolkit store slices selectors middleware and async workflows — Reference: Selector functions and memoized derivation

# Scope and version

This lesson covers the supplied selector inventory using RTK 2.x / Reselect 5 documentation. `createSelector` is re-exported by Redux Toolkit from Reselect. Memoization implementation and options can vary by Reselect version; the official RTK setup snapshot shows Reselect 5.2.0. See [createSelector](https://redux.js.org/toolkit/api/createSelector) and [Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors).

# How this group fits the mental model

State is the canonical data; selectors are the read interface. They hide state shape, derive values, and can memoize expensive calculations. React components and other consumers should use selectors instead of duplicating domain calculations or depending on deeply nested state paths.

# Supplied names explained

- `Selector function` — A function that accepts state (and optionally parameters) and returns a value. A basic selector can read a field; a composed selector can derive data. Selectors should be pure because they may run repeatedly and at times callers do not control.
- `createSelector(inputSelectors, resultFunction)` — Reselect's memoized selector creator. It runs input selectors, compares their results, and calls the result function when inputs changed according to its memoizer. It exposes the calculated result and memoization metadata; its output remains a normal function callers can invoke with state and any shared arguments.
- `createSelector.withTypes<RootState>()` — TypeScript helper that predefines the root-state type for selectors, reducing repeated annotations. It is a typing convenience and does not change runtime selection or memoization.
- `createSelectorCreator(options, ...memoizeOptions)` — Creates a customized selector creator using a chosen memoization function/options. This is an advanced escape hatch; prefer standard `createSelector` unless cache behavior or equality semantics need deliberate customization.
- `lruMemoize` — Reselect memoizer that retains a bounded least-recently-used set of argument/result entries (the default cache size is limited unless configured). It is useful when a selector is called with a small set of recurring argument combinations. Cache size and equality comparison affect memory and reuse.
- `weakMapMemoize` — Reselect memoizer that builds cache paths from argument identities using weak maps where possible. It can retain many object-keyed combinations without a fixed LRU size and lets garbage collection reclaim object-keyed branches. Primitive-key branches and cache topology still matter; it is not a universal promise of zero memory use.
- `createDraftSafeSelector(inputSelectors, resultFunction)` — RTK wrapper for selectors that may be evaluated against Immer draft values inside reducers. It recalculates against draft inputs to avoid stale memoized results when the draft's identity stays the same while its contents change. Ordinary component selectors generally use `createSelector`.
- `createDraftSafeSelector.withTypes<RootState>()` — Typed helper for creating draft-safe selectors with a predefined root-state type. Its type parameter should reflect the state shape actually supplied; draft-safety matters only when inputs can be Immer drafts.
- `selectFromResult pattern` — RTK Query pattern where a query hook's `selectFromResult` option returns a narrow subset or derived view of its result, allowing components to subscribe to only what they need. This is adjacent to selectors but belongs to RTK Query and is not the general Reselect API. See the topic boundary note: use it only when consuming an RTK Query hook.
- `Memoized selector input stability` — Memoization works when input selectors return stable values for unchanged relevant state. An input selector that creates a fresh array/object on every call invalidates downstream memoization even when semantic content did not change. Keep input selectors simple field reads; do derivation in the result function.
- `Selector result function` — The final function passed to `createSelector`; it receives each input selector's output as positional arguments and computes the derived result. It should not read global state through hidden closures or perform effects, because doing so bypasses declared dependencies and memoization correctness.

# Cross-item comparison

A plain `Selector function` is best for direct lookup and inexpensive derivation. `createSelector(inputSelectors, resultFunction)` adds memoization and composition. Use `createSelectorCreator(options, ...memoizeOptions)` only when the default memoization policy is insufficient. `lruMemoize` bounds entry count; `weakMapMemoize` keys object inputs by identity with weak-map paths. Neither replaces choosing appropriate selector inputs.

`createDraftSafeSelector` addresses Immer draft identity behavior inside reducers. It is not a generally “more correct” selector for UI code, and selectors inside reducers are often avoidable because reducers own only a slice, not necessarily the whole root state.

# Examples

```ts
const selectTasks = (state: RootState) => state.tasks.entities
const selectFilter = (state: RootState) => state.filters.status

const selectVisibleTasks = createSelector(
  [selectTasks, selectFilter],
  (entities, filter) => Object.values(entities).filter(task =>
    filter === 'all' || (filter === 'done' ? task.done : !task.done),
  ),
)
```

Do not put `Object.values(state.todos.entities)` inside an input selector: it allocates on every invocation and forces recomputation. Place the allocation in the result function so it runs only when its declared inputs change.

# Common mistakes

- Using memoization for every trivial field read without a performance or identity need.
- Returning freshly allocated collections from input selectors.
- Reading an undeclared external variable inside a result function, which makes the cache's dependencies incomplete.
- Assuming memoization prevents React renders in every case; the selected reference and the component's subscription equality also matter.
- Using `createDraftSafeSelector` as a blanket fix for reducer architecture instead of keeping most selectors outside reducers.
- Assuming `selectFromResult` is an RTK Query-free Reselect API.

# Knowledge checks with answers

1. Where should allocations for derived data usually happen in a Reselect selector? **In the result function, after stable input selectors.**
2. When use `createDraftSafeSelector`? **When a selector may run on Immer draft inputs and reference memoization could return stale data.**
3. What is the key difference between LRU and weak-map memoization? **LRU retains a bounded recent-entry cache; weak-map memoization follows argument identity with weakly held object-keyed paths.**
4. Does selector memoization itself guarantee a React component will not render? **No; component subscription equality and selected result identity also determine updates.**

Sources: [createSelector](https://redux.js.org/toolkit/api/createSelector), [Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors), [RTK Query selectFromResult](https://redux.js.org/toolkit/rtk-query/usage/queries).
