# TypeScript function types, overloads, predicates, and call signatures — Big-picture orientation and mental model

## Problem and purpose

Functions are values, and APIs often accept callbacks, expose methods, support several call shapes, or construct instances. A function type describes which calls are accepted and what result the caller can rely on. Overloads model multiple public call shapes; call and construct signatures can be placed on objects that also have properties. Predicate and assertion returns connect a runtime check to the static types used after a call.

This topic uses TypeScript 7.0 stable; TypeScript 7.1 is beta as of 2026-11-16. Its TypeScript 5.5 history note matters because eligible boolean functions may now infer predicate return signatures. We focus on type shapes and compatibility, not JavaScript's general runtime function behavior. [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html) · [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

## Plain-language mental model

Treat a function signature like a contract for a call: the caller supplies an allowed argument list, and gets a declared result type. A function type expression is the compact contract for one signature. A call signature places that contract on a callable object; a construct signature describes a value used with `new`. Overloads publish several contracts while one implementation handles them.

The implementation signature is not automatically part of the public contract. Likewise, a predicate or assertion return is a claim about runtime behavior: TypeScript uses the claim but does not prove the function body truthful. A function assigned to a callback type returning `void` may return a value internally; the caller is simply not allowed to rely on it.

## How the parts fit together

1. Define the public parameter and return relationships.
2. Choose a function type expression for one callable signature, or a call/construct signature for an object shape.
3. Use overloads only when callers need distinct argument/result relationships; keep their order and implementation behavior aligned.
4. Use optional, rest, and tuple-rest parameters to express the actual allowed argument lists.
5. Use `this` as a type-only first parameter when a callback's expected receiver matters.
6. Check assignment compatibility: a callback must safely accept every call the API may make, and its result must satisfy what the API expects.

## Concept map

```text
API call surface
 ├─ function expression: one signature
 ├─ object call signature: callable + properties/overloads
 ├─ construct signature: callable with new
 └─ overload list: several caller-visible forms
          │
implementation body (hidden overload signature)
          │
callback assignability + contextual typing
          ├─ parameter compatibility
          ├─ return compatibility
          └─ optional/rest/tuple argument shapes
```

## End-to-end walkthrough

```ts
type Search = {
  description: string;
  (query: string): string[];
  (query: string, limit: number): string[];
};

function search(query: string, limit = 10): string[] {
  return query ? [query].slice(0, limit) : [];
}
const lookup = search as Search;
lookup.description = "Search the local index";
```

The call signatures describe the callable shape; `description` adds an object property. The implementation must be attached to a value that truly has the property at runtime. The final assertion only tells the checker the value has the richer shape—it does not create `description`, so production code should build such an object deliberately. This example shows the type relationship; later examples implement a callable object safely.

## When to use it and tradeoffs

Use a function type expression for a callback with one call shape. Use an object call signature when a callable value also carries state or properties. Use overloads when calls have distinct valid forms or result types and no simpler generic/union signature communicates them as well. If an argument may already be a union, a single signature accepting that union can be easier than many overloads.

Optional parameters mean the implementation may be called without that argument; do not mark a callback parameter optional merely because callback authors can ignore it. Rest tuples preserve finite argument correlations; ordinary rest arrays describe repeated values. Explicit `this` types are static only. Predicate and assertion declarations are powerful but require truthful implementations. [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html)

## What later lessons cover

The concepts lesson establishes function contracts, overload visibility, receiver parameters, and callback compatibility. Reference lessons cover all supplied signature forms, overload/predicate forms, and callback relationships. TypeScript 5.5 can infer a predicate return signature for eligible functions; its detailed two-way narrowing conditions are taught in t06-021. The type compatibility topic t06-009 handles broader structural and variance rules. [TypeScript 5.5 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)
