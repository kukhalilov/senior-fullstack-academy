# TypeScript unions, intersections, narrowing, and control-flow analysis — Exercises and worked solutions

## Goals

Practice modeling finite states, validating unknown values, tracking flow types, and deciding when an assertion is unsafe. TypeScript examples assume strict checking; recent 5.4/5.5 behavior is labeled where relevant.

## Worked example

Model a request result so success data cannot be accessed in failure state:

```ts
type Load<T> =
  | { status: "pending" }
  | { status: "done"; value: T }
  | { status: "error"; message: string };

function display<T>(load: Load<T>): string {
  if (load.status === "done") return String(load.value);
  if (load.status === "error") return load.message;
  return "Loading";
}
```

The literal `status` links each state's fields to its tag. A plain object with unrelated optional fields would allow contradictory combinations and require more checks.

## Exercises

1. Define a union for a payment state: waiting, paid with a receipt ID, or declined with a reason. Write a function that handles every state and use a `never` check.
2. Write a function accepting `unknown` that returns a string for string/number inputs and throws for all other values. Explicitly account for `null`.
3. Given `"name" in value` where one union member has an optional `name`, explain why that member can appear in both branches.
4. Write `isPresent` for `T | null | undefined` using a single boolean return. Explain when TypeScript 5.5 may infer a predicate and why `!!value` is not equivalent for numeric input.
5. Write an assertion function that verifies an unknown value is an array of strings. Explain why `Array.isArray` alone is insufficient.
6. Use `??` to give a fallback for a numeric setting. Show why `||` would be wrong when zero is meaningful.
7. Destructure a discriminated union and use its tag to safely access the associated payload. Explain the binding stability needed.
8. TypeScript 5.4 narrows a value inside a callback after conversion to a new type. Explain the last-assignment condition and what nested mutation would do.
9. TypeScript 5.5 narrows `record[key]` after `typeof`. State both stability requirements.
10. Create two object types with a conflicting property and explain the difference between a `never` property and an entire intersection that reduces to `never`.
11. Validate an `unknown` package value with `in` and a value-type check. Explain TypeScript 4.9’s unlisted-property narrowing and why the object check must come first.

## Progressive hints

1. Give every state a required literal `status`; route the default to an `assertNever` helper.
2. A `typeof value === "object"` check includes null; exact primitive checks are clearer here.
3. Optional means the key can be present or absent for that member.
4. A return such as `value !== null && value !== undefined` has the two-way meaning needed for non-nullish narrowing.
5. Check the container and every element.
6. `??` tests only nullish values; `||` tests all falsy values.
7. Keep the discriminant and payload from the same const destructuring.
8. The callback must be created after the final assignment; nested function assignment defeats the analysis.
9. Neither the object nor the key may change between check and access.
10. Conflicting literal discriminants can make the combined type impossible as a whole; ordinary property conflicts can leave the containing object with a `never` property.
11. First prove the value is a non-null object, then check `"name" in value`, then test `typeof value.name === "string"`; since 4.9 the property becomes `unknown` after the presence check, not already a string.

## Complete solutions

1.
   ```ts
   type Payment =
     | { status: "waiting" }
     | { status: "paid"; receiptId: string }
     | { status: "declined"; reason: string };
   function assertNever(value: never): never { throw new Error(String(value)); }
   function summary(payment: Payment): string {
     switch (payment.status) {
       case "waiting": return "Waiting";
       case "paid": return payment.receiptId;
       case "declined": return payment.reason;
       default: return assertNever(payment);
     }
   }
   ```
   Adding a new member without a case makes the default argument cease to be `never`.

2.
   ```ts
   function stringifyPrimitive(value: unknown): string {
     if (typeof value === "string") return value;
     if (typeof value === "number") return String(value);
     throw new TypeError("Expected a string or number");
   }
   ```
   `null` is rejected by the final throw; it is not mistakenly treated as an object string.

3. The optional member may have values both with and without the property. The true branch can include it because the property exists; the false branch can also include it because this particular value omitted it. Use a required discriminant when the alternatives must be exclusive.

4.
   ```ts
   function isPresent<T>(value: T | null | undefined) {
     return value !== null && value !== undefined;
   }
   ```
   Under TypeScript 5.5 the eligible function can infer a predicate for a non-nullish value because the boolean precisely describes both outcomes. `!!value` is false for `0`, even though zero is present, so it cannot imply the same refinement for `number | undefined`.

5.
   ```ts
   function assertStringArray(value: unknown): asserts value is string[] {
     if (!Array.isArray(value) || !value.every(item => typeof item === "string")) {
       throw new TypeError("Expected an array of strings");
     }
   }
   ```
   `Array.isArray` checks only the outer container. The element loop checks each member. The checker trusts the assertion, so retain both runtime checks.

6.
   ```ts
   function portOrDefault(port: number | undefined): number {
     return port ?? 3000;
   }
   ```
   A port of `0` remains `0`. `port || 3000` would replace it because zero is falsy.

7.
   ```ts
   type Action = { kind: "text"; payload: string } | { kind: "count"; payload: number };
   function render(action: Action): string {
     const { kind, payload } = action;
     return kind === "text" ? payload.toUpperCase() : payload.toFixed(0);
   }
   ```
   The correlated fields are destructured from one const binding and not reassigned; TypeScript 4.6 supports this pattern.

8. Narrowing after the last assignment is retained in a non-hoisted closure created after that assignment. If a nested function assigns to the captured variable, TypeScript cannot know when that callback runs and invalidates the preserved fact. [TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html)

9. The object expression and key expression must both be effectively constant between guard and use. If either changes, the indexed access can refer to a different value and should not reuse the earlier narrowing. [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

10.
   ```ts
   type HasText = { value: string };
   type HasNumber = { value: number };
   type Both = HasText & HasNumber; // object requirement with value: never
   type Red = { kind: "red" };
   type Blue = { kind: "blue" };
   type Impossible = Red & Blue; // reduces to never due incompatible discriminants
   ```
   A plain conflicting property may remain as a `never` member on the object type, while conflicting discriminant values can prove the entire intersection impossible.

11.
   ```ts
   function packageName(value: unknown): string | undefined {
     if (value !== null && typeof value === "object" &&
         "name" in value && typeof value.name === "string") return value.name;
     return undefined;
   }
   ```
   The right side of JavaScript `in` must be an object; the initial null/type check makes that runtime operation safe. TypeScript 4.9 narrows an unlisted property to `unknown`, so the value still needs its own validation.

## Tests and edge cases

- Exercise every union variant and make an unhandled case a compile error through the `never` helper.
- Test `null`, empty strings, zero, and false separately; truthiness does not mean non-nullishness.
- Test a value with an optional property both present and absent.
- Make an assertion guard reject a malformed object/array at runtime, not just compile.
- Check that changing a key after an indexed-access guard does not rely on stale narrowing.
- Check closure behavior when a nested callback writes to a captured variable.
- An explicit `value is T` predicate can be wrong even though code compiles; review its true and false behavior.

## Reflection questions

- Does the shape model mutually exclusive states or unrelated optional fields?
- Which runtime observation proves the refinement?
- Can any write or callback invalidate that observation?
- Is a type assertion hiding an absent validation check?
- What compile-time failure would expose a newly added union variant?

Sources: [Narrowing handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html), [TypeScript 4.6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-6.html), [TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html), [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html).
