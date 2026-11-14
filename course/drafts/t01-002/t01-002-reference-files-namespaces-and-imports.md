<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Reference: Source units, namespaces, and using directives

*Automatically generated draft.*

## Scope and version

This reference lesson covers C# source-file organization, namespaces, and import directives based on C# 15 stable on .NET 11 GA (checked November 14, 2026) [1]. 

* **In Scope:** The supplied inventory of source units, namespaces, and import directives, along with the structural concepts of how files, projects, namespaces, entry points, and process boundaries fit together.
* **Scope Exclusions:** Statements and control flow, expression forms and operators, type declarations and members in depth, build configuration and project files, package restore, full SDK command catalogs, and runtime/IL/JIT execution behavior.

### Source References
* [Microsoft Learn: Program Structure](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure) [1]
* [Microsoft Learn: Namespaces](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/namespaces) [2]
* [Microsoft Learn: Top-Level Statements](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements) [3]
* [Microsoft Learn: Main and Command-Line Arguments](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/main-command-line) [4]

---

## How this group fits the mental model

When building software in C#, code is written in text files and organized into projects. Understanding this architecture requires looking at how source files and projects fit together, how application entry points work, and how data crosses the process boundary.

### How source files and projects fit together
A C# **project** groups multiple source code files together for the compiler. Individual files are compiled together into a single assembly or executable. A **compilation unit** represents the text content of a single C# source file processed by the compiler. 

