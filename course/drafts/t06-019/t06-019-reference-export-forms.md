<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# ECMAScript modules, imports, exports, and module loading semantics — Reference: Export declarations and re-exports

# Scope and version

This reference covers the supplied named/default export forms and re-export forms in ECMAScript 2026. Exported names are bindings, and re-exporting connects module graph edges without copying values. See [ECMAScript module syntax](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html), [module namespace objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html), and [MDN modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

# How this group fits the mental model

Exports form a module's public interface. The exporting module owns the binding; importers receive read-only live access. A re-export adds an export edge to the graph and can expose a dependency's API through a barrel module. Export names must be resolvable and unambiguous when linked.

# Supplied names explained

- `Named export declaration` — An export that exposes one or more names other than the special `default` name, either from declarations or an export list. The exported binding remains owned by the source module.
- `Default export declaration` — Exposes the module's distinguished `default` name, using `export default expression`, a default function/class declaration, or an export list that aliases a local binding to `default`.
- `Exported variable declaration` — `export const`, `export let`, or `export var` makes each declared binding part of the module's exports. `let`/`const` remain uninitialized until evaluation reaches their declaration; cyclic reads during that interval can fail.
- `Exported function declaration` — `export function name() {}` declares and exports a function binding. Function declarations are initialized during module instantiation, which can make them available earlier than lexical variable declarations in a cycle.
- `Exported class declaration` — `export class Name {}` exports a class binding. The class binding is lexical and remains in the temporal dead zone until its declaration evaluates.
- `Export list` — `export { localA, localB };` exposes existing local bindings without redeclaring them. It can appear after the declarations and does not copy values.
- `Export alias` — `export { internalName as publicName };` exposes a local binding under another exported name; `export { local as default }` aliases it to the default name.
- `String-literal exported name` — `export { value as "legacy-name" };` exposes a binding using a string-literal module name that is not a valid identifier. Consumers can import it with a string-literal name and a local alias. This syntax is part of ECMAScript 2022 and later.
- `Duplicate exported-name early error` — A module cannot declare the same exported name more than once. Conflicting names introduced by star exports are treated as ambiguous during export resolution rather than selected by declaration order; explicitly export the intended binding to resolve the ambiguity.
- `Default export expression and default binding forms` — `export default expression` initializes the synthetic default export binding from the expression's value; `export { local as default }` aliases the local binding, and named/anonymous default function or class declarations have their corresponding declaration-binding rules.
- `Re-export from another module` — `export { item } from "./source.js";` forwards an imported name without creating an ordinary local binding in the re-exporting module.
- `Import attributes on re-export requests` — An export-from request can carry the same `with { key: "value" }` attributes as an import request, for example `export { default as settings } from "./settings.json" with { type: "json" };`. The host-loading rules and supported attributes apply to this dependency request too.
- `Namespace re-export` — `export * as utilities from "./utilities.js";` exports a namespace object as one named export.
- `Export all declaration` — `export * from "./source.js";` forwards the target's named exports except `default`. If multiple star paths resolve the same name to different bindings, that name is ambiguous unless resolved explicitly.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| Named vs default export | A module can expose many named bindings but only one binding named `default` |
| `export { local }` vs `export { local } from "..."` | Local export exposes a binding in this module; re-export forwards a target module binding |
| `export *` vs `export * as ns` | Forwards individual named exports (not default) versus one namespace under a chosen name |
| `export default expression` vs `export { local as default }` | Initializes a default binding from an expression value versus exposing the local binding itself |

# Examples

```js
// geometry.js
export const unit = "cm";
export function area(width, height) { return width * height; }
const internalVersion = 1;
export { internalVersion as version };
export default function label(shape) { return `${shape} area`; }
```

```js
// index.js: a small public surface
export { area as rectangleArea, unit } from "./geometry.js";
export * as geometry from "./geometry.js";
export { unit as "unit-label" } from "./geometry.js";
```

The second module exposes two named paths: individual re-exported names and a namespace export. It does not silently re-export the default function through `export *`.

# Common mistakes

- Assuming an exported binding is copied when the module evaluates; imports and re-exports preserve binding relationships.
- Assuming `export *` also forwards `default`; it does not.
- Treating `export { local as public }` as renaming the local variable; it only chooses the public export name.
- Reading an exported `let`/`const` before its initialization through a cycle and assuming it already has a value.
- Assuming class exports initialize as early as function declarations; class declarations are lexical.
- Re-exporting many `*` names that collide and expecting the loader to choose one automatically.
- Expecting an export list to create the listed local variables; each local must already be declared.
- Treating `export default expression` as a live alias of a variable used in the expression.
- Assuming every exported name must be a JavaScript identifier; module export names may also be string literals.

# Knowledge checks with answers

1. **Does `export *` forward `default`?** No.
2. **Does `export { x as publicX }` change the local name `x`?** No; it gives the exported binding another public name.
3. **Which is a live alias: `export default x` or `export { x as default }`?** The export-list alias exposes `x` itself; the expression form initializes a separate default binding from the value of `x` at evaluation time.
4. **What does `export * as ns` expose?** One named export whose value is the target module namespace object.
5. **Can conflicting star exports be resolved by arbitrary order?** No; ambiguous names must be resolved explicitly.

# Further reading

- [ECMAScript 2026 export declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [ECMAScript 2026 module namespace objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [MDN JavaScript modules guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
