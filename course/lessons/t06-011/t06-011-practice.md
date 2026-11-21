
# JavaScript coercion, equality, and comparison semantics — Exercises and worked solutions

## Goals

Practice tracing operator-specific conversions, choosing equality deliberately, and writing a predictable fallback. For each expression, write down intermediate types before deciding the result. The examples use current ECMAScript semantics; the `document.all` exercise is browser-only.

## Worked example

Trace `[] == 0` instead of memorizing it:

1. The types differ: object and Number.
2. Abstract equality converts the object to a primitive using the number hint.
3. The Array's ordinary `valueOf()` returns the Array object, not a primitive.
4. Its `toString()` returns the empty string `""`.
5. The Number/string equality branch converts `""` to Number `+0`.
6. `+0 == 0` is true, so the complete comparison is true.

```js
console.log([] == 0); // true
```

This behavior is defined but difficult to read; application code is usually clearer when it validates and converts input explicitly.

## Exercises

### 1. Trace conversion results

Predict each result or thrown error, and give the resulting type where relevant:

```js
Number("");
Number(undefined);
Number(1n);
+1n;
String(Symbol("x"));
Boolean("false");
```

### 2. Equality table

Predict each Boolean result and explain which relation is used:

```js
"0" == 0
"0" === 0
NaN === NaN
Object.is(NaN, NaN)
Object.is(+0, -0)
1n == 1
1n === 1
9007199254740993n == 9007199254740992
```

### 3. Fixed-width conversions and clamping

Predict the output and distinguish wrapping from clamping:

```js
new Int8Array([130])[0]
new Uint8Array([-1])[0]
new Uint8ClampedArray([2.5, 3.5, 4.5]).join()
new BigInt64Array([2n ** 63n])[0]
```

### 4. Compare strings and numbers

Predict the result and explain whether each pair is compared as strings or numbers:

```js
"4" < "30"
"4" < 30
"12" < "3"
1n < 1.5
NaN >= 0
```

### 5. Select the correct default

Write an expression that preserves `0`, `false`, and `""`, but replaces only `null` or `undefined` with `"unknown"`. Then write a second expression that replaces every falsy value with `"unknown"`.

### 6. Observe an object conversion hook

Write an object with `Symbol.toPrimitive` that returns `"12"` for the string hint and `12` otherwise. Predict `String(value)`, `value < 20`, and `value == 12`. Explain why `Boolean(value)` is true without invoking the conversion method.

### 7. Browser legacy check

In a browser console, inspect `Boolean(document.all)`, `document.all == null`, `document.all === null`, `null == document.all`, and `typeof document.all`. Explain why this result must not be generalized to ordinary objects.

## Progressive hints

1. `Number()` is explicit Number conversion; unary plus uses Number conversion too, but BigInt is rejected by the operator. `String()` has a Symbol-specific case.
2. Do not use one rule for all four relations. Check the type pair for `==`, and remember the special Number cases for `NaN` and signed zero.
3. Only two strings trigger lexicographic ordering. Mixed BigInt/Number relational comparisons are supported; `NaN` makes relational comparisons false.
4. The nullish operator preserves all non-nullish falsy values. The logical OR operator does not.
5. The hint tells the object which primitive to return. Truthiness of an ordinary object does not require primitive conversion.
6. `document.all` is a host legacy exotic object specified for web compatibility.

## Complete solutions

### 1. Trace conversion results

```js
Number("");          // 0 (Number)
Number(undefined);    // NaN (Number)
Number(1n);            // 1 (Number); a larger BigInt may lose precision
+1n;                   // throws TypeError
String(Symbol("x"));  // "Symbol(x)"
Boolean("false");    // true
```

The string `"false"` is non-empty; Boolean conversion does not parse Boolean words.

### 2. Equality table

