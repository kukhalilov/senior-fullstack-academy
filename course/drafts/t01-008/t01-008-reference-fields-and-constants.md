<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# properties indexers fields methods parameters and overloads — Reference: Stored members, initialization, mutability, and fixed storage

*This is an automatically generated draft.*

# Scope and version
This lesson covers stored members in C# 15 / .NET 11. It focuses on how data is stored, initialized, and managed within a type. This content reflects C# 13, 14, and 15 language features checked 2026-11-17.

# How this group fits the mental model
In C#, members define the structure and behavior of your types. While properties and methods handle logic and access, **fields** are the fundamental units of storage. They hold the raw state of an object or type. Understanding fields is essential because they provide the "memory" for your classes and structs. Whether you are defining a simple variable or a complex thread-safe buffer, these members determine how data persists during the lifetime of your application.

# Supplied names explained

* `Instance field`: A variable declared directly in a class or struct that belongs to a specific object instance. Each instance of the type has its own copy.
* `Static field`: A variable marked `static` that belongs to a type. Each closed constructed generic type has its own set of static fields; ThreadStaticAttribute further provides thread-local values.
* `const field`: A compile-time constant, implicitly static. Consumers can embed its value at compile time, so changing a public const in a library does not update already compiled callers until they are recompiled.
* `readonly field`: A field that can only be assigned a value during declaration or within the type's constructor.
* `static readonly field`: A field that is shared across all instances and can only be assigned during declaration or in a static constructor.
* `volatile field`: A field that may be accessed concurrently and excludes certain optimizations. It does not make compound operations atomic, guarantee globally ordered writes, or guarantee every read sees the latest write; prefer lock, Interlocked, or higher-level synchronization. Only supported types can be volatile (long and double are not).
* `fixed-size buffer`: An unsafe fixed-size buffer field declared in a struct for a restricted set of primitive element types, typically for interop; it is not a general-purpose fixed-size collection.
* `Field initializer`: An expression used to assign an initial value to a field at the time of declaration.
* `Field default value`: The value assigned to a field if no explicit initializer is provided (e.g., `0` for integers, `null` for references).
* `Field declaration`: The syntax used to define a field, including its access modifier, type, and name.
* `Field-like event`: A shorthand syntax for events that automatically generates a private backing field to store event subscribers.
* `Field keyword in property accessor`: A C# 14 feature allowing direct access to the compiler-generated backing field within a property's `get` or `set` block.
* `Backing field`: The hidden variable that stores the actual data for a property.
* `Compiler-generated backing field`: The private field created automatically by the compiler when you use auto-implemented properties.
* `Thread-static field`: A static field marked with ThreadStaticAttribute, giving each thread separate storage. A field initializer runs only once during type initialization, not once per thread; initialize each thread value lazily.
* `ThreadStaticAttribute`: The attribute applied to a static field to indicate it should be unique per thread.
* `Field-targeted attribute`: An attribute applied specifically to the underlying field of a property or event (using the `field:` prefix).
* `Field initializer execution order`: For classes, instance field initializers execute in textual order before the base instance constructor is invoked; type initialization timing is separately governed by the type initializer and beforefieldinit rules.
* `Static field initialization`: The process that initializes static fields. With an explicit static constructor, initialization timing follows that constructor rules; absent one, beforefieldinit can permit earlier runtime initialization.
* `Constant value`: The literal or expression value assigned to a `const` member.
* `Readonly assignment location`: The specific scope (declaration or constructor) where a `readonly` field is permitted to be set.

# Cross-item comparison
* **Storage:** `Instance field` vs `Static field` (per-object vs per-type).
* **Mutability:** `const field` (compile-time fixed) vs `readonly field` (runtime fixed).
* **Concurrency:** `volatile field` vs `Thread-static field` (memory visibility vs thread-local isolation).
* **Automation:** `Backing field` vs `Compiler-generated backing field` (manual control vs automatic management).

# Examples
```csharp
public class DataStore {
    // Instance field with initializer
    private int _count = 0;

    // Readonly field set in constructor
    private readonly string _id;

    public DataStore(string id) {
        _id = id; // Valid assignment location
    }

    // C# 14: Using the field keyword in a property
    public int Count {
        get => field;
        set => field = value;
    }
}
```

# Common mistakes
1. **Confusing `const` and `readonly`:** `const` is fixed at compile time and cannot be changed; `readonly` can be set at runtime inside a constructor.
2. **Ignoring Thread Safety:** Using a `static field` in a multi-threaded environment without synchronization or `ThreadStaticAttribute` can lead to data corruption.
3. **Overusing Fields:** Exposing fields as `public` breaks encapsulation. Use properties to control access and validation.

# Knowledge checks with answers
1. **Question:** Where can you assign a value to a `readonly field`?
   **Answer:** At declaration or in an instance constructor of the declaring type for an instance readonly field; for a static readonly field, at declaration or in a static constructor.
2. **Question:** What is the difference between an `Instance field` and a `Static field`?
   **Answer:** An instance field is unique to every object created from the class, while a static field is shared by all instances of that class.
3. **Question:** What does the `field` keyword do in a C# 14 property accessor?
   **Answer:** It provides direct access to the compiler-generated backing field, removing the need to declare a private variable manually.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/fields)*
