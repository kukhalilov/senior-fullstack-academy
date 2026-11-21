
# React Redux Toolkit store slices selectors middleware and async workflows — Reference: React-Redux provider, hooks, and legacy connector

# Scope and version

This lesson covers React-Redux 9.3.1 as checked on 2026-11-17. React-Redux recommends hooks for new component code. `connect()` is marked deprecated starting with 9.3.0, remains functional, and is not intended for removal; `legacy_connect` is available when retaining it without the editor marker. See [Hooks](https://redux.js.org/react-redux/api/hooks), [Provider](https://redux.js.org/react-redux/api/provider), [batch](https://redux.js.org/react-redux/api/batch), and [connect](https://redux.js.org/react-redux/api/connect).

# How this group fits the mental model

React-Redux bridges a Redux store and a React tree. The Provider makes one store/context available; hooks let function components select data, dispatch actions, and access the store when necessary. The legacy higher-order connector builds a wrapper component that maps store state and dispatch into props.

# Supplied names explained

- `<Provider store>` — Context provider that makes a Redux store available to descendant React-Redux hooks and connected components. Place it above consumers. The store should remain stable for the application's lifetime; replacing it remounts/rebinds the integration and is rarely intended.
- `Provider children` — The React elements rendered inside the provider and thereby given access to its store context.
- `<Provider serverState>` — Optional serialized server-state snapshot used for the initial hydration render, so client output matches server HTML; after hydration setup, normal client-store updates are applied.
- `<Provider context>` — Optional custom React context instance. Every consumer using that store must use matching context-aware hooks or `connect` options; mixing contexts makes the store invisible.
- `<Provider stabilityCheck and identityFunctionCheck>` — Global defaults for the corresponding development-only `useSelector` checks. Per-hook settings can override these diagnostic frequencies.
- `useSelector(selector, options?)` — Runs a selector with the full root state and subscribes the component to store updates. The component rerenders when the selected result changes according to the equality function. The selector must be pure and may run multiple times.
- `useDispatch()` — Returns the store's dispatch function. It does not subscribe to state. In TypeScript, the inferred dispatch type should include thunk middleware and any other configured middleware extensions.
- `useStore()` — Returns the actual Redux store object from context. Use sparingly for specialized integration; ordinary rendering should select needed values with `useSelector`, which establishes a subscription.
- `useStore.withTypes<RootState>()` — TypeScript helper that pretypes the store hook's state type. It changes compile-time inference only.
- `connect(mapStateToProps?, mapDispatchToProps?, mergeProps?, options?)` — Higher-order function that returns a function which wraps a component. Optional mapping functions select state and dispatch props; `mergeProps` combines mapped and own props; `options` controls subscription and rendering behavior. It returns a connected wrapper rather than mutating the wrapped component.
- `connect options context` — Uses the specified React context rather than the default. It must be the same context instance provided by the corresponding `<Provider>`.
- `connect options forwardRef and areStatesEqual/areOwnPropsEqual/areStatePropsEqual/areMergedPropsEqual` — `forwardRef` makes a ref on the connected wrapper reach the wrapped component; the four equality callbacks customize comparisons for store state, wrapper props, mapped state props, and merged props. Current documented defaults are strict reference equality for store state and shallow equality for the other three. Override these only with a correct equivalence relation, since incorrectly returning `true` can leave stale props rendered.
- `useSelector equalityFn` — Optional equality function (or option property) used to compare previous and next selector results. Default is strict `===`, not shallow equality. Returning a new object each run will normally trigger an update unless equality logic or memoization prevents it.
- `useSelector devModeChecks.stabilityCheck` — Development-only frequency setting for checking whether a selector returns unstable results for identical input; valid frequencies documented by the API include `'never'`, `'once'`, and `'always'`.
- `useSelector devModeChecks.identityFunctionCheck` — Development-only frequency setting that detects selectors returning the entire root state, which commonly causes broad subscriptions and rerenders. It is diagnostic, not a production optimization.
- `useDispatch.withTypes<AppDispatch>()` — TypeScript helper that returns a dispatch hook pre-typed with the application's inferred `AppDispatch`. Define the typed hook once outside components.
- `useSelector.withTypes<RootState>()` — TypeScript helper that returns a selector hook pre-typed with the application's root-state type, avoiding repeated annotations.
- `Typed React-Redux hooks` — Application-defined typed wrappers around `useDispatch` and `useSelector`, commonly derived from `typeof store.dispatch` and `ReturnType<typeof store.getState>`. These keep component code concise and synchronize types with actual store middleware/reducer setup.
- `React-Redux custom context` — An alternate React context for applications that need separate stores or isolated integration trees. Provider and hooks/connectors must all use the same context instance; mixing default and custom context causes consumers to fail to find the intended store.
- `connect remains supported` — Existing `connect()` integrations continue to work and the maintainers do not plan to remove the API, but current docs mark it deprecated as of 9.3.0 and recommend hooks. It is therefore compatibility support, not equal-status guidance for new code. `legacy_connect` is the alias without the deprecation marker.
- `legacy_connect alias` — Named alias for `connect()` that avoids the editor deprecation marker while retaining the same legacy connector behavior; it is for existing code, not a separate integration model.
- `React-Redux batch(callback)` — Renderer batching helper for grouping updates caused by multiple dispatches outside React event handling. With React 18 automatic batching makes explicit `batch()` unnecessary for ordinary updates; the API remains available for compatibility and cross-renderer behavior.
- `React-Redux batch(callback) and React 18 automatic batching` — `batch(() => { ... })` groups React updates from multiple dispatches into a render pass. React 18 automatically batches updates from more sources, so most React 18 apps do not need to call this helper explicitly; the API remains documented and is not described as deprecated.

# Cross-item comparison

Hooks expose store access where a component uses it and work naturally with function components and TypeScript. `connect()` wraps a component and maps store values into props; it remains useful when maintaining existing code or when its wrapper/selector organization is an intentional fit. Current guidance recommends hooks for new code, and the 9.3.0 deprecation marker should be included in migration planning.

`useSelector` answers “which value should this component observe?”; `useStore` exposes the whole store and does not create a reactive selected-value subscription. Prefer the narrow selector. A typed hook changes TypeScript inference, not runtime behavior. A custom context changes which Provider/store tree is addressed and must be applied consistently.

# Examples

```tsx
const store = configureStore({ reducer: { todos: todosReducer } })
type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

function TodoCount() {
  const count = useAppSelector(state => state.todos.ids.length)
  const dispatch = useAppDispatch()
  return <button onClick={() => dispatch(todoAdded({ title: 'Read docs' }))}>{count}</button>
}

root.render(<Provider store={store}><App /></Provider>)
```

Avoid `useSelector(state => ({ count: state.todos.ids.length }))` with default equality: it creates a new object each time. Select the primitive, use a memoized selector, or provide a deliberate equality function.

# Common mistakes

- Rendering a consumer outside the matching Provider.
- Creating a new store on every React render.
- Returning a fresh object/array from a selector without memoization or equality handling.
- Using `useStore` and reading state imperatively during render without a subscription.
- Treating `useDispatch()` as a state subscription.
- Mixing custom context with default-context hooks.
- Claiming `connect()` was removed or is fully current recommended API; it works but is now marked deprecated in 9.3.0.
- Assuming `serverState` replaces the client store's preloaded state; it supplies the hydration snapshot and should match serialized server state.
- Adding `batch()` around every dispatch in a React 18 application without a concrete need; automatic batching already covers updates broadly.

# Knowledge checks with answers

1. What does Provider provide? **Store context to descendants.**
2. What comparison does `useSelector` use by default? **Strict reference equality (`===`).**
3. Does `useStore()` make a component rerender when state changes? **No; select with `useSelector` for reactive rendering.**
4. What is the status of `connect()`? **Deprecated in React-Redux 9.3.0, still functional, and not planned for removal; hooks are recommended for new code.**
5. Why define typed hooks once? **They centralize app-specific state and dispatch inference without runtime changes.**
6. What is Provider's `serverState` for? **The initial hydration snapshot, preventing server/client markup disagreement while hydration starts.**

Sources: [React-Redux Hooks](https://redux.js.org/react-redux/api/hooks), [React-Redux Provider](https://redux.js.org/react-redux/api/provider), [React-Redux batch](https://redux.js.org/react-redux/api/batch), [React-Redux connect](https://redux.js.org/react-redux/api/connect).
