
# JavaScript objects, properties, descriptors, and reflection — Reference: Property descriptors and reflection APIs

# Scope and version

This reference covers all 20 supplied descriptor, ownership, enumeration, grouping, and construction APIs for ECMAScript 2026. It specifies which keys each API sees and which operations read values or invoke accessors. See [ECMAScript object methods](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html), [MDN property ownership and enumerability](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties), and the current [Object.groupBy reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy).

# How this group fits the mental model

Descriptors describe an own property's storage or access behavior and its three flags. Reflection methods select keys using own/inherited, enumerable/non-enumerable, and string/Symbol dimensions. Some methods return metadata without reading values; others enumerate and read values. `Object.hasOwn` answers ownership, while `in` answers presence across the chain.

# Supplied names explained

- `Property descriptor` — A record describing one property. It has `value`/`writable` fields for a data property or `get`/`set` for an accessor, plus `enumerable` and `configurable`. Existing-property redefinitions preserve omitted fields; for a new property omitted flags default false and absent value/accessors default undefined.
- `Data descriptor` — Descriptor form containing `value` and/or `writable`. It stores data directly. It cannot also define `get` or `set`.
- `Accessor descriptor` — Descriptor form containing `get` and/or `set`. Each must be callable or undefined. It cannot also define `value` or `writable`.
- `Enumerable attribute` — Controls inclusion in enumerable-property traversal such as `Object.keys`, `for...in`, spread, and assign. It does not control whether a property can be read directly.
- `Configurable attribute` — Allows deletion or changes to key descriptor characteristics. Once false, the property generally cannot be deleted, switched between data/accessor, or made configurable again; a non-writable value also cannot be changed arbitrarily.
- `Writable attribute` — Applies to data descriptors and controls whether assignment/redefinition can change the stored value. It does not apply to accessor properties; a setter may still change other state.
- `Object.defineProperty` — Defines or redefines one own property and returns the target. It accepts a string or Symbol key and a descriptor. On a new property, unspecified flags default false; incompatible changes throw `TypeError`. It bypasses an inherited setter because it defines directly on the target.
- `Object.defineProperties` — Reads the own enumerable descriptor definitions from a properties object, converts them, and applies them to the target. It returns the target. Use it when multiple property definitions should be expressed together; it defines descriptors, not ordinary values.
- `Object.getOwnPropertyDescriptor` — Returns a fresh descriptor object for one own property, or `undefined` if absent. It does not return inherited descriptors and does not invoke the property's getter to obtain a value. A Proxy may customize the reflective result subject to invariants.
- `Object.getOwnPropertyDescriptors` — Returns an object containing descriptors for all own string and Symbol properties, including non-enumerable properties. It is useful for descriptor-preserving copies when paired with `Object.create` or `Object.defineProperties`; the result object is itself ordinary data.
- `Object.getOwnPropertyNames` — Returns all own string-keyed property names, enumerable or not, in own-key order. It omits Symbol keys and inherited names.
- `Object.getOwnPropertySymbols` — Returns all own Symbol-keyed properties, enumerable or not. It does not return string keys or inherited Symbols.
- `Object.keys` — Returns an array of own enumerable string keys. It omits inherited keys, non-enumerable keys, and all Symbols. For ordinary objects, own-key order places array-index keys first numerically, then other strings in creation order.
- `Object.values` — Returns values for own enumerable string keys in the same order as `Object.keys`. It reads each selected property, so getters execute; Symbols and inherited values are omitted.
- `Object.entries` — Returns `[key, value]` pairs for own enumerable string keys. It reads values, so getters execute. Symbols, non-enumerable keys, and inherited keys are excluded. `Object.fromEntries(Object.entries(x))` is not a full clone: it loses Symbols, descriptors, non-enumerables, and prototype.
- `Object.fromEntries` — Consumes an iterable of key/value pairs and creates a fresh ordinary object with own data properties. Keys are converted using property-key rules, including Symbol support. It creates a data property for `"__proto__"` rather than invoking the legacy setter. Repeated keys overwrite earlier values.
- `Object.hasOwn` — Returns whether the given object has the key as an own property, including non-enumerable and Symbol keys. It is safe when the object has a null prototype or an own property named `hasOwnProperty`. Nullish first arguments throw; primitives are converted to objects.
- `Object.groupBy` — Calls a callback for each value in an iterable and groups values into arrays by the callback's returned property key. The result has a null prototype; Symbols can be group keys. It is for string/Symbol property-key grouping, not arbitrary identity keys. Use `Map.groupBy` for arbitrary keys. Added in ECMAScript 2024.
- `Object.prototype.hasOwnProperty` — Returns whether its receiver has the specified own property, regardless of enumerability or key type. It can be shadowed on ordinary objects and is missing from null-prototype dictionaries; call it safely with `Object.prototype.hasOwnProperty.call(obj, key)`, or prefer `Object.hasOwn`.
- `Object.prototype.propertyIsEnumerable` — Returns true only when the receiver itself has the requested own property and that property's enumerable flag is true. It ignores inherited properties. Like `hasOwnProperty`, direct method access can be shadowed; it is a generic method usable with another receiver through `call`.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Object.hasOwn` vs `in` | Own ownership versus existence anywhere on the prototype chain. |
| `Object.keys` vs `Object.getOwnPropertyNames` | Own enumerable strings versus all own strings. |
| `Object.getOwnPropertySymbols` vs `Object.getOwnPropertyDescriptors` | Own Symbol keys only versus descriptor records for all own string and Symbol keys. |
| `Object.values` vs `Object.entries` | Selected values versus selected key/value pairs; both read values and invoke getters. |
| `Object.entries` vs `Object.fromEntries` | Turns selected object values into pairs versus consumes pairs to define new data properties. |
| `Data descriptor` vs `Accessor descriptor` | Stored value and writable flag versus getter/setter behavior; the forms are mutually exclusive. |

