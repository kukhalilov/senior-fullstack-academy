
# React Redux Toolkit store slices selectors middleware and async workflows — Reference: Thunk and listener middleware workflows

# Scope and version

This reference covers the supplied RTK 2.x thunk and listener middleware names. `configureStore` installs thunk middleware by default. RTK's listener middleware is a separate instance that must be added to the store. See [createAsyncThunk](https://redux.js.org/toolkit/api/createAsyncThunk), [createListenerMiddleware](https://redux.js.org/toolkit/api/createListenerMiddleware), [createDynamicMiddleware](https://redux.js.org/toolkit/api/createDynamicMiddleware), and the [usage guide](https://redux.js.org/toolkit/usage/usage-guide).

# How this group fits the mental model

Reducers stay synchronous and pure; middleware and thunk functions coordinate effects around dispatch. `createAsyncThunk` provides a conventional request lifecycle. Listener middleware offers action/state-driven workflows with cancellation and task helpers. These mechanisms report outcomes through actions so reducers can represent visible loading, success, and failure state.

# Supplied names explained

- `Thunk middleware` — Middleware that recognizes a function dispatched instead of a plain action and invokes it with `dispatch`, `getState`, and optional extra argument. The function can perform async work and dispatch ordinary actions. RTK includes thunk middleware by default.
- `createAsyncThunk(typePrefix, payloadCreator)` — Generates a thunk action creator and `pending`, `fulfilled`, and `rejected` action creators for a request lifecycle. The payload creator may return a value/promise, use `rejectWithValue`, or observe `signal`. It does not create reducers or a data cache automatically.
- `createAsyncThunk options.condition(arg, { getState, extra })` — Runs before the payload creator; return `false` to skip execution, for example when a request is already pending. A skipped thunk dispatches no lifecycle action by default; `dispatchConditionRejection` opts into a rejected action. This is a local admission check, not a server-side authorization boundary.
- `createAsyncThunk options.dispatchConditionRejection` — When true, dispatches the rejected lifecycle action when `condition` prevents execution. Use its `meta.condition` to distinguish this from an ordinary failure.
- `createAsyncThunk options.idGenerator(arg)` — Supplies the request ID used in lifecycle action metadata; keep IDs unique enough for the concurrency policy your reducers use.
- `createAsyncThunk options.serializeError(error)` — Replaces RTK's default error serialization for rejected action `error`; output should remain serializable.
- `createAsyncThunk options.getPendingMeta({ arg, requestId }, { getState, extra })` — Adds metadata to the pending action only. It does not automatically copy that metadata onto fulfilled/rejected actions; use `fulfillWithValue` or `rejectWithValue` metadata when needed there.
- `createAsyncThunk dispatch options.signal` — Lets a caller pass an external `AbortSignal` to the thunk. The thunk also exposes its own abort mechanism; payload work must observe the resulting signal to stop cooperatively.
- `thunkAPI.dispatch` — Dispatch function supplied as the payload creator's second argument; use it for related actions, while avoiding redundant manually dispatched lifecycle actions for the same request.
- `thunkAPI.getState` — Reads current root state at execution time. Use it for a condition or request input when necessary, but keep dependencies explicit and avoid coupling every thunk to unrelated state.
- `thunkAPI.signal` — An `AbortSignal` for cooperative cancellation of async work. Pass it to `fetch` or another API that supports aborting. Aborting local work does not guarantee a remote server stopped processing an already received request.
- `thunkAPI.rejectWithValue(value)` — Returns a rejected result with a supplied payload, useful for expected domain/server validation errors. Reducers can inspect `action.payload`; unexpected thrown errors are represented in `action.error`.
- `thunkAPI.fulfillWithValue(value)` — Returns a fulfilled value and can attach custom metadata. Use it when fulfilled action metadata is needed; ordinary return values are simpler for typical requests.
- `thunkAPI.rejectWithValue(value, meta?)` — Optional metadata is merged into the rejected lifecycle action's `meta` alongside RTK's request metadata; do not use it to overwrite internal lifecycle fields.
- `thunkAPI.fulfillWithValue(value, meta)` — Optional metadata is merged into the fulfilled lifecycle action's `meta`; ordinary return values are simpler when no custom metadata is needed.
- `thunkAPI.extra` — The optional extra argument configured for thunk middleware, useful for injecting API clients or other dependencies rather than importing mutable globals. It is `undefined` unless configured.
- `thunkAPI.requestId` — Unique ID associated with this thunk execution; reducers can use it to ignore stale responses when requests race.
- `thunkAPI.arg` — Original argument passed to the thunk action creator. Avoid putting secrets in it because it is included in action metadata and may appear in logs or DevTools.
- `pending lifecycle action` — Dispatched when the thunk starts (unless rejected by a pre-execution condition). It carries request metadata including the argument and request ID; use it to represent loading or active request state.
- `fulfilled lifecycle action` — Dispatched when the payload creator resolves successfully. Its payload is the resolved value (or customized fulfilled value); reducers decide how to store it.
- `rejected lifecycle action` — Dispatched when the payload creator throws/rejects, is aborted, or a condition prevents execution (configuration can choose whether condition rejection dispatches). Inspect metadata, `payload`, and `error` rather than assuming all rejections mean the same thing.
- `createAsyncThunk.settled matcher` — Matcher attached to each generated thunk that matches either its fulfilled or rejected action, useful for shared cleanup in `addMatcher`. It is a matcher, not an additional lifecycle action creator.
- `createAsyncThunk result promise.unwrap()` — The dispatched thunk promise itself resolves to the final lifecycle action even when the request failed. `.unwrap()` instead resolves to the fulfilled payload or rejects with the `rejectWithValue` payload / serialized error, so ordinary `try`/`catch` works.
- `createAsyncThunk result promise.abort()` — Abort method on the promise returned by dispatching a thunk. It marks the running thunk aborted; async work stops only if it observes the supplied abort signal.
- `createAsyncThunk result promise.requestId` — Request identifier on the dispatched thunk promise, matching lifecycle metadata and useful for correlating concurrent requests.
- `createAsyncThunk result promise.arg` — Original thunk argument exposed on the dispatched thunk promise and lifecycle metadata. Never place credentials or secrets in this value.
- `createListenerMiddleware(options)` — Creates middleware plus listener registration/management methods. Register it in the store. Its effects run in response to matching actions or state transitions, with a workflow API similar in spirit to a lightweight saga/observable alternative.
- `listenerMiddleware.middleware` — The actual Redux middleware from the listener instance; install this in `configureStore.middleware`. The instance object itself is not middleware.
- `listenerMiddleware options.extra` — Optional dependency injected into every `listenerApi.extra`, useful for sharing an API client without hard-coding it into listener logic.
- `listenerMiddleware options.onError(error, errorInfo)` — Optional handler for synchronous or asynchronous listener-effect errors and synchronous predicate errors; `errorInfo.raisedBy` distinguishes `effect` from `predicate`.
- `listenerMiddleware.startListening(options)` — Registers exactly one matching strategy (`type`, `actionCreator`, `matcher`, or `predicate`) and an effect callback. Predicates and effects run after reducers, so current and original state can be compared. It returns an unsubscribe function; passing `{ cancelActive: true }` to that function also cancels running instances.
- `listenerMiddleware.addListener` — RTK action creator (imported from `@reduxjs/toolkit`, not an instance method) used to add a listener dynamically by dispatching its produced action through the listener middleware. Dispatch returns an unsubscribe function; this is useful for component-owned subscriptions and requires the middleware to see the action.
- `listenerMiddleware.removeListener` — RTK action creator (not an instance method) that removes a dynamically registered listener. It accepts the same matching options as `stopListening`; `{ cancelActive: true }` also cancels active instances.
- `listenerMiddleware.clearAllListeners()` — Action creator that removes every listener entry and cancels its active instances when dispatched through the listener middleware.
- `listenerMiddleware.stopListening(options)` — Instance method that removes a matching listener and returns whether it was found. It accepts `{ cancelActive: true }` to also cancel running instances.
- `listenerMiddleware.clearListeners()` — Instance method that removes all listener entries and cancels their running instances; particularly useful when resetting middleware/store state between tests.
- `listenerApi.dispatch` — Dispatch capability provided to the listener effect; it may trigger reducers and other listeners. Avoid accidental feedback loops by using clear action predicates and state conditions.
- `listenerApi.extra` — Dependency value configured as `extra` when creating the listener middleware.
- `listenerApi.signal` — AbortSignal for the current listener instance. Pass it to cooperative APIs such as `fetch`; cancellation cannot reverse completed external effects.
- `listenerApi.getOriginalState()` — Returns state from before the triggering action, but only synchronously during the original dispatch call. Calling it later from an async continuation throws; capture the needed value before awaiting.
- `listenerApi.getState` — Reads the current store state from a listener effect. Listener middleware also exposes previous-state helpers in its broader API; the supplied name here is the current-state accessor.
- `listenerApi.cancelActiveListeners()` — Cancels other active instances of the same listener entry. Commonly used to implement take-latest/debounce patterns. Async tasks must cooperate with cancellation; pair it with `pause` or an abort-aware operation.
- `listenerApi.delay(ms)` — Cancellation-aware timer promise: it resolves after the timeout and rejects with a task-abort error if the listener is cancelled while waiting.
- `listenerApi.throwIfCancelled()` — Throws a task-abort error if the current listener has been cancelled; useful after non-cancellation-aware work before continuing.
- `listenerApi.cancel()` — Cancels this listener instance (whereas `cancelActiveListeners()` cancels other active instances of the same registration).
- `listenerApi.take(predicate)` — Waits for a future matching action and returns action/state data when it occurs; it can time out or be cancelled according to the API options. It models “wait for the next event” workflows.
- `listenerApi.condition(predicate)` — Waits until a matching action or state condition occurs and resolves to indicate whether it matched before cancellation/timeout. Use it when a workflow needs to pause until a condition is met.
- `listenerApi.pause(promise)` — Waits for a promise while making the wait cancellable by listener cancellation. Cancellation can interrupt the workflow's wait; the underlying promise itself may continue unless separately abortable.
- `listenerApi.fork(asyncTask)` — Starts a child task in the listener's cancellable task scope and returns a task handle with result/cancel behavior. Use it for structured concurrent work and handle child failures/results explicitly.
- `listenerApi.unsubscribe()` and `listenerApi.subscribe()` — Temporarily stop and resume matching future actions for this listener entry. Unsubscribing does not cancel already-running effects; `cancelActiveListeners()` addresses active sibling executions.
- `listenerMiddleware.startListening.withTypes<>()` — TypeScript helper that returns a listener registration function pretyped with application state, dispatch, and extra-argument types.
- `listenerMiddleware.addListener.withTypes<>()` — Typed helper for the dynamic add-listener action creator.
- `listenerApi` task helpers — `take`, `condition`, `pause`, `delay`, `fork`, and `throwIfCancelled` form cancellable workflow primitives. `take` waits for a matching future action and returns action plus current/original state; `condition` resolves a boolean; `fork` creates a child task whose result is a task result object and whose cancellation/errors must be handled. These coordinate client workflows; they do not provide durable jobs or distributed transactions.
- `createDynamicMiddleware()` — Creates middleware whose middleware list can be augmented at runtime through its returned API. It is useful when code-split features need to register middleware after store creation; it adds lifecycle and ordering complexity.
- `createDynamicMiddleware.middleware` — The wrapper middleware from the returned instance; install it in the store before injecting any additional middleware. Injected middleware execute at this wrapper's position in the middleware chain.
- `Dynamic middleware injection` — Adding middleware to a running store through a dynamic middleware instance. Register the dynamic middleware with the store first, then inject the feature middleware through its API; injecting does not bypass normal ordering or duplicate-effect concerns.
- `createDynamicMiddleware.addMiddleware(...middleware)` — Adds middleware by function reference; the same middleware reference is included only once and injected middleware run in insertion order at the wrapper's position in the chain.
- `createDynamicMiddleware.withMiddleware(...middleware)` — Returns a dispatch function augmented with middleware for that dispatch path; this is distinct from permanently adding middleware to the instance.
- `createDispatchWithMiddlewareHook(...middleware)` — React entry point helper for creating a hook whose dispatch uses additional middleware from the dynamic instance.
- `createDispatchWithMiddlewareHookFactory(context?)` — Creates a dispatch-hook factory for a specified React-Redux context; consumers must use the matching Provider context.

# Cross-item comparison

Use `createAsyncThunk` for a command-like async operation with a conventional pending/fulfilled/rejected lifecycle. Use listener middleware for reactions to actions or state, waiting for follow-up events, debounce/take-latest, and longer workflows. A thunk starts because code dispatches it; a listener starts because a registered predicate matches. RTK Query is usually a better fit for standard server-data fetching, caching, deduplication, and invalidation.

`listenerApi.cancelActiveListeners()` cancels sibling active invocations for the same entry. `listenerApi.unsubscribe()` prevents future invocations but does not itself mean “cancel all existing work.” `listenerApi.pause(promise)` makes the listener's wait cancellation-aware, but does not forcibly cancel the wrapped promise. `getOriginalState()` is synchronous-only. Cancellation and rollback are different concepts. For workflow registration actions carrying callbacks, place listener middleware before serializability checking as the official setup example shows.

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
