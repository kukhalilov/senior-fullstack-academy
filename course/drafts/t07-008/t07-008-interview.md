# React performance transitions deferred values profiling and compiler — Interview questions and reasoning

Sources: React 19.3 [`memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo), [`useCallback`](https://react.dev/reference/react/useCallback), [`useTransition`](https://react.dev/reference/react/useTransition), [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue), [`Profiler`](https://react.dev/reference/react/Profiler), and [React Compiler](https://react.dev/learn/react-compiler/introduction).

## Core questions

The questions below cover measurement, render/commit distinctions, cache correctness, scheduling, profiling, compiler behavior, and CPU-bound work.

## Concise interview answers

Use the short model answers below as a starting response, then add evidence and tradeoffs from the scenario.

## Deep follow-up answers

The follow-ups ask why each technique applies, which correctness guarantees remain, and what measurement would confirm the claim.

## Answering framework

Explain the user symptom, evidence, cost location, selected technique, tradeoffs, and how you would verify the outcome. Distinguish React scheduling and render work from browser and network costs. Avoid saying “memoize everything” or equating render count with slowness.

## Core questions and model answers

### How do you investigate a slow React screen?

Reproduce the specific user journey and define a latency or responsiveness measure. Profile React commits to identify expensive subtrees, then use browser performance tooling for JavaScript, layout, paint, and network. Change a measured cause and compare the same interaction.

### What is the difference between render and commit?

Render computes a candidate tree and may be repeated or abandoned. Commit applies a completed update to the host environment. A render need not change the DOM, and browser paint may add costs after commit.

### When do you use `memo`, `useMemo`, or `useCallback`?

Use `memo` for a measured expensive child with stable props, `useMemo` for a costly pure calculation with stable dependencies, and `useCallback` when function identity matters to a consumer. They are optional performance caches, not semantic storage. Measure the result and keep dependencies correct.

### Why can a custom `memo` comparator cause stale behavior?

It may return true while a changed function prop has a new closure. The child then keeps behavior from an older render. Compare all behavior-relevant props and measure comparator cost; default comparison is safer unless the case is justified.

### Compare `useTransition` and `useDeferredValue`.

`useTransition` marks state updates at a source as non-urgent and gives an `isPending` signal. `useDeferredValue` lets a consumer use an older value while current input advances. Choose based on update ownership. Neither debounces requests or preempts a long synchronous function.

### Why can’t transition state control a text input?

Controlled input state must update urgently to keep typing responsive. Transition the expensive dependent view, not the input’s displayed value.

### What do `actualDuration` and `baseDuration` tell you?

`actualDuration` reports milliseconds React spent rendering the profiled subtree for the committed update. `baseDuration` estimates the subtree’s cost without recent render savings. Neither equals total response time or browser paint. The callback phase can be `mount`, `update`, or `nested-update`.

### What does React Compiler change?

It can add build-time memoization to eligible code, reducing routine manual memo API usage. Components still need purity and correct Hook rules; the Compiler cannot fix a poor algorithm or non-React bottleneck. Profile the user journey after adoption.

### How do you handle a 200 ms CPU-bound filter?

First inspect algorithm and data shape. A deferred UI value cannot interrupt a synchronous JavaScript call. Improve complexity, reduce/pre-index data, chunk work, or use a Worker where suitable; then measure interaction responsiveness and result correctness.

### When would you remove a memoization change?

If comparable measurements show no meaningful improvement, dependencies make reuse rare, the comparator costs more than rendering, or the complexity causes bugs. A cache should earn its maintenance cost.

## Scenario questions

### Search results lag behind input

Keep the controlled query urgent. Measure whether filtering, rendering rows, network, or browser layout dominates. If React subtree rendering is the issue and stale results are acceptable, defer the query or transition result state and label stale content. If one synchronous calculation blocks the main thread, optimize or move that work. Verify input latency, eventual results, accessibility status, and browser profile.

## Tradeoffs and alternatives

Prefer an algorithmic improvement when computation dominates, a Worker for suitable CPU-bound work, scheduling APIs when rendering priority is the issue, and manual or compiler memoization when repeated React work is measured. These choices can be combined only when evidence supports each layer.

## Common weak answers

- “React is slow, so memoize everything.”
- “`useDeferredValue` debounces my API calls.”
- “A render always updates the DOM.”
- “The Compiler makes profiling unnecessary.”
- “Transition priority can interrupt any JavaScript computation.”

## Self-check rubric

An effective answer names a user-visible symptom, proposes relevant evidence, locates the work, explains the chosen technique and its limitations, and describes a comparable verification.

## Senior-level signals

- Names the user-visible objective and measurement before proposing an optimization.
- Separates render, commit, paint, and network work.
- Describes stale-result UX and correctness during transitions.
- Understands cache invalidation, object identity, closures, and dependency correctness.
- Treats React Compiler as an optimization aid rather than a substitute for design or evidence.
- Verifies on representative data and devices, including regressions and complexity costs.
