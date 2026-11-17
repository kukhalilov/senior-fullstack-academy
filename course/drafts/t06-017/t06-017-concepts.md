<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript this binding and Function object methods — Core concepts and how they fit together

# Learning objectives

After this lesson, you can trace the receiver of an ordinary call, explain strict and non-strict behavior, distinguish dynamic `this` from lexical `this`, predict `call`/`apply`/`bind` and `new`, explain `new.target` and `super` receiver behavior, and interpret important Function properties without treating metadata as a guarantee.

# Prerequisites

You should recognize function values, object properties, method calls, strict mode, prototypes, and constructor calls with `new`. A receiver is the object or value used as `this` during a call. A property reference is an expression such as `obj.method` that still records the base object `obj` until the call is evaluated.

# Core concepts

## The call expression supplies the ordinary receiver

```js
function who() { return this; }
const left = { who };
const right = { who };
left.who() === left;  // true
right.who() === right; // true
```

The function object is identical in both calls. The receiver comes from the reference used at the call site. An inherited method also receives the actual object on which it was accessed, not necessarily the object where the method was originally defined.

```js
const read = left.who;
read(); // plain call; supplies undefined before function this-mode rules apply
```

Parentheses around a property reference generally preserve that reference: `(left.who)()` still calls with `left`. Assigning to a variable or passing the value as an ordinary callback usually removes the object reference. Optional call syntax also matters: `left.who?.()` calls with `left` if the method is non-nullish; it does not detach the method.

## Function strictness changes what an ordinary function receives

The call operation passes its `thisArgument`; it does not first coerce it. On entry, a strict ordinary function keeps it exactly: `undefined`, `null`, and primitives stay as supplied. A non-strict ordinary function substitutes the global this value for `undefined` or `null`, and wraps primitive values in their object wrappers. This conversion is sometimes called this substitution.

Modules and class code are strict. A classic script can contain non-strict functions unless strict mode is enabled. A script's top-level `this`, a module's top-level `this`, and the `this` used by a sloppy function invoked plainly are different questions. In browsers, classic script top-level `this` is generally the global object; module top-level `this` is `undefined`. Do not infer a function's receiver from top-level behavior.

## Arrows and methods have different receiver rules

An arrow function has no own `this` binding. Its `this` resolves from the surrounding lexical environment. `call`, `apply`, and `bind` cannot replace it. An ordinary concise method has dynamic `this`, just like other ordinary functions, but method syntax does not make it constructible with `new`.

```js
const counter = {
  value: 2,
  later() {
    const arrow = () => this.value;
    return arrow();
  },
};
counter.later(); // 2
counter.later.call({ value: 8 }); // 8: later's receiver changes; arrow captures it
```

An arrow created at top level captures the surrounding top-level `this`; it does not capture an object merely because it is stored as that object's property.

## Explicit calls and binding

`call` invokes now with positional arguments. `apply` invokes now with arguments collected from an array-like object (or no arguments for null/undefined). Both pass the receiver value through; a strict target preserves it, while a non-strict ordinary target applies its own substitution. Neither can override an arrow's lexical receiver or an existing bound function's receiver.

`bind` returns a new bound function. It fixes the target and receiver and prepends supplied arguments. Further binding cannot replace an already-bound receiver, although arguments from successive binds are concatenated in call order. If the target is constructible, the bound function is constructible; when invoked with `new`, the bound receiver is ignored and bound arguments remain. A bound function has no own `prototype` property, but can still be constructible. `instanceof` on a bound function follows the target's instance behavior.

## Construction, `new.target`, and `super`

For a base constructor called with `new`, JavaScript creates the receiver using the constructor's `prototype` property (falling back to `%Object.prototype%` if that value is not an object), binds it as `this`, runs the body, then returns the receiver unless the constructor explicitly returns an object. Returning a primitive does not replace a base instance. Derived class construction has additional `super()` initialization rules; those are detailed in the class lesson.

