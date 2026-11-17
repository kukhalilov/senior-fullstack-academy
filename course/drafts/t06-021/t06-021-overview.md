# TypeScript unions, intersections, narrowing, and control-flow analysis — Big-picture orientation and mental model

## Problem and purpose

Programs often handle values whose shape depends on data: a request may be loading, successful, or failed; a value from a map may be absent; a function may accept a string or a number. TypeScript needs to describe those possibilities without forcing every caller to pretend there is only one. Union and intersection types express the alternatives and combinations. Narrowing then uses observable checks and code flow to determine which alternatives remain possible at a particular line.

This topic uses TypeScript 7.0 stable as the current stable compiler and labels TypeScript 7.1 as beta as of 2026-11-17. Recent notable narrowing milestones include TypeScript 4.9's support for checking properties not listed on an object type, TypeScript 5.4's last-assignment closure analysis, and TypeScript 5.5's inferred predicates and stable indexed-access narrowing. It assumes basic types, object properties, functions, and conditions. Static narrowing does not validate network data or change JavaScript execution; runtime checks must really establish the facts the types claim. [Narrowing handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Plain-language mental model

A union is a shortlist of possible shapes: `string | number` means one value may currently be either kind. Until a check rules one out, code can safely use only what all remaining choices support. An intersection combines requirements: `HasId & HasName` needs both shapes. A discriminated union gives each alternative a clear label property, such as `state: "ready"`, so a branch can select one complete state.

Control-flow analysis is like tracking a set of possible types through a map of branches. A check narrows that set; a return or throw removes a path; paths that meet again combine their possibilities. Assignments can change the current type. A predicate or assertion function adds a reusable contract, but its implementation must actually be correct.

## How the parts fit together

1. Declare the valid alternatives with a union or combine requirements with an intersection.
2. Use literal discriminants when states have different required data.
3. At each program point, recognize checks such as `typeof`, `instanceof`, `in`, equality, or a predicate call.
4. Follow assignments, early returns, branches, switch cases, and closure captures to see which types are still reachable.
5. At a branch merge, combine the possibilities from paths that can reach that point.
6. Prove exhaustiveness by assigning the remaining value to `never`; a new unhandled variant then becomes a compile error.

## Concept map

```text
declared possibilities
      │
 union ── alternatives       intersection ── combined requirements
      │
      ▼
 runtime observation / assignment / reachability
      │
      ▼
 flow type at this location
   ├─ branch narrows
   ├─ merge recombines
   └─ no reachable member -> never -> exhaustiveness proof
```

## End-to-end walkthrough

```ts
type Result<T> =
  | { state: "loading" }
  | { state: "success"; value: T }
  | { state: "failure"; message: string };

function describe<T>(result: Result<T>): string {
  switch (result.state) {
    case "loading": return "Please wait";
    case "success": return `Loaded ${String(result.value)}`;
    case "failure": return result.message;
    default: return assertNever(result);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected state: ${String(value)}`);
}
```

The `state` literal identifies one member. In the success branch, only that member remains, so `value` is available. Each `return` makes the branch unreachable after the switch. If another state is added later, `result` in `default` is no longer `never`, and the function stops compiling until that state is handled. The function's runtime behavior comes from the switch; `never` supplies a static check.

## When to use it and tradeoffs

Use unions to model alternatives explicitly, particularly state machines and API result shapes. Use intersections to compose independent object requirements, but watch for conflicting properties: an impossible literal intersection can collapse to `never`, while incompatible ordinary property types may leave a property whose type is `never`. A discriminant is usually clearer than loosely related optional fields.

Use `unknown` at boundaries where a value is not yet trusted, then narrow it. Avoid `any`, which opts out of the checks. Prefer exact checks such as `value !== undefined` when truthiness would accidentally reject valid values like `0` or `""`. User-defined predicates and assertions can lie; they should be treated like unchecked code unless paired with real validation.

## What later lessons cover

The concepts lesson develops state modeling and the control-flow graph. Reference lessons explain the union/intersection vocabulary, each built-in/user-defined guard, and advanced flow patterns. Current notable changes include TypeScript 5.4 preserving some narrowing in closures after a last assignment and TypeScript 5.5 inferring eligible predicate returns and narrowing stable indexed accesses. Earlier 4.4 and 4.6 changes explain aliased and destructured discriminant flow. These changes expand analysis but do not make checks validate external inputs. [TypeScript 5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html) · [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)
