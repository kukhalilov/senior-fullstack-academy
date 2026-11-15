<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Reference: Type choice, mutability, identity, generics, and runtime representation cautions

# Scope and version

* **Edition:** C# 15 stable and .NET 11 GA checked 2026-11-14 (Authority: Microsoft Learn C# 15 language reference and .NET 11 API reference) [1].
* **Scope:** This reference lesson explains the type choice, mutability, identity, generics, and runtime representation cautions inventory group for C# value types, reference types, copying, identity, and equality.
* **Scope Exclusions:** Nullable value and reference type annotation design is taught in t01-005; class, struct, record, and constructor member inventories are taught in t01-006; generic type variance and delegate variance are taught in t01-009 and t01-010; LINQ sequence operators are taught in t01-015; and domain-driven value-object modeling is addressed in the architecture track.
* **Status Notice:** Automatically generated draft.

# How this group fits the mental model

Understanding how C# handles data requires looking at two foundational ideas: language semantics (how variables are copied and compared) and runtime representation (how memory is allocated). A value-type variable contains its value directly, meaning assignment copies the underlying data. A reference-type variable contains a reference pointing to an object in memory, meaning assignment copies the reference rather than the data, causing multiple variables to point to the exact same object.

Equality is a separate design concept from copying. Determining whether two items are equal depends on whether you care about their structural contents (value equality) or whether they point to the exact same physical instance in memory (object identity). Mutability makes aliasing visible: mutating a shared object affects every reference pointing to it, whereas mutating a local copy of a value type leaves original variables untouched. However, a struct can still contain references to shared mutable objects, introducing hidden aliasing risks.

# Supplied names explained

Below are the exact items from the implementation and design tradeoffs inventory group. Each entry describes the item's role in the broader concepts of C# type design, copying, and equality.

* `Class versus struct design guideline`
  A foundational rule for choosing between reference types (`class`) and value types (`struct`). Choose value types for small, lightweight types with value semantics, and reference types for types requiring object identity, inheritance, or shared mutable state.
* `Struct size and copy cost`
  The performance consideration that assigning or passing large structs copies all of their data by value. Copying excessively large structs can degrade performance compared to passing a reference type.
* `Mutable value type hazard`
  The unexpected behavior that occurs when a value type is modified after being copied implicitly (such as during method calls or property access), leading to mutations operating on temporary defensive copies rather than the intended source variable.
* `Large struct copying`
  The overhead incurred when moving or passing large value types. Mitigation strategies often involve passing structs by reference using `in`, `ref`, or `ref struct` features.
* `Ref struct`
  A specialized struct restricted to stack-only allocation, preventing it from escaping to the heap (such as inside lambdas or async state machines) to ensure memory safety for low-level performance types like `Span<T>`.
* `Readonly ref struct`
  A ref struct marked as readonly, guaranteeing that its state cannot be modified, which helps the runtime optimize memory access and prevents unintended mutations.
* `InlineArrayAttribute`
  An attribute applied to structs to declare a fixed-size contiguous inline array of elements, enabling high-performance buffer layouts without heap allocation.
* `ref struct interface implementation`
  The capability enabling `ref struct` types to implement interfaces, supporting generic constraints and high-performance patterns under structural restrictions.
* `Record class versus record struct`
  The architectural choice between a reference-type record (which provides reference semantics with value-based equality and built-in formatting) and a value-type record (which provides value semantics with value-based copying and equality).
* `Record class inheritance`
  The mechanism allowing record classes to derive from other record classes, preserving value-equality behaviors across inheritance hierarchies.
* `Struct inheritance restriction`
  The language rule stating that structs cannot inherit from other structs (except for implementing interfaces), which preserves flat layout rules and prevents deep layout hierarchies for value types.
* `Interface boxing`
  The performance penalty that occurs when a value type is cast to an interface type, causing the runtime to allocate an object on the heap to wrap the value.
* `Generic constrained call`
  A method invocation on a generic type parameter restricted by constraints, allowing the JIT compiler to optimize method dispatch and avoid boxing.
* `Constrained virtual call`
  A virtual method invocation on a value type constrained by a generic parameter type, enabling direct method calls without boxing the value type.
* `Nullable<T>`
  The core value type structure (`System.Nullable<T>`) that wraps any underlying value type to represent an unassigned or missing state (`null`).
* `Nullable<T>.HasValue`
  A boolean property indicating whether the `Nullable<T>` instance contains a valid underlying value (`true`) or is null (`false`).
