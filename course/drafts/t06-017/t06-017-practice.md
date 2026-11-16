<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript this binding and Function object methods — Exercises and worked solutions

# Goals

Practice tracing the actual function call, then predicting receiver and arguments. You will distinguish method calls, detached callbacks, explicit calls, bound functions, arrows, and construction without relying on guesswork.

# Worked example

```js
"use strict";
const user = {
  name: "Amina",
  label(prefix) { return `${prefix}: ${this.name}`; },
};
const callback = user.label;
const bound = user.label.bind(user, "User");

console.log(user.label("Owner")); // Owner: Amina
// callback("Owner"); // TypeError: this is undefined
console.log(callback.call({ name: "Ravi" }, "Guest")); // Guest: Ravi
console.log(bound()); // User: Amina
```

First identify the invoked function. `user.label()` retains the property reference, so `user` is supplied. `callback()` does not. `call` supplies a receiver for this invocation. `bind` creates a new function that keeps a receiver and a leading argument.

# Exercises

For each exercise, predict the output or error before reading the hints. Assume modern ECMAScript, and follow any strict directive shown.

## Exercise 1: inherited method and detachment

```js
"use strict";
const proto = { read() { return this.value; } };
const item = Object.create(proto);
item.value = 5;
const read = item.read;
console.log(item.read());
console.log(read.call({ value: 8 }));
```

What are the two outputs? Why does the method being inherited not change the first receiver?

## Exercise 2: strict and non-strict explicit receivers

Run this snippet as a classic script with no enclosing strict directive or module wrapper, so `sloppy` is genuinely non-strict.

```js
function sloppy() { return this; }
function strict() { "use strict"; return this; }
console.log(strict.call(null));
console.log(strict.call(3));
console.log(sloppy.call(null) === globalThis);
console.log(typeof sloppy.call(3));
```

Predict each result. Explain which layer performs substitution or boxing.

## Exercise 3: arrow and method receiver

```js
const tool = {
  value: 2,
  makeReader() {
    return () => this.value;
  },
};
const reader = tool.makeReader();
console.log(reader.call({ value: 9 }));
console.log(tool.makeReader.call({ value: 7 })());
```

Why can the first `call` not set the arrow's receiver, while the second call changes what the arrow captures?

## Exercise 4: bind composition and length

```js
function describe(a, b, c) { return [this.tag, a, b, c]; }
const first = describe.bind({ tag: "fixed" }, 1);
const second = first.bind({ tag: "ignored" }, 2);
console.log(second(3));
console.log(first.length, second.length, second.name);
```

Predict the returned array and metadata. Which bind call determines the receiver?

## Exercise 5: bound constructor

```js
function Ticket(code, owner) {
  this.code = code;
  this.owner = owner;
}
const OwnedTicket = Ticket.bind({ code: "ignored" }, "A7");
const ticket = new OwnedTicket("Mina");
console.log(ticket.code, ticket.owner);
console.log(ticket instanceof Ticket, ticket instanceof OwnedTicket);
console.log(Object.hasOwn(OwnedTicket, "prototype"));
```

Predict all three lines and explain why constructibility and an own `.prototype` property are separate.

## Exercise 6: `super` lookup and receiver

```js
const base = {
  read() { return `${this.kind}:${this.value}`; },
};
const middle = {
  __proto__: base,
  read() { return super.read(); },
};
const leaf = Object.create(middle);
leaf.kind = "leaf";
leaf.value = 11;
console.log(leaf.read());
```

What does `super` determine here? What supplies the receiver to `base.read`?

## Exercise 7: method reference versus function value

```js
const source = {
  value: "source",
  get() { return this.value; },
};
console.log((source.get)());
console.log(source.get?.());
const { get } = source;
console.log(get.call({ value: "other" }));
```

Assume the file is an ES module. Predict the results and explain which expression retains the property reference.

# Progressive hints

