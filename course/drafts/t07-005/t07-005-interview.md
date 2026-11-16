# React state reducer context and action hooks — Interview questions and reasoning

Sources: React 19.3 [`useState`](https://react.dev/reference/react/useState), [`useReducer`](https://react.dev/reference/react/useReducer), [`useContext`](https://react.dev/reference/react/useContext), [`useActionState`](https://react.dev/reference/react/useActionState), [`useOptimistic`](https://react.dev/reference/react/useOptimistic), and [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks).

## Core questions

1. Explain state as a snapshot.
2. Why use functional state updaters?
3. How does batching affect updates?
4. Why replace objects/arrays instead of mutating?
5. Compare `useState` and `useReducer`.
6. What must a reducer guarantee?
7. What does context do and how is the provider selected?
8. How are context values compared and how do consumers update?
9. What does `useActionState` return?
10. Compare confirmed and optimistic state.
11. What are the Rules of Hooks?
12. Does a custom Hook share state across callers?

## Concise interview answers

1. A render sees fixed state values; setters schedule a later render rather than mutating current variables.
2. An updater receives the pending previous state and composes correctly with queued updates.
3. React batches updates so multiple changes can produce a later render; direct values from one snapshot may overwrite each other.
4. React compares with `Object.is`; same-reference mutation can be treated as unchanged and violates purity.
5. useState is simple for independent values; useReducer centralizes coordinated named transitions.
6. Return next state purely from state/action; do not mutate, perform I/O, or depend on ambient mutable values.
7. Context provides a subtree value; the nearest provider above the consumer wins.
8. `Object.is`; consumers subscribe and rerender when value changes even if memoized.
9. `[state, dispatchAction, isPending]`.
10. Confirmed state is authoritative input; optimistic state is a temporary projection while an Action is pending.
11. Call Hooks at the top level of function components/custom Hooks in stable order, not conditionally/in loops/events/classes.
12. No; each component caller has isolated Hook state unless the Hook reads shared context/store.

## Deep follow-up answers

### Why might a setter appear to do nothing?

The current render's variable remains unchanged until a later render, and React may bail out if next state is `Object.is` equal. Mutating an object and setting the same reference is a common cause. Log in the next render or inspect new state immutably.

### Why can `memo` not stop a context update?

Memo compares props to skip parent-driven renders, but a component that reads context subscribes to that context. React updates consumers when the provider value changes; use context splitting/stabilization only when it addresses measured fan-out.

### How should optimistic errors work?

Treat optimistic state as temporary. Pending UI can show likely success; Action result/error handling must surface failure and reconcile with latest confirmed source data. Concurrent operations need stable identity and server-authoritative validation.

## Scenario questions

1. **Three increments yield +1.** Explain snapshot closures and functional updaters.
2. **Consumer reads default despite provider.** Check provider ancestry, same component read timing, and duplicate context object imports.
3. **Conditional `useState` crashes/misbehaves.** Move call to top level or extract a conditionally rendered component.
4. **Optimistic like remains after failed request.** Reconcile against confirmed state and handle Action errors.
5. **Two custom Hook consumers are unsynchronized.** Lift state or use context/store; Hook reuse does not mean shared state.

## Tradeoffs and alternatives

Choose local state for isolated ownership, reducer for coordinated transitions, props for direct data flow, context for subtree sharing, and an external store for broader/high-frequency shared state where appropriate. Optimism trades perceived latency for rollback/concurrency complexity.

## Common weak answers

Avoid saying setters mutate current state, reducer is always better, context is global state, memo blocks context, custom Hooks share state, or optimistic state is confirmed.

## Self-check rubric

A strong answer explains render snapshot/queue, ownership, equality, and failure/reconciliation boundaries. Give one point for each; revisit answers that only name Hooks without describing timing.
