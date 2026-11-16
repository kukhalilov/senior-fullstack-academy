# TypeScript primitive, literal, object, array, and tuple types — Reference: Primitive, special, literal, and declaration types

## Scope and version

This lesson covers all 24 supplied names. It targets TypeScript 7.0 stable; its native compiler port preserves the 6.0 type-checking model. The brief historical note explains TypeScript 5.0's enum typing change. [Everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) · [Enums handbook](https://www.typescriptlang.org/docs/handbook/enums.html)

## How this group fits the mental model

Primitive types describe JavaScript primitive values. Special types control what the checker permits, while literal types retain specific value information. Type aliases name erased contracts; enums can create runtime objects. An annotation does not convert a value into the requested primitive or validate its origin.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `string` | Primitive text type, e.g. `"hello"`. Use the lowercase primitive type; boxed `String` is a different object type and is not the normal annotation. |
| `number` | Primitive IEEE-754 numeric type, covering integers, fractions, `NaN`, and infinities. TypeScript does not provide separate integer and float primitive types. |
| `boolean` | Primitive `true`/`false` type. It differs from the boxed `Boolean` object type. |
| `bigint` | Primitive arbitrary-precision integer type using literals such as `42n`. Runtime and target environments must support BigInt syntax/operations; arithmetic cannot mix `bigint` and `number` without explicit conversion. |
| `symbol` | Primitive unique runtime symbol values created by `Symbol()`. Two calls produce distinct symbol identities even if their descriptions match. |
| `null` | Type of the `null` primitive. With `strictNullChecks`, include it explicitly when absence is represented by null; otherwise legacy nullish assignability is looser. |
| `undefined` | Type of the `undefined` primitive and absent/uninitialized reads in many contexts. With `strictNullChecks`, it is distinct from other types unless included. |
| `void` | Primarily describes a function whose result callers should ignore. A callback typed `() => void` may be implemented by a function returning a value, but that value is discarded by the caller's contract. `void` is not interchangeable with `undefined` in every value assignment. |
| `never` | Type with no possible values. It is assignable to every type, but an ordinary value cannot be assigned to `never`; it appears for impossible outcomes and functions that cannot complete normally. |
| `object` | Any non-primitive value, including arrays and functions. It does not mean a plain key/value record; use an explicit object shape for that. |
| `Function` | Broad built-in callable object type with no useful parameter/result contract. It permits unsafe calls and is usually inferior to `(input: Input) => Output` or a named call signature. |
| `any` | Disables many checks and flows through operations, assignments, and inference. Use only at deliberate migration/interop boundaries; it permits errors to propagate. |
| `unknown` | Safe top type for values not yet checked. Anything can be assigned to it, but operations require narrowing or an assertion before use. Prefer it over `any` for untrusted data. |
| `String literal type` | A specific string value as a type, e.g. `"success"`; unions of string literals model finite states without a runtime enum object. |
| `Number literal type` | A specific numeric value such as `200` or `-1`. Useful for discriminants and fixed numeric options; ordinary mutable bindings often widen it to `number`. |
| `Boolean literal type` | One boolean value, `true` or `false`. It appears in narrowed states and precise readonly/literal contexts. |
| `BigInt literal type` | A specific bigint value such as `10n`; it remains distinct from the corresponding `number` literal `10`. |
| `unique symbol type` | A type tied to one declared symbol identity, commonly `const key: unique symbol = Symbol()`. It is useful as a collision-resistant property key; it is not interchangeable with another unique symbol type. |
| `Type alias declaration` | `type Name = ...` gives a type expression a reusable name. It emits no JavaScript and can name primitives, unions, tuples, object shapes, and other type forms. |
| `Enum declaration` | Declares a named set of members and normally emits a runtime enum object. Numeric enums generally have reverse mappings; string enums do not. A literal union is often a simpler erased alternative when no runtime enum object is needed. |
| `Numeric enum` | Enum whose members have numeric values, explicit or auto-incremented after a known numeric member. Runtime output typically includes both name-to-number and number-to-name mappings. |
| `String enum` | Enum members have string initializers. Values are readable at runtime and do not create numeric reverse mappings; members are not automatically interchangeable with arbitrary matching strings in every assignment context. |
| `Const enum` | Marked `const`, typically erased with uses inlined by the compiler. Ambient const enums and cross-package version skew can create missing/wrong runtime assumptions; consider literal unions or non-const enums for public libraries. |
| `Ambient enum` | `declare enum E { ... }` describes an enum object/value provided elsewhere, commonly in `.d.ts`. It emits no object; the declared runtime package must actually expose the expected members and values. |

