<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Reference: Source units, namespaces, and using directives

*Draft: Automatically generated for educational purposes.*

# Source units, namespaces, and using directives

## Scope and version
This lesson covers the structural organization of C# source code. Microsoft Learn checked 2026-11-20 lists C# 15 as current for .NET 11. Namespace and using syntax here is not tied to a specific language version except where noted.

*Source: [Microsoft Learn C# Fundamentals](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)*

## How this group fits the mental model
In C#, code is not just a loose collection of instructions. It is organized into a hierarchy:
1. **Compilation units** (files) contain **Type declarations** (classes, structs, etc.).
2. **Namespaces** act as "folders" for your code to prevent naming conflicts.
3. **Using directives** act as "shortcuts" that allow you to refer to types in other namespaces without typing their full, long names every time.

## Supplied names explained

*   **Compilation unit**: A C# source file as processed by the compiler. A project compilation may combine multiple source files; file-based apps can also run from one source file without a project.
*   **Namespace**: A logical naming scope for types. It can help distinguish same-named types; namespace names need not match folders.
*   **Type declaration**: The definition of a class, struct, interface, enum, or delegate within a compilation unit.
*   **File-scoped namespace declaration**: A syntax where the namespace covers the entire file without requiring curly braces `{}`.
*   **Block-scoped namespace declaration**: The traditional syntax where a namespace is wrapped in curly braces `{}`.
*   **Namespace using directive**: Allows unqualified lookup of names in the named namespace; it does not add an assembly, package, or source file to the project.
*   **Static using directive**: Imports the static members of a class so you can call them without the class name (e.g., `WriteLine` instead of `Console.WriteLine`).
*   **Alias using directive**: Assigns a custom name to a type or namespace to resolve naming conflicts or simplify long names.
*   **Global using directive**: A using directive whose scope applies across the compilation, commonly the project. It must appear before non-using declarations in its source file.
*   **Global static using directive**: A static using directive whose scope applies across the compilation.
*   **Global alias using directive**: A globally scoped alias directive that makes an alias available throughout the compilation.
*   **Extern alias directive**: Makes an assembly reference configured with an extern alias available under that alias. It can disambiguate conflicting names; the alias is configured on the assembly reference and does not itself select a version.

## Cross-item comparison

| Feature | Comparison |
| :--- | :--- |
| **File-scoped vs. Block-scoped namespace** | File-scoped applies to the remainder of the file and permits only one file-scoped namespace declaration; block-scoped syntax can declare multiple namespaces in one file. |
| **Standard vs. Global using** | Standard `using` applies only to the current file; `Global using` applies to the entire project. |
| **Namespace vs. Static using** | Namespace `using` imports types (like `List`); Static `using` imports members (like `Math.PI`). |

## Examples

### File-scoped Namespace
```csharp
namespace MyProject.Utilities; // No braces needed

public class Helper { } // This is a Type declaration
```

### Using Directives
```csharp
using System; // Namespace using
using static System.Console; // Static using
using ProjectAlias = MyProject.Core; // Alias using

class Program {
    void Run() {
        WriteLine("Hello"); // Works because of static using
    }
}
```

## Common mistakes
1. **Namespace collisions**: Using a namespace name that conflicts with a library name. Use **Alias using directives** to fix this.
2. **Forgetting `static`**: Trying to use `WriteLine` without `using static System.Console;` will result in a compiler error.
3. **Overusing `global`**: Adding too many `global using` directives can make it difficult to track where a type is defined.

## Knowledge checks with answers

**1. What is the difference between a namespace and a compilation unit?**
*Answer: A compilation unit is the physical file (.cs), while a namespace is a logical container for types within one or more files.*

**2. When would you use an `extern alias` directive?**
*Answer: When an assembly reference has an extern alias configured, for example to disambiguate types exposed by multiple referenced assemblies. The alias must also be configured in the project/reference setup.*

**3. How does a `static using` directive change your code?**
*Answer: It allows you to access static members of a class directly without prefixing them with the class name.*

**4. True or False: A file-scoped namespace can contain multiple namespaces.**
*Answer: False. File-scoped namespaces apply to the entire file; use block-scoped if you need multiple namespaces in one file.*
