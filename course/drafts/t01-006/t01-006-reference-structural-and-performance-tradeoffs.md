<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Reference: Struct restrictions, copying, object identity, and construction choices

*Draft: Automatically generated.*

# Scope and version
This lesson covers structural and performance considerations for C# types, including memory layout, copying behavior, and construction patterns. It is based on C# 15 stable / .NET 11 GA as of 2026-11-14. Source: [https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/structs](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/structs), [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/constructor](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/constructor), and [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/required](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/required).

# How this group fits the mental model
In C#, classes and record classes are reference types; structs and record structs are value types. Assignments copy a reference or copy struct fields respectively, while actual storage placement and optimization depend on context and runtime. Performance decisions should account for allocation, copying, boxing, layout requirements, and measured workload.

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
* `Struct copied on assignment`: Assignment creates a value copy of the struct's fields. Reference fields copy the references, so the copied structs can still refer to the same mutable object.
* `Struct copied on return`: Value semantics apply to returned structs, though the compiler/runtime may optimize physical copies when observable behavior is unchanged.
* `Struct copied as parameter`: A by-value parameter has value semantics; the compiler/runtime may optimize physical copies. `ref`, `in`, and `ref readonly` alter parameter passing and aliasing rules.
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
* `Class object identity`: Reference types can represent distinct object instances, but `==`/`Equals` behavior can be overloaded; reference identity can be tested with `ReferenceEquals`.
* `Class shared mutation`: The risk that multiple references to the same class instance can modify its state.
* `Class allocation`: Creating a class instance uses managed reference semantics; source code shouldn't assume a particular physical allocation when runtime optimizations can remove it.
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
* **Class vs. Struct**: Classes use reference semantics and struct values use value semantics. Assignment copies a reference for a class variable and copies fields for a struct; physical placement isn't the deciding rule.
* **Record class vs. Record struct**: Both provide synthesized value equality. A record class has reference semantics; a record struct has value semantics.
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
* Assuming every large struct copy is physically materialized or automatically slow; measure representative code and use `in`/`ref readonly` only when appropriate for the API.
* Assuming `readonly struct` makes referenced mutable objects immutable; readonly protects the struct's own state, not objects reached through references.

# Knowledge checks with answers
1. **Question**: Why does a `readonly struct` sometimes trigger a defensive copy?
   **Answer**: If a non-readonly member is called on a `readonly` instance, the compiler creates a copy to ensure the original instance remains unchanged.
2. **Question**: What is the primary difference between reference identity and record value equality?
   **Answer**: Reference identity asks whether two references point to the same object; synthesized record equality compares member values using their equality semantics. A record's referenced members aren't recursively deep-compared by default.
3. **Question**: When should you use `Allows ref struct anti-constraint`?
   **Answer**: When you need to pass a `ref struct` into a generic method or type that is designed to handle it safely.
