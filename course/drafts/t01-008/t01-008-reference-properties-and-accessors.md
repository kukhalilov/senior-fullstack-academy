<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# properties indexers fields methods parameters and overloads — Reference: Read/write contracts, auto-properties, init-only, required, and partial properties

*This is an automatically generated draft.*

# Scope and version
This lesson covers C# member declarations as of C# 15 / .NET 11, checked 2026-11-17. It focuses on the mechanics of properties and their accessors. For broader context, see the [Microsoft C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties).

# How this group fits the mental model
In C#, members define the state and behavior of your objects. While **fields** store raw data, **properties** provide a controlled interface to that data. Properties provide accessor-based API members. Accessors may store, validate, compute, or notify, but property access should not conceal surprising work. Properties can permit changes to storage behind source-level property syntax, though fields and properties have distinct metadata and compatibility characteristics.

# Supplied names explained

* `Property`: A member that provides a flexible mechanism to read, write, or compute the values of private fields.
* `Instance property`: A property associated with a specific object instance; it requires an object reference to access.
* `Static property`: A property associated with the type itself rather than a specific instance; it is shared across all instances.
* `Read-only property`: A property that only provides a `get` accessor, with no property setter; the declaring type can still assign a get-only auto-property in a constructor or initializer.
* `Write-only property`: A property that only provides a `set` accessor (rarely used).
* `Auto-implemented property`: A property where the compiler automatically generates a hidden backing field, simplifying syntax when no custom logic is needed.
* `Expression-bodied property`: A property that uses the `=>` operator to define its value, typically used for simple computed properties.
* `Computed property`: A property that calculates its value on-the-fly rather than storing it in a field.
* `Property initializer`: Syntax used to assign an initial value to a property directly at the point of declaration.
* `get accessor`: The code block that returns the property's value.
* `set accessor`: The code block that assigns a value to the property.
* `init accessor`: An accessor that permits assignment only during the language-defined construction phase, such as an object initializer, constructor, or with initializer.
* `Accessor accessibility modifier`: A keyword (like `private` or `protected`) applied to an accessor to restrict its visibility relative to the property itself.
* `get-only auto-property`: An auto-property with only get; it can be initialized at the declaration or assigned in a constructor of the declaring type.
* `init-only property`: A property that uses the `init` accessor, allowing assignment during object creation but preventing changes afterward.
* `Required member`: A property or field that the compiler requires an object-creation expression to initialize, unless a called constructor is annotated `[SetsRequiredMembers]`. This is compile-time enforcement, not runtime validation; null can still be assigned with a nullable warning.
* `required modifier`: The keyword used to mark a member as mandatory during object initialization.
* `SetsRequiredMembersAttribute`: An attribute applied to constructors to indicate that they handle the initialization of all `required` members.
* `Field-backed property`: A property that uses an explicit backing field, or (in C# 14+) the field contextual keyword for compiler-generated backing storage.
* `field keyword`: A C# 14 contextual keyword used within accessors to access the compiler-generated backing field directly.
* `Property validation`: The practice of using a `set` or `init` accessor to check if a value meets specific criteria before assignment.
* `Property notification`: The practice of triggering an event or update within an accessor when a property value changes.
* `Partial property`: A property with defining and implementing declarations in a partial type, supported starting in C# 13 and often used with source generators.
* `Property-targeted attribute`: An attribute applied specifically to the property member rather than its backing field.
* `Ref-returning property`: A property that returns a reference to the storage location of the value rather than a copy.
* `Ref-readonly property`: A property that returns a reference to a value that cannot be modified through that reference.

# Cross-item comparison

| Category | Comparison |
| :--- | :--- |
| **Storage** | `Auto-implemented property` vs `Field-backed property` vs `Computed property` |
| **Access** | `get` / `set` vs `init` |
| **Constraints** | `Required member` vs Optional properties |

# Examples

```csharp
public class User
{
    // Auto-implemented property
    public string Name { get; set; } = string.Empty;

    // Field-backed property using C# 14 'field' keyword
    public int Age
    {
        get => field;
        set => field = value > 0 ? value : throw new ArgumentException();
    }

    // Required member
    public required string Email { get; init; }
}
```

# Common mistakes
* **Overusing public fields:** Prefer properties when their accessor contract fits the API; fields can be reasonable for simple data carriers or internal storage, and fields and properties are not identical in all metadata scenarios.
* **Ignoring `init`:** Using `set` for properties that should only be set at creation time makes your object state mutable when it should be immutable.
* **Missing `required`:** required can catch omitted initialization at compile time, but does not express every invariant and does not validate values at runtime.

# Knowledge checks with answers
1. **Question:** What is the difference between a `set` accessor and an `init` accessor?
   * **Answer:** A `set` accessor allows the property to be modified at any time. An `init` accessor only allows the property to be set during object initialization.
2. **Question:** What does the `field` keyword do in C# 14?
   * **Answer:** It refers to the compiler-synthesized backing field in a property accessor in C# 14 or later; it is not supported in indexer accessors.
3. **Question:** Can a `required` member be set after the object is initialized?
   * **Answer:** required is an initialization obligation, not an assignment-time restriction. After construction, a settable required property can be assigned again; a constructor marked SetsRequiredMembers exempts callers from the object initializer obligation.