# Examples

```js
const marker = Symbol("marker");
const source = Object.create({ inherited: 1 });
Object.defineProperties(source, {
  visible: { value: 2, enumerable: true, configurable: true },
  hidden: { value: 3, enumerable: false },
  doubled: { get() { return this.visible * 2; }, enumerable: true },
});
source[marker] = 4;

console.log(Object.keys(source)); // ["visible", "doubled"]
console.log(Object.getOwnPropertyNames(source)); // includes "hidden"
console.log(Object.getOwnPropertySymbols(source)); // [marker]
console.log(Object.hasOwn(source, "inherited"), "inherited" in source); // false, true
console.log(Object.getOwnPropertyDescriptor(source, "doubled").get instanceof Function); // true
```

```js
const groups = Object.groupBy(["ant", "bear", "ape"], word => word[0]);
console.log(Object.getPrototypeOf(groups)); // null
console.log(groups.a); // ["ant", "ape"]

const safe = Object.fromEntries([["__proto__", "ordinary data"], [marker, "symbol value"]]);
console.log(Object.hasOwn(safe, "__proto__"), safe[marker]); // true, "symbol value"
```

# Common mistakes

- Assuming descriptors omitted in `defineProperty` inherit assignment defaults. New descriptor flags default false.
- Treating a descriptor returned by `getOwnPropertyDescriptor` as the property's live descriptor object. It is a returned description record.
- Assuming `Object.keys` or `Object.entries` includes Symbols or inherited values.
- Forgetting that values/entries, spread, assign, and groupBy callbacks execute user code such as getters/callbacks.
- Using `obj.hasOwnProperty` on untrusted or null-prototype objects.
- Using `Object.fromEntries` as a descriptor-preserving clone; it creates data properties.
- Assuming `Object.groupBy` returns a normal object or preserves object identity as group keys.

# Knowledge checks with answers

1. **Which API sees an own non-enumerable Symbol key and returns its descriptor?** `Object.getOwnPropertyDescriptors`.
2. **Does `Object.hasOwn` require the property to be enumerable?** No.
3. **Does `Object.entries` execute an enumerable getter?** Yes, because it reads the selected value.
4. **Why does `Object.groupBy` return a null-prototype object?** It creates groups without inherited Object keys/methods interfering with group names.
5. **Can a descriptor include both `value` and `get`?** No; data and accessor descriptor forms are incompatible.
6. **What does `propertyIsEnumerable` test?** Own ownership and the enumerable flag together.

# Sources

- [ECMAScript 2026 Object methods](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [ECMAScript 2026 ordinary object behavior](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [MDN: Property enumerability and ownership](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties)
- [MDN: Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)
- [MDN: Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
