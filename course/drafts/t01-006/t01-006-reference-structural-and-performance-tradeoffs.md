<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Reference: Struct restrictions, copying, object identity, and construction choices

*Draft: Automatically generated.*

# Scope and version
This lesson covers structural and performance considerations for C# types, including memory layout, copying behavior, and construction patterns. It is based on C# 15 stable / .NET 11 GA as of 2026-11-14. Source: [https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/structs](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/structs), [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/constructor](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/constructor), and [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/required](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/required).

# How this group fits the mental model
In C#, types are either reference types (classes, record classes) or value types (structs, record structs). Classes provide identity and heap allocation, while structs provide value semantics and local storage. Performance tuning involves managing how these types are laid out in memory, how they are copied, and how they are initialized.

# Supplied names explained

* `Struct layout`: The arrangement of fields within a struct in memory.
* `StructLayoutAttribute`: An attribute used to control the physical layout of data fields in a struct.
* `FieldOffsetAttribute`: Used with `StructLayoutAttribute` to specify the exact position of a field.
* `StructLayout.Pack`: Specifies the alignment of fields within the struct.
* `StructLayout.Size`: Explicitly sets the total size of the struct.
* `InlineArrayAttribute`: Marks a struct as an inline array, allowing a fixed-size buffer of elements.
* `Inline array type`: A struct that acts as a contiguous block of memory for a fixed number of elements.
* `Ref struct restriction`: Rules preventing `ref struct` types from being stored on the heap or escaping their scope.
* `Ref struct interface implementation`: The capability for `ref struct` to implement interfaces, subject to safety constraints.
* `Ref struct as generic type argument`: The ability to use `ref struct` as a type parameter when the `Allows ref struct anti-constraint` is present.
* `Allows ref struct anti-constraint`: The `allows ref struct` syntax that permits `ref struct` types to be used with generic types.
* `Scoped ref safety context`: The rules governing the lifetime of references to ensure they do not outlive the data they point to.
* `Escape analysis`: The compiler process of determining if a reference or value can safely exist outside its current scope.
* `Boxing a struct`: The process of wrapping a value type in an object on the heap.
* `Struct copied on assignment`: The default behavior where assigning one struct to another creates a bitwise copy.
* `Struct copied on return`: The behavior where a struct returned from a method is copied to the caller.
* `Struct copied as parameter`: The behavior where a struct passed to a method is copied into the parameter.
* `Readonly struct defensive copy`: A copy created by the compiler to prevent mutation of a `readonly struct` when calling non-readonly members.
* `Readonly member`: A member that does not modify the state of the struct.
* `readonly ref return`: A method return that provides a read-only reference to a value.
* `in parameter defensive copy`: A copy made when an `in` parameter is passed to a member that is not `readonly`.
* `Large struct copy cost`: The performance impact of copying large structs frequently.
* `Struct size guideline`: Best practices suggesting small sizes for structs to minimize copy overhead.
* `Mutable struct hazard`: The risk of unexpected behavior when modifying fields of a struct stored in a read-only context.
* `Struct containing reference field`: A struct that holds a reference type, which complicates copying and lifetime management.
* `Default struct initialization`: The process where all fields are set to their default values (e.g., 0, null).
* `Struct field zero initialization`: The guarantee that fields are initialized to zero bits by default.
* `Class object identity`: The concept that two class instances are distinct even if their data is identical.
* `Class shared mutation`: The risk that multiple references to the same class instance can modify its state.
* `Class allocation`: The process of creating an instance on the managed heap.
* `Record allocation`: The process of creating a record instance, which follows reference or value semantics based on the declaration.
* `Struct allocation does not imply stack storage`: A reminder that structs can be stored on the heap (e.g., inside a class).
* `Stack versus heap implementation detail`: The distinction between where data resides, which is often managed by the runtime.
* `Class versus struct design`: The decision process based on identity, size, and mutability requirements.
* `Class versus record design`: Choosing between standard classes and records for data-centric types.
* `Struct versus record struct`: Choosing between standard structs and record structs for value-based data.
* `Reference equality versus record equality`: Comparing identity (classes) versus value-based equality (records).
* `Shallow immutability`: Immutability that does not extend to the objects referenced by a type.
* `Deep immutability`: A state where all referenced data is also immutable.
* `Primary constructor versus property declaration`: Using parameters in the type declaration versus explicit property definitions.
* `Required member versus constructor parameter`: Using `required` properties to enforce initialization versus constructor arguments.
* `Constructor validation`: Logic within a constructor to ensure the object is in a valid state.
* `Factory method versus constructor`: Using static methods to control instance creation instead of direct construction.

# Cross-item comparison
* **Class vs. Struct**: Classes use reference semantics and heap allocation; structs use value semantics and are copied on assignment.
* **Record class vs. Record struct**: Record classes provide reference-based equality with value-like syntax; record structs provide value-based equality and value semantics.
* **Required member vs. Constructor parameter**: `required` members force the caller to set properties during initialization, whereas constructor parameters force values at the moment of creation.

# Examples
```csharp
// Struct initialization and copying
struct Point { public int X, Y; }

Point p1 = new Point { X = 1, Y = 2 };
Point p2 = p1; // Struct copied on assignment
p2.X = 10;     // p1.X remains 1
```

# Common mistakes
* Assuming a struct is always on the stack; it is stored wherever its container is stored.
* Creating large structs, which leads to performance degradation due to frequent copying.
* Modifying a `readonly struct` or `in` parameter, which triggers defensive copies and hurts performance.

# Knowledge checks with answers
1. **Question**: Why does a `readonly struct` sometimes trigger a defensive copy?
   **Answer**: If a non-readonly member is called on a `readonly` instance, the compiler creates a copy to ensure the original instance remains unchanged.
2. **Question**: What is the primary difference between `Class object identity` and `Reference equality versus record equality`?
   **Answer**: Class identity relies on the memory address, while record equality compares the values of the properties.
3. **Question**: When should you use `Allows ref struct anti-constraint`?
   **Answer**: When you need to pass a `ref struct` into a generic method or type that is designed to handle it safely.
