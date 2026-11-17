<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript typed arrays and binary data views — Reference: TypedArray instance accessors and methods

# Scope and version

This lesson explains the shared `%TypedArray%.prototype` accessors, the constructor link, iteration, searching, mutation, copying, and formatting methods in ECMAScript 2026. The behavior is shared by concrete typed-array kinds, subject to BigInt/Number conversion and buffer/view lifetime rules. See [ECMAScript TypedArray methods](https://tc39.es/ecma262/2026/multipage/indexed-collections.html) and [MDN TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).

# How this group fits the mental model

Typed arrays intentionally resemble arrays but store fixed-width numeric elements over bytes. By default, methods that create a typed array produce the same concrete kind; species customization can select a different typed-array constructor subject to the standard content-type constraints; some mutate in place, and `subarray()` specifically creates an aliasing view. Some methods that allocate derived views use the species constructor, so subclasses can influence those results; the ES2023 copy-by-change methods instead create the same concrete typed-array kind. Treat each method as either a live-storage mutation, an independent copy, or a view, and account for resizable/detached buffer state.

# Supplied names explained

## View accessors and iteration

- `%TypedArray%.prototype.constructor` — On the hidden shared `%TypedArray%.prototype` intrinsic, this initially refers to the `%TypedArray%` intrinsic constructor. The concrete typed-array prototype objects also each have their own `constructor` property.
- `Concrete TypedArray prototype constructor property` — Each concrete prototype, such as `Uint8Array.prototype`, initially points back to its matching constructor. It is an ordinary writable/configurable property, not a security brand check.
- `%TypedArray%.prototype.buffer` — Underlying ArrayBuffer or SharedArrayBuffer. Multiple views can refer to the same bytes; changing one view can affect another.
- `%TypedArray%.prototype.byteLength` — Size of the viewed region in bytes, not element count; can change with a length-tracking view over a resizable buffer.
- `%TypedArray%.prototype.byteOffset` — Starting byte position in the underlying buffer.
- `%TypedArray%.prototype.length` — Element count, not byte count. It can change for a length-tracking view and can be zero when a view is detached/out-of-bounds.
- `%TypedArray%.prototype.at` — Returns the element at a zero-based index, allowing negative indices from the end; out-of-range returns undefined.
- `%TypedArray%.prototype.entries` — Returns an iterator of `[index, value]` pairs.
- `%TypedArray%.prototype.keys` — Returns an iterator of element indices.
- `%TypedArray%.prototype.values` — Returns an iterator of elements.
- `%TypedArray%.prototype[Symbol.iterator]` — Default iterator over element values, enabling `for...of` and spread.
- `%TypedArray%.prototype[Symbol.toStringTag]` — String tag for the concrete typed-array kind, such as `Uint8Array`.
- `%TypedArray%.BYTES_PER_ELEMENT` — Static element width for the concrete constructor; use `array.BYTES_PER_ELEMENT` or the constructor property instead of duplicating constants.
- `%TypedArray%.prototype.BYTES_PER_ELEMENT` — Instance-visible element width for the concrete kind; it is a constant-like property, not the whole view's byte length.

## Mutating operations

- `%TypedArray%.prototype.copyWithin` — Copies a range of elements within the same view, mutating it; overlapping ranges are handled safely like an in-place move.
- `%TypedArray%.prototype.fill` — Writes one converted value over a selected index range, mutating the view.
- `%TypedArray%.prototype.reverse` — Reverses elements in place and returns the same view.
- `%TypedArray%.prototype.set` — Copies values from an array-like/typed-array source into this view at an element offset; throws if the destination range does not fit. Typed-array overlap is handled without corrupting source values.
- `%TypedArray%.prototype.sort` — Sorts in place; typed arrays default to numeric ascending order (not lexicographic string order), with specified placement for NaN and signed zero. A comparator must return a Number even for BigInt elements.

## Predicates, searches, and reductions

- `%TypedArray%.prototype.every` — Tests whether all elements satisfy a predicate; stops at the first false result.
- `%TypedArray%.prototype.find` — Returns the first element satisfying a predicate, or undefined.
- `%TypedArray%.prototype.findIndex` — Returns the first matching index, or -1.
- `%TypedArray%.prototype.findLast` — Searches from the end and returns the last matching element, or undefined.
- `%TypedArray%.prototype.findLastIndex` — Searches from the end and returns the last matching index, or -1.
- `%TypedArray%.prototype.includes` — Tests membership using SameValueZero semantics, so NaN can match NaN.
- `%TypedArray%.prototype.indexOf` — Finds the first strict-equality match from a starting index; NaN does not match itself here.
- `%TypedArray%.prototype.lastIndexOf` — Searches backward for a strict-equality match; returns -1 when absent.
- `%TypedArray%.prototype.some` — Tests whether at least one element satisfies a predicate; stops at the first true result.
- `%TypedArray%.prototype.reduce` — Folds left to right, passing an explicit initial value when supplied; without one, an empty view throws.
- `%TypedArray%.prototype.reduceRight` — Folds right to left with the same empty/no-initial-value rule.
- `%TypedArray%.prototype.forEach` — Calls a function for each element in ascending index order and returns undefined; it is not an async-await loop.

## Derived arrays, slicing, and formatting

- `%TypedArray%.prototype.filter` — Builds a new typed array containing selected values; destination conversion/species rules apply.
- `%TypedArray%.prototype.map` — Builds a same-kind derived typed array from callback results; each result converts to the element type.
- `%TypedArray%.prototype.slice` — Returns a new independent typed array copy of the selected range.
- `%TypedArray%.prototype.subarray` — Returns a new view over the same buffer and selected range; mutations alias the original storage. On resizable buffers, omitted end can produce a length-tracking view.
- `%TypedArray%.prototype.toReversed` — Returns a reversed copy of the same concrete typed-array kind without mutating the original; it ignores `Symbol.species`. Added with change-by-copy methods in ECMAScript 2023.
- `%TypedArray%.prototype.toSorted` — Returns a sorted copy of the same concrete typed-array kind without mutating the original or consulting `Symbol.species`; uses typed-array numeric ordering by default.
- `%TypedArray%.prototype.with` — Returns a same-concrete-kind copy with one indexed element replaced after conversion; negative indices count from the end and invalid indices throw. It ignores `Symbol.species`.
- `%TypedArray%.prototype.join` — Joins element string forms with a separator; large typed arrays can allocate large strings.
- `%TypedArray%.prototype.toLocaleString` — Formats elements using locale-sensitive number/BigInt formatting and joins them; output varies by locale and is not a wire format.
- `%TypedArray%.prototype.toString` — Produces the comma-joined representation, generally through `join()`; it is a display/debug form, not a binary serialization.

# Aliasing and allocation rules

Operations divide into three practical groups:

- **Mutate this storage:** `copyWithin`, `fill`, `reverse`, `set`, and `sort`.
- **Allocate converted typed values:** `filter`, `map`, `slice`, `toReversed`, `toSorted`, and `with`.
- **Create a view:** `subarray`; its bytes remain shared with the original buffer.

Iterators traverse the typed array, not a snapshot. If code mutates the view while iterating, later reads can observe changed values. Species-using allocation methods include `filter`, `map`, `slice`, and `subarray`. The ES2023 copy-by-change methods `toReversed`, `toSorted`, and `with` use the same concrete typed-array kind instead and ignore species. Species customization can execute subclass code and produce a different compatible typed-array constructor, so treat it as a specialized hook rather than assuming every copy method uses it.

# Examples

```js
const values = new Uint8Array([8, 3, 5, 1]);
const sortedCopy = values.toSorted();
const firstTwoView = values.subarray(0, 2);

sortedCopy[0] = 99;
firstTwoView[0] = 7;

console.log([...values]);      // [7, 3, 5, 1]
console.log([...sortedCopy]);  // [99, 3, 5, 8]
```

`toSorted()` creates independent storage; `subarray()` aliases the original. Replacing `toSorted()` with `sort()` would mutate `values`.

# Common mistakes

- Confusing `length` (elements) with `byteLength` (bytes).
- Assuming `slice()` and `subarray()` both copy; only `slice()` copies.
- Assuming `.sort()` sorts numbers lexicographically like ordinary Array's default string conversion.
- Mutating the source when a non-mutating method was intended, or allocating a large copy when only a view was needed.
- Expecting `indexOf(NaN)` to find NaN; use `includes()` or `findIndex(Number.isNaN)`.
- Using async callbacks with `forEach()` and assuming it waits for promises.
- Forgetting `set()` offset/range is in elements, not bytes.
- Assuming a length-tracking view has a stable `length` across resizes.
- Treating `toString()`/`toLocaleString()` as a portable binary/text encoding.
- Providing a BigInt comparator that returns a BigInt; comparator results must be Number-valued.

# Cross-item comparison

| API pair | Difference |
| --- | --- |
| `slice()` vs `subarray()` | Copy versus view into shared storage |
| `sort()` vs `toSorted()` | In-place mutation versus new copy |
| `reverse()` vs `toReversed()` | In-place versus copied reversal |
| `includes()` vs `indexOf()` | SameValueZero (finds NaN) versus strict equality |
| `length` vs `byteLength` | Element count versus storage size in bytes |
| `set()` vs `fill()` | Copy a source range versus repeat one value |

# Knowledge checks with answers

1. **Which method changes values through the original view: `slice()` or `subarray()`?** `subarray()`; it shares the same buffer.
2. **Does `%TypedArray%.prototype.sort()` compare numeric values by default?** Yes, typed-array sorting uses numeric ordering rather than lexicographic Array ordering.
3. **Which method can find NaN directly?** `includes()`; `indexOf()` uses strict equality and returns -1 for NaN.
4. **What unit does the offset to `set()` use?** Elements, not bytes.
5. **Is a `toLocaleString()` result suitable for saving binary data?** No; it is locale-specific formatted text.

# Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [MDN TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
- [MDN Typed arrays guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays)
