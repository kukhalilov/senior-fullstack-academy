<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Reference: Language categories, assignment, parameter passing, boxing, and aliasing

*This lesson is an automatically generated draft.*

# Scope and Version
This lesson covers C# 15 and .NET 11 (GA, 2026-11-14). It focuses on the fundamental distinction between value types and reference types, how they are copied, and how they interact with memory and identity.

*Source: [Microsoft Learn C# 15 Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)*

# How this group fits the mental model
In C#, every variable is either a **Value type** or a **Reference type**. 
*   **Value types** have variables that contain values. Assigning one variable to another copies the value; if that value contains references, the referenced objects can still be shared.
*   **Reference types** hold an **object reference**. The language does not define it as a physical memory address. Assigning one to another performs a **Reference copy**, meaning both variables point to the same object, creating an **Alias**.

Understanding this is critical for managing state: changing a shared object (aliasing) affects all references, whereas changing a value type only affects that specific variable.

# Supplied names explained

### Type Categories
*   **Value type**: A type whose variable contains a value. Includes **Struct type**, **Enum type**, **Tuple value type**, and **Record struct**.
*   **Reference type**: A type whose variable holds an object reference. The supplied reference categories are **`Class type`**, **`Interface type`**, **`Array type`**, **`Delegate type`**, **`String reference type`**, and **`Record class`**. A class or record-class declaration defines the object's shape; assigning a variable copies its reference, so two variables can refer to the same object. An interface-typed variable can hold a reference to an implementing object, while arrays and delegates are reference types with their own runtime behavior.
*   **Unmanaged type**: A type that does not contain references to managed objects.
*   **Managed type**: A type that requires garbage collection because it contains references.

### Assignment and Copying
*   **Variable value**: The actual data stored in a value-type variable.
*   **Object reference**: A reference to an object; its physical representation is an implementation detail.
*   **Value copy**: Duplicating the actual data.
*   **Reference copy**: Copying a reference value, so both variables can refer to the same object.
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
*   **Alias**: When two variables refer to the same object instance.

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
| **Variable contents** | A value of the value type | A reference to an object |
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
