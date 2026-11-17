<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Reference: Value equality, object identity, hash contracts, and equality customization

*This is an automatically generated draft.*

# Scope and version
This lesson covers equality contracts, identity, and comparison mechanisms in C# 15 and .NET 11. It focuses on how the language distinguishes between value-based equality and reference-based identity. 

**Source:** [Microsoft Learn C# 15 language reference and .NET 11 API reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)

# How this group fits the mental model
In C#, equality is type-specific and separate from the value/reference type distinction:
1. **Reference equality** checks if two variables refer to the same object instance (identity), not a physical memory location.
2. **Value equality** checks if two variables contain the same data, regardless of where they live in memory.

The items in this inventory provide the tools to define, compare, and customize these behaviors across different type systems like classes, structs, and records.

# Supplied names explained

### Core Comparison Mechanisms
*   **Reference equality**: Comparing if two references point to the same object instance.
*   **Value equality**: Comparing values under the equality contract chosen by the type or comparer; it need not compare every reachable object recursively.
*   **Object identity comparison**: Checking whether two variables refer to the same object instance; this isn't a comparison of its physical memory address.
*   **Equality operator (==)** / **Inequality operator (!=)**: Operators used to compare values or references; behavior is type-dependent.
*   **Object.Equals(Object?)**: A virtual equality method. The base implementation compares reference identity; value types and many reference types override it to define value equality.
*   **Object.ReferenceEquals(Object?, Object?)**: A static identity check that cannot be overridden. Value-type arguments are boxed when converted to its `object?` parameters, so it is not a value comparison for them.
*   **ValueType.Equals(Object?)** / **ValueType.GetHashCode()**: Base implementations for value types; default `Equals` compares instance fields, but a type can override these methods. Current .NET documentation notes that `ValueType.Equals` throws `NotSupportedException` for `[InlineArray]` types on .NET 9 and later.

### Interfaces and Comparers
*   **IEquatable<T>.Equals(T?)**: An interface for a type to provide strongly typed equality; generic comparers can use it without boxing for value types.
*   **EqualityComparer<T>.Default**: Provides the default comparer for a type, using its equality implementation (including `IEquatable<T>` when applicable) with null handling.
*   **EqualityComparer<T>.Equals(T?, T?)** / **EqualityComparer<T>.GetHashCode(T)**: Methods used by the default comparer to handle nulls and type-specific logic.
*   **Custom IEqualityComparer<T>** / **EqualityComparer<T>.Create**: Mechanisms to define custom equality logic for collections.

### Structural and Collection Equality
*   **Structural equality**: Comparing elements/fields according to a structural comparer rather than just an object's identity. Nested values are compared using the supplied comparer; deep recursive comparison isn't automatic for every collection.
*   **IStructuralEquatable** / **IStructuralComparable**: Interfaces implemented by arrays and tuples to support structural comparison with a comparer.
*   **StructuralComparisons.StructuralEqualityComparer** / **StructuralComparisons.StructuralComparer**: Pre-defined comparers for structural logic.
*   **ITuple** / **ValueTuple.Equals** / **ValueTuple equality operators**: Logic for comparing tuple contents.
*   **SequenceEqual extension method** / **MemoryExtensions.SequenceEqual** / **Span<T>.SequenceEqual**: Methods compare sequence lengths and corresponding elements; equality uses the default comparer or the supplied comparer where an overload exists.
*   **SequenceEqual comparer overload**: Allows passing a custom comparer to sequence comparisons.

### Records and Special Types
*   **Record synthesized equality** / **Record equality contract** / **EqualityContract property**: Records synthesize equality and hash-code members based on their components. Record-class equality accounts for runtime record type; `EqualityContract` is synthesized for record classes and overridden in derived record classes.
*   **Record class equality** / **Record struct equality**: Specific implementations for record types.
*   **Record with-expression copy semantics**: Creates a new record instance with selected values changed. The copy is shallow, so referenced members remain shared unless explicitly replaced.
*   **Anonymous type equality**: Compiler-generated equality for anonymous objects based on property values.
*   **Array reference equality**: Arrays use reference equality for `==` and `Equals` by default, even if their contents are identical; use a sequence or structural comparer when that is the intended policy.

### Contracts and Hazards
*   **Object.GetHashCode()**: Returns an integer hash code. Equal values must have equal hash codes, but hash codes need not be unique and must not be treated as stable identifiers across runs.
*   **Hash code consistency contract**: The rule that objects equal under the chosen equality comparer return the same hash code; changing equality-relevant state while used as a key can break lookup assumptions.
*   **Equal objects same hash code** / **Unequal objects may share hash code**: Fundamental rules for hash-based collections.
*   **Mutable hash key hazard**: Mutating state used by a key's equality/hash implementation can make lookup unreliable after insertion; the behavior depends on the collection's comparer and whether the hash changes.
*   **Dictionary key equality** / **HashSet equality semantics**: How collections use equality to manage unique items.
*   **Null equality behavior** / **NaN equality behavior** / **Floating-point equality** / **Decimal equality** / **String ordinal equality** / **String culture-sensitive equality**: Nullable equality treats two nulls as equal; floating `NaN == NaN` is false while `Double.Equals` treats NaN values as equal; strings compare ordinally by default, with explicit culture-aware APIs for linguistic comparison. Decimal equality compares numeric values.
*   **User-defined operator overload** / **Operator true and false** / **Operator equals overload** / **Operator hash-code consistency**: Customizing how types behave in comparisons.

# Cross-item comparison
*   **`==` vs `Equals`**: `==` is an operator that can be overloaded; `Equals` is a virtual method. For reference types, `==` defaults to reference equality unless overloaded.
*   **`ReferenceEquals` vs `==`**: `ReferenceEquals` cannot be overridden and always checks identity. `==` can be changed by the type author.
*   **`IEquatable<T>` vs `Object.Equals`**: A generic equality comparer can call `IEquatable<T>` without boxing a value type. This can reduce overhead, but performance depends on the call path and implementation.

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
1.  **Mutating a Dictionary Key**: If state used by the comparer changes after insertion, lookup may search a different hash bucket and fail; it isn't guaranteed to be permanently unreachable in every case.
2.  **Assuming `==` works for all types**: Always check if a type (like an array) uses reference equality before using `==`.
3.  **Ignoring `NaN`**: For floating-point values, `NaN == NaN` is false, while `Double.Equals(double.NaN)` returns true; choose the comparison API intentionally.

# Knowledge checks with answers
1.  **Question**: If you have two different array instances with the same elements, does `==` return true?
    *   **Answer**: No. Arrays use reference equality. Use `SequenceEqual` for content comparison.
2.  **Question**: Why should you implement `IEquatable<T>`?
    *   **Answer**: To provide strongly typed equality; generic comparers can use it without boxing value types.
3.  **Question**: What is the "Mutable hash key hazard"?
    *   **Answer**: If key state used by the comparer changes, lookup may search a different bucket and fail. Use stable equality/hash state while an item is stored as a key.
