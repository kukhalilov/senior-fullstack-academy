<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# ECMAScript modules, imports, exports, and module loading semantics — Exercises and worked solutions

# Goals

Practice designing module boundaries, predicting live-binding behavior, forwarding exports, selecting static versus dynamic loading, and diagnosing a cycle. Treat host resolution and JSON attributes as explicit environment concerns.

# Worked example

`score.js` owns mutable state and exports an update function. `report.js` imports both bindings:

```js
// score.js
export let score = 0;
export function add(points) { score += points; }
```

```js
// report.js
import { score, add } from "./score.js";
add(5);
console.log(score); // 5
```

The imported name reads the exporter’s binding; it is not an initial-value copy and is not assignable in `report.js`.

# Exercises

## 1. Default expression or live alias?

Given a local `let mode = "light"`, compare `export default mode;` with `export { mode as default };`. After changing `mode` to `"dark"`, predict what a default importer observes in each design.

## 2. Public barrel

Create `math.js` with named exports `add` and `subtract`, a default export, and one private helper. Then create `index.js` that re-exports only `add`, renames `subtract` to `minus`, and exports a namespace for all named math bindings. Explain whether `export *` would include the default export.

## 3. Conditional feature loading

Write an async function that does not request `./editor.js` when a flag is false. When true, dynamically import it, call its default export, and let loading/evaluation failures reject to the caller.

## 4. Cycle diagnosis

`a.js` imports `readB` from `b.js` and calls it before `a.js` initializes an exported `const ready`. `b.js` imports `ready` and `readB` returns it. Explain why a cycle may link successfully but fail at evaluation, then rearrange the code so `readB` is called only after initialization.

## 5. JSON module request

Write a static import for `settings.json` using the current import-attribute syntax. Explain what an environment must support before it will work.

# Progressive hints

1. An expression export initializes the default binding from a value; an export list can expose the original local binding.
2. A re-export list can rename names; `export * as` creates one namespace export. Star export omits `default`.
3. Put `import()` inside the true branch. It returns a promise for a namespace; the caller can await it.
4. Linking can create the cycle's bindings before the bodies run; lexical `const` remains uninitialized until its declaration evaluates.
5. Use `with { type: "json" }`; test that the target host supports both the attribute and JSON module loading.

# Complete solutions

## 1. Default expression or live alias?

```js
// expression-default.js
let mode = "light";
export default mode;
mode = "dark";
```

```js
// binding-default.js
let mode = "light";
export { mode as default };
mode = "dark";
```

An importer sees `"light"` from `expression-default.js` because the default binding was initialized from that expression value. It sees `"dark"` from `binding-default.js` because the export list exposes the local binding itself.

## 2. Public barrel

```js
// math.js
function normalize(value) { return value; }
export function add(a, b) { return normalize(a + b); }
export function subtract(a, b) { return normalize(a - b); }
export default function multiply(a, b) { return a * b; }
```

```js
// index.js
export { add, subtract as minus } from "./math.js";
export * as math from "./math.js";
```

`normalize` remains private. The namespace export is named `math`; the star export contributes the module namespace, while `export * from "./math.js"` would forward named exports except `default`.

## 3. Conditional feature loading

```js
export async function openEditor(enabled) {
  if (!enabled) return null;
  const editor = await import("./editor.js");
  return editor.default();
}
```

No request occurs on the false branch. On the true branch, awaiting the dynamic-import promise propagates load/link/evaluation rejection to the caller.

## 4. Cycle diagnosis

```js
// a.js
import { readB } from "./b.js";
console.log(readB());
export const ready = "initialized";
```

```js
// b.js
import { ready } from "./a.js";
export function readB() { return ready; }
```

The graph can link because both export names exist. Evaluation of `a.js` calls `readB()` before the `const ready` declaration has initialized; reading the live imported binding then throws a `ReferenceError`. One repair is to remove the eager call and invoke the function after graph evaluation, or move shared initialization into an acyclic module that both can import.

## 5. JSON module request

```js
import settings from "./settings.json" with { type: "json" };
console.log(settings.theme);
```

The host must support the `type` import attribute and JSON module loading. ECMAScript standardizes the request metadata, while supported keys and resource loading depend on the host/runtime.

# Tests and edge cases

- Assigning to an imported binding is an error in module code.
- A missing named export fails during linking rather than becoming an ordinary undefined local.
- `export *` does not forward `default`; use an explicit default re-export if needed.
- A default expression and a default alias can have different later values.
- A star re-export collision can make a name ambiguous; export the intended binding explicitly.
- A dynamic import returns a promise; handle rejection at the call boundary.
- A cycle can succeed when functions are called after initialization, but fail on an early lexical-binding read.
- JSON import attributes are host-sensitive; avoid assuming one runtime's policy applies to all.
- Host resolution differs by environment; do not infer package/path rules from ECMAScript syntax alone.

# Reflection questions

Answers follow each question.

1. **Which local names in your public API should remain private?** Keep implementation details private when callers do not need them; expose the smallest stable surface that supports intended use.
2. **Where is a live imported binding useful, and when is a snapshot preferable?** A live binding is useful for shared module state and functions; a snapshot is appropriate when consumers need an immutable historical value, which can be made explicit by exporting/copying that value at a defined time.
3. **What work belongs to linking, and what work belongs to evaluation?** Linking resolves import/export relationships and initializes module environments; evaluation runs module bodies and their side effects.
4. **Which dependencies actually need dynamic loading?** Dependencies used only on a conditional, rare, or deferred path may be dynamically imported; ordinary required dependencies are clearer as static imports.
5. **Which module behaviors are specified by ECMAScript and which by your host?** ECMAScript defines module records, syntax, linking, evaluation, and host hooks; the host defines resolution/fetching and supported attributes and supplies metadata properties.

# Sources

- [ECMAScript 2026 modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [ECMAScript 2026 module namespace objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [WHATWG HTML module loading](https://html.spec.whatwg.org/multipage/webappapis.html)
- [Node.js ECMAScript modules](https://nodejs.org/api/esm.html)
