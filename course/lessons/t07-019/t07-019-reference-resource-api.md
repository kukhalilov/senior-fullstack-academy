# React API reference React hooks components context and resources — Reference: Resource reading API

## Scope and version

This reference covers the single supplied resource API, `use`, which reads a supported resource during rendering. It is an API, not an ordinary Hook despite its name. Its resource types and behavior are version- and environment-sensitive, so check the current reference and framework integration. [`use`](https://react.dev/reference/react/use) [React versions](https://react.dev/versions)

## How this group fits the mental model

Ordinary Hooks associate stateful behavior with a component's stable call order. `use` instead reads a resource as part of rendering and can suspend that render. This lets React coordinate pending data and UI boundaries instead of requiring the component to manually maintain every loading flag. The current documented resources are a Promise, a Context, and the opaque value returned by React DOM's `browser()` API.

## Supplied names explained

- `use` accepts a Context object or Promise, and in the browser-only rendering case, the value returned by `browser()`. For Context it returns the nearest provider value (or `createContext` default). For a fulfilled Promise it returns the value. For a pending Promise, it suspends the component; for a rejected Promise, the error propagates to an Error Boundary. Unlike Hooks, it may be used in a loop or condition, but it must be called inside a component or Hook. The current docs prohibit using `use(Context)` in Server Components; Server Components have their own context constraints. [`use`](https://react.dev/reference/react/use) [browser](https://react.dev/reference/react-dom/browser)

Promise state has important ownership constraints. Pass a stable Promise created by a data/framework layer; creating a new Promise during each Client Component render can repeatedly suspend and produce an “uncached promise” warning. If the Promise is pending, place a suitable `<Suspense>` boundary above it. If it rejects, a nearest Error Boundary handles the failure; a Suspense fallback is not an error UI. A Promise's resolved value must be usable by the environment and framework. Do not assume `use` itself fetches, caches, deduplicates, retries, or authorizes the request. [use](https://react.dev/reference/react/use)

The `browser(reason?)` resource is exported from `react-dom` and passed to `use`; it is not imported from `react`. Its optional reason is a string or a function whose returned string is supplied as the cause for the server renderer’s `onBrowserBailout` callback. In server rendering it causes the nearest Suspense boundary to remain on fallback for browser-only content, then `use(browser())` returns `undefined` in the browser. It must run in a Client Component and under Suspense during server rendering; calling `browser()` alone has no effect. [browser](https://react.dev/reference/react-dom/browser)

## Cross-item comparison

Only one item is in this assigned group, so no within-group comparison applies. Two useful boundaries are `use` versus `useContext` and `use(Promise)` versus hand-maintained loading state: `useContext` obeys normal Hook placement, while `use(Context)` can be conditional; a Promise read lets Suspense/Error Boundary coordinate pending and failure states, but does not provide data fetching or cache policy. [use](https://react.dev/reference/react/use) [Built-in Hooks](https://react.dev/reference/react/hooks)

## Examples

### Promise under Suspense and an Error Boundary

```jsx
function Message({ messagePromise }) {
  const message = use(messagePromise);
  return <p>{message.text}</p>;
}

function Page({ messagePromise }) {
  return <ErrorBoundary fallback={<p>Could not load the message.</p>}>
    <Suspense fallback={<p>Loading…</p>}>
      <Message messagePromise={messagePromise} />
    </Suspense>
  </ErrorBoundary>;
}
```

The Promise is supplied by a stable owner outside this component. Pending work shows the Suspense fallback; rejection is shown by the Error Boundary. `ErrorBoundary` here is an application-defined boundary, not an API in this inventory.

### Conditional context read

```jsx
function OptionalLabel({ showTheme }) {
  if (!showTheme) return <span>Default</span>;
  const theme = use(ThemeContext);
  return <span data-theme={theme}>Themed</span>;
}
```

The conditional is allowed for `use`; this does not permit calling `useState` conditionally in the same component.

## Common mistakes

- Treating `use` as an ordinary Hook and incorrectly claiming it must obey the standard Hook ordering rule.
- Treating `use` as a general promise utility callable from an event handler or module scope.
- Creating an uncached Promise during each client render.
- Expecting Suspense to handle Promise rejection; errors need an Error Boundary.
- Assuming `use` fetches data or defines cache, retry, or invalidation policy.
- Importing `browser` from `react`; it is currently exported from `react-dom`.
- Calling `use(browser())` from a Server Component or outside a server Suspense boundary.

## Knowledge checks with answers

1. **May `use` be conditional?** Yes; unlike ordinary Hooks it can appear in conditions and loops.
2. **What displays while a read Promise is pending?** The nearest Suspense fallback.
3. **Who handles a rejected read Promise?** The nearest Error Boundary.
4. **Does `use` create a cache?** No; Promise identity/cache ownership belongs to the framework or data layer.
5. **Which package exports `browser`?** `react-dom`; the returned marker is read with React's `use`.

