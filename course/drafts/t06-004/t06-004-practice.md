<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript objects, properties, descriptors, and reflection — Exercises and worked solutions

# Goals

Practice predicting property ownership, key enumeration, descriptor defaults, copy behavior, grouping, prototype lookup, and integrity constraints. In every exercise, identify which exact API rule answers the question instead of treating all object utilities as interchangeable.

# Worked example

```js
const parent = { role: "reader" };
const user = Object.create(parent);
user.name = "Sam";
Object.defineProperty(user, "id", { value: 17, enumerable: true });

console.log("role" in user); // true
console.log(Object.hasOwn(user, "role")); // false
console.log(Object.keys(user)); // ["name", "id"]
console.log(Object.getOwnPropertyDescriptor(user, "id"));
// { value: 17, writable: false, enumerable: true, configurable: false }
```

The prototype supplies `role`, but the object does not own it. `Object.keys` only lists own enumerable string properties. The descriptor omitted writable and configurable, so those default to false on a new property.

# Exercises

Predict every result before reading the hints. Use modern ECMAScript.

## Exercise 1: ownership and enumeration

```js
const symbol = Symbol("s");
const parent = { inherited: 1 };
const item = Object.create(parent);
item.visible = 2;
Object.defineProperty(item, "hidden", { value: 3 });
item[symbol] = 4;

console.log(Object.keys(item));
console.log(Object.getOwnPropertyNames(item));
console.log(Object.getOwnPropertySymbols(item));
console.log("inherited" in item, Object.hasOwn(item, "inherited"));
```

## Exercise 2: descriptor transitions

```js
const settings = {};
Object.defineProperty(settings, "mode", { value: "safe", configurable: true });
Object.defineProperty(settings, "mode", { writable: true });
settings.mode = "fast";
Object.defineProperty(settings, "mode", { configurable: false });
Object.defineProperty(settings, "mode", { writable: false });
console.log(settings.mode, Object.getOwnPropertyDescriptor(settings, "mode"));
```

Does each definition preserve fields it omits? Which later redefinition would throw?

## Exercise 3: getter and copying

```js
let reads = 0;
const source = {
  get current() { reads++; return reads; },
};
const assigned = Object.assign({}, source);
const spread = { ...source };
const descriptor = Object.getOwnPropertyDescriptor(source, "current");
console.log(assigned.current, spread.current, reads, typeof descriptor.get);
```

How many times does the getter run? Which destination, if any, retains a getter?

## Exercise 4: assign versus spread destination behavior

```js
const source = { value: 5 };
const target = {
  set value(next) { this.seen = next; },
};
Object.assign(target, source);
const spread = { ...target, ...source };
console.log(target.seen, Object.hasOwn(target, "value"));
console.log(Object.getOwnPropertyDescriptor(spread, "value"));
```

## Exercise 5: `__proto__` as untrusted data

```js
const source = JSON.parse('{"__proto__":{"admin":true}}');
const assigned = Object.assign({}, source);
const spread = { ...source };
console.log(Object.hasOwn(assigned, "__proto__"));
console.log(Object.getPrototypeOf(assigned).admin);
console.log(Object.hasOwn(spread, "__proto__"), Object.getPrototypeOf(spread) === Object.prototype);
```

In this particular example the JSON value for `__proto__` is an object, so the inherited legacy setter changes `assigned`'s prototype. The legacy setter ignores primitive values other than `null`; it does not turn every `__proto__` value into a prototype. `JSON.parse` creates an own data property and does not itself change the parsed object's prototype.

Explain the different target-write mechanisms. Why should this example make you careful with merge code?

## Exercise 6: grouping and key conversion

```js
const special = Symbol("special");
const result = Object.groupBy([1, 2, 3], n => n === 3 ? special : "small");
console.log(Object.getPrototypeOf(result));
console.log(result.small, result[special]);
console.log(Object.keys(result));
```

What is the prototype, and why does `Object.keys` omit one group?

## Exercise 7: integrity levels

```js
const child = { score: 1 };
const parent = { inherited: true };
const value = Object.create(parent);
value.child = child;
Object.seal(value);
value.child = { score: 2 };
value.newKey = 3;
delete value.child;
value.child.score = 9;
console.log(value.child.score, Object.hasOwn(value, "newKey"), Object.isSealed(value));
```

Assume non-strict script code. Which operations succeed, fail silently, or remain possible?

# Progressive hints

