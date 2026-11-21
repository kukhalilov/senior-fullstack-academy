# React routing frameworks data loading server components and deployment — Reference: React Router 8.5.2 Framework and Data mode APIs

## Scope and version

This reference reflects React Router 8.5.2 docs checked 2026-11-20. Router factories/components/hooks are Data/Declarative APIs; route-module exports and `routes.ts` conventions belong to Framework Mode. Do not mix their setup contracts. [React Router modes](https://reactrouter.com/start/modes) [Changelog](https://reactrouter.com/changelog)

## How this group fits the mental model

React Router matches routes and provides UI primitives. Data Mode adds route-object loaders/actions and navigation lifecycle. Framework Mode adds route modules, file/build conventions, rendering and deploy integration. Declarative Mode supplies matching/navigation without the data lifecycle.

## Supplied names explained

- `createBrowserRouter(routes, options?)` creates a browser-history data router from route objects; use with `<RouterProvider router>`.
- `createHashRouter(routes, options?)` creates a data router storing location in the URL hash, useful when the server cannot provide SPA path fallback. Hash routing has URL/SEO tradeoffs.
- `createMemoryRouter(routes, options?)` creates an in-memory data router, useful for tests, non-browser environments, or controlled navigation state.
- `<RouterProvider router>` renders the UI for a data router and subscribes React to its state. It belongs to Data Mode and router-based Framework Mode internals, not basic Declarative `<Routes>` setup.
- `<Link to>` renders an accessible anchor and performs client-side navigation when intercepted by the router; ordinary link fallback remains important.
- `<NavLink to>` is a `Link` variant that exposes active/pending state for styling and accessibility.
- `<Outlet>` renders the matched child route inside a parent layout route.
- `<Form method>` submits route data through the router's action lifecycle while preserving progressive enhancement in Framework Mode. In Data Mode, the router intercepts the native form and invokes the matching action.
- `useNavigate()` returns an imperative navigation function. Prefer links/forms for user navigation; use it after events or programmatic flows.
- `useLocation()` reads the current location object including pathname, search, hash, state, and key.
- `useParams()` reads dynamic path parameters from the matched route hierarchy; returned values may be absent and need validation.
- `useSearchParams()` reads/updates URL query parameters. Treat them as strings and validate/parse application-specific types.
- `useLoaderData()` reads data returned by the current route's loader (or route module loader in Framework Mode).
- `useActionData()` reads the latest non-redirect action result for the route that handled submission.
- `useNavigation()` exposes global navigation/submission state for pending UI such as form submission and destination transitions.
- `useFetcher()` performs loader/action work without a navigation, with its own state/data; useful for inline mutations and background loads.
- `useRouteError()` reads the error handled by the nearest route error boundary.
- `useRevalidator()` exposes manual revalidation state and a revalidate method; use route actions and normal lifecycle first.
- `loader export` in Framework Mode is a server route-module data function; in Data Mode a `loader` property is attached to a route object. It runs according to navigation/server rendering strategy.
- `action export` in Framework Mode handles route mutations; in Data Mode the action is a route-object property. Validate authentication/authorization and untrusted form data.
- `clientLoader export` is a Framework Mode route-module loader that runs in the browser. It can supplement or replace server-loaded data according to its configuration; it is not a Data Mode route-object API with the same export syntax.
- `clientAction export` is a Framework Mode browser-side action export; choose it only when client-side mutation handling is intended, and understand server action/revalidation differences.
- `middleware export` defines Framework Mode route middleware in current React Router. Middleware runs in the request/action/loader chain for matched routes; exact behavior depends on configured server adapter and mode. This is not a generic browser middleware API.
- `headers export` in a Framework route module contributes response headers for that route; header merging/loader/action responses follow the framework contract.
- `shouldRevalidate export` can control whether a Framework Mode route loader re-runs after navigation/submission. Preserve default revalidation unless there is a proven reason; incorrect overrides can show stale data.
- `meta export` in Framework Mode supplies route metadata to the document; combine parent/child metadata deliberately.
- `links export` in Framework Mode declares link descriptors such as stylesheets/preloads for document output.
- `route config in routes.ts` declares the Framework Mode route graph, often with route/layout/index helpers and file references. It is not a universal requirement for Data or Declarative modes.
- `Route-module .server and .client boundaries` are Framework Mode file conventions for server-only/client-only modules. The build can exclude the opposite-runtime module; importing across a boundary incorrectly can fail or expose code.
- `React Router view-transition APIs deprecated in v8` refers to the router's `viewTransition` options/props and `useViewTransitionState()` integration. React Router 8.5 deprecated these in favor of React 19.3's `<ViewTransition>` component; the existing router APIs remain available during v8 but are planned for removal in v9. Do not set `useTransitions={false}` when adopting React's component, because it requires React transitions to be enabled. [React Router 8.5 changelog](https://reactrouter.com/changelog)
- `React <ViewTransition> replacement in React 19.3` is React's component for applying view-transition classes to route content; a persistent router layout can wrap its `<Outlet>`. This is a React API and is separate from React Router's deprecated view-transition props/hooks. [React Router 8.5 changelog](https://reactrouter.com/changelog) [React ViewTransition](https://react.dev/reference/react/ViewTransition)

## Cross-item comparison

`createBrowserRouter`/`createHashRouter`/`createMemoryRouter` are Data Router factories; `<Routes>` is the Declarative path. `loader`/`action` route-object properties belong to Data Mode, while `loader export`, `action export`, and other exports use Framework route modules. `useFetcher()` performs work without navigation; `<Form method>` generally participates in navigation/action submission.

## Examples

```tsx
const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <Home /> },
    { path: 'projects/:id', loader: projectLoader, element: <Project /> },
  ] },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />,
);
```

This is Data Mode. A Framework Mode app normally declares `routes.ts` and route-module exports instead of manually constructing its browser router.

## Common mistakes

- Mixing route object properties with Framework route-module exports without recognizing the mode.
- Assuming `<Form>` always means native navigation or always means SPA navigation; router context and JavaScript availability matter.
- Using `shouldRevalidate` to suppress needed data refreshes.
- Treating `clientLoader`/`clientAction` as server-only functions.
- Using `useNavigate()` where an anchor link is more accessible and progressive.
- Assuming a fetcher submission changes the current URL.
- Treating all route loader work as safe to cache persistently.

## Knowledge checks with answers

1. Which APIs create Data Routers? `createBrowserRouter`, `createHashRouter`, and `createMemoryRouter`.
2. Where is `loader export` defined? A Framework Mode route module.
3. What is the main distinction of `useFetcher()`? It performs route data work without navigation.
4. What can `shouldRevalidate` accidentally break? Freshness after mutations/navigation.
5. Where is the route graph declared in Framework Mode? In `routes.ts`.

## Sources

- [React Router modes](https://reactrouter.com/start/modes)
- [Route object](https://reactrouter.com/start/data/route-object)
- [Framework route module](https://reactrouter.com/start/framework/route-module)
- [Framework routing](https://reactrouter.com/start/framework/routing)
- [Framework data loading](https://reactrouter.com/start/framework/data-loading)
- [Framework actions](https://reactrouter.com/start/framework/actions)
- [Framework pending UI](https://reactrouter.com/start/framework/pending-ui)
- [React Router changelog](https://reactrouter.com/changelog)
