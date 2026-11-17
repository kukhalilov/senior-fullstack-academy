# React state reducer context and action hooks — Reference: Hook call discipline and composition

Sources: React 19.3 [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) and [`use`](https://react.dev/reference/react/use).

## Scope and version

This reference covers Hook call placement and custom Hook reuse. The complete React Hook API catalog is in t07-006/t07-019 and nearby topics.

## Stable call order

React Hooks are functions such as `useState` that React associates with a component's render identity and stable call order. Call Hooks only at the top level of a function component or custom Hook, before early returns. Do not call Hooks in conditions, loops, nested functions, event handlers, class components, `try`/`catch`/`finally`, or functions passed as callbacks to other Hooks. If conditional behavior needs separate state, extract a component or conditionally render one. Stable order lets React match each Hook's state to the same call across renders.

React 19's `use` is an API but is explicitly not a Hook. `use(context)` and `use(promise)` may appear in conditions and loops, unlike other Hooks; `use` must still be called inside a component or Hook and cannot be placed in `try`/`catch`. Promise reads suspend while pending and rejected Promises go to an Error Boundary; this lesson notes the call-rule exception while Suspense details are covered elsewhere.

The Rules of Hooks apply to all Hooks, including custom ones. A Hook's name begins with `use` followed by a capitalized descriptive word (`useOnlineStatus`). Custom Hooks can call other Hooks at their top level and encapsulate reusable stateful logic. They share logic, not state: each component calling the custom Hook gets its own independent Hook state unless it reads a shared external/context source. A custom Hook should expose the smallest useful data/actions, not mirror every implementation detail.

Hook lint rules/static analysis help catch violations, but runtime behavior can still be broken by inconsistent call structure. Do not suppress warnings merely to preserve a conditional call; refactor the component boundary or move condition into the Hook's logic while keeping calls unconditional.

## Example

```jsx
function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  // subscription setup omitted: belongs to the Effects lesson
  return online;
}

function Header({ showStatus }) {
  const online = useOnlineStatus(); // unconditional top-level call
  return showStatus ? <span>{online ? 'Online' : 'Offline'}</span> : null;
}
```

The Hook call remains stable even when rendering the indicator is conditional. Two components calling `useOnlineStatus` have separate local state unless the Hook reads shared context/store.

## Cross-item comparison

Calling a custom Hook reuses implementation logic but does not create shared state. Calling a component through JSX creates a separate component identity with its own Hook sequence. Calling a Hook conditionally breaks stable state association.

## Common mistakes

Using a lowercase custom Hook name; calling a Hook in an event; conditionally calling `useState`; placing a Hook after an early return; expecting a custom Hook's local state to be shared; treating the React 19 `use` API as a Hook or assuming the exception applies to `try`/`catch`; and implementing a custom Hook as a component that returns JSX when the intent is reusable behavior.

## Knowledge checks with answers

1. **Where can Hooks be called?** Top level of a function component or custom Hook.
2. **Why not call an ordinary Hook in a condition?** It changes Hook call order between renders. The React 19 `use` API has a narrowly documented exception.
3. **Does a custom Hook share state automatically?** No, each caller gets isolated state.
4. **What naming convention applies?** `use` prefix and descriptive capitalized continuation.
5. **Can every Hook be called in a condition?** No. React 19's `use` API is a specific exception and is not a Hook; ordinary Hooks retain the top-level/stable-order rule.

## How this group fits the mental model

Stable Hook order lets React associate each call with the correct state/effect slot for a component identity.

## Supplied names explained

The inventory below covers the Rules of Hooks, top-level/stable-order requirements, prohibited positions, React 19's distinct `use` API exception, custom Hook naming, and per-caller isolation.

## Examples

The `Header` example keeps its Hook call unconditional while conditionally returning UI.

## Exact terms covered


### Exact terms covered

- `Rules of Hooks`
- `Call Hooks at the top level`
- `Stable Hook call order`
- `Do not call Hooks in conditions`
- `Do not call Hooks in loops`
- `Do not call Hooks in event handlers`
- `use API is not a Hook`
- `use API conditional and loop exception`
- `use API cannot be called in try/catch`
- `Custom Hook`
- `Custom Hook naming convention`
- `Hook state is isolated per calling component`