### How file-based and project-based applications differ
* **File-based apps** (introduced in C# 14) allow you to run small scripts or standalone source files directly without creating a formal multi-file project file (`.csproj`) structure [1, 3].
* **Project-based apps** use traditional project files to manage multi-file compilation, dependencies, and build properties across large software solutions.

### How namespaces organize types
A **namespace** is a logical container used to group related types (such as classes and interfaces) and prevent naming conflicts. Namespaces are organized hierarchically. To avoid typing out long fully-qualified names everywhere, **using directives** import these namespaces or alias them into the current scope.

### How top-level statements and Main define the entry point
Every executable C# application requires a starting point where execution begins:
* **Top-level statements** allow you to write executable code directly at the root of a file without explicitly declaring a `Program` class or a `Main` method.
* **`Main` method** is the traditional explicit entry-point method signature (`static void Main(...)` or `static async Task Main(...)`). The compiler automatically generates a `Main` method behind the scenes when you use top-level statements.

### How command-line arguments and exit codes cross the process boundary
When an application runs, information crosses the process boundary in two directions:
1. **Command-line arguments** enter the application as an array of strings (`args`), passing input values from the operating system shell into the program.
2. **Exit codes** leave the application when the program finishes execution, returning an integer value to the operating system to indicate success or failure.

---

## Supplied names explained

The following inventory items define the exact terms for structuring source files, namespaces, and imports.

* **Compilation unit:** The structural result of processing a single C# source code file by the compiler. Every file compiled by the C# compiler forms its own compilation unit.
* **File-scoped namespace declaration:** A syntax form (`namespace MyNamespace;`) placed near the top of a file that applies the specified namespace to all type declarations in that file without requiring curly braces.
* **Block-scoped namespace declaration:** The traditional syntax form (`namespace MyNamespace { ... }`) that encloses type declarations within explicit curly braces.
* **Namespace:** A logical grouping construct used to organize types hierarchically and prevent naming collisions across large codebases.
* **Namespace using directive:** A directive (`using System;`) that makes all types within the named namespace available in the current compilation unit without fully qualifying their names.
* **Static using directive:** A directive (`using static System.Console;`) that brings the static members of a specific type directly into scope so they can be invoked without class qualification (e.g., `WriteLine("Hello");`).
* **Alias using directive:** A directive (`using TextWriter = System.IO.TextWriter;`) that assigns a shorter or clearer local name to a specific type or namespace.
* **Global using directive:** A directive prefixed with `global` (`global using System;`) that applies a namespace import to every compilation unit in the entire project.
* **Global static using directive:** A directive combining `global` and `static` (`global static using System.Console;`) to make a type's static members available globally across every file in the project.
* **Global alias using directive:** A directive combining `global` and an alias (`global using ProjectMap = System.Collections.Generic.Dictionary<string, string>;`) to make a custom type alias available across all files in the project.
* **Extern alias directive:** A directive (`extern alias ExternalLib;`) that resolves naming conflicts when a project references two different assemblies containing types with identical fully-qualified names.
* **Type declaration:** A syntactic construct within a compilation unit that defines a user-defined type, such as a class, struct, interface, enum, or delegate.

---

## Cross-item comparison

### File-scoped namespace declaration vs. Block-scoped namespace declaration
* **File-scoped namespace declaration:** Applies to the entire file using a single line (`namespace System.Collections;`). It reduces indentation levels and saves horizontal screen space.
* **Block-scoped namespace declaration:** Uses explicit curly braces (`namespace System.Collections { ... }`). It is required when multiple distinct namespaces must be declared within the exact same physical source file.

### Top-level statements vs. Main method
* **Top-level statements:** Concise syntax where statements execute immediately at the root of a script or program file. Ideal for small applications, utilities, and learning.
* **Main method:** Explicit class and method boilerplate (`static void Main(string[] args)`). Necessary when fine-grained control over accessibility modifiers, explicit class grouping, or traditional structure is preferred.

### File-based app vs. Project-based app
* **File-based app:** A lightweight structure allowing single-file execution without setting up project manifest files [1, 3].
* **Project-based app:** A structured setup relying on project configurations, dependency management, and multi-file compilation units for production software.

---

## Examples

> **Note:** The following code examples are unverified (pseudocode representation).

### Example 1: Basic Namespace and Type Declaration (Unverified)
```csharp
// File-scoped namespace declaration organizing a type declaration
namespace Company.Utilities;

public class Greeter
{
    public void SayHello() 
    {
        // Type declaration and basic source file organization
    }
}
```

### Example 2: Using Directives and Entry Points (Unverified)
```csharp
// Namespace using directive and static using directive
using System;
using static System.Console;

// Top-level statements serving as the application entry point
WriteLine("Enter your name:");
string? name = Console.ReadLine();

if (!string.IsNullOrEmpty(name))
{
    WriteLine($"Hello, {name}!");
    Environment.Exit(0); // Exit code crossing process boundary
}
else
{
    WriteLine("Error: Name cannot be empty.");
    Environment.Exit(1); // Error exit code
}
```

---

## Common mistakes

* **Placing `using` directives below type declarations:** All namespace using directives, global using directives, and static using directives must appear *before* any type declarations in a compilation unit. Placing them below types results in compilation errors.
* **Confusing file-scoped and block-scoped scopes:** Attempting to place more than one file-scoped namespace declaration in a single compilation unit is illegal. If multiple namespaces are required in one file, block-scoped declarations must be used.
* **Mismanaging `extern alias` names:** Forgetting to configure the corresponding project reference metadata for an `extern alias directive` will cause the compiler to fail when resolving external assembly identifiers.

---

## Knowledge checks with answers

1. **Question:** What is the primary advantage of a file-scoped namespace declaration over a block-scoped namespace declaration?
   * **Answer:** A file-scoped namespace declaration applies to the entire file with a single statement, eliminating the need for indentation and curly braces across the entire file.

2. **Question:** Where must namespace using directives and global using directives be positioned relative to type declarations in a C# source file?
   * **Answer:** They must always be placed at the top of the compilation unit, strictly before any type declarations.

3. **Question:** How do top-level statements interact with the application entry point?
   * **Answer:** Top-level statements allow developers to write executable code directly at the root of a file; the compiler automatically synthesizes the underlying entry point and `Main` method structure behind the scenes [3].
