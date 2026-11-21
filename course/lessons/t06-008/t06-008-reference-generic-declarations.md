# TypeScript generics, inference, constraints, and variance — Reference: Generic types, functions, classes, and interfaces

## Scope and version

This lesson explains all 13 supplied names in the generic declarations group. Examples target TypeScript 7.0 stable, with 7.1 beta behavior identified separately. Generic syntax is compile-time information; it does not validate incoming JavaScript values at runtime. [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html) · [TypeScript 5.0 const type parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## How this group fits the mental model

Declarations introduce reusable type parameters. A call or construction then infers or receives arguments, producing an instantiated type. Signatures and interfaces can describe generic behavior without requiring one concrete implementation. Defaults reduce repeated arguments; const parameters can preserve literal detail at eligible call sites.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Generic type parameter` | A named placeholder such as `T` introduced in a declaration’s `<...>` list. It stands for a type selected per use or instantiation and connects positions such as parameter and result. Use descriptive names when multiple parameters have distinct roles. |
| `Generic function` | A function declaration or expression with type parameters, such as `function identity<T>(value: T): T`. The parameter list is selected separately for each call; inference normally fills it from arguments. |
| `Generic call signature` | A call signature that declares parameters on the callable shape, for example `{ <T>(value: T): T }`. Each call can choose its own `T`; this differs from putting `T` on the enclosing object, which fixes it for that object's use. |
| `Generic construct signature` | A construct signature such as `new <T>(value: T) => Box<T>` that describes a generic `new` operation. It describes a constructor shape; it does not by itself implement allocation or runtime validation. |
| `Generic interface` | An interface parameterized as `interface Box<T> { value: T }`. Supplying an argument creates a particular shape, such as `Box<string>`. Parameters can be on the interface or on an individual call signature, with different lifetimes. |
| `Generic type alias` | An alias with parameters, such as `type Pair<A, B> = [A, B]`. It names a reusable type expression and can encode relationships; unlike an interface declaration, an alias does not declare a new named runtime entity. |
| `Generic class` | A class declared with parameters, such as `class Store<T> { constructor(readonly value: T) {} }`. `Store<string>` describes instances whose value is a string. The class's static side is not parameterized per instance, so static members cannot use the class's `T`. |
| `Generic method` | A method may introduce its own parameter, `map<U>(convert: (value: T) => U): U[]`, independently of an enclosing class parameter `T`. It can infer `U` per method call. |
| `Generic default type argument` | A trailing parameter default such as `<T = unknown>`. It is used when the caller omits that argument and inference supplies no candidate. It must satisfy its constraint; required parameters cannot follow optional/defaulted parameters. |
| `Generic type argument` | The concrete type substituted for a parameter, such as `string` in `Box<string>`. It can be explicit or inferred; it is type-level information and has no runtime representation. |
| `Generic inference` | The compiler's selection of type arguments from call arguments and contextual information. Inference preserves useful relationships but may widen or combine candidates; it cannot infer an intention for a parameter with no evidence. |
| `Explicit type argument list` | A supplied list such as `pair<string, number>("age", 37)`. Give arguments in declared order. It is useful when inference lacks evidence or when the desired contract should be stated; excess or incompatible arguments are rejected. |
| `Const type parameter` | A parameter declared with `const`, for example `function define<const T extends readonly string[]>(values: T): T`. Added in TypeScript 5.0, it asks for const-like inference for eligible arguments, often preserving tuple/literal detail. It does not turn a mutable value into an immutable runtime object and constraints must accept the inferred readonly form. |

## Cross-item comparison

A generic call signature chooses its parameter for every call; a generic interface or class usually carries an argument on the described object or instance. A function can also have parameters; the signature name describes its type shape, whereas generic function names describe callable declarations/values. Inference and an explicit argument list are alternative ways to select the same type argument. A const parameter changes inference preference, while `as const` is an expression-level assertion at a particular call site. [TypeScript 5.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)

## Examples

```ts
interface Parser<T> {
  parse(text: string): T;
}

const numberParser: Parser<number> = {
  parse(text) { return Number(text); }
};

function identity<T>(value: T): T { return value; }
const exact = identity("ready"); // inferred string
const configured = identity<Date>(new Date()); // explicit argument

function tuple<const T extends readonly unknown[]>(value: T): T { return value; }
const settings = tuple(["dark", 3]); // const-like tuple inference
```

The parser's interface parameter is fixed as `number` for that object. The function's `T` is chosen for each invocation. The last helper preserves tuple-like detail without claiming that the runtime array has become frozen.

## Common mistakes

- Putting a parameter on the enclosing interface when each call should choose a different type, or vice versa.
- Expecting type arguments to validate JSON or other runtime input; use runtime checks for that.
- Using a generic parameter once without relating it to another position; a non-generic type may be simpler.
- Treating a default as a constraint or assuming it always wins over inference.
- Assuming a const type parameter accepts readonly inference even when its constraint only permits mutable arrays.
- Trying to use a class instance's `T` on a static member; static values exist independently of any instance argument.

## Knowledge checks with answers

1. **Does a generic call signature fix `T` for all calls on its object?** No, its call signature can choose `T` independently for each call.
2. **What does `Box<string>` mean?** The type argument `string` is substituted for the declared parameter in the instance shape.
3. **When is an explicit type argument useful?** When inference lacks a candidate or when the call should state a deliberate type contract.
4. **Does `const T` freeze an object?** No. It affects type inference only; runtime mutability is unchanged.

Sources: [Generics handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html), [TypeScript 5.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html).
