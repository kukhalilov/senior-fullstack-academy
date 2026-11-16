# TypeScript structural compatibility, interfaces, classes, and variance — Reference: Assignment compatibility and structural typing rules

## Scope and version

This lesson explains all 13 supplied compatibility names. Structural assignment is the default for most TypeScript types, with special rules for fresh literals, functions, and private/protected members. [Type compatibility handbook](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) · [object types](https://www.typescriptlang.org/docs/handbook/2/objects.html)

## How this group fits the mental model

The compiler asks whether the source provides what the target requires. The answer is usually based on members, not type names. Fresh literal checks and class access-member origin create targeted exceptions; they do not replace the structural model with exact or fully nominal typing.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Structural type system` | Relates types by their members. A value with compatible required members can satisfy a target type even if it was declared by another interface, class, or object literal. |
| `Assignment compatibility` | Checks whether a source expression can be assigned to a target variable/parameter/property. The source must provide target-required members with compatible types; TypeScript also has some intentional unsound compatibility rules. |
| `Excess property check` | An additional diagnostic for likely misspelled/unexpected fields in fresh object literals given a target type. It is contextual and is not a general exact-object rule. |
| `Fresh object literal check` | The special assignment/call situation in which a newly written literal is examined for extra properties. Storing the object first changes the check to ordinary structural compatibility, though other contextual rules can still apply. |
| `Optional property compatibility` | Optional members may be absent. Assignability considers both presence and value type; explicit `undefined` behavior can depend on `exactOptionalPropertyTypes`. A read of an optional property may produce `undefined`. |
| `Index signature compatibility` | A string/number/symbol index signature describes value types for arbitrary keys in that key category. Known properties must be compatible with the index value type; it does not guarantee all keys exist at runtime. |
| `Function parameter compatibility` | Checks that a source callback can safely receive the target's possible arguments. Under `strictFunctionTypes`, ordinary function-property parameters are contravariant; method/constructor positions have a bivariance exception. |
| `Return type compatibility` | Checks that a source function's result is usable where the target result is expected. Result types are compared in the output direction; a value-returning callback can satisfy a target returning `void` because that caller ignores the result. |
| `Bivariance hack for method parameters` | The deliberate use of method syntax (often a method member extracted through indexed access) to obtain bivariant callback parameter compatibility. It is less safe and should be limited to APIs that intentionally need the compatibility behavior. |
| `Private member origin compatibility` | If a class instance type includes a TypeScript `private` member, a compatible source must have that private member from the same declaration lineage. Matching spelling alone is insufficient. |
| `Protected member origin compatibility` | A protected member likewise constrains compatible class types by declaration origin/inheritance lineage, in addition to protected access rules. An unrelated class cannot satisfy it just by declaring a same-named field. |
| `Class static side` | The constructor value type, including `static` members and construct signatures. It is distinct from the instance type produced by the class. |
| `Class instance side` | The type of objects created by a class, consisting of its instance members. An interface passed to `implements` checks this side; static members are not part of that implemented contract. |

## Cross-item comparison

Structural assignment usually permits extra members, but a fresh literal receives an excess-property check. Both checks still verify compatible types for required members. Function parameter compatibility depends on `strictFunctionTypes` and member syntax; return compatibility compares the produced result. Private/protected origin rules apply to class instance members, not ordinary public structural fields.

The class static side is compared through the class value; the instance side is compared through constructed values. `implements` concerns the latter. A bivariant method signature relaxes function parameter comparison and can be unsound; use the ordinary strict function-property form unless the API intentionally relies on that exception. [Type compatibility handbook](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)

## Examples

```ts
interface Named { name: string }
const stored = { name: "Kai", color: "blue" };
const named: Named = stored; // structurally compatible

// Fresh object literal typo check:
// const typo: Named = { name: "Kai", colour: "blue" };

type StrictHandler<T> = (value: T) => void;
type BivariantHandler<T> = { handle(value: T): void }["handle"];

interface Clock { now(): Date }
class SystemClock implements Clock { now(): Date { return new Date(); } }
```

`stored` has all required `Named` members, and the additional `color` is allowed. A fresh literal with `colour` may trigger an excess-property diagnostic. `BivariantHandler` extracts a method type; this intentionally uses the method compatibility exception. `SystemClock` implements an instance contract; it does not add `now` automatically.

## Common mistakes

- Treating interfaces as exact schemas that forbid all additional properties.
- Assuming excess-property diagnostics apply identically to stored variables and fresh literals.
- Assuming a type assignment proves an untrusted runtime object is valid.
- Forgetting optional values may be `undefined` when read.
- Assuming index signatures fill a runtime dictionary or guarantee a key exists.
- Applying method bivariance to all callback forms.
- Expecting private/protected compatibility from matching names alone.
- Comparing the class constructor side when the API accepts an instance, or vice versa.

## Knowledge checks with answers

1. **Can `{ name: string; color: string }` satisfy `Named`?** Yes, ordinary structural assignment allows extras.
2. **Why might a fresh literal with `colour` fail?** The excess-property check detects a likely typo.
3. **What determines a private member's compatibility?** Its declaration origin, not just its name and type.
4. **What side does an instance interface describe?** The class instance side, not its static/constructor side.
5. **What is the risk of the bivariant method pattern?** It can permit unsafe parameter assignments that strict function-property checking rejects.

Sources: [type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html), [object types](https://www.typescriptlang.org/docs/handbook/2/objects.html), [classes](https://www.typescriptlang.org/docs/handbook/2/classes.html).
