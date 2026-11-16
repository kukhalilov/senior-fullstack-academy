# TypeScript generics, inference, constraints, and variance — Core concepts and how they fit together

## Learning objectives

- Explain why a generic preserves a relationship that `any` erases.
- Follow a type parameter from declaration through inference to instantiation.
- Choose constraints, defaults, and explicit type arguments deliberately.
- Reason about generic variance and the method-parameter compatibility exception.
- Separate stable generic behavior from the TypeScript 7.1 beta change.

## Prerequisites

Know function parameter and return types, object types, unions, `keyof`, indexed access, and assignability. Conditional and mapped type construction is treated in t06-022; this lesson only explains the relevant 7.1 generic relationship change.

## Core concepts

### A type parameter represents a relationship

`function echo<T>(value: T): T` promises that the result has the caller's type. For a string literal variable, the type may be widened to `string` before the call; generics preserve the type information available at the call boundary, not runtime identity or an arbitrary original annotation. `function echo(value: any): any` accepts and returns anything but cannot protect the relationship. `unknown` is safer for an unrelated unknown value because operations require narrowing.

Type parameters are scoped to declarations. A function's parameter is selected per call; a class or interface parameter applies to its instance shape; a method may declare a separate parameter. A generic static side cannot use the class's instance parameter because the constructor value exists once, not once for each instance type.

### Inference is evidence gathering, not magic

For `function pair<A, B>(a: A, b: B): [A, B]`, arguments provide direct inference sites. Context can also contribute: an expected callback signature or assignment target may help infer a parameter. Candidate types can be combined or widened to satisfy all positions; do not assume the compiler always chooses the narrowest possible type.

When a parameter has no useful inference site, inference cannot recover the caller's intention from nowhere. Supply an explicit type argument or redesign the signature so the type is represented in an input. A generic parameter used only in a return position is a common warning sign: the caller cannot provide evidence unless it names the type explicitly.

A default type argument is a fallback after inference has no candidate or a caller omits a trailing argument. It is not a constraint and does not force every inference to use that default. Required parameters must precede optional/defaulted parameters. A default must satisfy its constraint.

### Constraints preserve the chosen subtype

`T extends { id: string }` means the chosen `T` must have at least the required member. Inside the body, code may rely on that member, while return types can retain extra fields from the actual type. A constraint does not mean `T` is exactly the constraint. If a constraint mentions another type parameter, it creates an ordering/dependency: later parameters can be restricted by earlier ones.

`K extends keyof T` ties a key to a particular object type. `T[K]` then recovers the property value type. This indexed relationship is stronger than accepting a plain string and returning `unknown`.

### Variance describes type argument movement

A generic type is covariant in a parameter when it produces that type in output positions: if `Dog` is assignable to `Animal`, a read-only producer of `Dog` can generally be used where a producer of `Animal` is required. It is contravariant when it consumes values: a function able to handle any `Animal` can stand in where a handler for `Dog` is needed. Invariant positions combine reading and writing and usually prevent either direction of substitution.

TypeScript is structurally typed and computes variance from member positions. `in` and `out` annotations were added in 4.7, but are advanced, must agree with the actual structure, and do not change structural comparisons. Function parameter variance is affected by `strictFunctionTypes`; method parameter positions retain a deliberate bivariant compatibility exception for common callback patterns. This exception is not a general soundness guarantee. [Variance annotations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html) · [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html)

### Current and recent version changes

- **TypeScript 4.7:** introduced `in` and `out` variance annotations. Use only when needed and when annotations match structural behavior.
- **TypeScript 5.0:** added const type parameters so generic APIs can request const-like inference for eligible arguments. This is distinct from writing `as const` at a call site.
- **TypeScript 6.0:** functions that do not use `this` can be less context-sensitive, improving some inference cases independently of property order. This does not mean all inference is order-independent.
- **TypeScript 7.1 beta:** distributive conditional branches receive stricter checks for relationships between a narrowed type parameter and another parameter constrained by the original. This can reject a construction accepted in 7.0 that was unsound. The beta announcement illustrates the behavior; broader conditional distribution mechanics belong to t06-022. [TS 5.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html) · [TS 6.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) · [TS 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Mechanisms and relationships

Consider `function choose<T, K extends keyof T>(obj: T, key: K): T[K]`. The object supplies evidence for `T`; the string-literal key supplies evidence for `K`; the constraint checks the key belongs to the object; indexed access computes the result. The output is precise because the signature connects all four stages. If the function accepted `key: string`, it would need a runtime check and could not promise `T[string]` safely.

For variance, inspect where a type parameter occurs, not its name. `Box<T> { value: T }` both reads and writes and is invariant-like under strict checking. `Reader<T> { read(): T }` produces. `Writer<T> { write(value: T): void }` consumes. A method-shaped callback can differ from a function-property callback under the method bivariance rule; choose the stricter function-property form when contravariant checking is important.

## Worked examples

### Preserve an input/output relation

```ts
function last<T>(values: readonly T[]): T | undefined {
  return values.at(-1);
}
const result = last([10, 20]); // number | undefined
```

The array provides evidence for `T`; the return remains connected to it. The `undefined` is part of the empty-array case.

### A constraint does not erase extra fields

```ts
function label<T extends { id: string }>(value: T): T {
  value.id.toUpperCase();
  return value;
}
const record = label({ id: "u1", active: true });
record.active; // boolean
```

The body may use `id`, while `T` preserves `active`. Returning only `{ id: string }` would discard that precise relation.

### Inference site limitation

```ts
function makeValue<T>(): T {
  throw new Error("A value must be supplied by the implementation");
}
const configured = makeValue<Date>();
```

There is no argument from which to infer `T`, so the caller supplies it. The example throws because a generic annotation cannot manufacture a runtime `Date`; a real factory must receive a constructor or creation function.

## Misconceptions and edge cases

- A constraint describes a minimum guaranteed shape; it does not make every `T` equal to that shape.
- Defaults are fallback type arguments, not runtime defaults and not constraints.
- A type parameter that appears only in an output often cannot be inferred at a call site.
- `const T` improves literal inference at eligible generic boundaries; it cannot make a mutable parameter accept readonly data if its constraint rejects it.
- Variance annotations do not override structural compatibility. Incorrect annotations can mislead readers and tools.
- Function parameter bivariance is limited and intentional; do not generalize it to every function-valued property.
- Conditional distribution occurs when a conditional checks a naked type parameter, but the complete conditional-type topic is t06-022.
- The 7.1 branch-checking change is beta as of 2026-11-16, not a stable 7.0 rule.

## Knowledge checks with answers

1. **Why is `T` better than `any` in `echo`?** It preserves the relation between the input type and output type; `any` disables checks.
2. **What can code use from `T extends { id: string }`?** Members guaranteed by the constraint, while retaining the more specific `T`.
3. **What does a default type parameter do?** Supplies a fallback when no argument is inferred or supplied; it does not constrain candidates.
4. **Where is variance inferred?** From structural uses of the parameter in the generic type.
5. **Does `out T` make a structurally consuming type covariant?** No; annotations must match actual variance and do not change structural comparisons.
6. **What is version-sensitive about distributive branches?** TypeScript 7.1 beta strengthens certain relationships after narrowing; the full feature mechanics are in t06-022.

Sources: [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html), [variance annotations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html), [const type parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/).
