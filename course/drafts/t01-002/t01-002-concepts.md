<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Core concepts and how they fit together

*Note: This is an automatically generated draft.*

## Learning objectives
- Explain how source files, projects, and namespaces organize code in C# applications.
- Differentiate between file-based applications and project-based applications, as well as top-level statements and explicit `Main` entry points.
- Describe how `using` directives make types and static members available, or create aliases.
- Trace how command-line arguments and process exit codes cross the boundary between an operating system and a running C# application.

## Prerequisites
- Basic familiarity with running command-line commands and editing plain text files.
- Conceptual understanding that software consists of code files compiled into executable instructions.

## Core concepts
Every C# program starts with the problem of translating human-readable text files into an executing process controlled by an operating system. To solve this, C# relies on structured units:
- **Compilation unit**: A single source file text document supplied to the compiler.
- **Namespace**: A logical container used to group related **Type declarations** (such as classes, structs, and interfaces) and prevent name conflicts.
- **File-scoped namespace declaration** vs **Block-scoped namespace declaration**: A file-scoped declaration applies to the entire file with a single statement (e.g., `namespace MyNamespace;`), whereas a block-scoped declaration wraps types in curly braces (`namespace MyNamespace { ... }`).
- **Namespace using directive**, **Static using directive**, and **Alias using directive**: Mechanisms to bring types or static members into scope or shorten long type names. Global variants (`global using directive`, etc.) apply across an entire project.
- **Extern alias directive**: A tool to resolve references when two different assemblies contain identical fully qualified type names.
- **File-based app** vs **Project-based app**: A file-based app runs directly from a single script-like source file (supported starting in C# 14), while a project-based app relies on multiple compilation units managed by a project system.
- **Top-level statements** and **Main method**: The entry points where execution begins. A program can use concise top-level statements or an explicit method signature (such as `static void Main()`, `static int Main()`, `static Task Main()`, or `static Task<int> Main()`, with or without `string[] args`).
- **Command-line arguments** and **Program exit code**: Inputs passed into the application from the shell and integer status values returned to the operating system upon termination.

## Mechanisms and relationships
The map of a C# program flows hierarchically from physical storage to operating-system execution:

1. **Physical Files**: Individual text files (`.cs`) act as compilation units.
2. **Logical Organization**: Namespaces group types inside those units. `using` directives act as lookup shortcuts, telling the compiler where to look for names that are not fully qualified.
3. **Execution Entry**: At runtime, the application looks for a designated entry point—either an implicit compiler-generated entry point driven by top-level statements or an explicit `Main` method.
4. **Boundary Crossing**: When launched, the OS supplies **Command-line arguments** (`string[] args`). When finished, the program returns a **Program exit code** back to the OS.

Comparisons from the specification:
- **File-scoped vs Block-scoped namespaces**: File-scoped declarations reduce indentation and nesting across an entire file; block-scoped declarations allow multiple namespaces within a single file.
- **Top-level statements vs Main method**: Top-level statements hide boilerplate code and make small programs script-like; the `Main` method offers explicit, traditional control structure.
- **File-based app vs Project-based app**: File-based apps eliminate project file overhead for single-file scripts; project-based apps coordinate multi-file dependencies, assets, and libraries.

## Worked examples

### Example 1: A traditional project-based app with a Main method
This example uses a traditional project structure, an explicit namespace, and a standard `Main` method signature that returns an exit code.

```csharp
// Unverified code example (pseudocode/draft structure)
using System;

namespace CalculatorApp
{
    class Program
    {
        static int Main(string[] args)
        {
            if (args.Length == 0)
            {
                Console.WriteLine("Please provide an argument.");
                return 1; // Error exit code
            }

            Console.WriteLine($"Received argument: {args[0]}");
            return 0; // Success exit code
        }
    }
}
```
*Expected behavior*: When executed with an argument, it prints the argument and exits with code `0`. When executed without arguments, it prints a warning and exits with code `1`.

### Example 2: A file-based app using top-level statements
This example simplifies entry points using top-level statements, leveraging modern file-based application flexibility.

```csharp
// Unverified code example (pseudocode/draft structure)
using static System.Console;

WriteLine("Starting file-based application...");

if (args.Length > 0)
{
    WriteLine($"Hello, {args[0]}!");
}
```
*Expected behavior*: The compiler automatically generates the hidden entry-point infrastructure, running the statements sequentially from top to bottom.

## Misconceptions and edge cases
- **Misconception**: Top-level statements are interpreted as a scripting language that runs without compilation. 
  - *Reality*: Top-level statements are translated by the compiler into a standard program entry point behind the scenes. They are fully compiled code.
- **Edge case**: Having multiple files with top-level statements in the same project. 
  - *Reality*: Only one file in a project may contain top-level statements; otherwise, the compiler reports an entry-point collision error.
- **Misconception**: A `using` directive includes a file or imports a library at runtime like an include macro.
  - *Reality*: `using` directives are purely compile-time syntactic shortcuts for resolving type names.

## Knowledge checks with answers
1. **Question**: What is the primary purpose of a namespace in C#?
   - **Answer**: To logically organize types and prevent naming collisions between different code libraries.
2. **Question**: How do top-level statements differ from a traditional `Main` method?
   - **Answer**: Top-level statements allow a developer to write executable code directly at the file root without explicitly declaring a containing class or `Main` method; the compiler generates the entry-point boilerplate automatically.
3. **Question**: What value does a program return to the operating system if it completes successfully using an integer-returning `Main` method?
   - **Answer**: Typically `0`, which convention dictates represents successful execution.
4. **Question**: Can a project contain multiple files with top-level statements?
   - **Answer**: No, only one compilation unit in a project may use top-level statements to define the application entry point.

Sources:
- [Microsoft Learn: Program Structure](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)
- [Microsoft Learn: Namespaces](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/namespaces)
- [Microsoft Learn: Main() and Command-Line Arguments](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/main-command-line)
- [Microsoft Learn: Top-Level Statements](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements)
