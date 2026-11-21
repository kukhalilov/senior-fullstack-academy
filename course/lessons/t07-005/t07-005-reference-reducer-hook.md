# React state reducer context and action hooks — Reference: Reducer state transitions

Sources: React 19.3 [`useReducer`](https://react.dev/reference/react/useReducer).

## Scope and version

This reference covers reducer-based local state. `useActionState` is a separate async Action hook covered next.

## API contract

`useReducer(reducer, initialArg, init?)` returns `[state, dispatch]`. Call at the top level. The reducer receives current state and an action value and returns next state; actions are conventionally objects with a `type`, but React does not require that shape. `initialArg` is used directly if no initializer exists; optional `init(initialArg)` computes initial state lazily. Reducer and initializer must be pure. Dispatch queues an action for a later render; it does not update the current state snapshot. Dispatch has stable identity and returns no value. In development Strict Mode may call the reducer and initializer twice to expose impurity. If the returned state is `Object.is`-equal to current state, React can skip rendering the component and its children.

Actions are plain values describing intent (`{type: 'item/added', item}`). Reducers switch on action type and return immutable next state. Every branch must return valid state; avoid accidental `undefined`, mutation, I/O, random values, or reading mutable globals. A reducer is a state transition function `next = reducer(current, action)` and is easy to test independently.

Use `useReducer` when many updates affect one coherent state shape or transitions need named reasons. Use `useState` for a few independent values and simple updates; reducer boilerplate is not inherently better. Reducers can centralize update logic but should not become a dumping ground for unrelated domain operations or async side effects. Dispatch from handlers; effects/services manage asynchronous I/O and then dispatch results where appropriate.

## Example

```js
function reducer(state, action) {
  switch (action.type) {
    case 'quantity/increment':
      return { ...state, quantity: state.quantity + 1 };
    case 'item/renamed':
      return { ...state, name: action.name };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

const [state, dispatch] = useReducer(reducer, initialConfig, createInitialState);
```

The initializer transforms `initialConfig` once. Reducer returns new state objects. In reusable libraries, exhaustive action typing can make unhandled variants compile-time errors; runtime unknown actions should have deliberate behavior.

## Cross-item comparison

| `useState` | `useReducer` |
|---|---|
| Direct/functional updates | Explicit action-based transitions |
| Minimal ceremony for independent values | Clear when transitions coordinate multiple fields |
| Logic often near event handlers | Transition logic centralized and independently testable |

## Common mistakes

Mutating the old state; dispatching during render; performing async work in reducer; failing to return state for an action; recreating expensive initial state without `init`; and adopting reducer where independent state variables are clearer.

## Knowledge checks with answers

1. **What should a reducer do?** Purely return next state from current state and action.
2. **What is `init` for?** Calculate initial reducer state lazily from `initialArg`.
3. **When is reducer preferable?** Coordinated, named state transitions with centralized logic.
4. **Can reducer perform fetch?** No; keep reducer pure and perform effects outside it.

## How this group fits the mental model

Reducer and action model state changes as queued messages transformed into a new render snapshot.

## Supplied names explained

The exact inventory below includes the `useReducer` signature, reducer/action/dispatch, initializer, purity/transition, and comparison with state.

## Examples

The quantity/name reducer demonstrates multiple named transitions over one coherent state object.

## Exact terms covered

### Exact terms covered

- `useReducer(reducer, initialArg, init?)`
- `Reducer function`
- `Action object`
- `dispatch function`
- `Stable dispatch identity`
- `Object.is reducer state bailout`
- `Reducer initializer function`
- `Reducer and initializer Strict Mode double call`
- `Reducer purity`
- `Reducer state transition`
- `Reducer versus useState`
