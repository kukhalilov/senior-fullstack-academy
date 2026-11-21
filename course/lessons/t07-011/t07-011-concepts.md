
# React Redux Toolkit store slices selectors middleware and async workflows — Core concepts and how they fit together

# Learning objectives

After this lesson, you should be able to trace an action through a Redux application, describe the reducer and middleware boundaries, design normalized state, distinguish stored from derived data, explain selector memoization and React-Redux subscription behavior, and choose between a thunk, listener middleware, RTK Query, or component-local state for a concrete requirement.

# Prerequisites

You should know JavaScript functions and objects, immutable update concepts, React components and rendering, and the distinction between synchronous code and promises. TypeScript-specific typed hooks are useful but not required to understand the runtime model.

# Core concepts

**The store and state tree.** A Redux store owns one root state value and exposes dispatch, state reading, and subscription. The state tree is data, not a place for functions, DOM nodes, class instances, or other live resources. Keep it serializable where practical: replay, persistence, DevTools inspection, and predictable diagnostics depend on values that can be represented as data. RTK's development middleware checks immutability violations and non-serializable values by default, but these are development diagnostics, not a substitute for sound design.

**Actions are events.** An action is an object with a string `type`; optional payload and metadata describe the event. Actions should describe something that happened (`orderSubmitted`) rather than imperatively command a reducer (`setStateToX`). Generated action creators provide consistent types and payloads. The action itself does not mutate state; it is input to the reducer pipeline.

**Reducers are pure transitions.** For a given state and action, a reducer computes the same next state without network requests, timers, random values, or mutations to external data. Reducers must not mutate the prior state. In RTK case reducers, Immer wraps the input in a draft, so assignment to the draft is translated to immutable updates. Either mutate the draft or return a replacement value for a case—not both. A `return state.push(...)` bug is common because `push` returns a number; use `state.push(...)` as a draft mutation without returning it, or return a new array.

**Slices define feature transitions.** A slice groups a feature's name, initial state, reducer cases and generated action creators. `extraReducers` handles actions defined elsewhere, including async thunk lifecycle actions. Reducers should usually be organized around domain ownership rather than UI screen boundaries. Root composition combines these feature reducers.

**State shape is an API.** Store the smallest canonical facts needed to reconstruct the interface. If `total` is a deterministic sum of cart lines, storing both lines and total creates two sources of truth; derive the total. Normalize entity collections as `{ ids, entities }` when independent entity lookup/update and relationships matter. This reduces duplicated objects and makes updates local. Normalization is a tool, not a requirement for every small nested value.

**Selectors separate reads from storage.** A selector takes state and returns a value. Basic selectors centralize state paths and insulate components from state-shape changes. Derived selectors compose input selectors and a result function; Reselect memoizes the result based on input values. Input selectors should return stable, relevant values, not allocate a new array/object on each call. Memoization is most useful when a derivation is expensive or reference stability matters; it does not make every selector automatically cheap.

**Middleware handles effects around dispatch.** Reducers cannot perform effects. Middleware can intercept dispatch and coordinate behavior. Thunk middleware accepts a function dispatched to the store; that function can read state and dispatch more actions, making it suitable for imperative async tasks. `createAsyncThunk` standardizes a request lifecycle with pending, fulfilled, and rejected actions, while leaving state updates to reducers. Listener middleware registers reactions to actions or state changes and provides cancellable workflow helpers, often a clearer fit for debounce, take-latest, and action-to-action workflows.

**React integration is subscription plus dispatch.** `<Provider store>` supplies the store through context. `useSelector` subscribes and selects a value; by default it compares previous and next selected results with strict reference equality (`===`). Returning a fresh object on every run therefore causes updates even when its fields are equal. Select separate primitives, use a memoized selector, or deliberately choose an equality function such as shallow comparison. `useDispatch` returns dispatch; in TypeScript, derive `RootState` and `AppDispatch` from the configured store and create typed hook variants.

React-Redux hooks are the recommended default. `connect()` remains functional but is marked deprecated starting with React-Redux 9.3.0; the maintainers say it is not intended for removal. Existing connected components can continue to work, and `legacy_connect` avoids the editor deprecation marker. New code should prefer hooks unless a concrete migration constraint justifies otherwise.