1. **Exercise 1:** The first expression is still `item.read()`, even though lookup walks to the prototype.
2. **Exercise 2:** `call` passes its first value unchanged. Strict target preserves it; sloppy ordinary target substitutes/boxes on entry.
3. **Exercise 3:** The arrow captures `this` from `makeReader`; set the method receiver before creating the arrow.
4. **Exercise 4:** A second bind cannot replace an existing bound receiver. Count prefixed arguments to compute remaining lengths.
5. **Exercise 5:** `new` creates the receiver; a bound constructor forwards construction and leading args to its target.
6. **Exercise 6:** `super.read` starts lookup after the method's home object. The original call `leaf.read()` supplies `leaf`.
7. **Exercise 7:** Parentheses preserve a reference. Optional call proceeds as a property call; destructuring extracts a function value.

# Complete solutions

## Solution 1

The outputs are `5` and `8`. `item.read()` resolves the inherited function but the call reference's base is still `item`, so `this` is `item`. `read` is detached; `read.call({ value: 8 })` explicitly supplies a different receiver.

## Solution 2

The outputs are `null`, `3`, `true`, and `"object"`. `call` passes `null` and `3` unchanged. The strict function returns those exact values. The sloppy function substitutes `globalThis` for null; the primitive number is converted to its Number wrapper object, so `typeof` returns `"object"`.

## Solution 3

The outputs are `2` and `7`. `reader` is an arrow whose lexical `this` was captured when `tool.makeReader()` ran, so `reader.call(...)` cannot replace it. In the second line, `makeReader.call({ value: 7 })` sets the ordinary method's receiver before it creates the arrow; that arrow captures the supplied object.

## Solution 4

The result is `["fixed", 1, 2, 3]`. The first bind fixes the receiver. The second bind cannot replace it, and its argument `2` follows the first bound argument `1`. `first.length` is `2`; `second.length` is `1`; `second.name` is typically `"bound bound describe"`. Length and name are descriptive metadata.

## Solution 5

The first line is `A7 Mina`. The `new` operation ignores `{ code: "ignored" }` as receiver and creates a new instance; the preset code and call-time owner are passed to `Ticket`. Both `instanceof` checks are `true`: the bound function's instance behavior delegates to `Ticket`. The last result is `false`; a bound function object does not have an own `prototype` property even though it can construct by delegating to a constructible target.

## Solution 6

The result is `leaf:11`. The `super` reference starts lookup from the prototype of `middle`, where `base.read` is found. Its receiver remains `leaf`, supplied by the original `leaf.read()` call. Lookup base and receiver are separate.

## Solution 7

The results are `"source"`, `"source"`, and `"other"`. Parenthesizing `source.get` preserves the property reference, so the first call remains a method call. Optional call `source.get?.()` also retains the base when the function exists. Destructuring stores the function value without the original base; the explicit `call` supplies a new receiver.

# Tests and edge cases

Use a small runtime check to verify expectations without mutating built-in prototypes:

```js
import assert from "node:assert/strict";

function strictThis() { "use strict"; return this; }
assert.equal(strictThis.call(null), null);
assert.equal(strictThis.call(3), 3);

function C(value) { this.value = value; }
const BoundC = C.bind(null, 4);
const value = new BoundC();
assert.equal(value.value, 4);
assert.ok(value instanceof C);
assert.equal(Object.hasOwn(BoundC, "prototype"), false);
```

When testing sloppy this substitution, place the sloppy function in a classic script or otherwise ensure it is not inside a module/class/strict scope. A module's surrounding strictness affects function code defined within it. Do not use `Function.prototype.caller` to inspect who called a function; that property is legacy, non-standard, and may throw.

# Reflection questions

1. Which call site in your own code passes a method as a callback and might lose its receiver?
2. Would an arrow or a bound function make that callback's intended dependency clearer?
3. Which metadata can help debug the function, and why should it not control program correctness?
4. How would a bound constructor surprise someone who assumes no `.prototype` means “cannot use with new”?

# Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 Function objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [MDN: Function.prototype.caller](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/caller)
