# TypeScript structural compatibility, interfaces, classes, and variance — Exercises and worked solutions

## Goals

Practice identifying the exact compatibility rule behind an assignment, design structural contracts, and reason about callback variance. Examples target TypeScript 7.0 with `strict: true`; where behavior depends on `exactOptionalPropertyTypes`, the exercise names both settings.

## Worked example

```ts
interface HasId { id: string }
function readId(value: HasId): string { return value.id }

const stored = { id: "u1", label: "Ada" };
readId(stored); // okay: the target's required member is present

// A fresh literal is subject to the excess-property typo check:
// readId({ id: "u2", lable: "typo" });
```

The source variable can have additional members because compatibility is structural. The fresh-literal diagnostic is a targeted typo check. It does not make `HasId` an exact object type. [Type compatibility handbook](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)

## Exercises

1. **Fresh literals.** Predict the result of passing `{ id: "u2", lable: "typo" }` directly to `readId`, then assign that object to a variable and pass it. Explain both outcomes. Give a way to retain a variable while checking its authored properties against `HasId`.
2. **Optional fields.** With `interface Settings { label?: string }`, compare `{}` and `{ label: undefined }` under `exactOptionalPropertyTypes` off and on. Explain the type of a read and how `label: string | undefined` changes the written contract.
3. **Index signatures.** Explain why `interface Scores { [key: string]: number; total: number }` is coherent but adding `note: string` is not. State what the signature does and does not guarantee at runtime.
4. **Interface composition.** Declare two mergeable `RequestOptions` interfaces with distinct optional members. Then explain why extending two bases with conflicting same-named members is rejected. Name one benefit and one maintenance risk of declaration merging.
5. **`implements` and `extends`.** Define a class implementing `Closable`. Explain what is checked and what is not generated. Add a base class with a concrete method and compare implementing its shape with extending it. Describe how a constructor/static side can be typed separately from instances.
6. **Declaration origin.** Create two unrelated classes with identical private `token` members and a child of one. Predict compatibility among the two bases and the child. Repeat for protected members and distinguish TypeScript access modifiers from ECMAScript `#token`.
7. **Callback parameters.** Define `Animal`, `Dog extends Animal`, and `type Handler<T> = (value: T) => void`. Under `strictFunctionTypes`, determine the safe direction between `Handler<Animal>` and `Handler<Dog>`. Compare function-valued properties with method syntax.
8. **Variance.** Write a producer of `T`, a consumer of `T`, and a mutable read/write cell. Explain their natural variance. Describe when `in`/`out` annotations are useful and why annotations cannot contradict structural use.
9. **Abstract members and overrides.** Create an abstract class with an abstract getter, an abstract method, and one concrete method. Implement it and use `override` for the concrete method. Explain what each modifier checks and whether it adds runtime implementation.
10. **API review.** Design a configuration parameter and callback property for a library that wants checked callback inputs, typo detection for authored literals, and runtime safety for JSON input. Identify which guarantees come from types and which require runtime validation.

## Progressive hints

1. Excess-property checking depends on a fresh literal in a contextual position. The `satisfies` operator checks a value without replacing its inferred type.
2. Reading an optional property can produce `undefined` either way. The flag changes whether explicitly writing `undefined` satisfies an optional property whose declared type omits it.
3. Every known string-named property must be compatible with the string index value type.
4. Merged interface members accumulate; inherited declarations must remain mutually compatible.
5. An instance implements an interface. A class value has a separate `typeof C` side.
6. Private/protected declarations retain their origin through inheritance; matching spelling alone is insufficient.
7. A handler accepting every `Animal` can stand in where a handler for `Dog` is needed. Reverse substitution could call a dog-only handler with a non-dog.
8. Follow where `T` is produced and consumed. A sound read/write abstraction should be invariant, but check TypeScript's actual structural behavior for direct mutable properties.
9. Abstract members require subclass implementation; `override` checks an existing base member.
10. A compile-time shape does not inspect unknown JSON at runtime.

## Complete solutions