# Mechanisms and relationships

Consider a search list. Store `query` and normalized records; select matching records from those inputs. The result selector reruns when query or entity data changes. The component's `useSelector` result is compared by identity; if the selector creates an array every time, the component sees a changed result even if the contents match. Memoization can stabilize it. This is two separate optimizations: selector memoization avoids recomputation and reference churn, while React-Redux equality controls whether a changed selected result schedules an update.

For a request, `createAsyncThunk('users/load', async (id, thunkAPI) => ...)` dispatches lifecycle actions. The payload creator may use `thunkAPI.dispatch`, `thunkAPI.getState`, `thunkAPI.signal` for abort-aware work, `rejectWithValue` for a structured expected error, or `fulfillWithValue` for a customized fulfilled payload/meta. Reducers handle lifecycle actions synchronously. A thunk's request result is not itself a cache policy: deduplication, invalidation, retries, and cache lifetime may call for RTK Query.

Listener middleware runs an effect in response to matching actions or state predicates. Its `cancelActiveListeners()` can implement latest-task-wins patterns when paired with cancellation-aware async operations; cancellation does not magically undo a server request that ignores its abort signal. `take`, `condition`, `pause`, and `fork` support orchestration. Middleware order matters because each middleware wraps the next dispatch function; function-valued actions such as thunks should be handled before serializability checks inspect plain actions.

# Worked examples

Derived cart total:

```js
import { createSelector } from '@reduxjs/toolkit'

const selectLines = state => state.cart.lines
const selectProducts = state => state.products.entities
const selectCartTotal = createSelector(
  [selectLines, selectProducts],
  (lines, products) => lines.reduce(
    (sum, line) => sum + products[line.productId].price * line.quantity,
    0,
  ),
)
```

The result function runs only when its selected inputs change. In a real domain, guard missing products and define currency rounding deliberately rather than assuming floating-point arithmetic is exact.

Typed hooks:

```ts
const store = configureStore({ reducer: { cart: cartReducer } })
type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

Define these outside components so their identity is stable. The store's inferred dispatch includes thunk-aware typing when configured by RTK.

# Misconceptions and edge cases

- “Redux Toolkit mutates state.” Case reducers mutate an Immer draft; the produced Redux state remains immutable. The same syntax outside an Immer reducer mutates a real object.
- “Every value belongs in Redux.” Local UI details and derived values often do not.
- “Memoize every selector.” Memoization has complexity and cache behavior; use it when derivation or reference identity warrants it.
- “A rejected thunk means the network failed.” It may represent a condition cancellation, abort, a thrown error, or `rejectWithValue`; inspect the action metadata and payload/error appropriately.
- “Serializable checks prohibit all non-serializable runtime values.” Configure exceptions are possible, but placing live resources in the persistent state tree remains risky.
- “Listener cancellation rolls back effects.” It can signal cancellation and stop cooperative tasks, but cannot reverse external side effects already accepted by another system.
- “`connect()` disappeared.” It still works, but its current deprecation marker changes the recommendation for new code.

# Knowledge checks with answers

1. Why derive a cart total instead of storing it? **Because it is computable from canonical cart and product facts; duplicating it risks divergence.**
2. What must a reducer avoid? **Effects and mutation of prior state; it must compute a deterministic transition.**
3. Why can `useSelector` cause repeated renders for `{a, b}`? **The default comparison is reference equality, and a newly allocated object has a new reference.**
4. When is listener middleware a better conceptual fit than a thunk? **When workflow reacts to actions/state over time, such as debounce or take-latest orchestration.**
5. What is current guidance for `connect()`? **Hooks are recommended for new component code; `connect()` is deprecated as of 9.3.0 but remains operational and is not planned for removal.**

Sources: [Redux Toolkit Getting Started](https://redux.js.org/toolkit/introduction/getting-started), [Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors), [React-Redux Hooks](https://redux.js.org/react-redux/api/hooks), [React-Redux connect status](https://redux.js.org/react-redux/api/connect), [RTK Listener Middleware](https://redux.js.org/toolkit/api/createListenerMiddleware).
