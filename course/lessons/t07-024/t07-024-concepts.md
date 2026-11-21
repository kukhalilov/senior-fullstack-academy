# Frontend state management Redux Toolkit and MobX comparisons — Core concepts and how they fit together

## Learning objectives

Classify UI, URL, client, and server-owned state; choose a sharing boundary; explain Redux's explicit transitions and MobX's observable graph; understand RTK Query's role; avoid duplicated derived state; and compare migration/tooling tradeoffs.

## Prerequisites

Know React state, props, Context, component composition, asynchronous requests, and browser URLs. **Server-owned data** is authoritative on a backend; a client cache is a local replica with freshness rules. **Derived state** is calculated from source data rather than stored independently.

## Core concepts

### State has different owners and lifetimes

Local interaction state, URL state, server data, and shared client state are not interchangeable categories. A filter belongs in the URL if it should survive refresh/share/back navigation. A server response belongs in a cache with revalidation/invalidation. A form draft can remain local until submission. A shared client preference can live in a store if its consumers cross component boundaries.

### Colocation before globalization

Keep state near the components that own and use it. Lift it to the nearest common parent when siblings need coordination. Use composition to avoid passing data through layers that do not care. Context shares values through a subtree but does not itself define a server-data cache or normalized global update system. Avoid redundant state: if a value can be derived during render from props or existing state, calculate it. [Choosing state structure](https://react.dev/learn/choosing-the-state-structure)

### Redux Toolkit: explicit transitions

Redux Toolkit is the standard way to write Redux. A store holds state; actions describe events; reducers compute the next state. `configureStore` and `createSlice` provide defaults and reduce boilerplate. The Redux state model encourages serializable data and explicit transitions, which supports action history, DevTools, reproducibility, and centralized reasoning. Immer lets reducer code use draft mutation syntax while producing immutable updates; it does not make mutation outside reducers safe. [Redux usage](https://redux.js.org/toolkit/usage/usage-guide)

### RTK Query: server cache within the Redux ecosystem

RTK Query is an optional addon in Redux Toolkit for data fetching and caching. It models query and mutation endpoints, cache subscriptions/lifetimes, generated hooks (through the React-specific entry point), and tag invalidation. It is not required for Redux client state, and Redux Toolkit store alone is not automatically an HTTP cache. A handwritten `createAsyncThunk` request can handle async work, but RTK Query supplies a higher-level endpoint/cache lifecycle for typical server data. [RTK Query](https://redux.js.org/toolkit/rtk-query/overview)

### MobX: observable graph

MobX makes fields observable, derives computed values, and tracks which observables are read while an `observer` component or reaction executes. When a tracked value changes, only dependent consumers need to rerun. Dependencies are dynamic: reads in the current execution determine subscriptions. `makeAutoObservable` can infer annotations for a model; `makeObservable` makes the mapping explicit. Computeds cache while observed and derive rather than duplicate state. Actions group writes in transactions so observers do not see intermediate states.

MobX `autorun`/`reaction` are for automatic side effects and should be used sparingly; React integration typically uses `observer` for rendering. Dispose standalone reactions when their owner ends. [MobX observable state](https://mobx.js.org/observable-state.html) [MobX reactions](https://mobx.js.org/reactions.html) [MobX React](https://mobx.js.org/react-integration.html)

### Redux and MobX reflect different debugging models

Redux favors explicit action/reducer transitions and inspectable serializable history. MobX favors observable model updates and automatic dependency tracking. Redux can make state changes easy to trace centrally; MobX can reduce explicit selector/dispatch plumbing and update fine-grained consumers. Neither automatically solves domain modeling, stale server data, memory lifetime, or testing.

## Mechanisms and relationships

| Data need | Candidate boundary |
|---|---|
| Temporary component interaction | `useState` / `useReducer` |
| Shared nearby state | props, composition, lifted state |
| Share through a subtree | Context |
| Shareable/back-forwardable filter | URL/search params |
| Backend-owned entities | RTK Query or framework/server-data cache |
| Cross-feature client-owned transitions | Redux Toolkit or MobX |
| Display-only calculation | render-time derived value |

## Worked examples

### Derived React view

```jsx
const visibleTasks = tasks.filter(task =>
  filter === 'all' || task.status === filter
);
```

Do not store `visibleTasks` separately unless profiling and a deliberate cache strategy justify it. Deriving avoids a second value that can become stale.

### Redux vs MobX update shape

```text
Redux: dispatch(taskCompleted(id)) -> reducer returns next serializable state
MobX:  store.complete(id) -> observable field changes -> tracked views react
```

Both models need a clear owner and tests for the domain rule.

## Misconceptions and edge cases

- Redux Toolkit is not obsolete; it is the official recommended way to write Redux.
- RTK Query is optional and focused on server data fetching/caching, not every kind of client state.
- MobX observable mutation is managed by MobX but should still happen through intentional actions/flows and clear ownership.
- MobX tracks reads during tracked execution; an observable read outside an `observer`/reaction does not create a lasting dependency.
- Context is a propagation mechanism, not an automatic cache or state normalization strategy.
- More global state can increase coupling and lifetime bugs.
- Derived values stored redundantly must be synchronized and can contradict their source.

## Knowledge checks with answers

1. **Where should a shareable filter live?** Usually in the URL/search state.
2. **What does RTK Query manage?** Server-data fetch/cache lifecycle through Redux Toolkit integration.
3. **What determines MobX dependency tracking?** Observable reads during a tracked execution.
4. **Why avoid duplicate derived state?** It can become stale or contradict its source.
5. **What is Redux's basic transition model?** Dispatch an action and let a reducer compute the next state.
