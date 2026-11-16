# TypeScript indexed, conditional, mapped, and utility types — Big-picture orientation and mental model

## Problem and purpose

Ordinary types describe values, but a reusable library often needs types derived from other types: the keys of a config, the value associated with one selected key, a version of an object with some fields optional, or the return type of a function. TypeScript's type operators let a declaration query and transform types while leaving JavaScript output unchanged.

This topic follows TypeScript 7.0 stable and labels TypeScript 7.1 as beta as of 2026-11-16. It assumes object types, unions, generics, and function types. The goal is to understand a type-level computation before memorizing utility names: take a known type, inspect its keys or members, transform each member, and combine the result.

## Plain-language mental model

Think of type-level programming as a compile-time workshop. `keyof` produces a set of property names; indexed access looks up the type found under a name; a mapped type repeats a transformation for each name; a conditional type chooses one result when a relationship holds; a template literal type builds string-shaped members. The compiler evaluates these expressions to check code. It does not modify an object or check external data at runtime.

For example, if `User` has a `name` and `active` field, `keyof User` is the key union, `User["name"]` is the `name` field's type, and a mapped type can copy every property while making it readonly. A utility type is a standard reusable transformation built from these mechanisms.

## How the parts fit together

1. **Start with known types.** A type alias, interface, function, or value provides information.
2. **Query structure.** `keyof`, a type query, and indexed access retrieve names or member types.
3. **Transform structure.** Mapped types iterate keys and can remap names or modifiers.
4. **Branch on assignability.** Conditional types select a branch; `infer` captures a component from a matched type pattern.
5. **Compose strings and recursion.** Template literal types build string unions, and recursive conditionals repeatedly process nested types until a base case.
6. **Reuse standard transformations.** Global utilities package frequent object, union, function, instance, and promise transformations.

## Concept map

```text
known type
  ├─ keyof / typeof / T[K] ──► inspect keys and members
  ├─ mapped type ────────────► transform every selected property
  ├─ conditional + infer ────► branch and capture a matching part
  ├─ template literal ───────► construct string-shaped types
  └─ utility type ───────────► reuse a standard transformation

all results are static types checked by the compiler; no runtime conversion occurs
```

## End-to-end walkthrough

```ts
type Model = { id: string; title: string; archived?: boolean };

type Keys = keyof Model;
type Field<K extends keyof Model> = Model[K];
type Editable = { -readonly [K in keyof Model]?: Model[K] };
type Getters = { [K in keyof Model as `get${Capitalize<K & string>}`]: () => Model[K] };
type AwaitedResult<T> = T extends PromiseLike<infer Value> ? Awaited<Value> : T;
```

`Keys` is a union of property names. `Field<"id">` is `string`. `Editable` derives a shape that permits optional, writable fields; optionality in this type does not change any runtime object. `Getters` remaps keys into getter-shaped names. The last alias branches on whether a type matches a promise-like structure and captures its inner type; for the built-in `Awaited` utility, recursive promise unwrapping is already provided. These examples illustrate composition; they do not define runtime functions.

## When to use it and tradeoffs

Use these operators when a type should stay synchronized with another declaration, such as selecting a property type or describing a patch. Prefer a direct named interface when a transformation obscures the shape. Complex recursive conditional types can become hard to read, slow to check, or produce very large unions; establish a simple base case and inspect representative results. Utilities are convenient but often shallow: a shallow readonly transformation does not recursively freeze nested fields or runtime objects.

Type-level constraints can reject invalid source code but cannot validate JSON, database rows, or values arriving from JavaScript. Pair static types with runtime validation at trust boundaries. Avoid reimplementing a standard utility unless a distinct behavior is needed.

## What later lessons cover

The first reference lesson connects type queries, indexed access, mapped and conditional transformations, inference, recursion, and template strings. The next explains four intrinsic string manipulation types. Two lessons cover all listed object/union utilities and function/instance/promise utilities, including edge cases such as overload extraction and inference blocking. The history lesson highlights TypeScript 4.1's type-level string/recursive features, TypeScript 5.4's `NoInfer`, and the TypeScript 7.1 beta's stricter relationship check in distributive branches. [Type manipulation handbook](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) · [utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)
