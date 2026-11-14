<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Reference: Type choice, mutability, identity, generics, and runtime representation cautions

*Automatically generated draft.*

## Scope and version

This reference lesson covers the C# implementation and design tradeoffs for types, mutability, identity, generics, and runtime representation cautions as specified in the C# 15 stable and .NET 11 GA release (checked 2026-11-14). 

The scope is strictly limited to the architecture, behavior, and rules of value types versus reference types, memory representation, and equality/copying mechanics. Excluded from this lesson are nullable annotation designs (t01-005), member inventories for classes, structs, and records (t01-006), generic and delegate variance (t01-009, t01-010), LINQ sequence operators (t01-015), and domain-driven value-object design patterns.

Source references:
- [Microsoft Learn C# Types Specification](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)
- [Microsoft Learn C# Value Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types)
- [Microsoft Learn C# Reference Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types)
- [Microsoft Learn Equality Comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons)
- [Microsoft Learn Records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records)
- [Microsoft Learn EqualityComparer<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.equalitycomparer-1)
- [Microsoft Learn C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)
- [Microsoft Learn .NET 11 Overview](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/overview)

---

## How this group fits the mental model

When writing code in C#, you must decide how data is structured, copied, and compared. 

1. **Language Semantics vs. Storage Location:** A value-type variable holds its own data directly, whereas a reference-type variable holds a memory address pointing to data stored elsewhere. However, this is a semantic language rule rather than a physical guarantee that a value type always lives on the stack or a reference type always lives on the heap.
2. **Mutability and Aliasing:** Changing a shared reference-type instance affects all variables pointing to that instance (aliasing), whereas assigning or passing a value type copies the data (unless passed by reference using keywords like `ref` or `in`).
3. **Identity vs. Value:** Classes represent entities defined by a unique reference identity, whereas structs or records often represent interchangeable values defined entirely by their data content.

---

## Supplied names explained

* **Class versus struct design guideline:** Rules for deciding whether a type should be a reference type (`class`) based on identity and inheritance, or a value type (`struct`) based on small size and value semantics.
* **Struct size and copy cost:** The performance overhead incurred when copying large value types during method calls or assignments.
* **Mutable value type hazard:** The subtle bugs that occur when a struct can be modified in place, leading to unexpected behaviors with temporary copies or defensive copying.
* **Large struct copying:** Performance degradation caused by copying bulky value types repeatedly.
* **Ref struct:** A specialized struct that must reside on the stack and cannot be boxed, placed on the heap, or captured in async/lambda closures.
* **Readonly ref struct:** A combination of a `ref struct` and `readonly` semantics, ensuring complete immutability for stack-only types.
* **InlineArrayAttribute:** An attribute used to declare fixed-size contiguous inline arrays within structs for low-allocation high-performance code.
* **ref struct interface implementation:** Rules permitting `ref struct` types to implement interfaces under specific language and runtime constraints.
* **Record class versus record struct:** Comparing reference-type records (value-based equality, reference semantics) with value-type records (value-based equality, value semantics).
* **Record class inheritance:** The mechanism allowing `record class` types to inherit from other `record class` types while preserving value equality.
* **Struct inheritance restriction:** The language rule prohibiting structs from inheriting from other structs or classes (other than implementing interfaces).
* **Interface boxing:** The performance penalty incurred when a value type is cast to an interface type, forcing allocation on the heap.
* **Generic constrained call:** Method invocation utilizing generic type constraints to prevent boxing and enable efficient type-safe operations.
* **Constrained virtual call:** A specialized JIT optimization that calls methods on value types directly without boxing when invoked through an interface or generic constraint.
* **Nullable<T>:** A struct (`System.Nullable<T>`) that wraps a value type to add `null` capability.
* **Nullable<T>.HasValue:** A boolean property indicating whether a `Nullable<T>` instance contains a valid value.
* **Nullable<T>.Value:** A property that extracts the underlying value from a `Nullable<T>`, throwing an exception if empty.
* **Nullable<T>.GetValueOrDefault():** Returns the stored value or the default value of type `T` if unassigned.
* **Nullable<T>.GetValueOrDefault(T):** Returns the stored value or a specified fallback value if unassigned.
* **Nullable<T>.GetUnderlyingType(Type):** A method instance or reflection helper pattern related to nullable types.
* **Nullable.GetUnderlyingType(Type):** A static method returning the underlying type argument `T` of a specified nullable type.
* **Nullable<T> lifted operators:** Operators automatically extended by the compiler to handle nullable operands (returning null if any operand is null).
* **Nullable<T> null comparison:** Semantics governing how comparison operators behave when one or both operands are null.
* **Nullable<T> equality semantics:** How `Nullable<T>` instances compare based on their `HasValue` state and inner value.
* **Null-coalescing operator:** The `??` operator used to supply a default fallback value when an expression evaluates to null.
* **Null-conditional operator:** The `?.` operator used to safely access members or invoke methods only if an object is not null.
* **Identity conversion:** A conversion from a type to itself or a derived type where no data changes occur.
* **Implicit reference conversion:** A safe conversion from a derived reference type to a base reference type or interface.
* **Explicit reference conversion:** A downcast conversion from a base reference type to a derived reference type that requires a cast expression and runs a runtime check.
* **User-defined equality semantics:** Custom implementations of equality operators, `Equals()`, and `GetHashCode()`.
* **Identity-based entity:** An object whose equality and uniqueness are determined by a unique reference identity rather than property values.
* **Value object:** An immutable object whose equality is determined purely by its data values.
* **Immutability:** The design state where an object's internal state cannot change after construction.
* **Copy-on-write design:** A strategy where data is duplicated only when a modification is requested.
* **Aliasing risk:** The danger of multiple references pointing to the same mutable object where an update in one place unintendedly affects another.
* **Defensive copy risk:** Performance overhead introduced when the runtime or compiler forces a copy of a struct to preserve readonly safety guarantees.
* **Equality comparer selection:** Choosing the right mechanism to compare items (e.g., structural vs. reference).
* **Equality in generic algorithms:** Ensuring generic methods correctly handle equality for unknown type parameters (often requiring constraints or `IEquatable<T>`).
* **Equality in dictionary lookup:** Correct usage of `GetHashCode` and `Equals` to prevent bucket collisions and lookup failures in hash-based collections.
* **Equality in LINQ distinct operations:** Relying on proper equality comparison contracts to filter unique items correctly.
* **Runtime representation versus language guarantee:** The distinction between what the C# specification guarantees semantically versus how the JIT compiler and CLR represent types in memory.
* **JIT optimization and local storage:** How the Just-In-Time compiler optimizes variable placement in registers or stack frames.
* **Stack versus heap misconception:** The false belief that value types *always* live on the stack and reference types *always* live on the heap.

---

## Cross-item comparison

| Category A | Category B | Key Distinction |
| :--- | :--- | :--- |
| **Class versus struct design guideline** | **Struct size and copy cost** | Classes manage identity and large/shared state; structs manage small values but risk high copy overhead if oversized. |
| **Record class** | **Record struct** | Record classes use reference copying with value-based equality; record structs use value copying with value-based equality. |
| **Identity-based entity** | **Value object** | Entities are tracked by unique identifiers regardless of field changes; value objects are defined completely by their properties and are typically immutable. |
| **Implicit reference conversion** | **Explicit reference conversion** | Implicit conversions are completely safe and performed automatically; explicit downcasts require runtime type checks and can fail. |

---

## Examples

> **Note:** Unverified code example (pseudocode/demonstration model).

```csharp
// Unverified example illustrating Nullable<T> and Null-coalescing behavior
using System;

public class Program
{
    public static void Main()
    {
        // Nullable<T> initialization
        int? score = null;
        
        // Nullable<T>.HasValue and Nullable<T>.Value
        if (score.HasValue)
        {
            Console.WriteLine(score.Value);
        }
        else
        {
            // Null-coalescing operator fallback
            int finalScore = score ?? 50; 
            Console.WriteLine(finalScore); // Outputs 50
        }

        // Null-conditional operator usage
        string text = null;
        int? length = text?.Length; // Evaluates to null safely without NullReferenceException
        Console.WriteLine(length.GetValueOrDefault(-1)); // Outputs -1
    }
}
```

---

## Common mistakes

1. **Assuming all structs are on the stack:** Believing that declaring a `struct` guarantees it will never be allocated on the heap (ignoring boxing, closure capture, or fields inside classes).
2. **Creating large mutable structs:** Designing structs with many fields that are mutable, leading to subtle bugs due to defensive copying and performance degradation from excessive copying.
3. **Ignoring equality contract rules:** Overriding `Equals` without overriding `GetHashCode`, which breaks collections like `Dictionary<TKey, TValue>` and LINQ distinct operations.
4. **Confusing reference equality with value equality:** Using `==` on class instances expecting structural comparison when it performs reference comparison (unless overloaded or using records).

---

## Knowledge checks with answers

1. **Question:** What is the primary performance hazard of designing a large mutable struct?
   * **Answer:** Frequent copying during method parameters and assignments can severely degrade performance, and mutable semantics combined with defensive copies can produce confusing, unpredictable bugs.
2. **Question:** Why can a `ref struct` never be boxed?
   * **Answer:** A `ref struct` is restricted to stack storage to guarantee memory safety for references pointing to stack-allocated variables or native buffers; boxing would move it to the heap.
3. **Question:** What does the static method `Nullable.GetUnderlyingType(Type)` return if you pass a non-nullable type like `int`?
   * **Answer:** It returns `null`.
