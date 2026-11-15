# React API reference React hooks components context and resources — Big-picture orientation and mental model

## Problem and purpose

React's public API is the vocabulary components use to describe UI, remember values, coordinate updates, read shared context or asynchronous resources, and connect to browser or framework facilities. The API names make more sense when grouped by the problem they solve: state describes changing UI data; context carries values through a tree; refs retain non-rendering handles; Effects synchronize with external systems; scheduling APIs distinguish urgent from interruptible work; and built-in components express rendering boundaries. The official reference separates the `react` package from React DOM, server rendering, the Compiler, and legacy APIs. This lesson covers the modern `react` APIs in the manifest; it does not treat every exported symbol in the ecosystem as interchangeable. [React reference overview](https://react.dev/reference/react) [React APIs](https://react.dev/reference/react/apis)

## Plain-language mental model

Imagine a product page with a quantity stepper, a theme, an animated tab panel, and a deferred review list. A component is a function React calls to describe UI. A Hook is a call that lets that component participate in a React capability. State is the component's remembered input to rendering; a ref is a mutable notebook React does not use to render; an Effect is a synchronization process with setup and cleanup; and a Transition labels an update as non-urgent. A built-in component adds a boundary or behavior to a subtree without requiring the application to recreate React's coordination.

Do not memorize names as a flat list. Ask: **Does this value affect rendered output?** If yes, state or context is usually the model. **Is this an external system?** Use an Effect only to synchronize with it. **Is it an imperative handle or measurement?** A ref is often appropriate. **Can the update wait?** Consider a Transition. **Is the value a Promise or context being read during render?** `use` has special suspension and conditional-call semantics. [Built-in Hooks](https://react.dev/reference/react/hooks) [`use`](https://react.dev/reference/react/use)

## How the parts fit together

1. A render reads props, state, context, and resources and returns a description of UI.
2. React may call rendering code again, so render logic must be pure. State setters request a future render; mutating a ref does not.
3. React reconciles the new description. Built-in components such as `<Suspense>` and `<Activity>` define how a subtree behaves around loading or visibility.
4. After committing DOM changes, Effects synchronize with outside systems. A layout Effect runs before paint; an insertion Effect exists primarily for CSS-in-JS libraries.
5. Scheduling APIs can allow urgent feedback to appear while non-urgent rendering is pending. They do not make network requests or state changes transactional by themselves.

### Concept map

```text
component render
├── props + state ── useState / useReducer / useActionState / useOptimistic
├── shared tree value ── createContext + useContext (or use where supported)
├── render-time resource ── use(Promise | Context | browser marker)
├── non-rendering handle ── useRef / Fragment ref
├── external synchronization ── useEffect / useLayoutEffect / useInsertionEffect
├── priority ── useTransition / startTransition / addTransitionType
└── subtree behavior ── Suspense / Activity / ViewTransition / StrictMode
```

The tree and the package boundary matter. `createContext`, Hooks, and built-in React components are from `react`; `browser` is exported from `react-dom`, even though React's resource reference lists its result as a value read with `use`. Rendering entry points and browser DOM APIs have separate lessons. [React reference overview](https://react.dev/reference/react) [React DOM APIs](https://react.dev/reference/react-dom) [browser](https://react.dev/reference/react-dom/browser)

## End-to-end walkthrough

For a filterable review list, keep the selected filter in `useState`, because it changes what should render. Put the application theme in a Context when distant descendants need it. Render the list inside `<Suspense>` if its data source suspends, with an Error Boundary around the operation for rejected data. A search input remains urgent; mark expensive list-result rendering as a Transition or defer the derived value, so typing feedback is not blocked. If a third-party chart needs a DOM node, use `useRef` and an Effect with cleanup to create, update, and dispose it. If an inactive tab should preserve its state but stop its Effects, put it in `<Activity mode="hidden">` rather than assuming CSS hiding does that work.

Each choice is about ownership and lifecycle, not fashion. Derive values during render instead of copying them into state and synchronizing them with an Effect. Never use `useMemo` as the semantic storage for state. Do not call setters during render to “fix” a value; make the next state follow the previous state with a functional updater or reducer. [Hooks](https://react.dev/reference/react/hooks) [Activity](https://react.dev/reference/react/Activity)

## When to use it and tradeoffs

Use state for information that must survive renders and affect UI. Use refs for mutable data that should not trigger rendering. Use context to make a value available to descendants, but split rapidly changing or unrelated values when broad subscriptions create avoidable work. Use Effects only when React must coordinate with an external system; an Effect is not a general-purpose “after render” callback. Use memoization when profiling or stable identity requirements justify it, not as a default substitute for clear data flow. Use transitions to improve perceived responsiveness, while preserving loading, error, and accessibility behavior.

Some API entries are specialized: `useInsertionEffect` is for library integrations; `cache` and `cacheSignal` are currently server-rendering concerns; `captureOwnerStack` is development diagnostics; and Fragment refs and `<ViewTransition>` have current-version caveats. The exact list and status live in versioned official reference pages. [React versions](https://react.dev/versions) [React APIs](https://react.dev/reference/react/apis)

## What later lessons cover

The concepts lesson builds the render, commit, and synchronization model. Reference lessons cover every supplied state/action Hook, ref/effect Hook, performance/integration Hook, resource API, built-in component and Fragment method, View Transition prop, core API, and RSC directive. Practice asks you to choose the right primitive and diagnose lifecycle mistakes. The interview lesson tests tradeoffs, not API-name recall alone.

