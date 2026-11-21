# Frontend state management Redux Toolkit and MobX comparisons — Interview questions and reasoning

Use the [React state guide](https://react.dev/learn/managing-state), [Redux Toolkit usage guide](https://redux.js.org/toolkit/usage/usage-guide), and [MobX React guide](https://mobx.js.org/react-integration.html) for the current reference context.

## Core questions

1. How do you decide whether state is local, URL, server-owned, or shared client state?
2. Compare Redux Toolkit's and MobX's update models.
3. What is RTK Query, and how does it differ from `createAsyncThunk`?
4. What does MobX track, and when does a computed value update?
5. Why should derived view data usually not be stored separately?
6. How would you modernize a large legacy Redux app?

## Concise interview answers

1. Identify the authoritative owner, consumers, and lifetime; colocate first, use URL for navigation state, and use a server cache for backend data.
2. Redux dispatches explicit actions and reducers; MobX tracks observable reads and propagates changes through a dynamic dependency graph.
3. RTK Query is an optional endpoint-based data-fetching/cache addon; thunk is lower-level async logic with lifecycle actions but no automatic endpoint cache.
4. Observable reads during a tracked observer/reaction execution; computed derives and caches while observed, recomputing when dependencies change.
5. It can become stale or contradict its source; derive it from canonical state.
6. Add Toolkit, migrate slices incrementally with behavior tests, then migrate async/cache concerns in separate steps.

## Deep follow-up answers

1. A value's source of truth matters more than its framework. A server response may be cached client-side but remains backend-owned; a form draft belongs to the edit session; URL state is externally navigable.
2. Redux makes transitions explicit and serializable for inspection/replay. MobX can reduce explicit selector plumbing and update dependent observers automatically, but debugging requires understanding tracked reads and reaction lifetimes.
3. RTK Query manages endpoint definitions, query cache identity/subscriptions, generated hooks and tag invalidation. `createAsyncThunk` is useful for custom async flows and can update a reducer, but cache dedupe/lifetime/invalidation are application responsibilities.
4. MobX recomputes the dependency graph on each tracked execution; conditional reads can change what is observed. Computeds suspend when unobserved, so their cache is not necessarily permanent.
5. Duplicate arrays/flags create multiple sources of truth. Normalize when relationships/updates justify it, then derive views with selectors/render calculations.
6. Preserve existing behavior and state shape first, introduce Toolkit defaults/slices gradually, keep action/reducer tests, and avoid rewriting business rules while changing architecture.

## Scenario questions

1. A URL filter and Redux filter disagree after browser Back. Where should canonical ownership move?
2. A MobX `autorun` makes duplicate network calls after navigation. What lifecycle/design issues would you inspect?
3. A query result is stored both in RTK Query and a slice. When might that be justified, and what consistency risk exists?
4. A Redux app needs fast mutation updates. How can it provide immediate UI without abandoning server authority?

## Tradeoffs and alternatives

- React local state minimizes dependencies; a store helps distant consumers coordinate.
- URL state is shareable but must be parsed/validated and may expose values in navigation.
- RTK Query automates common server-data caching; thunk/custom request state offers control with more lifecycle work.
- Redux offers explicit state transitions/action history; MobX offers observable models/dynamic tracking.
- MobX reactions are powerful but require careful side-effect/disposal boundaries; React `observer` is usually for render subscriptions.

## Common weak answers

- “Put everything in Redux.” That globalizes local, URL, and server-cache state unnecessarily.
- “RTK Query is just a thunk.” It includes endpoint and cache/subscription lifecycle.
- “MobX tracks all state automatically.” Only reads within tracked executions establish dependencies.
- “Computed means permanent memoization.” It may suspend when unobserved.
- “Redux is immutable so updates are verbose.” Toolkit uses Immer syntax in reducers while preserving immutable state semantics.
- “The biggest app needs the biggest state library.” Tool choice depends on ownership, sharing, debugging, and server-data needs.

## Self-check rubric

Score 0–2 for: (a) state ownership/lifetime reasoning; (b) React colocation and derived data; (c) Redux explicit transition model; (d) RTK Query server-cache role; (e) MobX dynamic dependency model; (f) migration/tradeoff plan. Strong answers score 10–12 and call out at least one cache or lifetime failure mode.
