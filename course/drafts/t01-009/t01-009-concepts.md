<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# generics constraints and generic methods — Core concepts and how they fit together

*This is an automatically generated draft.*

# Learning objectives
* Understand the purpose of generics in providing type safety and performance.
* Learn how to use constraints to define the capabilities required by a type parameter.
* Distinguish between generic type definitions and closed constructed types.
* Understand how the compiler performs type inference and when it requires explicit arguments.

# Prerequisites
* Basic familiarity with C# classes, interfaces, and methods.
* Understanding of the difference between value types (structs) and reference types (classes).
* Familiarity with the concept of static typing (where types are checked at compile-time).

# Core concepts
Generics solve the problem of code duplication. Without generics, if you wanted to write a list that could hold integers and another that could hold strings, you might be tempted to use `object` and cast values back and forth. This loses compile-time relationships between stored and retrieved values and can cause invalid casts. Converting a value type to object boxes it, but object-based code does not necessarily box on every operation.

A **Generic type** or **Generic method** allows you to write the logic once using a **Type parameter** (a placeholder). When you use the type, you provide a **Type argument** (the actual type, like `int` or `string`). The compiler type-checks the declaration using the type parameter and supplied type arguments, preserving **static type safety**. JIT/AOT runtimes may specialize value-type instantiations and share reference-type code; that is an implementation detail, not a language guarantee.

# Mechanisms and relationships
* **Construction:** A `Generic type` (like `List<T>`) is a template. When you provide an argument, it becomes a `Closed constructed type` (like `List<int>`). These are distinct types at runtime.
* **Constraints:** By default, a type parameter can be any type. A `where constraint clause` restricts what can be passed. For example, `where T : struct` ensures only value types are used, while `where T : IDisposable` ensures the type implements a specific interface.
* **Inference:** You often don't need to specify the type argument for methods. The compiler uses `Generic method type inference` to look at the arguments you pass and "guess" the type. The expected type of the invocation result does not infer a method type argument, although specified lambda and method-group output inference rules can contribute.
* **Runtime:** Generic type arguments are represented in runtime metadata and can be inspected. Generic APIs avoid object-based casts in their typed paths, but operations may still box depending on conversions and interfaces.

# Worked examples
Consider a method that needs to create a new instance of a type and call a method on it.

```csharp
// The new() constraint allows us to call 'new T()'
public T CreateAndProcess<T>() where T : new()
{
    T item = new T();
    // Logic here...
    return item;
}

// Usage:
// The compiler infers T is 'string' because of the return type assignment
// (Wait: Inference works from arguments, not return types!)
// Correct usage:
var myItem = CreateAndProcess<System.Text.StringBuilder>();
```

**Step-by-step:**
1. The compiler sees `CreateAndProcess<T>`.
2. It checks the `new()` constraint. If you tried to pass a type without a parameterless constructor, the `Constraint diagnostic` would trigger a compile error.
3. At runtime, the method constructs a StringBuilder. This flow does not itself box the value, but boxing can still occur for particular conversions or operations.

# Misconceptions and edge cases
* **Misconception:** "Constraints select the type argument." **Fact:** `Constraint does not select a type argument`. Constraints only validate that the type you provided is allowed.
* **Misconception:** "Generics are just like templates in C++." **Fact:** C# generic type arguments are represented in runtime metadata, and non-equivalent closed constructed types have distinct type identities and static storage. Native-code sharing or specialization is runtime-dependent.
* **Edge Case:** `allows ref struct`. This is a special anti-constraint added in C# 13 that allows you to use ref struct types such as `Span<T>`, which must follow ref-safety rules in generic methods, provided the method follows strict safety rules.
* **Edge Case:** `Constraint cannot repeat sealed type`. A sealed class cannot be used as a class-type constraint; use an interface or another meaningful constraint when appropriate.

# Knowledge checks with answers
1. **Question:** If I have a method `void Process<T>(T input)`, can the compiler infer `T` if I call `Process(10)`?
   * **Answer:** Yes. The compiler uses `Inference from argument expressions` to determine that `T` is `int`.

2. **Question:** Why should you prefer a specific constraint (like `where T : IDisposable`) over no constraint?
   * **Answer:** Constraints allow you to access the members of the constraint (e.g., calling `.Dispose()`). Without a constraint, the compiler permits only operations valid for an unconstrained type parameter, including members available through object/type-parameter rules.

3. **Question:** Does `List<int>` share the same static fields as `List<string>`?
   * **Answer:** No. `Different closed types are distinct types`, and each has its own static fields and initialization.

*Sources:*
[Microsoft C# Generics Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/)
[Constraints on Type Parameters](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters)
[C# 13 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13)
