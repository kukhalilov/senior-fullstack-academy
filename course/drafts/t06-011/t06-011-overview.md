<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript coercion, equality, and comparison semantics — Big-picture orientation and mental model

## Problem and purpose

JavaScript expressions often combine values of different types. A condition must decide whether a value counts as true; an operator may convert an object or string before using it; and an equality test must decide whether two values are the same under a particular rule. Coercion is this conversion performed by a language operation, either explicitly by your code or implicitly as part of another operation.

The topic matters because compact expressions can hide several steps. For example, `"5" == 5` is true, `"5" === 5` is false, and `"5" + 1` is the string `"51"`, while `"5" - 1` is the number `4`. Predicting an expression means identifying its operator and following that operator's conversion rules, not applying one universal “JavaScript converts everything to a number” rule.

## Plain-language mental model

Treat each operator as a small machine with a defined input rule. A conditional asks whether its test value is truthy. `+` may concatenate strings or add numbers. `===` compares without converting types. `==` follows a specific conversion decision tree. Relational operators first convert objects to primitives and then compare strings or numeric values.

Objects need an extra step because they do not have one universal primitive value. JavaScript asks the object for a primitive using `Symbol.toPrimitive` when present, or the ordinary `valueOf`/`toString` order for the requested hint. The operator then continues with that primitive. A conversion can call user code, throw, or have side effects, so it is observable behavior rather than a harmless formatting step.

## How the parts fit together

1. Identify the operator or context: a condition, equality test, relational test, property key, or explicit conversion.
2. Check whether it requests a boolean, string, Number, BigInt, or a general primitive.
3. If an object is involved, determine whether and how it becomes a primitive.
4. Apply the operation's specific rules. For example, `==` has its own abstract comparison algorithm, while `===` compares types and values directly.
5. Check exceptional values such as `NaN`, signed zero, BigInt, `null`, and host-specific legacy objects.

## Concept map

| Question | Rule family | Main idea |
| --- | --- | --- |
| Does this value pass a condition? | Truthiness / `ToBoolean` | Only falsy values fail; objects are normally truthy |
| How does an object become a primitive? | `ToPrimitive` | A hint guides `Symbol.toPrimitive` or ordinary conversion methods |
| What does an equality test mean? | Equality algorithms | `==`, `===`, and sameness algorithms answer different questions |
| How do two values compare in order? | Relational comparison | Strings compare by UTF-16 code units; other primitive pairs use numeric rules |
| Should a fallback apply? | `||` or `??` | Falsy fallback versus nullish-only fallback |

## End-to-end walkthrough

```js
const input = {
  [Symbol.toPrimitive](hint) {
    return hint === "number" ? 7 : "seven";
  },
};

console.log(input < 10);       // true
console.log(String(input));    // "seven"
console.log(Boolean(input));   // true
console.log(input == 7);       // true
```

For `<`, the object receives a number hint and produces `7`, which is compared numerically with `10`. `String()` requests string conversion, so it produces `"seven"`. Boolean conversion does not call the object's primitive-conversion hook: ordinary objects are truthy. Loose equality converts the object to a primitive and then compares that primitive with `7` under its own rules. The same object therefore produces different results depending on the operation.

## When to use it and tradeoffs

Prefer explicit checks and explicit conversions at boundaries where input types may vary. Use `===` for most equality checks because its behavior is easier to see locally. Use `??` when only `null` and `undefined` mean “missing”; use `||` only when every falsy value should trigger the fallback. Loose equality is defined, but its branching rules make it harder to review and can invoke object conversion code.

Coercion is still useful: conditions naturally use truthiness, template strings request string conversion, numeric operators convert numeric inputs, and APIs such as property access use property-key conversion. Understanding those rules lets you read idiomatic JavaScript without guessing.

## What later lessons cover

The concepts lesson develops the conversion and comparison decision process. The three reference lessons cover every supplied conversion operation—including fixed-width Number and BigInt conversions—equality rule, relational operator, and boolean-context item. Practice traces mixed values and designs safe boundary checks; interview questions focus on explaining edge cases without memorizing misleading slogans.

## Sources

- [ECMAScript 2026 type conversion abstract operations](https://tc39.es/ecma262/2026/multipage/abstract-operations.html)
- [ECMAScript 2026 data types and values](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026 expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
