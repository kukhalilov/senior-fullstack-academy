# TypeScript generics, inference, constraints, and variance — Interview questions and reasoning

## Core questions

1. What does a generic type parameter preserve that `any` does not?
2. How does generic inference choose type arguments, and when should a caller be explicit?
3. What is the difference between a generic constraint and a default type argument?
4. How do `keyof` and indexed access create a safe property lookup relation?
5. Explain covariance, contravariance, and invariance in terms of produced and consumed values.
6. What do `in` and `out` annotations mean, and do they override structural typing?
7. Why can method callback parameters be less strictly checked than function properties?
8. What changed in TypeScript 7.1 beta for generic relationships in distributive branches?

## Concise interview answers

1. `T` can tie an input to a result or several members to one caller-selected type. `any` erases the relation and disables checking.
2. The compiler gathers candidates from arguments and context. Use explicit arguments when a parameter has no evidence or when the intended contract should be stated.
3. A constraint restricts legal arguments and exposes guaranteed members; a default supplies an omitted argument when inference does not choose one.
4. `K extends keyof T` restricts the key, and `T[K]` computes the matching property type.
5. Producers are covariant and consumers contravariant under sound function checking. A sound read/write abstraction should be invariant, but TypeScript can still accept covariance for a direct mutable property `value: T`; a widened alias may then permit an unsafe write. `strictFunctionTypes` affects function parameters, not ordinary property variance.
6. They annotate intended variance in advanced cases. They must agree with actual structural use and do not change structural comparisons.
7. TypeScript retains a method-parameter bivariance exception for compatibility. A function-valued property is checked more strictly under `strictFunctionTypes`.
8. The beta checks certain relationships again after a type parameter is narrowed within a distributive conditional branch; a constraint to the original union may not prove a relation to each narrowed constituent. [Official beta notes](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Deep follow-up answers

### How do you decide whether an API should be generic?

Identify the relationship callers need. If the output depends on an input type, or several positions must stay consistent, a parameter can encode it. If the value is merely unknown and callers must inspect it, accept `unknown` and require narrowing. If the API supports only one domain shape, a concrete type is usually easier to read. A generic parameter that occurs only once may be decorative unless callers select it explicitly for a meaningful output contract.

### Why can inference produce a broader result than expected?

Inference reconciles evidence from all candidate positions and context. Multiple arguments, callback positions, contextual targets, and widening rules can produce a union or common supertype. A useful signature gives each parameter a clear inference source. When the intended relationship is ambiguous, annotate the callback or provide an explicit type argument instead of relying on a guessed narrow literal.

### What does a constraint promise to the implementation?

Only members and relations guaranteed by the bound. For `T extends { id: string }`, the body may use `id`; `T` can still include additional fields. Returning `T` preserves those fields for a caller that supplied a more specific type. A type assertion or cast does not create missing runtime data.

### How should variance be explained without oversimplifying TypeScript?

Describe where the parameter appears and use assignability examples. A function consuming `Animal` can safely replace a `Dog` consumer; a producer of `Dog` can replace an `Animal` producer. But structural types may contain multiple positions, mutable members, methods, and compiler options. In particular, semantic invariance for read/write safety does not mean TypeScript rejects every covariant mutable property assignment. TypeScript infers structural variance; annotations are not universal coercion switches. Method bivariance is a specific compatibility exception.

### What is the practical effect of the 7.1 beta change?

Code that relied on a second type parameter retaining a relationship to an entire union after another parameter was distributed/narrowed can fail the stricter check. The safe response is to re-express the branch relationship or narrow/validate the value, not to add an assertion merely to silence the diagnostic. This is beta-specific as of the snapshot date; broad conditional type distribution is covered in t06-022. [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Scenario questions

- A public helper accepts `T` and returns `T | undefined`, but callers only pass one concrete application type. Would a generic improve the API, or just add syntax?
- A callback type rejects a handler for a subtype. Is the callback a function property or method, and is the assignability direction safe?
- A generic type parameter appears only in a return type. Where can its type argument come from?
- A generic factory returns `T` without receiving a value or constructor. What runtime behavior is missing?
- An upgrade to TypeScript 7.1 beta rejects a conditional type accepted in 7.0. Which relation did the old code assume remained true after branch narrowing?

## Tradeoffs and alternatives

Generics improve reuse and retain static relationships, but can obscure a simple concrete contract. Explicit arguments clarify intent but add call-site detail. Constraints improve implementation safety but should stay minimal. Defaults improve ergonomics but can hide the inferred choice. Variance annotations can document advanced recursive relations, but should not be used to force compatibility. Runtime validation remains necessary at untrusted boundaries regardless of generic types.

## Common weak answers

- “Generics are like `any`.” They preserve a relationship; `any` erases it.
- “`extends` makes `T` exactly equal to the constraint.” It only requires assignability to the bound.
- “The compiler always infers the narrowest type.” It reconciles evidence and may widen or combine candidates.
- “`out` forces covariance.” Actual structure still governs structural comparisons.
- “All callbacks are bivariant.” Method parameters have an exception; function properties are stricter under strict function checking.
- “A `T` annotation creates a runtime value.” Type parameters are erased and need a real construction path.
- “The 7.1 beta behavior is the stable TypeScript 7.0 rule.” It is explicitly preview behavior in this snapshot.

## Self-check rubric

A strong answer identifies the preserved relation, names the inference evidence, distinguishes a bound from a fallback, and reasons about variance by input/output positions. It acknowledges structural typing and the narrow method exception. It explains why generic types do not validate runtime values and labels the 7.1 beta change accurately. Relevant sources: [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html), [variance annotations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html), [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/).
