# React state reducer context and action hooks — Reference: State declaration and update APIs

Sources: React 19.3 [`useState`](https://react.dev/reference/react/useState), [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot), [Queueing State Updates](https://react.dev/learn/queueing-a-series-of-state-updates), [Updating Objects in State](https://react.dev/learn/updating-objects-in-state), [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state), [React 18 release](https://react.dev/blog/2022/03/29/react-v18), and [React 18 upgrade guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide).

## Scope and version

This chapter covers local state declaration and updates. Tree identity/key rules are covered in t07-003; effects and external synchronization are in t07-006.

## Declaration and snapshot

`useState(initialState)` returns a pair: state value and set function. Call it at top level. Initial state can be a value of any type. A function passed as initialState is treated as a lazy initializer; it is called to compute initial state and should be pure. Initial argument is ignored on later renders. Each render's state variable is a fixed snapshot. Setting state schedules a later render and does not change the current local binding or closures.

Set function can receive a next value or a functional updater function. If a queued next value depends on previous state, use `setState(previous => next)`. React queues updater functions and applies them in order, so repeated increments compose; repeated `setState(count + 1)` calls read the same render snapshot and may collapse to the same value. React batches updates in event handling; state is visible on the next render, not synchronously inside the same handler.

React compares next and current state with `Object.is`. If equal, React can skip rendering the component and its children (it may still call the component in some circumstances before bailing out; do not rely on invocation counts). The setter has stable identity and returns `undefined`. Mutating an object/array then passing the same reference can make React treat it as unchanged and also violates purity. Replace objects/arrays immutably; copy nested paths that change. `Array.map`, `filter`, spreads, and immutable transformations are common tools.

## Lazy initialization, reset, and previous values

Lazy initializer avoids recalculating an expensive initial value on every render, but the function expression itself is still created; keep it pure. In development Strict Mode may call initializers/updaters twice to find impurity. If the state value itself is a function, wrap it: initialize with `useState(() => fn)` and update with `setFn(() => nextFn)`, because passing a function directly means initializer/updater. Use a key to reset a subtree when logical identity changes rather than manually clearing many local values. “Storing previous-render information” is a specialized render-time adjustment pattern documented by React; first ask whether the value is derivable or belongs in a ref/effect/state elsewhere. Avoid extra state that can be derived from current props/state because it causes synchronization bugs.

React 18 expanded automatic batching to updates from promises, timers, native handlers, and other sources when using `createRoot`; earlier versions primarily batched updates in React event handlers. Batching groups updates, but does not make state mutate synchronously in the current handler.

## Example

```js
const [tasks, setTasks] = useState(() => loadInitialTasks());

function addTask(task) {
  setTasks(previous => [...previous, task]);
}

function renameTask(id, name) {
  setTasks(previous => previous.map(task =>
    task.id === id ? { ...task, name } : task));
}
```

Initializer runs for initial state; updates return new array/object references. If update depends on prior queued state, updater form avoids stale snapshots.

## Cross-item comparison

| Update form | Use when |
|---|---|
| `setState(value)` | Next value is already known and independent |
| `setState(previous => next)` | Next value depends on queued prior state |
| Lazy initializer function | Initial calculation is expensive or nontrivial |
| Key-based reset | Entire subtree represents a different logical entity |

## Common mistakes

Mutating objects/arrays; expecting setter to change current snapshot; using a direct update for cumulative queued changes; putting side effects in updater/initializer; duplicating derivable state; and resetting state with imperative chains instead of an identity boundary.

## Knowledge checks with answers

1. **What does setter change immediately?** It queues work; current render state stays the same.
2. **What is batching?** Multiple updates are processed together to avoid unnecessary renders.
3. **Why return a new object?** React uses `Object.is`; same reference can be treated as unchanged.
4. **How should a previous-state increment be expressed?** Functional updater such as `n => n + 1`.
5. **How store a function in state?** Wrap it in an initializer/updater function (`useState(() => fn)`, `setFn(() => nextFn)`).

## How this group fits the mental model

State is component memory attached to tree identity; updates queue a new snapshot for future rendering.

## Supplied names explained

The exact inventory below covers declaration, setter, lazy/updater functions, snapshots, queues, batching, equality bailout, immutability, key reset, and previous-render patterns.

## Examples

The task example uses lazy initialization and immutable array/object replacements.

## Exact terms covered

### Exact terms covered

- `useState(initialState)`
- `State variable`
- `set function`
- `Stable state setter identity`
- `State setter returns undefined`
- `Functional updater function`
- `Lazy initializer function`
- `Storing a function as state value`
- `State snapshot per render`
- `State update queue`
- `State batching`
- `React 18 automatic batching with createRoot`
- `Object.is state bailout`
- `Strict Mode initializer/updater double call`
- `Replacing objects in state`
- `Replacing arrays in state`
- `Resetting state with a key`
- `Storing previous-render information`

