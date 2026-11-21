# React Compiler configuration directives and React rules — Reference: Compiler integration concepts

## Scope and version

This lesson covers stable React Compiler 1.0 integration and adoption concepts across supported tools. Integration details are tool-version-specific, so use the current tool guide for exact configuration. [Introduction](https://react.dev/learn/react-compiler/introduction) [Installation](https://react.dev/learn/react-compiler/installation) [Compiling libraries](https://react.dev/reference/react-compiler/compiling-libraries)

## How this group fits the mental model

The compiler transforms eligible source at build time. A bundler integration schedules that transform; diagnostics describe which work was optimized or skipped; rollout practices help ensure users receive correct output.

## Supplied names explained

- `Automatic memoization` is compiler-generated reuse of component and Hook calculations. It can reduce unnecessary work but does not guarantee a specific performance improvement or fix inefficient algorithms.
- `Incremental adoption` means enabling compilation for a bounded portion of a codebase, checking diagnostics and behavior, then expanding. Annotation mode/directives and gating can support rollout; begin with supported integration defaults when possible.
- `Compiler diagnostics` describe successful compilation, skipped code, rule violations, unsupported patterns, or pipeline failures. Compiler-powered rules are available through `eslint-plugin-react-hooks`, even before compiler activation.
- `Gating compiled code` builds compiled and original paths and selects them through a boolean feature-flag function. It can support controlled rollout/rollback, but increases bundle size and adds an import to compiled files.
- `Library compilation` requires deciding whether to ship source for consumers to compile or publish precompiled output. Follow React's library guide, test peer/runtime compatibility, and avoid assuming every consumer uses the same Babel pipeline. [Compiling libraries](https://react.dev/reference/react-compiler/compiling-libraries)
- `Compatibility with manual memoization` means existing `memo`, `useMemo`, and `useCallback` remain valid. Keep them during initial adoption; removal can change dependency identity or effect behavior. Remove only after tests and measurements.
- `Babel integration` uses `babel-plugin-react-compiler`, which must run first in a Babel plugin pipeline. Some tool presets wrap this integration.
- `Bundler integration` connects compiler transformation to a supported build system. Official installation guides include Babel, Vite, Metro, Rsbuild, and framework-specific paths; exact integration/API depends on tool version.
- `React Native integration` uses Metro tooling and compiler support for React Native. Verify the documented setup for the Expo/Metro version in use rather than copying web-specific configuration.
- `compiler-first Babel plugin ordering` is required because the compiler needs original syntax/data-flow before other Babel transforms change it.
- `Compiler Playground` is an interactive tool to inspect input and compiler output while learning/debugging; it does not replace the project's actual build, lint, runtime, and test checks.

## Cross-item comparison

Compiler integration is the build transformation path; diagnostics are feedback; adoption is the rollout strategy; gating is runtime selection; library compilation is a distribution choice. These layers should be evaluated separately.

## Examples

```js
// Flat ESLint config: compiler-powered diagnostics can run before adoption.
import reactHooks from 'eslint-plugin-react-hooks';

export default [reactHooks.configs.flat.recommended];
```

For direct Babel configuration, put `babel-plugin-react-compiler` first in the `plugins` array. Use the version-specific integration guide for Vite/Metro/framework setup. [Installation](https://react.dev/learn/react-compiler/installation)

## Common mistakes

- Assuming React Compiler is a runtime library import rather than a build transform.
- Running it after source transforms that remove information.
- Treating a Playground result as proof the production build is configured.
- Assuming a library's consumers compile the same syntax or target React major.
- Removing manual memoization before testing effect dependencies and identity behavior.
- Claiming performance improvements without measuring the application.

## Knowledge checks with answers

1. What does Babel plugin ordering protect? The compiler's access to original source information.
2. Can compiler diagnostics run without compiling the app? Yes, through `eslint-plugin-react-hooks`.
3. Why might gating be used? Gradual runtime rollout/rollback; it has bundle-size costs.
4. What should a published library verify? Consumer toolchain and target/runtime compatibility.

## Sources

- [React Compiler introduction](https://react.dev/learn/react-compiler/introduction)
- [React Compiler installation](https://react.dev/learn/react-compiler/installation)
- [Compiling libraries](https://react.dev/reference/react-compiler/compiling-libraries)
- [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
