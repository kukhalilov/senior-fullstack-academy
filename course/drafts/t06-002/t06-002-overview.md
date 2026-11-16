<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript values and types — Big-picture orientation and mental model

# Problem and purpose

Every expression evaluates to a value, and the value's language type determines which operations make sense, how comparisons behave, and whether the value carries identity. JavaScript's dynamic typing means a binding can refer to values of different types over time; it does not mean the values themselves are untyped.

# Plain-language mental model

There are eight ECMAScript language types: seven primitive types and Object. Primitive values are immutable, though equality follows type-specific rules: Symbols are primitive values whose identity matters. An object is also a value with identity and may be mutable; multiple variables can refer to the same object, so a mutation through one reference is visible through another.

Think of `typeof` as a quick label, not a complete type system. Its historical result for `null`, and its special result for callable objects, are easy to misread. For application decisions, use precise checks such as `value === null`, `Array.isArray(value)`, or an explicit domain-specific predicate.

# How the parts fit together

1. An expression produces a value from one of the language types.
2. A binding stores a reference to a value; reassigning the binding and mutating an object are different operations.
3. Primitive values compare by their type-specific value rules; objects compare by identity under strict equality.
4. Number and BigInt are distinct numeric types with different ranges and operator compatibility.
5. Symbols are unique primitive keys; descriptions help debugging but do not define identity.
6. Conversion, equality, and individual built-in APIs have separate rules, studied in their dedicated lessons.

# Concept map

| Type | Primitive? | Example | `typeof` result |
| --- | --- | --- | --- |
| Undefined | Yes | `undefined` | `"undefined"` |
| Null | Yes | `null` | `"object"` (legacy result) |
| Boolean | Yes | `true` | `"boolean"` |
| String | Yes | `"hi"` | `"string"` |
| Symbol | Yes | `Symbol("id")` | `"symbol"` |
| Number | Yes | `42`, `NaN`, `Infinity` | `"number"` |
| BigInt | Yes | `42n` | `"bigint"` |
| Object | No | `{}`, `[]`, function | `"object"` or `"function"` for callable objects |

# End-to-end walkthrough

```js
const original = { count: 1 };
const alias = original;
alias.count += 1;
console.log(original.count); // 2: same object identity

const firstKey = Symbol("record");
const secondKey = Symbol("record");
console.log(firstKey === secondKey); // false: descriptions are not identity
```

Assignment copies the object reference value into `alias`; it does not clone the object. Each `Symbol()` call creates a distinct symbol even when the description text matches.

# When to use it and tradeoffs

Use primitive values for simple immutable data and object values when structured, mutable, or identity-bearing data is needed. Use Number for general floating-point arithmetic and BigInt when integer magnitude must exceed the safe Number range without rounding, while keeping each operation within one numeric type. Prefer explicit validation over `typeof` alone when shapes or domain constraints matter.

# What later lessons cover

The concepts lesson builds the value/identity model and relates it to Number, BigInt, Symbol, `typeof`, and wrappers. The reference lesson covers the eight language types. Practice traces identity, special numeric values, symbols, and classification. The interview guide emphasizes pitfalls and precise comparisons.

# Sources

- [ECMAScript 2026: Data Types and Values](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026: `typeof` operator semantics](https://tc39.es/ecma262/2026/multipage/ecmascript-expressions.html)
- [MDN: JavaScript data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures)
- [MDN: `typeof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
