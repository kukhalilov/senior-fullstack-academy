# TypeScript primitive, literal, object, array, and tuple types — Core concepts and how they fit together

## Learning objectives

- Explain the static/runtime boundary and select primitive, literal, and special types accurately.
- Predict when inference widens literals and when contextual typing preserves a useful type.
- Distinguish assertions, `satisfies`, non-null assertions, and definite-assignment assertions.
- Model object members, arrays, readonly views, and positional tuples.
- Recognize enum runtime behavior and avoid unsafe `any`, `Function`, and unchecked casts.

## Prerequisites

Know JavaScript values, variables, functions, arrays, and objects. Union control-flow narrowing is covered in t06-021; generic and advanced type operators in t06-008/t06-022; compiler configuration in t06-010.

## Core concepts

### Types are erased descriptions

Most TypeScript annotations, interfaces, aliases, tuple shapes, and assertions disappear from emitted JavaScript. They restrict static operations but do not validate external values. Enums are different: ordinary enums emit a runtime object; `const enum` members are typically inlined under supported compilation and have library publishing caveats. [Enums handbook](https://www.typescriptlang.org/docs/handbook/enums.html)

### Primitive and special types

`string`, `number`, `boolean`, `bigint`, and `symbol` are primitive types. Their boxed object forms (`String`, etc.) are different and are not the normal annotation choices. Under `strictNullChecks`, `null` and `undefined` are distinct and must be included or ruled out. `unknown` safely accepts arbitrary input but allows few operations until narrowed; `any` disables many checks and can contaminate expressions. `never` has no possible values and often appears in impossible branches. `void` primarily means that a function result is intentionally ignored; it is not identical to `undefined` in every assignment position. `object` excludes primitives but includes functions and arrays; it does not promise a plain dictionary.

### Literal precision and widening

A `const` binding to a primitive often retains a literal type because it cannot be reassigned, while a `let` binding commonly widens to its primitive base. Object properties can widen even under `const` because those properties remain writable. `as const` creates a const context that preserves literal values and readonly structure recursively at the type level. Contextual typing can infer literals against an expected type. These are static inferences, not runtime freezing.

### Annotations, assertions, and `satisfies`

An annotation requires an expression to fit a target contract. Inference derives a type from the expression/context. An `as T` assertion tells the checker to treat a value as compatible; it performs no conversion or validation. The angle-bracket form has the same static effect but cannot be written in TSX where it conflicts with JSX. `!` on an expression removes nullishness from the static type without a check; `!` on a declaration suppresses definite-assignment diagnostics without initializing it. `satisfies` checks conformance while generally retaining the expression's own inferred type; contextual typing can still shape inference inside the expression. [Everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)

### Object and collection contracts

An object type literal describes properties and may include optional/readonly modifiers, an index signature, call signature, construct signature, or method signature. Each is a static contract; the value must provide runtime behavior. Optional property exactness and structural assignment details are deepened in t06-009.

`T[]` and `Array<T>` are equivalent spellings for ordinary mutable array types. `ReadonlyArray<T>` describes an array-like view without mutators; it does not freeze the underlying array. A tuple provides per-position types and a known order. Named tuple elements aid readability/editor tooling, optional elements permit a shorter length, and rest elements represent a variable tail. `readonly` tuples prevent writes through that type view. [Tuple types](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types)

### Aliases and enums

A type alias creates a reusable type-level name and no runtime object. Numeric enums typically emit forward and reverse mappings; string enums emit readable values without reverse mappings. Const enums are generally inlined/erased, but ambient const enums can create version-skew and missing-runtime pitfalls. Since TypeScript 5.0 all enums are union enums for type-checking, including previously unrepresentable computed members; this affected narrowing rather than changing ordinary enum runtime representation. [TypeScript 5.0 notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)

## Mechanisms and relationships

1. An expression has a runtime value, and inference derives a static description from it.
2. An annotation supplies a target; the checker verifies assignability and may contextually type nested expressions.
3. Literal widening trades precision for mutability; const contexts preserve precision and readonly modifiers.
4. Object shapes describe named members; arrays model repeated elements and tuples model ordered positions.
5. Special types differ in what operations they permit: `unknown` requires checks, `any` suppresses them, `never` represents impossibility, and `void` describes discarded function results.
6. Assertions alter only the checker’s view; runtime validation requires code.

## Worked examples

```ts
const fixed = "ready"; // type: "ready"
let changing = "ready"; // type: string
const config = { mode: "fast" } as const;
// config.mode = "slow"; // static error; no runtime freeze occurred
```

`fixed` cannot be rebound, so the literal remains informative. `changing` can be assigned another string. `config` has readonly literal-shaped properties in its type, but `Object.freeze(config)` would be a separate runtime operation.

```ts
type Palette = "red" | "green" | "blue";
const palette = { primary: "blue", danger: "red" } satisfies Record<string, Palette>;
palette.primary; // inferred narrowly as "blue"
```

The value is checked against the record shape without replacing its useful property type with the full `Palette` union.

## Misconceptions and edge cases

- `const` does not recursively freeze arrays or objects; only `as const` changes the static shape, and even that does not freeze runtime state.
- `unknown` is not a synonym for `any`: operations require narrowing or assertion.
- `never` is not an empty runtime value such as `null`; it indicates no value can occur.
- `void` callback results may ignore returned values, but a variable of type `void` is not a general destination for every value.
- `Function` does not encode parameter or return types; use a call signature.
- `object` is broad and includes function objects; use a concrete shape for records.
- `as T` and `value!` can make an unsound program type-check and are erased.
- Readonly views and properties are shallow/static restrictions, not runtime immutability.
- Optional tuple reads may yield `undefined`, and optional/rest elements affect the tuple's length type.
- `const enum` can be problematic across package/version boundaries when consumers inline values from declarations.

## Knowledge checks with answers

1. **Does `const` make an object's nested properties immutable?** No. Use a const assertion for readonly static shape; use runtime freezing if runtime mutation must be prevented.
2. **How do `unknown` and `any` differ?** `unknown` accepts any input but requires checks before use; `any` bypasses those checks.
3. **What does `satisfies` add over an annotation?** It checks the target contract while retaining the expression's inferred type, subject to contextual inference.
4. **Does an assertion validate JSON?** No; it is erased and performs no runtime validation.
5. **When is a tuple better than an array?** When positions have distinct roles or a known ordering/length shape.
6. **What is the runtime difference between type alias and enum?** A type alias is erased; a regular enum emits a runtime object.
