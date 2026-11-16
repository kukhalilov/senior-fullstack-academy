# TypeScript primitive, literal, object, array, and tuple types — Reference: Object, property, array, and tuple types

## Scope and version

This lesson explains all 15 supplied names. It covers the syntax and practical type behavior of object shapes, arrays, and tuples; assignability edge cases are expanded in t06-009. [Object types](https://www.typescriptlang.org/docs/handbook/2/objects.html) · [Everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)

## How this group fits the mental model

Object types specify members a value exposes; they do not create those members. Arrays describe repeated element types. Tuples encode an ordered set of positions, with optional/rest members where length may vary. Readonly modifiers restrict writes through one type view but cannot prevent mutation through aliases or at runtime.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Object type literal` | A type expression like `{ id: string; active?: boolean }` describes properties and can also contain call, construct, index, and method signatures. It does not require an exact set of keys in ordinary structural assignment. |
| `Optional property modifier (?)` | `name?: string` allows the property to be absent. Reading it can yield `undefined`. Whether explicitly writing `undefined` is allowed depends on `exactOptionalPropertyTypes`; assignment/excess checks are covered further in t06-009. |
| `Readonly property modifier` | `readonly id: string` prevents assignment through that property reference after initialization. It is static and shallow, not a runtime freeze; aliasing can still mutate the object. |
| `Index signature` | `[key: string]: Value` types indexed property access over that key domain. Declared members covered by the index must have compatible values; it neither creates nor guarantees keys. Structural compatibility details are in t06-009. |
| `Call signature in object type` | `(input: string): number` makes the described object callable. It can coexist with properties and overloads; an implementation must be an actual function/object with that call behavior. |
| `Construct signature in object type` | `new (name: string): User` describes a constructable value. It describes the constructor/class value side, not an instance property named `new`. |
| `Method signature in object type` | `save(id: string): void` describes a callable member with method syntax. Method parameter comparison has a bivariance compatibility exception; prefer function-valued properties when strict callback variance is needed. |
| `Array type (T[])` | `T[]` describes a mutable array whose elements are `T`. Parenthesize unions when needed: `(string | number)[]`. Indexed reads are affected by options such as `noUncheckedIndexedAccess`. |
| `Generic array type (Array<T>)` | `Array<T>` is the generic spelling equivalent to `T[]` for ordinary element types. Use whichever improves readability; parentheses/precedence may make the generic form clearer for nested types. |
| `ReadonlyArray<T>` | A view of an array whose API omits mutating operations. It can accept mutable arrays but does not freeze them; other aliases may mutate the underlying array. `readonly T[]` is an equivalent shorthand. |
| `Tuple type` | `[string, number]` describes an ordered pair with a string at index 0 and number at index 1. Tuple length/positions are more constrained than `Array<string | number>`. |
| `Named tuple element` | `[x: number, y: number]` labels tuple positions for readability and tooling. Labels do not create object properties or change positional identity/assignability. |
| `Optional tuple element` | `[name: string, active?: boolean]` allows a shorter tuple; reading the optional position can yield `undefined`, and the length type reflects the allowed range. Optional elements cannot appear before required elements. |
| `Rest tuple element` | `[head: string, ...tail: number[]]` describes a fixed prefix followed by variable-length elements. Rest placement/cardinality rules constrain which tuple layouts are valid. |
| `Readonly tuple type` | `readonly [string, number]` prevents writes through that tuple view and is assignable to compatible readonly array views, but not freely to mutable tuples. It does not freeze the runtime array. Added in TypeScript 3.4. |

## Cross-item comparison

`Array<T>` and `T[]` express the same ordinary mutable sequence contract. `ReadonlyArray<T>` and `readonly T[]` remove mutations from the static view but do not change the object. A tuple adds positional information and usually a fixed or constrained length; optional and rest entries express controlled variable length. [Tuple types](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types) · [TypeScript 3.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html)

An object call signature types the object itself as callable; a method signature types a named member as callable. A construct signature types the value as usable with `new`. These are static shape descriptions and require a runtime implementation. Method syntax also has a callback-variance tradeoff described in t06-009.

## Examples

```ts
type Point = { readonly x: number; readonly y: number };
type Dictionary = { [key: string]: string | number; version: number };
type Formatter = {
  (value: number): string;
  description: string;
};
type UserConstructor = new (id: string) => { id: string };
```

`Point` is statically readonly, `Dictionary.version` fits its index value type, `Formatter` is a callable object with metadata, and `UserConstructor` describes a class/constructor value.

```ts
const coordinate: readonly [x: number, y: number, ...labels: string[]] = [4, 8, "origin"];
const pair: [string, number?] = ["attempts"];
const names: ReadonlyArray<string> = ["A", "B"];

coordinate[0]; // number
pair[1];        // number | undefined
// names.push("C"); // static error through this readonly view
```

Tuple labels do not change indexing. Optional tuple elements affect read types; readonly views omit writes but the original array can remain mutable elsewhere.

## Common mistakes

- Treating an object literal type as an exact runtime schema.
- Forgetting an optional property read can be `undefined`.
- Assuming `readonly` prevents mutation through every alias.
- Assuming an index signature means every key exists.
- Using an array union where the intended shape is a fixed tuple, or a tuple where a homogeneous variable-length collection is intended.
- Assuming tuple labels are runtime property names.
- Forgetting optional/rest tuple positions affect length and read types.
- Treating a call signature and a callable property as runtime code that TypeScript creates.
- Passing a `ReadonlyArray<T>` to code that mutates it by using a type assertion.

## Knowledge checks with answers

1. **Are `string[]` and `Array<string>` different for ordinary arrays?** No, they are equivalent forms.
2. **Does `readonly T[]` freeze an array?** No; it only restricts writes through that reference's type.
3. **What does `[x: number, y: number]` add over `number[]`?** Position-specific types and constrained tuple shape.
4. **Are tuple labels addressable as `.x` and `.y`?** No, they label positions for tooling; access is numeric.
5. **Does a call signature implement a function?** No, it describes the required callable shape.

Sources: [object types](https://www.typescriptlang.org/docs/handbook/2/objects.html), [tuple types](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types), [everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html), [TypeScript 3.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html).