## Cross-item comparison

`any` and `unknown` both accept arbitrary input; only `any` also allows unchecked use. `void` says a function result is not consumed, while `never` says no value can occur. `object` excludes primitives but is not a record schema. Type aliases disappear, while regular enums emit runtime values. Numeric enums usually reverse-map; string enums do not. [Everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) · [Enums](https://www.typescriptlang.org/docs/handbook/enums.html)

Literal types retain information that a primitive supertype would erase. A `const` variable may preserve a primitive literal, but a mutable property or `let` binding usually widens. `as const` can preserve readonly literal structure. TypeScript 5.0 changed enum type modeling so all enums are union enums, including computed members that could not previously be represented as distinct member types; the ordinary runtime emit behavior remains a separate matter. [TypeScript 5.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)

## Examples

```ts
type Result = "ok" | "error";
let result: Result = "ok";
const precise = "ok"; // "ok"
let widened = "ok";   // string

function logResult(value: Result): void {
  console.log(value);
}

function fail(message: string): never {
  throw new Error(message);
}
```

The alias is erased. `precise` cannot be rebound, so it retains its literal. `widened` can be reassigned any string. `fail` never returns normally.

```ts
const input: unknown = JSON.parse('{"enabled":true}');
if (typeof input === "object" && input !== null && "enabled" in input) {
  // `input` is still an object-shaped unknown property value until narrowed further.
  const enabled = (input as { enabled?: unknown }).enabled;
  if (typeof enabled === "boolean") console.log(enabled);
}
```

The parse result is not trusted just because its text resembles an object. A production program should use a reusable runtime validator/schema rather than scattering assertions.

```ts
enum Direction { Up, Down }
enum Reply { Yes = "YES", No = "NO" }
const directionName = Direction[Direction.Up]; // "Up" numeric reverse mapping
const reply = Reply.Yes; // "YES"; no reverse mapping

const enum InternalFlag { Cached = 1 }
const flag = InternalFlag.Cached; // usually inlined
```

For a public API that needs only a finite state, `type DirectionText = "up" | "down"` avoids emitting an enum object. Use an enum when the runtime object itself is part of the intended API.

## Common mistakes

- Using `String`, `Number`, `Boolean`, or `Function` where a primitive or exact callback type is intended.
- Treating `any` as safe input or `unknown` as directly usable without narrowing.
- Assuming `void` and `undefined` have identical behavior in all positions.
- Assuming `object` means a plain object with string keys.
- Forgetting `strictNullChecks` controls the distinction/assignability of nullish types.
- Treating a type assertion as parsing/conversion or an enum declaration as an external runtime guarantee.
- Expecting a string enum to have numeric reverse mappings.
- Publishing ambient const enums without considering consumer compilation and dependency version skew.
- Assuming TypeScript 5.0's enum union typing changed how enum JavaScript is emitted.

## Knowledge checks with answers

1. **What is safer for unvalidated JSON: `any` or `unknown`?** `unknown`, because it requires inspection before use.
2. **Can `never` be assigned to `string`?** Yes; an impossible value can fit any type. A `string` cannot be assigned to `never`.
3. **Does `object` accept a function?** Yes; functions are non-primitive objects.
4. **Do string enums have reverse mappings?** No, unlike emitted numeric enums.
5. **Does an ambient enum emit values?** No; the runtime source must supply them.
6. **When is a literal union preferable to an enum?** When the type-level finite set is enough and no runtime enum object is needed.

Sources: [everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html), [enums](https://www.typescriptlang.org/docs/handbook/enums.html), [TypeScript 5.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/).
