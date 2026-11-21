
# C# value types reference types copying identity and equality — Reference: Value equality, object identity, hash contracts, and equality customization

# Scope and version
This lesson covers equality contracts, identity, and comparison mechanisms in C# 15 and .NET 11. It focuses on how the language distinguishes between value-based equality and reference-based identity. 

**Sources:** [C# equality operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/equality-operators), [EqualityComparer<T>.Create](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.equalitycomparer-1.create), [C# tuple types and equality](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-tuples)

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
*   **ITuple** / **ValueTuple.Equals** / **C# tuple equality operators**: `ValueTuple.Equals` is a .NET method; tuple-expression `==`/`!=` are C# language operators that compare corresponding tuple elements. Do not assume the underlying `ValueTuple<...>` struct itself declares an `==` operator.
*   **SequenceEqual extension method** / **MemoryExtensions.SequenceEqual** / **Span<T>.SequenceEqual**: Methods compare sequence lengths and corresponding elements; equality uses the default comparer or the supplied comparer where an overload exists.
*   **SequenceEqual comparer overload**: Allows passing a custom comparer to sequence comparisons.

### Equality details and pitfalls
* **Generic code:** use `EqualityComparer<T>.Default` or pass an `IEqualityComparer<T>` when generic algorithms need type-specific equality. `==` may be unavailable for unconstrained `T` or resolve differently by static type.
* **Strings:** `string.Equals` and `==` use ordinal, case-sensitive content equality by default. For user-facing linguistic search or sort, specify an appropriate culture-aware `StringComparison` or `CompareInfo`; culture-aware equality should not be used for machine identifiers.
* **Arrays:** Their ordinary `Equals` and `==` are identity-based. They also implement structural comparison interfaces for explicit use, but that does not change ordinary operators. Jagged-array structural comparisons recurse only as determined by the comparer and nested values' behavior.
* **SequenceEqual:** LINQ `Enumerable.SequenceEqual` enumerates two sequences and compares corresponding elements using `EqualityComparer<T>.Default` or a provided comparer. `MemoryExtensions.SequenceEqual`/`Span<T>.SequenceEqual` compare spans element by element using their API's element semantics; byte-like spans can use optimized implementations. These APIs compare ordered sequences, not unordered set equality.
* **EqualityComparer<T>.Create:** .NET 9+ provides overloads that create a comparer from equality and optional hash-code delegates, or from a key selector and optional key comparer. If the delegate overload omits its hash-code delegate, calls to that comparer’s `GetHashCode` throw `NotSupportedException`; do not use it in hash-based collections without a hash implementation. In either overload, the chosen equality and hash behavior must be coherent.
* **Hash codes:** Equal under the same equality contract implies equal hash codes. The reverse is false. Hashes are not unique identifiers and generally should not be persisted as stable IDs. A mutable key is dangerous only when mutation changes data used by the active comparer while it is stored.
* **ValueType.Equals:** The default implementation compares value-type fields, but its exact algorithm and performance are runtime implementation details; types should implement an explicit equality contract when needed. Current .NET API documentation states it throws for inline-array types on .NET 9+.

### Records and Special Types
*   **Record synthesized equality** / **Record equality contract** / **EqualityContract property**: Records synthesize equality and hash-code members based on their components. Record-class equality accounts for runtime record type; `EqualityContract` is synthesized for record classes and overridden in derived record classes.
*   **Record class equality** / **Record struct equality**: Specific implementations for record types.
*   **Record with-expression copy semantics**: Creates a new record instance with selected values changed. The copy is shallow, so referenced members remain shared unless explicitly replaced. A record `with` expression is not supported for anonymous types.
*   **Anonymous type equality**: Compiler-generated equality for anonymous objects based on property values.
*   **Array reference equality**: Arrays use reference equality for `==` and `Equals` by default, even if their contents are identical; use a sequence or structural comparer when that is the intended policy.

### Contracts and Hazards
*   **Object.GetHashCode()**: Returns an integer hash code. Equal values must have equal hash codes, but hash codes need not be unique and must not be treated as stable identifiers across runs.
*   **Hash code consistency contract**: The rule that objects equal under the chosen equality comparer return the same hash code; unequal objects may collide. A hash code need not remain unchanged if equality-relevant state changes, so mutating such state while used as a key can break lookup assumptions.
*   **Equal objects same hash code** / **Unequal objects may share hash code**: Fundamental rules for hash-based collections.
*   **Mutable hash key hazard**: Mutating state used by a key's equality/hash implementation can make lookup unreliable after insertion; the behavior depends on the collection's comparer and whether the hash changes.
*   **Dictionary key equality** / **HashSet equality semantics**: How collections use equality to manage unique items.
*   **Null equality behavior** / **NaN equality behavior** / **Floating-point equality** / **Decimal equality** / **String ordinal equality** / **String culture-sensitive equality**: Nullable equality treats two nulls as equal; floating `NaN == NaN` is false while `Double.Equals` treats NaN values as equal; strings compare ordinally by default, with explicit culture-aware APIs for linguistic comparison. Decimal equality compares numeric values.
*   **User-defined operator overload** / **Operator true and false** / **Operator equals overload** / **Operator hash-code consistency**: Customizing how types behave in comparisons.

# Cross-item comparison
*   **`==` vs `Equals`**: `==` is an operator that can be overloaded; `Equals` is a virtual method. For reference types, `==` defaults to reference equality unless overloaded.
*   **`ReferenceEquals` vs `==`**: `ReferenceEquals` cannot be overridden and always checks identity. `==` can be changed by the type author.
*   **`IEquatable<T>` vs `Object.Equals`**: `EqualityComparer<T>.Default` honors the type equality contract and uses `IEquatable<T>` where applicable; a value-type implementation may avoid boxing on that path, but performance depends on implementation and call shape.

# Examples
~~~csharp
using System;
using System.Linq;

var p1 = new Point(1, 2);
var p2 = new Point(1, 2);
Console.WriteLine(p1 == p2); // True (synthesized equality)

int[] a1 = { 1, 2 };
int[] a2 = { 1, 2 };
Console.WriteLine(a1 == a2); // False (different references)
Console.WriteLine(a1.SequenceEqual(a2)); // True (element-by-element equality)

record Point(int X, int Y);
~~~

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