* `Nullable<T>.Value`
  A property returning the underlying value of type `T` if `HasValue` is true, or throwing an `InvalidOperationException` if the instance is null.
* `Nullable<T>.GetValueOrDefault()`
  A method returning the stored value if present, or returning the default value of type `T` (`default(T)`) if the instance is null.
* `Nullable<T>.GetValueOrDefault(T)`
  A method returning the stored value if present, or returning the user-provided fallback parameter value if the instance is null.
* `Nullable<T>.GetUnderlyingType(Type)`
  An API method used to retrieve the underlying type argument `T` from a constructed `Nullable<T>` type representation.
* `Nullable.GetUnderlyingType(Type)`
  A static helper method on the `System.Nullable` class that returns the underlying type argument if the specified type is a nullable value type, or `null` otherwise.
* `Nullable<T> lifted operators`
  Operators automatically generated by the language for `Nullable<T>` operands, allowing arithmetic and comparison operations to propagate `null` if any operand is null.
* `Nullable<T> null comparison`
  The evaluation rules governing how nullable value types compare against `null` using equality and relational operators.
* `Nullable<T> equality semantics`
  The rules defining how two `Nullable<T>` instances are compared: if both are null, they are equal; if one is null and the other is not, they are unequal; otherwise, their underlying values are compared.
* `Null-coalescing operator`
  The binary operator (`??`) used to return the left-hand operand if it is not null, or evaluate and return the right-hand operand otherwise.
* `Null-conditional operator`
  The operator (`?.` or `?[`) used to perform member access or element indexing only if the receiver is not null, short-circuiting and evaluating to `null` otherwise.
* `Identity conversion`
  A built-in conversion from a type to itself, which always succeeds without altering data or representation.
* `Implicit reference conversion`
  A safe, compiler-approved conversion from a reference type to a base type or implemented interface, requiring no explicit cast syntax.
* `Explicit reference conversion`
  A conversion from a base reference type to a derived reference type that requires an explicit cast syntax and throws an exception at runtime if the actual object instance is incompatible.
* `User-defined equality semantics`
  Custom equality logic implemented by overriding `Equals()` and `GetHashCode()` or implementing `IEquatable<T>` to define what makes two instances equal.
* `Identity-based entity`
  A domain model concept where objects are distinguished by a unique identifier or reference identity rather than their attribute values.
* `Value object`
  An object defined entirely by its data attributes rather than a unique identifier, where two instances with identical attributes are considered equal.
* `Immutability`
  A design characteristic ensuring an object's state cannot be modified after construction, preventing accidental mutations and simplifying concurrent or shared usage.
* `Copy-on-write design`
  An optimization pattern where data is shared by reference until a mutation is requested, at which point a private copy is made to preserve isolation.
* `Aliasing risk`
  The danger that multiple variables point to the same mutable object structure, causing modifications through one reference to unexpectedly alter data accessed via another reference.
* `Defensive copy risk`
  The performance overhead incurred when the runtime or compiler generates copies of read-only value types to prevent potential mutations.
* `Equality comparer selection`
  The process of choosing the appropriate comparison mechanism (such as `EqualityComparer<T>.Default`) for collections, lookups, and generic algorithms.
* `Equality in generic algorithms`
  The practice of handling equality safely within generic code where operators like `==` may not be available without explicit type constraints.
* `Equality in dictionary lookup`
  The mechanism by which hash-based collections (`Dictionary<TKey, TValue>`) use `GetHashCode()` and `Equals()` to locate keys efficiently.
* `Equality in LINQ distinct operations`
  The reliance of filtering and grouping operators (such as `Distinct()`) on equality comparers to remove duplicate elements from sequences.
* `Runtime representation versus language guarantee`
  The distinction between abstract language rules (such as value copying) and actual runtime optimizations (such as JIT register allocation or inlining) that bypass physical memory copying.
* `JIT optimization and local storage`
  The Just-In-Time compiler's ability to promote variables, fields, and unboxed value types into CPU registers or optimized stack locations.
* `Stack versus heap misconception`
  The persistent myth that value types *always* live on the stack and reference types *always* live on the heap; in reality, storage location is determined by runtime context, boxing, closures, and optimization.

# Cross-item comparison

To understand how these concepts interact, consider the following comparisons drawn from the inventory:

