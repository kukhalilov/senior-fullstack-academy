# TypeScript primitive, literal, object, array, and tuple types — Interview questions and reasoning

## Core questions

1. What is the difference between a TypeScript type and a JavaScript runtime value?
2. Compare `any` and `unknown`. Why is unknown a safer API boundary?
3. How do `void` and `never` differ?
4. What does the `object` type accept, and why is it not the same as a plain record?
5. Explain literal widening for `const`, `let`, and mutable object properties.
6. What does `as const` do, and what does it not do?
7. Compare an annotation, a type assertion, and `satisfies`.
8. What do expression non-null assertions and definite-assignment assertions suppress?
9. When would you choose a tuple, `T[]`, or `ReadonlyArray<T>`?
10. What is the runtime difference between a type alias, numeric enum, string enum, and const enum?
11. What are the risks of `Function` and of boxed primitive types?
12. What changed in TypeScript 5.0 enum typing, and did enum runtime emit change?

## Concise interview answers

1. Types are compile-time descriptions and are generally erased. Runtime values are what JavaScript executes; annotations do not parse or convert them.
2. Both accept arbitrary input, but `unknown` forbids operations until narrowing. `any` allows unchecked operations and propagates unsafety.
3. `void` indicates callers should ignore a function's result. `never` indicates no value/normal completion can occur and is assignable to every type.
4. `object` excludes primitives but includes arrays and functions. It does not guarantee record keys or a JSON-like shape.
5. A const primitive binding commonly retains its literal; a let binding widens; properties of a const object can widen because they remain mutable.
6. `as const` retains literal information and adds static readonly structure. It does not freeze the JavaScript object.
7. An annotation checks and exposes a target type; an assertion claims compatibility with no runtime check; `satisfies` checks against a target while generally retaining the expression's inferred type. [TypeScript 4.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
8. `value!` suppresses a nullish warning at that expression; `field!` suppresses definite-assignment analysis. Neither inserts a runtime check or initialization.
9. Use arrays for homogeneous sequences, tuples for ordered position-specific data, and `ReadonlyArray<T>` when consumers should not mutate through that view.
10. A type alias is erased. Numeric and string enums normally emit runtime objects; numeric enums include reverse mappings. Const enum members are generally inlined/erased and can be problematic in published declarations.
11. `Function` has no useful parameter/result contract; boxed primitives are object types rather than primitive values. Use exact signatures and lowercase primitive types.
12. TypeScript 5.0 made all enums union enums, including computed members previously not modeled as distinct member types. It changed checker type behavior, not ordinary enum JavaScript emission. [TypeScript 5.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)

## Deep follow-up answers

### Why use `unknown` for external input?

It admits the value at the boundary while forcing the program to establish facts before operations. A network response or `JSON.parse` result is not made trustworthy by an annotation. A guard, schema parser, or equivalent runtime validation should verify the shape and produce a trusted typed value. `any` instead lets the unverified value flow anywhere.

### Why can an assertion be unsafe even when it compiles?

An assertion is not a coercion or proof. It tells the checker to accept a relationship that may not hold at runtime. It can be reasonable after a separate validation or when an external invariant is genuinely known, but it should not replace that check. Double assertions via `unknown` are especially capable of hiding incorrect assumptions.

### When is a tuple a poor alternative to an object?

A tuple is compact when order is inherent, such as a coordinate pair or return pair, and labels can improve editor readability. But labels are not property names; callers still use numeric positions. If values have many fields, optional positions, or frequent extension, an object with named properties is often clearer and safer.

### What does readonly really guarantee?

It prevents writes through a particular statically typed path. It is shallow for object properties and does not freeze memory. Another mutable alias can change the same object, and JavaScript callers do not observe the TypeScript restriction. Use runtime freezing/copying when the runtime contract requires immutability.

### When choose an enum over a literal union?

An enum is useful when a runtime object is part of the API, such as a namespaced set of values. A literal union is simpler when only compile-time checking is needed and emits no code. Const enums can reduce output but create consumer/version pitfalls when declarations are published; a regular enum or union is often safer for library contracts.

## Scenario questions

### “The JSON has a `User` annotation”

Explain why assigning parsed JSON with `as User` does not validate it. Propose a guard or schema-based parser and identify which required fields and nested values must be checked.

### “Why did my literal become `string`?”

Explain mutable binding/property widening. Show when a type annotation with a literal union, a const assertion, or `satisfies` is appropriate, and distinguish preserving a type from freezing a value.

### “The API takes `Function`”

Replace it with an exact callback call signature. Explain how argument and result checking improve and why `Function` can still accept unsafe calls.

### “I need an immutable list”

Distinguish a `ReadonlyArray<T>` view from a readonly tuple and from runtime immutability. Describe when to copy/freeze data or avoid exposing mutable aliases.

## Tradeoffs and alternatives

- Use inference for obvious local values; annotate exported boundaries and complex contracts.
- Use literal unions for type-only finite choices and enums when a runtime enum object is needed.
- Use `unknown` plus narrowing for untrusted values; use `any` only for deliberate, contained escape hatches.
- Use tuples for fixed positional protocols and objects for named, extensible data.
- Use `readonly` for API-level write restrictions and runtime freezing/copying for runtime guarantees.
- Use `satisfies` to validate authored configuration while retaining useful narrow inference; use annotations when callers should see the broader contract.

## Common weak answers

- “Types convert values.” They are static descriptions and are erased.
- “`unknown` is just another name for `any`.” Unknown requires checks.
- “`void` means the function returns undefined.” A void callback's result is ignored; exact values differ by position.
- “`const` makes objects immutable.” It prevents rebinding, not property writes.
- “`as` validates.” It only changes static checking.
- “`readonly` means nobody can mutate the array.” It only blocks writes through that reference.
- “String enums have reverse mappings.” Numeric enums have reverse mappings; string enums do not.
- “A tuple's `x` label creates an `.x` property.” Tuple labels are positional documentation/tooling.

## Self-check rubric

Score 0–2 per answer: **0** if you confuse runtime and static behavior; **1** if correct but missing a caveat; **2** if you state the type behavior, the relevant compiler context, and the runtime boundary. Aim for 18/24 with no zero on unknown/assertions, readonly, or enum behavior.
