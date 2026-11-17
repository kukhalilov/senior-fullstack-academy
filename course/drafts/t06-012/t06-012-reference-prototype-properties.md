<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript arrays — Reference: Array prototype properties

## Scope and version

This reference covers the supplied properties found on Array instances and their prototype through ECMAScript 2026. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html), [Array exotic objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html), and [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

## How this group fits the mental model

Array instances are objects: they have an own `length` and can find methods/properties through `Array.prototype`. The prototype's `constructor` points back to Array; `Array.prototype` is itself an Array object and its own `length` is zero. `Symbol.unscopables` serves a legacy lexical-lookup feature and does not change ordinary property access.

## Supplied names explained

- `Array.prototype.constructor` — The inherited constructor property whose initial value is the global Array constructor. It is a normal writable/configurable prototype property, not a reliable way to test whether an arbitrary object is an Array: an object can change or inherit a different `constructor` value.
- `Array.prototype.length` — The value of this property on the prototype object itself is 0. Each Array instance has its own special `length` data property that tracks indexed properties; that instance property is non-enumerable, non-configurable, and normally writable. Reducing an instance's length deletes later configurable own array indexes; increasing length creates holes rather than filling values.
- `Array.prototype[Symbol.unscopables]` — A null-prototype object listing `at`, `copyWithin`, `entries`, `fill`, `find`, `findIndex`, `findLast`, `findLastIndex`, `flat`, `flatMap`, `includes`, `keys`, `toReversed`, `toSorted`, `toSpliced`, and `values` with value `true`. These names are excluded from `with`-statement identifier resolution to preserve legacy binding behavior; ordinary property lookup and reflection still see them. The symbol property is non-writable, non-enumerable, and configurable on `Array.prototype`.

## Cross-item comparison

| Property | Where it is found | What it means |
| --- | --- | --- |
| `Array.prototype.constructor` | Prototype lookup from an instance | Constructor reference; can be shadowed or changed |
| `Array.prototype.length` | The prototype object | Its own length is zero; each instance has a separate special length |
| `Array.prototype[Symbol.unscopables]` | Prototype symbol property | The specified legacy `with`-scope exclusion names, all set to `true` |

Do not confuse the Array instance's `length` with `Array.prototype.length`, or either with the `length` of a method function.

## Examples

```js
const values = ["a", "b", "c"];
console.log(values.length); // 3
values.length = 1;
console.log(values);        // ["a"]

const sparse = [];
sparse.length = 3;
console.log(sparse.length); // 3; indexes 0, 1, and 2 are holes
```

```js
const values = [1, 2];
console.log(values.constructor === Array); // true in this ordinary case
console.log(Array.prototype.length);       // 0
```

The constructor comparison is illustrative only; use `Array.isArray` when checking Array identity.

After the Array length conversion rules are applied, the accepted value is an integer in the inclusive range `0` through `2 ** 32 - 1`. A coercible string such as `"2"` can therefore set length to 2; an invalid numeric value such as a negative, fractional, or too-large number throws `RangeError`, while values that fail numeric conversion (such as Symbol or BigInt) throw `TypeError`. The largest element index is one less than the maximum length. A failed shrink blocked by a non-configurable index can still delete higher configurable indexes before restoring length above the blocker.

## Common mistakes

- Treating `constructor` as an unforgeable type tag.
- Thinking increasing `length` fills slots with `undefined` values.
- Thinking `length` is enumerable or configurable on an Array instance.
- Assuming `[Symbol.unscopables]` hides methods from ordinary access.
- Confusing an instance's length with the prototype object's length.

## Knowledge checks with answers

1. **What is `Array.prototype.length` initially?** Zero.
2. **What happens to later configurable indexed properties when instance length shrinks?** They are deleted.
3. **Does extending `length` create values?** No; it creates absent indexed positions (holes).
4. **Which names are initially unscopable?** `at`, `copyWithin`, `entries`, `fill`, `find`, `findIndex`, `findLast`, `findLastIndex`, `flat`, `flatMap`, `includes`, `keys`, `toReversed`, `toSorted`, `toSpliced`, and `values`.
5. **Is `values.constructor === Array` a robust cross-realm Array check?** No; use `Array.isArray`.

## Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMAScript 2026 Array exotic objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
