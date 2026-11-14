<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Reference: Application forms and entry points

*(Automatically generated draft)*

## Scope and version

This reference lesson covers the exact named inventory group **Application forms and entry points** for C# source-file organization and application entry points. 

- **Edition / Scope**: C# 15 stable on .NET 11 GA; Memory safety remains preview-only; checked 2026-11-14.
- **Reference Authority**: Microsoft Learn C# fundamentals and language reference.
- **Source Citation**: [Microsoft Learn Program Structure](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure).

## How this group fits the mental model

When writing a C# program, the runtime needs to know exactly where execution starts. In a compiled environment, this is called the application entry point. 

- **Mental Model**: Think of an application as a building. The entry point is the main front door through which anyone must enter. Application forms dictate how that building is constructed—whether it is a small, single-file script (a temporary workspace) or a structured multi-file project (a large office complex). 
- **Core Concepts Connected**: Entry points bridge the operating system boundary with your code. When a process launches, it passes **Command-line arguments** through the entry point and receives a **Program exit code** when execution finishes, signaling success or failure back to the host environment.

## Supplied names explained

The following items comprise the complete inventory group for application forms and entry points:

1. **File-based app**: An application style introduced in C# 14 where a single source file functions as a complete runnable application without requiring explicit project file boilerplate or standard folder structure.
2. **Project-based app**: The traditional application form governed by project structures, compilation files, and explicit namespaces or type definitions.
3. **Top-level statements**: A feature that allows developers to write executable code directly at the root of a source file without wrapping it in an explicit `class Program` and `Main` method. The compiler generates the entry point behind the scenes.
4. **Main method**: The traditional, explicit entry-point method recognized by the C# runtime where program execution begins.
5. **static void Main()**: A parameterless, value-returning entry-point signature that performs an action and exits with a default success code (`0`).
6. **static int Main()**: An entry-point signature returning an integer value representing a specific **Program exit code** to report status back to the operating system.
7. **static Task Main()**: An asynchronous entry-point signature returning a `Task`, allowing the use of asynchronous operations via `await` at the entry boundary.
8. **static Task<int> Main()**: An asynchronous entry-point signature returning a `Task` wrapping an integer **Program exit code**.
9. **static void Main(string[] args)**: A `Main` method signature that accepts **Command-line arguments** as an array of strings (`args`) while returning no value.
10. **static int Main(string[] args)**: A `Main` method signature accepting **Command-line arguments** and returning an integer **Program exit code**.
11. **static Task Main(string[] args)**: An asynchronous `Main` method signature accepting **Command-line arguments** and returning a `Task`.
12. **static Task<int> Main(string[] args)**: An asynchronous `Main` method signature accepting **Command-line arguments** and returning a `Task<int>`.
13. **Command-line arguments**: The string array (`args`) passed into the application from the operating system shell when the process starts.
14. **Program exit code**: An integer value returned by the application process upon termination (where `0` typically indicates success and non-zero values indicate errors).

## Cross-item comparison

To understand how these concepts contrast, look at the explicit comparison pairs:

- **File-based app vs. Project-based app**: A *File-based app* lets you run a script-like program instantly from a single file (introduced in C# 14), minimizing structural overhead. A *Project-based app* uses standard multi-file configurations, explicit type declarations, and structured directory layouts suited for larger systems.
- **Top-level statements vs. Main method**: *Top-level statements* hide boilerplate code by letting you write statements immediately; the compiler automatically constructs a hidden entry point. The *Main method* requires you to explicitly declare a class and method signature (`Main`) to define where execution starts.

## Examples

> **Note**: Code examples below are unverified and provided as pseudocode/examples for self-study.

### Example 1: Modern Entry Point Using Top-Level Statements
*Behavior*: This example demonstrates a **File-based app** or a modern project utilizing **Top-level statements** to accept **Command-line arguments** and return a **Program exit code**.

```csharp
// Unverified example
// Run with: dotnet run -- hello
if (args.Length > 0)
{
    System.Console.WriteLine($"Hello, {args[0]}!");
    return 0; // Program exit code for success
}

System.Console.WriteLine("No arguments provided.");
return 1; // Program exit code for failure/warning
```

### Example 2: Traditional Explicit Entry Point
*Behavior*: This example uses a classic **Main method** variant—specifically **static int Main(string[] args)**—within a **Project-based app**.

```csharp
// Unverified example
using System.Threading.Tasks;

namespace MyApp
{
    class Program
    {
        static int Main(string[] args)
        {
            System.Console.WriteLine("Traditional Main method running.");
            return 0;
        }
    }
}
```

## Common mistakes

- **Mixing Application Forms**: Attempting to use **Top-level statements** in multiple files across a project when only a single file is allowed to contain top-level statements.
- **Incorrect Main Signatures**: Forgetting that a **Main method** must be marked `static`. Writing an instance method named `Main` will prevent the runtime from recognizing it as an entry point.
- **Ignoring Exit Codes**: Returning arbitrary values without considering shell conventions, where `0` means success and non-zero values signal specific failure modes to automated deployment scripts.

## Knowledge checks with answers

1. **Question**: What is the primary difference between a **File-based app** and a **Project-based app**?
   * **Answer**: A **File-based app** (introduced in C# 14) runs from a single source file without traditional multi-file project boilerplates, whereas a **Project-based app** follows traditional multi-file configurations and structured namespaces.
2. **Question**: When using **Top-level statements**, who generates the underlying **Main method** entry point?
   * **Answer**: The C# compiler automatically generates the underlying entry point program structure and hidden `Main` method behind the scenes.
3. **Question**: What do non-zero **Program exit codes** typically communicate to the operating system?
   * **Answer**: They typically communicate that an error, failure, or unexpected condition occurred during execution (whereas `0` indicates success).
