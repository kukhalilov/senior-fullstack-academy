# TypeScript generics, inference, constraints, and variance — Exercises and worked solutions

## Goals

Practice preserving input/output relationships, deriving property value types, designing useful inference sites, and avoiding generic signatures that claim runtime guarantees they cannot provide. Stable examples target TypeScript 7.0; the final exercise discusses the 7.1 beta separately.

## Worked example

Build a safe property reader. The object determines `T`; the key is limited to `keyof T`; `T[K]` expresses the matching result.

```ts
function getProperty<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}

const profile = { name: "Mina", visits: 4 };
const name = getProperty(profile, "name"); // string
const visits = getProperty(profile, "visits"); // number
```

An arbitrary string could fail at runtime, so it cannot be accepted as a valid key without a check or a type assertion. The signature prevents that mistake for statically known keys.

## Exercises

1. Write `first<T>` for a readonly array and return `T | undefined`.
2. Write `mapValues<A, B>` that transforms every value in a readonly `A[]` using `(value: A) => B`, returning `B[]`.
3. Write `make<T>` so it can actually create a value of type `T`; explain why an empty function returning `T` cannot infer or construct it.
4. Define `Box<T>` with a readonly value and a generic `unwrap` function. Show that the returned type is retained.
5. Define `readKey<T, K extends keyof T>` with result `T[K]`. Add a compile-time example where the wrong key is rejected.
6. Explain why a generic class static member cannot refer to the class's instance type parameter, then show a static method with its own parameter.
7. A generic API receives both a producer of `Dog` and a consumer of `Animal`. State which direction of substitution each position suggests and why mutable read/write storage is more restrictive.
8. A helper using a type parameter constrained by another parameter compiles under TypeScript 7.0 but is rejected inside a distributive conditional branch by TypeScript 7.1 beta. Explain why narrowing the original parameter does not automatically prove the second parameter has the narrowed type.

## Progressive hints

1. The element type is the type parameter; indexing an empty array may produce `undefined`.
2. Infer `A` from the array and `B` from the callback return.
3. Accept a callback such as `() => T`; generic syntax itself creates no runtime object.
4. A generic function can recover the `T` member from a `Box<T>` argument.
5. Use the key parameter in both the constraint and indexed access.
6. The static side exists independently of each `Class<T>` instance.
7. A producer returns a value; a consumer accepts one. Distinguish semantic read/write safety from TypeScript assignment behavior for a direct mutable property.
8. The original relation is `B extends A`; after distribution, the branch uses one narrowed constituent of `A`, and `B` might still represent another permitted constituent.

## Complete solutions

1. Implement a generic first-element helper.
   ```ts
   function first<T>(items: readonly T[]): T | undefined {
     return items[0];
   }
   ```
   The union accounts for empty input. `T` remains tied to the element type.

2. Implement a mapper that can change element type.
   ```ts
   function mapValues<A, B>(items: readonly A[], convert: (value: A) => B): B[] {
     return items.map(convert);
   }
   ```
   `A` is inferred from the collection and `B` from the callback result. The standard `map` method returns a new mutable array.

3. Make a generic factory that receives a runtime creator.
   ```ts
   function make<T>(factory: () => T): T {
     return factory();
   }
   const date = make(() => new Date());
   ```
   A type parameter is erased at runtime. The callback supplies the construction behavior and inference evidence.

4. Define a box and recover its contained type.
   ```ts
   interface Box<T> { readonly value: T }
   function unwrap<T>(box: Box<T>): T { return box.value; }
   const count = unwrap({ value: 7 }); // number
   ```
   The argument determines `T`; the result retains it.

5. Implement a key-safe property reader.
   ```ts
   function readKey<T, K extends keyof T>(object: T, key: K): T[K] {
     return object[key];
   }
   const item = { sku: "A1", stock: 3 };
   const sku = readKey(item, "sku"); // string
   // readKey(item, "missing"); // compile-time error
   ```
   The invalid call is shown as a comment so the surrounding example remains compilable; uncommenting it produces a type error.

6. A class's instance parameter is not in scope on its static side. Put a fresh parameter on the static method and provide a runtime creator:
   ```ts
   class SafeCache<T> {
     constructor(readonly value: T) {}
     static from<U>(create: () => U): SafeCache<U> { return new SafeCache(create()); }
   }
   const cache = SafeCache.from(() => new Date());
   ```
   `U` is declared on the method, so it is independently inferred. A type assertion such as `undefined as U` would suppress checking but would not construct a value.
7. A producer of `Dog` can be used where a producer of `Animal` is expected because each produced dog is an animal. A consumer that accepts `Animal` can be used where a consumer for `Dog` is expected because it accepts every dog. Semantically, a sound read/write cell should not freely substitute because widening may allow unsafe writes. TypeScript does accept covariance for a plain mutable property such as `{ value: Dog }` to `{ value: Animal }`, so explain this compiler unsoundness rather than claiming the language rejects it. `strictFunctionTypes` does not change ordinary property variance.

8. A constraint against the full union `A` does not mean the constrained parameter is assignable to every individual constituent after `A` is narrowed by distributive processing. TypeScript 7.1 beta checks that relationship more strictly and can reject the unsound assumption. Keep the compiler version explicit; this is a beta change, not the stable 7.0 rule. [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Tests and edge cases

- Test `first([])` and verify the result type includes `undefined`.
- Test `mapValues` with an empty input and with a callback that changes type, such as number to string.
- Check that a factory callback is actually invoked and that a thrown error propagates; types do not promise successful construction.
- Confirm that an invalid key call is rejected by the compiler, while a value typed `any` can bypass that protection.
- Under `strictFunctionTypes`, compare a function-property consumer and a method-shaped callback; do not assume all callback positions are equivalent.
- Compile beta-specific conditional examples with the exact 7.1 beta compiler; do not infer beta diagnostics from stable 7.0.

## Reflection questions

- Which positions in your generic API provide inference evidence?
- Does each type parameter preserve a useful relationship or only add ceremony?
- What runtime check or constructor is needed beyond the static type?
- Is a type parameter consumed, produced, or both?
- Could a concrete type or `unknown` be clearer than another generic?

Sources: [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html), [TypeScript 4.7 variance annotations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html), [TypeScript 5.0 const type parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html), [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/).
