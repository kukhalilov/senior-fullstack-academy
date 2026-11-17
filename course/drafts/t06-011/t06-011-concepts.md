<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript coercion, equality, and comparison semantics — Core concepts and how they fit together

## Learning objectives

- Trace conversions without treating every operator as if it used the same algorithm.
- Explain truthiness, object-to-primitive conversion, and common explicit conversion differences.
- Predict `==`, `===`, `Object.is`, and relational results for edge values.
- Choose between `||` and `??` based on the meaning of a missing value.
- Recognize where conversion can execute user code or throw.

## Prerequisites

You should know JavaScript primitive types (`undefined`, `null`, Boolean, Number, BigInt, String, Symbol), objects, functions, and basic operators. A primitive is a value that is not an object. A method is callable code stored in a property. Symbols can be used as property keys without colliding with string keys.

## Core concepts

### There is no single coercion rule

An operator defines what it needs. `if (value)` uses boolean conversion. `String(value)` asks for a string, while `Number(value)` requests a Number. `+` first converts operands to primitives, then concatenates if either primitive is a string; otherwise it performs numeric addition (including BigInt addition when both values are BigInts). `-` performs numeric conversion. The operator's rule determines the conversion path.

### Truthiness is a small, predictable test

The ordinary falsy values are `undefined`, `null`, `false`, `+0`, `-0`, `NaN`, `0n`, and `""`. Other strings (including `"0"`), all ordinary objects (including empty arrays and empty objects), and all other numbers are truthy. Browser hosts also support the legacy `document.all` exotic object, which behaves as falsy and has special loose-equality and `typeof` behavior. It is a compatibility exception, not a value to use in new code.

Boolean conversion does not ask an object for a primitive. For example, `Boolean({ valueOf() { return 0; } })` is still `true` because the input is an object and ordinary objects are truthy.

### Object conversion is a user-code boundary

When an operation needs an object as a primitive, `ToPrimitive` first checks `Symbol.toPrimitive`. It passes a hint such as `"string"`, `"number"`, or `"default"`; the method must return a primitive or conversion throws `TypeError`. Without that method, ordinary conversion tries `toString` then `valueOf` for the string hint, and `valueOf` then `toString` for number/default hints. A `Date` treats the default hint as string. Each attempted property lookup or method call can have side effects or throw.

The operation that consumes the result still matters. A string hint may return a string, but a numeric operation can then reject it or convert it according to its own rules.

### Number and BigInt conversion are deliberately distinct

`ToNumber` converts `null` and `false` to positive zero, `true` to one, `undefined` to `NaN`, and strings through the Number string grammar. It throws for BigInt and Symbol. `ToNumeric` preserves a BigInt after primitive conversion; otherwise it uses `ToNumber`. This lets numeric operators that support BigInt work without silently rounding it into Number.

The explicit `Number()` function has a special case that converts a BigInt to Number, possibly losing precision. Unary `+` uses Number conversion and therefore throws on BigInt. Do not generalize the `Number(1n)` behavior to every numeric conversion.

### Equality names refer to different algorithms

`===` never performs type coercion. Number `NaN` is unequal to itself under strict equality, and `+0 === -0` is true. `Object.is` uses SameValue: it considers `NaN` equal to itself and distinguishes the two signed zeros. SameValueZero also equates `NaN` with itself but treats `+0` and `-0` as equal; it is used by collection/search algorithms such as `Set` membership and `Array.prototype.includes`.

`==` has explicit rules rather than a symmetric “convert both to Number” shortcut. It equates `null` and `undefined`; converts booleans to numbers; converts a Number/string pair by converting the string; and converts an object against a primitive through `ToPrimitive`. A BigInt/string pair parses the string with the BigInt grammar, returning false if it is invalid. A BigInt/Number pair compares exact mathematical values only when the Number is finite; NaN and either infinity never match a BigInt. Thus `1n == 1` is true but `9007199254740993n == 9007199254740992` is false. The browser `[[IsHTMLDDA]]` exception makes this algorithm operand-sensitive: `document.all == null` is true but `null == document.all` is false.

### Relational comparison can be string or numeric

Relational operators convert operands to primitives with a number hint. If both resulting primitives are strings, they compare lexicographically by UTF-16 code units, not locale collation or numeric-looking text. Otherwise the values are converted to numeric values. BigInt and Number can be compared together without an implicit lossy BigInt conversion. If either numeric value is `NaN`, the internal comparison is unordered and all four relational operators produce false for that comparison.

