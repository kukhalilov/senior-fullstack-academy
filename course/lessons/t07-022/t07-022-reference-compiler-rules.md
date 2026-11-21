# React Compiler configuration directives and React rules — Reference: React purity and hook rules

## Scope and version

This lesson covers the supplied Rules of React and selected compiler-related ESLint diagnostics. These are correctness rules for React code whether or not the compiler is installed. [Rules of React](https://react.dev/reference/react) [ESLint plugin](https://react.dev/reference/eslint-plugin-react-hooks)

## How this group fits the mental model

React may render components more than once, pause, or restart work. Pure, idempotent render logic lets React and the compiler reason about output. Hook call conventions let React associate state and effects with the correct component execution.

## Supplied names explained

- `Components and Hooks must be pure`: render should calculate output from inputs without externally visible side effects or mutation. A component may be called multiple times; render must remain safe to repeat.
- `React calls Components and Hooks`: express components as JSX and Hooks as Hook calls. React must control invocation so it can track identity and schedule work; do not call a component function directly as an ordinary helper.
- `Rules of Hooks`: call Hooks only in React components or custom Hooks, in a stable order at the top level. The lint rule detects common violations.
- `Components and Hooks naming convention`: component functions use PascalCase and custom Hooks start with `use`, helping React tooling and compiler inference recognize them.
- `Only call Hooks at the top level`: do not call Hooks in conditions, loops, nested callbacks, or after early returns that change call order. The special `use` API has documented exceptions, but ordinary Hooks follow this rule.
- `Only call Hooks from React functions`: only React function components and custom Hooks may call Hooks; event handlers and ordinary utilities cannot use them.
- `Do not call components as ordinary functions`: render `<Child />` rather than calling `Child(props)`. JSX lets React preserve component identity and scheduling.
- `Keep render functions idempotent`: with the same inputs and state, render should produce the same result. Do not depend on current time, randomness, or mutable external values without modeling them as inputs/state.
- `Side effects outside render`: perform external mutations, subscriptions, and imperative work in event handlers or Effects, not while calculating JSX.
- `immutability of props and state`: treat inputs as read-only and create new state values rather than mutating existing ones. Mutation can corrupt prior snapshots and make memoization unsound.
- `set-state-in-render lint`: flags unconditional state updates during render that cause rerender loops. Derive values during render or update state in an event/Effect designed for synchronization.
- `set-state-in-effect lint`: flags synchronous state updates in Effects that often cause avoidable extra render passes. Prefer deriving state or handling the update at its source; use Effects to synchronize with external systems.
- `refs lint`: compiler diagnostics flag unsafe ref reads/writes during render. Read/write refs in event handlers or Effects, not to influence render output.
- `purity lint`: detects impure render patterns such as known mutation or nondeterministic calculations.
- `static-components lint`: flags components created dynamically inside another component when that recreation breaks stable identity; define components at module scope or use a stable pattern.
- `preserve-manual-memoization lint`: helps ensure compiler transformation does not invalidate existing manual memoization assumptions. Treat warnings as a signal to inspect dependency and identity semantics.
- `unsupported-syntax lint`: identifies syntax/patterns the compiler cannot safely analyze and may skip. Unsupported does not necessarily mean invalid JavaScript or a runtime bug.
- `exhaustive-deps lint`: checks that Effect-like Hook dependency lists include the reactive values they use; it helps catch stale closures but does not mean every dependency warning should be silenced with a broader array.
- `component-hook-factories lint`: detects higher-order functions that define nested component or Hook factories, which can recreate identities and interfere with compiler assumptions.
- `config lint`: validates React Compiler configuration options and reports unsupported or invalid settings.
- `error-boundaries lint`: recommends Error Boundaries for errors thrown while rendering descendant components; a surrounding `try/catch` in the parent render does not catch child render errors.
- `gating lint`: validates the configuration used to gate compiled output behind a runtime feature flag.
- `globals lint`: detects assignment to or mutation of global values during render, which violates purity and can make repeated rendering inconsistent.
- `incompatible-library lint`: identifies libraries whose behavior or mutation patterns are incompatible with compiler memoization assumptions.
- `immutability lint`: detects mutation of props, state, and other values React treats as immutable.
- `use-memo lint`: flags `useMemo` calls whose callback does not return a value, since the memoized result would be `undefined` and the Hook likely does not express the intended work.

The `eslint-plugin-react-hooks` recommended preset includes `exhaustive-deps`, `rules-of-hooks`, and compiler-related diagnostics such as `component-hook-factories`, `config`, `error-boundaries`, `gating`, `globals`, `immutability`, `incompatible-library`, `preserve-manual-memoization`, `purity`, `refs`, `set-state-in-effect`, `set-state-in-render`, `static-components`, `unsupported-syntax`, and `use-memo`. Compiler diagnostics can be used before the compiler is enabled. When the compiler finds a problem, it skips affected components/hooks while continuing to compile eligible code; diagnostics can be adopted and addressed incrementally. [ESLint plugin](https://react.dev/reference/eslint-plugin-react-hooks) [Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)

## Cross-item comparison

Purity/idempotence govern render behavior; Hook rules govern call locations/order; naming conventions support tool recognition; compiler lints report specific patterns. A lint diagnostic can be a correctness problem or an optimization-coverage issue, so read the rule message before deciding how to fix it.

## Examples

```jsx
function Counter({ initial }) {
  const [count, setCount] = useState(initial);
  return <button onClick={() => setCount(value => value + 1)}>{count}</button>;
}
```

The Hook is unconditional at the component top level, render is derived from state/props, and the side effect of setting state occurs in an event callback.

## Common mistakes

- Calling `Child(props)` instead of rendering `<Child {...props} />`.
- Mutating an array/object from props or state.
- Calling `useState` inside a conditional branch.
- Treating every diagnostic as a runtime failure; some indicate the compiler skipped optimization.
- Hiding real side effects in render to make a lint warning disappear.
- Applying automatic fixes without understanding identity or effect semantics.

## Knowledge checks with answers

1. Why must React control component calls? So it can preserve identity and scheduling.
2. Why do Hooks need stable top-level order? React associates Hook state by call order.
3. Does an unsupported-syntax diagnostic necessarily mean invalid JavaScript? No; the compiler may simply be unable to optimize it safely.
4. Where do side effects belong? Event handlers or Effects, depending on whether they respond to an interaction or synchronize with an external system.

## Sources

- [React reference and Rules of React](https://react.dev/reference/react)
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
- [React calls Components and Hooks](https://react.dev/reference/rules/react-calls-components-and-hooks)
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [ESLint plugin for React Hooks](https://react.dev/reference/eslint-plugin-react-hooks)
