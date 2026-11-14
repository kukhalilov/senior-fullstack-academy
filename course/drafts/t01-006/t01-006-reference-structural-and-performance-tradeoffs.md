<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Reference: Struct restrictions, copying, object identity, and construction choices

## Scope and version

* **Scope:** This reference lesson explores structural and performance tradeoffs for the specific inventory group: *Struct restrictions, copying, object identity, and construction choices*. It assumes foundational familiarity with C# types and focuses strictly on memory layout, performance costs, structural restrictions, and construction patterns as defined in the provided inventory. It does not cover general inheritance mechanics, general member references, generics constraints, full equality algorithms, or extension members (which belong to other modules).
* **Version:** C# 15 stable / .NET 11 GA checked 2026-11-14; C# 14 changes noted where relevant.
* **Source Reference:** [Microsoft Learn C# classes](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes), [Structs](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/structs), [Records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records), [Constructor](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/constructor), [Required](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/required), [Struct builtin types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct), and [C# 15 what's new](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15). *(Note: This is an automatically generated draft).*

## How this group fits the mental model

In C#, choosing between reference types (classes) and value types (structs) determines whether data is tracked by a shared **object identity** or copied independently by value. When building systems, developers must manage performance, memory layout, and lifetime safety. 

* **Classes** offer shared reference identity and heap allocation, making them ideal for polymorphic hierarchies and mutable shared state, but they introduce garbage collection pressure.
* **Structs** eliminate heap allocation overhead for small, localized values, but they copy data aggressively on assignment, method parameters, and returns. If a struct is mutable, copying hazards can lead to bugs where updates modify temporary copies instead of original data.
* **Ref structs** and advanced memory layout controls (`StructLayoutAttribute`, inline arrays) allow low-level optimization for high-performance scenarios, enforcing strict stack-only safety rules via escape analysis.
* **Constructors and initializers** (`required` members, primary constructors) guarantee that valid state is established upfront without writing redundant boilerplate.

## Supplied names explained

### Memory Layout and Low-Level Attributes
* **Struct layout**: The deterministic rule by which the runtime arranges fields of a struct in memory.
* **StructLayoutAttribute**: An attribute applied to a struct to control the physical layout of its data fields in memory (e.g., sequential, explicit).
* **FieldOffsetAttribute**: An attribute used alongside an explicit layout to specify the exact byte offset of each field, allowing overlapping memory representation (unions).
* **StructLayout.Pack**: A layout parameter specifying the alignment boundary (packing size) for struct fields.
* **StructLayout.Size**: A layout parameter forcing an explicit total size in bytes for a struct.
* **InlineArrayAttribute**: An attribute applied to a struct to declare a fixed-size contiguous sequence of elements inline within the type.
* **Inline array type**: A struct type marked with an inline array attribute, offering stack-efficient buffer representation without heap array allocations.

### Ref Struct and Lifetime Restrictions
* **Ref struct restriction**: Language rules that restrict a struct so that it can only reside on the stack and cannot escape to the heap (cannot be boxed or stored in fields of reference types).
* **Ref struct interface implementation**: Modern support allowing ref structs to implement interfaces under specific compiler-enforced safety constraints.
* **Ref struct as generic type argument**: Passing a ref struct into generic parameters, enabled via anti-constraints.
* **Allows ref struct anti-constraint**: A generic type constraint syntax (`where T : allows ref struct`) permitting ref structs as type arguments.
* **Scoped ref safety context**: Compiler rules using the `scoped` modifier to restrict references from escaping their current method scope.
* **Escape analysis**: The compiler process of tracking variable lifetimes to ensure references and ref structs do not outlive their backing storage.

### Copying, Immutability, and Performance Mechanics
* **Boxing a struct**: The performance cost of wrapping a value type instance into an object reference on the heap.
* **Struct copied on assignment**: The behavior where assigning a struct variable to another copies all its field values entirely.
* **Struct copied on return**: The duplication overhead when a method returns a struct by value.
* **Struct copied as parameter**: The duplication overhead when passing a struct by value into a method argument.
* **Readonly struct defensive copy**: A performance penalty where the compiler emits a defensive copy of a `readonly struct` when calling non-readonly instance methods through interfaces or boxing contexts.
* **Readonly member**: A struct member modifier (`readonly`) guaranteeing that the method does not modify instance state, preventing defensive copies.
* **readonly ref return**: Returning a reference to a memory location while prohibiting modification of the pointed-to value.
* **in parameter defensive copy**: A safety copy created by the runtime when passing an unreadonly struct via an `in` parameter if a non-readonly member might mutate it.
* **Large struct copy cost**: The performance degradation incurred when copying structs that exceed CPU cache line sizes or standard small-size thresholds.
* **Struct size guideline**: The architectural recommendation to keep structs small (typically under 16-32 bytes) to avoid excessive copy overhead.
* **Mutable struct hazard**: Logical bugs and performance pitfalls caused by mutating copies of structs rather than the original data source.
* **Struct containing reference field**: A struct that holds a reference-type field, compounding complexity because value semantics apply to the reference handle, not the heap object.

### Initialization and Object Identity
* **Default struct initialization**: Zero-initializing all fields of a struct via `default` or uninitialized local allocation.
* **Struct field zero initialization**: The automatic runtime behavior ensuring value type fields default to their zero-bit representation.
* **Class object identity**: The distinct runtime identity of a class instance, evaluated via reference equality (`ReferenceEquals`).
* **Class shared mutation**: The condition where multiple variables point to the same class instance, meaning a mutation through one variable affects all references.
* **Class allocation**: The process of instantiating a reference type on the managed heap, subject to garbage collection.
* **Record allocation**: Allocating a record type (which is a class reference type by default unless declared as a record struct).
* **Struct allocation does not imply stack storage**: The fact that a struct embedded inside a class lives on the heap alongside that class, not on the stack.
* **Stack versus heap implementation detail**: The conceptual separation between local stack storage versus managed heap allocation.

### Design Tradeoffs and Equivalents
* **Class versus struct design**: Deciding whether to use a reference type (identity, inheritance) or a value type (value semantics, small size).
* **Class versus record design**: Choosing between a standard class and a data-centric record type with value-based equality.
* **Struct versus record struct**: Choosing between a standard struct and a record struct for value-oriented data with synthesized formatting and equality.
* **Reference equality versus record equality**: Contrasting reference identity checks (`==` on classes compares references) with structural equality (`==` on records compares data contents).
* **Shallow immutability**: Immutability that locks the top-level references or fields of an object, but allows inner reference-type objects to be mutated.
* **Deep immutability**: Complete immutability where all nested objects and referenced data are also immutable.
* **Primary constructor versus property declaration**: Using primary constructor parameters directly to initialize state versus declaring explicit mutable properties.
* **Required member versus constructor parameter**: Using the `required` modifier on properties to enforce initialization during object initializers instead of relying solely on explicit constructor overloads.
* **Constructor validation**: Executing guard clauses and validation logic inside a constructor or property setter to reject invalid states.
* **Factory method versus constructor**: Using static factory methods instead of public constructors to control object creation, naming, or caching.

## Cross-item comparison

* **Class versus Struct:** Classes possess object identity and live on the heap, supporting inheritance and shared mutation. Structs are value types copied by assignment, have value semantics, and avoid heap allocation when stored locally.
* **Mutable struct versus Readonly struct:** Mutable structs allow in-place modification but introduce hazards where copies are modified instead of sources. Readonly structs enforce immutability across all fields, protecting against bugs but risking defensive copies if mixed with legacy interface calls unless `readonly` members are used.
* **Primary constructor versus Traditional constructor:** Traditional constructors execute custom bodies and validations explicitly. Primary constructors capture parameters directly into the type scope, reducing boilerplate while cooperating with field/property initializers.
* **Required member versus Constructor parameter:** Constructor parameters mandate arguments at creation time via method signatures. Required members allow flexible object initializer syntax (`new Point { X = 1, Y = 2 }`) while forcing callers to supply mandatory fields.

## Examples

### Unverified Code Example: Struct Copying and Readonly Members
```csharp
// Unverified example illustrating struct copying hazards and readonly performance
public readonly struct Point
{
    public int X { get; init; }
    public int Y { get; init; }

    // Readonly member prevents defensive copies when called
    public readonly double Magnitude => Math.Sqrt(X * X + Y * Y);
}

public class ExampleRunner
{
    public void Run()
    {
        Point p1 = new Point { X = 3, Y = 4 };
        Point p2 = p1; // Struct copied on assignment
        
        // p2 is an independent copy; modifying or inspecting does not affect p1's identity concept
    }
}
```

### Unverified Code Example: Required Members and Object Initializers
```csharp
// Unverified example illustrating required members for validation without heavy constructor overloads
public class UserAccount
{
    public required string Username { get; init; }
    public required string Email { get; init; }
    public int LoginCount { get; set; } = 0;
}

public class InitializationDemo
{
    public void CreateUser()
    {
        // Compiles successfully because required members are provided
        var user = new UserAccount { Username = "Alice", Email = "alice@example.com" };
    }
}
```

## Common mistakes

* **Treating structs like classes:** Assuming structs are passed by reference by default. Modifying a struct passed as a method parameter without an explicit `ref` or `out` modifier alters only a local copy.
* **Creating large structs:** Violating the struct size guideline by making structs large (e.g., hundreds of bytes), which degrades performance due to excessive copying overhead on method calls and assignments.
* **Mutable struct hazards:** Modifying properties on a struct retrieved from a collection indexer (`list[0].X = 5;`) without realizing the indexer returned a copy, resulting in silent code failure where the collection remains unchanged.
* **Overlooking defensive copies:** Calling interface methods on a `readonly struct` without marking the method as a `readonly member`, forcing the runtime to execute a costly defensive copy.

## Knowledge checks with answers

1. **Question:** Does storing a struct variable inside a class instance guarantee that the struct is allocated on the stack?
   * **Answer:** No. Struct allocation does not imply stack storage; when a struct is a field of a class instance, it lives on the managed heap inside that class object.
2. **Question:** What is the primary performance hazard of passing a large struct by value to a method?
   * **Answer:** Large struct copy cost; the CPU must duplicate every byte of the struct onto the call stack, which degrades execution performance.
3. **Question:** How do `required` members alter initialization compared to traditional constructors?
   * **Answer:** Required members allow callers to use clean object initializer syntax (`new Type { Prop = val }`) while forcing the compiler to verify that mandatory properties are supplied, reducing the need for multiple verbose constructor overloads.
4. **Question:** Why might a `readonly struct` trigger a defensive copy?
   * **Answer:** If a `readonly struct` instance is cast to an interface and a method not explicitly marked as a `readonly member` is invoked, the compiler emits a defensive copy to protect against potential mutation.
