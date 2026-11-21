# React API reference React hooks components context and resources — Reference: Ref and effect hooks

## Scope and version

This group covers `useRef`, `useImperativeHandle`, `useEffect`, `useLayoutEffect`, `useInsertionEffect`, and `useEffectEvent` as documented for React 19.3. The central distinction is between a retained imperative value and a synchronization lifecycle. Effects must describe how to start and stop synchronization; they are not a generic place to derive render data. [Built-in Hooks](https://react.dev/reference/react/hooks) [React versions](https://react.dev/versions)

## How this group fits the mental model

Refs let React components retain a value that is not itself part of rendering. Effects connect committed React output to external systems. `useEffectEvent` lets Effect logic read the latest props/state without making those values synchronization dependencies; its function identity intentionally changes each render, it can only be called from Effects/Effect Events in the same component, and it must not be used to hide real dependencies.

## Supplied names explained

- `useRef` returns the same ref object across renders, with a mutable `.current`. Initial value is used for the first render only. Changing `.current` does not render again. Use it for DOM references and imperative data; avoid reading/writing it during render except predictable one-time initialization. [useRef](https://react.dev/reference/react/useRef)
- `useImperativeHandle` customizes the value exposed through a ref, usually to expose a small imperative API such as `focus()` rather than an entire DOM node. It accepts the ref, a factory, and dependencies. React 19 allows `ref` as a regular prop; older React patterns used `forwardRef`. Prefer declarative props when they express the need. [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle) [React 19](https://react.dev/blog/2024/12/05/react-19)
- `useEffect` runs setup after commit to synchronize with an external system and runs returned cleanup before re-synchronization and on removal. Dependencies are compared with `Object.is`; include every reactive value read by setup/cleanup. An omitted dependency array means after every commit; `[]` means no reactive re-synchronization, but development checks/remounts still require correct cleanup. Effects do not run during server rendering. [useEffect](https://react.dev/reference/react/useEffect)
- `useLayoutEffect` has Effect setup/cleanup semantics but runs before browser repaint. It is for layout measurement or synchronously correcting layout before paint. It blocks painting; prefer `useEffect` if visual timing is not necessary. It cannot provide server layout information and can complicate server rendering. [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect)
- `useInsertionEffect` runs before layout Effects and is intended for libraries that inject dynamic CSS so styles exist before layout measurement. It has restrictions, including no state updates from the insertion Effect. Application code should normally use `useEffect` or `useLayoutEffect` instead. [useInsertionEffect](https://react.dev/reference/react/useInsertionEffect)
- `useEffectEvent` creates an Effect Event function that reads the latest committed render values when called from an Effect, layout/insertion Effect, or another Effect Event in the same component. It is for non-reactive logic genuinely associated with an Effect, such as notifying with the latest theme when a connection event fires. Its identity is intentionally unstable and it is deliberately excluded from dependency arrays. It must not be called during render, from ordinary event handlers, or passed to child components/custom Hooks as a general callback. Do not use it to hide a value that should cause re-synchronization. [useEffectEvent](https://react.dev/reference/react/useEffectEvent)

## Cross-item comparison

`useRef` stores a mutable handle without reacting; `useImperativeHandle` restricts what a parent receives through that handle. `useEffect` is the default synchronization lifecycle; `useLayoutEffect` trades paint responsiveness for pre-paint work; `useInsertionEffect` is a narrow style-injection integration point. `useEffectEvent` separates a callback’s latest-value read from the Effect’s actual connection dependencies. These are not interchangeable timing knobs. [Built-in Hooks](https://react.dev/reference/react/hooks)

## Examples

### Effect lifecycle follows a reactive key

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
  return <h1>Room {roomId}</h1>;
}
```

When `roomId` changes, React cleans up the old connection and connects to the new one. If `createConnection` is declared in the component and recreated each render, it may need to be moved or its reactive inputs handled correctly; do not silence the dependency linter to force a desired schedule.

### Read latest presentation setting without reconnecting

```jsx
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => showToast(`Connected: ${theme}`));
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on('connected', onConnected);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
}
```

This sketch illustrates the intent: a theme change should affect the toast text, not tear down a room connection. Follow the current lint/tooling rules for Effect Events and ensure the external API removes handlers on cleanup.

## Common mistakes

- Using an Effect to set state from props when the value can be calculated in render.
- Omitting dependencies to prevent re-synchronization, creating stale closures.
- Assuming `[]` means setup can never run again across remounts or Strict Mode checks.
- Omitting cleanup for subscriptions, timers, observers, or imperative widgets.
- Using `useLayoutEffect` for ordinary data fetching, causing avoidable blocking.
- Using `useInsertionEffect` in application components instead of CSS/library integration code.
- Treating `useEffectEvent` as a way to hide real Effect dependencies or passing it as an ordinary click handler.
- Using refs to hold a value that must trigger visible UI updates.

## Knowledge checks with answers

1. **Which API should store a timeout ID if changing it should not update UI?** `useRef`.
2. **What happens before an Effect re-runs because a dependency changed?** Its prior cleanup runs, then new setup runs.
3. **Which timing API can prevent pre-paint visual flicker but blocks painting?** `useLayoutEffect`.
4. **Who usually needs `useInsertionEffect`?** CSS-in-JS/library authors inserting styles before layout Effects.
5. **Can an Effect Event be a general child prop?** No; it is constrained to Effect logic and is not a general callback API.

