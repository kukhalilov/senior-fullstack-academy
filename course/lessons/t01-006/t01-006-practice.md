
# C# classes structs records constructors and initialization — Exercises and worked solutions

# Goals
*   Understand the distinction between `class`, `struct`, and `record` types in C#.
*   Learn how to use `primary constructor` and `required member` to enforce valid object state.
*   Practice choosing the correct type based on identity versus value semantics.

# Worked example
In C#, choosing the right type depends on whether you need **identity** (a unique object) or **value** (data that represents a state).

Consider a `User` profile. We want to ensure the `Username` is always provided.

```csharp
// Using a record class for value-based equality and concise syntax
public record User(string Username)
{
    // 'required' ensures the caller must set this property
    public required string Email { get; init; }
}

// Usage
var user1 = new User("Alice") { Email = "alice@example.com" };
var user2 = user1 with { Email = "new@example.com" }; // Nondestructive mutation
```

1.  **`record class`**: Provides value-based equality (two users with the same data are "equal").
2.  **`primary constructor`**: The `(string Username)` syntax defines a constructor and a property automatically.
3.  **`required member`**: The `required` keyword makes the compiler require `Email` in the creation expression (unless a constructor asserts `SetsRequiredMembers`); it does not guarantee the assigned value is non-null or valid.

# Exercises
1.  **Struct vs Class**: Create a `Point` type that stores `X` and `Y` coordinates. Should it be a `struct` or a `class`? Why?
2.  **Required Members**: Define a `Product` record class with a `Name` (via primary constructor) and a `Price` (as a `required` property). Attempt to instantiate it without the price and observe the compiler error.
3.  **Records**: Create two instances of a `record struct` with identical data. Use `==` to compare them. What is the result?

# Progressive hints
*   **Exercise 1**: A `Point` is small and represents a coordinate. Decide whether value-copy semantics fit the API; size alone is not a performance guarantee. A `readonly record struct` can express immutable value semantics.
*   **Exercise 2**: The `required` modifier forces the use of an `object initializer` (e.g., `new Product("Item") { Price = 10.0 }`).
*   **Exercise 3**: Records synthesize equality members. `record struct` instances are compared by their field values, not their memory address.

# Complete solutions
1.  **Point**: `public readonly record struct Point(int X, int Y);` (Use `readonly` to prevent accidental mutation of the struct).
2.  **Product**: 
    ```csharp
    public record Product(string Name) { public required decimal Price { get; init; } }
    // new Product("Item"); // Compile-time error: required member Price is not initialized.
    ```
3.  **Comparison**: `record struct` uses value equality. `p1 == p2` will return `true` if `X` and `Y` are the same.

# Tests and edge cases
*   **Default Structs**: `default(S)` produces a value whose fields have their default values and does not run a user-defined parameterless constructor. `new S()` invokes that constructor when one is defined.
*   **Shallow Copy**: Remember that `with` expressions and record equality are **shallow**. If your record contains a `List<T>`, the list reference is copied, not the contents of the list.
*   **Required Members**: A constructor can use `[SetsRequiredMembers]` to assert that it initializes every required member; the compiler trusts the assertion and does not verify the implementation. Use it only when the constructor establishes that contract.

# Reflection questions
1.  Why might you choose a `readonly struct` over a standard `struct`?
2.  How does a `primary constructor` differ from a traditional constructor in terms of where the parameters are stored?
3.  In what scenario would you prefer a `class` over a `record class`? (Hint: Think about identity versus data).

*Source: [Microsoft Learn C# Fundamentals](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes)*
