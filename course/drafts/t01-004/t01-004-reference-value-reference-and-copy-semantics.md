<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Reference: Language categories, assignment, parameter passing, boxing, and aliasing

## Scope and version

* **Scope**: This reference lesson covers the language categories, assignment rules, parameter passing modalities, boxing mechanics, aliasing behavior, and copying patterns for C# types. 
* **Scope Exclusions**: Nullable type annotation design (`t01-005`), class/struct/record member inventories (`t01-006`), generic and delegate variance (`t01-009`, `t01-010`), LINQ operators (`t01-015`), and domain-driven value-object modeling are out of scope.
* **Version**: C# 15 stable and .NET 11 GA (checked November 14, 2026). Under C# 15, features such as union types build on type and pattern foundations, and memory safety remains a preview feature [1].

## How this group fits the mental model

In C#, every variable or expression possesses a type that dictates how its data is stored, copied, and compared. 

* **Value types vs. Reference types**: A **Value type** variable directly contains its data. Assigning or passing it performs a **Value copy**. A **Reference type** variable contains an **Object reference** (a pointer/handle) pointing to data allocated on the **Managed heap**. Copying a reference variable copies the reference itself, creating an **Alias** where two variables point to the exact same object.
* **Storage and Optimization**: This distinction defines *language semantics*, not a strict hardware guarantee that every value lives on the stack or every object on the heap. Implementation choices like **Stack allocation (implementation choice)** or heap placement depend on context, optimization, and mechanisms like **Boxing conversion**.
* **Mutability and Identity**: Mutability makes **Object identity** and sharing visible. If a struct contains a reference type, mutating through an **Alias** can yield unexpected side effects unless managed via patterns like **Defensive copy** or **Readonly struct**.

## Supplied names explained

The following definitions form the complete allowed inventory for this reference group:

* **Value type**: A type whose variables directly contain their values (e.g., numeric types, structs).
* **Reference type**: A type whose variables store references to data instances rather than the data itself.
* **Variable value**: The actual data stored inside a value-type variable location.
* **Object reference**: The handle or pointer value stored in a reference-type variable pointing to a heap-allocated instance.
* **Value copy**: Duplicating the underlying data bytes when assigning or passing a value type.
* **Reference copy**: Duplicating only the memory address (reference) pointing to an object, leaving the underlying object uncopied.
* **Assignment conversion**: Implicit or explicit type conversions applied when assigning a value to a variable of a compatible target type.
* **Value parameter passing**: Passing a copy of a argument's value into a method parameter by default.
* **Reference parameter passing**: Passing an argument by reference so the method can modify the caller's variable location.
* **ref parameter**: A parameter modifier (`ref`) requiring the argument to be initialized before passing, enabling read-write access to the original variable.
* **out parameter**: A parameter modifier (`out`) requiring the callee to assign a value before returning, used for output values.
* **in parameter**: A parameter modifier (`in`) passing an argument by read-only reference to avoid copying large structures.
* **ref readonly parameter**: A parameter modifier (`ref readonly`) that passes a reference safely without allowing the callee to mutate the referenced data.
* **Ref return**: A method return feature allowing a method to return a reference to a variable rather than a value copy.
* **Ref local**: A local variable initialized with a reference to another variable (`ref int x = ref y;`).
* **Alias**: A secondary name or reference pointing to the same underlying variable location or object instance.
* **Object identity**: The unique distinguishing identity of a reference-type instance on the heap.
* **Object allocation**: The process of reserving memory on the managed heap for a reference type instance.
* **Managed heap**: The runtime-managed memory area where reference-type instances reside.
* **Stack allocation (implementation choice)**: A runtime implementation strategy storing local data on the execution stack when safe.
* **Boxing conversion**: Converting a value type value into an object or interface reference type by wrapping it on the heap.
* **Unboxing conversion**: Extracting the value-type value out of a boxed object instance.
* **Boxing allocation**: The heap allocation performed automatically when boxing occurs.
* **Nullable value type boxing**: The specialized boxing rules applied when wrapping a nullable value type (`Nullable<T>`).
* **Boxing interface conversion**: Converting a boxed value type to an interface it implements.
* **Unboxing cast failure**: A runtime exception (`InvalidCastException`) thrown if an unboxing target type does not match the exact boxed type.
* **Unmanaged type**: Any type that does not contain reference types and can be used in pointer contexts.
* **Managed type**: Any type containing references or metadata managed by the runtime garbage collector.
* **Struct type**: A user-defined value type declared with the `struct` keyword.
* **Enum type**: A distinct value type defined by a set of named constants.
* **Class type**: A user-defined reference type declared with the `class` keyword.
* **Interface type**: A reference type defining a contract of members without implementation.
* **Array type**: A reference type representing a fixed-length indexed sequence of elements.
* **Delegate type**: A reference type representing a reference to methods with a specific parameter list and return type.
* **String reference type**: The built-in immutable reference type (`string`) representing text.
* **Tuple value type**: Lightweight value-type data groupings (`ValueTuple`).
* **Record class**: A reference-type record providing value-based equality semantics out of the box.
* **Record struct**: A value-type record providing value-based equality semantics.
* **Shallow copy**: Copying an object's top-level fields without duplicating nested referenced objects.
* **Deep copy**: Recursively copying both an object and all objects referenced within it.
* **MemberwiseClone**: A protected method on `System.Object` that performs a **Shallow copy** of an object.
* **Copy constructor pattern**: A custom constructor pattern designed to duplicate an existing object instance.
* **with expression**: An expression utilizing `with` syntax to produce non-destructive mutations on records or structs.
* **Mutable struct copy**: Independent duplication that occurs when mutating a local copy of a mutable struct variable.
* **Readonly struct**: A struct declared with `readonly` enforcement to guarantee immutability.
* **Reference field inside a struct**: A reference-type field embedded inside a value-type struct, creating a potential aliasing hazard.
* **Defensive copy**: An automatic or manual copy generated by the runtime to protect readonly references or structs from mutation.
* **Ref safety**: Compiler rules ensuring references do not outlive the variables they point to.
* **Escape analysis**: The compiler analysis determining whether data can remain on the stack or must escape to the heap.
* **Scoped ref safety context**: Safety bounds restricting where a `ref` or `scoped` variable may escape.
* **Default value**: The standard zero-initialized state of a type.
* **default literal**: The shorthand `default` literal expression used to produce the default value of a type.
* **default operator**: The `default(T)` operator returning the default value for type `T`.

