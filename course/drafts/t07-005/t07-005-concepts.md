# React state reducer context and action hooks — Core concepts and how they fit together

Sources: React 19.3 [`useState`](https://react.dev/reference/react/useState), [`useReducer`](https://react.dev/reference/react/useReducer), [`createContext`](https://react.dev/reference/react/createContext), [`useContext`](https://react.dev/reference/react/useContext), [`useActionState`](https://react.dev/reference/react/useActionState), [`useOptimistic`](https://react.dev/reference/react/useOptimistic), [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot), and [Queueing State Updates](https://react.dev/learn/queueing-a-series-of-state-updates).

## Learning objectives

Explain state snapshots and queued updates; choose state versus reducer; update objects/arrays immutably; design context values/providers; model Actions and optimistic state; and follow Hook/custom Hook rules.

## Prerequisites

Know function components, props/events, render purity, and component identity from t07-003/004; know basic promises and asynchronous callbacks.

## Core concepts

`useState(initialState)` returns current state plus a setter. The initial argument is ignored after mount; a function argument is a lazy initializer called to obtain initial state. State is a snapshot for a render. A setter queues an update; direct values replace state, while functional updater functions receive the pending previous value. React batches updates and can bail out when the next state is `Object.is` equal. A setter does not change variables captured by the already-running event handler. When state depends on prior state, use updater functions so queued updates compose.

Objects/arrays in state should be replaced, not mutated. Copy the levels that change; nested structures need structural sharing or normalized state. Resetting with a key creates a new component identity; storing previous-render information in state is a specialized pattern, not a default substitute for deriving values.

`useReducer(reducer, initialArg, init?)` centralizes transitions. The reducer receives current state and an action object and returns next state; `dispatch` queues the action for a later render. Reducer and initializer must be pure; initializer can lazily calculate initial state. Dispatch has stable identity. Choose reducer when transition logic is complex/coordinated; useState is simpler for independent state values.

`createContext(defaultValue)` creates a context object; it does not itself store live state. A provider `<SomeContext value={value}>` supplies a value to descendants. `useContext(SomeContext)` reads the nearest provider above the calling component or the static default if none exists; a provider returned by that same component cannot affect its own hook call. Consumers subscribe to context; provider values are compared with `Object.is`, and consumers update when value changes even if memoized. Avoid recreating object/function values unnecessarily, but memoize only when it addresses a real propagation cost. Context is scoped data flow, not a mutable singleton/global store.

An Action is a function describing work that may be asynchronous. `useActionState(reducerAction, initialState, permalink?)` returns `[state, dispatchAction, isPending]`; its action receives previous state and payload. Dispatch it in an Action context (for example, an Action/transition or form Action). `isPending` indicates queued pending work for that Hook. Errors need explicit handling through the relevant error boundary/try-catch path; do not assume every rejected promise becomes a user-facing state automatically. `permalink` supports progressive-enhancement navigation with Server Functions/forms.

`useOptimistic(state, updateFn?)` returns `[optimisticState, setOptimistic]`. It presents the base value when no Action is pending and a temporary value during an Action. The optional reducer is pure and computes optimistic state from current optimistic state/action. When the Action finishes, React returns to the latest confirmed value unless the base state has been updated. Optimistic state is not server confirmation; handle failures and concurrent submissions.

Rules of Hooks: call Hooks at the top level of function components/custom Hooks, before conditional returns, in stable order. Never call in conditions, loops, event handlers, nested callbacks, or class components. Custom Hook names start with `use`; they share logic but each calling component gets isolated Hook state.

## Mechanisms and relationships

```text
render snapshot → handler queues value/updater/action → batch → next snapshot
reducer(state, action) → next state
provider value ── Object.is change → subscribed consumers render
async Action → useActionState result/pending; useOptimistic temporary projection
```

## Worked examples

```js
setCount(c => c + 1);
setCount(c => c + 1); // queued updaters compose: +2
```

An object update should replace rather than mutate: `setUser(previous => ({ ...previous, name }))`. A reducer is preferable when several fields must change together based on a named action. Use a key to reset a subtree only when the logical identity changes.

## Misconceptions and edge cases

- State setters schedule work; current render variables remain snapshots.
- Three `setCount(count + 1)` calls in one handler can all use the same snapshot; updater functions compose.
- Mutating an object and setting the same reference can bail out because `Object.is` is true.
- Context default is fallback only when no provider exists; a provider value of `undefined` is still the value.
- A context consumer rerenders on changed value even when wrapped in `memo`.
- Optimistic state is temporary and must reconcile with confirmed server state.
- Hooks in a conditional path break stable call order.

## Knowledge checks with answers

1. **Why use a functional updater?** The next value depends on the queued previous value.
2. **When choose a reducer?** When a state machine or coordinated transition logic is clearer as actions.
3. **What does context carry?** A provider value to descendant consumers, not mutable global state.
4. **What does `isPending` mean?** One or more dispatched Actions for that hook are pending.
5. **Who owns custom Hook state?** Each component instance that calls the Hook.
