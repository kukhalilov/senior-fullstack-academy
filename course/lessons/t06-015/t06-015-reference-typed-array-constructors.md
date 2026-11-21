
# JavaScript typed arrays and binary data views — Reference: TypedArray constructors and shared static members

# Scope and version

This lesson covers the concrete TypedArray kinds, the shared `%TypedArray%` factory/static surface, value conversion, and Float16. The names follow ECMA-262 2026 checked 2026-11-17. Recent notable additions include BigInt typed arrays (ES2020), `at()` (ES2022), reverse-search and change-by-copy methods (ES2023), Float16 (ES2025), and byte hex/base64 conversion (ES2026). Standards and engine availability are separate, so verify actual runtime support. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html), [ECMAScript 2025 feature summary](https://tc39.es/ecma262/2025/), and [MDN typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays).

# How this group fits the mental model

Every concrete typed-array constructor chooses an element conversion and byte width over an `ArrayBuffer` or `SharedArrayBuffer`. Arrays created from element data allocate their own storage; arrays constructed from an existing buffer create views. Constructors from another typed array convert element values to the destination kind. The hidden `%TypedArray%` base constructor provides generic static methods and species/size metadata; application code uses concrete constructors such as `Uint8Array.from()`.

# Supplied names explained

- `Int8Array` — Signed 8-bit two's-complement integers; each element occupies 1 byte and converts through 8-bit integer semantics.
- `Uint8Array` — Unsigned 8-bit integers in the range 0–255; the common byte view for file/network data.
- `Uint8ClampedArray` — 8-bit integers clamped to 0–255, with halfway values rounded to even; commonly useful for image pixel channels.
- `Int16Array` — Signed 16-bit two's-complement integer elements, 2 bytes each.
- `Uint16Array` — Unsigned 16-bit integer elements, 2 bytes each.
- `Int32Array` — Signed 32-bit two's-complement integer elements, 4 bytes each.
- `Uint32Array` — Unsigned 32-bit integer elements, 4 bytes each.
- `Float16Array` — IEEE 754 binary16 elements, 2 bytes each. Reads produce JavaScript Numbers but values are rounded to binary16 storage precision. This was standardized in ECMAScript 2025; MDN marks current browser support Baseline 2025, though older devices/engines may not implement it. [MDN Float16Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array).
- `Float32Array` — IEEE 754 binary32 elements, 4 bytes each; ordinary JavaScript Number values are rounded when stored.
- `Float64Array` — IEEE 754 binary64 elements, 8 bytes each; this matches JavaScript Number precision but not arbitrary decimal exactness.
- `BigInt64Array` — Signed 64-bit two's-complement integers represented in JavaScript as BigInts; assignment requires BigInt conversion.
- `BigUint64Array` — Unsigned 64-bit integers represented as BigInts; assignment requires BigInt conversion.
- `%TypedArray%.from` — Generic factory exposed through concrete constructors (`Uint8Array.from(source, mapFn?, thisArg?)`). It consumes an iterable or array-like source, optionally maps each value, and creates new typed storage using destination conversion.
- `%TypedArray%.of` — Generic factory from positional arguments, converting each value to the chosen typed-array kind.
- `%TypedArray%[Symbol.species]` — Accessor for the constructor used by methods that create derived typed arrays. Subclass/species customization affects methods such as `map`, `filter`, `slice`, and `subarray`; the ES2023 copy-by-change methods `toReversed`, `toSorted`, and `with` ignore it. Ordinary application code rarely needs to override species.
- `%TypedArray%.BYTES_PER_ELEMENT` — A non-writable, non-enumerable, non-configurable static data property on each concrete typed-array constructor, giving its element width: 1, 2, 4, or 8 bytes. It is not a property on the abstract `%TypedArray%` intrinsic itself.
- `TypedArray constructors prototype property` — Each concrete constructor has a fixed, non-writable, non-enumerable, non-configurable `prototype` property pointing to its matching typed-array prototype object. Per-kind `BYTES_PER_ELEMENT` exists on both the constructor and its concrete prototype.
- `Math.f16round` — Rounds a Number to the nearest representable binary16 value, returned as a JavaScript Number. It is useful for simulating Float16 conversion before storing into a Float16Array; it does not change the Number type or make calculations use 16-bit arithmetic. It was added with Float16 in ECMAScript 2025. [ECMAScript 2025](https://tc39.es/ecma262/2025/).
- `TypedArray constructor overloads` — Constructors accept a length, iterable/array-like element source, another typed array, or an ArrayBuffer/SharedArrayBuffer plus byte offset and optional element length. Buffer-backed offsets must meet element alignment, and the selected extent must fit the buffer.
- `TypedArray integer and floating-point conversion semantics` — Integer kinds convert through fixed-width integer algorithms (truncation, modulo and signed interpretation); float kinds round to their IEEE format. This is storage conversion, not validation: check application ranges before assignment.
- `Uint8ClampedArray ties-to-even conversion` — Values below 0 become 0, above 255 become 255, and fractional values round to nearest with exact halves choosing the even integer (2.5→2; 3.5→4). NaN becomes 0.
- `BigInt typed-array conversion and modulo behavior` — BigInt views reject Number inputs rather than implicitly mixing numeric types. Values are reduced modulo 2^64, then interpreted signed for BigInt64Array or unsigned for BigUint64Array.

# Conversion boundaries

| Destination | Conversion | Important consequence |
| --- | --- | --- |
| `Int8Array` / `Uint8Array` | Fixed-width integer modulo | Out-of-range values wrap instead of clamp |
| `Uint8ClampedArray` | Clamp then nearest-even rounding | Pixel-like saturation behavior |
| `Int16Array`–`Uint32Array` | Fixed-width integer modulo/interpretation | Validate before storing if wrap is not desired |
| `Float16Array` / `Float32Array` | IEEE 754 binary16/binary32 rounding | Precision/range can be lost on assignment |
| `Float64Array` | IEEE 754 binary64 | Same numeric format as Number, still not decimal arithmetic |
| `BigInt64Array` / `BigUint64Array` | BigInt-only conversion to 64 bits | Number input throws; large values wrap modulo 2^64 |

TypedArray storage uses platform byte order for multi-byte elements. It is suitable for in-memory numeric work, but a portable network/file format should specify the order and read/write through DataView.

# Examples

```js
const bytes = Uint8Array.from([0, 127, 255, 256, -1]);
console.log([...bytes]); // [0, 127, 255, 0, 255]

const clamped = new Uint8ClampedArray([2.5, 3.5, -4, 300]);
console.log([...clamped]); // [2, 4, 0, 255]

const half = new Float16Array([1 / 3]);
console.log(half[0]); // Number rounded to the nearest binary16 value
```

The first example wraps, the second clamps/rounds, and the third stores a binary16 approximation. `%TypedArray%.from` and constructor initialization use the destination's conversion semantics.

# Common mistakes

- Treating all typed-array constructors as interchangeable casts; width, sign, range, and conversion differ.
- Expecting integer typed arrays to throw for an out-of-range Number instead of wrapping.
- Expecting `Uint8ClampedArray` to truncate instead of clamp and round ties to even.
- Passing Number values to BigInt typed arrays or mixing Number/BigInt arithmetic.
- Assuming `Float16Array` makes JavaScript arithmetic run in Float16; only stored values are rounded.
- Using typed-array byte order as a cross-platform file/network contract.
- Forgetting that `%TypedArray%.from` consumes iterables, while the constructor overloads also accept a buffer and create a view.
- Overriding species in a subclass without understanding the derived-allocation behavior of methods.
- Assuming a recent ECMAScript edition means every target runtime has implemented Float16.

# Cross-item comparison

| Kind | Width | Representation | Typical use |
| --- | ---: | --- | --- |
| `Uint8Array` | 8 bits | Number 0–255 | Raw bytes, encoded data |
| `Uint8ClampedArray` | 8 bits | Clamped Number | Pixel channels |
| `Int32Array` | 32 bits | Signed Number | Compact bounded integer arrays |
| `Float16Array` | 16 bits | Binary16 Number | Compact graphics/ML interchange where precision permits |
| `Float32Array` | 32 bits | Binary32 Number | Graphics/audio numeric arrays |
| `Float64Array` | 64 bits | JavaScript Number | Numeric arrays with Number precision |
| `BigInt64Array` | 64 bits | Signed BigInt | Exact-width integer protocols |
| `BigUint64Array` | 64 bits | Unsigned BigInt | Large unsigned counters/fields |

# Knowledge checks with answers

1. **Does storing 300 in `Uint8Array` throw?** No; it converts modulo 256 and stores 44.
2. **What does storing 2.5 in `Uint8ClampedArray` produce?** 2, because ties round to the even integer.
3. **Does `Float16Array` change the JavaScript type returned by indexing?** No; an indexed read returns a Number whose value reflects binary16 rounding.
4. **Can `BigUint64Array` accept the Number `1`?** No; supply `1n` because BigInt conversion is required.
5. **Why is `DataView` preferable for portable byte order?** It allows explicit little- or big-endian reads/writes rather than relying on platform byte order.

# Further reading

- [ECMAScript 2026 typed arrays](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [MDN typed arrays guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays)
- [MDN Float16Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array)
- [MDN Math.f16round](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/f16round)
