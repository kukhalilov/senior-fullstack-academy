
# React Redux Toolkit store slices selectors middleware and async workflows — Big-picture orientation and mental model

# Problem and purpose

React components need data that may be shared across distant parts of an interface, changed by many user events, or updated by asynchronous work. Redux gives that shared state one explicit transition path: an event becomes an action, a reducer calculates the next state, and components select the pieces they need. Redux Toolkit (RTK) is the standard way to write this logic today; it removes much of the setup and boilerplate while preserving Redux's observable, predictable data flow.

This topic is about client application state and the Redux workflow. It is not a recommendation to put every value in a global store. A text field's transient keystrokes, a component's open/closed state, server response caching, and durable database records have different ownership and lifecycle needs. Keep state close to its owner unless sharing, coordination, persistence, or explicit event history justifies moving it.

# Plain-language mental model

Think of the store as the current ledger for one application. A dispatched action is a small event-shaped message describing what happened, such as `{ type: 'cart/itemAdded', payload: { id: 'p1' } }`. A reducer is a deterministic rule that receives the current state and action and calculates a replacement state. Middleware forms a controlled corridor around dispatch where logging, async orchestration, and other cross-cutting behavior can happen. Selectors are read-only views over the ledger: some return stored values, while others derive values such as a filtered list or total.

RTK's `configureStore` assembles the store with useful defaults. `createSlice` groups a feature's initial state, reducer cases, and generated action creators. Immer lets those case reducers use draft-style assignments while producing immutable updates. React-Redux's `<Provider store>` makes a store available to descendants; hooks subscribe components to selected values and provide dispatch access.

# How the parts fit together

The normal path is one-directional:

1. A UI event dispatches an action creator, or an async workflow later dispatches an action.
2. Middleware may observe or transform the dispatch flow. Reducers still remain synchronous state-transition functions.
3. The root reducer delegates to feature reducers and produces the next state tree.
4. Selectors read that state. React-Redux compares the selected result and schedules a component update when the selected value changes according to the chosen equality rule.

This separation makes questions easier to answer: reducers define state transitions; thunks or listener middleware coordinate effects; selectors define reads and derivations; components render and express user intent. The separation is a reasoning aid, not a demand for one file per function.

# Concept map

```text
UI event ──dispatch──> action ──> middleware ──> reducer(s) ──> next state
                           │                              │
                           └─ async workflows             └─> selectors ──> React UI
                              (thunk/listener)                    ▲
                                                                  │
                                          <Provider store> + hooks┘
```

Store configuration determines reducer composition, default middleware, enhancer and DevTools behavior, and optional initial state. Feature slices own cohesive state transitions. Entity adapters help represent collections as normalized records and ID lists. Memoized selectors avoid repeating derivations when their inputs have not changed. Async workflows dispatch ordinary actions so loading, success, and failure state remains visible to reducers and subscribers.

# End-to-end walkthrough

Suppose a shopping page has a normalized product catalog and a cart. A `products` slice owns product entities; a `cart` slice owns selected product IDs and quantities. A user clicks Add. The component dispatches `cartItemAdded({ productId })`. The cart reducer updates its draft; Immer creates the immutable next state. A selector combines cart quantities with product data to derive line items and a total, rather than storing a second, potentially stale total. `useSelector` subscribes to the total or line items, and `useDispatch` provides the typed dispatch in a TypeScript app.

If the page must load product data, a thunk can make the request and dispatch pending, fulfilled, or rejected lifecycle actions. The reducers decide how those actions change request status and data. For workflows triggered by state transitions—for example, debounce autosave after edits—listener middleware can react to actions, cancel older active work, wait for conditions, and start child tasks. Prefer a purpose-built server-state cache such as RTK Query for the common fetch/cache/invalidation lifecycle; a handwritten thunk is appropriate where custom orchestration or a smaller one-off request is clearer.

# When to use it and tradeoffs

Use Redux when explicit shared state transitions, predictable debugging, cross-feature coordination, or a consistent state architecture solve a real problem. RTK reduces manual action/reducer setup and supplies development checks, but Redux still introduces a state model and conventions the team must maintain. Normalize relational collections when entities are updated independently or referenced from multiple places; for small local collections, a simpler shape can be easier.

Memoization is not automatically faster: an ordinary selector is sufficient for a direct lookup or cheap calculation. Memoized selectors are valuable when derivation is expensive, returns a new reference that would cause needless renders, or needs stable reuse. Thunks are straightforward for request lifecycles; listener middleware models reactions and longer workflows. Neither belongs inside reducers, which must stay pure and synchronous.

# What later lessons cover

The next lesson builds the full mental model and vocabulary. Reference lessons then cover store setup, slices/actions/entities, selectors, async middleware, React-Redux integration, and data-flow invariants. Practice applies them in a cohesive feature, and the interview lesson tests tradeoff reasoning. Current API and version details are tied to the official documentation snapshot recorded in the topic manifest.

Sources: [Redux Toolkit Getting Started](https://redux.js.org/toolkit/introduction/getting-started), [Redux Toolkit Usage Guide](https://redux.js.org/toolkit/usage/usage-guide), [React-Redux Hooks](https://redux.js.org/react-redux/api/hooks), [React-Redux connect status](https://redux.js.org/react-redux/api/connect).
