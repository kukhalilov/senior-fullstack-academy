# TypeScript unions, intersections, narrowing, and control-flow analysis — Reference: Union, intersection, and discriminated types

## Scope and version

This lesson explains all 9 supplied names in the union/intersection group. The examples use the current TypeScript 7.0 stable model; the type operators chapter t06-022 handles conditional-type distribution, which is different from control-flow elimination of union members. [Narrowing handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) · [everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)

## How this group fits the mental model

Union and intersection types define the initial set of possible shapes. Narrowing reduces a union's alternatives along a code path. A discriminated union ties each alternative to a tag, allowing the checker to move the payload with the state. Exhaustiveness uses the absence of remaining alternatives to reveal missing cases.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Union type` | A type such as `string | number` whose value conforms to one of the alternatives. Before narrowing, only members/operations valid for all possible alternatives are safe. |
| `Intersection type` | A type such as `HasId & HasLabel` requiring a value to satisfy both constituents. It composes compatible object requirements but does not choose between conflicting property definitions. |
| `Discriminated union` | A union of object shapes with a common property whose distinct literal values identify the alternatives. Checking that property narrows the whole object, including fields associated with that member. |
| `Discriminant property` | The shared property used to distinguish union members, often named `kind`, `type`, or `state`. Keep it required and consistently typed when every state must be identifiable. |
| `Literal discriminant` | A discriminant whose type is a specific literal such as `"ready"` or `"failed"`. Distinct literals provide stable branch tests; widening them to `string` removes this precision. |
| `Optional discriminant` | A discriminant marked optional. Some values may omit it, so absence itself becomes part of the model; it can make alternatives overlap and complicate narrowing. Prefer required tags for mutually exclusive states. |
| `never exhaustiveness check` | A pattern that assigns the remaining value in a final switch branch to `never`. If a union member was not handled, the assignment fails because that member is still possible. It checks compile-time coverage only. |
| `Union member narrowing` | Control flow eliminates union constituents inconsistent with an observation or branch. For example, after `typeof value === "string"`, a `string | number` value is narrowed to `string` on the true path. This is not the distributive conditional-type mechanism. |
| `Intersection property conflict` | When constituents require incompatible types for one property, that property must satisfy both and may become `never`. Conflicting literal discriminants can make the entire intersection reduce to `never`; other object conflicts can leave an object with a `never` property. |

## Cross-item comparison

A union means “one of”; an intersection means “both.” A discriminated union makes the union's alternatives explicit and related to data fields. A required literal discriminant offers a clearer partition than an optional tag. Union member narrowing eliminates impossible alternatives from the current flow type; it does not change the declared union globally.

Intersection conflicts are not resolved like union alternatives. With `{ value: string } & { value: number }`, a value must satisfy both requirements for `value`; there is no valid ordinary value. When the conflicting field is a literal discriminant, TypeScript may reduce the entire intersection to `never`. [Handbook on narrowing and never](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Examples

```ts
type State =
  | { status: "idle" }
  | { status: "running"; startedAt: number }
  | { status: "failed"; reason: string };

type Timestamped = { createdAt: number };
type Named = { name: string };
type NamedRecord = Timestamped & Named;

function summarize(state: State): string {
  switch (state.status) {
    case "idle": return "Idle";
    case "running": return `Started at ${state.startedAt}`;
    case "failed": return state.reason;
    default: return assertNever(state);
  }
}
function assertNever(value: never): never {
  throw new Error(`Unhandled state: ${String(value)}`);
}
```

The `status` literals select the related fields. `NamedRecord` must provide both the timestamp and name. Add a fourth state and the final call will fail until its case is handled. The thrown error also provides a runtime fallback for unexpected values that bypass static checking.

## Common mistakes

- Reading a union as if every member's properties are available before narrowing.
- Using overlapping optional fields when one required discriminant would model the states more precisely.
- Expecting an intersection to mean “either shape” or to prefer a property's wider type.
- Forgetting a literal discriminant can be widened by an annotation or mutable initialization.
- Treating `never` as a runtime validator; it only describes the static remainder.
- Confusing control-flow union member narrowing with distributive conditional types in t06-022.

## Knowledge checks with answers

1. **What does `A | B` mean?** A value may be either alternative; until narrowed, only their safe common operations are available.
2. **What does `A & B` mean?** A value must satisfy both type requirements.
3. **Why is a required literal discriminant useful?** It uniquely selects a union member and carries its associated fields into the branch.
4. **What does a `never` check detect?** A union member that has not been handled at the switch.
5. **Does a conflict always reduce the whole intersection to `never`?** No. A conflicting discriminant may reduce the entire type; an ordinary property conflict can leave the object type with a `never` property.

Sources: [Narrowing handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html).
