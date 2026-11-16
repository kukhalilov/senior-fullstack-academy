<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript coercion, equality, and comparison semantics — Reference: Relational comparison and boolean contexts

## Scope and version

This reference covers the supplied relational operators, string/numeric comparison behavior, and boolean-context features in ECMAScript 2026. It does not catalog general arithmetic. See [ECMAScript expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html), [abstract conversion operations](https://tc39.es/ecma262/2026/multipage/abstract-operations.html), and [ECMAScript data types](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html).

## How this group fits the mental model

Each operator has a conversion path. Relational comparisons turn objects into primitives and choose string ordering only when both primitives are strings; otherwise they compare numeric values. Boolean-context constructs use truthiness, but `??` checks only for nullish values. This is why the same values can produce different outcomes in comparisons and fallback expressions.

## Supplied names explained

- `Less-than operator (<)` — Compares operands after primitive conversion with number hints. Two strings are compared lexicographically by UTF-16 code units. Otherwise, numeric conversion is used; a `NaN` result makes the comparison false. BigInt and Number operands can be compared without converting the BigInt to a Number.
- `Greater-than operator (>)` — Uses the relational comparison algorithm in the reverse ordering. It has the same string and numeric rules as `<`; `NaN` makes the result false. Operand conversion can call user code, so do not assume side-effect-free evaluation.
- `Less-than-or-equal operator (<=)` — Returns whether the left value is less than or equal to the right according to the relational algorithm. It is false when the underlying comparison is unordered, including when a numeric operand is `NaN`. Therefore, it is not always equivalent to `!(left > right)`.
- `Greater-than-or-equal operator (>=)` — Returns whether the left value is greater than or equal to the right under the relational algorithm; unordered `NaN` comparisons produce false. It is not always equivalent to `!(left < right)`.
- `Relational comparison of strings` — When both primitive operands are strings, comparison is lexicographic by UTF-16 code units. It is neither numeric ordering nor locale-aware human-language sorting. For example, `"12" < "3"` is true because the first code unit `1` precedes `3`.
- `Relational comparison of BigInts and Numbers` — A BigInt can be compared with a Number. The comparison uses the exact mathematical values represented by the operands; it does not first round BigInt to Number. Fractional Numbers can therefore be ordered against BigInts, e.g. `1n < 1.5`. A Number `NaN` makes the result false.
- `Logical NOT operator (!)` — Converts its operand with truthiness and returns the opposite Boolean. It does not return the original value or call an object's primitive-conversion hook.
- `Conditional expression truthiness` — In `test ? consequent : alternate`, the test is converted to Boolean; exactly one branch is evaluated and its value is returned. The branch values are not converted to Boolean.
- `Nullish coalescing operator (??)` — Evaluates the left operand once and returns it unless it is `null` or `undefined`; only then does it evaluate and return the right operand. It preserves false, zero, `NaN`, and empty strings.
- `Logical OR operator (||)` — Evaluates the left operand once and returns it if truthy; otherwise evaluates and returns the right operand. It short-circuits and returns an operand value, not necessarily a Boolean.
- `Nullish-coalescing mixing restriction with || and &&` — JavaScript syntax does not allow unparenthesized direct mixing of `??` with `||` or `&&`. Parenthesize the intended grouping, such as `(a ?? b) || c` or `a ?? (b || c)`. This avoids silently choosing a grouping where the grammar requires the programmer to clarify intent.

## Cross-item comparison

| Expression | Fallback condition | Typical use |
| --- | --- | --- |
| `value || fallback` | Any falsy value | Treat `0`, `false`, `""`, nullish values, and `NaN` as missing/invalid |
| `value ?? fallback` | Only `null` or `undefined` | Preserve valid falsy values such as zero and empty text |
| `value ? a : b` | Selects by truthiness | Choose between two computed results |
| `!value` | Negates truthiness | Produce a Boolean predicate |

Relational string ordering is also distinct from numeric comparison: use a deliberate numeric conversion or a locale-aware comparison API when the domain calls for those semantics.

## Examples

```js
console.log("12" < "3");       // true: string ordering
console.log("12" < 3);         // false: numeric ordering, 12 < 3
console.log(1n < 1.5);          // true
console.log(NaN <= 0);          // false
console.log(!(NaN > 0));        // true
```

```js
const value = 0;
console.log(value || 5);         // 5
console.log(value ?? 5);         // 0
console.log(value ? "yes" : "no"); // "no"
console.log(!value);             // true
```

```js
const label = null;
const result = (label ?? "untitled") || "fallback";
console.log(result); // "untitled"
```

The parentheses in the last example are required because the `??` result is combined with `||`.

## Common mistakes

- Assuming strings that look numeric are always compared numerically.
- Assuming string relational comparison follows locale rules.
- Assuming mixed BigInt/Number relational comparison throws; it is supported, though mixing in arithmetic has different rules.
- Rewriting `a <= b` as `!(a > b)` without accounting for `NaN`.
- Treating `||` or `??` as Boolean-returning operators; they return an operand.
- Using `||` for a default when zero, false, or empty text is a valid value.
- Assuming a conditional expression converts the selected branch to Boolean.
- Writing `a ?? b || c` without parentheses; this is a syntax error.
- Assuming object comparisons cannot run application code; conversion hooks may be invoked.

## Knowledge checks with answers

1. **Why is `"9" < "10"` false?** Both primitives are strings, so the first code unit `9` sorts after `1`.
2. **Why do both `NaN <= 0` and `NaN >= 0` return false?** The comparison is unordered, and these operators return false for that result.
3. **What does `||` return when its left side is truthy?** The left operand itself.
4. **Which fallback preserves zero?** `??` preserves it; `||` evaluates the fallback.
5. **Can `1n < 1.5` be evaluated?** Yes, relational comparison supports mixed BigInt/Number values.
6. **How do you combine `??` and `||`?** Add parentheses around the intended subexpression.

## Further reading

- [ECMAScript 2026 expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
- [ECMAScript 2026 abstract operations](https://tc39.es/ecma262/2026/multipage/abstract-operations.html)
- [ECMAScript 2026 data types and values](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
