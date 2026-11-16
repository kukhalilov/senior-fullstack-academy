<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript objects, properties, descriptors, and reflection — Core concepts and how they fit together

# Learning objectives

You will be able to describe an object as own properties plus a prototype link; distinguish property lookup from own-property checks; explain data and accessor descriptors; choose the correct enumeration API; predict copying behavior; and explain how object integrity operations constrain later changes.

# Prerequisites

Know JavaScript values, objects, property access, Symbols, functions, and basic inheritance. A property key is always a string or Symbol after conversion. A descriptor is metadata that defines how an own property behaves.

# Core concepts

## Object identity, keys, and creation

Objects are identity-bearing values, not just maps of values. Two objects with identical contents are still different references. A key written as a number or another value in computed property position is converted with `ToPropertyKey`: it becomes a string unless it is a Symbol. Thus `obj[1]` and `obj["1"]` address the same property, while a Symbol key remains distinct.

An ordinary object literal `{}` inherits from the current realm's `Object.prototype`. `new Object()` with no argument or a nullish argument creates an ordinary empty object; with a non-nullish value, `Object(value)` returns its object conversion. `Object.create(proto)` creates an object with exactly the requested prototype, including `null` for no prototype. Null-prototype dictionaries do not inherit `toString` or `hasOwnProperty`.

Object-literal spread copies enumerable own values into the new object. It is not the same as copying the source's prototype or descriptors. A literal `__proto__: proto` in an object initializer is special prototype-setting syntax; a computed key `['__proto__']` is an ordinary string property.

## Own properties, inheritance, and reads

Property lookup checks the receiver's own property first and then its prototype chain. `key in object` answers whether lookup can find a property anywhere in that chain. `Object.hasOwn(object, key)` answers only whether the object itself owns it, even when the property is non-enumerable or Symbol-keyed. `Object.hasOwn` is safer than calling `object.hasOwnProperty(key)`, which may be shadowed or missing on a null-prototype object.

Reading an accessor property invokes its getter with the actual receiver. Writing may invoke a setter found on the object or its prototype. The prototype where a setter is found is not necessarily the object on which the property access began; the receiver is the original object. If an inherited data property is writable, assignment normally creates/updates an own property on the receiver rather than editing the prototype's slot.

## Data and accessor descriptors

A data descriptor has `value` and `writable`. An accessor descriptor has `get` and `set`. Both kinds have `enumerable` and `configurable`. A descriptor cannot mix the data and accessor fields. For a new property, omitted Boolean attributes default to false and absent value/get/set defaults to `undefined`; this differs from object literal assignment, which creates writable, enumerable, configurable data properties.

For an existing property, omitted descriptor fields leave their current settings unchanged. A configurable property can generally change kind or attributes. A non-configurable property cannot be deleted or made configurable again, and its kind/enumerability cannot be changed; if it is a non-writable data property, its value cannot be changed to a different value or made writable again. There are narrowly permitted transitions such as making a non-configurable writable data property non-writable.

`Object.defineProperty` and `Object.defineProperties` use descriptor rules and throw when a requested change cannot be applied. Ordinary assignment uses the object's set behavior, may invoke a setter, and in strict code throws when a write fails; in non-strict code a failed assignment can fail silently. Proxies can customize reflective operations subject to invariants.

## Enumerability and key selection

Ownership, enumerability, and key type are independent dimensions. For ordinary objects, own string keys that are array indices appear first in ascending numeric order, other string keys follow creation order, and Symbol keys follow in creation order. API choice changes which dimensions are included:

| API | Own only? | Enumerable only? | Key types |
| --- | --- | --- | --- |
| `Object.keys`, `values`, `entries` | Yes | Yes | Strings only |
| `Object.getOwnPropertyNames` | Yes | No | Strings only |
| `Object.getOwnPropertySymbols` | Yes | No | Symbols only |
| `Object.getOwnPropertyDescriptors` | Yes | No | Strings and Symbols |
| `for...in` | No; traverses prototypes | Yes | Strings only |
| `Reflect.ownKeys` | Yes | No | Strings and Symbols |

`Object.entries` and `Object.values` read property values, so enumerable getters run. `Object.keys` returns keys without reading their values. `Object.getOwnPropertyDescriptor(s)` reports descriptors without invoking a property's getter, though a Proxy can intercept the reflective request.

## Copying and transforming

