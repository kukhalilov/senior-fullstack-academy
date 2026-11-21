# TypeScript unions, intersections, narrowing, and control-flow analysis — Reference: Control flow, reachability, and safe alternatives

## Scope and version

This lesson explains all 13 supplied control-flow names. It includes the relevant TypeScript 4.4, 4.6, 5.4, and 5.5 milestones; these are targeted additions to flow analysis, not runtime validation. [Narrowing handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) · [TypeScript 4.6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-6.html) · [TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html) · [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

## How this group fits the mental model

Control-flow analysis models which statements can run and what assignments or guards are true on the path to each statement. It narrows a flow type, not a runtime value. Understanding reachability explains why early exits, switch branches, destructuring, closures, and `never` work—and why mutation can invalidate a conclusion.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Control-flow graph` | The conceptual graph of possible execution paths through branches, loops, returns, throws, and merges. The compiler uses this structure to calculate a variable's flow type at each point. |
| `Reachability analysis` | Determines which statements and branches can still execute. A return, throw, or always-true branch can make later code unreachable; impossible paths contribute no remaining type. |
| `Branch merge narrowing` | When control paths meet, TypeScript combines the types that can reach the merge. A value narrowed differently in two still-reachable branches can widen to their union. |
| `Switch discriminant narrowing` | Testing a literal discriminant in `switch` removes other union members within each case. Each branch sees the payload associated with that case. |
| `Optional chaining narrowing` | `value?.property` safely short-circuits when the base is nullish and the expression's result may include `undefined`. It is an expression-level nullish operation, not proof that the base is defined afterward. |
| `Nullish coalescing narrowing` | `value ?? fallback` uses the fallback only when the left side is `null` or `undefined`; unlike `||`, it retains falsy values such as `0`, `false`, and `""`. The result type reflects the non-nullish left possibilities plus fallback. |
| `Destructured discriminated union narrowing` | Since TypeScript 4.6, `const` destructuring of a discriminant and dependent fields can preserve their correlation, allowing a check of the tag to narrow the corresponding payload. Reassignment or losing the relationship can prevent this analysis. |
| `Control-flow analysis of aliased conditions and discriminants` | Since TypeScript 4.4, certain const aliases of a guard condition or discriminant can carry the original narrowing into a later branch. This relies on stability; arbitrary mutable aliases do not preserve the fact. |
| `Preserved narrowing in closures after last assignment` | Since TypeScript 5.4, non-hoisted closures may use a parameter/`let` variable's narrowed type when the closure is created after its last assignment. If a nested function can assign the variable, the checker does not preserve that narrowing because call timing is unknown. |
| `Control-flow narrowing for constant indexed accesses` | Since TypeScript 5.5, a checked `object[key]` expression can narrow when both the object and key are effectively constant. Changing either one breaks the stability premise; store the value in a local constant if that clarifies the code. |
| `Dependent parameter narrowing for discriminated rest tuples` | Since TypeScript 4.6, a rest parameter typed as a union of labeled tuples can use one parameter's discriminant to narrow dependent parameters in the same tuple. This keeps argument correlations inside the function body. |
| `Exhaustive switch` | A switch handles every known literal variant, often with a `never` default. It makes additions to a closed union visible during compilation; it does not reject unexpected runtime input by itself. |
| `Non-null assertion escape hatch` | `value!` tells the checker to remove nullishness at that expression without a runtime check. Use only when an external invariant proves presence; otherwise prefer optional handling, a guard, or a deliberate throw. |

## Cross-item comparison

Switch and branch-merge narrowing derive facts from the path. Destructured and aliased narrowing preserve facts across a representation change when the checker can establish the relevant binding is stable. Closure and constant-indexed access changes rely on immutability/effective constness. Optional chaining and nullish coalescing execute safe nullish behavior; the non-null assertion only changes static checking and has no runtime safety effect.

An exhaustive switch handles modeled variants; runtime validation handles values that may violate the declared union. These solve different failure modes. [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

## Examples

```ts
type Command =
  | { kind: "text"; value: string }
  | { kind: "count"; value: number };

function format(command: Command): string {
  const { kind, value } = command;
  if (kind === "text") return value.toUpperCase();
  return value.toFixed(0);
}

type Args = [kind: "text", value: string] | [kind: "count", value: number];
function formatArgs(...args: Args): string {
  if (args[0] === "text") return args[1].toUpperCase();
  return args[1].toFixed(0);
}

function getLabel(item: { label?: string } | undefined): string {
  return item?.label ?? "(unnamed)";
}
```

The first example relies on TypeScript 4.6's destructured correlation; the second uses a discriminated tuple parameter. In `getLabel`, optional chaining may produce `undefined`, and `??` provides a fallback only for nullish cases. A label of `""` remains an empty string.

### Closure boundary

```ts
function makeReader(input: string | URL): () => string {
  if (typeof input === "string") input = new URL(input);
  return () => input.toString();
}
```

The callback is created after the final assignment to `input`, so TypeScript 5.4 can preserve the `URL` narrowing in this non-hoisted closure. If another nested function could assign to `input`, that analysis is not available. [TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html)

## Common mistakes

- Assuming every branch merge keeps the narrowest type; the merge includes all reachable possibilities.
- Expecting optional chaining to make the base variable permanently non-nullish.
- Replacing `??` with `||` when `0`, `false`, or `""` must be preserved.
- Assuming destructured tag/payload correlations survive arbitrary mutation.
- Applying TypeScript 5.5 indexed-access narrowing after changing the key or object.
- Forgetting assignments in nested functions can invalidate closure narrowing.
- Using `!` as if it inserted a check or threw when the value was absent.
- Treating exhaustiveness over a declared union as runtime validation.

## Knowledge checks with answers

1. **What can a branch merge do to a narrowed variable?** Recombine the still-possible types from all paths reaching that point.
2. **When does `??` select the fallback?** Only for null or undefined.
3. **What must be stable for a 5.5 indexed access to narrow?** Both the object and key.
4. **When does a 5.4 closure preserve a narrowed variable?** After its last assignment when the non-hoisted closure is created, unless a nested function may write to it.
5. **Does `!` add a runtime assertion?** No, it is erased and only changes the static type.
6. **What does TypeScript 4.6 preserve across a destructured union?** The correlation between the discriminant and dependent fields.

Sources: [Narrowing handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [TypeScript 4.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html), [TypeScript 4.6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-6.html), [TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html), [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html).
