<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript coercion, equality, and comparison semantics — Interview questions and reasoning

## Core questions

1. What does coercion mean, and why is it not one global rule?
2. Which ordinary values are falsy, and are empty arrays falsy?
3. How does an object participate in an operation that needs a primitive?
4. What is the difference between `ToNumber` and `ToNumeric`?
5. How do `==` and `===` differ?
6. How do `===`, `Object.is`, and SameValueZero treat `NaN` and signed zero?
7. How does JavaScript compare two strings with `<`?
8. Can a BigInt be relationally compared with a Number?
9. What is the difference between `||` and `??`?
10. Why can `document.all` violate the usual truthiness intuition in browsers?
11. How do fixed-width `ToInt*`/`ToUint*` conversions differ from `ToUint8Clamp`?
12. Why is `document.all == null` true but `null == document.all` false?

## Concise interview answers

1. Coercion is conversion performed explicitly or as part of an operation. Each operator specifies its own conversion path.
2. `undefined`, `null`, false, either zero, `NaN`, `0n`, and the empty string are falsy; ordinary arrays and objects are truthy.
3. The operation requests a primitive conversion. `Symbol.toPrimitive` takes priority; otherwise ordinary conversion methods are tried in a hint-dependent order.
4. `ToNumber` must produce Number and rejects BigInt; `ToNumeric` preserves BigInt and otherwise uses Number conversion.
5. `===` does not convert types. `==` follows an explicit decision tree with nullish, boolean, string, BigInt, and object rules.
6. `===` says NaN differs from itself and signed zeros are equal. `Object.is` says NaN is itself and signed zeros differ. SameValueZero treats NaN as itself and signed zeros as equal.
7. If both primitive values are strings, comparison is lexicographic by UTF-16 code units, not locale or numeric ordering.
8. Yes. Relational comparison supports mixed BigInt/Number values without first rounding BigInt to Number; NaN still makes the result false.
9. `||` falls back for any falsy left value; `??` falls back only for `null` or `undefined`. Both return an operand.
10. Browser `document.all` is a legacy host exotic with `[[IsHTMLDDA]]`, giving it special falsiness, `typeof`, and operand-sensitive loose-equality behavior.
11. The 8/16/32-bit conversions truncate then wrap modulo their width, with signed forms reinterpreting the high bit; `ToUint8Clamp` clamps to 0–255 and rounds ties to even.
12. The `[[IsHTMLDDA]]` exception is checked when that object is the left operand; `null == document.all` follows the other ordering and is false.

## Deep follow-up answers

### Why does `[] == 0` evaluate to true?

Loose equality sees an object and a Number, so it converts the object to a primitive. The Array's ordinary `valueOf()` returns the object; `toString()` returns `""`. The string/Number branch converts the empty string to positive zero, which equals zero. This trace explains the result but does not make loose equality a good general input-validation strategy.

### When is `Object.is` useful?

Use it when the distinction between positive and negative zero matters, or when NaN should compare equal to itself. It still uses object identity and does not recursively compare properties. For ordinary application equality, `===` is usually more familiar.

### Why is `Number(1n)` allowed while `+1n` throws?

The `Number` function has an explicit BigInt conversion case. Unary plus uses Number conversion that rejects BigInt. This lets code opt into a potentially lossy Number conversion while avoiding silent BigInt/Number mixing in that operator.

### Why are relational comparisons involving NaN all false?

The comparison algorithm can yield an unordered result when either numeric value is NaN. Each of `<`, `>`, `<=`, and `>=` maps that result to false. Therefore `<=` is not equivalent to `!(>)` in every case.

## Scenario questions

1. **A configuration value may validly be zero. Which fallback operator should be used?** `??`, assuming only nullish values mean absent.
2. **Two records have identical fields, but `a === b` is false. Why?** They are distinct object identities; strict equality is not structural equality.
3. **A sort compares numeric-looking strings incorrectly. What may be happening?** The comparator may be using string relational comparison; define numeric or locale-aware domain semantics explicitly.
4. **A numeric helper accepts BigInt and Number but uses unary plus internally. What fails?** Unary plus throws for BigInt; the helper must define whether it preserves BigInt, rejects mixed values, or explicitly converts.
5. **A code review proposes `x <= y` → `!(x > y)`. What counterexample should you mention?** If a comparison is unordered due to NaN, the original is false and the negated opposite is true.
6. **A browser feature test sees `document.all` as absent even though it exists. Why?** It is the legacy `[[IsHTMLDDA]]` exception and is falsy/loosely null-like; use explicit DOM checks appropriate to the application instead.

## Tradeoffs and alternatives

| Need | Preferred approach | Reason |
| --- | --- | --- |
| Compare values with ordinary type sensitivity | `===` | No implicit type conversion |
| Compare null and undefined as one absence category | Explicit nullish check or deliberate `== null` | Documents the intended pair; remember browser legacy exception for `== null` |
| Preserve valid falsy configuration values | `??` | Falls back only on nullish values |
| Test NaN/signed-zero sameness | `Object.is` | Exposes SameValue semantics |
| Convert external text into a domain number | Validate then convert at the boundary | Avoids relying on incidental operator coercion |

## Common weak answers

- “JavaScript always converts values to numbers.” Operators request different conversions.
- “Empty objects are falsy.” Ordinary objects are truthy.
- “`==` converts both values to Number.” It uses a branched comparison algorithm.
- “`===` makes NaN equal itself.” It does not.
- “`Object.is` deeply compares objects.” It checks object identity.
- “Two strings are compared by dictionary order.” The rule is UTF-16 code-unit lexicographic order, not locale collation.
- “BigInt and Number can never be mixed.” Relational comparison allows them; many arithmetic operations have different restrictions.
- “`||` and `??` differ only in style.” They differ for every non-nullish falsy value.

## Self-check rubric

Award one point for each skill you can explain aloud and illustrate with a valid example:

- Name falsy values and explain why arrays remain truthy.
- Trace `Symbol.toPrimitive` and ordinary conversion order.
- Distinguish `ToNumber`, `ToNumeric`, `Number()`, and unary plus around BigInt.
- Explain the main `==` conversion branches without claiming both operands always become Numbers.
- Compare `===`, SameValue/`Object.is`, and SameValueZero for NaN, signed zero, and objects.
- Predict string, Number, mixed BigInt/Number, and NaN relational results.
- Choose `||` or `??` according to whether falsy values are valid.
- Explain the browser-only `document.all` legacy behavior accurately.

Seven or eight points indicates strong readiness; use the relevant reference lesson to revisit any missing distinction.

## Sources

- [ECMAScript 2026 type conversion abstract operations](https://tc39.es/ecma262/2026/multipage/abstract-operations.html)
- [ECMAScript 2026 data types and equality algorithms](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026 browser legacy features](https://tc39.es/ecma262/2026/multipage/additional-ecmascript-features-for-web-browsers.html)
- [ECMAScript 2026 expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
- [MDN equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
