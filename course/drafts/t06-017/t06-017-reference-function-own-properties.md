<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript this binding and Function object methods — Reference: Function object properties

# Scope and version

This reference covers the nine supplied properties in the ECMAScript 2026 inventory, including the legacy `arguments` and `caller` entries. “Own” in this group distinguishes properties found directly on a function from inherited properties. Exact descriptors matter when code inspects or redefines metadata. See [ECMAScript Function objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html) and [MDN: Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function).

# How this group fits the mental model

Functions participate in two prototype relationships: their own `[[Prototype]]` links them to shared Function behavior, while a constructible function's own `.prototype` supplies the starting prototype for its instances. Metadata properties report descriptive information. They do not constrain calls or establish a secure identity.

# Supplied names explained

- `Function.prototype` — The non-writable, non-enumerable, non-configurable property on the global `Function` constructor whose value is the intrinsic Function prototype object (`%Function.prototype%`). It is itself callable and returns `undefined`, but it is not a constructor and has no own `prototype` property. Do not confuse this constructor property with the instance prototype property described below.
- `Function.prototype.constructor` — The initial value is the intrinsic `Function` constructor. It is an ordinary writable, configurable, non-enumerable data property of the Function prototype object. The property name does not mean that every function was created by calling `Function`; function declarations, expressions, methods, and arrows are created by their syntax.
- `Function.prototype.length` — The value is `0`. On the Function prototype object this property is non-writable, non-enumerable, configurable. It reflects the callable object's descriptive length metadata, not a minimum/maximum argument rule.
- `Function.prototype.name` — The value is the empty string. On the Function prototype object it is non-writable, non-enumerable, configurable. Function instance names are also descriptive and may be inferred from context or explicitly named; names have no language-semantic significance.
- `Function.prototype.arguments (legacy)` — The initial `Function.prototype` property is a deprecated poison-pill accessor whose getter and setter throw `TypeError`. Legacy non-strict ordinary function objects may expose implementation-defined own behavior; strict functions prohibit access. Do not inspect it or use it for reflection.
- `Function.prototype.caller (legacy)` — Like `arguments`, the standardized initial inherited property is a poison-pill accessor that throws on get/set. Some engines historically expose implementation-defined behavior for non-strict ordinary functions, but strict functions and several function kinds throw. It is non-standard/deprecated and unsuitable for stack inspection; use platform-supported error stack facilities for diagnostics, with their own portability limits.
- `Function instance length` — For function instances, a non-writable, non-enumerable, configurable numeric metadata property giving the typical expected argument count. Optional parameters after the first default, and rest parameters, do not contribute to the ordinary expected count; bound functions reduce it by preset arguments. Calls may pass fewer or more arguments regardless.
- `Function instance name` — A non-writable, non-enumerable, configurable descriptive string. Inferred names aid debugging but may be empty or transformed (for example, `bind` prefixes `bound `). Renaming/minification/tooling and function syntax can affect display; never use it as semantic identity.
- `Constructor function prototype property` — An own property present on function objects that can be used as constructors. Its initial value is an ordinary object; new instances use that value as their `[[Prototype]]` when it is an object. If replaced with a primitive, construction falls back to `%Object.prototype%`. The property is writable, non-enumerable, non-configurable. Arrows, bound function objects, and ordinary concise methods do not have an own `.prototype`; constructibility must not be inferred merely from the presence or absence of metadata without considering function kind.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Function.prototype` vs `Constructor function prototype property` | The former is the shared prototype object inherited by function objects; the latter is an own constructor property used for created instances. |
| `Function.prototype.length` vs `Function instance length` | The intrinsic prototype function has length 0; each callable has descriptive argument-count metadata. Neither enforces arity. |
| `Function.prototype.name` vs `Function instance name` | The intrinsic prototype's name is empty; individual functions may have inferred or explicit descriptive names. |
| `Function.prototype.arguments (legacy)` vs `Function.prototype.caller (legacy)` | Both inherited poison-pill legacy accessors throw by default; old engine-specific behavior on non-strict functions is not portable. |

# Examples

```js
function add(a, b = 0, ...rest) { return a + b + rest.length; }
console.log(add.length); // 1: count stops before first default/rest parameter
console.log(add(1, 2, 3, 4)); // 4: extra arguments are allowed

const BoundAdd = add.bind(null, 10);
console.log(BoundAdd.length); // 0
console.log(Object.hasOwn(add, "prototype")); // true: ordinary constructible function
console.log(Object.hasOwn((x) => x, "prototype")); // false: arrow is not a constructor
```

The descriptors can be observed without changing anything:

```js
Object.getOwnPropertyDescriptor(add, "length");
// { value: 1, writable: false, enumerable: false, configurable: true }
```

# Common mistakes

- Calling `Function.prototype` and expecting a useful constructed function; it returns `undefined` and cannot be used with `new`.
- Believing `.constructor` reveals how a callable was created or that it is a reliable class check.
- Treating `.length` as runtime arity validation.
- Treating names as stable identifiers or a security boundary.
- Confusing the constructor's `.prototype` property with the constructor object's own prototype-chain link.
- Reading legacy `.caller` or `.arguments`; these are deprecated/non-standard diagnostics and may throw or vary by engine.
- Assuming every function object has a `.prototype` or every object with a `.prototype` is constructible.

# Knowledge checks with answers

1. **What is the difference between `Function.prototype` and `function F() {}.prototype`?** One is shared Function inheritance; the other is the initial instance prototype owned by a constructor.
2. **Can a function accept more arguments than `.length`?** Yes; length is descriptive metadata.
3. **Does the `constructor` property prove which syntax created a function?** No.
4. **What should code expect from the standardized inherited `caller` property?** Access throws through the poison-pill accessor; do not use it.
5. **Does a bound constructor need its own `.prototype` property to be constructible?** No; bound-function construction delegates to a constructible target.

# Sources

- [ECMAScript 2026 Function objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- [MDN: Function.prototype.caller](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/caller)
