# React Compiler configuration directives and React rules — Big-picture orientation and mental model

## Problem and purpose

React Compiler analyzes React components and Hooks during the build and automatically memoizes eligible work. It reduces the amount of manual `memo`, `useMemo`, and `useCallback` code needed for performance, while its analysis can also detect violations of React's rules. The compiler is an optional build-time tool, not a runtime switch inside React itself. [Introduction](https://react.dev/learn/react-compiler/introduction) [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)

## Plain-language mental model

Imagine a careful assistant reading a component before the app ships. It follows data and checks whether a value can be reused safely on later renders. If the code obeys React's rules, the compiler can generate reuse logic. If it cannot safely analyze a component, it can skip optimizing that part while other components compile. This depends on render purity, stable component/Hook patterns, and the compiler running in the build pipeline.

The compiler does not make impure rendering correct. It relies on the Rules of React: render should be pure and idempotent, Hooks must be called in valid places, and props/state/refs must be handled according to their rules. [Rules of React](https://react.dev/reference/react)

## How the parts fit together

```text
React source
├── Rules of React ── define safe behavior
├── Compiler build integration ── analyzes eligible components/Hooks
├── Configuration ── target, selection mode, diagnostics, gating
├── Directives ── opt specific functions in/out when needed
└── eslint-plugin-react-hooks ── surfaces rules and compiler diagnostics
```

Compiler adoption is a build and code-quality decision. Start with the official integration for the project's bundler, review diagnostics, adopt incrementally if needed, then measure the actual app. The compiler can improve performance but does not guarantee a specific speedup. [Installation](https://react.dev/learn/react-compiler/installation) [Introduction](https://react.dev/learn/react-compiler/introduction)

## Concept map

- **Automatic memoization:** compiler-generated reuse for eligible render work.
- **Rules:** constraints that make component execution predictable and optimization safe.
- **Configuration:** controls target compatibility, selection, error behavior, logging, and runtime gating.
- **Directives:** function/module string directives for narrow compilation control.
- **Diagnostics:** lint/compiler reports; unsupported code may be skipped while other code remains optimized.
- **Integration:** a build plugin/preset/loader connects compilation to Babel or a supported toolchain.

## End-to-end walkthrough

Install the compiler as a development dependency and configure the supported build integration. The plugin must run first in a Babel plugin pipeline so it sees original source. Build the app and inspect compiler diagnostics through `eslint-plugin-react-hooks`; address correctness issues and unsupported syntax at a sustainable pace. For a large existing app, use an opt-in mode/directives or compiler gating to roll out gradually. Keep manual memoization initially unless you have tested removing it, because it may affect effect dependencies or behavior. [Installation](https://react.dev/learn/react-compiler/installation) [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)

## When to use it and tradeoffs

Use the compiler when the project can support its build integration and can validate behavior across optimized code. It can reduce hand-written memoization and surface rule violations. It adds a build step, version/configuration management, and rollout/testing needs. It does not replace profiling, correct state design, or rule-compliant code.

## What later lessons cover

The references cover current stable packages and configuration, directives, React purity and Hook rules, and integration/adoption concepts including library compilation, diagnostics, gating, bundlers, and React Native.

## Version context

React Compiler 1.0 became stable in October 2025. Compiler diagnostics are surfaced through `eslint-plugin-react-hooks`; the release announcement says projects already using the separate `eslint-plugin-react-compiler` can remove it. The compiler supports React 17, 18, and 19 when targeted appropriately; React 17/18 require the compatibility runtime. [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1) [Target](https://react.dev/reference/react-compiler/target)

## What is covered elsewhere

This topic does not cover framework-specific deployment, routing, server rendering, or third-party state libraries.
