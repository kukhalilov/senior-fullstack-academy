
# JavaScript objects, properties, descriptors, and reflection — Reference: Object creation, keys, and property definitions

# Scope and version

This lesson covers the 14 supplied creation and property-model terms in ECMAScript 2026. It distinguishes creating an own property from inheriting one, and explains how object-literal syntax selects keys and values. Descriptor attributes and reflective APIs are treated in the next reference. See [ECMAScript object behavior](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html) and [MDN: Working with objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects).

# How this group fits the mental model

First decide which object is created and what its prototype will be. Then decide which keys are created directly on it. A property's ownership is independent from the object where the creation syntax appears: an object can inherit shared behavior while storing its changing state as own data.

# Supplied names explained

- `Object literal` — An expression such as `{ name: "Ada" }` creates an ordinary object with own properties. Unless a special prototype form is used, its prototype is the current realm's `Object.prototype`. Assignment-style literal properties are writable, enumerable, and configurable. Getters, setters, computed names, shorthand, and spread are other literal forms.
- `Object.create` — `Object.create(proto, properties?)` creates an object with the supplied prototype, which must be an object or `null`; other values cause `TypeError`. The optional second argument defines properties using descriptor objects, so omitted descriptor flags default to false. `Object.create(null)` makes a dictionary without inherited Object methods.
- `Object constructor` — `Object()` and `new Object()` both create an ordinary object when no argument or a nullish argument is supplied. For a non-nullish argument, calling `Object(value)` returns its object conversion; it does not always create a fresh wrapper (objects are returned as themselves). This is different from `Object.create`, which selects an exact prototype.
- `Computed property name` — A bracketed expression such as `{ [keyExpression]: value }` is evaluated and converted by `ToPropertyKey`: a Symbol remains a Symbol; any other key becomes a string. The expression is evaluated once when the literal is evaluated.
- `Property shorthand` — `{ name }` is shorthand for `{ name: name }`, where the identifier is evaluated and its current value becomes the property's value. It does not create a live link to the variable.
- `Spread property` — `{ ...source }` copies enumerable own string and Symbol properties by reading their values and creating data properties on the new literal. Getters on the source run. It does not copy inherited properties, non-enumerable properties, descriptors, or the source prototype. A nullish spread source contributes no properties.
- `String property key` — Any string can be a key, including the empty string or names that cannot use dot syntax. Dot access requires an identifier-like spelling; brackets support arbitrary string expressions. Numeric-looking keys are still strings, with special ordering for array-index keys during own-key enumeration.
- `Symbol property key` — A Symbol is a distinct, non-string key. It is not returned by APIs limited to string keys such as `Object.keys`, but it can be read with brackets and included by `Reflect.ownKeys`, `Object.getOwnPropertySymbols`, spread, and `Object.assign` when enumerable and own.
- `Own property` — A property stored directly on the object. It may be enumerable or hidden and may be a data or accessor property. `Object.hasOwn(obj, key)` tests ownership without traversing the prototype chain.
- `Inherited property` — A property found on an object's prototype or a later prototype. Ordinary reads can access it, and `key in obj` finds it, but `Object.hasOwn(obj, key)` is false. An inherited method called as `obj.method()` receives `obj` as its receiver.
- `Data property` — A property that stores a value and has a `writable` attribute. Ordinary assignment and data definitions create this kind of property. A read returns its stored value unless a Proxy customizes the operation.
- `Accessor property` — A property described by getter and/or setter functions instead of a stored value. A missing getter reads as `undefined`; a missing setter makes assignment fail (strict assignment throws). An accessor may be inherited; its getter/setter runs with the original access receiver.
- `Getter` — A zero-parameter function invoked when the property is read. The getter's `this` is the receiver of the property access, not necessarily the object where the getter was found. Getter syntax in an object literal creates an enumerable, configurable accessor property.
- `Setter` — A one-parameter function invoked when the property is assigned. It receives the assigned value; its `this` is the receiver of the access. A setter does not itself store a value unless its code does so.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Own property` vs `Inherited property` | Directly stored on the object versus found through its prototype chain. |
| `Data property` vs `Accessor property` | Stores a value versus computes/handles access through getter/setter functions. |
| `String property key` vs `Symbol property key` | String-converted key versus a unique Symbol key; APIs may filter by key type. |
| `Object literal` vs `Object.create` | Concise property creation with a usual default prototype versus explicit prototype selection. |
| `Spread property` vs shorthand | Spread reads a set of source properties; shorthand creates one property from a same-named binding. |

# Examples

```js
const id = Symbol("id");
const parent = { describe() { return this.name; } };
const record = Object.create(parent);
Object.assign(record, {
  name: "Nora",
  ["display name"]: "Nora K.",
  [id]: 42,
});
const snapshot = { ...record };

console.log(record.describe()); // "Nora"
console.log(Object.hasOwn(record, "describe")); // false
console.log(Object.hasOwn(snapshot, "describe")); // false: inherited keys aren't spread
console.log(snapshot[id]); // 42: enumerable own Symbol copied
```

```js
let stored = 0;
const temperature = {
  get celsius() { return stored; },
  set celsius(value) { stored = Number(value); },
};
temperature.celsius = "21";
console.log(temperature.celsius); // 21; setter and getter execute
```

# Common mistakes

- Treating a shorthand property as a live binding to the variable. It captures the value at literal evaluation.
- Assuming a Symbol is converted to its description string. It remains a separate key.
- Assuming spread copies the prototype, accessors, or hidden properties. It copies selected values to new own data properties.
- Confusing literal `__proto__: object` syntax with a computed `['__proto__']` data property.
- Assuming `Object.create(proto)` copies `proto`; the new object only links to it.
- Assuming an inherited method's `this` is the prototype where it was found; the call receiver is the object used at the call site.
- Forgetting that null-prototype objects do not inherit `toString` or `hasOwnProperty`.

# Knowledge checks with answers

1. **Can an object own a Symbol property?** Yes; Symbols are valid property keys.
2. **Does spread copy an inherited enumerable property?** No; it copies only enumerable own properties.
3. **Does `{ name }` keep a live reference to variable `name`?** No; it evaluates the variable and stores the resulting value.
4. **What is different about `Object.create(null)`?** Its prototype is null, so inherited Object methods are absent.
5. **Where does an inherited getter's `this` point during `obj.value`?** To `obj`, the receiver of that property access.

# Sources

- [ECMAScript 2026 ordinary and exotic object behavior](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [ECMAScript 2026 Object methods](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: Working with objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects)
