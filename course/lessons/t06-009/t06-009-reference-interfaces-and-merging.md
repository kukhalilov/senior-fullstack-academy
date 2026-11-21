# TypeScript structural compatibility, interfaces, classes, and variance — Reference: Interface declarations and structural members

## Scope and version

This lesson explains all 8 supplied interface names. Interfaces are static structural declarations; they emit no JavaScript. Their declarations can merge, and their member shapes participate in assignment compatibility. [Object types handbook](https://www.typescriptlang.org/docs/handbook/2/objects.html) · [type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)

## How this group fits the mental model

An interface names a set of required members and lets multiple declarations compose contracts. A member can describe data, methods, calls, construction, or indexed access. Whether a value satisfies the interface is checked structurally; the interface does not construct an object or inject implementation.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Interface declaration` | Declares a named object shape such as `interface User { id: string }`. It is erased from emitted JavaScript and is generally open to same-name declaration merging. |
| `Interface extends clause` | Adds members from one or more base interfaces into a derived interface. Inherited members must be compatible; the clause composes type contracts and adds no runtime inheritance behavior. |
| `Interface call signature` | A signature inside an interface, such as `(input: string): number`, makes the described object callable. It can coexist with properties or additional overload signatures. |
| `Interface construct signature` | A signature such as `new (name: string): User` describes a constructable value. It describes the constructor side, not an instance's call behavior. |
| `Interface index signature` | Declares a type for properties accessed through an index key, such as `[key: string]: number`. Other declared properties must also fit the index value type; no runtime map is created. |
| `Interface method signature` | Declares a callable member such as `save(id: string): void`. Method syntax participates in the method parameter compatibility exception; use a function-valued property for stricter callback checking. |
| `Interface property signature` | Declares a data member's type and modifiers, such as `readonly id: string` or `name?: string`. It specifies a static shape but does not create/default the property. |
| `Multiple interface heritage` | An interface can extend multiple interfaces when the inherited members can be combined compatibly. Conflicting declarations cannot be reconciled merely because both bases are named. |

## Cross-item comparison

An interface declaration describes a shape. `extends` composes declared shapes. Property and method signatures describe instance/object members; call and construct signatures describe how the value itself is invoked. An index signature covers a key domain and constrains declared properties, but it does not mean every possible key is present.

Interfaces can merge declarations of the same name, while extending interfaces combines base members explicitly. Both mechanisms are type-level and emit no implementation. A class can implement the resulting instance shape but must supply the actual runtime behavior. [Object types](https://www.typescriptlang.org/docs/handbook/2/objects.html) · [classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)

## Examples

```ts
interface BaseEntity { id: string }
interface HasTime { createdAt: Date }
interface Entity extends BaseEntity, HasTime {
  label?: string;
  rename(value: string): void;
}

interface StringFactory {
  (value: string): { value: string };
  new (value: string): { value: string };
  readonly description: string;
}

interface Scores {
  [name: string]: number;
  total: number;
}
```

`Entity` requires the inherited identity/time fields and its declared members. `StringFactory` describes both a callable and constructable object plus metadata; a runtime implementation must support them. In `Scores`, `total` must be numeric because it is also a string-keyed property.

Same-name declarations can merge:

```ts
interface PluginOptions { enabled: boolean }
interface PluginOptions { name: string }
```

The merged interface has both members. Conflicting duplicate property declarations cannot silently choose one type; ensure merged declarations agree.

## Common mistakes

- Thinking an interface emits a constructor or method body.
- Using `extends` as runtime prototype inheritance.
- Confusing the construct signature on a constructor value with an instance property signature.
- Adding an incompatible known property beside an index signature.
- Treating `readonly` as runtime freezing.
- Assuming every function-style member gets strict function-property variance when declared with method syntax.
- Expecting multiple heritage to resolve incompatible property types automatically.

## Knowledge checks with answers

1. **Does `interface extends` emit JavaScript?** No, it composes static type members.
2. **Can a call signature coexist with a property?** Yes, the interface can describe a callable object with metadata.
3. **Why must `Scores.total` be numeric?** It is also one of the string-keyed members covered by the index signature.
4. **What happens to two compatible same-name interface declarations?** They merge into one type shape.
5. **Does a construct signature describe an instance's `new` method?** No, it describes a value usable with `new`.

Sources: [object types handbook](https://www.typescriptlang.org/docs/handbook/2/objects.html), [type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html), [classes](https://www.typescriptlang.org/docs/handbook/2/classes.html).
