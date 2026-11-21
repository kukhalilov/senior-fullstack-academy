# React performance transitions deferred values profiling and compiler — Reference: React rendering performance measurement

Sources: React 19.3 [`Profiler`](https://react.dev/reference/react/Profiler), [React Developer Tools](https://react.dev/learn/react-developer-tools).

## Scope and version

Measurement connects a real interaction to the work responsible for its delay. React timing is one layer: user-perceived latency may also include JavaScript, network, browser style calculation, layout, paint, image decoding, or device constraints. Use React and browser tooling together.

## How this group fits the mental model

React profiling isolates component rendering and commit evidence; browser profiling covers the broader path from script execution through rendering. User-facing measurements connect both to an actual outcome.

## Supplied names explained

### `<Profiler id onRender>`

Wrap a subtree in `<Profiler id="Results" onRender={callback}>`. React calls the callback when the profiled tree commits. Multiple nested profilers can isolate boundaries. Profiling adds overhead, so compare equivalent interactions and understand the build mode used.

### `onRender(id, phase, actualDuration, baseDuration, startTime, commitTime)`

Callback receives the profiler identifier, commit phase, render durations, and timestamps. It runs for commits in the profiled tree, not every abandoned render attempt. Keep callbacks cheap; instrumentation itself can affect measurements.

### Profiler mount phase

`phase === "mount"` means this profiled tree committed for its initial mount. It does not describe all application startup cost; imports, data transfer, parsing, and work outside the boundary may be omitted.

### Profiler update phase

`phase === "update"` indicates a subsequent commit. Use it with interaction reproduction and component details to understand repeated update work; one update can include many component renders.

### Profiler nested-update phase

The callback’s documented `phase` values are `mount`, `update`, and `nested-update`. The first identifies an initial mount, the second a subsequent update, and the third is React’s nested-update phase label. Do not reinterpret this label as a recommendation to update state during render; components should remain pure.

### `actualDuration`

Milliseconds React spent rendering the profiled subtree for the current committed update. Memoization may reduce this relative to the subtree’s baseline. It is not a measure of browser paint or total end-to-end response time.

### `baseDuration`

Estimated time to render the entire profiled subtree without relying on memoization from recent updates. React derives it from the latest render times of components. It is an estimate, not a guaranteed counterfactual benchmark.

### React DevTools Profiler

The Profiler panel records commits and visualizes component render durations and update causes. Record the user action, inspect expensive descendants, and compare before/after recordings. Development instrumentation and Strict Mode can produce additional work; do not treat development numbers as production timings.

### Browser Performance panel

The browser timeline shows main-thread tasks, JavaScript, style/layout, paint, network, and frame behavior. Use it when React’s profile does not explain a delay or when long synchronous work blocks input. React DevTools and browser tools answer related but different questions.

### Production profiling-enabled build

Ordinary production builds minimize overhead and may disable detailed profiling instrumentation. React supports a profiling-enabled production build for collecting React timings closer to production conditions. Confirm the framework/bundler setup and compare with ordinary builds; profiling still adds some cost.

### Measure before optimizing

Capture the same route, data shape, device class, and interaction before and after. Record user-observable response time and relevant React/browser evidence. Change one major cause at a time, repeat enough times to understand variance, and retain the simpler implementation if improvement is not meaningful.

## Cross-item comparison

| Tool/field | Answers | Does not establish by itself |
|---|---|---|
| React Profiler | Which committed React subtree work took time? | Total browser or network latency |
| `actualDuration` | How many milliseconds React spent rendering this subtree in the commit? | Time to pixels or interaction responsiveness |
| Browser Performance panel | What occupied browser threads and rendering pipeline? | Which React state design is conceptually correct |
| User interaction measurement | Did the perceived response improve? | Which code change caused it without deeper evidence |

## Examples

```jsx
function onRender(id, phase, actualDuration, baseDuration, startTime, commitTime) {
  report({ id, phase, actualDuration, baseDuration, startTime, commitTime });
}

<Profiler id="SearchResults" onRender={onRender}>
  <SearchResults query={query} />
</Profiler>
```

In production, send only bounded, privacy-safe performance data. Avoid recording search text or other sensitive values. Profiling does not require collecting user input content.

## Common mistakes

- Calling every Profiler callback a render even when no commit occurs.
- Treating `baseDuration` as a precise measured no-memoization run.
- Equating React render time with full interaction latency.
- Comparing a development recording with a production recording as if equivalent.
- Adding instrumentation to every subtree and perturbing the workload.
- Shipping sensitive payloads with performance telemetry.

## Knowledge checks with answers

1. **When is `onRender` called?** When the profiled subtree commits.
2. **What is `actualDuration`?** Milliseconds React spent rendering the subtree for the current committed update.
3. **Which tool finds layout and paint costs?** Browser Performance tooling, alongside React DevTools.
4. **Why benchmark the same interaction?** To make before/after evidence comparable.

### Exact terms covered

- `<Profiler id onRender>`
- `onRender(id, phase, actualDuration, baseDuration, startTime, commitTime)`
- `Profiler mount phase`
- `Profiler update phase`
- `Profiler nested-update phase`
- `actualDuration`
- `baseDuration`
- `React DevTools Profiler`
- `Browser Performance panel`
- `Production profiling-enabled build`
- `Measure before optimizing`