## Cross-item comparison

* **Value Type vs. Reference Type**: A **Value type** uses **Value copy** semantics on assignment, while a **Reference type** uses **Reference copy** semantics, creating an **Alias**.
* **Parameter Modifiers (`ref`, `out`, `in`, `ref readonly`)**: 
  * `ref` permits read-write access to an existing variable.
  * `out` requires assignment inside the method.
  * `in` and `ref readonly` provide read-only protections, where **Defensive copy** may be triggered if a mutable struct is passed by read-only reference.
* **Copy Strategies**: **Shallow copy** (via **MemberwiseClone**) copies only top-level fields, leaving nested references shared, whereas a **Deep copy** recursively duplicates all referenced graphs.

## Examples

*Unverified code example (pseudocode context):*

```csharp
// Demonstrating value copy vs reference copy semantics
int originalValue = 42;
int copiedValue = originalValue; // Value copy: copiedValue is 42 independently
copiedValue = 100;
// originalValue remains 42

class DataHolder { public int Value; }
DataHolder sourceObject = new DataHolder { Value = 42 };
DataHolder referenceAlias = sourceObject; // Reference copy: points to same heap instance
referenceAlias.Value = 100;
// sourceObject.Value is now 100 because both reference the same object instance
```

## Common mistakes

* **Assuming stack storage for value types**: Assuming a **Value type** always lives on the stack [2]. If a struct is boxed via **Boxing conversion** or stored inside a reference-type field, it resides on the **Managed heap** via **Object allocation**.
* **Forgetting reference sharing in structs**: Placing a reference type field inside a struct (`Reference field inside a struct`) means that a **Value copy** of the struct still shares the inner reference, causing unexpected aliasing.
* **Unboxing cast mismatches**: Attempting an unboxing conversion with the wrong target type causes an **Unboxing cast failure** (`InvalidCastException`).

## Knowledge checks with answers

1. **Question**: What happens to variables when a reference type is assigned to a second variable?
   * **Answer**: A **Reference copy** occurs. Both variables become an **Alias** pointing to the exact same **Object reference** on the **Managed heap**.
2. **Question**: When does a **Boxing allocation** occur?
   * **Answer**: It occurs during a **Boxing conversion**, when a value-type instance is explicitly or implicitly converted to an object or interface type, requiring heap allocation.
3. **Question**: What is the difference between `in` and `ref` parameter modifiers?
   * **Answer**: A `ref` parameter passes an argument by reference for read-write access (requiring prior initialization), while an `in` parameter passes an argument by read-only reference to prevent modification and avoid unnecessary copying.

## Sources

* [1] [C# 15 what's new](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)
* [2] [.NET 11 overview](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/overview)
* [3] [C# Types Language Specification](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)
* [4] [Value Types Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types)
* [5] [Reference Types Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types)
* [6] [Equality Comparisons Programming Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons)
* [7] [Records Types Guide](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records)
* [8] [EqualityComparer<T> API Reference](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.equalitycomparer-1)
