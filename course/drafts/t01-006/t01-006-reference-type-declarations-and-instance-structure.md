<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Reference: Class, struct, record, members, modifiers, and nested declarations

*This is an automatically generated draft.*

# Scope and version
This lesson covers C# type declarations, constructors, and instance structure as defined in C# 15 and .NET 11. It focuses on the syntax and structural roles of classes, structs, and records. For official documentation, refer to the [Microsoft Learn C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes) and [C# 15 release notes](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15).

# How this group fits the mental model
In C#, a type declaration defines a contract and members; the runtime and platform determine physical layout except where layout rules are explicitly requested. Classes use reference semantics, structs use value semantics, and records add synthesized data-oriented behavior. Constructors and initializers establish state, but compile-time features such as `required` aren't full runtime validation.

# Supplied names explained

* `class declaration`: Defines a reference type that supports inheritance and identity.
* `struct declaration`: Defines a value type that is copied by value and does not support inheritance.
* `record declaration`: A concise syntax for defining types with value-based equality.
* `record class declaration`: A reference type that behaves like a record.
* `record struct declaration`: A value type that behaves like a record.
* `ref struct declaration`: A struct subject to ref-safety escape restrictions (including limits on boxing and heap-containing contexts); don't describe it as guaranteed physical stack storage.
* `readonly struct declaration`: A struct whose instance state can't be mutated through its instance members. Its referenced objects can still be mutable.
* `readonly ref struct declaration`: A `ref struct` with readonly instance state; it inherits ref-safety restrictions but has no guarantee of physical stack placement, and referenced mutable objects remain mutable.
* `static class declaration`: A class that can't be instantiated or inherited and can't declare instance members; it can also contain nested type declarations.
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
* `where T : class?`: Constraint permitting either nullable or non-nullable reference type arguments; the `?` allows nullable references and does not require them.
* `where T : struct`: Constraint requiring the type argument to be a value type.
* `where T : unmanaged`: Constraint requiring the type argument to be an unmanaged type.
* `where T : notnull`: Nullable-analysis constraint that produces warnings for nullable type arguments; it isn't a runtime constraint.
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
* `protected internal accessibility`: Accessible within the same assembly or from derived classes in another assembly.
* `private protected accessibility`: Accessible only to derived types within the same assembly.
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
* **Class vs. Struct**: Classes are reference types and struct types are value types. Assignment copies the reference for classes and copies struct fields for structs; physical storage placement isn't a general source-level guarantee.
* **Record class vs. Record struct**: Both synthesize value equality, but `record class` is a reference type and `record struct` is a value type. Their assignment, nullability, and inheritance behavior follows that underlying kind.
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
* **Misunderstanding Equality**: Assuming records perform deep equality on referenced object graphs. Generated equality compares member values using their equality behavior; a referenced list, for example, is compared by that list's equality implementation, not recursively by contents.
* **Struct Mutation**: Modifying a `readonly struct` or a struct returned by a property, which often results in modifying a copy rather than the original.
* **Constructor Order**: Instance field initializers for a class run before its base-constructor invocation; constructor bodies then execute from base to derived. Don't assume the base constructor body runs before derived field initializers.

# Knowledge checks with answers
1. **Question**: Can a `struct` inherit from a `class`?
   **Answer**: No, structs cannot inherit from other user-defined classes or structs.
2. **Question**: What is the primary difference between a `class` and a `record class`?
   **Answer**: Both are reference types. A `record class` synthesizes value equality and supports `with` expressions; an ordinary class typically uses reference equality by default but can override equality.
3. **Question**: What does a `ref struct` guarantee?
   **Answer**: It enforces ref-safety restrictions that prevent unsafe lifetime escape and disallow certain heap-stored or boxed uses. It does not promise that every instance is physically stored on the stack.
