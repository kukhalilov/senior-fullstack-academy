
# C# source-file organization and application entry points — Core concepts and how they fit together

*Draft: Automatically generated.*

# C# Source-File Organization and Application Entry Points

When you write C# code, you aren't just writing a list of instructions; you are building a structure that the compiler must understand. This lesson explains how to organize your code into files and how to tell the computer exactly where your program begins.

## Learning objectives
* Understand how source files, namespaces, and projects relate.
* Distinguish between file-based and project-based applications.
* Identify the entry point of a C# program using `Main` or top-level statements.
* Learn how to manage code imports using various `using` directives.

## Prerequisites
* Basic familiarity with the concept of a "program" (a set of instructions that executes).
* Understanding that C# code is organized into **Types** (blueprints for data and behavior).

## Core concepts
Think of your C# project like a library:
1. **Compilation unit**: A single `.cs` source file.
2. **Namespace**: A folder-like container that groups related types to prevent naming conflicts.
3. **Using directives**: A way to "import" names from other namespaces so you don't have to type the full path every time.
4. **Entry point**: The specific location where the operating system starts executing your code.

## Mechanisms and relationships
### Organizing Code
* **Namespaces**: You can use a **Block-scoped namespace declaration** (wrapping code in `{ }`) or a **File-scoped namespace declaration** (a single line at the top of the file). The latter is cleaner for modern C#.
* **Imports**: 
    * **Namespace using directive**: Makes types in a namespace available.
    * **Static using directive**: Allows you to use static members (like `Math.PI`) without specifying the class name.
    * **Alias using directive**: Gives a long name a short nickname.
    * **Global directives**: Prefixed with `global`, these apply to every file in your project, reducing repetition.

### Starting the Program
* **Project-based app**: An app built from a project file such as `.csproj`, usually with one or more source files.
* **File-based app**: Introduced with C# 14 and .NET 10, it runs a single `.cs` source file without a project file. File-based and project-based are application-form choices; either can use top-level statements or an explicit `Main`.

## Worked examples

### Example 1: Traditional Project-based App
```csharp
using System; // Namespace using directive

namespace MyApp {
    class Program {
        static int Main(string[] args) { // Main method entry point
            Console.WriteLine("Hello World");
            return 0; // Program exit code
        }
    }
}
```

### Example 2: Project-based App with Top-level Statements
```csharp
using static System.Console; // Static using directive

WriteLine("Hello from top-level statements!");
// The compiler automatically generates the Main method for you.
```

## Misconceptions and edge cases
* **Misconception**: "I must use a `Main` method." 
    * **Reality**: In modern C#, you can use **Top-level statements**. The compiler creates the `Main` entry point for you behind the scenes.
* **Edge Case**: Multiple `Main` methods can exist; with no top-level statements, select the desired entry point using the `StartupObject` compiler option. If top-level statements are present, their generated entry point is selected.
* **Edge Case**: `static Task<int> Main` is useful when your program needs to perform asynchronous work (like downloading a file) before exiting.

## Knowledge checks with answers

1. **What is the difference between a block-scoped and file-scoped namespace?**
   * *Answer*: Block-scoped uses `{ }` to wrap code; file-scoped uses a single line at the top of the file to apply the namespace to the entire file.

2. **What is the purpose of a `static using directive`?**
   * *Answer*: It allows you to access static members of a type directly without typing the type name (e.g., calling `WriteLine()` instead of `Console.WriteLine()`).

3. **Can a project declare `Main` and also use top-level statements?**
   * *Answer*: It can declare a `Main` method, but top-level statements generate the selected entry point; the explicit method cannot be selected as the entry point in that compilation.

4. **What does the `int` return type in `static int Main()` represent?**
   * *Answer*: It represents the **Program exit code**, which tells the operating system whether the program finished successfully (usually `0`) or encountered an error.

***

**Source Reference**: [Microsoft Learn C# Fundamentals](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)
