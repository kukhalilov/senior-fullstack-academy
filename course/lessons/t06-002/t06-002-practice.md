
# JavaScript values and types — Exercises and worked solutions

# Goals

Classify the eight language types; distinguish values, bindings, and object identities; interpret `typeof`; reason about Number/BigInt boundaries and Symbol identity; and identify wrapper and nullish-value traps.

# Worked example

```js
const first = { score: 10 };
const second = first;
second.score += 2;
console.log(first.score, first === second); // 12 true
```

The assignment copies the object reference value. Both bindings refer to the same object, so mutation through `second` is observable through `first`.

# Exercises

Predict each output first. Each snippet is independent unless specified.

## Exercise 1: broad type classification

```js
console.log(
  typeof undefined,
  typeof null,
  typeof NaN,
  typeof 2n,
  typeof Symbol("id"),
  typeof [],
  typeof (() => {}),
);
```

Explain why the results for null and a function are special.

## Exercise 2: identity versus matching shape

```js
const a = { id: 1 };
const b = { id: 1 };
const c = a;
console.log(a === b, a === c);
```

What does strict equality compare here?

## Exercise 3: Number precision

```js
console.log(9007199254740993 === 9007199254740992);
console.log(Number.isSafeInteger(2 ** 53));
console.log(Object.is(-0, 0));
```

Why does the first comparison surprise people? Why is the second result different from `Number.isInteger(2 ** 53)`?

## Exercise 4: BigInt conversion boundaries

```js
console.log(BigInt(12), BigInt("12"));
try { BigInt(12.5); } catch (error) { console.log(error.name); }
console.log(BigInt(9007199254740993));
```

Which conversion throws, and why can the final value differ from the written decimal integer?

## Exercise 5: mixed numeric operators

```js
console.log(2n < 3, 2n === 2);
try { console.log(2n + 2); } catch (error) { console.log(error.name); }
console.log(2n + "2");
```

Why do relational comparison and addition have different outcomes?

## Exercise 6: Symbol descriptions and registry

```js
const x = Symbol("token");
const y = Symbol("token");
const first = Symbol.for("shared");
const second = Symbol.for("shared");
console.log(x === y, first === second, Symbol.keyFor(first));
```

Which pair shares identity? Does the description of `x` make it a secret?

## Exercise 7: wrapper objects

```js
const primitive = false;
const wrapper = new Boolean(false);
console.log(typeof primitive, typeof wrapper, Boolean(wrapper));
```

Why is the last result not false?

## Exercise 8: nullish values and property access

```js
const missing = undefined;
const empty = null;
console.log(missing === empty, missing == empty);
console.log(empty?.name);
try { console.log(empty.name); } catch (error) { console.log(error.name); }
```

Which equality operator treats them alike here? What does optional chaining suppress?

## Exercise 9: language types versus specification vocabulary

Is `Reference` one of the eight language types? Can application code create a Completion Record with a constructor? Explain what those terms describe.

# Progressive hints

1. **Exercise 1:** `typeof` reports a special legacy result for null and a callable classification for functions.
2. **Exercise 2:** Object contents are not compared by `===`.
3. **Exercise 3:** Number uses binary64 and cannot distinguish every consecutive integer at large magnitudes.
4. **Exercise 4:** `BigInt` accepts Number only when the Number is finite and integral; a Number may already be rounded.
5. **Exercise 5:** `+` can concatenate after primitive conversion when a string is present; numeric arithmetic does not mix Number and BigInt.
6. **Exercise 6:** Fresh `Symbol()` values differ; the registry reuses a registered value for a key.
7. **Exercise 7:** Objects are truthy even if their wrapped primitive is false.
8. **Exercise 8:** Nullish equality is a special loose-equality case; optional chaining short-circuits on null/undefined.
9. **Exercise 9:** The spec uses abstract semantic types to describe evaluation algorithms.

# Complete solutions

## Solution 1

