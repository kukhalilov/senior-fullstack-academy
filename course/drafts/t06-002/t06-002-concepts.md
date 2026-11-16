<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript values and types — Core concepts and how they fit together

# Learning objectives

Name the eight ECMAScript language types; distinguish primitives from objects and value equality from identity; interpret `typeof` without its common traps; explain Number, BigInt, Symbol, nullish values, and wrapper objects; and separate language values from specification-only machinery.

# Prerequisites

Know variables, assignment, expressions, strict equality, and basic objects. A **value** is the result of an expression. A **binding** is a named location whose current value can change. A language type describes the kind of value, not an unchanging property of the variable name.

# Core concepts

## The eight language types

ECMAScript values have one of eight language types: Undefined, Null, Boolean, String, Symbol, Number, BigInt, or Object. The first seven are primitive types; Object is the category for identity-bearing objects, including arrays, functions, dates, and regular expressions. “Function” is not a ninth language type: callable functions are objects with callable behavior.

The type of a binding can change as values are assigned:

```js
let result = 5;        // Number value
result = "complete";   // String value
```

JavaScript is dynamically typed because values are checked as the program runs; a variable declaration does not permanently assign a type to the binding.

## Primitives and objects: value versus identity

Primitive values are immutable, and equality follows the rules for their type. Symbols are primitive values for which unique identity is significant. Objects have identity and may be mutable; assignment copies the reference value, so two bindings can point to one object:

```js
const left = { score: 4 };
const right = left;
right.score = 9;
console.log(left.score); // 9
console.log(left === right); // true: same object identity
```

Creating a second object with identical contents does not create the same identity. Strict equality on objects asks whether both operands refer to the same object, not whether their nested contents match. Deep structural comparison is a separate operation/library/domain rule. Symbol equality likewise distinguishes two freshly created symbols even when their descriptions match; registry lookup can return the same registered symbol for a key.

## Nullish values

`undefined` is the sole value of Undefined; it commonly appears for an uninitialized binding, a missing property, an omitted argument, or a function with no explicit return value. `null` is the sole value of Null and is often used to represent an intentional absence. They are different types and are not strictly equal:

```js
let notAssigned;
const intentionallyEmpty = null;
console.log(notAssigned, intentionallyEmpty); // undefined null
console.log(notAssigned === intentionallyEmpty); // false
```

Direct property access on either nullish value throws `TypeError`. Optional chaining is useful for a chain where null/undefined means “no result,” but it does not turn unrelated invalid values into valid ones. Detailed nullish operators and conversion rules are covered elsewhere.

## Number and BigInt are separate numeric types

Number uses IEEE 754 binary64 floating point. It includes ordinary finite values, `+0`, `-0`, `NaN`, and positive/negative infinity. Some decimal fractions are approximations, and integers beyond the safe range cannot all be represented exactly. `NaN` is still a Number; it is not a separate language type.

BigInt represents integers with arbitrary precision subject to implementation resource limits. It is written with an `n` suffix or created with `BigInt(...)`. Number and BigInt are not interchangeable: most arithmetic operators reject mixed Number/BigInt operands. Convert deliberately and remember that converting a previously rounded Number cannot restore lost integer precision. `BigInt(1.5)` throws `RangeError`; `BigInt(1.0)` is valid because the Number value is integral.

```js
console.log(Number.isNaN(NaN), typeof NaN); // true "number"
console.log(typeof 9n);                     // "bigint"
// console.log(1n + 1);                    // TypeError: mixed numeric types
console.log(1n < 2);                        // true: relational comparison permits mixing
```

This lesson gives the type distinction; detailed coercion, equality, rounding and arithmetic operator rules belong in their own topics.

## Symbols carry identity

`Symbol(description)` creates a new unique primitive symbol on every call. The optional description is for debugging and does not define equality. `Symbol.for(key)` uses the global symbol registry and can return a previously registered symbol for the same key; registered symbols remain symbols, not strings. Symbols are useful for collision-resistant property keys, but hiddenness/security must not be inferred from their use.

```js
const a = Symbol("cache");
const b = Symbol("cache");
console.log(a === b); // false
console.log(Symbol.for("cache") === Symbol.for("cache")); // true
```

## `typeof` is useful but intentionally imperfect

For common values, `typeof` returns labels such as `"number"`, `"bigint"`, `"symbol"`, and `"function"`. Two notable cases:

