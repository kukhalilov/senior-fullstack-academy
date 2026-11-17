<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Reference: Application forms and entry points

*This is an automatically generated draft.*

# C# Source-File Organization and Application Entry Points

## Scope and version
This lesson covers the structure of C# applications and the mechanisms used to define entry points. Microsoft documentation checked 2026-11-17 lists C# 15 as current with .NET 11, and C# 14 file-based apps with .NET 10+.

*Source: [Microsoft Learn C# Fundamentals](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)*

## How this group fits the mental model
In C#, code is organized into files and projects. To run an application, the runtime needs a specific starting point—the entry point. You can choose between a modern, simplified approach (**Top-level statements**) or the traditional, explicit approach (**Main method**). These choices dictate how your application interacts with the operating system via **Command-line arguments** and **Program exit codes**.

## Supplied names explained

### Application Forms
*   **File-based app**: Starting with C# 14 and .NET 10, a single `.cs` file can run without a project file. It can use top-level statements or an explicit `Main` method.
*   **Project-based app**: An app that uses a project file and can span multiple source files. It can use either top-level statements or an explicit `Main` method.

### Entry Point Mechanisms
*   **Top-level statements**: A feature that allows you to write the entry point code directly at the top of a file. The compiler generates the `Main` method for you behind the scenes.
*   **Main method**: The traditional, explicit entry point for a C# application. It must be a static member of a class.

### Main Method Signatures
The `Main` method can take several forms depending on whether you need to return a status code or perform asynchronous operations:
*   **`static void Main()`**: The simplest entry point; returns no value and takes no arguments.
*   **`static int Main()`**: Returns an integer **Program exit code** to the operating system.
*   **`static Task Main()`**: Used for asynchronous entry points; returns a `Task` (representing an ongoing operation).
*   **`static Task<int> Main()`**: Asynchronous entry point that also returns an integer exit code.
*   **`static void Main(string[] args)`**: Accepts **Command-line arguments** as an array of strings.
*   **`static int Main(string[] args)`**: Accepts arguments and returns an exit code.
*   **`static Task Main(string[] args)`**: Asynchronous entry point that accepts arguments.
*   **`static Task<int> Main(string[] args)`**: Asynchronous entry point that accepts arguments and returns an exit code.

### Interaction
*   **Command-line arguments**: Data passed to the application from the operating system shell when the program starts.
*   **Program exit code**: An integer returned by the application to the operating system to indicate success (usually 0) or failure (non-zero).

## Cross-item comparison

| Comparison | Context |
| :--- | :--- |
| **Top-level statements vs. Main method** | Top-level statements provide concise syntax and generate an entry point; an explicit `Main` makes its signature visible. Either can be used in a project-based app, and top-level statements support full applications. |
| **File-based app vs. Project-based app** | File-based apps use one `.cs` file without a project file; project-based apps use a project file and can include multiple sources and build configuration. This choice is independent of entry-point style. |

## Examples

### Using Top-level statements (File-based)
```csharp
// This can be a file-based or project-based app using top-level statements
Console.WriteLine("Hello, World!");
// The compiler generates the Main method automatically.
```

### Using Main method (Project-based)
```csharp
class Program
{
    static int Main(string[] args)
    {
        if (args.Length == 0) return 1; // Return error code
        return 0; // Return success
    }
}
```

## Common mistakes
*   **Multiple Entry Points**: A project can contain only one effective entry point. If top-level statements exist, the compiler-generated entry point is selected; an explicit `Main` in that project cannot be selected with `StartupObject`.
*   **Incorrect Signature**: The `Main` method must be `static`. If you forget the `static` keyword, the compiler will not recognize it as an entry point.
*   **Ignoring Exit Codes**: Forgetting to return an `int` from `Main` when the application is intended to signal success or failure to a shell script.

## Knowledge checks with answers

1. **Question**: Can a project contain a `Main` declaration and top-level statements?
   *   **Answer**: Yes, but top-level statements determine the generated entry point, and the explicit `Main` cannot serve as the entry point in that compilation.

2. **Question**: Which `Main` signature should you use if you need to perform an asynchronous operation and return an exit code?
   *   **Answer**: `static Task<int> Main(string[] args)` (or without args).

3. **Question**: What is the primary difference between a File-based app and a Project-based app?
   *   **Answer**: A file-based app runs a single `.cs` file without a project file; a project-based app uses a `.csproj` and can span multiple files. Either form can use top-level statements or an explicit `Main`.
