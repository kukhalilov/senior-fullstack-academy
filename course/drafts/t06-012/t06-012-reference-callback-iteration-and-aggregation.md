<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript arrays — Reference: Callback iteration and aggregation

## Scope and version

This reference covers the supplied callback-driven traversal and accumulation methods through ECMAScript 2026. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html) and [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

## How this group fits the mental model

These methods invoke a callback for present indexed properties while traversing a captured range. `forEach` performs side effects, `reduce` and `reduceRight` accumulate one result. Their return types and treatment of empty/sparse arrays differ.

## Supplied names explained

- `Array.prototype.forEach` — Calls a callback with value, index, and receiver for each present indexed property in ascending order. It accepts `thisArg`, returns `undefined`, and does not await promises returned by an async callback. It cannot be stopped early with `break`; use a loop or a short-circuiting method when early termination is needed.
- `Array.prototype.reduce` — Calls a reducer from low to high over present indexed properties, carrying an accumulator. With an initial value it starts there; without one, the first present element becomes the accumulator and the callback starts at the next present element. If no initial value and no present elements exist, it throws `TypeError`. It returns the final accumulator and does not mutate by itself.
- `Array.prototype.reduceRight` — Same accumulator rules as `reduce`, but traverses from high to low. It skips absent indexed properties and throws for an empty/no-present-element receiver when no initial value is supplied. It is useful when order is intentionally right-associative or when processing from the end is required.

These methods capture the initial length, but a callback can mutate values and properties that have not yet been visited. Appended indexes beyond the initial length are not visited; deleted indexes that are absent when reached are skipped.

## Cross-item comparison

| Method | Direction | Result | Empty traversal |
| --- | --- | --- | --- |
| `forEach` | Low to high | `undefined` | No callback calls |
| `reduce` | Low to high | Accumulator | Initial value, or `TypeError` without one |
| `reduceRight` | High to low | Accumulator | Initial value, or `TypeError` without one |

All three skip indexes absent from the object and its prototype chain; inherited indexed properties count as present.

## Examples

```js
const values = [1, 2, 3];
let total = 0;
values.forEach(value => { total += value; });
console.log(total); // 6

const sum = values.reduce((accumulator, value) => accumulator + value, 0);
console.log(sum); // 6
```

```js
const parts = ["a", "b", "c"];
console.log(parts.reduce((text, part) => text + part, ""));
// "abc"
console.log(parts.reduceRight((text, part) => text + part, ""));
// "cba"
```

## Common mistakes

- Expecting `forEach` to return a mapped Array; it returns `undefined`.
- Using `forEach(async value => ...)` and assuming the method waits for callback Promises.
- Trying to `break` out of a `forEach` callback to stop traversal.
- Calling `reduce` on an empty Array without an initial value and expecting `undefined`.
- Forgetting that without an initial value the first/last present element becomes the accumulator and is not passed as a callback value.
- Assuming these methods visit holes; they skip absent properties, but inherited indexed properties are visible.
- Appending new indexes inside the callback and expecting them to be visited in the same pass.
- Using a reducer without returning the next accumulator.

## Knowledge checks with answers

1. **What does `forEach` return?** `undefined`.
2. **Does `forEach` wait for an async callback?** No.
3. **What happens when `reduce` has no initial value and no present indexes?** It throws `TypeError`.
4. **Which direction does `reduceRight` use?** High index to low index.
5. **Do callback additions beyond initial length get visited?** No.
6. **Do inherited indexed properties count as present?** Yes, because property-presence checks include the prototype chain.

## Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
