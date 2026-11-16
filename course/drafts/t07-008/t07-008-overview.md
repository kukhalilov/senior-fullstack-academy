# React performance transitions deferred values profiling and compiler — Big-picture orientation and mental model

Sources: React 19.3 [`memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo), [`useCallback`](https://react.dev/reference/react/useCallback), [`useTransition`](https://react.dev/reference/react/useTransition), [`useDeferredValue`](https://react.dev/reference/react/useDeferredValue), [`Profiler`](https://react.dev/reference/react/Profiler), [React Compiler](https://react.dev/learn/react-compiler/introduction), and [React Developer Tools](https://react.dev/learn/react-developer-tools).

## Problem and purpose

Performance work aims to improve a user-visible delay, responsiveness problem, or resource cost without making the application harder to reason about. A render is work React performs to calculate a possible UI tree; a commit applies the chosen changes. Frequent render attempts alone do not establish that users have a problem.

## Plain-language mental model

Measure first, locate the work, and choose the smallest fitting change. Manual memoization can reuse a calculation, callback identity, or component result when inputs are unchanged. Transitions and deferred values let React prioritize urgent interactions while preparing slower UI updates. Profilers explain committed React work; browser tools show broader JavaScript, layout, paint, and network costs. React Compiler can add memoization at build time, but it does not make impure rendering or incorrect state logic safe.

## How the parts fit together

```text
observe a user-visible delay
  → profile React and browser work
  → identify calculation, render, commit, layout, paint, or network cost
  → choose code/data fix, memoization, or update-priority API
  → compare the same interaction after the change
```

Urgent updates keep direct interaction feedback current. A transition marks non-urgent state updates so React can interrupt and restart background rendering. `useDeferredValue` lets a dependent subtree continue showing an older value while new work is prepared. These APIs improve scheduling and responsiveness; they do not make an inherently expensive computation disappear.

## Concept map

`memo` can skip a child render when props compare equal. `useMemo` caches a calculated value and `useCallback` caches a function identity. These caches use `Object.is` for dependencies and can be discarded; application correctness must not depend on them. React Compiler can automatically optimize eligible components and values. Profiling and a real interaction determine whether any optimization helps.

## End-to-end walkthrough

Suppose typing into a search box feels delayed because each keystroke filters and renders a large result list. First reproduce and profile it. If the filter itself is expensive, measure whether optimizing the algorithm or indexing data helps. If the input state drives a large subtree, keep the input update urgent and pass a deferred query to the results subtree, displaying a stale indicator while the query catches up. Re-profile typing and verify the list still reflects the eventual query. Add manual memoization only when stable inputs allow meaningful work to be skipped; compare again with React Compiler enabled if the project adopts it.

## When to use it and tradeoffs

Use `useTransition` for state updates that can lag behind direct interaction feedback; transition updates cannot control text inputs. Use `useDeferredValue` when a value feeds expensive downstream rendering and temporary staleness is acceptable. Use memo APIs only for measured repeated work or identity-sensitive consumers. Profiling adds instrumentation overhead, and development timings differ from production; production profiling needs a profiling-enabled build. Compiler adoption is incremental and requires code to follow the Rules of React.

## What later lessons cover

Reference lessons explain each manual cache, priority API, Profiler field, React Compiler model, and measurement technique. Practice traces an interaction from symptom to evidence and a validated change. Interview prompts compare scheduling, caching, and render measurement.

## Version notes

React Compiler is documented as a stable build-time optimization in the current React documentation. It reduces the need for routine manual memoization but does not remove the need to measure or preserve purity. Existing `memo`, `useMemo`, and `useCallback` APIs remain available.
