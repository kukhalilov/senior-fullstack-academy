# TypeScript indexed, conditional, mapped, and utility types — Exercises and worked solutions

## Goals

Practice reading and composing type-level queries, mapped transformations, conditional filters, template strings, and standard utilities. Every operation here changes a static type only; runtime construction, validation, and copying remain ordinary code responsibilities.

## Worked example

Create a patch type containing only fields that a caller is allowed to edit:

```ts
type Product = { readonly id: string; name: string; price: number; tags: string[] };
type ProductPatch = Partial<Pick<Product, "name" | "price">>;

const patch: ProductPatch = { price: 12 };
```

`Pick` selects the permitted properties and `Partial` makes those properties optional. `tags` is not part of the patch, and nothing in this type changes a `Product` object at runtime.

## Exercises

1. Given a type `User`, derive a union of its property names and a generic type that returns the declared type of one selected field.
2. Define a mapped type `Mutable<T>` that removes top-level readonly modifiers and another `Optional<T>` that makes top-level fields optional. Explain what they do not change.
3. Define a conditional type that keeps only string members of a union. Then write a tuple-wrapped condition that asks whether the whole union is assignable to `string`.
4. Use a mapped type with key remapping to create `getName`, `getAge`, etc. for string keys only. Give each function the original property type as its return.
5. Use `NoInfer` so a list of allowed values determines a type parameter and a default choice is checked against it but cannot widen it.
6. Extract the parameter tuple and return type from a function with `Parameters` and `ReturnType`. Add overloads and explain which signature those utilities observe.
7. Given `Promise<Promise<number>> | string`, determine its `Awaited` type. Explain why that does not fetch or validate data.
8. A recursive conditional type processes nested tuple types. Identify a terminating base case and one risk if the input shape is infinitely recursive or very deep.
9. A TypeScript 7.1 beta build rejects a generic relation in a distributive conditional branch. Explain which relationship is no longer assumed and how version labeling affects the lesson.
10. Determine `keyof (A | B)` and `keyof (A & B)` for two object types with one shared key and distinct keys. Explain why a string index signature also includes `number` in `keyof`.
11. Write a type alias using `typeof import("./library.js")`. Explain what it references and whether it emits or loads a runtime import.
12. Under `strictNullChecks`, determine `NonNullable<unknown>` and explain the TypeScript 4.8 representation change.

## Progressive hints

1. Use `keyof` and `T[K]`, with `K` constrained to the keys of `T`.
2. Mapped modifiers use `-readonly` and `?`.
3. A naked checked parameter distributes; square brackets around it suppress distribution.
4. Use `as` and guard the key with a string constraint or conditional.
5. Put `NoInfer<C>` on the argument that should not supply the inference candidate.
6. Built-in function utilities use the last overload signature.
7. `Awaited` recursively unwraps promise-like members while preserving ordinary members.
8. Return the input unchanged or a known empty type in the base case; recursive calls must move toward it.
9. Each distributed branch narrows the original type parameter; a second parameter constrained by the full original union need not satisfy that narrower type.
10. The union exposes only the common key; the intersection exposes keys from both sides. `keyof { [key: string]: unknown }` is `string | number` because JavaScript coerces numeric property keys to strings.
11. `type Library = typeof import("./library.js")` queries the module's static exported type; it is type-only syntax and does not load or emit a module import.
12. It is `{}`: since TypeScript 4.8, `NonNullable<T>` is modeled as `T & {}`, and `{}` excludes only null and undefined when strict null checking is enabled.

## Complete solutions

1.
   ```ts
   type User = { id: number; name: string };
   type UserKey = keyof User;
   type UserField<K extends keyof User> = User[K];
   type NameType = UserField<"name">; // string
   ```
   `keyof` produces the key union, and indexed access retrieves the selected property's declared type. This does not test whether a runtime user value is valid.

2.
   ```ts
   type Mutable<T> = { -readonly [K in keyof T]: T[K] };
   type Optional<T> = { [K in keyof T]?: T[K] };
   ```
   These are shallow static transformations. They neither mutate nor freeze objects, and `Optional<T>` does not recursively make nested properties optional.

3.
   ```ts
   type OnlyStrings<T> = T extends string ? T : never;
   type AllStrings<T> = [T] extends [string] ? true : false;
   type Filtered = OnlyStrings<"ok" | 2 | "ready">; // "ok" | "ready"
   type IsAll = AllStrings<string | number>; // false
   ```
   The first condition distributes because `T` is naked. The bracketed condition checks the union as a whole.

