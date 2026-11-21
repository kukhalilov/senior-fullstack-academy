# React Compiler configuration directives and React rules — Exercises and worked solutions

## Goals

Configure a safe compiler rollout, distinguish compiler diagnostics from runtime bugs, apply React rules, and decide when manual memoization should remain.

## Worked example

### A large existing application

The team has a Babel-based React 19 application and wants compiler coverage without a risky all-at-once change. Install the official compiler plugin and run it first in Babel. Add `eslint-plugin-react-hooks` recommended configuration to surface rules and compiler diagnostics. Start from default infer mode or use annotation mode for a bounded opt-in rollout. Keep manual memoization, test key flows, inspect diagnostics, and expand only when stable. Do not assume every component will compile or that a fixed speedup will result.

## Exercises

1. Choose `target` for React 18 and list the additional runtime dependency.
2. A Babel build has another plugin that transforms JSX before the compiler. Explain the risk and correct ordering.
3. A team wants to optimize only explicitly marked components. Choose a mode and directive.
4. A component is skipped because it mutates a prop array during render. Rewrite the logic safely.
5. A build must report all compiler diagnostics as failures during local investigation but not fail production for skipped optimizations. Choose the setting strategy.
6. A team wants to enable compiled code for a percentage of sessions while retaining original output. Explain gating and its cost.
7. A repository has `eslint-plugin-react-compiler` installed. What should it use now?

## Progressive hints

1. `target` is a React major version string; older targets use a compatibility runtime.
2. Compiler needs original source syntax.
3. Annotation mode works with `"use memo"`.
4. Create a new array; do not mutate the input.
5. `panicThreshold` governs compiler diagnostics; distinguish build-time development and production policies.
6. A feature-flag import chooses compiled versus original implementation; both are emitted.
7. React Compiler 1.0 moved diagnostics into the Hooks ESLint plugin.

## Complete solutions

1. Set `target: '18'` and install `react-compiler-runtime` as a runtime dependency. Use an exact compatible version and verify package guidance.
2. Put `babel-plugin-react-compiler` first so it analyzes original source before transforms.
3. Set `compilationMode: 'annotation'` and add `"use memo"` at the top of chosen function bodies. Unsupported code can still be skipped.
4. Replace `items.sort(...)` on the prop array with `[...items].sort(...)`; keep render calculations pure and do not mutate the caller's array.
5. Temporarily use stricter `panicThreshold` locally for diagnosis, and use the default `'none'` policy in production so unoptimizable components are skipped rather than preventing the build. Confirm exact intent against project policy.
6. Configure `gating` with a module source and exported boolean function. Both compiled and original versions increase bundle size, and the import appears in files with compiled functions.
7. Use `eslint-plugin-react-hooks` and its recommended preset, which includes compiler-powered diagnostics and core Hook linting.

## Tests and edge cases

- Verify compiled output imports the expected runtime for the selected `target`.
- Run linting without the compiler to confirm diagnostics still surface.
- Confirm the compiler is first in Babel plugin order.
- Test both feature-flag outcomes and verify they preserve the same behavior.
- Check render purity under repeated renders/Strict Mode.
- Keep existing `useMemo`/`useCallback` during adoption and test before removing.
- Measure representative interactions; do not infer improvement solely from compilation success.

## Reflection questions

- Which code areas have the strongest tests and make good rollout candidates?
- Which diagnostics indicate correctness defects versus limited compiler coverage?
- What observable behavior could change if memoized identity changes?
- How will you measure whether compiler adoption helped users?

## Sources

- [React Compiler configuration](https://react.dev/reference/react-compiler/configuration)
- [React Compiler installation](https://react.dev/learn/react-compiler/installation)
- [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
