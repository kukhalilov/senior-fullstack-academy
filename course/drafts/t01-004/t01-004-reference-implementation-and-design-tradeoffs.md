<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Reference: Type choice, mutability, identity, generics, and runtime representation cautions

*This is an automatically generated draft.*

# Scope and version
This lesson covers the design tradeoffs, memory representation, and equality semantics for C# types. It is based on C# 15 and .NET 11, as documented in the [Microsoft Learn C# 15 language reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types).

# How this group fits the mental model
In C#, types are categorized by how they are copied and compared. A **value type** variable holds the data directly; assigning it creates a copy. A **reference type** variable holds a pointer to an object; assigning it copies the pointer, meaning multiple variables can point to the same instance. Understanding these mechanics is essential for managing state, avoiding unintended side effects (aliasing), and optimizing performance.

# Supplied names explained

* `Class versus struct design guideline`: Use classes for identity-based objects and structs for small, data-centric values.
* `Struct size and copy cost`: Large structs are expensive to copy; keep them small to maintain performance.
* `Mutable value type hazard`: Modifying a struct copy does not affect the original, which can lead to bugs if the developer expects reference-like behavior.
* `Large struct copying`: Frequent passing of large structs by value degrades performance; consider passing by reference.
* `Ref struct`: A stack-only struct that cannot be boxed or stored in heap-allocated fields.
* `Readonly ref struct`: A `ref struct` that enforces immutability of its fields.
* `InlineArrayAttribute`: Used to define a struct with a fixed-size buffer, often for performance-critical interop.
* `ref struct interface implementation` (C# 13+): a `ref struct` may implement interfaces, but it cannot be boxed or converted to an interface type. It must implement instance members and cannot rely on default interface implementations.
* `Record class versus record struct`: Records provide built-in value-based equality; classes use reference semantics, while structs use value semantics.
* `Record class inheritance`: Supported; allows hierarchical data modeling.
* `Struct inheritance restriction`: Structs cannot inherit from other types (except interfaces).
* `Interface boxing`: A normal value type converted to an interface type is boxed. C# 13 permits ref structs to implement interfaces while preventing boxing and interface conversions.
* `Generic constrained call`: Calling methods on generic types where constraints ensure specific behavior.
* `Constrained virtual call`: A JIT optimization that avoids boxing when calling interface methods on value types.
* `Nullable<T>`: A wrapper that allows a value type to represent `null`.
* `Nullable<T>.HasValue`: Returns `true` if the instance contains a value.
* `Nullable<T>.Value`: Returns the underlying value; throws if `HasValue` is `false`.
* `Nullable<T>.GetValueOrDefault()`: Returns the value or the default for `T`.
* `Nullable<T>.GetValueOrDefault(T)`: Returns the value or a provided default.
* `Nullable.GetUnderlyingType(Type)`: Returns the type argument `T` of a `Nullable<T>`.
* `Nullable<T> lifted operators`: Operators that handle `null` automatically (e.g., `5 + null` results in `null`).
* `Nullable<T> null comparison`: Comparisons where `null` results in `false` (except `==` and `!=`).
* `Nullable<T> equality semantics`: Two `Nullable<T>` are equal if both are null or both have equal values.
* `Null-coalescing operator`: The `??` operator used to provide a default value for `null`.
* `Null-conditional operator`: The `?.` operator used to access members only if the object is not `null`.
* `Identity conversion`: A conversion between identical types.
* `Implicit reference conversion`: Converting a derived class to a base class or interface.
* `Explicit reference conversion`: Casting a base class to a derived class (requires a runtime check).
* `User-defined equality semantics`: Overriding `Equals` or `==` to define custom equality logic.
* `Identity-based entity`: An object where equality is defined by its unique reference.
* `Value object`: An object where equality is defined by its data content.
* `Immutability`: The state of an object that cannot be changed after creation.
* `Copy-on-write design`: A strategy where a copy is only made when a modification is attempted.
* `Aliasing risk`: The danger of multiple references modifying the same shared state.
* `Defensive copy risk`: Unnecessary copying of data, often caused by passing large structs by value.
* `Equality comparer selection`: Choosing between `Equals`, `==`, or `IEqualityComparer<T>`.
* `Equality in generic algorithms`: Using `EqualityComparer<T>.Default` to handle type-agnostic equality.
* `Equality in dictionary lookup`: Relies on `GetHashCode` and `Equals`.
* `Equality in LINQ distinct operations`: Uses equality logic to filter unique elements.
* `Runtime representation versus language guarantee`: The language defines behavior, while the runtime optimizes storage.
* `JIT optimization and local storage`: The Just-In-Time compiler may place variables on the stack or in registers regardless of type.
* `Stack versus heap misconception`: The belief that all value types are on the stack and all reference types are on the heap; this is not a language guarantee.

# Cross-item comparison
* **Value vs. Reference**: Value types copy data; reference types copy pointers.
* **Equality**: `==` often checks identity for classes and value for structs/records.
* **Records**: `Record class` provides reference identity with value-based equality; `Record struct` provides value-based equality with value-type copying.

# Examples
```csharp
// Value type: Copying creates a new independent instance
int a = 10;
int b = a; 
b = 20; // a remains 10

// Reference type: Copying shares the same object
var list1 = new List<int>();
var list2 = list1;
list2.Add(1); // list1 now also contains 1
```
*Note: The above code is unverified.*

# Common mistakes
1. **Assuming stack allocation**: Do not assume a struct is always on the stack; it may be part of a class instance on the heap.
2. **Mutable structs**: Modifying a struct property on a collection element often modifies a temporary copy, not the original.
3. **Ignoring copy costs**: Passing large structs by value in tight loops can significantly impact performance.

# Knowledge checks with answers
1. **Q: Does assigning a struct variable copy the data?**
   A: Yes, value types copy their data upon assignment.
2. **Q: Can a `ref struct` be stored in a class field?**
   A: No, `ref struct` types are restricted to the stack to prevent memory safety issues.
3. **Q: What is the primary difference between `Record class` and `Record struct`?**
   A: `Record class` uses reference semantics for assignment, while `Record struct` uses value semantics.
