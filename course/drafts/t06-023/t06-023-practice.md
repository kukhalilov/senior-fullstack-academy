# TypeScript function types, overloads, predicates, and call signatures — Exercises and worked solutions

## Goals

Practice expressing function contracts, callable/constructable values, overloads, predicates, contextual callback types, and safe function assignment. Examples target TypeScript 7.0 stable; TypeScript 5.5 predicate inference is identified separately.

## Worked example

An API may call a visitor with both an item and its index. Callback authors may use either or both arguments, so both are required in the contract:

```ts
function visitAll<T>(items: readonly T[], callback: (item: T, index: number) => void): void {
  items.forEach(callback);
}

visitAll(["x", "y"], item => console.log(item));
visitAll(["x", "y"], (item, index) => console.log(index, item));
```

Marking `index` optional would say the API may omit it and force a callback that uses it to handle `undefined`, even though this implementation always passes it.

## Exercises

1. Declare a function type expression for a callback that receives an `Account` and returns a display string. Assign a function and use contextual typing.
2. Define a callable object type with a `label` property and a string-to-number call signature. Build a runtime value that truly provides both.
3. Add function overloads that accept a string and return a number, or accept a number and return a string. Also support a caller whose argument is `string | number`.
4. Define a constructor type that accepts a string and produces an instance with a `name`. Explain how an abstract construct signature differs.
5. Write a function with an explicit `this` parameter and show a safe bound call. Explain why `this` is not passed as an ordinary argument.
6. Write an assertion function for a non-empty string and use it before returning string methods. Explain which runtime behavior makes the assertion truthful.
7. A callback API always supplies an event and index. Type it correctly, then assign a callback that only uses the event. Explain why the index should not be optional.
8. Compare assignment of an `Animal` consumer where a `Dog` consumer is required with the reverse assignment under `strictFunctionTypes`.
9. Explain the conditions under which TypeScript 5.5 can infer a predicate return for a boolean function.
10. A function overload implementation has optional parameters, but callers cannot pass one specific arity. Explain how to expose the intended arity.

## Progressive hints

1. Use `(account: Account) => string`.
2. Put the property and parenthesized call signature in one object type; initialize the property on a real function object.
3. Add a third overload for the union input if that call is part of the public API.
4. A concrete constructor type is `new (value: string) => Instance`; `abstract new` can describe abstract classes that are not directly instantiated.
5. Put `this: Receiver` first in the type-level parameter list and use `.bind(receiver)` at runtime.
6. The function must throw before returning if the claimed condition is false.
7. Parameter optionality describes what the caller might omit, not what the callback may ignore.
8. A wider consumer can handle narrower values; a narrower consumer cannot handle all wider values.
9. Check the 5.5 eligibility conditions and whether both true and false outcomes match the refinement.
10. An implementation signature is hidden; write a public overload for every intended call shape.

## Complete solutions

1.
   ```ts
   type Account = { id: string; displayName: string };
   type Display = (account: Account) => string;
   const show: Display = account => `${account.id}: ${account.displayName}`;
   ```
   `account` gets a contextual type from `Display`.

2.
   ```ts
   type LabeledConverter = { label: string; (text: string): number };
   function makeConverter(): LabeledConverter {
     const convert = ((text: string) => text.length) as LabeledConverter;
     convert.label = "Character count";
     return convert;
   }
   ```
   The assertion connects the callable function with the added property; the implementation then creates that property. The assertion alone would not do so.

3.
   ```ts
   function convert(value: string): number;
   function convert(value: number): string;
   function convert(value: string | number): number | string;
   function convert(value: string | number): number | string {
     return typeof value === "string" ? value.length : String(value);
   }
   declare const input: string | number;
   const output = convert(input); // number | string
   ```
   The third overload makes the union call part of the public contract. The body handles both cases. `declare` creates no runtime value and is used here only to exercise the static call shape.

4.
   ```ts
   type NamedInstance = { name: string };
   type NamedConstructor = new (name: string) => NamedInstance;
   class Named implements NamedInstance {
     constructor(readonly name: string) {}
   }
   const Constructor: NamedConstructor = Named;
   const value = new Constructor("Ada");
   ```
   An `abstract new` construct signature can describe abstract constructors accepted by APIs that inspect/extend them, but such a value cannot be directly instantiated.

5.
   ```ts
   function prefix(this: { value: string }, suffix: string): string {
     return this.value + suffix;
   }
   const bound = prefix.bind({ value: "item-" });
   const result = bound("7");
   ```
   The first `this` parameter is erased. `bind` supplies the receiver at runtime; callers do not write it as the first argument.

6.
   ```ts
   function assertNonEmpty(value: string): asserts value is string {
     if (value.length === 0) throw new Error("Expected non-empty text");
   }
   function upper(value: string): string {
     assertNonEmpty(value);
     return value.toUpperCase();
   }
   ```
   The assertion establishes non-emptiness only because it throws for the empty string. Its asserted type is still `string`; additional refinements may need a branded type or a value-returning validator.

7.
   ```ts
   type EventCallback = (event: Event, index: number) => void;
   const logEvent: EventCallback = event => console.log(event.type);
   ```
   The callback can ignore the second supplied argument. Marking it optional would assert that callers may omit it.

8. A consumer accepting any `Animal` can safely be used where a consumer for `Dog` is required because every dog is an animal. A `Dog`-only consumer cannot be used where the API may pass any animal. With `strictFunctionTypes`, ordinary function-property parameters use this contravariant direction; method syntax has a compatibility exception.

9. TypeScript 5.5 can infer a predicate when the function has no explicit return/predicate annotation, has a single return and no implicit return, does not mutate its parameter, and returns a boolean expression tied to a refinement. Both directions must be true: false must rule out the target type as well. Details and examples are in t06-021. [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html)

10. Add an overload signature for the intended arity above the implementation. The body signature is invisible to callers, even if its parameters are optional. The implementation must still branch safely for every public overload.

## Tests and edge cases

- Test each overload separately and test union-valued arguments through an overload that accepts the union.
- Check that callable object's properties are initialized before use.
- Confirm a constructor type is applied to a value with a matching runtime `new` implementation.
- Invoke a `this`-dependent function both unbound and bound in a runtime test; only the bound form should satisfy the receiver contract.
- Test assertion guards with valid and invalid values; invalid cases must throw.
- Test callback parameters where the implementation ignores one and where the caller may omit one.
- Check assignments in both directions under `strictFunctionTypes` and separate method syntax from function properties.
- Treat TS5.5 inferred predicates as version-specific and review both true/false semantics.

## Reflection questions

- What exact calls should callers be allowed to make?
- Could one union or generic signature express the relationship more simply than overloads?
- Which arguments does the API always pass to its callback?
- What runtime code makes a predicate or assertion true?
- Does a callback accept every parameter type the API may send?

Sources: [Functions handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html), [type compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html), [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html).
