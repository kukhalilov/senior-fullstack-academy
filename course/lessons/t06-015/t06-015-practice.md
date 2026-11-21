
# JavaScript typed arrays and binary data views — Exercises and worked solutions

# Goals

Practice mapping byte layouts to typed views, using explicit endianness, accounting for numeric conversion, and distinguishing copied storage from shared views. The exercises combine the topic's listed APIs rather than attempting to memorize their names.

# Worked example

A file starts with a two-byte little-endian payload length followed by that many bytes. Parse it safely before using the payload.

```js
function parsePacket(buffer) {
  if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < 2) {
    throw new RangeError("packet needs a two-byte header");
  }
  const view = new DataView(buffer);
  const length = view.getUint16(0, true);
  if (length > buffer.byteLength - 2) throw new RangeError("truncated payload");
  return new Uint8Array(buffer, 2, length);
}

const packet = new Uint8Array([3, 0, 65, 66, 67]);
const payload = parsePacket(packet.buffer);
console.log([...payload]); // [65, 66, 67]
```

The parser checks the header before reading it and checks the declared extent before constructing the view. The payload is a view over the same bytes; it is not copied. Its three byte values are 65, 66, and 67.

# Exercises

## 1. Endian header

Create a four-byte buffer containing the bytes `34 12 00 00`. Read the first two bytes as little-endian and big-endian unsigned integers. Explain the different results.

## 2. Copy or alias

Start with `Uint8Array.from([4, 5, 6])`. Create both `slice(1)` and `subarray(1)`, then change each result's first byte in turn. Predict which change is reflected in the original.

## 3. Encode a binary token

Convert bytes `[0, 127, 255]` to lowercase hex and back. Then encode as base64url and decode with the matching alphabet. Verify the recovered bytes.

# Progressive hints

1. DataView's omitted endian argument means big-endian. For a little-endian read pass `true`.
2. A copy gets its own buffer; an alias shares the original buffer.
3. Use `Uint8Array.fromHex`, `toHex`, `toBase64({ alphabet: "base64url" })`, and `fromBase64(text, { alphabet: "base64url" })`.

# Complete solutions

## 1. Endian header

```js
const buffer = new Uint8Array([0x34, 0x12, 0, 0]).buffer;
const view = new DataView(buffer);
console.log(view.getUint16(0, true)); // 4660 (0x1234)
console.log(view.getUint16(0)); // 13330 (0x3412)
```

The same bytes represent different numbers when the byte order differs.

## 2. Copy or alias

```js
const original = Uint8Array.from([4, 5, 6]);
const copy = original.slice(1);
const alias = original.subarray(1);
copy[0] = 50;
console.log([...original]); // [4, 5, 6]
alias[0] = 60;
console.log([...original]); // [4, 60, 6]
```

`slice()` copies values into distinct storage. `subarray()` creates a view into the same buffer.

## 3. Encode a binary token

```js
const bytes = Uint8Array.from([0, 127, 255]);
const hex = bytes.toHex();
const fromHex = Uint8Array.fromHex(hex);
const base64url = bytes.toBase64({ alphabet: "base64url" });
const fromBase64url = Uint8Array.fromBase64(base64url, { alphabet: "base64url" });
console.log(hex); // "007fff"
console.log([...fromHex]); // [0, 127, 255]
console.log([...fromBase64url]); // [0, 127, 255]
```

# Tests and edge cases

- A one-byte buffer cannot contain a two-byte header; reject it before `getUint16`.
- A declared payload length larger than the available bytes must be rejected.
- A zero-length payload is valid if the header declares zero.
- Odd-length hex input must fail instead of silently inventing a nibble.
- A destination too small for decoded input can produce partial `setFromBase64` output; inspect `{ read, written }`.
- Multi-byte typed-array byte order is platform-dependent; use DataView for a portable format.
- A BigInt64Array requires BigInt values such as `1n`, not `1`.

# Reflection questions

1. Which parts of a binary parser are measured in bytes and which in elements?
2. When would you choose a typed array rather than DataView?
3. Why should untrusted lengths be checked before allocation or view creation?
4. Which operations in the exercises alias storage, and which copy it?

# Sources

- [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMAScript structured data](https://tc39.es/ecma262/2026/multipage/structured-data.html)
- [MDN DataView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)
- [MDN Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

## Reflection answers

1. Buffer lengths, byte offsets, DataView field widths, and raw data positions are measured in bytes. Typed-array indexes and `set()` offsets are measured in elements. A typed array `length` counts elements; `byteLength` counts bytes.
2. Use a typed array for a uniform sequence of one numeric element type. Use DataView for mixed-width fields, unaligned fields, or a format that specifies byte order.
3. Untrusted lengths can exceed available data, engine allocation limits, or application limits. Validate before allocation or view construction to avoid malformed parsing, out-of-bounds exceptions, or excessive memory use.
4. `subarray()` aliases its source; `slice()` copies. `DataView` and `new Uint8Array(buffer, ...)` create views. `Uint8Array.fromHex()` allocates new byte storage.
