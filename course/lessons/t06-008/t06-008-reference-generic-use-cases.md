# TypeScript generics, inference, constraints, and variance — Reference: Generic composition and common patterns

## Scope and version

This lesson explains all 8 supplied patterns. Code uses TypeScript 7.0 stable generic syntax; the cited handbook documents these mechanisms. The 7.1 beta change is not needed by these examples and is covered in the constraints lesson. [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html) · [TypeScript 5.0 const type parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)

## How this group fits the mental model

Patterns are useful when a generic captures an actual relationship: a collection contains one element type, a factory creates one type, or a higher-order function preserves a callback's input and output. The generic should describe what callers can rely on, not hide uncertainty behind `any` or a decorative type parameter.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Identity function generic` | A function such as `identity<T>(value: T): T` returns a value with the same static type. It is a minimal example of linking input and output; it does not clone or validate the runtime value. |
| `Generic collection type` | A type such as `Collection<T>` represents a collection whose elements share a chosen type. Use `readonly T[]` for consumers that only need observation; mutable operations may impose stricter variance and ownership concerns. |
| `Generic factory function` | A function with a type parameter and a construction source, such as a creator callback, returns a value of that type. A generic annotation alone cannot instantiate an arbitrary `T`; the function needs a value, constructor, or factory implementation. |
| `Generic higher-order function` | A function that accepts or returns another function can preserve callback relationships with parameters such as `<A, R>(fn: (value: A) => R): ...`. Inference depends on the callback signature and context. |
| `Generic promise-returning function` | A function can carry `T` through `Promise<T>` or `PromiseLike<T>` so callers know the fulfilled value type. A promise represents eventual fulfillment/rejection; the generic type does not validate data received from a network. |
| `Generic constraint with keyof and indexed access` | A signature such as `<T, K extends keyof T>(object: T, key: K): T[K]` limits the key and returns the corresponding value type. It is useful for property accessors and update helpers, but static typing cannot validate an untrusted string without a runtime check. |
| `Generic class static-side restriction` | A class type parameter describes instances; a static member cannot refer to that instance parameter because the static constructor value exists once for all instances. Put the parameter on a static method itself or use a separate factory function. |
| `Generic type parameter scope` | A parameter is visible only in the declaration that introduces it and nested types within that declaration. A method-level parameter is chosen per call; an enclosing class/interface parameter is chosen for the object/instance type. Reusing the same letter in another declaration does not link them. |

## Cross-item comparison

An identity helper demonstrates a single relation; collection, promise, and factory patterns package a type in a larger abstraction. A factory must have a runtime construction mechanism, while a generic promise-returning function mainly preserves the eventual value type. A higher-order function transports a function's own argument/result relationship. The `keyof`/indexed-access pattern is a constrained property relation, not a runtime key check.

## Examples

```ts
function identity<T>(value: T): T {
  return value;
}

class Collection<T> {
  constructor(readonly items: readonly T[]) {}
  first(): T | undefined { return this.items[0]; }
}

function create<T>(factory: () => T): T {
  return factory();
}

function once<A, R>(operation: (input: A) => R): (input: A) => R {
  let called = false;
  let result: R;
  return input => {
    if (!called) {
      result = operation(input);
      called = true;
    }
    return result;
  };
}

async function loadUser(fetchText: () => Promise<string>): Promise<string> {
  return fetchText();
}

function read<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}
```

`once` caches the first result and intentionally ignores later inputs; this is often unsuitable if the output should depend on each call. Its type preserves the callback's `A` to `R` relation. `create` receives a runtime function capable of producing `T`. The class's `T` belongs to instances, so a static method needing a type parameter must declare its own.

## Common mistakes

- Writing `function create<T>(): T { return {} as T; }` as if a type parameter provided a runtime constructor. It does not.
- Using `Promise<any>` for a parsed response and then treating it as validated. Parse as `unknown` and validate at runtime.
- Using mutable collections when consumers only need reads, making assignability harder without a need to write.
- Using `K extends keyof T` while accepting external text without checking that the text is a valid key.
- Expecting a method's class type parameter to be inferred separately per call; declare a method-level parameter for that behavior.
- Treating a generic helper as automatically safer. Its signature must model the real relationship and implementation.

## Knowledge checks with answers

1. **Can `function create<T>(): T` construct arbitrary `T`?** No. It needs a runtime value, constructor, or creator.
2. **What does `Promise<T>` guarantee?** The static type of the fulfilled value; it does not validate network data.
3. **When does a class parameter apply?** To the instance type; a static method must declare its own type parameter if it needs one.
4. **What does `<K extends keyof T>` contribute?** Restricts the key and links the result as `T[K]`.

Sources: [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html), [TypeScript 5.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html).
