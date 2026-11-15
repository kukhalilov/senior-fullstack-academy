<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# generics constraints and generic methods — Exercises and worked solutions

# Goals

*   Understand how to write reusable code using `Generic type` and `Generic method` definitions.
*   Learn to apply `where constraint clause` to enforce capabilities on type arguments.
*   Practice distinguishing between `Explicit generic type argument` and `Generic method type inference`.
*   Master the mental model of "compile-time substitution" versus "runtime casting."

# Worked example

Generics allow you to write a single algorithm that works for many types while maintaining type safety. Instead of using `object` (which requires casting and causes boxing for value types), we use a `Generic type parameter`.

Consider a method that needs to create a new instance of a type and return it. We must tell the compiler that the type `T` supports a parameterless constructor.

```csharp
// A generic method with a constructor constraint
public T CreateInstance<T>() where T : new()
{
    return new T();
}

// Usage
var myObj = CreateInstance<System.Text.StringBuilder>();
```

**Why this works:**
1.  `T` is the `Generic type parameter`.
2.  `where T : new()` is the `new() constraint`. It guarantees the compiler that `T` has a public parameterless constructor.
3.  The compiler performs `Type argument substitution` at compile time, creating a specialized version of the method for `StringBuilder`.

# Exercises

1.  **Constraint Practice:** Write a generic method `GetFirst<T>(List<T> list)` that returns the first element. Add a constraint to ensure `T` is a reference type (`class constraint`).
2.  **Inference Practice:** Create a method `Swap<T>(ref T a, ref T b)` that swaps two variables. Call it without specifying the type argument (let the compiler perform `Generic method type inference`).
3.  **Ref Structs:** Attempt to pass a `Span<int>` (which is a `ref struct`) to a generic method that does *not* have the `allows ref struct anti-constraint`. Observe the compiler error.

# Progressive hints

*   **Exercise 1:** Use `where T : class`. If you try to pass an `int` (a value type), the compiler will trigger a `Constraint diagnostic`.
*   **Exercise 2:** Simply call `Swap(ref x, ref y);`. The compiler looks at the `Input type` of the arguments to determine `T`.
*   **Exercise 3:** `ref struct` types are stack-only. Standard generics cannot hold them unless you explicitly opt-in using `allows ref struct`.

# Complete solutions

```csharp
// 1. Class constraint
public T GetFirst<T>(List<T> list) where T : class
{
    return list[0];
}

// 2. Inference
public void Swap<T>(ref T a, ref T b)
{
    T temp = a;
    a = b;
    b = temp;
}

// 3. Anti-constraint
public void ProcessRefStruct<T>(T item) where T : allows ref struct 
{
    // This is valid for ref structs
}
```

# Tests and edge cases

*   **Constraint satisfaction:** If you define `where T : struct`, passing a `string` (a reference type) will fail.
*   **Inference failure:** `Inference from return type is not performed`. If you have `T Create<T>()`, you *must* call `Create<int>()`; you cannot write `int x = Create();`.
*   **Static fields:** Remember that `Generic type static field per closed type` means `MyClass<int>` and `MyClass<string>` have completely separate static fields.
*   **Boxing:** Using `where T : struct` prevents boxing when storing value types in generic collections.

# Reflection questions

1.  Why is it better to use `where T : new()` than to use reflection to create an instance?
2.  If you have a `Generic method` that doesn't use its `Type parameter` in the arguments, can the compiler infer the type? (Hint: Check `Inference from argument expressions`).
3.  How does `Generic code sharing` affect the performance of your application compared to writing non-generic, type-specific methods?

*Source: [Microsoft C# Programming Guide - Generics](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/)*

*Automatically generated draft.*
