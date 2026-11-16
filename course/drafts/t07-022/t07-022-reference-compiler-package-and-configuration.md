# React Compiler configuration directives and React rules — Reference: Compiler packages and configuration keys

## Scope and version

This lesson names current React Compiler 1.0 packages and public configuration keys. Defaults are intended to work for most projects; use advanced keys only for a specific compatibility, rollout, or debugging need. [Configuration](https://react.dev/reference/react-compiler/configuration) [Installation](https://react.dev/learn/react-compiler/installation)

## How this group fits the mental model

The compiler package transforms source in the build; the lint plugin surfaces Rules of React and compiler diagnostics. Configuration selects compilation candidates, runtime compatibility, failure policy, logs, and rollout gating.

## Supplied names explained

- `babel-plugin-react-compiler` is the stable compiler's primary Babel integration package. Install it as a development dependency. In a Babel pipeline it must run first, before other transforms, so analysis sees original syntax. Supported bundlers/frameworks may wrap it in a preset or integration instead of requiring direct Babel configuration. [Installation](https://react.dev/learn/react-compiler/installation)
- `eslint-plugin-react-hooks` is the official ESLint plugin for Hook rules and compiler diagnostics. Its recommended configuration includes compiler-powered lints; the compiler itself need not be installed to run these checks. The React Compiler 1.0 announcement says an existing `eslint-plugin-react-compiler` installation can be removed in favor of this plugin. [ESLint plugin](https://react.dev/reference/eslint-plugin-react-hooks) [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
- `compilationMode` chooses functions for optimization. Current documented modes are `infer` (default), `annotation`, `syntax` (Flow syntax), and `all` (not recommended for ordinary apps because non-React functions can be compiled). `"use no memo"` excludes a function regardless of mode. [compilationMode](https://react.dev/reference/react-compiler/compilationMode)
- `target` is the React major version string for generated code: `'19'` (default), `'18'`, or `'17'`. Targets 17/18 require `react-compiler-runtime`; React 19 provides built-in runtime support. Do not include patch versions or numeric values. [target](https://react.dev/reference/react-compiler/target)
- `panicThreshold` sets build response to compiler errors: `'none'` skips problematic optimization and continues (default), `'critical_errors'` fails on critical compiler errors, and `'all_errors'` fails on any compiler diagnostic. It does not control runtime exceptions. [panicThreshold](https://react.dev/reference/react-compiler/panicThreshold)
- `logger` accepts a `logEvent(filename, event)` callback for compilation events such as success, error, skip, diagnostics, pipeline errors, and timing. Event detail may change between compiler versions; avoid making build correctness depend on undocumented event fields. [logger](https://react.dev/reference/react-compiler/logger)
- `gating` is null by default or an object containing `source` (feature-flag module path) and `importSpecifierName` (exported boolean function). It conditionally selects compiled versus original code at runtime. Both versions increase bundle size, and the gating import is added to files containing compiled functions. [gating](https://react.dev/reference/react-compiler/gating)

## Cross-item comparison

`compilationMode` selects functions, `target` controls runtime compatibility, `panicThreshold` determines build handling, `logger` reports compiler events, and `gating` controls runtime rollout. These options solve different problems; do not change them together without a reason.

## Examples

```js
// babel.config.js
module.exports = {
  plugins: [
    'babel-plugin-react-compiler', // keep before other transforms
    // other Babel plugins follow
  ],
};
```

For a React 18 target, configure `target: '18'` and install the runtime package as a runtime dependency. Most React 19 projects can use the defaults. [target](https://react.dev/reference/react-compiler/target)

## Common mistakes

- Adding compiler after transforms that erase source information.
- Installing the old separate `eslint-plugin-react-compiler` instead of the current `eslint-plugin-react-hooks` diagnostics.
- Using number `19` or patch string `'19.0.0'` for `target`.
- Choosing `all` without realizing utility functions may be compiled.
- Setting gating while ignoring the extra output size.
- Treating `panicThreshold` as a runtime error boundary.
- Depending on unstable logger event details across compiler upgrades.

## Knowledge checks with answers

1. Which package performs Babel compilation? `babel-plugin-react-compiler`.
2. Which plugin supplies current compiler lints? `eslint-plugin-react-hooks`.
3. Which target requires no extra compiler runtime? `'19'`.
4. Which key allows a feature-flag function to select compiled code? `gating`.
5. What does default `panicThreshold: 'none'` do? Skips problematic compilation while continuing the build.

## Sources

- [React Compiler configuration](https://react.dev/reference/react-compiler/configuration)
- [React Compiler installation](https://react.dev/learn/react-compiler/installation)
- [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
- [ESLint plugin for React Hooks](https://react.dev/reference/eslint-plugin-react-hooks)
