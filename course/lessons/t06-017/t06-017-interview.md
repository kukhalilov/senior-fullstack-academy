
# JavaScript this binding and Function object methods — Interview questions and reasoning

# Core questions

1. What determines `this` in an ordinary function call?
2. How do strict and non-strict ordinary functions treat `undefined`, `null`, and primitive receivers?
3. How do arrows differ from ordinary functions for `this`?
4. Compare `call`, `apply`, and `bind`.
5. Can a bound function be constructed? What changes when it is called with `new`?
6. What does `new.target` report, and how does `super.method()` choose its receiver?
7. What do `name`, `length`, and `.prototype` tell you?
8. Is `Function.prototype.toString()` a reliable way to inspect or serialize source?
9. What does the `Function` constructor create, and what scope can that function access?

# Concise interview answers

1. **Ordinary `this` is call-site based.** A property-reference call such as `obj.method()` supplies `obj`; a plain `fn()` call supplies `undefined` before the function's this mode is applied.
2. **Strict functions preserve the receiver exactly.** Non-strict ordinary functions substitute the global this value for nullish receivers and box primitives.
3. **Arrows have lexical `this`.** They do not create a receiver, so call/apply/bind cannot replace it.
4. **Call and apply invoke now; bind returns a wrapper.** Call takes positional arguments; apply uses an array-like collection; bind remembers a receiver and leading arguments.
5. **A bound function can construct if its target can.** `new` ignores bound `thisArg`, retains preset arguments, and creates an instance through the target's construction behavior.
6. **`new.target` is absent on ordinary calls and records construction.** `super.method()` starts lookup at the method's home-object prototype but supplies the current `this` to the found method.
7. **Name and length are descriptive metadata.** A constructor's own `.prototype` supplies the initial prototype for instances; it is distinct from `Function.prototype`.
8. **No.** Source may be unavailable, and native representations are implementation-defined. It is not a safe serializer or evaluator.
9. **It dynamically parses parameter and body strings into an ordinary function.** The result uses its realm's global environment rather than closing over the caller's locals, is non-strict unless its body has a strict directive, and may be blocked by host policy.

# Deep follow-up answers

## Why is `this` not lexical for an ordinary method?

The function receives a receiver argument from the call operation. The property reference retains a base object until the call, which lets one function be reused with multiple receivers. Inheritance does not change this: `child.method()` can find the function on a prototype while still supplying `child`. Extracting the value removes that reference, so later plain invocation has no object receiver.

## What exactly does strictness affect?

`call` and `apply` pass their first receiver argument through unchanged. The ordinary target's function mode determines what its body observes. A strict function keeps null, undefined, and primitives. A non-strict ordinary function substitutes its global this value for nullish values and applies `ToObject` to primitives. Arrows and bound functions have their own receiver rules that prevent a newly supplied receiver from taking over.

## How does `bind` interact with construction and metadata?

Bind creates an exotic function object that retains the target, bound receiver, and prefix arguments. Its length is based on the target's length minus the number of prefix arguments, with a floor of zero; its name receives a `bound ` prefix. It lacks an own `.prototype`, but when its target has construction behavior, the bound function can be constructed. During construction, the newly initialized receiver is used and the saved receiver is ignored. `instanceof` delegates through the bound target.

## What is special about `super`?

The method's home object establishes where a `super` property lookup starts. The property access still uses the current receiver when invoking a method. This is why an inherited base implementation can read state from the most-derived object. `super()` in a derived constructor is different: it invokes the parent constructor and initializes the derived receiver under class-construction rules.

## Why are function properties not contracts?

The length property is typical expected parameter count, not a call limit; defaults, rest parameters, and bind affect it. The name is descriptive and has no semantic significance. A constructor's prototype property is mutable and supplies a prototype for new instances, but constructor identity and `instanceof` behavior can be changed by custom hooks or prototype changes. These properties help inspection but should not define authorization or validation.

