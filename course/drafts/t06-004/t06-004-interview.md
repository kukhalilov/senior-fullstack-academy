<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript objects, properties, descriptors, and reflection — Interview questions and reasoning

# Core questions

1. What is the difference between an own and inherited property?
2. How do data and accessor properties differ?
3. What are the three descriptor flags?
4. Which properties does `Object.keys` return, and how does that differ from `in`?
5. Compare `Object.assign` with object spread.
6. What does `Object.groupBy` return, and when would you use `Map.groupBy`?
7. What is the difference between `preventExtensions`, `seal`, and `freeze`?
8. Is `Object.freeze` deep immutability?
9. Why is `Object.hasOwn` safer than `obj.hasOwnProperty`?
10. Why can merging untrusted properties create prototype-related risks?

# Concise interview answers

1. **Own properties are stored directly on the object; inherited properties are found via its prototype chain.** `in` checks both; `Object.hasOwn` checks only own properties.
2. **A data property stores a value; an accessor property calls a getter on read and/or setter on write.** Both use enumerable and configurable flags.
3. **`writable`, `enumerable`, and `configurable`.** Writable applies to data properties; accessors instead have get/set functions.
4. **`Object.keys` returns own enumerable string keys only.** `in` includes inherited properties and does not filter by enumerability.
5. **Both copy enumerable own values, including Symbols.** Assign writes to a supplied target using set semantics; spread creates data properties on a fresh object. Both are shallow and run source getters.
6. **`Object.groupBy` returns arrays grouped under property keys in a null-prototype object.** Use `Map.groupBy` for arbitrary key values such as object identity.
7. **Prevent-extensions blocks new own properties; seal additionally blocks deletion/reconfiguration; freeze additionally blocks writes to own data values.**
8. **No.** It constrains one object's own properties; nested objects remain mutable unless frozen separately.
9. **The method can be shadowed or absent.** `Object.hasOwn` is a static method that works with null-prototype objects and hostile key names.
10. **A write can hit inherited setters such as the legacy `__proto__` accessor.** Validate data keys and understand whether the copy API uses assignment or data-property creation.

# Deep follow-up answers

## How should you choose a reflection method?

Start by deciding whether inherited properties matter, whether hidden properties matter, and whether Symbols matter. `Object.keys` is often right for enumerable own string data. `Object.getOwnPropertyNames` includes hidden string keys; `Object.getOwnPropertySymbols` covers own Symbols; `Reflect.ownKeys` returns all own keys. `for...in` traverses enumerable string properties including inherited ones and therefore needs care when a record-only view is intended. Methods that return values read selected properties and may execute getters; descriptor inspection avoids invoking the getter itself.

## What does a descriptor change guarantee?

`Object.defineProperty` requests an own-property definition and validates it against the current descriptor and extensibility state. New property descriptor fields default conservatively: false Boolean flags and undefined value/accessors. Partial redefinitions preserve fields already present. Non-configurable properties sharply limit changes. This API is not a general “assignment but with options” because it bypasses inherited setters and applies validation rules directly to the target property.

## Why are assign and spread not equivalent?

Both enumerate enumerable own string/Symbol source keys, read their values (so getters run), and make shallow copies. Assign uses set semantics on the provided target, so inherited or own target setters can run and errors may follow partial mutation. Spread defines data properties on a new object, so an inherited setter does not intercept creation. Both flatten source accessors to their current values and do not preserve descriptors or prototype links.

## What are the practical limits of integrity levels?

Integrity checks are shallow property-structure controls. A frozen property may still reference a mutable object; an accessor can continue to compute values or mutate external state. Sealing leaves writable data properties writable. Freeze is useful for preventing accidental writes to a configuration record, but it does not validate the record, isolate it from hostile code, or recursively freeze a graph. Non-empty typed arrays are an important exception that cannot be frozen due to their indexed storage semantics.

## How do you reduce prototype-pollution exposure?

Avoid blindly assigning untrusted keys to ordinary objects when prototype-sensitive names can reach setters. Validate/allow-list keys, use a null-prototype dictionary where suitable, and choose a copy operation whose property-creation behavior is understood. `Object.hasOwn` is preferable for checks. No single copying syntax makes untrusted data safe: downstream code may still interpret special keys or values dangerously.

# Scenario questions

1. **A required field is inherited, not supplied by the input. Does `"field" in input` validate own input?** No. Use `Object.hasOwn(input, "field")` if own presence is required, then validate the value's type and constraints.
2. **A shallow copy unexpectedly contains a computed getter result. Why?** Spread or assign read the source getter and copied its returned value into a data property.
3. **A frozen configuration contains a mutable array. Can callers modify the array?** Yes, unless the array is separately protected or not exposed.
4. **A symbol-backed property is missing from `Object.keys`. Is it absent?** Not necessarily. Query it directly or use `Object.getOwnPropertySymbols` / `Reflect.ownKeys`.
5. **A data merge changed an object's prototype. What should be investigated?** Whether a `__proto__` key was assigned to an ordinary target, which invokes the legacy setter; review the merge source and target write semantics.

# Tradeoffs and alternatives

- **Object literal:** readable, direct record creation; default prototype includes inherited names.
- **Null-prototype dictionary:** avoids inherited keys/methods; requires static reflection and may surprise utilities expecting ordinary objects.
- **Descriptors:** precise behavior and metadata; more verbose and easier to create unexpectedly non-writable/non-enumerable properties.
- **Object.assign:** convenient in-place shallow merge; target setters, partial mutation, and prototype-sensitive keys matter.
- **Object spread:** convenient fresh shallow copy; still invokes source getters and loses descriptors/prototype.
- **Map:** arbitrary key identity and explicit collection API; not interchangeable with JSON-shaped records or property access.
- **Freeze:** blocks direct structural/data changes; does not provide deep immutability or input validation.

# Common weak answers

- “`Object.keys` gets all keys.” It excludes Symbols, inherited properties, and non-enumerables.
- “A getter is just a stored value.” Reading it runs code.
- “Spread clones the object.” It copies selected values, not prototype or descriptors.
- “Frozen means deeply immutable.” Nested references and external state can still change.
- “`hasOwnProperty` is always safe.” An object can shadow it or not inherit it.
- “`Object.assign` and spread are identical.” Their target write behavior differs.
- “`constructor` proves an instance's type.” It is just a mutable/inherited property convention.

# Self-check rubric

Score 0 (cannot explain), 1 (can recall), or 2 (can predict a new example):

| Skill | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Ownership and prototype lookup | Confuses own and inherited | Defines both | Predicts `in` and own checks |
| Descriptor semantics | Mixes data/accessor flags | Names the fields | Predicts defaults and legal transitions |
| Key enumeration | Treats all APIs alike | Knows string vs Symbol | Selects exact API by all three dimensions |
| Copy behavior | Says shallow clone | Knows selected values | Predicts getter/setter and `__proto__` effects |
| Integrity | Says frozen/deep | Separates seal/freeze | Explains nested and typed-array limits |

Aim for 8/10 or higher. For missed items, write down the own/inherited, enumerable/hidden, string/Symbol dimensions before choosing an API.

# Sources

- [ECMAScript 2026 ordinary object behavior](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [ECMAScript 2026 Object methods](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: Property enumerability and ownership](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties)
- [MDN: Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [MDN: Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
