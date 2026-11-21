
# JavaScript classes, inheritance, and private elements — Exercises and worked solutions

## Goals

Trace class evaluation and instance construction; distinguish shared methods from initialized fields; use private state and brand checks; and predict which constructor or initializer runs first. Try each exercise before reading its solution.

## Worked example

Predict the log order:

```js
class Base {
  base = console.log("base field");
  constructor() { console.log("base constructor"); }
}

class Child extends Base {
  child = console.log("child field");
  constructor() {
    console.log("before super");
    super();
    console.log("after super");
  }
}

new Child();
```

The output is:

```text
before super
base field
base constructor
child field
after super
```

The derived constructor can execute statements before `super()`, but cannot access `this` there. Base fields run before the base constructor body. When `super()` returns, derived fields initialize before the derived body resumes.

## Exercises

### 1. Constructor timeline

Add log statements to a base and derived class so you can show the order of: base field, base constructor, derived field, derived constructor before `super()`, and derived constructor after `super()`.

### 2. Setter or field definition?

Create a base class with a setter named `value`, then a derived class with a public instance field of the same name. Determine whether construction invokes the setter. Change the derived class to assign `this.value` in its constructor and compare.

### 3. Private data and brand check

Implement a class `Vault` with a private instance field `#secret`, a constructor that stores a value, a method that reads it, and a static method that safely reports whether an object carries this class's `#secret` private element using `#secret in object`. Ensure null and primitive inputs do not cause a brand-check TypeError. Explain why this is a brand test rather than a universal `instanceof Vault` replacement.

### 4. Static initialization order

Create a base class and a derived class, each with two static fields and a static block that append labels to an array. Predict and display the order. Include a field and a block interleaved in each class.

### 5. Prototype method versus own field

Create two instances of a class with an instance method and a public field. Use `Object.hasOwn` and identity checks to determine which is shared and which is per-instance. Explain the result.

### 6. Derived constructor return

Write one derived constructor that returns a replacement object without calling `super()`. Write another that tries to return a primitive without calling `super()`. Explain which can complete and why. Also explain why `class A extends null {}` needs a custom constructor that returns an object without trying to call `super()`.

### 7. Proxy and private brand

Create a class with a private field, then wrap an instance in an empty `Proxy`. Compare the private brand check and private read on the original instance and the proxy. Explain why forwarding ordinary property operations does not forward private elements.

### 8. Class property descriptors

Inspect the descriptors for a public instance field, a prototype method, and a class constructor's own `prototype` property. Identify which properties are enumerable and writable. Explain why the prototype object can still be changed even though the constructor's `prototype` property cannot be reassigned.

## Progressive hints

1. Put the first derived log before `super()` but do not read `this` until afterward.
2. A public field defines an own property; ordinary assignment performs property-set behavior and can find the inherited setter.
3. Check that the input is non-null and has object or function type before using `#secret in object`; describe the result as possession of this private brand, not proof of ordinary prototype ancestry.
4. Static fields and blocks are interleaved by source order, and the base class completes before the derived class.
5. Methods are defined on the prototype. Fields are own properties on each instance.
6. A derived constructor can return an object directly, which becomes the constructed value. A primitive return is invalid while `this` is uninitialized.
7. Private brand checks operate on the exact object supplied. A Proxy is not transparent to private names.
8. Compare `Object.getOwnPropertyDescriptor(instance, "field")`, the descriptor on the class prototype, and the descriptor on the constructor itself.

## Complete solutions

### 1. Constructor timeline

```js
class Base {
  base = console.log("base field");
  constructor() { console.log("base constructor"); }
}
class Child extends Base {
  child = console.log("child field");
  constructor() {
    console.log("before super");
    super();
    console.log("after super");
  }
}
new Child();
```

Output: `before super`, `base field`, `base constructor`, `child field`, `after super`. The base fields initialize before its constructor body; derived fields wait until `super()` returns.

### 2. Setter or field definition?

```js
class Base {
  set value(next) { console.log("setter", next); }
}
class FieldChild extends Base {
  value = 5;
}
class AssignmentChild extends Base {
  constructor() {
    super();
    this.value = 5;
  }
}
new FieldChild();      // no output
new AssignmentChild(); // setter 5
```

The field defines an own property without invoking the inherited setter. The constructor assignment uses ordinary assignment and finds the setter on the prototype chain.

### 3. Private data and brand check

```js
class Vault {
  #secret;
  constructor(secret) { this.#secret = secret; }
  read() { return this.#secret; }
  static hasSecret(object) {
    return object !== null &&
      (typeof object === "object" || typeof object === "function") &&
      #secret in object;
  }
}

const vault = new Vault("amber");
console.log(vault.read());              // "amber"
console.log(Vault.hasSecret(vault));    // true
console.log(Vault.hasSecret({}));       // false
console.log(Vault.hasSecret(null));     // false
console.log(Vault.hasSecret(3));        // false
```

The type guard prevents applying the private brand check to a primitive or null. A successful check means this exact class's private name is present; it does not prove ordinary prototype ancestry. For example, a base constructor can return an unrelated object, after which derived fields (including private fields) are initialized on that replacement object:

```js
class Base { constructor() { return {}; } }
class Branded extends Base { #secret = true; static has(value) { return #secret in value; } }
const value = new Branded();
console.log(Branded.has(value)); // true
console.log(value instanceof Branded); // false
```

