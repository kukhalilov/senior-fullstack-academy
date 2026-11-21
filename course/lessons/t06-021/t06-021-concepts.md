# TypeScript unions, intersections, narrowing, and control-flow analysis — Core concepts and how they fit together

## Learning objectives

- Model alternatives and combined requirements using unions and intersections.
- Read discriminated unions as explicit state machines.
- Explain how runtime guards and control flow refine a static type.
- Use reachability, branch merges, and `never` to reason about completeness.
- Apply recent predicate and indexed-access narrowing changes without overgeneralizing them.

## Prerequisites

Know object types, literal types, function parameters, conditions, return/throw, and basic assignability. Conditional and mapped type construction is handled in t06-022; JavaScript coercion and equality rules are handled in t06-011.

## Core concepts

### Unions grant only common capabilities

For `string | number`, a value has one of the alternatives. Before narrowing, code can use members available on both alternatives, such as operations common to them, but cannot call string-only methods. A union is useful when the alternatives are legitimate states. Widening a discriminant to `string` can destroy the compiler's ability to relate a state to its fields.

### Intersections combine requirements

`A & B` requires a value to satisfy both types. Intersections are useful for composing object capabilities. They do not merge conflicting property declarations by choosing one: if a property is `string` in one constituent and `number` in another, the property must satisfy both, giving an impossible value type. Conflicting literal discriminants can cause the entire intersection to reduce to `never`; other object intersections may remain shaped but have a `never` property.

### Discriminated unions make state and data move together

Give each union member a shared property with a distinct literal value and associate its data with that member. A check on the discriminant narrows the whole object, not just the tag. Optional discriminants require extra care: an optional tag may be absent, and the `in` operator can leave optional-property types in both branches. Prefer required, distinct tags when every state must be unambiguous.

### A type guard is an observation used in flow analysis

`typeof`, `instanceof`, `in`, equality, and truthiness checks can refine types. TypeScript analyzes expressions along branches, assignments, returns, throws, loops, and merges. The flow type is local to a program point; the declared variable type is still its broader starting contract. `typeof null` is `"object"`, so an object/null union needs an explicit null check. A truthiness check on numbers or strings also removes valid falsy values if the program's logic treats the branch as “present.”

`in` tests whether a property key exists on an object or its prototype chain at runtime. A type with an optional property can remain in both branches because that property may either exist or not. Even when presence is proven, the value may still be `undefined` if its declared value type permits it.

### Predicates and assertions are contracts

A declared predicate such as `value is User` tells callers that a true return means the argument is `User`; TypeScript trusts that claim and does not verify the implementation. An assertion signature tells the checker that normal return implies the asserted fact; it also must throw or otherwise fail when the claim is false. Prefer implementations that perform actual checks.

TypeScript 5.5 can infer predicates for eligible functions: no explicit return/predicate annotation, one explicit return and no implicit returns, no parameter mutation, and a returned boolean expression tied to narrowing. Predicate meaning is “if and only if”: false must rule out the target too. Thus `x !== undefined` can correctly distinguish a nullish member, while `!!x` cannot exclude `0` from `number | undefined`. [TypeScript 5.5 inferred predicates](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

### Control flow forms a graph

Each branch creates paths. A guard narrows on its true and false edges; a `return` or `throw` makes the remainder of that path unreachable. When paths meet, their still-possible flow types merge. A variable assignment updates what can be true after the assignment. The same analysis follows stable aliases of guards and discriminants, and in supported cases it preserves correlations through destructuring.

An exhaustive switch handles each discriminant literal. In its final branch, assigning the value to `never` asks the compiler to prove that no member remains. This is a static completeness alarm, not a runtime fallback strategy; keep an actual error or other deliberate behavior if unexpected runtime data is possible.

### Recent compiler changes

- **TypeScript 4.4:** control-flow analysis can follow certain aliased conditions and discriminants.
- **TypeScript 4.6:** control flow can preserve correlations in destructured discriminated unions and dependent rest-tuple parameters.
- **TypeScript 5.4:** a non-hoisted closure may use narrowing established after the variable's last assignment. Assignments in a nested function prevent that preservation because call timing is unknown.
- **TypeScript 5.5:** eligible functions can infer predicate return types; effectively constant `obj[key]` expressions can narrow after a guard. If either the object or key changes, the stability premise fails. [4.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html) · [4.6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-6.html) · [5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html) · [5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

## Mechanisms and relationships

```ts
type Command =
  | { kind: "move"; payload: { x: number; y: number } }
  | { kind: "rename"; payload: string };

function handle(command: Command): string {
  const { kind, payload } = command;
  if (kind === "move") return `${payload.x},${payload.y}`;
  return payload;
}
```

The discriminant and payload are destructured into const bindings from the same union, so the control-flow analysis can retain their relationship. Reassigning a destructured binding or using a structure that does not meet the feature's supported pattern can lose that correlation. A fresh discriminant check is preferable to an assertion when code can be written that way.

For closure flow, suppose a parameter begins as `string | URL`, is converted to `URL`, and a callback is created only after that final assignment. TypeScript 5.4 may preserve the narrowed type inside the callback. If a nested function can later assign the variable, the checker cannot assume the narrowed value persists. This is flow reasoning, not a guarantee about asynchronous scheduling.

## Worked examples

### Guard an untrusted value

```ts
function toName(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  throw new TypeError("Expected a string or number");
}
```

Each check narrows `value`; after the final branch, there is no supported return path for the remaining type. The throw makes that path unreachable. If a value originated as JSON, this is the runtime validation that makes the function's result credible.

### Narrow a stable indexed access

```ts
function upper(record: Record<string, unknown>, key: string): string | undefined {
  if (typeof record[key] === "string") return record[key].toUpperCase();
  return undefined;
}
```

TypeScript 5.5 can narrow an indexed expression when the object and key are effectively constant. If code assigns a different object or key between the check and use, do not rely on the same narrowing. Save the property in a local constant when that makes the stability explicit.

## Misconceptions and edge cases

- A union means one alternative at a time; code before narrowing can use only safe common capabilities.
- An intersection does not resolve incompatible fields by picking one.
- `typeof null` is `object`; a `typeof x === "object"` branch may still contain null.
- `in` checks property presence, but optional-property types may occur in both branches.
- Truthiness is not the same as non-nullishness; `0`, `false`, and `""` may be valid values.
- The compiler trusts explicit user predicates and assertions. A false declaration can make checked code unsafe.
- Inferred predicates have two-way semantics; a one-way test may not qualify.
- Narrowing is invalidated by writes that can change the value. Closure behavior depends on assignments and capture timing rules.
- `never` proves a static path has no remaining type member; it does not protect the program from untyped inputs at runtime.

## Knowledge checks with answers

1. **What can code do to a `string | number` before a guard?** Only operations supported by both alternatives.
2. **What does `kind: "move"` provide?** A required literal discriminant that selects its matching payload member.
3. **Why might an optional-property type remain in both `in` branches?** The property can be present or absent on values of that type.
4. **Why is `!!score` not a predicate for `number` from `number | undefined`?** False can mean either `undefined` or the valid number `0`.
5. **When can TypeScript 5.4 preserve narrowing inside a closure?** For a non-hoisted closure created after the last assignment, provided no nested function can assign that variable.
6. **What does a `never` exhaustiveness check catch?** A union member not handled by the switch at compile time.

Sources: [Narrowing handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html), [TypeScript 4.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html), [TypeScript 4.6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-6.html), [TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html), [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html).
