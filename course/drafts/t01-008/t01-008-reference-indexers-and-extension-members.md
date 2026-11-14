<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# properties indexers fields methods parameters and overloads — Reference: Indexed access and extension syntax on existing receiver types

# Automatically Generated Draft: Indexed Access and Extension Syntax

## Scope and version
This lesson covers indexers and extension members in C# 15 / .NET 11. It focuses on the syntax and mechanics of providing array-like access to objects and extending existing types with new members.

**Source:** [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/indexers/), [C# 13](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13), [C# 14](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-14), [C# 15](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15), [Extension Members Tutorial](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/extension-members).

## How this group fits the mental model
Indexers allow objects to be accessed using `[]` syntax, making custom collections feel like native arrays. Extension members allow you to "add" functionality to types you do not own (or to keep logic separate) without modifying the original source code. These features prioritize natural, discoverable API design.

## Supplied names explained

### Indexer Components
*   **Indexer**: A member that allows an object to be indexed like an array.
*   **Indexer declaration**: The syntax defining an indexer, typically using `this`.
*   **Indexer parameter list**: The arguments required to access the indexer (e.g., `int index`).
*   **Indexer get accessor**: Returns the value at the specified index.
*   **Indexer set accessor**: Assigns a value to the specified index.
*   **Indexer init accessor**: Allows setting the value only during object initialization.
*   **Indexer overload**: Defining multiple indexers with different parameter types or counts.
*   **Multi-parameter indexer**: An indexer accepting more than one argument (e.g., `[int row, int col]`).
*   **Ref-returning indexer**: Returns a reference to the stored value rather than a copy.
*   **Read-only indexer**: An indexer that only provides a `get` accessor.
*   **Indexer accessibility**: Modifiers (e.g., `public`, `private`) controlling who can access the indexer.
*   **Indexer attribute**: Metadata applied to the indexer.
*   **Implicit indexer access in object initializer**: Using `[index] = value` syntax during object creation.

### Extension Members
*   **Extension method**: A method that appears to be an instance method of a type.
*   **Extension method receiver parameter**: The first parameter of an extension method.
*   **this modifier on extension parameter**: The keyword used on the receiver parameter to designate the method as an extension.
*   **Extension block**: A C# 14 construct grouping multiple extension members.
*   **Extension declaration**: The definition of an extension block or member.
*   **Extension property**: A property added to a type via an extension block.
*   **Extension static member**: A static member added to a type via an extension block.
*   **Extension indexer**: A C# 15 feature allowing indexers to be added as extensions.
*   **Extension operator**: An operator added to a type via an extension block.
*   **Reduced extension method invocation**: The process where the compiler transforms an extension call into a static method call.
*   **Extension member lookup**: The process of finding applicable extensions during compilation.
*   **Instance member precedence over extension member**: The rule that actual instance members are always preferred over extension members.

## Cross-item comparison
*   **Indexers vs. Properties**: Properties provide named access to data; indexers provide indexed access.
*   **Extension Methods vs. Extension Blocks**: Extension methods are individual static methods; extension blocks allow grouping properties, indexers, and operators into a single logical unit.
*   **Instance vs. Extension**: Instance members are part of the type definition; extension members are resolved by the compiler based on the scope and the `this` modifier.

## Examples
*Unverified pseudocode:*
```csharp
// Indexer example
public class MyList {
    private string[] _data = new string[10];
    public string this[int i] { // Indexer declaration
        get => _data[i];        // Indexer get accessor
        set => _data[i] = value; // Indexer set accessor
    }
}

// Extension block example (C# 14)
extension MyExtension for string {
    public int WordCount => this.Split(' ').Length; // Extension property
}
```

## Common mistakes
1.  **Overusing Extensions**: Creating extensions for logic that should belong to the type itself.
2.  **Ignoring Precedence**: Forgetting that if a type adds an instance method with the same signature as an extension, the instance method wins.
3.  **Indexer Complexity**: Creating multi-parameter indexers that are confusing to the user.

## Knowledge checks with answers
1. **Question**: Which keyword is used to mark the receiver parameter in an extension method?
   * **Answer**: The `this` modifier.
2. **Question**: Can an extension block contain static members?
   * **Answer**: Yes, C# 14 allows extension static members.
3. **Question**: What happens if an instance method and an extension method have the same signature?
   * **Answer**: The instance member takes precedence over the extension member.
