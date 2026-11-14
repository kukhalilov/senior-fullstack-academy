<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Exercises and worked solutions

*Draft: Automatically generated practice lesson based on frozen topic data (C# 15 stable on .NET 11 GA; checked 2026-11-14).*

## Goals
- Understand how source files, namespaces, and using directives organize C# code.
- Master application entry points using top-level statements or explicit `Main` method variations.
- Practice configuring file-based and project-based applications while handling command-line arguments and program exit codes.
- References: [Microsoft Learn Program Structure](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure), [Top-Level Statements](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements), [Main and Command-Line Arguments](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/main-command-line).

---

## Worked example
Consider an application that processes command-line inputs to execute a file-based task. 

### Conceptual Walkthrough
1. **Source Units & Namespaces**: We structure code inside a compilation unit using a file-scoped namespace declaration to avoid deep indentation blocks.
2. **Imports**: We use a namespace using directive to bring external namespaces into scope.
3. **Entry Point**: We use top-level statements for a concise entry point, capturing command-line arguments implicitly via the synthesized `args` array and returning an integer program exit code.

```csharp
// Unverified code example
using System;

// File-scoped namespace declaration
namespace FileProcessorApp;

// Top-level statements acting as the application entry point
if (args.Length == 0)
{
    Console.WriteLine("Error: No arguments provided.");
    return 1; // Program exit code indicating failure
}

Console.WriteLine($"Processing argument: {args[0]}");
return 0; // Program exit code indicating success
```

---

## Exercises
1. **Exercise 1 (Namespaces)**: Write a file-scoped namespace declaration named `Utilities.IO` containing a class declaration `DataHandler`. Then, rewrite it using a block-scoped namespace declaration to observe the difference.
2. **Exercise 2 (Entry Points)**: Implement a project-based app using an explicit `static int Main(string[] args)` signature that returns `0` on success and `-1` if no command-line arguments are passed.
3. **Exercise 3 (Directives)**: Write a namespace using directive and an alias using directive (`using FileMap = System.Collections.Generic.Dictionary<string, string>;`) to simplify a complex type lookup.

---

## Progressive hints
- **Hint for Exercise 1**: A file-scoped namespace applies to the entire file with a semicolon (`namespace Utilities.IO;`), whereas a block-scoped namespace wraps type declarations in curly braces `{ }`.
- **Hint for Exercise 2**: Remember that `Main` can return an `int` to serve as the program exit code. Check the length of the `string[] args` parameter.
- **Hint for Exercise 3**: Alias directives take the form `using AliasName = Fully.Qualified.TypeName;` placed at the top of the compilation unit before any type declarations.

---

## Complete solutions

### Solution 1
```csharp
// Unverified code example
// File-scoped version:
namespace Utilities.IO;
public class DataHandler { }

// Block-scoped version:
namespace Utilities.IO
{
    public class DataHandler { }
}
```

### Solution 2
```csharp
// Unverified code example
using System;

namespace ProjectApp
{
    public class Program
    {
        public static int Main(string[] args)
        {
            if (args.Length == 0)
            {
                return -1;
            }
            Console.WriteLine("Arguments received successfully.");
            return 0;
        }
    }
}
```

### Solution 3
```csharp
// Unverified code example
using System;
using FileMap = System.Collections.Generic.Dictionary<string, string>;

namespace DirectiveApp;

public class ConfigLoader
{
    public FileMap Configurations { get; set; } = new();
}
```

---

## Tests and edge cases
- **Edge Case 1 (Empty Arguments)**: Passing an empty array `[]` to an entry point expecting command-line arguments must not throw an `IndexOutOfRangeException`; always check `args.Length` first.
- **Edge Case 2 (Exit Codes)**: Verify that returning `0` signals standard success to the host operating system, while non-zero integers (e.g., `1`, `-1`) signal specific error states.
- **Test Scenario**: Run a file-based app with zero arguments vs three arguments to confirm that top-level statements correctly handle implicit `args` sizing.

---

## Reflection questions
1. When should you choose top-level statements over a traditional `Main` method? 
2. What are the maintainability tradeoffs between file-scoped and block-scoped namespace declarations?
3. How do global using directives differ from standard namespace using directives across a large multi-file project?
