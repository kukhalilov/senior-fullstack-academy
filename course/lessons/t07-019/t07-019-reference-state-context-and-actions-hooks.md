# React API reference React hooks components context and resources — Reference: State, context, and action hooks

## Scope and version

This reference covers the five names supplied for state, context, and action-oriented Hooks: `useState`, `useReducer`, `useContext`, `useOptimistic`, and `useActionState`. The behavior described is the React 19.3 documentation snapshot. Hooks are called at the top level of a function component or custom Hook, in the same order on every render. The `use` API is a separate exception and is taught in its own reference. [Built-in Hooks](https://react.dev/reference/react/hooks) [React versions](https://react.dev/versions)

## How this group fits the mental model

These APIs determine what the component remembers and how pending work is represented. `useState` is the direct local state primitive; `useReducer` centralizes transitions; `useContext` subscribes to a tree-provided value; `useOptimistic` renders a temporary optimistic view during an Action; and `useActionState` couples an async Action with its previous result and pending flag. Choose state based on ownership and transition complexity, not on a desire to avoid learning a neighboring API.

## Supplied names explained

- `useState` declares a state variable and setter. It accepts any initial value; a function is treated as a lazy initializer called to calculate initial state, so use a wrapper when the state itself should be a function. The initializer is ignored after the initial render and must be pure. The setter accepts a replacement value or updater function receiving the pending previous value. State is a render snapshot; multiple updates are queued and may be batched. Objects/arrays should be replaced immutably. Setting an `Object.is`-equal value can let React skip rendering. Setter identity is stable. A changed component `key` can intentionally reset its state. Development checks can call initializers/updaters more than once to expose impurity. [useState](https://react.dev/reference/react/useState)
- `useReducer` declares state managed by a pure reducer `(state, action) => nextState`, with an initial argument and optional initializer `(initialArg) => initialState`. Dispatch queues an action; it does not return the next state synchronously. Reducers must be pure, deterministic calculations. It is useful when many events produce related transitions or when update logic should be separately testable. Returning the same state by identity may let React skip rendering. Dispatch identity is stable. Development checks can call reducers/initializers more than once to expose impurity. [useReducer](https://react.dev/reference/react/useReducer)
- `useContext` reads and subscribes to the nearest provider for the supplied Context object. A consumer updates when that provider's value changes by `Object.is`; `memo` does not block fresh context values. The `defaultValue` passed to `createContext` is used only if there is no matching provider; a provider whose value is `undefined` supplies `undefined`. The provider must be above the calling component; a provider returned by that same component cannot affect its own `useContext` call. Provider and consumer must use the exact same Context object identity, so duplicated modules can break a seemingly correct tree. [useContext](https://react.dev/reference/react/useContext)
- `useOptimistic` returns the current optimistic value and a setter-like dispatcher. During an Action, dispatch can apply a reducer to the latest base/optimistic state so overlapping updates need not be calculated from a stale closure. The setter must be called inside an Action/Transition; when no Action is pending, the optimistic value is the supplied base value. The server or authoritative state must still be updated; optimistic rendering is not persistence, rollback policy, or server validation. [useOptimistic](https://react.dev/reference/react/useOptimistic)
- `useActionState` accepts an Action function, initial state, and optional permalink; it returns `[state, dispatchAction, isPending]`. The Action receives previous state and the submitted payload, commonly `FormData`, and may be asynchronous and perform side effects. Dispatch from a form `action` or another Action to get pending coordination. Actions dispatched by this hook are queued sequentially; later Actions receive the prior Action's returned state. If an Action throws, queued Actions are cancelled and the error reaches the nearest Error Boundary. With a Server Function, the initial state must be serializable. The optional permalink supports progressive enhancement for a form before hydration when the page URL needs to identify the destination; the same form/action/permalink must be rendered at the destination. It does not make an Action trusted or authorized. [useActionState](https://react.dev/reference/react/useActionState)

## Cross-item comparison

| Need | Use | Key distinction |
|---|---|---|
| One or a few independently updated values | `useState` | Lowest ceremony; updater can derive from prior value |
| Explicit state machine or coupled transitions | `useReducer` | Event/action vocabulary keeps transition rules centralized |
| Read ancestor-provided value | `useContext` | Subscription follows provider tree, not a prop chain |
| Show a temporary result while an Action runs | `useOptimistic` | Temporary UI overlay; authoritative state remains elsewhere |
| Model result and pending status of an Action | `useActionState` | Action consumes prior result and payload |

`useState` and `useReducer` both create local state; prefer the simpler one until transitions are meaningfully related. `useOptimistic` is often paired with `useActionState`, but they solve different pieces of the UI. [Built-in Hooks](https://react.dev/reference/react/hooks)

## Examples

### State snapshot and functional update

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  function incrementTwice() {
    setCount(value => value + 1);
    setCount(value => value + 1);
  }
  return <button onClick={incrementTwice}>Count: {count}</button>;
}
```

The click queues two updater functions. They compose to increment by two. Replacing each with `setCount(count + 1)` would queue the same snapshot-derived replacement twice and usually increment only once.

### Reducer for a related transition set

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'added': return [...state, action.item];
    case 'removed': return state.filter(item => item.id !== action.id);
    default: throw new Error(`Unknown action: ${action.type}`);
  }
}
```

The reducer is pure and returns a new array. In a production design, an unknown action may be handled according to the application’s error policy, but silently returning a malformed state hides wiring bugs.

### Context default is not an implicit provider

```jsx
const ThemeContext = createContext('light');
function Toolbar() {
  const theme = useContext(ThemeContext);
  return <button data-theme={theme}>Save</button>;
}
function App() {
  return <ThemeContext value="dark"><Toolbar /></ThemeContext>;
}
```

In React 19, render the Context object itself as a provider; `.Provider` remains supported for compatibility with older React versions. With no provider above `Toolbar`, the value is `light`. A provider with `value={undefined}` returns `undefined`, not the default. Keep the Context object identity stable by defining it outside component render. `<Context.Consumer>` is the older render-prop reading API; new component code normally uses `useContext`. [createContext](https://react.dev/reference/react/createContext)

## Common mistakes

- Mutating state objects or arrays and passing back the same identity; make a new value.
- Reading a state variable immediately after its setter and expecting the next render’s value.
- Creating Context inside a component so each render makes a different Context object.
- Assuming a `memo` wrapper prevents context-driven re-rendering.
- Treating optimistic state as proof that the server accepted a mutation.
- Dispatching an Action with unvalidated input or assuming `useActionState` handles authorization.
- Putting unrelated, rapidly changing values in one broad Context and causing unnecessary consumer updates.

## Knowledge checks with answers

1. **Which API centralizes transitions based on named actions?** `useReducer`.
2. **Does `useContext` use its default when a provider exists with `value={undefined}`?** No; the provider value is `undefined`.
3. **What value does a state setter change inside the current event handler closure?** None; it queues an update for a later render.
4. **Does `useOptimistic` persist a successful update?** No. The authoritative/base state must be updated by the Action or other owner.
5. **What does `useActionState` return?** The current action result, a dispatch function, and a pending boolean.

