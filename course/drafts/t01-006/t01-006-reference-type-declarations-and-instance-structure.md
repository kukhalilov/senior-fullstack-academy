<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Reference: Class, struct, record, members, modifiers, and nested declarations

*This is an automatically generated draft.*

# Scope and version
This lesson covers C# type declarations, constructors, and instance structure as defined in C# 15 and .NET 11. It focuses on the syntax and structural roles of classes, structs, and records. For official documentation, refer to the [Microsoft Learn C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes) and [C# 15 release notes](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15).

# How this group fits the mental model
In C#, a type declaration defines a contract and a memory layout. Classes provide reference-based identity, while structs provide value-based copying. Records simplify data-oriented types by synthesizing equality members. Constructors ensure that these types begin their lifecycle in a valid state. These declarations form the building blocks of your application's architecture.

# Supplied names explained

* `class declaration`: Defines a reference type that supports inheritance and identity.
* `struct declaration`: Defines a value type that is copied by value and does not support inheritance.
* `record declaration`: A concise syntax for defining types with value-based equality.
* `record class declaration`: A reference type that behaves like a record.
* `record struct declaration`: A value type that behaves like a record.
* `ref struct declaration`: A struct restricted to the stack to prevent heap allocation.
* `readonly struct declaration`: A struct where all members are implicitly immutable.
* `readonly ref struct declaration`: A stack-only struct that is also immutable.
* `static class declaration`: A class that cannot be instantiated and contains only static members.
* `abstract class declaration`: A class that cannot be instantiated and serves as a base for others.
* `sealed class declaration`: A class that cannot be inherited from.
* `partial type declaration`: Allows a type to be split across multiple files.
* `Nested type`: A type defined within the scope of another type.
* `Nested class`: A class defined inside another type.
* `Nested struct`: A struct defined inside another type.
* `Nested record`: A record defined inside another type.
* `Generic type declaration`: A type definition that uses type parameters for flexibility.
* `Type parameter`: A placeholder for a specific type provided when the generic type is used.
* `Base class list`: The list of classes from which a type inherits.
* `Interface base list`: The list of interfaces a type implements.
* `Primary constructor`: A constructor defined directly in the type header.
* `Primary constructor parameter`: A parameter defined in the primary constructor.
* `Primary constructor parameter capture`: The mechanism where primary constructor parameters are available throughout the type body.
* `Type parameter constraint`: Rules applied to generic type parameters.
* `where T : class`: Constraint requiring the type argument to be a reference type.
* `where T : class?`: Constraint requiring the type argument to be a nullable reference type.
* `where T : struct`: Constraint requiring the type argument to be a value type.
* `where T : unmanaged`: Constraint requiring the type argument to be an unmanaged type.
* `where T : notnull`: Constraint requiring the type argument to be non-nullable.
* `where T : new()`: Constraint requiring the type argument to have a parameterless constructor.
* `where T : BaseType`: Constraint requiring the type argument to inherit from a specific base class.
* `where T : IInterface`: Constraint requiring the type argument to implement a specific interface.
* `where T : allows ref struct`: Constraint allowing the use of ref structs as type arguments.
* `Access modifier`: Keywords that define the visibility of a type or member.
* `public accessibility`: Accessible from any code.
* `protected accessibility`: Accessible within the class and derived classes.
* `internal accessibility`: Accessible within the same assembly.
* `private accessibility`: Accessible only within the containing type.
* `file accessibility`: Accessible only within the same file.
* `protected internal accessibility`: Accessible within the assembly or derived classes.
* `private protected accessibility`: Accessible within the assembly and derived classes.
* `static member`: A member belonging to the type rather than an instance.
* `abstract member`: A member without an implementation that must be overridden.
* `virtual member`: A member that can be overridden in derived classes.
* `override member`: A member that provides a new implementation for a virtual member.
* `sealed override member`: An override that cannot be further overridden.
* `new member modifier`: Hides a base class member with a new implementation.
* `extern member`: A member implemented externally (e.g., via P/Invoke).
* `unsafe member`: A member that uses pointers or unsafe code.
* `readonly member`: A member that does not modify the instance state.
* `ref member`: A member that returns a reference to a value.
* `required member`: A member that must be initialized during object creation.
* `partial member`: A member defined across multiple parts of a partial type.
* `Member declaration`: The act of defining a field, property, or method.
* `Instance member`: A member that requires an object instance to access.
* `Static member`: (Duplicate) A member belonging to the type.
* `Instance field`: A variable stored within an object instance.
* `Static field`: A variable shared by all instances of a type.
* `Constant field`: A field whose value is fixed at compile time.
* `Read-only field`: A field that can only be assigned during initialization.
* `Event field`: A field used to implement the observer pattern.
* `Nested type visibility`: The scope rules for types defined inside other types.
* `File-local type`: A type restricted to the current file.
* `Type initializer order`: The sequence in which static and instance initializers run.
* `Base type initialization order`: The sequence of constructor execution in an inheritance chain.
* `Member declaration order`: The order in which members are defined in source code.

# Cross-item comparison
* **Class vs. Struct**: Classes are reference types (heap-allocated, garbage collected); structs are value types (stack-allocated or inline, copied by value).
* **Record class vs. Record struct**: Both provide value-based equality, but the former is a reference type and the latter is a value type.
* **Primary vs. Traditional constructor**: Primary constructors are concise and defined in the type header; traditional constructors are defined as methods within the body.
* **Required member vs. Object initializer**: Required members force the caller to provide a value; object initializers provide a flexible way to set properties after construction.

# Examples
```csharp
// Primary constructor example
public class User(string name) // Primary constructor
{
    public string Name { get; } = name; // Property initializer
}

// Required member example
public class Config
{
    public required string Path { get; set; } // Required member
}
```

# Common mistakes
* **Misunderstanding Equality**: Assuming `record` types perform deep equality on referenced objects. They perform shallow equality.
* **Struct Mutation**: Modifying a `readonly struct` or a struct returned by a property, which often results in modifying a copy rather than the original.
* **Constructor Order**: Assuming instance fields are initialized before the base constructor runs; base constructors always execute first.

# Knowledge checks with answers
1. **Question**: Can a `struct` inherit from a `class`?
   **Answer**: No, structs cannot inherit from other user-defined classes or structs.
2. **Question**: What is the primary difference between a `class` and a `record class`?
   **Answer**: `record class` provides synthesized value-based equality and `with` expressions, whereas a standard `class` uses reference identity.
3. **Question**: When should you use a `ref struct`?
   **Answer**: When you need to ensure a type is never allocated on the heap (e.g., for high-performance memory management).
