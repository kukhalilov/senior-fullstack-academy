# TypeScript structural compatibility, interfaces, classes, and variance — Reference: Class relationships, implementation, and variance

## Scope and version

This lesson explains all 17 supplied class and variance names. `override` was added in TypeScript 4.3; variance annotations arrived in TypeScript 4.7. The class's static side and instances are distinct, and ECMAScript `#private` runtime behavior is covered in t06-018. [Classes handbook](https://www.typescriptlang.org/docs/handbook/2/classes.html) · [TypeScript 4.3](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html) · [TypeScript 4.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html)

## How this group fits the mental model

Class declarations create constructor values and instance shapes. Inheritance composes runtime behavior and types; interface implementation checks an instance contract without injecting behavior. Access modifiers affect static checking, while private/protected origin rules alter structural compatibility. Generic class assignability follows parameter positions; strict function parameter checking and method syntax affect callback members.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Class declaration` | Declares a constructor value and an instance type. `ClassName` refers to instances in most type annotations; `typeof ClassName` refers to the static/constructor side. |
| `Abstract class` | A class marked `abstract` can define shared implementation and abstract requirements but cannot be instantiated directly. A concrete subclass must implement inherited abstract members. |
| `Abstract property` | An abstract property declares an instance member contract without an initializer/implementation; a concrete subclass must supply it. |
| `Abstract method` | An abstract method declares a required operation without a body; concrete subclasses must implement a compatible method. |
| `extends class clause` | Declares a subclass of a base class, inheriting runtime/prototype behavior and instance/static relationships. `super` and constructor initialization rules still apply at runtime. |
| `implements interface clause` | Checks that a class's instance side satisfies an interface. It does not add missing members, change runtime behavior, or require the class value/static side to implement the interface. |
| `Override modifier` | Marks a member intended to override a base member. It catches misspelled/nonexistent base members and supports refactoring; added in TypeScript 4.3. |
| `public member` | A member accessible from any code. It is the default visibility and participates in structural instance compatibility. |
| `protected member` | A member accessible within its class and subclasses. It affects compatibility by requiring compatible declaration origin/inheritance lineage. |
| `private member` | A TypeScript `private` member is accessible only within its declaring class in type checking and makes compatibility origin-sensitive. This is distinct from ECMAScript `#private`, which also has runtime enforcement. |
| `readonly member` | Prevents assignment through that typed property except during allowed initialization contexts. It is static-only and shallow; another mutable alias can still change the runtime object. |
| `Parameter property` | A constructor parameter with an access modifier or `readonly` also declares/initializes an instance property. It is syntax for class construction, not a type-only field declaration. |
| `Generic class variance` | Assignability of `Class<T>` depends on how `T` appears in the class's structure: produced values, consumed values, or both. TypeScript infers variance structurally; mutable fields and methods matter. |
| `StrictFunctionTypes compatibility` | With `strictFunctionTypes`, function-valued property parameters are checked contravariantly. Method and constructor parameter positions retain bivariance for compatibility, so syntax can affect assignability. |
| `Covariant relationship` | A generic producer can often vary in the same direction as its type argument: if `Dog` is assignable to `Animal`, a producer of Dog can be used where a producer of Animal is expected. |
| `Contravariant relationship` | A consumer varies in the opposite direction: a handler that accepts every Animal can be used where a handler for Dog is expected; a Dog-only handler cannot necessarily handle every Animal. |
| `Invariant relationship` | A parameter used for both reading and writing generally cannot safely vary either direction. Widening a mutable container could allow writes that invalidate narrower reads. |

## Cross-item comparison

`extends class` establishes inheritance; `implements interface` checks conformance. Abstract classes may supply code/state, while interfaces describe only a shape. Public members compare structurally. Private/protected members require declaration origin. A class value's static members belong to `typeof Class`, not the instance type.

Covariance, contravariance, and invariance describe the parameter's structural positions. `strictFunctionTypes` applies stricter rules to ordinary function-valued members while method/constructor syntax retains a bivariance exception. TypeScript 4.7 `in`/`out` annotations are advanced, must match structural use, and cannot force structural comparisons. [TypeScript 4.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html)

## Examples

```ts
interface Producer<T> { get(): T }
interface Consumer<T> { accept: (value: T) => void }
interface Cell<T> { value: T }

type Animal = { name: string };
type Dog = Animal & { bark(): void };

declare const dogs: Producer<Dog>;
const animals: Producer<Animal> = dogs;

declare const animalConsumer: Consumer<Animal>;
const dogConsumer: Consumer<Dog> = animalConsumer;

abstract class Repository<T> {
  abstract load(id: string): T;
}
class UserRepository extends Repository<{ id: string }> {
  override load(id: string) { return { id }; }
}
```

`Producer` only returns `T`; `Consumer` accepts `T` through a function property, so the assignments show opposite directions under strict checking. `Cell<T>` is mutable and uses the type both ways, so it does not share either freedom. The concrete repository supplies the abstract method and `override` verifies that the base method exists.

## Common mistakes

- Using `implements` as if it generated methods or changed runtime inheritance.
- Comparing a class constructor/static side to an instance interface.
- Assuming TypeScript `private` is the same as ECMAScript `#private` runtime enforcement.
- Assuming `readonly` freezes the runtime object or every alias.
- Using `override` without a matching base member; that should be an error.
- Assuming generic class variance is declared solely by parameter names rather than member positions.
- Applying function-property contravariance rules unchanged to method signatures.
- Adding `in`/`out` annotations to force a variance that does not match the class's structure.

## Knowledge checks with answers

1. **What does `typeof UserRepository` describe?** The constructor/static side, not a `UserRepository` instance.
2. **Does `implements` add the abstract method body?** No; the class must implement it.
3. **Why can a producer of Dog substitute for a producer of Animal?** Every produced Dog is an Animal.
4. **Why can an Animal consumer substitute for a Dog consumer?** It accepts every Dog; the direction reverses because the parameter is consumed.
5. **Why is a mutable cell more invariant?** It both returns and accepts the type, so changing it either direction can make writes unsafe.
6. **Can a variance annotation override a structural comparison?** No.

Sources: [classes handbook](https://www.typescriptlang.org/docs/handbook/2/classes.html), [type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html), [object types](https://www.typescriptlang.org/docs/handbook/2/objects.html), [TypeScript 4.3](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html), [TypeScript 4.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html).
