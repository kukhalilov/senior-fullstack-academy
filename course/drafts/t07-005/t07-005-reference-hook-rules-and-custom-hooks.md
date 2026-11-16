# React state reducer context and action hooks — Reference: Hook call discipline and composition

Sources: React 19.3 [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks).

## Scope and version

This reference covers Hook call placement and custom Hook reuse. The complete React Hook API catalog is in t07-006/t07-019 and nearby topics.

## Stable call order

Hooks are special functions that React associates with a component's render identity and call order. Call Hooks only at the top level of a function component or custom Hook, before early returns. Do not call Hooks in conditions, loops, nested functions, event handlers, class components, `try`/`catch`/`finally`, or functions passed as callbacks to other Hooks. If conditional behavior needs separate state, extract a component or conditionally render one. Stable order lets React match each Hook's state to the same call across renders.

The Rules of Hooks apply to all Hooks, including custom ones. A Hook's name begins with `use` followed by a capitalized descriptive word (`useOnlineStatus`). Custom Hooks can call other Hooks at their top level and encapsulate reusable stateful logic. They share logic, not state: each component calling the custom Hook gets its own independent Hook state unless it reads a shared external/context source. A custom Hook should expose the smallest useful data/actions, not mirror every implementation detail.

Hook lint rules/static analysis help catch violations, but runtime behavior can still be broken by inconsistent call structure. Do not suppress warnings merely to preserve a conditional call; refactor the component boundary or move condition into the Hook's logic while keeping calls unconditional.

## Example

```js
function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
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

Using a lowercase custom Hook name; calling Hook in an event; conditionally calling `useState`; placing a Hook after an early return; expecting a custom Hook's local state to be shared; and implementing a custom Hook as a component that returns JSX when the intent is reusable behavior.

## Knowledge checks with answers

1. **Where can Hooks be called?** Top level of a function component or custom Hook.
2. **Why not in a condition?** It changes Hook call order between renders.
3. **Does a custom Hook share state automatically?** No, each caller gets isolated state.
4. **What naming convention applies?** `use` prefix and descriptive capitalized continuation.

## How this group fits the mental model

Stable Hook order lets React associate each call with the correct state/effect slot for a component identity.

## Supplied names explained

The inventory below covers the Rules of Hooks, top-level/stable-order requirements, prohibited positions, custom Hook naming, and per-caller isolation.

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
- `Custom Hook`
- `Custom Hook naming convention`
- `Hook state is isolated per calling component`
