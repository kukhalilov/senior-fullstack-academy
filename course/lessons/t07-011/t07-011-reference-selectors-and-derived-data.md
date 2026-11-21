
# React Redux Toolkit store slices selectors middleware and async workflows — Reference: Selector functions and memoized derivation

# Scope and version

This lesson covers current Reselect 5 APIs as re-exported by Redux Toolkit. Reselect 5.3.0 is stable (2026-11-17): `createSelector` defaults to `weakMapMemoize`, and 5.3 adds a primitive-key cache bound and cache-growth development warning. See [createSelector](https://redux.js.org/toolkit/api/createSelector), [Reselect 5.3.0 release](https://github.com/reduxjs/reselect/releases), [createStructuredSelector](https://redux.js.org/reselect/api/createStructuredSelector), and [Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors).

# How this group fits the mental model

State is the canonical data; selectors are the read interface. They hide state shape, derive values, and can memoize expensive calculations. React components and other consumers should use selectors instead of duplicating domain calculations or depending on deeply nested state paths.

# Supplied names explained

- `Selector function` — A function that accepts state (and optionally parameters) and returns a value. A basic selector can read a field; a composed selector can derive data. Selectors should be pure because they may run repeatedly and at times callers do not control.
- `createSelector(inputSelectors, resultFunction)` — Reselect's memoized selector creator. It runs input selectors, compares their results, and calls the result function when inputs changed according to its memoizer. It exposes the calculated result and memoization metadata; its output remains a normal function callers can invoke with state and any shared arguments.
- `createSelector.withTypes<RootState>()` — TypeScript helper that predefines the root-state type for selectors, reducing repeated annotations. It is a typing convenience and does not change runtime selection or memoization.
- `createStructuredSelector(selectors, selectorCreator?)` — Creates a memoized selector that returns an object made from a keyed set of input selectors. The optional selector creator defaults to `createSelector`; Reselect 5.3 removed an unsafe overload, so use the current object-of-selectors form.
- `createStructuredSelector.withTypes<RootState>()` — Pre-types the state argument for structured selectors, as introduced in Reselect 5.1.
- `createSelector output selector resultFunc` — The original result function, exposed for introspection and tests; it should stay pure.
- `createSelector output selector memoizedResultFunc` — Memoized result function used after input selectors produce values.
- `createSelector output selector dependencies` — The array of input selector functions composed into the output selector.
- `createSelector output selector lastResult()` — Returns the last result calculated by the memoized result function.
- `createSelector output selector recomputations()` — Counts executions of the result function, distinct from how often input selectors run.
- `createSelector output selector dependencyRecomputations()` — Counts calls that recalculate input selector results. A rise without result recomputations can indicate inputs remain equal while state/arguments changed.
- `createSelector output selector resetRecomputations()` — Resets the result-function recomputation counter.
- `createSelector output selector resetDependencyRecomputations()` — Resets the input/dependency recomputation counter.
- `createSelector output selector memoize` — Reports the memoizer used for the result function; it can be overridden in selector options.
- `createSelector output selector argsMemoize` — Reports the memoizer used for calls to the output selector, separately configurable from result memoization.
- `createSelector output selector cache clearCache()` — Clears the output selector argument cache. The memoized result function has its own cache, so full cache clearing may require clearing both.
- `createSelector options memoize and argsMemoize` — Per-selector options can override the result memoizer, argument memoizer, and each memoizer's options; keep the two cache layers conceptually separate.
- `createSelectorCreator({ memoize, memoizeOptions?, argsMemoize?, argsMemoizeOptions? })` — Reselect 5 options-object form configures result-function and argument memoization independently. The legacy `createSelectorCreator(memoize, ...memoizeOptions)` overload remains available; prefer the object form for explicit current configuration.
- `createSelectorCreator(options, ...memoizeOptions)` — Historical positional overload of `createSelectorCreator`; current versions still accept it for compatibility, but the options object makes result and argument memoization settings explicit and independently configurable.
- `lruMemoize` — Memoizer with a default cache size of one and optional `maxSize`, `equalityCheck`, and `resultEqualityCheck` settings. It is useful when a deliberately bounded LRU cache is wanted; Reselect 5 `createSelector` defaults to `weakMapMemoize`, not LRU.
- `weakMapMemoize` — Reselect 5 default memoizer; it builds cache paths from argument identities using weak maps where possible. Object-keyed branches can be reclaimed by garbage collection, but primitive-key branches are held strongly unless cleared or bounded with the Reselect 5.3 `maxSize` option. It is not a promise of zero memory use.
- `lruMemoize options (equalityCheck, resultEqualityCheck, maxSize)` — `equalityCheck` compares memoization inputs; optional `resultEqualityCheck` can preserve an old output reference when a new result is equivalent; `maxSize` bounds the LRU cache.
- `weakMapMemoize maxSize (Reselect 5.3)` — Bounds results keyed by primitive arguments. Object-keyed cache nodes still follow weak-map/garbage-collection behavior.
- `weakMapMemoize cache growth development check` — Reselect 5.3 `cacheSizeCheck` warns when primitive arguments cause an unbounded cache. It is a development diagnostic, not a substitute for choosing an appropriate memoizer or cache bound.
- `Reselect inputStabilityCheck and identityFunctionCheck` — Development-only checks warn about unstable input-selector references and result functions that simply return an input. They can be set per selector or globally; production disables development checks.
- `createDraftSafeSelectorCreator(memoize, options?)` — Builds a draft-safe selector creator using a chosen memoizer; use it when adapter selectors or other selectors may receive Immer drafts.
- `createDraftSafeSelector(inputSelectors, resultFunction)` — RTK wrapper for selectors that may be evaluated against Immer draft values inside reducers. It recalculates against draft inputs to avoid stale memoized results when the draft's identity stays the same while its contents change. Ordinary component selectors generally use `createSelector`.
- `createDraftSafeSelector.withTypes<RootState>()` — Typed helper for creating draft-safe selectors with a predefined root-state type. Its type parameter should reflect the state shape actually supplied; draft-safety matters only when inputs can be Immer drafts.
- `selectFromResult pattern` — RTK Query pattern where a query hook's `selectFromResult` option returns a narrow subset or derived view of its result, allowing components to subscribe to only what they need. This is adjacent to selectors but belongs to RTK Query and is not the general Reselect API. See the topic boundary note: use it only when consuming an RTK Query hook.
- `Memoized selector input stability` — Memoization works when input selectors return stable values for unchanged relevant state. An input selector that creates a fresh array/object on every call invalidates downstream memoization even when semantic content did not change. Keep input selectors simple field reads; do derivation in the result function.
- `Selector result function` — The final function passed to `createSelector`; it receives each input selector's output as positional arguments and computes the derived result. It should not read global state through hidden closures or perform effects, because doing so bypasses declared dependencies and memoization correctness.

# Cross-item comparison

A plain `Selector function` is best for direct lookup and inexpensive derivation. `createSelector(inputSelectors, resultFunction)` adds memoization and composition. Use `createSelectorCreator({ memoize, memoizeOptions?, argsMemoize?, argsMemoizeOptions? })` only when the default memoization policy is insufficient; the legacy positional overload remains supported. `lruMemoize` bounds entry count; `weakMapMemoize` keys object inputs by identity with weak-map paths. Neither replaces choosing appropriate selector inputs.

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

Sources: [createSelector](https://redux.js.org/toolkit/api/createSelector), [Reselect createStructuredSelector](https://redux.js.org/reselect/api/createStructuredSelector), [Reselect createSelectorCreator](https://redux.js.org/reselect/api/createSelectorCreator), [Development-Only Checks](https://redux.js.org/reselect/api/development-only-checks), [lruMemoize](https://redux.js.org/reselect/api/lruMemoize), [weakMapMemoize](https://redux.js.org/reselect/api/weakMapMemoize), [Reselect 5.3.0 release](https://github.com/reduxjs/reselect/releases), [Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors), [RTK Query selectFromResult](https://redux.js.org/toolkit/rtk-query/usage/queries).
