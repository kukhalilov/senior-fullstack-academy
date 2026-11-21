
# JavaScript typed arrays and binary data views — Reference: Hex and base64 binary conversion APIs

# Scope and version

This reference covers the six native Uint8Array hex/base64 conversion APIs standardized in ECMAScript 2026. Their built-in support avoids hand-written encoders, but runtime support can lag the current standard. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html), [MDN Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), and the linked method references below.

# How this group fits the mental model

These methods convert between byte sequences and textual encodings. They operate on Uint8Array bytes, not arbitrary typed-array element types. Encoding is not encryption or compression. The static methods allocate a byte array from text; the instance methods serialize bytes; the `setFrom...` methods fill existing storage and report how much source was consumed and how much output was written.

# Supplied names explained

- `Uint8Array.fromHex` — Parses an even-length hexadecimal string into bytes. Each pair of hex digits represents one byte; invalid characters or odd input length cause a SyntaxError.
- `Uint8Array.fromBase64` — Parses base64 text into a new byte array. Options can choose the standard `base64` or URL-safe `base64url` alphabet and how to handle an incomplete final chunk (`loose`, `strict`, or `stop-before-partial`).
- `Uint8Array.prototype.toHex` — Serializes each byte as two lowercase hexadecimal digits. The result uses exactly two characters per byte.
- `Uint8Array.prototype.toBase64` — Serializes bytes to base64 text. Options choose standard or URL-safe alphabet and whether padding is included.
- `Uint8Array.prototype.setFromHex` — Parses hex into the receiver starting at element zero, stopping when the receiver fills; returns `{ read, written }`. The input must have even total length, but characters after the destination is full are not parsed and may be ignored. Validate the complete external protocol yourself when that distinction matters.
- `Uint8Array.prototype.setFromBase64` — Decodes as much base64 as fits into the existing receiver and returns `{ read, written }`. It processes complete four-character chunks; the selected `lastChunkHandling` controls treatment of a final partial chunk. ASCII whitespace is ignored. Once the destination is full, later input is not parsed and may contain invalid syntax. Use the counts to detect truncation and validate the entire external input when required.

# Cross-item comparison

| Operation | Allocates new bytes? | Direction |
| --- | --- | --- |
| `fromHex` / `fromBase64` | Yes | Text to bytes |
| `toHex` / `toBase64` | Returns string | Bytes to text |
| `setFromHex` / `setFromBase64` | No | Text into existing destination |

Hex uses two readable digits per byte and has no alphabet or padding options. Base64 is more compact, with distinct standard and URL-safe alphabets and padding/partial-chunk choices.

# Examples

```js
const bytes = Uint8Array.fromHex("4869");
console.log([...bytes]); // [72, 105]
console.log(bytes.toHex()); // "4869"
console.log(bytes.toBase64()); // "SGk="
console.log(Uint8Array.fromBase64("SGk=").toHex()); // "4869"
```

```js
const destination = new Uint8Array(2);
const result = destination.setFromBase64("SGk=");
console.log(result); // { read: 4, written: 2 }
console.log([...destination]); // [72, 105]
```

# Common mistakes

- Treating base64 or hex as confidentiality; either is an encoding and can be decoded by anyone.
- Confusing base64url with standard base64 in URL/query contexts.
- Assuming every decoder accepts the same alphabet or malformed partial chunks; these APIs have explicit `alphabet` and `lastChunkHandling` options. Base64 APIs ignore ASCII whitespace; hex APIs do not.
- Forgetting that hex requires pairs of digits and produces two characters per byte.
- Ignoring `{ read, written }` from `setFrom...` and silently accepting truncated output.
- Passing a typed array other than Uint8Array and assuming these APIs serialize its logical values rather than its bytes.
- Confusing byte encoding with character encoding: these methods convert bytes to hex/base64 text; a separate character-encoding step is needed when bytes represent human-readable text.
- Assuming standardized means present in every older browser or runtime; feature-detect when supporting older environments.

# Knowledge checks with answers

1. **How many hex digits represent one byte?** Two.
2. **When should base64url be selected?** When the encoded text must use URL-safe characters.
3. **Do `setFromBase64` and `fromBase64` allocate in the same way?** No; `fromBase64` creates a result, while `setFromBase64` fills an existing receiver.
4. **What does `{ read, written }` help reveal?** How much source text was consumed and how many bytes were stored, including partial-capacity cases.
5. **Is base64 encryption?** No; it is reversible encoding.

# Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [MDN Uint8Array.fromBase64](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64)
- [MDN Uint8Array.fromHex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromHex)
- [MDN Uint8Array.setFromBase64](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/setFromBase64)
