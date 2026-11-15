# React API reference React hooks components context and resources — Core concepts and how they fit together

## Learning objectives

By the end, explain why React APIs are grouped around render data, external synchronization, imperative escape hatches, scheduling, and subtree boundaries; select the appropriate primitive for a scenario; predict what causes a render; and explain why `use` has different call rules from Hooks.

## Prerequisites

You should know JavaScript functions, closures, objects, promises, JSX, and the idea that a component returns a description of UI. A render is React evaluating components to calculate that description. A commit is React applying the accepted changes to the host environment, usually the DOM. An external system is something React does not own, such as a browser subscription, timer, socket, or imperative widget.

## Core concepts

### Render is a calculation, not a command sequence

React may render a component more than once, abandon work, or render it in development checks. Therefore rendering must be pure: same inputs should describe the same UI, without mutating external state or starting subscriptions. State setters enqueue a new render; they do not alter the state variable in the currently executing closure. A functional update such as `setCount(count => count + 1)` composes with queued updates and avoids stale captured values. Reducers make multi-field transitions explicit when the next state depends on the previous state and an action.

### State, context, and derived values have different owners

Local state belongs to a component position in the rendered tree. Replacing the component type or changing its key can reset that state; moving a component in ways that change its identity may also reset it. Context is a tree-scoped value provided above a consumer; consumers subscribe to the nearest matching provider. A value that can be calculated from existing props/state should usually be calculated during render, not copied into state and repaired by an Effect. That avoids a stale intermediate render and a second update cycle. [Built-in Hooks](https://react.dev/reference/react/hooks)

`useContext` follows Hook call-order rules. `use(context)` reads context too, but the `use` API can appear in loops and conditions; it still must be called inside a component or Hook, and the current documentation does not support reading context with `use` in Server Components. This exception does not make ordinary Hooks conditional. [`use`](https://react.dev/reference/react/use)

### Refs are mutable but not reactive

A ref object persists across renders and its `.current` can hold a DOM node, timer identifier, or other imperative handle. Changing `.current` does not schedule a render. That is exactly why refs suit values that do not determine visual output and why they are the wrong storage for UI state. Read/write refs in event handlers or Effects; arbitrary render-time mutation breaks purity. In React 19, function components can receive `ref` as a prop; `useImperativeHandle` still lets a component intentionally expose a constrained imperative interface instead of its implementation details. [React 19](https://react.dev/blog/2024/12/05/react-19)

### Effects are synchronization processes

An Effect has a start/stop lifecycle: setup connects to an external system, cleanup disconnects or reverses that setup. When dependencies change, React cleans up the old synchronization before starting the new one. Development Strict Mode may run an extra setup-cleanup cycle to expose missing cleanup. Dependencies describe the reactive values the setup reads; they are not a manual “when do I want this?” switch. If code is not synchronizing with something external, first ask whether the work belongs in render, an event handler, or derived data instead.

`useEffect` generally runs after paint for non-interaction updates. `useLayoutEffect` runs before repaint and blocks painting, so use it for layout measurement or correction that must not visibly flicker. `useInsertionEffect` runs earlier for style insertion and is intended mainly for CSS-in-JS library authors; it is not a faster general Effect. Effects do not run during server rendering. [Built-in Hooks](https://react.dev/reference/react/hooks)

### Resources can suspend rendering

The `use` API reads a supported resource while rendering. For a pending Promise, the component suspends; the nearest `<Suspense>` boundary can show fallback UI. A rejected Promise is handled by the nearest Error Boundary. Promise identity and caching matter: creating an uncached Promise on every client render can cause repeated suspension and warnings. Frameworks and data libraries often own this caching/streaming integration. `use` is not a Hook despite its name; unlike Hooks it may be conditional or inside loops, but its allowed resource types and component-only call context still apply. [`use`](https://react.dev/reference/react/use) [Components](https://react.dev/reference/react/components)

### Scheduling affects responsiveness, not correctness guarantees

`startTransition` marks synchronously scheduled state updates as non-urgent. `useTransition` gives the component an `isPending` signal plus a start function. `useDeferredValue` lets a slower part of the tree lag behind a rapidly changing value. These APIs can let urgent UI such as text input update first; they do not debounce network calls, cancel arbitrary side effects, guarantee a particular number of renders, or provide a transaction across server and client. Transition updates can be interrupted by newer urgent work. For async Actions, understand the current transition/action behavior and keep user-visible pending/error states explicit. [React APIs](https://react.dev/reference/react/apis) [Hooks](https://react.dev/reference/react/hooks)

### Memoization is an optimization contract, not durable storage

`useMemo` caches a calculated value and `useCallback` caches a function identity between renders when dependencies compare equal. `memo` can skip rendering a component when its props compare equal. React may discard memoized values in some situations; code must remain correct if recalculation occurs. Memoization can add complexity, retain memory, and fail when a dependency changes every render. First make rendering pure and profile the actual bottleneck. `useId` is for stable accessibility-related IDs across server/client rendering, not list keys. `useSyncExternalStore` is the subscription contract for external stores and includes a server snapshot path for hydration consistency. [Hooks](https://react.dev/reference/react/hooks)

## Mechanisms and relationships

| Requirement | Primitive | Why it fits | Common wrong substitute |
|---|---|---|---|
| Remember displayed value | `useState` or `useReducer` | Participates in rendering | Mutating `useRef` |
| Share value down a tree | `createContext` + `useContext` | Subscription follows provider ancestry | Global mutable variable |
| Synchronize socket/listener/widget | Effect with cleanup | Ties connection to committed lifecycle | Effect that copies derived props into state |
| Hold DOM or timer handle | `useRef` | Mutation does not trigger render | State update solely to retain a handle |
| Read Promise during render | `use` under Suspense/Error Boundary | React coordinates pending/rejected result | Hand-written “isLoading” Effect for every source |
| Keep typing urgent, defer heavy view | Transition or deferred value | Separates update priority | Assuming `useMemo` changes priority |
| Preserve hidden subtree state while stopping Effects | `<Activity>` | React-managed hidden lifecycle | CSS `display:none` alone |

Context provider identity and value are also important: a newly allocated object value can cause all consumers to observe a changed value even if its fields are equivalent. Split context or stabilize values only when measurements and semantics warrant it. A Context `defaultValue` is a static fallback used when there is no matching provider; it is not a mutable global default. [createContext](https://react.dev/reference/react/createContext)

## Worked examples

### Avoid an Effect for derived data

```jsx
function Cart({ items }) {
  const [coupon, setCoupon] = useState('');
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discounted = coupon === 'SAVE10' ? total * 0.9 : total;
  return <output>{discounted.toFixed(2)}</output>;
}
```

The total is derived from current inputs. Storing it in state and updating it in an Effect would produce an avoidable stale render and another render. Add `useMemo` only if the calculation is measurably expensive or stable identity is needed by a memoized child.

### Synchronize an external subscription

```jsx
function OnlineStatus({ roomId }) {
  const [online, setOnline] = useState(false);
  useEffect(() => {
    const connection = connect(roomId);
    connection.on('online', () => setOnline(true));
    connection.on('offline', () => setOnline(false));
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
  return <p>{online ? 'Online' : 'Offline'}</p>;
}
```

This sketch assumes `connect` returns an object whose `on` handlers are removed by `disconnect`; a real library may require explicit unsubscription. The dependency means a room change cleans up the old connection and starts a new one.

## Misconceptions and edge cases

- “A setter changes the current variable.” It queues work; the current render's state value stays fixed.
- “An Effect runs once if I pass `[]`.” It has a lifecycle; remounts and development checks can run setup again.
- “Every value should be memoized.” Memoization is an optimization and can hide unclear ownership.
- “A ref update will refresh the UI.” It will not; use state when the value affects render.
- “`use` is an ordinary Hook.” Its Promise/context resource behavior has special suspension and conditional-call rules.
- “`<Activity mode="hidden">` stops all computation.” Hidden children may still re-render at lower priority; their Effects are cleaned up, state retained.
- “A Transition makes a server mutation atomic.” It is a UI scheduling mechanism; validate, authorize, and make server operations safe independently.

## Knowledge checks with answers

1. **A component stores a computed `fullName` in state and updates it whenever first or last name changes. Better model?** Compute `fullName` during render; it is derived data.
2. **Why does changing `ref.current` not update text?** Refs are not reactive and do not request a render.
3. **When would `useLayoutEffect` be justified over `useEffect`?** When reading/writing layout before the next paint is required to avoid visible flicker; otherwise prefer the non-blocking Effect.
4. **Can `use(Promise)` be called conditionally?** Yes, `use` may be conditional, unlike ordinary Hooks; it must still be called from a component or Hook, and suspension needs appropriate boundaries.
5. **Does `useMemo` guarantee a value survives all renders?** No. It is an optimization cache, not semantic state.