The values are `"undefined"`, `"object"`, `"number"`, `"bigint"`, `"symbol"`, `"object"`, and `"function"`. `typeof null` is a historical compatibility result. A function is still an Object language value, but `typeof` has a dedicated result for callable objects.

## Solution 2

It prints `false true`. `a` and `b` are separate object allocations with matching contents, so they have different identities. `c` receives the reference to the same object as `a`.

## Solution 3

The first result is `true` because the first Number literal rounds to the same binary64 value as the second. The safe-integer result is `false`: `2 ** 53` is an integer-valued Number, but it is outside the range where all consecutive integers are exactly distinguishable. `Object.is(-0, 0)` is false because it distinguishes signed zero; `===` would treat them as equal.

## Solution 4

The first line prints `12n 12n`. `BigInt(12.5)` throws `RangeError` because a Number-to-BigInt conversion requires a finite integral Number. The final conversion prints `9007199254740992n`: the input Number was rounded before `BigInt` received it.

## Solution 5

The first line prints `true false`. Relational comparison defines a mixed Number/BigInt comparison. Strict equality does not equate values of different types. `2n + 2` throws `TypeError` because arithmetic addition does not implicitly combine the numeric types. `2n + "2"` yields the string `"22"`: addition performs string concatenation when primitive conversion produces a String operand.

## Solution 6

The output is `false true shared`. Each `Symbol("token")` creates a fresh unique value; `Symbol.for("shared")` returns the same registered symbol for that key. A description is visible diagnostic text and creates no confidentiality or security property.

## Solution 7

It prints `boolean object true`. `wrapper` is an Object, and every object is truthy. Its wrapped false value does not determine the object's Boolean conversion.

## Solution 8

The strict comparison is false; loose equality is true for the null/undefined pair. Optional chaining produces undefined without trying to read `name` from null. Direct `empty.name` throws `TypeError`.

## Solution 9

No. `Reference`, List, Record, and Completion are specification types used to describe algorithm steps, intermediate references, and normal/abrupt control flow. Ordinary JavaScript values cannot construct or inspect them directly.

# Tests and edge cases

```js
import assert from "node:assert/strict";

assert.equal(typeof null, "object");
assert.equal(typeof (() => {}), "function");
assert.equal(Number.isSafeInteger(2 ** 53), false);
assert.equal(Symbol("x") === Symbol("x"), false);
assert.equal(Symbol.for("x") === Symbol.for("x"), true);
assert.throws(() => BigInt(1.5), RangeError);
assert.equal(BigInt(9007199254740993), 9007199254740992n);
assert.equal(Boolean(new Boolean(false)), true);
```

Avoid relying on the result for `typeof document.all` outside browsers: it is a legacy host-object exception, not an ordinary Object rule.

# Reflection questions

1. Does the code need a broad type label or a stronger shape/domain check?
2. Are two values equal by content, by primitive value, or by object identity?
3. Could Number rounding change the integer the application intended to store?
4. Is a BigInt conversion performed before or after a lossy Number calculation?
5. Is a Symbol being used for collision avoidance, and is anyone mistakenly treating it as secret?

# Reflection answers

1. Use `typeof` for broad primitive classification, then add checks such as `value === null`, `Array.isArray(value)`, or a domain-specific predicate when the shape matters.
2. Primitive values compare according to their type's equality rules; separately allocated objects compare by identity under `===`, even if their contents match.
3. Yes. Number cannot represent every large consecutive integer exactly; validate with `Number.isSafeInteger` or use BigInt before precision is lost.
4. Convert before any Number operation that may round. Converting afterward preserves only the already-rounded integer value.
5. Symbols help avoid accidental key collisions, but symbol-keyed properties can be discovered through reflection. A Symbol is not a secrecy or access-control mechanism.

# Sources

- [ECMAScript 2026: Data Types and Values](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026: `typeof` operator semantics](https://tc39.es/ecma262/2026/multipage/ecmascript-expressions.html)
- [MDN: JavaScript data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures)
- [MDN: `typeof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
