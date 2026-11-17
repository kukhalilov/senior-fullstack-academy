<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript arrays — Reference: Adding and removing elements

## Scope and version

This reference covers the supplied in-place end mutations and `splice` through ECMAScript 2026. These methods change the receiver and can trigger getters, setters, or proxy behavior when used on unusual/generic receivers. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html) and [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

## How this group fits the mental model

These methods change indexed properties and `length` on the same object. End operations are convenient when the affected end is known. `splice` edits any range and returns a separate Array of removed values. Aliases to the receiver observe the mutation.

## Supplied names explained

- `Array.prototype.pop` — Removes and returns the value read from the final index, then shortens the Array. On an empty Array it returns `undefined` and leaves length at zero. If the final index is absent, an inherited indexed property may still supply the returned value; otherwise it reads as `undefined`. The property at the final index is deleted and length decreases.
- `Array.prototype.push` — Appends each argument as an element and returns the new length. It mutates the receiver and can be generic over a suitable array-like object.
- `Array.prototype.shift` — Removes and returns the first value, shifts later indexed properties toward zero, and decreases length. Missing positions can remain holes; inherited indexed properties and accessors can affect generic behavior.
- `Array.prototype.splice` — Mutates the receiver by deleting a range and optionally inserting items at the start index. It returns a species-created Array containing removed values; hole positions in the removed portion can remain holes. Omitted delete count removes through the end, while an explicit `undefined` converts to zero deletions. It is generic over suitable array-like receivers.
- `Array.prototype.unshift` — Inserts arguments at the beginning, shifts existing indexed properties upward, and returns the new length. It mutates the receiver and can preserve holes as it shifts properties.

## Cross-item comparison

| Method | Change | Return value |
| --- | --- | --- |
| `push` | Append values | New length |
| `pop` | Remove final position | Removed value, or `undefined` |
| `unshift` | Insert values at front | New length |
| `shift` | Remove first position | Removed value, or `undefined` |
| `splice` | Delete/insert at chosen position | New Array of removed values |

## Examples

```js
const tasks = ["draft"];
const alias = tasks;
console.log(tasks.push("review")); // 2
console.log(alias);                 // ["draft", "review"]
console.log(tasks.shift());         // "draft"
console.log(tasks);                 // ["review"]
```

```js
const values = ["a", "b", "c", "d"];
const removed = values.splice(1, 2, "x", "y", "z");
console.log(values);  // ["a", "x", "y", "z", "d"]
console.log(removed); // ["b", "c"]
```

## Common mistakes

- Assuming `push` or `unshift` returns the modified Array; both return its new length.
- Assuming removal of a hole returns a distinct sentinel; reads of holes produce `undefined`.
- Forgetting these methods mutate aliases to the same Array.
- Confusing `splice` (mutates) with `slice` (copies a range).
- Assuming `splice(start)` and `splice(start, undefined)` both delete through the end; only the omitted count does.
- Assuming `shift` or `unshift` are constant-time; moving many indexed properties has work proportional to the affected range in typical implementations, though the specification does not prescribe complexity.
- Assuming returned removed items are deep-cloned; they are the original references.

## Knowledge checks with answers

1. **What does `push` return?** The new length.
2. **What does `pop` return on an empty Array?** `undefined`.
3. **Does `splice` mutate its receiver?** Yes, and it returns an Array of removed values.
4. **How does omitted delete count differ from explicit `undefined` in `splice`?** Omitted removes through the end; explicit `undefined` converts to zero.
5. **If another variable aliases the Array, does it see the change?** Yes, both variables refer to the same object.

## Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
