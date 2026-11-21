# TypeScript structural compatibility, interfaces, classes, and variance — Big-picture orientation and mental model

## Problem and purpose

JavaScript passes objects and functions between APIs without requiring each value to inherit from one named base class. TypeScript therefore asks whether a source value has members compatible with the target shape. Interfaces and classes help describe those shapes, but they interact with special rules for fresh object literals, private/protected members, static sides, and callback variance.

This topic follows TypeScript 7.0 stable as of 2026-11-16. It assumes familiarity with object types, functions, classes, and generic parameters. Structural compatibility is convenient for JavaScript, but it is not a proof that runtime behavior is safe or that an object has no extra fields. [Type compatibility handbook](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)

## Plain-language mental model

Think of assignment as checking a required checklist. If the target expects a `name: string`, a source with a compatible `name` can work even if it has extra members. A fresh object literal receives an extra typo check to catch likely mistakes, but TypeScript does not turn every interface into an exact object shape.

Interfaces describe compatible contracts and can merge across declarations. Classes add runtime constructors and instance creation, but their type has two sides: the constructor/static value and the instances it creates. Private/protected members introduce a declaration-origin requirement, so those particular class members behave more nominally. Function parameters add a variance question: can the callback accept every value the caller may pass?

## How the parts fit together

1. Compare target-required members with source members and their types.
2. Apply special checks for fresh object literals, optional fields, and index signatures.
3. For functions, compare parameter and return positions in the safe direction for the active compiler option.
4. For classes, distinguish constructor/static members from instance members.
5. When private/protected instance members participate, check their declaration origin.
6. Use `extends` to inherit/compose a class or interface contract; use `implements` to check a class instance shape without changing it.
7. Treat variance annotations as advanced structural declarations, not a way to force an incompatible type to fit.

## Concept map

```text
source value ── has compatible required members? ──► target shape
    │                                             │
    ├─ extra fields normally okay                └─ fresh literal gets typo check
    ├─ functions: inputs / outputs / variance
    └─ class: static side ≠ instance side
          ├─ public structural members
          └─ private/protected declaration origin

interface extends ──► contract composition
class implements ───► instance-shape check (no runtime implementation added)
```

## End-to-end walkthrough

```ts
interface HasId { id: string }

function load(record: HasId): string {
  return record.id;
}

const user = { id: "u-1", displayName: "Mina" };
load(user); // extra property is allowed through the variable

// Fresh object literal receives an excess-property typo check:
// load({ id: "u-2", displayname: "typo" });
```

The function needs `id`; it does not need to know the source's exact set of properties. The variable assignment is structurally compatible. A fresh literal at the call site is checked for likely misspellings, but that special diagnostic is not a general prohibition on extra members.

## When to use it and tradeoffs

Use interfaces and structural types to describe the members an API actually consumes. Prefer composition over adding unrelated members to a contract. Use classes when runtime construction/identity/behavior is needed, not merely to obtain a type name. Add `implements` to catch a mismatch in a class's instance shape; it does not generate missing fields or force callers to use that class.

Enable `strictFunctionTypes` for safer function-valued properties and understand its method/constructor exception. Avoid private/protected members in a public shape solely to simulate nominal typing unless declaration origin is intentional. An explicit brand or wrapper may communicate nominal intent more clearly. Excess-property checks help with literals but do not replace runtime validation.

## What later lessons cover

The concepts lesson explains structural assignment and the special cases. The reference lessons enumerate object/interface and class/variance rules. TypeScript 4.3 added the `override` modifier; 4.7 added advanced variance annotations that must agree with the structure. Neither changes the core rule that most compatibility is member-based. [TypeScript 4.3](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html) · [TypeScript 4.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html)
