<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Interview questions and reasoning

*Automatically generated draft.*

# C# Source Organization and Entry Points: Interview Preparation

This lesson helps you explain how C# code is structured and how applications begin execution. 

### Mental Model
Think of C# source files as units compiled into an application. **Namespaces** give types logical names, and **using directives** shorten how code refers to names. A project may use a file-based single source form or a project file; either can use a formal `Main` method or **top-level statements** as its entry-point style.

---

### Core questions
1. How do you organize code within a C# project?
2. What is the difference between a `Main` method and top-level statements?
3. How do you manage dependencies between different namespaces?
4. How does an application communicate its success or failure to the operating system?

---

### Concise interview answers
*   **Organization:** Code is organized into **Namespaces**, which prevent naming conflicts. You use **File-scoped** or **Block-scoped namespace declarations** to define these areas.
*   **Entry Points:** The `Main` method is the traditional entry point. **Top-level statements** provide a modern, concise way to write the entry point without requiring an explicit class or method wrapper.
*   **Imports:** **Using directives** make types from other namespaces available. You can use **Global using directives** to apply imports across the entire project.
*   **Exit:** An application can communicate a status through an integer returned by `Main` or top-level code. A `void` or `Task` return does not explicitly provide an integer status.

---

### Deep follow-up answers
*   **Why use File-scoped vs. Block-scoped namespaces?** File-scoped namespaces reduce indentation levels, making code cleaner. Block-scoped namespaces are useful if you need to define multiple namespaces within a single file.
*   **How do command-line arguments work?** When the entry point accepts `string[] args`, the runtime supplies the arguments. Top-level statements expose an implicit `args` variable corresponding to that parameter.
*   **What are the return types for `Main`?** You can return `void`, `int` (for exit codes), `Task`, or `Task<int>` (for asynchronous entry points).
*   **What is the role of an Alias using directive?** It allows you to rename a type or namespace to avoid collisions or simplify long, nested names.

---

### Scenario questions
*   **Scenario:** You have a massive project and want to avoid repeating `using System;` in every file.
    *   **Solution:** Use a `global using` directive in a single file to make that namespace available to the entire compilation.
*   **Scenario:** You need to return an error code to a shell script that runs your app.
    *   **Solution:** Use `static int Main()` or `static Task<int> Main()` and return a non-zero integer to indicate failure.

---

### Tradeoffs and alternatives
*   **Top-level statements vs. Main method:** Top-level statements can be used in applications of any size and generate the entry point. An explicit `Main` makes the signature visible and is useful when its parameter and return shape should be explicit.
*   **File-based vs. Project-based apps:** File-based apps run a single `.cs` file without a project file. Project-based apps use a project file and can span multiple sources and configure builds. This choice is independent of top-level statements versus `Main`.

---

### Common weak answers
*   **"Namespaces are just folders."** *Correction:* Namespaces are logical groupings for types; they do not strictly require a matching folder structure, though it is best practice.
*   **"You must have a Main method."** *Correction:* With top-level statements, the compiler generates the entry point for you.
*   **"Using directives import files."** *Correction:* Using directives import *namespaces*, not files.

---

### Self-check rubric
*   **Can you explain the difference between a `static void Main()` and `static int Main()`?** (Focus on the exit code).
*   **Can you describe how to use a `static using` directive?** (Focus on accessing static members directly without the class name).
*   **Do you understand how `args` is handled in top-level statements?** (It is an implicit parameter).

*Sources:*
[Microsoft Learn: Program Structure](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)
[Microsoft Learn: Namespaces](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/namespaces)
[Microsoft Learn: Main and Command-Line Arguments](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/main-command-line)
[Microsoft Learn: Top-Level Statements](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements)
