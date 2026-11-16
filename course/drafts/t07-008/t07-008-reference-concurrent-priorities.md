# React performance transitions deferred values profiling and compiler — Reference: Non-blocking update priority APIs

Sources: React 19.3 [`useTransition`](https://react.dev/reference/react/useTransition) and [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue).

## Scope and version

Priority APIs let urgent interactions proceed while React prepares less urgent UI. They affect scheduling of React rendering; they do not make expensive algorithms free, guarantee a deadline, or automatically debounce external requests.

## How this group fits the mental model

These APIs preserve immediate interaction feedback while allowing downstream React rendering to lag temporarily. They are scheduling tools, so expensive synchronous work may still need a separate solution.

## Supplied names explained

### `useTransition()`

Returns `[isPending, startTransition]`. Call it at component top level. The stable `startTransition` function marks synchronous state updates scheduled inside its action as non-urgent transitions. `isPending` indicates transition work is pending for that Hook instance. It is intended for responsive UI states such as navigation, filtering, or switching a large view.

### `startTransition(action)`

Invoke `action` to schedule non-urgent state updates. The action runs immediately; React assigns transition priority to state updates scheduled synchronously within it. Updates after an `await` currently need to be wrapped in another `startTransition` when they should retain transition priority. A transition may be interrupted by urgent work and restarted. The callback itself is not deferred JavaScript and should not contain side effects whose timing depends on rendering.

### `isPending` transition status

Boolean returned by `useTransition`. Use it to communicate that transition-rendered content is being prepared, such as by dimming stale results or showing a progress hint. It does not mean an arbitrary fetch is in progress; model network loading explicitly when necessary. Multiple transitions may be batched, so do not treat it as a per-request identifier.

### Transition update

A state update scheduled within `startTransition` that React treats as non-urgent. It is interruptible and can be restarted if newer urgent input arrives. State setters invoked later outside the marked scope are not automatically classified by the original call.

### Urgent update

Immediate feedback needed for direct interaction, such as updating a controlled text input or a pressed state. Keep controlled input state urgent; React does not allow a Transition to control text inputs. A slow result view can consume a deferred value or transition-updated state separately.

### Non-urgent update

An update whose displayed result can wait while the user continues interacting, such as rendering a large filtered view after a keystroke. Its UI should make any stale state understandable if the older result remains visible.

### Interruptible background render

React can pause or abandon transition rendering when urgent updates arrive. Rendering must therefore remain pure: do not perform mutations, network calls, or other side effects during render. React may retry calculations. A completed transition still needs to commit and can consume CPU.

### `useDeferredValue(value, initialValue?)`

Returns a value that may lag behind `value` while React prepares a background render. With `initialValue`, the first render can use that initial deferred value before catching up. React retries the deferred render when urgent work allows. A new object passed on every render can trigger unnecessary background work; pass stable values or defer a primitive. This Hook has no built-in fixed delay.

### Deferred value

The older or current value returned by `useDeferredValue`. Compare it with the source value to decide whether results are stale. Keep interaction controls bound to current input; use the deferred version only for downstream work that can lag.

### Stale content indication

When `value !== deferredValue`, the expensive region may show a subtle “updating” state, retain old results, or otherwise make its lag clear. Avoid implying that old results match the newest query. Accessibility status announcements should be useful rather than repeated excessively.

### Transition versus deferred value

`useTransition` marks state updates at the source as non-urgent and provides pending status. `useDeferredValue` lets a consumer defer a value it receives, including when the producer is external or difficult to change. Choose according to ownership. Neither is a debounce or network cache.

## Cross-item comparison

| Concern | `useTransition` | `useDeferredValue` |
|---|---|---|
| Where priority is assigned | At a state update source | At a value consumer |
| Pending signal | `isPending` from Hook | Compare source and deferred values |
| Best fit | You control the setter | You receive a changing value |
| Network semantics | None by itself | None by itself |

## Examples

```jsx
function Search({ items }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const stale = query !== deferredQuery;
  return <>
    <input value={query} onChange={event => setQuery(event.target.value)} />
    <section aria-busy={stale}>
      {stale && <p role="status">Updating results</p>}
      <Results items={filter(items, deferredQuery)} />
    </section>
  </>;
}
```

Profile before adopting this pattern. If filtering blocks the main thread in one long synchronous calculation, split/optimize the computation, move it to a worker, or use an appropriate index; priority alone cannot interrupt arbitrary JavaScript in the middle of a synchronous function.

## Common mistakes

- Wrapping controlled input state in `startTransition`.
- Expecting `useDeferredValue` to delay a fetch by a fixed duration.
- Treating `isPending` as the state of a particular network request.
- Putting side effects inside render because a transition may retry it.
- Using unstable object identity as the deferred value without understanding repeated work.
- Assuming the deferred subtree can never display stale content.

## Knowledge checks with answers

1. **Can transition updates control text inputs?** No; controlled input updates must remain urgent.
2. **Does a transition callback wait to run?** No, it runs immediately and marks synchronous state updates.
3. **When choose deferred value?** When a consumer should lag a changing value without controlling its source setter.
4. **Can priority interrupt a long synchronous calculation?** No; JavaScript must yield between tasks for other work to run.

### Exact terms covered

- `useTransition()`
- `startTransition(action)`
- `isPending transition status`
- `Transition update`
- `Urgent update`
- `Non-urgent update`
- `Interruptible background render`
- `useDeferredValue(value, initialValue?)`
- `Deferred value`
- `Stale content indication`
- `Transition versus deferred value`
