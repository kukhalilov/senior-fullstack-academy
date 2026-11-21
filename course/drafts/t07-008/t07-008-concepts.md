# React performance transitions deferred values profiling and compiler — Core concepts and how they fit together

Sources: React 19.3 [`memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo), [`useCallback`](https://react.dev/reference/react/useCallback), [`useTransition`](https://react.dev/reference/react/useTransition), [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue), [`Profiler`](https://react.dev/reference/react/Profiler), [React Compiler](https://react.dev/learn/react-compiler/introduction), and [React Developer Tools](https://react.dev/learn/react-developer-tools).

## Learning objectives

Trace latency to React or browser work; distinguish render attempts from commits; select manual memoization, transition scheduling, or deferred rendering based on evidence; interpret Profiler timings; explain Compiler benefits and limits; and verify that an optimization improves the same user interaction.

## Prerequisites

Know render purity, props and state snapshots, component identity, Hooks, and Effects. Performance work builds on correct component behavior; it cannot repair incorrect state ownership or synchronization.

## Core concepts
Place React profiling inside the browser’s larger experience path. A React commit is not LCP, and neither is INP: network resource discovery, CSS/layout, JavaScript execution, hydration, and event processing all matter. Use browser traces for the complete path and React Profiler for component work, then confirm improvements with representative devices and real-user data when available. The integrated performance engineering topic joins these measurements to API and database traces.


React may render a component to compute a candidate UI, and it may restart or discard that work. A commit applies changes to the host environment. Rendering a component does not imply that the browser visibly changed the DOM. Browser latency may instead come from JavaScript outside React, layout, paint, network, or long tasks.

Start from a concrete symptom: delayed keystrokes, slow navigation, dropped frames, or expensive initial loading. Reproduce it, measure it, identify the responsible work, change one cause, and measure again. A component appearing often in a profiler is evidence to investigate, not proof that it needs memoization. Reducing render counts can even make code slower if custom comparisons cost more than rendering.

`memo(Component, arePropsEqual?)` can skip rendering when new props compare equal to previous props. By default React compares each prop with `Object.is`; freshly created objects, arrays, or functions therefore count as changed. A custom comparator must compare every prop, including functions whose closures can capture prior state. Returning `true` when behavior differs creates stale output. A memoized component still renders when its own state or consumed context changes. Memoization is an optimization, not a semantic guarantee; React may discard cached work.

`useMemo(calculateValue, dependencies)` caches a calculation result. `useCallback(fn, dependencies)` caches a function identity; conceptually it is `useMemo(() => fn, dependencies)`. Dependencies are constant in length and order and compared using `Object.is`. Include every reactive value used by the calculation or function. Prefer fixing unstable object creation at its source when practical. Do not use a cache as the authoritative storage for application data.

`useTransition()` returns `[isPending, startTransition]`. Calling `startTransition(action)` marks state updates scheduled during that action as non-urgent transition work. Urgent interaction feedback can proceed while React prepares the transition render; work may be interrupted and restarted. Updates after an asynchronous boundary may need another `startTransition` call according to current API semantics. Transition updates cannot control text inputs. `isPending` reports pending transition work for that Hook.

`useDeferredValue(value, initialValue?)` returns a deferred version that can lag behind the current value while React prepares a background render. It does not itself debounce, throttle, or prevent a network request; it changes rendering priority. A subtree can compare current and deferred values to indicate stale content. Unlike a transition, it can be used when the update source is outside the component or should not be wrapped at the source. The two APIs solve related but distinct scheduling problems.

`<Profiler id onRender>` calls `onRender` when a wrapped subtree commits. The callback receives `id`, `phase`, `actualDuration`, `baseDuration`, `startTime`, and `commitTime`. The documented `phase` values are `mount`, `update`, and `nested-update`. `actualDuration` is the milliseconds spent rendering the profiled subtree for that committed update; `baseDuration` estimates the subtree cost without optimizations from recent renders. These fields measure React rendering, not total user-perceived latency. React DevTools Profiler offers an interactive view; the browser Performance panel reveals scripting, layout, paint, and other work. Production profiling requires an appropriate profiling-enabled build.

React Compiler analyzes eligible code at build time and can insert memoization for component results, values, and functions. Its optimization depends on components and Hooks following the Rules of React, especially render purity and correct Hook usage. Compiler diagnostics can identify code that cannot be optimized; adoption can be incremental. Compiler output is not a substitute for profiling or algorithmic improvements. It does not eliminate network, DOM layout, paint, or other non-React bottlenecks.

## Mechanisms and relationships

```text
urgent input → immediate state → input feedback
                         ↘ transition/deferred value → interruptible result rendering
Profiler → committed React render cost
browser Performance panel → JavaScript + style/layout + paint + network timeline
memo/useMemo/useCallback → reuse when measured stable inputs justify it
React Compiler → build-time automatic memoization for eligible code
```

## Worked examples

```jsx
function SearchPage({ items }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(
    () => filterItems(items, deferredQuery),
    [items, deferredQuery]
  );
  const isStale = query !== deferredQuery;
  return <><input value={query} onChange={e => setQuery(e.target.value)} />
    {isStale && <span>Updating results…</span>}
    <Results items={results} /></>;
}
```

The input uses the urgent query, while results may render using an older deferred query. This example is useful only if profiling shows the result subtree causes noticeable input delay; `useMemo` alone does not make filtering cheap when dependencies change on every keystroke.

## Misconceptions and edge cases

- A render is not necessarily a DOM mutation or commit.
- More renders do not automatically mean a performance defect.
- Memoization can preserve stale behavior if dependencies or custom comparisons are wrong.
- `useDeferredValue` does not debounce a request or make synchronous CPU work disappear.
- Transitions are interruptible scheduling hints; they do not guarantee a fixed completion time.
- `isPending` is not a generic loading state for arbitrary network work.
- React Profiler timings exclude much of browser work and should be interpreted with browser tooling.
- Compiler optimization cannot make impure rendering safe or optimize every external bottleneck.

## Knowledge checks with answers

1. **What should trigger optimization?** A reproducible user-visible issue with measured evidence.
2. **What does `actualDuration` describe?** The milliseconds React spent rendering the profiled subtree for the committed update.
3. **What does deferring a value not do?** Debounce network requests or eliminate computation.
4. **Can a memoized component still render?** Yes, due to its own state, consumed context, changed props, or other React work.
5. **What does Compiler adoption change?** Eligible code may receive build-time memoization; profiling and correctness remain necessary.
