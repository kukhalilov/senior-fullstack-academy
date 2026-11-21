# TypeScript function types, overloads, predicates, and call signatures — Reference: Function type and object call signatures

## Scope and version

This lesson explains all 13 supplied signature-form names. Examples target TypeScript 7.0 stable. Generic relationship details beyond the signature forms belong to t06-008. [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html) · [Type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)

## How this group fits the mental model

These forms describe how a function-like value may be invoked. Some describe one ordinary function signature; others place signatures on an object or add parameter-list features. They are contracts for type checking, so a matching runtime implementation must still exist.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Function type expression` | A type such as `(text: string) => number` describes one callable signature. It is concise for callbacks, but does not declare extra properties on the function value. Parameter names appear in the syntax; they do not affect compatibility. |
| `Call signature` | A member such as `(text: string): number` inside an object type describes a callable object. It can coexist with properties and with additional call signatures. |
| `Construct signature` | A member like `new (name: string) => User` describes a value that can be invoked with `new` and returns an instance shape. The declaration does not implement or instantiate it. |
| `Method signature` | A member such as `save(id: string): void` describes a callable property using method syntax. Method syntax has specific function-parameter compatibility behavior; see t06-009 for the method bivariance exception. |
| `Generic call signature` | A call signature can introduce its own type parameter, `<T>(value: T): T`, allowing each invocation to choose a type. The parameter belongs to that signature rather than being fixed on the enclosing object. |
| `Generic construct signature` | A construct signature can introduce a type parameter, `new <T>(value: T) => Box<T>`. Each construction can select/infer a type argument; the runtime constructor must truly create the promised instance. |
| `Optional parameter` | A parameter marked `?` may be omitted, and in the function body it can be undefined. It must follow required parameters. A default initializer also permits omission but gives the implementation a non-undefined value after defaulting. |
| `Rest parameter` | A final parameter written `...values: T[]` collects zero or more trailing arguments into an array. The rest type is an array or tuple; only one rest parameter is allowed and it is last. |
| `Tuple rest parameter` | A rest parameter whose type is a tuple expands into a structured argument list, preserving fixed positions, optional elements, and argument correlations. It is useful for wrappers that forward typed arguments. |
| `Named tuple parameter` | Tuple elements can have labels, such as `[query: string, limit?: number]`. Names improve readability and tooling hints; labels do not create object properties or change tuple assignability. |
| `this parameter` | A special first parameter `this: Receiver` declares the required receiver type for checking calls. It is erased and is not a JavaScript argument. Use it for functions whose behavior depends on a dynamic receiver. |
| `Constructor signature` | A signature beginning with `new` describes the constructable side of a value, commonly used to accept a class/constructor. A class also has an instance side; the constructor value and created instances are distinct types. |
| `Abstract construct signature` | `abstract new (...args: A) => T` describes constructors including abstract classes that cannot themselves be instantiated. It is useful for APIs that inspect or subclass constructors; do not call `new` on an abstract constructor value. |

## Cross-item comparison

A function type expression describes only a callable function shape. A call signature adds callability to an object type, which can also declare properties. A construct signature adds `new` behavior. A method signature describes an object member and uses method compatibility rules. Generic call/construct signatures choose type parameters per invocation; a parameter on the surrounding type would instead be fixed there.

Optional parameters describe possible omission; rest parameters describe a variable tail; tuple rest parameters describe a structured set of arguments. Named tuple labels aid readers but are not runtime names. The explicit `this` parameter changes the static receiver contract without adding an argument. [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html)

## Examples

```ts
type Formatter = (value: string) => string;

type DescribedFormatter = {
  label: string;
  (value: string): string;
};

type Constructor<T> = new (value: string) => T;
type GenericFactory = new <T>(value: T) => { value: T };
type Arguments = [prefix: string, count?: number];

function callWith(this: { prefix: string }, value: string): string {
  return this.prefix + value;
}

function run<T extends (...args: any[]) => unknown>(fn: T, ...args: Parameters<T>): ReturnType<T> {
  return fn(...args) as ReturnType<T>;
}
```

The `this` parameter is not present in `Parameters<T>` as a regular argument. The final generic `run` example is a signature illustration; its assertion does not prove every generic function body safe. For a concrete wrapper, preserve the function's type using a well-tested generic signature or define the expected call shape explicitly.

## Common mistakes

- Writing `(string) => void` and thinking the parameter type is string; the syntax treats `string` as the parameter name and the parameter type is implicit.
- Expecting function type expressions to declare `.description` or other properties.
- Treating a construct signature as proof that a function value supports `new` at runtime.
- Putting required parameters after optional ones.
- Using an array rest type when a fixed tuple of arguments is required.
- Treating tuple labels as runtime field names.
- Passing the explicit `this` parameter as the first actual argument.
- Instantiating a value described by an abstract construct signature.

## Knowledge checks with answers

1. **Which signature form can describe a callable object with a property?** A call signature inside an object type.
2. **Are named tuple labels part of runtime shape?** No.
3. **Is a `this` parameter an actual argument?** No; it is type-only and erased.
4. **Can an abstract construct signature be directly instantiated?** No; it may describe abstract classes as inputs but does not make them constructable.

Sources: [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html), [type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html).
