<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript classes, inheritance, and private elements — Big-picture orientation and mental model

## Problem and purpose

Classes provide syntax for defining constructor functions and prototype relationships, along with methods, accessors, fields, and private elements. They help represent objects that share behavior while keeping per-instance state distinct. A class is not a separate object model: instances still use prototypes, while static members live on the constructor object.

The main source of bugs is initialization order. A base constructor runs as part of constructing a derived instance, `super()` establishes the derived `this`, fields initialize at specific points, and static initializers run when the class definition is evaluated. Private elements add a separate lexical access rule that is not ordinary property visibility.

## Plain-language mental model

Think of a class as a blueprint plus a constructor object. The blueprint's instance methods go on the prototype shared by instances; each instance receives its own fields. Static methods and fields belong to the class constructor itself. A derived class links both its instance prototype chain and its constructor inheritance to the base class.

Construction is a sequence of steps. A base instance initializes its fields before the base constructor body. A derived constructor must call `super()` before using `this`; the base construction runs, then the derived fields initialize, then the remaining derived constructor body continues. A private name acts like a class-scoped capability: only code in the declaring lexical class scope can use that name.

## How the parts fit together

1. Evaluating the class creates a constructor, its prototype, methods/accessors, private-name bindings, and static initialization state.
2. `extends` evaluates a heritage expression and establishes the instance and constructor prototype chains.
3. `new` invokes the constructor. Base and derived constructors follow different `this` initialization rules.
4. Instance fields initialize in declaration order at the class's point in construction; static fields and blocks execute in declaration order during class definition evaluation.
5. Methods are shared functions on the prototype or constructor; fields are own properties or private elements initialized on a particular instance/class.
6. Private access and brand checks follow lexical private-name identity, not string property lookup or ordinary prototype inheritance.

## Concept map

| Need | Class mechanism | Main idea |
| --- | --- | --- |
| Define a reusable object type | Declaration or expression | Produces a constructor and prototype |
| Reuse behavior | Instance method / inheritance | Methods are shared through prototypes |
| Put behavior on the type | Static method or field | Stored on the constructor, not each instance |
| Initialize state | Fields and constructor | Timing differs for base and derived classes |
| Restrict access to implementation details | Private elements | Lexical private names enforce access checks |
| Set up class-level state | Static initialization block | Runs once during class evaluation, in source order |

## End-to-end walkthrough

```js
class Account {
  #balance = 0;
  static currency = "USD";

  constructor(owner) {
    this.owner = owner;
  }

  deposit(amount) {
    this.#balance += amount;
  }

  get balance() {
    return this.#balance;
  }
}

class SavingsAccount extends Account {
  #rate = 0.02;

  constructor(owner) {
    super(owner);
    this.created = true;
  }

  get annualRate() {
    return this.#rate;
  }
}

const account = new SavingsAccount("Ari");
account.deposit(20);
console.log(account.balance, account.annualRate, SavingsAccount.currency);
// 20 0.02 USD
```

`Account` fields are initialized before its constructor body. `SavingsAccount` cannot use its `this` before `super(owner)`. When `super()` returns, the base constructor and initialization have run, then `SavingsAccount`'s private field initializes, then its constructor continues. Instance methods are shared on prototypes. The private balances are not ordinary public properties.

## When to use it and tradeoffs

Use classes when objects share stable behavior and a clear lifecycle, when a prototype-based API is already expected, or when private elements provide useful encapsulation. A small object literal or closure may be simpler for one-off data and behavior. Inheritance can couple child behavior to a base-class initialization contract; composition often makes dependencies more explicit.

Fields improve discoverability, but their declaration semantics differ from assignment in a constructor: public fields define own properties and do not call inherited setters. Private fields offer strong lexical access checks, but they are not dynamically inspectable, serializable by default, or interchangeable with public properties. Static initialization is synchronous and class definition fails if it throws.

## Recent version changes

ECMAScript 2022 standardized public class fields, private methods/accessors, and static initialization blocks. These additions completed major parts of the class-fields work; they did not change the prototype basis of classes. Runtime support may depend on the host and tooling target. See [ECMAScript class definitions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html) and the [TC39 class-fields proposal](https://github.com/tc39/proposal-class-fields).

## What later lessons cover

The concepts lesson explains class creation and construction order. The reference lessons cover each supplied declaration, method, field, accessor, inheritance, and private-element form. Practice traces initialization and writes a class hierarchy; interview questions focus on `super`, prototype chains, private brands, and field semantics.

## Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [MDN Classes reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [TC39 class-fields proposal](https://github.com/tc39/proposal-class-fields)
