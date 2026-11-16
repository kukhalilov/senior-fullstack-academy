<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# React Redux Toolkit store slices selectors middleware and async workflows — Interview questions and reasoning

# Core questions

1. What problem does Redux solve, and when would you avoid it?
2. What are the responsibilities of actions, reducers, middleware, and selectors?
3. Why is Redux Toolkit the standard approach to Redux code?
4. How does Immer allow draft mutation while preserving immutable state?
5. What does `configureStore` configure by default?
6. What is the difference between stored state and derived state?
7. How does `createSelector` memoize, and what makes an input selector unstable?
8. How does React-Redux's `useSelector` decide whether a component should update?
9. Compare `createAsyncThunk`, listener middleware, and RTK Query.
10. What does normalization improve, and what costs does it introduce?
11. Why should reducer functions be pure and synchronous?
12. What is the current status of `connect()` compared with the hooks API?

# Concise interview answers

1. Redux provides explicit shared state transitions and observable data flow. Avoid it when state is local, short-lived, or a different tool already owns the data lifecycle.
2. Actions describe events; reducers calculate next state; middleware handles behavior around dispatch such as effects; selectors read and derive values.
3. RTK reduces boilerplate, supplies conventional setup and development checks, and includes standard utilities such as slices and async helpers.
4. Immer records changes to a proxy draft and creates an immutable next value, retaining unchanged references where possible.
5. `configureStore` combines reducer maps, installs thunk and development checks, and enables Redux DevTools integration by default; its exact behavior is version-bound.
6. Stored state contains canonical facts; derived state is computed from those facts, often through selectors, to avoid duplicate sources of truth.
7. Reselect runs input selectors and reuses results when inputs remain equal under its memoizer. Allocating new objects in an input selector defeats reuse.
8. By default, it compares prior and next selected values with strict reference equality (`===`).
9. `createAsyncThunk` structures one async operation and lifecycle actions; listener middleware reacts to action/state streams and supports workflows; RTK Query manages common server-data cache and invalidation needs.
10. Normalization reduces duplicated entity copies and enables ID-based lookup/update; it requires selectors/joins and can be unnecessary overhead for simple small data.
11. Purity makes transitions deterministic, testable, replayable, and independent of external timing.
12. Hooks are the recommended default. `connect()` is marked deprecated as of React-Redux 9.3.0 but still works and is not planned for removal; `legacy_connect` avoids the deprecation editor marker.

# Deep follow-up answers

**How do you diagnose unnecessary updates?** Check the selector's return identity, input selector stability, and the exact store fields that changed. A selector returning a new object each time can force a component update even if its fields are equal. Memoize meaningful derivations, select primitives or stable entities, or use a deliberate equality function. Avoid memoization without evidence because caches and custom comparisons add complexity.

**How do you handle concurrent requests?** Define the policy first: latest result wins, first request wins, every result is merged, or requests are deduplicated. `createAsyncThunk` provides request IDs and lifecycle metadata that reducers can compare. Pass `signal` to abort-aware APIs when cancelling client work. A client abort does not guarantee a server has not performed the operation.

**When is normalized state appropriate?** When entities have stable IDs, appear in multiple relationships or views, or update independently. Store each entity once and reference IDs. An entity adapter supplies a conventional shape and CRUD reducers/selectors. For a tiny, isolated, immutable collection, nested state may be simpler.

**Why not put all async logic in thunks?** Thunks are explicit and convenient for commands dispatched by a caller. A listener can centralize reactions to many actions/state conditions and express waits, debounce, cancellation, or forked work. RTK Query avoids reimplementing query cache lifecycle. Choose the smallest model that expresses the actual workflow.

# Scenario questions

1. A component renders 1000 rows and each action causes all rows to rerender. How do you investigate selector identity and row props before changing state architecture?
2. A user changes a search term five times while requests are pending. How would you implement latest-only behavior, and what server-side limitation remains?
3. A server returns a validation error body and a network timeout can also occur. How would you represent and render these distinctly through `createAsyncThunk`?
4. A feature bundle is loaded only after navigation and needs its own reducer and middleware. What does RTK support, and what initialization/order assumptions must the feature manage?
5. An existing codebase uses `connect()` everywhere. Must it be rewritten immediately? What would guide migration timing?

# Tradeoffs and alternatives

- Local component state: least shared machinery for one component or a small subtree; harder when many distant components coordinate.
- Redux Toolkit: explicit shared transitions, strong tooling, and familiar team conventions; adds architecture and state ownership decisions.
- `createAsyncThunk`: clear async command lifecycle; does not supply automatic query caching/invalidation.
- Listener middleware: models reactions and longer workflows; cancellation semantics and listener lifecycle need careful handling.
- RTK Query: purpose-built server-state cache, request deduplication, and invalidation; may be excessive for a one-off operation or bespoke orchestration.
- Hooks versus `connect()`: hooks are current default and simpler with TypeScript; `connect()` remains operational for existing integrations, with a 9.3.0 deprecation marker.

# Common weak answers

- “Redux is always better than Context/local state.” This ignores ownership and complexity costs.
- “Reducers mutate state because Immer allows it.” Draft syntax is scoped to Immer-managed reducer execution.
- “Memoized selectors stop all rerenders.” Selector recomputation and React-Redux result equality are related but distinct.
- “A rejected action means the server failed.” It can reflect abort, condition, expected payload rejection, or thrown failure.
- “Cancellation undoes the request.” Client cancellation cannot reverse external work already accepted.
- “`connect()` is removed.” It remains functional, though newly deprecated and no longer recommended for new code.
- “All API data belongs in a Redux slice.” RTK Query or another cache may better own server state.

# Self-check rubric

Score 0–2 for each: (a) trace a state update end to end, (b) keep reducer effects out, (c) identify canonical versus derived data, (d) explain reference-based selector updates, (e) select async tooling based on lifecycle, (f) describe normalization tradeoffs, and (g) state the current `connect()` status accurately. A strong answer scores 11–14 and can defend tradeoffs with a concrete scenario; 7–10 indicates sound vocabulary but shallow decision reasoning; below 7, revisit the overview and reference lessons before interview practice.

Sources: [Redux Toolkit Getting Started](https://redux.js.org/toolkit/introduction/getting-started), [createAsyncThunk](https://redux.js.org/toolkit/api/createAsyncThunk), [createListenerMiddleware](https://redux.js.org/toolkit/api/createListenerMiddleware), [React-Redux Hooks](https://redux.js.org/react-redux/api/hooks), [React-Redux connect](https://redux.js.org/react-redux/api/connect), [RTK Query comparison](https://redux.js.org/toolkit/rtk-query/usage/queries).
