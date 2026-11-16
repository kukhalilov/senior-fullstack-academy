<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# React Redux Toolkit store slices selectors middleware and async workflows — Reference: Redux data flow and current API constraints

# Scope and version

This reference collects core Redux rules and current RTK defaults. RTK 2 uses Redux 5-compatible string action types, installs thunk by default, and in development adds checks for accidental mutation and non-serializable values. These defaults are configurable; consult the installed package's docs for exact options. See [Redux Toolkit Getting Started](https://redux.js.org/toolkit/introduction/getting-started), [Usage Guide](https://redux.js.org/toolkit/usage/usage-guide), [configureStore](https://redux.js.org/toolkit/api/configureStore), and [RTK 2 migration guide](https://redux.js.org/usage/migrations/migrating-rtk-2).

# How this group fits the mental model

These invariants are the safety rails behind Redux's predictability. They constrain the shape of events, the behavior of state transitions, the values kept in state, and the order in which middleware handles dispatch. RTK automates common setup but does not remove the underlying rules.

# Supplied names explained

- `Action object with string type` — A plain Redux action has a string `type` property and may include payload, metadata, or error data. RTK-generated actions follow this contract. Thunks and listener registration may use function-bearing values at the middleware boundary, but reducers receive plain actions.
- `Reducer pure state transition` — A reducer calculates next state from current state and action without observable side effects and without changing the previous state. Same inputs should yield the same result. Put network requests, clocks, randomness, and subscriptions in middleware or callers.
- `Immutable state update` — Updates preserve the previous state's value and identity for unchanged branches while returning new values for changed data. RTK case reducers use Immer to make this practical; outside them, use immutable operations or another deliberate immutable-state tool.
- `Serializable state and actions` — Prefer plain data (objects, arrays, strings, numbers, booleans, null) in stored state and ordinary actions. Serializable values support debugging, replay, persistence, and predictable tooling. RTK's serializability middleware reports unsupported values by default in development; exceptions are possible for known fields, but excluding a path from checks does not make that value suitable for persistence or replay.
- `State normalization` — Represent entities once, typically in an ID-indexed lookup with an ID list, and reference them by ID. This reduces duplicated nested copies and narrows updates. Apply it when relational access/update benefits outweigh extra indirection.
- `Derived state through selectors` — Calculate values from canonical state at read time instead of storing redundant copies. Selectors centralize reads; memoization can stabilize expensive derived results. Derived data must be deterministic from its declared inputs.
- `Middleware order` — Middleware is composed around dispatch in listed order: earlier middleware can inspect or handle an action before it reaches later middleware and reducers. Order affects function-valued thunks, listener registration actions, logging, error handling, and transformations. Preserve defaults unless a deliberate change is made.
- `Default development immutability check` — RTK's default middleware checks state for mutations in development and can report mutation paths. It is a development guardrail with runtime cost, not a production immutability enforcement mechanism; reducers still must be correct in all builds.
- `Default development serializability check` — RTK's default middleware inspects dispatched actions and state for non-serializable values in development. It can be configured or customized for known exceptions. The warning signals a design question, not proof that a value will break every use case.
- `Redux Toolkit as standard Redux approach` — The Redux maintainers recommend RTK as the standard way to write Redux logic. It provides store setup, slice/reducer helpers, middleware defaults, and optional RTK Query while retaining Redux's store/action/reducer model. Handwritten Redux core remains possible, but is generally unnecessary for a new app.

# Cross-item comparison

Purity and immutability are related but different: purity excludes effects and dependence on hidden changing inputs; immutability preserves prior state values. A reducer could avoid network calls yet still be incorrect by mutating prior state. Serializable data is another concern: an immutable `Date` object can still be non-serializable under Redux's ordinary data conventions.

Normalization controls storage shape. Selectors control how consumers read and derive from that shape. A normalized tree without selectors can leak entity-structure details into every component; selectors without canonical state can merely centralize duplicated facts. Together they keep updates and reads coherent.

# Examples

Good reducer transition:

```ts
const cartSlice = createSlice({
  name: 'cart',
  initialState: { lines: [] as CartLine[] },
  reducers: {
    quantityChanged(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const line = state.lines.find(item => item.id === action.payload.id)
      if (line) line.quantity = Math.max(0, action.payload.quantity)
    },
  },
})
```

The draft assignment is an Immer-backed immutable update. Validation belongs at the boundary too: a real application should reject invalid payloads before dispatch instead of silently treating reducer logic as a complete input-security layer.

# Common mistakes

- Adding a timestamp or random ID inside a reducer; generate it before dispatch or use a supported prepare/thunk workflow.
- Treating development mutation/serializability checks as the source of correctness.
- Storing promises, functions, class instances, or browser objects in persistent state without a strong reason and explicit tooling strategy.
- Duplicating derived totals or entity copies across slices.
- Reordering/replacing middleware without checking which actions each layer must see.
- Assuming RTK means “Redux without reducers”; reducers remain the state-transition mechanism.

# Knowledge checks with answers

1. Why require reducers to be pure? **So a state transition can be reasoned about, replayed, and tested from its inputs.**
2. Does Immer mean Redux state is mutable? **No; it translates draft edits into immutable next state.**
3. Why prefer serializable data? **It enables reliable inspection, replay, persistence, and tooling.**
4. What does middleware order affect? **Which middleware observes/handles/transforms dispatch before later middleware and reducers.**

Sources: [Redux Toolkit Getting Started](https://redux.js.org/toolkit/introduction/getting-started), [Redux Toolkit Usage Guide](https://redux.js.org/toolkit/usage/usage-guide), [configureStore](https://redux.js.org/toolkit/api/configureStore), [RTK 2 migration guide](https://redux.js.org/usage/migrations/migrating-rtk-2).