| Expression | Result | Reason |
| --- | --- | --- |
| `"0" == 0` | `true` | Number/string branch converts the string to zero |
| `"0" === 0` | `false` | Different types; no coercion |
| `NaN === NaN` | `false` | Strict Number equality treats NaN as unequal |
| `Object.is(NaN, NaN)` | `true` | SameValue treats NaN as the same value |
| `Object.is(+0, -0)` | `false` | SameValue distinguishes signed zeros |
| `1n == 1` | `true` | Exact mathematical values are equal under loose equality |
| `1n === 1` | `false` | BigInt and Number have different types |
| `9007199254740993n == 9007199254740992
1n == NaN
1n == Infinity` | `false` | The Number represents 9007199254740992, a different integer value |
| `1n == NaN` and `1n == Infinity` | `false` | The mixed numeric equality branch rejects non-finite Number values |

### 3. Fixed-width conversions and clamping

Predict the output and distinguish wrapping from clamping:

```js
new Int8Array([130])[0]
new Uint8Array([-1])[0]
new Uint8ClampedArray([2.5, 3.5, 4.5]).join()
new BigInt64Array([2n ** 63n])[0]
```

### 4. Compare strings and numbers

| Expression | Result | Rule |
| --- | --- | --- |
| `"4" < "30"` | `false` | Lexicographic: first code unit `4` follows `3` |
| `"4" < 30` | `true` | Mixed types use numeric comparison, 4 < 30 |
| `"12" < "3"` | `true` | Lexicographic: first code unit `1` precedes `3` |
| `1n < 1.5` | `true` | Supported mixed BigInt/Number relational comparison |
| `NaN >= 0` | `false` | Unordered numeric comparison yields false |

### 5. Select the correct default

```js
const onlyIfMissing = value => value ?? "unknown";
const ifFalsy = value => value || "unknown";
```

For `0`, `false`, and `""`, `onlyIfMissing` returns the input. `ifFalsy` returns `"unknown"` for all three.

### 6. Observe an object conversion hook

```js
const value = {
  [Symbol.toPrimitive](hint) {
    return hint === "string" ? "12" : 12;
  },
};

console.log(String(value)); // "12"
console.log(value < 20);    // true
console.log(value == 12);   // true
console.log(Boolean(value)); // true
```

`String()` requests the string hint. Relational comparison and loose equality request primitive conversion with a numeric/default path here, which returns 12. `Boolean()` sees an ordinary object and returns true without calling `Symbol.toPrimitive`.

### 7. Browser legacy check

In a browser, `Boolean(document.all)` is false, `document.all == null` is true, `document.all === null` is false, `null == document.all` is false, and `typeof document.all` is `"undefined"`. The special loose-equality check is operand-sensitive. `document.all` has the host-defined `[[IsHTMLDDA]]` internal slot for web compatibility. Ordinary objects do not receive that slot and remain truthy; application code should not rely on this exception.

## Tests and edge cases

- `Number(" ")` is positive zero because the StringToNumber grammar accepts surrounding whitespace and an empty numeric string maps to zero.
- `Number("12n")` is `NaN`; the BigInt literal suffix is not part of Number string syntax.
- `BigInt("12")` is `12n`, while `BigInt("12.0")` throws `SyntaxError`; parsing strings as numeric input is outside this lesson's inventory but demonstrates that Number and BigInt grammars differ.
- `ToNumber(Symbol())` and unary `+Symbol()` throw `TypeError`.
- `Object.is(-0, 0)` is false, but `-0 === 0` is true.
- `"2" < "10"` is false lexicographically; `2 < "10"` is true numerically.
- `NaN < 0`, `NaN > 0`, `NaN <= 0`, and `NaN >= 0` are all false.
- `a ?? b || c` is invalid syntax without parentheses; use `(a ?? b) || c` or `a ?? (b || c)`.
- If conversion hooks mutate values or throw, evaluating an operator can have side effects or abrupt completion.

## Reflection questions

1. Which step in an expression trace most often prevents a wrong guess?
2. When is `Object.is` more suitable than `===`?
3. Which falsy values should remain valid in your application domain?
4. Why should object-to-primitive hooks be treated as executable user code?
5. Why is `document.all` an exception rather than part of the ordinary truthiness list?

## Sources

- [ECMAScript 2026 type conversion abstract operations](https://tc39.es/ecma262/2026/multipage/abstract-operations.html)
- [ECMAScript 2026 data types and equality algorithms](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026 browser legacy features](https://tc39.es/ecma262/2026/multipage/additional-ecmascript-features-for-web-browsers.html)
- [ECMAScript 2026 expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
