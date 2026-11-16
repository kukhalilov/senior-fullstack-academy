<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript typed arrays and binary data views — Reference: Buffer objects, shared memory, and DataView

# Scope and version

This reference covers the supplied buffer, view, and DataView names through ECMAScript 2026. Resizable ArrayBuffer and growable SharedArrayBuffer arrived in ES2024; Float16 DataView access arrived in ES2025. See [ECMAScript structured data](https://tc39.es/ecma262/2026/multipage/structured-data.html), [indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html), and [DataView reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView).

# How this group fits the mental model

A buffer owns bytes. A typed array overlays a repeated fixed-width interpretation; DataView overlays per-access type and byte order. Buffer length, view offset, element alignment, and resizability determine which bytes a view can address. A buffer transfer changes ownership by detaching the old buffer. A shared buffer allows agents to observe common bytes; synchronization is outside this lesson.

# Supplied names explained

## Buffer construction, identity, and lifecycle

- `ArrayBuffer` — Constructor for an ordinary byte-storage object. It is not itself an indexed element collection; make a typed-array or DataView view to interpret its bytes.
- `SharedArrayBuffer` — Constructor for byte storage that can be shared between agents. It is not a synchronization primitive; coordinate access separately.
- `DataView` — Constructor for a flexible view whose individual get/set operations choose field type and byte order. Its offsets are relative to the view.
- `ArrayBuffer() constructor` — Creates fixed storage from a byte length, or resizable storage when `maxByteLength` is supplied. Validate untrusted lengths before allocation.
- `ArrayBuffer.isView` — Returns true for typed-array and DataView objects, including cross-realm views; it does not mean the view is currently in bounds or attached.
- `ArrayBuffer[Symbol.species]` — Constructor lookup used by buffer-producing methods such as `slice`; subclass species customization can change the result type.
- `ArrayBuffer.prototype.byteLength` — Current buffer length in bytes. A detached buffer reports zero; a resizable buffer may change length.
- `ArrayBuffer.prototype.detached` — Boolean state indicating whether the buffer has been detached, useful for explicit lifecycle checks.
- `ArrayBuffer.prototype.maxByteLength` — Maximum permitted length for a resizable buffer; for a fixed buffer it equals its initial length.
- `ArrayBuffer.prototype.resizable` — Indicates whether resize is permitted; it does not say the buffer has been resized.
- `ArrayBuffer.prototype.resize` — Changes a resizable buffer's byte length within its declared maximum. Growth bytes are zero-initialized; shrinking may make views out of bounds.
- `ArrayBuffer.prototype.slice` — Copies a selected byte range into a new buffer. This is a byte copy, unlike creating another view.
- `ArrayBuffer.prototype.transfer` — Moves the bytes to a new ArrayBuffer and detaches the original. Optional new length can resize the destination within applicable limits.
- `ArrayBuffer.prototype.transferToFixedLength` — Transfers to a fixed-length destination even when the source is resizable; the source becomes detached.
- `Resizable ArrayBuffer constructor maxByteLength option` — Enables a buffer to resize up to its fixed maximum. Omitted option means fixed length.
- `SharedArrayBuffer.prototype.byteLength` — Current shared-storage length in bytes; a growable instance can increase but cannot shrink.
- `SharedArrayBuffer.prototype.maxByteLength` — Maximum size allowed for a growable shared buffer; for a fixed one it equals current length.
- `SharedArrayBuffer.prototype.growable` — Indicates whether the shared buffer can grow, not whether it has spare capacity at this instant.
- `SharedArrayBuffer.prototype.grow` — Increases a growable shared buffer up to its maximum. It cannot shrink; new bytes are zero-initialized.
- `SharedArrayBuffer.prototype.slice` — Copies a selected byte range into a new shared buffer; the result is separate storage, not an alias.
- `Growable SharedArrayBuffer constructor maxByteLength option` — Enables monotonic growth to a declared maximum. Browser availability commonly depends on cross-origin isolation.
- `Fixed-length versus length-tracking typed-array views` — With a length omitted on a resizable buffer, a typed array tracks the remaining region as the buffer changes. An explicit element length is fixed; offsets and lengths must satisfy element alignment.
- `Out-of-bounds typed-array view after buffer resize` — Shrinking can place a fixed view outside the new buffer. Such a view becomes out of bounds and its observable length/byteLength are zero until it becomes valid again; do not assume stale indexes remain usable.
- `ArrayBuffer transfer detaches original buffer and views` — After transfer, the original buffer is detached and its prior views cannot access the moved bytes. Do not retain them as if they still owned live data.
- `SharedArrayBuffer browser cross-origin-isolation requirement` — Web pages generally need cross-origin isolation to use SharedArrayBuffer, due to security requirements; check deployment headers and target browsers.

## Byte order and DataView operations

- `TypedArray uses platform byte order` — Multi-byte typed-array elements use the host platform's byte order. Do not serialize those bytes as a portable network format without defining and converting the order.
- `DataView explicit byte-order control` — Multi-byte DataView get/set methods accept a `littleEndian` boolean; false or omitted means big-endian. One-byte fields have no byte-order choice.
- `DataView unaligned mixed-width access` — DataView permits byte offsets that are not aligned to the field width and can read mixed field sizes from one record. Bounds still apply.
- `DataView.prototype.buffer` — The underlying ArrayBuffer or SharedArrayBuffer object.
- `DataView.prototype.byteLength` — Size of the viewed region in bytes, not an element count.
- `DataView.prototype.byteOffset` — Start position of the view in its underlying buffer.
- `DataView.prototype.getInt8` — Reads one signed 8-bit integer at a byte offset; no endian parameter is needed.
- `DataView.prototype.getUint8` — Reads one unsigned 8-bit integer.
- `DataView.prototype.getInt16` — Reads a signed 16-bit integer; the optional endian flag chooses byte order.
- `DataView.prototype.getUint16` — Reads an unsigned 16-bit integer with optional byte-order selection.
- `DataView.prototype.getInt32` — Reads a signed 32-bit integer with optional byte-order selection.
- `DataView.prototype.getUint32` — Reads an unsigned 32-bit integer with optional byte-order selection.
- `DataView.prototype.getFloat16` — Reads an IEEE 754 binary16 value and returns a Number. Added in ES2025; values are subject to binary16 precision and NaN behavior.
- `DataView.prototype.getFloat32` — Reads IEEE 754 binary32 and returns a Number rounded to that representation.
- `DataView.prototype.getFloat64` — Reads IEEE 754 binary64 and returns a Number.
- `DataView.prototype.getBigInt64` — Reads a signed 64-bit two's-complement integer as BigInt.
- `DataView.prototype.getBigUint64` — Reads an unsigned 64-bit integer as BigInt.
- `DataView.prototype.setInt8` — Converts and writes a signed 8-bit integer at a byte offset.
- `DataView.prototype.setUint8` — Converts and writes an unsigned 8-bit integer.
- `DataView.prototype.setInt16` — Converts and writes signed 16-bit data, with optional endian selection.
- `DataView.prototype.setUint16` — Converts and writes unsigned 16-bit data, with optional endian selection.
- `DataView.prototype.setInt32` — Converts and writes signed 32-bit data, with optional endian selection.
- `DataView.prototype.setUint32` — Converts and writes unsigned 32-bit data, with optional endian selection.
- `DataView.prototype.setFloat16` — Converts a Number to binary16 and writes its two bytes in the selected order; ES2025.
- `DataView.prototype.setFloat32` — Converts a Number to binary32 and writes four bytes in the selected order.
- `DataView.prototype.setFloat64` — Converts a Number to binary64 and writes eight bytes in the selected order.
- `DataView.prototype.setBigInt64` — Converts a BigInt to signed 64-bit representation and writes eight bytes; a Number is not accepted as a BigInt substitute.
- `DataView.prototype.setBigUint64` — Converts a BigInt to unsigned 64-bit representation and writes eight bytes.

# Cross-item comparison

| Need | Better fit | Reason |
| --- | --- | --- |
| Uniform numeric sequence | TypedArray | Element width and conversion are fixed for all indexes |
| Portable record or mixed fields | DataView | Each access chooses type, offset, and byte order |
| Independent byte copy | `slice()` | New storage receives copied bytes |
| Move storage ownership | `transfer()` | Destination receives bytes and source detaches |
| Concurrent shared bytes | SharedArrayBuffer | Shared storage, with synchronization designed separately |

# Examples

```js
const bytes = new ArrayBuffer(8);
const view = new DataView(bytes);
view.setUint16(0, 0x1234);       // default big-endian
view.setUint32(2, 0x89abcdef, true); // explicitly little-endian
console.log(view.getUint16(0)); // 4660
console.log(view.getUint32(2, true)); // 2309737967
```

```js
const buffer = new ArrayBuffer(4, { maxByteLength: 12 });
const tracking = new Uint8Array(buffer);
buffer.resize(8);
console.log(tracking.length); // 8
```

# Common mistakes

- Confusing byte offsets with typed-array element indexes.
- Assuming typed-array multi-byte byte order is portable.
- Omitting the DataView endian flag in a little-endian file format (the default is big-endian).
- Expecting DataView to allow out-of-bounds access; reads/writes still throw when the requested bytes do not fit.
- Treating `ArrayBuffer.slice()` as a view or `transfer()` as a copy that leaves the original intact.
- Resizing below a fixed view's range and continuing to use the old indexes.
- Assuming SharedArrayBuffer growth can shrink, or that shared storage automatically makes compound operations safe.
- Shipping a browser app that assumes SharedArrayBuffer without deploying the needed isolation policy.

# Knowledge checks with answers

1. **What is `DataView`'s default byte order for multi-byte operations?** Big-endian.
2. **Which view is more suitable for a mixed-width little-endian file header?** DataView.
3. **Does `transfer()` leave the original buffer usable?** No; the original is detached.
4. **Can a growable SharedArrayBuffer shrink?** No, it can only grow up to its maximum.
5. **Does `ArrayBuffer.isView()` guarantee a view is in bounds?** No; it identifies view objects, not their current usable extent.

# Further reading

- [ECMAScript 2026 structured data](https://tc39.es/ecma262/2026/multipage/structured-data.html)
- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [MDN DataView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)
- [MDN ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
- [MDN SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
