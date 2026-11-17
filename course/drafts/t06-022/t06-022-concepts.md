# TypeScript indexed, conditional, mapped, and utility types — Core concepts and how they fit together

## Learning objectives

- Read type operators as compile-time queries and transformations, not runtime operations.
- Derive a property name union and the type at a selected key.
- Explain how conditional and mapped types process unions and object properties.
- Use inference and recursive type definitions with clear base cases.
- Understand the limits and edge cases of built-in utility types.

## Prerequisites

Know TypeScript unions, object types, generic parameters, function and constructor types, and assignability. Generic parameter declaration/inference mechanics are taught in t06-008. Runtime narrowing is covered in t06-021.

## Core concepts

### Type queries inspect declarations

`keyof T` produces the permitted property keys of `T`; the result is often a string, number, or symbol literal union, not a runtime array. `keyof (A | B)` includes only properties safe on both alternatives, while `keyof (A & B)` combines their available keys. A string index signature broadens the result to `string | number` because numeric object keys are string-coerced; `keyof any` is `string | number | symbol`. `typeof value` in a type position asks for the static type of a declared value, and `typeof import("./module.js")` queries a module's exported type without emitting an import. These differ from JavaScript's runtime `typeof` operator.

Indexed access `T[K]` looks up a property type using a key type. If `K` is a union, `T[K]` becomes the union of the corresponding member types. A constrained key (`K extends keyof T`) prevents asking for an absent property. Array indexing can use `number` to represent the element type; tuple indexes can select known positions. With `noUncheckedIndexedAccess`, runtime array indexing has an added possibility of `undefined`; a type-level element lookup is not itself proof that an array position exists.

### Conditional types branch on assignability

`A extends B ? X : Y` asks whether `A` is assignable to `B` in the type computation. It is not runtime `if`, and the two branches are types. When the checked side is a naked type parameter, the conditional distributes over a union: each member is tested separately and the results are unioned. Wrapping the checked parameter (for example, in a tuple) suppresses distribution. This behavior powers union filters such as `Exclude` and `Extract`.

Inside a true branch, the compiler can use the checked relation to narrow the type. `infer` names a component discovered by matching a structure, such as a function's argument tuple or a promise-like fulfillment type. The inferred name is scoped to the conditional branch. If a naked parameter distributes, each branch works with one constituent; another parameter constrained by the original union is not automatically assignable to that branch constituent. TypeScript 7.1 beta makes that relation check stricter, as described below.

### Mapped types iterate over keys

`{ [K in keyof T]: ... }` creates properties by iterating over a key union. A homomorphic mapping over the keys of its source can preserve source modifiers, union distribution, and tuple/array structure. A mapped type can alter optional/readonly status, remove a modifier with `-?` or `-readonly`, add one with `+?` or `+readonly`, and remap/drop keys with `as` (mapping to `never` drops a key). Removing optionality can also remove implicit `undefined`; exact behavior for explicitly declared `undefined` depends on `exactOptionalPropertyTypes`. Mapped types are transformations of static structure, not object-copying code.

### Template literal types form string families

A type such as `` `on${Capitalize<EventName>}` `` combines text with string literal types. A union in an interpolation position expands to combinations of its members; several union positions can produce a cross product that grows quickly. `infer` can capture a substring pattern in a conditional template literal. The four built-in casing utilities are intrinsic compile-time operations; their results are not runtime calls. TypeScript 4.1 introduced template literal types, key remapping, recursive conditional types, and intrinsic string manipulation types. [TypeScript 4.1 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html)

### Recursive conditional types need a stopping point

A recursive conditional type applies itself to a smaller or structurally simpler part of its input, with a base case that returns without recursion. For example, recursively unwrap nested promise-like values or flatten a nested tuple. A recursion that does not progress or lacks a terminating branch can hit compiler instantiation limits. These limits are implementation safeguards, not a promise that arbitrarily deep types compile.

### Built-in utility types are standard transformations

The object utilities transform property optionality, readonly status, selection, omission, or key/value construction. Union utilities select or remove assignable members. Function utilities extract parameter tuples, return values, constructor arguments, instance types, or explicit `this` information. `Awaited` recursively models promise/thenable unwrapping. `NoInfer` blocks one position from contributing inference candidates while leaving its type otherwise unchanged. `ThisType` is a contextual marker, not a transformation that returns a new type. The official utility list is global; third-party deep utilities are outside this topic. [Utility types handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Mechanisms and relationships

A property getter type can be built by combining a key query, mapped remapping, and indexed access:

```ts
type Getters<T> = {
  [K in keyof T as K extends string ? `get${Capitalize<K>}` : never]: () => T[K]
};
type UserGetters = Getters<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }
```

Each operation answers one question: which keys exist, which keys are string-like, what is each value type, and what new key name should be created. If any operation is omitted, a different static shape results. No object with these methods is created until runtime code implements it.

## Worked examples

### Extract the fulfilled value type

```ts
type Fulfilled<T> = T extends PromiseLike<infer V> ? V : T;
type A = Fulfilled<Promise<number>>; // number
type B = Fulfilled<string>; // string
```

This one-level example demonstrates matching and inference. The built-in `Awaited` handles recursive unwrapping and the thenable behavior expected by `await`; prefer it for ordinary promise result types.

### Filter a union with distribution

```ts
type OnlyStrings<T> = T extends string ? T : never;
type Result = OnlyStrings<"ok" | 3 | "done">; // "ok" | "done"
```

Because `T` is naked on the checked side, each union member is tested. The false result `never` disappears from the final union. `T extends string ? T : never` is a type-level filter, not a runtime guard.

### Infer a function's parameter tuple

```ts
type Args<F> = F extends (...args: infer P) => unknown ? P : never;
type Options = Args<(id: string, active?: boolean) => void>;
// [id: string, active?: boolean]
```

The function shape is matched and `P` captures the parameter tuple. The built-in `Parameters` is preferable unless the conditional itself is being taught or adapted.

## Misconceptions and edge cases

- `keyof` does not return an array and `typeof` in a type position is not a runtime inspection.
- `T[K]` says what a property is declared as, not whether a runtime object actually has it.
- A conditional type is not a runtime test. Static types are erased.
- Distribution requires the checked side to be a naked type parameter; tuple wrapping changes behavior.
- `Exclude` filters by assignability, not by textual name or exact equality.
- `Readonly<T>` and `Partial<T>` are shallow transformations and do not freeze or mutate runtime values.
- `ThisType<T>` only participates in contextual typing when applicable compiler options/context exist; it does not create a `this` object.
- Recursive and template-literal expansions can grow rapidly and slow type checking.
- The stricter distributive-branch relation is a TypeScript 7.1 beta behavior, not stable 7.0. [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Knowledge checks with answers

1. **What does `keyof User` yield?** A static union of the object's property key types.
2. **Why does `OnlyStrings<A | B>` process each member?** Its checked type parameter appears naked on the left of `extends`, so the conditional distributes.
3. **How do you suppress that distribution?** Wrap the checked type, commonly `[T] extends [U]`.
4. **What does `infer P` do?** Captures a type component while matching a structure inside a conditional type.
5. **Does a mapped `readonly` modifier freeze the runtime object?** No; it changes only the static type.
6. **What does `NoInfer<T>` change?** It blocks that position from contributing inference candidates; the resulting type is otherwise `T`.
7. **What changed in TypeScript 7.1 beta?** A distributed/narrowed type parameter is treated as distinct from the original, so relationships to another parameter constrained by the original are checked more strictly.

Sources: [type manipulation](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html), [utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html), [TypeScript 4.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html), [TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html), [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/).
