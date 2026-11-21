# TypeScript structural compatibility, interfaces, classes, and variance — Core concepts and how they fit together

## Learning objectives

- Determine compatibility by comparing the target's required members with a source shape.
- Distinguish ordinary structural assignment from excess-property checks on fresh literals.
- Explain how interfaces compose, merge, and describe callable/indexed members.
- Separate class constructor/static and instance sides, including `extends` and `implements`.
- Reason about private/protected origin and function parameter variance.

## Prerequisites

Know object, function, generic, and class basics; access modifiers; unions and intersections. Generic declaration syntax is covered in t06-008. Detailed call/overload forms are covered in t06-023. JavaScript runtime private fields and prototype inheritance are covered in t06-018.

## Core concepts

### Structural assignment checks required members

For source type `S` assigned to target type `T`, the source must provide target-required members with compatible types. Extra source properties are normally okay. This makes structural interfaces work with object literals, imported data types, and independently written classes. TypeScript deliberately permits some unsound relationships for JavaScript ergonomics, so successful compatibility is not a runtime safety proof. [Type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)

### Fresh literals get an additional typo check

When an object literal is written directly where a target type is expected, TypeScript checks for properties not expected by that target. This catches `colour` when `color` was intended. Once the value is stored in a variable, ordinary structural compatibility applies and extra members are allowed. This is not an exact-object type system: widening, generics, unions, assertions, and other contexts have their own details. Use a runtime schema when data itself must be validated.

### Optional properties and index signatures

An optional member may be absent, and reading it can produce `undefined`. Assignability rules account for optional compatibility; exact optional property behavior also depends on `exactOptionalPropertyTypes`. A string/number/symbol index signature says what value type arbitrary keys may have; known declared properties must be compatible with that value type. It does not ensure a runtime object contains every key in the key domain.

### Functions compare callers and callees

A source callback must accept the arguments the target may send, and its result must satisfy what the target expects. With `strictFunctionTypes`, ordinary function-property parameter positions are checked contravariantly. Methods and constructors preserve a bivariance compatibility exception for common patterns. Return values are checked in the compatible output direction. The `void` return target means the caller ignores the result, not that implementations cannot return a value.

### Private/protected members add declaration origin

Most class instance compatibility remains structural. When a private or protected member exists in the compared instance types, the member must originate from the same class declaration lineage. This prevents an unrelated class from becoming compatible just by declaring a member with the same private name. TypeScript access modifiers are static checking; ECMAScript `#private` fields have runtime privacy and are covered in t06-018.

### Interfaces and classes describe different shapes

Interfaces describe structural contracts; they can extend multiple compatible interfaces and can merge with same-named declarations. A class has an instance side (the objects created) and a static/constructor side (the class value). `implements` checks the instance side only; it does not change the class, create members, or alter runtime behavior. `extends` for a class establishes actual inheritance; an interface's `extends` composes contracts.

### Variance follows member positions

A type parameter in an output position tends to be covariant; in an input position it tends to be contravariant. A sound abstraction that both reads and writes the parameter should be invariant. TypeScript infers structural relationships, but direct mutable properties are a soundness exception: `{ value: Dog }` can be assigned to `{ value: Animal }`, allowing a wider alias to write a non-Dog. `strictFunctionTypes` affects function parameter checks, not ordinary property variance, and method/constructor parameters retain their compatibility exception. TypeScript 4.7 `in`/`out` annotations are advanced and must match structural variance; they do not override structural comparison. [Variance annotations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html) · [Type compatibility and soundness](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)

## Mechanisms and relationships

```ts
interface Identified { id: string }
interface Timestamped { createdAt: Date }
interface StoredRecord extends Identified, Timestamped {}

class RecordModel implements StoredRecord {
  constructor(readonly id: string, readonly createdAt: Date) {}
}

const source = { id: "r1", createdAt: new Date(), cacheKey: "local" };
const record: StoredRecord = source;
```

The interface composes two contracts. The class is checked for both instance properties but receives no implementation from `implements`. The object variable is assignable despite `cacheKey`; structural compatibility permits the extra member. A direct fresh literal with a misspelled expected field could receive an excess-property diagnostic.

## Worked examples

### Static and instance sides are separate

```ts
interface HasName { name: string }
class Person implements HasName {
  static species = "human";
  constructor(readonly name: string) {}
}

const person: HasName = new Person("Ari");
const constructorValue: typeof Person = Person;
```

`HasName` checks an instance. `typeof Person` is the constructor/static side. `implements` does not say the class value itself is a `HasName`.

### Private origin changes assignment

```ts
class Base { private token = ""; }
class SameLineage extends Base {}
class Independent { private token = ""; }

const a: Base = new SameLineage();
// const b: Base = new Independent(); // incompatible private declaration origin
```

The second class has the same spelling but a different declaration origin, so it cannot satisfy the private member requirement.

## Misconceptions and edge cases

- TypeScript compatibility is primarily structural, not universally nominal or sound.
- Excess-property checking on a fresh literal is not the same as exact-object typing.
- Extra properties can be accepted after a value is stored in a variable.
- `implements` validates an instance shape but does not add members or alter emitted code.
- A class type name and its constructor/static type are different sides.
- Private/protected compatibility depends on origin; ECMAScript `#` fields have additional runtime semantics.
- Index signatures constrain compatible member types but do not populate runtime keys.
- Function parameters are not uniformly checked covariantly; strictness and method syntax matter.
- Variance annotations cannot force structurally unsupported compatibility.

## Knowledge checks with answers

1. **Can a source have extra public fields and satisfy an interface?** Yes under ordinary structural assignment.
2. **What is an excess-property check for?** A fresh-literal typo check, not exact-object enforcement.
3. **Does `implements` create a missing method?** No, it reports the mismatch.
4. **Which side does `implements` check?** The class instance side.
5. **Why is an unrelated private property name insufficient?** Private/protected members must share declaration origin.
6. **Do `out` annotations override structure?** No; they must match structural variance and have limited effect.

Sources: [type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html), [object types](https://www.typescriptlang.org/docs/handbook/2/objects.html), [classes](https://www.typescriptlang.org/docs/handbook/2/classes.html), [TypeScript 4.3](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html), [TypeScript 4.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html).
