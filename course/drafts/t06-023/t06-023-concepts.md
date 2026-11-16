# TypeScript function types, overloads, predicates, and call signatures — Core concepts and how they fit together

## Learning objectives

- Describe one callable signature and an object that is both callable and data-bearing.
- Choose optional, rest, and tuple-rest parameters based on actual invocation behavior.
- Explain why overload signatures, not the implementation signature, define external calls.
- Relate predicates/assertions to runtime checks without treating them as verified proofs.
- Evaluate callback and function compatibility in the correct assignability direction.

## Prerequisites

Know functions, object types, unions, generic parameters, and basic assignability. Detailed generic inference is in t06-008; control-flow results from guards are in t06-021; structural compatibility and method variance are in t06-009.

## Core concepts

### A signature states what a caller may do

A function type expression such as `(text: string) => number` describes one call shape. Parameter names are required syntactically in this type form but do not affect compatibility. A call signature uses `:` before the return type and can appear with properties inside an object type. A construct signature begins with `new` and describes a constructable value. An object may have both call and construct signatures, though the runtime value must actually support both operations.

Method signatures describe callable members on object types. Generic call or construct signatures introduce parameters whose type arguments can be selected per call/construction. Their generic relationships are covered more fully in t06-008; here the focus is the position and shape of the signature.

### Parameter lists encode arity

An optional parameter allows the caller to omit it; inside the implementation it may be `undefined` unless a default replaces that value. A rest parameter collects a variable number of trailing arguments into an array or tuple. A tuple rest parameter can model a finite set of argument combinations and retain parameter relationships. Named tuple members improve readability and editor hints; their labels do not change the structural tuple type.

The callback optional-parameter trap is important: a callback type with `index?: number` promises the caller may invoke it without an index. If the API always passes an index but callback authors may ignore it, declare it as required; a function accepting fewer parameters can still be assigned where the caller supplies more arguments.

### `this` can be part of a type contract

TypeScript permits a special `this` parameter as the first parameter in a function declaration/type. It is erased and is not a JavaScript argument. It can describe which receiver must be bound before a callback is called. An arrow function captures lexical `this` and cannot provide a dynamic receiver in the same way. Runtime `this` binding remains JavaScript behavior.

### Overloads publish several call forms

Write one or more overload signatures before one implementation. Callers can use only the overload signatures; an optional implementation parameter does not make that call shape public unless an overload allows it. The implementation must handle every overload path and its signature must be compatible with each overload. Overload order can affect resolution, and inference utilities such as `Parameters`/`ReturnType` inspect the last signature.

Use overloads when argument count/type determines a different result or behavior. If callers commonly hold a union of acceptable inputs, separate overloads may reject that union because each overload must accept the entire argument type; add an overload for the union or use one signature with a union parameter. When possible, a generic or union signature is simpler.

### Predicate and assertion returns are trusted claims

A predicate return `value is T` gives callers a narrowed type when the function returns true. Its implementation is not validated against the predicate. An assertion return `asserts value is T` says that if execution continues, the parameter has type `T`; `asserts condition` establishes a boolean condition. The implementation should actually test and throw on failure.

TypeScript 5.5 can infer predicates for eligible boolean-returning functions, affecting their inferred function signature and uses such as array filtering. The conditions and two-way semantics belong to the narrowing topic t06-021; do not assume every boolean function receives a predicate. [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

### Contextual typing and callback compatibility

Contextual typing supplies parameter types from where a function expression is used. A callback may omit annotations and receive types from the expected signature. Parameter compatibility asks whether the callback can safely accept the calls the API can make; return compatibility asks whether the callback's result can be used as expected. Under `strictFunctionTypes`, function-valued parameters are generally checked contravariantly, with a method/constructor bivariance exception described in t06-009.

The special target return type `void` means the caller ignores the function result; it does not require the implementation to literally return `undefined`. A callback returning a value can be assigned to a `() => void` target, but callers through that target cannot use the value.

## Mechanisms and relationships

One signature is usually clearer than several overlapping overloads. Compare:

```ts
function format(value: string | number): string {
  return typeof value === "string" ? value : value.toFixed(2);
}
```

If the return type is always string and behavior is uniform, the union signature describes the API. Overloads become useful when input form changes result form:

```ts
function parse(value: string): number;
function parse(value: number): string;
function parse(value: string | number): number | string {
  return typeof value === "string" ? Number(value) : String(value);
}
```

Here the overloads preserve the input/result relation. A caller with `string | number` may need an additional overload accepting that union or must narrow before calling.

## Worked examples

### Optional versus callback-ignorable parameter

```ts
type Visitor<T> = (value: T, index: number) => void;
const logValue: Visitor<string> = value => console.log(value);
```

The API promises it passes the index, so the callback type marks it required. An implementation may ignore it by declaring fewer parameters. Marking `index?` would instead say the API might omit it, forcing an implementation that uses the second argument to handle `undefined`.

### Callable object with a safe runtime implementation

```ts
type Counter = {
  count: number;
  (): number;
};

function makeCounter(): Counter {
  const callable = (() => callable.count) as Counter;
  callable.count = 0;
  return callable;
}
```

The assertion bridges the function value and additional property during construction. The implementation then initializes the actual property before returning. This is an example where runtime code creates the callable object contract; the assertion alone would not.

## Misconceptions and edge cases

- A function type expression cannot describe extra properties; use an object type with a call signature.
- A call signature does not create a callable runtime value.
- The implementation signature of an overload is hidden from callers.
- An overload with optional implementation parameters does not expose every arity.
- A union argument may match no individual overload even if each union constituent has an overload.
- Optional callback parameters mean the caller may omit the value, not that callback authors may ignore it.
- A `this` parameter is erased and is not passed as an ordinary argument.
- A predicate/assertion declaration can lie; TypeScript trusts it.
- A `void` callback target discards access to a callback's return value; it does not forbid returning a value internally.

## Knowledge checks with answers

1. **How do a function type expression and call signature differ?** The former describes one function; the latter can be a member of an object shape with properties/call overloads.
2. **Can callers use the overload implementation signature?** No.
3. **When should a callback parameter be marked optional?** Only when the caller may actually omit it.
4. **Does a `this` parameter add a runtime argument?** No, it is type-only and erased.
5. **Does an assertion signature verify its body?** No; the implementation must enforce the claim.
6. **Can a function returning a number satisfy a `() => void` callback type?** Yes; the target says callers ignore the result.

Sources: [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html), [type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html), [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html).