```js
typeof null;       // "object" (historical compatibility behavior)
typeof (() => {}); // "function" (callable Object, not a separate language type)
```

Use `value === null` to test null. Use `Array.isArray(value)` for arrays; `typeof []` is only `"object"`. In browsers, the legacy `document.all` object has a special `typeof` result of `"undefined"`; do not build application logic around that web-compatibility exception. `typeof undeclaredName` returns `"undefined"`, but reading a lexical name in its temporal dead zone throws (t06-001).

## Wrapper objects are not primitives

`new Number(3)`, `new String("x")`, and `new Boolean(false)` create Object values wrapping primitives. They differ from `3`, `"x"`, and `false`; for example, a Boolean wrapper is truthy even when it wraps false. Avoid explicit wrappers in ordinary application code. Property access on many primitives uses automatic temporary boxing to expose methods, but null and undefined cannot be boxed and direct property access throws.

## Specification types are not program values

The specification also uses abstract types such as Reference, List, Record, and Completion to describe algorithms. They help explain evaluation and abrupt control flow but are not additional JavaScript values constructors can create. A Reference is a semantic mechanism used during evaluation; reading a property value does not expose that Reference as an object.

# Mechanisms and relationships

| Question | Suitable check / model | Limitation |
| --- | --- | --- |
| Is this exactly null? | `value === null` | Does not test undefined |
| Is this an array? | `Array.isArray(value)` | Does not describe element types |
| What broad primitive category is it? | `typeof value` | `null`, callable objects, and `document.all` have caveats |
| Are these two objects the same object? | `left === right` | Does not compare structure |
| Need a large exact integer? | BigInt | Cannot mix in ordinary arithmetic with Number |
| Need a unique property key? | `Symbol()` | Description does not create identity or secrecy |

# Worked examples

```js
const count = 2 ** 53;
console.log(Number.isSafeInteger(count)); // false
console.log(9007199254740993 === 9007199254740992); // true: the first literal rounds

const exact = 9007199254740993n;
console.log(exact === 9007199254740992n); // false
```

The BigInt literal preserves the integer exactly. This does not make converting an already-rounded Number safe:

```js
console.log(BigInt(9007199254740993)); // 9007199254740992n: input Number was rounded first
// BigInt(NaN); // RangeError
```

# Misconceptions and edge cases

- “A variable has one fixed type.” A binding can hold different language types over time.
- “Objects are copied on assignment.” The reference value is copied; both names can refer to the same object.
- “`typeof null` is `null`.” It is the string `"object"`; compare with `=== null`.
- “Functions are a separate language type.” They are callable objects; `typeof` reports `"function"` as a special classification.
- “NaN is not a Number.” It is a Number value; `NaN === NaN` is false.
- “All integers are exact Numbers.” Only integers in the safe range are guaranteed distinguishable; the binary64 format has additional exact integers but not every consecutive one.
- “BigInt accepts fractional Number values and truncates them.” It rejects non-integral Number values with RangeError.
- “BigInt and Number freely mix because both are numeric.” Mixed arithmetic usually throws, though equality and relational operations have their own rules.
- “Symbols with the same description are equal.” Ordinary `Symbol()` calls are unique; `Symbol.for()` is registry-based.
- “A Symbol key makes a property secret.” Symbols are discoverable through reflection APIs; they are not a security boundary.
- “`new Boolean(false)` is falsey.” It is an object and therefore truthy.
- “Reference, List, and Completion are hidden JavaScript types.” They are specification machinery, not source-language values.

# Knowledge checks with answers

1. **How many ECMAScript language types are there?** Eight: seven primitive types plus Object.
2. **What does `typeof null` return?** `"object"`, for historical compatibility.
3. **Why can mutating `right` affect `left` after `right = left`?** Both bindings hold references to the same object identity.
4. **Is `NaN` an object or a type?** It is a special value of Number.
5. **Does `BigInt(1.5)` round or truncate?** Neither; it throws `RangeError` because the Number is not integral.
6. **Do `Symbol("x")` calls compare equal?** No; each produces a distinct symbol.
7. **Is `typeof (() => {})` evidence that Function is a ninth language type?** No; the value is a callable object.
8. **Are wrapper objects primitive values?** No; they are Objects containing or representing primitive values.

# Sources

- [ECMAScript 2026: Data Types and Values](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026: `typeof` operator semantics](https://tc39.es/ecma262/2026/multipage/ecmascript-expressions.html)
- [MDN: JavaScript data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures)
- [MDN: `typeof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