1. The inline literal is rejected because `lable` is not a known property and the expected type is available contextually. A variable containing `id` and `lable` can be passed because it structurally has `id`; the excess-property check is not a general exactness rule. `const candidate = { id: "u2", lable: "typo" } satisfies HasId` still flags the typo while preserving the expression's inferred type. Correcting to `label` still allows the variable to satisfy `HasId`.
2. With the flag off, both assignments are accepted for `label?: string`. With it on, `{}` is accepted, while `{ label: undefined }` is rejected unless `undefined` appears in the property's declared type. In both cases, reading `label` can yield `string | undefined` because the property may be absent. Declaring `label?: string | undefined` explicitly permits either absence or a present `undefined` value. [Exact optional property types](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
3. `total` is a number, so it meets the string index's value type. `note: string` violates that promise because any string key is described as yielding a number. The index signature informs static access; it does not populate keys or guarantee that a runtime lookup returns a present value. A union value domain such as `number | string` is appropriate only if all indexed members may legitimately be either.
4. Repeated interface declarations with the same name merge when their members are compatible; both optional fields appear on the resulting contract. Incompatible same-name properties cannot form a single valid inherited shape. Merging supports deliberate augmentation, while accidental duplicate names can silently widen a contract or create conflicts. [Object types handbook](https://www.typescriptlang.org/docs/handbook/2/objects.html)
5. `implements Closable` checks that instances expose `close(): void`; it neither inserts a method nor adds runtime behavior. `extends` inherits implementation and establishes a class relationship. Interface contracts describe instances; a factory expecting a constructor can use a shape such as `type Ctor<T> = new (...args: any[]) => T` (with a more specific argument tuple when known) and accept `typeof SomeClass` when compatible. [Classes handbook](https://www.typescriptlang.org/docs/handbook/2/classes.html)
6. `ChildA` remains compatible with `BaseA` for the inherited private member, while `BaseB` is incompatible with `BaseA` and `ChildA` despite matching spelling and type. The same declaration-origin principle applies to protected members. These TypeScript modifiers control type checking and emitted JavaScript behavior differs from ECMAScript `#token`, which enforces runtime private access.
7. `Handler<Animal>` can substitute for `Handler<Dog>` because it can accept every dog. `Handler<Dog>` cannot safely substitute for `Handler<Animal>` because a caller could pass a non-dog. Under `strictFunctionTypes`, function-valued property parameters are checked contravariantly. Method and constructor declarations retain a bivariance exception for compatibility, which can admit a narrower callback than a caller can safely invoke. [Type compatibility handbook](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
8. A producer returns `T`, so its result position is covariant. A consumer accepts `T`, so its input position is contravariant. A sound mutable cell needs invariance, but TypeScript allows a plain property `value: T` to vary covariantly in structural assignment; a widened alias can then write an incompatible value. `strictFunctionTypes` does not change this ordinary property behavior. `out` and `in` can document/check intended variance in advanced declarations but do not globally rewrite structural rules. [TypeScript 4.7 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html) · [Type compatibility and soundness](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
9. The subclass must implement the abstract getter and method. The concrete base method is inherited; marking a replacement `override` asks the compiler to verify that a base member exists. Abstract and override declarations affect static checking and emitted class behavior follows normal JavaScript class rules; `override` does not synthesize an implementation.
10. Put callbacks in function-valued properties to receive strict parameter variance checking. A fresh configuration literal catches likely unknown keys, and `satisfies` can validate a named authored value while preserving its inferred type. For external JSON, accept `unknown` and validate its actual fields at runtime; a type annotation or assertion cannot validate data. An interface remains structurally open, so excess-property checks do not prove exactness.

## Tests and edge cases

- Compile the callback direction exercise with `strictFunctionTypes: true`; then compare the method and property forms.
- Compile the optional-field exercise with `exactOptionalPropertyTypes` both `false` and `true`.
- Check a fresh literal and a stored variable separately; moving the same value into a variable can change whether excess-property diagnostics apply.
- Verify private/protected compatibility using a shared base declaration, then using unrelated declarations with identical member names.
- Inspect a constructor value with `typeof C` separately from an instance annotation `C`.
- Do not infer runtime presence from an index signature or runtime validation from an interface.

## Reflection questions

- Which examples depend on a compiler option, and how would you communicate that requirement to a library's users?
- When is declaration merging a useful extension point, and when would a uniquely named interface be safer?
- Which unsoundness tradeoffs does TypeScript retain for JavaScript ergonomics?
- Where does your application validate values that originate outside the typed program?