### 4. Static initialization order

```js
const order = [];
class Base {
  static first = order.push("base field 1");
  static { order.push("base block"); }
  static second = order.push("base field 2");
}
class Child extends Base {
  static first = order.push("child field 1");
  static { order.push("child block"); }
  static second = order.push("child field 2");
}
console.log(order);
// ["base field 1", "base block", "base field 2",
//  "child field 1", "child block", "child field 2"]
```

The base class finishes its static initialization before the derived class is evaluated. Within each class, fields and blocks run in source order.

### 5. Prototype method versus own field

```js
class Example {
  label = "instance";
  describe() { return this.label; }
}
const first = new Example();
const second = new Example();
console.log(first.describe === second.describe); // true
console.log(first.label, second.label); // "instance" "instance"
```

The field declaration gives each instance its own `label` property. Both instances find the same `describe` function through `Example.prototype`.

### 6. Derived constructor return

```js
class Base {}
class Replacement extends Base {
  constructor() { return { replacement: true }; }
}
class Invalid extends Base {
  constructor() { return 1; }
}

console.log(new Replacement()); // { replacement: true }
try {
  new Invalid();
} catch (error) {
  console.log(error.name); // TypeError
}
```

A derived constructor may return an object directly without calling `super()`. Returning a primitive before `this` has been initialized is an error. The replacement object does not receive the derived class's instance fields because `super()` never initialized that class's `this`. When the heritage is `null`, the default derived constructor cannot construct a base from null; a custom constructor may return an object directly without calling `super()`.

### 7. Proxy and private brand

```js
class Secret {
  #value = 3;
  static has(value) { return #value in value; }
  static read(value) { return value.#value; }
}
const target = new Secret();
const proxy = new Proxy(target, {});
console.log(Secret.has(target), Secret.has(proxy)); // true false
try { Secret.read(proxy); } catch (error) { console.log(error.name); } // TypeError
```

The Proxy is a distinct object. Its default traps forward ordinary operations to the target, but private elements are not ordinary properties and are not forwarded. An API that needs to operate on a branded object can explicitly unwrap it or bind calls to the target, while accounting for the security and identity implications.

### 8. Class property descriptors

```js
class Example { field = 1; method() {} }
const instance = new Example();
console.log(Object.getOwnPropertyDescriptor(Example.prototype, "method"));
// { value: [Function: method], writable: true, enumerable: false, configurable: true }
console.log(Object.getOwnPropertyDescriptor(instance, "field"));
// { value: 1, writable: true, enumerable: true, configurable: true }
console.log(Object.getOwnPropertyDescriptor(Example, "prototype").writable); // false
```

Class methods are shared, non-enumerable writable/configurable properties on the prototype. Public fields are own enumerable writable/configurable data properties. The constructor's `prototype` binding cannot be reassigned, but the referenced prototype object remains mutable: methods can be added or replaced on it.

## Tests and edge cases

- A derived constructor may run code before `super()`, but reading or writing `this` there throws `ReferenceError`.
- `super()` can be called only once in a derived constructor; trying to initialize `this` twice throws.
- If an instance field initializer throws, construction aborts and no completed instance is returned.
- A base constructor can dispatch to an overridden derived method before derived fields initialize; avoid relying on derived state during base construction.
- Private static access through a subclass receiver can fail the brand check even though the static method was inherited.
- `#name in null` and `#name in 1` throw `TypeError`; perform an object/function type guard first.
- Static block declarations are scoped to the block; `await`, `yield`, `arguments`, and `super()` are not available there.
- `class A extends null {}` has a null instance-prototype parent; construction requires a custom derived constructor that returns an object without trying to call null as a constructor. For example, `constructor() { return Object.create(new.target.prototype); }` creates an instance with the intended prototype without calling `super()`.

## Reflection questions

Answers follow each question.

1. **Why are fields initialized in declaration order instead of as a batch after construction?** Initializers can depend on earlier fields and their side effects are observable; the specified order makes construction deterministic and ensures each field exists at its defined point.
2. **Which observable behavior differs between a field and an assignment in a constructor?** A field defines an own property without invoking an inherited setter; `this.name = value` performs ordinary assignment and may call one.
3. **Why is a private brand check more specific than a prototype check?** It tests possession of one lexically identified private element and cannot be spoofed by changing the public prototype chain. It also is not identical to `instanceof`: an unrelated replacement object can receive the class's private elements during derived initialization.
4. **What can go wrong when a base constructor calls an overridable method?** Dynamic dispatch may run a child override before child fields initialize, exposing `undefined` state or causing access to an uninitialized private field to throw.
5. **What class-level work belongs in a static block rather than a per-instance field?** One-time synchronous initialization that needs ordered class-level setup, including access to private static state; a field on the instance would repeat for each object.
6. **Does a Proxy preserve the private brand of its target?** No. Private elements belong to the target object itself; the wrapper fails the brand check unless the operation is deliberately forwarded against the target.
7. **How do class method and field descriptors differ?** Methods are non-enumerable properties on the prototype; public fields are enumerable own properties on each instance. Both are writable and configurable by default.

## Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [MDN Public class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields)
- [MDN Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)
- [MDN Static initialization blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks)
