# React state reducer context and action hooks — Reference: Action state and optimistic updates

Sources: React 19.3 [`useActionState`](https://react.dev/reference/react/useActionState) and [`useOptimistic`](https://react.dev/reference/react/useOptimistic).

## Scope and version

This reference covers the React Action state hooks. Form `action` props, `useFormStatus`, and React DOM submission details are covered in t07-020. Server Function deployment/integration depends on the framework.

## Actions and `useActionState`

An Action is work that may be asynchronous and updates UI around pending/completion. `useActionState(reducerAction, initialState, permalink?)` returns `[state, dispatchAction, isPending]`. The `reducerAction(previousState, actionPayload)` receives the last state (initially `initialState`, then previous result) plus the dispatched payload. `dispatchAction` must be called in an Action context (for example, a form Action or transition) to obtain expected pending/async semantics. Multiple dispatched Actions can queue; state results build on prior results. Initial state is ignored after the first dispatch.

`isPending` indicates whether dispatched Actions for this hook are pending. Use it for disabled controls/progress UI; do not infer success/failure from pending alone. Return an explicit result/error state for expected failures. For thrown errors, use appropriate try/catch or an error boundary strategy; rejected async work is not automatically converted to a friendly state. `permalink` is an optional unique URL for progressive enhancement with Server Functions/forms before JavaScript loads; it is not a general router redirect argument.

## Optimistic state

`useOptimistic(state, updateFn?)` returns `[optimisticState, setOptimistic]`. The first argument is the confirmed base. Without pending Actions, the optimistic value reflects that base; while an Action is pending it can reflect a temporary update. `updateFn(currentState, action)` is a pure reducer for optimistic presentation. `setOptimistic` is used within an Action/transition and can receive a value or update function. When the Action ends, React reconciles back to the latest confirmed prop/state; on failure, show a recoverable error and rely on the confirmed data. Do not treat optimistic values as persisted truth.

For concurrent Actions, optimistic updates may layer/rebase; make updates idempotent where possible and design failure handling so one rejection does not erase unrelated confirmed changes. Keep server authorization/validation authoritative. An optimistic delete should support restoring the item or refreshing source data on error.

## Example

```jsx
const [message, submitMessage, isPending] = useActionState(
  async (previous, formData) => {
    const text = String(formData.get('message') ?? '');
    const result = await sendMessage(text);
    return result.ok ? { error: null } : { error: result.message };
  },
  { error: null },
);
```

The action result becomes the next `state`; a UI can use `isPending` and `message.error`. The form integration and dispatch placement must follow React DOM Action semantics; this example omits form wiring intentionally.

## Cross-item comparison

Confirmed state is the base supplied by props/state; optimistic state is a temporary UI projection during pending Action; Action state stores the completed result and pending flag. These are related but not interchangeable stores.

## Common mistakes

Calling dispatch outside Action context and expecting `isPending`; returning an error value but rendering it nowhere; assuming rejected promises become validation state; persisting optimistic values as confirmed; ignoring concurrent updates; and using `permalink` as a generic navigation mechanism.

## Knowledge checks with answers

1. **What tuple does `useActionState` return?** State, dispatchAction, and isPending.
2. **What arguments reach reducerAction?** Previous Action state and dispatched payload.
3. **When is optimistic state temporary?** While the associated Action is pending.
4. **Is optimistic state server truth?** No; reconcile with confirmed data and handle errors.

## How this group fits the mental model

Action hooks coordinate asynchronous work with pending/result state and a temporary optimistic view.

## Supplied names explained

The exact index below covers Action/reducerAction, dispatch, pending state, optimistic reducer, and error handling.

## Examples

The async action example demonstrates result state and async work; wire dispatch through the proper React Action integration.

## Exact terms covered

### Exact terms covered

- `Action`
- `useActionState(reducerAction, initialState, permalink?)`
- `reducerAction(previousState, actionPayload)`
- `dispatchAction`
- `useActionState isPending`
- `useOptimistic(state, updateFn?)`
- `Optimistic state`
- `Optimistic reducer function`
- `Action pending state`
- `Action error handling`
