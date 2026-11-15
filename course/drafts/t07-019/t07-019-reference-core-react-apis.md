# React API reference React hooks components context and resources — Reference: Core React APIs

## Scope and version

This lesson covers each supplied API: `createContext`, `lazy`, `memo`, `startTransition`, `addTransitionType`, `act`, `cache`, `cacheSignal`, `captureOwnerStack`, and `browser`. Package boundaries matter: the first nine are `react` exports in the current reference; `browser` is exported from `react-dom`. These are modern API entries, not the separate legacy API catalog. [React APIs](https://react.dev/reference/react/apis) [React DOM APIs](https://react.dev/reference/react-dom)

## How this group fits the mental model

These functions define shared data, loading, rendering priority, tests, request-scoped caching, cancellation, diagnostics, or server-to-browser fallback. Their names do not imply identical runtime contexts. In particular, `cache`/`cacheSignal` have current RSC-oriented semantics, `act` is for tests, and `browser` is a React DOM server-rendering resource.

## Supplied names explained

- `createContext` creates a Context object with a static default value and should be called outside components. In React 19, render the Context object itself as a provider (`<ThemeContext value={theme}>`); `.Provider` remains the pre-19 compatible form, and `.Consumer` is the older render-prop reader. Pair a provider above consumers with `useContext` (or supported `use(Context)`) to read it. The provider's value is compared with `Object.is`; default is used only when no provider matches. [createContext](https://react.dev/reference/react/createContext)
- `lazy` declares a component whose code is loaded from a Promise-returning loader, normally `import()`. React calls the loader on first render and caches the Promise/result. Wrap lazy content in `<Suspense>`; rejected loading errors go to an Error Boundary. The resolved module must provide a `default` component export. [lazy](https://react.dev/reference/react/lazy)
- `memo` wraps a component and can skip rendering when props compare equal; by default each prop is compared with `Object.is`. A custom comparator can be supplied but must compare every prop, including callbacks, or stale closures can result. Context changes and a component's own state still cause rendering. React Compiler, when enabled, automatically applies equivalent memoization and reduces the need for manual wrappers. In all cases it is an optimization, not a guarantee. [memo](https://react.dev/reference/react/memo)
- `startTransition` invokes a callback and marks state updates scheduled synchronously inside it as non-urgent. It returns no pending flag. It can be used outside components. It does not debounce or make arbitrary computations asynchronous. State updates after an `await` may require another wrapper. [startTransition](https://react.dev/reference/react/startTransition)
- `addTransitionType` attaches one or more cause strings to the currently starting Transition, primarily for selecting ViewTransition behavior. It should be called synchronously inside the `startTransition` callback; types reset after commit. It does not make state urgent/non-urgent itself. [addTransitionType](https://react.dev/reference/react/addTransitionType)
- `act` wraps a unit of UI work in tests and flushes related React updates before assertions. Await the async form for work that can cross async boundaries. It is intended for test environments; production interaction code should not use it as a scheduling API. [act](https://react.dev/reference/react/act)
- `cache` memoizes a function's result for a React Server Component cache scope/request. Define the cached function outside components; each `cache(fn)` call creates a distinct wrapper/cache, and React invalidates memoized functions for every server request. It caches errors as well as successful values. It is not a general persistent cache or client-side query cache; it is only for Server Components. [cache](https://react.dev/reference/react/cache)
- `cacheSignal` returns an `AbortSignal` during Server Component rendering for the lifetime of the current `cache()` scope, and `null` outside rendering; current docs say it returns `null` in Client Components, with that behavior potentially changing later. Pass the signal to work started during render. It cannot cancel work started before the render. [cacheSignal](https://react.dev/reference/react/cacheSignal)
- `captureOwnerStack` returns the current Owner Stack as a string in development when available and returns `null` in production. An Owner Stack describes who created/rendered an element and differs from a component stack. Use for diagnostics, not production logic. [captureOwnerStack](https://react.dev/reference/react/captureOwnerStack)
- `browser` is a `react-dom` API returning an opaque marker for `use(browser(reason?))`. In server rendering it causes the nearest Suspense fallback to remain for browser-only content; in the browser reading the marker returns `undefined`. It must be used from a Client Component under Suspense during server rendering, and the marker must be passed to `use`, not thrown. [browser](https://react.dev/reference/react-dom/browser)

## Cross-item comparison

`startTransition` marks priority; `addTransitionType` attaches a cause used to choose animation behavior. `memo` can skip a component render based on props; it does not cache data across server requests. `cache` scopes work to the RSC cache/request model, not persistent storage. `act` flushes work for assertions in tests. `browser` is the only item in this group exported from `react-dom`. [React APIs](https://react.dev/reference/react/apis) [React DOM APIs](https://react.dev/reference/react-dom) [browser](https://react.dev/reference/react-dom/browser)

## Examples

### Suspense for lazy code

```jsx
const SettingsPanel = lazy(() => import('./SettingsPanel.js'));

function SettingsRoute() {
  return <Suspense fallback={<p>Loading settings…</p>}>
    <SettingsPanel />
  </Suspense>;
}
```

The module must default-export the component. Put an Error Boundary around the lazy region if a failed chunk needs recoverable error UI. A bundler/framework is responsible for producing a loadable chunk.

### Testing an interaction

```jsx
await act(async () => {
  root.render(<Counter />);
  button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});
expect(screen.getByText('1')).toBeVisible();
```

This is a shape example, not a complete test: a real test must create the root, obtain the button after rendering, and clean up the root. Testing-library helpers often wrap interactions in `act` already, so avoid redundant wrappers when the tool does so.

## Common mistakes

- Assuming `memo` prevents context or state updates.
- Writing an incorrect custom comparator that ignores function props.
- Expecting `startTransition` to return `isPending`; use `useTransition` when the component needs that signal.
- Calling `addTransitionType` outside the transition callback and expecting it to persist.
- Using `cache` as a durable or cross-request cache.
- Expecting `cacheSignal` to cancel work launched before rendering.
- Reading development-only owner stack in production control flow.
- Importing `browser` from `react` rather than `react-dom`.

## Knowledge checks with answers

1. **What handles a pending lazy component?** A Suspense boundary.
2. **Does `memo` suppress a context update?** No.
3. **Which API marks an update non-urgent?** `startTransition`.
4. **Which API is designed to flush React work in tests?** `act`.
5. **Does React `cache` guarantee persistent storage across requests?** No; it is scoped to React's server cache behavior.

