<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# React Redux Toolkit store slices selectors middleware and async workflows — Reference: Thunk and listener middleware workflows

# Scope and version

This reference covers the supplied RTK 2.x thunk and listener middleware names. `configureStore` installs thunk middleware by default. RTK's listener middleware is a separate instance that must be added to the store. See [createAsyncThunk](https://redux.js.org/toolkit/api/createAsyncThunk), [createListenerMiddleware](https://redux.js.org/toolkit/api/createListenerMiddleware), [createDynamicMiddleware](https://redux.js.org/toolkit/api/createDynamicMiddleware), and the [usage guide](https://redux.js.org/toolkit/usage/usage-guide).

# How this group fits the mental model

Reducers stay synchronous and pure; middleware and thunk functions coordinate effects around dispatch. `createAsyncThunk` provides a conventional request lifecycle. Listener middleware offers action/state-driven workflows with cancellation and task helpers. These mechanisms report outcomes through actions so reducers can represent visible loading, success, and failure state.

# Supplied names explained

- `Thunk middleware` — Middleware that recognizes a function dispatched instead of a plain action and invokes it with `dispatch`, `getState`, and optional extra argument. The function can perform async work and dispatch ordinary actions. RTK includes thunk middleware by default.
- `createAsyncThunk(typePrefix, payloadCreator)` — Generates a thunk action creator and `pending`, `fulfilled`, and `rejected` action creators for a request lifecycle. The payload creator may return a value/promise, use `rejectWithValue`, or observe `signal`. It does not create reducers or a data cache automatically.
- `thunkAPI.dispatch` — Dispatch function supplied as the payload creator's second argument; use it for related actions, while avoiding redundant manually dispatched lifecycle actions for the same request.
- `thunkAPI.getState` — Reads current root state at execution time. Use it for a condition or request input when necessary, but keep dependencies explicit and avoid coupling every thunk to unrelated state.
- `thunkAPI.signal` — An `AbortSignal` for cooperative cancellation of async work. Pass it to `fetch` or another API that supports aborting. Aborting local work does not guarantee a remote server stopped processing an already received request.
- `thunkAPI.rejectWithValue(value)` — Returns a rejected result with a supplied payload, useful for expected domain/server validation errors. Reducers can inspect `action.payload`; unexpected thrown errors are represented in `action.error`.
- `thunkAPI.fulfillWithValue(value)` — Returns a fulfilled value and can attach custom metadata. Use it when fulfilled action metadata is needed; ordinary return values are simpler for typical requests.
- `pending lifecycle action` — Dispatched when the thunk starts (unless rejected by a pre-execution condition). It carries request metadata including the argument and request ID; use it to represent loading or active request state.
- `fulfilled lifecycle action` — Dispatched when the payload creator resolves successfully. Its payload is the resolved value (or customized fulfilled value); reducers decide how to store it.
- `rejected lifecycle action` — Dispatched when the payload creator throws/rejects, is aborted, or a condition prevents execution (configuration can choose whether condition rejection dispatches). Inspect metadata, `payload`, and `error` rather than assuming all rejections mean the same thing.
- `createListenerMiddleware(options)` — Creates middleware plus listener registration/management methods. Register it in the store. Its effects run in response to matching actions or state transitions, with a workflow API similar in spirit to a lightweight saga/observable alternative.
- `listenerMiddleware.startListening(options)` — Registers a listener with a predicate such as an action creator, type, matcher, or state-change condition and an effect callback. Returns cleanup controls; registration is commonly done during app setup.
- `listenerMiddleware.addListener` — Action creator used to add a listener dynamically by dispatching its produced action through the listener middleware. This is useful for dynamic component-owned subscriptions, but requires that middleware to see the action.
- `listenerMiddleware.removeListener` — Action creator that removes a dynamically registered listener. Ensure removal happens during cleanup when listener lifetime belongs to a component or feature.
- `listenerApi.dispatch` — Dispatch capability provided to the listener effect; it may trigger reducers and other listeners. Avoid accidental feedback loops by using clear action predicates and state conditions.
- `listenerApi.getState` — Reads the current store state from a listener effect. Listener middleware also exposes previous-state helpers in its broader API; the supplied name here is the current-state accessor.
- `listenerApi.cancelActiveListeners()` — Cancels other active instances of the same listener entry. Commonly used to implement take-latest/debounce patterns. Async tasks must cooperate with cancellation; pair it with `pause` or an abort-aware operation.
- `listenerApi.take(predicate)` — Waits for a future matching action and returns action/state data when it occurs; it can time out or be cancelled according to the API options. It models “wait for the next event” workflows.
- `listenerApi.condition(predicate)` — Waits until a matching action or state condition occurs and resolves to indicate whether it matched before cancellation/timeout. Use it when a workflow needs to pause until a condition is met.
- `listenerApi.pause(promise)` — Waits for a promise while making the wait cancellable by listener cancellation. Cancellation can interrupt the workflow's wait; the underlying promise itself may continue unless separately abortable.
- `listenerApi.fork(asyncTask)` — Starts a child task in the listener's cancellable task scope and returns a task handle with result/cancel behavior. Use it for structured concurrent work and handle child failures/results explicitly.
- `listenerApi.unsubscribe()` — Stops this listener entry from responding to future matching actions; it is distinct from cancelling currently running instances. Resubscribe is available in the full task API but is outside this exact inventory.
- `createDynamicMiddleware()` — Creates middleware whose middleware list can be augmented at runtime through its returned API. It is useful when code-split features need to register middleware after store creation; it adds lifecycle and ordering complexity.
- `Dynamic middleware injection` — Adding middleware to a running store through a dynamic middleware instance. Register the dynamic middleware with the store first, then inject the feature middleware through its API; injecting does not bypass normal ordering or duplicate-effect concerns.

