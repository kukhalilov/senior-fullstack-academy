# React effects refs imperative handles and external systems — Core concepts and how they fit together

Sources: React 19.3 [`useEffect`](https://react.dev/reference/react/useEffect), [`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect), [`useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect), [`useRef`](https://react.dev/reference/react/useRef), [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle), [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), and [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

## Learning objectives

Decide whether an Effect is needed; specify dependencies; pair setup/cleanup; select effect timing; use refs without confusing them with state; expose a narrow imperative handle; and diagnose Strict Mode development behavior.

## Prerequisites

Know components, props/state snapshots, event handlers, render purity, and DOM basics from t07-003 through t07-005.

## Core concepts

Effects synchronize a committed component with external systems. `useEffect(setup, dependencies?)` runs setup after commit. Setup may return cleanup. On commits where a dependency changes, React calls cleanup using the old closure values, then setup using new values. Removal runs cleanup. Dependencies include every reactive prop, state, and component-body variable/function referenced by setup; list length/order is constant, and comparison uses `Object.is`. Omitted dependencies means rerun after every commit; empty list means no reactive values and a mount/removal synchronization cycle, still subject to development checks. Do not silence the linter to force timing; restructure code so dependencies express the true synchronization inputs.

Effects are not for deriving render values, responding to a specific user action, or copying props into state. Derive during render; handle the specific interaction in an event handler. Use Effects for subscriptions, connections, browser APIs, or widgets. For async work, abort the request or ignore stale results during cleanup so an older completion cannot overwrite newer UI. Modern frameworks often offer better data-fetching mechanisms than component Effects.

`useLayoutEffect` runs after commit but before browser repaint; use when layout must be measured/changed without flicker. It blocks repaint and can hurt performance; prefer `useEffect` otherwise. `useInsertionEffect` runs before layout Effects to inject styles for CSS-in-JS libraries. It is specialized: refs may not yet be attached, state updates are unsupported, and DOM update timing is not guaranteed. Effects do not run during server rendering.

`useRef(initialValue)` returns a stable object with mutable `.current`; initialValue is used on first render. Updating it does not trigger rerender. It can hold imperative values or a host DOM node. Read/write refs in event handlers/effects, not during render except predictable initialization. Callback refs can attach/detach a node; in React 19 a callback ref may return a cleanup function. Ref objects are not state; do not put data needed for visual output solely in `.current`.

`useImperativeHandle(ref, createHandle, dependencies?)` exposes a custom handle instead of the whole DOM node. React 19 receives `ref` as a prop; React 18 and earlier commonly use `forwardRef`. Keep the API narrow (e.g. `focus`, `scrollToError`) so parents do not control child internals. Dependencies follow `Object.is` and should include referenced reactive values.

Strict Mode development adds a setup/cleanup stress cycle. Correct cleanup mirrors setup: disconnect what was connected, unsubscribe what was subscribed, cancel timers/requests, and detach external callbacks. A production-only conditional or “run once” ref usually hides missing cleanup. Custom Hooks can package reusable synchronization, but each Hook call remains tied to the caller's component and follows Hook rules.

## Mechanisms and relationships

```text
external system setup(inputs) ↔ cleanup(old inputs)
commit → setup; changed deps → cleanup(old) then setup(new); unmount → cleanup
state drives rendered output; ref.current stores non-rendering mutable data
event handler handles user intent; Effect synchronizes ongoing external relationship
```

## Worked examples

```js
useEffect(() => {
  const connection = connect(roomId);
  return () => connection.disconnect();
}, [roomId]);
```

The dependency change reconnects to the new room. If an API request is used, its cleanup should abort or mark the result stale. Do not add an Effect to compute `fullName` from `firstName` and `lastName`; calculate `const fullName = ...` during render.

## Misconceptions and edge cases

- Effects are tied to commits, not component “mount” only.
- Cleanup also runs before changed-dependency setup, not only on unmount.
- Dependencies describe reactive reads, not a user-selected schedule.
- Ref mutation does not trigger a render.
- `useLayoutEffect` blocks repaint; do not use it as a faster `useEffect`.
- `useInsertionEffect` is library-level CSS insertion, not app lifecycle logic.
- An async Effect callback itself cannot return a Promise as cleanup; define async work inside setup and clean up cancellation/staleness.
- Effects do not run on the server.

## Knowledge checks with answers

1. **When does cleanup run?** Before setup with changed dependencies and when removed.
2. **How compare dependencies?** `Object.is` element by element.
3. **When use layout effect?** Before repaint for layout measurement/visual correction.
4. **Does changing `.current` render?** No.
5. **What is Strict Mode probing?** Whether setup and cleanup correctly mirror.
