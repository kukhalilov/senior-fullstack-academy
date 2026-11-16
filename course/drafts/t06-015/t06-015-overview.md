<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript typed arrays and binary data views — Big-picture orientation and mental model

# Problem and purpose

JavaScript numbers and ordinary arrays are convenient for application logic, but binary formats require exact bytes, fixed-width integers, compact floating-point values, shared memory, or explicit wire-format byte order. Typed arrays and buffers provide these views over byte storage. `DataView` handles records with mixed field widths and explicit endianness; typed arrays handle regular sequences of one element type.

# Plain-language mental model

An `ArrayBuffer` is a box of raw bytes. A typed array is a ruler laid over that box: it interprets each fixed-size group as one integer or floating-point element. A `DataView` is a flexible ruler: you choose the offset, type, and byte order for every read/write. The bytes are shared by views; creating another view usually does not copy the underlying memory.

A buffer owns storage; views describe how to look at it. That distinction explains why two views can change together, why offsets are measured in bytes while typed-array indexes are measured in elements, and why transferring a buffer detaches the original views.

# How the parts fit together

1. Choose raw storage: fixed/resizable `ArrayBuffer`, or growable `SharedArrayBuffer` when concurrent agents truly need shared bytes.
2. Choose an interpretation: typed array for a uniform sequence; `DataView` for mixed fields or a specified wire endianness.
3. Validate byte lengths, offsets, alignment, and bounds before reading untrusted binary input.
4. Convert values deliberately: integer views wrap, `Uint8ClampedArray` clamps/rounds, floating types round to their binary precision, and BigInt views require BigInts.
5. Decide whether the operation should alias (`subarray`) or copy (`slice`, `toReversed`, `toSorted`, `with`).
6. For interchange, convert bytes with the native hex/base64 APIs and decode the text format into bytes—not into Unicode characters.

# Concept map

| Need | Main API | What it represents |
| --- | --- | --- |
| Own raw bytes | `ArrayBuffer` | Isolated byte storage, optionally resizable |
| Share raw bytes across agents | `SharedArrayBuffer` | Concurrently visible bytes; synchronization is a separate problem |
| Uniform numeric sequence | Typed array constructor | One numeric element type over a byte range |
| Mixed binary record | `DataView` | Per-access type, offset, and endianness |
| Move memory ownership | `ArrayBuffer.transfer()` | New buffer; old one becomes detached |
| Grow a view of memory | Resizable/growable buffer | Existing views may track size or become out-of-bounds |
| Convert byte data to readable text | `Uint8Array` hex/base64 methods | Make byte values easier to store or transmit as text |

# End-to-end walkthrough

Suppose a network protocol begins with a 16-bit big-endian message type followed by a 32-bit little-endian payload length. Create a `DataView` over the response buffer, read those fields at explicit offsets with explicit endianness, validate that the declared length fits the available bytes, then create a `Uint8Array` payload view. If the payload is hex/base64 from a text configuration file, decode it with the `Uint8Array` conversion methods rather than treating encoded characters as raw bytes. If the bytes are sent to a worker and ownership can move, transfer the buffer so the sender no longer keeps a second live view.

# When to use it and tradeoffs

Use typed arrays for pixels, audio, cryptographic bytes, protocol fields of uniform type, and efficient numeric data. Use `DataView` for binary structures with mixed field types or explicit endianness. Use normal arrays for general collections where fixed-width storage and byte layout do not matter. Resizable buffers can avoid repeated allocation but require careful view-lifetime handling; shared buffers require synchronization and secure deployment conditions. Binary APIs do not validate a file format or make untrusted bytes safe by themselves.

# What later lessons cover

The concepts lesson establishes byte storage, views, conversion, endianness, aliasing, and transfer. Reference lessons cover every numeric typed-array constructor/static member, the complete shared instance API, `ArrayBuffer`/`SharedArrayBuffer`/`DataView` behavior, and the 2026 hex/base64 conversion family. Practice parses and validates binary records; interview questions test precision, aliasing, resizing, and shared-memory boundaries.

# Further reading

- [ECMAScript 2026 indexed collections and typed arrays](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMAScript 2026 structured data and ArrayBuffer](https://tc39.es/ecma262/2026/multipage/structured-data.html)
- [MDN JavaScript typed arrays guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays)
