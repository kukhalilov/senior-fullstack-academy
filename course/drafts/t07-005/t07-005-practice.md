# React state reducer context and action hooks — Exercises and worked solutions

Sources: React 19.3 [`useState`](https://react.dev/reference/react/useState), [`useReducer`](https://react.dev/reference/react/useReducer), [`useContext`](https://react.dev/reference/react/useContext), [`useActionState`](https://react.dev/reference/react/useActionState), [`useOptimistic`](https://react.dev/reference/react/useOptimistic), [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot), and [Queueing State Updates](https://react.dev/learn/queueing-a-series-of-state-updates).

## Goals

Predict queued state, use immutable updates, choose reducer/context boundaries, model pending/optimistic operations, and fix Hook rule violations.

## Worked example

```js
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);
```

All three expressions read the same render snapshot. Use `setCount(n => n + 1)` three times when each queued update must build on the previous value. The next render observes the resulting count.

## Exercises

### 1. Diagnose stale counter

Why does a handler that calls `setCount(count + 1)` twice increment only once?

**Solution:** Both calls use the current render's `count`; each queues the same replacement. Use functional updaters to compose: `setCount(n => n + 1)` twice.

### 2. Fix object mutation

```js
user.name = nextName;
setUser(user);
```

**Solution:** Create a new object: `setUser(previous => ({ ...previous, name: nextName }))`. Mutation changes a pre-existing value and preserves the same reference, so React may bail out.

### 3. Select useState or useReducer

A component has independent `isOpen` and `query` values, and a workflow object with six transitions that update multiple related fields.

**Solution:** Separate `useState` values are clear for `isOpen` and `query`; a reducer is reasonable for the coherent workflow state and named transitions. Avoid choosing reducer solely because it appears more advanced.

### 4. Context consumer sees default

A component returns `<ThemeContext value="dark">` and calls `useContext(ThemeContext)` in that same component.

**Solution:** The provider returned by a component does not affect that component's own hook call. Move the consumer into a descendant under the provider. Verify the exact same context object is imported by provider/consumer.

### 5. Context consumer updates despite memo

A consumer wrapped in `memo` rerenders when provider value object changes every parent render.

**Solution:** Context updates bypass props-only memo equality. Stabilize/split provider value only if needed; avoid mutating the context object in place because consumers rely on `Object.is` changes.

### 6. Build optimistic save

A message should appear immediately, then reconcile to server-confirmed state or show failure.

**Solution:** Use `useOptimistic` inside an Action to present a temporary message and `useActionState` for result/pending state. Ensure the Action updates confirmed base data on success and an error path restores/reloads confirmed state. Do not persist only the optimistic projection.

### 7. Fix conditional Hook

```js
if (enabled) {
  const [value, setValue] = useState(0);
}
```

**Solution:** Call Hook unconditionally at top level, then use the `enabled` condition for rendering/behavior; or extract a child component rendered only when enabled. Hook call order must remain stable.

### 8. Custom Hook state expectation

Two components call `useCounter()` and assume they share a count.

**Solution:** Each caller receives isolated Hook state. Lift state to a common parent and pass props, or use context/store if shared subtree-wide subscription is appropriate.

## Progressive hints

Identify the render snapshot; ask whether an update depends on previous queued state; identify data owner and provider boundary; then check whether the Hook call happens on every render in the same order.

## Complete solutions

Each exercise gives a complete fix. Async Actions require an Action context and a real confirmed-state update; optimistic presentation should never replace authoritative server logic.

## Tests and edge cases

Test batched increments, same-reference bailouts, nested object updates, reducer exhaustive actions, no provider/default versus undefined provider, context object identity, memo consumers, Action pending/error/success and concurrent submissions, optimistic rollback, and conditional Hook paths.

## Reflection questions

Who owns each piece of state? Does it need to be shared or can it remain local? Is the value derived? Is optimistic feedback reconciled with confirmed data? Are all Hooks called unconditionally?
