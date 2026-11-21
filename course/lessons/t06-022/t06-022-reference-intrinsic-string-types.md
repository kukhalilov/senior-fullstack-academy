# TypeScript indexed, conditional, mapped, and utility types — Reference: Intrinsic string manipulation types

## Scope and version

This lesson explains every supplied name in the intrinsic string group. The types were introduced in TypeScript 4.1 as compiler intrinsics for type-level string processing. They manipulate string literal types; they are not JavaScript functions and do not transform runtime values. [TypeScript 4.1 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html) · [utility types handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## How this group fits the mental model

Template literal types can combine text with string literal unions. Intrinsic types provide standard casing transformations for the resulting static strings. A useful API can derive event names or property labels from an existing key union and keep those names synchronized with the source type.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Uppercase<StringType>` | Converts each string literal member to uppercase in the type system. Applied to a union, it transforms the members; it does not call JavaScript `toUpperCase()` on a value. |
| `Lowercase<StringType>` | Converts each string literal member to lowercase at type level. Use it to derive a static naming convention, while performing an actual runtime conversion separately if needed. |
| `Capitalize<StringType>` | Uppercases the first character of each string literal type member and leaves the remaining characters unchanged. Commonly paired with a template literal to build names such as `getTitle`. |
| `Uncapitalize<StringType>` | Lowercases the first character of each string literal type member and leaves the remainder unchanged. It can derive a lower-camel-case key from a type-level name. |
| `Intrinsic string manipulation type` | The shared category for the four compiler-provided string transforms. Their implementation is intrinsic rather than an ordinary user-visible generic alias; they operate on static string types. |

## Cross-item comparison

`Uppercase` and `Lowercase` affect the full string; `Capitalize` and `Uncapitalize` affect the first character only. Each transforms a string-literal type, and unions are processed member by member. None validates arbitrary runtime text or guarantees locale-sensitive behavior; these are compiler type operations. [TypeScript 4.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html)

## Examples

```ts
type AppEventName = "save" | "close";
type UpperEvent = Uppercase<AppEventName>; // "SAVE" | "CLOSE"
type HandlerName = `on${Capitalize<AppEventName>}`; // "onSave" | "onClose"
type LowerFirst = Uncapitalize<"UserID">; // "userID"
type LowerWord = Lowercase<"READY">; // "ready"
```

The compiler computes the displayed types; the declarations create no runtime strings. If a program needs an actual uppercase value, it must call an appropriate JavaScript string method or otherwise produce that value.

## Common mistakes

- Treating these utilities as runtime transformations.
- Assuming `Capitalize` title-cases every word; only the first character changes.
- Applying a casing type to broad `string` and expecting a finite literal union; the result remains broad.
- Assuming the type-level casing operation is locale-sensitive or identical in every Unicode corner case to a runtime library; use the documented compiler intrinsic semantics for static types.
- Building enormous cross-product template literal unions without considering compile-time cost.

## Knowledge checks with answers

1. **What does `Capitalize<"first name">` change?** The first character only, yielding `"First name"`.
2. **Does `Uppercase<Event>` uppercase a runtime variable?** No, it produces a static type.
3. **Which pair affects only the first character?** `Capitalize<StringType>` and `Uncapitalize<StringType>`.
4. **What happens when the input is the broad type `string`?** There is no finite set of known literals to transform, so the result is not a finite literal union.

Sources: [TypeScript 4.1 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html), [utility types handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html).
