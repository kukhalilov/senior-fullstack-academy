<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript classes, inheritance, and private elements — Core concepts and how they fit together

## Learning objectives

- Explain how JavaScript classes relate to constructor functions and prototypes.
- Distinguish class declaration and expression scope, including the inner class-expression name.
- Trace base and derived construction, `super`, `this`, `new.target`, and field initialization.
- Distinguish prototype methods, static members, public fields, and private elements.
- Predict the order and effects of instance and static initialization.

## Prerequisites

You should understand functions, objects, property lookup, prototypes, `this`, lexical bindings, and `new`. An own property belongs directly to one object; an inherited property is found through its prototype chain. A constructor is a function that can be invoked by `new` to create an object.

## Core concepts

### Classes build on the prototype model

A class evaluation creates a constructor function and a prototype object. Instance methods and accessors are installed on the prototype; static methods and accessors are installed on the constructor. Instance fields are initialized on each constructed object, while static fields are own properties of the constructor. Class syntax enforces rules that ordinary functions do not: class constructors cannot be called without `new`, and all class code is strict mode.

Class declarations use lexical bindings and cannot be accessed before initialization. A named class expression also has an inner name binding available inside its own class body; that name does not become a surrounding variable. The class declaration identifier is a lexical binding subject to the temporal dead zone before its declaration is evaluated.

### Inheritance links instances and constructors

For `class Child extends Parent`, the child prototype inherits from `Parent.prototype`, and the Child constructor inherits from Parent. An `extends` expression is evaluated when the class is evaluated. It must produce `null` or a constructor whose `prototype` is an object or `null`; invalid heritage throws `TypeError`.

A base constructor creates `this` before running. A derived constructor begins without an initialized `this`; `super()` constructs/initializes the base portion and establishes the derived `this`. Only after that can the derived constructor access `this`. `super.method()` is a property lookup through the method's home object's prototype; it is not simply another constructor call. `new.target` identifies the constructor ultimately invoked with `new`, which can be a derived class even while base construction is running.

If no constructor is written, JavaScript supplies a default one. A default base constructor creates the instance. A default derived constructor forwards its arguments to the base constructor. An explicit derived constructor must initialize `this` through `super()` unless it returns an object directly; returning a primitive before `this` is initialized throws.

### Methods are shared; fields are initialized state

Methods are functions shared through a class prototype or constructor. Calling an instance method normally gets its receiver from the object before the dot. Extracting a method and calling it without its receiver can lose the instance `this`; class methods are strict and do not substitute the global object as `this`.

Public fields create own properties using define-own-property semantics. They do not invoke an inherited setter the way `this.name = value` would. A field without an initializer still exists with value `undefined`. Each initializer expression runs for every instance that receives that field.

For a base class, instance fields initialize before the base constructor body. For a derived class, they initialize after `super()` returns and before the rest of the derived constructor body. Fields initialize in declaration order. An earlier field initializer can read fields already initialized above it; a later public field is still absent/undefined, and accessing a later private field before it is initialized throws `TypeError`.

### Private elements are lexically scoped names

A private name such as `#secret` is not a string property and is not accessible through bracket notation, reflection, or code outside the lexical class scope that declares it. Private instance elements are installed on instances during class initialization; private static elements belong to the declaring class constructor. They are not inherited as if they were public fields: a subclass method cannot directly use a base class's private name unless that code is lexically inside the base class.

`#secret in object` is a private brand check. It tests whether the object has the private element associated with that lexical name; it can safely guard a later private access, and unlike `instanceof`, it does not consult a public `Symbol.hasInstance` customization or merely follow a prototype chain. It is not a general proof of `instanceof` ancestry: a base constructor can return an unrelated object which then receives the derived class's fields and private brand. For a private static member, the brand is the declaring class object, not every subclass constructor.

### Static elements run during class evaluation

Static methods are defined on the constructor. Static fields and static initialization blocks execute during evaluation of the class, in source order among static elements. A superclass completes its static initialization before the subclass's. In a static field initializer or static block, `this` is the class constructor; `super.property` can access inherited static properties. A block has its own lexical scope and can access the class's private names. It is synchronous: `await` and `yield` are not allowed directly in the block.

## Mechanisms and relationships

```text
class evaluation
  ├─ evaluate heritage and create constructor/prototype links
  ├─ install methods/accessors and establish private names
  └─ run static fields and blocks in declaration order

new Derived(...args)
  ├─ begin derived constructor without initialized this
  ├─ super(...args) → run base construction and base field initializers
  ├─ initialize derived instance fields in declaration order
  └─ continue derived constructor body
```

This model explains why a base constructor can call an overridden method before derived fields exist: method lookup can already reach the derived prototype, but the derived instance's fields have not yet initialized.

## Worked examples

### A base constructor calls an overridden method

```js
class Base {
  constructor() { this.describe(); }
  describe() { console.log("base"); }
}

class Child extends Base {
  message = "ready";
  describe() { console.log(this.message); }
}

new Child(); // undefined
```

The method lookup reaches `Child.prototype.describe`, but `Child.message` initializes only after the base constructor returns. This is a reason to avoid calling overridable methods from constructors.

### A class field does not invoke an inherited setter

```js
class Parent {
  set value(next) { console.log("setter", next); }
}
class Child extends Parent {
  value = 3;
}
new Child(); // no setter output
```

The field defines an own property. Replacing the field with `this.value = 3` in a derived constructor after `super()` would perform ordinary assignment and invoke the inherited setter.

### Private brand check

```js
class Token {
  #value;
  constructor(value) { this.#value = value; }
  static hasValue(object) { return #value in object; }
}

console.log(Token.hasValue(new Token(4))); // true
console.log(Token.hasValue({}));           // false
```

The private identifier in the check is resolved lexically inside `Token`; it is not a runtime string key.

## Misconceptions and edge cases

- **“Classes replace prototypes.”** Class instances still use prototype chains.
- **“A class body is just object-literal syntax.”** It creates a constructor/prototype structure and applies class-specific rules.
- **“A derived constructor can read `this` before `super()`.”** It cannot; `this` is uninitialized.
- **“All fields initialize before any constructor body.”** Base and derived classes have different timing.
- **“A field assignment is equivalent to `this.x = value`.”** Field definitions do not invoke inherited setters.
- **“Private fields are hidden string properties.”** Private names have lexical identity and special access semantics.
- **“A child automatically has the base class's private fields.”** Only code in the declaring class can use its private name; each constructor's initialization is distinct.
- **“Static fields initialize after all classes are declared.”** They run during class evaluation; derived class evaluation follows the base.
- **“A base constructor sees initialized child fields.”** The base constructor runs before derived instance fields initialize.

## Knowledge checks with answers

1. **Where is an instance method normally stored?** On the class prototype, shared by instances.
2. **When do derived instance fields initialize?** Immediately after `super()` returns, before the rest of the derived constructor body.
3. **What does `super.method()` use as its lookup base?** The prototype of the method's home object; the call receiver remains the current `this`.
4. **Can outside code read `object["#secret"]` to access `#secret`?** No. A private name is not a string property.
5. **Do public class fields invoke inherited setters?** No; fields use define-own-property semantics.
6. **When does a static initialization block execute?** During class definition evaluation, in source order with static fields.
7. **Why can an overridden method called from a base constructor see `undefined` child state?** The prototype method is available, but child instance fields initialize only after the base constructor returns.

## Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 source code and strict mode](https://tc39.es/ecma262/2026/multipage/ecmascript-language-source-code.html)
- [MDN Classes reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [MDN Public class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields)
- [MDN Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)
- [MDN Static initialization blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks)
