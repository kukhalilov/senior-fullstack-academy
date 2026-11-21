# TypeScript primitive, literal, object, array, and tuple types — Reference: Type annotations, inference, and assertions

## Scope and version

This lesson explains all 12 supplied names. Examples target TypeScript 7.0 stable. `as const`/readonly tuples originated in 3.4, and `satisfies` arrived in 4.9. [Everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) · [TypeScript 4.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)

## How this group fits the mental model

Annotations state a contract; inference derives one from the expression and context. Assertions only change the checker’s view. Literal widening controls how much exact value information survives in mutable locations. `satisfies` checks a contract without replacing the expression's overall type with the contract.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Type annotation` | Syntax such as `let count: number = 0` gives a declaration a static type and checks its initializer/assignments. It inserts no runtime conversion or validation. |
| `Type inference` | The checker derives a type from initializers, return expressions, parameters' contextual types, and surrounding usage. Good inference reduces annotation noise but should not be mistaken for a runtime schema. |
| `Widening literal type` | A literal may generalize from `"ready"` to `string` or `3` to `number`, especially in a mutable binding/property. Widening permits reassignment but loses finite-state precision. |
| `Contextual typing` | An expected type flows inward to infer expression parts, especially callback parameters and object literals. It can provide parameter types without explicit annotations and can influence literal inference. |
| `Type assertion (as Type)` | `value as T` asks the checker to treat a value as `T` subject to overlap rules. It is erased and does not convert, validate, or sanitize the value. Double assertions through `unknown` can bypass checks and are especially risky. |
| `Angle-bracket type assertion` | `<T>value` has the same static assertion effect as `value as T`, but conflicts syntactically with JSX and therefore cannot be used in TSX. Prefer `as` for consistency. |
| `Non-null assertion operator (!)` | `value!` removes `null`/`undefined` from the static type at that expression. It emits no runtime guard and can turn a possible crash into a hidden error. |
| `Definite assignment assertion (!)` | A declaration marker such as `field!: string` suppresses definite-assignment analysis. It does not assign a value or make constructor/property initialization occur. Runtime initialization must be guaranteed elsewhere. |
| `as const assertion` | A const assertion preserves literal types and applies readonly to object properties/tuple structure at the type level. It does not invoke `Object.freeze` or recursively freeze the runtime value. Added in TypeScript 3.4. |
| `satisfies operator` | `expr satisfies T` checks that the expression conforms to `T` while retaining its inferred expression type rather than annotating it as `T`. Contextual typing can still influence how parts of the expression are inferred. Added in TypeScript 4.9. |
| `Const variable inference` | A `const` primitive binding commonly has a literal type because it cannot be rebound. A `const` object/array is still mutable through properties/indexes, so those parts commonly widen unless a const assertion or readonly annotation is used. |
| `Return type inference` | A function's result type is inferred from return statements, potentially combining/widening their types. Explicit return annotations document/check public APIs and can catch accidental result changes. Contextual function types can also supply a return expectation. |

## Cross-item comparison

An annotation chooses a target contract and generally exposes that target type to later use. Inference computes a type from the expression. An assertion bypasses some checks by claiming the value already fits. `satisfies` checks assignability while preserving more of the expression's inferred detail. None performs runtime validation. [Everyday types: assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions) · [TypeScript 4.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)

`const` controls reassignment of the binding, not deep mutation. `as const` changes the static type to retain literals/readonly modifiers; it still does not freeze runtime memory. `!` on a value and `!` on a declaration are separate static escape hatches: one removes nullishness, the other suppresses an initialization diagnostic.

## Examples

```ts
const mode = "dark";        // "dark"
let status = "ready";        // string
const settings = { mode: "dark" }; // { mode: string }
const frozenType = { mode: "dark", flags: [1, 2] } as const;
// frozenType.mode = "light"; // error
// frozenType.flags.push(3);   // error
```

Only the last value has a recursively readonly literal type; none of these declarations freezes runtime objects. A separate `Object.freeze` call is shallow at runtime unless a deep-freeze routine is written.

```ts
type Theme = "light" | "dark";
const theme = { primary: "dark", contrast: 4 } satisfies {
  primary: Theme;
  contrast: number;
};

theme.primary; // "dark" is retained
```

The target checks both properties, while `theme` retains the inferred property types. If you want the variable to be exposed as the broader contract, use an annotation instead.

```ts
interface User { name: string }
const parsed: unknown = JSON.parse('{"name":"Rin"}');
// Unsafe: this asserts without checking the input.
const user = parsed as User;
```

Prefer a runtime guard/schema that checks `typeof parsed === "object"`, non-nullness, and the `name` property before treating it as a user. The assertion itself emits no check.

## Common mistakes

- Adding annotations everywhere instead of using clear inference, or relying on inference where a public contract should be stable/documented.
- Assuming const binding makes all nested members literal/readonly.
- Using `as` to silence a real mismatch or to pretend untrusted data was parsed.
- Treating `satisfies` as a conversion or assuming it never contextually influences inference.
- Using `!` as if it added a runtime null check.
- Confusing declaration definite-assignment `field!` with expression non-null assertion `value!`.
- Using angle-bracket assertions in TSX.
- Assuming an inferred return type is always the desired API contract when branch changes can widen it.

## Knowledge checks with answers

1. **Does `const settings = { mode: "dark" }` make `settings.mode` readonly?** No; the property can be changed, so it commonly widens to `string`.
2. **Does `as const` freeze the value?** No; it affects the static type only.
3. **Does `satisfies T` expose the variable as exactly `T`?** It checks against `T` but normally retains the expression's inferred type.
4. **What runtime code does `value!` add?** None.
5. **Why is `<T>value` unavailable in TSX?** It is ambiguous with JSX syntax.

Sources: [everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html), [type assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions), [TypeScript 3.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html), [TypeScript 4.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html).
