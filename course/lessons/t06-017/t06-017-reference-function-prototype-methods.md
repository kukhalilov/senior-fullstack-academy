
# JavaScript this binding and Function object methods — Reference: Function.prototype methods and function classification behavior

# Scope and version

This reference covers the six supplied Function methods and function-classification behavior in ECMAScript 2026. It explains immediate calls, bound calls, source display, default `instanceof` behavior, and the callable fallback used by object stringification. These are callable-object operations, not a substitute for understanding the call's receiver. See [ECMAScript Function objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html).

# How this group fits the mental model

`call` and `apply` invoke now; `bind` creates a new callable for later. Each has special interactions with strictness, arrows, bound functions, and constructors. `toString` reports source when available. The `Symbol.hasInstance` hook supports `instanceof`. Object stringification uses a built-in callable-object fallback tag, but `Function.prototype` does not define its own `Symbol.toStringTag` property.

# Supplied names explained

- `Reflect.apply` — Related invocation alternative with the same basic role as `Function.prototype.apply`: it calls a chosen target with an explicit receiver and an array-like argument list. Unlike the method form, the target is an explicit first argument, so it works cleanly when the function itself is selected dynamically; its argument-list value must be an object.
- `Function.prototype.apply` — Calls its receiver function with a chosen `thisArg` and an array-like object of arguments; it need not be an Array. `null` or `undefined` for the collection means no arguments. Other values must be objects accepted by the array-like conversion; a non-null primitive such as a string is not accepted by the specification algorithm. The function must be callable or a `TypeError` is thrown. The requested `thisArg` passes through unchanged, then a non-strict ordinary target may substitute/box it. Arrows and bound targets ignore the new receiver.
- `Function.prototype.bind` — Requires a callable target and returns a bound-function exotic object holding the target, receiver, and leading arguments. Further calls append their arguments. Its `length` is derived from target length minus the number of preset arguments, floored at zero; its name is prefixed with `bound `. It has no own `prototype` property, but is constructible when its target is constructible. When constructed, bound `thisArg` is ignored; bound arguments remain. Rebinding cannot replace an existing bound receiver.
- `Function.prototype.call` — Calls its receiver function immediately, passing the first argument as `thisArg` and the remaining arguments positionally. It rejects a non-callable receiver. It does not pre-coerce `thisArg`; strictness and function kind determine what the target observes.
- `Function.prototype.toString` — For a callable with source text available, returns that source text. For built-ins and callables without available source, returns a native-function-style representation whose exact text is implementation-defined. It throws for a non-callable receiver. Do not use it to serialize, parse, evaluate, or compare function behavior; whitespace/source preservation and host availability make those uses unreliable.
- `Function.prototype[Symbol.hasInstance]` — The default `instanceof` hook, called as `Constructor[Symbol.hasInstance](value)`. Its ordinary behavior checks whether the constructor's prototype occurs in the value's prototype chain, with special cases such as bound functions delegating to their target. Custom functions may provide their own hook. The built-in method is non-writable and non-configurable.
- `Function tag fallback in Object.prototype.toString` — `Object.prototype.toString` first consults an object's `Symbol.toStringTag`; if that is not a string, it uses a built-in fallback. For a callable object, the fallback label is `"Function"`, so an ordinary function typically becomes `[object Function]`. `Function.prototype` itself has no `Symbol.toStringTag` property. A user-defined string tag can override the fallback, so this is not a secure type check.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Function.prototype.call` vs `Function.prototype.apply` | Both invoke immediately with an explicit receiver; `call` takes positional arguments while `apply` reads them from an array-like object. |
| `Function.prototype.apply` vs `Reflect.apply` | Both invoke a target with a chosen receiver and array-like arguments; `Reflect.apply` makes the target an explicit argument and does not special-case null/undefined argument lists. |
| `Function.prototype.bind` vs `Function.prototype.call` | Bind creates a reusable wrapper; call performs one immediate invocation. |
| `Function.prototype.bind` vs `Function.prototype.apply` | Bind stores arguments and receiver for later; apply supplies both for one invocation. |
| `Function.prototype.toString` vs `Function tag fallback in Object.prototype.toString` | The former returns source/native-style text for a callable; the latter labels a callable when object stringification has no string tag override. |
| `Function.prototype[Symbol.hasInstance]` vs `Function tag fallback in Object.prototype.toString` | The former affects `instanceof`; the latter is only a label used for object stringification. |

# Examples

```js
function total(a, b) { return this.base + a + b; }
const context = { base: 10 };
total.call(context, 2, 3);       // 15
total.apply(context, [2, 3]);   // 15
const withBase = total.bind(context, 2);
withBase(3);                    // 15
```

An array-like argument source need not be an array:

```js
function pair(a, b) { return [a, b]; }
pair.apply(null, { 0: "A", 1: "B", length: 2 }); // ["A", "B"]
```

# Common mistakes

- Assuming `apply` requires an Array or iterates an arbitrary iterable. Its argument is array-like; use spread for iterable expansion.
- Assuming `Reflect.apply` has `Function.prototype.apply`'s null/undefined argument-list special case; Reflect requires an array-like object.
- Assuming `call`/`apply` can override lexical arrow `this` or an existing bound function's receiver.
- Treating `bind` as mutation of the original function.
- Assuming a bound function is not constructible because it has no own `prototype` property.
- Comparing `Function.prototype.toString()` outputs as a stable source identity.
- Treating `instanceof` as a universal class/type test; custom `Symbol.hasInstance`, prototype mutation, cross-realm values, and primitives affect results.
- Treating `[object Function]` as an unforgeable security signal.

# Knowledge checks with answers

1. **When should you choose `apply` over `call`?** When arguments are already in an array-like collection; actual iterable spreading may instead use `fn.call(receiver, ...iterable)`.
2. **Can a bound constructor be used with `new`?** If its target is constructible, yes; construction ignores bound `thisArg` but keeps bound arguments.
3. **Does `toString()` always reveal exact source?** No; the host may withhold source and native representations are implementation-defined.
4. **What does the default `Symbol.hasInstance` hook do?** It performs ordinary instance checking for `instanceof`.
5. **Does `Function.prototype` define `Symbol.toStringTag`?** No. `Object.prototype.toString` has a callable-object fallback label of `Function`, and objects can override it with their own string tag.

# Sources

- [ECMAScript 2026 Function objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [MDN: Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
