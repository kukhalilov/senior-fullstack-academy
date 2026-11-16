# React state reducer context and action hooks — Big-picture orientation and mental model

Sources: React 19.3 [`useState`](https://react.dev/reference/react/useState), [`useReducer`](https://react.dev/reference/react/useReducer), [`useContext`](https://react.dev/reference/react/useContext), [`useActionState`](https://react.dev/reference/react/useActionState), and [`useOptimistic`](https://react.dev/reference/react/useOptimistic).

## Problem and purpose

Components need memory, coordinated transitions, shared subtree data, and ways to represent pending/asynchronous work. React Hooks provide those behaviors while keeping component state tied to render-tree identity.

## Plain-language mental model

Each render sees a fixed snapshot of state. Calling a setter or dispatch schedules future work; it does not mutate the variable in the current render. React queues/batches updates and supplies a later render with the resulting state. Context provides a value to descendants; Actions model work that may be asynchronous and expose pending/result states.

## How the parts fit together

```text
useState / useReducer → component memory → update queue → later render snapshot
Context provider → nearest value → subscribing consumers update when value changes
Action → useActionState result/pending status; useOptimistic temporary view
```

All Hooks must be called at the top level of a component or custom Hook in stable order. Custom Hooks package reusable behavior, but state remains isolated per component calling the custom Hook.

## Concept map

Use `useState` for independent values and simple transitions; use `useReducer` when related updates form a clear state-transition model. Replace objects and arrays immutably. Use context to avoid threading values through intermediate components, not as a global mutable singleton. Use `useActionState` for Action result state and pending status; `useOptimistic` presents a temporary projection while an Action is pending and returns to confirmed state when the Action completes/fails.

## End-to-end walkthrough

A click handler reads the state snapshot of its render and calls a setter. Multiple updates may be batched; functional updaters compose against queued previous values. React computes a later state and renders again. A context consumer receives the nearest provider's new value if it differs by `Object.is`. For a save Action, `useActionState` exposes the latest Action result and pending flag; `useOptimistic` can show the likely result before server confirmation, but failure recovery must restore/refresh confirmed state.

## When to use it and tradeoffs

Choose the smallest state owner that fits; props for direct parent-child input, context for subtree-wide read access, reducer for explicit transition logic, and Actions for async work/result state. Do not store derivable data or mirror server state without a reason. Optimistic UI improves perceived responsiveness but must account for errors, ordering, and reconciliation with server truth.

## What later lessons cover

The reference lessons cover state setters/queues, reducer transitions, context create/provide/subscribe, Actions/optimistic state, and Hook rules/custom Hooks. Effects/refs and form Actions are separate topics.
