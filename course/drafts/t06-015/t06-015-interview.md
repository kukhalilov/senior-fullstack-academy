<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript typed arrays and binary data views — Interview questions and reasoning

# Core questions

1. What problem do typed arrays solve?
2. How do an ArrayBuffer, a typed array, and a DataView differ?
3. When do you choose DataView instead of a typed array?
4. What is the difference between `slice()` and `subarray()` on typed arrays?
5. What does endianness mean, and what is DataView's default?
6. How do fixed-width integer typed arrays convert out-of-range values?
7. What changes when an ArrayBuffer is resized or transferred?
8. What is the difference between ArrayBuffer and SharedArrayBuffer?
9. How do the native hex and base64 APIs relate to text encoders?
10. What should be checked before parsing an untrusted binary header?

# Concise interview answers

1. They provide efficient indexed views that interpret raw bytes as fixed-width numeric elements.
2. ArrayBuffer owns bytes; a typed array applies one repeated element format; DataView chooses field format and byte order per access.
3. Use DataView for mixed-width records, unaligned fields, or a portable format with specified byte order.
4. `slice()` copies into new storage; `subarray()` creates a view that aliases the same bytes.
5. Endianness is the order of bytes in a multi-byte value. DataView defaults to big-endian; pass `true` for little-endian.
6. Integer conversion uses fixed-width semantics, including truncation/modulo and signed interpretation; clamped arrays instead clamp and round.
7. Resizing can change the extent of tracking views or make fixed views out of bounds. Transferring detaches the original buffer and moves its bytes to the destination.
8. ArrayBuffer is ordinary owned storage; SharedArrayBuffer can be shared between agents and requires separate synchronization reasoning.
9. Hex/base64 APIs map bytes to textual radix encodings. TextEncoder/TextDecoder handle character encoding, a different layer.
10. Check the header exists, validate lengths and offsets against available bytes, apply specified endianness, and avoid excessive allocations.

# Deep follow-up answers

## Why not just use a normal Array?

Ordinary arrays store JavaScript values and do not define a byte-level wire representation. Typed arrays give fixed-width element conversions over contiguous bytes. They are useful for binary protocols, files, graphics, and numeric workloads, but conversion behavior means they are not automatically input validators.

## Why can two views disagree about the same bytes?

Each view applies its own element width, signedness, floating format, starting offset, and byte order. DataView makes byte order explicit for each multi-byte operation. A typed array uses the platform's byte order, so its backing bytes are not by themselves a portable format specification.

## What are the important copy boundaries?

Constructing a view over an existing buffer and calling `subarray()` share storage. `slice()` copies typed-array values into a new typed array; `ArrayBuffer.slice()` copies a byte range. Buffer transfer moves storage and detaches the source, which is a distinct ownership operation.

## How do resizable buffers affect views?

A buffer created with a maximum can resize within that limit. A view whose length is omitted can track the remaining region; a view with explicit length is fixed. Shrinking may put fixed views out of bounds. Code should validate current bounds and avoid assuming the view remains usable after another component resizes the buffer.

## What accuracy tradeoff comes with Float16Array?

Float16 stores binary16 values but indexing returns JavaScript Number. Assignment rounds to binary16 precision; later arithmetic is ordinary Number arithmetic unless values are explicitly rounded again. Float16 saves element bytes but can lose range or precision, and hardware performance varies.

# Scenario questions

1. **A file header has a 16-bit little-endian length followed by bytes.** Use DataView to read the length with `getUint16(offset, true)`, then check that the declared range fits before creating a Uint8Array view.
2. **A parser needs to mutate one region but preserve the original.** Use `slice()` or `ArrayBuffer.slice()` for a copy; `subarray()` aliases.
3. **A browser worker and page need common bytes.** Consider SharedArrayBuffer only when shared access is needed, deployment meets cross-origin-isolation requirements, and the program has a synchronization design.
4. **A protocol specifies IEEE binary16.** Use Float16 DataView access with the protocol's explicit byte order; test precision and target runtime support.
5. **A compact URL token must represent raw bytes.** Use base64url with explicit alphabet selection; do not call the result encrypted.

# Tradeoffs and alternatives

| Requirement | Choice | Tradeoff |
| --- | --- | --- |
| Repeated numeric elements | TypedArray | Convenient indexed operations; host byte order for multi-byte data |
| Mixed record fields | DataView | Explicit access per field; more manual offsets |
| Independent copy | `slice()` | Extra memory and copy cost |
| Aliased region | `subarray()` | Efficient, but mutations are shared |
| Text-safe byte representation | Hex or base64 | Larger than raw bytes; reversible encoding |
| Shared bytes across agents | SharedArrayBuffer | Requires concurrency discipline and browser isolation setup |

# Common weak answers

- “Typed arrays are just faster arrays.” They also define fixed-width byte interpretation and conversion; speed depends on workload and runtime.
- “JavaScript is little-endian.” Typed-array byte order is platform-dependent; DataView lets a file format specify its order.
- “subarray makes a copy.” It aliases the same buffer.
- “All out-of-range values throw.” Integer typed arrays usually convert; Uint8ClampedArray clamps and rounds; BigInt views reject Number mixing.
- “Base64 encrypts data.” It only encodes bytes as text.
- “SharedArrayBuffer makes updates safe.” Shared access introduces races; it does not automatically make multi-step logic atomic.
- “Float16 means every calculation uses 16-bit precision.” The view rounds stored values; JavaScript operations still use Number semantics.

# Self-check rubric

Score one point for each skill you can explain and demonstrate without notes:

- Distinguish byte storage, typed views, and DataView.
- Calculate byte offsets, element counts, and bounds correctly.
- Explain typed-array numeric conversion and BigInt separation.
- Predict copy, alias, resize, and transfer behavior.
- Parse a portable record with explicit byte order.
- Choose suitable hex/base64 APIs and explain partial writes.
- Discuss shared memory and Float16 tradeoffs without overstating guarantees.

A score of 6–7 indicates interview readiness for this topic; revisit the relevant reference lesson for any missed skill.

# Sources

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMAScript 2026 structured data](https://tc39.es/ecma262/2026/multipage/structured-data.html)
- [MDN typed arrays guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays)
- [MDN DataView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)
