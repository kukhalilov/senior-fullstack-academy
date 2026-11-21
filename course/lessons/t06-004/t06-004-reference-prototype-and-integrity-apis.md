
# JavaScript objects, properties, descriptors, and reflection — Reference: Prototype operations, integrity, and Object methods

# Scope and version

This reference covers all 20 supplied prototype, copying, integrity, comparison, and inherited Object methods for ECMAScript 2026. It distinguishes a prototype link from a constructor property and treats Annex B compatibility accessors as legacy. See [ECMAScript object behavior](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html), [ECMAScript Object methods](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html), and the current [Object.setPrototypeOf reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf).

# How this group fits the mental model

The prototype link controls inherited lookup. Integrity operations limit structural changes to one object. Object utility methods expose that structure or perform shallow value operations. Do not confuse a function's `.prototype` property, an object's internal `[[Prototype]]`, and the `Object.prototype` object.

# Supplied names explained

- `Object.getPrototypeOf` — Returns an object's internal prototype (or `null`). It converts non-nullish primitives to wrapper objects before querying; `null` and `undefined` throw. The result may differ from a constructor's current `.prototype` if that object was later changed.
- `Object.setPrototypeOf` — Sets an object's internal prototype to an object or `null` and returns the target. A nullish target or invalid prototype throws; a non-object primitive target is returned unchanged. A non-extensible target cannot generally receive a different prototype. Dynamic prototype changes can harm optimization and make inheritance harder to reason about; prefer setting the prototype at creation with `Object.create` or using classes.
- `Object.prototype.isPrototypeOf` — Returns true if its receiver object occurs anywhere in the argument object's prototype chain. It answers a chain relationship, not constructor identity. A non-object argument returns false.
- `Object.prototype.__proto__ (legacy accessor)` — Deprecated legacy getter/setter for an object's internal prototype, standardized only for web compatibility. The getter returns the receiver's prototype; the setter accepts an object or `null` and otherwise ignores the value. It is not the same mechanism as the special `__proto__: value` object-literal form. Prefer `Object.getPrototypeOf`, `Object.setPrototypeOf`, or `Object.create`.
- `Object.assign` — Copies enumerable own string and Symbol property values from each source onto a target and returns the target. It reads sources with `[[Get]]` (running getters) and writes with `[[Set]]` (possibly invoking target setters). A later failure can occur after partial mutation. It is shallow and does not preserve descriptors. Nullish sources are ignored; nullish target throws, while primitive targets are boxed.
- `Object.is` — Compares two values using SameValue: NaN equals NaN, and positive zero differs from negative zero. Objects compare by identity. It differs from strict equality (`NaN !== NaN`, `+0 === -0`) and SameValueZero (used by Map/Set, where the zero signs are treated alike).
- `Object.isExtensible` — Reports whether an object can gain new own properties. Non-object primitives return false; objects that are already non-extensible return false. A Proxy may customize the answer under invariants.
- `Object.preventExtensions` — Prevents adding new own properties and returns the input. Existing properties may still change or be deleted if their descriptors allow it. For non-object primitives, it returns the value unchanged. The operation is irreversible for ordinary objects.
- `Object.isSealed` — Reports whether an object is non-extensible and all its own properties are non-configurable. Non-object primitives are considered sealed. Accessor setters and writable data properties can still change values when sealed.
- `Object.seal` — Prevents extensions and marks every existing own property non-configurable. Existing writable data properties remain writable. It is shallow and returns the input; non-object primitives are returned unchanged.
- `Object.isFrozen` — Reports whether an object is non-extensible and every own property is non-configurable, with every own data property also non-writable. Accessors have no writable flag; their setter may still change external or nested state. Non-object primitives are considered frozen.
- `Object.freeze` — Prevents extensions, makes every own property non-configurable, and makes own data properties non-writable. It returns the same input and is shallow. A non-empty typed array cannot be frozen because its indexed elements cannot be made non-writable in the required way; empty typed arrays and DataViews may be frozen.
- `Object.prototype.toString` — Produces a tag such as `[object Object]`. For objects it consults `Symbol.toStringTag`; absent a string override, built-in internal characteristics provide a fallback such as Function or Array. `null` and `undefined` have dedicated tags. Tags can be spoofed or getters can throw, so this is not a dependable security/type test.
- `Object.prototype.toLocaleString` — Calls the receiver's current `toString()` method and returns its result. Specific built-in types may override it for locale-aware formatting. Since it dynamically calls `this.toString`, overriding that method affects the result.
- `Object.prototype.valueOf` — Returns the object receiver itself after object coercion. It is the generic default; primitive wrapper objects and other types may override it. Calling it with nullish `this` throws because those values cannot be converted to objects.
- `Object.prototype.constructor` — The initial value is the `Object` constructor. This is a writable, non-enumerable, configurable inherited data property on `Object.prototype`; objects may shadow it. It is conventional metadata, not reliable proof of an object's origin or class.
- `Object.prototype.__defineGetter__ (legacy)` — Deprecated legacy method that defines an own getter for a property key on its receiver. Use `Object.defineProperty` with a `get` field instead.
- `Object.prototype.__defineSetter__ (legacy)` — Deprecated legacy method that defines an own setter for a property key on its receiver. Use `Object.defineProperty` with a `set` field instead.
- `Object.prototype.__lookupGetter__ (legacy)` — Deprecated legacy method that searches the receiver and its prototype chain and returns the getter function for a key, or `undefined`. Prefer inspecting descriptors deliberately with `Object.getOwnPropertyDescriptor` while traversing prototypes if this rare need is real.
- `Object.prototype.__lookupSetter__ (legacy)` — Deprecated legacy method that searches for a setter function on the receiver/prototype chain or returns `undefined`. Prefer descriptor reflection; do not rely on the legacy method in new code.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Object.freeze` vs `Object.seal` | Both prevent extensions and make own properties non-configurable; freeze additionally disables writes to own data properties. |
| `Object.preventExtensions` vs `Object.seal` | Prevent-extensions only blocks new properties; seal also prevents deleting/reconfiguring existing own properties. |
| `Object.assign` vs object spread | Both copy enumerable own values, but assign writes through target setters while spread creates data properties on a fresh literal. |
| `Object.getPrototypeOf` vs `Object.prototype.isPrototypeOf` | One returns the immediate prototype; the other asks whether its receiver appears anywhere in another object's chain. |
| `Object.prototype.__proto__ (legacy accessor)` vs `Object.create` | Legacy accessor mutates an existing object; Object.create establishes a prototype when creating a new object. |
| `Object.is` vs `===` | SameValue equates NaN with itself and distinguishes signed zeros; strict equality does the opposite for these two cases. |

# Examples

```js
const nested = { value: 1 };
const config = { nested, enabled: true };
Object.freeze(config);
config.nested.value = 2; // succeeds: freeze is shallow
// config.enabled = false; // fails in strict code

