<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript values and types — Interview questions and reasoning

## Core questions

1. What are ECMAScript's eight language types?
2. How do primitive values differ from Object values?
3. What does `typeof` classify, and what are its notable exceptions?
4. Why can two object literals with identical fields compare unequal?
5. How do Number and BigInt differ in representation and operator compatibility?
6. What makes Symbols unique, and how does `Symbol.for` differ?
7. What is the difference between `null` and `undefined`?
8. How are wrapper objects different from primitives?
9. Are Reference, List, Record, and Completion JavaScript language types?

## Concise interview answers

1. Undefined, Null, Boolean, String, Symbol, Number, BigInt, and Object.
2. Primitives are immutable values; Objects have identity and may be mutable. Assigning an Object copies its reference value, allowing aliases.
3. It provides broad string labels. `typeof null` is `"object"`; functions return `"function"`; `document.all` has a legacy browser exception. It is not a full schema validator.
4. `===` compares Object identity, not nested structure. Two allocations are different identities.
5. Number is binary64 and can round. BigInt represents arbitrary-precision integers. Most mixed numeric arithmetic throws, so conversions must be explicit and deliberate.
6. `Symbol()` always creates a fresh unique primitive. `Symbol.for(key)` uses a shared registry and can reuse a symbol by key; description text alone does not define identity.
7. They are distinct primitive types. Undefined often means missing/uninitialized; null often means intentional absence. `typeof null` is still `"object"` for compatibility.
8. A wrapper such as `new Number(1)` is an Object, not a Number primitive. Even `new Boolean(false)` is truthy.
9. No. They are specification abstractions used to describe algorithms and intermediate evaluation state.

## Deep follow-up answers

**Does “dynamically typed” mean values have no types?** No. Each value has a language type; a binding can be reassigned to values of different types, and operators inspect runtime values.

**What does passing an object to a function copy?** The argument receives the reference value, not a deep clone. The caller and callee can refer to the same identity and observe mutations.

**Why is Number not suitable for every integer?** It uses IEEE 754 binary64. At increasing magnitudes the representable values become more widely spaced, so not every consecutive integer has a distinct exact Number representation. BigInt is appropriate when exact large integers are required.

**Can `BigInt(1.5)` truncate?** No. A Number passed to BigInt conversion must be finite and integral; a fractional Number or NaN/infinity causes RangeError. Also, if a Number was rounded before conversion, BigInt preserves that rounded integer.

**Are Symbols secret keys?** No. Symbols reduce accidental string-key collisions, but reflective APIs can discover symbol properties. They are not access control.

## Scenario questions

1. An API checks `typeof value === "object"` and accepts null. Explain the result and give a safer null/object check.
2. A developer compares two parsed objects with `===` and expects equal JSON structure. Explain identity and suggest a domain-appropriate comparison.
3. A financial or identifier calculation loses an integer after converting to BigInt. Determine whether the Number was already rounded.
4. A condition using `new Boolean(false)` takes the true branch. Explain object truthiness.
5. A cache expects a symbol key to be private. Explain how symbols help and what security boundary they do not provide.

## Tradeoffs and alternatives

`typeof` is useful for quick primitive classification but should be combined with `=== null`, `Array.isArray`, or domain-specific checks. Number is convenient for general arithmetic and fractional values, while BigInt provides exact large integer arithmetic with operator interoperability constraints. Primitive values are simple and immutable; objects support structure, mutation, and identity. Explicit wrappers rarely improve application code and add coercion surprises. Choose based on invariants and validation needs, not a superficial type label.

## Common weak answers

- “JavaScript has a `function` type.” The language type is Object; `typeof` gives callable objects a special label.
- “`typeof null` is `null`.” It is `"object"`.
- “Two objects with the same fields are equal with `===`.” Strict equality compares identity.
- “`NaN` is not a Number.” It is a Number value.
- “BigInt automatically makes Number input exact.” It cannot restore precision already lost, and non-integral Number conversion throws.
- “Same Symbol description means same key.” `Symbol()` values remain distinct.
- “A Symbol key is private.” It is reflectable and not a security boundary.
- “`new Boolean(false)` converts to false.” The wrapper is an Object and is truthy.
- “Reference is another JavaScript primitive.” It is specification machinery.

## Self-check rubric

Score 0 (missing), 1 (partly correct), or 2 (clear and accurate): eight types; primitive/object identity; dynamic binding versus value type; `typeof` exceptions; Number precision; BigInt conversion/mixing; Symbol identity; null versus undefined; wrappers; specification-only types. Strong answers score at least 16/20 and describe at least two concrete edge cases accurately.

## Sources

- [ECMAScript 2026: Data Types and Values](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026: `typeof` operator semantics](https://tc39.es/ecma262/2026/multipage/ecmascript-expressions.html)
- [MDN: JavaScript data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures)
- [MDN: `typeof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