The `<=` and `>=` operators are not always equivalent to negating the opposite comparison: `NaN <= 0` is false, while `!(NaN > 0)` is true.

### Boolean-context operators return useful values

`!value` returns a Boolean based on truthiness. `condition ? a : b` selects a branch based on truthiness. `a || b` returns `a` if it is truthy, otherwise `b`; `a ?? b` returns `a` unless it is `null` or `undefined`. Both short-circuit and preserve operand values. JavaScript requires parentheses when mixing `??` directly with `&&` or `||`, so write `(a ?? b) || c` or `a ?? (b || c)` to make the intended grouping clear.

## Mechanisms and relationships

Use this trace order when an expression is surprising:

1. Mark each operand's current type.
2. Identify the operator's algorithm, not just the operator's symbol.
3. If an object needs conversion, determine its hint and `Symbol.toPrimitive`/ordinary method path.
4. Record intermediate primitives and types.
5. Apply the final comparison or operation.

For example, `[] == 0` works as follows: the types differ (object and Number), so the object is converted to a primitive using the number hint. The ordinary `valueOf` result is still an object, then `toString` produces `""`. Loose equality compares `""` with `0`, converts the empty string to Number `+0`, and returns true. This trace is more reliable than memorizing the result.

## Worked examples

### Truthiness versus nullishness

```js
const count = 0;
console.log(count || 10); // 10
console.log(count ?? 10); // 0
```

`||` treats zero as a reason to use the fallback. `??` treats only `null` and `undefined` as missing.

### String comparison versus numeric comparison

```js
console.log("12" < "3"); // true: "1" precedes "3" by code unit
console.log("12" < 3);   // false: operands are not both strings; 12 < 3
console.log(1n < 1.5);   // true: mixed numeric comparison is supported
```

### Equality distinctions

```js
console.log(NaN === NaN);       // false
console.log(Object.is(NaN, NaN)); // true
console.log(Object.is(+0, -0)); // false
console.log(+0 === -0);         // true
console.log(1n == 1);           // true
console.log(1n === 1);          // false
```

## Misconceptions and edge cases

- **“Falsy means empty.”** Zero and `NaN` are falsy; empty arrays and objects are truthy.
- **“All objects become strings before comparison.”** `ToPrimitive` uses an operation-specific hint and may return another primitive.
- **“`Number(x)` and `+x` are interchangeable.”** `Number(1n)` works; `+1n` throws.
- **“Loose equality converts both sides to numbers.”** Nullish, object, string, and BigInt branches have distinct rules.
- **“`===` distinguishes `+0` and `-0`.”** It does not; `Object.is` does.
- **“Relational operators always compare numbers.”** Two primitive strings compare lexicographically.
- **“`<=` is just `!(>)`.”** Not for unordered comparisons involving `NaN`.
- **“Nullish coalescing can be mixed freely with logical OR/AND.”** Parentheses are required when directly mixing these operators.
- **Browser legacy case:** `document.all` behaves like undefined for specific operations, including truthiness and loose equality. Do not use this exception as a general rule for host objects.

## Knowledge checks with answers

1. **Why is `Boolean([])` true?** Every ordinary object is truthy; Boolean conversion does not call array conversion methods.
2. **What is the difference between `ToNumber` and `ToNumeric` for `1n`?** `ToNumber(1n)` throws; `ToNumeric(1n)` preserves the BigInt.
3. **Why is `"2" < "10"` true?** Both operands become strings, so comparison is lexicographic by code units.
4. **What does `Object.is` distinguish that `===` does not?** It equates `NaN` with itself and distinguishes positive from negative zero.
5. **Why can `1n < 1.5` be evaluated?** Relational comparison supports a BigInt and Number pair using their mathematical numeric values.
6. **When should `??` be selected over `||`?** When zero, false, and the empty string are valid values and only nullish values mean absent.

## Sources

- [ECMAScript 2026 type conversion abstract operations](https://tc39.es/ecma262/2026/multipage/abstract-operations.html)
- [ECMAScript 2026 data types and equality algorithms](https://tc39.es/ecma262/2026/multipage/ecmascript-data-types-and-values.html)
- [ECMAScript 2026 browser legacy features](https://tc39.es/ecma262/2026/multipage/additional-ecmascript-features-for-web-browsers.html)
- [ECMAScript 2026 expressions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