const sealed = Object.seal({ count: 1 });
sealed.count = 2; // succeeds: writable data property remains writable
// delete sealed.count; // fails in strict code: property is non-configurable
```

```js
const source = Object.defineProperty({}, "__proto__", {
  value: { polluted: true }, enumerable: true,
});
const assigned = Object.assign({}, source); // may invoke target's legacy __proto__ setter
const spread = { ...source }; // creates an own data property instead
console.log(Object.getPrototypeOf(spread) === Object.prototype); // true
console.log(Object.hasOwn(spread, "__proto__")); // true
```

The second example shows why write semantics matter when copying attacker-controlled keys. For security-sensitive merging, validate keys and choose a destination strategy deliberately; object spread is not a complete sanitizer for every data-flow risk.

# Common mistakes

- Treating `.prototype` as the same thing as the object's internal prototype.
- Calling `Object.setPrototypeOf` repeatedly on hot objects; it can have broad performance effects.
- Assuming `Object.assign` copies getter/setter descriptors or is atomic when it throws.
- Calling a frozen object deeply immutable; nested objects and accessor side effects remain.
- Assuming sealed means values cannot change; writable data properties and setters can still change state.
- Treating `Object.isFrozen` as a substitute for validating untrusted data.
- Assuming `Object.prototype.toString` cannot be spoofed with `Symbol.toStringTag`.
- Using the legacy `__proto__`, `__defineGetter__`, `__defineSetter__`, `__lookupGetter__`, or `__lookupSetter__` in new code.

# Knowledge checks with answers

1. **Can a sealed object's writable data value change?** Yes; sealing disables extension and configuration, not writing.
2. **What extra restriction does freezing add over sealing?** It makes own data properties non-writable.
3. **Does freezing recursively freeze nested objects?** No.
4. **Why can `Object.assign` invoke a target setter?** It writes with assignment/set semantics.
5. **What is `Object.is(NaN, NaN)`?** `true`.
6. **Why is `obj.constructor === SomeClass` not a security check?** `constructor` can be shadowed or changed and does not prove trusted origin.

# Sources

- [ECMAScript 2026 ordinary and exotic object behavior](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [ECMAScript 2026 Object methods](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [MDN: Object.setPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)
- [MDN: Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
