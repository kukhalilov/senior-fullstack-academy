# Frontend state management Redux Toolkit and MobX comparisons — Exercises and worked solutions

## Goals

Classify state by owner/lifetime, keep derived values derived, select React/Redux/MobX boundaries, and choose whether RTK Query or custom request logic fits server data.

## Worked example

### Searchable task list

Keep the unfinished search text local if it is temporary; place the submitted filter in the URL if users should bookmark/share it; keep tasks in a server-data cache with invalidation; derive the filtered array during render. Only add a Redux or MobX client store if multiple distant features need coordinated client-owned task workflow state.

## Exercises

1. A dialog's open state is used by one toolbar component. Choose a state boundary.
2. A filter should survive refresh and be copied to another user. Choose a boundary and state one consequence.
3. A task API is already integrated with Redux. Compare RTK Query and `createAsyncThunk` for list fetching.
4. A MobX store starts an `autorun` for a component that is later unmounted. What cleanup is required?
5. A Redux screen stores `allTasks`, `completedTasks`, and `visibleTasks` as separate arrays. Identify the consistency risk and redesign.
6. A large legacy Redux application uses handwritten reducers and middleware. Propose a gradual Toolkit migration.
7. A team wants fine-grained updates and mutable domain objects, but needs action replay and serializable persistence. What tradeoff should be discussed?

## Progressive hints

1. State should live near its consumers.
2. URL state participates in navigation/history.
3. RTK Query handles endpoint/cache lifecycle; thunk is lower-level custom async workflow.
4. `autorun` returns a disposer.
5. Store one normalized source and derive the other views.
6. Migrate slices with existing behavior tests.
7. Redux and MobX offer different update/debugging models; no tool satisfies all preferences without tradeoffs.

## Complete solutions

1. Keep it local to the toolbar/dialog owner; lift only if another component needs it.
2. Put it in the URL/search params. Refresh/share/back/forward preserve it, so validate and parse the string value.
3. Use RTK Query for standard list request caching, subscription, and invalidation; use `createAsyncThunk` when the request is part of a custom multi-step workflow or the cache behavior is intentionally bespoke. Avoid duplicating both caches without a reason.
4. Capture and call the disposer when the owning lifecycle ends; usually use `observer` for render updates instead of creating a reaction per render.
5. Keep one canonical task collection, preferably normalized if entity updates/relationships justify it, and derive completed/visible lists with selectors/render calculations. Duplicated arrays can become inconsistent.
6. Add Redux Toolkit, convert one reducer/store area at a time to `configureStore`/`createSlice`, preserve state shape/action behavior where feasible, keep regression tests, then migrate async/server-data workflows separately.
7. MobX may better fit mutable observable models/fine-grained dependency tracking; Redux's serializable explicit actions make action history and replay more straightforward. Define which requirements are mandatory and how tooling/persistence will work.

## Tests and edge cases

- Refresh/share/back through URL filter changes.
- Update one entity and verify every derived view reflects the canonical state.
- Simulate a rejected server request, retry, invalidation, and a late response after a newer mutation.
- Verify RTK Query API reducer and middleware are both registered.
- Unmount a component/store owner and confirm MobX reactions are disposed.
- For migration, compare old/new reducer outputs for the same actions.

## Reflection questions

- Which values in your app have two possible sources of truth?
- Is a value server-owned, user draft, navigation state, or client-owned domain state?
- Which state changes need a replayable history, and which need automatic dependency tracking?
- What is the smallest feature boundary for an incremental store migration?

## Sources

- [React choosing state structure](https://react.dev/learn/choosing-the-state-structure)
- [Redux Toolkit usage](https://redux.js.org/toolkit/usage/usage-guide)
- [RTK Query overview](https://redux.js.org/toolkit/rtk-query/overview)
- [MobX reactions](https://mobx.js.org/reactions.html)
