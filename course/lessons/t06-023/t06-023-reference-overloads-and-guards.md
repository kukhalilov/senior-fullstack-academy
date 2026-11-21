# TypeScript function types, overloads, predicates, and call signatures — Reference: Overloads, predicates, and assertion signatures

## Scope and version

This lesson explains all 10 supplied names for overloads and guard-like signatures. TypeScript trusts explicit predicate/assertion claims; detailed narrowing mechanics are covered in t06-021. TypeScript 5.5 can infer eligible predicate return signatures, but it does not validate a manually written predicate. [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html) · [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

## How this group fits the mental model

An overload list exposes several separate call contracts while one body implements them. Predicates and assertions add a type-level result contract that can narrow the caller's value. A callable or newable object combines the signature with an object shape. Every promise in these signatures must be backed by a real implementation.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Overload signature` | A caller-visible declaration of one accepted argument list and result type, written before the implementation. Each call must resolve to one applicable overload. |
| `Overload implementation signature` | The single body-bearing declaration that handles all overload cases. Its signature is not callable from outside; it must be broad/compatible enough to implement every public overload. |
| `Function overload` | A function declaration with multiple overload signatures followed by one implementation. Use it when input forms have different result relationships or exact arities. |
| `Method overload` | An object/class method can expose several overload signatures followed by one implementation. The body must handle all forms, and the method remains subject to method-specific compatibility rules. |
| `Constructor overload` | A class constructor can have multiple overload declarations followed by one implementation signature/body. Each public form must be implemented; callers see only overload declarations. |
| `Type predicate return type` | A return annotation such as `value is User` states that true means the parameter is `User` and false means it is not. The compiler trusts the claim and does not verify its logic. |
| `Assertion signature` | A signature like `asserts value is User` says normal return establishes the target type. The implementation should throw or otherwise fail when the condition is false; its body is trusted. |
| `Assertion condition signature` | A signature like `asserts condition` says the boolean condition is true after normal return. It can establish facts from a compound expression but must be enforced at runtime. |
| `Callable object type` | An object type with one or more call signatures, often alongside properties, describes a value that can be invoked and inspected. The runtime value must implement both call behavior and fields. |
| `Newable object type` | An object/constructor type with construct signatures describes a value usable with `new`. It may also carry static properties or call signatures; its instances are described separately. |

## Cross-item comparison

An overload is a caller-visible call form; the implementation signature supports them but stays hidden. A union parameter accepts a value whose type is a union in one declared signature; separate overloads require one overload to accept the argument's entire static type. This is why a union-valued call may fail even when each possible value has its own overload.

A predicate communicates a true/false relationship; an assertion communicates what is true if execution continues. A plain `boolean` result does not narrow without an additional check. Callable and newable object types describe properties plus invocation capability; neither type creates those capabilities at runtime. [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html)

## Examples

```ts
function parse(value: string): number;
function parse(value: number): string;
function parse(value: string | number): number | string {
  return typeof value === "string" ? Number(value) : String(value);
}

function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new TypeError("Expected string");
}

type TaggedParser = {
  format: string;
  (source: string): unknown;
};

type Constructible<T> = {
  new (value: string): T;
};
```

The `parse` body accepts the union and implements both cases, but callers can only call the overloads. A call with a `string | number` input does not match either overload; add a union overload if that use is intended. `assertString` throws before an invalid input can continue, matching its assertion signature.

```ts
class Token {
  readonly value: string;
  constructor(value: string);
  constructor(value: number);
  constructor(value: string | number) { this.value = String(value); }
}
```

The two constructor signatures are public; the union implementation is hidden. A method overload follows the same declaration sequence inside a class or object type, with one implementation body.

## Common mistakes

- Expecting callers to use the implementation signature or its optional parameters.
- Adding many overloads when a union parameter or generic signature is simpler.
- Forgetting a union-typed input needs an overload that accepts the union if it should be passed without narrowing.
- Writing an implementation that cannot handle one public overload form.
- Assuming `value is User` checks `User` fields automatically.
- Assuming assertions throw automatically; the body must make failure non-returning.
- Assuming callable/newable object types manufacture runtime functions or constructors.

## Knowledge checks with answers

1. **Can a caller use an implementation-only overload signature?** No; only the overload declarations form the external contract.
2. **Why can an argument of `A | B` fail two overloads accepting `A` and `B` separately?** The compiler needs one overload that accepts the entire static argument type.
3. **What does a predicate say about false?** The value does not have the target type; predicates have two-way semantics.
4. **What must an assertion implementation do when the claim is false?** It must not return normally, usually by throwing.
5. **Does a callable object type create a function?** No; runtime code must provide the callable value and properties.

Sources: [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html), [TypeScript 5.5 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html).
