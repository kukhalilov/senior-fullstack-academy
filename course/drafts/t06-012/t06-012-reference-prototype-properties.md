<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript arrays — Reference: Array prototype properties

## Scope and version

This reference covers the supplied properties found on Array instances and their prototype through ECMAScript 2026. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html), [Array exotic objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html), and [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

## How this group fits the mental model

Array instances are objects: they have an own `length` and can find methods/properties through `Array.prototype`. The prototype's `constructor` points back to Array, while its `length` is just the arity metadata for that prototype object. `Symbol.unscopables` serves a legacy lexical-lookup feature and does not change ordinary property access.

## Supplied names explained

- `Array.prototype.constructor` — The inherited constructor property whose initial value is the global Array constructor. It is a normal writable/configurable prototype property, not a reliable way to test whether an arbitrary object is an Array: an object can change or inherit a different `constructor` value.
- `Array.prototype.length` — The value of this property on the prototype object itself is 0. Each Array instance has its own special `length` data property that tracks indexed properties; that instance property is non-enumerable, non-configurable, and normally writable. Reducing an instance's length deletes later configurable own array indexes; increasing length creates holes rather than filling values.
- `Array.prototype[Symbol.unscopables]` — An object listing selected Array method names to exclude from `with`-statement identifier resolution. This preserves legacy code behavior when new method names are added. It affects `with` scope lookup only; it does not make those properties unavailable through `array.name` or reflection.

## Cross-item comparison

| Property | Where it is found | What it means |
| --- | --- | --- |
| `Array.prototype.constructor` | Prototype lookup from an instance | Constructor reference; can be shadowed or changed |
| `Array.prototype.length` | The prototype object | Its own length is zero; each instance has a separate special length |
| `Array.prototype[Symbol.unscopables]` | Prototype symbol property | Legacy `with`-scope exclusion list |

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
4. **What does `[Symbol.unscopables]` affect?** Identifier resolution inside the legacy `with` statement, not ordinary property access.
5. **Is `values.constructor === Array` a robust cross-realm Array check?** No; use `Array.isArray`.

## Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMAScript 2026 Array exotic objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
