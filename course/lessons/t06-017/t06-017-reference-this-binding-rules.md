
# JavaScript this binding and Function object methods — Reference: this values and call-site binding modes

# Scope and version

This reference explains the ten supplied receiver and call-context terms for ECMAScript 2026. It focuses on how ordinary calls select `this`, then contrasts arrows, bound functions, construction, `new.target`, and `super`. Class construction details belong to the class lesson. See [ECMAScript functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html) and [MDN: `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).

# How this group fits the mental model

An ordinary function receives a value supplied by its call or construction operation. Its strictness determines whether the received value is preserved or transformed. Arrows instead use a lexical binding. Bound functions carry a previously selected receiver for calls, while construction has its own receiver rules. Keep property lookup separate from the receiver passed to the function.

# Supplied names explained

- `Global this value` — This is the realm's global this value, normally exposed through `globalThis` (browser hosts may expose a `WindowProxy`). A non-strict ordinary function uses it when its call supplies `undefined` or `null`. This is different from top-level `this`: a classic script's top-level `this` is the global this value, while a module's top-level `this` is `undefined`.
- `Strict-mode this value` — A strict ordinary function preserves the call's receiver exactly, including `undefined`, `null`, and primitive values. Module code and class bodies are strict automatically; a strict directive also makes an eligible function body strict.
- `Method-call this value` — For a call that evaluates a property reference such as `obj.method()`, the base object `obj` is passed as receiver. The method need not be an own property: if inherited, the object used for the call is still the receiver. `obj.method?.()` preserves the receiver when the optional call proceeds.
- `Detached-call this value` — Once the function value is extracted, `fn()` is a plain call and supplies `undefined`. A strict function sees `undefined`; a non-strict ordinary function substitutes its realm's global this value. Assignment/extraction—not the function's original home—causes detachment.
- `Explicit this argument` — `call(thisArg, ...)` and `apply(thisArg, args)` pass the supplied value as the target's receiver. They do not coerce it first. Target strictness still matters; arrows and already-bound functions ignore the attempted replacement.
- `Bound this value` — `bind(thisArg, ...prefixArgs)` returns a new callable that remembers a receiver and prepends arguments. Rebinding an already-bound function cannot change its saved receiver. During construction, bound `thisArg` is ignored, but prefix arguments remain.
- `Lexical this` — An arrow function has no own `this`; lookup resolves to the surrounding lexical `this` binding. Neither method-call syntax nor `call`, `apply`, or `bind` gives it a new receiver. A callback arrow inside a method commonly preserves that method call's receiver.
- `Constructor-call this value` — For an ordinary constructible function called with `new`, an instance receiver is created using the constructor's `prototype` when it is an object, otherwise `%Object.prototype%`; that receiver is used as `this`. Returning an object explicitly replaces it; returning a primitive does not. Derived classes have additional `super()` rules and are covered in the class lesson.
- `new.target` — This meta-property is `undefined` in an ordinary call and identifies the active construction target during `new` or `Reflect.construct`. An arrow does not create a new `new.target` binding, so it can see an enclosing constructor's value. A bound constructor forwards construction and arguments; its bound receiver is not used.
- `super property reference` — In a method with a home object, `super.name` begins property lookup at the prototype of that home object, but a call such as `super.name()` uses the current `this` as receiver. `super` is not a variable holding a parent object. In a derived constructor, `super()` initializes `this`; `super.property` is a separate property access form.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Method-call this value` vs `Detached-call this value` | A property-reference call supplies its base; a plain function call supplies `undefined` before strictness rules apply. |
| `Strict-mode this value` vs `Global this value` | Strictness preserves nullish/primitive receiver values; sloppy ordinary calls substitute global this for nullish receiver values and box primitives. |
| `Explicit this argument` vs `Bound this value` | `call`/`apply` invoke once; `bind` creates a reusable function with a fixed receiver and optional argument prefix. |
| `Lexical this` vs dynamic method receiver | Arrow `this` comes from surrounding scope; ordinary method `this` comes from each invocation. |
| `Constructor-call this value` vs `super property reference` | Construction establishes a new receiver; `super` chooses a lookup base but methods still receive the current receiver. |

# Examples

```js
"use strict";
const base = { value: "base", get() { return this.value; } };
const child = Object.create(base);
child.value = "child";
console.log(child.get()); // "child": inherited method, child receiver
const get = child.get;
// get(); // TypeError: strict function receives undefined
console.log(get.call({ value: "explicit" })); // "explicit"

function Box(value) { this.value = value; }
const PrefilledBox = Box.bind({ ignored: true }, 7);
console.log(new PrefilledBox().value); // 7
```

```js
class Parent {
  read() { return this.value; }
}
class Child extends Parent {
  value = 12;
  readViaSuper() { return super.read(); }
}
new Child().readViaSuper(); // 12: super chooses lookup base, receiver is Child instance
```

# Common mistakes

- Saying `this` points to “the object that owns the function.” It points to the receiver supplied by this invocation.
- Assuming any property access makes a method receiver; a later plain call after extraction does not.
- Treating `globalThis`, script top-level `this`, module top-level `this`, and sloppy detached-call substitution as interchangeable.
- Assuming `call`/`apply` coerce before invoking. They pass the requested value; target ordinary-function mode handles substitution.
- Trying to use `bind` to override an arrow or an already-bound function.
- Assuming `super.method()` passes the parent prototype as `this`.
- Assuming bound `thisArg` survives `new`.

# Knowledge checks with answers

1. **An inherited method is called as `child.read()`. What is `this`?** `child`, the base of the call reference.
2. **What receiver does `call(null)` pass to a strict target?** `null` exactly.
3. **What receiver does a sloppy ordinary function observe after a plain call?** Its global this value, after nullish substitution.
4. **Can `arrow.call(obj)` make `obj` the arrow's `this`?** No; arrows use lexical `this`.
5. **In `super.read()`, what does the home object affect?** Where lookup begins; the current `this` remains the method receiver.

# Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [MDN: `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