## When might `Reflect.apply` be preferable?

Use it when the target function is a value selected at runtime and you already have an array-like argument list: `Reflect.apply(target, receiver, args)`. It makes the target explicit, whereas `target.apply(receiver, args)` looks up an `apply` property on that target and can be affected by an overridden property. `Reflect.apply` requires an object for its argument list; `Function.prototype.apply` uniquely treats null/undefined as an empty list.

# Scenario questions

1. A UI framework calls a method as a callback and `this` becomes undefined. What is the smallest clear fix? **Answer:** pass `obj.method.bind(obj)` or wrap it as `(...args) => obj.method(...args)`; choose according to whether a stable receiver or a clear call-through is preferable.
2. A callback inside a class method should retain the instance. Which choice is natural? **Answer:** an arrow callback captures the surrounding method's `this`; alternatively bind once if a reusable callback value is needed.
3. A utility calls `fn.apply(context, values)` and the target still sees another receiver. What should be checked? **Answer:** whether the target is an arrow, a bound function, or non-strict; an arrow/bound target ignores the new receiver, while a sloppy ordinary target performs nullish substitution/primitive boxing.
4. A bound constructor works with `new` even though `Object.hasOwn(Bound, "prototype")` is false. Is that contradictory? **Answer:** no. An own `.prototype` property is not the internal constructibility test; bound construction delegates to its target.
5. A library checks a function name to decide whether it is trusted. What is wrong? **Answer:** names are descriptive and mutable only under property descriptor constraints, may be inferred or transformed, and are not an identity/security mechanism.

# Tradeoffs and alternatives

- **Arrow callback:** concise lexical capture; can obscure that a callback is tied to the current instance and is not constructible.
- **Bound callback:** explicit stable receiver and partial arguments; creates a wrapper and does not allow later receiver replacement.
- **Wrapper function:** makes argument adaptation and receiver choice visible; adds a layer and can affect stack/debug display.
- **Explicit parameter:** avoids hidden receiver dependence; can be more verbose but is often easiest to test.
- **`call` / `apply`:** useful for one-time dynamic invocation; direct syntax and spread may be clearer when no dynamic function selection is needed.

# Common weak answers

- “`this` is always the object that contains the method.” It depends on the call expression, and the function may be inherited or extracted.
- “Arrow `this` is the object where it is stored.” Arrows capture lexical `this` from surrounding code.
- “`call` converts `thisArg`.” It passes the value through; a sloppy ordinary target later substitutes/boxes.
- “`bind` is the same as `call`.” Call invokes immediately; bind returns a new function.
- “Bound functions cannot be constructors because there is no `.prototype`.” Constructibility and own prototype property are distinct.
- “Function length is how many arguments it accepts.” It is descriptive metadata only.
- “`toString()` lets you reliably recover code.” Hosts may withhold source; native output is implementation-defined.
- “The `Function` constructor captures local variables like a function expression.” It uses the realm's global environment and dynamically compiles strings; use a closure for lexical capture.
- “Use `.caller` to debug call stacks.” It is legacy/non-standard and not portable.

# Self-check rubric

Score each item from 0 (cannot explain) to 2 (can explain and predict a fresh example):

| Skill | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Identify method versus detached call | Confuses them | Correct with help | Predicts receiver independently |
| Apply strict/sloppy rules | Reverses or omits rules | Knows nullish case | Also handles primitive boxing and module/class strictness |
| Explain arrows and binding | Treats arrow as dynamic | Knows lexical capture | Traces outer method call and bind limitations |
| Explain bound construction | Thinks `.prototype` decides constructibility | Knows `new` ignores bound this | Also explains args and `instanceof` delegation |
| Distinguish function properties | Conflates prototypes/metadata | Separates most | Explains limitations and legacy status accurately |

Aim for 8/10 or higher, and retry any item scored 0 using a written call trace.

# Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 Function objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [MDN: Function.prototype.caller](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/caller)
