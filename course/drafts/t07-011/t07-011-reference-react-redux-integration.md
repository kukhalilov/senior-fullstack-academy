<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# React Redux Toolkit store slices selectors middleware and async workflows — Reference: React-Redux provider, hooks, and legacy connector

# Scope and version

This lesson covers React-Redux integration as documented for the current 9.x line. React-Redux recommends hooks for new component code. `connect()` is marked deprecated starting with 9.3.0, remains functional, and is not intended for removal; `legacy_connect` is available when retaining it without the editor marker. See [Hooks](https://redux.js.org/react-redux/api/hooks), [Provider](https://redux.js.org/react-redux/api/provider), and [connect](https://redux.js.org/react-redux/api/connect).

# How this group fits the mental model

React-Redux bridges a Redux store and a React tree. The Provider makes one store/context available; hooks let function components select data, dispatch actions, and access the store when necessary. The legacy higher-order connector builds a wrapper component that maps store state and dispatch into props.

# Supplied names explained

- `<Provider store>` — Context provider that makes a Redux store available to descendant React-Redux hooks and connected components. Place it above consumers. The store should remain stable for the application's lifetime; replacing it remounts/rebinds the integration and is rarely intended.
- `useSelector(selector, options?)` — Runs a selector with the full root state and subscribes the component to store updates. The component rerenders when the selected result changes according to the equality function. The selector must be pure and may run multiple times.
- `useDispatch()` — Returns the store's dispatch function. It does not subscribe to state. In TypeScript, the inferred dispatch type should include thunk middleware and any other configured middleware extensions.
- `useStore()` — Returns the actual Redux store object from context. Use sparingly for specialized integration; ordinary rendering should select needed values with `useSelector`, which establishes a subscription.
- `connect(mapStateToProps?, mapDispatchToProps?, mergeProps?, options?)` — Higher-order function that returns a function which wraps a component. Optional mapping functions select state and dispatch props; `mergeProps` combines mapped and own props; `options` controls subscription and rendering behavior. It returns a connected wrapper rather than mutating the wrapped component.
- `useSelector equalityFn` — Optional equality function (or option property) used to compare previous and next selector results. Default is strict `===`, not shallow equality. Returning a new object each run will normally trigger an update unless equality logic or memoization prevents it.
- `useSelector devModeChecks.stabilityCheck` — Development-only frequency setting for checking whether a selector returns unstable results for identical input; valid frequencies documented by the API include `'never'`, `'once'`, and `'always'`.
- `useSelector devModeChecks.identityFunctionCheck` — Development-only frequency setting that detects selectors returning the entire root state, which commonly causes broad subscriptions and rerenders. It is diagnostic, not a production optimization.
- `useDispatch.withTypes<AppDispatch>()` — TypeScript helper that returns a dispatch hook pre-typed with the application's inferred `AppDispatch`. Define the typed hook once outside components.
- `useSelector.withTypes<RootState>()` — TypeScript helper that returns a selector hook pre-typed with the application's root-state type, avoiding repeated annotations.
- `Typed React-Redux hooks` — Application-defined typed wrappers around `useDispatch` and `useSelector`, commonly derived from `typeof store.dispatch` and `ReturnType<typeof store.getState>`. These keep component code concise and synchronize types with actual store middleware/reducer setup.
- `React-Redux custom context` — An alternate React context for applications that need separate stores or isolated integration trees. Provider and hooks/connectors must all use the same context instance; mixing default and custom context causes consumers to fail to find the intended store.
- `connect remains supported` — Existing `connect()` integrations continue to work and the maintainers do not plan to remove the API, but current docs mark it deprecated as of 9.3.0 and recommend hooks. It is therefore compatibility support, not equal-status guidance for new code. `legacy_connect` is the alias without the deprecation marker.

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

# Knowledge checks with answers

1. What does Provider provide? **Store context to descendants.**
2. What comparison does `useSelector` use by default? **Strict reference equality (`===`).**
3. Does `useStore()` make a component rerender when state changes? **No; select with `useSelector` for reactive rendering.**
4. What is the status of `connect()`? **Deprecated in React-Redux 9.3.0, still functional, and not planned for removal; hooks are recommended for new code.**
5. Why define typed hooks once? **They centralize app-specific state and dispatch inference without runtime changes.**

Sources: [React-Redux Hooks](https://redux.js.org/react-redux/api/hooks), [React-Redux Provider](https://redux.js.org/react-redux/api/provider), [React-Redux connect](https://redux.js.org/react-redux/api/connect).
