# TypeScript primitive, literal, object, array, and tuple types — Big-picture orientation and mental model

## Problem and purpose

JavaScript values have runtime behavior; TypeScript types describe which values are expected and what operations are statically permitted. An annotation does not convert, validate, or freeze a value. Types help the checker catch mismatches before execution, then are erased unless the source also contains a JavaScript construct such as an enum.

The topic covers primitive and special types, literal information, inference and assertions, object shapes, arrays, and tuples. It reflects TypeScript 7.0 stable as of 2026-11-16. The 7.0 compiler is a native port designed to preserve 6.0 type-checking behavior; 7.1 remains beta. [Everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) · [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)

## Plain-language mental model

Think of a type as a boundary description, not a runtime label. `number` says which values fit a variable; the JavaScript value remains just a number. Inference is the checker reading the expression and describing it. A type annotation provides a destination shape. A literal may either stay precise (`"ready"`) or widen to a broader type (`string`) depending on whether the location can be reassigned.

For containers, arrays mean “a sequence whose elements share a type.” Tuples mean “a sequence with known positions.” Readonly views restrict writes through one typed reference; they do not freeze the runtime object. Assertions change the checker’s belief and are erased, so they are only justified when some other fact has established the value.

## How the parts fit together

1. Choose a primitive or special type appropriate for the value and nullability policy.
2. Preserve literal details when they carry meaning, or allow widening when mutation is expected.
3. Describe object properties and function/constructor shapes that consumers need.
4. Use arrays for homogeneous collections and tuples for fixed-position or protocol-like sequences.
5. Prefer `unknown` at untrusted boundaries and narrow it; avoid `any` and the overly broad `Function` type.
6. Treat assertions and non-null operators as compile-time claims, not checks.
7. Use aliases for type-only naming; use enums only when a runtime enum object is actually desired.

## Concept map

```text
JavaScript value (runtime)
   │
   ├─ annotation ──► required static contract
   ├─ inference ───► type derived from expression/context
   ├─ assertion ───► programmer claim (erased; no validation)
   │
   ├─ primitive / literal / special type
   └─ object shape ── property/call/construct/index members
        ├─ Array<T> / ReadonlyArray<T>: repeated elements
        └─ tuple: positions, optional/rest tails, labels
```

## End-to-end walkthrough

```ts
type Status = "queued" | "running" | "done";

const initial = { status: "queued", attempts: 0 } as const;
let status: Status = initial.status;

const steps: readonly [name: string, retryable?: boolean] = ["download"];
const input: unknown = JSON.parse('{"status":"done"}');
```

The `as const` keeps literal properties and marks the object’s type readonly; it does not freeze it. `Status` restricts allowed states. The tuple gives position 0 a name and permits an optional second element. `input` is unknown because parsing does not validate a schema. A real program must check the input before treating it as `Status`.

## When to use it and tradeoffs

Use inference when the expression makes the intended type clear; annotate public boundaries and places where wider contracts improve readability. Use literal unions for small finite string/number choices without needing a runtime enum object. Choose a tuple when each position has a distinct role and a known order; use an array when items are homogeneous and length is variable. Prefer `readonly` views for APIs that promise not to mutate inputs, while remembering that aliases may still mutate them.

Avoid `any`, boxed primitive types, broad `Function`, and unchecked assertions as shortcuts. Use `unknown` for uncertain data. TypeScript cannot validate network, storage, or JSON data merely because a variable is annotated.

## What later lessons cover

The concepts lesson explains widening, contextual inference, readonly behavior, nullish types, and the type/runtime boundary. The reference lessons enumerate primitive/special/literal/declaration types; annotations, inference, and assertions; then object, array, and tuple forms. Later topics handle narrowing (t06-021), generic relationships (t06-008), and structural compatibility (t06-009). `satisfies` arrived in TypeScript 4.9; const assertions and readonly tuples arrived in 3.4; TypeScript 5.0 made all enum types union enums. [TypeScript 4.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) · [TypeScript 5.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)
