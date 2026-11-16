<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript arrays — Reference: Mapping and flattening methods

## Scope and version

This reference covers the supplied callback transformations and flattening methods through ECMAScript 2026. `flat` and `flatMap` became standard in ECMAScript 2019. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html), [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), and [MDN flatMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap).

## How this group fits the mental model

These methods produce transformed Arrays without changing the receiver's indexed values directly. `map` preserves positional shape, `filter` compacts selected values, `flat` removes nested Array levels, and `flatMap` maps then flattens exactly one level. Their treatment of holes and their result constructor matter.

## Supplied names explained

- `Array.prototype.filter` — Calls a predicate for present indexed properties and creates a compact result containing values whose predicate is truthy. It omits rejected values and holes; the output length can be shorter than the input. It uses species construction for the result.
- `Array.prototype.flat` — Returns a shallow flattened Array, with depth defaulting to 1. A depth of 0 still copies top-level present values; holes encountered at flattened levels are skipped. `Infinity` requests recursive flattening of nested Arrays. It does not recursively flatten arbitrary iterables and uses species construction.
- `Array.prototype.flatMap` — Calls a mapper for each present indexed property, then flattens each returned Array by one level. Returning a non-Array value adds that value as one result item; returned array-like objects are not flattened. Holes in the source are skipped, and holes at the flattened level are skipped. It uses species construction.
- `Array.prototype.map` — Calls a mapper for each present indexed property and creates a result with the same length, preserving absent slots when no inherited property supplies one. It passes value, index, and the original Array; optional `thisArg` supplies callback `this`. It is shallow and uses species construction.

All four methods are generic over suitable array-like receivers. They capture the initial length and check indexed property presence as they visit; a callback that adds indexes beyond that initial length does not extend the pass.

## Cross-item comparison

| Method | Callback output use | Result shape | Hole behavior |
| --- | --- | --- | --- |
| `map` | One output at the corresponding index | Same length | Preserves absent positions unless inherited indexes participate |
| `filter` | Keep or discard input value | Compact | Skips absent positions |
| `flat` | No callback | Nested Arrays flattened by depth | Skips holes within flattened traversal |
| `flatMap` | Map then flatten one level | Compact | Skips source and flattened-level holes |

Each result is a shallow copy: nested object references are not cloned.

## Examples

```js
const sparse = [2, , 4];
const doubled = sparse.map(value => value * 2);
const selected = sparse.filter(value => value > 2);
console.log(doubled); // [4, <empty>, 8]
console.log(selected); // [4]
```

```js
const orders = [
  { id: 1, lines: ["book", "pen"] },
  { id: 2, lines: ["mug"] },
];
const labels = orders.flatMap(order => order.lines.map(line => `${order.id}:${line}`));
console.log(labels); // ["1:book", "1:pen", "2:mug"]
```

```js
console.log([1, [2, [3]]].flat());       // [1, 2, [3]]
console.log([1, [2, [3]]].flat(2));      // [1, 2, 3]
console.log([1, 2].flatMap(n => [n, n])); // [1, 1, 2, 2]
```

## Common mistakes

- Treating `map` as a way to remove items; use `filter` for selection.
- Assuming `map` fills holes with explicit `undefined` values.
- Assuming `filter` preserves indexes or original length; it compacts.
- Assuming `flatMap` recursively flattens; it removes exactly one level after mapping.
- Assuming `flatMap` flattens any iterable or array-like result; it flattens Arrays.
- Assuming nested objects are cloned by these methods.
- Forgetting that subclass species can change the result type for these methods.
- Expecting callback visits to extend to indexes appended beyond the initially captured length.

## Knowledge checks with answers

1. **Which method preserves positional length and holes?** `map`, subject to inherited indexed properties.
2. **Which method compacts selected values?** `filter`.
3. **How many nested Array levels does `flatMap` remove after mapping?** One.
4. **Does `flatMap` flatten a Set returned from its mapper?** No; only Arrays are flattened.
5. **Are nested objects copied?** No; the copy is shallow.
6. **Which methods in this group use species construction?** All four supplied methods (`filter`, `flat`, `flatMap`, `map`).

## Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN flatMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)
