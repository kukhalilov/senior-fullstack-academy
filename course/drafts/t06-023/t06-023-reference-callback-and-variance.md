# TypeScript function types, overloads, predicates, and call signatures — Reference: Callbacks, contextual typing, and function compatibility

## Scope and version

This lesson explains all 6 supplied callback/compatibility names. Parameter variance has important `strictFunctionTypes` and method-syntax boundaries; the broader structural rules are expanded in t06-009. [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html) · [Type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)

## How this group fits the mental model

Callback types say how the API will invoke user code. Contextual typing fills in omitted parameter annotations from that contract. Compatibility must be checked from the API's calls toward the callback's capabilities: the callback cannot require arguments the API may not supply or types narrower than the API can provide.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Callback function type` | A function signature used as a parameter or return type, such as `(item: Item, index: number) => void`. It should state the arguments the API actually supplies and the result the API actually uses. |
| `Contextual parameter typing` | An unannotated callback parameter receives a type from the expected function type at its use site. If the callback is stored without context or the signature cannot determine a type, explicit annotations or a clearer generic signature may be needed. |
| `Return type annotation` | A type after the parameter list declares the value callers may rely on. `void` means the caller discards the result; an implementation may still return a value when assigned to a void-returning callback. Use a concrete result when callers need it. |
| `Optional callback parameter` | A callback parameter marked optional says the API may invoke the callback without it. Do not mark an argument optional merely because implementations may ignore it; functions with fewer parameters can generally fill a callback position that supplies more. |
| `Rest callback parameter` | A callback signature may accept a rest tail, represented by an array or tuple. This changes the allowed call arity; use a tuple rest when finite positions/types are correlated and an array rest for repeated homogeneous arguments. |
| `Function type compatibility` | Determines whether one function can safely be used where another is expected. It considers parameters, returns, optional/rest positions, overloads, and strictness settings. Under `strictFunctionTypes`, ordinary function parameters are contravariant; method/constructor parameters retain a bivariance exception. |

## Cross-item comparison

Contextual typing flows from the callback position into its parameters; compatibility flows the other way by asking whether the supplied callback handles the API's calls. A required callback parameter is a guarantee the API must meet. An optional parameter weakens that guarantee and makes the callback handle `undefined`.

Function compatibility distinguishes parameter and return positions. A callback can ignore extra arguments because JavaScript provides them but the function need not name them. For parameter types, under strict checking a consumer of a wider type can safely handle narrower values; return values move in the covariant direction. Method compatibility is intentionally more permissive and is covered further in t06-009. [Type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)

## Examples

```ts
type Visit<T> = (value: T, index: number) => void;

function forEach<T>(items: readonly T[], visit: Visit<T>): void {
  items.forEach((value, index) => visit(value, index));
}

forEach(["a", "b"], value => console.log(value));
forEach(["a", "b"], (value, index) => console.log(index, value));

const onNumber: (value: number) => void = value => console.log(value.toFixed());
const onAnything: (value: number | string) => void = value => console.log(value);
const safeConsumer: (value: number) => void = onAnything;
```

`Visit` marks `index` required because `forEach` always supplies it. Either callback can accept that call; a callback can name fewer parameters. `onAnything` can safely stand in where a number callback is expected because it can handle every number. The opposite assignment is unsafe because `onNumber` cannot handle a string.

```ts
type Handler = (event: Event, index?: number) => void;
```

This signature means `index` may be absent at an invocation, so handler code must account for `undefined`. If the API always supplies an index, write `index: number` even though a handler implementation can ignore the second parameter.

## Common mistakes

- Making a callback parameter optional because a callback implementation does not use it.
- Assuming a callback's contextual type is known when it is detached from a typed location.
- Using `void` when the caller needs a value returned from the callback.
- Assuming parameter compatibility is covariant under `strictFunctionTypes`.
- Ignoring the method/constructor bivariance exception or applying it to every function property.
- Treating a rest array as a fixed tuple of call positions.
- Accepting a narrower callback than the API can safely invoke.

## Knowledge checks with answers

1. **Can a callback with one parameter be used where the API supplies two?** Usually yes; the callback may ignore extra arguments.
2. **What does an optional callback parameter promise?** The API may omit it, so callback code must handle its absence.
3. **Why can an `Animal` handler accept calls where a `Dog` handler is expected?** It accepts every dog, while a Dog-only handler cannot accept every animal.
4. **What does a contextual type supply?** Expected parameter/return information to a callback expression at its use site.
5. **Does `() => void` prohibit returning a value in an implementation?** No; it means the caller does not consume that result through this type.

Sources: [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html), [type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html).
