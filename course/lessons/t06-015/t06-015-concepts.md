
# JavaScript typed arrays and binary data views — Core concepts and how they fit together

# Learning objectives

Be able to choose between typed arrays and `DataView`, calculate byte offsets and bounds, explain numeric conversion/rounding, predict which operations alias or copy memory, and reason about resizable, detached, and shared buffers.

# Prerequisites

You should understand JavaScript `Number` and `BigInt`, arrays, constructors, and hexadecimal/base64 as textual encodings. Know that one byte is 8 bits and that endianness describes byte order for multi-byte values.

# Core concepts

## Storage is not a view

`ArrayBuffer` owns a fixed byte range unless created resizable. JavaScript cannot index raw buffer bytes directly. Typed arrays and `DataView` are views: they refer to a buffer, byte offset, and length. A typed array adds an element type and element index; `DataView` reads each access using an explicit method and optional endian flag. Multiple views can overlap and observe the same writes.

Typed-array constructors accept element data or a buffer plus byte offset/length. When using a buffer, the offset must align to the element size and the selected region must fit. For resizable buffers, omitting a view length creates a length-tracking view; specifying a length creates a fixed-length view. Shrinking below a fixed view's range can make it out-of-bounds; growing again may make that view valid again. Code must check current lengths at the time it uses them.

## Element conversion is part of the data contract

Integer typed arrays convert numbers to fixed-width integer representations with truncation/modulo behavior, not saturation. `Uint8ClampedArray` instead clamps to 0–255 and rounds halfway cases to even. Float arrays round to the selected IEEE 754 width; `Float16Array` stores binary16 even though reads produce ordinary JavaScript Numbers. BigInt typed arrays accept BigInt values, not Number values, and map to 64-bit two's-complement/unsigned representations.

`DataView` methods convert supplied values to the target type. BigInt methods use BigInt. Offset or bounds errors throw rather than silently reading a truncated field. Multi-byte `DataView` methods default to big-endian when `littleEndian` is omitted or false. Typed arrays use platform byte order, so they are not a portable endian declaration for a file/network format.

## Copy, alias, transfer, resize

`subarray()` and a typed-array view constructed over the same buffer alias storage. `slice()`, `ArrayBuffer.slice()`, and the newer non-mutating typed-array methods produce copied elements/bytes. `ArrayBuffer.transfer()` moves bytes into a new buffer and detaches the original; old views no longer provide usable storage. Resizing a resizable buffer preserves retained bytes and zero-initializes newly added bytes. `SharedArrayBuffer` can grow but cannot shrink; concurrent access needs `Atomics` or a higher-level synchronization protocol.

The recent language-edition changes are relevant to this topic: ECMAScript 2024 added resizable `ArrayBuffer`, growable `SharedArrayBuffer`, and transfer methods; ECMAScript 2025 added Float16 typed arrays and `Math.f16round`; ECMAScript 2026 added native `Uint8Array` hex/base64 conversion. The matching edition does not guarantee every deployed engine has the API, so check target-runtime support. [ECMAScript 2024/2025/2026 specification](https://tc39.es/ecma262/2026/).

# Mechanisms and relationships

For a data format, start with its byte layout rather than a JavaScript type name. Determine field widths, signedness, endian order, and valid length. Use `DataView` for a heterogeneous record and typed arrays for repeated same-type values. Validate untrusted lengths before allocating or constructing views to avoid exceptions, excessive memory, or logic errors.

Float16 has a smaller exponent/mantissa range and precision than Float32; values round to binary16, which can overflow to infinity or underflow to zero/subnormal values. `Math.f16round()` rounds a Number to the nearest representable binary16 and returns it as a Number. Integer array conversion is not equivalent to range validation: a value outside the target range can wrap. Validate application constraints before storing it.

Hex and base64 encode bytes as text; they do not define character encoding. Decode base64 to a `Uint8Array`; interpret the resulting bytes according to the data format. Base64url uses different alphabet characters. Base64 itself does not tell you whether the bytes represent text or which character encoding applies.

# Worked examples

```js
function parseHeader(buffer) {
  if (buffer.byteLength < 6) throw new RangeError("Truncated header");
  const view = new DataView(buffer);
  const kind = view.getUint16(0, false);      // big-endian
  const payloadLength = view.getUint32(2, true); // little-endian
  if (payloadLength > buffer.byteLength - 6) {
    throw new RangeError("Declared payload exceeds available bytes");
  }
  return {
    kind,
    payload: new Uint8Array(buffer, 6, payloadLength)
  };
}
```

`payload` is a view into the original buffer, not a copy. If the caller needs independent bytes, use `.slice()`.

# Misconceptions and edge cases

- A typed array is not a JavaScript array and cannot hold arbitrary object values.
- An `ArrayBuffer` is not itself indexable; use a view.
- `byteOffset` and typed-array `length` use different units: bytes versus elements.
- Typed-array constructors over a buffer can throw for misalignment or an out-of-range extent.
- `subarray()` does not copy; writes are visible through every overlapping view.
- Integer conversion usually wraps rather than clamps; `Uint8ClampedArray` is the special clamping case.
- `BigInt64Array` cannot accept ordinary Number values, and BigInt arithmetic cannot mix Number and BigInt.
- `DataView` defaults to big-endian; TypedArray element order follows platform byte order.
- A `Float32Array` value is not decimal-exact merely because it came from a decimal literal.
- A resized buffer can make a view's effective length change or become out-of-bounds.
- A transferred buffer detaches the original; do not retain stale views expecting old bytes.
- Shared memory introduces race conditions; a SharedArrayBuffer alone does not make operations atomic.
- Base64/hex text is not UTF-8. Decode bytes first, then apply the intended text decoder.

# Knowledge checks with answers

1. **Which view should parse a 16-bit network field in a specified byte order?** `DataView`, with its endian parameter set explicitly.
2. **Does `subarray()` copy bytes?** No, it creates another view over the same buffer.
3. **What happens when a signed 8-bit view receives 255?** It wraps to the signed 8-bit representation (-1); it does not clamp to 127.
4. **How does `Uint8ClampedArray` handle 2.5?** It clamps to range and rounds a halfway value to even, yielding 2.
5. **Why can a typed array not define portable file endianness by itself?** Its multi-byte element storage follows platform byte order; use `DataView` for explicit order.
6. **What does buffer transfer do to the source?** It detaches it, so the old buffer/views cannot continue accessing the transferred storage.

# Further reading

- [ECMAScript 2026 typed arrays](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMAScript 2026 ArrayBuffer and shared memory](https://tc39.es/ecma262/2026/multipage/structured-data.html)
- [MDN JavaScript typed arrays guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays)
- [MDN Float16Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array)
