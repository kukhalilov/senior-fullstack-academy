# React Compiler configuration directives and React rules — Interview questions and reasoning

Use the [React Compiler introduction](https://react.dev/learn/react-compiler/introduction), [configuration reference](https://react.dev/reference/react-compiler/configuration), and [ESLint plugin reference](https://react.dev/reference/eslint-plugin-react-hooks) when checking details.

## Core questions

1. What does React Compiler do, and when does it run?
2. Why does the compiler depend on the Rules of React?
3. Explain the different jobs of `compilationMode`, `target`, `panicThreshold`, `logger`, and `gating`.
4. What do `"use memo"` and `"use no memo"` do?
5. Which ESLint package currently surfaces compiler diagnostics?
6. Should an existing codebase remove `useMemo`/`useCallback` immediately?

## Concise interview answers

1. It analyzes components and Hooks during build and generates automatic memoization for eligible code.
2. Purity, idempotence, immutable inputs, and stable Hook calls make analysis/reuse safe.
3. Candidate selection; React major compatibility; compiler-error build policy; event logging; runtime choice between compiled/original output.
4. They opt a function into or out of compilation, respectively, in supported modes.
5. `eslint-plugin-react-hooks`.
6. No. Keep them initially and remove selectively after testing and measuring.

## Deep follow-up answers

1. Build-time transformation can inspect source/data flow and generate memoization. It is not a runtime API and does not guarantee every function compiles or a speedup.
2. Impure render can produce different results on repeated execution; mutation breaks assumptions about input identity and prior values; conditional Hooks break state association.
3. These are orthogonal: selecting functions, runtime target, response to diagnostics, observability, and rollout. Defaults suit most apps.
4. `"use memo"` marks an opt-in function; `"use no memo"` excludes it and can override module opt-in. They are directives, not performance promises.
5. Compiler diagnostics are in the current Hooks plugin recommended configuration and can be enabled without compiler installation.
6. Existing memoization can affect effect dependencies and identity behavior. Keep while adopting, test and profile, then simplify only with evidence.

## Scenario questions

1. A memoized component still rerenders after compiler adoption. What would you inspect?
2. Compiler warnings block a gradual rollout. How could you safely increase coverage without stopping all work?
3. A library ships compiled code but consumers use React 18. Which compatibility details matter?
4. Optimized code behaves differently only when a feature flag is on. How do you narrow the issue?

## Tradeoffs and alternatives

- Compiler automation reduces manual memoization but adds a build step and requires rule-aware code.
- `infer` is low-configuration; `annotation` supports opt-in adoption; `all` can compile non-React utilities and is generally unsuitable.
- Gating supports rollout/rollback but increases bundle size and adds flag dependencies.
- Manual memoization remains a precise escape hatch; removing it can alter identity-sensitive behavior.
- Lint diagnostics can be adopted before compiler transformation to improve correctness and readiness.

## Common weak answers

- “The compiler guarantees faster code.” It only generates optimizations for eligible code; measure the application.
- “Compiler diagnostics mean the app is broken.” They can identify unsupported optimization patterns; understand each diagnostic.
- “Memoization makes impure render safe.” It does not.
- “The target is the browser target.” It is the React major version.
- “The compiler plugin can run anywhere in Babel.” It should run first.
- “Delete all manual memoization.” Preserve and test during adoption.

## Self-check rubric

Score 0–2 each: (a) accurately describes build-time behavior; (b) links React rules to compiler safety; (c) separates configuration dimensions; (d) explains directives; (e) knows current lint package and diagnostics; (f) gives a tested adoption plan. Strong answers score 10–12 and avoid promising speedups.
