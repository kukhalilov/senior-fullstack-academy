# TypeScript indexed, conditional, mapped, and utility types — Reference: Built-in utility types for functions, instances, and promises

## Scope and version

This lesson explains all 9 supplied global utility names. `Awaited<Type>` was added in TypeScript 4.5; `NoInfer<Type>` was added in 5.4. The exact overload/generic caveats matter: extraction utilities do not reconstruct every overload or preserve every generic relationship. These are static transformations, not runtime reflection. [Utility types handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html) · [TypeScript 4.5 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html) · [TypeScript 5.4 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html)

## How this group fits the mental model

Function types package parameter and return information. Constructor types package constructible signatures and instance results. Explicit `this` parameters can be extracted, removed, or contextually supplied. Promise-like types can be unwrapped recursively. `NoInfer` changes which positions contribute inference evidence without changing the type accepted at that position.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Parameters<Type>` | Produces a tuple of parameter types for a function type. An overloaded type uses its last signature; a generic function's parameter is commonly represented using `unknown`. `Parameters<any>` is `unknown[]`, while `Parameters<never>` is `never`. |
| `ConstructorParameters<Type>` | Produces a tuple of constructor argument types from an abstract or concrete construct signature. It can describe arguments without constructing an instance. Generic and overloaded constructors have extraction limitations; `any` yields `unknown[]`, and a non-constructor is rejected by the constraint. |
| `ReturnType<Type>` | Produces a function type's return type. For overloads it uses the last signature; a generic return depending on an unresolved type parameter commonly becomes `unknown`. `ReturnType<any>` is `any`; `ReturnType<never>` is `never`. |
| `InstanceType<Type>` | Produces the instance type of an abstract or concrete construct signature, usually used as `InstanceType<typeof SomeClass>`. It does not call the constructor or check that construction succeeds. |
| `ThisParameterType<Type>` | Extracts the explicit `this` parameter type from a function type. If no explicit `this` parameter exists, the result is `unknown`; JavaScript's implicit receiver is not necessarily represented as an explicit parameter here. |
| `OmitThisParameter<Type>` | Removes an explicit `this` parameter from a function type. If none exists, the function type is unchanged. If one exists, generics are erased and only the last overload signature is propagated, so it can lose API detail. |
| `ThisType<Type>` | A contextual marker for the `this` type in object-literal methods. It does not transform the resulting type and requires an applicable contextual type; `noImplicitThis` must be enabled for the intended checking. |
| `Awaited<Type>` | Recursively models the unwrapping behavior of `await` and promise `.then` assimilation for promise-like values. It distributes across unions, leaving non-promise members as themselves. It does not await a runtime value. |
| `NoInfer<Type>` | Blocks the wrapped occurrence from contributing candidates during generic inference; otherwise it is identical to `Type`. Use it to designate a primary source for inference while still checking another argument against the inferred type. Added in TypeScript 5.4. |

## Cross-item comparison

`Parameters` extracts a tuple from call arguments; `ReturnType` extracts the result. `ConstructorParameters` and `InstanceType` do the analogous work for construction. These do not execute a function/class. For overloaded functions the extraction utilities observe the last signature, so an overload set may lose its earlier cases. `ThisParameterType` reads explicit receiver metadata and `OmitThisParameter` removes it, with possible generic/overload information loss.

`Awaited` transforms a promise-like result type recursively; `NoInfer` changes inference participation but not the assignability contract. `ThisType` is not a transformation at all: it marks contextual `this` in an object literal. [Utility types handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html) · [NoInfer in TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html)

## Examples

```ts
function send(id: string, retry?: number): Promise<{ ok: boolean }> {
  return Promise.resolve({ ok: id.length > 0 && retry !== -1 });
}
type SendArgs = Parameters<typeof send>; // [id: string, retry?: number]
type SendResult = ReturnType<typeof send>; // Promise<{ ok: boolean }>
type SettledResult = Awaited<SendResult>; // { ok: boolean }

class Session {
  constructor(readonly token: string, readonly expiresAt: Date) {}
}
type SessionArgs = ConstructorParameters<typeof Session>;
type SessionValue = InstanceType<typeof Session>;

function toUpper(this: { value: number }): string {
  return String(this.value).toUpperCase();
}
type Receiver = ThisParameterType<typeof toUpper>;
type Unbound = OmitThisParameter<typeof toUpper>;

function choose<C extends string>(choices: readonly C[], fallback: NoInfer<C>): C {
  return choices.includes(fallback) ? fallback : choices[0]!;
}
const mode = choose(["dark", "light"], "dark");
```

The `choose` example makes `choices` the source for inferring `C`; `fallback` must match the resulting union and cannot widen it. The non-null assertion on `choices[0]` makes a runtime assumption that the input is nonempty; a production API should model the empty case, for example by returning `C | undefined` or checking input at runtime. No utility shown executes or instantiates anything.

`ThisType` contextual use can be modeled separately:

```ts
type Descriptor<Data, Methods> = {
  data: Data;
  methods: Methods & ThisType<Data & Methods>;
};
```

When an object literal is contextually checked against `Descriptor`, its methods can use a `this` with the combined data and methods shape. The marker does not create or bind that receiver; runtime code must construct and call the object consistently.

## Common mistakes

- Expecting an overload extraction utility to return a union of every overload; the last signature is used.
- Assuming generic `Parameters` or `ReturnType` preserves a caller-selected type parameter; unresolved generic parts can become `unknown`.
- Treating `InstanceType` as construction or runtime reflection.
- Assuming any JavaScript receiver is extracted by `ThisParameterType`; it reads an explicit typed `this` parameter.
- Forgetting `OmitThisParameter` may erase generics and overloads.
- Treating `ThisType<T>` as a mapped type or as a runtime binding operation.
- Assuming `Awaited<T>` resolves data or catches rejected promises; it describes fulfillment type only.
- Thinking `NoInfer<T>` changes what is assignable; it affects inference candidates, not the resulting type.
- Returning `C` from an empty collection without handling the missing runtime element.

## Knowledge checks with answers

1. **Which overload does `ReturnType` use?** The last declared signature.
2. **Does `ConstructorParameters` instantiate the class?** No, it extracts a static tuple type.
3. **What does `ThisParameterType` return when there is no explicit `this`?** `unknown`.
4. **What information can `OmitThisParameter` discard?** If it removes an explicit receiver, it erases generics and propagates only the last overload signature.
5. **What does `NoInfer` block?** Candidate inference from that occurrence; it still checks the argument against the inferred type.
6. **Does `Awaited` unwrap rejected promises at runtime?** No. It computes the fulfillment type and does not change runtime behavior.

Sources: [Utility types handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html), [TypeScript 5.4 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html).
