# TypeScript indexed, conditional, mapped, and utility types — Reference: Type queries, indexed access, conditional types, and mapped types

## Scope and version

This lesson explains all 16 supplied names in the operator group. Examples describe static TypeScript types in the TypeScript 7.0 stable model; TypeScript 7.1 beta has one explicitly labeled stricter relation check. The `satisfies` operator is not part of this inventory and is covered in t06-007. [Type manipulation handbook](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## How this group fits the mental model

The first operators ask what keys and member types already exist. Conditional types then branch on assignability; mapped types repeat an expression for keys. Template literals build string-shaped unions, and recursion composes a transformation over nested type structure. These constructs help keep derived types synchronized with source declarations; none creates or checks runtime data.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `keyof operator` | Produces the union of permitted property key types of a type. For a string-indexed object this is `string | number`; a numeric index yields `number`. `keyof (A | B)` contains only keys available on every union member, while `keyof (A & B)` combines constituent keys; `keyof any` is `string | number | symbol`. It is not a runtime enumeration. |
| `typeof type query` | In a type position, obtains the declared static type of a value name or property access, such as `typeof settings`. It is different from JavaScript's value-level `typeof` expression and is not an arbitrary expression evaluator. |
| `typeof import("module") type query` | Queries a module's exported type without writing a runtime import expression, for example `type Library = typeof import("./library.js")`. It is a type query form; it does not load the module at runtime. |
| `Indexed access type (T[K])` | Looks up the property type using a key type `K`. `T[keyof T]` forms the union of property value types; a union key produces a union of selected property types. Optional properties can contribute `undefined` under strict null checking. Runtime existence still depends on an actual value and access; `noUncheckedIndexedAccess` separately affects unchecked expression-level indexing. |
| `Lookup type` | A historical name for indexed access type notation such as `Person["age"]`; it is the same mechanism as `T[K]`, not a separate operator. |
| `Type constraint operator (extends)` | Within a conditional type, `A extends B ? X : Y` selects a type branch according to assignability. In a generic declaration, `extends` can also place a bound on a type parameter; these related uses serve different roles. |
| `Conditional type` | A type expression `A extends B ? X : Y` that resolves to one of two types according to an assignability relation. It is compile-time branching, not a runtime test or type guard. |
| `Distributive conditional type` | A conditional type with a naked type parameter on the checked side distributes over a union: test each member, then union the results. Wrapping the parameter, as `[T] extends [U]`, suppresses that distribution. |
| `infer keyword` | Declares a type variable inside the checked pattern of a conditional type, capturing a matching component such as a function parameter tuple or promise-like value. The inferred name is available in the true branch. |
| `Mapped type` | Iterates over a key union to construct properties, for example `{ [K in keyof T]: T[K] }`. A homomorphic mapping over `keyof T` generally carries source modifiers and can preserve tuple/array structure and distribute over unions; explicit modifiers can change those properties. It describes a type and does not copy an object. |
| `Mapped type key remapping (as)` | Changes each generated key using `as`, as in `[K in keyof T as NewName<K>]: ...`. Mapping a key to `never` omits it. String operations often need a `K extends string` guard because keys may be numbers or symbols. |
| `Mapped type optional modifier (+? and -?)` | Adds or removes optionality while mapping properties. `?` or `+?` makes the mapped result optional; `-?` makes it required. With `strictNullChecks`, removing optionality can also remove the `undefined` introduced solely by optionality; an explicitly declared `undefined` remains when `exactOptionalPropertyTypes` distinguishes it. This affects a static type, not a runtime object. |
| `Mapped type readonly modifier (+readonly and -readonly)` | Adds or removes the readonly modifier in the mapped result. `readonly`/`+readonly` adds it; `-readonly` removes it. It is a compile-time access restriction and does not freeze an object. |
| `Template literal type` | Combines literal text and interpolated types in backtick syntax at type level, producing string literal types. Union interpolations expand into combinations, which can make the resulting type large. |
| `Template literal type inference` | Uses an `infer` placeholder in a conditional template pattern to capture a portion of a literal string type, for example the text after a known prefix. It cannot parse arbitrary runtime strings without validation. |
| `Recursive conditional type` | A conditional type whose branch applies the type alias again to a smaller or simpler component. A terminating base case is essential; compiler instantiation limits constrain extreme recursion. |
| `Stricter type parameter relationships in distributive conditional branches` | In TypeScript 7.1 beta, each distributed branch's narrowed parameter is treated as a new subtype of the original. It is not automatically related to another parameter constrained by the original union. This rejects some 7.0-accepted unsound relationships. This is a beta change, not the general definition of distribution. [Official explanation](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) |

## Cross-item comparison

`keyof` produces property names; indexed access consumes a key to retrieve a value type. For a union, `keyof` is constrained to keys shared by all members; for an intersection, it can expose keys from both constituents. `typeof` obtains a static type from a value declaration or module query, while JavaScript `typeof` produces a runtime string. Conditional types choose between type results; mapped types transform properties across keys. A conditional distributes only under the naked-type-parameter rule; a mapped type iterates its selected key set and a homomorphic `keyof T` mapping preserves source structure where possible.

Template literal inference captures a substring from a string-literal pattern, while ordinary generic inference uses call-site/context evidence (t06-008). A recursive conditional repeatedly applies a transformation; it is not automatically safe or infinitely deep. The 7.1 beta check updates one relationship that may be assumed inside a distributed branch. [Type manipulation handbook](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) · [7.1 beta notes](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Examples

```ts
const settings = { retries: 3, label: "worker" };
type Settings = typeof settings;
type SettingKey = keyof Settings; // "retries" | "label"
type SettingValue<K extends keyof Settings> = Settings[K];
type LibraryModule = typeof import("./library.js");

type Shared = keyof ({ id: string; left: boolean } | { id: number; right: Date }); // "id"
type Combined = keyof ({ left: boolean } & { right: Date }); // "left" | "right"

type MutableOptional<T> = { -readonly [K in keyof T]+?: T[K] };
type Handlers<T> = {
  [K in keyof T as K extends string ? `on${Capitalize<K>}` : never]: (value: T[K]) => void
};

type RemovePrefix<S> = S extends `on${infer Rest}` ? Rest : S;
type StringsOnly<T> = T extends string ? T : never;
type A = StringsOnly<"yes" | 0 | "no">; // "yes" | "no"
type AWhole = ["yes" | 0] extends [string] ? true : false; // false
```

The final pair contrasts distribution with a tuple-wrapped whole-union test. `Handlers` filters out non-string keys before building a template-literal name. The mapped modifiers change only the derived static type.
`Shared` includes only the key safe on both alternatives. `LibraryModule` is a type query and does not emit an import or evaluate the module. Homomorphic mapped types use a source type's keys to preserve tuple/array and union structure where applicable; key remapping or a different key source can change that behavior.

## Common mistakes

- Confusing type-position `typeof` with JavaScript's runtime `typeof`.
- Assuming `keyof` returns only strings or a runtime collection; numeric and symbol keys are possible.
- Assuming `keyof` of a union lists every key appearing in any member; it lists keys common to every member. Use a distributive helper when collecting all member keys intentionally.
- Treating `T[K]` as proof that a runtime object has key `K`.
- Expecting conditional distribution when the checked type is wrapped or is not a naked type parameter.
- Assuming a constraint inside a distributed branch still relates every other type parameter to the narrowed constituent; TypeScript 7.1 beta intentionally checks this more strictly.
- Forgetting `never` removes a member from a union filter.
- Applying a string template operation to a key union without accounting for symbol/number keys.
- Using recursive aliases with no base case or assuming the compiler accepts arbitrary depth.
- Describing mapped `readonly` or optional modifiers as runtime immutability or object mutation.
- Assuming a type-level indexed access proves a runtime index exists; expression-level unchecked array reads and `noUncheckedIndexedAccess` have separate behavior.

## Knowledge checks with answers

1. **How is `Person["name"]` related to a lookup type?** It is an indexed access type, historically also called a lookup type.
2. **When does a conditional distribute?** When the checked side is a naked type parameter instantiated with a union.
3. **How do you test a whole union instead?** Wrap the checked side, such as `[T] extends [U]`.
4. **What does `as never` do in a mapped key remapping?** It removes that key from the resulting property set.
5. **Does `-readonly` mutate an object?** No, it changes only the derived type's modifier.
6. **Why can 7.1 beta reject a branch using `B extends A`?** After distribution, branch `A` is narrower than the original constraint and `B` need not be assignable to that narrower type.
7. **What does `keyof (A | B)` mean?** The keys safely present on both members; an intersection can expose keys from either constituent.
8. **What does `typeof import("./module.js")` do?** It obtains the module's static exported type without creating a runtime import expression.

Sources: [Type manipulation handbook](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html), [keyof](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html), [typeof](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html), [indexed access types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html), [mapped types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html), [TypeScript 4.1 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html), [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/).
