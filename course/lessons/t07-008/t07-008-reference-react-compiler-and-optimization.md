# React performance transitions deferred values profiling and compiler — Reference: React Compiler optimization model

Sources: React 19.3 [React Compiler](https://react.dev/learn/react-compiler/introduction), [`memo`](https://react.dev/reference/react/memo), [`useMemo`](https://react.dev/reference/react/useMemo), [`useCallback`](https://react.dev/reference/react/useCallback), and [React Developer Tools](https://react.dev/learn/react-developer-tools).

## Scope and version

React Compiler performs static analysis during the build and can generate memoization for eligible React code. It is an optimization layer over components already written according to React’s rules. It is not a runtime profiler, a replacement for sound algorithms, or a way to make side-effectful rendering correct.

## How this group fits the mental model

Compiler optimization complements the manual cache APIs by automating eligible cases during build. Profiling still identifies which work matters, and React’s purity rules preserve correctness.

## Supplied names explained

### React Compiler

Compiler tooling analyzes components and Hooks and can generate optimized output that avoids recomputing or rerendering work when relevant inputs have not changed. Follow the official installation and framework/bundler guidance for the project. Compiler availability and integration are build-tool concerns, distinct from React runtime APIs.

### Build-time optimization

Compiler analysis occurs as source is transformed during build, rather than deciding optimization from runtime profiling data. Generated code can introduce caching boundaries. Build output, diagnostics, and supported syntax depend on the compiler version and configuration.

### Automatic component memoization

For eligible components, Compiler can avoid repeating rendering when the component’s reactive inputs are unchanged, reducing the need to wrap every child in `memo`. State and context changes still matter. The optimization is not a behavioral promise that a component never renders.

### Automatic value memoization

Compiler may cache intermediate calculations based on their dependencies. This can avoid manually adding `useMemo` for routine derived values. Expensive algorithms may still need a better approach; build-time memoization does not make a changed input calculation free.

### Automatic function memoization

Compiler can preserve function values where doing so benefits React rendering, reducing routine `useCallback` usage. APIs or external systems with identity contracts still need correct lifecycle and dependency behavior; follow their requirements.

### React Compiler versus manual memoization

Manual `memo`, `useMemo`, and `useCallback` are explicit local hints and remain public APIs. Compiler automates many eligible cases. Prefer project-supported Compiler optimization for broad routine cases, retain explicit APIs when semantically useful or needed for integrations, and validate with measurement. Neither approach replaces correctness.

### Compiler optimization depends on Rules of React

Components and Hooks must be pure during render, call Hooks consistently at the top level, and follow supported React patterns. Mutation of props/state, conditional Hook calls, or unsupported dynamic patterns can prevent safe optimization. Compiler diagnostics can flag or skip code that cannot be proven safe.

### Incremental compiler adoption

Adopt in supported slices, check diagnostics, run the project’s normal validation, and compare real interactions. Existing unoptimized code can continue to run. Maintain a rollback path through ordinary build configuration and verify production artifacts.

### Compiler diagnostics

Diagnostics explain optimization eligibility or rule violations. A skipped component remains valid React code if it is otherwise correct; lack of optimization is not automatically a bug. Fix meaningful correctness issues, but do not contort code solely to silence a diagnostic without understanding its consequence.

### Compilation mode

The current documented `compilationMode` values are `infer` (the default), `annotation`, `syntax`, and `all`. At a high level, `infer` selects likely components/Hooks by conventions and analysis; `annotation` opts in marked functions for gradual adoption; `syntax` targets Flow component/Hook syntax and is not for TypeScript; `all` compiles all top-level functions and can optimize non-React utilities, so React does not recommend it for typical use. The detailed configuration and directives are covered in t07-022; use its current instructions for setup.

## Cross-item comparison

| Question | React Compiler | Manual memoization |
|---|---|---|
| Where decided? | Build-time static analysis | Explicit component/Hook code |
| Main benefit | Broad automatic optimization for eligible code | Targeted local cache or render boundary |
| Requirement | Rules of React and compatible integration | Correct dependencies/comparison and stable inputs |
| Performance evidence still needed? | Yes | Yes |

## Examples

Before broad manual caching, keep render logic pure and profile the slow interaction. If Compiler is enabled for the project, inspect diagnostics and generated build behavior, then record the same interaction. If one measured expensive calculation still needs an explicit cache or algorithmic improvement, add the smallest targeted change and re-measure.

## Common mistakes

- Assuming Compiler accelerates network, database, layout, or paint bottlenecks.
- Treating a skipped optimization diagnostic as a user-visible failure.
- Introducing compiler configuration copied from a different release.
- Depending on Compiler-generated cache identity for application correctness.
- Removing all manual memo APIs without considering external identity contracts.
- Optimizing code while violating render purity.

## Knowledge checks with answers

1. **When does the Compiler optimize?** During build-time analysis and transformation.
2. **Does it replace measurement?** No; confirm improvement on a relevant interaction.
3. **What is the correctness prerequisite?** Components and Hooks must follow React’s rules, especially purity.
4. **Does it make repeated changed-input work free?** No; changed dependencies may require fresh computation.

### Exact terms covered

- `React Compiler`
- `Build-time optimization`
- `Automatic component memoization`
- `Automatic value memoization`
- `Automatic function memoization`
- `React Compiler versus manual memoization`
- `Compiler optimization depends on Rules of React`
- `Incremental compiler adoption`
- `Compiler diagnostics`
- `Compilation mode`
- `compilationMode infer default`
- `compilationMode annotation mode`
- `compilationMode syntax mode requires Flow`
- `compilationMode all mode compiles top-level functions`
