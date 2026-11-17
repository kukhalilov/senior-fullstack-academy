<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# source-file organization and application entry points — Big-picture orientation and mental model

*Draft: Automatically generated.*

# Problem and purpose
In C#, code is not just a single block of text; it is a collection of files that must be organized to remain readable and maintainable. As a project grows, you need a way to group related code (namespaces), bring in external functionality (using directives), and define exactly where the computer should start executing your program (entry points). This topic provides the structural rules for how C# source files are organized and how they transition from raw text into a running application.

# Plain-language mental model
Think of a C# application like a library:
*   **Compilation units (Source files):** These are individual books or folders of material; a project may also use one file without a project file.
*   **Namespaces:** These are logical sections of the library. Their names distinguish types; they do not have to mirror folders.
*   **Using directives:** These are name shortcuts. They change how you refer to types or static members; they do not add packages or load files.
*   **Entry point:** This is the designated starting point of an executable: an explicit `Main` method or compiler-generated entry point for top-level statements.

# How the parts fit together
C# source files contain declarations, namespaces, and (in executable contexts) possibly top-level statements. A project can contain multiple compilation units; file-based apps can run from one `.cs` file without a project file. Namespaces logically organize types, and `using` directives provide shorter names. An executable has one entry point: an explicit `Main` method or compiler-generated entry point from top-level statements.

# Concept map
1.  **Source Units:** The physical file structure.
2.  **Organization:** Namespaces (block-scoped vs. file-scoped) that contain types.
3.  **Visibility:** Using directives (standard, static, alias, and global) that manage how you reference types.
4.  **Execution:** Application forms (file-based vs. project-based) and the entry point (Main method signatures or top-level statements).
5.  **Interaction:** How the process receives command-line arguments and returns an exit code.

# End-to-end walkthrough
Imagine a simple "Hello World" program:

1.  **Choose an app form:** With C# 14 and .NET 10 or later, a file-based app can run from one `.cs` file without a project file. A project-based app uses a `.csproj`. Either form can use top-level statements or an explicit `Main` method.
2.  **Organize types:** If you add a type, place it in a namespace if useful. File-scoped and block-scoped declarations are alternatives; namespaces need not match folders.
3.  **Resolve names:** An explicit `using System;` lets you write `Console` instead of `System.Console`. SDK implicit usings may also provide that name.
4.  **Execution:** Top-level statements generate an entry point. The implicit `args` variable contains command-line arguments.
5.  **Exit:** An `int` returned from `Main` or top-level code becomes the process exit code. A `void`/`Task` entry point does not explicitly return a status; normal process completion generally produces zero.

Source: [Microsoft Learn C# Program Structure](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)

# When to use it and tradeoffs
*   **Top-level statements vs. Main method:** Top-level statements reduce entry-point boilerplate and work for projects of any size. Use an explicit `Main` when you need a visible signature, arguments/return type control, or consistency with an existing codebase.
*   **File-scoped vs. Block-scoped namespaces:** File-scoped syntax reduces indentation when the file has one namespace. Block-scoped syntax can express multiple namespace declarations within one file.
*   **Global using directives:** Use these to avoid repeating common imports across every file in your project, but be careful: too many global imports can make it difficult to track where a type originated.

# What later lessons cover
*   **Type declarations:** How to define the classes, structs, and interfaces that live inside your namespaces.
*   **Statements and control flow:** The logic that goes inside your `Main` method or top-level statements.
*   **Build configuration:** How the project file (`.csproj`) manages the compilation process and dependencies.

*Source references:*
*   [C# Program Structure](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure)
*   [Namespaces](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/namespaces)
*   [Main and Command-Line Arguments](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/main-command-line)
*   [Top-Level Statements](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements)
