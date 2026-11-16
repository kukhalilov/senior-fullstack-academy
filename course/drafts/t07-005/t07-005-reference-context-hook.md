# React state reducer context and action hooks — Reference: Context creation, provision, and subscription

Sources: React 19.3 [`createContext`](https://react.dev/reference/react/createContext) and [`useContext`](https://react.dev/reference/react/useContext).

## Scope and version

Context propagates a value through a render subtree. It is not a replacement for every prop or a mutable global singleton. State management architecture and external stores belong in other topics.

## Create and provide

`createContext(defaultValue)` creates a context object. The default is a static fallback used only when no matching provider exists above the consumer; it is not mutable context state. A provider supplies `<SomeContext value={value}>` to descendants. The provider component itself does not read its own value through a hook in the same render; only descendants see it. Nested providers override the value for their subtree, and the nearest provider wins.

## Read and subscribe

`useContext(SomeContext)` reads the nearest provider above the calling component or the default value if none exists. It subscribes the component to that context. React compares old/new provider values using `Object.is`; when different, consumers update. A context value of `undefined` is an actual provided value, not a signal to use the default. Provider and consumer must reference the exact same context object; duplicated modules from symlinks/bundling can break that identity.

Consumers that use context re-render when the provider value changes even when wrapped in `memo`; memoization does not block fresh context values. If the provider creates a new object/function on every render, identity changes may re-render all consumers. Split contexts by update frequency/concern or stabilize the value when profiling shows a real issue. Do not mutate a provider object in place expecting consumers to update; use state/reducer to create a new value. Context often works well for theme, locale, current user, or service references consumed by a subtree. For high-frequency broad state, consider state placement, selectors, or an external-store/library design.

Context versus props: props make a direct dependency visible and are often clearer for a small parent-child chain. Context avoids manual prop threading through many intermediate components but hides dependency at call sites and couples consumers to a provider. Context versus global mutable singleton: context is render-tree scoped, reactive through React, and supports nested overrides; a mutable singleton is outside React's subscription semantics and can cause stale UI/concurrency issues.

## Example

```jsx
const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = useState('light');
  return <ThemeContext value={theme}>
    <Toolbar onToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
  </ThemeContext>;
}

function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div data-theme={theme}>...</div>;
}
```

The provider wraps the consumer. A toggle creates a new primitive value; the consumer updates. React 19 allows rendering the context object as provider; older patterns use `<ThemeContext.Provider value={...}>` (the manifest tracks current value syntax).

## Common mistakes

Assuming default applies when a provider passes undefined; reading context from a provider in the same component; using a duplicated context object; expecting `memo` to block context updates; mutating value in place; and placing every app state field into one context.

## Knowledge checks with answers

1. **What does context store?** The context object defines a channel; providers supply the current value.
2. **Which provider is read?** The nearest matching provider above the consumer.
3. **How are values compared?** `Object.is`.
4. **Can memo prevent context-driven render?** No.

## How this group fits the mental model

Context supplies values through a subtree and subscribes consumers to provider value changes.

## Supplied names explained

The exact index below covers context creation/defaults, provider syntax, consumer hook, nearest-provider lookup, subscription, equality, and memo interaction.

## Cross-item comparison

Props expose direct data flow; context provides a subtree-scoped channel; a mutable singleton is outside React's reactive tree.

## Examples

The Theme example shows a state-backed provider and a subscribing toolbar.

## Exact terms covered

### Exact terms covered

- `createContext(defaultValue)`
- `Context object`
- `Context default value`
- `Context provider value`
- `<SomeContext value={value}>`
- `useContext(SomeContext)`
- `Nearest provider lookup`
- `Context value subscription`
- `Context value Object.is comparison`
- `Updating a context value`
- `Context consumer re-render`
- `Context value and memoized consumers`
