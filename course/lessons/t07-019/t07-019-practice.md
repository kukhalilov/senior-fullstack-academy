# React API reference React hooks components context and resources — Exercises and worked solutions

## Goals

Practice choosing APIs based on data ownership and lifecycle, explain render behavior without guessing, and spot current React API pitfalls. Exercises intentionally combine the supplied state, refs/effects, scheduling, resource, and built-in component inventories. [Built-in Hooks](https://react.dev/reference/react/hooks) [React APIs](https://react.dev/reference/react/apis) [Built-in React Components](https://react.dev/reference/react/components)

## Worked example

### Scenario

A page has a text input and a list with expensive filtering. The input must respond immediately; the results may lag slightly. The current implementation puts `query` and `filteredResults` in state, then updates `filteredResults` from an Effect whenever query changes.

### Reasoning

`filteredResults` is derived from `query` and `items`, so the Effect introduces a stale render and extra update. Calculate it from the deferred query during render. Keep the input bound to urgent `query` state and pass `useDeferredValue(query)` to the expensive results subtree. To make the urgent render skip the expensive filter while the deferred query is still old, memoize the calculation or isolate it in a memoized child. `useDeferredValue` has no fixed delay and does not cancel network requests. [useDeferredValue](https://react.dev/reference/react/useDeferredValue) [useEffect](https://react.dev/reference/react/useEffect)

```jsx
function SearchPage({ items }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(
    () => items.filter(item => item.name.includes(deferredQuery)),
    [items, deferredQuery]
  );
  return <>
    <input value={query} onChange={event => setQuery(event.target.value)} />
    <Results items={results} />
  </>;
}
```

Here `useMemo` is justified by the goal: when only `query` changes but `deferredQuery` remains old, the filter result is reused and the urgent render avoids repeating the expensive work. Memoization remains an optimization cache, not durable storage, and it does not alter priority by itself. If `items` changes on every parent render, stabilize its ownership or isolate the slow subtree. [useMemo](https://react.dev/reference/react/useMemo)

## Exercises

### Exercise 1: choose storage and update primitive

A checkout component holds quantity, selected shipping method, and a DOM input node. Quantity and shipping method appear in the UI. The input node is used only to focus the field after validation. The shipping update also recomputes a subtotal from immutable line items.

Choose state/ref primitives. Explain whether subtotal should have its own state, and when reducer-based updates are justified.

### Exercise 2: repair an Effect

```jsx
function Greeting({ firstName, lastName }) {
  const [name, setName] = useState('');
  useEffect(() => setName(`${firstName} ${lastName}`), [firstName, lastName]);
  return <h1>Hello {name}</h1>;
}
```

Rewrite this component and explain the extra render and stale-output risk in the original.

### Exercise 3: pending asynchronous resource

A child reads a Promise with `use(promise)`. Design the boundary structure for both pending and rejected results. The Promise is currently created directly inside the child component on every render. Identify the bug and the correct ownership change.

### Exercise 4: retain hidden editor state

A settings panel should keep text input state while hidden, but must disconnect its WebSocket while hidden. Compare conditional unmount, CSS `display: none`, and `<Activity mode="hidden">`. Describe what happens to state and Effects in each choice.

### Exercise 5: measured external store

A component subscribes to a third-party store by calling `store.subscribe` in an Effect and copying `store.getState()` into React state. It sometimes displays a stale combination during rapid concurrent updates. Which supplied API is designed for this integration? State the snapshot stability and server snapshot requirements.

### Exercise 6: specify a View Transition

A product thumbnail should animate into a product-detail hero when a user selects a product. Define the conceptual use of `name`, a Transition, and the `share` behavior. State two reasons why the animation might not run or might be incorrect.

## Progressive hints

1. Separate render-driving values from imperative handles. Ask whether a value can be derived without synchronization.
2. A value that is a pure function of current props does not need an Effect.
3. Suspense handles pending work; Error Boundaries handle thrown/rejected errors. Promise identity must be stable across retries.
4. CSS hiding does not perform React Effect cleanup. Conditional unmount releases state. Activity is designed to retain UI state while cleaning up Effects.
5. Look for the React API that provides both `subscribe` and snapshot readers under concurrent rendering.
6. The identity must match across locations and updates must be React-coordinated; a shared animation has a dedicated configuration.

## Complete solutions

### Solution 1

Use `useState` (or `useReducer` if checkout changes form a larger, coupled transition model) for quantity and selected shipping method because they affect rendered output. Use `useRef` for the input DOM node because changing the node handle should not itself render. Derive subtotal from line items, quantity, and shipping choice during render; do not copy it to state and update it in an Effect. A reducer is worthwhile when actions such as `lineAdded`, `quantityChanged`, and `shippingChanged` need coordinated invariants or centralized validation. [useState](https://react.dev/reference/react/useState) [useReducer](https://react.dev/reference/react/useReducer) [useRef](https://react.dev/reference/react/useRef)

### Solution 2

```jsx
function Greeting({ firstName, lastName }) {
  const name = `${firstName} ${lastName}`;
  return <h1>Hello {name}</h1>;
}
```

The original first renders with the previous `name`, commits it, then the Effect schedules another render. If the component is checked/remounted or the Effect has not run yet, visible output can lag behind current props. Derived render data needs no Effect. [useEffect](https://react.dev/reference/react/useEffect)

### Solution 3

Place the child below a `<Suspense fallback={...}>` and inside an Error Boundary. The nearest Suspense boundary shows its fallback while pending; the Error Boundary handles rejection. Move Promise creation to a data/framework layer that provides a stable cached Promise or otherwise follows its supported resource integration. Creating a fresh Promise every client render can cause repeated suspension and an uncached Promise warning. `use` does not fetch or cache automatically. [`use`](https://react.dev/reference/react/use) [Suspense](https://react.dev/reference/react/Suspense)

### Solution 4

Conditional unmount removes the editor and runs Effect cleanup, but local state is lost. CSS hiding preserves state and does not by itself clean up a WebSocket Effect. `<Activity mode="hidden">` retains state, visually hides the subtree, cleans up its Effects, and may still render children at lower priority; revealing restores state and recreates Effects. Therefore Activity best matches the stated requirements, provided the WebSocket is connected in an Effect with correct cleanup. [Activity](https://react.dev/reference/react/Activity)

### Solution 5

Use `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`. `subscribe` must return an unsubscribe function. `getSnapshot` must return a cached immutable snapshot, preserving identity until the store changes; otherwise React may repeatedly render. `getServerSnapshot` must represent the initial server/hydration value consistently. This API gives React a protocol to recheck the snapshot during rendering and avoid tearing. [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)

### Solution 6

Wrap the thumbnail and hero in `<ViewTransition name={`product-${id}`}>` at their respective locations so React can match the same product identity. Put selection state update inside `startTransition`; use the `share` configuration or class to define the matched shared-element animation. It may fail if names are duplicated, the identity changes between locations, the update is urgent/immediate instead of transition-coordinated, the framework/runtime lacks support, or relevant CSS/classes do not define an animation. Do not call `document.startViewTransition` separately for the same React update. [ViewTransition](https://react.dev/reference/react/ViewTransition) [startTransition](https://react.dev/reference/react/startTransition)

## Tests and edge cases

- If `setState` receives the same `Object.is` value, React may skip rendering; code must not depend on an extra render.
- A context provider with `value={undefined}` does not fall back to the Context's default.
- A ref mutation never schedules a render.
- A pending Promise with no Suspense boundary cannot display the intended local fallback; a rejected Promise needs an Error Boundary.
- A hidden Activity containing only raw text has no DOM element to hide and therefore produces no hidden text output.
- `useId` must not replace stable list keys.
- `useTransition` cannot control a text input's own state; keep the input's update urgent.

## Reflection questions

1. Which decisions above were about data ownership rather than performance?
2. What would you measure before adding memoization?
3. How would the design change if the settings panel should discard stale drafts on close?
4. Which responsibilities remain outside React when using a Server Function Action?

