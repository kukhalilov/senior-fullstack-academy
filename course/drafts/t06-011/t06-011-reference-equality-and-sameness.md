<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript coercion, equality, and comparison semantics — Reference: Equality operators and sameness algorithms

## Scope and version

This reference separates the language equality operators from the specification sameness algorithms and covers their Number, object, BigInt, and browser-legacy edge cases in ECMAScript 2026. See [ECMAScript data types and equality](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html), [abstract operations](https://tc39.es/ecma262/2026/multipage/abstract-operations.html), [browser legacy features](https://tc39.es/ecma262/2026/multipage/additional-ecmascript-features-for-web-browsers.html), and [MDN equality comparisons](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness).

## How this group fits the mental model

Equality is not one universal test. Strict equality compares types and values without coercion. Abstract equality adds a prescribed set of conversions. SameValue and SameValueZero are specification algorithms used by built-ins; `Object.is` exposes SameValue for ordinary JavaScript code. Choosing the intended relation is clearer than memorizing isolated surprising outcomes.

## Supplied names explained

- `Abstract Equality Comparison (==)` — The algorithm behind `==`. Same-type values use strict equality; `null` and `undefined` match; booleans convert to numbers; Number/string pairs convert the string to Number; BigInt/string pairs parse the string with the BigInt grammar; object/primitive pairs convert the object to a primitive. A browser `[[IsHTMLDDA]]` object is a legacy special case. This is a decision tree, not “convert both sides to Number.”
- `Strict Equality Comparison (===)` — The algorithm behind `===`. Different types are unequal; same-type primitives compare by their defined values, with `NaN` unequal to itself and both signed zeros equal. Objects compare by identity, not structure.
- `SameValue` — Specification relation used by `Object.is`. For Numbers, `NaN` is the same as `NaN`, but `+0` and `-0` differ. Other primitive types use their specified value identity; objects match only when they are the same object.
- `SameValueZero` — Same as SameValue except `+0` and `-0` are treated as the same. It considers `NaN` equal to itself. It is used by operations including `Array.prototype.includes`, `Map`/`Set` key matching, and `Iterator.prototype.includes` in editions that provide iterator helpers.
- `Object.is` — Standard function that returns the result of SameValue. It is useful when signed zero or `NaN` identity matters; it does not perform coercion or deep comparison.
- `NaN equality behavior` — Under `===`, every Number `NaN` is unequal, including to itself. `Object.is(NaN, NaN)` is true, as are SameValueZero comparisons. `Number.isNaN(value)` can test specifically for the Number value without coercing its input.
- `+0 and -0 equality behavior` — Strict equality and SameValueZero consider them equal. SameValue and `Object.is` distinguish them. The sign can affect reciprocal results (`1 / +0` is `Infinity`; `1 / -0` is `-Infinity`).
- `Object identity equality` — Two object values are equal only when they refer to the same object. Two separately created `{}` objects are unequal even with identical properties; assigning one object to another variable preserves identity.
- `BigInt and Number equality` — Under `===`, a BigInt and Number are different types and unequal. Under `==`, finite Number and BigInt values can match when their exact mathematical values are equal. No rounding conversion is used to make the comparison: an imprecise Number does not match a different BigInt merely because their printed values look similar.
- `HTMLDDA (document.all) legacy exception` — Browsers expose `document.all` as a host-defined exotic object with `[[IsHTMLDDA]]` for web compatibility. It is falsy, `typeof document.all` is `"undefined"`, and it loosely equals `null` and `undefined`; it remains an object and is not strictly equal to either. This is a browser legacy exception, not a general property of DOM values or a feature for new code.

## Cross-item comparison

| Relation | Coerces types? | `NaN` with itself | `+0` versus `-0` | Objects |
| --- | --- | --- | --- | --- |
| `==` | Sometimes, by its decision tree | false | true | May convert object when paired with primitive |
| `===` | No | false | true | Identity |
| SameValue / `Object.is` | No | true | false | Identity |
| SameValueZero | No | true | true | Identity |

Use `===` for normal program equality. Use `Object.is` when SameValue's `NaN`/signed-zero behavior is required. Choose collection or search operations with awareness of the equality relation they specify.

## Examples

```js
console.log("5" == 5);            // true
console.log("5" === 5);           // false
console.log(NaN === NaN);          // false
console.log(Object.is(NaN, NaN));  // true
console.log(+0 === -0);            // true
console.log(Object.is(+0, -0));    // false
console.log(1n == 1);              // true
console.log(1n === 1);             // false
console.log(9007199254740993n == 9007199254740992); // false
```

```js
const a = { id: 1 };
const b = { id: 1 };
const alias = a;
console.log(a === b);     // false: distinct objects
console.log(a === alias); // true: same object
```

The browser-only legacy behavior can be observed in a browser console:

```js
Boolean(document.all);        // false
document.all == null;          // true
document.all === null;         // false
typeof document.all;           // "undefined"
```

## Common mistakes

- Claiming that `==` converts both values to Number in all cases.
- Using `Object.is` as if it deeply compares object contents.
- Forgetting that strict equality makes `NaN !== NaN`.
- Forgetting that strict equality treats signed zeros as equal.
- Assuming a Number that has rounded cannot compare with BigInt; compare exact values and the actual Number value.
- Treating `document.all` as evidence that ordinary objects are falsy or loosely equal to null.
- Using `== null` without intending to accept both `null` and `undefined` (plus the browser legacy exception).

## Knowledge checks with answers

1. **Which relation distinguishes `+0` from `-0` and equates `NaN` to itself?** SameValue, exposed by `Object.is`.
2. **Do two objects with the same properties compare equal under `===`?** Not unless they are the same object.
3. **Why is `1n == 1` true while `1n === 1` is false?** Loose equality compares exact numeric values across these types; strict equality rejects different types.
4. **Does `==` always convert operands to Number?** No; it has separate nullish, string/BigInt, boolean, and object conversion branches.
5. **What is unusual about `document.all`?** In browsers it has the legacy `[[IsHTMLDDA]]` behavior for truthiness, `typeof`, and loose equality.

## Further reading

- [ECMAScript 2026 data types and equality algorithms](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026 abstract operations](https://tc39.es/ecma262/2026/multipage/abstract-operations.html)
- [ECMAScript 2026 browser legacy features](https://tc39.es/ecma262/2026/multipage/additional-ecmascript-features-for-web-browsers.html)
- [MDN equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