`new.target` is `undefined` for an ordinary call and identifies the constructor used for construction. An arrow does not create its own `new.target`; it resolves an enclosing one. `super.property` uses the method's home object to choose where property lookup starts, while a call such as `super.read()` supplies the current `this` as the receiver. Thus lookup origin and call receiver are separate.

## Function properties describe different layers

`Function.prototype` is the shared intrinsic prototype object in the function prototype chain. It is callable and returns `undefined`, but cannot be constructed. Ordinary constructible functions have an own `fn.prototype` used as the initial prototype for instances. Generator and async-generator functions also have a `prototype` property, but cannot be constructed; bound constructors are constructible without an own property.

`length` is an informational typical parameter count, adjusted by default/rest parameter rules and by `bind`; functions can still be called with any number of arguments. `name` is descriptive and does not identify a function semantically. Both are non-writable, non-enumerable, configurable on ordinary function instances. Function source text is not a portable serialization format: hosts may withhold it, and native/built-in forms are implementation-defined.

# Mechanisms and relationships

| Call form | Receiver before target's own rules | Important result |
| --- | --- | --- |
| `obj.fn()` | `obj` | Ordinary dynamic receiver |
| `fn()` | `undefined` | Strict keeps it; sloppy substitutes global this |
| `fn.call(x, a)` | `x` | Immediate call with positional args |
| `fn.apply(x, args)` | `x` | Immediate call with array-like args |
| `fn.bind(x, a)` then call | fixed `x` | New callable, `a` prepended |
| `new Fn(a)` | newly initialized instance | Constructor receiver; `new.target` set |
| `arrow()` | lexical outer `this` | Call syntax receiver ignored |

The same spelling `this` is evaluated by the current function's kind and call path. First identify the function object actually invoked. Then classify its kind (ordinary, arrow, bound, constructor). Finally inspect the invocation form.

# Worked examples

```js
function describe() { return [this, arguments.length]; }
const obj = { describe };
obj.describe(1); // [obj, 1]
const copy = obj.describe;
copy.call("x", 1, 2); // in a strict function, ["x", 2]; sloppy wraps "x"

function pair(a, b) { return [this.label, a, b]; }
const bound = pair.bind({ label: "saved" }, 10);
bound(20); // ["saved", 10, 20]
bound.call({ label: "ignored" }, 30); // ["saved", 10, 30]
```

The second example shows that a later `call` can choose arguments but cannot replace a bound receiver.

# Misconceptions and edge cases

- “A method permanently belongs to its object.” A method is a function value; the call reference supplies the receiver each time.
- “`call` converts the receiver.” It passes it through. Non-strict ordinary-function entry performs substitutions.
- “`bind` changes the original function.” It returns a distinct bound callable.
- “An arrow stored on an object uses that object as `this`.” Storage location does not create a lexical receiver.
- “A bound function cannot be a constructor because it lacks `.prototype`.” Constructibility is separate from an own `prototype` property.
- “`fn.length` enforces arity.” It is metadata only.
- “`fn.toString()` safely serializes code.” It returns source only when available and otherwise a native-style implementation-defined string.
- “`super.method()` uses the parent object as `this`.” It uses the parent for lookup; the current receiver is passed to the method.
- Legacy `.caller` and `.arguments` are not portable introspection tools; strict code prohibits access and the standardized inherited accessors throw.

# Knowledge checks with answers

1. **Why can one function return different `this` values?** The ordinary function's call-site reference supplies the receiver.
2. **What does strictness change?** Whether an ordinary function preserves the supplied receiver or substitutes nullish values and boxes primitives.
3. **Can `bind` set an arrow's receiver?** No; the arrow has lexical `this`.
4. **Does constructing a bound constructor use its bound receiver?** No. Construction creates its receiver, but bound arguments still apply.
5. **What is the difference between `Function.prototype` and `Fn.prototype`?** The former is shared in function inheritance; an ordinary constructor's own `.prototype` is used for its new instances. Generator functions have a prototype for their iterator objects without being constructors, and bound constructors can lack an own prototype.
6. **Does `.length` cap accepted arguments?** No.

# Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 Function objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [MDN: Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
