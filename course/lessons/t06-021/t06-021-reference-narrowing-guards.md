# TypeScript unions, intersections, narrowing, and control-flow analysis — Reference: Built-in and user-defined type guards

## Scope and version

This lesson explains all 14 supplied guard names. It highlights TypeScript 5.5 inferred predicates and distinguishes a checker-trusted predicate declaration from code that actually validates a value. Examples assume strict checking. [Narrowing handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) · [TypeScript 5.5 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

## How this group fits the mental model

A guard is an observation or declared function contract that can refine a value's flow type on a branch. Built-in guards are interpreted by the compiler; custom predicates and assertions supply a promise from user code. A guard should reflect a real runtime test and should be precise enough in both the true and false directions.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `typeof type guard` | A comparison such as `typeof value === "string"` narrows primitive types and callable/object categories. JavaScript reports `typeof null` as `"object"`; add a null check when needed. |
| `instanceof type guard` | `value instanceof C` performs JavaScript's runtime instance check and can narrow to types associated with `C`. It follows runtime prototype/`Symbol.hasInstance` semantics, so it is not a universal validator for structurally similar objects or values crossing realms. |
| `in operator narrowing` | `"name" in value` checks property presence along the object/prototype chain and narrows types that declare the property. Since TypeScript 4.9, when a checked object type does not list the key, the true branch intersects it with `Record<"name", unknown>` so the property can be checked next. Optional-property types can remain on both sides; presence does not guarantee a non-undefined value. At runtime the right operand must be an object and the left operand a property key. |
| `Equality narrowing` | Equality comparisons can narrow operands using their possible overlapping values, such as `x === y`, or remove a literal/nullish possibility. The checker uses strict equality semantics for `===`/`!==`; coercive equality details belong to t06-011. |
| `Truthiness narrowing` | A truthy/falsy branch removes values according to JavaScript truthiness. It is useful for nullish/object checks but can also remove valid `0`, `false`, and empty-string values; use exact checks when those values are meaningful. |
| `Assignment narrowing` | An assignment changes the flow type to the assigned value's compatible type at that point. Later branches start from the current flow type, while the declared variable type remains the overall assignment contract. |
| `Control-flow narrowing` | The checker tracks guards, assignments, reachability, and merges to compute a flow type at each location. A narrowing applies only along paths where the evidence holds and can be invalidated by a write. |
| `Type predicate (parameter is Type)` | A function return annotation like `value is User` states that `true` means the parameter is `User` and `false` means it is not. TypeScript trusts this annotation; it does not prove the implementation satisfies the claim. |
| `Inferred type predicate` | Since TypeScript 5.5, eligible functions may infer a predicate instead of plain `boolean`: no explicit return/predicate annotation, one return and no implicit return, no parameter mutation, and a boolean expression tied to a refinement. The inferred predicate has if-and-only-if semantics; `x !== undefined` may qualify where `!!x` is unsound for `number | undefined`. |
| `Assertion signature (asserts parameter is Type)` | An assertion function's normal return tells the checker the named parameter has the specified type. It should throw or otherwise fail when the check fails; the declaration is trusted and not verified. |
| `Assertion condition (asserts condition)` | An assertion signature such as `asserts condition` tells the checker that the provided condition is true after normal return. It can encode arbitrary facts, so implementation correctness is the author's responsibility. |
| `User-defined type guard` | A function with a predicate return type performs a runtime test and exposes a narrowing contract. Prefer checking discriminants and required field types rather than asserting a broad interface based on shallow presence alone. |
| `Array.isArray type guard` | The built-in `Array.isArray(value)` checks whether a value is an Array and narrows an `unknown`/union accordingly. It does not validate element contents; narrow or validate each element as needed. |
| `Unknown narrowing` | `unknown` permits no unsafe operations until checks, equality, predicates, or assertions narrow it. Unlike `any`, it forces the caller to establish what operations are safe. |

## Cross-item comparison

`typeof` tests primitive runtime categories; `instanceof` follows constructor/prototype behavior. The `in` operator checks property presence, whereas equality checks compare values. Truthiness combines several falsy cases and is less exact than equality/nullish checks. `Array.isArray` specifically tests array identity semantics and not element validity.

A predicate returns a boolean plus a two-way type claim. An assertion signature instead establishes a fact when execution continues, normally by throwing on failure. Both forms are trusted declarations. TypeScript 5.5's inferred predicate only appears when its conditions and if-and-only-if meaning can be supported. [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

## Examples

```ts
function isNonNullish<T>(value: T) {
  return value !== null && value !== undefined;
}

function parseLabel(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toFixed(0);
  throw new TypeError("Expected text or a number");
}

function assertStringArray(value: unknown): asserts value is string[] {
  if (!Array.isArray(value) || !value.every(item => typeof item === "string")) {
    throw new TypeError("Expected an array of strings");
  }
}

function packageName(value: unknown): string | undefined {
  if (value !== null && typeof value === "object" &&
      "name" in value && typeof value.name === "string") {
    return value.name;
  }
  return undefined;
}

function use(value: unknown): string[] {
  assertStringArray(value);
  return value;
}
```

With TypeScript 5.5, `isNonNullish` can infer a generic predicate equivalent to a non-nullish refinement. The explicit assertion performs both an array check and an element check; `Array.isArray` alone would only establish that the outer value is an array. The exception makes failure visible at runtime. In `packageName`, the object check prevents the runtime `in` operator from receiving null or a primitive; TypeScript 4.9 gives the previously unlisted `name` property type `unknown`, which the final `typeof` check refines to string.

An unsound predicate example should be avoided: declaring `function isUser(x: unknown): x is User { return true; }` tells the checker every value is a user. Since the compiler trusts the signature, code may compile and then fail when it accesses a missing field.

## Common mistakes

- Forgetting `typeof null === "object"`.
- Assuming `instanceof` proves structural compatibility or works identically across realms.
- Assuming an `in` check means the property's value is defined.
- Using `in` on an unchecked `unknown`, null, or primitive value; establish an object first, then validate the property value separately.
- Using truthiness to remove only `null`/`undefined`, inadvertently discarding valid zero/empty/false values.
- Treating an explicit predicate or assertion signature as compiler-verified.
- Assuming TypeScript 5.5 infers a predicate for every boolean-returning callback; the structural conditions and reverse direction must hold.
- Treating `Array.isArray` as validation of elements.
- Using `any` where `unknown` plus guards would make the data boundary explicit.

## Knowledge checks with answers

1. **Can `typeof x === "object"` exclude null?** No; `typeof null` is `"object"`.
2. **Does `"id" in x` prove `x.id` is non-undefined?** No; optional properties or explicit undefined values can remain.
3. **What must an inferred predicate establish?** Its true and false results must correspond to the target/refined and excluded type sets.
4. **Does `Array.isArray` validate elements?** No, only the outer array condition.
5. **Does TypeScript verify an explicit predicate implementation?** No; the author is responsible for making the check truthful.
6. **How does TypeScript 4.9 narrow an unlisted property after `"name" in objectValue`?** It intersects the object type with `Record<"name", unknown>`; a separate value check is still needed.

Sources: [Narrowing handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html), [TypeScript 4.9 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html), [TypeScript 5.5 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html).
