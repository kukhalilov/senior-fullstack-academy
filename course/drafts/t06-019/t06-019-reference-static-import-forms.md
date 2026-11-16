<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# ECMAScript modules, imports, exports, and module loading semantics — Reference: Static imports and import attributes

# Scope and version

This reference covers all supplied static import forms and the current `with` attribute syntax in ECMAScript 2026. Import attributes are part of the module request, while their meaning/support is host-defined. See [ECMAScript module syntax and loading](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html), [ECMAScript expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html), and [HTML module loading](https://html.spec.whatwg.org/multipage/webappapis.html).

# How this group fits the mental model

Static imports declare dependency edges and local imported bindings before the importing module body evaluates. They are not conditional statements. The local names are read-only live bindings. Import forms decide which exports are connected; the host interprets the specifier and supported attributes to load the requested module.

# Supplied names explained

- `Import declaration` — Top-level `import` syntax that requests a module and optionally binds its exports. The declaration is processed during module loading/linking, before normal body evaluation.
- `Side-effect import` — `import "./setup.js";` requests and evaluates a module without creating local bindings. Use it for intentional module initialization effects; dependency cycles still apply.
- `Default import` — `import value from "./module.js";` binds the module's `default` export to local `value`. The local binding is read-only and live with respect to the exported binding.
- `Named import` — `import { parse } from "./module.js";` binds a specifically named export. If the module does not provide that export, linking fails.
- `Namespace import` — `import * as api from "./module.js";` binds the module namespace exotic object, whose exported names are read as properties.
- `Combined default and namespace import` — `import main, * as api from "./module.js";` binds the default export and a namespace object in one declaration.
- `Combined default and named import` — `import main, { parse } from "./module.js";` binds both the default export and selected named exports.
- `Import alias` — `import { parse as parseInput } from "./module.js";` gives an imported export a different local name. The alias still refers to the same live read-only imported binding.
- `Import attributes clause (with)` — Adds key/string-value metadata to a static module request, for example `with { type: "json" }`. The standardized syntax is `with`; `assert { ... }` is historical. Hosts specify supported attribute keys, and unsupported attributes fail loading/linking consistently as a syntax-related module error.
- `JSON module type attribute` — `with { type: "json" }` identifies a JSON module request. The ES2026 host hook requires a JSON parse module record for such a request when loading succeeds. Browser/Node policies normally require the attribute, and JSON modules expose a default value rather than named exports; test the intended host/runtime.

# Cross-item comparison

| Form | Local binding? | Use when |
| --- | --- | --- |
| Side-effect | No | Evaluation itself is intentional |
| Default | One default binding | Module has one primary exported value |
| Named | Selected bindings | Consumer depends on specific exports |
| Namespace | One namespace object | Consumer uses several exports or wants the module boundary visible |
| Combined | Default plus named/namespace | Both forms are genuinely used |

# Examples

```js
import "./register.js";
import config, { createClient as makeClient } from "./client.js";
import * as math from "./math.js";

const client = makeClient(config);
console.log(math.total([client.value]));
```

```js
import settings from "./settings.json" with { type: "json" };
console.log(settings.theme);
```

The JSON form is standards syntax; an environment must support JSON modules and the specified attribute for it to load successfully.

# Common mistakes

- Placing a static import inside a condition, function, or block; use `import()` for conditional loading.
- Treating an imported name as a variable the importer can assign.
- Assuming a named import is a copied property value rather than a live binding.
- Importing a name not exported by the target and expecting a runtime `undefined`; static linking rejects a missing export.
- Forgetting that `import * as api` creates a namespace object, not a default export.
- Using `assert { type: "json" }` in current-standard examples; the standardized syntax is `with`.
- Assuming every host supports the same import attribute keys or JSON-module policy.
- Assuming a relative specifier uses the same lookup behavior in every host.
- Importing JSON names as named exports; the standard JSON module shape provides a default export.

# Knowledge checks with answers

1. **Can static import be conditional?** No; use dynamic `import()` for a conditional request.
2. **What does a side-effect import bind?** Nothing; it requests/evaluates the module for its effects.
3. **Is `import { value }` a writable local copy?** No; it is an immutable imported binding that reflects the export.
4. **What syntax is current for import attributes?** `with { ... }`.
5. **What should you check before relying on a JSON import?** The host's JSON-module and attribute support, plus the expected default-export shape.

# Further reading

- [ECMAScript 2026 static imports and attributes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [ECMAScript 2026 dynamic import expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
- [WHATWG HTML module loading](https://html.spec.whatwg.org/multipage/webappapis.html)
- [Node.js ECMAScript modules](https://nodejs.org/api/esm.html)
