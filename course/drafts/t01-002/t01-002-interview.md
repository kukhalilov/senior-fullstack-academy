<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Interview questions and reasoning

*Automatically generated draft.*

# C# Source Organization and Entry Points: Interview Preparation

This lesson helps you explain how C# code is structured and how applications begin execution. 

### Mental Model
Think of a C# project as a library. **Namespaces** are the shelves that organize your books (**Types**). **Source files** are the pages, and **using directives** are the index cards that let you find books on other shelves without typing their full location. The **Entry Point** is the "Start" button of your application, which can be a formal `Main` method or simplified **Top-level statements**.

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
*   **Exit:** An application communicates with the OS via the **Program exit code** (an integer returned by `Main` or implicitly by top-level statements).

---

### Deep follow-up answers
*   **Why use File-scoped vs. Block-scoped namespaces?** File-scoped namespaces reduce indentation levels, making code cleaner. Block-scoped namespaces are useful if you need to define multiple namespaces within a single file.
*   **How do command-line arguments work?** They are passed as a `string[] args` array to the `Main` method. In top-level statements, this array is implicitly available as the `args` variable.
*   **What are the return types for `Main`?** You can return `void`, `int` (for exit codes), `Task`, or `Task<int>` (for asynchronous entry points).
*   **What is the role of an Alias using directive?** It allows you to rename a type or namespace to avoid collisions or simplify long, nested names.

---

### Scenario questions
*   **Scenario:** You have a massive project and want to avoid repeating `using System;` in every file.
    *   **Solution:** Use a `global using` directive in a single file to make that namespace available to the entire compilation unit.
*   **Scenario:** You need to return an error code to a shell script that runs your app.
    *   **Solution:** Use `static int Main()` or `static Task<int> Main()` and return a non-zero integer to indicate failure.

---

### Tradeoffs and alternatives
*   **Top-level statements vs. Main method:** Top-level statements are ideal for small utilities and scripts (C# 14+). The `Main` method is preferred for complex applications where explicit control over the entry point signature is required.
*   **File-based vs. Project-based apps:** File-based apps allow for rapid prototyping and single-file execution, while project-based apps provide the structure needed for large-scale, multi-file development.

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
