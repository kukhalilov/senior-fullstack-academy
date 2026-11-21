
# covariance contravariance invariant types and delegates — Core concepts and how they fit together

# Learning objectives
* Understand the conceptual difference between covariance, contravariance, and invariance.
* Learn how to use `in` and `out` modifiers to enable safe type conversions.
* Distinguish between generic variance, array covariance, and covariant return types.
* Identify the limitations of variance (e.g., why it conversion applies to reference-type arguments on variant interfaces/delegates).

# Prerequisites
* Understanding of inheritance and polymorphism (base classes and derived classes).
* Familiarity with generic interfaces (e.g., `IEnumerable<T>`) and delegates (e.g., `Func<T>`).
* Knowledge of reference types versus value types.

# Core concepts
Variance describes how the inheritance relationship between two types (e.g., `string` inherits from `object`) carries over to the generic types that use them (e.g., `IEnumerable<string>` vs `IEnumerable<object>`).

* **Covariance (`out`)**: Allows you to use a more derived type than originally specified. It is used for "producers" (things that return data). If `string` is a `object`, then `IEnumerable<string>` can be treated as `IEnumerable<object>`.
* **Contravariance (`in`)**: Allows you to use a more base type than originally specified. It is used for "consumers" (things that accept data). If `object` is a base of `string`, then `IComparer<object>` can be treated as `IComparer<string>`.
* **Invariance**: No conversion is allowed. The generic type must match exactly. A parameter used in both input and output positions generally must be invariant; mutable collection interfaces such as `IList<T>` are invariant.

# Mechanisms and relationships
Variance is a contract defined by the `in` and `out` modifiers on generic type parameters.

1.  **`out` variance modifier**: Marks a type parameter as "output-only." The compiler applies variance-safety rules: output-unsafe uses of `out` parameters and input-unsafe uses of `in` parameters are prohibited in relevant instance/interface contracts. This enables **Covariance**.
2.  **`in` variance modifier**: Marks a type parameter as "input-only." The compiler applies variance-safety rules: output-unsafe uses of `out` parameters and input-unsafe uses of `in` parameters are prohibited in relevant instance/interface contracts. This enables **Contravariance**.
3.  **Implicit reference conversion**: Variance is not a cast; it is an implicit conversion that the compiler permits because it is type-safe.
4.  **Limits**: Variance annotations are limited to generic interface and delegate parameters. It also does not apply to value-type arguments (e.g., `List<int>` cannot be converted to `List<object>`).

# Worked examples
### Covariance Example
Because `IEnumerable<T>` is defined as `IEnumerable<out T>`, it is covariant.
```csharp
// string inherits from object
IEnumerable<string> strings = new List<string> { "hello" };
// This is valid because of covariance
IEnumerable<object> objects = strings; 
```

### Contravariance Example
Because `IComparer<T>` is defined as `IComparer<in T>`, it is contravariant.
```csharp
IComparer<object> objectComparer = new ObjectComparer();
// This is valid because a comparer that can compare any object 
// can certainly compare strings.
IComparer<string> stringComparer = objectComparer;
```

# Misconceptions and edge cases
* **Array Covariance vs. Generic Variance**: Arrays allow `string[]` to be treated as `object[]`, but this is a runtime feature that can throw an `ArrayTypeMismatchException` if you try to put an `int` into that `object[]`. Generic variance conversions are statically type-safe under the interface/delegate contract.
* **Mutable Collections**: A common mistake is expecting `List<string>` to be convertible to `List<object>`. This is **Invariance**. If it were allowed, you could add an `int` to a list that expects `string`, breaking type safety.
* **Value Types**: Variance does not apply to value types. `List<int>` is not a `List<object>` because `int` is a value type and the underlying memory representation differs.
* **Method-group binding**: This is distinct from generic variance. You can assign a method that returns a `string` to a delegate that returns an `object` (method-group covariance), even if the delegate itself isn't defined with `out`.

# Knowledge checks with answers
1. **Question**: Why is `IList<T>` invariant?
   **Answer**: Because it is a read/write abstraction. It consumes `T` (via `Add`) and produces `T` (via indexer). If it were covariant, you could add a base type to a list of derived types; if contravariant, you could retrieve a base type from a list of derived types. Both violate type safety.

2. **Question**: Can you apply `out` to a class definition?
   **Answer**: No. Variance modifiers (`in`/`out`) are only valid on generic interfaces and generic delegates.

3. **Question**: What happens if you try to use an `out` parameter in a method argument?
   **Answer**: The compiler will report an "Invalid variance position" diagnostic. The `out` modifier strictly forbids using the type as an input parameter.

4. **Question**: Is `IEnumerable<int>` covariant to `IEnumerable<object>`?
   **Answer**: No. Variance conversions require reference-type arguments; `int` is a value type, so `IEnumerable<int>` has no variance conversion to `IEnumerable<object>`.

*Source: [Microsoft .NET Generic Variance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/)*
