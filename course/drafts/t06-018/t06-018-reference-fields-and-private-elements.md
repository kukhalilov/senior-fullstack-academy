<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript classes, inheritance, and private elements — Reference: Fields, private elements, and initialization

## Scope and version

This reference covers public/private fields, private methods/accessors, brand checks, static initialization blocks, and initialization semantics through ECMAScript 2026. Public fields, private methods/accessors, and static initialization blocks became standard in ECMAScript 2022. See [ECMAScript classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html), [MDN public fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields), [MDN private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements), and [MDN static initialization blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks).

## How this group fits the mental model

Fields describe state and are initialized at defined points in construction or class evaluation. Private elements use lexical private names with a runtime brand check rather than ordinary property keys. The distinction between an instance element and a static element determines which object receives or owns the state.

## Supplied names explained

- `Public instance field` — A declaration such as `count = 0` that creates an own property on each instance. It is initialized once per instance in declaration order. A declaration with no initializer creates the property with value `undefined`.
- `Public static field` — A declaration such as `static cache = new Map()` that creates an own property on the class constructor. Its initializer runs once during class evaluation; static fields and blocks execute in their source order.
- `Private instance field` — A declared `#value` element initialized on each instance of the declaring class during construction. Access is allowed only in lexical code that can name `#value`; it cannot be dynamically added or read as a string property.
- `Private static field` — A declared `static #count` element associated with the declaring class constructor. A subclass constructor is not automatically branded as the declaring class, so inherited static code using `this.#count` can throw if called with a subclass receiver; access through the defining class is valid.
- `Private instance method` — A `#method() {}` function-like private element installed on instances by the class. The method is shared as a private method rather than recreated as a public per-instance function property; its name is lexically accessible only within the class scope.
- `Private static method` — A `static #method() {}` private method associated with the declaring class constructor. It is callable only from lexical code authorized for its private name and has static receiver behavior.
- `Private getter` — A private accessor such as `get #value() {}`. Reading `this.#value` invokes it; a getter may be paired with a setter of the same private name in the same class and staticness.
- `Private setter` — A private accessor such as `set #value(next) {}`. Assigning `this.#value = next` invokes it; getter/setter pairs share one private name and must have matching staticness.
- `Private static getter` — A `static get #value() {}` accessor on the declaring class constructor. Its private name is only valid within the declaring class's lexical scope and its receiver must have the correct private brand.
- `Private static setter` — A `static set #value(next) {}` accessor on the declaring class constructor. Assignment invokes it with the static receiver; wrong-brand access throws `TypeError`.
- `Private-name brand check (#name in object)` — Syntax that tests whether an object carries the private element identified by a lexically accessible `#name`. It is useful before private access, unlike `instanceof` which ordinarily checks a prototype relationship. The right operand must be an object; null and primitives throw `TypeError`.
- `Class static initialization block` — A `static { ... }` block that runs synchronously during class evaluation. Multiple static fields and blocks run in source order; base class static initialization completes before derived class static initialization. The block has its own scope, may access private names, and its `this` is the class constructor. It cannot use `await`, `yield`, `arguments`, or `super()` directly.
- `Field initializer` — The expression after `=` in a field declaration. It runs for every instance field initialization or once for a static field, at the field's defined point. Instance initializers have access to the instance `this`; they cannot use `arguments`, `await`, `yield`, or call `super()`.
- `Public field define-own-property semantics` — A public field creates an own property using define-own-property behavior, broadly like `Object.defineProperty`, rather than evaluating `this.name = value`. Therefore it does not invoke an inherited setter. This affects subclass initialization and transpiler output assumptions.
- `Base and derived instance field initialization order` — Base instance fields initialize before the base constructor body. In derived construction, base construction runs through `super()`; after it returns, derived fields initialize in source order before the rest of the derived constructor continues. If `super()` is never called and no object is returned, derived fields do not initialize.
- `Static field and static block evaluation order` — Static fields and blocks are evaluated in their declaration order during class definition. Superclass static initialization completes before subclass class evaluation proceeds. A later static field is not initialized merely because its declaration appears in the class body; accessing a later private static field too early throws.

## Cross-item comparison

| Pair | Difference |
| --- | --- |
| Public field / private field | Ordinary public property key versus lexically scoped private name |
| Instance field / static field | Initialized on each instance versus stored and initialized once on constructor |
| Private field / private method | Per-instance or per-class state versus shared callable behavior |
| Field declaration / constructor assignment | Define-own-property semantics versus ordinary assignment that can invoke an inherited setter |
| Private brand check / `instanceof` | Tests for a specific private element versus prototype/constructor relation |

## Examples

```js
class Base {
  set value(next) { console.log("setter called", next); }
}

class Item extends Base {
  value = 4;          // defines an own property; does not call Base's setter
  #id = 1;
  static #count = 0;

  constructor() {
    super();
    Item.#count++;
  }

  static hasId(value) { return #id in value; }
  get id() { return this.#id; }
  static get count() { return Item.#count; }
}

const item = new Item();
console.log(item.value, Item.hasId(item), Item.count); // 4 true 1
```

```js
class Registry {
  static #entries = [];
  static {
    this.kind = "registry";
    this.#entries.push("initialized");
  }
  static get size() { return this.#entries.length; }
}

console.log(Registry.kind, Registry.size); // "registry" 1
```

## Common mistakes

- Assuming a field initializer runs when the class is first parsed; instance fields run during construction.
- Assuming derived fields exist while the base constructor is executing.
- Treating public field declarations as ordinary assignment and expecting inherited setters to run.
- Accessing private names with strings, reflection APIs, or code outside their lexical scope.
- Assuming a subclass's objects automatically possess the base class's private brand, or that a subclass constructor has a base private static brand.
- Using `#name in value` on null or a primitive without first checking the value is an object/function.
- Assuming static initialization blocks run per instance; they run during class evaluation.
- Assuming static blocks can suspend with `await` or `yield`; they are synchronous.
- Forgetting that a thrown field initializer interrupts construction and can leave no usable instance.
- Assuming declaration order applies only within fields; static fields and static blocks are interleaved in source order.

## Knowledge checks with answers

1. **Does a public class field invoke a setter inherited from the base prototype?** No; it defines an own property.
2. **When does a derived field initialize?** After `super()` returns and before the remaining derived constructor body.
3. **Can `#secret` be looked up with `object["#secret"]`?** No; that is an unrelated string property.
4. **What does `#secret in value` test?** Whether `value` has the private element associated with that lexically resolved name.
5. **When do static blocks run?** During class evaluation, interleaved with static field initializers in declaration order.
6. **Can a derived class method directly access a base class's `#private` field?** No, unless the access occurs in lexical code of the class that declared that private name.
7. **What happens when a private access uses the wrong brand?** It throws `TypeError`; a brand check can prevent that for suitable object inputs.

## Further reading

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [MDN Public class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields)
- [MDN Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)
- [MDN Static initialization blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks)
- [TC39 class-fields proposal](https://github.com/tc39/proposal-class-fields)
