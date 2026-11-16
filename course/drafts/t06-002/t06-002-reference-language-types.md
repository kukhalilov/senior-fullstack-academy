<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript values and types — Reference: ECMAScript language types

# Scope and version

This reference explains the eight supplied ECMAScript language types in the 2026 edition. It covers their broad value/identity characteristics and common classification traps; it does not attempt to catalogue every conversion, comparison, or built-in method. See [ECMAScript data types and values](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html), [ECMAScript `typeof`](https://tc39.es/ecma262/2026/multipage/ecmascript-expressions.html), and [MDN data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures).

# How this group fits the mental model

The language type belongs to the value currently held by an expression. A variable binding can later hold a value of another type. Primitive values are immutable; equality follows type-specific rules, with Symbol identity being a notable primitive case. Objects are identity-bearing values. Operators and APIs add more specific behavior, so a broad type label should not be mistaken for complete validation.

# Supplied names explained

- `Undefined` — A primitive type with the single value `undefined`. Common sources include an uninitialized `var`, a missing property lookup, an omitted argument, an explicit `undefined`, or an ordinary function that falls off its body. These origins are distinct program states even though the resulting value is the same.
- `Null` — A primitive type with the single value `null`, often used to represent an intentional absence. It is distinct from undefined. `typeof null` returns `"object"` for historical compatibility; test it with `value === null`.
- `Boolean` — A primitive type with exactly `true` and `false`. Explicit Boolean wrapper objects such as `new Boolean(false)` are Objects and are truthy, so they should not be confused with Boolean primitives.
- `String` — A primitive immutable sequence of UTF-16 code units, commonly used as text. A string's `.length` counts code units rather than Unicode grapheme clusters; visual characters can contain multiple code points/code units. `new String(text)` creates an Object wrapper rather than a String primitive.
- `Symbol` — A primitive value used notably as a property key. Each `Symbol(description)` call creates a unique value even when descriptions match. `Symbol.for(key)` consults the global symbol registry and can return the same registered symbol for a key; `Symbol.keyFor` can retrieve a registered key. A description is diagnostic and is not identity or a secrecy boundary.
- `Number` — A primitive IEEE 754 binary64 value. Besides ordinary finite values it includes positive and negative zero, `NaN`, and positive/negative infinity. Number arithmetic can round; only every integer in the safe integer range is guaranteed exactly and consecutively distinguishable. `typeof NaN` is `"number"`.
- `BigInt` — A primitive integer value with arbitrary precision subject to practical resource limits. Literals use an `n` suffix, such as `123n`, or use the `BigInt` function. Number/BigInt mixed arithmetic is generally rejected. Converting a Number requires a finite integral Number and cannot recover precision that the Number had already lost.
- `Object` — The language type for identity-bearing objects, including ordinary objects, arrays, functions, boxed primitives, and built-in objects. Objects may be mutable. `typeof` usually returns `"object"`, but callable objects return `"function"`; host-specific legacy objects can have additional exceptions.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Number` vs `BigInt` | Binary64 floating-point numeric values (with special values and rounding) versus arbitrary-precision integer values; mixed arithmetic has restrictions. |
| `Null` vs `Undefined` | Both represent absence-like states, but they are distinct values/types and have different conventions/origins. |
| Primitive vs `Object` | Primitive values are immutable with type-specific equality (including Symbol identity); objects have identity and may be mutable. |
| `Symbol()` vs `Symbol.for()` | Fresh unique symbol each call versus a registry lookup that can return an existing symbol for a key. |

# Examples

```js
const kinds = [
  undefined, null, true, "text", Symbol("k"), 2, 2n, {}, () => {},
].map(value => typeof value);
console.log(kinds);
// ["undefined", "object", "boolean", "string", "symbol", "number", "bigint", "object", "function"]
```

The second result is the `typeof null` legacy case. The final result is a callable-object classification, not a ninth language type.

```js
const objectA = { x: 1 };
const objectB = { x: 1 };
const alias = objectA;
console.log(objectA === objectB, objectA === alias); // false true
```

The first two objects have the same property contents but different identities. `alias` and `objectA` refer to one object.

# Common mistakes

- Treating `typeof` as an exhaustive schema validator.
- Forgetting `typeof null` is `"object"` or using `typeof` to test null.
- Treating `NaN` or infinity as a separate language type.
- Assuming a primitive wrapper object is a primitive.
- Assuming object strict equality performs deep comparison.
- Assuming the same Symbol description means equal symbols.
- Assuming every string index/length unit equals one displayed character.
- Treating Number and BigInt as interchangeable or converting a rounded Number to recover its intended integer.
- Treating specification-only types as values the application can create.

# Knowledge checks with answers

1. **Which language type contains functions?** Object; functions have callable behavior and receive the special `typeof` label `"function"`.
2. **Does `typeof null` return `"null"`?** No, it returns `"object"`.
3. **Can `Object(3)` and `3` be the same language type?** No. The first is a Number wrapper Object; the second is a Number primitive.
4. **Does a Symbol description determine equality?** No.
5. **What does strict equality compare for two objects?** Whether they refer to the same object identity.
6. **Can every integer be represented exactly by Number?** No; binary64 spacing grows with magnitude.

# Sources

- [ECMAScript 2026: Data Types and Values](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026: `typeof` operator semantics](https://tc39.es/ecma262/2026/multipage/ecmascript-expressions.html)
- [MDN: JavaScript data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures)
- [MDN: `typeof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
