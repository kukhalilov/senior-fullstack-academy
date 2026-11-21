
# JavaScript arrays — Reference: Copying and copy-by-change methods

## Scope and version

This reference covers shallow concatenation/slicing and the non-mutating copy-by-change methods through ECMAScript 2026. `toReversed`, `toSorted`, `toSpliced`, and `with` became standard in ECMAScript 2023. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html), [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), and the [change-array-by-copy proposal](https://github.com/tc39/proposal-change-array-by-copy).

## How this group fits the mental model

Copying methods return a new outer Array, which protects the input's order/length from direct edits through the result. They do not deep-clone nested values. Legacy methods `concat` and `slice` use species construction; `concat` can also spread selected objects. The newer copy-by-change methods return ordinary Arrays and read through holes, producing dense results.

## Supplied names explained

- `Array.prototype.concat` — Creates a shallow combined Array from the receiver followed by its arguments. It uses species construction for the result and checks whether each value should spread; Arrays spread by default, while `Symbol.isConcatSpreadable` can override that choice for objects. Non-spreadable arguments are appended as single values. Existing holes in spread inputs are preserved as holes.
- `Symbol.isConcatSpreadable` — Well-known symbol that controls whether an object is spread into indexed values by `concat`. If the property exists, its truthiness decides; otherwise Arrays spread and other objects do not. It affects `concat`, not spread syntax or Array iteration.
- `Array.prototype.slice` — Returns a shallow copy of a selected range from start up to but excluding end. Negative indexes count from the end; omitted end means the current length. It preserves holes using property-presence checks, is generic, and uses species construction.
- `Array.prototype.toReversed` — Returns a new ordinary Array with values in reverse index order and leaves the receiver unchanged. It reads every position, so absent slots become explicit `undefined` values. Standardized in ECMAScript 2023.
- `Array.prototype.toSorted` — Returns a new ordinary Array sorted by the same comparison rules as `sort`, without mutating the receiver. It reads through holes, which act like `undefined` and end up after defined values; `undefined` values also sort after defined values. Sorting is stable. Standardized in ECMAScript 2023.
- `Array.prototype.toSpliced` — Returns a new ordinary Array with a range removed and/or items inserted; the receiver is unchanged. Its start and deletion-count behavior mirrors `splice`, including the distinction between omitted delete count and an explicit `undefined`. It reads positions into a dense result. Standardized in ECMAScript 2023.
- `Array.prototype.with` — Returns a new ordinary Array with one index replaced and leaves the receiver unchanged. Negative indexes count from the end; an index outside the valid range throws `RangeError` rather than extending the Array. It reads through positions, so holes become explicit `undefined` values. Standardized in ECMAScript 2023.

## Cross-item comparison

| Method | Changes receiver? | Result construction | Hole behavior |
| --- | --- | --- | --- |
| `concat` | No | Species-sensitive | Preserves holes in spread inputs |
| `slice` | No | Species-sensitive | Preserves absent positions |
| `toReversed` | No | Ordinary Array | Densifies holes as `undefined` |
| `toSorted` | No | Ordinary Array | Reads holes as `undefined`, sorts them to the end |
| `toSpliced` | No | Ordinary Array | Densifies copied positions |
| `with` | No | Ordinary Array | Densifies copied positions |

Copying is shallow: if the input contains an object, the output contains the same object reference at the corresponding position unless that position is replaced.

## Examples

```js
const source = [3, , 1];
const reversed = source.toReversed();
console.log(reversed); // [1, undefined, 3]
console.log(source);   // [3, <empty>, 1]

const changed = source.with(0, 9);
console.log(changed); // [9, undefined, 1]
```

```js
console.log([1, 2, 3, 4].toSpliced(1, 2, "x")); // [1, "x", 4]
console.log([1, 2].concat([3], 4));             // [1, 2, 3, 4]
console.log([1, 2, 3].slice(-2));               // [2, 3]
```

## Common mistakes

- Assuming “copy” means nested objects are cloned.
- Confusing `concat` spreading with JavaScript spread syntax; `concat` can use `Symbol.isConcatSpreadable`.
- Assuming `slice` and copy-by-change methods have the same sparse-array behavior.
- Assuming `toSorted` uses numeric ordering by default; default ordering compares strings.
- Assuming `with` grows the Array for an out-of-range index; it throws `RangeError`.
- Assuming `toSpliced(start)` and `toSpliced(start, undefined)` mean the same deletion count.
- Assuming copy-by-change methods preserve subclass species; they create ordinary Arrays.

## Knowledge checks with answers

1. **Which methods in this group mutate the receiver?** None.
2. **Which methods use species construction?** `concat` and `slice`.
3. **Can `Symbol.isConcatSpreadable` make a non-Array object spread by `concat`?** Yes, if its value is truthy.
4. **Does `toReversed` preserve a hole?** No; it reads the position and creates an explicit `undefined` result element if no inherited value exists.
5. **What happens when `with` receives an out-of-range index?** It throws `RangeError`.
6. **Are nested object values cloned?** No, these are shallow copies.

## Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [TC39 change-array-by-copy proposal](https://github.com/tc39/proposal-change-array-by-copy)