4.
   ```ts
   type Getters<T> = {
     [K in keyof T as K extends string ? `get${Capitalize<K>}` : never]: () => T[K]
   };
   type UserGetters = Getters<{ name: string; age: number }>;
   // { getName: () => string; getAge: () => number }
   ```
   The conditional key remapping excludes symbols/numbers so the string intrinsic is well-typed. The mapped type describes a shape; code must implement these functions.

5.
   ```ts
   function choose<C extends string>(allowed: readonly C[], fallback: NoInfer<C>): C | undefined {
     return allowed.includes(fallback) ? fallback : undefined;
   }
   const mode = choose(["dark", "light"], "dark");
   ```
   `C` comes from `allowed`. The fallback must be assignable to that inferred union and does not widen it. The function returns `undefined` if it is not in the list.

6.
   ```ts
   function convert(value: string): number;
   function convert(value: number): string;
   function convert(value: string | number): string | number {
     return typeof value === "string" ? value.length : String(value);
   }
   type ConvertArgs = Parameters<typeof convert>; // [value: number]
   type ConvertResult = ReturnType<typeof convert>; // string
   ```
   The last overload signature is the number overload, so extraction yields its parameter and return. The implementation signature is not the public overload set exposed by these utilities. The code's `typeof` is a runtime value check; this is different from the type query operator.

7. `Awaited<Promise<Promise<number>> | string>` is `number | string`. It models the type produced by awaiting each union member. It does not perform the await, access a server, check a payload, or model rejection as a fulfillment value.

8. One simple recursive tuple flattener uses an empty tuple as a base case:
   ```ts
   type Flatten<T extends readonly unknown[]> =
     T extends readonly [infer Head, ...infer Tail]
       ? Head extends readonly unknown[]
         ? [...Flatten<Head>, ...Flatten<Tail>]
         : [Head, ...Flatten<Tail>]
       : [];
   ```
   This illustrates a terminating shape for finite tuples, but recursive and variadic tuple cases have compiler complexity limits and need careful testing. It is not a runtime array flattener.

9. A relation `B extends A` to the original union does not prove `B` is assignable to every narrowed constituent after `A` is distributed. TypeScript 7.1 beta rejects that assumption in cases where it could produce an impossible result; keep the claim labeled beta and teach the broader distribution rule separately. [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

10.
   ```ts
   type Left = { id: string; left: boolean };
   type Right = { id: number; right: Date };
   type SafeUnionKeys = keyof (Left | Right); // "id"
   type CombinedKeys = keyof (Left & Right); // "id" | "left" | "right"
   type DictionaryKeys = keyof { [key: string]: unknown }; // string | number
   ```
   A value of the union may be either alternative, so only the shared key is safe. An intersection must satisfy both shapes. JavaScript treats `object[0]` and `object["0"]` as the same property key.

11. `type Library = typeof import("./library.js")` references the module's static exported shape in a type position. No runtime import expression is emitted by this alias.

12. `NonNullable<unknown>` is `{}` with `strictNullChecks`. TypeScript 4.8's `T & {}` form makes the utility more directly reducible and idempotent; it remains a static type operation, not a runtime check. [TypeScript 4.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-8.html)

## Tests and edge cases

- Check that `keyof` and `T[K]` preserve numeric/symbol keys when those occur in the source type.
- Check empty unions (`never`), broad types (`string`), and literal unions separately; broad `string` is not a union of every possible string literal.
- Inspect optional-property behavior under `exactOptionalPropertyTypes` before deciding whether explicit `undefined` is allowed.
- Verify mapped modifiers are shallow and that readonly static types do not prevent mutation through another alias at runtime.
- Check overload extraction against the final overload, not the implementation signature.
- Use a runtime test for any value-level transformation or validation; a type alias provides neither.
- Compile recursion examples with a finite input and observe type checker limits before applying them to recursively defined types.
- For 7.1 beta diagnostics, compile with the exact beta compiler; do not present the result as stable 7.0 behavior.

## Reflection questions

- Which original declaration should stay in sync with a derived type?
- Is a type operator improving a public API or making a direct interface harder to understand?
- Where does the runtime value get validated or transformed?
- Could a broad union/template expansion create excessive type-checking work?
- Which helper should be reused instead of reimplementing a built-in utility?

Sources: [type manipulation handbook](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html), [utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html), [TypeScript 4.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html), [TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html), [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/).
