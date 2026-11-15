<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Reference: Application forms and entry points

*This is an automatically generated draft.*

# C# Source-File Organization and Application Entry Points

## Scope and version
This lesson covers the structure of C# applications and the mechanisms used to define entry points. It is based on **C# 15 stable on .NET 11 GA**, as of 2026-11-14. 

*Source: [Microsoft Learn C# Fundamentals](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)*

## How this group fits the mental model
In C#, code is organized into files and projects. To run an application, the runtime needs a specific starting point—the entry point. You can choose between a modern, simplified approach (**Top-level statements**) or the traditional, explicit approach (**Main method**). These choices dictate how your application interacts with the operating system via **Command-line arguments** and **Program exit codes**.

## Supplied names explained

### Application Forms
*   **File-based app**: A simplified application structure introduced in C# 14 that allows you to write code without explicit class or method wrappers, focusing on a single-file entry point.
*   **Project-based app**: The traditional structure where code is organized into multiple files and namespaces, requiring an explicit entry point definition.

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
| **Top-level statements vs. Main method** | Top-level statements are for concise, single-file scripts or simple apps; `Main` is for complex, multi-file projects requiring explicit control. |
| **File-based app vs. Project-based app** | File-based apps (C# 14+) prioritize developer speed and simplicity; Project-based apps prioritize architectural rigor and large-scale organization. |

## Examples

### Using Top-level statements (File-based)
```csharp
// This is a file-based app using top-level statements
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
*   **Multiple Entry Points**: Defining both top-level statements and an explicit `Main` method in the same project will cause a compilation error.
*   **Incorrect Signature**: The `Main` method must be `static`. If you forget the `static` keyword, the compiler will not recognize it as an entry point.
*   **Ignoring Exit Codes**: Forgetting to return an `int` from `Main` when the application is intended to signal success or failure to a shell script.

## Knowledge checks with answers

1. **Question**: Can you have both a `Main` method and top-level statements in the same project?
   *   **Answer**: No, the compiler requires exactly one entry point.

2. **Question**: Which `Main` signature should you use if you need to perform an asynchronous operation and return an exit code?
   *   **Answer**: `static Task<int> Main(string[] args)` (or without args).

3. **Question**: What is the primary difference between a File-based app and a Project-based app?
   *   **Answer**: File-based apps (introduced in C# 14) use top-level statements for simplicity, while Project-based apps use explicit class and `Main` method structures for traditional organization.
