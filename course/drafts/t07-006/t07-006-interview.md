# React effects refs imperative handles and external systems — Interview questions and reasoning

Sources: React 19.3 [`useEffect`](https://react.dev/reference/react/useEffect), [`useLayoutEffect`](https://react.dev/reference/react/useLayoutEffect), [`useRef`](https://react.dev/reference/react/useRef), [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle), [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), and [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

## Core questions

1. What problem does an Effect solve?
2. Explain setup, dependencies, cleanup, and rerun order.
3. How are dependencies compared?
4. When does an Effect not need dependencies?
5. Compare Effect, event handler, and derived value.
6. Compare `useEffect`, `useLayoutEffect`, and `useInsertionEffect`.
7. Why does Strict Mode run setup/cleanup again in development?
8. How do you prevent stale async results?
9. What is `useRef`, and how does it differ from state?
10. When use a DOM ref or callback ref?
11. What does `useImperativeHandle` expose?
12. How did ref passing change in React 19?
13. What problem does `useEffectEvent` solve, and what restrictions apply?

## Concise interview answers

1. Synchronize a committed component with an external system.
2. Setup after commit; changed deps trigger cleanup with old values then setup with new; removal runs cleanup.
3. `Object.is` by position.
4. Omitted list reruns after every commit; empty list synchronizes once per mounted identity, still subject to Strict Mode checks.
5. Effect handles ongoing external sync; handler handles a specific interaction; render derives pure values.
6. Normal Effect after commit; layout before repaint; insertion before layout Effects for CSS-in-JS libraries.
7. It stress-tests whether cleanup mirrors setup.
8. Abort request or ignore stale completion in cleanup.
9. Stable mutable `.current` that does not rerender; state is render data and queues updates.
10. Imperative focus/measure/widget integration or callback attachment lifecycle.
11. A narrow custom command API instead of exposing internals/whole DOM node.
12. Function components can receive `ref` as a prop in React 19; `forwardRef` is for React 18 and earlier.
13. React 19.2 `useEffectEvent` reads latest committed values for event logic invoked by an Effect without resynchronizing for those values. Its identity changes each render; omit it from dependencies, call it only from same-component Effects/Effect Events, and keep real synchronization inputs as dependencies.

## Deep follow-up answers

### Why not use an Effect to derive filtered data?

It introduces an extra render and synchronization state; the value is a pure function of current props/state and should be calculated during render. Memoization is a performance tool, not a correctness requirement.

### Why is cleanup called before a dependency change?

It releases the old external relationship using the values/resources from that setup before a new one is established. This prevents overlapping subscriptions/connections and stale callbacks.

### When would layout effect be justified?

When reading/writing layout before paint is required to prevent visible flicker, such as positioning a tooltip. It blocks repaint, so minimize work and avoid it for ordinary subscriptions.

## Scenario questions

1. **Effect creates duplicate socket under Strict Mode.** Implement symmetric disconnect cleanup and ensure setup is safe.
2. **Component fetches stale data after query changes.** Abort or ignore prior request results; consider framework data fetching.
3. **Timer ref changes but UI not updated.** Correct; put visible timer value in state, retain timer handle in ref.
4. **Tooltip flickers.** Measure/correct with layout effect if needed; normal effect may run after paint.
5. **Parent should call child focus.** Expose a narrow imperative handle rather than internal DOM/state.

## Tradeoffs and alternatives

Prefer render derivation/handlers over Effects; prefer useEffect over layout effect; use refs for nonvisual mutable handles and state for visual data; expose imperative handles sparingly.

## Common weak answers

Avoid saying Effects are lifecycle callbacks for any post-render work, dependencies control an arbitrary timer, cleanup is only on unmount, refs are state, useLayoutEffect is universally safer, or Strict Mode causes a production duplicate.

## Self-check rubric

A strong answer identifies the external system, dependency values, setup/cleanup symmetry, and the right timing/alternative. Give one point for each; revisit answers that only recite Hook signatures.
