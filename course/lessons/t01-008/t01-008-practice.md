
# properties indexers fields methods parameters and overloads — Exercises and worked solutions

# Goals

This lesson focuses on mastering C# member declarations. You will learn to:
* Distinguish between `Fields` (state) and `Properties` (controlled access).
* Implement `Indexers` for array-like object access.
* Manage `Method` signatures, `Overload resolution`, and `Parameter` modifiers.
* Utilize modern C# features like the `field` keyword and `Extension blocks`.

# Worked example

Consider a `Library` class that manages a collection of books. We use different members to handle state and logic.

```csharp
public class Library
{
    // Property: Controlled access with the C# 14 'field' keyword
    public int BookCount
    {
        get => field;
        set => field = value >= 0 ? value : throw new ArgumentOutOfRangeException(nameof(value));
    }

    // Indexer: Array-like access
    private string[] _books = new string[10];
    public string this[int index]
    {
        get => _books[index];
        set => _books[index] = value;
    }

    // Method with 'params' collection (C# 13+)
    public void AddBooks(params ReadOnlySpan<string> titles)
    {
        foreach (var title in titles) { /* logic */ }
    }
}
```

**Map of components:**
1. **Fields**: Use for private state.
2. **Properties**: Use for public API surface; `get`/`set` allow validation.
3. **Methods**: Use for actions; `params` allows flexible argument counts.
4. **Indexers**: Use when an object acts as a container.

# Exercises

1. **Property Validation**: Create a `Temperature` class with a `Celsius` property. Use a `field`-backed property to reject values below -273.15.
2. **Params Collection**: Write a C# 13 method `static int SumValues(params ReadOnlySpan<int> numbers)` and return the total sum.
3. **Overload Resolution**: Define two methods: `void Process(int x)` and `void Process(double x)`. Call `Process(10)`. Explain which is chosen and why.

# Progressive hints

* **Exercise 1**: In a C# 14 property accessor, throw `ArgumentOutOfRangeException` when the incoming value is below -273.15; reject invalid values instead of silently clamping unless clamping is the intended contract.
* **Exercise 2**: `ReadOnlySpan<int>` is a valid `params` collection type in C# 13+. Iterate using a `foreach` loop.
* **Exercise 3**: C# `Overload resolution` prefers the most specific type. An `int` can be implicitly converted to a `double`, but `int` to `int` is an exact match.

# Complete solutions

**Exercise 1:**
```csharp
public class Temperature {
    public double Celsius {
        get;
        set => field = value >= -273.15 ? value : throw new ArgumentOutOfRangeException(nameof(value));
    }
}
```

**Exercise 2:**
```csharp
public int SumValues(params ReadOnlySpan<int> numbers) {
    int sum = 0;
    foreach (var n in numbers) sum += n;
    return sum;
}
```

**Exercise 3:**
```csharp
void Process(int x) { } // Exact match
void Process(double x) { } // Requires conversion
// Process(10) calls Process(int) because it is a "Better function member"
// due to the exact match.
```

# Tests and edge cases

* **Overload Ambiguity**: If you define `void M(int x, double y)` and `void M(double x, int y)`, calling `M(1, 1)` causes a compile-time error because neither is "better" than the other.
* **Required Members**: The compiler requires an object initializer to set required members unless the invoked constructor is marked `[SetsRequiredMembers]`; that annotation is trusted, not verified, and `required` is not runtime validation.
* **Extension Members**: If normal member lookup finds a suitable applicable instance method, it wins before extension lookup; an inapplicable instance overload does not necessarily block extension lookup.

# Reflection questions

1. Why prefer a `Property` over a `Field` for public data? (Hint: Encapsulation and validation).
2. When should you use `ref` or `in` parameters? (Hint: Performance for large structs vs. value copying).
3. How does the `field` keyword in C# 14 simplify property implementation? (Hint: It removes the need to manually declare a private backing field).

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties)*

*Draft: Automatically generated.*
