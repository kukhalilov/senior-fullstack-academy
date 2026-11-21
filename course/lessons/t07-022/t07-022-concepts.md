# React Compiler configuration directives and React rules — Core concepts and how they fit together

## Learning objectives

Explain build-time automatic memoization; choose a gradual compiler adoption strategy; interpret compiler/lint diagnostics; connect purity and Hook rules to optimization; and distinguish compilation selection, target compatibility, gating, and directives.

## Prerequisites

Know React components and Hooks, rerenders, referential identity, and a build pipeline. **Memoization** reuses a prior computed value or component result when relevant inputs have not changed. **Build-time** means the transformation occurs while source code is compiled, before browser execution. [Introduction](https://react.dev/learn/react-compiler/introduction)

## Core concepts

### What the compiler memoizes

React Compiler analyzes data flow and mutability to generate memoization for eligible component and Hook work. It can memoize more granularly than hand-authored `useMemo`, `useCallback`, or `memo`, including some conditional cases. It is a performance optimization; code must still produce correct output without relying on a particular cache identity as business logic. The compiler's heuristics and generated output may evolve. [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)

### The Rules of React are correctness constraints

Components and Hooks should be pure and idempotent during render. Side effects belong outside render. Do not mutate props/state, call components as ordinary functions, or call Hooks conditionally/inside loops. Components and Hook names follow conventions so React and the compiler can identify them. The compiler can skip code where analysis detects rule violations; lint diagnostics help find those areas. The rules remain important even if the compiler is absent. [React reference](https://react.dev/reference/react)

### Diagnostics are safe boundaries

`eslint-plugin-react-hooks` provides the standard Hook rules and compiler-powered diagnostics in its recommended presets. Compiler diagnostics do not necessarily mean the entire build must stop: the compiler can skip unsupported components/Hooks while still compiling safe code. Treat diagnostics as a roadmap for correctness and coverage, not proof that every skipped component is broken. [ESLint plugin](https://react.dev/reference/eslint-plugin-react-hooks)

### Adoption can be incremental

The default `infer` compilation mode is intended for normal React code that follows naming conventions. `annotation` mode can compile only explicitly opted-in functions for gradual adoption. Compiler `gating` can produce both compiled and original versions selected by a runtime boolean, at the cost of bundle size. A codebase can progressively expand coverage while testing optimized output.

### Configuration knobs answer different questions

- `target` asks which React major version compiled code should support (17, 18, or 19); older targets need `react-compiler-runtime`.
- `compilationMode` asks which functions are candidates.
- `panicThreshold` asks whether compilation diagnostics should skip code or fail the build.
- `logger` observes compiler events for tooling/debugging.
- `gating` controls runtime selection between compiled and original output.

Most apps should start with defaults and configure only a demonstrated need. [Configuration](https://react.dev/reference/react-compiler/configuration) [Target](https://react.dev/reference/react-compiler/target)

### Manual memoization remains valid

The compiler can reduce new manual memoization. Keep existing `useMemo`, `useCallback`, and `memo` while adopting; removing them may change effect dependencies or other behavior. Use them as explicit control when a real requirement remains, then measure. The compiler is not a blanket instruction to delete memoization. [Introduction](https://react.dev/learn/react-compiler/introduction)

## Mechanisms and relationships

| Question | Mechanism |
|---|---|
| Which source functions are compiled? | `compilationMode`, directives, compiler inference |
| Which React runtime is generated for? | `target` |
| What happens when compilation cannot proceed? | `panicThreshold` and skip/diagnostic behavior |
| How are compiled and original versions switched? | `gating` |
| How can events be inspected? | `logger` and `eslint-plugin-react-hooks` |
| What makes optimization semantically safe? | Rules of React and pure/idempotent render |

## Worked examples

### Pure component and compiler setup

```jsx
function Price({ amount, currency }) {
  const formatted = new Intl.NumberFormat('en', { style: 'currency', currency })
    .format(amount);
  return <output>{formatted}</output>;
}
```

The output is derived from inputs; no global mutation occurs during render. Compiler use does not alter the component's external contract. Actual compilation depends on build integration and compiler analysis.

### Opt-in compilation

```jsx
function StablePanel({ title }) {
  "use memo";
  return <section><h2>{title}</h2></section>;
}
```

This directive is useful in a supported annotation workflow. Do not add it as a generic performance decoration; explain a real rollout/debugging reason.

## Misconceptions and edge cases

- The compiler does not guarantee every component compiles or a fixed performance gain.
- A successful build does not prove there are no rule violations; diagnostics and testing still matter.
- Compiler optimization is not a substitute for pure render functions.
- `target` is a React major string, not the application build target like browser/Node.
- `panicThreshold` controls compiler error handling, not React runtime errors.
- `gating` increases output size because compiled and original implementations coexist.
- Removing manual memoization can change effect behavior; test before removing it.

## Knowledge checks with answers

1. **What does the compiler primarily do?** Build-time automatic memoization of eligible components and Hooks.
2. **What protects correctness?** Following React's purity and Hook rules; compiler skipping is only a safety boundary.
3. **Which option selects the compatible React major?** `target`.
4. **Which option supports runtime rollout?** `gating`.
5. **Should existing manual memoization be removed immediately?** No; keep it and remove selectively after testing.
