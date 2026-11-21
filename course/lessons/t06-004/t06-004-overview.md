
# JavaScript objects, properties, descriptors, and reflection — Big-picture orientation and mental model

# Problem and purpose

Objects connect keys to values and behavior. A property can be stored directly on an object or found by following its prototype chain. Some properties are ordinary values; others compute a value with a getter or respond to assignment with a setter. The language provides reflective APIs to inspect, define, copy, group, and restrict properties. Understanding these distinctions prevents common errors in object copying, security checks, and inheritance.

# Plain-language mental model

Think of an object as a cabinet with labeled slots and a pointer to another cabinet. A property key is a label (string or Symbol). An own property is in this cabinet; an inherited property is found by following the pointer. A descriptor is the rule card for a slot: whether it can be changed, listed, or assigned, or whether reading and writing run functions.

Reflection is the inspection toolkit. Some tools list only visible own string keys; others include hidden keys or Symbols. Copying usually copies property values, not the original rule cards. Integrity operations lock the current cabinet's structure and property rules, but do not recursively lock objects stored inside it.

# How the parts fit together

1. Object literals, `Object`, and `Object.create` create objects with different initial prototype relationships.
2. Property syntax converts a computed key to a string or Symbol and either reads, writes, or defines a property.
3. A read may find an own property or continue through the prototype chain. A descriptor decides whether the result is a value or getter result.
4. Reflection APIs select properties by ownership, key type, and enumerability, or inspect/change descriptors and prototypes.
5. Copy and grouping utilities apply their own selection and write rules; `assign`, spread, and `fromEntries` do not copy descriptor behavior.
6. Integrity methods prevent extensions, seal, or freeze an object shallowly.

# Concept map

| Need | Main distinction | Examples |
| --- | --- | --- |
| Create an object | Initial prototype | `{}`, `Object.create(proto)`, `Object.create(null)` |
| Define behavior | Data or accessor property | Assignment, getter/setter, `Object.defineProperty` |
| Find a value | Own then inherited lookup | `obj.key`, `key in obj` |
| Inspect keys | Own/inherited, enumerable, string/Symbol | `Object.keys`, `getOwnPropertyNames`, `getOwnPropertySymbols` |
| Copy data | Which keys and how destination is written | `Object.assign`, object spread, `Object.fromEntries` |
| Restrict changes | Add, delete/configure, or write | `preventExtensions`, `seal`, `freeze` |

# End-to-end walkthrough

```js
const secret = Symbol("secret");
const source = Object.create({ inherited: "prototype value" });
Object.defineProperties(source, {
  count: { value: 2, writable: true, enumerable: true, configurable: true },
  doubled: { get() { return this.count * 2; }, enumerable: true, configurable: true },
  hidden: { value: "not listed by Object.keys", enumerable: false },
});
source[secret] = "symbol value";

console.log(Object.keys(source)); // ["count", "doubled"]
console.log("inherited" in source, Object.hasOwn(source, "inherited")); // true, false
console.log(Object.getOwnPropertyDescriptor(source, "doubled").get instanceof Function); // true
const copy = { ...source }; // reads enumerable own values; doubled's getter runs
console.log(copy.doubled, Object.hasOwn(copy, secret)); // 4, true
Object.freeze(copy); // shallow integrity restriction
```

Each operation answers a different question. Enumeration does not include inherited or non-enumerable properties; spread includes enumerable Symbols. The getter is read during spread, so the copied property is a value, not the original accessor.

# When to use it and tradeoffs

Use ordinary object literals for records and `Object.create(null)` for dictionaries where inherited keys are unwanted. Use `Object.hasOwn` for direct ownership checks. Use descriptors when access behavior or mutation rules are part of the design. Prefer copying into a fresh object over mutating prototypes. Treat `freeze` as shallow protection against accidental changes, not deep immutability or a security boundary against code that retains mutable nested references.

# What later lessons cover

The concepts lesson builds a property and descriptor model. Reference lessons explain object creation and keys, descriptor/reflection APIs, and prototype/integrity methods. Practice compares enumeration, copying, descriptors, and integrity operations. Interview questions target ownership checks, `assign` versus spread, and shallow freezing.

# Sources

- [ECMAScript 2026 ordinary and exotic object behavior](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [ECMAScript 2026 Object and fundamental-object methods](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: Working with objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects)
- [MDN: Property enumerability and ownership](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties)
