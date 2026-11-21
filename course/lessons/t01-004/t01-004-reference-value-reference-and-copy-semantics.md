
# C# value types reference types copying identity and equality — Reference: Language categories, assignment, parameter passing, boxing, and aliasing

# Scope and Version
This lesson covers C# 15 and .NET 11 (GA, 2026-11-14). It focuses on the fundamental distinction between value types and reference types, how they are copied, and how they interact with memory and identity.

*Source: [Microsoft Learn C# 15 Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)*

# How this group fits the mental model
In C#, every variable is either a **Value type** or a **Reference type**. 
*   **Value types** have variables that contain values. Assigning one variable to another copies the value; if that value contains references, the referenced objects can still be shared.
*   **Reference types**: a variable's value is an **object reference**. The language does not define it as a physical memory address. Assigning one variable to another copies that reference, so both may designate the same object, creating an **Alias**.

Understanding this is critical for managing state: changing a shared object (aliasing) affects all references, whereas changing a value type only affects that specific variable.

# Supplied names explained

### Type Categories
*   **Value type**: A type whose variable contains a value. Includes **Struct type**, **Enum type**, **Tuple value type**, and **Record struct**.
*   **Reference type**: A type whose variable holds an object reference. Reference categories include **`Class type`**, **`Interface type`**, **`Array type`**, **`Delegate type`**, **`String reference type`**, and **`Record class`**. `dynamic` is also a reference type category; it is omitted from this group’s frozen inventory. A class or record-class declaration defines the object's shape; assigning a variable copies its reference, so two variables can refer to the same object. An interface-typed variable can hold a reference to an implementing object, while arrays and delegates are reference types with their own runtime behavior.
*   **Unmanaged type**: A type that does not contain references to managed objects.
*   **Managed type**: Informal term for a type/runtime construct managed by the CLR; it is not defined as a type that itself requires a separate garbage-collected allocation. A value type can contain references, and a reference type variable holds an object reference.

### Assignment and Copying
*   **Variable value**: The actual data stored in a value-type variable.
*   **Object reference**: A reference to an object; its physical representation is an implementation detail.
*   **Object identity**: The identity of a particular object instance, distinct from a value-based equality result.
*   **Value copy**: Duplicating the actual data.
*   **Reference copy**: Copying a reference value, so both variables can refer to the same object.
*   **Assignment conversion**: The process of moving data or a reference during an `=` operation.
*   **Shallow copy**: Copying top-level field values without recursively cloning referenced objects. Struct assignment copies the struct's fields; `MemberwiseClone` and record `with` copies are shallow. There is no universal default deep-copy operation for arbitrary objects.
*   **Deep copy**: Copying nested objects according to an explicit policy. A deep copy doesn't necessarily imply total independence if resources or selected members are intentionally shared.
*   **MemberwiseClone**: A method used to create a shallow copy of an object.
*   **Copy constructor pattern**: A manual approach to creating a new object from an existing one.
*   **with expression**: A syntax for creating a copy of a record with specific properties modified.

### Parameter Passing and References
*   **Value parameter passing**: Passing the argument value by value. For a value type this copies the value; for a reference type this copies the object reference, and the callee may mutate the referenced object.
*   **Reference parameter passing**: Passing a variable by reference with `ref`, `out`, or `in`; this is distinct from passing a reference-type value by value, which copies the object reference. `in` is readonly through the parameter; `ref` and `out` allow assignment through the alias subject to definite-assignment rules. `ref readonly` also passes a readonly reference, with distinct call-site and overload-resolution behavior.
*   **ref parameter**: Allows a method to modify the original variable.
*   **out parameter**: The method must assign the parameter before returning normally; unlike `ref`, the caller need not definitely assign its argument first.
*   **in parameter**: A readonly reference parameter; the callee cannot assign through that parameter, but if the value is an object reference, the referred object may still be mutable. Certain member access on a non-readonly struct can cause a defensive copy. The compiler may also create temporaries for some call-site arguments.
*   **ref readonly parameter**: A readonly reference parameter with overload-resolution and call-site behavior distinct from `in`; it does not make a referred object immutable.
*   **Ref return / Ref local**: Allows returning or storing a reference to a variable rather than its value.
*   **Alias**: When two variables refer to the same object instance.

### Memory and Boxing
*   **Object allocation**: Creating an object according to runtime semantics; an optimizing runtime may elide an allocation that is unobservable, so source-level allocation syntax doesn't guarantee a physical allocation.
*   **Managed heap**: Runtime-managed object storage in common implementations; physical layout and allocation behavior are implementation details.
*   **Stack allocation (implementation choice)**: A runtime/compiler storage strategy for eligible data; it is not implied by a value type and C# `stackalloc` has separate rules for stack-allocated memory.
*   **Boxing conversion**: Converting a value type to `object`, `System.ValueType`, or an implemented interface, producing a boxed object containing a copy of the value. The runtime commonly allocates storage, though an optimization may eliminate an unobservable allocation.
*   **Unboxing conversion**: Extracting a value type from a boxed object. The boxed runtime type must match the requested underlying value type; the result is copied out.
*   **Boxing allocation**: The object storage commonly needed by boxing, subject to runtime optimization.
*   **Nullable value type boxing**: Boxing an empty `Nullable<T>` produces `null`; boxing a nonempty one boxes the underlying `T` value.
*   **Boxing interface conversion**: Boxing a value type to use it as an interface.
*   **Unboxing cast failure**: Unboxing throws `InvalidCastException` when the boxed value's runtime type doesn't match the requested value type. Unboxing `null` to a non-nullable value type throws `NullReferenceException`; unboxing it to a nullable value type yields an empty nullable.

### Safety and Defaults
*   **Defensive copy**: A value copy the compiler may emit when accessing a non-readonly member of a struct through a readonly variable, field, or `in` parameter; it is distinct from ordinary by-value parameter or assignment copies.
*   **Ref safety / Escape analysis / Scoped ref safety context**: Mechanisms to ensure references do not point to invalid memory.
*   **Default value / default literal / default operator**: Ways to get the initial value of a type (for example, `0` for `int` and `null` for reference types). A struct default value recursively contains default values for its fields, including null references in reference-type fields; it does not run an explicit parameterless struct constructor.

# Cross-item comparison

| Feature | Value Type | Reference Type |
| :--- | :--- | :--- |
| **Copying** | Value copy (independent) | Reference copy (aliasing) |
| **Variable contents** | A value of the value type | A reference to an object |
| **Identity** | No separate object identity in ordinary value semantics; equality uses the type's contract | Objects have identity; equality operators/methods may instead implement value equality |

*   **Mutable struct copy** vs. **Readonly struct**: A mutable struct permits mutation of its own fields; a `readonly struct` prevents mutation of its instance fields after construction, but does not make objects referenced by those fields immutable.
*   **Reference field inside a struct**: Copying the struct copies the reference field, so both copies may refer to the same object.

# Examples

```csharp
// Value type example
int a = 10;
int b = a; // Value copy: b is 10, independent of a
b = 20;    // a remains 10

// Reference type example
var list1 = new List<int> { 1 };
var list2 = list1; // Reference copy: both can designate the same list object
list2.Add(2);      // list1 now also contains 2
```

# Common mistakes
1.  **Assuming stack vs. heap**: Storage location and optimization are implementation details. A value type can be an object/array field, boxed, or otherwise stored according to context.
2.  **Aliasing confusion**: Modifying a property on a reference-type object affects all variables holding that reference.
3.  **Boxing overhead**: Boxing commonly requires an object allocation and copy (for example, conversion to an `object` parameter), though the runtime may remove unobservable allocations.

# Knowledge checks with answers

1.  **Question**: If I assign one `struct` variable to another, what happens?
    *   **Answer**: Assignment copies the struct's value, including its fields. If a field is a reference, the copied field can still designate the same object as the source struct.
2.  **Question**: What is the difference between `ref` and `in` parameters?
    *   **Answer**: `ref` lets the method assign through the alias to the caller's variable. `in` is readonly through that parameter; it doesn't make an object referred to by the value immutable.
3.  **Question**: What is **Boxing**?
    *   **Answer**: A conversion that produces an object containing a copy of a value type, so it can be used as `object`, `ValueType`, or an implemented interface. It commonly allocates, subject to optimization.
