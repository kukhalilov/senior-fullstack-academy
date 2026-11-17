<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# MobX observables computeds actions reactions and React integration — Reference: React component observation integration

# Scope and version

This reference follows the current MobX React documentation and package metadata checked 2026-11-17: `mobx-react-lite` 5.1.3 provides function-component bindings, `mobx-react` 10.0.4 adds class-component support, and `mobx-react-plugin` 1.0.3 automates observation plus React Compiler compatibility. These bindings require React 18 or later (the current package peer ranges include React 18 and 19). See [React integration](https://mobx.js.org/react-integration.html), [Installation](https://mobx.js.org/installation.html), [React Compiler](https://mobx.js.org/react-compiler.html), and the [MobX 6-to-7 migration](https://mobx.js.org/migrating-from-6-to-7.html).

# How this group fits the mental model

An observed component is a reactive consumer. MobX records observable properties read during that component's render and schedules that component when those dependencies change. The relationship is based on actual property reads, not just receiving a reference to an observable object.

# Supplied names explained

- `observer(Component)` — Higher-order component that wraps a component and subscribes it to observable values read during its render. It also applies React memoization behavior internally; wrapping it again in `React.memo` is usually unnecessary.
- `observer from mobx-react-lite` — Function-component integration package. Use for function components that read observables; it does not make unwrapped descendants reactive automatically.
- `observer from mobx-react` — React binding with class component support as well as observer integration. Current docs distinguish it from the lighter function-component package.
- `Observer render-prop component` — Small `<Observer>{() => ...}</Observer>` region that tracks observables read by its render callback. Use it when a callback or render prop is evaluated by a non-observer component and must still react to observable reads.
- `useLocalObservable (mobx-react-lite)` — Hook that creates and retains an observable object for a component lifetime, using MobX observable creation semantics. Use when local state is genuinely a rich observable model; simple UI flags often fit React `useState` better.
- `mobx-react-plugin` — Build-time plugin that can automatically wrap eligible React components in `observer` and keep React Compiler out of them. The cited current installation/Compiler documentation describes the observer/compiler transformation; do not assume it converts async methods into flows unless the selected plugin version explicitly documents that feature.
- `mobxReactPlugin() Vite integration` — Vite plugin integration for the MobX React build transform. With React Compiler, configure the MobX plugin before the React Compiler transform so observed output is excluded from unsafe memoization.
- `mobxReactPlugin Babel integration` — Babel plugin integration for supported Babel-based setups, including React Native/Expo and other bundlers. Follow the plugin's setup for that bundler rather than assuming Vite configuration is interchangeable.
- `React Compiler use no memo directive for observed components` — The React `'use no memo'` directive opts an observed component or hook out of compiler memoization. MobX tracks runtime reads while React Compiler memoizes from statically inferred dependencies; compiling an observer can cache stale JSX after in-place observable changes. The plugin can insert the directive automatically.
- `MobX 7 mobx-react-lite 5 React bindings` — The function-component binding line paired with MobX 7. The precise compatible package patch should be installed from the current package metadata and lockfile.
- `MobX 7 mobx-react 10 class component bindings` — The class-component-capable React integration line paired with MobX 7. Use it only when class component support is needed; function components can use the lighter binding.
- `enableStaticRendering(true) for SSR` — Disables observer subscriptions during server rendering, where components are rendered once and never unmounted normally; configure it in the server entry to avoid retaining reactions.
- `isUsingStaticRendering()` — Reports whether static rendering mode is currently enabled; use it for library/integration logic, not as application state.
- `MobX 7 removed Provider, inject, and MobXProviderContext` — These older `mobx-react` store-passing APIs were removed; use React's `createContext`/`useContext` with a stable store reference instead.
- `MobX 7 replaced useLocalStore with useLocalObservable` — The former hook was removed in the v7 binding cleanup. Use `useLocalObservable` for an intentionally local observable model, or React state for simple UI state.
- `MobX 7 removed useAsObservableSource` — This hook was removed. Keep the needed values in local observable state and synchronize changing props with `useEffect`, or pass props directly where possible.
- `MobX 7 removed useObserver` — This hook was removed; wrap a component in `observer` or place a focused `<Observer>` render region around the observable-reading callback.
- `MobX 7 removed useStaticRendering` — The old name was removed in favor of `enableStaticRendering`; call `enableStaticRendering(true)` in the server-rendering entry point to avoid creating observer subscriptions during SSR.
- `MobX 7 removed disposeOnUnmount` — The decorator/helper was removed; dispose reactions explicitly in `componentWillUnmount` or return cleanup from `useEffect`.
- `MobX 7 removed observerBatching helpers` — Legacy helpers such as `observerBatching`, `isObserverBatched`, and renderer-specific batching imports were removed; React 18+ renderers handle batching automatically.
- `MobX 7 removed trace API` — The old `trace` API was removed. Use `getDependencyTree`, `getObserverTree`, `spy`, or developer tools to inspect dependencies and events.
- `Observable reads during React render` — MobX tracks properties dereferenced synchronously while an `observer` component renders. Passing a store reference without reading a field does not subscribe that component to every field.
- `Observed component re-render` — When a tracked observable dependency changes, MobX schedules the observing component to render again. Components that did not read the changed value need not rerender because of that value.
- `React Strict Mode compatibility` — The current MobX documentation does not specify a separate MobX Strict Mode mode or special Strict Mode API. Apply React's documented development checks: keep render pure and return reaction/timer cleanup from effects so a repeated setup/cleanup cycle remains safe; the claim here is React lifecycle guidance, not a MobX-specific compatibility guarantee.

# Cross-item comparison

`observer` is a runtime wrapper that tracks reads. `mobx-react-plugin` is an optional build-time transform that can add that wrapper and coordinate React Compiler behavior. Manual wrapping is simpler when there are few components or when explicit build transforms are undesirable. The plugin must be configured in the correct order for the selected compiler.

For server rendering, call `enableStaticRendering(true)` on the server. For callback-based rendering owned by a non-observer component, use an `<Observer>` region or pass plain values; a regular `observer` wrapper tracks only its own render execution.

MobX observation is property-dereference based: passing an observable entity deeper can preserve fine-grained tracking if the child reads the property inside its own `observer` render. React-Redux commonly selects a value higher up and passes it down. These are different data-flow styles with different boundaries and debugging tradeoffs.

# Examples

```tsx
import { observer, useLocalObservable } from 'mobx-react-lite'

const CartCount = observer(function CartCount({ cart }: { cart: CartStore }) {
  return <span>{cart.items.length}</span>
})

const LocalDraft = observer(function LocalDraft() {
  const draft = useLocalObservable(() => ({
    text: '',
    setText(value: string) { this.text = value },
  }))
  return <input value={draft.text} onChange={event => draft.setText(event.target.value)} />
})
```

The first component tracks `cart.items.length` because it reads it during render. The second creates one local observable model per mounted component instance. For a single plain text field, `useState` is often the simpler choice.

# Common mistakes

- Forgetting `observer` on a component that reads observable values.
- Reading an observable in a parent before passing only its primitive value to a child and expecting the child to own that dependency.
- Passing observable collections to a third-party non-observer component without converting them to plain values.
- Wrapping every component in local observables, even for simple UI-only state.
- Combining React Compiler with MobX observers without the documented opt-out/plugin configuration.
- Using MobX 6-era `Provider`/`inject` or `useLocalStore` examples in MobX 7; use React context and `useLocalObservable` instead.
- Leaving observer subscriptions enabled during server rendering instead of setting static rendering mode.
- Expecting `observer` to fix stale props or to observe values accessed only after asynchronous boundaries.
- Creating side effects during render; use React effect lifecycles or MobX reactions with cleanup.

# Knowledge checks with answers

1. What makes an observable field a dependency of a component? **The component reads it during its observed render.**
2. Which package supports function components only? **`mobx-react-lite`.**
3. Why might a React Compiler project need `mobx-react-plugin`? **To wrap observed components and keep the compiler from memoizing reactive reads into stale JSX.**
4. Should every local input value use MobX? **No; ordinary component UI state is often better served by React state.**

Sources: [React integration](https://mobx.js.org/react-integration.html), [Installation](https://mobx.js.org/installation.html), [React Compiler](https://mobx.js.org/react-compiler.html), [MobX 6-to-7 migration](https://mobx.js.org/migrating-from-6-to-7.html), [mobx-react-lite metadata](https://www.npmjs.com/package/mobx-react-lite), [mobx-react metadata](https://www.npmjs.com/package/mobx-react), [mobx-react-plugin metadata](https://www.npmjs.com/package/mobx-react-plugin).
