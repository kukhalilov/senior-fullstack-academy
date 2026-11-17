<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# covariance contravariance invariant types and delegates — Exercises and worked solutions

This is an automatically generated draft.

# Goals
*   Understand the difference between covariance, contravariance, and invariance.
*   Learn how to use `in` and `out` modifiers to enable safe type conversions.
*   Distinguish between generic variance and other mechanisms like array covariance or covariant return types.
*   Practice identifying valid and invalid variance positions in code.

# Worked example
Variance allows us to treat a generic type as a more or less specific version of itself, provided it is safe. 

Consider a `Producer<T>` that only returns items of type `T`. If we have a `Producer<string>`, we can treat it as a `Producer<object>` because every string is an object. This is **covariance** (using the `out` modifier).

```csharp
// Covariant interface: T is only used as a return type
interface IProducer<out T> {
    T GetItem();
}

class StringProducer : IProducer<string> {
    public string GetItem() => "Hello";
}

// Usage
IProducer<string> stringProducer = new StringProducer();
IProducer<object> objectProducer = stringProducer; // Valid due to covariance
```

Conversely, a `Consumer<T>` that only accepts items of type `T` can be treated as a `Consumer<string>` if it is defined as a `Consumer<object>`. This is **contravariance** (using the `in` modifier).

```csharp
// Contravariant interface: T is only used as a parameter
interface IConsumer<in T> {
    void Consume(T item);
}

class ObjectConsumer : IConsumer<object> {
    public void Consume(object item) => Console.WriteLine(item);
}

// Usage
IConsumer<object> objectConsumer = new ObjectConsumer();
IConsumer<string> stringConsumer = objectConsumer; // Valid due to contravariance
```

# Exercises
1.  **Identify the Variance:** Given `IEnumerable<T>`, why is it covariant? Look at the interface definition—where is `T` used?
2.  **Fix the Error:** You have `interface IProcessor<T> { void Process(T item); T GetResult(); }`. Why does adding `out T` cause a compiler error?
3.  **Delegate Practice:** If you have a `Func<string, object>`, can you assign it to a variable of type `Func<object, string>`? Why or why not?

# Progressive hints
1.  **Hint 1:** `IEnumerable<T>` only allows you to iterate (get) items. It does not allow you to add items.
2.  **Hint 2:** The `out` modifier requires that `T` only appears in "output" positions (return types). If `T` is used as a method parameter, it is an "input" position.
3.  **Hint 3:** `Func<T, TResult>` is contravariant in `T` (input) and covariant in `TResult` (output). You must reverse the relationship for both.

# Complete solutions
1.  `IEnumerable<T>` is covariant because its type parameter occurs in output-safe positions through enumeration. It does not expose an add operation through that interface.
2.  Adding `out T` fails because `Process(T item)` uses `T` as an input parameter. The compiler prevents this to ensure type safety; you cannot pass a base class where a derived class is expected.
3.  No. `Func<string, object>` is `Func<in T, out TResult>`. To assign it to `Func<object, string>`, you would need `object` to be a subtype of `string` (for contravariance) and `string` to be a subtype of `object` (for covariance). The first part is false.

# Tests and edge cases
*   **Value Types:** Variance does not apply to value types (e.g., `int`, `struct`). `IEnumerable<int>` cannot be converted to `IEnumerable<object>` via variance.
*   **Mutation:** `IList<T>` is invariant. If it were covariant, you could add an `object` to a `List<string>`, which would cause a runtime crash.
*   **Array Covariance:** `string[]` can be cast to `object[]`. An incompatible store through the wider array reference fails at runtime with `ArrayTypeMismatchException`. This is distinct from generic interface variance, which is checked at compile time.

# Reflection questions
*   Why is `IList<T>` forced to be invariant? What would happen if we allowed `IList<string>` to be treated as `IList<object>`?
*   How does the `in` and `out` contract protect the developer from runtime `InvalidCastException` errors?
*   When designing a generic API, why should you prefer the most restrictive variance possible?

*Source:* [Microsoft .NET Generic Variance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/)
