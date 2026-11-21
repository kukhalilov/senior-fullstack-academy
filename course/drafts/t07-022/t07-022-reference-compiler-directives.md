# React Compiler configuration directives and React rules — Reference: React Compiler directives

## Scope and version

React Compiler 1.0 supports the supplied "use memo" and "use no memo" directives as function/module-level string directives in supported compilation modes. They are control escape hatches, not runtime Hooks. [Directives](https://react.dev/reference/react-compiler/directives)

## How this group fits the mental model

Project configuration determines general selection policy; a directive provides narrow source-level control for one function or module. Prefer project-wide defaults and use directives only when an adoption or debugging case needs explicit control.

## Supplied names explained

- "use memo" opts a function into compiler processing. In annotation mode it is the signal to compile that function. In infer mode it can override inference; in all mode all eligible functions are compiled and "use no memo" can still exclude one. A module-level directive opts module functions into compilation. Place it at the beginning of the function body (or top of the module where supported), before executable statements. It does not guarantee a particular optimization if code is unsupported.
- "use no memo" excludes a function from compilation and overrides a module-level opt-in. Use it temporarily for debugging or incompatible code, document why, and remove it when the underlying issue is resolved. It is honored regardless of compilation mode. It does not disable React rendering or Hooks.

## Cross-item comparison

"use memo" opts in; "use no memo" opts out. compilationMode defines the broad selection policy, so a directive's effect depends partly on that mode. An opt-out can override a module opt-in.

## Examples

```jsx
function StableCard({ title }) {
  "use memo";
  return <article>{title}</article>;
}

function TemporaryWorkaround({ value }) {
  "use no memo";
  return <div>{value}</div>;
}
```

The second directive should carry a nearby explanation and a removal plan in real code. Neither example establishes that the component is measurably faster.

## Common mistakes

- Placing the directive after executable statements.
- Using "use memo" in a mode/build integration that does not recognize it.
- Expecting the directive to force compilation of unsupported code.
- Leaving "use no memo" indefinitely without documenting the reason.
- Assuming directives change runtime semantics or correctness contracts.

## Knowledge checks with answers

1. Which directive opts in? "use memo".
2. Which opts out even in a broad compilation mode? "use no memo".
3. Where does a function directive go? At the start of its body.
4. Do directives guarantee a performance improvement? No.

## Sources

- [React Compiler directives](https://react.dev/reference/react-compiler/directives)
- [compilationMode](https://react.dev/reference/react-compiler/compilationMode)
