# TypeScript function types, overloads, predicates, and call signatures — Interview questions and reasoning

## Core questions

1. What information does a function type expression describe, and what can a call signature add?
2. Why are overload signatures separate from the implementation signature?
3. When is an overload clearer than a union-parameter signature, and when is it not?
4. What does an explicit `this` parameter mean at type level and runtime?
5. What is the difference between an optional callback parameter and a callback implementation that ignores an argument?
6. What does `void` mean as a callback return type?
7. How do type predicates and assertion signatures differ?
8. What does contextual typing do for callback parameters?
9. How should function parameter compatibility be reasoned about under `strictFunctionTypes`?
10. What TypeScript 5.5 change can affect predicate return signatures?

## Concise interview answers

1. A function type expression describes one call signature; an object call signature can be combined with properties or other signatures.
2. Overloads are the public call surface. The implementation signature is hidden and exists only to type-check the body against the overload set.
3. Use overloads when input shapes correspond to distinct results or exact call forms. A union parameter is often better when behavior/result are uniform or callers already hold a union value.
4. It declares an expected receiver type and is erased; JavaScript still supplies/binds `this` according to runtime rules.
5. Optional means the API may omit it. Ignoring means the callback receives it but declares fewer parameters, which is generally allowed.
6. The caller discards the result through that type; an implementation may still return a value.
7. A predicate refines on a true/false result; an assertion establishes a fact if execution continues, normally by throwing otherwise.
8. It supplies expected parameter types from the callback's use context.
9. The callback must accept every value the API may pass. Ordinary function parameters are contravariant under strict checking; method/constructor positions retain an exception.
10. Eligible boolean functions can infer type predicate return signatures under TypeScript 5.5's conditions; detailed rules are covered in the narrowing unit. [TS 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

## Deep follow-up answers

### Why is an implementation signature not callable?

It is an implementation detail, not a public promise. If an implementation has optional trailing parameters but the overload list exposes only one- and three-argument forms, a two-argument call remains invalid. Write the exact overloads callers need. This separation lets the body use broad unions while the API gives precise caller-side result types.

### Why can overloads reject a union argument?

The argument's static type must fit a single overload. A value typed `string | number` is not assignable to either a string-only or number-only overload, even though every runtime value would fit one. Add an overload for the union when that usage should be allowed, or use one union signature if it produces a suitably broad result.

### How do you decide whether a callback parameter is optional?

Look at every invocation the API may perform. If it might call the callback without the parameter, mark it optional and require handlers to deal with undefined. If the API always passes the value, keep it required; callback functions are allowed to ignore parameters they do not need. This keeps the contract aligned with actual invocation.

### What can go wrong with a predicate or assertion signature?

The signature is trusted. A function that claims a value is a `User` after checking only that it is truthy may let code access fields that do not exist. A predicate also has two-way meaning: false excludes the target. An assertion must stop normal execution when its condition fails. Validate the actual fields and types at the runtime boundary.

### How do parameter and return types affect assignment?

An API may call a callback with any value allowed by its parameter type, so the callback must accept that range. With `strictFunctionTypes`, function-property parameter types are checked in the contravariant direction, while method and constructor signatures have a bivariance compatibility exception. Return types must provide a value compatible with what the caller expects. A void target ignores values returned by a callback.

## Scenario questions

- A date helper uses an optional parameter implementation but expects only one or three arguments. Why does two arguments fail?
- A function accepts `string` and `number` separately through overloads. A variable has type `string | number`; what API change would permit a direct call?
- An event listener callback declares an optional `event` parameter, but the API always supplies it. What safety issue does this introduce?
- A callback returning a number is assigned to `() => void`. Can the caller use the number through this target type?
- A type predicate only checks for a truthy object before claiming a full interface. What does the compiler verify?

## Tradeoffs and alternatives

Overloads provide precise call/result mappings but increase implementation and test obligations. Union signatures simplify broad inputs but may lose input/output correlation. Call signatures express function objects with properties; separate metadata objects may be clearer for simple APIs. Predicates improve flow typing but are trusted contracts. Assertions shorten validation paths only when they fail correctly. Explicit annotations improve public declarations; contextual typing keeps local callback code concise.

## Common weak answers

- “The implementation signature makes every implementation call legal.” Callers see overload declarations only.
- “Overloads always accept a union of their parameter types.” Each call must match one overload.
- “Optional means the callback may ignore the parameter.” It means the caller may omit it.
- “A `void` callback cannot return a value.” It means the caller ignores the result.
- “`this` is an ordinary first argument.” The TypeScript annotation is erased.
- “The compiler checks that a predicate is true.” It trusts the declaration.
- “All function parameters are checked contravariantly.” Method/constructor positions have a compatibility exception.

## Self-check rubric

A strong answer distinguishes public overloads from implementation, aligns optionality with real calls, explains call/construct object types, and checks callback assignment from the API's perspective. It describes `this` as type-only, treats predicates/assertions as trusted runtime promises, and labels TypeScript 5.5 predicate inference accurately. Sources: [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html), [type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html), [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html).
