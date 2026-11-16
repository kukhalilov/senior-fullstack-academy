<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript arrays — Reference: String conversion methods

## Scope and version

This reference covers the supplied Array-to-string methods through ECMAScript 2026. The internationalization behavior is specified jointly with the current [ECMA-402 Internationalization API](https://tc39.es/ecma402/2026/). See also [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html) and [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

## How this group fits the mental model

Array string methods walk indexed values and join their string forms according to different rules. `join` gives a chosen separator; `toString` delegates to a callable `join` property when present; `toLocaleString` asks each non-nullish element for its locale-sensitive form. These are presentation/conversion operations, not serialization formats.

## Supplied names explained

- `Array.prototype.join` — Converts elements to strings and joins them with a separator; the default separator is a comma. `null`, `undefined`, and holes contribute empty text between separators. It is generic over array-like receivers and can invoke user conversion methods on elements. Nested Arrays convert through their own string behavior.
- `Array.prototype.toLocaleString` — Converts each non-nullish element by calling its `toLocaleString` method and joins the results with an implementation-defined, locale-sensitive list separator. Optional locale and options arguments are forwarded to element conversions; they do not select the Array's separator. Nullish elements and holes contribute empty text. It is not a stable interchange/serialization format because output can vary by locale and element type.
- `Array.prototype.toString` — Gets the receiver's `join` property and calls it with the receiver when callable. If `join` is not callable, it falls back to the ordinary Object string representation. It is generic over suitable receivers and can therefore be affected by an own or inherited `join` override.

## Cross-item comparison

| Method | Separator | Locale-sensitive | Important behavior |
| --- | --- | --- | --- |
| `join` | Supplied/default comma | No | Nullish values and holes become empty segments |
| `toLocaleString` | Locale-dependent | Yes | Delegates conversion to each element |
| `toString` | Usually comma through `join` | No | Can be redirected by overriding `join` |

## Examples

```js
const values = ["a", null, undefined, , "e"];
console.log(values.join(" | ")); // "a |  |  |  | e"
```

```js
const values = [1, 2];
console.log(values.toString()); // "1,2"
values.join = () => "custom";
console.log(values.toString()); // "custom"
```

```js
const formatted = [1234.5, 67].toLocaleString("en-US");
```

`formatted` contains locale-formatted element text with a host locale-sensitive list separator. Exact output can vary with locale data and runtime.

## Common mistakes

- Treating `join` as JSON serialization; commas and empty strings do not preserve types or nullish distinctions.
- Assuming `toString()` always produces the built-in comma-joined representation even after `join` is overridden.
- Assuming `toLocaleString()` has one fixed output across locale settings and runtimes.
- Assuming the `locales` argument controls the separator between Array elements; it is passed to each element conversion, while the Array separator is host-defined.
- Assuming holes and `undefined` are visibly distinguished in `join`; both contribute empty segments.
- Forgetting that an element conversion can execute user code or throw.
- Assuming `toLocaleString` safely formats every arbitrary object; its method lookup/call can fail.

## Knowledge checks with answers

1. **What is the default `join` separator?** A comma.
2. **How do holes appear in `join`?** As empty text between separators.
3. **What does `Array.prototype.toString` do if `join` is not callable?** It falls back to Object string conversion.
4. **Is `toLocaleString` suitable for machine-readable serialization?** No; its output is locale- and element-dependent.
5. **Can conversion throw?** Yes; element conversion code or an overridden `join`/`toLocaleString` can throw.

## Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMA-402 Internationalization API 2026](https://tc39.es/ecma402/2026/)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
