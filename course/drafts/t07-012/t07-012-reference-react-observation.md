<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# MobX observables computeds actions reactions and React integration — Reference: React component observation integration

# Scope and version

This reference follows the current MobX React documentation: `mobx-react-lite` provides function-component bindings, while `mobx-react` adds class-component support. MobX 7's React binding line is `mobx-react-lite` 5 / `mobx-react` 10. The optional `mobx-react-plugin` can automate observation and React Compiler compatibility. See [React integration](https://mobx.js.org/react-integration.html), [Installation](https://mobx.js.org/installation.html), [React Compiler](https://mobx.js.org/react-compiler.html), and [MobX releases](https://github.com/mobxjs/mobx/releases).

# How this group fits the mental model

An observed component is a reactive consumer. MobX records observable properties read during that component's render and schedules that component when those dependencies change. The relationship is based on actual property reads, not just receiving a reference to an observable object.

# Supplied names explained

- `observer(Component)` — Higher-order component that wraps a component and subscribes it to observable values read during its render. It also applies React memoization behavior internally; wrapping it again in `React.memo` is usually unnecessary.
- `observer from mobx-react-lite` — Function-component integration package. Use for function components that read observables; it does not make unwrapped descendants reactive automatically.
- `observer from mobx-react` — React binding with class component support as well as observer integration. Current docs distinguish it from the lighter function-component package.
- `useLocalObservable (mobx-react-lite)` — Hook that creates and retains an observable object for a component lifetime, using MobX observable creation semantics. Use when local state is genuinely a rich observable model; simple UI flags often fit React `useState` better.
- `mobx-react-plugin` — Build-time plugin that can automatically wrap eligible React components in `observer`, and can transform async observable methods to flows. It is a build tool feature, not a runtime API to call from component code.
- `mobxReactPlugin() Vite integration` — Vite plugin integration for the MobX React build transform. With React Compiler, configure the MobX plugin before the React Compiler transform so observed output is excluded from unsafe memoization.
- `mobxReactPlugin Babel integration` — Babel plugin integration for supported Babel-based setups, including React Native/Expo and other bundlers. Follow the plugin's setup for that bundler rather than assuming Vite configuration is interchangeable.
- `React Compiler use no memo directive for observed components` — The React `'use no memo'` directive opts an observed component or hook out of compiler memoization. MobX tracks runtime reads while React Compiler reasons from static dependencies; caching the JSX of an observed component can otherwise show stale content after in-place observable changes. The plugin can insert the directive automatically.
- `MobX 7 mobx-react-lite 5 React bindings` — The function-component binding line paired with MobX 7. The precise compatible package patch should be installed from the current package metadata and lockfile.
- `MobX 7 mobx-react 10 class component bindings` — The class-component-capable React integration line paired with MobX 7. Use it only when class component support is needed; function components can use the lighter binding.
- `Observable reads during React render` — MobX tracks properties dereferenced synchronously while an `observer` component renders. Passing a store reference without reading a field does not subscribe that component to every field.
- `Observed component re-render` — When a tracked observable dependency changes, MobX schedules the observing component to render again. Components that did not read the changed value need not rerender because of that value.
- `React Strict Mode compatibility` — React Strict Mode may intentionally mount/render/effect more than once in development to expose unsafe lifecycle behavior. Use supported current bindings, keep render pure, make effects/disposers idempotent, and test cleanup; do not mistake development-only extra executions for MobX duplicating a production update.

# Cross-item comparison

`observer` is a runtime wrapper that tracks reads. `mobx-react-plugin` is an optional build-time transform that can add that wrapper and coordinate React Compiler behavior. Manual wrapping is simpler when there are few components or when explicit build transforms are undesirable. The plugin must be configured in the correct order for the selected compiler.

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
- Expecting `observer` to fix stale props or to observe values accessed only after asynchronous boundaries.
- Creating side effects during render; use React effect lifecycles or MobX reactions with cleanup.

# Knowledge checks with answers

1. What makes an observable field a dependency of a component? **The component reads it during its observed render.**
2. Which package supports function components only? **`mobx-react-lite`.**
3. Why might a React Compiler project need `mobx-react-plugin`? **To wrap observed components and keep the compiler from memoizing reactive reads into stale JSX.**
4. Should every local input value use MobX? **No; ordinary component UI state is often better served by React state.**

Sources: [React integration](https://mobx.js.org/react-integration.html), [Installation](https://mobx.js.org/installation.html), [React Compiler](https://mobx.js.org/react-compiler.html), [MobX releases](https://github.com/mobxjs/mobx/releases).
