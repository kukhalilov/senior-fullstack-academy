# React effects refs imperative handles and external systems — Exercises and worked solutions

Sources: React 19.3 [`useEffect`](https://react.dev/reference/react/useEffect), [`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect), [`useRef`](https://react.dev/reference/react/useRef), [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle), and [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

## Goals

Decide whether to use an Effect, pair lifecycle cleanup, handle stale async work, choose timing, and distinguish state from refs.

## Worked example

An app has `firstName` and `lastName` and adds an Effect to set `fullName`. This creates a stale render followed by another render. Calculate `const fullName = firstName + ' ' + lastName` during render instead.

## Exercises

### 1. Subscribe and clean up

Connect to a chat room whenever `roomId` changes.

**Solution:** In `useEffect`, create/connect using `roomId`, return disconnect cleanup, and include `[roomId]`. React cleans up old room before connecting to a new one.

### 2. Fix a Strict Mode duplicate

An Effect adds a window listener but never removes it; Strict Mode seems to attach twice.

**Solution:** Return cleanup that removes the same listener with the same function/options. The extra development cycle reveals the leak; don't add a ref guard.

### 3. Prevent stale search results

Query A starts, then query B starts; A finishes last and overwrites B.

**Solution:** Abort the prior request or use a per-Effect ignore/generation guard in cleanup. Include query dependency and handle abort/error separately. Framework loaders may be better for production data fetching.

### 4. Choose effect timing

A tooltip briefly appears in the wrong position before moving after measuring its DOM node.

**Solution:** Use `useLayoutEffect` for measurement/correction before repaint if necessary; keep the work minimal. `useEffect` may paint first. Do not use `useInsertionEffect`, which is for CSS-in-JS style insertion.

### 5. Timer that should not render

Store an interval ID so a stop button can clear it; changing the ID should not update UI.

**Solution:** Store ID in `useRef`; assign/clear it in event handlers/Effects. If visible elapsed time changes, keep that displayed value in state because ref mutation does not rerender.

### 6. Narrow imperative API

A parent needs to focus a custom input but should not control its DOM structure.

**Solution:** In React 19 accept `ref` as a prop and expose `{ focus() }` with `useImperativeHandle`. In React 18 use `forwardRef`. Keep the API narrow and guard absent DOM node.

### 7. Remove unnecessary Effect

An Effect filters a list from `items` and stores `visibleItems` in state.

**Solution:** Compute `const visibleItems = items.filter(...)` during render. Use memoization only if the computation is measured expensive; don't use an Effect to mirror a pure derivation.

### 8. External event needs current presentation state

A chat connection should stay connected when `theme` changes, but its connected notification should use the latest theme.

**Solution:** In React 19.2+, define `onConnected` with `useEffectEvent` and call it from the connection listener registered inside the Effect. Keep `roomId` in the Effect dependencies. The Effect Event reads the latest committed `theme`; do not put its changing identity in dependencies or pass it to a child/custom Hook. If changing a value must recreate the external relationship, keep that value as a real dependency rather than hiding it in an Effect Event.

### 9. Specific interaction

An Effect watches `didBuy` and sends a purchase request when true.

**Solution:** Send the request in the purchase event handler/Action, where the triggering interaction is known. This avoids duplicate or ambiguous submissions on rerenders/remounts.

## Progressive hints

Ask whether React owns the value, whether the work is a pure calculation, whether a specific user event caused it, whether an external system needs ongoing synchronization, and what cleanup stops.

## Complete solutions

Solutions provide mechanism choice and lifecycle details. Test cleanup on dependency changes, not only unmount; React invokes cleanup for both.

## Tests and edge cases

Test Strict Mode setup/cleanup, changed dependencies, unmount, stale request ordering, abort behavior, SSR no-Effect behavior, ref attachment/detachment/callback cleanup, layout flicker, no-render guarantee of ref changes, and Effect Event latest-value behavior while confirming genuine dependencies still resynchronize.

## Reflection questions

Does this Effect synchronize with something outside React? Can a render calculation or handler replace it? What exact external resource does cleanup stop? Is a ref holding information that should affect visible output?
