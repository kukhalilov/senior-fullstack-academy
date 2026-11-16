# TypeScript indexed, conditional, mapped, and utility types — Reference: Built-in utility types for object and union transformations

## Scope and version

This lesson explains all 9 supplied global utility types for object and union transformations. They are compile-time type utilities; no object is copied, frozen, validated, or filtered at runtime by naming one of these types. [Utility types handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html) · [TypeScript 4.1 type transformations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html)

## How this group fits the mental model

These utilities package common mapped-type and conditional-type patterns. Object utilities derive shapes from keys and property modifiers. Union utilities test each member for assignability and keep or remove members. Prefer them when their standard behavior matches the need; describe the important result and runtime responsibilities separately.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Partial<Type>` | Makes each property in `Type` optional. Often useful for patch/update inputs, but shallow: nested objects remain unchanged. With `exactOptionalPropertyTypes`, an omitted property and a present property explicitly set to `undefined` are distinct unless `undefined` is in that property's value type. |
| `Required<Type>` | Removes the optional modifier from every property. It changes the static requirement that properties be present; it does not fill missing runtime values. Explicit `undefined` in a property type remains a value possibility. |
| `Readonly<Type>` | Marks each top-level property readonly in the resulting type. It is shallow and compile-time only; it does not call `Object.freeze` or prevent mutation through another mutable alias. |
| `Record<Keys, Type>` | Constructs a property mapping from each key in `Keys` to `Type`, such as `Record<"small" | "large", number>`. A finite key union requires those properties in an object literal; a broad key type does not create or populate a runtime dictionary. |
| `Pick<Type, Keys>` | Constructs a type containing the selected property keys from `Type`. `Keys` must be a subset of `keyof Type`; use it to define a focused view that remains linked to the source properties. |
| `Omit<Type, Keys>` | Constructs a type by removing selected keys from `Type`. Unlike `Pick`, it keeps the remaining keys. This is a static shape transformation and does not delete properties from a runtime value. |
| `Exclude<UnionType, ExcludedMembers>` | Removes union members of `UnionType` that are assignable to `ExcludedMembers`. It distributes over the union. It does not subtract arbitrary subsets from a broad primitive: `Exclude<string, "red">` remains `string`. |
| `Extract<Type, Union>` | Keeps union members of `Type` that are assignable to `Union`. It is the inclusion counterpart to `Exclude`, often used to select a tagged variant. |
| `NonNullable<Type>` | Removes `null` and `undefined` from a type. It does not test a value or prove one is non-null at runtime; a check or validation must establish that fact. |

## Cross-item comparison

`Partial` and `Required` adjust optionality in opposite directions; `Readonly` changes write permission; `Pick` and `Omit` select keys from an existing shape, while `Record` constructs a shape from a key set and one value type. These transformations are shallow. `Exclude` removes assignable union members and `Extract` retains them. `NonNullable` is a specialized union filter for nullish types. [Utility types handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Examples

```ts
type Account = {
  readonly id: string;
  displayName: string;
  nickname?: string;
  settings: { theme: "light" | "dark" };
};

type AccountPatch = Partial<Pick<Account, "displayName" | "nickname">>;
type EditableAccount = Omit<Account, "id">;
type ThemeIndex = Record<"light" | "dark", number>;
type Shape = { kind: "circle"; radius: number } | { kind: "square"; side: number };
type Circle = Extract<Shape, { kind: "circle" }>;
type NotCircle = Exclude<Shape, Circle>;
type Present = NonNullable<string | null | undefined>;
```

`AccountPatch` allows only the chosen fields to be present; `settings` is not recursively made optional. `EditableAccount` does not delete `id` from an `Account` object at runtime. `ThemeIndex` describes a complete finite mapping in contexts where required keys are enforced. `Extract` and `Exclude` select static variants based on assignability.

## Common mistakes

- Treating `Partial` as a recursive/deep utility.
- Assuming `Readonly` guarantees runtime immutability or that every alias sees readonly access.
- Using `Record<string, V>` as evidence that a runtime object contains every possible string key.
- Expecting `Pick` or `Omit` to copy, filter, or mutate an object.
- Expecting `Exclude<string, "literal">` to remove one string from the infinite `string` type.
- Treating optional fields as necessarily accepting an explicit `undefined` when `exactOptionalPropertyTypes` is enabled.
- Using `NonNullable<T>` as a runtime check.

## Knowledge checks with answers

1. **Does `Partial<T>` make nested fields optional too?** No, only top-level properties are transformed.
2. **Does `Readonly<T>` freeze an object?** No; it changes static assignment checking only.
3. **Why does `Exclude<string, "red">` still equal `string`?** `string` is one broad type, not a union of every literal member that can be individually removed.
4. **Which utility keeps matching members: `Exclude` or `Extract`?** `Extract` keeps them; `Exclude` removes them.
5. **Can `NonNullable<T>` prove an API response contains a value?** No, it only changes the static type.

Sources: [Utility types handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html), [type manipulation handbook](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html).
