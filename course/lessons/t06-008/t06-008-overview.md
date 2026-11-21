# TypeScript generics, inference, constraints, and variance — Big-picture orientation and mental model

## Problem and purpose

A function such as `first(items: string[]): string | undefined` works for strings, but duplicating it for numbers, users, and other values is noisy. Replacing every type with `any` removes duplication by throwing away the useful relationship: the value returned should have the same element type that went in. Generics let one declaration describe a family of types while preserving those relationships for each use.

This topic follows TypeScript 7.0 stable. TypeScript 7.1 is beta as of 2026-11-16; its stricter relationship checks in distributive conditional branches are labeled beta. This unit focuses on generic declarations, inference, constraints, variance, and practical patterns. It assumes basic TypeScript functions, object types, unions, and assignability.

## Plain-language mental model

Think of a type parameter as a named slot whose value is chosen for one use of a reusable declaration. In `function first<T>(items: readonly T[]): T | undefined`, a call with `string[]` fills the slot with `string`; the input and output remain connected. The compiler often fills the slot by inference. A constraint says what every possible fill must support; it does not replace the precise filled-in type.

A generic is useful when a type varies but a relationship stays the same. If a parameter appears only in a return type and cannot be inferred, the caller may need to supply it. If no relationship needs preserving, a concrete union or `unknown` may be clearer. `any` is different: it disables many checks instead of preserving an unknown value safely.

## How the parts fit together

1. A declaration introduces type parameters and their scope.
2. A call site supplies values and contextual information.
3. Inference gathers candidates for each parameter from input positions and context.
4. Constraints reject candidates that lack required structure; defaults fill parameters that cannot otherwise be inferred.
5. The instantiated type substitutes the chosen arguments into the declaration while preserving input/output relationships.
6. Variance describes how changing a type argument affects assignability of the resulting generic type. TypeScript usually infers this structurally; annotations are advanced hints, not a way to override structural truth.

## Concept map

```text
reusable declaration
  ├─ type parameters: names and scope
  ├─ constraints/defaults: allowed values and fallback
  └─ positions: input, output, both
          │
call arguments + contextual target
          ▼
inference ──► chosen type arguments ──► instantiated signature
                                          │
                                          ├─ precise values and returns
                                          └─ assignability shaped by variance
```

## End-to-end walkthrough

```ts
function pluck<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}

const user = { id: 12, name: "Ada" };
const name = pluck(user, "name"); // string
const id = pluck(user, "id");     // number
```

At the first call, `T` is inferred from `user`; `keyof T` is therefore `"id" | "name"`. The key argument lets `K` become `"name"`. The indexed access result `T[K]` is then `string`, so the return type remains tied to the selected property. The constraint `K extends keyof T` prevents selecting a key absent from the object. If the function instead returned `unknown`, callers would have to recover the relationship themselves; if it used `any`, unsafe operations would be allowed.

## When to use it and tradeoffs

Use a type parameter when callers may choose different types and the declaration needs to preserve a relation among inputs, outputs, or members. Prefer a concrete type when there is only one meaningful shape. Prefer `unknown` for a value whose type is not yet known but must be narrowed before use. Avoid decorative parameters that occur only once and do not connect meaningful positions; they often make APIs harder to infer.

Inference minimizes call-site noise, but can choose a wider type than intended when inputs disagree. Explicit type arguments are useful when inference lacks evidence or a deliberate contract is needed. Constraints should describe the minimum operations required. Variance annotations should be rare: first understand the structure and use them only for a specific advanced compatibility or performance reason.

## What later lessons cover

The concepts lesson explains declaration scope, inference, constraints, and variance. The reference lessons cover every supplied declaration, inference, annotation, and use-case name. Practice builds typed helpers and identifies bad generic designs. The interview lesson focuses on explaining inference and assignability. TypeScript 4.7 added variance annotations, 5.0 added const type parameters, 6.0 improved inference for some functions that do not use `this`, and the 7.1 beta strengthens a particular conditional-type relationship check. These are targeted changes, not a replacement for the core generic model. [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)
