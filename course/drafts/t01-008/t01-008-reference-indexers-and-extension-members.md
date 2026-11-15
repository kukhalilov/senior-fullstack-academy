<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# properties indexers fields methods parameters and overloads — Reference: Indexed access and extension syntax on existing receiver types

*This is an automatically generated draft.*

# Scope and version
This lesson covers the syntax and behavior of indexers and extension members in C# 15 / .NET 11. It reflects language features current as of November 2026, including specific enhancements from C# 13, 14, and 15.

# How this group fits the mental model
In C#, members define how data is stored and accessed. While fields and properties handle internal state, **Indexers** allow objects to be accessed using array-like syntax (`obj[i]`). **Extension members** allow you to add functionality to existing types without modifying their source code. Together, these features provide "natural" access patterns, making APIs easier to read and use.

# Supplied names explained

* `Indexer`: A member that enables an object to be indexed like an array.
* `Indexer declaration`: The syntax used to define an indexer within a class or struct.
* `Indexer parameter list`: The set of parameters (e.g., `int i`) that define how to access the indexer.
* `Indexer get accessor`: The logic that returns a value when the indexer is read.
* `Indexer set accessor`: The logic that assigns a value when the indexer is written to.
* `Indexer init accessor`: A special setter that allows assignment only during object initialization.
* `Indexer overload`: Defining multiple indexers with different parameter types or counts.
* `Multi-parameter indexer`: An indexer that accepts more than one argument (e.g., `[row, col]`).
* `Ref-returning indexer`: An indexer that returns a reference to the stored value, allowing direct modification.
* `Read-only indexer`: An indexer that provides a `get` accessor but no `set` or `init` accessor.
* `Indexer accessibility`: Modifiers (like `public` or `private`) that control who can access the indexer.
* `Indexer attribute`: Metadata applied to an indexer to influence compiler or runtime behavior.
* `Extension method`: A static method that can be called as if it were an instance method on a specific type.
* `Extension method receiver parameter`: The first parameter of an extension method, marked with `this`, representing the object being extended.
* `this modifier on extension parameter`: The keyword required on the first parameter of an extension method to identify it as an extension.
* `Extension block`: A C# 14 feature allowing a group of extension members to be defined together.
* `Extension declaration`: The syntax defining an extension block or method.
* `Extension property`: A property added to an existing type via an extension block (C# 14).
* `Extension static member`: A static member added to an existing type via an extension block (C# 14).
* `Extension indexer`: An indexer added to an existing type via an extension block (C# 15).
* `Extension operator`: An operator (like `+` or `==`) added to an existing type via an extension block (C# 14).
* `Implicit indexer access in object initializer`: A C# 13 feature allowing indexers to be used within object initializer syntax.
* `Reduced extension method invocation`: The process where the compiler transforms an extension method call into a static method call.
* `Extension member lookup`: The process the compiler uses to find applicable extension members for a given type.
* `Instance member precedence over extension member`: The rule that if an instance member and an extension member have the same signature, the instance member is always chosen.

# Cross-item comparison

* **Indexers vs. Properties**: Properties access a single named value; indexers access a collection of values using a key or index.
* **Extension Method vs. Extension Block**: Extension methods are individual static methods; extension blocks allow grouping multiple members (properties, indexers, operators) to extend a type collectively.
* **Instance vs. Extension**: Instance members are defined inside the type; extension members are defined outside. If both exist, the **Instance member precedence over extension member** rule ensures the instance version is used.

# Examples

**Basic Indexer:**
```csharp
public class MyList {
    private string[] _data = new string[10];
    public string this[int i] { // Indexer declaration
        get => _data[i];        // Indexer get accessor
        set => _data[i] = value; // Indexer set accessor
    }
}
```

**Extension Block (C# 14):**
```csharp
extension MyExtension for string {
    public int WordCount => this.Split(' ').Length; // Extension property
}
```

# Common mistakes

1. **Ignoring Precedence**: Trying to "override" an existing instance method with an extension method. The compiler will always prefer the instance method.
2. **Overusing Indexers**: Creating indexers for types that are not logically collections. This can make code confusing.
3. **Missing `this`**: Forgetting the `this` modifier on the receiver parameter of an extension method, which prevents it from being recognized as an extension.

# Knowledge checks with answers

1. **Q: If a class has an instance method `ToString()` and you create an extension method `ToString()`, which one is called?**
   * A: The instance method, due to the rule of instance member precedence.
2. **Q: What is the purpose of the `init` accessor in an indexer?**
   * A: It allows the indexer to be set only during the object's initialization phase.
3. **Q: Which C# version introduced extension indexers?**
   * A: C# 15.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/indexers/)*
