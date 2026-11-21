# React performance transitions deferred values profiling and compiler — Reference: Diagnosing and choosing performance techniques

Sources: React 19.3 [React Developer Tools](https://react.dev/learn/react-developer-tools), [`Profiler`](https://react.dev/reference/react/Profiler), [`useTransition`](https://react.dev/reference/react/useTransition), [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue), and [React Compiler](https://react.dev/learn/react-compiler/introduction).

## Scope and version

Select a technique from evidence about the bottleneck, not from the fact that a component rendered. Performance is multidimensional: interaction response, throughput, startup, memory, battery, and network cost can trade off. Define the user journey and target before changing code.

## How this group fits the mental model

Diagnosis spans React computation, browser work, and network waits. Choose a fix at the layer shown by evidence, then repeat the same user journey to check both benefit and correctness.

## Supplied names explained

### User-perceived latency

Time between an action and useful feedback. It includes scheduling, application work, browser rendering, and sometimes network response. A small React render may still feel slow if it waits on a request; a longer background render may be acceptable if input stays responsive and stale state is clearly communicated.

### Render cost

CPU work React performs to calculate component output. It may be repeated, interrupted, or discarded. Identify expensive components or calculations with React tooling and sampling; avoid assuming each render produces DOM changes.

### Commit cost

Work to apply a completed React tree update to the host environment. Browser layout and paint may follow and are not fully represented by React render duration. Inspect browser traces when commits are followed by slow frames.

### Expensive calculation

An algorithm, data transform, or rendering computation whose measured duration contributes to the symptom. Improve algorithmic complexity, reduce unnecessary input data, precompute/index appropriately, or move CPU-heavy work off the main thread when justified. `useMemo` only avoids repeats for unchanged dependencies.

### Unnecessary re-render

A component render that does not lead to meaningful changed output or useful work. It is not automatically expensive. Determine whether it materially affects the interaction, then consider data ownership, component boundaries, stable props, memoization, or Compiler support.

### Stable props and identity

Primitive values compare predictably; object and function references compare by identity. Stable identities can allow memoized consumers to skip work, but creating caches solely to stabilize every prop can increase complexity. Prefer clear ownership and measured boundaries.

### Urgent input responsiveness

Direct manipulation should receive immediate feedback. Keep controlled input state urgent; schedule large dependent result updates with a transition or deferred value where stale output is acceptable. For blocking synchronous JavaScript, split work, optimize, or use a worker because React cannot interrupt a single JavaScript task mid-function.

### Measure optimize re-measure workflow

1. Define a reproducible user-visible symptom and baseline.
2. Record React commits and browser main-thread/rendering activity.
3. Identify the largest causal cost, not merely a correlated render.
4. Make one targeted change that preserves behavior.
5. Repeat the same interaction under comparable conditions.
6. Keep the change only if benefit is meaningful and complexity is justified.

### Avoid optimizing render frequency without evidence

React is designed to render declaratively; many small renders are inexpensive. Render count alone omits component cost, commit cost, browser work, and network waits. Prioritize observed long tasks, expensive subtrees, dropped frames, or delayed feedback.

## Cross-item comparison

| Evidence | Likely next investigation |
|---|---|
| Slow function in React profile | Algorithm, data size, caching after measurement |
| Many child renders with costly work | State boundary, prop identity, `memo` or Compiler |
| Input responsive but results late | Transition/deferred presentation or request strategy |
| Browser long task outside React | JavaScript sampling, task splitting, worker |
| Slow style/layout/paint | DOM/CSS/layout/paint trace |
| Waiting on network | Request waterfall, caching, server latency |

## Examples

For a slow filter, compare the filter’s cost with row rendering and browser layout. If filtering dominates and input is blocked by one long task, a deferred value alone cannot preempt that task; improve the algorithm, reduce work, or move computation to a worker. If the input itself remains responsive but rendering results blocks it, schedule results in the background and expose stale state. Re-record and verify both responsiveness and final correctness.

## Common mistakes

- Optimizing an easy-to-see render instead of the largest measured delay.
- Treating microbenchmarks as proof of user benefit.
- Hiding stale content without communicating that it is stale.
- Making memoization ubiquitous and creating fragile dependency webs.
- Ignoring the cost of browser work after React commits.
- Failing to verify correctness after scheduling updates differently.

## Knowledge checks with answers

1. **What is the first step?** Define and measure a reproducible user-visible problem.
2. **Can React interrupt a synchronous function mid-call?** No.
3. **When is memoization worthwhile?** When measurements show repeated work and stable dependencies permit reuse.
4. **What confirms a fix?** The same interaction improves without correctness regressions under comparable conditions.

### Exact terms covered

- `User-perceived latency`
- `Render cost`
- `Commit cost`
- `Expensive calculation`
- `Unnecessary re-render`
- `Stable props and identity`
- `Urgent input responsiveness`
- `Measure optimize re-measure workflow`
- `Avoid optimizing render frequency without evidence`