# Cross-item comparison

Use `createAsyncThunk` for a command-like async operation with a conventional pending/fulfilled/rejected lifecycle. Use listener middleware for reactions to actions or state, waiting for follow-up events, debounce/take-latest, and longer workflows. A thunk starts because code dispatches it; a listener starts because a registered predicate matches. RTK Query is usually a better fit for standard server-data fetching, caching, deduplication, and invalidation.

`listenerApi.cancelActiveListeners()` cancels sibling active invocations for the same entry. `listenerApi.unsubscribe()` prevents future invocations but does not itself mean “cancel all existing work.” `listenerApi.pause(promise)` makes the listener's wait cancellation-aware, but does not forcibly cancel the wrapped promise. Cancellation and rollback are different concepts.

# Examples

Request thunk with expected errors:

```ts
export const saveProfile = createAsyncThunk<Profile, ProfileInput, { rejectValue: ValidationErrors }>(
  'profile/save',
  async (input, { signal, rejectWithValue }) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    })
    if (response.status === 422) return rejectWithValue(await response.json())
    if (!response.ok) throw new Error(`Save failed: ${response.status}`)
    return response.json()
  },
)
```

Listener debounce sketch:

```ts
listenerMiddleware.startListening({
  actionCreator: searchTextChanged,
  effect: async (_action, api) => {
    api.cancelActiveListeners()
    await api.pause(delay(250))
    const query = selectSearchText(api.getState())
    api.dispatch(searchRequested(query))
  },
})
```

In production, make the delay promise or underlying request abort-aware if cancellation must stop work; model result races with request IDs or another explicit policy.

# Common mistakes

- Performing a fetch in a reducer or assuming `createAsyncThunk` writes data without reducers.
- Treating every rejected lifecycle action as a network failure.
- Ignoring `signal` and believing cancellation rolls back server-side work.
- Dispatching duplicate status actions manually alongside the generated lifecycle actions.
- Creating a listener loop where the effect dispatches an action that matches itself without a guard.
- Assuming `unsubscribe()` cancels active tasks, or `pause()` aborts the underlying promise.
- Adding listener middleware after serializability checks while dynamically dispatched listener registration actions contain functions; follow the official ordering guidance for the installed RTK version.
- Using dynamic injection when static registration is simple; runtime order and teardown become additional design concerns.

# Knowledge checks with answers

1. What does `createAsyncThunk` generate? **A thunk action creator plus pending, fulfilled, and rejected action creators.**
2. Where do request status transitions live? **In reducers handling the lifecycle actions.**
3. Does cancelling a listener undo a completed HTTP mutation? **No; cancellation only affects cooperative client work and cannot roll back an external side effect.**
4. Which middleware is a natural fit for debounce after repeated actions? **Listener middleware, typically cancelling prior active instances and waiting before continuing.**
5. What is the standard fit for cached query data and invalidation? **RTK Query.**

Sources: [createAsyncThunk](https://redux.js.org/toolkit/api/createAsyncThunk), [createListenerMiddleware](https://redux.js.org/toolkit/api/createListenerMiddleware), [createDynamicMiddleware](https://redux.js.org/toolkit/api/createDynamicMiddleware), [Redux Toolkit Usage Guide](https://redux.js.org/toolkit/usage/usage-guide).