* **Value Type vs. Reference Type:** Value types contain data directly and use value copying; reference types contain references and use reference copying.
* **Equality vs. Identity:** Value equality checks if two items hold equivalent data (common for `Value object` types), whereas object identity checks if two references point to the exact same physical instance (`Identity-based entity`).
* **Immutability vs. Mutability:** `Immutability` eliminates `Aliasing risk` and `Mutable value type hazard`, whereas mutable structures require careful handling of shared state and defensive copying.
* **Records (`Record class` vs. `Record struct`):** Record classes combine reference semantics with built-in value-based equality and formatting, whereas record structs provide value semantics combined with value-based equality.

# Examples

The following unverified code example demonstrates value type copying versus reference type copying, along with nullable handling.

```csharp
// Unverified code example (Illustrative pseudocode representation)
using System;

public class Program
{
    public static void Main()
    {
        // Value type copying: pointB is an independent copy
        Point pointA = new Point(1, 2);
        Point pointB = pointA;
        pointB.X = 10;
        
        Console.WriteLine(pointA.X); // Output: 1
        Console.WriteLine(pointB.X); // Output: 10

        // Reference type copying: refB points to the same object instance
        Box boxA = new Box { Value = 5 };
        Box boxB = boxA;
        boxB.Value = 20;

        Console.WriteLine(boxA.Value); // Output: 20
        Console.WriteLine(boxB.Value); // Output: 20

        // Nullable handling
        int? nullableInt = null;
        int safeValue = nullableInt.GetValueOrDefault(42);
        Console.WriteLine(safeValue); // Output: 42
    }
}

public struct Point
{
    public int X;
    public int Y;
    public Point(int x, int y) { X = x; Y = y; }
}

public class Box
{
    public int Value { get; set; }
}
```

* **Step-by-step behavior:**
  1. `pointA` is initialized with coordinates `(1, 2)`.
  2. Assigning `pointB = pointA` copies the struct value. Modifying `pointB.X` leaves `pointA.X` untouched.
  3. `boxA` is created on the heap with `Value = 5`. Assigning `boxB = boxA` copies the reference. Modifying `boxB.Value` affects `boxA.Value` because both variables point to the same object instance.
  4. `nullableInt` is assigned `null`. Calling `GetValueOrDefault(42)` utilizes `Nullable<T>.GetValueOrDefault(T)` to safely fall back to `42`.

# Common mistakes

* **Assuming value types always live on the stack:** A value type field inside a reference type object lives on the heap, and captured variables in lambdas may be hoisted. Storage location is an optimization detail, not a language guarantee ("Stack versus heap misconception").
* **Ignoring mutable value type hazards:** Modifying a struct property accessed via a method return or unboxing operation often updates a temporary copy rather than the original source variable.
* **Confusing reference equality with value equality:** Using reference equality (`ReferenceEquals`) on types that expect structural value comparison leads to bugs when comparing distinct instances with identical data.
* **Overlooking large struct copy costs:** Passing large structs by value to many methods introduces performance overhead that can be avoided with `in` or `ref` modifiers.

# Knowledge checks with answers

1. **Question:** What happens to the original variable when you assign a value-type variable to a second variable and then modify the second variable?
   * **Answer:** Nothing happens to the original variable. Value types copy their data upon assignment, so the two variables operate on independent copies.

2. **Question:** True or False: Reference types always allocate memory on the heap, and value types always allocate memory on the stack.
   * **Answer:** False. Storage location depends on runtime context, boxing, closures, and JIT optimizations rather than a rigid stack-versus-heap rule.

3. **Question:** What does `Nullable<T>.GetValueOrDefault(T)` return if the underlying `HasValue` property is `false`?
   * **Answer:** It returns the user-provided fallback value passed as the argument to the method.

4. **Question:** Why does mutability present a hazard when applied to value types?
   * **Answer:** Because implicit copying (such as passing a struct to a method or property accessor) can cause mutations to apply to a temporary copy, leaving the original variable unchanged and causing subtle bugs.

# References

* [Microsoft Learn C# 15 language reference and .NET 11 API reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types) [1]
* [Microsoft Learn Built-in value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types) [1]
* [Microsoft Learn Built-in reference types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types) [1]
* [Microsoft Learn Equality comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons) [1]
* [Microsoft Learn Records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records) [1]
* [Microsoft Learn EqualityComparer<T> Class](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.equalitycomparer-1) [1]
* [Microsoft Learn What's new in C# 15](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15) [1]
* [Microsoft Learn .NET 11 overview](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/overview) [1]
