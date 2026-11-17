# TypeScript unions, intersections, narrowing, and control-flow analysis — Interview questions and reasoning

## Core questions

1. What can you safely access on a union before narrowing?
2. How does an intersection differ from a union, and what happens to conflicting properties?
3. How does a discriminant connect a state tag to its payload?
4. Compare `typeof`, `instanceof`, `in`, equality, and truthiness checks.
5. Why does `typeof value === "object"` require a null check?
6. What does a user-defined type predicate promise, and does TypeScript verify it?
7. Which functions can infer a predicate in TypeScript 5.5?
8. How does control-flow analysis handle assignments, early returns, and merges?
9. What did TypeScript 5.4 add for closures and TypeScript 5.5 for constant indexed accesses?
10. What is the difference between `??` and a non-null assertion?
11. How does a `never` check make a switch exhaustive?
12. What did TypeScript 4.9 change about the `in` operator for an unlisted property?

## Concise interview answers

1. Only members/operations valid for every still-possible union member.
2. A union allows one alternative; an intersection requires both. Conflicting property requirements can yield a `never` property; conflicting literal discriminants may reduce the whole intersection to `never`.
3. A shared literal property identifies each member, allowing the checker to narrow the whole object and its associated fields.
4. `typeof` checks primitive categories; `instanceof` follows prototype/constructor semantics; `in` checks property presence; equality compares values; truthiness groups all falsy values.
5. JavaScript reports `typeof null` as `"object"`.
6. It promises that true implies the parameter has the target type and false excludes it. The compiler trusts the annotation; it does not verify the implementation.
7. Functions with no explicit return/predicate, one return and no implicit return, no parameter mutation, and a boolean expression tied to a refinement, with both directions sound.
8. Flow types change along branches/assignments; return and throw remove paths; merge points recombine the types that can still reach them.
9. 5.4 can preserve a narrowing in a non-hoisted closure created after the last assignment when nested functions do not write to the variable. 5.5 can narrow `obj[key]` when both object and key are effectively constant.
10. `??` executes a nullish fallback at runtime; `!` is erased and only tells the checker to remove nullishness.
11. A default branch passes the remaining value to a `never` parameter. An unhandled union member makes that assignment fail.
12. The true branch intersects the object with `Record<key, unknown>`, letting code check a property that was absent from its declared type. The runtime value still needs validation, and an object/null check is needed before using JavaScript `in` on unknown input.

## Deep follow-up answers

### Why are discriminated unions useful for state modeling?

They make invalid combinations harder to express. A state literal and its data fields live in one member, so checking the tag selects the relevant payload. Optional unrelated fields can allow contradictory combinations such as “success with error message”; distinct required tags let both the compiler and reader see the state machine. An exhaustive switch makes the model's variants visible at each consumer.

### What makes a type guard trustworthy?

It performs a real runtime check that supports the exact claimed type. Checking that an `id` property exists does not prove it is a string or that the rest of a large interface is valid. For external values, validate every required field or delegate to a runtime schema. Explicit predicates/assertions are unchecked promises; inferred predicates reduce annotation burden but only apply when both outcomes have the correct meaning.

### When is truthiness too broad?

If `0`, `false`, or `""` is valid, a falsy test removes it along with nullish values. For a map lookup, `value !== undefined` expresses absence more precisely. For a union with multiple primitives, separate exact checks and explicit null handling usually communicate intent better.

### What does the compiler know at a branch merge?

It considers all paths that can reach the merge. A returned branch is gone; a branch that assigns a narrower value may contribute that type; a path that can still carry another union member widens the resulting flow type. The analysis tracks known assignments and alias stability, not arbitrary runtime interleavings or mutation through untyped code.

### How should recent narrowing changes be explained?

TypeScript 5.4 uses last-assignment reasoning for certain closures; nested function writes block it. TypeScript 5.5 infers some predicates and handles checked constant indexed accesses. These are specific analysis improvements with premises—not a claim that TypeScript tracks all aliases or proves arbitrary predicates. [5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html) · [5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

## Scenario questions

- A `string | null` value is checked with `typeof x === "object"`. What does that branch actually mean?
- A `0` score disappears after `.filter(Boolean)`. Which guard expresses the intended “defined” condition?
- A switch handles every current action and uses a `never` fallback. What happens when another action is added?
- An assertion helper compiles, but its body only checks that a value is truthy. Which properties does it really prove?
- A `record[key]` access is narrowed, then `key` is reassigned. Can the prior fact still be relied on?
- A callback accesses a union-typed variable after it was narrowed. Which later assignments determine whether the narrowing survives?

## Tradeoffs and alternatives

Required discriminants make models explicit but add a tag field. Predicates centralize checks but add a trusted contract that must match implementation. Assertions simplify downstream code but can hide runtime failures if they do not throw. `!` is concise but carries no runtime protection. Exhaustive unions provide strong compile-time feedback, while unknown external data still needs runtime validation.

## Common weak answers

- “A union lets me use any member's properties.” It allows only safe common operations before narrowing.
- “An intersection means either interface.” That is a union.
- “`in` means the property is a non-null value.” It checks presence, and optional values may still be undefined.
- “Type predicates are checked by the compiler.” Their implementation is trusted.
- “Truthiness is a null check.” It also excludes valid falsy values.
- “`!` inserts an assertion.” It is erased and does not throw.
- “Exhaustiveness prevents bad API data.” It checks the declared type, not runtime input.

## Self-check rubric

A strong answer models alternatives and states precisely, gives a real runtime check for each refinement, traces assignments and reachability, and recognizes the limits of predicates and assertions. It explains `never` as static exhaustiveness and labels 5.4/5.5 behavior with the right premises. Sources: [Narrowing handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html), [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html).
