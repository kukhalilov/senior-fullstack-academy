# TypeScript primitive, literal, object, array, and tuple types — Exercises and worked solutions

## Goals

Practice choosing types that preserve useful information without pretending static syntax performs runtime checks. Examples target TypeScript 7.0 with strict null checking. [Everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)

## Worked example

Model a small protocol where each message has a finite kind and an associated payload:

```ts
type Message =
  | { kind: "text"; body: string }
  | { kind: "retry"; afterMs: number };

const queue: readonly Message[] = [
  { kind: "text", body: "hello" },
  { kind: "retry", afterMs: 250 },
];
```

The string literals preserve a finite domain, the union describes the two valid shapes, and the readonly array view prevents mutation through `queue`. None of these types validates data parsed from JSON or freezes the array at runtime.

## Exercises

1. **Primitive choice.** Select types for a user name, an integer-like count, a flag, a unique property key, and an arbitrary JSON parse result. Explain why `String`, `Number`, `Boolean`, and `Function` are poor defaults.
2. **`any` versus `unknown`.** Write a function that accepts unknown input and returns its string length only when the input is actually a string. Explain which unchecked operations `any` would allow.
3. **Nullability.** Write `findName(): string | undefined` and show a caller that handles both a string and absence. Explain how `strictNullChecks` changes assignments.
4. **`void` and `never`.** Write a callback whose result should be ignored and an error helper that never returns. Explain why these return types mean different things.
5. **Literal widening.** Predict the types of `const mode = "dark"`, `let state = "dark"`, and `const options = { mode: "dark" }`. Then preserve the object literal with a const assertion and state what that changes statically and dynamically.
6. **Annotation, assertion, and `satisfies`.** Define a finite `Theme` union. Compare an annotated config, an asserted config, and a `satisfies` config. State which checks each performs and what type detail each retains.
7. **Runtime boundary.** Parse an unknown JSON string. Write a guard that verifies a non-null object with a string `name` property. Explain why `as User` is insufficient.
8. **Type-level finite choices.** Model status with a string-literal union and with a string enum. Compare runtime output and recommend one when the API only needs compile-time checking.
9. **Const enum caveat.** Explain how an ambient const enum can cause consumers to embed values that no longer match the runtime package after an upgrade. Suggest safer library choices.
10. **Object and tuple design.** Type a readonly coordinate pair with named elements, an optional label, and a rest tail of tags. Show a readonly array alternative and explain when to choose each.
11. **Object call/construct types.** Describe a value that is callable with a number and has a `description` property; then describe a constructor accepting a string and producing an object with a `name` field.
12. **Readonly and aliasing.** Assign a mutable array to a `ReadonlyArray<string>`. Explain what the readonly reference blocks and how a different alias can still mutate the array.

## Progressive hints

1. Use lowercase primitive types; `unknown` models data that has not been checked.
2. A `typeof` check narrows unknown to string.
3. Include absence explicitly when the function can return it.
4. `void` communicates ignored results; `never` has no normal result.
5. `const` prevents rebinding, not property mutation. `as const` preserves literal readonly structure.
6. An assertion claims compatibility; `satisfies` checks compatibility and usually retains the expression type.
7. Check `typeof value === "object"`, non-nullness, the property, and its value type.
8. A union is erased, while a regular string enum emits an object.
9. Consumers may inline declaration values at build time; runtime updates can diverge.
10. Tuple positions carry different roles; arrays describe repeated homogeneous elements.
11. A call signature is written as a function-like member in an object type; a construct signature begins with `new`.
12. Readonly applies through one reference's API only.

## Complete solutions

1. Use `string`, `number`, `boolean`, a `unique symbol` declaration for a unique key, and `unknown` for raw parsed input. Boxed wrapper types describe objects, not the common primitive values; `Function` does not specify callback arguments or result.
2. `function stringLength(value: unknown): number | undefined { return typeof value === "string" ? value.length : undefined; }`. With `any`, code could call nonexistent members or invoke the value with unchecked arguments and receive no useful diagnostic.
3. `function findName(): string | undefined { return Math.random() > 0.5 ? "Ari" : undefined; }` and `const name = findName(); if (name !== undefined) console.log(name.toUpperCase());`. With `strictNullChecks`, `undefined` cannot be assigned to `string`; without it, nullish checks are much weaker.
4. `function onSave(callback: () => void): void { callback(); }` and `function fail(message: string): never { throw new Error(message); }`. A void callback's returned value is intentionally ignored; `never` indicates no normal completion.
5. The first is the literal type `"dark"`; the second widens to `string`; `options.mode` also commonly widens to `string` because the property can be reassigned. `const precise = { mode: "dark" } as const` has readonly literal property type. It does not call `Object.freeze`.
6. An annotation `const a: { theme: Theme } = { theme: "dark" }` exposes `a.theme` as `Theme`. `const b = { theme: "dark" } as { theme: Theme }` asserts and can bypass checking; it does not validate. `const c = { theme: "dark" } satisfies { theme: Theme }` checks conformance while retaining the inferred `"dark"` property type. [TypeScript 4.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
7. `function isUser(value: unknown): value is { name: string } { return typeof value === "object" && value !== null && "name" in value && typeof (value as { name?: unknown }).name === "string"; }`. Parsing only creates JavaScript values; a cast changes no value and performs no check. A production validator should also check every required field and reject malformed nested values.
8. `type Status = "open" | "closed"` creates no runtime artifact. `enum StatusEnum { Open = "open", Closed = "closed" }` creates an enum object. Choose the union when only a compile-time finite domain is needed; choose the enum when a runtime namespace/object is part of the API.
9. Ambient const enum members can be inlined into consumer code from declaration files. If a dependency changes values but a consumer runs with old inlined values or a different runtime package, behavior diverges. Prefer a regular enum or literal union for published contracts, or avoid exposing ambient const enums.
10. `type Coordinate = readonly [x: number, y: number, label?: string, ...tags: string[]]` models positions, a permitted optional label, and a variable string tail; the exact optional/rest combination must obey tuple ordering rules (required rest after optional is allowed). `ReadonlyArray<string>` is better for a variable-length homogeneous list. The tuple is for semantically distinct positions.
11. `type Formatter = { (value: number): string; description: string };` and `type NamedConstructor = new (value: string) => { name: string };`. These types describe required runtime call/construct behavior and metadata; they do not implement a function or class.
12. `const original = ["A"]; const view: ReadonlyArray<string> = original;` prevents `view.push(...)` and indexed writes through `view`. `original.push("B")` remains legal and changes the same runtime array. Readonly types are not runtime immutability.

## Tests and edge cases

- Check assertions against untrusted JSON by removing the assertion and verifying a real runtime guard is used.
- Compile optional/null cases with `strictNullChecks` on; legacy settings can hide bugs.
- Attempt mutation through a readonly view, then through a mutable alias, to see the static/runtime distinction.
- Compare numeric and string enum emitted output; do not assume reverse mappings are universal.
- Confirm a `const enum` library is tested with the exact publishing/toolchain strategy consumers will use.
- Probe tuple indexing with `noUncheckedIndexedAccess`; indexed array reads may include `undefined` depending on configuration.
- Use the exact callback signature rather than `Function` and verify argument/result types are checked.

## Reflection questions

- Which types in your code are descriptive, and which runtime validators enforce external data?
- Where does literal precision help, and where would widening make mutation easier?
- Does a tuple make each position's meaning clearer than an object with named fields?
- Are your readonly annotations protecting an API contract or creating a false belief about runtime immutability?
