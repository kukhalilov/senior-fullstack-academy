<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

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

Implement a class `Vault` with a private instance field `#secret`, a constructor that stores a value, a method that reads it, and a static method that safely reports whether an object is a `Vault` instance using `#secret in object`. Ensure null and primitive inputs do not cause a brand-check TypeError.

### 4. Static initialization order

Create a base class and a derived class, each with two static fields and a static block that append labels to an array. Predict and display the order. Include a field and a block interleaved in each class.

### 5. Prototype method versus own field

Create two instances of a class with an instance method and a public field. Use `Object.hasOwn` and identity checks to determine which is shared and which is per-instance. Explain the result.

### 6. Derived constructor return

Write one derived constructor that returns a replacement object without calling `super()`. Write another that tries to return a primitive without calling `super()`. Explain which can complete and why.

## Progressive hints

1. Put the first derived log before `super()` but do not read `this` until afterward.
2. A public field defines an own property; ordinary assignment performs property-set behavior and can find the inherited setter.
3. Check that the input is non-null and has object or function type before using `#secret in object`.
4. Static fields and blocks are interleaved by source order, and the base class completes before the derived class.
5. Methods are defined on the prototype. Fields are own properties on each instance.
6. A derived constructor can return an object directly, which becomes the constructed value. A primitive return is invalid while `this` is uninitialized.

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

The type guard prevents applying the private brand check to a primitive or null. A successful check means this exact class's private name is present; it does not compare public properties.

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

A derived constructor may return an object directly without calling `super()`. Returning a primitive before `this` has been initialized is an error. The replacement object does not receive the class's instance fields because `super()` never initialized that class's `this`.

## Tests and edge cases

- A derived constructor may run code before `super()`, but reading or writing `this` there throws `ReferenceError`.
- `super()` can be called only once in a derived constructor; trying to initialize `this` twice throws.
- If an instance field initializer throws, construction aborts and no completed instance is returned.
- A base constructor can dispatch to an overridden derived method before derived fields initialize; avoid relying on derived state during base construction.
- Private static access through a subclass receiver can fail the brand check even though the static method was inherited.
- `#name in null` and `#name in 1` throw `TypeError`; perform an object/function type guard first.
- Static block declarations are scoped to the block; `await`, `yield`, `arguments`, and `super()` are not available there.
- `class A extends null {}` has a null instance-prototype parent; construction requires a custom derived constructor that returns an object without trying to call null as a constructor.

## Reflection questions

1. Why are fields initialized in declaration order instead of as a batch after construction?
2. Which observable behavior differs between a field and an assignment in a constructor?
3. Why is a private brand check more specific than a prototype check?
4. What can go wrong when a base constructor calls an overridable method?
5. What class-level work belongs in a static block rather than a per-instance field?

## Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [MDN Public class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields)
- [MDN Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)
- [MDN Static initialization blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks)
