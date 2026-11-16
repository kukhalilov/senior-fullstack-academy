<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# React Redux Toolkit store slices selectors middleware and async workflows — Reference: Store configuration and reducer composition

# Scope and version

This reference explains the assigned store and reducer-composition names for Redux Toolkit 2.x and Redux 5. The official setup example currently shows RTK 2.12.0, Redux 5.0.1, and Reselect 5.2.0; treat these as the documentation snapshot rather than a guarantee of the newest npm patch. RTK 2.0 changed `configureStore.middleware` to callback form and added `combineSlices` for reducer composition/injection. See [Getting Started](https://redux.js.org/toolkit/introduction/getting-started), [configureStore](https://redux.js.org/toolkit/api/configureStore), and [RTK 2 migration notes](https://redux.js.org/usage/migrations/migrating-rtk-2).

# How this group fits the mental model

The store is the application-state ledger and dispatch pipeline. Configuration chooses the root reducer, middleware, enhancers, initial state, and DevTools integration. Reducer composition divides that root transition function into manageable state domains. RTK's defaults support the common case; customize only when a documented need requires it.

# Supplied names explained

- `configureStore(options)` — RTK's standard store constructor. It wraps Redux store setup, accepts a reducer or reducer map, installs default middleware and DevTools integration, and returns an enhanced store with inferred TypeScript types.
- `configureStore.reducer` — The option that supplies the root reducer function or reducer map. If given a map, `configureStore` combines its entries using Redux's `combineReducers` behavior. Each map key becomes a state key.
- `configureStore.middleware callback` — The current customization form: `middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger)`. When supplied, return the complete middleware collection you intend to use; omitting defaults can remove thunk and RTK development checks. In TypeScript, preserve tuple typing (the default result is already an RTK `Tuple`).
- `configureStore.devTools` — Boolean or options object controlling Redux DevTools Extension support. It defaults to enabled, with RTK applying development-oriented tracing behavior. Disable or tune deliberately when production overhead or environment policy calls for it.
- `configureStore.preloadedState` — Initial state supplied to store creation, useful for hydration, persisted state, tests, or deterministic setup. Its shape must agree with the reducer tree, especially when using a reducer map.
- `configureStore.enhancers callback` — Customizes store enhancers through `getDefaultEnhancers`; the returned collection must include defaults you still need. Middleware is installed through an enhancer, so replacing the enhancer list carelessly can omit middleware application. Place middleware configuration before enhancers in TypeScript because enhancer typing depends on middleware.
- `getDefaultMiddleware()` — Returns RTK's default middleware collection (with thunk and development checks such as immutability and serializability checks). Call this within the `middleware` callback, then use tuple-preserving `.concat()` or `.prepend()` for additions. Calling it as a standalone configuration step is not how the callback receives it.
- `getDefaultEnhancers()` — Supplies RTK's default store enhancers. Use the callback form to add or reorder custom enhancers while retaining defaults. In RTK 2 this includes the auto-batching enhancer by default; exact defaults are version-sensitive, so consult the API for the installed version.
- `combineReducers(reducers)` — Redux core utility that combines a map of slice reducer functions into one reducer. Each reducer owns its corresponding state key and receives the same action. It is still valid for explicit root composition, though `configureStore` accepts a reducer map directly.
- `combineSlices(...slices)` — RTK utility that combines slice objects and/or reducer maps into a reducer with attached selector/injection facilities. Unlike `combineReducers`, adding a slice later does not itself dispatch an action to initialize state; access/injection behavior should be understood from its API.
- `combineSlices.inject(slice)` — Injects a slice reducer into a reducer created by `combineSlices`, enabling lazy-loaded feature registration. Injection updates the reducer's known shape; state for a newly injected reducer is materialized through a subsequent reduction/selector proxy behavior rather than a store replacement. Coordinate injection before the feature expects live state.
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

Sources: [configureStore](https://redux.js.org/toolkit/api/configureStore), [combineSlices](https://redux.js.org/toolkit/api/combineSlices), [Getting Started](https://redux.js.org/toolkit/introduction/getting-started), [RTK 2 migration guide](https://redux.js.org/usage/migrations/migrating-rtk-2).
