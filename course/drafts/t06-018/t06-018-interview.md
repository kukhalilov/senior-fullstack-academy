<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript classes, inheritance, and private elements — Interview questions and reasoning

## Core questions

1. Are JavaScript classes a separate object model from prototypes?
2. What is the scope difference between a class declaration and a named class expression?
3. How do base and derived constructors initialize `this`?
4. What does `super.method()` mean?
5. Where do instance methods and static methods live?
6. How do public fields differ from constructor assignment?
7. When do base and derived fields initialize?
8. What makes a private name different from a string property?
9. What does `#field in object` check?
10. When and in what order do static fields and blocks run?
11. What did ECMAScript 2022 add to classes?

## Concise interview answers

1. No. Classes provide syntax and construction rules over JavaScript's prototype-based object model.
2. A declaration creates a lexical binding with a temporal dead zone. A named class expression also has an inner name visible only in its own body.
3. A base constructor receives a created `this`. A derived constructor's `this` is uninitialized until `super()` returns, unless it returns an object directly.
4. It looks up the property through the prototype of the method's home object, while the invocation uses the current `this` receiver.
5. Instance methods are on the class prototype; static methods are on the constructor object.
6. A field defines an own property without invoking an inherited setter; ordinary assignment can invoke one.
7. Base fields initialize before the base constructor body. Derived fields initialize after `super()` returns and before the rest of the derived body.
8. Private names are lexically scoped and use private-element access checks; they are not string keys and cannot be accessed through ordinary reflection.
9. It checks for the specific private element/brand associated with the lexically resolved private name.
10. During class evaluation, interleaved in source order; a base class finishes static initialization before a derived class.
11. Public class fields, private methods/accessors, and static initialization blocks became standard in ES2022.

## Deep follow-up answers

### Why can a base constructor call a child override before child fields exist?

The instance's prototype chain is established for construction, so dynamic method lookup can find the child override. But the base constructor runs within `super()` before the derived class's fields initialize. The override may therefore see missing public fields or throw when it touches a not-yet-initialized private field. Avoid virtual dispatch from constructors or design for the incomplete state explicitly.

### What does `super` actually use?

For a method, `super.name` begins property lookup at the prototype of that method's home object, not at the current receiver. If it is called as `super.name()`, the current `this` is passed as the receiver. In a derived constructor, `super()` is different syntax: it constructs the base class and initializes the derived `this` binding.

### Are private fields inherited?

An instance of a derived class contains private elements initialized by each constructor that runs, but private-name access is lexical. A derived class body cannot write `this.#baseSecret` unless that private name is declared in the derived lexical class scope; the base class can use its own name in its methods. Private static elements are branded to the declaring constructor, so an inherited static method using `this.#field` may fail when called with a subclass as `this`.

### Why are public fields not ordinary assignments?

Field initialization uses define-own-property behavior. A derived field named `value` creates an own property without calling a base prototype setter. `this.value = value` in the constructor uses ordinary assignment and can invoke that setter. This distinction matters when replacing transpiled constructor assignments with standardized fields.

## Scenario questions

1. **A derived constructor reads `this.id` before `super()`. What happens?** It throws `ReferenceError` because derived `this` is uninitialized.
2. **A base constructor calls `this.initialize()`, which is overridden by a child and reads a child field. What is the risk?** The child method can run before the child field is initialized.
3. **A subclass calls an inherited static method that reads `this.#cache` declared on the base. Why might it throw?** The receiver is the subclass constructor, which does not have the base constructor's private static brand.
4. **A field unexpectedly bypasses a setter. Why?** A class field defines an own property; it does not perform ordinary assignment.
5. **A static block reads a static field declared below it. What should you check?** Its initialization has not run yet; a public field may read as undefined, while an uninitialized private static field access throws.
6. **A method called `save` uses `super.save()`. Does that call `this.save()` recursively?** No. `super` starts property lookup at the method's home-object prototype and preserves `this` as receiver.

## Tradeoffs and alternatives

| Choice | Strength | Cost or caution |
| --- | --- | --- |
| Class + prototype methods | Shared behavior and familiar lifecycle | Inheritance couples construction and override behavior |
| Public fields | Discoverable own state and concise initialization | Public API surface; define semantics differ from assignment |
| Private fields | Enforced lexical encapsulation | Not reflectable/serializable as ordinary properties; private names are not dynamically addressable |
| Static block | One-time class-scoped initialization with private access | Runs synchronously during class evaluation and can make class definition fail |
| Composition | Explicitly combines collaborators | May require more forwarding code than a small inheritance hierarchy |

## Common weak answers

- “Classes replace prototypes.” They still rely on prototype chains.
- “`super` means the parent object.” It is syntax for prototype-based lookup or base construction, depending on form.
- “Derived fields initialize before `super()`.” They initialize immediately after it returns.
- “Private fields are just hidden property strings.” Their names have lexical identity and private brand checks.
- “A field is shorthand for assignment.” It has different property-definition behavior.
- “Static members belong to instances.” They belong to the constructor object.
- “A child instance always has the base's private brand because it inherits from the base.” Private access is governed by the declaring class's initialization and lexical name.

## Self-check rubric

Award one point for each skill you can explain with an example:

- Connect classes to constructor/prototype objects.
- Explain class declaration TDZ and named class-expression scope.
- Trace `super()`, derived `this`, and `new.target`.
- Distinguish method, accessor, field, and static placement.
- Predict base/derived field initialization and static evaluation order.
- Explain public field define-own-property behavior.
- Explain private lexical scope, brand checks, and private static receiver pitfalls.
- State ES2022 class feature additions and distinguish them from decorators.

Seven or eight points indicates strong readiness; return to the reference lesson for any missed item.

## Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 strict mode](https://tc39.es/ecma262/2026/multipage/ecmascript-language-source-code.html)
- [MDN Classes reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [MDN Public class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields)
- [MDN Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)
- [MDN Static initialization blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks)
- [TC39 class-fields proposal](https://github.com/tc39/proposal-class-fields)
