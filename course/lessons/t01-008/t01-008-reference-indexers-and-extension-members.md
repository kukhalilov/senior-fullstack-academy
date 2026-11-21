
# properties indexers fields methods parameters and overloads — Reference: Indexed access and extension syntax on existing receiver types

# Scope and version
This lesson covers indexers and extension members in C# 15 / .NET 11, checked 2026-11-17, including C# 13, 14, and 15 changes.

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
* `Implicit indexer access in object initializer`: C# 13 implicit index access in an object initializer allows the ^ from-end index operator to be used there, for example new Buffer { [^1] = value } when the target supports that indexer. Ordinary indexer member initializers predate C# 13.
* `Reduced extension method invocation`: The process where the compiler transforms an extension method call into a static method call.
* `Extension member lookup`: The process the compiler uses to find applicable extension members for a given type.
* `Instance member precedence over extension member`: Ordinary member lookup is tried before extension lookup; if it produces an applicable instance member, extension lookup is not used. An inapplicable instance overload does not always prevent extension lookup, and static extension members have different lookup rules.

# Cross-item comparison

* **Indexers vs. Properties**: Properties access a named value; indexers access a value by one or more keys. The target may represent a collection, map, or other keyed abstraction.
* **Extension Method vs. Extension Block**: Extension methods are individual static methods; extension blocks allow grouping multiple members (properties, indexers, operators) to extend a type collectively.
* **Instance vs. Extension**: A suitable applicable instance member found by ordinary member lookup is selected before extension lookup.

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
public static class StringExtensions {
    extension(string text) {
        public int WordCount => text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
    }
}
```

# Common mistakes

1. **Ignoring Precedence**: Expecting an extension method to override or add virtual dispatch to the receiver type. Extensions do not alter the type; ordinary member lookup gets precedence when it finds a suitable applicable member.
2. **Overusing Indexers**: Creating indexers for types that are not logically collections. This can make code confusing.
3. **Missing `this`**: Confusing legacy extension-method syntax (this on the first parameter) with C# 14 extension-block syntax (extension(Type receiver)).

# Knowledge checks with answers

1. **Q: If a class has an instance method `ToString()` and you create an extension method `ToString()`, which one is called?**
   * A: The instance method if ordinary member lookup finds an applicable candidate; extension lookup is considered only when that lookup does not provide a suitable applicable instance member.
2. **Q: What is the purpose of the `init` accessor in an indexer?**
   * A: It limits setting through the indexer to the language-defined construction phase, similar to init on a property.
3. **Q: Which C# version introduced extension indexers?**
   * A: C# 15.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/indexers/)*
