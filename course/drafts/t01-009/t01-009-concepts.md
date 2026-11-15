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
Generics solve the problem of code duplication. Without generics, if you wanted to write a list that could hold integers and another that could hold strings, you might be tempted to use `object` and cast values back and forth. This is dangerous (it can cause runtime errors) and slow (due to "boxing," where value types are wrapped in objects).

A **Generic type** or **Generic method** allows you to write the logic once using a **Type parameter** (a placeholder). When you use the type, you provide a **Type argument** (the actual type, like `int` or `string`). The compiler then generates a specialized version of that code for the specific type, ensuring **static type safety**—meaning errors are caught while you write the code, not when the program runs.

# Mechanisms and relationships
* **Construction:** A `Generic type` (like `List<T>`) is a template. When you provide an argument, it becomes a `Closed constructed type` (like `List<int>`). These are distinct types at runtime.
* **Constraints:** By default, a type parameter can be any type. A `where constraint clause` restricts what can be passed. For example, `where T : struct` ensures only value types are used, while `where T : IDisposable` ensures the type implements a specific interface.
* **Inference:** You often don't need to specify the type argument for methods. The compiler uses `Generic method type inference` to look at the arguments you pass and "guess" the type. Note that `Inference from return type is not performed`; the compiler only looks at the inputs.
* **Runtime:** Generics are "reified," meaning the runtime knows exactly which type is being used. This avoids the performance cost of casting from `object`.

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
3. At runtime, the code executes specifically for `StringBuilder`, avoiding any `object` boxing.

# Misconceptions and edge cases
* **Misconception:** "Constraints select the type argument." **Fact:** `Constraint does not select a type argument`. Constraints only validate that the type you provided is allowed.
* **Misconception:** "Generics are just like templates in C++." **Fact:** While similar, C# generics are reified at runtime, meaning `List<int>` and `List<string>` have different static fields and initialization logic.
* **Edge Case:** `allows ref struct`. This is a special anti-constraint added in C# 13 that allows you to use types that are restricted to the stack (like `Span<T>`) in generic methods, provided the method follows strict safety rules.
* **Edge Case:** `Constraint cannot repeat sealed type`. You cannot constrain a type to be a `sealed` class because no other class can inherit from it, making the constraint useless.

# Knowledge checks with answers
1. **Question:** If I have a method `void Process<T>(T input)`, can the compiler infer `T` if I call `Process(10)`?
   * **Answer:** Yes. The compiler uses `Inference from argument expressions` to determine that `T` is `int`.

2. **Question:** Why should you prefer a specific constraint (like `where T : IDisposable`) over no constraint?
   * **Answer:** Constraints allow you to access the members of the constraint (e.g., calling `.Dispose()`). Without the constraint, the compiler treats `T` as `object`, limiting you to methods defined on `System.Object`.

3. **Question:** Does `List<int>` share the same static fields as `List<string>`?
   * **Answer:** No. `Different closed types are distinct types`, and each has its own static fields and initialization.

*Sources:*
[Microsoft C# Generics Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/)
[Constraints on Type Parameters](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters)
[C# 13 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13)