`Object.assign(target, ...sources)` processes each source's enumerable own string and Symbol keys, reads each value, then writes it to the target using set semantics. It can trigger source getters and target setters, returns the target, and may leave earlier writes in place if a later write throws. Nullish sources are ignored; a nullish target throws. It is shallow and copies values rather than descriptors.

Object spread also reads enumerable own string and Symbol values and creates data properties on the new object. It does not write through setters inherited by that destination. `Object.fromEntries(iterable)` consumes key/value pairs and creates own data properties; unlike `Object.entries`, it can create Symbol keys because the input is an iterable of pairs. `Object.groupBy(items, callback)` groups an iterable by callback-produced property keys into arrays and returns a null-prototype object. For arbitrary object identity keys, use `Map.groupBy` from the Map lesson.

## Integrity levels

`Object.preventExtensions` disallows new own properties. `Object.seal` also makes existing own properties non-configurable. `Object.freeze` additionally makes own data properties non-writable. Each is shallow: a referenced child object remains independently mutable. Accessor getters may still compute changing results from external state; freezing does not remove their behavior. A non-empty typed array cannot be frozen because its indexed elements are special integer-indexed properties.

# Mechanisms and relationships

To investigate a surprising property, follow this order:

1. Convert the key mentally to a string or Symbol.
2. Ask whether the property is own or inherited.
3. If own, inspect its descriptor: data or accessor; enumerable, configurable, writable flags.
4. Identify the operation: read, assignment, define, enumeration, copy, or integrity change.
5. Determine whether that operation includes this ownership/key/flag combination and whether it invokes getter, setter, or Proxy trap.

This avoids conflating “exists,” “enumerated,” “copied,” and “can be assigned.” Those are different questions.

# Worked examples

```js
const proto = { score: 1 };
const player = Object.create(proto);
player.name = "Lee";
Object.defineProperty(player, "token", { value: "hidden" });

console.log("score" in player); // true: inherited
console.log(Object.hasOwn(player, "score")); // false
console.log(Object.keys(player)); // ["name"]
console.log(Object.getOwnPropertyNames(player)); // ["name", "token"]

player.score = 9; // creates an own property; proto.score remains 1
console.log(player.score, proto.score); // 9, 1
```

The `token` descriptor omitted all flags, so the property is non-writable, non-enumerable, and non-configurable. Assignment to inherited writable `score` shadows the inherited value with a new own property.

```js
const events = ["open", "close", "open"];
const grouped = Object.groupBy(events, event => event);
console.log(Object.getPrototypeOf(grouped)); // null
console.log(grouped.open); // ["open", "open"]
```

# Misconceptions and edge cases

- “Objects are just string-keyed dictionaries.” Symbols are property keys, descriptors affect behavior, and prototypes participate in reads.
- “If `key in obj` is true, the object owns it.” The property may be inherited.
- “`Object.keys` lists every key.” It lists only own enumerable string keys.
- “Spread clones an object.” It makes a shallow object of selected property values and does not preserve prototype or descriptors.
- “`Object.assign` preserves getters.” It invokes a source getter and writes its result as a value.
- “`Object.freeze` deep-freezes.” Nested references remain mutable unless separately protected.
- “A descriptor with `{ value: 1 }` matches assignment.” On a new property, the descriptor defaults make it non-writable, non-enumerable, and non-configurable.
- “`Object.groupBy` always returns a normal `{}`.” The standard result has a null prototype.
- “`Object.is` is the same as `===`.” It treats NaN as equal to itself and distinguishes positive from negative zero.
- Legacy `__proto__` accessors and getter-definition helpers should not be chosen for new code.

# Knowledge checks with answers

1. **Does `in` include inherited properties?** Yes; `Object.hasOwn` does not.
2. **What happens to a new descriptor's omitted `enumerable` flag?** It defaults to false.
3. **Does spread copy a getter descriptor?** No; it reads the value and creates a data property.
4. **Can `Object.keys` return a Symbol key?** No.
5. **Does freezing an object freeze its nested child?** No; integrity changes are shallow.
6. **Which built-in grouping utility retains arbitrary group keys?** `Map.groupBy`; `Object.groupBy` converts callback results to property keys.

# Sources

- [ECMAScript 2026 ordinary and exotic object behavior](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [ECMAScript 2026 Object and fundamental-object methods](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: Property enumerability and ownership](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties)
- [MDN: Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)
