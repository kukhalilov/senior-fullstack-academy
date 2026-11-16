# TypeScript structural compatibility, interfaces, classes, and variance — Interview questions and reasoning

## Core questions

1. Define structural compatibility and give an example where unrelated declarations can be compatible.
2. Is an interface an exact object shape? Explain fresh-literal excess-property checks.
3. What does an index signature promise? How must declared properties relate to it?
4. What does `implements` check, and what does it not generate? Contrast it with `extends`.
5. Why can two classes with identically named private members be incompatible?
6. Distinguish the static/constructor side of a class from its instance side.
7. How does `strictFunctionTypes` compare function-property parameters? What exception exists for method and constructor syntax?
8. Explain producer, consumer, and mutable-cell variance. What do `in` and `out` annotations add?
9. What does `override` detect? Does it provide an implementation?
10. What is interface declaration merging, and what risk should a library consider?

## Concise interview answers

1. The checker generally compares required members, not the declared type names. Two independently declared `{ id: string }` shapes are typically compatible.
2. No. A fresh contextual object literal receives an extra-property typo check, while a stored structurally compatible value may carry extra members. This is not exact-object typing. [Type compatibility handbook](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
3. It describes the value type expected for indexed keys, not that keys exist at runtime. Every known property covered by the index must have a compatible value type.
4. `implements` checks an instance against a contract; it does not add missing methods or properties. `extends` creates class inheritance and inherits runtime implementation.
5. A private member carries its declaration origin into compatibility. Same spelling and type do not make independently declared private members the same member lineage.
6. `C` usually denotes an instance type. `typeof C` describes the class value, including its constructor and static members.
7. Function-property parameters are checked contravariantly under `strictFunctionTypes`. Method and constructor parameters retain a bivariance exception for compatibility, which can permit narrower handlers and reduce safety.
8. A producer returns `T` (covariant); a consumer accepts `T` (contravariant); a mutable read/write cell usually needs invariance. `out`/`in` declare intended variance and must agree with structural use. [TypeScript 4.7 notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html)
9. `override` checks that a base member exists and can catch misspellings or a removed base method. It does not generate an implementation. [TypeScript 4.3 notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html)
10. Compatible same-name interface declarations can combine into one contract. This helps intentional module augmentation but can also widen shared names or produce collisions.

## Deep follow-up answers

### Why does TypeScript use structural compatibility?

JavaScript values commonly flow between functions without a shared declared base class. Member-based compatibility supports that programming model and permits object literals and library values to satisfy contracts. The tradeoff is that assignability is not proof of runtime validity or exactness. Fresh-literal checking is a focused typo check layered on top.

### Why can a method callback be less safe than a function property?

With strict function checking, a consumer of `T` must be prepared for every value the API may pass, producing contravariant parameter compatibility. The historical method/constructor exception permits bivariance, which treats either direction as acceptable in some comparisons. Prefer function-valued properties for callback contracts where rejecting a too-narrow parameter matters.

### How do class relationships differ?

The instance side contains instance members; the static side includes the constructor and static members. `implements` checks the first. `extends` relates class constructors and instances and inherits runtime behavior. To require a class value, accept a construct signature such as `new (...args: A) => Instance`; to require an instance, accept `Instance`. Private and protected members make instance compatibility sensitive to shared declaration origin. [Classes handbook](https://www.typescriptlang.org/docs/handbook/2/classes.html)

### Does `readonly` make a property deeply immutable?

No. It restricts assignment through that typed property reference; nested referenced objects can still be mutable unless their own types restrict writes. TypeScript's structural and aliasing model means `readonly` is not a runtime freeze or a general deep immutability guarantee.

### Why are variance annotations not a repair tool?

They document and check intended variance for generic declarations, and can affect certain instantiation comparisons. They are required to match the parameter's actual structural use. They do not globally turn an unsafe relationship into a safe one or replace understanding which positions produce and consume the value.

## Scenario questions

### Narrow callback supplied to a broad API

An API invokes a callback with any `Animal`. A caller supplies `(dog: Dog) => ...`. Explain why this could fail at runtime, how strict checking handles a function-valued property, and why method syntax can produce a different result. Recommend a public declaration that makes the desired safety visible.

### A configuration object with a typo

A variable has `{ timeout: 500, timout: 100 }` and is passed to a function accepting `{ timeout: number }`. Explain why it may be accepted while an inline literal is rejected. Describe how `satisfies` helps with authored values and why neither it nor an interface validates untrusted JSON.

### Constructor contract passed as an instance

A factory needs a class that can be constructed with a particular argument tuple. Explain why an instance interface is insufficient, show the general construct-signature form, and distinguish `C` from `typeof C`.

### Optional property set to `undefined`

A JSON serializer or merge function distinguishes a missing field from a present field whose value is `undefined`. Explain `exactOptionalPropertyTypes`, the effect on assignment, and how to explicitly allow both states in a declaration.

## Tradeoffs and alternatives

- Structural types fit JavaScript composition; explicit brands or wrappers can communicate nominal identity when structural overlap is too permissive.
- Interfaces support open augmentation and merging; a uniquely named type alias can avoid accidental interface merging when an extension point is not intended.
- Function-valued properties make strict callback variance clearer; method syntax retains compatibility behavior that some existing APIs depend on.
- Compile-time shape checks catch many authoring mistakes; runtime parsers/validators are needed for data from network, storage, or other untyped boundaries.
- Abstract classes provide runtime inheritance and shared implementation; interfaces provide erased contracts without runtime inheritance.

## Common weak answers

- “TypeScript checks exact objects.” It does not; excess-property diagnostics are contextual checks for fresh literals.
- “`implements` adds the interface methods.” It only checks the class instance shape.
- “Same private name means same private member.” Declaration origin matters.
- “Callbacks are always contravariant.” Method and constructor syntax has a bivariance exception.
- “An index signature means any key exists.” It describes the type of indexed access, not actual object contents.
- “Variance annotations force assignment.” They must agree with the declaration's structural use.
- “A type annotation validates JSON.” It disappears at runtime and cannot inspect external data.

## Self-check rubric

Score each answer from 0 to 2: **0** if the rule is misstated; **1** if the direction is right but a condition or tradeoff is missing; **2** if you identify the source and target, the relevant member position/compiler option, and the static-versus-runtime boundary. Aim for at least 16/20, with no zero on callback variance, class sides, or external-data validation. Revisit the relevant reference lesson for any missed distinction.
