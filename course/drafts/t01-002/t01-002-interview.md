<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Interview questions and reasoning

*Automatically generated draft.*

# C# Source-File Organization and Application Entry Points: Interview Preparation

In C#, a **compilation unit** is a single source file. Organizing these files effectively is the foundation of maintainable software. Think of your project as a library: **Namespaces** act as the "sections" (e.g., Fiction, Science), while **using directives** act as your "bookmarks," allowing you to reference items from other sections without typing their full path every time.

## Core questions

1. What is the difference between a block-scoped and a file-scoped namespace?
2. How do top-level statements simplify the application entry point compared to a traditional `Main` method?
3. What is the purpose of a `using` directive, and how does a `global using` directive differ?
4. How does an application communicate its success or failure to the operating system?

## Concise interview answers

1. **Block-scoped namespaces** use curly braces `{}` to define the scope of a namespace, while **file-scoped namespaces** use a semicolon `;` and apply to the entire file, reducing indentation.
2. **Top-level statements** allow you to write code directly in the file without an explicit `class` or `Main` method, reducing boilerplate code. The compiler generates the entry point for you.
3. A **using directive** makes types from a namespace available in a file. A **global using** directive applies that import to every file in the project, reducing repetitive code across the codebase.
4. An application communicates via the **program exit code** (an integer). A return value of `0` typically indicates success, while non-zero values indicate specific errors.

## Deep follow-up answers

*   **On Entry Points:** Top-level statements are compiled into an entry-point method whose signature depends on the statements in the file. It isn't always `static void Main`: the generated method may return `int` to expose an exit code and may return `Task` or `Task<int>` when the code uses `await`. A top-level `return 0;` therefore makes the generated entry point return `int`.
*   **On Namespaces:** Namespaces are logical groupings, not physical ones. You can have the same namespace spread across multiple files. File-scoped namespaces are preferred in modern C# (C# 15) because they keep the code cleaner by avoiding an extra level of nesting.
*   **On Aliases:** If you have two classes with the same name in different namespaces, you can use an **alias using directive** (e.g., `using ProjectA = MyCompany.ProjectA;`) to resolve the ambiguity.

## Scenario questions

*   **Scenario:** You have a small utility script that performs a single task. Should you use a project-based app or a file-based app?
    *   *Reasoning:* A **file-based app** is ideal for small scripts or simple utilities because it removes the overhead of project structures and boilerplate code.
*   **Scenario:** You need to use a specific class from a namespace, but it conflicts with a class in your current file. How do you handle this?
    *   *Reasoning:* Use an **alias using directive** to rename the imported type locally within that file, preventing the naming collision.

## Tradeoffs and alternatives

| Feature | Alternative | Tradeoff |
| :--- | :--- | :--- |
| **Top-level statements** | **Main method** | Top-level statements are concise but hide the entry point structure; `Main` is explicit and required for complex configurations. |
| **File-scoped namespace** | **Block-scoped namespace** | File-scoped is cleaner but limits the file to one namespace; block-scoped allows multiple namespaces in one file. |
| **File-based app** | **Project-based app** | File-based is faster for simple tasks; project-based is necessary for large, multi-file architectures. |

*Source: [Microsoft Learn - C# Program Structure](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)*

## Common weak answers

*   **"Namespaces are just folders."** (Weak: They are logical groupings. While they often mirror folder structure, they are not strictly required to.)
*   **"I don't need to worry about exit codes."** (Weak: Exit codes are critical for automation, CI/CD pipelines, and shell scripting to determine if a process finished correctly.)
*   **"Using directives just import libraries."** (Weak: They don't import libraries; they import *namespaces* to make types easier to reference.)

## Self-check rubric

*   **Can you explain the difference between a `static void Main` and `static Task<int> Main`?** (Hint: One is for synchronous code, the other allows for asynchronous entry points and returning exit codes.)
*   **Do you know when to use a `static using` directive?** (Hint: It allows you to access static members of a class directly without specifying the class name.)
*   **Can you identify the entry point in a file-based app?** (Hint: It is the top-level code itself, which the compiler wraps into a hidden `Main` method.)

*Reference: [C# 15 Fundamentals](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)*
