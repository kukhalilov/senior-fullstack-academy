<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript coercion, equality, and comparison semantics — Reference: Conversion operators and abstract operations

## Scope and version

This reference covers the conversion operations from ECMAScript 2026 clause 7.1 that are relevant to JavaScript coercion, including width-specific integer conversions, plus the listed explicit conversions. Abstract operations are specification algorithms, not callable JavaScript functions; only language features such as `Number()`, `String()`, and `Boolean()` are directly callable. Abstract operations are specification algorithms, not callable JavaScript functions. Built-in conversions are callable language features. See [ECMAScript type conversion](https://tc39.es/ecma262/2026/multipage/abstract-operations.html), [ECMAScript data types](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html), and [ECMAScript expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html).

## How this group fits the mental model

Conversions are the steps an operator uses to get the kind of input it requires. Primitive conversion is often the first step for objects; then a particular conversion chooses boolean, string, Number, BigInt, or property-key behavior. The names below are not interchangeable: in particular, `ToNumber` rejects BigInt, while `ToNumeric` preserves it.

## Supplied names explained

- `ToPrimitive` — Specification operation that returns a non-object value from an object. It first calls `Symbol.toPrimitive` with a hint when available. Otherwise `OrdinaryToPrimitive` tries `toString` then `valueOf` for the string hint, and `valueOf` then `toString` for number/default. If no method returns a primitive, it throws `TypeError`. Date's default hint acts like string.
- `Symbol.toPrimitive` — Well-known symbol used as the property key for an object's custom primitive-conversion method. The method receives `"string"`, `"number"`, or `"default"`; returning an object throws. It is consulted before ordinary `valueOf`/`toString` conversion.
- `ToBoolean` — Specification operation used by conditions and logical operators. False results are `undefined`, `null`, either signed zero, `NaN`, `0n`, and the empty string; browser hosts also treat an `[[IsHTMLDDA]]` object as false. All other values, including ordinary objects, are true.
- `ToString` — Specification string conversion. It formats primitives according to language rules and first converts objects to primitives with a string hint. Abstract `ToString(Symbol())` throws, although the explicit `String(Symbol())` function has a special symbol case and succeeds.
- `ToNumber` — Specification Number conversion. `null` and `false` become `+0`, `true` becomes `1`, `undefined` becomes `NaN`, strings use StringToNumber, and objects first become primitives. A Symbol or BigInt throws `TypeError`.
- `ToNumeric` — Converts an input to a numeric primitive using a number hint. It returns a BigInt unchanged after primitive conversion; otherwise it applies `ToNumber`. Numeric operators use this distinction to avoid silently converting BigInts to Numbers.
- `ToIntegerOrInfinity` — Converts through `ToNumber`, maps `NaN` to positive zero, preserves either signed zero and either infinity, and truncates finite nonzero values toward zero. It does not round to the nearest integer.
- `ToInt32` — Converts through Number, maps non-finite values and either zero to positive zero, truncates toward zero, then wraps modulo 2^32 into the signed interval −2^31 through 2^31−1.
- `ToUint32` — Uses the same initial conversion, truncation, and modulo 2^32 wrapping as `ToInt32`, then returns the unsigned interval 0 through 2^32−1. This is a 32-bit conversion algorithm; it does not change the JavaScript value into a distinct integer type.
- `ToInt8` — Applies `ToNumber`, maps non-finite values and either zero to positive zero, truncates toward zero, wraps modulo 2^8, then interprets the high bit as signed, producing −128 through 127.
- `ToUint8` — Uses the same conversion and truncation, then wraps modulo 2^8 to produce 0 through 255.
- `ToInt16` — Truncates the Number toward zero, wraps modulo 2^16, then interprets the high bit as signed, producing −32768 through 32767; non-finite values and zero become positive zero.
- `ToUint16` — Uses Number conversion, truncation, and modulo 2^16 to produce 0 through 65535.
- `ToUint8Clamp` — Converts to Number, maps NaN to positive zero, clamps to 0–255, and rounds to the nearest integer with ties to even; unlike the `ToUint8` family, it does not wrap.
- `ToBigInt` — Converts to a BigInt primitive. It accepts BigInt unchanged, Boolean as `0n`/`1n`, and strings using the BigInt string grammar; object inputs first become primitives. Number, Symbol, `undefined`, and `null` cause `TypeError`; malformed strings cause `SyntaxError`. The `BigInt()` function exposes this conversion, with its specified accepted inputs.
- `StringToNumber` — Parses a String using ECMAScript StringNumericLiteral rules; whitespace-only and empty strings become +0, invalid strings become NaN, and a `n` BigInt suffix is not accepted.
- `StringToBigInt` — Parses a String using the BigInt string grammar; it returns an internal failure result for invalid text, which callers such as `ToBigInt` turn into a `SyntaxError`.
- `ToBigInt64` — Converts using `ToBigInt`, wraps modulo 2^64, and interprets values at or above 2^63 as negative, yielding the signed range −2^63 through 2^63−1.
- `ToBigUint64` — Converts using `ToBigInt` and wraps modulo 2^64, yielding 0 through 2^64−1.
- `ToPropertyKey` — Converts a value for use as an object property key: first `ToPrimitive` with a string hint, then preserves a Symbol or converts the result to a string. Thus `obj[1]` and `obj["1"]` address the same string-keyed property, while a Symbol key remains a Symbol.
- `Number() conversion` — Explicitly requests a Number. It accepts values according to Number conversion and has a special case allowing `Number(1n)` to produce a Number, potentially losing precision. This differs from abstract `ToNumber` and unary plus for BigInt.
- `String() conversion` — Explicitly requests a string. It performs the ordinary string conversion for most values, but `String(symbol)` is specially allowed to return a descriptive string rather than throwing as abstract `ToString` would.
- `Boolean() conversion` — Explicitly requests truthiness as a Boolean. It does not parse strings such as `"false"`; any non-empty string is true. Objects are true except for the host legacy `[[IsHTMLDDA]]` exception.
- `Unary plus conversion` — The unary `+` operator applies Number conversion to its operand. It can invoke object-to-primitive code and throws for BigInt, so it is not a universal numeric cast.

## Cross-item comparison

| Pair | Practical distinction |
| --- | --- |
| `ToNumber` / `ToNumeric` | The first requires a Number; the second preserves BigInt as a numeric primitive |
| `Number()` / unary `+` | `Number(1n)` is permitted; `+1n` throws |
| `String()` / `ToString` | The constructor has a special Symbol case; the abstract operation throws for a Symbol |
| `ToIntegerOrInfinity` / `ToInt32` | Truncation with infinities preserved versus finite 32-bit wrapping |
| `ToPrimitive` / a final conversion | Primitive conversion selects an object result first; the consuming operation then applies its own rules |
| `ToInt8`/`ToUint8`/`ToInt16`/`ToUint16` / `ToUint8Clamp` | Modulo wrapping and truncation / bounded clamp and ties-to-even rounding |
| `ToBigInt64` / `ToBigUint64` | Same modulo 2^64 wrap / signed versus unsigned interpretation |

## Examples

```js
const custom = {
  [Symbol.toPrimitive](hint) {
    return hint === "string" ? "key" : 3;
  },
};

console.log(String(custom)); // "key"
console.log(+custom);        // 3
console.log(Boolean(custom)); // true; no primitive hook is needed

console.log(Number(2n)); // 2
try { console.log(+2n); } catch (error) { console.log(error.name); } // TypeError
```

```js
console.log((2 ** 32) + 5 >>> 0); // 5: the bitwise operation uses a 32-bit conversion
console.log(new Int8Array([130])[0]); // -126: ToInt8-style wraparound
console.log(new Uint8ClampedArray([2.5, 3.5, 4.5]).join()); // 2,4,4: ties round to even
console.log(new BigInt64Array([2n ** 63n])[0]); // -9223372036854775808n: signed 64-bit wrap
console.log(Math.trunc(-3.8));   // -3: truncation is toward zero
```

The second example uses a bitwise operator only to demonstrate the familiar unsigned 32-bit result; it is not a recommendation to use bitwise arithmetic for general integers.

## Common mistakes

- Treating abstract operation names as global functions; they describe specification steps.
- Assuming every object converts through `toString()` first; the hint determines ordinary method order, and `Symbol.toPrimitive` takes precedence.
- Assuming Boolean conversion calls an object's conversion methods; ordinary objects are directly truthy.
- Assuming `Number()` and unary plus accept BigInt identically.
- Assuming `String(symbol)` and the abstract `ToString(symbol)` have identical behavior.
- Assuming `ToIntegerOrInfinity` clamps values; it truncates and preserves infinities.
- Assuming integer-width conversions round or clamp; signed and unsigned 8/16/32-bit forms truncate and wrap, whereas `ToUint8Clamp` clamps and uses ties-to-even rounding.
- Assuming `ToBigInt64` and `ToBigUint64` reject out-of-range values; they wrap modulo 2^64.
- Assuming conversion hooks are pure; getters and methods can mutate state or throw.

## Knowledge checks with answers

1. **Which conversion preserves a BigInt?** `ToNumeric`; `ToNumber` throws on BigInt.
2. **What hint does `String(object)` normally request?** A string hint, used by `ToPrimitive`.
3. **Why does `Boolean({ valueOf: () => 0 })` return true?** Objects are truthy; Boolean conversion does not call `valueOf`.
4. **What does `ToIntegerOrInfinity(NaN)` produce?** Positive zero.
5. **Why can `String(Symbol("id"))` work?** The explicit `String` function has a symbol-specific case that differs from abstract `ToString`.
6. **Does `ToInt32(2 ** 32 + 5)` return the original value?** No. After truncation and modulo wrapping, it returns `5`.
7. **How does `ToUint8Clamp(2.5)` differ from `ToUint8(2.5)`?** The former rounds ties to even and returns 2; the latter truncates and returns 2. For 3.5, clamping gives 4 while truncation gives 3.
8. **What happens to `2n ** 63n` in `ToBigInt64`?** It wraps modulo 2^64 then is interpreted as the signed minimum, −2^63.

## Further reading

- [ECMAScript 2026 type conversion abstract operations](https://tc39.es/ecma262/2026/multipage/abstract-operations.html)
- [ECMAScript 2026 data types and values](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026 expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
