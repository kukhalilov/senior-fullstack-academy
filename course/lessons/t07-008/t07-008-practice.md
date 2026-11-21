# React performance transitions deferred values profiling and compiler — Exercises and worked solutions

Sources: React 19.3 [`Profiler`](https://react.dev/reference/react/Profiler), [`useTransition`](https://react.dev/reference/react/useTransition), [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue), and [React Compiler](https://react.dev/learn/react-compiler/introduction).

## Goals

Diagnose an interaction before optimizing, distinguish scheduling from computation, select a measurement tool, and justify an optimization with a comparable before/after observation.

## Prerequisites

Understand component rendering, props/state, Hooks, and the profiler concepts in the reference lessons.

## Worked example

In a slow search interface, preserve urgent input feedback, profile filtering and result rendering separately, and inspect browser work. Select a scheduling technique only if React result rendering is the bottleneck. A single long synchronous filter needs algorithmic or execution changes because scheduling cannot interrupt it mid-call.

## Exercises

### Exercise 1: Find the real bottleneck

A search input appears to lag. The page filters 30,000 records, renders 400 rows, and an image panel fetches remote thumbnails. Which measurements should you collect before changing code?

### Worked solution

Reproduce the same query on a representative device. Record input-to-feedback latency and frames. Use React Profiler to find render cost by subtree and browser Performance tools for long JavaScript tasks, layout/paint, image decode, and network. Separate filter cost, row rendering, image work, and request wait. The symptom alone cannot identify which dominates.

### Exercise 2: Keep input urgent

The controlled input is updated inside `startTransition` and React reports that a transition cannot control the text field. Repair the ownership of priority.

### Worked solution

Keep `setQuery(event.target.value)` directly in the input handler. Either mark a separately owned results state update as a transition or derive a `deferredQuery = useDeferredValue(query)` for the expensive result subtree. The input reflects each keystroke immediately; results can catch up and expose a stale indicator.

### Exercise 3: Diagnose an ineffective cache

`const options = { sort, filter }; const rows = useMemo(() => select(data, options), [data, options]);` recalculates on every render. Explain and repair.

### Worked solution

`options` is a new object every render, so `Object.is` sees a changed dependency. Prefer `useMemo(() => select(data, { sort, filter }), [data, sort, filter])` if selection is measured as costly. Or simplify the selector interface. The cache is justified only if inputs remain stable enough to avoid real repeated work.

### Exercise 4: Assess custom comparison

A `memo` comparator compares `title` and `items`, but ignores an `onChoose` function. The child sometimes invokes a callback that refers to the previous selected account. What is wrong?

### Worked solution

The comparator claims props are equivalent while behavior differs. Include the callback in comparison, or avoid a custom comparator and fix the parent’s identity/data flow. Test behavior with a changed callback. A false positive can preserve a stale closure and is a correctness bug, not just missed optimization.

### Exercise 5: Interpret profile fields

A Profiler reports `actualDuration=6` and `baseDuration=24` for a results tree. State what this suggests and what it does not prove.

### Worked solution

The committed render used about 6 ms of measured React render work; the estimated unoptimized subtree baseline is about 24 ms, suggesting prior work may have been skipped. It does not prove 18 ms of user latency was saved or include full network, layout, and paint. Repeat the target interaction and inspect browser traces.

### Exercise 6: One long synchronous calculation

`filterAndRank(allRecords)` takes 180 ms in a single call. Will `useDeferredValue` let the browser handle input during that call?

### Worked solution

No. React can schedule rendering between tasks, but a synchronous JavaScript call blocks the main thread until it returns. Improve the algorithm, index or reduce data, chunk/yield the work, or move suitable CPU work to a Web Worker. Then profile again.

### Exercise 7: Adopt React Compiler safely

The build reports a component skipped by compiler diagnostics. The component mutates a prop array during render. What should the team do?

### Worked solution

Fix the mutation because render must be pure, then inspect diagnostics and generated behavior. A skipped optimization is not by itself a production correctness failure. Adopt incrementally, run existing validation, and compare a real interaction with profiling.

## Progressive hints

For each exercise, first ask what is measured, then identify which layer owns the update, and finally verify the proposed change against the invariant behavior.

## Complete solutions

The worked solution under each exercise gives one defensible approach; alternatives are appropriate when measurements identify a different bottleneck.

## Tests and edge cases

Check rapid typing, empty results, changed data identity, stale asynchronous responses, keyboard input, and the eventual consistency of deferred results. Confirm that no request is accidentally assumed to be debounced and that transitions do not control the input value.

## Reflection questions

## Reflection

For each optimization, write the observed symptom, the measurement supporting the diagnosis, the chosen change, the behavior that must remain invariant, and the before/after result. If no meaningful improvement appears, remove complexity that the evidence does not justify.
