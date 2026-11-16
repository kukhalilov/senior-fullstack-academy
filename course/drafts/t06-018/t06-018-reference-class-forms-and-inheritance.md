<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript classes, inheritance, and private elements — Reference: Class declarations, expressions, methods, and inheritance

## Scope and version

This reference covers the supplied class binding forms, constructor behavior, methods/accessors, and inheritance semantics through ECMAScript 2026. It includes the standardized ES2022 class-field additions as context; see [ECMAScript functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html), [strict-mode code](https://tc39.es/ecma262/2026/multipage/ecmascript-language-source-code.html), and [MDN Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).

## How this group fits the mental model

A class creates a constructor and a prototype-based instance behavior model. Declarations and expressions differ mainly in how they produce and bind the class value. Inheritance connects both the instance prototype and constructor chains. Method forms decide where a function is installed and how access behaves; constructor rules determine when a usable `this` exists.

## Supplied names explained

- `Class declaration` — A lexical declaration such as `class User {}`. It creates a class binding with a temporal dead zone before initialization, like other lexical bindings. It cannot be redeclared in the same lexical scope and its body is strict mode code.
- `Class declaration temporal dead zone` — The period from entering the declaration's lexical scope until the class declaration is evaluated. Reading or using the binding earlier throws `ReferenceError`; class declarations are not usable like hoisted function declarations.
- `Class expression` — An expression that evaluates to a class value, for example `const Builder = class {}`. It can be anonymous or named and can be used wherever an expression is accepted.
- `Class expression inner name binding` — In `const Builder = class Internal { ... }`, `Internal` is visible inside the class body (including methods) but does not create an outer binding. The assigned variable is `Builder`.
- `Class strict mode` — All code in a class body, including method bodies, is strict mode. For example, a plain call of a class method with `this` set to `undefined` does not substitute the global object.
- `Class cannot be called without new` — A class constructor used as a normal function call throws `TypeError`; it must be invoked through construction. A method named `constructor` is the class's constructor definition, not an ordinary callable initializer.
- `extends clause` — Syntax that supplies the class heritage, e.g. `class Child extends Parent {}`. The heritage expression is evaluated when the class is defined and must produce `null` or a valid constructor with an object-or-null prototype.
- `Base class` — A class with no `extends` clause. Its constructor receives a newly created `this` before the body, and its instance prototype normally inherits from `Object.prototype`.
- `Derived class` — A class with an `extends` clause. Its constructor begins with uninitialized `this`; it establishes the instance by calling `super()` or can explicitly return an object in the allowed derived-constructor case.
- `Class heritage expression` — The expression after `extends`, which can be a binding, conditional result, or function call. It is evaluated once during class definition, not once per instance. Invalid values cause `TypeError`.
- `constructor method` — The single non-static method named `constructor` that defines explicit construction behavior. It is not an ordinary instance method on the prototype; class syntax rejects multiple constructor definitions, static constructors, and generator/accessor forms named constructor.
- `Default base constructor` — The constructor supplied when a base class omits one. It accepts the construction arguments but does not forward them anywhere; it creates the base instance and initializes that class's instance elements.
- `Default derived constructor` — The constructor supplied when a derived class omits one. It behaves like forwarding its arguments to `super(...args)`, then returns the resulting `this`.
- `super() call` — In a derived constructor, invokes the base constructor and initializes the derived constructor's `this`. It must be used before `this` is read. In a base constructor, `super()` is a syntax error.
- `super property access` — A property lookup through the prototype of the method's home object, such as `super.run()`. The call receiver remains the current `this`; it is not equivalent to looking up the property on `this` itself.
- `new.target in constructor` — `new.target` is the constructor used as the `new` target, or `undefined` when the function is called normally (class constructors themselves cannot be called normally). During base construction via a derived class, it can identify the most-derived constructor.
- `Computed class element name` — A class method, accessor, or public field may use a computed property name such as `[makeName()]() {}` or `[key] = value`. The expression is evaluated during class definition; it is not re-evaluated per instance. Private names are not computed.
- `Instance method` — A non-static method is installed on the class prototype and shared by instances. It receives the call's `this` as its receiver; extracting it does not automatically bind it.
- `Static method` — A method installed on the constructor object rather than the instance prototype. It is called through the class (or a derived constructor when inherited) and its `this` depends on the call receiver.
- `Generator method` — A method declared with `*name() {}`. Calling it returns a generator object; its body runs as that generator is advanced. It may be static or instance-level.
- `Async method` — A method declared with `async name() {}`. Calling it returns a Promise; the body can use `await`. It may be static or instance-level.
- `Async generator method` — A method declared with `async *name() {}`. It returns an async generator object whose requests produce promise-backed iterator results; the body can use both `await` and `yield`.
- `Instance getter` — A non-static accessor declared `get name() {}`. Reading the property invokes the getter with the receiver as `this`; it has no call parentheses at the access site.
- `Instance setter` — A non-static accessor declared `set name(value) {}`. Assigning the property invokes the setter with the receiver and supplied value; it does not itself create a backing field unless its body does so.
- `Static getter` — A getter defined on the constructor object. Reading its property through the class invokes it with the class (or derived constructor) as the receiver.
- `Static setter` — A setter defined on the constructor object. Assignment through the constructor invokes it with the receiving constructor as `this`.

## Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Class declaration` / `Class expression` | Lexical declaration binding versus a value-producing expression |
| `Instance method` / `Static method` | Stored on the prototype for instances versus on the constructor object |
| `Base class` / `Derived class` | `this` exists on entry versus it is established through `super()` (unless returning an object directly) |
| `Default base constructor` / `Default derived constructor` | Create a base instance versus forward arguments to the base constructor |
| Method / accessor | Explicit invocation versus property read or assignment invoking behavior |

## Examples

```js
const Factory = class HiddenName {
  static create() { return new HiddenName(); }
  describe() { return this.constructor.name; }
};

class Base {
  constructor(value) { this.value = value; }
  describe() { return `base:${this.value}`; }
}

class Child extends Base {
  constructor(value) {
    super(value);
    this.ready = true;
  }
  describe() { return `${super.describe()}:child`; }
  static make(value) { return new this(value); }
  *steps() { yield 1; yield 2; }
  async load() { return await Promise.resolve(this.value); }
}

console.log(new Child("x").describe()); // "base:x:child"
console.log(Child.make("y").ready);     // true
```

## Common mistakes

- Assuming a class declaration is available before its declaration is evaluated.
- Treating a named class-expression name as an outer binding.
- Calling a class constructor without `new`.
- Reading `this` in a derived constructor before `super()` returns.
- Treating `super.method()` as `this.method()`; `super` changes lookup base while preserving the receiver.
- Assuming instance methods are copied onto each instance or automatically bound.
- Assuming the default derived constructor ignores arguments; it forwards them to the base constructor.
- Assuming a computed name expression reruns for each constructed object.
- Treating getters/setters as ordinary methods that require parentheses.

## Knowledge checks with answers

1. **Where can a named class-expression identifier be used?** Within that class expression's own body, not as a surrounding binding.
2. **Where does an instance method live?** On the class prototype.
3. **What does a default derived constructor do?** Forwards received arguments to the base constructor using `super(...args)`.
4. **What does `super.method()` preserve?** The current `this` receiver while looking up from the method's home-object prototype.
5. **Does a computed method name run per instance?** No, the name expression is evaluated during class definition.
6. **What does an async generator method return?** An async generator object.

## Further reading

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 strict mode](https://tc39.es/ecma262/2026/multipage/ecmascript-language-source-code.html)
- [MDN Classes reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [MDN constructor method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor)
