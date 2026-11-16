# TypeScript generics, inference, constraints, and variance — Reference: Constraints, inference controls, and variance annotations

## Scope and version

This lesson explains all 13 supplied names in this group. Stable behavior is TypeScript 7.0 unless stated; the final item is a TypeScript 7.1 beta change as of 2026-11-16. Variance annotations date to 4.7; the citations below provide the scope boundary for those claims. [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html) · [Variance annotations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html) · [TypeScript 6.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## How this group fits the mental model

After a generic declaration introduces a placeholder, inference needs evidence to choose it. Constraints describe the minimum acceptable type; defaults provide fallbacks. Variance concerns how the resulting generic shape can be assigned when a type argument changes. The compiler primarily derives these relations from structure, so annotations do not replace understanding the positions where a parameter is consumed or produced.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Generic constraint (extends)` | A bound such as `<T extends { id: string }>` restricts the allowed argument and lets the body use guaranteed members. `T` remains the caller's more specific type; the bound is not an exact replacement. |
| `Constraint using keyof` | A bound such as `<K extends keyof T>` restricts `K` to keys of `T`. Paired with `T[K]`, it ties a selected property name to its corresponding value type. |
| `Constraint using another type parameter` | A later parameter may depend on an earlier one, as in `<T, U extends T>`. `U` must be assignable to `T`; declaration order matters because the referenced parameter must already be in scope. |
| `Generic parameter default` | A default like `<T = unknown>` supplies a type argument when omitted and not otherwise inferred. It must satisfy any constraint and makes that parameter optional for callers; it does not provide a runtime value. |
| `Contextual generic inference` | The surrounding expected type can supply inference evidence, including callback parameter/result context. Context can resolve an otherwise underdetermined type, but the exact choice depends on all available sites and may be wider than a literal. |
| `Type parameter inference site` | A position where an argument, callback, or contextual target contributes a candidate for a parameter. Input positions are typical. A parameter appearing only in an unconstrained output has no call-site evidence and often needs an explicit argument or redesigned signature. |
| `Variance annotation (in)` | An `in` annotation declares an intended contravariant parameter in an advanced generic alias/interface/class. It must agree with structural use; it is not a directive that makes an actually covariant structure contravariant. |
| `Variance annotation (out)` | An `out` annotation declares an intended covariant parameter. It must agree with structural use and does not affect structural comparisons; annotations are primarily relevant to instantiation-based comparisons and complex recursive types. |
| `Covariant type parameter` | A parameter used as an output can vary in the same assignability direction: a producer of a narrower value can often be used as a producer of its wider supertype. Examples include a read-only result position; mutability and other members can change the relation. |
| `Contravariant type parameter` | A parameter used as an input varies in the opposite direction: a consumer accepting every `Animal` can handle a `Dog`, so it can serve where a `Dog` handler is required. Under `strictFunctionTypes`, ordinary function-property parameters are checked contravariantly. |
| `Invariant type parameter` | A parameter used in both input and output positions generally cannot safely vary either direction. A mutable cell that both accepts and returns `T` is the common intuition: widening it could permit writes the original reader cannot handle. |
| `Bivariant method parameter compatibility` | Method parameter positions retain a compatibility exception that can permit assignment in either direction, even when strict function checking would reject a callback. It supports common method/callback patterns but is less sound; a function-valued property gets stricter checking. |
| `Stricter type parameter relationships in distributive conditional branches` | In TypeScript 7.1 beta, a distributive branch that narrows a type parameter no longer automatically preserves every relationship it had to another parameter constrained by the original type. Some code accepted in 7.0 is rejected because that relationship is not safe for each narrowed constituent. This concerns generic relationship checking; the full conditional-type mechanics are in t06-022. |

## Cross-item comparison

Constraints and defaults solve different questions: a constraint says which candidates are allowed; a default supplies a fallback candidate when one is omitted. Covariance, contravariance, and invariance describe output, input, and mixed positions; the method bivariance exception is a compatibility rule that can weaken the usual contravariant direction. `in`/`out` document or help check intended variance in limited comparisons; the compiler still uses structural relationships. [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html)

The TypeScript 7.1 beta relation change is about a generic parameter after conditional narrowing. It does not mean all generic inference became stricter, nor does it alter the rule that a naked type parameter causes conditional distribution. [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Examples

```ts
function get<T, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}

type Reader<T> = { read(): T };
type Writer<T> = { write: (value: T) => void };
type Cell<T> = { value: T };

type Animal = { name: string };
type Dog = Animal & { bark(): void };
declare const dogReader: Reader<Dog>;
const animalReader: Reader<Animal> = dogReader;

declare const animalWriter: Writer<Animal>;
const dogWriter: Writer<Dog> = animalWriter;
```

`get` demonstrates a key constraint and result relation. `Reader` produces `T`, allowing the `Dog` reader to be viewed as an animal reader. `Writer` consumes values, so a writer that accepts every animal can safely receive a dog. `Cell` both reads and writes; it does not have the same substitution freedom. The `declare` variables are type-only examples and create no runtime values.

The 7.1 beta change can be understood with a relationship such as `B extends A`: after a distributive branch narrows `A` to one constituent, TypeScript checks whether `B` still has the necessary relation to that narrowed constituent. The original bound only related it to the full `A`; it did not guarantee the narrower fact. See the official beta announcement for its complete example. [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Common mistakes

- Using `T extends Shape` and then returning `Shape`, accidentally discarding useful specifics from `T`.
- Expecting `K extends keyof T` to make arbitrary runtime strings safe without checking or typing them.
- Treating a default as a required type or a constraint.
- Adding variance annotations to “fix” an incompatible shape. Fix the member positions or API design instead.
- Assuming all callback parameters are bivariant. The exception is for method syntax; strict function-property parameters behave differently.
- Calling every mixed generic parameter invariant without inspecting the full structural relation and compiler settings.
- Explaining the TypeScript 7.1 beta branch rule as a change to stable TypeScript 7.0 or as a general ban on conditional types.

## Knowledge checks with answers

1. **What does `T extends U` guarantee?** The chosen `T` is assignable to `U`; it does not make `T` identical to `U`.
2. **Why is `K extends keyof T` useful?** It restricts keys to the object's keys and allows `T[K]` to retain the matching value type.
3. **What is the difference between a constraint and a default?** Allowed-type bound versus omitted-argument fallback.
4. **Why can a method callback accept an unsafe assignment?** Method parameters retain a bivariance compatibility exception; a function property is stricter under `strictFunctionTypes`.
5. **What is new in 7.1 beta?** Certain relationships to an original type parameter are rechecked after distributive-branch narrowing.

Sources: [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html), [TypeScript 4.7 variance annotations](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html), [TypeScript 6.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/).
