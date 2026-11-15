<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Exercises and worked solutions

*Note: This is an automatically generated draft.*

# C# Source-File Organization and Application Entry Points

## Goals
* Understand how C# code is structured into files, namespaces, and projects.
* Learn how to define the entry point of an application using `Main` methods or top-level statements.
* Master the use of `using` directives to manage type visibility.
* Distinguish between file-based and project-based application structures.

---

## Worked example

In C#, a **Compilation unit** is a source file. We organize code using **Namespaces**, which act as containers to prevent naming conflicts.

### Example: A simple console application
```csharp
// Using directive to access System namespace
using System;

namespace MyProject.Utilities
{
    // Type declaration
    public class Greeter
    {
        public static void SayHello() => Console.WriteLine("Hello!");
    }
}

// Top-level statements define the entry point
using MyProject.Utilities;

Greeter.SayHello();
```

**Map of the structure:**
1. **Using directives:** Tell the compiler where to look for types.
2. **Namespaces:** Group related code.
3. **Entry point:** The code that runs first (Top-level statements or `Main`).

---

## Exercises

1. **Namespace Scoping:** Rewrite a block-scoped namespace declaration as a file-scoped namespace declaration.
2. **Entry Point:** Create a `static int Main(string[] args)` method that returns `0` if no arguments are provided, and `1` otherwise.
3. **Using Directives:** Use a `static using directive` to call `Console.WriteLine` without typing `Console`.

---

## Progressive hints

* **Hint 1 (Namespaces):** A file-scoped namespace ends with a semicolon and does not require curly braces `{}`.
* **Hint 2 (Entry Points):** `Main` must be `static`. If you return an `int`, that value becomes the **Program exit code**.
* **Hint 3 (Using):** To use a static member directly, use `using static System.Console;`.

---

## Complete solutions

**1. Namespace Scoping:**
```csharp
namespace MyProject; // File-scoped
public class Data { }
```

**2. Entry Point:**
```csharp
static int Main(string[] args)
{
    if (args.Length == 0) return 0;
    return 1;
}
```

**3. Using Directives:**
```csharp
using static System.Console;
WriteLine("Hello!"); // No 'Console.' prefix needed
```

---

## Tests and edge cases

* **Edge Case:** What happens if you have both a `Main` method and top-level statements? (The compiler will report an error; only one entry point is allowed).
* **Edge Case:** Can you have multiple `Main` methods? (Yes, but you must specify which one is the entry point in your project configuration).
* **Test:** If your `Main` returns `1`, does the operating system receive it? (Yes, it is passed as the process exit code).

---

## Reflection questions

1. Why would you prefer a **File-scoped namespace declaration** over a **Block-scoped namespace declaration**?
2. When is it better to use a **Main method** instead of **Top-level statements**?
3. How do **Global using directives** simplify large projects compared to standard **Namespace using directives**?

*Source: [Microsoft Learn C# Fundamentals](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)*
