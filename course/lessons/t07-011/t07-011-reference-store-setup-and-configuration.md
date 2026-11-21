
# React Redux Toolkit store slices selectors middleware and async workflows — Reference: Store configuration and reducer composition

# Scope and version

This reference explains the assigned store and reducer-composition names against Redux Toolkit 2.14.0 and Redux 5.0.1, checked on 2026-11-17. RTK 2.0 changed `configureStore.middleware` to callback form and added `combineSlices` for reducer composition/injection. See [Getting Started](https://redux.js.org/toolkit/introduction/getting-started), [configureStore](https://redux.js.org/toolkit/api/configureStore), and [RTK 2 migration notes](https://redux.js.org/usage/migrations/migrating-rtk-2).

# How this group fits the mental model

The store is the application-state ledger and dispatch pipeline. Configuration chooses the root reducer, middleware, enhancers, initial state, and DevTools integration. Reducer composition divides that root transition function into manageable state domains. RTK's defaults support the common case; customize only when a documented need requires it.

# Supplied names explained

- `configureStore(options)` — RTK's standard store constructor. It wraps Redux store setup, accepts a reducer or reducer map, installs default middleware and DevTools integration, and returns an enhanced store with inferred TypeScript types.
- `configureStore.reducer` — The option that supplies the root reducer function or reducer map. If given a map, `configureStore` combines its entries using Redux's `combineReducers` behavior. Each map key becomes a state key.
- `configureStore.middleware callback` — The current customization form: `middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger)`. When supplied, return the complete middleware collection you intend to use; omitting defaults can remove thunk and RTK development checks. In TypeScript, preserve tuple typing (the default result is already an RTK `Tuple`).
- `configureStore.devTools` — Boolean or options object controlling Redux DevTools Extension support. It defaults to enabled, with RTK applying development-oriented tracing behavior. Disable or tune deliberately when production overhead or environment policy calls for it.
- `configureStore.duplicateMiddlewareCheck` — Defaults to `true` and checks the final middleware list for duplicate function references, which can catch adding the same API middleware twice. It checks identity, not whether two different middleware behave equivalently.
- `configureStore.preloadedState` — Initial state supplied to store creation, useful for hydration, persisted state, tests, or deterministic setup. Its shape must agree with the reducer tree, especially when using a reducer map.
- `configureStore.enhancers callback` — Customizes store enhancers through `getDefaultEnhancers`; the returned collection must include defaults you still need. Middleware is installed through an enhancer, so replacing the enhancer list carelessly can omit middleware application. Place middleware configuration before enhancers in TypeScript because enhancer typing depends on middleware.
- `getDefaultMiddleware()` — Returns thunk middleware plus development action-creator, immutability, and serializability checks; production defaults to thunk. Its options are `thunk`, `immutableCheck`, `serializableCheck`, and `actionCreatorCheck`, each configurable or disabled. Call it within the `middleware` callback, then use tuple-preserving `.concat()` or `.prepend()` for additions. Replacing the callback's return value replaces the whole middleware list.
- `getDefaultMiddleware options (thunk, immutableCheck, serializableCheck, actionCreatorCheck)` — Configures or disables the four middleware entries. `thunk.extraArgument` injects a service dependency into thunks. Excluding a check changes diagnostics, not the underlying state/action design requirements.
- `getDefaultEnhancers()` — Supplies `applyMiddleware` and the default `autoBatchEnhancer`. Use the callback form to add or reorder custom enhancers while retaining defaults; replacing the enhancer list can remove middleware application.
- `getDefaultEnhancers autoBatch option` — Accepts `false`, `true`, or `autoBatch` options (for example `{ type: 'tick' }`) to control the default auto-batching enhancer. Auto-batching affects low-priority notifications and is not a general replacement for React batching.
- `combineReducers(reducers)` — Redux core utility that combines a map of slice reducer functions into one reducer. Each reducer owns its corresponding state key and receives the same action. It is still valid for explicit root composition, though `configureStore` accepts a reducer map directly.
- `combineSlices(...slices)` — RTK utility that combines slice objects and/or reducer maps into a reducer with attached selector/injection facilities. Unlike `combineReducers`, adding a slice later does not itself dispatch an action to initialize state; access/injection behavior should be understood from its API.
- `combineSlices.inject(slice)` — Injects a slice reducer into a reducer created by `combineSlices`, enabling lazy-loaded feature registration. Injection updates the reducer's known shape; state for a newly injected reducer is materialized through a subsequent reduction/selector proxy behavior rather than a store replacement. Coordinate injection before the feature expects live state.
- `combineSlices.withLazyLoadedSlices<LazyLoadedSlices>()` — Adds declared future reducer keys to the inferred state type for code-split reducers. It changes TypeScript's declared shape; it does not load or inject a reducer at runtime.
- `combineSlices.selector(selectorFn, selectState?)` — Wraps a selector so lazy injected reducer state can be represented through the combined reducer's selector proxy. An optional `selectState` locates the combined state inside a larger root state.
- `combineSlices.selector.original(state)` — Reads the original combined state without the selector proxy's lazy-state behavior. Use the wrapped selector when reading potentially lazy keys so the declared state semantics are respected.
- `Redux store` — The object that holds the current root state and enhanced dispatch function. Application code should normally interact through its public methods and React-Redux bindings, not mutate internals.
- `store.dispatch(action)` — Sends an action through the middleware chain and then to the reducer pipeline (unless middleware handles or transforms it). With thunk middleware, a function can also be dispatched; the base Redux action contract still uses plain action objects.
- `store.getState()` — Returns the current root state reference. Treat it as read-only; changing it outside reducers breaks update detection and invariants.
- `store.subscribe(listener)` — Registers a callback invoked after dispatch processing when the store notifies subscribers. It returns an unsubscribe function. React components should generally use React-Redux subscriptions rather than manually subscribing.
- `Redux DevTools Extension` — Browser tooling integrated by `configureStore` by default, enabling action/state inspection and debugging features. It is a development aid, not a persistence system or a guarantee that every value is safely serializable.

# Cross-item comparison

`combineReducers(reducers)` is a Redux core function that composes a reducer map. `combineSlices(...slices)` works with RTK slice objects and adds lazy injection support. Passing a reducer map directly to `configureStore.reducer` is simplest for static composition. Choose injection only when code splitting or lazy feature loading needs it; it adds timing and state-shape considerations.

`configureStore.middleware callback` and `configureStore.enhancers callback` customize different layers. Middleware wraps dispatch and is the right place for action-level behavior. Enhancers wrap or extend the store itself. Use the middleware option for middleware and preserve `getDefaultEnhancers()` unless deliberately replacing store enhancement behavior.

# Examples

```ts
import { configureStore } from '@reduxjs/toolkit'
import logger from 'some-logger-middleware'
import { usersReducer } from './usersSlice'
import { listenerMiddleware } from './listeners'

export const store = configureStore({
  reducer: { users: usersReducer },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(logger),
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

Keep a single store instance per client application. Server-rendered applications generally need a fresh store per request; framework-specific lifecycle setup is outside this reference.

# Common mistakes

- Replacing default middleware accidentally by returning only a custom array; thunk and checks may disappear.
- Replacing enhancers while expecting middleware to remain installed.
- Mutating a value returned by `store.getState()`.
- Using `combineSlices.inject` after a feature assumes its state has already been initialized.
- Treating DevTools as a production state store or putting credentials and live runtime objects into inspectable state.
- Confusing the version displayed in an official example with a permanently current package version.

# Knowledge checks with answers

1. What should a middleware callback return? **The complete middleware collection, usually defaults plus additions.**
2. Why prefer `getDefaultEnhancers()` in its callback? **To retain RTK's standard enhancers while extending them.**
3. What is a benefit unique to `combineSlices` here? **It supports slice-based composition and runtime injection for lazy features.**
4. What does `store.subscribe` return? **An unsubscribe function.**

Sources: [configureStore](https://redux.js.org/toolkit/api/configureStore), [getDefaultMiddleware](https://redux.js.org/toolkit/api/getDefaultMiddleware), [getDefaultEnhancers](https://redux.js.org/toolkit/api/getDefaultEnhancers), [combineSlices](https://redux.js.org/toolkit/api/combineSlices), [Getting Started](https://redux.js.org/toolkit/introduction/getting-started), [RTK 2 migration guide](https://redux.js.org/usage/migrations/migrating-rtk-2).