1. **Exercise 1:** Split own/inherited first, then enumerable/non-enumerable, then string/Symbol.
2. **Exercise 2:** On a redefinition, absent descriptor fields preserve their current settings; changing writable from true to false is permitted.
3. **Exercise 3:** Assign and spread both read enumerable own values. Descriptor inspection reports the getter without reading its value.
4. **Exercise 4:** Assign uses target set semantics; object spread creates a new data property on the new literal.
5. **Exercise 5:** `Object.assign` invokes a property setter if one exists on the target's prototype; object spread defines own data properties.
6. **Exercise 6:** A Symbol remains a Symbol key and is excluded by string-only `Object.keys`.
7. **Exercise 7:** Seal prevents extension and makes own properties non-configurable; it does not disable writes to writable data properties or freeze nested objects.

# Complete solutions

## Solution 1

The results are `["visible", "symbol"]`, `["visible", "hidden"]`, `[Symbol(s)]`, and `true false`. The inherited key is visible to `in` but not owned by `item`. The hidden property is own but non-enumerable. The Symbol is own and enumerable, but the string-only listing methods omit it.

## Solution 2

The final value is `"fast"`. Each partial descriptor preserves unspecified attributes for an existing property. The first definition made `mode` non-writable, non-enumerable, and configurable. The second made it writable while retaining configurability and non-enumerability. The assignment changes its value. Next it is made non-configurable and then non-writable, which is an allowed one-way transition. A later attempt to make it writable or configurable, change its value, or delete it would throw in `Object.defineProperty` (or fail according to the operation's semantics).

The final descriptor is approximately `{ value: "fast", writable: false, enumerable: false, configurable: false }`.

## Solution 3

The getter runs twice: once when assign reads it and once when spread reads it. `assigned.current` is `1`; `spread.current` is `2`; `reads` is `2`; and `typeof descriptor.get` is `"function"`. Both copies contain data values. The descriptor returned for `source.current` describes the original getter without invoking it.

## Solution 4

The first line is `5 false`: assign triggers the target's setter, which stores `5` in `seen`, and the setter does not create an own `value`. During spread, `target` contributes its enumerable own `seen` value; `source` contributes `value`. The new literal receives a writable, enumerable, configurable data property `value` with value `5`.

## Solution 5

The results are `false`, `true`, and `true true`. `JSON.parse` preserves `__proto__` as an own data property on `source`. Assign writes that object value to an ordinary empty object's inherited legacy `__proto__` setter, changing the target's prototype; the target does not gain an own `__proto__` property. Spread creates an own data property named `__proto__`, leaving the new object's prototype as `Object.prototype`. For a primitive `__proto__` value, the legacy setter ignores the value (except `null`, which sets the prototype to null). This demonstrates a prototype-pollution hazard in merges; robust code should validate keys and choose safe destination/write semantics rather than blindly assigning untrusted records.

## Solution 6

The first result is `null`. The values are `[1, 2]` and `[3]`. `Object.keys(result)` returns only `["small"]` because it lists string keys, not the Symbol group key. The callback's Symbol result is preserved as a property key.

## Solution 7

`value.child = { score: 2 }` succeeds because the existing own property is still writable. `value.newKey = 3` fails silently because this is non-strict code and the object is non-extensible. Deleting `child` fails silently because it is non-configurable. Mutating the nested object still works, so the final line is `9 false true`.

# Tests and edge cases

These assertions verify key distinctions without changing built-in prototypes:

```js
import assert from "node:assert/strict";

const dict = Object.create(null);
dict.answer = 42;
assert.equal(Object.hasOwn(dict, "answer"), true);
assert.equal("hasOwnProperty" in dict, false);

assert.equal(Object.is(NaN, NaN), true);
assert.equal(Object.is(0, -0), false);
assert.equal(Object.isExtensible(Object.preventExtensions({})), false);

const groups = Object.groupBy(["a", "b"], x => x);
assert.equal(Object.getPrototypeOf(groups), null);
```

In strict code, failed assignment or deletion generally throws rather than failing silently. `Object.defineProperty` reports incompatible descriptor changes with `TypeError`. Proxies can intercept many reflection calls, but proxy invariants constrain the lies they can report.

# Reflection questions

1. Which key-selection dimensions matter for the reflection method you use most often?
2. Are you copying values, descriptors, or the prototype relationship?
3. Could reading a source getter or writing a destination setter run application code?
4. Does the integrity operation you chose protect nested references too?
5. Could an untrusted key such as `__proto__` reach a setter on the destination?

# Sources

- [ECMAScript 2026 Object and descriptor operations](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [ECMAScript 2026 ordinary object behavior](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [MDN: Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [MDN: Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)
- [MDN: Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
