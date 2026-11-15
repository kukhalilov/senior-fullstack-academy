<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Reference: Language categories, assignment, parameter passing, boxing, and aliasing

*This lesson is an automatically generated draft.*

# Scope and Version
This lesson covers C# 15 and .NET 11 (GA, 2026-11-14). It focuses on the fundamental distinction between value types and reference types, how they are copied, and how they interact with memory and identity.

*Source: [Microsoft Learn C# 15 Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)*

# How this group fits the mental model
In C#, every variable is either a **Value type** or a **Reference type**. 
*   **Value types** hold their data directly. When you assign one to another, you perform a **Value copy**, creating an independent duplicate.
*   **Reference types** hold an **Object reference** (a memory address) to data stored on the **Managed heap**. Assigning one to another performs a **Reference copy**, meaning both variables point to the same object, creating an **Alias**.

Understanding this is critical for managing state: changing a shared object (aliasing) affects all references, whereas changing a value type only affects that specific variable.

# Supplied names explained

### Type Categories
*   **Value type**: A type that contains its data directly. Includes **Struct type**, **Enum type**, and **Tuple value type**.
*   **Reference type**: A type that stores a reference to an object. Includes **Class type**, **Interface type**, **Array type**, **Delegate type**, **String reference type**, **Record class**, and **Record struct**.
*   **Unmanaged type**: A type that does not contain references to managed objects.
*   **Managed type**: A type that requires garbage collection because it contains references.

### Assignment and Copying
*   **Variable value**: The actual data stored in a value-type variable.
*   **Object reference**: The memory address stored in a reference-type variable.
*   **Value copy**: Duplicating the actual data.
*   **Reference copy**: Duplicating the memory address.
*   **Assignment conversion**: The process of moving data or a reference during an `=` operation.
*   **Shallow copy**: Copying only the top-level fields (default behavior).
*   **Deep copy**: Manually copying nested objects to ensure total independence.
*   **MemberwiseClone**: A method used to create a shallow copy of an object.
*   **Copy constructor pattern**: A manual approach to creating a new object from an existing one.
*   **with expression**: A syntax for creating a copy of a record with specific properties modified.

### Parameter Passing and References
*   **Value parameter passing**: Passing a copy of the data.
*   **Reference parameter passing**: Passing a reference to the original variable.
*   **ref parameter**: Allows a method to modify the original variable.
*   **out parameter**: Similar to `ref`, but requires the method to assign a value before returning.
*   **in parameter**: Passes a reference but prevents modification.
*   **ref readonly parameter**: Combines `in` semantics with stricter safety.
*   **Ref return / Ref local**: Allows returning or storing a reference to a variable rather than its value.
*   **Alias**: When two variables point to the same memory location.

### Memory and Boxing
*   **Object allocation**: Creating an instance on the **Managed heap**.
*   **Stack allocation (implementation choice)**: Where a value type might live for performance.
*   **Boxing conversion**: Converting a value type to an object reference.
*   **Unboxing conversion**: Converting a boxed value back to a value type.
*   **Boxing allocation**: The heap memory used when boxing occurs.
*   **Nullable value type boxing**: Special handling when boxing nullable types.
*   **Boxing interface conversion**: Boxing a value type to use it as an interface.
*   **Unboxing cast failure**: An exception thrown if the unboxing type does not match.

### Safety and Defaults
*   **Defensive copy**: A copy made by the runtime to ensure `readonly` or `in` safety.
*   **Ref safety / Escape analysis / Scoped ref safety context**: Mechanisms to ensure references do not point to invalid memory.
*   **Default value / default literal / default operator**: Ways to get the initial value of a type (e.g., `0` for `int`, `null` for classes).

# Cross-item comparison

| Feature | Value Type | Reference Type |
| :--- | :--- | :--- |
| **Copying** | Value copy (independent) | Reference copy (aliasing) |
| **Storage** | Often stack (context-dependent) | Managed heap |
| **Identity** | Value equality | Object identity |

*   **Mutable struct copy** vs. **Readonly struct**: A mutable struct allows changes to its fields after creation; a `readonly struct` enforces immutability, preventing accidental modification during copies.
*   **Reference field inside a struct**: Even if a struct is a value type, if it contains a reference field, that field still points to shared heap memory.

# Examples

```csharp
// Value type example
int a = 10;
int b = a; // Value copy: b is 10, independent of a
b = 20;    // a remains 10

// Reference type example
var list1 = new List<int> { 1 };
var list2 = list1; // Reference copy: both point to the same heap object
list2.Add(2);      // list1 now also contains 2
```

# Common mistakes
1.  **Assuming stack vs. heap**: Do not assume all value types are on the stack. The runtime decides based on context (e.g., a struct inside a class lives on the heap).
2.  **Aliasing confusion**: Modifying a property on a reference-type object affects all variables holding that reference.
3.  **Boxing overhead**: Frequently boxing value types (e.g., passing a struct to an `object` parameter) creates unnecessary heap allocations.

# Knowledge checks with answers

1.  **Question**: If I assign one `struct` variable to another, what happens?
    *   **Answer**: A **Value copy** occurs; the second variable becomes an independent copy of the first.
2.  **Question**: What is the difference between `ref` and `in` parameters?
    *   **Answer**: `ref` allows the method to modify the original variable; `in` passes a reference but prevents modification.
3.  **Question**: What is **Boxing**?
    *   **Answer**: The process of wrapping a value type inside an object reference so it can be treated as a reference type on the **Managed heap**.
