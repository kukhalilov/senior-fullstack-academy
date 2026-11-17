# React effects refs imperative handles and external systems — Reference: Effect Events and latest committed values

Sources: React 19.3 [`useEffectEvent`](https://react.dev/reference/react/useEffectEvent) and [React 19.2 release notes](https://react.dev/blog/2025/10/01/react-19-2).

## Scope and version

`useEffectEvent` was introduced in React 19.2. It separates non-reactive event logic caused by an external event from the reactive synchronization that owns the subscription or connection. It is not a general-purpose stable callback or a way to suppress dependencies.

## How this group fits the mental model

An Effect owns a synchronization relationship. An Effect Event handles an event from that relationship using the latest committed display values without restarting the relationship for those values.

## Supplied names explained

The names below specify the API, latest-value behavior, dependency rule, identity behavior, same-component call boundary, and prohibited pass-through/misuse:

- `useEffectEvent(callback)`
- `Effect Event`
- `Effect Event reads latest committed values`
- `Effect Event omitted from dependencies`
- `Effect Event identity changes every render`
- `Effect Event callable only from same component Effects`
- `Do not pass Effect Event to components or Hooks`
- `Do not use Effect Event to hide real dependencies`

## API and behavior

`useEffectEvent(callback)` returns an Effect Event function. Calling it reads the latest committed props and state, even if those values are not dependencies of the surrounding Effect. The Effect Event itself must be omitted from dependency arrays: its identity intentionally changes every render. Keep genuine synchronization inputs, such as a chat `roomId`, in the Effect dependency list so a changed room reconnects.

Call an Effect Event only from an Effect in the same component or another Effect Event declared by that component. Do not call it during render or from a user event handler. Do not pass it to another component or Hook. These restrictions preserve the relationship between the event logic and the Effect that owns the external subscription. Never use it to hide a value that should cause synchronization.

## Example

```jsx
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
  });

  useEffect(() => {
    const connection = createConnection(roomId);
    connection.on('connected', () => onConnected());
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
}
```

Changing `theme` changes the notification's latest display value without reconnecting. Changing `roomId` is a real synchronization change and reruns cleanup/setup. The subscription wrapper calls the Effect Event from the Effect-owned external callback.

## Cross-item comparison

- A user event handler runs because the user acted; an Effect Event runs from an external event associated with an Effect.
- A stable callback is intended to retain identity; an Effect Event deliberately changes identity each render and is omitted from dependencies.
- An Effect Event can read current values without resynchronizing, but it does not make actual synchronization inputs non-reactive.

## Examples

The chat example keeps the room connection keyed by `roomId`; its external connected notification uses the latest `theme`.

## Common mistakes

Do not include the Effect Event in dependencies, call it from a click handler, pass it to a child/custom Hook, or use it to avoid reconnecting when a true connection key changes. Ask: “Does changing this value mean the external relationship itself must be recreated?” If yes, it remains a dependency.

1. **Which values does it read?** Latest committed props and state when called.
2. **Is its function identity stable?** No; it changes each render.
3. **Where can it be called?** From an Effect or same-component Effect Event.
4. **Can it eliminate every Effect dependency?** No; real synchronization inputs remain reactive.

## Knowledge checks with answers

1. **Which values does an Effect Event read?** Latest committed props and state when called.
2. **Is its function identity stable?** No; it changes each render.
3. **Where can it be called?** From an Effect or same-component Effect Event.
4. **Can it eliminate every Effect dependency?** No; real synchronization inputs remain reactive.

- `useEffectEvent(callback)`
- `Effect Event`
- `Effect Event reads latest committed values`
- `Effect Event omitted from dependencies`
- `Effect Event identity changes every render`
- `Effect Event callable only from same component Effects`
- `Do not pass Effect Event to components or Hooks`
- `Do not use Effect Event to hide real dependencies`

