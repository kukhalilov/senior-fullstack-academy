# TypeScript indexed, conditional, mapped, and utility types — Interview questions and reasoning

## Core questions

1. What does `keyof T` provide, and how does `T[K]` use that result?
2. How does type-position `typeof` differ from JavaScript's `typeof` expression?
3. When does a conditional type distribute over a union, and how do you prevent it?
4. What does `infer` capture, and where is the inferred variable available?
5. How can mapped types change property names and modifiers?
6. What do template literal types do with unions in interpolation positions?
7. How do `Exclude` and `Extract` differ, and why does `Exclude<string, "x">` remain `string`?
8. What limitations do `Parameters` and `ReturnType` have for overloads and generic functions?
9. What does `NoInfer` change about an API call?
10. What changed for distributive type parameter relationships in TypeScript 7.1 beta?
11. How does `keyof` behave for a union compared with an intersection?
12. What is `typeof import("./module.js")` used for?
13. What does `NonNullable<unknown>` become in modern TypeScript under `strictNullChecks`?

## Concise interview answers

1. `keyof T` produces a union of keys; `T[K]` selects the declared property type for one or more permitted keys.
2. Type-position `typeof` obtains a static type from a declared value name/property path; JavaScript `typeof` evaluates a value and returns a string.
3. Distribution occurs when a naked type parameter is the checked side of a conditional. Wrapping it, commonly as `[T] extends [U]`, checks the union as a whole.
4. `infer` captures a matching component inside the true branch of a conditional type.
5. Mapped types iterate a key union, `as` can remap/drop keys, and `?`/`readonly` modifiers can be added or removed.
6. Union substitutions expand into combinations, potentially a large cross product.
7. `Exclude` removes assignable union members; `Extract` retains them. Broad `string` is not a finite union of literal members to subtract individually.
8. Overload extraction uses the last signature; unresolved generic parts can become `unknown`.
9. It blocks one type position from supplying inference candidates while keeping that position's assignability check.
10. A distributed branch's narrowed parameter is no longer assumed to relate to another parameter constrained only by the original union; the beta can reject unsound uses. [7.1 beta notes](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)
11. A union exposes only keys safe on every alternative; an intersection can expose keys from both constituents.
12. It obtains a module's static exported type without writing a runtime import expression.
13. `{}`. Since TypeScript 4.8, `NonNullable<T>` is represented as `T & {}`; this excludes nullish types statically but validates no runtime value.

## Deep follow-up answers

### How do you design a derived object type?

Start with the source object type, use `keyof` to define the candidate keys, and use `T[K]` to retain each corresponding property type. Use a mapped type when every selected key gets a systematic transformation. Apply key remapping only when the public shape truly changes names. State whether optionality and readonly behavior are copied, added, or removed. Remember this describes a static contract; runtime code must implement any new fields or remove old ones.

### Why do conditional utility types filter unions?

A conditional with a naked type parameter is instantiated once for each union member, and the resulting branch types are unioned. `never` contributes no member, so the pattern `T extends Condition ? T : never` keeps matches. This tests assignability, not textual equality or runtime values. Tuple-wrapping the checked side avoids member-by-member distribution when the question concerns the whole union.

### What are the important extraction edge cases?

`Parameters` constructs a tuple and `ReturnType` selects a result from a function type. For overloads, both infer from the last signature; they do not produce a union of all public overloads. A generic function may lose the relationship selected per call, often leaving an `unknown` component. The utility type is not a substitute for an explicit API describing all overload cases.

### How should you approach recursive and template-literal types?

Use a finite example, identify the input part processed on each recursive step, and define a base case. Estimate how unions multiply across template positions. Keep generated unions small and readable; a powerful type that makes diagnostics unreadable or checking expensive may be worse than a direct explicit type.

### How do you explain the 7.1 beta change without overgeneralizing?

The prior constraint relates a parameter to an original union. Conditional distribution represents one constituent in each branch. That does not prove the constrained parameter belongs to each branch-specific subset. TypeScript 7.1 beta introduces a stricter check for these cases. It is a compiler behavior boundary, not a new runtime rule and not a replacement for the general distribution definition. [Official beta explanation](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Scenario questions

- A derived type duplicates the fields of a source interface and begins to drift. Which query/mapped mechanisms could keep it synchronized?
- A type filter unexpectedly returns `never` for `string`. Why does subtracting one literal from broad `string` not work as expected?
- A utility type captures only one overload. How can you tell whether the last signature matches the intended public use?
- A mapped type says every field is readonly, but the object changes in production. What static/runtime distinction should you investigate?
- A team proposes a deeply recursive template-literal utility. What complexity and readability risks need evaluation?
- A TypeScript beta upgrade begins rejecting a conditional helper. How do you verify whether the issue is a stricter branch relation rather than an unrelated inference change?

## Tradeoffs and alternatives

Derived types reduce duplication and preserve relations, but complex transformations can hide the actual public shape. Prefer standard utilities for their established semantics; use a small custom mapped/conditional type only when it expresses a genuinely different contract. Add runtime validation for untrusted values. Balance recursive precision against compiler cost, error clarity, and maintenance.

## Common weak answers

- “`keyof` returns the keys at runtime.” It creates a static key type.
- “A conditional type is an `if` statement.” It branches during type checking, not execution.
- “`Exclude` removes a string value from any string.” It removes assignable union members.
- “`Readonly<T>` freezes the value.” It changes only static assignment checks and is shallow.
- “`ReturnType` returns every overload.” It uses the last signature.
- “`NoInfer` changes the accepted type.” It changes inference participation, not assignability after inference.
- “The 7.1 beta check is stable TypeScript 7.0 behavior.” Label the release correctly.

## Self-check rubric

A strong explanation distinguishes static type computation from runtime behavior, composes key queries/indexed access/mapped transforms correctly, explains naked-parameter distribution, and accounts for recursion and union growth. It knows the sharp edges of built-in extraction utilities and labels the 7.1 beta change with an adjacent authoritative source. Sources: [type manipulation](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html), [utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html), [TypeScript 4.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html), [TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html), [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/).
