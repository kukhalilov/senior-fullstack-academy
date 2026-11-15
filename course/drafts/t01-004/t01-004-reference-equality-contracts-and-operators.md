<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Reference: Value equality, object identity, hash contracts, and equality customization

*This is an automatically generated draft.*

# Scope and version
This lesson covers equality contracts, identity, and comparison mechanisms in C# 15 and .NET 11. It focuses on how the language distinguishes between value-based equality and reference-based identity. 

**Source:** [Microsoft Learn C# 15 language reference and .NET 11 API reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)

# How this group fits the mental model
In C#, types are categorized as **value types** (which contain their data directly) or **reference types** (which contain a pointer to data). Because of this, "equality" is not a single concept:
1. **Reference equality** checks if two variables point to the exact same memory location (identity).
2. **Value equality** checks if two variables contain the same data, regardless of where they live in memory.

The items in this inventory provide the tools to define, compare, and customize these behaviors across different type systems like classes, structs, and records.

# Supplied names explained

### Core Comparison Mechanisms
*   **Reference equality**: Comparing if two references point to the same object instance.
*   **Value equality**: Comparing if the content of two objects is equivalent.
*   **Object identity comparison**: Checking if two variables refer to the same object in memory.
*   **Equality operator (==)** / **Inequality operator (!=)**: Operators used to compare values or references; behavior is type-dependent.
*   **Object.Equals(Object?)**: The base method for value equality.
*   **Object.ReferenceEquals(Object?, Object?)**: A static method that strictly checks if two references are identical.
*   **ValueType.Equals(Object?)** / **ValueType.GetHashCode()**: Overridden base methods for structs to perform field-by-field value comparison.

### Interfaces and Comparers
*   **IEquatable<T>.Equals(T?)**: An interface for types to provide a strongly-typed, high-performance equality check.
*   **EqualityComparer<T>.Default**: Provides a default equality comparer for a type, automatically choosing between `IEquatable<T>` or `Object.Equals`.
*   **EqualityComparer<T>.Equals(T?, T?)** / **EqualityComparer<T>.GetHashCode(T)**: Methods used by the default comparer to handle nulls and type-specific logic.
*   **Custom IEqualityComparer<T>** / **EqualityComparer<T>.Create**: Mechanisms to define custom equality logic for collections.

### Structural and Collection Equality
*   **Structural equality**: Comparing the contents of a collection or tuple rather than the reference.
*   **IStructuralEquatable** / **IStructuralComparable**: Interfaces for collections (like arrays or tuples) to support deep structural comparison.
*   **StructuralComparisons.StructuralEqualityComparer** / **StructuralComparisons.StructuralComparer**: Pre-defined comparers for structural logic.
*   **ITuple** / **ValueTuple.Equals** / **ValueTuple equality operators**: Logic for comparing tuple contents.
*   **SequenceEqual extension method** / **MemoryExtensions.SequenceEqual** / **Span<T>.SequenceEqual**: Methods to compare sequences (like arrays or spans) element-by-element.
*   **SequenceEqual comparer overload**: Allows passing a custom comparer to sequence comparisons.

### Records and Special Types
*   **Record synthesized equality** / **Record equality contract** / **EqualityContract property**: Records automatically generate equality logic based on properties.
*   **Record class equality** / **Record struct equality**: Specific implementations for record types.
*   **Record with-expression copy semantics**: Creates a new instance with modified values, maintaining value-based identity.
*   **Anonymous type equality**: Compiler-generated equality for anonymous objects based on property values.
*   **Array reference equality**: Arrays use reference equality by default, even if their contents are identical.

### Contracts and Hazards
*   **Object.GetHashCode()**: Returns an integer for hash-based collections.
*   **Hash code consistency contract**: The rule that equal objects must return the same hash code.
*   **Equal objects same hash code** / **Unequal objects may share hash code**: Fundamental rules for hash-based collections.
*   **Mutable hash key hazard**: Modifying an object used as a key in a `Dictionary` or `HashSet` breaks the hash contract.
*   **Dictionary key equality** / **HashSet equality semantics**: How collections use equality to manage unique items.
*   **Null equality behavior** / **NaN equality behavior** / **Floating-point equality** / **Decimal equality** / **String ordinal equality** / **String culture-sensitive equality**: Specific rules for handling special values and types.
*   **User-defined operator overload** / **Operator true and false** / **Operator equals overload** / **Operator hash-code consistency**: Customizing how types behave in comparisons.

# Cross-item comparison
*   **`==` vs `Equals`**: `==` is an operator that can be overloaded; `Equals` is a virtual method. For reference types, `==` defaults to reference equality unless overloaded.
*   **`ReferenceEquals` vs `==`**: `ReferenceEquals` cannot be overridden and always checks identity. `==` can be changed by the type author.
*   **`IEquatable<T>` vs `Object.Equals`**: `IEquatable<T>` avoids "boxing" (converting a value type to an object) and is faster for value types.

# Examples
```csharp
// Value equality with Records
record Point(int X, int Y);
var p1 = new Point(1, 2);
var p2 = new Point(1, 2);
Console.WriteLine(p1 == p2); // True (synthesized equality)

// Reference equality with Arrays
int[] a1 = { 1, 2 };
int[] a2 = { 1, 2 };
Console.WriteLine(a1 == a2); // False (different references)
Console.WriteLine(a1.SequenceEqual(a2)); // True (structural equality)
```

# Common mistakes
1.  **Mutating a Dictionary Key**: Changing a property of an object after adding it to a `HashSet` or `Dictionary` makes the object "lost" because its hash code changes.
2.  **Assuming `==` works for all types**: Always check if a type (like an array) uses reference equality before using `==`.
3.  **Ignoring `NaN`**: For floating-point values, `NaN == NaN` is false, while `Double.Equals(double.NaN)` returns true; choose the comparison API intentionally.

# Knowledge checks with answers
1.  **Question**: If you have two different array instances with the same elements, does `==` return true?
    *   **Answer**: No. Arrays use reference equality. Use `SequenceEqual` for content comparison.
2.  **Question**: Why should you implement `IEquatable<T>`?
    *   **Answer**: To provide a type-safe, high-performance equality check that avoids boxing.
3.  **Question**: What is the "Mutable hash key hazard"?
    *   **Answer**: If an object's state changes while it is a key in a hash-based collection, its hash code changes, making it impossible to find the object again.
